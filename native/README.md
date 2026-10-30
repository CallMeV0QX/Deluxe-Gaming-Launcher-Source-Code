# Phân Tích Chuyên Sâu Các Module Native (`dlls/` & `assets/syc`)

Tài liệu này cung cấp bằng chứng kỹ thuật ở mức mã máy (PE Header, Export Table, Chuỗi Debug `.rdata` và Thuật toán mã hóa) của 4 module thực thi đi kèm **Deluxe Gaming Launcher**:

---

## 1. Bảng Tổng Hợp 4 File Thực Thi Can Thiệp Vào Steam

| File trong bộ cài | Đích chép tới trên máy người dùng | Kích thước | Kiến trúc | Bản chất kỹ thuật |
| :--- | :--- | :--- | :--- | :--- |
| `dlls/xinput1_4.dll` | `<SteamPath>\xinput1_4.dll` | 27,648 bytes | PE32+ (`0x8664`) | **DLL Hijacking Proxy & Dropper Loader**: Giả danh thư viện `xinput1_4.dll` của Windows để `steam.exe` tự động nạp khi khởi chạy. Giải mã file `%APPDATA%\syctool\syc` ra `%TEMP%` rồi gọi `LoadLibraryW` nạp thẳng vào `steam.exe`. |
| `assets/syc` | `%APPDATA%\syctool\syc` | 13,252,660 bytes | Container `OST\x01` | Payload DLL 64-bit đã bị mã hóa `AES-256-CBC` nhằm tránh bị phát hiện tĩnh. |
| `syc_decrypted.dll` | `%TEMP%\<tmp>.tmp` (nạp vào `steam.exe`) | 13,252,608 bytes | PE32+ (`0x8664`) | Payload sau khi giải mã từ `assets/syc`. Đóng gói bằng **VMProtect** và sử dụng **Microsoft Detours** (`.detourc`, `.detourd`) để hook tiến trình `steam.exe`. |
| `dlls/cl.dll` | `<SteamPath>\cl.dll` | 8,979,016 bytes | PE32+ (`0x8664`) | Module hook VTable của Steam Client (`CR_AddApp`, `CR_SetApps`, `CR_InstallVtableHooks`, `CloudRedirect_CliMain`) để chèn AppID game lậu/ảo vào thư viện Steam và chuyển hướng Steam Cloud. |
| `dlls/ol.dll` | `<SteamPath>\ol.dll` | 12,870,656 bytes | PE32+ (`0x8664`) | Module 64-bit đóng gói bằng **VMProtect** kèm section **Microsoft Detours** (`.detourc`, `.detourd`, `.fptable`). |

---

## 2. Bằng Chứng Trong Bảng Export Của `dlls/cl.dll`

Mặc dù phần thân mã lệnh của `cl.dll` được làm rối bằng VMProtect (các section `.M>3`, `.+XM`, `.UcG`), bảng **PE Export Directory** của nó vẫn để lộ nguyên vẹn **20 hàm xuất (Exported Functions)** chứng minh hành vi giả mạo bản quyền game trên Steam:

```text
CR_AddApp
CR_DrainPlaytimeUpdates
CR_EnableStatsSync
CR_GetAchievements
CR_GetPlaytime
CR_HandleCloudRpc
CR_InitCloudSave
CR_InstallGamesPlayedHookOnly
CR_InstallVtableHooks
CR_IsApp
CR_NotifyAppRunning
CR_NotifyStatsStored
CR_NotifyStatsStoredFrom
CR_RemoveApp
CR_SetAccountId
CR_SetApps
CR_SetFunctionTable
CR_Shutdown
CloudOnSendPkt
CloudRedirect_CliMain
```

- **`CR_AddApp` / `CR_SetApps` / `CR_RemoveApp` / `CR_IsApp`**: Can thiệp vào bộ nhớ Steam Client để thêm AppID của game vào danh sách đã sở hữu mà không cần bản quyền thực sự trên máy chủ Valve.
- **`CR_InstallVtableHooks` / `CR_InstallGamesPlayedHookOnly`**: Ghi đè bảng phương thức ảo (C++ VTable) của các đối tượng nội bộ trong `steamclient64.dll` / `steam.exe`.
- **`CloudRedirect_CliMain` / `CloudOnSendPkt` / `CR_InitCloudSave` / `CR_HandleCloudRpc`**: Chặn các gói tin đồng bộ của Steam và chuyển hướng (redirect) dữ liệu Cloud Save, Playtime (`CR_GetPlaytime`) và Achievements (`CR_GetAchievements`) vì máy chủ Valve không cho phép tài khoản chưa mua game đồng bộ dữ liệu chính thức.

---

## 3. Bằng Chứng Các Chuỗi Log Debug Trong `dlls/xinput1_4.dll`

Khi trích xuất vùng dữ liệu `.rdata` (offset `0x5000`) của `dlls/xinput1_4.dll`, toàn bộ chuỗi thông báo của bộ nạp DLL (`[DllLoader]`) hiện rõ:

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
Invalid PE signature (not MZ)
Only x64 (AMD64) architecture supported: 0x%04X
Not a DLL file (missing DLL characteristic)
PE structure validated: Machine=0x%04X, Sections=%u
Encrypted DLL path: %S
CreateFileW failed for temp file: 0x%08X
PE module loaded via LoadLibraryW: %p
=== LoadEncryptedDll succeeded ===
```

---

## 4. Thuật Toán Giải Mã `assets/syc` (`OST\x01`)

1. **Cấu trúc Header (`36 bytes`)**:
   - `0x00..0x04` (4 bytes): Magic bytes `"OST\x01"` (`4F 53 54 01`).
   - `0x04..0x24` (32 bytes): `Part_B` — khóa thành phần nhúng trong file (`597101f44517033a1d32ae3bc0d30eb9596ef93d6fc8fdcd4ba3c431f80e4696`).
   - `0x24..EOF`: Dữ liệu mã hóa `AES-256-CBC` (PKCS#7 padding).

2. **Công thức tính khóa AES-256 (`Key = Part_A ^ Part_B ^ Part_C`)**:
   - **`Part_A`** (32 bytes cố định tại `.rdata` của `xinput1_4.dll`):
     `135b2dc031663eaf096a87c79f80b689ddccb9b9f61c056c01de9cdc4b861b0d`
   - **`Part_B`** (32 bytes từ offset `0x04..0x24` của `assets/syc`):
     `597101f44517033a1d32ae3bc0d30eb9596ef93d6fc8fdcd4ba3c431f80e4696`
   - **`Part_C`** (32 bytes `SHA-256` của chuỗi UTF-16LE `"appdata\\roaming\\syctool"`):
     `328281c5bbde2d5044ae35ab6971b687c7021d3855d212a30ef853348905dc3c`
   - **Khóa AES-256 (`Key`)**:
     `7aaaadf1d1a710c5509a1e573922b6b74deb1dbedcdac8a344fb9b393bee81a9`
   - **IV**: 16 bytes `0x00`.
