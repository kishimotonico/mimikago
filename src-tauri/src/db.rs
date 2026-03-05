#![allow(dead_code)]
use rusqlite::{Connection, params};
use std::path::Path;
use std::sync::Mutex;

use crate::models::{Work, WorkSummary, UrlEntry, Playlist};

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &Path) -> Result<Self, String> {
        let conn = Connection::open(db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        let db = Database {
            conn: Mutex::new(conn),
        };
        db.initialize()?;
        Ok(db)
    }

    fn initialize(&self) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch("
            PRAGMA journal_mode=WAL;
            PRAGMA foreign_keys=ON;
        ").map_err(|e| format!("Failed to set pragmas: {}", e))?;

        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS works (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                cover_image TEXT,
                default_playlist TEXT,
                created_at TEXT,
                status TEXT NOT NULL DEFAULT 'normal',
                physical_path TEXT NOT NULL,
                total_duration_sec INTEGER NOT NULL DEFAULT 0,
                added_at TEXT NOT NULL DEFAULT (datetime('now')),
                error_message TEXT,
                urls_json TEXT NOT NULL DEFAULT '[]',
                playlists_json TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS work_tags (
                work_id TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (work_id, tag_id)
            );

            CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
            CREATE INDEX IF NOT EXISTS idx_works_title ON works(title);
            CREATE INDEX IF NOT EXISTS idx_works_added_at ON works(added_at);
            CREATE INDEX IF NOT EXISTS idx_works_physical_path ON works(physical_path);
            CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
            CREATE INDEX IF NOT EXISTS idx_work_tags_work_id ON work_tags(work_id);
            CREATE INDEX IF NOT EXISTS idx_work_tags_tag_id ON work_tags(tag_id);

            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        ").map_err(|e| format!("Failed to create tables: {}", e))?;

        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT value FROM app_settings WHERE key = ?1")
            .map_err(|e| e.to_string())?;
        let result = stmt
            .query_row(params![key], |row| row.get(0))
            .ok();
        Ok(result)
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn upsert_work(&self, work: &Work) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        let urls_json = serde_json::to_string(&work.urls).unwrap_or_default();
        let playlists_json = serde_json::to_string(&work.playlists).unwrap_or_default();

        conn.execute(
            "INSERT OR REPLACE INTO works (id, title, cover_image, default_playlist, created_at, status, physical_path, total_duration_sec, added_at, error_message, urls_json, playlists_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                work.id,
                work.title,
                work.cover_image,
                work.default_playlist,
                work.created_at,
                work.status,
                work.physical_path,
                work.total_duration_sec,
                work.added_at,
                work.error_message,
                urls_json,
                playlists_json,
            ],
        )
        .map_err(|e| format!("Failed to upsert work: {}", e))?;

        // Update tags
        conn.execute("DELETE FROM work_tags WHERE work_id = ?1", params![work.id])
            .map_err(|e| e.to_string())?;

        for tag in &work.tags {
            conn.execute(
                "INSERT OR IGNORE INTO tags (name) VALUES (?1)",
                params![tag],
            )
            .map_err(|e| e.to_string())?;

            conn.execute(
                "INSERT OR IGNORE INTO work_tags (work_id, tag_id)
                 SELECT ?1, id FROM tags WHERE name = ?2",
                params![work.id, tag],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn get_all_works(&self) -> Result<Vec<WorkSummary>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT w.id, w.title, w.cover_image, w.status, w.physical_path,
                        w.total_duration_sec, w.added_at, w.error_message, w.urls_json, w.playlists_json
                 FROM works w
                 ORDER BY w.added_at DESC",
            )
            .map_err(|e| e.to_string())?;

        let works: Vec<WorkSummary> = stmt
            .query_map([], |row| {
                let id: String = row.get(0)?;
                let urls_json: String = row.get(8)?;
                let playlists_json: String = row.get(9)?;
                let urls: Vec<UrlEntry> = serde_json::from_str(&urls_json).unwrap_or_default();
                let playlists: Vec<Playlist> = serde_json::from_str(&playlists_json).unwrap_or_default();
                let track_count = playlists.first().map(|p| p.tracks.len()).unwrap_or(0);

                Ok(WorkSummary {
                    id,
                    title: row.get(1)?,
                    cover_image: row.get(2)?,
                    status: row.get(3)?,
                    physical_path: row.get(4)?,
                    total_duration_sec: row.get(5)?,
                    added_at: row.get(6)?,
                    error_message: row.get(7)?,
                    urls,
                    tags: Vec::new(), // filled below
                    track_count,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        // Fill tags for each work
        let mut tag_stmt = conn
            .prepare("SELECT t.name FROM work_tags wt JOIN tags t ON wt.tag_id = t.id WHERE wt.work_id = ?1")
            .map_err(|e| e.to_string())?;

        let mut result = Vec::new();
        for mut work in works {
            let tags: Vec<String> = tag_stmt
                .query_map(params![work.id], |row| row.get(0))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();
            work.tags = tags;
            result.push(work);
        }

        Ok(result)
    }

    pub fn get_work(&self, id: &str) -> Result<Option<Work>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT id, title, cover_image, default_playlist, created_at, status,
                        physical_path, total_duration_sec, added_at, error_message,
                        urls_json, playlists_json
                 FROM works WHERE id = ?1",
            )
            .map_err(|e| e.to_string())?;

        let work = stmt
            .query_row(params![id], |row| {
                let urls_json: String = row.get(10)?;
                let playlists_json: String = row.get(11)?;

                Ok(Work {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    cover_image: row.get(2)?,
                    default_playlist: row.get(3)?,
                    created_at: row.get(4)?,
                    status: row.get(5)?,
                    physical_path: row.get(6)?,
                    total_duration_sec: row.get(7)?,
                    added_at: row.get(8)?,
                    error_message: row.get(9)?,
                    urls: serde_json::from_str(&urls_json).unwrap_or_default(),
                    tags: Vec::new(),
                    playlists: serde_json::from_str(&playlists_json).unwrap_or_default(),
                })
            })
            .ok();

        if let Some(mut w) = work {
            let mut tag_stmt = conn
                .prepare("SELECT t.name FROM work_tags wt JOIN tags t ON wt.tag_id = t.id WHERE wt.work_id = ?1")
                .map_err(|e| e.to_string())?;
            let tags: Vec<String> = tag_stmt
                .query_map(params![w.id], |row| row.get(0))
                .map_err(|e| e.to_string())?
                .filter_map(|r| r.ok())
                .collect();
            w.tags = tags;
            Ok(Some(w))
        } else {
            Ok(None)
        }
    }

    pub fn search_works(&self, query: &str, tag_filters: &[String]) -> Result<Vec<WorkSummary>, String> {
        let mut works = self.get_all_works()?;

        if !query.is_empty() {
            let q = query.to_lowercase();
            works.retain(|w| {
                w.title.to_lowercase().contains(&q)
                    || w.tags.iter().any(|t| t.to_lowercase().contains(&q))
            });
        }

        if !tag_filters.is_empty() {
            works.retain(|w| {
                tag_filters.iter().all(|tf| {
                    let tf_lower = tf.to_lowercase();
                    w.tags.iter().any(|t| t.to_lowercase().contains(&tf_lower))
                })
            });
        }

        Ok(works)
    }

    pub fn mark_all_missing(&self) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE works SET status = 'missing' WHERE status = 'normal'", [])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn mark_found(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE works SET status = 'normal' WHERE id = ?1",
            params![id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_work(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM works WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn update_work_tags(&self, work_id: &str, tags: &[String]) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM work_tags WHERE work_id = ?1", params![work_id])
            .map_err(|e| e.to_string())?;

        for tag in tags {
            conn.execute("INSERT OR IGNORE INTO tags (name) VALUES (?1)", params![tag])
                .map_err(|e| e.to_string())?;
            conn.execute(
                "INSERT OR IGNORE INTO work_tags (work_id, tag_id) SELECT ?1, id FROM tags WHERE name = ?2",
                params![work_id, tag],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn get_all_tags(&self) -> Result<Vec<String>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT DISTINCT t.name FROM tags t JOIN work_tags wt ON t.id = wt.tag_id ORDER BY t.name")
            .map_err(|e| e.to_string())?;
        let tags: Vec<String> = stmt
            .query_map([], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();
        Ok(tags)
    }

    pub fn work_exists_by_path(&self, path: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id FROM works WHERE physical_path = ?1")
            .map_err(|e| e.to_string())?;
        let result = stmt.query_row(params![path], |row| row.get(0)).ok();
        Ok(result)
    }
}
