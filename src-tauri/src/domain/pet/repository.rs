use crate::{
    db,
    domain::{
        pet::model::{Dog, DogRow},
        query_utils,
    },
};

pub async fn get_all_pets(
    status: Option<String>,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from(
        "SELECT d.*, b.name AS breed_name, GROUP_CONCAT(do.owner_id) AS owners_concat FROM Dogs d
        JOIN Breeds b ON b.id = d.breed_id
        LEFT JOIN Dogs_Owners do ON do.dog_id = d.id",
    );
    if let Some(status_str) = status {
        query.push_str(&format!(
            " WHERE d.status = '{}'",
            status_str
        ));
    }
    query.push_str(" GROUP BY d.id ORDER BY d.name ASC");
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let rows: Vec<DogRow> = sqlx::query_as(&query).fetch_all(pool).await?;
    let pets: Vec<Dog> = rows.into_iter().map(Dog::from).collect();
    Ok(pets)
}

pub async fn search_pets(
    search: &str,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from(
        "SELECT DISTINCT d.*, b.name AS breed_name, GROUP_CONCAT(do.owner_id) AS owners_concat FROM Dogs d
        JOIN Breeds b ON b.id = d.breed_id
        LEFT JOIN Dogs_Owners do ON do.dog_id = d.id
        LEFT JOIN Owners o ON o.id = do.owner_id
        WHERE d.name LIKE $1 OR o.name LIKE $2",
    );
    query.push_str(" GROUP BY d.id ORDER BY d.name ASC");
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let search_pattern = format!("%{}%", search);

    let rows: Vec<DogRow> = sqlx::query_as(&query)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(pool)
        .await?;

    let pets: Vec<Dog> = rows.into_iter().map(Dog::from).collect();
    Ok(pets)
}

pub async fn get_pet_by_id(id: &str) -> Result<Dog, sqlx::Error> {
    let pool = db::get_pool();

    let query = "
    SELECT d.*, b.name AS breed_name, GROUP_CONCAT(do.owner_id) AS owners_concat FROM Dogs d
    JOIN Breeds b ON b.id = d.breed_id
    LEFT JOIN Dogs_Owners do ON do.dog_id = d.id
    WHERE id = $1
    GROUP BY d.id";
    let row: DogRow = sqlx::query_as(&query).bind(id).fetch_one(pool).await?;

    let obj: Dog = Dog::from(row);
    Ok(obj)
}

pub async fn get_pets_by_owner(owner_id: &str) -> Result<Vec<Dog>, sqlx::Error> {
    let pool = db::get_pool();

    let query = "
    SELECT d.*, b.name AS breed_name, GROUP_CONCAT(do.owner_id) AS owners_concat FROM Dogs d
    JOIN Breeds b ON b.id = d.breed_id
    JOIN Dogs_Owners do ON do.dog_id = d.id
    JOIN Owners o ON o.id = do.owner_id
    WHERE o.id = $1
    GROUP BY d.id";
    let rows: Vec<DogRow> = sqlx::query_as(query).bind(owner_id).fetch_all(pool).await?;

    let pets: Vec<Dog> = rows.into_iter().map(Dog::from).collect();
    Ok(pets)
}

pub async fn save_pet(new_pet: &Dog) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();
    let mut tx = pool.begin().await?;

    let create_query = "INSERT INTO Dogs (name, gender, birthday, status, notes, picture_path, default_pack_price, breed_id, id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    let update_query = "UPDATE Dogs SET name = $1, gender = $2, birthday = $3, status = $4, notes = $5, picture_path = $6,
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
        .bind(&new_pet.status)
        .bind(&new_pet.notes)
        .bind(&new_pet.picture_path)
        .bind(&new_pet.default_pack_price)
        .bind(&new_pet.breed_id)
        .bind(&new_pet.id)
        .execute(&mut *tx)
        .await?;

    for owner_id in &new_pet.owners_ids {
        add_owner_to_pet(&new_pet.id, owner_id, &mut *tx).await?;
    }

    tx.commit().await?;

    Ok(())
}

pub async fn add_owner_to_pet(
    pet_id: &str,
    owner_id: &str,
    tx: &mut sqlx::SqliteConnection,
) -> Result<(), sqlx::Error> {
    let query = "INSERT INTO Dogs_Owners (dog_id, owner_id) VALUES ($1, $2)";
    sqlx::query(&query)
        .bind(pet_id)
        .bind(owner_id)
        .execute(tx)
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
