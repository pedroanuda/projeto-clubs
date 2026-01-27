use sqlx::prelude::FromRow;

#[derive(FromRow, serde::Serialize)]
pub struct Breed {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub picture_path: String,
}
