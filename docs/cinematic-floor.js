/* TableSight Cinematic Floor — copyright (c) 2026 Md Najmul Hossain.
   The people in the reference are an artist's visualization. Motion effects
   are simulated, not detected activities or reconstructed 3D people. */
(()=>{
"use strict";
const host=document.querySelector(".floor-perspective"), panel=document.getElementById("floor");
if(!host||!panel)return;
const url="https://raw.githubusercontent.com/hossain0707/AI-Restaurant-Monitoring-System/main/assets/restaurant-reference.png";
const coords=[[21,26],[39,26],[59,26],[80,26],[16,52],[38,52],[60,52],[83,52],[14,78],[38,78],[59,78],[83,78]];
const badge=[[21,16],[39,16],[59,16],[80,16],[16,42],[38,42],[60,42],[83,42],[14,66],[38,66],[59,66],[83,66]];
const actors=[[61,27,9,15,3],[18,72,9,14,3.5],[66,72,9,15,3.2],[79,26,10,16,4.3],[38,51,10,16,4.1],[84,51,10,16,4.5]];
const colors={available:"#78efc7",occupied:"#ff929c",cleaning:"#ffc47d",reserved:"#b9a7ff",unmonitored:"#acbac7"};
const states={available:"READY",occupied:"DINING",cleaning:"CLEANING",reserved:"BOOKED",unmonitored:"UNMAPPED"};
const container=document.createElement("div");container.className="photo-scene";container.hidden=true;
const image=document.createElement("img");image.className="photo-base";image.alt="Approved realistic restaurant concept art, with illustrated staff and guests";container.append(image);
const motions=document.createElement("div");motions.className="photo-actors";container.append(motions);
actors.forEach(([x,y,rx,ry,d])=>{const layer=document.createElement("div");layer.className="photo-actor";layer.style.cssText="--x:"+x+"%;--y:"+y+"%;--rx:"+rx+"%;--ry:"+ry+"%;--duration:"+d+"s";motions.append(layer)});
const rings=document.createElement("div");rings.className="photo-rings";container.append(rings);
const overlay=document.createElement("div");overlay.className="photo-labels";container.append(overlay);
const top=document.createElement("div");top.className="photo-live";top.textContent="● SIMULATED MOTION · TABLE STATUS MONITORING";container.append(top);
const controls=document.createElement("div");controls.className="photo-controls";
const picker=document.createElement("label");picker.className="photo-action";picker.textContent="▣ Load original image";
const file=document.createElement("input");file.type="file";file.accept="image/png,image/jpeg,image/webp";file.hidden=true;picker.append(file);
const pause=document.createElement("button");pause.className="photo-action";pause.textContent="Ⅱ Pause animation";
controls.append(picker,pause);container.append(controls);
const missing=document.createElement("div");missing.className="photo-missing";missing.innerHTML="<strong>Original artwork not yet in the public repository</strong><span>Load the exact approved image to preview it here. Your choice stays on this browser.</span>";container.append(missing);
host.append(container);
const switcher=document.createElement("div");switcher.className="photo-switch";
const cinematic=document.createElement("button");cinematic.textContent="✧ Original cinematic view";cinematic.type="button";
const model=document.createElement("button");model.textContent="◇ Alternate 3D model";model.type="button";
switcher.append(cinematic,model);panel.querySelector(".panel-top").append(switcher);
let snapshot=[],metadata={mode:"demo",ai:false},blobURL=null;
function switchView(v){
 const photo=v==="photo";container.hidden=!photo;host.classList.toggle("photo-mode",photo);
 cinematic.classList.toggle("selected",photo);model.classList.toggle("selected",!photo);
 try{sessionStorage.setItem("tablesight-floor-mode",v)}catch(e){}
}
cinematic.onclick=()=>switchView("photo");model.onclick=()=>switchView("model");
pause.onclick=()=>{let stopped=container.classList.toggle("photo-paused");pause.textContent=stopped?"▶ Resume animation":"Ⅱ Pause animation"};
function setImage(src){
 image.onload=()=>{container.classList.add("loaded");missing.hidden=true;
   motions.querySelectorAll(".photo-actor").forEach(el=>el.style.backgroundImage='url("'+src+'")');
 };
 image.onerror=()=>{container.classList.remove("loaded");missing.hidden=false};
 image.src=src;
}
function getStore(){return new Promise((resolve,reject)=>{let req=indexedDB.open("tablesight-photo-v1",1);req.onupgradeneeded=()=>req.result.createObjectStore("images");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function save(blob){try{const db=await getStore();await new Promise((res,rej)=>{const tx=db.transaction("images","readwrite");tx.objectStore("images").put(blob,"approved");tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){console.warn("Could not store reference image",e)}}
async function restore(){try{const db=await getStore();const blob=await new Promise((res,rej)=>{const req=db.transaction("images").objectStore("images").get("approved");req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});if(blob){blobURL=URL.createObjectURL(blob);setImage(blobURL);return}}catch(e){}setImage(url)}
file.onchange=async()=>{const f=file.files?.[0];if(!f)return;if(!f.type.startsWith("image/")||f.size>15e6){alert("Please select a PNG, JPEG, or WebP under 15 MB");return}if(blobURL)URL.revokeObjectURL(blobURL);blobURL=URL.createObjectURL(f);setImage(blobURL);await save(f)};
const buttons=[];
for(let i=0;i<12;i++){
 const sensor=document.createElement("span");sensor.className="photo-sensor";sensor.style.left=coords[i][0]+"%";sensor.style.top=coords[i][1]+"%";rings.append(sensor);
 const button=document.createElement("button");button.className="photo-badge";button.style.left=badge[i][0]+"%";button.style.top=badge[i][1]+"%";button.type="button";
 button.onclick=()=>window.dispatchEvent(new CustomEvent("tablesight:select",{detail:{id:"T"+String(i+1).padStart(2,"0")}}));
 overlay.append(button);buttons.push({button,sensor});
}
function render(){
 for(let i=0;i<12;i++){const t=snapshot[i]||{id:"T"+String(i+1).padStart(2,"0"),status:"unmonitored"};const color=colors[t.status]||colors.unmonitored;const {button,sensor}=buttons[i];
 button.style.setProperty("--status",color);sensor.style.setProperty("--status",color);
 button.replaceChildren();const strong=document.createElement("strong");strong.textContent=t.id+"  "+(states[t.status]||"UNMAPPED");const small=document.createElement("small");small.textContent=t.status==="cleaning"?"STAFF CONFIRMATION":t.status==="occupied"?"GUEST PRESENCE":t.status==="reserved"?"RESERVED":"TAP TO MANAGE";button.append(strong,small);
 }
 top.textContent=(metadata.mode==="demo"?"● SIMULATED TABLE DATA":"● CAMERA TABLE STATES")+" · ILLUSTRATIVE MOTION";
}
window.addEventListener("tablesight:floor",e=>{snapshot=e.detail.tables||[];metadata=e.detail.meta||metadata;render()});
if(window.__TableSightSnapshot){snapshot=window.__TableSightSnapshot.tables;metadata=window.__TableSightSnapshot.meta}
render();restore();switchView(sessionStorage.getItem("tablesight-floor-mode")==="model"?"model":"photo");
})();