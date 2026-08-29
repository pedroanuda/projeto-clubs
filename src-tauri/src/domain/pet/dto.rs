use serde::{Deserialize, Serialize};

use crate::domain::pet::model::Dog;

/// Data Transfer Object used by the API layer.  This type is intentionally
/// decoupled from the internal `Dog` model so that we can evolve the
/// transport contract independently of the domain model.  In a more
/// elaborate application you might have separate DTOs for creation,
/// updates, and read responses; for now we just expose a single structure
/// with optional `id`/`owners_ids` fields.
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PetDto {
    pub id: Option<String>,
    pub name: String,
    pub gender: String,
    pub breed_id: i32,
    pub shelved: bool,
    pub birthday: Option<String>,
    pub notes: Option<String>,
    pub picture_path: Option<String>,
    pub default_pack_price: Option<f64>,
    pub owners_ids: Option<Vec<String>>,
}

impl PetDto {
    /// Convert a DTO received from the client into a domain model.  The
    /// `owners_ids` field is flattened because the `Dog` struct always
    /// contains a vector (it will typically be populated by a join query
    /// rather than passed in directly).
    pub fn into_model(self) -> Dog {
        // the API layer is expected to supply an `id`; if it doesn't we
        // leave it empty and the caller (service/repository) can generate one
        // or reject the request.
        Dog {
            id: self.id.unwrap_or_default(),
            name: self.name,
            gender: self.gender,
            breed_id: self.breed_id,
            breed_name: String::new(), // repository fills when selecting
            shelved: self.shelved,
            birthday: self.birthday,
            notes: self.notes,
            picture_path: self.picture_path,
            default_pack_price: self.default_pack_price,
            owners_ids: self.owners_ids.unwrap_or_default(),
        }
    }
}

impl From<Dog> for PetDto {
    fn from(d: Dog) -> Self {
        PetDto {
            id: Some(d.id),
            name: d.name,
            gender: d.gender,
            breed_id: d.breed_id,
            shelved: d.shelved,
            birthday: d.birthday,
            notes: d.notes,
            picture_path: d.picture_path,
            default_pack_price: d.default_pack_price,
            owners_ids: Some(d.owners_ids),
        }
    }
}
