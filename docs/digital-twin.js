/**
 * TableSight Living Digital Twin — realtime procedural WebGL restaurant.
 * Copyright © 2026 Md Najmul Hossain. All rights reserved.
 *
 * Customers and staff are stylized visualizations, NOT real individuals detected
 * by the camera. Inference influences table state only, not avatar identity.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

const canvasHost = document.querySelector(".floor-perspective");
const originalScene = document.getElementById("tableScene");
if (!canvasHost || !originalScene) throw new Error("TableSight floor host missing");
const info = document.createElement("div");
info.className = "twin-hud";
info.innerHTML = '<span class="twin-live-dot"></span><span id="twinMode">SIMULATED 3D ACTIVITY</span><span class="twin-hud-sep">•</span><span>Drag to rotate · Tap table to manage</span>';
const badges = document.createElement("div");
badges.className = "twin-badges";
badges.setAttribute("aria-label","Digital twin table controls");
const toolbar = document.createElement("div");
toolbar.className = "twin-toolbar";
const pauseButton = document.createElement("button");
pauseButton.type = "button";
pauseButton.textContent = "Ⅱ Pause animation";
pauseButton.title = "Pause or resume simulated customer and staff motion";
const resetButton = document.createElement("button");
resetButton.type = "button";
resetButton.textContent = "↺ Reset view";
resetButton.title = "Return to the original camera view";
toolbar.append(pauseButton, resetButton);
const statusMessage = document.createElement("div");
statusMessage.className = "twin-intro";
statusMessage.textContent = "3D rendering initializes when WebGL is available.";
canvasHost.append(info, badges, toolbar, statusMessage);

const palette = {occupied:0xff8194,available:0x67eed0,cleaning:0xffbc72,reserved:0xb3a4ff,unmonitored:0x7896a4};
const labels = {occupied:"DINING",available:"READY",cleaning:"CLEANING",reserved:"BOOKED",unmonitored:"UNMAPPED"};
const coordinates = (index) => ({x:((index%4)-1.5)*4.95,z:(Math.floor(index/4)-1)*4.9});
const rand = (seed) => { const n = Math.sin(seed*128.17)*43758.545312; return n-Math.floor(n); };
const color = (hex) => new THREE.Color(hex);
const mat = (hex,roughness=.55,metalness=.06) => new THREE.MeshStandardMaterial({color:hex,roughness,metalness});
const skinMat = [mat(0xc99578),mat(0xe4b392),mat(0x94694e),mat(0xd2a68d),mat(0x6e4a35)];
const wardrobe = [mat(0x252d40),mat(0x586474),mat(0x856d68),mat(0x394f58),mat(0x725d85),mat(0xc6a69a)];
const gold = mat(0xe3ad6a,.22,.68);
const cream = mat(0xc3af9e,.8,.05);
const stone = mat(0xc7c6bb,.28,.1);
const chairFabric = mat(0x837e7e,.88,.02);
const floorMat = mat(0x0c1a28,.34,.16);
const greenery = mat(0x316d53,.8);
const white = mat(0xf7e9d4,.45);
const black = mat(0x151822,.6);
const cone = (radius,height,material,segments=14) => new THREE.Mesh(new THREE.ConeGeometry(radius,height,segments),material);
const cyl = (top,bottom,h,material,segments=24) => new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,h,segments),material);
const sphere=(r,material,segments=14)=>new THREE.Mesh(new THREE.SphereGeometry(r,segments,12),material);
const box=(w,h,d,material)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
function add(parent,mesh,x=0,y=0,z=0,cast=true){
 mesh.position.set(x,y,z); parent.add(mesh); if(mesh.isMesh){mesh.castShadow=cast;mesh.receiveShadow=true} return mesh;
}
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.className="twin-canvas";
renderer.domElement.setAttribute("aria-label","Animated restaurant 3D overview");
canvasHost.prepend(renderer.domElement);
const scene=new THREE.Scene();
scene.background=color(0x071522);
scene.fog=new THREE.Fog(0x071522,22,41);
const camera=new THREE.OrthographicCamera(-12,12,7.2,-7.2,.1,150);
let orbitAngle=0;
function pose(angle=0){
 camera.position.set(Math.sin(angle)*6.5,20.5,23);
 camera.lookAt(0,0.2,0);
 camera.updateProjectionMatrix();
}
pose();
scene.add(new THREE.HemisphereLight(0x89c8c9,0x31211e,2.1));
const sunlight=new THREE.DirectionalLight(0xffd7ae,2.2);sunlight.position.set(-4,18,10);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);sunlight.shadow.camera.left=-17;sunlight.shadow.camera.right=17;sunlight.shadow.camera.top=15;sunlight.shadow.camera.bottom=-15;sunlight.shadow.bias=-.0003;scene.add(sunlight);
const cyanLight=new THREE.PointLight(0x3aebc4,35,24,2);cyanLight.position.set(0,5,1);scene.add(cyanLight);
const warm1=new THREE.PointLight(0xe69f65,32,18,2);warm1.position.set(-10,4,-8);scene.add(warm1);
const warm2=new THREE.PointLight(0xfcb676,25,16,2);warm2.position.set(10,3.5,-8);scene.add(warm2);
const floor=add(scene,new THREE.Mesh(new THREE.PlaneGeometry(31,23),floorMat),0,-.06,0,false);floor.rotation.x=-Math.PI/2;
const grid=new THREE.GridHelper(31,31,0x1e6b69,0x19434a);grid.position.y=-.04;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
const backWall=add(scene,box(31,2.4,.45,mat(0x10232d)),0,1,-10.5,false);
const leftWall=add(scene,box(.4,2.2,20,mat(0x122835)), -15.2,1,0,false);
const wallStrip = add(scene,box(29,.08,.1,new THREE.MeshBasicMaterial({color:0xd8a873})),0,1.8,-10.2,false);
const wallStrip2 = add(scene,box(.08,.06,18,new THREE.MeshBasicMaterial({color:0x4ab89b})), -14.85,1.1,0,false);
function plant(x,z,seed){
 const p=new THREE.Group();p.position.set(x,0,z);
 add(p,cyl(.23,.28,.53,mat(0x846e5c,.5)),0,.26,0);
 const trunk=add(p,cyl(.045,.065,.85,mat(0x5a483d)),0,.8,0);
 for(let i=0;i<7;i++){let leaf=sphere(.34,greenery);leaf.scale.set(.44,1.6,.5);const a=i*Math.PI*2/7+rand(seed)*.4;leaf.position.set(Math.cos(a)*.31,1.25+(i%3)*.16,Math.sin(a)*.31);leaf.rotation.z=Math.cos(a)*.5;leaf.rotation.x=Math.sin(a)*.5;p.add(leaf)}
 scene.add(p);
}
plant(-11.3,-8,1);plant(11.6,-8,5);plant(-11.3,8,13);plant(11.5,8,20);

const tables=[];
const clock=new THREE.Clock();
const animatedFigures=[];
function chair(parent,a,r=1.56){
 const anchor = new THREE.Group();
 anchor.position.set(Math.sin(a)*r,0,Math.cos(a)*r);
 anchor.rotation.y=a+Math.PI;parent.add(anchor);
 const legs = mat(0x353033,.7,.25);
 for(const xx of [-.32,.32])for(const zz of [-.25,.25])add(anchor,cyl(.048,.052,.57,legs,8),xx,.27,zz);
 const seat=add(anchor,box(.93,.19,.8,chairFabric),0,.66,0);seat.rotation.y=.01;
 const back=add(anchor,box(.96,.72,.18,chairFabric),0,1.07,.37);back.rotation.x=-.09;
 const pillow=add(anchor,box(.72,.30,.12,cream),0,.94,.25);pillow.rotation.x=-.12;
 return anchor;
}
function plate(parent,x,z){
 add(parent,cyl(.29,.29,.04,white),x,1.04,z);
 add(parent,cyl(.20,.20,.018,stone),x,1.065,z);
 add(parent,cyl(.045,.04,.17,gold),x+.24,1.12,z+.09);
}
function flower(parent,seed){
 add(parent,cyl(.11,.09,.23,gold),0,1.15,0);
 for(let i=0;i<6;i++){const f=sphere(.10,i%2?mat(0xe5b9a3):mat(0xf5f0d1));const a=i*Math.PI/3;add(parent,f,Math.cos(a)*.16,1.34+rand(i+seed)*.12,Math.sin(a)*.16);}
}
function makePerson(anchor,seat,seed,working=false){
 const root=new THREE.Group();anchor.add(root);
 const skin=skinMat[Math.floor(rand(seed+10)*skinMat.length)];
 const clothes=working?mat(0xf0e9e0):wardrobe[Math.floor(rand(seed+31)*wardrobe.length)];
 const hair=mat(rand(seed+27)>.25?0x27212a:0x634335,.9);
 root.position.set(0,0,-.01);
 if(working){root.position.set(Math.sin(seed)*.03,0,0)}
 const body=add(root,cyl(.30,.27,working?.80:.63,clothes),0,working?1.58:1.27,0);
 const head=add(root,sphere(.24,skin),0,working?2.2:1.78,-.03);
 const hairstyle=add(root,sphere(.245,hair),0,working?2.33:1.90,.03);hairstyle.scale.set(1.02,.43,1.0);
 if(working){add(root,box(.37,.56,.065,black),0,1.50,-.23);}
 else {add(root,box(.58,.23,.38,clothes),0,.91,-.07);}
 const left=new THREE.Group(),right=new THREE.Group();
 left.position.set(-.31,working?1.88:1.5,-.06);right.position.set(.31,working?1.88:1.5,-.06);
 root.add(left,right);
 const armL=add(left,cyl(.085,.073,.55,clothes),-.04,-.22,-.11);armL.rotation.x=-.26;
 const armR=add(right,cyl(.085,.073,.55,clothes),.04,-.22,-.11);armR.rotation.x=-.26;
 add(left,sphere(.09,skin),-.06,-.49,-.18);
 add(right,sphere(.09,skin),.06,-.49,-.18);
 let cloth;
 if(working) {
    cloth=add(right,box(.24,.035,.18,mat(0x79b9b7)),.13,-.51,-.32);
    add(root,cyl(.12,.12,.07,gold),-.20,1.07,-.32);
 }
 const figur={root,left,right,head,body,seed,working,active:true};
 animatedFigures.push(figur);
 return figur;
}
function clearFigures(entry){
 if(!entry.people)return;
 for(const p of entry.people){p.active=false;if(p.root.parent)p.root.parent.remove(p.root)}
 entry.people=[];
}
function sceneStatus(entry,status){
 if(entry.status===status)return;
 entry.status=status;
 clearFigures(entry);
 const accent=palette[status]??palette.unmonitored;
 entry.ring.material.color.setHex(accent);
 entry.ring.material.opacity=status==="cleaning"?.95:.76;
 entry.pad.material.color.setHex(accent);
 entry.pad.material.opacity=status==="unmonitored"?.05:.14;
 entry.glow.color.setHex(accent);
 entry.glow.intensity=status==="cleaning"?4.3:2.2;
 entry.setPieces.visible=["available","reserved","occupied"].includes(status);
 entry.card.visible=status==="reserved";
 entry.people=[];
 if(status==="occupied"){
   const seats=[0,2,3].slice(0,2+Math.floor(rand(entry.i)*2));
   for(const seat of seats){ const fig=makePerson(entry.chairs[seat],seat,entry.i*11+seat,false);entry.people.push(fig) }
 }else if(status==="cleaning"){
   const staff=new THREE.Group();
   const staffAngle=1.15;
   staff.position.set(Math.sin(staffAngle)*1.78,0,Math.cos(staffAngle)*1.78);
   staff.rotation.y=staffAngle+Math.PI;
   entry.group.add(staff);
   const fig=makePerson(staff,4,entry.i+51,true);entry.people.push(fig);fig.extraParent=staff;
 }
}
function table(index){
 const {x,z}=coordinates(index);
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
 const pad=add(group,new THREE.Mesh(new THREE.PlaneGeometry(4.28,4.08),new THREE.MeshBasicMaterial({color:0x77eec5,transparent:true,opacity:.1,depthWrite:false})),0,.012,0,false);pad.rotation.x=-Math.PI/2;
 const ring=add(group,new THREE.Mesh(new THREE.TorusGeometry(1.95,.035,8,80),new THREE.MeshBasicMaterial({color:0x65eac4,transparent:true,opacity:.75})),0,.032,0,false);ring.rotation.x=Math.PI/2;
 const glow = new THREE.PointLight(0x60ebc5,1.8,3,2);glow.position.set(0,1.5,0);group.add(glow);
 add(group,cyl(.19,.25,1.18,gold),0,.58,0);
 add(group,cyl(1.18,1.15,.16,mat(0x665f59,.3,.28),48),0,.98,0);
 add(group,cyl(1.1,1.1,.06,stone,48),0,1.10,0);
 const chairs = [0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>chair(group,a));
 const setPieces=new THREE.Group();group.add(setPieces);
 for(let j=0;j<4;j++){const a=j*Math.PI/2;plate(setPieces,Math.sin(a)*.70,Math.cos(a)*.70);}
 flower(setPieces,index);
 const card=add(group,box(.46,.27,.07,black),0,1.28,.03);card.visible=false;
 const entry={i:index,group,pad,ring,glow,chairs,setPieces,card,people:[],status:null};
 group.userData.tableIndex=index;group.traverse(obj=>obj.userData.tableIndex=index);
 sceneStatus(entry,"available");
 tables.push(entry);
}
for(let i=0;i<12;i++)table(i);
scene.add(new THREE.AxesHelper(0)); // no visible debug axes

let snapshots=Array.from({length:12},(_,i)=>({id:"T"+String(i+1).padStart(2,"0"),status:"available"}));
let moving=true,reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced)moving=false;
pauseButton.textContent=moving?"Ⅱ Pause animation":"▶ Resume animation";
pauseButton.addEventListener("click",()=>{moving=!moving;pauseButton.textContent=moving?"Ⅱ Pause animation":"▶ Resume animation"});
resetButton.addEventListener("click",()=>{orbitAngle=0;pose(orbitAngle);placeBadges()});
const buttons=[];
function badge(index){
 const button=document.createElement("button");
 button.type="button";
 button.className="twin-badge";
 button.addEventListener("click",()=>window.dispatchEvent(new CustomEvent("tablesight:select",{detail:{id:snapshots[index]?.id||"T"+(index+1)}})));
 button.addEventListener("pointerdown",e=>e.stopPropagation());
 badgeLayer.append(button);
 buttons.push(button);
}
const badgeLayer=badges;
for(let i=0;i<12;i++)badge(i);
function placeBadges(){
 const w=canvasHost.clientWidth,h=canvasHost.clientHeight;
 if(!w||!h)return;
 for(let i=0;i<12;i++){
  const entry=tables[i];
  const vec=new THREE.Vector3(entry.group.position.x,2.85,entry.group.position.z);
  vec.project(camera);
  buttons[i].style.left=(((vec.x+1)/2)*100)+"%";
  buttons[i].style.top=(((1-vec.y)/2)*100)+"%";
 }
}
function synchronize(next,meta={}){
 if(!Array.isArray(next))return;
 snapshots=next;
 for(let i=0;i<12;i++){
  const s=next[i]||{id:"T"+(i+1),status:"unmonitored"};
  const entry=tables[i];
  sceneStatus(entry,s.status);
  const b=buttons[i],label=labels[s.status]||"UNKNOWN";
  b.className="twin-badge "+(s.status||"unmonitored");
  b.replaceChildren();
  const id=document.createElement("strong"),name=document.createElement("span"),age=document.createElement("small");
  id.textContent=s.id;name.textContent=label;
  const minutes=s.status==="occupied"?Math.max(0,Math.floor((Date.now()-(s.updated||Date.now()))/60000))+"m":null;
  age.textContent=s.status==="cleaning"?"STAFF RESET":s.status==="occupied"?(minutes+" · simulated scene"):s.status==="reserved"?"UPCOMING":"TAP TO MANAGE";
  b.append(id,name,age);
  b.setAttribute("aria-label",s.id+" "+label+" — manage table");
 }
 const label=meta.mode==="demo"?"SIMULATED 3D ACTIVITY":meta.ai?"CAMERA-INFERRED TABLE STATES · SIMULATED AVATARS":"CAMERA PREVIEW · SIMULATED AVATARS";
 document.getElementById("twinMode").textContent=label;
 placeBadges();
}
window.TableSightTwin={sync:synchronize};
window.addEventListener("tablesight:floor",e=>synchronize(e.detail.tables,e.detail.meta));
if(window.__TableSightSnapshot)synchronize(window.__TableSightSnapshot.tables,window.__TableSightSnapshot.meta);
else synchronize(snapshots,{mode:"demo"});

let dragging=false,prevX=0;
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;prevX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;orbitAngle=Math.max(-.42,Math.min(.42,orbitAngle+(e.clientX-prevX)*.003));prevX=e.clientX;pose(orbitAngle);placeBadges()});
renderer.domElement.addEventListener("pointerup",()=>dragging=false);
renderer.domElement.addEventListener("pointercancel",()=>dragging=false);
let pointerRay = new THREE.Raycaster();
renderer.domElement.addEventListener("dblclick",e=>{
  const rect=renderer.domElement.getBoundingClientRect();
  const m=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  pointerRay.setFromCamera(m,camera);
  const hit=pointerRay.intersectObjects(tables.map(t=>t.group),true).find(x=>Number.isInteger(x.object.userData.tableIndex));
  if(hit)window.dispatchEvent(new CustomEvent("tablesight:select",{detail:{id:snapshots[hit.object.userData.tableIndex].id}}));
});
const ro=new ResizeObserver(()=>resize());
ro.observe(canvasHost);
function resize(){
 const w=Math.max(280,canvasHost.clientWidth),h=Math.max(260,canvasHost.clientHeight);
 const aspect=w/h,scale=12.0;
 camera.left=-scale*aspect/1.8;camera.right=scale*aspect/1.8;
 camera.top=scale/1.8;camera.bottom=-scale/1.8;
 camera.updateProjectionMatrix();renderer.setSize(w,h,false);placeBadges();
}
resize();
statusMessage.remove();
canvasHost.classList.add("is-cinematic");
originalScene.setAttribute("aria-hidden","true");
let prev=0;
function loop(){
 requestAnimationFrame(loop);
 const t=clock.getElapsedTime(),dt=Math.min(.06,t-prev);prev=t;
 if(moving){
  for(const p of animatedFigures){if(!p.active)continue;
   const a=t*1.65+p.seed*3.1;
   p.head.rotation.z=Math.sin(a*.62)*.043;
   if(p.working){
    p.body.rotation.z=Math.sin(a*1.6)*.058;
    p.right.rotation.x=-.72+Math.sin(a*2.4)*.48;
    p.right.rotation.z=-.55+Math.cos(a*2.4)*.35;
    p.left.rotation.x=-.62+Math.sin(a*.75)*.15;
   }else{
    p.left.rotation.x=-.27+Math.sin(a*.65)*.28;
    p.right.rotation.x=-.35+Math.sin(a*.93)*.5;
    p.head.rotation.y=Math.sin(a*.4)*.09;
   }
  }
  for(let i=0;i<tables.length;i++){
   const entry=tables[i],cleaning=entry.status==="cleaning";
   const scale=cleaning?1.025+Math.sin(t*2.5+i)*.06:1+Math.sin(t*1.1+i)*.016;
   entry.ring.scale.set(scale,scale,scale);
   entry.ring.rotation.z=cleaning?t*.55:0;
   entry.glow.intensity=(cleaning?3.3:1.8)+(Math.sin(t*2+i)+1)*.45;
  }
 }
 renderer.render(scene,camera);
}
loop();
