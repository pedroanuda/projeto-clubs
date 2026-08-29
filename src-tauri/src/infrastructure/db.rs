use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePoolOptions, Sqlite, SqlitePool};
use tokio::sync::OnceCell;

static DB_POOL: OnceCell<SqlitePool> = OnceCell::const_new();

pub async fn init_db(db_url: &str) -> Result<(), sqlx::Error> {
    if !Sqlite::database_exists(db_url).await? {
        Sqlite::create_database(db_url).await?;
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await?;

    DB_POOL
        .set(pool)
        .map_err(|_| sqlx::Error::Configuration("Pool já inicializada".into()))
}

pub fn get_pool() -> &'static SqlitePool {
    DB_POOL.get().expect("Erro ao buscar pool")
}

pub async fn run_migrations() -> Result<(), sqlx::Error> {
    sqlx::migrate!("./migrations").run(get_pool()).await?;

    Ok(())
}

pub async fn check_database_creation(
    database_path: std::path::PathBuf,
    file_path: std::path::PathBuf,
    dir_path: &std::path::PathBuf,
    full_path: &mut String,
) -> Result<(), sqlx::Error> {
    use std::io::Read;

    *full_path = format!(
        "sqlite:{}",
        database_path
            .to_str()
            .expect("Inválido")
            .to_string()
            .replace("\\", "/")
    );

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
