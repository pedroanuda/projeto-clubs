#[derive(sqlx::FromRow, serde::Deserialize, serde::Serialize, Default)]
pub struct Dog {
    pub id: String,
    pub name: String,
    pub gender: String,
    pub breed_id: i32,
    pub breed_name: String,
    pub status: String,
    pub birthday: Option<String>,
    pub notes: Option<String>,
    pub picture_path: Option<String>,
    pub default_pack_price: Option<f64>,
    #[sqlx(skip)]
    pub owners_ids: Vec<String>,
}

#[derive(sqlx::FromRow)]
pub struct DogRow {
    id: String,
    name: String,
    gender: String,
    breed_id: i32,
    breed_name: String,
    status: String,
    birthday: Option<String>,
    notes: Option<String>,
    picture_path: Option<String>,
    default_pack_price: Option<f64>,
    owners_concat: Option<String>, // extra field from GROUP_CONCAT
}

impl From<DogRow> for Dog {
    fn from(r: DogRow) -> Self {
        let owners_ids = r
            .owners_concat
            .map(|s| s.split(',').map(String::from).collect())
            .unwrap_or_default();
        Dog {
            id: r.id,
            name: r.name,
            gender: r.gender,
            breed_id: r.breed_id,
            breed_name: r.breed_name,
            status: r.status,
            birthday: r.birthday,
            notes: r.notes,
            picture_path: r.picture_path,
            default_pack_price: r.default_pack_price,
            owners_ids,
        }
    }
}
