use crate::{
    db,
    domain::{breed::model::Breed, query_utils},
};

pub async fn get_all_breeds(
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Breed>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from("SELECT * FROM Breeds");
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Breed> = sqlx::query_as(&query).fetch_all(pool).await?;

    Ok(obj)
}
