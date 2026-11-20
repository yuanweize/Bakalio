import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();p.on('console',m=>{if(m.type()==='error')console.log(m.text())});p.on('pageerror',e=>console.log('PAGE',e.message));await p.goto('http://localhost:4310/en',{waitUntil:'networkidle'});await p.waitForTimeout(1000);await b.close();
