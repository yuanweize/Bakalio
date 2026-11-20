#!/bin/sh
set -eu
RS_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$RS_ROOT"
docker compose --profile dev up -d
exec "$RS_ROOT/scripts/wasp" start --client-port 4310 --server-port 4311
