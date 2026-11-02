/* TableSight client runtime — copyright (c) 2026 Md Najmul Hossain.
 * Browser-camera frames are processed locally. No tracking identifiers, recording or uploads. */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const N = 12;
const positions = [[12,24],[33,24],[54,24],[76,24],[21,49],[43,49],[65,49],[85,49],[12,74],[35,74],[58,74],[80,74]];
const demoStates = ["occupied","available","occupied","cleaning","available","occupied","reserved","available","occupied","available","available","occupied"];
const tables = Array.from({length:N},(_,i)=>({id:"T"+String(i+1).padStart(2,"0"),name:"Table "+(i+1),status:demoStates[i],x:positions[i][0],y:positions[i][1],seats:i%3===0?6:i%2===0?2:4,updated:Date.now(),present:0,absent:0}));
const state = {mode:"demo",camera:null,image:null,stream:null,model:null,ai:false,live:false,draw:false,dragStart:null,zones:{},events:[],lastDetect:0,lastFPS:0,selected:null,timer:null,detectTimer:null};
const states = {available:"AVAILABLE",occupied:"OCCUPIED",cleaning:"CLEANING",reserved:"RESERVED",unmonitored:"UNMAPPED"};
let toastTimer;
function toast(message){const e=$("toast");e.textContent=message;e.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove("show"),3800)}
function addEvent(message,detail){state.events.unshift({message,detail,time:new Date()});state.events=state.events.slice(0,28);renderEvents()}
function change(t,status,reason){if(!t || t.status===status)return;t.status=status;t.updated=Date.now();t.present=0;t.absent=0;addEvent(t.id+" · "+states[status],reason);render()}
function render(){
 const count=s=>tables.filter(t=>t.status===s).length;
 $("mTotal").textContent=tables.length;$("mOccupied").textContent=count("occupied");$("mAvailable").textContent=count("available");$("mAttention").textContent=count("cleaning");
 const util=Math.round(100*count("occupied")/tables.length);
 $("occupancyGauge").textContent=util+"%";$("utilizationText").textContent=count("occupied")+" of "+tables.length+" tables currently occupied"+(state.mode==="demo"?" (simulated)":" (monitored / manually updated)");
 $("floorStatus").textContent=state.mode==="demo"?"SIMULATION · NOT LIVE VIDEO":"CAMERA MODE · "+Object.keys(state.zones).length+" mapped zones";
 $("systemLabel").textContent=state.mode==="demo"?"DEMO ACTIVE":state.ai?"AI INFERENCE ACTIVE":"CAMERA PREVIEW";
 const alerts=tables.filter(t=>t.status==="cleaning");$("alertNum").textContent=alerts.length;
 const list=$("alerts");list.replaceChildren();
 if(!alerts.length){const empty=document.createElement("div");empty.className="empty";empty.innerHTML="<strong>✓</strong>All tables clear — no cleaning tasks.";list.appendChild(empty)}
 alerts.slice(0,5).forEach(t=>{let div=document.createElement("div");div.className="alert";let marker=document.createElement("b");marker.textContent="⚑";let inner=document.createElement("div");let title=document.createElement("strong");title.textContent=t.id+" · Needs cleaning";let sub=document.createElement("p");sub.textContent="Staff must confirm the table is ready";inner.append(title,sub);div.append(marker,inner);list.appendChild(div)});
 const scene=$("tableScene");scene.replaceChildren();tables.forEach((t,i)=>{let b=document.createElement("button");b.type="button";b.className="table-3d "+t.status;b.style.left=t.x+"%";b.style.top=t.y+"%";b.style.animationDelay=(i*32)+"ms";b.title=t.name+": "+states[t.status];b.setAttribute("aria-label",t.name+" "+states[t.status]);let label=document.createElement("strong");label.textContent=t.id;let desc=document.createElement("small");desc.textContent=t.status==="unmonitored"?"UNMAPPED":t.status==="cleaning"?"CLEAN":t.status==="occupied"?"SEATED":t.status==="available"?"FREE":"BOOKED";b.append(label,desc);b.addEventListener("click",()=>openModal(t));scene.appendChild(b)});
 const twinData={tables:tables.map(t=>({id:t.id,status:t.status,updated:t.updated,seats:t.seats})),meta:{mode:state.mode,ai:state.ai}};
 window.__TableSightSnapshot=twinData;
 if(window.TableSightTwin)window.TableSightTwin.sync(twinData.tables,twinData.meta);
}
function renderEvents(){const root=$("events");root.replaceChildren();if(!state.events.length){root.innerHTML='<div class="empty">Events will appear here. Camera footage is never included.</div>';return}state.events.slice(0,10).forEach(ev=>{const line=document.createElement("div");line.className="event";const dot=document.createElement("i");const content=document.createElement("div");const name=document.createElement("b");name.textContent=ev.message;const detail=document.createElement("p");detail.textContent=ev.detail;const time=document.createElement("time");time.textContent=ev.time.toLocaleTimeString();content.append(name,detail);line.append(dot,content,time);root.append(line)})}
function openModal(t){state.selected=t;$("modalTable").textContent=t.name;$("modalStatus").textContent="Current state: "+states[t.status]+" · "+t.seats+" seats";$("tableModal").hidden=false}
window.addEventListener("tablesight:select",event=>{const t=tables.find(t=>t.id===event.detail?.id);if(t)openModal(t)});
function closeModal(){$("tableModal").hidden=true;state.selected=null}
$("closeModal").addEventListener("click",closeModal);$("tableModal").addEventListener("click",e=>{if(e.target===$("tableModal"))closeModal()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
document.querySelectorAll("[data-state]").forEach(b=>b.addEventListener("click",()=>{change(state.selected,b.dataset.state,"Manual operator confirmation");closeModal()}));
function stepDemo(){if(state.mode!=="demo"){toast("Stop the real camera first to resume the simulation.");return}let choices=tables.filter(t=>t.status!=="reserved");if(!choices.length)return;const t=choices[Math.floor(Math.random()*choices.length)];const next={available:"occupied",occupied:"cleaning",cleaning:"available"}[t.status];change(t,next||"available","Clearly labeled simulated event")}
$("demoStep").addEventListener("click",stepDemo);state.timer=setInterval(()=>{if(state.mode==="demo")stepDemo()},11000);
$("clearEvents").addEventListener("click",()=>{state.events=[];renderEvents();toast("Local event timeline cleared")});
function updateClock(){$("clock").textContent=new Date().toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}setInterval(updateClock,20000);updateClock();
function setBadge(s){$("feedBadge").textContent=s;$("cameraMessage").textContent=state.ai?"PROCESSING ON THIS DEVICE":"NO BROWSER VIDEO UPLOAD";}
async function devices(){if(!navigator.mediaDevices?.enumerateDevices)return;try{const list=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput");const select=$("deviceSelect");const old=select.value;select.replaceChildren();const def=document.createElement("option");def.value="";def.textContent="System default camera";select.append(def);list.forEach((d,i)=>{let option=document.createElement("option");option.value=d.deviceId;option.textContent=d.label||"Camera "+(i+1);select.append(option)});select.value=Array.from(select.options).some(o=>o.value===old)?old:""}catch(e){}}
$("sourceType").addEventListener("change",()=>{const relay=$("sourceType").value==="relay";$("browserOpts").hidden=relay;$("relayOpts").hidden=!relay;stopCamera()});
if(navigator.mediaDevices?.addEventListener)navigator.mediaDevices.addEventListener("devicechange",devices);
function updateButtons(active){$("startCamera").disabled=active;$("stopCamera").disabled=!active;$("startAI").disabled=!active}
function stopAI(){state.ai=false;clearTimeout(state.detectTimer);state.detectTimer=null;$("startAI").textContent="✳ Enable person detection";$("aiState").textContent="AI inference is off. Camera preview does not imply an analyzed feed.";$("fps").textContent="— FPS";setBadge("● PREVIEW READY")}
function stopCamera(){stopAI();if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null}if(state.image){state.image.remove();state.image=null}const v=$("video");v.pause();v.srcObject=null;v.style.display="none";state.camera=null;state.live=false;state.mode="demo";$("cameraPlaceholder").hidden=false;setBadge("● PREVIEW OFFLINE");updateButtons(false);render();paint()}
$("stopCamera").addEventListener("click",()=>{stopCamera();toast("Camera stopped. Demo mode restored.")});
async function startCamera(){
 stopCamera();const isRelay=$("sourceType").value==="relay";$("startCamera").disabled=true;
 try {
  if(isRelay){let url=new URL($("relayUrl").value,location.href);if(!["http:","https:"].includes(url.protocol))throw Error("Only HTTP(S) bridge URLs are supported.");if(location.protocol==="https:"&&url.protocol==="http:"&&!["localhost","127.0.0.1","[::1]"].includes(url.hostname))throw Error("HTTPS dashboards cannot load insecure IP streams. Use an HTTPS reverse proxy.");
   const img=document.createElement("img");img.id="relayImage";img.alt="IP camera relay";img.crossOrigin="anonymous";state.image=img;
   await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error("Bridge timed out; verify the local server is running and URL is reachable.")),12000);img.onload=()=>{clearTimeout(timeout);resolve()};img.onerror=()=>{clearTimeout(timeout);reject(Error("Cannot open the IP bridge. Use the local bridge server on the same origin."))};img.src=url.href;$("video").parentElement.insertBefore(img,$("draw"))});state.camera=img;
  }else{if(!navigator.mediaDevices?.getUserMedia)throw Error("Camera needs HTTPS or localhost, and a browser with getUserMedia support.");
   const id=$("deviceSelect").value;state.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:id?{deviceId:{ideal:id}}:{facingMode:"environment"}});
   const video=$("video");video.style.display="block";video.srcObject=state.stream;await video.play();state.camera=video;await devices();
  }
  state.live=true;state.mode="preview";$("cameraPlaceholder").hidden=true;updateButtons(true);setBadge(isRelay?"● IP BRIDGE CONNECTED":"● LOCAL CAMERA ACTIVE");addEvent("Camera preview connected",isRelay?"Local IP bridge (no persistent video storage)":"Browser camera (on-device)");render();paint();toast("Camera preview active. Enable AI to analyze calibrated table zones.")
 }catch(e){stopCamera();toast("Camera error: "+e.message)}
}
$("startCamera").addEventListener("click",startCamera);
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(Error("Cannot load the detection library. Check connectivity or self-host the model."));document.head.append(s)})}
async function enableAI(){
 if(state.ai){stopAI();return}if(!state.camera){toast("Start the camera preview first.");return}
 $("startAI").disabled=true;$("aiState").textContent="Loading local person detection model. First run downloads model files to your browser.";
 try{if(!window.tf)await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");
 if(!window.cocoSsd)await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js");
 if(!state.model)state.model=await window.cocoSsd.load({base:"lite_mobilenet_v2"});
 state.ai=true;state.mode="vision";state.lastDetect=0;state.lastFPS=0;
 tables.forEach(t=>{t.status="unmonitored";t.present=0;t.absent=0});render();
 $("startAI").textContent="■ Stop AI detection";$("aiState").textContent="AI active. Draw a separate seating zone for each table. Unmapped tables remain UNMAPPED.";
 addEvent("On-device model active","COCO-SSD person detections; no identity recognition.");detectLoop();
 }catch(e){$("aiState").textContent="Inference unavailable: "+e.message;toast("AI could not start: "+e.message)}finally{$("startAI").disabled=false}
}
$("startAI").addEventListener("click",enableAI);
function dims(){const src=state.camera;if(!src)return null;const w=src.videoWidth||src.naturalWidth,h=src.videoHeight||src.naturalHeight;if(!w||!h)return null;return {w,h}}
function surface(){const canvas=$("draw"),src=state.camera;if(!src)return;const cw=canvas.clientWidth,ch=canvas.clientHeight;const d=dims();if(!d)return;const scale=Math.min(cw/d.w,ch/d.h);return {ox:(cw-d.w*scale)/2,oy:(ch-d.h*scale)/2,sw:d.w*scale,sh:d.h*scale,w:d.w,h:d.h}}
function normalized(x,y){const canvas=$("draw"),r=canvas.getBoundingClientRect(),s=surface();if(!s)return null;return {x:Math.max(0,Math.min(1,(x-r.left-s.ox)/s.sw)),y:Math.max(0,Math.min(1,(y-r.top-s.oy)/s.sh))}}
let detections=[];
function paint(){
 const canvas=$("draw");const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.max(1,Math.floor(r.height*dpr));const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);const s=surface();if(!s)return;
 function rect(zone,color,name){const x=s.ox+zone[0]*s.sw,y=s.oy+zone[1]*s.sh,w=(zone[2]-zone[0])*s.sw,h=(zone[3]-zone[1])*s.sh;ctx.fillStyle=color+"19";ctx.fillRect(x,y,w,h);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.fillStyle=color;ctx.font="bold 12px sans-serif";ctx.fillText(name,x+5,Math.max(15,y-6))}
 Object.entries(state.zones).forEach(([id,zone])=>rect(zone,"#70ebc5",id));
 detections.forEach(d=>{const [x,y,w,h]=d.bbox;ctx.strokeStyle="#ffbb85";ctx.lineWidth=2;ctx.strokeRect(s.ox+x/dims().w*s.sw,s.oy+y/dims().h*s.sh,w/dims().w*s.sw,h/dims().h*s.sh);ctx.fillStyle="#ffbb85";ctx.font="bold 12px sans-serif";ctx.fillText("PERSON "+Math.round(d.score*100)+"%",s.ox+x/dims().w*s.sw,s.oy+y/dims().h*s.sh-6)});
 if(state.dragStart&&state.dragEnd){const z=[Math.min(state.dragStart.x,state.dragEnd.x),Math.min(state.dragStart.y,state.dragEnd.y),Math.max(state.dragStart.x,state.dragEnd.x),Math.max(state.dragStart.y,state.dragEnd.y)];rect(z,"#ffc17b","NEW ZONE")}
}
function handleDetections(result){detections=result.filter(d=>d.class==="person"&&d.score>.55);if($("syncFloor").checked){
 tables.forEach(t=>{const z=state.zones[t.id];if(!z)return;const found=detections.some(d=>{const cx=(d.bbox[0]+d.bbox[2]*.5)/dims().w,cy=(d.bbox[1]+d.bbox[3]*.5)/dims().h;return cx>=z[0]&&cx<=z[2]&&cy>=z[1]&&cy<=z[3]});if(found){t.present++;t.absent=0;if(t.present>=2&&["available","unmonitored"].includes(t.status))change(t,"occupied","On-device person presence confirmed")}else{t.absent++;t.present=0;if(t.absent>=4&&t.status==="occupied")change(t,"cleaning","No seated person detected; manual cleaning confirmation required");if(t.absent>=4&&t.status==="unmonitored")change(t,"available","Calibrated zone observed empty")}})}
 paint();$("aiState").textContent=detections.length+" person(s) detected · "+Object.keys(state.zones).length+" calibrated table zones · local inference only";
}
async function detectLoop(){if(!state.ai||!state.camera)return;let start=performance.now();try{if(dims()){const results=await state.model.detect(state.camera,20,.45);if(state.ai)handleDetections(results);const ms=performance.now()-start;state.lastFPS=Math.round(1000/Math.max(1,ms));$("fps").textContent=state.lastFPS+" INFER FPS"}}catch(e){$("aiState").textContent="Vision unavailable: "+e.message;stopAI();return}if(state.ai)state.detectTimer=setTimeout(detectLoop,550)}
const select=$("tableSelect");tables.forEach(t=>{const option=document.createElement("option");option.value=t.id;option.textContent=t.id+" · "+t.name;select.append(option)});
$("drawZone").addEventListener("click",()=>{if(!state.camera){toast("Start a camera before calibrating zones.");return}state.draw=!state.draw;$("drawZone").textContent=state.draw?"✕ Cancel drawing":"▧ Draw zone";$("draw").style.cursor=state.draw?"crosshair":"default";if(state.draw)toast("Drag on the camera image to map "+select.value)});
const canvas=$("draw");canvas.addEventListener("pointerdown",e=>{if(!state.draw)return;state.dragStart=normalized(e.clientX,e.clientY);state.dragEnd=state.dragStart;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointermove",e=>{if(!state.dragStart)return;state.dragEnd=normalized(e.clientX,e.clientY);paint()});
canvas.addEventListener("pointerup",e=>{if(!state.dragStart)return;const end=normalized(e.clientX,e.clientY);const a=state.dragStart;if(end&&Math.abs(a.x-end.x)>.03&&Math.abs(a.y-end.y)>.03){state.zones[select.value]=[Math.min(a.x,end.x),Math.min(a.y,end.y),Math.max(a.x,end.x),Math.max(a.y,end.y)];const t=tables.find(t=>t.id===select.value);if(t&&state.ai){t.status="unmonitored";t.present=0;t.absent=0}addEvent("Seating zone calibrated",select.value+" · normalized camera region");toast(select.value+" seating region saved for this session")}else{toast("Drag a larger rectangle to assign a table region.")}state.dragStart=null;state.dragEnd=null;state.draw=false;$("drawZone").textContent="▧ Draw zone";canvas.style.cursor="default";render();paint()});
$("resetZones").addEventListener("click",()=>{state.zones={};tables.forEach(t=>{if(state.ai)t.status="unmonitored"});detections=[];render();paint();addEvent("Zone calibration reset","All session-only camera regions cleared");toast("Calibration reset")});
window.addEventListener("resize",paint);
render();renderEvents();devices();addEvent("TableSight initialized","DEMO MODE · simulated restaurant data; no cameras connected.");
})();