import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=process.env.RS_BASE||'http://localhost:4320';
const qa=JSON.parse(await readFile('../.data/qa.json','utf8'));
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>localStorage.setItem('rs.locale','en'));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
await page.goto(base+'/login');await page.getByLabel('Email',{exact:true}).fill(qa.email);await page.getByLabel('Password',{exact:true}).fill(qa.password);await page.getByRole('button',{name:'Log in',exact:true}).click();await expect(page).toHaveURL(base+'/app');
await page.getByRole('button',{name:'New project',exact:true}).first().click();await page.getByLabel('Title',{exact:true}).fill('Proposal workflow · fictional QA');await page.getByRole('button',{name:'Save',exact:true}).click();
await page.reload();
await page.getByLabel('Proposal text',{exact:true}).fill('Title: Campus study\nResearch question: How are campus spaces used?\nMethod: Interviews\nData: Not collected yet');
await page.getByRole('button',{name:'Locate requirements',exact:true}).click();await expect(page.getByText('Review your requirements',{exact:true})).toBeVisible();
await page.getByRole('button',{name:'Confirm & build a generic blueprint',exact:true}).click();await expect(page.getByText('Generic structure · not AI-generated or university-approved')).toBeVisible();
await page.getByLabel('Section title',{exact:true}).first().fill('My introduction');
await page.getByRole('button',{name:'Save blueprint & create sections',exact:true}).click();await expect(page.locator('.thesis-section-row')).toHaveCount(6);
await page.reload();await expect(page.locator('.thesis-section-row')).toHaveCount(6);await expect(page.locator('.thesis-section-row').first()).toContainText('My introduction');
await mkdir('../artifacts/thesis',{recursive:true});await page.screenshot({path:'../artifacts/thesis/workflow-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../artifacts/thesis/workflow-mobile.png',fullPage:true});
await page.locator('.thesis-section-row a').first().click();await expect(page.locator('.tiptap')).toBeVisible();await page.locator('.tiptap').fill('This is a fictional introduction. No research findings are asserted.');await expect(page.getByText('All changes saved',{exact:true})).toBeVisible({timeout:15000});await page.reload();await expect(page.locator('.tiptap')).toContainText('fictional introduction');
await writeFile('../artifacts/thesis/report.json',JSON.stringify({passed:['proposal saved','requirements located','confirmed blueprint','six persistent sections','edited title persisted','section editor autosave'],errors},null,2));if(errors.length)throw Error(errors.join('\n'));
console.log('Thesis workflow passed');
}finally{await browser.close();}
