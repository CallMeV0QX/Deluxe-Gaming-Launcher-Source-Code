#!/usr/bin/env python3
"""
OST\x01 Payload Decryptor for Deluxe Gaming Launcher (`assets/syc`)
====================================================================
Reverse-engineered from `dlls/xinput1_4.dll` (RVA 0x13C0 - 0x16B0).

File Format (`assets/syc`):
  - Offset 0x00 .. 0x04 (4 bytes) : Magic header b"OST\x01"
  - Offset 0x04 .. 0x24 (32 bytes): Embedded 256-bit key share (Part_B)
  - Offset 0x24 .. EOF            : AES-256-CBC ciphertext (PKCS#7 padded)

Key Derivation:
  - Part_A (32 bytes): Static constant in `xinput1_4.dll` `.rdata` at RVA 0x3E78:
      135b2dc031663eaf096a87c79f80b689ddccb9b9f61c056c01de9cdc4b861b0d
  - Part_B (32 bytes): Bytes [4:36] read from the `OST\x01` file header
  - Part_C (32 bytes): SHA-256 of UTF-16LE("appdata\\roaming\\syctool"):
      328281c5bbde2d5044ae35ab6971b687c7021d3855d212a30ef853348905dc3c
  - AES_Key (32 bytes): Part_A ^ Part_B ^ Part_C
  - AES_IV  (16 bytes): 16 zero bytes (b"\\x00" * 16)
"""

import hashlib
import os
import subprocess
import sys

PART_A = bytes.fromhex(
    "135b2dc031663eaf096a87c79f80b689ddccb9b9f61c056c01de9cdc4b861b0d"
)
PART_C = hashlib.sha256("appdata\\roaming\\syctool".encode("utf-16le")).digest()
MAGIC = b"OST\x01"


def derive_aes_key(part_b: bytes) -> bytes:
    if len(part_b) != 32:
        raise ValueError("Part_B must be 32 bytes")
    return bytes(a ^ b ^ c for a, b, c in zip(PART_A, part_b, PART_C))


def decrypt_syc_file(input_path: str, output_path: str) -> None:
    with open(input_path, "rb") as f:
        data = f.read()

    if data[:4] != MAGIC:
        raise ValueError(f"Invalid magic header: {data[:4]!r} (expected {MAGIC!r})")

    part_b = data[4:36]
    ciphertext = data[36:]
    aes_key = derive_aes_key(part_b)

    print(f"[*] Input file : {input_path} ({len(data):,} bytes)")
    print(f"[*] Part_A     : {PART_A.hex()}")
    print(f"[*] Part_B     : {part_b.hex()}")
    print(f"[*] Part_C     : {PART_C.hex()}")
    print(f"[*] Derived Key: {aes_key.hex()}")

    tmp_ct = output_path + ".ct.tmp"
    with open(tmp_ct, "wb") as f:
        f.write(ciphertext)

    try:
        subprocess.run(
            [
                "openssl",
                "enc",
                "-aes-256-cbc",
                "-d",
                "-in",
                tmp_ct,
                "-out",
                output_path,
                "-K",
                aes_key.hex(),
                "-iv",
                "0" * 32,
            ],
            check=True,
        )
    finally:
        if os.path.exists(tmp_ct):
            os.remove(tmp_ct)

    with open(output_path, "rb") as f:
        header = f.read(2)
    print(
        f"[+] Decrypted  : {output_path} ({os.path.getsize(output_path):,} bytes, magic={header!r})"
    )


if __name__ == "__main__":
    default_in = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "assets", "syc")
    )
    default_out = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "syc_decrypted.dll")
    )
    in_file = sys.argv[1] if len(sys.argv) > 1 else default_in
    out_file = sys.argv[2] if len(sys.argv) > 2 else default_out
    decrypt_syc_file(in_file, out_file)

