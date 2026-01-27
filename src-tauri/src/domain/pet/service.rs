use crate::{
    actions::ApiResponse,
    domain::pet::{model::Dog, repository},
};

pub async fn get_pet(id: &str) -> Result<ApiResponse<Dog>, ApiResponse> {
    let exists = repository::exists_pet(id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(&format!(
            "Pet com id {id} não está cadastrado!"
        )));
    }

    let pet = repository::get_pet_by_id(id).await.unwrap();
    Ok(ApiResponse::success(pet))
}

pub async fn list_pets(
    page: Option<u32>,
    pets_per_page: Option<u32>,
    shelved: Option<bool>,
    search: Option<String>,
) -> Result<ApiResponse<Vec<Dog>>, ApiResponse> {
    let limit = pets_per_page;
    let offset = page.and_then(|page_n| limit.map(|limit_n| limit_n * (page_n - 1)));

    let pets = match search {
        Some(search_str) => repository::search_pets(&search_str, limit, offset).await,
        None => repository::get_all_pets(shelved, limit, offset).await,
    }
    .map_err(|e| ApiResponse::error(&e.to_string()))?;

    Ok(ApiResponse::success(pets))
}

pub async fn list_pets_of_owner(owner_id: &str) -> Result<ApiResponse<Vec<Dog>>, ApiResponse> {
    let pets = repository::get_pets_by_owner(owner_id)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?;

    Ok(ApiResponse::success(pets))
}

pub async fn register_pet(pet: &Dog) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_pet(&pet.id).await.unwrap();

    if exists {
        return Err(ApiResponse::error("Pet já está cadastrado!"));
    }

    repository::save_pet(&pet).await.unwrap();
    Ok(ApiResponse::success(None))
}

pub async fn update_pet(pet: &Dog) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_pet(&pet.id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(
            "Não é possível atualizar um pet que não existe.",
        ));
    }

    repository::save_pet(&pet).await.unwrap();
    Ok(ApiResponse::success(None))
}

pub async fn delete_pet(id: &str) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_pet(id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(
            "Não é possível apagar um pet que não existe.",
        ));
    }

    repository::delete_pet(id).await.unwrap();
    Ok(ApiResponse::success(None))
}
