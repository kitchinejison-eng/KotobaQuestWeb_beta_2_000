// ことばクエスト PC ver1.2.1 — 画像参照・移行先検証
// 実行: node tools/verify-image-paths.cjs
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const m=JSON.parse(fs.readFileSync(path.join(ROOT,'IMAGE_RELOCATION_MANIFEST.json'),'utf8'));
const IMAGE_RE=/(?:\.\/|\.\.\/)*images\/[\w.\-/]+\.(?:jpe?g|png|svg|gif|webp|avif)/gi;
const OLD_DIRS=['images/ivent/','images/quiz-jpg/','images/scenes-jpg/','assets/images/','assets/icons/','assets/articulation-mouth-', 'images/gesture-','images/naming-'];
let totalImages=0,checked=0;
for(const [dest,hash] of Object.entries(m.sha256_new)) {
  const file=path.join(ROOT,dest);assert(fs.existsSync(file),`画像が見つかりません: ${dest}`);
  const sum=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(sum,hash,`画像内容が不一致: ${dest}`); totalImages++;
}
function visit(base){for(const name of fs.readdirSync(base)){
 const p=path.join(base,name);const st=fs.statSync(p);
 if(st.isDirectory()) {if(name==='fontawesome'||name==='node_modules') continue;visit(p);continue;}
 const ext=path.extname(name).toLowerCase();
 if(!['.js','.cjs','.css','.html','.webmanifest'].includes(ext))continue;
 if(st.size>2_000_000)continue;
 if(path.basename(p)==='verify-image-paths.cjs')continue;
 const src=fs.readFileSync(p,'utf8');
 for(const legacy of OLD_DIRS) assert(!src.includes(legacy),`旧画像パスが残っています: ${path.relative(ROOT,p)} / ${legacy}`);
 for(const hit of src.matchAll(IMAGE_RE)) {
   const s=hit[0];if(s==='images/xxx.jpg') continue; // existing explanatory placeholder
   const file=path.resolve(['.js','.cjs','.webmanifest'].includes(ext) ? ROOT : path.dirname(p),s);
   assert(fs.existsSync(file),`参照画像が見つかりません: ${path.relative(ROOT,p)} -> ${s}`);
   checked++;
 }
}}
visit(ROOT);
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
for(const icon of manifest.icons) assert(fs.existsSync(path.join(ROOT,icon.src)),`アプリアイコンが見つかりません: ${icon.src}`);
const sw=fs.readFileSync(path.join(ROOT,'service-worker.js'),'utf8');
assert(sw.includes(manifest.icons[0].src),`初期キャッシュ内に基本アプリアイコン指定がありません: ${manifest.icons[0].src}`);
assert(fs.readFileSync(path.join(ROOT,'shiba-burger-r4','styles','style.css'),'utf8').includes('../../images/games/shiba-burger/burger-shop-bg.png'),'しばバーガー背景の参照がありません');
console.log(`[OK] 画像 ${totalImages} 点、画像参照 ${checked} 件、マニフェスト・キャッシュ・しばバーガー背景: 正常`);
