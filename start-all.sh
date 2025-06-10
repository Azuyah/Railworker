#!/bin/bash

echo "🔧 Starting Railworker..."

# Start backend
echo "🚀 Starting backend on port 4000..."
cd backend
node index.js &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🌐 Starting frontend (React)..."
cd railworker-frontend
npm start &
FRONTEND_PID=$!
cd ..

# Display process info
echo "✅ Backend PID: $BACKEND_PID"
echo "✅ Frontend PID: $FRONTEND_PID"

# Keep script alive while both run
wait $BACKEND_PID $FRONTEND_PID