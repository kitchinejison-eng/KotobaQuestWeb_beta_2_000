/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/3d/pictogram-world-classic-pc.js
 * 役割：ピクトグラム3Dゲームの風景・描画・操作
 * 利用画面：pictogram-3d.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエストPC R8: オフラインでも使えるクラシックJS。元のThree.js MITライセンス素材から生成。 */
(function(){
/* VETA25: ピクトグラム3Dの草原・海辺・牧場・森を描くワールド。
 * InstancedMeshによって草・石・花・樹木の描画回数を抑えます。
 * プレイヤーの移動範囲（±47）は平坦に保ち、クイズの判定に影響しません。
 */
function buildPictogramWorld(THREE, scene, biome, renderer) {
  const kind = biome.name;
  const compact = innerWidth < 770 || (navigator.hardwareConcurrency || 8) <= 4;
  const density = compact ? .48 : 1;
  let seed = ({'草原':6317,'ビーチ':53173,'牧場':4431,'森':102991})[kind] || 17;
  const rnd = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; };
  const pick = items => items[Math.floor(rnd()*items.length)];
  const group = new THREE.Group();group.name='VETA25 '+kind;scene.add(group);
  const mat = (color,roughness=.95,extra={}) => new THREE.MeshStandardMaterial({color,roughness,...extra});
  function mesh(geo,m,x=0,y=0,z=0,shadow=false) {
    const obj=new THREE.Mesh(geo,m);obj.position.set(x,y,z);obj.castShadow=shadow;obj.receiveShadow=true;group.add(obj);return obj;
  }
  const box=(w,h,d,m,x,y,z,sh=false)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,sh);
  const pole=(r1,r2,h,m,x,y,z,sh=false)=>mesh(new THREE.CylinderGeometry(r1,r2,h,10),m,x,y,z,sh);
  const timber=mat(0x806248),paleWood=mat(0xd3b187),stone=mat(0x9aa092);
  const leafColors=kind==='森'?[0x285d41,0x3a7650,0x4a8260]:[0x44844c,0x6b9d56,0x82ae67];
  const grassColors=kind==='森'?[0x315c3b,0x477e4c,0x68965c]:kind==='ビーチ'?[0xb2a979,0xc7b982,0xdacc95]:[0x558d45,0x76ab53,0x92be6c];
  function texture(base,colors,repeat){
    const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
    g.fillStyle='#'+base.toString(16).padStart(6,'0');g.fillRect(0,0,512,512);
    for(let i=0;i<5600;i++){
      g.fillStyle='#'+pick(colors).toString(16).padStart(6,'0');g.globalAlpha=.035+rnd()*.22;
      const x=rnd()*512,y=rnd()*512;
      if(kind==='ビーチ'){g.beginPath();g.arc(x,y,.35+rnd()*1.5,0,Math.PI*2);g.fill();}
      else g.fillRect(x,y,1+rnd()*7,1+rnd()*3);
    }
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);
    t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
  }
  const sandy=kind==='ビーチ';
  const groundMap=texture(sandy?0xe7d09d:kind==='森'?0x537b57:kind==='牧場'?0x80a75d:0x81b96b,
    sandy?[0xc3a87d,0xf4e3bb,0xd9bc90]:[0x547d42,0x9ec481,0xbfb58b,0x5d904e],17);
  const groundGeo=new THREE.PlaneGeometry(280,280,90,90);groundGeo.rotateX(-Math.PI/2);
  const positions=groundGeo.getAttribute('position');
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);
    const ramp=THREE.MathUtils.smoothstep(Math.max(Math.abs(x),Math.abs(z))-50,0,25);
    const hill=2.5*Math.sin(x*.036+1.1)*Math.cos(z*.05)+2.1*Math.sin(x*.089-z*.039)+2.2;
    positions.setY(i,-.06+ramp*hill);
  }
  groundGeo.computeVertexNormals();
  mesh(groundGeo,mat(0xffffff,.99,{map:groundMap}));
  const pathTexture=texture(sandy?0xf3e3be:kind==='森'?0x99866b:0xc6a880,
    [0xebd3a5,0xa58b71,0xd8c4a0],7);
  const path=mesh(new THREE.PlaneGeometry(14,76),mat(0xffffff,1,{map:pathTexture}),0,-.027,-3);
  path.rotation.x=-Math.PI/2;
  // 大気・空色の縦グラデーション。光源に影響されない全天球です。
  const skyGeo=new THREE.SphereGeometry(460,48,24),sp=skyGeo.getAttribute('position'),colors=[];
  const top=new THREE.Color(kind==='森'?0x6897b4:sandy?0x398fc8:0x64aad7);
  const horizon=new THREE.Color(kind==='森'?0xcee1d1:sandy?0xf7e4c6:0xd7eee3);
  for(let i=0;i<sp.count;i++){
    const c=horizon.clone().lerp(top,THREE.MathUtils.smoothstep(sp.getY(i)/460,0,.86));
    colors.push(c.r,c.g,c.b);
  }
  skyGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false}));
  function mountains(z,height,color){
    const verts=[],col=new THREE.Color(color),tints=[];
    for(let i=0;i<65;i++){
      const x=-165+i*330/65,nx=-165+(i+1)*330/65;
      const h=j=>height*(.7+.22*Math.sin(j*.6)+.15*Math.sin(j*1.72));
      verts.push(x,-4,z,x,h(i),z,nx,h(i+1),z,x,-4,z,nx,h(i+1),z,nx,-4,z);
      for(let k=0;k<6;k++)tints.push(col.r,col.g,col.b);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));
    mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false}));
  }
  mountains(-165,sandy?9:kind==='森'?27:17,kind==='森'?0x80a395:0x9cbab0);
  mountains(-205,sandy?12:kind==='森'?36:27,kind==='森'?0xb0c5b5:0xc0d3ca);
  const clouds=new THREE.Group();group.add(clouds);
  const cloudMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),
    new THREE.MeshBasicMaterial({color:0xfff9ec,transparent:true,opacity:.68,depthWrite:false,fog:false}),54);
  const dummy=new THREE.Object3D();
  for(let i=0;i<54;i++){
    const cluster=Math.floor(i/3);
    dummy.position.set(-130+(cluster%9)*31+(i%3-1)*4,27+Math.floor(cluster/9)*8+rnd()*4,-105+Math.floor(cluster/9)*70);
    dummy.scale.set(5+rnd()*5,1.6+rnd()*1.8,3+rnd()*2);dummy.rotation.set(0,0,0);
    dummy.updateMatrix();cloudMesh.setMatrixAt(i,dummy.matrix);
  }
  cloudMesh.instanceMatrix.needsUpdate=true;cloudMesh.frustumCulled=false;clouds.add(cloudMesh);
  mesh(new THREE.SphereGeometry(5.5,22,16),
    new THREE.MeshBasicMaterial({color:0xffefc5,fog:false,toneMapped:false}),-84,69,-240);
  function clearTrail(min=8){
    let x,z,n=0;
    do{x=(rnd()-.5)*132;z=(rnd()-.5)*125;n++;}
    while(n<25&&Math.abs(x)<min&&z>-43&&z<40);
    return {x,z};
  }
  function scatter(geometry,count,locate,colors,cast=false){
    if(count<1)return;
    const inst=new THREE.InstancedMesh(geometry,mat(0xffffff),count),d=new THREE.Object3D(),c=new THREE.Color();
    for(let i=0;i<count;i++){
      const p=locate();d.position.set(p.x,p.y||0,p.z);d.rotation.set(p.rx||0,p.ry||0,p.rz||0);
      d.scale.set(p.sx||1,p.sy||1,p.sz||1);d.updateMatrix();inst.setMatrixAt(i,d.matrix);
      c.setHex(pick(colors));inst.setColorAt(i,c);
    }
    inst.instanceMatrix.needsUpdate=true;inst.instanceColor.needsUpdate=true;
    inst.castShadow=cast;inst.receiveShadow=false;inst.frustumCulled=false;group.add(inst);
  }
  const grass=new THREE.ConeGeometry(.12,.64,3);grass.translate(0,.31,0);
  for(let i=0;i<3;i++)scatter(grass,Math.floor((sandy?155:kind==='森'?1650:1250)*density),()=>{
    const p=clearTrail(kind==='森'?10:8);return {...p,ry:rnd()*Math.PI*2,
      sx:.5+rnd()*.8,sy:.35+rnd()*1.5,sz:.7+rnd()*.6};
  },[grassColors[i],grassColors[(i+1)%3]]);
  scatter(new THREE.IcosahedronGeometry(.28,1),Math.floor((sandy?480:270)*density),()=>{
    const p=clearTrail(8);return {...p,y:.09,ry:rnd()*6.28,sx:.35+rnd()*1.8,sy:.2+rnd()*.75,sz:.4+rnd()*1.3};
  },sandy?[0xe6cda1,0xbca17c,0xf7e4c2]:[0x9eaa99,0x788376,0xadb3a4]);
  if(!sandy)scatter(new THREE.IcosahedronGeometry(.075,0),
    Math.floor((kind==='草原'?720:kind==='牧場'?430:210)*density),()=>{
      const p=clearTrail(9);return {...p,y:.32+rnd()*.2,sx:.7+rnd(),sy:.6+rnd(),sz:.7+rnd()};
    },[0xf7dc81,0xf8b3bc,0xe8e6fa,0xfbf9dd,0xbdacfa]);
  // 樹木は幹・3層の枝葉をまとめてGPUインスタンス化。
  const trunks=[],rounded=[[],[],[]],evergreens=[[],[],[]];
  const treeCount=kind==='森'?94:kind==='草原'?49:kind==='牧場'?42:0;
  for(let i=0;i<Math.floor(treeCount*density);i++){
    const p=clearTrail(kind==='森'?16:19),s=.65+rnd()*1.3,evergreen=kind==='森'?rnd()<.75:rnd()<.06;
    trunks.push({...p,y:0,sx:s,sy:s,sz:s});
    for(let j=0;j<3;j++){
      const h=(evergreen?1.35+j*1.03:2.55+j*.62)*s;
      const entry={x:p.x+Math.sin(j*2.1)*.43*s,y:h,z:p.z+Math.cos(j*2.1)*.33*s,
        sx:s*(evergreen?1-j*.14:1.08-j*.14),sy:s,sz:s*(evergreen?1-j*.14:1.0)};
      (evergreen?evergreens:rounded)[j].push(entry);
    }
  }
  const batch=(geometry,entries,palette,shadows)=>scatter(geometry,entries.length,(()=>{
    let i=0;return()=>entries[i++];
  })(),palette,shadows);
  batch(new THREE.CylinderGeometry(.21,.32,2.5,9).translate(0,1.25,0),trunks,
    [0x6f5942,0x806549,0x735b45],true);
  for(let i=0;i<3;i++){
    batch(new THREE.IcosahedronGeometry(1.27,2),rounded[i],leafColors,true);
    batch(new THREE.ConeGeometry(1.56,2.73,11),evergreens[i],
      [0x275b41,0x376d4c,0x4b7b54],true);
  }
  // 道の両縁を自然な石で縁取りし、移動範囲・正解エリアを妨げません。
  const trailRocks=[];
  for(let z=-40;z<=34;z+=.82)for(const side of [-1,1])if(rnd()<.58)
    trailRocks.push({x:side*(7.05+rnd()*.5),y:.06,z:z+rnd()*.5,
      sx:.25+rnd()*.42,sy:.2+rnd()*.32,sz:.27+rnd()*.48});
  batch(new THREE.IcosahedronGeometry(.32,0),trailRocks,
    sandy?[0xe9d7b6,0xd5bb93]:[0xab9c85,0xbeb39d],false);

  const animations=[];
  if(kind==='草原'){
    const x=-35,z=-27,roofMat=mat(0x85604a),plaster=mat(0xe7dbc0);
    pole(1.3,1.8,8.6,plaster,x,4.3,z,true);
    mesh(new THREE.ConeGeometry(2.1,3.1,8),roofMat,x,10.1,z,true);
    const blades=new THREE.Group();blades.position.set(x,8.4,z+2.1);group.add(blades);
    for(let k=0;k<4;k++){
      const spoke=new THREE.Group();spoke.rotation.z=k*Math.PI/2;
      const blade=new THREE.Mesh(new THREE.BoxGeometry(.47,4.0,.14),mat(0xd6c9ab));
      blade.position.y=2.12;spoke.add(blade);blades.add(spoke);
    }
    animations.push(t=>{blades.rotation.z=t*.32});
    for(let i=0;i<8;i++){
      const mound=mesh(new THREE.IcosahedronGeometry(1.1,1),mat(pick([0x96ae63,0x7ea45b])),34+rnd()*4,1.2,-42+i*10);
      mound.scale.set(1.7,1.0,1.25);
    }
  }
  if(kind==='牧場'){
    const red=mat(0xae5147),roof=mat(0x515a56),trim=mat(0xf3e7cc),brown=mat(0x67483a);
    const barn=new THREE.Group();barn.position.set(-34,0,-30);group.add(barn);
    function barnPart(geo,m,x,y,z){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);
      o.castShadow=true;o.receiveShadow=true;barn.add(o);return o;}
    barnPart(new THREE.BoxGeometry(11,6,8.8),red,0,3,0);
    for(const side of [-1,1]){
      const panel=barnPart(new THREE.BoxGeometry(6.4,.46,9.7),roof,side*2.65,7.25,0);
      panel.rotation.z=side*.43;
      barnPart(new THREE.BoxGeometry(.32,5.5,.32),trim,side*2.4,3,4.5);
    }
    barnPart(new THREE.BoxGeometry(4.7,4.6,.32),brown,0,2.45,4.54);
    barnPart(new THREE.BoxGeometry(.33,4.7,.4),trim,0,2.5,4.75);
    barnPart(new THREE.BoxGeometry(4.6,.33,.4),trim,0,2.5,4.75);
    for(const side of [-1,1])barnPart(new THREE.BoxGeometry(1.3,1.3,.24),mat(0xb1d5d6),side*3.9,4.5,4.55);
    pole(2.3,2.3,9.5,mat(0xc6c7b7),-22,4.75,-38,true);
    mesh(new THREE.ConeGeometry(2.5,2.6,18),roof,-22,10.7,-38,true);
    for(const side of [-1,1])for(let z=-37;z<36;z+=6){
      pole(.12,.15,1.5,trim,side*37,.75,z);
      box(.2,.13,6,trim,side*37,1.02,z+3);
      box(.2,.13,6,trim,side*37,.56,z+3);
    }
    const hay=mat(0xcfaa58);
    for(let i=0;i<12;i++){
      const roll=mesh(new THREE.CylinderGeometry(.8,.8,1.8,14),hay,
        -21+(i%4)*2.2,.84,-17+Math.floor(i/4)*2.2,true);
      roll.rotation.z=Math.PI/2;
    }
  }
  if(kind==='ビーチ'){
    const waterMat=new THREE.MeshPhysicalMaterial({color:0x3daec7,roughness:.2,
      metalness:.04,transparent:true,opacity:.91,clearcoat:.85,clearcoatRoughness:.16});
    const sea=mesh(new THREE.PlaneGeometry(225,110,24,12),waterMat,0,.13,-108);
    sea.rotation.x=-Math.PI/2;sea.receiveShadow=false;
    const foam=mat(0xf9f5df,.7),waveLines=[];
    for(let i=0;i<12;i++){
      const pts=[];for(let x=-100;x<=100;x+=2.5)
        pts.push(new THREE.Vector3(x,.16,-53-i*5+Math.sin(x*.08+i)*.6));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({color:0xe2fbf5,transparent:true,opacity:.38}));
      group.add(line);waveLines.push(line);
    }
    animations.push(t=>waveLines.forEach((w,i)=>{w.position.z=Math.sin(t*.75+i*.55)*.26}));
    // 曲がったヤシの幹、垂れた葉、ビーチパラソル。
    for(let i=0;i<12;i++){
      const x=(i%2?-1:1)*(23+rnd()*35),z=-42+i*8,s=.8+rnd()*.45;
      for(let j=0;j<4;j++){
        const stem=pole(.20*s,.24*s,1.36*s,timber,
          x+j*.22*s,(.72+j*1.15)*s,z,true);
        stem.rotation.z=-.16;
      }
      const cx=x+.72*s,cy=5.2*s;
      for(let j=0;j<8;j++){
        const frond=mesh(new THREE.ConeGeometry(.38*s,3.1*s,5),
          mat(j%2?0x3a9365:0x27795d,.9),cx,cy,z,true);
        const ang=j*Math.PI/4;frond.rotation.z=Math.cos(ang)*.95;
        frond.rotation.x=Math.sin(ang)*.95;
      }
    }
    for(let i=0;i<5;i++){
      const x=i%2?-20:22,z=-30+i*13;
      pole(.09,.10,2.65,mat(0xe2d7b9),x,1.3,z);
      mesh(new THREE.ConeGeometry(2.2,.78,12),mat(pick([0xf5ad91,0x8cc7de,0xf2d697])),x,2.72,z,true);
    }
    for(let i=0;i<14;i++){
      const drift=mesh(new THREE.CylinderGeometry(.13,.19,1.7,7),timber,
        (rnd()-.5)*120,.19,-48-rnd()*10);
      drift.rotation.z=Math.PI/2;drift.rotation.y=rnd()*2;
    }
    void foam;
  }
  if(kind==='森'){
    const moss=mat(0x558366),mushroom=mat(0xbd6050),cream=mat(0xe9dabe);
    for(let i=0;i<16;i++){
      const p=clearTrail(18);
      const log=mesh(new THREE.CylinderGeometry(.34,.39,2.8+rnd()*2.7,9),timber,p.x,.31,p.z,true);
      log.rotation.z=Math.PI/2;log.rotation.y=rnd()*6.28;
      mesh(new THREE.IcosahedronGeometry(.7+rnd()*.6,1),moss,p.x+1,.33,p.z).scale.y=.34;
    }
    for(let i=0;i<38;i++){
      const p=clearTrail(12),s=.45+rnd()*.8;
      pole(.08*s,.09*s,.50*s,cream,p.x,.25*s,p.z);
      mesh(new THREE.SphereGeometry(.3*s,10,7,0,Math.PI*2,0,Math.PI/2),mushroom,p.x,.5*s,p.z);
    }
    // 森の奥の柔らかな緑の光粒（実物のホタルに見える程度の密度）。
    const specs=[];
    for(let i=0;i<85;i++){
      const p=clearTrail(12);specs.push({x:p.x,y:1.0+rnd()*7,z:p.z,sx:.5,sy:.5,sz:.5});
    }
    batch(new THREE.SphereGeometry(.06,7,5),specs,[0xc7d98a,0xebdda5],false);
  }
  return {
    name:kind,detail:compact?'軽量・高品質':'高品質',
    update(time){clouds.position.x=Math.sin(time*.06)*2.7;animations.forEach(fn=>fn(time));}
  };
}

window.KQBuildPictogramWorld=buildPictogramWorld;
})();
