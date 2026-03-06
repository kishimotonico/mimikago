use std::fs;
use std::path::{Path, PathBuf};

use crate::db::Database;
use crate::models::{FileEntry, MetaFile, ScanResult, SearchPreset, Work, WorkSummary};
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
                let resolved = full_path.canonicalize().map_err(|e| e.to_string())?;
                let work_dir = Path::new(&w.physical_path).canonicalize().map_err(|e| e.to_string())?;
                if !resolved.starts_with(&work_dir) {
                    return Err("Path traversal detected".to_string());
                }
                if resolved.exists() {
                    return Ok(Some(resolved.to_string_lossy().to_string()));
                }
            }
        }
        Ok(None)
    }

    pub fn get_audio_file_path(&self, work_id: &str, relative_path: &str) -> Result<Option<String>, String> {
        let work = self.db.get_work(work_id)?;
        if let Some(w) = work {
            let full_path = Path::new(&w.physical_path).join(relative_path);
            let resolved = full_path.canonicalize().map_err(|e| e.to_string())?;
            let work_dir = Path::new(&w.physical_path).canonicalize().map_err(|e| e.to_string())?;
            if !resolved.starts_with(&work_dir) {
                return Err("Path traversal detected".to_string());
            }
            if resolved.exists() {
                return Ok(Some(resolved.to_string_lossy().to_string()));
            }
        }
        Ok(None)
    }

    pub fn get_last_scan_time(&self) -> Result<Option<String>, String> {
        self.db.get_setting("last_scan_time")
    }

    pub fn toggle_bookmark(&self, work_id: &str) -> Result<bool, String> {
        self.db.toggle_bookmark(work_id)
    }

    pub fn update_last_played(&self, work_id: &str) -> Result<(), String> {
        self.db.update_last_played(work_id)
    }

    pub fn save_resume_position(&self, work_id: &str, position: f64, track_index: i32) -> Result<(), String> {
        self.db.save_resume_position(work_id, position, track_index)
    }

    pub fn save_search_preset(&self, name: &str, query: &str, tag_filters: &[String], sort_id: &str) -> Result<i64, String> {
        self.db.save_search_preset(name, query, tag_filters, sort_id)
    }

    pub fn get_search_presets(&self) -> Result<Vec<SearchPreset>, String> {
        self.db.get_search_presets()
    }

    pub fn delete_search_preset(&self, id: i64) -> Result<(), String> {
        self.db.delete_search_preset(id)
    }

    pub fn list_work_files(&self, work_id: &str) -> Result<Option<FileEntry>, String> {
        let work = self.db.get_work(work_id)?;
        if let Some(w) = work {
            let root_path = Path::new(&w.physical_path);
            if !root_path.is_dir() {
                return Ok(None);
            }
            let entry = build_file_tree(root_path, root_path)?;
            return Ok(Some(entry));
        }
        Ok(None)
    }

    pub fn export_library(&self) -> Result<String, String> {
        let works = self.db.get_all_works()?;
        let presets = self.db.get_search_presets()?;
        let root = self.get_root_folder()?;

        let export = serde_json::json!({
            "version": 1,
            "rootFolder": root,
            "works": works,
            "searchPresets": presets,
        });

        serde_json::to_string_pretty(&export)
            .map_err(|e| format!("Failed to serialize export: {}", e))
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

fn build_file_tree(dir: &Path, work_root: &Path) -> Result<FileEntry, String> {
    let name = dir.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
    let relative = dir.strip_prefix(work_root).unwrap_or(dir);
    let mut children = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        let mut items: Vec<_> = entries.flatten().collect();
        items.sort_by(|a, b| a.file_name().cmp(&b.file_name()));

        for entry in items {
            let path = entry.path();
            let fname = entry.file_name().to_string_lossy().to_string();

            if fname.starts_with('.') {
                continue; // skip hidden files
            }

            if path.is_dir() {
                let child = build_file_tree(&path, work_root)?;
                children.push(child);
            } else {
                let size = path.metadata().map(|m| m.len()).unwrap_or(0);
                let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
                let file_type = match ext.as_str() {
                    "mp3" | "m4a" | "aac" | "wav" | "ogg" | "flac" | "webm" | "opus" => "audio",
                    "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" => "image",
                    "pdf" => "pdf",
                    "txt" | "md" | "nfo" => "text",
                    _ => "other",
                };
                let child_relative = path.strip_prefix(work_root).unwrap_or(&path);
                children.push(FileEntry {
                    name: fname,
                    path: child_relative.to_string_lossy().to_string(),
                    is_dir: false,
                    size,
                    file_type: file_type.to_string(),
                    children: Vec::new(),
                });
            }
        }
    }

    Ok(FileEntry {
        name,
        path: relative.to_string_lossy().to_string(),
        is_dir: true,
        size: 0,
        file_type: "directory".to_string(),
        children,
    })
}
