
use std::path::PathBuf;

use tauri::{path::BaseDirectory, App, Manager};

pub fn resolve_data_path(app: &App) -> tauri::Result<PathBuf> {
    app.path().resolve("data.db", BaseDirectory::AppData)
}

pub fn resolve_config_dir(app: &App) -> tauri::Result<PathBuf> {
    app.path().app_config_dir()
}

