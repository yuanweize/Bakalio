import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const env={...process.env};if(fs.existsSync('app/.env.server'))for(const line of fs.readFileSync('app/.env.server','utf8').split('\n')){const i=line.indexOf('=');if(i>0&&!line.startsWith('#'))env[line.slice(0,i)]=line.slice(i+1);}
if(!env.DATABASE_URL)throw Error('Set DATABASE_URL or run scripts/setup.sh first.');
const r=spawnSync('npm',['exec','--','prisma','migrate','deploy','--schema','.wasp/out/db/schema.prisma'],{cwd:'app',env,stdio:'inherit'});process.exit(r.status??1);
