const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('exploration ranks model candidates, preserves fixed values and invalidates stale results',async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{
 const page=await browser.newPage();
 await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
 assert.equal(await page.locator('#exploreBtn').count(),1,'model exploration button exists');
 await page.locator('#exploreBtn').click();
 const rows=page.locator('#exploreBody tr[data-wind]');
 assert((await rows.count())>0);
 const winds=await rows.evaluateAll(rs=>rs.map(r=>Number(r.dataset.wind)));
 assert.deepEqual(winds,[...winds].sort((a,b)=>b-a));
 const fixed=await page.locator('#area').inputValue();
 const ksw=await page.locator('#ksw').inputValue();
 const expected=await rows.first().getAttribute('data-wind');
 await rows.first().locator('button').click();
 assert.equal(await page.locator('#wind').textContent(),Number(expected).toFixed(2)+' m/s');
 assert.equal(await page.locator('#area').inputValue(),fixed);
 assert.equal(await page.locator('#ksw').inputValue(),ksw);
 assert.equal(await rows.count(),0);
 await page.locator('#exploreBtn').click();
 await page.locator('#searchVinMin').fill('10');
 await page.locator('#exploreBtn').click();
 assert.match(await page.locator('#exploreSummary').textContent(),/범위/);
 assert.equal(await rows.count(),0);
 await page.locator('#searchVinMin').fill('0');
 await page.locator('#searchVinMax').fill('0');
 await page.locator('#exploreBtn').click();
 assert.equal(await rows.count(),0);
 assert.match(await page.locator('#exploreSummary').textContent(),/0개/);
 }finally{await browser.close();}
});
