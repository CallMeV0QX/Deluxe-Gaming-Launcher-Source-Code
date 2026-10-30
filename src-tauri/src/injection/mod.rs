pub mod dll;
pub mod syctool;

pub use dll::{copy_dlls_to_steam, inject_dlls_to_steam, DllCopyResult};
pub use syctool::{copy_syctool_to_appdata, inject_syctool_to_appdata, SycCopyResult};

