use crate::actions;
use serde_json::Value;

/// ## Description
/// A really useful dispatcher to interact with the actions.
#[tauri::command]
pub async fn backend_dispatcher(payload: Value) -> Result<Value, Value> {
    actions::handle(payload).await
}
