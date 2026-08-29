use crate::{
    actions::ApiResponse,
    domain::breed::{dto::BreedDto, repository},
};

pub async fn list_breeds(
    page: Option<u32>,
    owners_per_page: Option<u32>,
) -> Result<ApiResponse<Vec<BreedDto>>, ApiResponse> {
    let limit = owners_per_page;
    let offset = page.and_then(|page_n| limit.map(|limit_n| limit_n * (page_n - 1)));

    let breeds: Vec<BreedDto> = repository::get_all_breeds(limit, offset)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string()))?
        .into_iter()
        .map(BreedDto::from)
        .collect();

    Ok(ApiResponse::success(breeds))
}
