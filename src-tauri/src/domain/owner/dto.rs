use serde::{Deserialize, Serialize};

use crate::domain::owner::model::Owner;

/// Owner DTO for communication with the UI layer.  Separates the transport
/// contract from the internal `Owner` domain type.
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct OwnerDto {
    pub id: Option<String>,
    pub name: String,
    pub register_date: Option<String>,
    pub update_date: Option<String>,
    pub email: Option<String>,
    pub phone_numbers: Option<String>,
    pub addresses: Option<String>,
    pub about: Option<String>,
}

impl OwnerDto {
    pub fn into_model(self) -> Owner {
        Owner {
            id: self.id.unwrap_or_default(),
            name: self.name,
            register_date: self.register_date.unwrap_or_default(),
            update_date: self.update_date.unwrap_or_default(),
            email: self.email,
            phone_numbers: self.phone_numbers,
            addresses: self.addresses,
            about: self.about,
        }
    }
}

impl From<Owner> for OwnerDto {
    fn from(o: Owner) -> Self {
        OwnerDto {
            id: Some(o.id),
            name: o.name,
            register_date: Some(o.register_date),
            update_date: Some(o.update_date),
            email: o.email,
            phone_numbers: o.phone_numbers,
            addresses: o.addresses,
            about: o.about,
        }
    }
}
