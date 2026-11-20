#!/bin/sh
# Restore into a disposable PostgreSQL container, never into the running database.
set -eu
cd "$(dirname "$0")/.."
RS_BACKUP=${1:?Usage: scripts/check-backup.sh backups/TIMESTAMP}
test -s "$RS_BACKUP/database.dump"
test -s "$RS_BACKUP/files.tar.gz"
RS_CONTAINER="research-studio-restore-check-$(date +%s)"
trap 'docker rm -f "$RS_CONTAINER" >/dev/null 2>&1 || true' EXIT
# No ports or persistent volumes; trust applies only inside this disposable container.
docker run -d --name "$RS_CONTAINER" --network none --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=research -e POSTGRES_DB=restore_check postgres:16.6-alpine >/dev/null
RS_ATTEMPT=0
until docker exec "$RS_CONTAINER" pg_isready -U research >/dev/null 2>&1; do
 RS_ATTEMPT=$((RS_ATTEMPT+1))
 test "$RS_ATTEMPT" -lt 30
 sleep 1
done
docker exec -i "$RS_CONTAINER" pg_restore -U research -d restore_check --no-owner --exit-on-error < "$RS_BACKUP/database.dump"
docker exec "$RS_CONTAINER" psql -U research -d restore_check -v ON_ERROR_STOP=1 -c 'SELECT (SELECT count(*) FROM "Project") AS projects, (SELECT count(*) FROM "Document") AS documents, (SELECT count(*) FROM "Source") AS sources;'
tar tzf "$RS_BACKUP/files.tar.gz" >/dev/null
# Read every restored attachment and verify its size against the restored database.
docker exec -i "$RS_CONTAINER" sh -c 'mkdir /tmp/restored-files && tar xzf - -C /tmp/restored-files' < "$RS_BACKUP/files.tar.gz"
docker exec "$RS_CONTAINER" sh -c 'psql -U research -d restore_check -At -F " " -c '\''SELECT "storageKey", bytes FROM "Source" WHERE "storageKey" IS NOT NULL'\'' | while read key bytes; do actual=$(wc -c < "/tmp/restored-files/$key"); test "$actual" -eq "$bytes" || exit 1; done'
printf 'Database and attachment restore passed: %s\n' "$RS_BACKUP"
