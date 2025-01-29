#[tauri::command]
fn cagar(oque: &str) -> String {
    format!("Caguei muito {} ontem!", oque)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![cagar])
        .run(tauri::generate_context!())
        .expect("error on running tauri application");
}
