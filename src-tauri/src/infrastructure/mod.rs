pub mod db;
mod path;

use tauri::App;

pub fn setup(app: &mut App) -> tauri::Result<()> {
    let db_file_path = path::resolve_data_path(app)?;
    let dir_path = path::resolve_config_dir(app)?;

    // Creates all dirs if none exist
    std::fs::create_dir_all(&dir_path).expect("Error on creating data dirs!");

    let formatted_db_path = format!("sqlite:{}", db_file_path.display());
    tauri::async_runtime::block_on(async move {
        db::init_db(&formatted_db_path)
            .await
            .expect("Erro ao inicializar banco de dados");
        db::run_migrations()
            .await
            .expect("Erro ao rodar migrations");
    });

    Ok(())
}
