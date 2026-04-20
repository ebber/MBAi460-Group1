# `secrets/` — local-only lab material

This directory holds **sensitive or decrypting** files for the AWS lab sanctum. It is **not** for course submission artifacts unless you deliberately copy a sanitized file elsewhere.

## What belongs here

- Long-lived **access keys** (export from IAM when created — **one time** display).
- **RDS master password** (or a password manager export, if you choose to keep a local copy).
- **Encryption keys** (e.g. `age` identity file, `gpg` private key, `sops` age key) — whatever you picked in Phase F of the execution steps.
- **Ciphertext** copies of configs (e.g. `photoapp-config.ini.age`).

## What must never live here without encryption

Avoid long-term plaintext. If you must stage plaintext briefly during Part 01 execution, **delete or encrypt** before you call the step complete.

## Git

The Part-level `.gitignore` keeps `secrets/*` out of git **except** this `README.md`, so collaborators and agents understand the contract without seeing your keys. Keep a **sanitized** copy of any template config in `MetaFiles/` or the course tree if you need something safe to commit.
