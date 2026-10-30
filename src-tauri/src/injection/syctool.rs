use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SycCopyResult {
    pub syctool_dir: Option<String>,
    pub syctool_found: bool,
    pub copied: bool,
    pub already_existed: bool,
    pub failed: bool,
}

pub fn find_syc_binary(app: &AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();

    if let Ok(res_dir) = app.path().resource_dir() {
        candidates.push(res_dir.join("assets").join("syc"));
        candidates.push(res_dir.join("syc"));
        candidates.push(res_dir.join("resources").join("assets").join("syc"));
    }
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join("assets").join("syc"));
            candidates.push(exe_dir.join("syc"));
            candidates.push(exe_dir.join("resources").join("assets").join("syc"));
        }
    }
    candidates.push(PathBuf::from("assets/syc"));
    candidates.push(PathBuf::from("src-tauri/assets/syc"));
    candidates.push(PathBuf::from("../src-tauri/assets/syc"));

    if let Some(found) = candidates.into_iter().find(|p| p.is_file()) {
        Ok(found)
    } else {
        Err("syc binary not found in any expected location".to_string())
    }
}

fn resolve_syctool_appdata_dir() -> Option<PathBuf> {
    if let Ok(appdata) = std::env::var("APPDATA") {
        return Some(PathBuf::from(appdata).join("syctool"));
    }
    if let Ok(userprofile) = std::env::var("USERPROFILE") {
        return Some(
            PathBuf::from(userprofile)
                .join("AppData")
                .join("Roaming")
                .join("syctool"),
        );
    }
    if let Ok(localappdata) = std::env::var("LOCALAPPDATA") {
        return Some(PathBuf::from(localappdata).join("syctool"));
    }
    None
}

pub fn sync_syctool_to_appdata(
    app: &AppHandle,
    force_overwrite: bool,
) -> Result<SycCopyResult, String> {
    let Some(syctool_dir) = resolve_syctool_appdata_dir() else {
        return Ok(SycCopyResult {
            syctool_dir: None,
            syctool_found: false,
            copied: false,
            already_existed: false,
            failed: false,
        });
    };

    if !syctool_dir.exists() {
        if let Err(e) = fs::create_dir_all(&syctool_dir) {
            return Err(format!("Failed to create syctool directory: {}", e));
        }
    }

    let src_syc = find_syc_binary(app)?;
    let dst_syc = syctool_dir.join("syc");
    let already_existed = dst_syc.exists();

    if already_existed && !force_overwrite {
        return Ok(SycCopyResult {
            syctool_dir: Some(syctool_dir.to_string_lossy().to_string()),
            syctool_found: true,
            copied: false,
            already_existed: true,
            failed: false,
        });
    }

    match fs::copy(&src_syc, &dst_syc) {
        Ok(_) => Ok(SycCopyResult {
            syctool_dir: Some(syctool_dir.to_string_lossy().to_string()),
            syctool_found: true,
            copied: true,
            already_existed,
            failed: false,
        }),
        Err(_) => Ok(SycCopyResult {
            syctool_dir: Some(syctool_dir.to_string_lossy().to_string()),
            syctool_found: true,
            copied: false,
            already_existed,
            failed: true,
        }),
    }
}

#[tauri::command]
pub fn copy_syctool_to_appdata(app: AppHandle) -> Result<SycCopyResult, String> {
    sync_syctool_to_appdata(&app, false)
}

#[tauri::command]
pub fn inject_syctool_to_appdata(app: AppHandle) -> Result<SycCopyResult, String> {
    sync_syctool_to_appdata(&app, true)
}

