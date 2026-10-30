import { invoke } from "@tauri-apps/api/core";

export interface SteamLoginStatus {
  installed: boolean;
  running: boolean;
  logged_in: boolean;
  active_user_id: number | null;
  message: string;
}

export interface DllCopyResult {
  steam_path: string | null;
  copied_files: string[];
  skipped_files: string[];
  already_existing_files: string[];
  steam_found: boolean;
  steam_was_running: boolean;
  requires_steam_restart: boolean;
}

export interface SycCopyResult {
  syctool_dir: string | null;
  syctool_found: boolean;
  copied: boolean;
  already_existed: boolean;
  failed: boolean;
}

export const isTauriEnvironment = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const tauriCommands = {
  isSteamRunning: () => invoke<boolean>("is_steam_running"),

  loginSteamWithTimer: (params: {
    username: string;
    password: string;
    remainingSeconds: number;
  }) =>
    invoke<string>("login_steam_with_timer", {
      username: params.username,
      password: params.password,
      remainingSeconds: params.remainingSeconds,
    }),

  logoutAndCloseSteam: () => invoke<void>("logout_and_close_steam"),

  checkSteamLoginStatus: () =>
    invoke<SteamLoginStatus>("check_steam_login_status"),

  openSteamAndCheckLogin: (restart?: boolean) =>
    invoke<SteamLoginStatus>("open_steam_and_check_login", { restart }),

  openSteamActivateProduct: () => invoke<void>("open_steam_activate_product"),

  copyDllsToSteam: () => invoke<DllCopyResult>("copy_dlls_to_steam"),

  injectDllsToSteam: () => invoke<DllCopyResult>("inject_dlls_to_steam"),

  copySyctoolToAppdata: () =>
    invoke<SycCopyResult>("copy_syctool_to_appdata"),

  injectSyctoolToAppdata: () =>
    invoke<SycCopyResult>("inject_syctool_to_appdata"),

  getAppVersion: () => invoke<string>("plugin:app|version"),
};

