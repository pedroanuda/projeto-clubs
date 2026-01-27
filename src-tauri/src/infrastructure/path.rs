use std::fs;
use std::path::PathBuf;

use tauri::{path::BaseDirectory, App, Manager};

pub fn resolve_data_path(app: &App) -> tauri::Result<PathBuf> {
    app.path().resolve("data.db", BaseDirectory::AppData)
}

pub fn resolve_config_dir(app: &App) -> tauri::Result<PathBuf> {
    app.path().app_config_dir()
}

pub fn copy_migrations_to_temp(app: &App) -> tauri::Result<PathBuf> {
    let resource_dir = app.path().resolve("migrations", BaseDirectory::Resource)?;
    let temp_dir = app.path().temp_dir()?;
    let migrations_temp_dir = temp_dir.join("migrations");

    fs::create_dir_all(&migrations_temp_dir).expect("Error on creating migrations temp dir.");

    // TODO: Consertar lógica para funcionar com Android
    for entry in fs::read_dir(resource_dir)? {
        let entry = entry?;
        let to = migrations_temp_dir.join(entry.file_name());

        fs::copy(entry.path(), to)?;
    }

    Ok(migrations_temp_dir)
}
