#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
RS_BACKUP="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RS_BACKUP"
chmod 700 backups "$RS_BACKUP"
docker compose -f compose.yaml -f compose.production.yaml stop api
trap 'docker compose -f compose.yaml -f compose.production.yaml start api >/dev/null' EXIT
docker compose exec -T db pg_dump -U research -d research -Fc > "$RS_BACKUP/database.dump"
docker compose -f compose.yaml -f compose.production.yaml run --rm --no-deps -T --entrypoint tar api czf - -C /private/files . > "$RS_BACKUP/files.tar.gz"
docker compose -f compose.yaml -f compose.production.yaml start api
git rev-parse HEAD > "$RS_BACKUP/commit.txt"
printf 'Backup: %s\n' "$RS_BACKUP"
