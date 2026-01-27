#[derive(sqlx::FromRow, serde::Deserialize, serde::Serialize)]
pub struct Dog {
    pub id: String,
    pub name: String,
    pub gender: String,
    pub breed_id: i32,
    pub breed_name: String,
    pub shelved: bool,
    pub birthday: Option<String>,
    pub notes: Option<String>,
    pub picture_path: Option<String>,
    pub default_pack_price: Option<f64>,
}
