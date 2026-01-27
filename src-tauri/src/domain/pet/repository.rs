use crate::{
    db,
    domain::{pet::model::Dog, query_utils},
};

pub async fn get_all_pets(
    shelved: Option<bool>,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from(
        "SELECT d.*, b.name AS breed_name FROM Dogs d JOIN Breeds b ON b.id = d.breed_id",
    );
    if let Some(shelved_bool) = shelved {
        query.push_str(&format!(
            " WHERE d.shelved = {}",
            if shelved_bool { 1 } else { 0 }
        ));
    }
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Dog> = sqlx::query_as(&query).fetch_all(pool).await?;
    Ok(obj)
}

pub async fn search_pets(
    search: &str,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from(
        "SELECT DISTINCT d.*, b.name AS breed_name FROM Dogs d
        JOIN Breeds b ON b.id = d.breed_id
        LEFT JOIN Dogs_Owners do ON do.dog_id = d.id
        LEFT JOIN Owners o ON o.id = do.owner_id
        WHERE d.name LIKE $1 OR o.name LIKE $2",
    );
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Dog> = sqlx::query_as(&query)
        .bind(&search)
        .bind(&search)
        .fetch_all(pool)
        .await?;
    Ok(obj)
}

pub async fn get_pet_by_id(id: &str) -> Result<Dog, sqlx::Error> {
    let pool = db::get_pool();

    let query = "
    SELECT d.*, b.name AS breed_name FROM Dogs d 
    JOIN Breeds b ON b.id = d.breed_id
    WHERE id = $1";
    let obj: Dog = sqlx::query_as(&query).bind(id).fetch_one(pool).await?;

    Ok(obj)
}

pub async fn get_pets_by_owner(owner_id: &str) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let query = "
    SELECT d.*, b.name AS breed_name FROM Dogs d
    JOIN Breeds b ON b.id = d.breed_id
    JOIN Dogs_Owners do ON do.dog_id = d.id
    JOIN Owners o ON o.id = do.owner_id
    WHERE o.id = $1";
    let obj: Vec<Dog> = sqlx::query_as(query).bind(owner_id).fetch_all(pool).await?;

    Ok(obj)
}

pub async fn save_pet(new_pet: &Dog) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    let create_query = "INSERT INTO Dogs (name, gender, birthday, shelved, notes, picture_path, default_pack_price, breed_id, id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    let update_query = "UPDATE Dogs SET name = $1, gender = $2, birthday = $3, shelved = $4, notes = $5, picture_path = $6,
    default_pack_price = $7, breed_id = $8, id = $9";
    let query = if exists_pet(&new_pet.id).await? {
        update_query
    } else {
        create_query
    };

    sqlx::query(&query)
        .bind(&new_pet.name)
        .bind(&new_pet.gender)
        .bind(&new_pet.birthday)
        .bind(&new_pet.shelved)
        .bind(&new_pet.notes)
        .bind(&new_pet.picture_path)
        .bind(&new_pet.default_pack_price)
        .bind(&new_pet.breed_id)
        .bind(&new_pet.id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn exists_pet(id: &str) -> Result<bool, sqlx::Error> {
    let pool = db::get_pool();

    let exists: i64 = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM Dogs WHERE id = $1)")
        .bind(id)
        .fetch_one(pool)
        .await?;

    Ok(0 != exists)
}

pub async fn delete_pet(pet_id: &str) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    sqlx::query("DELETE FROM Dogs WHERE id = $1")
        .bind(&pet_id)
        .execute(pool)
        .await?;

    Ok(())
}
