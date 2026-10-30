# BÁO CÁO PHÂN TÍCH KỸ THUẬT & BẰNG CHỨNG DỊCH NGƯỢC: DELUXE GAMING LAUNCHER (`v0.1.30`)

> **Mục đích tài liệu**: Báo cáo này tổng hợp toàn bộ bằng chứng kỹ thuật thu được từ quá trình dịch ngược (reverse engineer) bộ cài **Deluxe Gaming** (`tauri-app.exe`, các thư viện `.dll` đi kèm và gói tài nguyên ẩn `assets/syc`). Kết quả phân tích chứng minh **Deluxe Gaming không cung cấp Key Steam bản quyền chính hãng từ Valve**, mà thực hiện hành vi **DLL Hijacking (tiêm mã độc/công cụ bẻ khóa vào tiến trình `steam.exe`)** để giả mạo việc kích hoạt key và đánh lừa người dùng.

---

## TÓM TẮT KẾT LUẬN (EXECUTIVE SUMMARY)

Trên giao diện ứng dụng, **Deluxe Gaming** quảng cáo cam kết **"Bản quyền 100%"** (`auth.security.genuine: "Bản quyền 100%"`) và bán các sản phẩm dưới danh nghĩa **"Key kích hoạt Steam" (`EXTERNAL_KEY` / `RANDOM_KEY`)**.

Tuy nhiên, đối chiếu trực tiếp mã máy của file thực thi `tauri-app.exe` (vốn **không bị xóa bảng ký hiệu COFF Symbol Table** gồm 67.121 symbols), mã nguồn Frontend JavaScript (`dist/assets/index-DvLv_NJu.js`) và 4 thư viện thực thi (`dlls/xinput1_4.dll`, `dlls/cl.dll`, `dlls/ol.dll`, `assets/syc`) cho thấy sự thật hoàn toàn ngược lại:

1. **Key Steam do Deluxe Gaming cung cấp là Key giả (Fake Activation / Local Hook)**:
   - Một Key Steam chính hãng do Valve phát hành có thể kích hoạt trực tiếp trên bất kỳ máy tính nào hoặc trên trình duyệt mà **không cần cài đặt phần mềm thứ ba**, và sau khi kích hoạt, game sẽ vĩnh viễn nằm trong tài khoản Steam trên máy chủ Valve (hiển thị trên điện thoại, web `store.steampowered.com` và mọi máy tính khác).
   - Ngược lại, key của Deluxe Gaming **chỉ "kích hoạt" được sau khi Launcher âm thầm chép đè 3 file DLL (`xinput1_4.dll`, `cl.dll`, `ol.dll`) vào thư mục cài đặt Steam và giải mã một file thực thi ẩn (`%APPDATA%\syctool\syc`) nạp thẳng vào bộ nhớ của `steam.exe`**.
   - Các file DLL này sử dụng kỹ thuật **VTable Hooking & Detours** (`CR_AddApp`, `CR_SetApps`, `CR_InstallVtableHooks`, `CloudRedirect_CliMain`) để **chặn bắt (intercept) hộp thoại nhập Key của Steam và giả lập danh sách sở hữu game cục bộ trên máy tính đó**. Nếu gỡ bỏ các file DLL này hoặc đăng nhập tài khoản Steam sang máy tính khác/điện thoại, game hoàn toàn biến mất hoặc không thể tải/chơi.

