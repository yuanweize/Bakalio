#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
./scripts/install-wasp.sh
if [ ! -d app/node_modules ]; then ./scripts/wasp install; fi
./scripts/wasp build
cd app
REACT_APP_API_URL="${PUBLIC_API_URL:-http://localhost:4311}" npm exec vite build

cd ..
node scripts/finalize-web.mjs
