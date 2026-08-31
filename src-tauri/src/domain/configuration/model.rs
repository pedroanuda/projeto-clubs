#[derive(sqlx::FromRow, serde::Deserialize, serde::Serialize)]
pub struct Configuration {
    pub id: u32,
    pub name: String,
    pub value: String,
}
