use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    actions::ApiResponse,
    domain::pet::{dto::PetDto, service},
};

#[derive(Deserialize)]
#[serde(tag = "action", content = "params")]
pub enum PetAction {
    Create(PetDto),
    Update(PetDto),
    Get {
        id: String,
    },
    List {
        page: Option<u32>,
        pets_per_page: Option<u32>,
        search: Option<String>,
        status: Option<String>,
    },
    ListByOwner {
        owner_id: String,
    },
    Delete {
        id: String,
    },
}

pub async fn handle(action: PetAction) -> Result<Value, ApiResponse> {
    let response = match action {
        PetAction::Get { id } => json!(service::get_pet(&id).await?),
        PetAction::List {
            page,
            pets_per_page,
            search,
            status,
        } => json!(service::list_pets(page, pets_per_page, status, search).await?),
        PetAction::ListByOwner { owner_id } => json!(service::list_pets_of_owner(&owner_id).await?),
        PetAction::Create(pet) => json!(service::register_pet(&pet).await?),
        PetAction::Update(pet) => json!(service::update_pet(&pet).await?),
        PetAction::Delete { id } => json!(service::delete_pet(&id).await?),
    };

    Ok(response)
}
