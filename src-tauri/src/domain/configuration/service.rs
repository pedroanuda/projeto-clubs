use crate::{
    actions::ApiResponse,
    domain::configuration::{dto::ConfigurationDto, repository},
};

pub async fn list_configurations() -> Result<ApiResponse<Vec<ConfigurationDto>>, ApiResponse> {
    let configurations: Vec<ConfigurationDto> = repository::get_all_configurations()
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?
        .into_iter()
        .map(ConfigurationDto::from)
        .collect();

    Ok(ApiResponse::success(configurations))
}

pub async fn save_configuration(
    configuration_dto: &ConfigurationDto,
) -> Result<ApiResponse, ApiResponse> {
    let configuration_name = &configuration_dto.name;
    let configuration_value = &configuration_dto.value;

    repository::save_configuration(configuration_name, configuration_value)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?;

    Ok(ApiResponse::success(None))
}
