# BÁO CÁO PHÂN TÍCH KỸ THUẬT & BẰNG CHỨNG DỊCH NGƯỢC: DELUXE GAMING LAUNCHER (`v0.1.30`)

> **Mục đích tài liệu**: Báo cáo này tổng hợp toàn bộ bằng chứng kỹ thuật thu được từ quá trình dịch ngược (reverse engineer) bộ cài **Deluxe Gaming** (`tauri-app.exe`, các thư viện `.dll` gốc và gói tài nguyên ẩn `assets/syc`). Mọi nhận định trong báo cáo đều đính kèm **file gốc, bảng trích xuất mã máy (COFF Symbol Table / PE Export Table) và dòng code cụ thể** ngay trong repository này để bất kỳ ai cũng có thể tự kiểm chứng.

---

## BẢNG CHỈ MỤC NHANH CÁC BẰNG CHỨNG & FILE ĐỐI CHIẾU TRONG REPO

| STT | Nội dung cáo buộc / Điểm mờ ám | File bằng chứng gốc (Raw Artifacts) | File trích xuất / Mã nguồn đối chiếu ( kèm số dòng) |
| :--- | :--- | :--- | :--- |
| **1** | **Lập trình viên bỏ quên file tài liệu nội bộ** thừa nhận trình cài đặt NSIS tự động dò Registry để chép đè toàn bộ file `.dll` vào thư mục Steam của người dùng | [`./dlls/README.md`](./dlls/README.md#L1-L7) | Xem trực tiếp nội dung văn bản gốc tại [`./dlls/README.md`](./dlls/README.md#L1-L7) |
| **2** | **Key Steam không thể tự kích hoạt trên Steam nguyên bản**: Trước khi mở cửa sổ nhập key (`steam://open/activateproduct`), Launcher bắt buộc tắt Steam, tiêm bộ DLL + `syc` vào máy rồi mới mở lại Steam | `tauri-app.exe` (Bảng COFF Symbol Table tại offset `0x129d000`) | - Bản trích xuất COFF Disassembly: [`./evidence/coff_symbols_tauri_app_lib.txt`](./evidence/coff_symbols_tauri_app_lib.txt#L1142-L1203)<br>- Code Rust phục dựng: [`./src-tauri/src/steam/mod.rs`](./src-tauri/src/steam/mod.rs#L192-L246)<br>- Code JS gọi lệnh: [`./src/decompiled/screens_and_components.js`](./src/decompiled/screens_and_components.js#L5755-L5795) |
| **3** | **Kỹ thuật DLL Hijacking (`xinput1_4.dll`)**: Giả mạo thư viện hệ thống Windows đặt trong thư mục Steam để lén giải mã `%APPDATA%\syctool\syc` (`OST\x01` AES-256-CBC) ra `%TEMP%` và nạp vào `steam.exe` | - [`./dlls/xinput1_4.dll`](./dlls/xinput1_4.dll)<br>- [`./assets/syc`](./assets/syc)<br>- [`./syc_decrypted.dll`](./syc_decrypted.dll) | - Bản trích xuất chuỗi `.rdata` của `xinput1_4.dll`: [`./evidence/dll_exports_and_strings.txt`](./evidence/dll_exports_and_strings.txt#L25-L85)<br>- Code C++ phục dựng: [`./native/xinput1_4_proxy.cpp`](./native/xinput1_4_proxy.cpp#L61-L111)<br>- Script giải mã `syc`: [`./native/decrypt_syc.py`](./native/decrypt_syc.py#L1-L82) |
| **4** | **Giả mạo bản quyền game bằng VTable Hook (`cl.dll`, `ol.dll`, `syc_decrypted.dll`)**: Chứa 20 hàm xuất (`CR_AddApp`, `CR_SetApps`, `CR_InstallVtableHooks`, `CloudRedirect_CliMain`...) và Microsoft Detours (`.detourc`) để chèn lậu AppID vào Steam | - [`./dlls/cl.dll`](./dlls/cl.dll)<br>- [`./dlls/ol.dll`](./dlls/ol.dll)<br>- [`./syc_decrypted.dll`](./syc_decrypted.dll) | - Bảng PE Export 20 hàm của `cl.dll`: [`./evidence/dll_exports_and_strings.txt`](./evidence/dll_exports_and_strings.txt#L136-L174)<br>- Bảng Section `.detourc`/`.detourd` của `ol.dll` & `syc_decrypted.dll`: [`./evidence/dll_exports_and_strings.txt`](./evidence/dll_exports_and_strings.txt#L177-L220) |
| **5** | **Ngụy trang hành vi tiêm DLL bằng câu chữ đánh lừa người dùng**: Trong code đặt tên là `inject_dlls_to_steam` / `inject_syctool_to_appdata`, nhưng hiển thị trên nút bấm giao diện là *"Cập nhật API"* và *"Đồng bộ file hỗ trợ Steam"* | [`./dist/assets/index-DvLv_NJu.js`](./dist/assets/index-DvLv_NJu.js) | - Từ điển Tiếng Việt trích xuất: [`./src/i18n/locales/vi.json`](./src/i18n/locales/vi.json#L430-L449)<br>- Từ điển Tiếng Anh trích xuất: [`./src/i18n/locales/en.json`](./src/i18n/locales/en.json#L430-L449)<br>- Hook tự động chạy ngầm khi mở app: [`./src/hooks/useSteamSetup.ts`](./src/hooks/useSteamSetup.ts#L15-L120) |
| **6** | **Tự ý chỉnh sửa cấu hình đăng nhập & Registry của Steam**: Xóa `AutoLoginUser` trong Registry và sửa đổi file `<SteamPath>\config\loginusers.vdf` của người dùng | `tauri-app.exe` | - Bản trích xuất COFF Disassembly: [`./evidence/coff_symbols_tauri_app_lib.txt`](./evidence/coff_symbols_tauri_app_lib.txt#L1239-L1331)<br>- Code Rust phục dựng: [`./src-tauri/src/steam/process.rs`](./src-tauri/src/steam/process.rs#L55-L103) |

---

## CHI TIẾT TỪNG BẰNG CHỨNG KỸ THUẬT

### Bằng chứng 1: File [`dlls/README.md`](./dlls/README.md) do chính lập trình viên bỏ quên trong bộ cài đặt

Khi cài đặt Deluxe Gaming, bên trong thư mục `%LOCALAPPDATA%\Deluxe Gaming\dlls\` có chứa 3 file `.dll` (`xinput1_4.dll`, `cl.dll`, `ol.dll`) cùng với một file văn bản tên là **`README.md`** do lập trình viên để quên khi đóng gói bộ cài.

- **📂 File bằng chứng trực tiếp**: [`./dlls/README.md`](./dlls/README.md#L1-L7)

Toàn văn nội dung nguyên bản của file [`./dlls/README.md`](./dlls/README.md#L1-L7) (7 dòng):

```markdown
# DLL Resources Directory

Place all your `.dll` files that need to be packaged with the launcher and copied into the user's Steam installation directory here.

During installation, the NSIS installer will:
1. Detect the user's active Steam directory via Windows Registry (or fallback paths).
2. Automatically copy all `.dll` files from this folder into that Steam directory.
```

**Tạm dịch**:
> *"Thư mục tài nguyên DLL: Hãy đặt tất cả các file `.dll` cần đóng gói kèm với launcher và chép vào thư mục cài đặt Steam của người dùng tại đây. Trong quá trình cài đặt, bộ cài NSIS sẽ: 1. Dò tìm thư mục Steam đang hoạt động của người dùng qua Windows Registry (hoặc các đường dẫn dự phòng). 2. Tự động chép toàn bộ các file `.dll` từ thư mục này vào thư mục Steam đó."*

➡️ **Ý nghĩa**: Ngay từ lúc người dùng chạy file cài đặt Launcher (thậm chí chưa mở ứng dụng), trình cài đặt đã âm thầm dò tìm thư mục Steam và chép đè bộ 3 file `xinput1_4.dll`, `cl.dll`, `ol.dll` vào thư mục gốc của Steam mà không hề xin phép hay thông báo.

---

### Bằng chứng 2: Tại sao kích hoạt "Key Steam bản quyền" lại bắt buộc phải tiêm DLL vào Steam trước?

Một **Key Steam chính hãng** do Valve phát hành có thể được người dùng nhập trực tiếp vào ứng dụng Steam nguyên bản (qua menu *Games -> Activate a Product on Steam...*) hoặc kích hoạt trên trình duyệt tại `https://store.steampowered.com/account/registerkey` mà **không cần cài bất kỳ phần mềm hay file DLL nào**. Sau khi kích hoạt, game thuộc quyền sở hữu vĩnh viễn trên máy chủ Valve.

Thế nhưng, khi phân tích hàm **`open_steam_and_check_login`** của Deluxe Gaming (hàm được gọi khi người dùng bấm nút **"Kích hoạt / Chơi ngay"** đối với sản phẩm dạng **Key kích hoạt — `EXTERNAL_KEY` / `RANDOM_KEY`**):

- **📂 File bằng chứng trực tiếp**:
  1. Bản trích xuất mã máy COFF Symbol Table từ `tauri-app.exe`: [`./evidence/coff_symbols_tauri_app_lib.txt` (dòng 1142–1203)](./evidence/coff_symbols_tauri_app_lib.txt#L1142-L1203)
  2. Mã nguồn Rust phục dựng từ hàm `_RNvNtCs6aSyKyvMNeE_13tauri_app_lib5steam26open_steam_and_check_login`: [`./src-tauri/src/steam/mod.rs` (dòng 192–246)](./src-tauri/src/steam/mod.rs#L192-L246)
  3. Mã nguồn Rust thực hiện chép đè DLL vào Steam: [`./src-tauri/src/injection/dll.rs` (dòng 46–131)](./src-tauri/src/injection/dll.rs#L46-L131)
  4. Mã nguồn Rust thực hiện chép file mã hóa `syc` vào `%APPDATA%\syctool\syc`: [`./src-tauri/src/injection/syctool.rs` (dòng 57–110)](./src-tauri/src/injection/syctool.rs#L57-L110)

Trích đoạn từ [`./evidence/coff_symbols_tauri_app_lib.txt` (dòng 1142–1168)](./evidence/coff_symbols_tauri_app_lib.txt#L1142-L1168):

```text
==================== _RNvNtCs6aSyKyvMNeE_13tauri_app_lib5steam26open_steam_and_check_login (RVA=0x7db30, size=2336) ====================
  +0x0024 CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib5steam8detector17detect_steam_path
  ...
  +0x01bd CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib5steam7process16is_steam_running
  +0x01ca CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib5steam7process18kill_steam_process
  +0x01d8 CALL _RNvNtNtCs9qcQDiGWtgW_3std6thread9functions5sleep
  +0x01e6 CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection3dll18sync_dlls_to_steam
  +0x0244 CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection7syctool23sync_syctool_to_appdata
  ...
  +0x064f CALL _RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib5steam7process27open_steam_activate_product
```

Và mã nguồn tương ứng tại [`./src-tauri/src/steam/mod.rs` (dòng 210–239)](./src-tauri/src/steam/mod.rs#L210-L239):

```rust
    // 1. Nếu Steam đang chạy -> Cưỡng bức tắt tiến trình steam.exe
    if should_restart && was_running {
        kill_steam_process();
        thread::sleep(Duration::from_millis(800));
    }

    // 2. BẮT BUỘC chép đè bộ DLL (xinput1_4.dll, cl.dll, ol.dll) vào thư mục Steam
    //    và chép đè payload mã hóa (syc) vào %APPDATA%\syctool\syc TRƯỚC KHI mở Steam!
    let _ = sync_dlls_to_steam(&app, true);
    let _ = sync_syctool_to_appdata(&app, true);

    // 3. Khởi chạy lại steam.exe (lúc này steam.exe sẽ bị nạp xinput1_4.dll giả mạo)
    if !process::is_steam_running() {
        Command::new(&steam_exe)
            .current_dir(&steam_dir)
            .spawn()
            .map_err(|e| format!("Failed to start Steam: {}", e))?;
    }

    // 4. Đợi đăng nhập xong rồi mới mở cửa sổ nhập key: steam://open/activateproduct
    for _ in 0..30 {
        if let Some(uid) = get_steam_active_user() {
            let _ = process::open_steam_activate_product();
```

➡️ **Ý nghĩa**: Việc Launcher bắt buộc phải tắt Steam, tiêm `xinput1_4.dll`, `cl.dll`, `ol.dll` và `%APPDATA%\syctool\syc` vào trước rồi mới mở hộp thoại nhập Key chứng tỏ **mã Key mà Deluxe Gaming cung cấp không phải là Key Steam thật trên hệ thống của Valve**, mà chỉ có tác dụng khi tiến trình `steam.exe` đã bị bộ DLL của chúng khống chế.

---

### Bằng chứng 3: Phân tích [`dlls/xinput1_4.dll`](./dlls/xinput1_4.dll) và Payload mã hóa [`assets/syc`](./assets/syc) — Kỹ thuật DLL Hijacking nạp mã thực thi ẩn vào `steam.exe`

- **📂 File bằng chứng trực tiếp**:
  1. File DLL giả mạo thư viện hệ thống Windows: [`./dlls/xinput1_4.dll`](./dlls/xinput1_4.dll) (`SHA-256: 2fb034b85869266ebb662342d34691a03665987e73f5a37abac44b068c482561`)
  2. File Payload bị mã hóa `OST\x01`: [`./assets/syc`](./assets/syc) (13.252.660 bytes)
  3. File DLL thật sau khi giải mã từ `assets/syc`: [`./syc_decrypted.dll`](./syc_decrypted.dll) (13.252.608 bytes)
  4. Bản trích xuất các chuỗi văn bản ẩn trong `.rdata` của `xinput1_4.dll`: [`./evidence/dll_exports_and_strings.txt` (dòng 25–85)](./evidence/dll_exports_and_strings.txt#L25-L85)
  5. Mã nguồn C++ phục dựng `xinput1_4.dll`: [`./native/xinput1_4_proxy.cpp` (dòng 61–111)](./native/xinput1_4_proxy.cpp#L61-L111)
  6. Script Python giải mã `assets/syc`: [`./native/decrypt_syc.py`](./native/decrypt_syc.py)

Khi kiểm tra vùng dữ liệu `.rdata` của [`./dlls/xinput1_4.dll`](./dlls/xinput1_4.dll) (xem tại [`./evidence/dll_exports_and_strings.txt` dòng 38–85](./evidence/dll_exports_and_strings.txt#L38-L85)), toàn bộ nhật ký hoạt động của bộ nạp lén (`[DllLoader]`) hiện rõ:

```text
  steam.exe
  InitializeModule
  [DllLoader] 
  ERROR: %s
  appdata\roaming\syctool
  Part_C computed (SHA256 of path)
  Full key derived: Part_A XOR Part_B(from file) XOR Part_C
  AES-256-CBC decryption successful: %u bytes
  PE structure validated: Machine=0x%04X, Sections=%u
  Encrypted DLL path: %S
  CreateFileW failed for temp file: 0x%08X
  PE module loaded via LoadLibraryW: %p
  === LoadEncryptedDll started (v2.1 No HMAC) ===
  File magic verified: OST\x01
  File structure: Magic(4) + Part_B(32) + Ciphertext(%zu)
  === LoadEncryptedDll succeeded ===
```

**Cơ chế hoạt động**:
1. Khi `steam.exe` khởi động, Windows ưu tiên nạp `xinput1_4.dll` nằm cùng thư mục cài Steam thay vì `C:\Windows\System32\xinput1_4.dll` thật.
2. `xinput1_4.dll` kiểm tra nếu tiến trình đang chạy là `steam.exe` thì âm thầm đọc file `%APPDATA%\Roaming\syctool\syc` (chép từ [`./assets/syc`](./assets/syc)).
3. Nó kết hợp 3 mảnh khóa (`Part_A` nhúng cứng trong `xinput1_4.dll` XOR `Part_B` ở đầu file `syc` XOR `Part_C` là mã băm `SHA-256` của đường dẫn `"appdata\\roaming\\syctool"`) để tạo khóa `AES-256-CBC` (`7aaaadf1d1a710c5509a1e573922b6b74deb1dbedcdac8a344fb9b393bee81a9`).
4. Sau khi giải mã ra một file DLL nặng **13,25 MB** ([`./syc_decrypted.dll`](./syc_decrypted.dll)), nó ghi ra thư mục `%TEMP%`, gọi `LoadLibraryW` để tiêm thẳng vào bộ nhớ của `steam.exe`, rồi thực thi hàm `InitializeModule`.

---

### Bằng chứng 4: Bảng Export của [`dlls/cl.dll`](./dlls/cl.dll), [`dlls/ol.dll`](./dlls/ol.dll) và [`syc_decrypted.dll`](./syc_decrypted.dll) — Phơi bày công cụ Hook VTable, chèn lậu AppID và giả lập Steam Cloud

- **📂 File bằng chứng trực tiếp**:
  1. File `cl.dll` gốc: [`./dlls/cl.dll`](./dlls/cl.dll) (`SHA-256: 670de770d637fd85a9191833a4daf7893127389ac72a9fe602a71a5b31f28389`)
  2. File `ol.dll` gốc: [`./dlls/ol.dll`](./dlls/ol.dll) (`SHA-256: ef93181692a91b0e39a0839b98c7eec6cbc24e7f45ca5c650319fae7a4d751b7`)
  3. File `syc_decrypted.dll`: [`./syc_decrypted.dll`](./syc_decrypted.dll)
  4. Bản trích xuất PE Sections & Export Table của cả 3 file: [`./evidence/dll_exports_and_strings.txt` (dòng 135–221)](./evidence/dll_exports_and_strings.txt#L135-L221)

Mặc dù cả 3 file DLL này đều được đóng gói bằng trình bảo vệ thương mại **VMProtect** để chống dịch ngược và qua mặt phần mềm diệt virus, bảng **PE Section Header** và **PE Export Table** của chúng vẫn tố cáo toàn bộ chức năng bên trong:

1. **Sử dụng thư viện Microsoft Detours để Hook hàm trong bộ nhớ Steam**:
   Trong [`./evidence/dll_exports_and_strings.txt` (dòng 188–189 và 211–212)](./evidence/dll_exports_and_strings.txt#L188-L212), cả `ol.dll` và `syc_decrypted.dll` đều chứa 2 section `.detourc` và `.detourd` — chữ ký đặc trưng của thư viện **Microsoft Detours** dùng để chặn bắt và thay đổi luồng chạy của các hàm API trong bộ nhớ tiến trình.

2. **20 hàm xuất (Exports) của [`./dlls/cl.dll`](./dlls/cl.dll) (xem tại [`./evidence/dll_exports_and_strings.txt` dòng 153–174](./evidence/dll_exports_and_strings.txt#L153-L174))**:
   ```text
   01. RVA 0xe1600    CR_AddApp
   02. RVA 0xe1610    CR_DrainPlaytimeUpdates
   03. RVA 0xe1630    CR_EnableStatsSync
   04. RVA 0xe1670    CR_GetAchievements
   05. RVA 0xe1850    CR_GetPlaytime
   06. RVA 0xe18f0    CR_HandleCloudRpc
   07. RVA 0xe2430    CR_InitCloudSave
   08. RVA 0xe2760    CR_InstallGamesPlayedHookOnly
   09. RVA 0xe2790    CR_InstallVtableHooks
   10. RVA 0xe27c0    CR_IsApp
   11. RVA 0xe27d0    CR_NotifyAppRunning
   12. RVA 0xe2850    CR_NotifyStatsStored
   13. RVA 0xe28b0    CR_NotifyStatsStoredFrom
   14. RVA 0xe2910    CR_RemoveApp
   15. RVA 0xe2950    CR_SetAccountId
   16. RVA 0xe2960    CR_SetApps
   17. RVA 0xe2a90    CR_SetFunctionTable
   18. RVA 0xe2c70    CR_Shutdown
   19. RVA 0xe0e90    CloudOnSendPkt
   20. RVA 0x9d750    CloudRedirect_CliMain
   ```
   - **`CR_AddApp`, `CR_SetApps`, `CR_RemoveApp`, `CR_IsApp`**: Chèn trái phép mã AppID của game vào bộ nhớ Steam Client để hiển thị game trong Library dù tài khoản Steam của người dùng không hề mua hay sở hữu bản quyền game đó trên máy chủ Valve.
   - **`CR_InstallVtableHooks`, `CR_InstallGamesPlayedHookOnly`**: Cài đặt C++ VTable Hooks vào các interface nội bộ của Steam Client để đánh lừa cơ chế kiểm tra bản quyền.
   - **`CloudRedirect_CliMain`, `CloudOnSendPkt`, `CR_InitCloudSave`, `CR_GetPlaytime`, `CR_GetAchievements`**: Vì tài khoản của người dùng thực chất không sở hữu game trên hệ thống của Valve nên máy chủ Steam sẽ từ chối lưu Cloud Save và thành tựu. Do đó, `cl.dll` phải chặn các gói tin mạng (`CloudOnSendPkt`) để chuyển hướng (redirect) dữ liệu save game, giờ chơi và achievement!

---

### Bằng chứng 5: Đánh tráo câu chữ trên giao diện người dùng (Gọi `inject_dlls_to_steam` nhưng hiển thị là *"Cập nhật API"* / *"File hỗ trợ game"*)

- **📂 File bằng chứng trực tiếp**:
  1. File ngôn ngữ Tiếng Việt trích xuất từ bundle: [`./src/i18n/locales/vi.json` (dòng 430–449)](./src/i18n/locales/vi.json#L430-L449)
  2. File ngôn ngữ Tiếng Anh trích xuất từ bundle: [`./src/i18n/locales/en.json` (dòng 430–449)](./src/i18n/locales/en.json#L430-L449)
  3. Hook tự động chạy ngầm khi mở ứng dụng: [`./src/hooks/useSteamSetup.ts` (dòng 15–120)](./src/hooks/useSteamSetup.ts#L15-L120)
  4. Mã nguồn gốc trong bundle JS: [`./src/decompiled/screens_and_components.js` (dòng 245–330)](./src/decompiled/screens_and_components.js#L245-L330)

Trong [`./src/hooks/useSteamSetup.ts`](./src/hooks/useSteamSetup.ts#L19-L22), khi người dùng bấm nút hoặc khi ứng dụng vừa mở lên, code gọi trực tiếp các lệnh:
- `inject_dlls_to_steam` / `copy_dlls_to_steam`
- `inject_syctool_to_appdata` / `copy_syctool_to_appdata`
- Log nội bộ trong Console ghi rõ: `"[SteamSetup] Steam is running with pending injection files, prompting user."` và `"[Syctool] Failed to inject syc:"`

Tuy nhiên, trong file [`./src/i18n/locales/vi.json` (dòng 430–449)](./src/i18n/locales/vi.json#L430-L449), toàn bộ các thông báo hiển thị cho khách hàng đều bị tráo đổi thành thuật ngữ vô hại:

```json
  "steamSetup": {
    "copying": "Đang cài đặt các file game cần thiết...",
    "successWithPath": "Đã cài đặt file game vào thư mục Steam thành công.",
    "steamNotFound": "Không tìm thấy cài đặt Steam. File game sẽ được cài đặt tự động khi phát hiện Steam.",
    "partialSuccess": "Một số file game không thể sao chép: {{files}}",
    "error": "Không thể cài đặt file game: {{message}}",
    "injectBtn": "Cập nhật API",
    "injecting": "Đang cập nhật API...",
    "injectSuccess": "Đã cập nhật API thành công!",
    "injectNoSteam": "Không tìm thấy Steam. Vui lòng cài đặt Steam trước.",
    "injectNoTauri": "Tính năng này chỉ khả dụng trong ứng dụng desktop.",
    "injectFailed": "Không thể cập nhật API: {{message}}",
    "restartModalTitle": "Đồng bộ file hỗ trợ Steam",
    "restartModalDesc": "Phát hiện Steam đang mở nên chưa thể đồng bộ đầy đủ các file hỗ trợ game. Bạn có muốn Launcher tự động đóng và khởi động lại Steam để áp dụng ngay không?",
    "restartModalConfirm": "Khởi động lại Steam ngay",
    "restartModalDismiss": "Để sau",
    "restartModalSuccess": "Đã đồng bộ file hỗ trợ và khởi động lại Steam thành công!",
    "restartModalError": "Không thể khởi động lại Steam: {{message}}"
  },
```

---

### Bằng chứng 6: Tự ý xóa cấu hình đăng nhập trong Registry và chỉnh sửa file `loginusers.vdf` của Steam

- **📂 File bằng chứng trực tiếp**:
  1. Bản trích xuất COFF Disassembly của hàm `clear_steam_auto_login`: [`./evidence/coff_symbols_tauri_app_lib.txt` (dòng 1239–1331)](./evidence/coff_symbols_tauri_app_lib.txt#L1239-L1331)
  2. Mã nguồn Rust phục dựng: [`./src-tauri/src/steam/process.rs` (dòng 55–103)](./src-tauri/src/steam/process.rs#L55-L103)

Hàm `clear_steam_auto_login` tự ý chạy lệnh ngầm `reg add HKCU\Software\Valve\Steam /v AutoLoginUser /t REG_SZ /d "" /f` và mở trực tiếp file `<SteamPath>\config\loginusers.vdf` của người dùng để ghi đè `"RememberPassword" "1"` thành `"0"` và `"AutoLogin" "1"` thành `"0"`.

---

## HƯỚNG DẪN TỰ KIỂM CHỨNG CHO CỘNG ĐỒNG

Bất kỳ ai cũng có thể tự kiểm chứng các bằng chứng trên bằng những cách đơn giản sau:

1. **Kiểm tra thư mục cài đặt Steam (`C:\Program Files (x86)\Steam`) sau khi cài/mở Deluxe Gaming**:
   - Sẽ thấy xuất hiện 3 file lạ: `xinput1_4.dll` (27 KB), `cl.dll` (~3.7 MB - 8.9 MB) và `ol.dll` (~1.4 MB - 12.8 MB).
   - Kiểm tra thư mục `%APPDATA%\syctool\` sẽ thấy file `syc` (~13.25 MB) bắt đầu bằng 4 byte `OST\x01`.
2. **Thử kích hoạt "Key Steam" của Deluxe Gaming trên trình duyệt chính thức của Valve**:
   - Truy cập trang kích hoạt key chính thức của Steam tại: `https://store.steampowered.com/account/registerkey`
   - Dán mã Key do Deluxe Gaming cung cấp vào: Hệ thống của Valve sẽ lập tức báo **Key không hợp lệ (Invalid Product Code)** vì mã đó không hề tồn tại trên máy chủ Steam.
3. **Chạy thử công cụ giải mã `assets/syc`**:
   - Chạy lệnh `python native/decrypt_syc.py` để tự tay giải mã file `assets/syc` ra `syc_decrypted.dll` và mở bằng các công cụ phân tích PE (như CFF Explorer, Detect It Easy, IDA, Ghidra) để xem các section `.detourc`, `.detourd` và VMProtect.
