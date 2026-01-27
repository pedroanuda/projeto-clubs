use crate::{
    actions::ApiResponse,
    domain::owner::{model::Owner, repository},
};

pub async fn get_owner(id: &str) -> Result<ApiResponse<Owner>, ApiResponse> {
    let exists = repository::exists_owner(id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(&format!(
            "Dono com id {id} não está cadastrado!"
        )));
    }

    let owner = repository::get_owner_by_id(id).await.unwrap();
    Ok(ApiResponse::success(owner))
}

pub async fn list_owners(
    page: Option<u32>,
    owners_per_page: Option<u32>,
    search: Option<String>,
) -> Result<ApiResponse<Vec<Owner>>, ApiResponse> {
    let limit = owners_per_page;
    let offset = page.and_then(|page_n| limit.map(|limit_n| limit_n * (page_n - 1)));

    let owners = match search {
        Some(search_str) => repository::search_owners(&search_str, limit, offset).await,
        None => repository::get_all_owners(limit, offset).await,
    }
    .map_err(|e| ApiResponse::error(&e.to_string()))?;

    Ok(ApiResponse::success(owners))
}

pub async fn list_owners_of_pet(pet_id: &str) -> Result<ApiResponse<Vec<Owner>>, ApiResponse> {
    let owners = repository::get_owners_by_pet(pet_id)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?;

    Ok(ApiResponse::success(owners))
}

pub async fn register_owner(owner: &Owner) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_owner(&owner.id).await.unwrap();

    if exists {
        return Err(ApiResponse::error("Dono já está cadastrado!"));
    }

    repository::save_owner(&owner).await.unwrap();
    Ok(ApiResponse::success(None))
}

pub async fn update_owner(owner: &Owner) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_owner(&owner.id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(
            "Não é possível atualizar um dono que não existe.",
        ));
    }

    repository::save_owner(&owner).await.unwrap();
    Ok(ApiResponse::success(None))
}

pub async fn delete_owner(id: &str) -> Result<ApiResponse, ApiResponse> {
    let exists = repository::exists_owner(id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(
            "Não é possível apagar um dono que não existe.",
        ));
    }

    repository::delete_owner(id).await.unwrap();
    Ok(ApiResponse::success(None))
}
