use sqlx::{prelude::FromRow, Sqlite, SqlitePool};
use tauri::Manager;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    database_path: String,
}

impl AppState {
    pub fn new(database_path: String) -> Self {
        AppState { database_path }
    }
}

#[derive(Default, FromRow, serde::Deserialize, serde::Serialize)]
pub struct Dog {
    id: String,
    name: String,
    gender: String,
    breed_id: i32,
    breed_name: String,
    shelved: bool,
    birthday: Option<String>,
    notes: Option<String>,
    picture_path: Option<String>,
    default_pack_price: Option<f64>,
}

#[derive(FromRow, serde::Deserialize, serde::Serialize)]
pub struct Owner {
    id: String,
    name: String,
    register_date: String,
    email: Option<String>,
    phone_numbers: Option<String>,
    addresses: Option<String>,
    about: Option<String>,
}

#[derive(FromRow, serde::Serialize)]
struct Breed {
    id: u32,
    name: String,
    description: String,
    picture_path: String,
}

#[derive(serde::Deserialize)]
pub enum TypeOfSearch {
    Dogs,
    Owners,
}

async fn connect(app_handle: tauri::AppHandle) -> Result<sqlx::Pool<Sqlite>, String> {
    let state = app_handle.state::<Mutex<AppState>>();
    let state = state.lock().await;

    let conn = SqlitePool::connect(&state.database_path)
        .await
        .map_err(|e| e.to_string())?;
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
pub async fn get_dogs(
    app_handle: tauri::AppHandle,
    shelved: bool,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let mut query = String::from(
        "SELECT d.*, b.name AS breed_name FROM Dogs d JOIN Breeds b ON b.id = d.breed_id",
    );
    query.push_str(&format!(
        " WHERE d.shelved = {}",
        if shelved { 1 } else { 0 }
    ));
    define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Dog> = sqlx::query_as(&query)
        .fetch_all(&conn)
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_all_owners(
    app_handle: tauri::AppHandle,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let mut query = String::from("SELECT * FROM Owners");
    define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Owner> = sqlx::query_as(&query)
        .fetch_all(&conn)
        .await
        .map_err(|e| e.to_string())?;

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
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_dogs_from_owner(
    app_handle: tauri::AppHandle,
    owner_id: String,
) -> Result<String, String> {
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
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn get_owners_from_dog(
    app_handle: tauri::AppHandle,
    dog_id: String,
) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let query = "
    SELECT * FROM Owners o
    JOIN Dogs_Owners do ON do.owner_id = o.id
    WHERE do.dog_id = $1";
    let obj: Vec<Owner> = sqlx::query_as(query)
        .bind(&dog_id)
        .fetch_all(&conn)
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn search_for(
    app_handle: tauri::AppHandle,
    input: String,
    search_type: TypeOfSearch,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let result: String;
    let mut query = match search_type {
        TypeOfSearch::Dogs => String::from(
            "SELECT DISTINCT d.*, b.name AS breed_name FROM Dogs d 
            JOIN Breeds b ON b.id = d.breed_id
            JOIN Dogs_Owners do ON do.dog_id = d.id
            JOIN Owners o ON o.id = do.owner_id
            WHERE d.name LIKE $1 OR o.name LIKE $2",
        ),
        TypeOfSearch::Owners => String::from(
            "SELECT DISTINCT o.* FROM Owners o
            JOIN Dogs_Owners do ON do.owner_id = o.id
            JOIN Dogs d ON d.id = do.dog_id
            WHERE o.name LIKE $1 OR d.name LIKE $2",
        ),
    };
    define_limit_and_offset(&mut query, limit, offset);

    if let TypeOfSearch::Dogs = search_type {
        let obj: Vec<Dog> = sqlx::query_as(&query)
            .bind(format!("%{input}%"))
            .bind(format!("%{input}%"))
            .fetch_all(&conn)
            .await
            .map_err(|e| e.to_string())?;
        result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    } else {
        let obj: Vec<Owner> = sqlx::query_as(&query)
            .bind(format!("%{input}%"))
            .bind(format!("%{input}%"))
            .fetch_all(&conn)
            .await
            .map_err(|e| e.to_string())?;
        result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    }

    conn.close().await;
    Ok(result)
}

#[tauri::command]
pub async fn create_dog(
    app_handle: tauri::AppHandle,
    new_dog: Dog,
    owners_ids: Vec<String>,
) -> Result<(), String> {
    let conn = connect(app_handle).await?;
    let mut tx = conn.begin().await.map_err(|e| e.to_string())?;

    let query = "INSERT INTO Dogs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    sqlx::query(&query)
        .bind(&new_dog.id)
        .bind(&new_dog.name)
        .bind(&new_dog.gender)
        .bind(&new_dog.birthday)
        .bind(&new_dog.shelved)
        .bind(&new_dog.notes)
        .bind(&new_dog.picture_path)
        .bind(&new_dog.default_pack_price)
        .bind(&new_dog.breed_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let query_owner = "INSERT INTO Dogs_Owners VALUES ($1, $2)";
    for owner_id in owners_ids {
        sqlx::query(&query_owner)
            .bind(&new_dog.id)
            .bind(&owner_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    conn.close().await;
    Ok(())
}

#[tauri::command]
pub async fn get_dog(app_handle: tauri::AppHandle, id: String) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let query = "
    SELECT d.*, b.name AS breed_name FROM Dogs d 
    JOIN Breeds b ON b.id = d.breed_id
    WHERE id = $1";
    let obj: Dog = sqlx::query_as(&query)
        .bind(id)
        .fetch_one(&conn)
        .await
        .map_err(|e| e.to_string())?;

    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    conn.close().await;
    Ok(result)
}

#[tauri::command]
pub async fn update_dog(app_handle: tauri::AppHandle, new_dog: Dog) -> Result<(), String> {
    let conn = connect(app_handle).await?;

    let query = "
    UPDATE Dogs SET name = $1, gender = $2, birthday = $3, shelved = $4, notes = $5, picture_path = $6, 
    default_pack_price = $7, breed_id = $8
    WHERE id = $9";
    sqlx::query(query)
        .bind(new_dog.name)
        .bind(new_dog.gender)
        .bind(new_dog.birthday)
        .bind(new_dog.shelved)
        .bind(new_dog.notes)
        .bind(new_dog.picture_path)
        .bind(new_dog.default_pack_price)
        .bind(new_dog.breed_id)
        .bind(new_dog.id)
        .execute(&conn)
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    Ok(())
}

#[tauri::command]
pub async fn delete_dog(app: tauri::AppHandle, dog_id: String) -> Result<(), String> {
    let conn = connect(app).await?;
    let mut tx = conn.begin().await.map_err(|e| e.to_string())?;

    let query_dog = "DELETE FROM Dogs WHERE id = $1";
    sqlx::query(&query_dog)
        .bind(&dog_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let query_owners = "DELETE FROM Dogs_Owners WHERE dog_id = $1";
    sqlx::query(&query_owners)
        .bind(&dog_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    conn.close().await;
    Ok(())
}

#[tauri::command]
pub async fn create_owner(app_handle: tauri::AppHandle, new_owner: Owner) -> Result<(), String> {
    let conn = connect(app_handle).await?;

    let query = "INSERT INTO Owners VALUES ($1, $2, $3, $4, $5, $6, $7)";
    sqlx::query(&query)
        .bind(&new_owner.id)
        .bind(&new_owner.name)
        .bind(&new_owner.phone_numbers)
        .bind(&new_owner.email)
        .bind(&new_owner.addresses)
        .bind(&new_owner.about)
        .bind(&new_owner.register_date)
        .execute(&conn)
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    Ok(())
}

#[tauri::command]
pub async fn get_owner(app_handle: tauri::AppHandle, id: String) -> Result<String, String> {
    let conn = connect(app_handle).await?;

    let query = "SELECT * FROM Owners WHERE id = $1";
    let obj: Owner = sqlx::query_as(&query)
        .bind(id)
        .fetch_one(&conn)
        .await
        .map_err(|e| e.to_string())?;

    let result = serde_json::to_string(&obj).map_err(|e| e.to_string())?;
    conn.close().await;
    Ok(result)
}

#[tauri::command]
pub async fn update_owner(app_handle: tauri::AppHandle, new_owner: Owner) -> Result<(), String> {
    let conn = connect(app_handle).await?;

    let query = "
    UPDATE Owners SET name = $1, phone_numbers = $2, email = $3, addresses = $4, about = $5
    WHERE id = $6";
    sqlx::query(&query)
        .bind(&new_owner.name)
        .bind(&new_owner.phone_numbers)
        .bind(&new_owner.email)
        .bind(&new_owner.addresses)
        .bind(&new_owner.about)
        .bind(&new_owner.id)
        .execute(&conn)
        .await
        .map_err(|e| e.to_string())?;

    conn.close().await;
    Ok(())
}
