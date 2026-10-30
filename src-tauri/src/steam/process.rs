use std::fs;
use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use super::detector::detect_steam_path;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Checks if `steam.exe` is currently running via `tasklist`.
pub fn is_steam_running() -> bool {
    let mut cmd = Command::new("tasklist");
    cmd.args(["/FI", "IMAGENAME eq steam.exe", "/NH"]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_lowercase();
            stdout.contains("steam.exe") && !stdout.contains("info:") && !stdout.contains("no tasks")
        }
        Err(_) => false,
    }
}

/// Terminates `steam.exe`, `steamwebhelper.exe`, and `GameOverlayUI.exe`, waiting until Steam exits.
pub fn kill_steam_process() {
    let processes = ["steam.exe", "steamwebhelper.exe", "GameOverlayUI.exe"];
    for proc_name in processes {
        let mut cmd = Command::new("taskkill");
        cmd.args(["/F", "/IM", proc_name]);
        #[cfg(target_os = "windows")]
        cmd.creation_flags(CREATE_NO_WINDOW);
        let _ = cmd.output();
    }

    for _ in 0..20 {
        if !is_steam_running() {
            break;
        }
        thread::sleep(Duration::from_millis(250));
    }
}

/// Kills and restarts the Steam process.
pub fn restart_steam_process() {
    kill_steam_process();
}

/// Clears Steam's saved auto-login user in the Registry and `config/loginusers.vdf`.
pub fn clear_steam_auto_login(steam_dir: &Path) {
    let mut reg_user = Command::new("reg");
    reg_user.args([
        "add",
        r"HKCU\Software\Valve\Steam",
        "/v",
        "AutoLoginUser",
        "/t",
        "REG_SZ",
        "/d",
        "",
        "/f",
    ]);
    #[cfg(target_os = "windows")]
    reg_user.creation_flags(CREATE_NO_WINDOW);
    let _ = reg_user.output();

    let mut reg_remember = Command::new("reg");
    reg_remember.args([
        "add",
        r"HKCU\Software\Valve\Steam",
        "/v",
        "RememberPassword",
        "/t",
        "REG_DWORD",
        "/d",
        "1",
        "/f",
    ]);
    #[cfg(target_os = "windows")]
    reg_remember.creation_flags(CREATE_NO_WINDOW);
    let _ = reg_remember.output();

    let vdf_path = steam_dir.join("config").join("loginusers.vdf");
    if vdf_path.is_file() {
        if let Ok(content) = fs::read_to_string(&vdf_path) {
            let updated = content
                .replace("\"RememberPassword\"\t\t\"1\"", "\"RememberPassword\"\t\t\"0\"")
                .replace("\"AutoLogin\"\t\t\"1\"", "\"AutoLogin\"\t\t\"0\"")
                .replace("\"MostRecent\"\t\t\"1\"", "\"MostRecent\"\t\t\"0\"");
            if let Err(err) = fs::write(&vdf_path, updated) {
                eprintln!("Failed to update loginusers.vdf: {}", err);
            } else {
                println!("Updated loginusers.vdf to disable auto-login.");
            }
        }
    }
}

/// Queries `HKCU\Software\Valve\Steam\ActiveProcess\ActiveUser` to determine if a Steam user is logged in.
pub fn get_steam_active_user() -> Option<u32> {
    let mut cmd = Command::new("reg");
    cmd.args([
        "query",
        r"HKCU\Software\Valve\Steam\ActiveProcess",
        "/v",
        "ActiveUser",
    ]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.output().ok()?;
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.contains("ActiveUser") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if let Some(raw_val) = parts.last() {
                let uid = if let Some(hex) = raw_val.strip_prefix("0x").or_else(|| raw_val.strip_prefix("0X")) {
                    u32::from_str_radix(hex, 16).ok()?
                } else {
                    raw_val.parse::<u32>().ok()?
                };
                if uid > 0 {
                    return Some(uid);
                }
            }
        }
    }
    None
}

/// Opens the Steam product activation dialog (`steam://open/activateproduct`).
pub fn open_steam_activate_product() -> Result<(), String> {
    let steam_dir = detect_steam_path().unwrap_or_else(|| Path::new(r"C:\Program Files (x86)\Steam").to_path_buf());
    let steam_exe = steam_dir.join("steam.exe");

    if steam_exe.is_file() {
        if Command::new(&steam_exe)
            .current_dir(&steam_dir)
            .arg("steam://open/activateproduct")
            .spawn()
            .is_ok()
        {
            return Ok(());
        }
    }

    Command::new("cmd")
        .args(["/c", "start", "", "steam://open/activateproduct"])
        .spawn()
        .map(|_| ())
        .map_err(|e| format!("Failed to open Steam activation window: {}", e))
}

