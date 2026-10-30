pub mod injection;
pub mod steam;

use injection::{
    copy_dlls_to_steam, copy_syctool_to_appdata, inject_dlls_to_steam, inject_syctool_to_appdata,
};
use steam::{
    check_steam_login_status, is_steam_running, login_steam_with_timer, logout_and_close_steam,
    open_steam_activate_product, open_steam_and_check_login, SteamState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Configure bundled WebView2FixedRuntime if present alongside the executable
    if std::env::var_os("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER").is_none() {
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let candidate = exe_dir.join("WebView2FixedRuntime");
                if candidate.is_dir() {
                    std::env::set_var("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER", candidate);
                }
            }
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SteamState::default())
        .invoke_handler(tauri::generate_handler![
            is_steam_running,
            login_steam_with_timer,
            logout_and_close_steam,
            check_steam_login_status,
            open_steam_and_check_login,
            open_steam_activate_product,
            copy_dlls_to_steam,
            inject_dlls_to_steam,
            copy_syctool_to_appdata,
            inject_syctool_to_appdata,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

