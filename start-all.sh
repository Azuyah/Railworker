#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PID=""
FRONTEND_PID=""

kill_port_if_busy() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "♻️  Stänger tidigare process på port $port..."
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}

cleanup() {
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "🔧 Startar Railworker lokalt..."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$NVM_DIR/nvm.sh"
  nvm use "$(cat "$BACKEND_DIR/.nvmrc")" >/dev/null
else
  echo "❌ nvm hittades inte. Installera Node 22 och försök igen."
  exit 1
fi

kill_port_if_busy 4000
kill_port_if_busy 3000

echo "🚀 Startar backend på port 4000..."
cd "$BACKEND_DIR"
npm start &
BACKEND_PID=$!

echo "🌐 Startar frontend på port 3000..."
cd "$FRONTEND_DIR"
npm start &
FRONTEND_PID=$!

cd "$ROOT_DIR"

echo "✅ Backend PID: $BACKEND_PID"
echo "✅ Frontend PID: $FRONTEND_PID"
echo "🔗 Lokal: http://localhost:3000"
echo "📱 Mobil på samma nät: http://192.168.32.4:3000"
echo "🛑 Avsluta med Ctrl+C"

wait "$BACKEND_PID" "$FRONTEND_PID"
