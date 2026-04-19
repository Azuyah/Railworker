#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd curl
require_cmd python3

HTTP_CODE_FRONT="$(curl -s -o "$TMP_DIR/front.html" -w "%{http_code}" http://localhost:3000)"
if [ "$HTTP_CODE_FRONT" != "200" ]; then
  echo "Frontend failed: expected 200 from :3000, got $HTTP_CODE_FRONT" >&2
  exit 1
fi
log "Frontend svarar på :3000"

HTTP_CODE_USER="$(curl -s -o "$TMP_DIR/user.json" -w "%{http_code}" http://localhost:4000/api/user)"
if [ "$HTTP_CODE_USER" != "401" ]; then
  echo "Backend auth check failed: expected 401 from /api/user, got $HTTP_CODE_USER" >&2
  exit 1
fi
log "Backend auth-skydd svarar korrekt"

HTSM_JSON="$(curl -s -X POST http://localhost:4000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"htsm@railworker.com","password":"admin"}')"
HTSM_TOKEN="$(printf '%s' "$HTSM_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')"
log "HTSM-login fungerar"

TSM_JSON="$(curl -s -X POST http://localhost:4000/api/login-tsm \
  -H 'Content-Type: application/json' \
  -d '{"name":"Mats Andersson","phone":"0760-22 23 57"}')"
TSM_TOKEN="$(printf '%s' "$TSM_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')"
log "TSM-login fungerar"

PUBLIC_PROJECTS_JSON="$(curl -s http://localhost:4000/api/public/projects)"
PUBLIC_COUNT="$(printf '%s' "$PUBLIC_PROJECTS_JSON" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"
if [ "$PUBLIC_COUNT" -lt 1 ]; then
  echo "No public TSM projects found" >&2
  exit 1
fi

FIRST_PUBLIC_ID="$(printf '%s' "$PUBLIC_PROJECTS_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["id"])')"
FIRST_PUBLIC_NAME="$(printf '%s' "$PUBLIC_PROJECTS_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["name"])')"
log "Publik TSM-lista fungerar ($PUBLIC_COUNT projekt, första: $FIRST_PUBLIC_NAME)"

HTSM_PROJECTS_JSON="$(curl -s http://localhost:4000/api/projects -H "Authorization: Bearer $HTSM_TOKEN")"
HTSM_COUNT="$(printf '%s' "$HTSM_PROJECTS_JSON" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"
if [ "$HTSM_COUNT" -lt 1 ]; then
  echo "No HTSM projects found" >&2
  exit 1
fi
log "HTSM-projektlista fungerar ($HTSM_COUNT projekt)"

DISP_CODE="$(curl -s -o "$TMP_DIR/public-disp.pdf" -w "%{http_code}" "http://localhost:4000/api/public/projects/$FIRST_PUBLIC_ID/export-disp")"
if [ "$DISP_CODE" != "200" ]; then
  echo "Public disp export failed for project $FIRST_PUBLIC_ID (HTTP $DISP_CODE)" >&2
  exit 1
fi

DISP_SIZE="$(python3 - <<PY
from pathlib import Path
print(Path("$TMP_DIR/public-disp.pdf").stat().st_size)
PY
)"
if [ "$DISP_SIZE" -lt 10000 ]; then
  echo "Public disp export looks too small: $DISP_SIZE bytes" >&2
  exit 1
fi
log "Publik disp-export fungerar ($DISP_SIZE bytes)"

EXCEL_CODE="$(curl -s -o "$TMP_DIR/project.xlsx" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$FIRST_PUBLIC_ID/export-excel" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
if [ "$EXCEL_CODE" != "200" ]; then
  echo "Excel export failed for project $FIRST_PUBLIC_ID (HTTP $EXCEL_CODE)" >&2
  exit 1
fi

python3 - <<PY
from zipfile import ZipFile
from pathlib import Path
path = Path("$TMP_DIR/project.xlsx")
if path.stat().st_size < 10000:
    raise SystemExit("Excel export looks too small")
zf = ZipFile(path)
names = set(zf.namelist())
required = {"xl/workbook.xml", "xl/worksheets/sheet1.xml"}
missing = sorted(required - names)
if missing:
    raise SystemExit(f"Excel export missing files: {missing}")
print("Excel workbook verified")
PY
log "Excel-export fungerar"

PHONE_CODE="$(curl -s -o "$TMP_DIR/telefonkatalog.pdf" -w "%{http_code}" http://localhost:4000/api/telefonkatalog)"
if [ "$PHONE_CODE" != "200" ]; then
  echo "Telefonkatalog route failed (HTTP $PHONE_CODE)" >&2
  exit 1
fi
log "Telefonkatalog-routen fungerar"

log "Lokal verifiering klar: kärnflödena ser gröna ut"
