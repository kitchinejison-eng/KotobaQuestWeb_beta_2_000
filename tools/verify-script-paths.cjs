// 【ことばクエスト｜ファイル関係検証】Node.js v18以降で実行。
// HTMLの読み込み先、CSSの背景画像、Service Workerのキャッシュ一覧を確認します。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');let count=0;
function walk(d){const out=[];for(const name of fs.readdirSync(d)){const p=path.join(d,name);const st=fs.statSync(p);if(st.isDirectory()){if(name==='fontawesome'||name==='vendor')continue;out.push(...walk(p))}else out.push(p)}return out;}
function local(u){return u&&!/^(?:https?:|data:|mailto:|javascript:|#|\/\/)/i.test(u)}
function check(p,u){const name=u.split(/[?#]/)[0];if(!local(name)||!name||!/.\.(?:js|css|html?|png|jpe?g|svg|glb|webmanifest|woff2?|ttf)$/i.test(name))return;
 const target=path.resolve(path.dirname(p),name);assert(fs.existsSync(target),`参照がありません: ${path.relative(ROOT,p)} → ${u}`);count++}
for(const p of walk(ROOT)){
 const ext=path.extname(p).toLowerCase();if(!['.html','.css'].includes(ext))continue;
 const s=fs.readFileSync(p,'utf8');
 if(ext==='.html')for(const m of s.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi))check(p,m[1]);
 if(ext==='.css')for(const m of s.matchAll(/url\(\s*["']?([^\)'"\s]+)/gi))check(p,m[1]);
}
const sw=fs.readFileSync(path.join(ROOT,'service-worker.js'),'utf8');
const shell=sw.split('const APP_SHELL = [')[1]?.split('];')[0];assert(shell,'APP_SHELL が見つかりません');
for(const m of shell.matchAll(/["']([^"']+)["']/g)){
 const u=m[1];if(u==='./')continue;
 const f=path.resolve(ROOT,u.split(/[?#]/)[0]);assert(fs.existsSync(f),`オフラインキャッシュ参照がありません: ${u}`);count++;
}
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/SCRIPT_RELOCATION_MANIFEST.json'),'utf8'));
for(const target of Object.values(manifest.old_to_new))assert(fs.existsSync(path.join(ROOT,target)),`移動後ファイルがありません: ${target}`);
const shiba=fs.readFileSync(path.join(ROOT,'shiba-burger-r4/index.html'),'utf8');
assert(shiba.includes('scripts/app-classic.js')&&shiba.includes('scripts/scene3d-classic.js'),'しばバーガーR4 の新しいJSを読み込めません');
console.log(`[OK] ${count}件の静的参照と ${Object.keys(manifest.old_to_new).length}件の移動先を検証しました。`);
