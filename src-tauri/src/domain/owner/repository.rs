use crate::{
    domain::{owner::model::Owner, query_utils},
    infrastructure::db,
};

pub async fn get_all_owners(
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Owner>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from("SELECT * FROM Owners");
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let obj: Vec<Owner> = sqlx::query_as(&query).fetch_all(pool).await?;
    Ok(obj)
}

pub async fn search_owners(
    search: &str,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Vec<Owner>, sqlx::Error> {
    let pool = db::get_pool();

    let mut query = String::from(
        "SELECT DISTINCT o.* FROM Owners o
        LEFT JOIN Dogs_Owners do ON do.owner_id = o.id
        LEFT JOIN Dogs d ON d.id = do.dog_id
        WHERE o.name LIKE $1 OR d.name LIKE $2",
    );
    query_utils::define_limit_and_offset(&mut query, limit, offset);

    let search_pattern = format!("%{}%", search);

    let obj: Vec<Owner> = sqlx::query_as(&query)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(pool)
        .await?;
    Ok(obj)
}

pub async fn get_owner_by_id(id: &str) -> Result<Owner, sqlx::Error> {
    let pool = db::get_pool();

    let query = "SELECT * FROM Owners WHERE id = $1";
    let obj: Owner = sqlx::query_as(&query).bind(id).fetch_one(pool).await?;

    Ok(obj)
}

pub async fn get_owners_by_pet(pet_id: &str) -> Result<Vec<Owner>, sqlx::Error> {
    let pool = db::get_pool();

    let query = "
    SELECT * FROM Owners o
    JOIN Dogs_Owners do ON do.owner_id = o.id
    WHERE do.dog_id = $1";
    let obj: Vec<Owner> = sqlx::query_as(query).bind(&pet_id).fetch_all(pool).await?;

    Ok(obj)
}

pub async fn save_owner(new_owner: &Owner) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    let update_query = "
    UPDATE Owners SET name = $1, phone_numbers = $2, email = $3, addresses = $4, about = $5
    WHERE id = $6";
    let create_query = "
    INSERT INTO Owners (name, phone_numbers, email, addresses, about, id)
    VALUES ($1, $2, $3, $4, $5, $6)";
    let query = if exists_owner(&new_owner.id).await? {
        update_query
    } else {
        create_query
    };

    sqlx::query(&query)
        .bind(&new_owner.name)
        .bind(&new_owner.phone_numbers)
        .bind(&new_owner.email)
        .bind(&new_owner.addresses)
        .bind(&new_owner.about)
        .bind(&new_owner.id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn exists_owner(owner_id: &str) -> Result<bool, sqlx::Error> {
    let pool = db::get_pool();

    let exists: i64 = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM Owners WHERE id = $1)")
        .bind(owner_id)
        .fetch_one(pool)
        .await?;

    Ok(0 != exists)
}

pub async fn delete_owner(owner_id: &str) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    sqlx::query("DELETE FROM Owners WHERE id = $1")
        .bind(owner_id)
        .execute(pool)
        .await?;

    Ok(())
}
