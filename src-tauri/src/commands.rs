use tauri::State;
use std::sync::Mutex;

use crate::models::{FileEntry, ScanResult, SearchPreset, Work, WorkSummary};
use crate::service::AppService;


pub type ServiceState = Mutex<AppService>;

#[tauri::command]
pub fn get_root_folder(service: State<'_, ServiceState>) -> Result<Option<String>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_root_folder()
}

#[tauri::command]
pub fn set_root_folder(service: State<'_, ServiceState>, path: String) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.set_root_folder(&path)
}

#[tauri::command]
pub fn scan_library(service: State<'_, ServiceState>) -> Result<ScanResult, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    let result = svc.scan()?;
    // Update last scan time
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    svc.db.set_setting("last_scan_time", &now)?;
    Ok(result)
}

#[tauri::command]
pub fn get_all_works(service: State<'_, ServiceState>) -> Result<Vec<WorkSummary>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_all_works()
}

#[tauri::command]
pub fn get_work(service: State<'_, ServiceState>, id: String) -> Result<Option<Work>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_work(&id)
}

#[tauri::command]
pub fn search_works(
    service: State<'_, ServiceState>,
    query: String,
    tag_filters: Vec<String>,
) -> Result<Vec<WorkSummary>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.search_works(&query, &tag_filters)
}

#[tauri::command]
pub fn update_work_tags(
    service: State<'_, ServiceState>,
    work_id: String,
    tags: Vec<String>,
) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.update_work_tags(&work_id, tags)
}

#[tauri::command]
pub fn update_work_title(
    service: State<'_, ServiceState>,
    work_id: String,
    title: String,
) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.update_work_title(&work_id, &title)
}

#[tauri::command]
pub fn get_all_tags(service: State<'_, ServiceState>) -> Result<Vec<String>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_all_tags()
}

#[tauri::command]
pub fn get_cover_image_path(
    service: State<'_, ServiceState>,
    work_id: String,
) -> Result<Option<String>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_cover_image_path(&work_id)
}

#[tauri::command]
pub fn get_audio_file_path(
    service: State<'_, ServiceState>,
    work_id: String,
    relative_path: String,
) -> Result<Option<String>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_audio_file_path(&work_id, &relative_path)
}

#[tauri::command]
pub fn get_last_scan_time(service: State<'_, ServiceState>) -> Result<Option<String>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_last_scan_time()
}

#[tauri::command]
pub fn toggle_bookmark(service: State<'_, ServiceState>, work_id: String) -> Result<bool, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.toggle_bookmark(&work_id)
}

#[tauri::command]
pub fn update_last_played(service: State<'_, ServiceState>, work_id: String) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.update_last_played(&work_id)
}

#[tauri::command]
pub fn save_resume_position(
    service: State<'_, ServiceState>,
    work_id: String,
    position: f64,
    track_index: i32,
) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.save_resume_position(&work_id, position, track_index)
}

#[tauri::command]
pub fn save_search_preset(
    service: State<'_, ServiceState>,
    name: String,
    query: String,
    tag_filters: Vec<String>,
    sort_id: String,
) -> Result<i64, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.save_search_preset(&name, &query, &tag_filters, &sort_id)
}

#[tauri::command]
pub fn get_search_presets(service: State<'_, ServiceState>) -> Result<Vec<SearchPreset>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.get_search_presets()
}

#[tauri::command]
pub fn delete_search_preset(service: State<'_, ServiceState>, id: i64) -> Result<(), String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.delete_search_preset(id)
}

#[tauri::command]
pub fn list_work_files(service: State<'_, ServiceState>, work_id: String) -> Result<Option<FileEntry>, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.list_work_files(&work_id)
}

#[tauri::command]
pub fn export_library(service: State<'_, ServiceState>) -> Result<String, String> {
    let svc = service.lock().map_err(|e| e.to_string())?;
    svc.export_library()
}
