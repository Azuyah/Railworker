#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
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

setup_node() {
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
    nvm use "$(cat "$BACKEND_DIR/.nvmrc")" >/dev/null
    log "Node $(node -v) aktiv"
    return
  fi

  require_cmd node
  log "Node $(node -v) aktiv (utan nvm)"
}

expect_http_code() {
  local code="$1"
  local expected="$2"
  local label="$3"

  if [ "$code" != "$expected" ]; then
    echo "$label failed: expected HTTP $expected, got $code" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd python3

setup_node
require_cmd npm

log "Bygger frontend för att fånga rena compile-fel"
(
  cd "$FRONTEND_DIR"
  npm run build >/dev/null
)
log "Frontend-build gick igenom"

HTTP_CODE_FRONT="$(curl -s -o "$TMP_DIR/front.html" -w "%{http_code}" http://localhost:3000)"
expect_http_code "$HTTP_CODE_FRONT" "200" "Frontend"
log "Frontend svarar på :3000"

HTTP_CODE_USER="$(curl -s -o "$TMP_DIR/user.json" -w "%{http_code}" http://localhost:4000/api/user)"
expect_http_code "$HTTP_CODE_USER" "401" "Backend auth check"
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

FIRST_HTSM_ID="$(printf '%s' "$HTSM_PROJECTS_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["id"])')"
KNOWN_PLAN_ID="67"
PLAN_PROJECT_ID="$KNOWN_PLAN_ID"
PLAN_PROJECT_CODE="$(curl -s -o "$TMP_DIR/plan-project.json" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$PLAN_PROJECT_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
if [ "$PLAN_PROJECT_CODE" != "200" ]; then
  PLAN_PROJECT_ID="$FIRST_HTSM_ID"
fi
KNOWN_SAVE_ID="50"
SAVE_PROJECT_ID="$KNOWN_SAVE_ID"
SAVE_PROJECT_CODE="$(curl -s -o "$TMP_DIR/save-project.json" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$SAVE_PROJECT_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
if [ "$SAVE_PROJECT_CODE" != "200" ]; then
  SAVE_PROJECT_ID="$FIRST_HTSM_ID"
fi

SAVE_SOURCE_CODE="$(curl -s -o "$TMP_DIR/save-project.json" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$SAVE_PROJECT_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
expect_http_code "$SAVE_SOURCE_CODE" "200" "Save source project fetch"

PROJECT_CODE_SINGULAR="$(curl -s -o "$TMP_DIR/project-singular.json" -w "%{http_code}" \
  "http://localhost:4000/api/project/$FIRST_HTSM_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
PROJECT_CODE_PLURAL="$(curl -s -o "$TMP_DIR/project-plural.json" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$FIRST_HTSM_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
if [ "$PROJECT_CODE_SINGULAR" != "200" ] || [ "$PROJECT_CODE_PLURAL" != "200" ]; then
  echo "Project detail routes failed: singular=$PROJECT_CODE_SINGULAR plural=$PROJECT_CODE_PLURAL" >&2
  exit 1
fi
log "Projektdetalj fungerar på både singular och plural route"

SAVE_CODE="$(curl -s -o "$TMP_DIR/save-result.json" -w "%{http_code}" \
  -X PUT "http://localhost:4000/api/projects/$SAVE_PROJECT_ID" \
  -H "Authorization: Bearer $HTSM_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @"$TMP_DIR/save-project.json")"
expect_http_code "$SAVE_CODE" "200" "Projektuppdatering"
log "Befintligt projekt kan sparas om utan fel (projekt $SAVE_PROJECT_ID)"

DISP_CODE="$(curl -s -o "$TMP_DIR/public-disp.pdf" -w "%{http_code}" "http://localhost:4000/api/public/projects/$FIRST_PUBLIC_ID/export-disp")"
expect_http_code "$DISP_CODE" "200" "Public disp export"

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

PLAN_EXCEL_CODE="$(curl -s -o "$TMP_DIR/plan-project.xlsx" -w "%{http_code}" \
  "http://localhost:4000/api/projects/$PLAN_PROJECT_ID/export-excel" \
  -H "Authorization: Bearer $HTSM_TOKEN")"
expect_http_code "$PLAN_EXCEL_CODE" "200" "Plan project Excel export"

python3 - <<PY
from zipfile import ZipFile
from pathlib import Path
import json
import re

path = Path("$TMP_DIR/plan-project.xlsx")
if path.stat().st_size < 10000:
    raise SystemExit("Plan Excel export looks too small")

with ZipFile(path) as zf:
    sheet = zf.read("xl/worksheets/sheet1.xml").decode("utf-8", "replace")

blocks = re.findall(r'<conditionalFormatting sqref=\"([^\"]+)\">(.*?)</conditionalFormatting>', sheet, re.S)
if len(blocks) != 1:
    raise SystemExit(f"Expected exactly one completion highlight rule, found {len(blocks)}")

ref, body = blocks[0]
formulas = re.findall(r'<formula>([^<]+)</formula>', body)
if len(formulas) != 1:
    raise SystemExit(f"Expected exactly one completion formula, found {len(formulas)}")

formula = formulas[0]
if "&lt;&gt;&quot;&quot;" not in formula and '<>""' not in formula:
    raise SystemExit(f"Unexpected completion formula: {formula}")

