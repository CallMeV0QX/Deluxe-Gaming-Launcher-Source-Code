# DLL Resources Directory

Place all your `.dll` files that need to be packaged with the launcher and copied into the user's Steam installation directory here.

During installation, the NSIS installer will:
1. Detect the user's active Steam directory via Windows Registry (or fallback paths).
2. Automatically copy all `.dll` files from this folder into that Steam directory.
