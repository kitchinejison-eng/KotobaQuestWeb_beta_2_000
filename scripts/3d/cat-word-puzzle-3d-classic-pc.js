/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/3d/cat-word-puzzle-3d-classic-pc.js
 * 役割：猫パズルのPC用3D描画処理
 * 利用画面：cat-word-puzzle.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエストPC R8: オフラインでも使えるクラシックJS。元のThree.js MITライセンス素材から生成。 */
(function(){
const THREE=window.THREE,GLTFLoader=window.KQGLTFLoader;
/* VETA28 — ことばパズル用3D猫ガーデン。
 * 本物の猫に近いBicolor Cat/kenchooの既存GLBを使用。箱や球で猫を代用しません。
 * 失敗時は呼び出し側が絵文字フォールバックで問題を継続します。
 */


async function mount3DCat(container) {
  if (!container) throw Error('3D表示場所がありません');
  const probe=document.createElement('canvas');
  if (!probe.getContext('webgl2')&&!probe.getContext('webgl')) throw Error('WebGLを利用できません');
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#b2d6c5');
  scene.fog=new THREE.Fog('#b2d6c5',7.5,23);
  const camera=new THREE.PerspectiveCamera(44,1,.05,60);
  camera.position.set(0,1.1,2.55);
  camera.lookAt(0,.41,0);
  const lowPower=window.innerWidth<=780||(navigator.deviceMemory&&navigator.deviceMemory<=4);
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;
  const renderer=new THREE.WebGLRenderer({antialias:!lowPower,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1.15:1.35));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.14;
  renderer.shadowMap.enabled=!lowPower;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const ambient=new THREE.HemisphereLight('#ffffff','#739f85',2.2);scene.add(ambient);
  const sunlight=new THREE.DirectionalLight('#ffeac9',2.9);sunlight.position.set(-2.7,6,3.5);
  sunlight.castShadow=!lowPower;sunlight.shadow.mapSize.set(512,512);
  sunlight.shadow.camera.left=-5;sunlight.shadow.camera.right=5;
  sunlight.shadow.camera.top=5;sunlight.shadow.camera.bottom=-5;
  scene.add(sunlight);
  const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
  const grass=mat('#86b88d'),stone=mat('#dbcfaf'),bark=mat('#86664b'),leaves=mat('#4d9978'),leaves2=mat('#8abf8b'),flower=mat('#f6d88d');
  const mesh=(geometry,material,parent,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=!lowPower;m.receiveShadow=!lowPower;parent.add(m);return m};
  const ground=mesh(new THREE.CircleGeometry(14,64),grass,scene,0,-.04,0);
  ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  const platform=mesh(new THREE.CylinderGeometry(.88,1.04,.14,40),stone,scene,0,-.10,0);platform.castShadow=false;
  const catRoot=new THREE.Group();scene.add(catRoot);
  const catModel=await new Promise((resolve,reject)=>new GLTFLoader().load('tuxedo-cat.glb',g=>resolve(g.scene),undefined,reject));
  if(!catModel)throw Error('猫の3Dモデルを読み込めません');
  catRoot.add(catModel);
  catModel.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(catModel);
  const size=new THREE.Vector3();bounds.getSize(size);
  if(size.y<.001)throw Error('猫の3Dモデルのサイズが不正です');
  const scale=.77/size.y;
  catModel.scale.setScalar(scale);
  catModel.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
  // モデルの内部を透けさせず、実物の骨格と毛色を保ちます。
  catModel.traverse(object=>{
    if(!object.isMesh)return;
    object.castShadow=!lowPower;object.receiveShadow=!lowPower;object.frustumCulled=false;
    for(const material of (Array.isArray(object.material)?object.material:[object.material])){
      if(!material)continue;
      material.transparent=false;material.opacity=1;material.alphaTest=0;
      material.depthTest=true;material.depthWrite=true;material.side=THREE.DoubleSide;material.needsUpdate=true;
    }
  });
  const tailParts=[];
  for(let i=0;i<4;i++){
    const tail=catModel.getObjectByName('Wolf_Tail_01_0'+(i+2)+'SHJnt_'+(37-i));
    if(tail)tailParts.push({node:tail,rest:tail.quaternion.clone(),index:i});
  }
  // 周辺は軽量な3D植物のみ。主役の猫のシルエットを隠しません。
  const decor=new THREE.Group();scene.add(decor);
  for(const side of [-1,1]){
    for(let i=0;i<4;i++){
      const z=-2.2+i*1.34,x=side*(1.15+i*.22);
      mesh(new THREE.CylinderGeometry(.06,.09,.47,8),bark,decor,x,.18,z);
      mesh(new THREE.IcosahedronGeometry(.38,1),i%2?leaves:leaves2,decor,x,.57,z);
    }
  }
  for(let i=0;i<38;i++){
    const angle=i*2.39996,r=1.18+(i%5)*.29,x=Math.cos(angle)*r,z=Math.sin(angle)*r;
    if(z>.42&&Math.abs(x)<.8)continue;
    const m=mesh(new THREE.IcosahedronGeometry(.04+(i%3)*.012,0),flower,decor,x,.08,z);m.castShadow=false;
  }
  for(const z of [-1.65,-2.55,-3.3]){
    const path=mesh(new THREE.CylinderGeometry(.34,.34,.025,14),stone,decor,0,-.025,z);path.castShadow=false;
  }
  const fallback=container.querySelector('#catFallback');
  if(fallback)fallback.hidden=true;
  container.appendChild(renderer.domElement);
  let disposed=false,started=false,elapsed=0,celebrating=0,renderedStatic=false;
  const resize=()=>{
    if(disposed)return;
    const rect=container.getBoundingClientRect();
    const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
    renderer.setSize(w,h,false);renderedStatic=false;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    camera.position.z=w<400?2.8:2.55;
  };
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
  observer?.observe(container);
  window.addEventListener('resize',resize);
  resize();
  let raf=0,last=performance.now(),lastRender=0;
  const frame=now=>{
    if(disposed)return;
    raf=requestAnimationFrame(frame);
    if(document.hidden)return;
    if(now-lastRender<(lowPower?1000/30:1000/45))return;
    lastRender=now;
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!started){if(!renderedStatic){renderer.render(scene,camera);renderedStatic=true}return}
    if(reducedMotion){renderer.render(scene,camera);return}
    elapsed+=dt;
    celebrating=Math.max(0,celebrating-dt);
    const jump=celebrating>0?Math.sin((1.2-celebrating)*13)*.045:0;
    catRoot.position.y=Math.sin(elapsed*2.4)*.009+Math.max(0,jump);
    catRoot.rotation.y=Math.sin(elapsed*.8)*.13+(celebrating>0?Math.sin(elapsed*13)*.13:0);
    for(const tail of tailParts){
      const angle=Math.sin(elapsed*2.15+tail.index*.55)*(.09+tail.index*.02);
      const twist=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle);
      tail.node.quaternion.copy(tail.rest).multiply(twist);
    }
    renderer.render(scene,camera);
  };
  raf=requestAnimationFrame(frame);
  return {
    start(){started=true},
    celebrate(){celebrating=1.2},
    dispose(){
      if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer?.disconnect();window.removeEventListener('resize',resize);
      scene.traverse(object=>{
        if(object.geometry)object.geometry.dispose();
        if(object.material){for(const material of(Array.isArray(object.material)?object.material:[object.material])){
          if(material.map)material.map.dispose();
          material.dispose();
        }}
      });
      renderer.dispose();renderer.domElement.remove();
    }
  };
}

window.KQMount3DCat=mount3DCat;
})();
