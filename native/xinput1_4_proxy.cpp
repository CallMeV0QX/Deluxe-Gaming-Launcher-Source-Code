/**
 * Reconstructed C++ Source Code for `dlls/xinput1_4.dll` (x86 32-bit Proxy & OST\x01 Loader)
 * =========================================================================================
 * Reverse-engineered from `%LOCALAPPDATA%\Deluxe Gaming\dlls\xinput1_4.dll`
 * (ImageBase: 0x10000000, EntryPoint: 0x100018E1, Size: 27,648 bytes).
 *
 * Summary of Behavior:
 * 1. Exports standard XInput 1.4 APIs (`XInputGetState`, `XInputSetState`, `XInputGetCapabilities`,
 *    `XInputEnable`, `XInputGetAudioDeviceIds`, `XInputGetBatteryInformation`, `XInputGetKeystroke`)
 *    and forwards them lazily to `%SystemRoot%\System32\xinput1_4.dll`.
 * 2. On `DLL_PROCESS_ATTACH` (`sub_10001710`):
 *    - Checks if the current process executable is `steam.exe`.
 *    - Resolves `%APPDATA%\syctool\syc` via `SHGetFolderPathW(NULL, CSIDL_APPDATA, ...)`.
 *    - Reads the `OST\x01` encrypted file (`sub_100013C0`):
 *      - Verifies 4-byte magic `"OST\x01"` (`0x0154534F`).
 *      - Reads 32-byte `Part_B` at offset 4.
 *      - Computes `Part_C = SHA256(UTF16LE("appdata\\roaming\\syctool"))` using Windows BCrypt.
 *      - Combines `AES_Key[i] = Part_A[i] ^ Part_B[i] ^ Part_C[i]` (32 bytes).
 *      - Decrypts the payload using `BCryptDecrypt` (`BCRYPT_AES_ALGORITHM`, `ChainingModeCBC`,
 *        zero IV, `BCRYPT_BLOCK_PADDING`).
 */

#include <windows.h>
#include <shlobj.h>
#include <bcrypt.h>
#include <stdint.h>
#include <vector>
#include <string>

#pragma comment(lib, "bcrypt.lib")
#pragma comment(lib, "shell32.lib")

// Static 32-byte key share Part_A located at RVA 0x3E78 in xinput1_4.dll
static const uint8_t kPartA[32] = {
    0x13, 0x5B, 0x2D, 0xC0, 0x31, 0x66, 0x3E, 0xAF,
    0x09, 0x6A, 0x87, 0xC7, 0x9F, 0x80, 0xB6, 0x89,
    0xDD, 0xCC, 0xB9, 0xB9, 0xF6, 0x1C, 0x05, 0x6C,
    0x01, 0xDE, 0x9C, 0xDC, 0x4B, 0x86, 0x1B, 0x0D
};

static HMODULE g_realXInput = NULL;

static void EnsureRealXInputLoaded() {
    if (!g_realXInput) {
        wchar_t sysDir[MAX_PATH] = { 0 };
        GetSystemDirectoryW(sysDir, MAX_PATH);
        std::wstring path = std::wstring(sysDir) + L"\\xinput1_4.dll";
        g_realXInput = LoadLibraryW(path.c_str());
    }
}

// Reconstructed from sub_10001120: Computes SHA-256 using Windows CNG (bcrypt.dll)
static bool ComputeSha256(const void* data, ULONG size, uint8_t outHash[32]) {
    BCRYPT_ALG_HANDLE hAlg = NULL;
    BCRYPT_HASH_HANDLE hHash = NULL;
    bool ok = false;

    if (BCryptOpenAlgorithmProvider(&hAlg, BCRYPT_SHA256_ALGORITHM, NULL, 0) >= 0) {
        if (BCryptCreateHash(hAlg, &hHash, NULL, 0, NULL, 0, 0) >= 0) {
            if (BCryptHashData(hHash, (PUCHAR)data, size, 0) >= 0 &&
                BCryptFinishHash(hHash, outHash, 32, 0) >= 0) {
                ok = true;
            }
            BCryptDestroyHash(hHash);
        }
        BCryptCloseAlgorithmProvider(hAlg, 0);
    }
    return ok;
}

