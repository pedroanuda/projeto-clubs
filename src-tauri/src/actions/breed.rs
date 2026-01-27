use serde::Deserialize;
use serde_json::{json, Value};

use crate::{actions::ApiResponse, domain::breed::service};

#[derive(Deserialize)]
#[serde(tag = "action", content = "params")]
pub enum BreedAction {
    List {
        page: Option<u32>,
        breeds_per_page: Option<u32>,
    },
}

pub async fn handle(action: BreedAction) -> Result<Value, ApiResponse> {
    let response = match action {
        BreedAction::List {
            page,
            breeds_per_page,
        } => json!(service::list_breeds(page, breeds_per_page).await?),
    };

    Ok(response)
}