2. **Hành vi mờ ám, ngụy trang và qua mặt người dùng**:
   - Ngay khi khởi động Launcher (thậm chí trước khi người dùng bấm mua hay kích hoạt bất kỳ cái gì), hàm khởi tạo tự động gọi lệnh ngầm `copy_dlls_to_steam` và `copy_syctool_to_appdata` để lén thả các file can thiệp vào thư mục cài đặt Steam (`C:\Program Files (x86)\Steam`) và `%APPDATA%\syctool\syc`.
   - Trong từ điển ngôn ngữ (`src/i18n/locales/vi.json`), hành vi tiêm DLL (`inject_dlls_to_steam`) được ngụy trang dưới những tên gọi đánh lừa người dùng phổ thông như **"Cập nhật API"**, **"Đang cài đặt các file game cần thiết..."**, hoặc **"Đồng bộ file hỗ trợ Steam"**.
   - Thậm chí trong bộ cài đặt chính thức, lập trình viên còn bỏ quên file hướng dẫn nội bộ `dlls/README.md` thừa nhận toàn bộ các file `.dll` trong thư mục này được đóng gói để tự động chép đè vào thư mục Steam của người dùng ngay từ lúc chạy trình cài đặt NSIS.

---

## CHI TIẾT 6 BẰNG CHỨNG KỸ THUẬT KHÔNG THỂ CHỐI CÃI

### Bằng chứng 1: Tại sao kích hoạt "Key Steam bản quyền" lại bắt buộc phải tiêm DLL vào thư mục Steam?

Trong mã nguồn Rust của `tauri-app.exe`, tác giả không xóa bảng **COFF Symbol Table** (nằm tại file offset `0x129d000`), để lộ nguyên vẹn tên các module và hàm xử lý bên trong:

- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection3dll18sync_dlls_to_steam` (`src-tauri/src/injection/dll.rs`)
- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection3dll18copy_dlls_to_steam`
- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection3dll20inject_dlls_to_steam`
- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection7syctool23sync_syctool_to_appdata` (`src-tauri/src/injection/syctool.rs`)
- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection7syctool23copy_syctool_to_appdata`
- `_RNvNtNtCs6aSyKyvMNeE_13tauri_app_lib9injection7syctool25inject_syctool_to_appdata`

Đặc biệt, hãy xem hàm **`open_steam_and_check_login`** (`src-tauri/src/steam/mod.rs`) — hàm được gọi khi người dùng bấm nút **"Kích hoạt / Chơi ngay"** đối với sản phẩm loại **Key kích hoạt (`EXTERNAL_KEY` / `RANDOM_KEY`)**:

```rust
// Phục dựng từ hàm _RNvNtCs6aSyKyvMNeE_13tauri_app_lib5steam26open_steam_and_check_login
#[tauri::command]
pub fn open_steam_and_check_login(
    app: AppHandle,
    restart: Option<bool>,
) -> Result<SteamLoginStatus, String> {
    // ...
    // 1. Nếu restart = true và Steam đang chạy -> Cưỡng bức tắt tiến trình steam.exe
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
        Command::new(&steam_exe).current_dir(&steam_dir).spawn()?;
    }

    // 4. Đợi đăng nhập xong rồi mới mở cửa sổ nhập key: steam://open/activateproduct
    for _ in 0..30 {
        if let Some(uid) = get_steam_active_user() {
            let _ = process::open_steam_activate_product();
            // ...
        }
        thread::sleep(Duration::from_millis(500));
    }
    // ...
}
```

> **Câu hỏi đặt ra**: Nếu đây là Key Steam chính hãng, tại sao trước khi mở cửa sổ `steam://open/activateproduct` để người dùng dán key, Launcher lại phải **tắt Steam đi, chép đè `xinput1_4.dll`, `cl.dll`, `ol.dll` vào thư mục Steam và `syc` vào `%APPDATA%\syctool` rồi mới mở lại Steam**?
> Bởi vì nếu chạy trên một tiến trình `steam.exe` nguyên bản (chưa bị tiêm DLL), máy chủ của Valve sẽ báo mã Key đó không hợp lệ hoặc không tồn tại!

---

### Bằng chứng 2: Kỹ thuật DLL Hijacking qua `xinput1_4.dll` và Payload ẩn `assets/syc`

