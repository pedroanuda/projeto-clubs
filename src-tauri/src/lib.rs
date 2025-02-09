use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool };
use tauri::{path::BaseDirectory, Manager};
use tokio::sync::Mutex;

mod queries;
use queries::{get_dogs, get_all_owners, get_breeds, get_dogs_from_owner, search_for, update_dog, delete_dog, get_owners_from_dog};

// Database Functions
async fn check_database_creation(
    database_path: std::path::PathBuf, 
    file_path: std::path::PathBuf, 
    dir_path: &std::path::PathBuf,
    full_path: &mut String
) -> Result<(), sqlx::Error> {
    use std::io::Read;

    *full_path = format!("sqlite:{}", database_path.to_str().expect("Inválido").to_string().replace("\\", "/"));

    if !Sqlite::database_exists(&full_path).await.unwrap_or(false) {
        std::fs::create_dir_all(dir_path).expect("Error on creating dirs");
        Sqlite::create_database(&full_path).await.unwrap();

        let conn = SqlitePool::connect(&full_path).await?;
        let mut sql_file = std::fs::File::open(&file_path).unwrap();
        let mut sql_content = String::new();
        
        sql_file.read_to_string(&mut sql_content)?;

        sqlx::query(&sql_content).execute(&conn).await?;
        conn.close().await;
    }

    Ok(())
}

// Main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            
            let database_path = app.path().resolve("data.db", BaseDirectory::AppData)?;
            let dir_path = app.path().app_config_dir().expect("No dir found!");
            let sql_path = app.path().resolve("src/init.sql", BaseDirectory::Resource)?;
            let mut full_path = String::new();
            tokio::runtime::Runtime::new().unwrap()
            .block_on(check_database_creation(database_path, sql_path, &dir_path, &mut full_path))?;
            app.manage(Mutex::new(queries::AppState::new(full_path)));
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_dogs, get_all_owners, get_breeds, get_dogs_from_owner, search_for, update_dog, delete_dog, get_owners_from_dog])
        .run(tauri::generate_context!())
        .expect("error on running tauri application");
}
