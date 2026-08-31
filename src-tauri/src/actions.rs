use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

mod breed;
mod configuration;
mod owner;
mod pet;

#[derive(Serialize)]
pub struct ApiResponse<T = ()> {
    success: bool,
    data: Option<T>,
    error_message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success<O>(data: O) -> Self
    where
        O: Into<Option<T>>,
    {
        let data = data.into();
        ApiResponse {
            success: true,
            error_message: None,
            data: data,
        }
    }

    pub fn error(msg: &str) -> Self {
        ApiResponse {
            success: false,
            error_message: Some(msg.to_string()),
            data: None,
        }
    }
}

#[derive(Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Action {
    Owner(owner::OwnerAction),
    Pet(pet::PetAction),
    Breed(breed::BreedAction),
    Configuration(configuration::ConfigurationAction),
}

pub async fn handle(payload: Value) -> Result<Value, Value> {
    let action: Action = serde_json::from_value(payload).map_err(|e| e.to_string())?;

    match action {
        Action::Owner(act) => owner::handle(act).await,
        Action::Pet(act) => pet::handle(act).await,
        Action::Breed(act) => breed::handle(act).await,
        Action::Configuration(act) => configuration::handle(act).await,
    }
    .map_err(|e| json!(e))
}
