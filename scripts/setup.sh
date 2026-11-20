#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --input-type=module <<'JS'
import fs from 'node:fs';import {randomBytes} from 'node:crypto';
if(!fs.existsSync('.env')){const password=randomBytes(32).toString('hex'),secret=randomBytes(48).toString('hex');fs.writeFileSync('.env',`POSTGRES_PASSWORD=${password}\nJWT_SECRET=${secret}\nPUBLIC_WEB_URL=http://localhost:4310\nPUBLIC_API_URL=http://localhost:4311\nREGISTRATION_ENABLED=true\n`,{mode:0o600});}
if(!fs.existsSync('app/.env.server')){const entries=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1)]}));fs.writeFileSync('app/.env.server',`DATABASE_URL=postgresql://research:${entries.POSTGRES_PASSWORD}@127.0.0.1:55461/research\nJWT_SECRET=${entries.JWT_SECRET}\nSMTP_HOST=127.0.0.1\nSMTP_PORT=11261\nSMTP_USERNAME=research\nSMTP_PASSWORD=local-mail-only\nREGISTRATION_ENABLED=true\n`,{mode:0o600});}
JS
./scripts/install-wasp.sh
./scripts/wasp install
docker compose --profile dev up -d db mail
./scripts/wasp compile
node scripts/migrate.mjs
