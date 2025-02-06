use sqlx::{prelude::FromRow, Sqlite, SqlitePool};
use tauri::Manager;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    database_path: String
}

impl AppState {
    pub fn new(database_path: String) -> Self {
        AppState { database_path }
    }
}

#[derive(FromRow, serde::Serialize)]
struct Dog {
    id: String,
    name: String,
    gender: String,
    birthday: String,
    shelved: bool,
    notes: String,
    picture_path: String,
    default_pack_price: f64,
    breed_id: i32,
    breed_name: String,
}

#[derive(FromRow, serde::Serialize)]
struct Owner {
    id: String,
    name: String,
    phone_numbers: String,
    email: String,
    adresses: String,
    about: String,
    register_date: String
}

#[derive(FromRow, serde::Serialize)]
struct Breed {
    id: u32,
    name: String,
    description: String,
    picture_path: String
}

#[derive(serde::Deserialize)]
pub enum TypeOfSearch {
    Dogs,
    Owners
}

async fn connect(app_handle:tauri::AppHandle) -> Result<sqlx::Pool<Sqlite>, String> {
    let state = app_handle.state::<Mutex<AppState>>();
    let state = state.lock().await;

    let conn = SqlitePool::connect(&state.database_path).await.map_err(|e| e.to_string())?;
    Ok(conn)
}

fn define_limit_and_offset(query: &mut String, limit: Option<u32>, offset: Option<u32>) {
    if let Some(l) = limit {
        query.push_str(&format!(" LIMIT {l}"));

        if let Some(o) = offset {
            query.push_str(&format!(" OFFSET {o}"));
        }
    }
}

#[tauri::command]
pub async fn get_dogs(app_handle: tauri::AppHandle, shelved: bool, limit: Option<u32>, offset: Option<u32>) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let mut query = String::from("SELECT d.*, b.name AS breed_name FROM Dogs d JOIN Breeds b ON b.id = d.breed_id");
    query.push_str(&format!(" WHERE d.shelved = {}", if shelved {1} else {0}));
    define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Dog> = sqlx::query_as(&query)
    .fetch_all(&conn)
    .await.map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_all_owners(app_handle: tauri::AppHandle, limit: Option<u32>, offset: Option<u32>) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let mut query = String::from("SELECT * FROM Owners");
    define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Owner> = sqlx::query_as(&query)
    .fetch_all(&conn)
    .await.map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_breeds(app_handle: tauri::AppHandle) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let query = "SELECT * FROM Breeds";
    let obj: Vec<Breed> = sqlx::query_as(&query)
    .fetch_all(&conn)
    .await.map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_dogs_from_owner(app_handle: tauri::AppHandle, owner_id: String) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let query = "
    SELECT d.*, b.name AS breed_name FROM Dogs d
    JOIN Breeds b ON b.id = d.breed_id
    JOIN Dogs_Owners do ON do.dog_id = d.id
    JOIN Owners o ON o.id = do.owner_id
    WHERE o.id = $1";
    let obj: Vec<Dog> = sqlx::query_as(query)
    .bind(owner_id)
    .fetch_all(&conn)
    .await.map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn search_for(app_handle: tauri::AppHandle, input: String, search_type: TypeOfSearch, limit: Option<u32>, offset: Option<u32>) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let result: String;
    let mut query = match search_type {
        TypeOfSearch::Dogs => String::from(
            "SELECT DISTINCT d.*, b.name AS breed_name FROM Dogs d 
            JOIN Breeds b ON b.id = d.breed_id
            JOIN Dogs_Owners do ON do.dog_id = d.id
            JOIN Owners o ON o.id = do.owner_id
            WHERE d.name LIKE $1 OR o.name LIKE $2"
        ),
        TypeOfSearch::Owners => String::from(
            "SELECT DISTINCT o.* FROM Owners o
            JOIN Dogs_Owners do ON do.owner_id = o.id
            JOIN Dogs d ON d.id = do.dog_id
            WHERE o.name LIKE $1 OR d.name LIKE $2"
        )
    };
    define_limit_and_offset(&mut query, limit, offset);

    if let TypeOfSearch::Dogs = search_type {
        let obj: Vec<Dog> = sqlx::query_as(&query)
        .bind(format!("%{input}%"))
        .bind(format!("%{input}%"))
        .fetch_all(&conn)
        .await.map_err(|e| e.to_string())?;
        result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    } else {
        let obj: Vec<Owner> = sqlx::query_as(&query)
        .bind(format!("%{input}%"))
        .bind(format!("%{input}%"))
        .fetch_all(&conn)
        .await.map_err(|e| e.to_string())?;
        result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    }

    conn.close().await;
    Ok(result)
}