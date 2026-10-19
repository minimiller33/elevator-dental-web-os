#!/usr/bin/env python3
"""Safely set the Resend API key on Elevator Dental's SEO audit VPS.

The key is collected without terminal echo, sent only over SSH stdin, and is
never placed in argv, shell history, a local file, or program output.
"""

from __future__ import annotations

import getpass
import shlex
import subprocess
import sys


SSH_KEY = "/Users/cashkade/.ssh/besmile-blog-vps"
SSH_HOST = "root@187.124.242.231"
SSH_PORT = "22"
REMOTE_DIR = "/opt/elevator-seo-audit"

REMOTE_PROGRAM = r'''import os, pathlib, sys, tempfile
path = pathlib.Path("/opt/elevator-seo-audit/.env")
secret = sys.stdin.readline().rstrip("\r\n")
if not secret.startswith("re_") or "\n" in secret or "\r" in secret:
    raise SystemExit("Invalid Resend key format")
if not path.is_file():
    raise SystemExit("SEO service .env not found")
lines = path.read_text().splitlines()
updates = {
    "RESEND_API_KEY": secret,
    "RESEND_FROM": "Elevator Dental <soporte@elevatordental.com>",
}
found = set()
result = []
for line in lines:
    name, sep, _ = line.partition("=")
    if sep and name in updates:
        result.append(name + "=" + updates[name])
        found.add(name)
    else:
        result.append(line)
for name, value in updates.items():
    if name not in found:
        result.append(name + "=" + value)
fd, tmp = tempfile.mkstemp(prefix=".env.", dir=str(path.parent))
try:
    with os.fdopen(fd, "w") as f:
        f.write("\n".join(result) + "\n")
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)
finally:
    if os.path.exists(tmp):
        os.unlink(tmp)
print("Resend configuration saved securely")
'''


def main() -> int:
    print("La clave se ocultará al escribirla y no se guardará en este equipo.")
    key = getpass.getpass("API key de Resend: ").strip()
    if not key.startswith("re_") or any(c in key for c in "\r\n"):
        print("Formato de clave inesperado; no se envió nada.", file=sys.stderr)
        return 2

    remote_cmd = "cd " + shlex.quote(REMOTE_DIR) + " && python3 -c " + shlex.quote(REMOTE_PROGRAM)
    command = [
        "ssh",
        "-T",
        "-i",
        SSH_KEY,
        "-o",
        "BatchMode=yes",
        "-o",
        "StrictHostKeyChecking=yes",
        "-p",
        SSH_PORT,
        SSH_HOST,
        remote_cmd,
    ]
    try:
        saved = subprocess.run(
            command,
            input=key + "\n",
            text=True,
            capture_output=True,
            check=False,
        )
    except OSError as exc:
        print(f"No se pudo iniciar SSH: {exc}", file=sys.stderr)
        return 1
    finally:
        key = ""

    if saved.returncode:
        print("No se pudo guardar la configuración en el VPS.", file=sys.stderr)
        if saved.stderr:
            print(saved.stderr.strip(), file=sys.stderr)
        return saved.returncode

    print(saved.stdout.strip())
    restarted = subprocess.run(
        [
            "ssh",
            "-T",
            "-i",
            SSH_KEY,
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=yes",
            "-p",
            SSH_PORT,
            SSH_HOST,
            "cd /opt/elevator-seo-audit && docker compose up -d --force-recreate && sleep 2 && curl -fsS http://127.0.0.1:3100/health",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if restarted.returncode:
        print("La clave quedó guardada, pero el reinicio/verificación falló.", file=sys.stderr)
        if restarted.stderr:
            print(restarted.stderr.strip(), file=sys.stderr)
        return restarted.returncode
    print("Servicio reiniciado y health check correcto.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
