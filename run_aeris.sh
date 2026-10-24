#!/usr/bin/env bash
# ===============================================================================
#                AERIS 2.0 -- AI-Powered Epidemic Risk Intelligence
#                               Team Sentinel
#       "A risk signal is a prompt to verify, not a confirmed outbreak."
# ===============================================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=== AERIS 2.0 Startup Initiated ==="

# 1. Check Python
if ! command -v python3 &>/dev/null; then
    echo "[ERROR] python3 not found! Please install Python 3.10+."
    exit 1
fi

# 2. Check Node
if ! command -v npm &>/dev/null; then
    echo "[ERROR] npm not found! Please install Node.js 18+."
    exit 1
fi

# 3. Seed Database if needed
cd "$PROJECT_ROOT/apps/api"
if [ ! -f "aeris2.db" ]; then
    echo "[1/3] Database aeris2.db not found. Initializing and seeding 47 NE villages..."
    python3 seed.py
else
    echo "[1/3] Database aeris2.db detected."
fi

# 4. Start Backend
echo "[2/3] Starting FastAPI backend on http://localhost:8000..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 5. Start Frontend
echo "[3/3] Starting Vite frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/apps/web"
npm run dev -- --host --port 5173 &
FRONTEND_PID=$!

echo "==============================================================================="
echo "   AERIS 2.0 Sentinel is live!"
echo "   - Web App: http://localhost:5173"
echo "   - API Docs: http://localhost:8000/docs"
echo "   Press Ctrl+C to stop both servers."
echo "==============================================================================="

trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM
wait
