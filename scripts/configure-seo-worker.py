#!/usr/bin/env python3
"""Configure the private Cloudflare Worker secrets for the SEO lead magnet."""

from __future__ import annotations

import getpass
import subprocess
import sys
from pathlib import Path


TOKEN_FILE = Path.home() / ".config/elevator-dental/seo-service-token"
SECRETS = (
    ("SEO_SERVICE_URL", "https://srv1530006.hstgr.cloud", False),
    ("SEO_SERVICE_TOKEN", None, False),
    ("TURNSTILE_SITE_KEY", None, True),
    ("TURNSTILE_SECRET_KEY", None, True),
)


def main() -> int:
    if not TOKEN_FILE.is_file():
        print("No se encontró el token privado del servicio SEO.", file=sys.stderr)
        return 2

    values: list[tuple[str, str]] = []
    for name, configured, hidden in SECRETS:
        if configured is not None:
            value = configured
        elif name == "SEO_SERVICE_TOKEN":
            value = TOKEN_FILE.read_text().strip()
        else:
            prompt = "Site key de Turnstile: " if name.endswith("SITE_KEY") else "Secret key de Turnstile: "
            value = getpass.getpass(prompt).strip()
        if not value:
            print("Falta un valor requerido; no se cambiaron secretos.", file=sys.stderr)
            return 2
        values.append((name, value))

    for name, value in values:
        result = subprocess.run(
            ["npx", "wrangler", "secret", "put", name],
            input=value + "\n",
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode:
            print(f"Cloudflare no aceptó {name}; se detuvo la configuración.", file=sys.stderr)
            return result.returncode
        print(f"{name}: guardado en Cloudflare")

    print("Configuración lista. No se enviaron las claves a la salida del programa.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
