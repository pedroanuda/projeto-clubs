mod actions;
mod commands;
mod domain;
pub mod infrastructure;

use commands::backend_dispatcher::backend_dispatcher;

pub use infrastructure::db;

// Main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            infrastructure::setup(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![backend_dispatcher])
        .run(tauri::generate_context!())
        .expect("error on running tauri application");
}
