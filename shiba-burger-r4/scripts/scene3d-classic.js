/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：shiba-burger-r4/scripts/scene3d-classic.js
 * 役割：R4版の柴犬・お客様・厨房・レジを表示する3Dシーン
 * 利用画面：shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* original visual design, offline 3D engine */
(function(){
const THREE=window.THREE,GLTFLoader=window.KQGLTFLoader;


// しばバーガー：Three.jsで描画する3D店内と柴犬店長、お客様のリアクション。
// WebGL非対応時は app.js のイラスト表示へ自動フォールバックする。
// 【createBurgerScene】しばバーガーの3D画面を作ります。低性能環境では2D表示に戻せる状態を維持します。
async function createBurgerScene(host){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c9d7c0');scene.fog=new THREE.FogExp2('#d8e1cd',.024);
  const camera=new THREE.PerspectiveCamera(47,innerWidth/innerHeight,.05,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const clock=new THREE.Clock(),target=new THREE.Vector3(0,1.55,-2);
  camera.position.set(.3,3.45,10.1);camera.lookAt(target);
  const mat=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const wood=mat(0x976744,.63),darkWood=mat(0x5c4130,.74),cream=mat(0xece5d4,.93),green=mat(0x315c4d,.78),sage=mat(0x5d8a6f,.8),gold=mat(0xddb778,.34,.4),black=mat(0x263a32,.75),steel=mat(0x85978d,.33,.45);
  const bgTiles=mat(0xe8e1d4,.93),sunlight=mat(0xffe2a2,.5),linen=mat(0xf6e9d2,.9);
  const shapes={sphere:new THREE.SphereGeometry(1,22,14),box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,18)};
  function add(geo,material,parent=scene,pos=[0,0,0],rot=null,scale=null,shadow=true){
    const o=new THREE.Mesh(geo,material);o.position.set(...pos);if(rot)o.rotation.set(...rot);if(scale)o.scale.set(...scale);o.castShadow=shadow;o.receiveShadow=shadow;parent.add(o);return o;
  }
  function box(parent,material,pos,size,shadow=true){return add(shapes.box,material,parent,pos,null,size,shadow)}
  function sphere(parent,material,pos,size,shadow=true){return add(shapes.sphere,material,parent,pos,null,size,shadow)}
  function cylinder(parent,material,pos,size,segments=18){return add(new THREE.CylinderGeometry(size[0],size[1],size[2],segments),material,parent,pos)}
  function labelTexture(text,background='#173e32',foreground='#ffe6ab',size=512){
    const cv=document.createElement('canvas');cv.width=size;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,size,128);ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 62px Arial,sans-serif';ctx.fillText(text,size/2,66);const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
  function posterTexture(type){
    const cv=document.createElement('canvas');cv.width=256;cv.height=256;const ctx=cv.getContext('2d');const grad=ctx.createLinearGradient(0,0,256,256);grad.addColorStop(0,'#f4da95');grad.addColorStop(1,'#d6aa58');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);ctx.fillStyle='#335044';ctx.fillRect(8,8,240,240);ctx.fillStyle='#fce2a8';ctx.textAlign='center';ctx.font='bold 17px system-ui';ctx.fillText(['BURGERS','SIDES','DRINKS'][type],128,38);
    if(type===0){ctx.fillStyle='#c17b37';ctx.beginPath();ctx.ellipse(128,107,61,35,0,Math.PI,2*Math.PI);ctx.fill();ctx.fillStyle='#6fa357';ctx.fillRect(70,111,118,15);ctx.fillStyle='#f4c35c';ctx.fillRect(78,126,101,13);ctx.fillStyle='#743f28';ctx.fillRect(75,140,107,18);ctx.fillStyle='#cc8742';ctx.beginPath();ctx.ellipse(128,161,58,17,0,0,Math.PI*2);ctx.fill()}
    if(type===1){ctx.fillStyle='#d45436';ctx.beginPath();ctx.moveTo(78,105);ctx.lineTo(179,105);ctx.lineTo(166,199);ctx.lineTo(92,199);ctx.closePath();ctx.fill();for(let i=0;i<9;i++){ctx.fillStyle='#ffe59e';ctx.fillRect(89+i*10,77+(i%3)*4,7,75)}}
    if(type===2){ctx.fillStyle='#f7eac5';ctx.fillRect(85,82,87,13);ctx.fillStyle='#c75b3e';ctx.fillRect(94,95,70,97);ctx.fillStyle='#f6d6ac';ctx.fillRect(100,100,58,77);ctx.fillStyle='#e3ad67';ctx.fillRect(110,65,6,42)}
    ctx.font='bold 14px system-ui';ctx.fillStyle='#fff1c5';ctx.fillText('FRESH & HAPPY',128,228);const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
  function makeRoom(){
    scene.add(new THREE.HemisphereLight(0xe7f6ff,0x69785d,2.2));
    const sun=new THREE.DirectionalLight(0xffe4b3,2.6);sun.position.set(5,11,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;sun.shadow.bias=-.00035;scene.add(sun);
    box(scene,bgTiles,[0,-.12,0],[24,.2,24]);
    const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=256;const tileCtx=tileCanvas.getContext('2d');tileCtx.fillStyle='#e6ddc7';tileCtx.fillRect(0,0,256,256);tileCtx.strokeStyle='#c7c2ad';tileCtx.lineWidth=4;for(let i=0;i<=4;i++){tileCtx.beginPath();tileCtx.moveTo(i*64,0);tileCtx.lineTo(i*64,256);tileCtx.stroke();tileCtx.beginPath();tileCtx.moveTo(0,i*64);tileCtx.lineTo(256,i*64);tileCtx.stroke()}const tileTex=new THREE.CanvasTexture(tileCanvas);tileTex.wrapS=tileTex.wrapT=THREE.RepeatWrapping;tileTex.repeat.set(4,4);tileTex.colorSpace=THREE.SRGBColorSpace;
    const floor=add(new THREE.PlaneGeometry(24,24),new THREE.MeshStandardMaterial({map:tileTex,roughness:.8}),scene,[0,.0,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;
    box(scene,cream,[0,3,-7.2],[15,6.5,.25]);box(scene,green,[0,1.03,-7.01],[15,2.15,.22]);
    box(scene,cream,[-7.3,3,-1],[.2,6.5,12]);box(scene,green,[-7.14,1.03,-1],[.16,2.15,12]);
    box(scene,cream,[7.3,3,-1],[.2,6.5,12]);box(scene,green,[7.14,1.03,-1],[.16,2.15,12]);
    for(let x=-6.5;x<=6.5;x+=2.2){box(scene,darkWood,[x,6.15,-1],[.23,.36,12.7],false)}
    for(let z=-6.7;z<=5.5;z+=2.7)box(scene,darkWood,[0,6.05,z],[15,.25,.24],false);
    // The window glows with a garden view and wooden crossbars.
    for(const wx of [1.8,4.8]){
      const windowMat=new THREE.MeshBasicMaterial({color:0xb9d9b2});
      box(scene,darkWood,[wx,3.52,-6.91],[2.63,3.05,.18]);
      box(scene,windowMat,[wx,3.52,-6.79],[2.43,2.82,.03],false);
      box(scene,mat(0x9bbc80,.92),[wx,2.55,-6.75],[2.40,.68,.024],false);
      for(let i=-1;i<=1;i++)box(scene,darkWood,[wx+i*.8,3.52,-6.73],[.085,2.82,.07],false);
      box(scene,darkWood,[wx,3.5,-6.72],[2.43,.08,.08],false);
      box(scene,darkWood,[wx,2.57,-6.72],[2.43,.11,.08],false);
    }
    // Illuminated menu boards.
    const boardRoot=new THREE.Group();boardRoot.position.set(-3.6,4.7,-6.88);scene.add(boardRoot);
    for(let i=0;i<3;i++){box(boardRoot,darkWood,[-2.2+i*1.75,0,0],[1.60,1.6,.18]);const menuMat=new THREE.MeshBasicMaterial({map:posterTexture(i)});box(boardRoot,menuMat,[-2.2+i*1.75,0,.105],[1.48,1.45,.02],false)}
    const signMap=labelTexture('SHIBA BURGER');const signMat=new THREE.MeshStandardMaterial({map:signMap,emissive:0x74622d,emissiveIntensity:.35,roughness:.48});box(scene,darkWood,[0,5.8,-6.81],[5,.94,.17]);box(scene,signMat,[0,5.8,-6.69],[4.85,.85,.055],false);
    // Green kitchen cupboards, open shelves and equipment.
    for(let x=-6.5;x<-1;x+=1.2){box(scene,sage,[x,.74,-6.45],[1.08,1.35,.75]);box(scene,gold,[x,.81,-6.0],[.075,.12,.04])}
    box(scene,steel,[-4.8,1.54,-6.38],[3.7,.13,.87]);box(scene,black,[-5.1,1.66,-6.35],[2.1,.06,.64]);
    for(let i=0;i<4;i++)box(scene,mat(0x7d462f,.8),[-5.85+i*.43,1.78,-6.35],[.31,.11,.28]);
    for(const x of [-6.5,-5.1,-3.7]){box(scene,darkWood,[x,2.8,-6.88],[.08,.1,.7]);box(scene,wood,[x,2.78,-6.58],[1.06,.07,.32]);}
    // Pendant lamps over the customer line.
    for(const x of [-4,0,4]){
      box(scene,darkWood,[x,5.55,-1.6],[.03,1.0,.03],false);
      add(new THREE.ConeGeometry(.55,.55,18,1,true),mat(0x9f6945,.3,.45),scene,[x,4.88,-1.6],[Math.PI,0,0]);
      sphere(scene,new THREE.MeshBasicMaterial({color:0xffe8b1}),[x,4.7,-1.6],[.18,.08,.18],false);
      const lamp=new THREE.PointLight(0xffd79c,.7,6,2);lamp.position.set(x,4.6,-1.6);scene.add(lamp);
    }
    // Main checkout counter and point-of-sale register.
    box(scene,green,[0,.7,2.55],[14,1.42,1.2]);
    for(let i=-6;i<=6;i+=.7)box(scene,sage,[i,.68,3.16],[.045,1.27,.07],false);
    box(scene,wood,[0,1.51,2.5],[14.4,.17,1.75]);
    box(scene,darkWood,[-4.1,1.72,2.2],[1.2,.12,.78]);
    box(scene,steel,[-4.1,2.0,2.45],[.82,.58,.14]);
    const regScreen=box(scene,new THREE.MeshBasicMaterial({color:0x90c4a5}),[-4.1,2.0,2.55],[.66,.42,.02],false);
    box(scene,steel,[-3.21,1.7,2.4],[.38,.2,.42]);
    // Small display cases and burger trays on the counter.
    box(scene,linen,[4.1,1.63,2.34],[3.3,.07,1.1]);
    makeBurger(scene,3.15,1.7,2.38,.58);makeBurger(scene,4.65,1.7,2.38,.68);makeFries(scene,5.55,1.68,2.32,.68);
    makeBurger(scene,-5.8,1.64,2.38,.4);
    // A leafy plant and framed shelf on the right side.
    box(scene,wood,[6.2,.68,-4.2],[.78,1.36,.78]);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const leaf=sphere(scene,mat(i%2?0x729555:0x557f56),[6.2+Math.cos(a)*.42,1.83+Math.sin(i)*.28,-4.2+Math.sin(a)*.34],[.42,.68,.4]);leaf.rotation.z=a*.2}
    // The sliding entrance door.
    box(scene,darkWood,[6.82,2.2,-3.6],[.12,4.0,2.6]);box(scene,new THREE.MeshBasicMaterial({color:0x9bc5b0}),[6.72,2.3,-3.6],[.03,3.5,2.2],false);
    for(let z=-4.5;z<=-2.7;z+=.9)box(scene,darkWood,[6.69,2.3,z],[.06,3.5,.065],false);
    // Sunbeams shimmer on the floor; inexpensive transparent planes.
    for(let i=0;i<4;i++){const lightPatch=add(new THREE.PlaneGeometry(1.2,4),new THREE.MeshBasicMaterial({color:0xffedbd,transparent:true,opacity:.07,depthWrite:false}),scene,[1.8+i*1.5,.017,-2.2],[-Math.PI/2,0,-.25],null,false);lightPatch.renderOrder=2}
  }
  function makeBurger(parent,x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);
    cylinder(g,mat(0xb76c31),[0,.10,0],[.56,.58,.19]);cylinder(g,mat(0x6d3f27),[0,.24,0],[.60,.60,.16]);
    cylinder(g,mat(0xf7c653),[0,.33,0],[.62,.62,.055]);cylinder(g,mat(0x4c9a46),[0,.38,0],[.67,.67,.09]);
    cylinder(g,mat(0xdf5b47),[0,.45,0],[.52,.53,.08]);
    const top=sphere(g,mat(0xd78d41,.58),[0,.65,0],[.59,.32,.59]);
    const sesame=mat(0xf7e4b7);for(let i=0;i<12;i++){const a=i*2.399,r=Math.sqrt(i/12)*.43;sphere(g,sesame,[Math.cos(a)*r,.79+(.23-.23*(r/.45)**2),Math.sin(a)*r],[.034,.019,.018],false)}
    return g;
  }
  function makeFries(parent,x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);
    cylinder(g,mat(0xd15b39),[0,.28,0],[.26,.33,.56]);const fryMat=mat(0xf8d374,.76);
    for(let i=0;i<11;i++){const a=i*2.3,r=Math.sqrt(i/11)*.20,fy=.62+(i%4)*.06;box(g,fryMat,[Math.cos(a)*r,fy,Math.sin(a)*r],[.07,.52,.075],false)}
  }

  let customer=null,customerMode='none',customerClock=0,customerMood='neutral',exitAngry=false;
  const originalShirtMaterials=[];
  // The customer queue must stay *in front of* the counter (positive Z).
  // Its countertop ends at z=3.375; the dog stands behind it at z=1.42.
  const CUSTOMER_LINE_Z=4.18,CUSTOMER_CHECKOUT_X=.65,CUSTOMER_FACING=-1.95;
  function makeCustomer(profile,index){
    const root=new THREE.Group(),body=new THREE.Group();root.add(body);
    const skin=mat(profile.skin,.75),hair=mat(profile.hair,.97),shirt=mat(profile.shirt,.8),pants=mat(profile.pants,.93),eye=mat(0x292522,.8),mouthMat=mat(0x763f3b,.88),rose=mat(0xdc8e78,.9);
    const torso=sphere(body,shirt,[0,1.12,0],[.59,.78,.34]);
    sphere(body,skin,[0,1.84,0],[.13,.17,.13]);
    const head=sphere(body,skin,[0,2.16,0],[.49,.55,.42]);
    const leftEar=sphere(body,skin,[-.50,2.13,0],[.09,.19,.13]);const rightEar=sphere(body,skin,[.50,2.13,0],[.09,.19,.13]);
    sphere(body,eye,[-.17,2.22,.393],[.048,.058,.03],false);sphere(body,eye,[.17,2.22,.393],[.048,.058,.03],false);
    sphere(body,linen,[-.158,2.235,.416],[.013,.016,.008],false);sphere(body,linen,[.182,2.235,.416],[.013,.016,.008],false);
    const leftBrow=box(body,hair,[-.17,2.40,.40],[.19,.044,.045],false),rightBrow=box(body,hair,[.17,2.40,.40],[.19,.044,.045],false);
    const happyMouth=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.15,2.05,.42),new THREE.Vector3(0,2.0,.443),new THREE.Vector3(.15,2.05,.42)]),10,.018,5,false),mouthMat,body);
    const angryMouth=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.15,2.05,.42),new THREE.Vector3(0,2.12,.443),new THREE.Vector3(.15,2.05,.42)]),10,.022,5,false),mouthMat,body);angryMouth.visible=false;
    sphere(body,rose,[-.34,2.09,.334],[.08,.04,.02],false).material.transparent=true;
    sphere(body,rose,[.34,2.09,.334],[.08,.04,.02],false);
    sphere(body,hair,[0,2.57,-.04],[.52,.23,.43]);
    if(profile.style==='long'||profile.style==='bob'){
      for(const s of [-1,1])sphere(body,hair,[s*.47,2.25,-.09],[.20,profile.style==='long'?.56:.31,.32]);
    }else if(profile.style==='cap'){
      sphere(body,mat(0x326754),[0,2.68,.05],[.54,.20,.50]);
      box(body,mat(0x326754),[0,2.58,.43],[.68,.07,.28]);
    }else if(profile.style==='short'){
      for(let i=0;i<6;i++)sphere(body,hair,[-.39+i*.16,2.66,.13],[.11,.12,.16]);
    }
    const arms=[];
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.56,1.64,0);body.add(arm);
      const sleeve=sphere(arm,shirt,[side*.08,-.35,0],[.19,.46,.20]);sleeve.rotation.z=side*.15;
      sphere(arm,skin,[side*.15,-.78,.03],[.15,.16,.15]);arms.push(arm);
    }
    for(const side of [-1,1]){
      const leg=sphere(body,pants,[side*.22,.34,0],[.24,.54,.24]);
      sphere(body,mat(0x393b39),[side*.22,.075,.17],[.28,.12,.39]);
    }
    root.userData={body,torso,head,leftBrow,rightBrow,happyMouth,angryMouth,arms,shirt,originalShirt:new THREE.Color(profile.shirt)};
    root.position.set(8,0,CUSTOMER_LINE_Z);
    root.rotation.y=CUSTOMER_FACING-.3;root.scale.setScalar(.92);
    scene.add(root);return root;
  }
  // 【enterCustomer】お客様を客席側からレジへ入場させる演出です。
  function enterCustomer(profile,index){if(customer){scene.remove(customer)}customer=makeCustomer(profile,index);customerMode='enter';customerMood='neutral';customerClock=0;exitAngry=false;}
  // 【react】回答の正誤に合わせてお客様の表情・動きを変えます。
  function react(correct){customerMood=correct?'happy':'angry';customerClock=0;if(!customer)return;
    const d=customer.userData;d.angryMouth.visible=!correct;d.happyMouth.visible=correct;
    d.leftBrow.rotation.z=correct?-.1:.42;d.rightBrow.rotation.z=correct?.1:-.42;
    d.shirt.color.copy(correct?d.originalShirt:new THREE.Color('#b9544a'));
  }
  // 【exitCustomer】お客様が退店する動きです。次のお客様に切り替わるタイミングに注意します。
  function exitCustomer(correct){customerMode='exit';customerClock=0;exitAngry=!correct}
  function reset(){if(customer){scene.remove(customer);customer=null}customerMode='none';customerClock=0;customerMood='neutral'}

  // Place the Shiba on the *kitchen side* of the checkout counter.
  // The counter's rear edge is z=1.625, so z=1.42 stays behind it.
  // On a narrow portrait display, keep the Shiba within the camera's view.
  const dogRoot=new THREE.Group();
  // 【placeShibaBehindCounter】柴犬店長を厨房・レジ側に置き、正面を向くよう配置します。
  function placeShibaBehindCounter(){
    const portrait=innerWidth/Math.max(innerHeight,1)<.8;
    dogRoot.position.set(portrait?-.85:-2.55,1.17,1.42);
  }
  placeShibaBehindCounter();scene.add(dogRoot);
  let dogMixer=null,dogActive=null,dogSmile=0;
  function makeBasicShiba(){const ginger=mat(0xbd7137,.95),white=mat(0xf0e1c1,.96),dark=mat(0x28221e);
    sphere(dogRoot,ginger,[0,.37,0],[.41,.36,.64]);sphere(dogRoot,white,[0,.32,.33],[.34,.29,.29]);
    sphere(dogRoot,ginger,[0,.69,.46],[.36,.33,.31]);sphere(dogRoot,white,[0,.59,.70],[.28,.16,.2]);
    for(const side of [-1,1]){const ear=add(new THREE.ConeGeometry(.17,.31,4),ginger,dogRoot,[side*.23,1.03,.45],[0,0,side*.12]);sphere(dogRoot,dark,[side*.14,.72,.74],[.048,.055,.03]);}
    sphere(dogRoot,dark,[0,.55,.89],[.07,.045,.05]);for(const side of [-1,1])for(const z of [-.3,.34])sphere(dogRoot,ginger,[side*.29,.18,z],[.16,.22,.18]);
    const tail=add(new THREE.TorusGeometry(.25,.12,10,22,Math.PI*1.6),ginger,dogRoot,[0,.66,-.65],[0,Math.PI/2,.5]);return tail;
  }
  let basicDog=makeBasicShiba();
  const scarf=new THREE.Group();dogRoot.add(scarf);
  const scarfMaterial=mat(0x2e7257,.88);
  add(new THREE.TorusGeometry(.29,.065,7,16),scarfMaterial,scarf,[0,.59,.48],[Math.PI/2,0,0]);
  const point=add(new THREE.ConeGeometry(.17,.34,3),scarfMaterial,scarf,[.06,.39,.73],[0,0,Math.PI]);point.castShadow=true;
  const loader=new GLTFLoader();
  loader.load('../shiba-inu.glb',gltf=>{
    try{
      while(dogRoot.children.length){const child=dogRoot.children[0];dogRoot.remove(child)}
      const imported=gltf.scene,box3=new THREE.Box3().setFromObject(imported),size=new THREE.Vector3(),center=new THREE.Vector3();box3.getSize(size);box3.getCenter(center);
      const scale=1.2/Math.max(size.y,.001);imported.scale.setScalar(scale);imported.position.set(-center.x*scale,-box3.min.y*scale,-center.z*scale);
      const head=imported.getObjectByName('Head'),torso=imported.getObjectByName('Torso');
      if(head&&torso){imported.updateWorldMatrix(true,true);const h=new THREE.Vector3(),t=new THREE.Vector3();head.getWorldPosition(h);torso.getWorldPosition(t);const dir=h.sub(t);if(Math.hypot(dir.x,dir.z)>.02)imported.rotation.y-=Math.atan2(dir.x,dir.z)}
      // The original model faces +Z (toward customers / the camera).
      // Do not turn it 144 degrees away from the checkout counter.
      imported.rotation.y+=.04;
      dogRoot.add(imported);dogMixer=new THREE.AnimationMixer(imported);
      const idle=gltf.animations.find(a=>a.name==='Idle')||gltf.animations.find(a=>a.name.endsWith('|Idle'));
      if(idle){dogActive=dogMixer.clipAction(idle);dogActive.play()}
      imported.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
    }catch(err){console.warn('Shiba Inu model transform could not be applied; fallback dog remains.',err);dogRoot.add(scarf);}
  },undefined,e=>console.warn('Shiba Inu model could not be loaded; using geometry fallback.',e));

  makeRoom();
  let time=0;
  function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);time+=dt;
    if(dogMixer)dogMixer.update(dt);
    dogRoot.rotation.y=Math.sin(time*.45)*.026;
    dogRoot.position.y=1.17+Math.sin(time*2.1)*.018;
    if(customer){
      const d=customer.userData;
      if(customerMode==='enter'){
        // Enter along the *customer* side, without crossing the counter.
        customerClock+=dt;const p=Math.min(customerClock/.95,1),ease=1-Math.pow(1-p,3);customer.position.x=8+(CUSTOMER_CHECKOUT_X-8)*ease;customer.rotation.y=CUSTOMER_FACING-(1-ease)*.3;
        if(p===1){customerMode='idle';customerClock=0}
      }else if(customerMode==='exit'){
        customerClock+=dt;const p=Math.min(customerClock/1.06,1),ease=p*p*(3-2*p);customer.position.x=CUSTOMER_CHECKOUT_X+(-8.5-CUSTOMER_CHECKOUT_X)*ease;customer.rotation.y=CUSTOMER_FACING+ease*.5;
        if(p===1){scene.remove(customer);customer=null;customerMode='none'}
      }else{
        customer.position.x=CUSTOMER_CHECKOUT_X+(customerMood==='angry'?Math.sin(time*30)*.04:0);
        // The visitor looks toward the cashier, then turns slightly toward
        // the camera on a reaction so the facial expression stays readable.
        const faceAngle=customerMood==='neutral'?CUSTOMER_FACING:-1.03;
        customer.rotation.y+=(faceAngle-customer.rotation.y)*Math.min(1,dt*7);
      }
      if(customer){
        const bounce=customerMood==='happy'?Math.abs(Math.sin(time*10))*.16:customerMood==='angry'?Math.abs(Math.sin(time*15))*.05:Math.sin(time*2.2)*.026;
        d.body.position.y=bounce;d.body.rotation.z=customerMood==='angry'?Math.sin(time*25)*.025:0;
        d.arms[0].rotation.z=customerMood==='angry'?-1.03:customerMood==='happy'?-.4:Math.sin(time*2)*.07;
        d.arms[1].rotation.z=customerMood==='angry'?1.03:customerMood==='happy'?.5:-Math.sin(time*2)*.07;
      }
    }
    camera.lookAt(target);renderer.render(scene,camera);
  }
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);placeShibaBehindCounter()},{passive:true});
  frame();
  return {enterCustomer,react,exitCustomer,reset};
}

window.ShibaCreateBurgerScene=createBurgerScene;
})();