Khi mở thư mục `dlls/` của bộ cài Deluxe Gaming, có 3 file DLL:
1. `xinput1_4.dll` (27.648 bytes)
2. `cl.dll` (8.979.016 bytes)
3. `ol.dll` (12.870.656 bytes)

`xinput1_4.dll` vốn là tên một thư viện hệ thống của Microsoft Windows (`C:\Windows\System32\xinput1_4.dll` — dùng cho tay cầm Xbox/DirectX). Khi `steam.exe` khởi động, nó tìm nạp `xinput1_4.dll`. Lợi dụng cơ chế **DLL Search Order Hijacking** của Windows, Deluxe Gaming chép một file `xinput1_4.dll` giả mạo vào ngay thư mục gốc của Steam (`C:\Program Files (x86)\Steam\xinput1_4.dll`) để ép `steam.exe` phải chạy mã của chúng mỗi khi mở Steam.

Kết quả dịch ngược file `dlls/xinput1_4.dll` (xem mã nguồn phục dựng tại [`native/xinput1_4_proxy.cpp`](./native/xinput1_4_proxy.cpp)) cho thấy:
- Nó chuyển tiếp (forward) 7 hàm `XInput*` về `System32\xinput1_4.dll` thật để tránh làm lỗi Steam.
- Trong `DllMain`, nó kiểm tra xem tiến trình hiện tại có phải là **`steam.exe`** hay không.
- Nếu đúng là `steam.exe`, nó tìm đọc file ẩn tại **`%APPDATA%\Roaming\syctool\syc`** (được chép từ `assets/syc`, nặng **13,25 MB**).
- Các chuỗi log debug còn nguyên trong `.rdata` của `xinput1_4.dll` (offset `0x5000`) phơi bày toàn bộ quá trình nạp lén DLL đã mã hóa:
  ```text
  steam.exe
  InitializeModule
  [DllLoader]
  appdata\roaming\syctool
  === LoadEncryptedDll started (v2.1 No HMAC) ===
  File magic verified: OST\x01
  File structure: Magic(4) + Part_B(32) + Ciphertext(%zu)
  Part_C computed (SHA256 of path)
  Full key derived: Part_A XOR Part_B(from file) XOR Part_C
  AES-256-CBC decryption successful: %u bytes
  PE structure validated: Machine=0x%04X, Sections=%u
  PE module loaded via LoadLibraryW: %p
  === LoadEncryptedDll succeeded ===
  ```
- Sau khi giải mã khối dữ liệu `AES-256-CBC` từ `%APPDATA%\syctool\syc`, `xinput1_4.dll` ghi ra một file `.tmp` trong thư mục `%TEMP%`, gọi `LoadLibraryW` để tiêm thẳng DLL 13,25 MB này (`syc_decrypted.dll`) vào không gian bộ nhớ của `steam.exe`, rồi gọi hàm `InitializeModule`.

---

### Bằng chứng 3: Giải mã `assets/syc` (`syc_decrypted.dll`), `cl.dll` và `ol.dll` — Công cụ Hook VTable & Giả mạo AppID trên Steam

Bằng cách trích xuất 3 thành phần khóa từ `xinput1_4.dll` và `assets/syc` (xem công cụ giải mã [`native/decrypt_syc.py`](./native/decrypt_syc.py)):
- **`Part_A`** (nhúng cứng tại RVA `0x3E78` trong `xinput1_4.dll`): `135b2dc031663eaf096a87c79f80b689ddccb9b9f61c056c01de9cdc4b861b0d`
- **`Part_B`** (32 bytes đầu của `assets/syc`): `597101f44517033a1d32ae3bc0d30eb9596ef93d6fc8fdcd4ba3c431f80e4696`
- **`Part_C`** (`SHA256(UTF-16LE("appdata\\roaming\\syctool"))`): `328281c5bbde2d5044ae35ab6971b687c7021d3855d212a30ef853348905dc3c`
- **Khóa giải mã AES-256 (`Part_A ^ Part_B ^ Part_C`)**: `7aaaadf1d1a710c5509a1e573922b6b74deb1dbedcdac8a344fb9b393bee81a9`

