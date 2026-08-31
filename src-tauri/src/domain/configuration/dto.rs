use crate::domain::configuration::model::Configuration;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct ConfigurationDto {
    pub name: String,
    pub value: String,
}

impl From<Configuration> for ConfigurationDto {
    fn from(configuration: Configuration) -> Self {
        Self {
            name: configuration.name,
            value: configuration.value,
        }
    }
}