if "\$X10&lt;&gt;&quot;&quot;" in formula or "\$X10<>\"\"" in formula:
    raise SystemExit("Legacy fixed-column completion rule is still present")

print(json.dumps({"ref": ref, "formula": formula}, ensure_ascii=False))
PY
log "Excel-rödmarkering för Avslutat följer flytande kolumn"

BLANKETT_SAMPLE_PATH="$(find "$HOME/Desktop/Disper" -type f -name '*205832.pdf' -print -quit 2>/dev/null || true)"
if [ -z "$BLANKETT_SAMPLE_PATH" ]; then
  echo "Could not find known Blankett 31 fixture in $HOME/Desktop/Disper" >&2
  exit 1
fi

python3 - <<PY > "$TMP_DIR/blankett31-parse-request.json"
from pathlib import Path
import base64
import json
path = Path(r"""$BLANKETT_SAMPLE_PATH""")
print(json.dumps({
    "fileName": path.name,
    "fileData": base64.b64encode(path.read_bytes()).decode("ascii"),
}))
PY

PARSE_CODE="$(curl -s -o "$TMP_DIR/blankett31-parse-response.json" -w "%{http_code}" \
  -X POST "http://localhost:4000/api/pdf/blankett31/parse" \
  -H "Authorization: Bearer $HTSM_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @"$TMP_DIR/blankett31-parse-request.json")"
expect_http_code "$PARSE_CODE" "200" "Blankett 31-parse"

python3 - <<PY
import json
from pathlib import Path
payload = json.loads(Path("$TMP_DIR/blankett31-parse-response.json").read_text())
parsed = payload.get("parsed") or {}
entries = parsed.get("entries") or []
suggestions = payload.get("suggestions") or []
if not entries:
    raise SystemExit("Blankett 31 parse returned no entries")
if not suggestions:
    raise SystemExit("Blankett 31 parse returned no suggestions")
boundary_value = entries[0].get("granspunkt") or entries[0].get("boundaries")
if not boundary_value:
    raise SystemExit("Blankett 31 parse entry missing boundary text")
print(boundary_value)
print(len(suggestions))
PY
log "Blankett 31 kan tolkas och ger tidigare underlag"

PROJECT_SUGGESTION_REQUEST="$TMP_DIR/use-project-suggestion.json"
ARCHIVE_SUGGESTION_REQUEST="$TMP_DIR/use-archive-suggestion.json"

python3 - <<PY
import json
from pathlib import Path
payload = json.loads(Path("$TMP_DIR/blankett31-parse-response.json").read_text())
suggestions = payload.get("suggestions") or []
project = next((item for item in suggestions if item.get("projectId")), None)
archive = next((item for item in suggestions if item.get("archiveDispPath")), None)
if not project:
    raise SystemExit("No project suggestion available")
if not archive:
    raise SystemExit("No archive suggestion available")
Path("$PROJECT_SUGGESTION_REQUEST").write_text(json.dumps({"projectId": project["projectId"]}))
Path("$ARCHIVE_SUGGESTION_REQUEST").write_text(json.dumps({"archiveDispPath": archive["archiveDispPath"]}))
PY

USE_PROJECT_CODE="$(curl -s -o "$TMP_DIR/use-project-suggestion-response.json" -w "%{http_code}" \
  -X POST "http://localhost:4000/api/blankett31-registry/use-suggestion" \
  -H "Authorization: Bearer $HTSM_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @"$PROJECT_SUGGESTION_REQUEST")"
expect_http_code "$USE_PROJECT_CODE" "200" "Project suggestion apply"

USE_ARCHIVE_CODE="$(curl -s -o "$TMP_DIR/use-archive-suggestion-response.json" -w "%{http_code}" \
  -X POST "http://localhost:4000/api/blankett31-registry/use-suggestion" \
  -H "Authorization: Bearer $HTSM_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary @"$ARCHIVE_SUGGESTION_REQUEST")"
expect_http_code "$USE_ARCHIVE_CODE" "200" "Archive suggestion apply"

python3 - <<PY
import json
from pathlib import Path

def verify_template(path_str, label):
    payload = json.loads(Path(path_str).read_text())
    template = payload.get("template") or {}
    sections = template.get("sections") or []
    if not sections:
      raise SystemExit(f"{label} returned no sections")
    for section in sections[:3]:
      if not str(section.get("granspunktStart", "")).strip():
        raise SystemExit(f"{label} missing granspunktStart")
      if not str(section.get("granspunktSlut", "")).strip():
        raise SystemExit(f"{label} missing granspunktSlut")
      if not str(section.get("spar", "")).strip():
        raise SystemExit(f"{label} missing spar")

verify_template("$TMP_DIR/use-project-suggestion-response.json", "Project suggestion")
verify_template("$TMP_DIR/use-archive-suggestion-response.json", "Archive suggestion")
print("Suggestions verified")
PY
log "Både befintlig disp och arkivdisp kan användas som mall med gränspunkter och spår"

PHONE_CODE="$(curl -s -o "$TMP_DIR/telefonkatalog.pdf" -w "%{http_code}" http://localhost:4000/api/telefonkatalog)"
expect_http_code "$PHONE_CODE" "200" "Telefonkatalog route"
log "Telefonkatalog-routen fungerar"

log "Lokal verifiering klar: kärnflödena ser gröna ut"
