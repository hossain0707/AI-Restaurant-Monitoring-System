/* TableSight cinematic scene.
 * Copyright (c) 2026 Md Najmul Hossain. All rights reserved.
 * Photo: approved artist concept bundled with this release.
 * Animated customers/staff are illustrative motion effects, NOT camera reconstructions.
 */
(() => {
"use strict";
const host=document.querySelector(".floor-perspective");
if(!host)return;
const artwork="./assets/restaurant-reference.webp";
const positions=[[20,29],[39,29],[60,29],[80,29],[16,53],[39,53],[60,53],[84,53],[16,79],[39,79],[60,79],[83,79]];
const labels=[[21,16],[39,16],[59,16],[80,16],[16,42],[38,42],[60,42],[83,42],[14,67],[38,67],[59,67],[83,67]];
const actorSpots=[
  {x:60,y:27,rx:8,ry:15,sec:2.4,kind:"clean"},
  {x:18,y:73,rx:9,ry:15,sec:2.8,kind:"clear"},
  {x:65,y:73,rx:9,ry:15,sec:3.1,kind:"prepare"},
  {x:79,y:27,rx:10,ry:15,sec:4.5,kind:"dine"},
  {x:39,y:53,rx:10,ry:15,sec:4.2,kind:"dine"},
  {x:84,y:51,rx:10,ry:15,sec:4.8,kind:"dine"}
];
const colors={available:"#76edc7",occupied:"#ff90a3",cleaning:"#ffbd71",reserved:"#bea9ff",unmonitored:"#93a9b4"};
const titles={available:"READY",occupied:"OCCUPIED",cleaning:"CLEANING",reserved:"BOOKED",unmonitored:"UNMAPPED"};
const layer=document.createElement("div");
layer.className="cinema-floor";
layer.setAttribute("aria-label","Cinematic restaurant floor with animated monitoring overlays");
const image=document.createElement("img");
image.className="cinema-artwork";
image.src=artwork;
image.alt="The approved realistic restaurant scene with occupied, ready, reserved and cleaning tables";
image.loading="eager";
image.decoding="async";
layer.append(image);
const motions=document.createElement("div");motions.className="cinema-actors";
const hotspots=document.createElement("div");hotspots.className="cinema-hotspots";
const sensors=document.createElement("div");sensors.className="cinema-sensors";
layer.append(motions,sensors,hotspots);
const status=document.createElement("div");status.className="cinema-status";
const statusLight=document.createElement("i");statusLight.className="cinema-status-light";
const statusLabel=document.createElement("span");statusLabel.textContent="SIMULATED RESTAURANT ACTIVITIES";
status.append(statusLight,statusLabel);layer.append(status);
const panel=document.createElement("div");panel.className="cinema-controls";
const pause=document.createElement("button");pause.type="button";pause.className="cinema-button";pause.textContent="Ⅱ Pause animation";
pause.setAttribute("aria-pressed","false");
const speed=document.createElement("button");speed.type="button";speed.className="cinema-button";speed.textContent="1× Speed";speed.title="Change simulation animation speed";
panel.append(pause,speed);layer.append(panel);
const note=document.createElement("div");note.className="cinema-note";note.textContent="Illustrative motion · operational statuses update from the dashboard";layer.append(note);
host.append(layer);
host.classList.add("cinema-on");
const buttons=[];
for(let i=0;i<12;i++){
 const sensor=document.createElement("span");sensor.className="cinema-ring";sensor.style.left=positions[i][0]+"%";sensor.style.top=positions[i][1]+"%";sensor.style.animationDelay=(i*.13)+"s";sensors.append(sensor);
 const button=document.createElement("button");button.type="button";button.className="cinema-badge";button.style.left=labels[i][0]+"%";button.style.top=labels[i][1]+"%";button.addEventListener("click",()=>window.dispatchEvent(new CustomEvent("tablesight:select",{detail:{id:"T"+String(i+1).padStart(2,"0")}})));
 hotspots.append(button);buttons.push({button,sensor});
}
const activity=[];
actorSpots.forEach((v,i)=>{
 const el=document.createElement("div");el.className="cinema-actor";
 el.style.cssText="--x:"+v.x+"%;--y:"+v.y+"%;--rx:"+v.rx+"%;--ry:"+v.ry+"%;--duration:"+v.sec+"s;--delay:"+(i*-.8)+"s";
 el.setAttribute("aria-hidden","true");motions.append(el);activity.push({el,kind:v.kind});
});
image.addEventListener("load",()=>{
 layer.classList.add("cinema-ready");
 for(const {el} of activity)el.style.backgroundImage='url("'+artwork+'")';
});
image.addEventListener("error",()=>{
 // Preserve the existing functional table map instead of showing a missing-file panel.
 layer.remove();host.classList.remove("cinema-on");
 console.error("TableSight: bundled cinematic artwork failed to load");
});
let current=[],meta={mode:"demo",ai:false};
function render(tables=current,mode=meta){
 current=tables;meta=mode||meta;
 const states=Array.from({length:12},(_,i)=>current[i]||{id:"T"+String(i+1).padStart(2,"0"),status:"unmonitored",updated:Date.now()});
 states.forEach((t,i)=>{
 const {button,sensor}=buttons[i],state=t.status||"unmonitored",accent=colors[state]||colors.unmonitored;
 button.style.setProperty("--accent",accent);sensor.style.setProperty("--accent",accent);
 sensor.dataset.state=state;button.replaceChildren();
 const top=document.createElement("strong");top.textContent=t.id+" "+(titles[state]||"UNMAPPED");
 const sub=document.createElement("small");
 sub.textContent=state==="cleaning"?"STAFF CONFIRMATION":state==="occupied"?"GUESTS DETECTED":state==="reserved"?"UPCOMING BOOKING":"MANAGE TABLE";
 button.append(top,sub);
 button.setAttribute("aria-label",t.id+" "+(titles[state]||"UNMAPPED")+", manage table");
 });
 const ai=meta.ai===true,live=meta.mode!=="demo";
 statusLabel.textContent=ai?"CAMERA-INFERRED TABLE STATUS · ILLUSTRATIVE MOTION":live?"CAMERA PREVIEW · ILLUSTRATIVE MOTION":"SIMULATED TABLE STATES · ILLUSTRATIVE MOTION";
 // Avatars remain visual illustrations; only table states are camera-driven.
}
pause.addEventListener("click",()=>{
 const stopped=layer.classList.toggle("cinema-paused");
 pause.textContent=stopped?"▶ Resume animation":"Ⅱ Pause animation";
 pause.setAttribute("aria-pressed",String(stopped));
});
let rate=1;
speed.addEventListener("click",()=>{
 rate=rate===1?1.5:rate===1.5?.75:1;
 layer.style.setProperty("--motion-scale",String(1/rate));
 speed.textContent=rate+"× Speed";
});
window.addEventListener("tablesight:floor",e=>{if(e.detail)render(e.detail.tables||[],e.detail.meta||{})});
if(window.__TableSightSnapshot)render(window.__TableSightSnapshot.tables,window.__TableSightSnapshot.meta);
else render();
})();
