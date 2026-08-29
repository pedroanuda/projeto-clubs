use serde::{Deserialize, Serialize};

use crate::domain::breed::model::Breed;

/// Simple breed DTO used by the front‑end.  The `id` field is optional to ease
/// creation scenarios.
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BreedDto {
    pub id: Option<u32>,
    pub name: String,
    pub description: String,
    pub picture_path: String,
}

// conversion back to domain model can be added when the
// application needs to persist or manipulate breeds coming from the
// transport layer.

impl From<Breed> for BreedDto {
    fn from(b: Breed) -> Self {
        BreedDto {
            id: Some(b.id),
            name: b.name,
            description: b.description,
            picture_path: b.picture_path,
        }
    }
}
