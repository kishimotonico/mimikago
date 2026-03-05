use std::fs;
use std::path::{Path, PathBuf};

use crate::db::Database;
use crate::models::{MetaFile, ScanResult, Work, WorkSummary};
use crate::scanner;

pub struct AppService {
    pub db: Database,
}

impl AppService {
    pub fn new(app_data_dir: &Path) -> Result<Self, String> {
        fs::create_dir_all(app_data_dir)
            .map_err(|e| format!("Failed to create app data dir: {}", e))?;

        let db_path = app_data_dir.join("mimikago.db");
        let db = Database::new(&db_path)?;

        Ok(AppService { db })
    }

    pub fn get_root_folder(&self) -> Result<Option<String>, String> {
        self.db.get_setting("root_folder")
    }

    pub fn set_root_folder(&self, path: &str) -> Result<(), String> {
        let p = Path::new(path);
        if !p.is_dir() {
            return Err(format!("Path is not a directory: {}", path));
        }
        self.db.set_setting("root_folder", path)
    }

    pub fn scan(&self) -> Result<ScanResult, String> {
        let root = self
            .get_root_folder()?
            .ok_or("Root folder not set")?;
        let root_path = PathBuf::from(&root);

        if !root_path.is_dir() {
            return Err(format!("Root folder does not exist: {}", root));
        }

        scanner::scan_library(&root_path, &self.db)
    }

    pub fn get_all_works(&self) -> Result<Vec<WorkSummary>, String> {
        self.db.get_all_works()
    }

    pub fn get_work(&self, id: &str) -> Result<Option<Work>, String> {
        self.db.get_work(id)
    }

    pub fn search_works(&self, query: &str, tag_filters: &[String]) -> Result<Vec<WorkSummary>, String> {
        self.db.search_works(query, tag_filters)
    }

    pub fn update_work_tags(&self, work_id: &str, tags: Vec<String>) -> Result<(), String> {
        // Update DB
        self.db.update_work_tags(&work_id, &tags)?;

        // Write back to meta file
        if let Some(work) = self.db.get_work(work_id)? {
            self.write_back_meta(&work, Some(tags))?;
        }

        Ok(())
    }

    pub fn update_work_title(&self, work_id: &str, title: &str) -> Result<(), String> {
        if let Some(mut work) = self.db.get_work(work_id)? {
            work.title = title.to_string();
            self.db.upsert_work(&work)?;
            self.write_back_meta(&work, None)?;
        }
        Ok(())
    }

    pub fn get_all_tags(&self) -> Result<Vec<String>, String> {
        self.db.get_all_tags()
    }

    pub fn get_cover_image_path(&self, work_id: &str) -> Result<Option<String>, String> {
        let work = self.db.get_work(work_id)?;
        if let Some(w) = work {
            if let Some(cover) = &w.cover_image {
                let full_path = Path::new(&w.physical_path).join(cover);
                if full_path.exists() {
                    return Ok(Some(full_path.to_string_lossy().to_string()));
                }
            }
        }
        Ok(None)
    }

    pub fn get_audio_file_path(&self, work_id: &str, relative_path: &str) -> Result<Option<String>, String> {
        let work = self.db.get_work(work_id)?;
        if let Some(w) = work {
            let full_path = Path::new(&w.physical_path).join(relative_path);
            if full_path.exists() {
                return Ok(Some(full_path.to_string_lossy().to_string()));
            }
        }
        Ok(None)
    }

    pub fn get_last_scan_time(&self) -> Result<Option<String>, String> {
        self.db.get_setting("last_scan_time")
    }

    fn write_back_meta(&self, work: &Work, tags_override: Option<Vec<String>>) -> Result<(), String> {
        let meta_path = Path::new(&work.physical_path).join(".meta.json");
        if !meta_path.exists() {
            // Try single-file meta pattern
            return Ok(());
        }

        let content = fs::read_to_string(&meta_path)
            .map_err(|e| format!("Failed to read meta: {}", e))?;

        let mut meta: MetaFile = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse meta: {}", e))?;

        meta.title = work.title.clone();
        if let Some(tags) = tags_override {
            meta.tags = tags;
        }
        meta.urls = work.urls.clone();

        let json = serde_json::to_string_pretty(&meta)
            .map_err(|e| format!("Failed to serialize: {}", e))?;

        fs::write(&meta_path, &json)
            .map_err(|e| format!("Failed to write meta: {}", e))?;

        Ok(())
    }
}