Sau khi giải mã `assets/syc` thành [`syc_decrypted.dll`](./syc_decrypted.dll) và kiểm tra bảng PE Header / Export Table của cả 3 module (`syc_decrypted.dll`, `cl.dll`, `ol.dll`), ta thu được bằng chứng trực diện:

1. **Cả 3 file `syc_decrypted.dll` (13,25 MB), `cl.dll` (8,97 MB) và `ol.dll` (12,87 MB) đều bị đóng gói/làm rối bằng VMProtect** để trốn tránh phần mềm diệt virus và che giấu mã nguồn, đồng thời chứa các section đặc trưng của thư viện **Microsoft Detours** (`.detourc`, `.detourd`) chuyên dùng để hook (chặn sửa) hàm API trong bộ nhớ tiến trình khác.
2. **Bảng Export của `dlls/cl.dll` để lộ rõ 20 hàm can thiệp trực tiếp vào Steam Client**:
   ```text
   CR_AddApp
   CR_RemoveApp
   CR_SetApps
   CR_IsApp
   CR_SetAccountId
   CR_SetFunctionTable
   CR_InstallVtableHooks
   CR_InstallGamesPlayedHookOnly
   CR_NotifyAppRunning
   CR_InitCloudSave
   CR_HandleCloudRpc
   CloudOnSendPkt
   CloudRedirect_CliMain
   CR_DrainPlaytimeUpdates
   CR_EnableStatsSync
   CR_GetAchievements
   CR_GetPlaytime
   CR_NotifyStatsStored
   CR_NotifyStatsStoredFrom
   CR_Shutdown
   ```
   Ý nghĩa của các hàm trên:
   - `CR_AddApp`, `CR_SetApps`, `CR_IsApp`: **Chèn trái phép AppID của game vào danh sách thư viện Steam cục bộ** (tương tự cơ chế của SteamTools / GreenLuma), biến một tài khoản Steam trắng (không hề sở hữu game trên máy chủ Valve) thành có game trong Library trên máy tính đang chạy DLL.
   - `CR_InstallVtableHooks`, `CR_InstallGamesPlayedHookOnly`: **Cài đặt VTable Hooks vào các interface nội bộ của Steam Client (`ISteamClient`, `ISteamUser`, `ISteamApps`)** để đánh lừa Steam và game rằng tài khoản hiện tại có bản quyền hợp lệ.
   - `CloudRedirect_CliMain`, `CloudOnSendPkt`, `CR_InitCloudSave`, `CR_GetPlaytime`, `CR_GetAchievements`: Vì tài khoản thực chất **không hề sở hữu game trên máy chủ Steam**, nên Steam Cloud, thời gian chơi (Playtime) và thành tựu (Achievements) chính thức của Valve sẽ từ chối hoạt động. Do đó, `cl.dll` phải chặn các gói tin mạng (`CloudOnSendPkt`) và chuyển hướng (redirect) toàn bộ dữ liệu save/playtime/achievement sang hệ thống giả lập riêng!

---

### Bằng chứng 4: Ngụy trang hành vi tiêm mã độc bằng thông báo giả tạo ("Cập nhật API", "File hỗ trợ game")

Trong mã nguồn Frontend ([`src/hooks/useSteamSetup.ts`](./src/hooks/useSteamSetup.ts) và [`src/i18n/locales/vi.json`](./src/i18n/locales/vi.json)), Deluxe Gaming cố tình che giấu tên thật của hành vi tiêm DLL:

- Trong code nội bộ, các hàm và biến được lập trình viên đặt tên đúng với bản chất:
  - `inject_dlls_to_steam`
  - `inject_syctool_to_appdata`
  - `"[SteamSetup] Steam is running with pending injection files, prompting user."`
  - `"[Syctool] Failed to inject syc:"`
