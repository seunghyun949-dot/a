const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs/promises');

test('unresolved power-limited results never become wind predictions or ranked recommendations',async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try {
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href);
  const set=async(id,v)=>page.locator('#'+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},v);
  for(const gap of [10,30,60,100,200]){
   await set('gap',gap);
   for(const id of ['wind','thrust','gf','coronaCurrent']) assert.match(await page.locator('#'+id).textContent(),/계산 불가/);
   assert.match(await page.locator('#coronaState').textContent(),/판정 보류/);
   assert.doesNotMatch(await page.locator('#drawIonState').textContent(),/ACTIVE/);
  }
  await page.locator('#savePresetBtn').click();
  assert.match(await page.locator('#savedBody').textContent(),/계산 불가/);
  const downloadPromise=page.waitForEvent('download');await page.locator('#csvBtn').click();
  const download=await downloadPromise;
  const [header,row]=(await fs.readFile(await download.path(),'utf8')).trim().split('\n').map(x=>x.split(','));
  for(const name of ['CoronaCurrent_A','Thrust_N','Wind_mps']) assert.equal(row[header.indexOf(name)],'');
  assert.equal(row[header.indexOf('EHDStatus')],'power-limited');
  assert(Number(row[header.indexOf('PowerCurrentLimit_A')])>0);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copied=text;}},configurable:true}));
  await page.locator('#copyBtn').click();
  assert.match(await page.evaluate(()=>window.copied),/Wind: 계산 불가/);
  await page.locator('#exploreBtn').click();
  assert.match(await page.locator('#exploreSummary').textContent(),/현재 계산 불가/);
  assert((await page.locator('#exploreBody tr').count())>0);
  assert.match(await page.locator('#exploreBody').textContent(),/비교 불가/);
  assert.equal(await page.locator('#includeLimited').count(),0);
  for(const id of ['searchVinMin','searchVinMax']) await set(id,3.7);
  for(const id of ['searchRadiusMin','searchRadiusMax']) await set(id,.1);
  await page.locator('#exploreBtn').click();
  assert.equal(await page.locator('#exploreBody tr').count(),0);
  await set('ilim',0);
  assert.equal(await page.locator('#wind').textContent(),'0.00 m/s');
  await page.locator('#resetBtn').click();await set('vin',1.25);
  assert.match(await page.locator('#wind').textContent(),/^[\d.]+ m\/s$/);
  assert.doesNotMatch(await page.locator('body').innerText(),/NaN|Infinity/);
  assert.deepEqual(errors,[]);
 } finally {await browser.close();}
});
