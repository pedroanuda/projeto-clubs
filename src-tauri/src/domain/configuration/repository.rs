use crate::{domain::configuration::model::Configuration, infrastructure::db};

pub async fn get_all_configurations() -> Result<Vec<Configuration>, sqlx::Error> {
    let pool = db::get_pool();

    let query = "SELECT * FROM Configurations";

    let obj: Vec<Configuration> = sqlx::query_as(&query).fetch_all(pool).await?;
    Ok(obj)
}

/*pub async fn get_configuration(name: &str) -> Result<Configuration, sqlx::Error> {
    let pool = db::get_pool();

    let query = "SELECT * FROM Configurations WHERE name = $1";
    let obj: Configuration = sqlx::query_as(&query).bind(name).fetch_one(pool).await?;

    Ok(obj)
}*/

pub async fn save_configuration(name: &str, value: &str) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    let update_query = "
    UPDATE Configurations SET value = $2
    WHERE name = $1";
    let create_query = "
    INSERT INTO Configurations (name, value)
    VALUES ($1, $2)";
    let query = if exists_configuration(name).await? {
        update_query
    } else {
        create_query
    };

    sqlx::query(&query)
        .bind(name)
        .bind(value)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn exists_configuration(configuration_name: &str) -> Result<bool, sqlx::Error> {
    let pool = db::get_pool();

    let exists: i64 =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM Configurations WHERE name = $1)")
            .bind(configuration_name)
            .fetch_one(pool)
            .await?;

    Ok(0 != exists)
}

/*pub async fn delete_configuration(configuration_name: &str) -> Result<(), sqlx::Error> {
    let pool = db::get_pool();

    sqlx::query("DELETE FROM Configurations WHERE name = $1")
        .bind(configuration_name)
        .execute(pool)
        .await?;

    Ok(())
}*/
