use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    actions::ApiResponse,
    domain::owner::{model::Owner, service},
};

#[derive(Deserialize)]
#[serde(tag = "action", content = "params")]
pub enum OwnerAction {
    Create(Owner),
    Update(Owner),
    Get {
        id: String,
    },
    List {
        page: Option<u32>,
        owners_per_page: Option<u32>,
        search: Option<String>,
    },
    ListByPet {
        pet_id: String,
    },
    Delete {
        id: String,
    },
}

pub async fn handle(action: OwnerAction) -> Result<Value, ApiResponse> {
    let response = match action {
        OwnerAction::Get { id } => json!(service::get_owner(&id).await?),
        OwnerAction::List {
            page,
            owners_per_page,
            search,
        } => json!(service::list_owners(page, owners_per_page, search).await?),
        OwnerAction::ListByPet { pet_id } => json!(service::list_owners_of_pet(&pet_id).await?),
        OwnerAction::Create(owner) => json!(service::register_owner(&owner).await?),
        OwnerAction::Update(owner) => json!(service::update_owner(&owner).await?),
        OwnerAction::Delete { id } => json!(service::delete_owner(&id).await?),
    };

    Ok(response)
}
