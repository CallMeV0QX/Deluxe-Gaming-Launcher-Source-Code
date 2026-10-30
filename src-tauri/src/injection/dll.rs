use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Manager};

use crate::steam::detector::detect_steam_path;
use crate::steam::process::{is_steam_running, kill_steam_process};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DllCopyResult {
    pub steam_path: Option<String>,
    pub copied_files: Vec<String>,
    pub skipped_files: Vec<String>,
    pub already_existing_files: Vec<String>,
    pub steam_found: bool,
    pub steam_was_running: bool,
    pub requires_steam_restart: bool,
}

fn find_dlls_source_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();

    if let Ok(res_dir) = app.path().resource_dir() {
        candidates.push(res_dir.join("dlls"));
        candidates.push(res_dir.join("resources").join("dlls"));
    }
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join("dlls"));
            candidates.push(exe_dir.join("resources").join("dlls"));
        }
    }
    candidates.push(PathBuf::from("dlls"));
    candidates.push(PathBuf::from("src-tauri/dlls"));
    candidates.push(PathBuf::from("../src-tauri/dlls"));

    for candidate in &candidates {
        if candidate.is_dir() {
            return Ok(candidate.clone());
        }
    }

    Err(format!("DLLs directory not found in: {:?}", candidates))
}

pub fn sync_dlls_to_steam(app: &AppHandle, force_overwrite: bool) -> Result<DllCopyResult, String> {
    let Some(steam_dir) = detect_steam_path() else {
        return Ok(DllCopyResult {
            steam_path: None,
            copied_files: Vec::new(),
            skipped_files: Vec::new(),
            already_existing_files: Vec::new(),
            steam_found: false,
            steam_was_running: false,
            requires_steam_restart: false,
        });
    };

    let dlls_dir = find_dlls_source_dir(app)?;
    let entries = fs::read_dir(&dlls_dir)
        .map_err(|e| format!("Failed to read dlls directory: {}", e))?;

    let steam_was_running = is_steam_running();
    if force_overwrite && steam_was_running {
        kill_steam_process();
        thread::sleep(Duration::from_millis(800));
    }

    let mut copied_files = Vec::new();
    let mut skipped_files = Vec::new();
    let mut already_existing_files = Vec::new();
    let mut requires_steam_restart = false;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let src_path = entry.path();
        if !src_path.is_file() {
            continue;
        }
        let is_dll = src_path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("dll"))
            .unwrap_or(false);
        if !is_dll {
            continue;
        }

        let file_name = entry.file_name().to_string_lossy().to_string();
        let dst_path = steam_dir.join(&file_name);
        let existed = dst_path.exists();

        if existed && !force_overwrite {
            already_existing_files.push(file_name.clone());
            if steam_was_running {
                requires_steam_restart = true;
                continue;
            }
        }

        match fs::copy(&src_path, &dst_path) {
            Ok(_) => copied_files.push(file_name),
            Err(_) => {
                if steam_was_running && !force_overwrite {
                    requires_steam_restart = true;
                }
                skipped_files.push(file_name);
            }
        }
    }

    if force_overwrite && steam_was_running {
        let steam_exe = steam_dir.join("steam.exe");
        if steam_exe.is_file() {
            Command::new(&steam_exe)
                .current_dir(&steam_dir)
                .spawn()
                .map_err(|e| format!("Failed to restart Steam: {}", e))?;
        }
    }

    Ok(DllCopyResult {
        steam_path: Some(steam_dir.to_string_lossy().to_string()),
        copied_files,
        skipped_files,
        already_existing_files,
        steam_found: true,
        steam_was_running,
        requires_steam_restart,
    })
}

#[tauri::command]
pub fn copy_dlls_to_steam(app: AppHandle) -> Result<DllCopyResult, String> {
    sync_dlls_to_steam(&app, false)
}

#[tauri::command]
pub fn inject_dlls_to_steam(app: AppHandle) -> Result<DllCopyResult, String> {
    sync_dlls_to_steam(&app, true)
}

