pub mod detector;
pub mod process;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{AppHandle, State};

use crate::injection::dll::sync_dlls_to_steam;
use crate::injection::syctool::sync_syctool_to_appdata;
use detector::detect_steam_path;
use process::{
    clear_steam_auto_login, get_steam_active_user, kill_steam_process,
};

pub struct SteamState {
    pub active_username: Mutex<Option<String>>,
    pub timer_generation: Arc<AtomicU64>,
}

impl Default for SteamState {
    fn default() -> Self {
        Self {
            active_username: Mutex::new(None),
            timer_generation: Arc::new(AtomicU64::new(0)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SteamLoginStatus {
    pub installed: bool,
    pub running: bool,
    pub logged_in: bool,
    pub active_user_id: Option<u32>,
    pub message: String,
}

#[tauri::command]
pub fn is_steam_running() -> bool {
    process::is_steam_running()
}

#[tauri::command]
pub fn login_steam_with_timer(
    username: String,
    password: String,
    remaining_seconds: u64,
    state: State<'_, SteamState>,
) -> Result<String, String> {
    let mut active_user_guard = state
        .active_username
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    let is_running = process::is_steam_running();
    if is_running {
        println!("Switching accounts, killing existing Steam process...");
        kill_steam_process();
        thread::sleep(Duration::from_millis(1000));
    }

    let steam_dir = detect_steam_path()
        .unwrap_or_else(|| PathBuf::from(r"C:\Program Files (x86)\Steam"));
    let steam_exe = steam_dir.join("steam.exe");

    if !steam_exe.exists() {
        return Err(format!(
            "Steam executable not found at: {}",
            steam_exe.display()
        ));
    }

    clear_steam_auto_login(&steam_dir);

    Command::new(&steam_exe)
        .current_dir(&steam_dir)
        .args(["-login", &username, &password])
        .spawn()
        .map_err(|e| format!("Failed to launch Steam: {}", e))?;

    *active_user_guard = Some(username.clone());
    let session_gen = state.timer_generation.fetch_add(1, Ordering::SeqCst) + 1;

    if remaining_seconds > 0 {
        let timer_gen_clone = Arc::clone(&state.timer_generation);
        thread::spawn(move || {
            println!(
                "Rental timer active: Steam will automatically close in {} seconds (Session #{})",
                remaining_seconds, session_gen
            );
            let start = Instant::now();
            let total = Duration::from_secs(remaining_seconds);

            while start.elapsed() < total {
                thread::sleep(Duration::from_secs(1));
                if timer_gen_clone.load(Ordering::SeqCst) != session_gen {
                    println!(
                        "Session #{} is obsolete (a newer session is active). Terminating timer thread early.",
                        session_gen
                    );
                    return;
                }
            }

            if timer_gen_clone.load(Ordering::SeqCst) == session_gen {
                println!(
                    "Rental time expired ({}s)! Closing Steam process...",
                    remaining_seconds
                );
                kill_steam_process();
                println!("Steam process terminated successfully.");
            } else {
                println!(
                    "Session #{} is obsolete. Skipping auto-close.",
                    session_gen
                );
            }
        });

        Ok(format!(
            "Steam launched for user '{}'. Auto-close timer set for {} seconds.",
            username, remaining_seconds
        ))
    } else {
        Ok("Steam launched without automatic shutdown timer.".to_string())
    }
}

#[tauri::command]
pub fn logout_and_close_steam(state: State<'_, SteamState>) -> Result<(), String> {
    if let Ok(mut active_user) = state.active_username.lock() {
        *active_user = None;
    }
    state.timer_generation.fetch_add(1, Ordering::SeqCst);
    kill_steam_process();
    Ok(())
}

#[tauri::command]
pub fn check_steam_login_status() -> SteamLoginStatus {
    let steam_dir = detect_steam_path();
    let installed = steam_dir
        .as_ref()
        .map(|d| d.join("steam.exe").is_file())
        .unwrap_or(false);

    if !installed {
        return SteamLoginStatus {
            installed: false,
            running: false,
            logged_in: false,
            active_user_id: None,
            message: "Steam is not installed on this machine.".to_string(),
        };
    }

    let running = process::is_steam_running();
    if !running {
        return SteamLoginStatus {
            installed: true,
            running: false,
            logged_in: false,
            active_user_id: None,
            message: "Steam is not running.".to_string(),
        };
    }

    if let Some(uid) = get_steam_active_user() {
        SteamLoginStatus {
            installed: true,
            running: true,
            logged_in: true,
            active_user_id: Some(uid),
            message: "Steam is running and logged in.".to_string(),
        }
    } else {
        SteamLoginStatus {
            installed: true,
            running: true,
            logged_in: false,
            active_user_id: None,
            message: "Steam is running, waiting for user login.".to_string(),
        }
    }
}

#[tauri::command]
pub fn open_steam_and_check_login(
    app: AppHandle,
    restart: Option<bool>,
) -> Result<SteamLoginStatus, String> {
    let steam_dir = detect_steam_path()
        .unwrap_or_else(|| PathBuf::from(r"C:\Program Files (x86)\Steam"));
    let steam_exe = steam_dir.join("steam.exe");

    if !steam_exe.is_file() {
        return Ok(SteamLoginStatus {
            installed: false,
            running: false,
            logged_in: false,
            active_user_id: None,
            message: "Steam is not installed on this machine.".to_string(),
        });
    }

    let should_restart = restart.unwrap_or(false);
    let was_running = process::is_steam_running();

    if should_restart && was_running {
        kill_steam_process();
        thread::sleep(Duration::from_millis(800));
    }

    let _ = sync_dlls_to_steam(&app, true);
    let _ = sync_syctool_to_appdata(&app, true);

    if !process::is_steam_running() {
        Command::new(&steam_exe)
            .current_dir(&steam_dir)
            .spawn()
            .map_err(|e| format!("Failed to start Steam: {}", e))?;
    }

    for _ in 0..30 {
        if let Some(uid) = get_steam_active_user() {
            let _ = process::open_steam_activate_product();
            return Ok(SteamLoginStatus {
                installed: true,
                running: true,
                logged_in: true,
                active_user_id: Some(uid),
                message: "Steam is running and logged in.".to_string(),
            });
        }
        thread::sleep(Duration::from_millis(500));
    }

    Ok(check_steam_login_status())
}

#[tauri::command]
pub fn open_steam_activate_product() -> Result<(), String> {
    process::open_steam_activate_product()
}

