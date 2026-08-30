#[derive(sqlx::FromRow, serde::Deserialize, serde::Serialize)]
pub struct Owner {
    pub id: String,
    pub name: String,
    pub register_date: String,
    pub update_date: String,
    pub email: Option<String>,
    pub phone_numbers: Option<String>,
    pub addresses: Option<String>,
    pub about: Option<String>,
}
