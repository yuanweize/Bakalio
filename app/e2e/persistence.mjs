import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const wire=JSON.parse(await readFile('../.data/wire.json'));
async function op(name,args){const r=await fetch('http://127.0.0.1:4311/operations/'+name,{method:'POST',headers:{'Content-Type':'application/json',authorization:wire.headers.authorization},body:JSON.stringify({json:args})});assert.equal(r.status,200);return (await r.json()).json;}
const data=await op('get-studio',{});const attachments=[];
for(const s of data.sources.filter(s=>s.storageKey)){const f=await op('mutate-studio',{kind:'source.download',id:s.id});attachments.push({id:s.id,sha256:createHash('sha256').update(Buffer.from(f.base64,'base64')).digest('hex')});}
const snapshot={projects:data.projects,sources:data.sources,attachments};
if(process.argv[2]==='snapshot')await writeFile('../.data/persistence.json',JSON.stringify(snapshot),{mode:0o600});
else {assert.deepEqual(snapshot,JSON.parse(await readFile('../.data/persistence.json')));console.log('Container restart preserved documents, sources and attachment SHA-256 values.');await writeFile('../artifacts/persistence-report.json',JSON.stringify({passed:true,projects:data.projects.length,attachments:attachments.length}));}
