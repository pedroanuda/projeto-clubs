use sqlx::types::Uuid;

use crate::{
    actions::ApiResponse,
    domain::{
        owner::repository as owner_repository,
        pet::{dto::PetDto, model::Dog, repository},
    },
};

pub async fn get_pet(id: &str) -> Result<ApiResponse<PetDto>, ApiResponse> {
    let exists = repository::exists_pet(id).await.unwrap();

    if !exists {
        return Err(ApiResponse::error(&format!(
            "Pet com id {id} não está cadastrado!"
        )));
    }

    let mut pet = repository::get_pet_by_id(id).await.unwrap();
    let owners = owner_repository::get_owners_by_pet(id).await.unwrap();
    pet.owners_ids = owners.into_iter().map(|owner| owner.id).collect();
    Ok(ApiResponse::success(PetDto::from(pet)))
}

pub async fn list_pets(
    page: Option<u32>,
    pets_per_page: Option<u32>,
    status: Option<String>,
    search: Option<String>,
) -> Result<ApiResponse<Vec<PetDto>>, ApiResponse> {
    let limit = pets_per_page;
    let offset = page.and_then(|page_n| limit.map(|limit_n| limit_n * (page_n - 1)));

    let dogs: Vec<Dog> = match search {
        Some(search_str) => repository::search_pets(&search_str, status, limit, offset).await,
        None => repository::get_all_pets(status, limit, offset).await,
    }
    .map_err(|e| ApiResponse::error(&e.to_string()))?;

    // sequentially fetch owners for each pet and build DTOs; this
    // avoids adding another crate. For higher performance you could
    // either perform a single query with a join (see note below) or
    // use `futures::future::join_all` after adding `futures` to
    // Cargo.toml.
    let mut pets: Vec<PetDto> = Vec::with_capacity(dogs.len());
    for mut pet in dogs {
        let owners = owner_repository::get_owners_by_pet(&pet.id).await.unwrap();
        pet.owners_ids = owners.into_iter().map(|owner| owner.id).collect();
        pets.push(PetDto::from(pet));
    }

    Ok(ApiResponse::success(pets))
}

pub async fn list_pets_of_owner(owner_id: &str) -> Result<ApiResponse<Vec<PetDto>>, ApiResponse> {
    let pets: Vec<PetDto> = repository::get_pets_by_owner(owner_id)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?
        .into_iter()
        .map(PetDto::from)
        .collect();

    Ok(ApiResponse::success(pets))
}

pub async fn register_pet(pet_dto: &PetDto) -> Result<ApiResponse, ApiResponse> {
    let mut pet: Dog = pet_dto.clone().into_model();
    if pet.id.is_empty() {
        pet.id = Uuid::new_v4().to_string();
    }

    let exists = repository::exists_pet(&pet.id).await.unwrap();
    for owner_id in &pet.owners_ids {
        let owner_exists = owner_repository::exists_owner(owner_id).await.unwrap();
        if !owner_exists {
            return Err(ApiResponse::error(
                "Não é possível cadastrar um pet para um dono com que não existe.",
            ));
        }
    }

    if exists {
        return Err(ApiResponse::error("Pet já está cadastrado!"));
    }

    repository::save_pet(&pet).await.unwrap();
    Ok(ApiResponse::success(None))
}

pub async fn update_pet(pet_dto: &PetDto) -> Result<ApiResponse, ApiResponse> {
    let pet: Dog = pet_dto.clone().into_model();

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
