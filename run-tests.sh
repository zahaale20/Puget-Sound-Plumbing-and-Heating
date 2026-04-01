#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Backend Tests (pytest) ==="
cd "$DIR/server"
python3 -m pytest tests/ -v --tb=short

echo ""
echo "=== Frontend Tests (vitest) ==="
cd "$DIR/client"
npx vitest run