- Nhưng khi hiển thị ra giao diện cho khách hàng (`vi.json`), chúng được dịch thành những câu chữ hoàn toàn vô hại nhằm đánh lừa người dùng bấm đồng ý:
  ```json
  "steamSetup": {
    "copying": "Đang cài đặt các file game cần thiết...",
    "successWithPath": "Đã cài đặt file game vào thư mục Steam thành công.",
    "injectBtn": "Cập nhật API",
    "injecting": "Đang cập nhật API...",
    "injectSuccess": "Đã cập nhật API thành công!",
    "restartModalTitle": "Đồng bộ file hỗ trợ Steam",
    "restartModalDesc": "Phát hiện Steam đang mở nên chưa thể đồng bộ đầy đủ các file hỗ trợ game. Bạn có muốn Launcher tự động đóng và khởi động lại Steam để áp dụng ngay không?",
    "restartModalConfirm": "Khởi động lại Steam ngay"
  }
  ```
- Khi người dùng tưởng rằng mình chỉ đang bấm **"Cập nhật API"** hoặc **"Đồng bộ file hỗ trợ Steam"**, thực chất họ đang cho phép Launcher tắt Steam, chép đè `xinput1_4.dll`, `cl.dll`, `ol.dll` vào thư mục cài đặt Steam và nạp `syc` vào `%APPDATA%\syctool\syc`.

---

### Bằng chứng 5: Tự ý can thiệp vào cấu hình bảo mật và Registry của Steam

Trong [`src-tauri/src/steam/process.rs`](./src-tauri/src/steam/process.rs), hàm `clear_steam_auto_login` thực hiện:
1. Chạy lệnh `reg add HKCU\Software\Valve\Steam /v AutoLoginUser /t REG_SZ /d "" /f` để xóa tài khoản tự động đăng nhập của người dùng.
2. Đọc trực tiếp file cấu hình nhạy cảm của Steam tại `<SteamPath>\config\loginusers.vdf` và sửa đổi toàn bộ cấu hình lưu đăng nhập (`"RememberPassword" "1"` -> `"0"`, `"AutoLogin" "1"` -> `"0"`, `"MostRecent" "1"` -> `"0"`).
3. Rà quét khóa Registry `HKCU\Software\Valve\Steam\ActiveProcess\ActiveUser` liên tục để theo dõi trạng thái đăng nhập của người dùng.

---

### Bằng chứng 6: Lập trình viên để quên tài liệu nội bộ `dlls/README.md` ngay trong thư mục cài đặt

Ngay trong thư mục cài đặt gốc (`%LOCALAPPDATA%\Deluxe Gaming\dlls\README.md`), đội ngũ phát triển Deluxe Gaming đã để sót lại file ghi chú hướng dẫn đóng gói DLL vào trình cài đặt NSIS:

```markdown
# DLL Resources Directory

Place all your `.dll` files that need to be packaged with the launcher and copied into the user's Steam installation directory here.

During installation, the NSIS installer will:
1. Detect the user's active Steam directory via Windows Registry (or fallback paths).
2. Automatically copy all `.dll` files from this folder into that Steam directory.
```

Điều này chứng minh ngay từ giây phút người dùng chạy file cài đặt Launcher (`setup.exe`), trình cài đặt NSIS đã âm thầm dò đường dẫn Steam trong Registry và chép toàn bộ các file DLL can thiệp vào thư mục Steam mà không hề xin phép hay thông báo rõ ràng.

---

## RỦI RO ĐỐI VỚI NGƯỜI DÙNG KHI SỬ DỤNG LAUNCHER NÀY

