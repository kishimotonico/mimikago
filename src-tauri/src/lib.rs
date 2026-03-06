mod commands;
mod db;
mod models;
mod scanner;
mod service;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");

            let svc = service::AppService::new(&app_data_dir)
                .expect("Failed to initialize service");

            app.manage(std::sync::Mutex::new(svc));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_root_folder,
            commands::set_root_folder,
            commands::scan_library,
            commands::get_all_works,
            commands::get_work,
            commands::search_works,
            commands::update_work_tags,
            commands::update_work_title,
            commands::get_all_tags,
            commands::get_cover_image_path,
            commands::get_audio_file_path,
            commands::get_last_scan_time,
            commands::toggle_bookmark,
            commands::update_last_played,
            commands::save_resume_position,
            commands::save_search_preset,
            commands::get_search_presets,
            commands::delete_search_preset,
            commands::list_work_files,
            commands::export_library,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