// Reconstructed from sub_100013C0: Decrypts `%APPDATA%\syctool\syc` (OST\x01 container)
static bool DecryptOstPayload(const std::vector<uint8_t>& fileBytes, std::vector<uint8_t>& plainOut) {
    if (fileBytes.size() <= 36) return false;

    // Check "OST\x01" magic (little-endian 0x0154534F)
    if (fileBytes[0] != 'O' || fileBytes[1] != 'S' || fileBytes[2] != 'T' || fileBytes[3] != 0x01) {
        return false;
    }

    const uint8_t* partB = &fileBytes[4];
    const uint8_t* ciphertext = &fileBytes[36];
    ULONG ciphertextLen = (ULONG)(fileBytes.size() - 36);

    // Widen "appdata\\roaming\\syctool" to UTF-16LE and compute SHA-256 (Part_C)
    const wchar_t* seedStr = L"appdata\\roaming\\syctool";
    uint8_t partC[32] = { 0 };
    if (!ComputeSha256(seedStr, 23 * sizeof(wchar_t), partC)) {
        return false;
    }

    // Derive 256-bit AES key = Part_A ^ Part_B ^ Part_C
    uint8_t aesKey[32];
    for (size_t i = 0; i < 32; ++i) {
        aesKey[i] = kPartA[i] ^ partB[i] ^ partC[i];
    }

    BCRYPT_ALG_HANDLE hAlg = NULL;
    BCRYPT_KEY_HANDLE hKey = NULL;
    bool ok = false;

    if (BCryptOpenAlgorithmProvider(&hAlg, BCRYPT_AES_ALGORITHM, NULL, 0) >= 0) {
        if (BCryptSetProperty(hAlg, BCRYPT_CHAINING_MODE, (PUCHAR)BCRYPT_CHAIN_MODE_CBC, sizeof(BCRYPT_CHAIN_MODE_CBC), 0) >= 0) {
            if (BCryptGenerateSymmetricKey(hAlg, &hKey, NULL, 0, aesKey, sizeof(aesKey), 0) >= 0) {
                uint8_t iv[16] = { 0 };
                ULONG plainLen = 0;
                if (BCryptDecrypt(hKey, (PUCHAR)ciphertext, ciphertextLen, NULL, iv, sizeof(iv), NULL, 0, &plainLen, BCRYPT_BLOCK_PADDING) >= 0) {
                    plainOut.resize(plainLen);
                    memset(iv, 0, sizeof(iv));
                    if (BCryptDecrypt(hKey, (PUCHAR)ciphertext, ciphertextLen, NULL, iv, sizeof(iv), plainOut.data(), plainLen, &plainLen, BCRYPT_BLOCK_PADDING) >= 0) {
                        plainOut.resize(plainLen);
                        ok = true;
                    }
                }
                BCryptDestroyKey(hKey);
            }
        }
        BCryptCloseAlgorithmProvider(hAlg, 0);
    }

    SecureZeroMemory(aesKey, sizeof(aesKey));
    return ok;
}

// Forwarded XInput 1.4 Exports
extern "C" DWORD WINAPI XInputGetState(DWORD dwUserIndex, void* pState) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, void*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputGetState");
    return fn ? fn(dwUserIndex, pState) : ERROR_DEVICE_NOT_CONNECTED;
}

extern "C" DWORD WINAPI XInputSetState(DWORD dwUserIndex, void* pVibration) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, void*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputSetState");
    return fn ? fn(dwUserIndex, pVibration) : ERROR_DEVICE_NOT_CONNECTED;
}

extern "C" DWORD WINAPI XInputGetCapabilities(DWORD dwUserIndex, DWORD dwFlags, void* pCapabilities) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, DWORD, void*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputGetCapabilities");
    return fn ? fn(dwUserIndex, dwFlags, pCapabilities) : ERROR_DEVICE_NOT_CONNECTED;
}

extern "C" void WINAPI XInputEnable(BOOL enable) {
    EnsureRealXInputLoaded();
    typedef void(WINAPI* Fn)(BOOL);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputEnable");
    if (fn) fn(enable);
}

extern "C" DWORD WINAPI XInputGetAudioDeviceIds(DWORD dwUserIndex, LPWSTR pRenderDeviceId, UINT* pRenderCount, LPWSTR pCaptureDeviceId, UINT* pCaptureCount) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, LPWSTR, UINT*, LPWSTR, UINT*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputGetAudioDeviceIds");
    return fn ? fn(dwUserIndex, pRenderDeviceId, pRenderCount, pCaptureDeviceId, pCaptureCount) : ERROR_DEVICE_NOT_CONNECTED;
}

extern "C" DWORD WINAPI XInputGetBatteryInformation(DWORD dwUserIndex, BYTE devType, void* pBatteryInformation) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, BYTE, void*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputGetBatteryInformation");
    return fn ? fn(dwUserIndex, devType, pBatteryInformation) : ERROR_DEVICE_NOT_CONNECTED;
}

extern "C" DWORD WINAPI XInputGetKeystroke(DWORD dwUserIndex, DWORD dwReserved, void* pKeystroke) {
    EnsureRealXInputLoaded();
    typedef DWORD(WINAPI* Fn)(DWORD, DWORD, void*);
    static Fn fn = (Fn)GetProcAddress(g_realXInput, "XInputGetKeystroke");
    return fn ? fn(dwUserIndex, dwReserved, pKeystroke) : ERROR_DEVICE_NOT_CONNECTED;
}