1. **Nguy cơ bị khóa tài khoản Steam (Steam Account Ban / VAC Ban)**:
   - Việc chép `xinput1_4.dll` giả mạo, `cl.dll`, `ol.dll` vào thư mục Steam và dùng `LoadLibraryW` + Microsoft Detours (`CR_InstallVtableHooks`) để sửa đổi bộ nhớ tiến trình `steam.exe` vi phạm trực tiếp **Steam Subscriber Agreement (SSA)** của Valve.
   - Nếu sử dụng trên tài khoản Steam chính cá nhân, hệ thống bảo mật của Steam hoặc các phần mềm chống gian lận (VAC, EasyAntiCheat, BattlEye) có thể phát hiện hành vi hook VTable của `steam.exe` và dẫn đến khóa tài khoản vĩnh viễn.
2. **Đánh tráo khái niệm "Key bản quyền" để thu tiền người mua**:
   - Người dùng bỏ tiền mua "Key kích hoạt Steam" với niềm tin rằng mình sở hữu game bản quyền chính hãng, nhưng thực chất chỉ nhận được một mã kích hoạt ảo phụ thuộc hoàn toàn vào bộ công cụ bẻ khóa/giả lập (`syctool` + `cl.dll` + `ol.dll`) cài ngầm trên máy.
3. **Rủi ro bảo mật hệ thống (Mã thực thi đóng gói VMProtect nạp thẳng vào tiến trình)**:
   - File `assets/syc` được mã hóa `AES-256-CBC` với định dạng riêng (`OST\x01`) để qua mặt các trình quét tĩnh (Static Antivirus Scan), sau đó mới giải mã ra `%TEMP%` và nạp vào bộ nhớ khi `steam.exe` chạy. Bất kỳ mã độc nào cũng có thể được cập nhật và đẩy xuống thông qua cơ chế `inject_syctool_to_appdata` này.

---

## CẤU TRÚC THƯ MỤC DỊCH NGƯỢC ĐỂ KIỂM CHỨNG (`reversed_launcher/`)

Toàn bộ mã nguồn và công cụ kiểm chứng được lưu trữ đầy đủ trong thư mục này để bất kỳ ai cũng có thể tự đối chiếu:

- [`src-tauri/`](./src-tauri/Cargo.toml): Mã nguồn Rust phục dựng từ bảng COFF Symbol Table của `tauri-app.exe`.
  - [`src-tauri/src/injection/dll.rs`](./src-tauri/src/injection/dll.rs): Logic chép và tiêm `xinput1_4.dll`, `cl.dll`, `ol.dll` vào thư mục cài Steam.
  - [`src-tauri/src/injection/syctool.rs`](./src-tauri/src/injection/syctool.rs): Logic chép payload mã hóa `assets/syc` vào `%APPDATA%\syctool\syc`.
  - [`src-tauri/src/steam/mod.rs`](./src-tauri/src/steam/mod.rs): Hàm `open_steam_and_check_login` ép buộc tiêm DLL trước khi mở cửa sổ kích hoạt key Steam.
- [`native/`](./native/README.md): Phân tích chuyên sâu các file thực thi C++ Native.
  - [`native/xinput1_4_proxy.cpp`](./native/xinput1_4_proxy.cpp): Mã nguồn C++ phục dựng từ `dlls/xinput1_4.dll`.
  - [`native/decrypt_syc.py`](./native/decrypt_syc.py): Script Python giải mã file `assets/syc` (`OST\x01` AES-256-CBC) ra file DLL thật.
- [`syc_decrypted.dll`](./syc_decrypted.dll): File PE64 DLL (13,25 MB) thu được sau khi giải mã `assets/syc`.
- [`src/`](./src/App.tsx) & [`dist/`](./dist/index.html): Toàn bộ mã nguồn Frontend React/TypeScript, các file ngôn ngữ [`vi.json`](./src/i18n/locales/vi.json) / [`en.json`](./src/i18n/locales/en.json), và mã nguồn giao diện đã làm đẹp tại [`src/decompiled/screens_and_components.js`](./src/decompiled/screens_and_components.js).
