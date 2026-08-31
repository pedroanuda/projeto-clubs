use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    actions::ApiResponse, domain::configuration::dto::ConfigurationDto,
    domain::configuration::service,
};

#[derive(Deserialize)]
#[serde(tag = "action", content = "params")]
pub enum ConfigurationAction {
    List {},
    Save(ConfigurationDto),
}

pub async fn handle(action: ConfigurationAction) -> Result<Value, ApiResponse> {
    let response = match action {
        ConfigurationAction::List {} => json!(service::list_configurations().await?),
        ConfigurationAction::Save(configuration_dto) => {
            json!(service::save_configuration(&configuration_dto).await?)
        }
    };

    Ok(response)
}
