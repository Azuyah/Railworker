#!/bin/bash

set -e

echo "🔧 Starting Railworker..."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$NVM_DIR/nvm.sh"
  nvm use "$(cat backend/.nvmrc)" >/dev/null
else
  echo "❌ nvm hittades inte. Installera Node 22 och försök igen."
  exit 1
fi

# Start backend
echo "🚀 Starting backend on port 4000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🌐 Starting frontend (React)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Display process info
echo "✅ Backend PID: $BACKEND_PID"
echo "✅ Frontend PID: $FRONTEND_PID"

# Keep script alive while both run
wait $BACKEND_PID $FRONTEND_PID
