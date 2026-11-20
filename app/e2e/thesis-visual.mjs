import {chromium,expect} from '@playwright/test';import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base=process.env.RS_BASE||'http://localhost:4320';const qa=JSON.parse(await readFile('../.data/qa.json','utf8'));const browser=await chromium.launch({channel:'chrome'});const context=await browser.newContext();const p=await context.newPage();
await p.goto(base+'/en');await p.evaluate(()=>localStorage.setItem('rs.locale','en'));await p.goto(base+'/login');await p.getByLabel('Email',{exact:true}).fill(qa.email);await p.getByLabel('Password',{exact:true}).fill(qa.password);await p.getByRole('button',{name:'Log in',exact:true}).click();await expect(p).toHaveURL(base+'/app');
const rows=[];await mkdir('../artifacts/thesis/matrix',{recursive:true});
for(const locale of ['cs','en','zh'])for(const theme of ['light','dark'])for(const width of [390,768,1440]){
 await p.evaluate(({locale,theme})=>{localStorage.setItem('rs.locale',locale);localStorage.setItem('rs.theme',theme);},{locale,theme});await p.setViewportSize({width,height:1000});
 for(const route of ['/app','/'+locale]){const errors=[];const listener=e=>errors.push(e.message);p.on('pageerror',listener);await p.goto(base+route);await p.waitForTimeout(350);const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(width===390||width===1440)await p.screenshot({path:`../artifacts/thesis/matrix/${route==='/app'?'workspace':'landing'}-${locale}-${theme}-${width}.png`,fullPage:true});rows.push({route,locale,theme,width,overflow,errors});p.off('pageerror',listener);}
}
await writeFile('../artifacts/thesis/matrix.json',JSON.stringify(rows,null,2));await browser.close();console.log(JSON.stringify({cases:rows.length,failures:rows.filter(r=>r.overflow||r.errors.length)}));
