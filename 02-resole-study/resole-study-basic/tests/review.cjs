// Checks the extracted review version only. Uses an isolated headless browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const {pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!['node_modules','.git'].includes(e.name)?walk(path.join(p,e.name)):[path.join(p,e.name)]);
(async()=>{
 for(const f of walk(root).filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});
 console.log('JS syntax OK');
 const browser=await chromium.launch({headless:true});
 const issues=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.setDefaultTimeout(5000);
  let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const files=walk(root).filter(f=>f.endsWith('.html')&&(!process.env.REVIEW_TARGET||process.env.REVIEW_TARGET.split(',').some(t=>f.includes(t))));
  const targets=files.flatMap(f=>f.includes('/admin-prototype/')&&!f.endsWith('/login.html')?[pathToFileURL(f).href+'?role=teacher',pathToFileURL(f).href+'?role=super']:[pathToFileURL(f).href]);
  for(const url of targets){
   errors=[];await page.goto(url);await page.waitForTimeout(90);
   if(errors.length)issues.push([url,errors]);
   const missing=await page.evaluate(()=>[...document.querySelectorAll('script[src],link[href],a[href]')].map(e=>e.src||e.href).filter(h=>h.startsWith('file:')));
   for(const u of missing){const f=fileURLToPath(new URL(u));if(!fs.existsSync(f))issues.push([url,'missing '+f]);}
   const invalid=await page.evaluate(()=>typeof routes==='undefined'?[]:[...document.querySelectorAll('[data-go]')].filter(e=>!routes[e.dataset.go]).map(e=>e.dataset.go));if(invalid.length)issues.push([url,'invalid routes: '+invalid.join(',')]);
   const text=await page.locator('body').innerText();
   const forbidden=text.match(/智能建课|AI 出题|AI 教学建议|AI 分身|AI 学习包|进入直播课堂|编程列表|配置课程付费|我的购买|积分排行榜/g);
   if(forbidden&&!url.includes('review-requirements.html'))issues.push([url,'out of scope: '+forbidden.join(',')]);
   if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))issues.push([url,'horizontal overflow']);
  }
  console.log(JSON.stringify(issues,null,2));assert.deepEqual(issues,[]);console.log('retained pages and resources OK');
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
