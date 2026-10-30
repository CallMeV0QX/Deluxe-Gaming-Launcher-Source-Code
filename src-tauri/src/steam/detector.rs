use std::path::PathBuf;
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Detects the Steam installation directory by checking Windows Registry keys
/// (`HKCU\Software\Valve\Steam\SteamPath`, `HKLM\Software\WOW6432Node\Valve\Steam\InstallPath`,
/// `HKLM\Software\Valve\Steam\InstallPath`) and common fallback paths.
pub fn detect_steam_path() -> Option<PathBuf> {
    let registry_queries = [
        ("HKCU\\Software\\Valve\\Steam", "SteamPath"),
        ("HKLM\\Software\\WOW6432Node\\Valve\\Steam", "InstallPath"),
        ("HKLM\\Software\\Valve\\Steam", "InstallPath"),
    ];

    for (key, value_name) in registry_queries {
        if let Some(path_str) = query_registry_value(key, value_name) {
            let normalized = path_str.replace('/', "\\");
            let candidate = PathBuf::from(normalized);
            if candidate.join("steam.exe").is_file() {
                return Some(candidate);
            }
        }
    }

    let fallback_dirs = [
        r"C:\Program Files (x86)\Steam",
        r"C:\Program Files\Steam",
        r"D:\Steam",
        r"D:\Games\Steam",
        r"E:\Steam",
        r"F:\Steam",
    ];

    for dir in fallback_dirs {
        let candidate = PathBuf::from(dir);
        if candidate.join("steam.exe").is_file() {
            return Some(candidate);
        }
    }

    None
}

fn query_registry_value(key: &str, value_name: &str) -> Option<String> {
    let mut cmd = Command::new("reg");
    cmd.args(["query", key, "/v", value_name]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.output().ok()?;
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.contains(value_name) {
            if let Some(idx) = trimmed.find("REG_SZ") {
                let val = trimmed[idx + "REG_SZ".len()..].trim();
                if !val.is_empty() {
                    return Some(val.to_string());
                }
            }
        }
    }
    None
}

