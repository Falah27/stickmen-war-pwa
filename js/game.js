const C=document.getElementById('c'),X=C.getContext('2d'),W=960,H=540,G=440,WORLD=1800;
const K={},PR={};
addEventListener('keydown',e=>{if(/Space|Arrow/.test(e.code))e.preventDefault();if(!K[e.code])PR[e.code]=1;K[e.code]=1});
addEventListener('keyup',e=>K[e.code]=0);
addEventListener('blur',()=>{for(const k in K)K[k]=0;for(const k in PR)delete PR[k]});
document.addEventListener('dblclick',e=>{if(e.target.closest('#game,#controllerSelect,#controlSettings,#touchStateUI'))e.preventDefault()},{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});document.addEventListener('contextmenu',e=>{if(e.target.closest('#game,#controllerSelect,#controlSettings,#touchStateUI'))e.preventDefault()});
const GAME=document.getElementById('game'),MODE=document.getElementById('modeBtn'),FULL=document.getElementById('fullBtn'),SETTINGS=document.getElementById('settingsBtn'),SETTINGS_PANEL=document.getElementById('controlSettings'),SIZE_SLIDER=document.getElementById('buttonSize'),SIZE_VALUE=document.getElementById('buttonSizeValue'),MOBILE_MENU=document.getElementById('mobileMenu'),MOBILE_PAUSE=document.getElementById('mobilePause'),UPGRADE_TOUCH=document.getElementById('upgradeTouch'),GAMEOVER_TOUCH=document.getElementById('gameOverTouch'),GAMEOVER_SUMMARY=document.getElementById('gameOverSummary'),CONTROLLER_SELECT=document.getElementById('controllerSelect');
let controlMode='keyboard',controlsChosen=false,upDelay=0;
const CTRLS=[...document.querySelectorAll('.ctrl')],OP_SLIDER=document.getElementById('buttonOpacity'),OP_VALUE=document.getElementById('buttonOpacityValue'),HZ_SLIDER=document.getElementById('hzLevel'),HZ_VALUE=document.getElementById('hzValue'),SWAP=document.getElementById('swapSides'),HZN=['Tanpa','Sedikit','Normal'],CFG_KEY='stickmenCfg1';
let CFG={size:120,op:100,lefty:false,hz:1,pos:{}};
const DEBUG_RUNTIME=location.hostname==='localhost'||location.hostname==='127.0.0.1';
function logRuntimeError(operation,error){if(DEBUG_RUNTIME)console.warn(`[Stickmen War] ${operation} gagal`,error)}
function lsGet(k,d){try{return localStorage.getItem(k)||d}catch(e){logRuntimeError('Membaca konfigurasi',e);return d}}
function saveCfg(){try{localStorage.setItem(CFG_KEY,JSON.stringify(CFG))}catch(e){logRuntimeError('Menyimpan konfigurasi',e)}}
function loadCfg(){try{const o=JSON.parse(lsGet(CFG_KEY,'{}'));if(o&&typeof o=='object')Object.assign(CFG,o);CFG.pos=CFG.pos&&typeof CFG.pos=='object'?CFG.pos:{}}catch(e){}CFG.size=Math.max(70,Math.min(200,Number(CFG.size)||120));CFG.op=Math.max(30,Math.min(100,Number(CFG.op)||100));CFG.hz=[0,1,2].includes(CFG.hz)?CFG.hz:1}
const btnKey=b=>['left','right','jump','down','attack','skill','ult','pause'].find(k=>b.classList.contains(k));
function applyCfg(){const st=document.documentElement.style;st.setProperty('--control-scale',CFG.size/100);st.setProperty('--ctrl-op',CFG.op/100);
SIZE_SLIDER.value=CFG.size;SIZE_VALUE.textContent=CFG.size+'%';OP_SLIDER.value=CFG.op;OP_VALUE.textContent=CFG.op+'%';HZ_SLIDER.value=CFG.hz;HZ_VALUE.textContent=HZN[CFG.hz];
GAME.classList.toggle('lefty',!!CFG.lefty);SWAP.textContent='Tukar sisi kiri/kanan'+(CFG.lefty?' (aktif)':'');
const gw=GAME.clientWidth,gh=GAME.clientHeight;for(const b of CTRLS){const o=CFG.pos[btnKey(b)]||[0,0];b._tx=o[0]*gw;b._ty=o[1]*gh;b.style.translate=b._tx+'px '+b._ty+'px'}}
function cycleHz(){CFG.hz=(CFG.hz+1)%3;applyCfg();saveCfg()}
let editing=false,drag=null;
function setEditing(on){editing=on;GAME.classList.toggle('editing',on);if(on&&S=='play')S='pause';releaseAll()}
function startDrag(b,e){drag={b,k:btnKey(b),id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:b._tx||0,oy:b._ty||0};try{b.setPointerCapture(e.pointerId)}catch(_){}}
function moveDrag(e){if(!drag||e.pointerId!==drag.id)return;const b=drag.b,g=GAME.getBoundingClientRect(),r=b.getBoundingClientRect(),bl=r.left-(b._tx||0),bt=r.top-(b._ty||0);
let tx=drag.ox+e.clientX-drag.sx,ty=drag.oy+e.clientY-drag.sy;tx=Math.max(g.left-bl,Math.min(g.right-r.width-bl,tx));ty=Math.max(g.top-bt,Math.min(g.bottom-r.height-bt,ty));b._tx=tx;b._ty=ty;b.style.translate=tx+'px '+ty+'px';drag.moved=1}
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;if(drag.moved)CFG.pos[drag.k]=[drag.b._tx/(GAME.clientWidth||1),drag.b._ty/(GAME.clientHeight||1)];drag=null;saveCfg()}
loadCfg();applyCfg();if(window.ResizeObserver)new ResizeObserver(()=>applyCfg()).observe(GAME);addEventListener('resize',applyCfg);
SIZE_SLIDER.addEventListener('input',e=>{CFG.size=Math.max(70,Math.min(200,Number(e.target.value)||120));applyCfg();saveCfg()});
OP_SLIDER.addEventListener('input',e=>{CFG.op=Math.max(30,Math.min(100,Number(e.target.value)||100));applyCfg();saveCfg()});
HZ_SLIDER.addEventListener('input',e=>{CFG.hz=Math.max(0,Math.min(2,Number(e.target.value)||0));applyCfg();saveCfg()});
tap(SWAP,()=>{CFG.lefty=!CFG.lefty;applyCfg();saveCfg()});
tap(document.getElementById('editLayout'),()=>{SETTINGS_PANEL.classList.remove('open');setEditing(true)});
tap(document.getElementById('editDone'),()=>setEditing(false));
tap(document.getElementById('editReset'),()=>{CFG.pos={};CFG.lefty=false;applyCfg();saveCfg()});
function tap(el,fn){let fired=false;el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fired=true;fn(e)},{passive:false});el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!fired)fn(e);fired=false})}
tap(SETTINGS,()=>SETTINGS_PANEL.classList.add('open'));
tap(document.getElementById('closeSettings'),()=>SETTINGS_PANEL.classList.remove('open'));
tap(document.getElementById('resetButtonSize'),()=>{CFG.size=120;CFG.op=100;CFG.pos={};CFG.lefty=false;applyCfg();saveCfg()});
const SYNERGIES=[
{id:'berserker',name:'Berserker',needs:['damage','speed'],desc:'Damage +12% dan kecepatan +8%',f:p=>{p.dm*=1.12;p.sp*=1.08}},
{id:'precision',name:'Pemburu Presisi',needs:['damage','crit'],desc:'Crit chance +8%',f:p=>p.cr+=.08},
{id:'rapid-fire',name:'Rapid Fire',needs:['speed','cooldown'],desc:'Cooldown skill -18%',f:p=>p.cdm*=.82},
{id:'arcane-overdrive',name:'Arcane Overdrive',needs:['cooldown','ultimate'],desc:'Isi ultimate +30% dan ultimate +20%',f:p=>{p.em*=1.3;p.ult=Math.min(100,p.ult+20)}},
{id:'battle-hardened',name:'Battle Hardened',needs:['hp','damage'],desc:'Max HP +20 dan pulih penuh',f:p=>{p.mhp+=20;p.hp=p.mhp}}
];
function applySynergies(){for(const s of SYNERGIES)if(!p.synergies.has(s.id)&&s.needs.every(id=>p.upgrades.has(id))){p.synergies.add(s.id);s.f(p);txt(p.x,p.y-115,'SINERGI: '+s.name,'#fd3',22);FX.push({t:'ring',x:p.x,y:p.y-30,r:0,max:70,life:.35,ml:.35,col:'#fd3'});shake=Math.max(shake,7)}}
function synergyNames(){return SYNERGIES.filter(s=>p&&p.synergies.has(s.id)).map(s=>s.name)}
function synergyHints(id){return SYNERGIES.filter(s=>s.needs.includes(id)&&s.needs.some(other=>other!==id&&p.upgrades.has(other))).map(s=>s.name)}
function pickUpgrade(i){if(S!='upgrade'||upDelay>0||!opts[i])return false;const upgrade=opts[i];upgrade.f(p);p.upgrades.add(upgrade.id);applySynergies();p.cr=Math.min(.75,p.cr);p.cdm=Math.max(.3,p.cdm);p.hp=Math.min(p.mhp,p.hp+p.mhp*.25);wave++;S='play';startWave();return true}
function chooseUpgradeTouch(i){pickUpgrade(i)}
for(const b of document.querySelectorAll('.upgradeBtn'))tap(b,()=>chooseUpgradeTouch(Number(b.dataset.upgrade)));
tap(document.getElementById('restartTouch'),()=>{GAMEOVER_TOUCH.classList.remove('show');newGame()});
function haptic(ms=18){if(controlMode=='touch'&&navigator.vibrate)navigator.vibrate(ms)}
for(const b of document.querySelectorAll('.mobileCharacter'))tap(b,()=>{sel=Number(b.dataset.character);document.querySelectorAll('.mobileCharacter').forEach((x,i)=>x.classList.toggle('selected',i==sel));haptic()});
tap(document.getElementById('mobileStart'),()=>{haptic(30);MOBILE_MENU.classList.remove('show');newGame()});
tap(document.getElementById('resumeMobile'),()=>{S='play';MOBILE_PAUSE.classList.remove('show');haptic()});
tap(document.getElementById('restartMobile'),()=>{MOBILE_PAUSE.classList.remove('show');haptic(30);newGame()});
tap(document.getElementById('menuMobile'),()=>{S='menu';MOBILE_PAUSE.classList.remove('show');MOBILE_MENU.classList.add('show')});
function setControlMode(mode){controlMode=mode;controlsChosen=true;GAME.classList.toggle('touch',mode=='touch');MODE.textContent='Mode: '+(mode=='touch'?'Mobile':'PC');CONTROLLER_SELECT.classList.add('hidden');for(const k in K)K[k]=0;for(const k in PR)delete PR[k];applyCfg()}
async function landscapeFullscreen(){try{const rf=GAME.requestFullscreen||GAME.webkitRequestFullscreen;if(rf&&!document.fullscreenElement&&!document.webkitFullscreenElement)await rf.call(GAME);if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){logRuntimeError('Mengaktifkan fullscreen atau orientasi landscape',e)}}
if(!GAME.requestFullscreen&&!GAME.webkitRequestFullscreen)FULL.style.display='none';
tap(document.getElementById('chooseTouch'),async()=>{setControlMode('touch');MOBILE_MENU.classList.add('show');haptic();await landscapeFullscreen()});
tap(document.getElementById('chooseKeyboard'),()=>setControlMode('keyboard'));
MODE.addEventListener('click',()=>{if(S=='play')S='pause';MOBILE_MENU.classList.remove('show');MOBILE_PAUSE.classList.remove('show');CONTROLLER_SELECT.classList.remove('hidden');controlsChosen=false});
FULL.addEventListener('click',landscapeFullscreen);
function virtualCode(btn){const a=btn.dataset.action;if(!a)return btn.dataset.code;if(S=='upgrade')return a=='attack'?'Digit1':a=='skill'?'Digit2':'Digit3';if(S=='menu')return a=='attack'?'Enter':a=='skill'?'Digit2':a=='ult'?'Digit3':btn.dataset.code;return a=='attack'?'KeyJ':a=='skill'?'KeyK':'KeyL'}
const ACT=new Map(),MOVE=[document.querySelector('.ctrl.left'),document.querySelector('.ctrl.right')];
function press(b){const code=virtualCode(b);b._code=code;if(!K[code])PR[code]=1;K[code]=1;b.classList.add('active');haptic(b.dataset.action==='ult'?28:12)}
function release(b){if(b._code){K[b._code]=0;b._code=null}b.classList.remove('active')}
function endPtr(e){const a=ACT.get(e.pointerId);if(!a)return;ACT.delete(e.pointerId);release(a.cur)}
function releaseAll(){for(const a of ACT.values())release(a.cur);ACT.clear();for(const k in K)K[k]=0}
for(const b of document.querySelectorAll('.ctrl')){const mv=MOVE.includes(b);
b.addEventListener('pointerdown',e=>{e.preventDefault();if(editing){startDrag(b,e);return}if(controlMode!='touch'||ACT.has(e.pointerId))return;try{b.setPointerCapture(e.pointerId)}catch(_){}ACT.set(e.pointerId,{cur:b,mv});press(b)});
b.addEventListener('pointermove',e=>{const a=ACT.get(e.pointerId);if(!a||!a.mv)return;const L=MOVE[0].getBoundingClientRect(),R2=MOVE[1].getBoundingClientRect(),mid=(L.left+L.width/2+R2.left+R2.width/2)/2,dz=L.width*.2;let n=a.cur;if(e.clientX<mid-dz)n=MOVE[0];else if(e.clientX>mid+dz)n=MOVE[1];if(n!==a.cur){release(a.cur);press(n);a.cur=n}});
b.addEventListener('pointermove',moveDrag);for(const t of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,e=>{endDrag(e);endPtr(e)})}
addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
function autoPause(){releaseAll();if(S=='play')S='pause'}
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause()});addEventListener('pagehide',autoPause);addEventListener('blur',autoPause);
if(window.matchMedia)matchMedia('(orientation:portrait)').addEventListener('change',e=>{if(e.matches&&controlMode=='touch')autoPause()});
const down=(...c)=>c.some(k=>K[k]),pressed=(...c)=>c.some(k=>PR[k]),R=Math.random;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const CH=[
{n:'Swordsman',col:'#4df',hp:120,ac:.32,cd:3,wp:'sword',d:'Melee seimbang',sk:'K: Dash Slash',ul:'L: Shockwave'},
{n:'Archer',col:'#6f8',hp:90,ac:.28,cd:5,wp:'bow',d:'Jarak jauh',sk:'K: Hujan Panah',ul:'L: Laser Panah'},
{n:'Mage',col:'#c6f',hp:80,ac:.5,cd:4.5,wp:'staff',d:'AoE elemen',sk:'K: Petir Berantai',ul:'L: Meteor Storm'}];
const UP=[{id:'damage',n:'Damage +20%',f:p=>p.dm*=1.2},{id:'speed',n:'Kecepatan +15%',f:p=>p.sp*=1.15},{id:'hp',n:'Max HP +25 dan pulih penuh',f:p=>{p.mhp+=25;p.hp=p.mhp}},{id:'cooldown',n:'Cooldown skill -20%',f:p=>p.cdm*=.8},{id:'ultimate',n:'Isi ultimate +40%',f:p=>p.em*=1.4},{id:'crit',n:'Crit chance +10%',f:p=>p.cr+=.1}];
const BRANCHES=[
{id:'sword-guard',chars:[0],n:'Guard Break',f:p=>p.guardBreak=1},
{id:'sword-dash',chars:[0],n:'Dash Slash +35% damage',f:p=>p.dashDamage=1},
{id:'archer-pierce',chars:[1],n:'Panah Menembus',f:p=>p.pierce=(p.pierce||0)+1},
{id:'archer-focus',chars:[1],n:'Fokus Jarak Jauh',f:p=>{p.cr+=.12;p.em*=1.15}},
{id:'mage-area',chars:[2],n:'Resonansi Area',f:p=>p.areaPower=1.3},
{id:'mage-meteor',chars:[2],n:'Meteor Lebih Deras',f:p=>p.meteorPower=1.35}
];
function upgradePool(){return [...UP,...BRANCHES.filter(u=>u.chars.includes(sel))]}
let S='menu',sel=0,wave=1,score=0,combo=0,comboT=0,p,E=[],P=[],F=[],T=[],FX=[],D=[],shake=0,hit=0,slowT=0,slow=1,queue=[],spT=0,bn=0,opts=[],cam=0,tm=0,PL=[],SP=[],SW=[],JP=[],flash=0,zoom=1,LV=[],RK=[],LS=[],BR=[],PD=[],rkT=3,WAVENAME='';
function newGame(){const c=CH[sel];p={x:900,y:G,vx:0,vy:0,f:1,hp:c.hp,mhp:c.hp,ult:0,atkT:0,acd:0,cd:0,inv:0,dash:0,met:0,mt:0,dm:1,sp:1,cdm:1,em:1,cr:.1,run:0,t:0,on:1,drop:0,pl:0,coyote:0,jumpBuffer:0,upgrades:new Set,synergies:new Set,pierce:0,style:{bestCombo:0,skillKills:0,airKills:0,noHit:true}};E=[];P=[];F=[];T=[];FX=[];D=[];PL=[];SP=[];SW=[];JP=[];LV=[];RK=[];LS=[];BR=[];PD=[];queue=[];wave=1;score=0;combo=0;comboT=0;spT=0;bn=0;cam=0;shake=0;hit=0;slowT=0;slow=1;flash=0;zoom=1;rkT=3;S='play';startWave()}
function inPit(x){return LV.some(l=>x>l.x+4&&x<l.x+l.w-4)}
function lsPh(l){const m=l.t%4;return m<2.2?0:m<2.9?1:2}
function knock(e,vx,vy){const m=e.boss?8:e.k=='shield'?1.8:1;e.kv+=vx/m/8;if(!e.boss){e.vy+=vy/m;e.on=0}}
function rag(e,vx,vy){const x=e.x,y=e.y,s=e.s;const pts=[[0,-52],[0,-42],[0,-22],[-10,-30],[10,-30],[-6,0],[6,0]].map(([a,b])=>({x:x+a*s,y:y+b*s,px:x+a*s-vx*.016,py:y+b*s-vy*.016}));
const cs=[[0,1],[1,2],[1,3],[1,4],[2,5],[2,6]].map(([a,b])=>[a,b,Math.hypot(pts[a].x-pts[b].x,pts[a].y-pts[b].y)]);D.push({pts,cs,col:e.col,s,life:3})}
function explode(b){if(b.dead)return;b.dead=1;boom({x:b.x,y:G,aoe:140,dmg:55,col:'#fa3'});FX.push({t:'ring',x:b.x,y:G,r:0,max:200,life:.5,ml:.5,col:'#fff'});burst(b.x,G-20,45,'#fb4',650);shake=Math.max(shake,14);flash=Math.max(flash,.3);hit=Math.max(hit,.06);
if(Math.abs(p.x-b.x)<140&&p.y>G-90)hurt(20,Math.sign(p.x-b.x)||1);for(const o of BR)if(!o.dead&&Math.abs(o.x-b.x)<170)o.fuse=o.fuse||.12}
function BRU(dt){for(const b of BR){if(b.dead)continue;if(Math.abs(p.x-b.x)<26&&p.y>G-34&&Math.abs(p.vx)>20)b.vx+=(p.vx-b.vx)*.35;
b.x+=b.vx*dt;b.vx*=Math.pow(.02,dt);if(b.x<20||b.x>WORLD-20){b.x=Math.max(20,Math.min(WORLD-20,b.x));b.vx*=-.5}
if(inPit(b.x)){b.dead=1;burst(b.x,G,20,'#f80',400);continue}
for(const s of SW)if(Math.abs(s.x-b.x)<s.r+14)b.fuse=b.fuse||.05;
for(const l of LS)if(lsPh(l)==2&&b.x>l.x1&&b.x<l.x2&&l.y>b.y-38&&l.y<b.y)b.fuse=b.fuse||.05;
if(b.fuse>0){b.fuse-=dt;if(b.fuse<=0)explode(b)}}BR=BR.filter(b=>!b.dead)}
function PDU(dt){for(const d of PD){d.w+=-(1800/d.L)*Math.sin(d.a)*dt;d.a+=d.w*dt;d.bx=d.x+Math.sin(d.a)*d.L;d.by=d.y+Math.cos(d.a)*d.L;d.cd-=dt;
if(Math.hypot(p.x-d.bx,p.y-30-d.by)<d.r+14&&p.inv<=0){hurt(18,Math.sign(p.x-d.bx)||1);p.vy=-400}
if(d.cd<=0){let h=0;for(const e of E)if(!e.dead&&Math.hypot(e.x-d.bx,e.y-30*e.s-d.by)<d.r+e.w){h=1;knock(e,Math.sign(e.x-d.bx)*600,-450);dmgE(e,16,0,1)}if(h)d.cd=.35}
for(const b of BR)if(Math.hypot(b.x-d.bx,b.y-18-d.by)<d.r+16)b.fuse=b.fuse||.05}}
function HZ(dt){for(const pl of PL)if(pl.m){const nx=pl.bx+Math.sin(tm*pl.sp+pl.ph)*pl.ax,ny=pl.by+Math.sin(tm*pl.sp*.9+pl.ph)*pl.ay;pl.dx=nx-pl.x;pl.dy=ny-pl.y;pl.x=nx;pl.y=ny}
if(p.on&&p.pl&&p.pl.m){p.x+=p.pl.dx;p.y=p.pl.y}BRU(dt);PDU(dt);
if(p.y>G+45){const l=LV.find(l=>p.x>l.x-10&&p.x<l.x+l.w+10);if(l){p.x=Math.max(30,Math.min(WORLD-30,p.x<l.x+l.w/2?l.x-35:l.x+l.w+35));p.y=G;p.vy=-650;p.vx=0;p.inv=0;burst(p.x,G,30,'#f80',500);flash=.25;hurt(22,0);p.inv=Math.max(p.inv,1.2)}else{p.y=G;p.vy=0}}
rkT-=dt;if(hzRock&&rkT<=0){rkT=Math.max(2.4,5.5-wave*.3)*(.7+R()*.6);RK.push({x:Math.max(40,Math.min(WORLD-40,p.x+(R()-.5)*600)),warn:1,y:-40,vy:0})}
for(const r of RK){if(r.warn>0){r.warn-=dt;continue}r.vy+=1800*dt;r.y+=r.vy*dt;F.push({x:r.x,y:r.y-10,vx:R()*40-20,vy:-30,life:.3,ml:.3,col:'#fa6',sz:4,g:0});
let brk=0;if(Math.abs(p.x-r.x)<24&&r.y>p.y-70&&r.y<p.y+10&&p.inv<=0){hurt(18,Math.sign(p.x-r.x)||1);brk=1}
for(const e of E)if(!e.dead&&Math.abs(e.x-r.x)<e.w+16&&r.y>e.y-65*e.s&&r.y<e.y+5){dmgE(e,30,0,1);brk=1}
if(r.y>=G-14)brk=1;
if(brk){r.dead=1;burst(r.x,Math.min(r.y,G-10),20,'#a98',350);shake=Math.max(shake,8);FX.push({t:'ring',x:r.x,y:G,r:0,max:70,life:.3,ml:.3,col:'#fa6'})}}
RK=RK.filter(r=>!r.dead);
for(const l of LS){l.t+=dt;l.cd-=dt;if(lsPh(l)==2){if(p.x>l.x1&&p.x<l.x2&&l.y>p.y-62&&l.y<p.y+2)hurt(14,-p.f);if(l.cd<=0){l.cd=.4;for(const e of E)if(!e.dead&&e.x>l.x1&&e.x<l.x2&&l.y>e.y-65*e.s&&l.y<e.y+2)dmgE(e,12,0,1)}}}
for(const l of LV)if(R()<dt*10)F.push({x:l.x+R()*l.w,y:G+8,vx:0,vy:-120-R()*160,life:.8,ml:.8,col:'#fa3',sz:3,g:400})}
const HZT=['spike','saw','lava','rock','laser','pendulum'],HZL={spike:'Spike',saw:'Gergaji',lava:'Lava',rock:'Batu jatuh',laser:'Laser',pendulum:'Pendulum'};
let HZNAME='',lastTh=[],hzRock=false,ARENA='';
function gen(){PL=[];SP=[];SW=[];JP=[];LV=[];RK=[];LS=[];BR=[];PD=[];p.pl=0;rkT=4;hzRock=false;
const boss=wave%5==0,lv=CFG.hz;let th=[];
if(!boss&&lv>0&&wave>=2){const k=lv==1?(wave<6?1:2):(wave<3?1:wave<8?2:3);let c=HZT.filter(t=>!lastTh.includes(t));if(c.length<k)c=HZT.slice();th=shuffle(c).slice(0,k)}
lastTh=th;const has=t=>th.includes(t);hzRock=has('rock');
ARENA=boss?(wave%10==0?'Arena Badai':'Arena Benteng'):'Arena Standar';
HZNAME=boss?('BOSS! '+ARENA):th.length?'Rintangan: '+th.map(t=>HZL[t]).join(' + '):'Tanpa rintangan';
if(boss&&wave%10==0){LV.push({x:620,w:150});LS.push({x1:500,x2:900,y:G-120,t:1,cd:0})}
if(boss&&wave%10!=0)PL.push({x:540,y:G-125,w:180,m:1,bx:540,by:G-125,ax:0,ay:0,sp:0,ph:0,dx:0,dy:0});
for(let i=0;i<4;i++)PL.push({x:200+i*400+R()*100,w:120+R()*80,y:G-(i%2?185:100)});
if(has('lava')){const n=lv==2&&wave>=8?2:1;for(let i=0;i<12&&LV.length<n;i++){const x=300+R()*(WORLD-700),w=110+R()*60;if(Math.abs(x+w/2-p.x)>220&&!LV.some(l=>Math.abs(l.x-x)<400))LV.push({x,w})}}
if(has('spike')){const n=(lv==2?3:2)+(wave>8?1:0);for(let i=0;i<14&&SP.length<n;i++){const x=150+R()*(WORLD-300);if(Math.abs(x-p.x)>140&&!inPit(x)&&!inPit(x+80))SP.push({x,w:50+R()*30})}}
if(has('saw'))for(let i=0;i<(lv==2?2:1);i++){const a=200+R()*600;SW.push({x:a,a,b:a+300+R()*400,v:(90+R()*60)*(R()<.5?1:-1),r:20,rot:0,cd:0})}
if(has('laser'))for(let i=0;i<(lv==2&&wave>=10?2:1);i++){const x1=100+R()*(WORLD-500);LS.push({x1,x2:x1+250+R()*250,y:G-(R()<.5?35:130),t:R()*4,cd:0})}
if(has('pendulum'))for(let i=0;i<(lv==2&&wave>=12?2:1);i++){const L=180+R()*80,x=300+R()*(WORLD-600),a=1+R()*.3,bot=R()<.5?G-22:G-100;PD.push({x,y:bot-L,L,a,w:0,r:22,cd:0,bx:x+Math.sin(a)*L,by:bot-L+Math.cos(a)*L})}
for(let i=0;i<Math.max(LV.length,1);i++){const l=LV[i],bx=l?l.x+l.w/2-50:300+R()*(WORLD-600),by=G-(120+R()*60);PL.push({x:bx,y:by,w:100,m:1,bx,by,ax:l?50:90+R()*60,ay:R()<.5?0:45,sp:1+R()*.8,ph:R()*6,dx:0,dy:0})}
{const x=300+R()*(WORLD-600);if(!inPit(x-30)&&!inPit(x+30))JP.push({x})}
for(let i=0,n=2+(wave>=6?1:0);i<n;i++){const x=150+R()*(WORLD-300);if(Math.abs(x-p.x)>120&&!inPit(x-20)&&!inPit(x+20))BR.push({x,y:G,vx:0})}}
function startWave(){gen();P=[];RK=[];p.inv=Math.max(p.inv,2.2);p.drop=0;p.pl=0;queue=[];const themes=[['soldier','soldier','soldier','soldier'],['soldier','soldier','archer','archer'],['soldier','shield','soldier','archer'],['runner','soldier','runner','archer'],['bomber','soldier','shield','archer'],['runner','bomber','archer','shield'],['healer','tank','soldier','archer'],['flying','flying','tank','healer']],names=['Barisan Dasar','Hujan Panah','Perisai Maju','Serbuan Cepat','Penyergap Bom','Kekacauan Campuran','Formasi Medis','Serangan Udara'];const ti=(wave-1)%themes.length,theme=themes[ti];WAVENAME=wave%5==0?'Pertarungan Boss':names[ti];const n=Math.min(14,4+Math.floor(wave*1.5));for(let i=0;i<n;i++){let k=theme[i%theme.length];if(wave<2&&k!='soldier')k='soldier';if(wave<3&&!['soldier','archer','runner'].includes(k))k='soldier';queue.push(k)}
if(wave%5==0){queue.unshift('boss');for(let i=0;i<2;i++)queue.push('soldier')}bn=2.2;spT=1.25}
const BASE={soldier:{hp:32,sp:118,dmg:7,s:1,col:'#f66'},archer:{hp:24,sp:82,dmg:6,s:1,col:'#fb4'},shield:{hp:58,sp:68,dmg:9,s:1.1,col:'#a6f',arm:.72},runner:{hp:22,sp:190,dmg:6,s:.88,col:'#f6a'},bomber:{hp:30,sp:92,dmg:8,s:1,col:'#f83'},healer:{hp:28,sp:72,dmg:4,s:1,col:'#7df'},tank:{hp:105,sp:42,dmg:13,s:1.35,col:'#789',arm:.58},flying:{hp:35,sp:96,dmg:8,s:1.05,col:'#d7f'},boss:{hp:720,sp:62,dmg:18,s:2.4,col:'#f94',boss:1}};
function spawn(k){const b=BASE[k],isBoss=k=='boss',firstBoss=isBoss&&wave==5,hpScale=1+(wave-1)*(isBoss?.045:.075),bossTier=isBoss?1+.18*Math.max(0,wave/5-1):1,hp=b.hp*hpScale*bossTier*(firstBoss?.58:1),dmgScale=1+Math.min(.65,(wave-1)*.028),speedScale=1+Math.min(isBoss?.16:.24,(wave-1)*.009);
E.push({k,x:R()<.5?-30:WORLD+30,y:k=='flying'?180:G,hp,mhp:hp,sp:b.sp*speedScale*(firstBoss?.78:1),dmg:b.dmg*dmgScale*(firstBoss?.62:1),s:b.s,w:14*b.s,col:b.col,boss:b.boss,arm:b.arm,t:R()*5,cd:1,kv:0,fl:0,run:0,f:1,atk:0,wind:0,sc:firstBoss?4.5:3,vy:0,on:1,jc:0,cc:0,telegraph:0,healT:2.5,hover:R()*6,bossStyle:wave%10==0?'storm':'shockwave'})}
function burst(x,y,n,col,sp=300){for(let i=0;i<n;i++){const a=R()*6.28,v=R()*sp;F.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,life:.4+R()*.5,ml:.9,col,sz:2+R()*3,g:700,st:R()<.4})}}
const txt=(x,y,s,col,sz)=>T.push({x,y,s,col,sz,life:.8});
function dmgE(e,d,kx=0,big){if(e.dead)return;d*=p.dm;if(p.skillHit)d*=p.skillPower||1;const cr=R()<p.cr;if(cr)d*=2;if(e.arm&&!p.guardBreak)d*=e.arm;d=Math.round(d);e.hp-=d;e.fl=.1;e.kv+=kx*(e.boss?.2:6)/(e.k=='shield'||e.k=='tank'?1.8:1);e.kv=Math.max(-220,Math.min(220,e.kv));
p.ult=Math.min(100,p.ult+d*.15*p.em);combo++;comboT=2.5;score+=d;txt(e.x,e.y-70*e.s,d,cr?'#fd3':'#fff',cr?28:18);FX.push({t:'flash',x:e.x,y:e.y-30*e.s,life:.14,ml:.14,col:cr?'#fd3':'#fff'});burst(e.x,e.y-30*e.s,6,e.col);
const milestone=combo>1&&combo%5==0;if(milestone){txt(e.x,e.y-105*e.s,combo+' HIT COMBO','#fd3',22);FX.push({t:'ring',x:e.x,y:e.y-30*e.s,r:0,max:42,life:.25,ml:.25,col:'#fd3'})}hit=Math.max(hit,big?.1:milestone?.08:.045);shake=Math.max(shake,big?9:milestone?6:3);if(e.hp<=0)kill(e)}
function kill(e){e.dead=1;if(p.skillHit)p.style.skillKills++;if(!e.boss&&p.y<e.y-20)p.style.airKills++;p.style.bestCombo=Math.max(p.style.bestCombo,combo);rag(e,e.kv*8+(e.x>p.x?1:-1)*(100+R()*200),(e.vy||0)-350-R()*300);
burst(e.x,e.y-30*e.s,e.boss?80:16,e.col,e.boss?600:350);score+=e.boss?500:20;if(e.boss){slowT=1.6;shake=24;hit=.25;flash=.8;zoom=1.15;FX.push({t:'ring',x:e.x,y:G,r:0,max:500,life:.6,ml:.6,col:'#fff'})}}
function hurt(d,dir=0){if(p.inv>0||S!='play')return;p.style.noHit=false;p.hp-=d;p.inv=.8;p.vx=dir*250;shake=Math.max(shake,10);hit=Math.max(hit,.1);combo=0;comboT=0;burst(p.x,p.y-30,14,'#f33');txt(p.x,p.y-80,Math.round(d),'#f55',22);if(p.hp<=0){p.hp=0;S='over';slowT=1;burst(p.x,p.y-30,60,CH[sel].col,500)}}
function bombEnemy(e){if(e.dead)return;e.dead=1;score+=15;const radius=125;if(Math.abs(p.x-e.x)<radius&&Math.abs(p.y-e.y)<80)hurt(e.dmg,e.x<p.x?1:-1);for(const o of E)if(o!==e&&!o.dead&&Math.abs(o.x-e.x)<radius){knock(o,Math.sign(o.x-e.x)*420,-450);dmgE(o,18,Math.sign(o.x-e.x)*20,1)}FX.push({t:'ring',x:e.x,y:G,r:0,max:radius,life:.45,ml:.45,col:'#f83'});burst(e.x,G-24,35,'#f83',500);shake=Math.max(shake,10);hit=Math.max(hit,.08)}
function boom(q){for(const b of BR)if(!b.dead&&Math.abs(b.x-q.x)<q.aoe+14)b.fuse=b.fuse||.08;for(const e of E)if(!e.dead&&Math.hypot(e.x-q.x,(e.y-30*e.s)-q.y)<q.aoe+e.w){knock(e,Math.sign(e.x-q.x)*550,-700);dmgE(e,q.dmg,Math.sign(e.x-q.x)*30,1)};FX.push({t:'ring',x:q.x,y:Math.min(q.y,G),r:0,max:q.aoe,life:.35,ml:.35,col:q.col});burst(q.x,Math.min(q.y,G),22,q.col,450);shake=Math.max(shake,7)}
function shoot(o){P.push(Object.assign({o:'p',vy:0,life:2,pi:0},o))}
function assist(mv){if(controlMode!='touch'||mv)return;let t=null,d=420;for(const e of E)if(!e.dead&&Math.abs(e.x-p.x)<d){d=Math.abs(e.x-p.x);t=e}if(t)p.f=t.x>p.x?1:-1}
function attack(){const c=CH[sel],f=p.f;p.skillHit=0;p.acd=c.ac;p.atkT=.25;
if(c.wp=='sword'){slashFx(c,f);for(const b of BR){const dx=(b.x-p.x)*f;if(!b.dead&&dx>-10&&dx<90&&Math.abs(b.y-p.y)<90){b.fuse=b.fuse||.03;b.vx=f*400}}for(const e of E){const dx=(e.x-p.x)*f;if(!e.dead&&dx>-10&&dx<90+e.w&&Math.abs(e.y-p.y)<90)dmgE(e,15,f*30)}}
else if(c.wp=='bow')shoot({x:p.x+f*20,y:p.y-38,vx:f*1000,dmg:10,col:c.col,life:1.2,pi:p.pierce});
else shoot({x:p.x+f*20,y:p.y-38,vx:f*560,dmg:12,aoe:75* (p.areaPower||1),col:'#fa3',life:1.5})}
function skill(){const c=CH[sel],f=p.f;p.skillHit=1;p.cd=c.cd*p.cdm;
if(sel==0){p.dash=.22;p.dh=new Set;p.inv=.35;p.vx=f*1250;FX.push({t:'thrust',x:p.x,y:p.y-35,f,life:.25,ml:.25,col:c.col})}
else if(sel==1){for(let i=0;i<9;i++)shoot({x:p.x+f*(100+i*55),y:-30-i*25,vx:0,vy:900,dmg:14,pi:2,col:c.col,down:1})}
else{let ts=E.filter(e=>!e.dead&&Math.abs(e.x-p.x)<520).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)).slice(0,5),px=p.x,py=p.y-40;
if(!ts.length)ts=[{x:p.x+f*350,y:G,s:1,fake:1}];for(const e of ts){const ex=e.x,ey=e.y-30*e.s,pts=[[px,py]];for(let i=1;i<6;i++)pts.push([px+(ex-px)*i/6+(R()-.5)*30,py+(ey-py)*i/6+(R()-.5)*30]);pts.push([ex,ey]);FX.push({t:'bolt',pts,life:.3,ml:.3,col:'#dcf'});if(!e.fake)dmgE(e,28,0,1);px=ex;py=ey}shake=6}}
function ultimate(){const f=p.f;p.skillHit=1;p.ult=0;slowT=.7;flash=.5;zoom=1.12;
if(sel==0){for(const e of E)if(!e.dead&&Math.abs(e.x-p.x)<340){knock(e,Math.sign(e.x-p.x)*900,-800);dmgE(e,75,Math.sign(e.x-p.x)*60,1)};FX.push({t:'ring',x:p.x,y:G,r:0,max:340,life:.5,ml:.5,col:'#4df'});{const mk=sg=>{let x=0,pts=[[0,0]];for(let i=0;i<9;i++){x+=sg*(28+R()*22);pts.push([x,R()*14+(i%2?4:0)])}return pts};FX.push({t:'crack',x:p.x,life:.9,ml:.9,col:'#fb4',p:[mk(1),mk(-1),mk(1),mk(-1)]});FX.push({t:'spin',x:p.x,y:p.y-35,life:.55,ml:.55,col:'#4df'})}FX.push({t:'ring',x:p.x,y:G,r:0,max:240,life:.4,ml:.4,col:'#fff'});shake=18;burst(p.x,G-20,60,'#4df',600)}
else if(sel==1){FX.push({t:'beam',x:p.x,y:p.y-38,f,life:.5,ml:.5,col:'#6f8'});for(const e of E)if(!e.dead&&(e.x-p.x)*f>0&&Math.abs(e.x-p.x)<1100)dmgE(e,85,f*50,1);shake=16}
else{p.met=2.2;p.mt=0;shake=8}}
const TR=[],lerp=(a,b,k)=>a+(b-a)*k,ez=k=>k<0?0:k>1?1:k*k*(3-2*k);
function ik(ax,ay,bx,by,l1,l2,d){const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,m=Math.min(L,l1+l2-.01),a=Math.atan2(dy,dx),c=Math.acos(Math.max(-1,Math.min(1,(l1*l1+m*m-l2*l2)/(2*l1*m)))),q=a+d*c;return[ax+Math.cos(q)*l1,ay+Math.sin(q)*l1,ax+dx/L*m,ay+dy/L*m]}
function man(x,y,col,f,run,t,s,atk,wp,rot,alpha=1,o={}){
X.save();X.globalAlpha=alpha;X.translate(x,y);if(rot!==undefined){X.translate(0,-30*s);X.rotate(rot);X.translate(0,30*s)}X.scale(f,1);
const cls=o.cls,foe=['soldier','archer','shield','runner','bomber','healer','tank','flying','boss'].includes(cls),lw=4*Math.pow(s,.7),lw2=2*Math.pow(s,.6);
X.strokeStyle=X.fillStyle=col;X.shadowColor=col;X.shadowBlur=12;X.lineWidth=lw;X.lineCap=X.lineJoin='round';
const air=o.air,vy=o.vy||0,pr=atk>0?1-atk:-1,ph=t*12,bob=run?Math.abs(Math.sin(ph))*1.6*s:Math.sin(t*2.4)*.8*s,
lean=(run?2.5*s:0)+(pr>=0?Math.sin(pr*Math.PI)*4*s:0)+(air?1.5*s:0),
hip=[0,-22*s+bob],sh=[lean,-39*s+bob*.7],hd=[lean*1.3,-51*s+bob*.7],sx=sh[0],sy=sh[1],r=9*s,swing=-Math.sin(ph)*run*4*s,
wv=i=>Math.sin(t*7-i*.9)*(1.2+run*1.6)*s;
const rib=(x0,y0,n,len,dy,c,w)=>{X.save();X.strokeStyle=c;X.shadowColor=c;X.lineWidth=w;X.beginPath();X.moveTo(x0,y0);for(let i=1;i<=n;i++)X.lineTo(x0-i*len*s*(1+run*.4),y0+dy*s+i*.7*s+wv(i)-vy*.003*i*s);X.stroke();X.restore()};

// aksesori belakang: jubah / quiver
if(cls=='mg'||cls=='boss'){const L=cls=='boss'?26:17,w=Math.sin(t*5)*2*s+run*5*s-(air?vy*.004*s:0);X.save();X.globalAlpha*=.3;X.beginPath();X.moveTo(sx,sy);X.lineTo(sx-9*s-w,sy+L*s);X.lineTo(sx+3*s-w*.3,sy+L*s*.9);X.lineTo(sx+1*s,sy+3*s);X.closePath();X.fill();X.restore();X.beginPath();X.moveTo(sx,sy);X.lineTo(sx-9*s-w,sy+L*s);X.lineTo(sx+3*s-w*.3,sy+L*s*.9);X.lineWidth=lw2;X.stroke();X.lineWidth=lw}
if(cls=='ar'){X.save();X.translate(sx-5*s,sy+7*s);X.rotate(-.5);X.lineWidth=lw2;X.strokeRect(-3*s,-2*s,6*s,16*s);for(let i=-1;i<=1;i++){X.beginPath();X.moveTo(i*2*s,-2*s);X.lineTo(i*2.5*s,-8*s);X.stroke()}X.restore()}

// kaki (IK) + badan
let fa,fb;if(air){fa=[6*s,vy<0?-9*s:-2*s];fb=[-5*s,vy<0?-4*s:-6*s]}else{const sa=Math.sin(ph)*run;fa=[sa*9*s+(pr>=0?3*s:0),-Math.max(0,Math.cos(ph))*run*5*s];fb=[-sa*9*s,-Math.max(0,-Math.cos(ph))*run*5*s]}
X.beginPath();for(const F of[fa,fb]){const k=ik(hip[0],hip[1],F[0],F[1],12*s,12*s,-1);X.moveTo(hip[0],hip[1]);X.lineTo(k[0],k[1]);X.lineTo(k[2],k[3]);X.lineTo(k[2]+3*s,k[3])}
X.moveTo(hip[0],hip[1]);X.lineTo(sx,sy);X.stroke();X.beginPath();X.arc(hd[0],hd[1],r,0,6.28);X.stroke();

// mata
if(foe){X.lineWidth=1.8*Math.pow(s,.6);X.beginPath();X.moveTo(hd[0]+1.5*s,hd[1]-2.6*s);X.lineTo(hd[0]+6*s,hd[1]-.4*s);X.stroke();X.lineWidth=lw}else{X.save();X.fillStyle='#fff';X.beginPath();X.arc(hd[0]+3.6*s,hd[1]-.6*s,1.5*s,0,6.28);X.fill();X.restore()}

// lengan + senjata
const arm=(hx,hy)=>{const e=ik(sx,sy,hx,hy,9*s,9*s,1);X.beginPath();X.moveTo(sx,sy);X.lineTo(e[0],e[1]);X.lineTo(e[2],e[3]);X.stroke();return[e[2],e[3]]};
const blade=(hx,hy,phi,L,cv,wd)=>{X.save();X.translate(hx,hy);X.rotate(phi);X.lineWidth=lw2;X.beginPath();X.moveTo(-7*s,0);X.lineTo(0,0);X.moveTo(0,-3.5*s);X.lineTo(0,3.5*s);X.stroke();
X.beginPath();X.moveTo(s,-wd*s);X.quadraticCurveTo(L*.55*s,(-wd-cv)*s,L*s,-cv*1.6*s);X.quadraticCurveTo(L*.55*s,(wd*.2-cv)*s,s,wd*s);X.closePath();X.fillStyle='#eaffff';X.fill();X.lineWidth=1.3;X.stroke();X.restore()};
let hand;
if(wp=='sword'){let th=1.05;if(pr>=0){const B=o.up?1.2:-2.4,E=o.up?-1.9:1.1;th=pr<.2?lerp(1.05,B,ez(pr/.2)):pr<.55?lerp(B,E,ez((pr-.2)/.35)):lerp(E,1.05,ez((pr-.55)/.45))}
const rc=pr>=0?17*s:13*s,phi=pr>=0?th-.3:-.85;hand=arm(sx+Math.cos(th)*rc,sy+Math.sin(th)*rc);arm(-4*s+swing,sy+15*s);
const big=cls=='boss',L=cls=='sw'?38:cls=='boss'?36:26;blade(hand[0],hand[1],phi,L,cls=='sw'?3:big?1.5:.8,big?3:cls=='sw'?2.2:2.5);
if(o.trail&&pr>=.12&&pr<=.75){const wx=x+cam+f*(hand[0]+Math.cos(phi)*L*s),wy=y+hand[1]+Math.sin(phi)*L*s,l=TR[TR.length-1];if(!l||l.x!=wx||l.y!=wy)TR.push({x:wx,y:wy,t:tm,col})}}
else if(wp=='bow'){hand=arm(sx+15*s-(pr>=0?Math.sin(pr*3.14)*2*s:0),sy-s+Math.sin(t*2)*.3*s);const pull=pr<0?0:pr<.5?pr/.5:1-ez((pr-.5)/.5),bx=hand[0]+2*s,by=hand[1];
X.beginPath();X.moveTo(bx-2*s,by-17*s);X.quadraticCurveTo(bx+10*s,by,bx-2*s,by+17*s);X.stroke();X.save();X.lineWidth=1;X.beginPath();X.moveTo(bx-2*s,by-17*s);X.lineTo(bx-2*s-pull*12*s,by);X.lineTo(bx-2*s,by+17*s);X.stroke();X.restore();
arm(bx-2*s-pull*12*s,by);if(pr>=0&&pr<.5){X.lineWidth=lw2;X.beginPath();X.moveTo(bx-2*s-pull*12*s,by);X.lineTo(bx+14*s,by);X.stroke()}}
else if(wp=='staff'){const th=pr>=0?Math.sin(pr*Math.PI)*10*s:0;hand=arm(sx+11*s+th,sy+7*s);const ox=hand[0]+th*.5,top=hand[1]-32*s,oy=top-5*s,pu=1+Math.sin(t*6)*.15+(pr>=0?Math.sin(pr*3.14)*.6:0);
X.beginPath();X.moveTo(hand[0],hand[1]+20*s);X.lineTo(ox,top);X.stroke();X.lineWidth=lw2;X.beginPath();X.arc(ox,oy+2*s,6*s,.2,2.9);X.stroke();
X.save();X.fillStyle='#fff';X.shadowBlur=24;X.beginPath();X.arc(ox,oy,4.5*s*pu,0,6.28);X.fill();X.restore();X.beginPath();X.arc(ox,oy,6.8*s*pu,0,6.28);X.lineWidth=1.4;X.stroke();X.lineWidth=lw;
arm(-2*s+swing,sy+12*s-(pr>=0?Math.sin(pr*3.14)*16*s:0))}
else if(wp=='shield'){const th=pr>=0?Math.sin(pr*Math.PI)*8*s:0;hand=arm(sx+12*s+th,sy+5*s);arm(-3*s+swing,sy+15*s);X.save();X.globalAlpha*=.35;X.fillRect(hand[0]-s,hand[1]-17*s,9*s,34*s);X.restore();X.lineWidth=lw2;X.strokeRect(hand[0]-s,hand[1]-17*s,9*s,34*s);X.beginPath();X.arc(hand[0]+3.5*s,hand[1],2.5*s,0,6.28);X.stroke()}
else arm(10*s,sy+12*s);

// aksesori kepala per kelas
const hx=hd[0],hy=hd[1];X.lineWidth=lw2;
if(cls=='sw'){X.save();X.strokeStyle='#ff4d6d';X.shadowColor='#ff4d6d';X.beginPath();X.moveTo(hx-r,hy-1.5*s);X.lineTo(hx+r*.95,hy-3*s);X.stroke();X.restore();rib(hx-r,hy-1.5*s,5,3.2,0,'#ff4d6d',lw2);rib(hx-r,hy-1.5*s,5,3.2,2.2,'#ff4d6d',lw2)}
else if(cls=='ar'||cls=='archer'){X.save();X.globalAlpha*=.4;X.beginPath();X.arc(hx-s,hy,r*1.25,1.3,5.0);X.lineTo(hx+r*.2,hy-r*1.2);X.closePath();X.fill();X.restore();X.beginPath();X.arc(hx-s,hy,r*1.25,1.3,5.0);X.stroke();if(cls=='ar')rib(sx-s,sy-s,6,3.6,0,'#9fffb0',lw2)}
else if(cls=='mg'){X.beginPath();X.ellipse(hx,hy-r*.75,r*1.55,r*.38,0,0,6.28);X.stroke();const tipx=hx-r*1.5+Math.sin(t*3)*s,tipy=hy-r*3.1;X.save();X.globalAlpha*=.4;X.beginPath();X.moveTo(hx-r*.95,hy-r*.8);X.quadraticCurveTo(hx-r*.3,hy-r*2.6,tipx,tipy);X.lineTo(hx+r*.95,hy-r*.8);X.closePath();X.fill();X.restore();X.beginPath();X.moveTo(hx-r*.95,hy-r*.8);X.quadraticCurveTo(hx-r*.3,hy-r*2.6,tipx,tipy);X.lineTo(hx+r*.95,hy-r*.8);X.stroke();X.beginPath();X.arc(tipx,tipy,1.6*s,0,6.28);X.fill()}
else if(cls=='soldier'||cls=='shield'){X.beginPath();X.arc(hx,hy,r*1.15,Math.PI,6.28);X.stroke();if(cls=='shield'){X.beginPath();X.moveTo(hx+r*1.1,hy-s);X.lineTo(hx+r*.2,hy-s);X.stroke()}else{X.beginPath();X.moveTo(hx,hy-r*1.15);X.quadraticCurveTo(hx-3*s,hy-r*1.9,hx-8*s+wv(1),hy-r*1.6);X.stroke()}}
else if(cls=='boss'){X.beginPath();X.moveTo(hx-r*.5,hy-r*.9);X.quadraticCurveTo(hx-r*1.6,hy-r*1.4,hx-r*1.1,hy-r*2.4);X.moveTo(hx+r*.5,hy-r*.9);X.quadraticCurveTo(hx+r*1.4,hy-r*1.5,hx+r*.9,hy-r*2.5);X.stroke()}
X.restore()}
function cres(r,a0,a1,w,c,al){const n=14;X.beginPath();for(let i=0;i<=n;i++){const q=a0+(a1-a0)*i/n,th=w*Math.sin(Math.PI*i/n);X.lineTo(Math.cos(q)*(r+th*.5),Math.sin(q)*(r+th*.5))}for(let i=n;i>=0;i--){const q=a0+(a1-a0)*i/n,th=w*Math.sin(Math.PI*i/n);X.lineTo(Math.cos(q)*(r-th*.5),Math.sin(q)*(r-th*.5))}X.closePath();X.fillStyle=c;X.globalAlpha=al;X.fill()}
const ELC={fire:'#ff8a1f',ice:'#9ff',bolt:'#ffe14a'};
function slashFx(c,f){if(tm-(p.cmbAt||-9)>.8)p.cmb=0;p.cmbAt=tm;p.cmb=(p.cmb||0)+1;const k=(p.cmb-1)%3,x=p.x,y=p.y-35;let col=c.col,el=0;
if(k==2){el=['fire','ice','bolt'][(R()*3)|0];col=ELC[el];
if(el=='fire')for(let i=0;i<16;i++)F.push({x:x+f*(30+R()*60),y:y+R()*50-25,vx:R()*80-40,vy:-120-R()*160,life:.5,ml:.5,col,sz:3+R()*3,g:-120});
else if(el=='ice')for(let i=0;i<14;i++){const a=R()*6.28;F.push({x:x+f*50,y,vx:Math.cos(a)*320,vy:Math.sin(a)*320,life:.45,ml:.45,col,sz:4,g:200,st:true})}
else for(let i=0;i<3;i++)FX.push({t:'bolt',pts:[[x,y],[x+f*(20+R()*20),y-20+R()*20],[x+f*(50+R()*20),y+R()*40-20],[x+f*(90+R()*30),y-20+R()*40]],life:.25,ml:.25,col})}
FX.push({t:'slash',kind:k,el,x,y,f,life:k==2?.32:.22,ml:k==2?.32:.22,col,r:k==2?96:78})}
function step(dt){
if(S=='pause')return;
tm+=dt;
if(S=='menu'){if(pressed('Digit1'))sel=0;if(pressed('Digit2'))sel=1;if(pressed('Digit3'))sel=2;if(pressed('ArrowLeft','KeyA'))sel=(sel+2)%3;if(pressed('ArrowRight','KeyD'))sel=(sel+1)%3;if(pressed('Enter','Space'))newGame();return}
if(S=='upgrade'){upDelay-=dt;for(let i=0;i<3;i++)if(pressed('Digit'+(i+1))&&pickUpgrade(i))break;return}
if(S=='over'&&pressed('KeyR')){S='menu';return}
const c=CH[sel];
if(S=='play'){p.skillHit=0;p.inv-=dt;p.acd-=dt;p.cd-=dt;p.atkT-=dt;p.t+=dt;const mv=(down('KeyD','ArrowRight')?1:0)-(down('KeyA','ArrowLeft')?1:0);
if(p.on&&p.pl&&p.pl.m){p.x=Math.max(20,Math.min(WORLD-20,p.x+p.pl.dx));p.y=p.pl.y}
if(p.dash>0){p.dash-=dt;FX.push({t:'ghost',x:p.x,y:p.y,f:p.f,life:.25,ml:.25,col:c.col});for(const e of E)if(!e.dead&&!p.dh.has(e)&&Math.abs(e.x-p.x)<e.w+28){p.dh.add(e);dmgE(e,30,p.f*40,1);burst(e.x,e.y-30,10,'#fff')}}
else{p.vx+=((mv*260*p.sp)-p.vx)*Math.min(1,dt*14);if(mv)p.f=mv}
p.run=Math.abs(p.vx)>20?1:0;p.x=Math.max(20,Math.min(WORLD-20,p.x+p.vx*dt));const was=p.on,py=p.y;if(pressed('KeyS','ArrowDown'))p.drop=.25;p.drop-=dt;p.vy+=2200*dt;p.y+=p.vy*dt;p.on=0;
if(p.y>=G&&!inPit(p.x)){p.y=G;p.vy=0;p.on=1;p.pl=0}else if(p.vy>=0&&!(p.drop>0))for(const pl of PL)if(py<=pl.y+1&&p.y>=pl.y&&p.x>pl.x-6&&p.x<pl.x+pl.w+6){p.y=pl.y;p.vy=0;p.on=1;p.pl=pl;break}
if(p.on&&!was)burst(p.x,p.y,8,'#99a',160);
for(const s of SP)if(p.y>G-16&&Math.abs(p.x-s.x-s.w/2)<s.w/2+6&&p.inv<=0){hurt(12,-p.f);p.vy=-550}
for(const s of SW){s.x+=s.v*dt;if(s.x<s.a||s.x>s.b)s.v*=-1;s.rot+=dt*12;s.cd-=dt;if(Math.abs(p.x-s.x)<s.r+8&&p.y>G-s.r*2-6&&p.inv<=0){hurt(16,Math.sign(p.x-s.x)||1);p.vy=-450}
if(s.cd<=0)for(const e of E)if(!e.dead&&Math.abs(e.x-s.x)<e.w+s.r){s.cd=.4;dmgE(e,9,Math.sign(e.x-s.x)*30);burst(s.x,G-20,6,'#fa4')}}
HZ(dt);for(const j of JP)if(p.on&&p.y>=G&&Math.abs(p.x-j.x)<32){p.vy=-1150;p.on=0;burst(j.x,G,16,'#6f8',300);FX.push({t:'ring',x:j.x,y:G,r:0,max:70,life:.3,ml:.3,col:'#6f8'})}
p.coyote=p.on?.12:Math.max(0,(p.coyote||0)-dt);if(pressed('KeyW','Space','ArrowUp'))p.jumpBuffer=.14;else p.jumpBuffer=Math.max(0,(p.jumpBuffer||0)-dt);
if(p.jumpBuffer>0&&p.coyote>0&&p.vy>-80){const jy=p.y;p.vy=-800;p.on=0;p.pl=0;p.coyote=0;p.jumpBuffer=0;burst(p.x,jy,6,'#889',120);FX.push({t:'ring',x:p.x,y:jy,r:0,max:34,life:.2,ml:.2,col:'#ccd'})}
if(down('KeyJ')&&p.acd<=0&&p.dash<=0){assist(mv);attack()}if(pressed('KeyK')&&p.cd<=0&&p.dash<=0){assist(mv);skill()}if(pressed('KeyL')&&p.ult>=100){assist(mv);ultimate()}
if(p.met>0){p.met-=dt;p.mt-=dt;if(p.mt<=0){p.mt=.12;shoot({x:p.x+(R()-.3)*1100,y:-40,vx:-260,vy:950,dmg:45,aoe:115,col:'#f73',life:3,down:1,big:1})}}}
if(S=='play'&&queue.length&&E.filter(e=>!e.dead).length<6){spT-=dt;if(spT<=0){spT=Math.max(.75,1.3-wave*.015);spawn(queue.pop())}}
for(const e of E){if(e.dead)continue;e.t+=dt;e.fl-=dt;e.atk-=dt;e.cd-=dt;e.x+=e.kv*dt*8;e.kv*=.9;const dx=p.x-e.x,ad=Math.abs(dx);e.f=dx>0?1:-1;e.run=0;if(S!='play')continue;
if(!e.boss&&e.k!='flying'){e.jc-=dt;if(e.on&&e.jc<=0&&(inPit(e.x+e.f*55)||p.y<e.y-50&&ad<380&&PL.some(pl=>pl.y<e.y-30&&pl.y>e.y-210&&e.x>pl.x-60&&e.x<pl.x+pl.w+60))){e.vy=-950;e.jc=1.2}if(e.on&&e.pl&&e.pl.m){e.x+=e.pl.dx;e.y=e.pl.y}if(e.on&&e.y<G-20&&p.y>e.y+60&&ad<160){e.drop=.4;e.jc=Math.max(e.jc,1.5)}e.drop=(e.drop||0)-dt;const y0=e.y;e.vy+=2200*dt;e.y+=e.vy*dt;e.on=0;if(e.y>=G&&!inPit(e.x)){e.y=G;e.vy=0;e.on=1;e.pl=0}else if(e.vy>=0&&!(e.drop>0))for(const pl of PL)if(y0<=pl.y+1&&e.y>=pl.y&&e.x>pl.x-6&&e.x<pl.x+pl.w+6){e.y=pl.y;e.vy=0;e.on=1;e.pl=pl;break}
if(!e.on)e.x+=e.f*e.sp*1.2*dt;if(e.y>G+45){burst(e.x,G,25,'#f80',450);e.fl=0;e.y=G;kill(e);continue}}
e.cc-=dt;e.x=Math.max(-40,Math.min(WORLD+40,e.x));if(Math.abs(e.kv)>50)for(const o of E)if(o!==e&&!o.dead&&o.cc<=0&&Math.abs(o.x-e.x)<e.w+o.w&&Math.abs(o.y-e.y)<60){o.cc=.35;const d=Math.round(Math.abs(e.kv)*.15);knock(o,Math.sign(o.x-e.x)*Math.abs(e.kv)*5,-300);dmgE(o,d,0,1);e.kv*=.5;FX.push({t:'ring',x:(o.x+e.x)/2,y:o.y-30,r:0,max:60,life:.25,ml:.25,col:'#fff'})}
if(e.k=='flying'){e.y=170+Math.sin(tm*3+e.hover)*35;if(ad>260)e.x+=e.f*e.sp*dt;e.run=1;if(e.telegraph>0){e.telegraph-=dt;e.atk=e.telegraph;if(e.telegraph<=0)P.push({o:'e',x:e.x,y:e.y,vx:e.f*380,vy:0,dmg:e.dmg,life:2,col:'#d7f',pi:0})}else if(e.cd<=0&&ad<700){e.cd=2.4;e.telegraph=.5}}
else if(e.k=='healer'){e.x+=(ad>280?e.f:-e.f)*e.sp*.35*dt;e.run=1;e.healT-=dt;if(e.healT<=0){const target=E.filter(o=>o!==e&&!o.dead&&Math.abs(o.x-e.x)<300).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0];if(target){target.hp=Math.min(target.mhp,target.hp+target.mhp*.18);target.fl=.15;FX.push({t:'ring',x:target.x,y:target.y-35*target.s,r:0,max:38,life:.35,ml:.35,col:'#7df'});txt(target.x,target.y-80*target.s,'+HEAL','#7df',15)}e.healT=3.6}}
else if(e.k=='bomber'){if(e.telegraph>0){e.telegraph-=dt;e.atk=e.telegraph;if(e.telegraph<=0)bombEnemy(e)}else if(ad<180&&e.cd<=0){e.cd=2.8;e.telegraph=.72;e.atk=.72}}
else if(e.k=='archer'){if(ad<300){e.x-=e.f*e.sp*dt;e.run=1}else if(ad>420){e.x+=e.f*e.sp*dt;e.run=1}if(e.telegraph>0){e.telegraph-=dt;e.atk=e.telegraph;if(e.telegraph<=0)P.push({o:'e',x:e.x+e.f*15,y:e.y-38,vx:e.f*520,vy:0,dmg:e.dmg,life:2,col:'#f96',pi:0})}else if(e.cd<=0&&ad<650){e.cd=2+R();e.telegraph=.55}}
else if(e.boss){if(!e.ph2&&e.hp<e.mhp/2){e.ph2=1;e.col='#f33';e.sp*=1.25;shake=18;txt(e.x,e.y-190,'FASE 2!','#f33',34);if(wave>5)spawn('soldier')}
if(e.wind>0){e.wind-=dt;if(e.wind<=0){shake=18;hit=.05;FX.push({t:'ring',x:e.x,y:G,r:0,max:200,life:.4,ml:.4,col:'#f55'});if(e.bossStyle=='storm'){for(const d of[-1,0,1])P.push({o:'e',x:e.x,y:G-15,vx:d*300,vy:d?0:-260,dmg:e.dmg*(wave==5?.45:.7),life:2,col:'#f55',pi:0})}else for(const d of[-1,1])P.push({o:'e',wave:1,x:e.x,y:G-15,vx:d*360,vy:0,dmg:e.dmg*(wave==5?.55:.8),life:1.8,col:'#f55',pi:0});burst(e.x,G,30,'#a85',400)}}
else{if(ad>70*e.s){e.x+=e.f*e.sp*dt;e.run=1}e.sc-=dt;if(e.sc<=0){e.wind=.7;e.sc=e.ph2?2.2:3.5}if(ad<60*e.s&&e.cd<=0&&Math.abs(p.y-e.y)<70){e.cd=1;e.atk=.25;hurt(e.dmg,e.f)}}}
else{if(ad>38*e.s){e.x+=e.f*e.sp*dt;e.run=1}else if(e.cd<=0){e.cd=1.1;e.atk=.25;if(Math.abs(p.y-e.y)<60)hurt(e.dmg,e.f)}}}
E=E.filter(e=>!e.dead);
for(const q of P){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.big||q.aoe)F.push({x:q.x,y:q.y,vx:R()*60-30,vy:R()*60-30,life:.3,ml:.3,col:q.col,sz:q.big?5:3,g:0});
if(q.o=='p'){for(const b of BR)if(!b.dead&&Math.abs(q.x-b.x)<18&&q.y>b.y-38&&q.y<b.y+4){b.fuse=b.fuse||.03;if(q.aoe)boom(q);if(q.aoe||q.pi--<=0)q.life=0}
for(const e of E){if(e.dead||(q.h&&q.h.has(e)))continue;if(Math.abs(q.x-e.x)<e.w+6&&q.y>e.y-65*e.s&&q.y<e.y+5){if(q.aoe){boom(q);q.life=0;break}dmgE(e,q.dmg,Math.sign(q.vx)*20);(q.h=q.h||new Set).add(e);if(q.pi--<=0){q.life=0;break}}}
if(q.life>0&&q.y>=G&&q.vy>0){if(q.aoe)boom(q);q.life=0}}
else if(S=='play'){if(q.wave){if(Math.abs(q.x-p.x)<22&&p.y>G-35){hurt(q.dmg,Math.sign(q.vx))}}else if(Math.abs(q.x-p.x)<14&&q.y>p.y-62&&q.y<p.y+4){hurt(q.dmg,Math.sign(q.vx));q.life=0}}}
P=P.filter(q=>q.life>0&&q.x>-100&&q.x<WORLD+100);
for(const f of F){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=f.g*dt}F=F.filter(f=>f.life>0);
for(const f of FX){f.life-=dt;if(f.t=='ring')f.r=f.max*(1-f.life/f.ml)}FX=FX.filter(f=>f.life>0);
for(const t of T){t.life-=dt;t.y-=60*dt}T=T.filter(t=>t.life>0);
if(F.length>700)F.splice(0,F.length-700);if(FX.length>250)FX.splice(0,FX.length-250);if(T.length>120)T.splice(0,T.length-120);if(P.length>250)P.splice(0,P.length-250);
for(const d of D){d.life-=dt;for(const q of d.pts){const vx=(q.x-q.px)*.995,vy=q.y-q.py;q.px=q.x;q.py=q.y;q.x+=vx;q.y+=vy+2000*dt*dt;if(q.y>G&&!inPit(q.x)){q.y=G;q.py=G;q.px=q.x-vx*.7}if(q.y>G+60&&!d.burnt){d.burnt=1;burst(q.x,G,20,'#f80',350);d.life=Math.min(d.life,.2)}}
for(let k=0;k<3;k++)for(const[a,b,l]of d.cs){const A=d.pts[a],B=d.pts[b],dx=B.x-A.x,dy=B.y-A.y,dd=Math.hypot(dx,dy)||1,df=(dd-l)/dd*.5;A.x+=dx*df;A.y+=dy*df;B.x-=dx*df;B.y-=dy*df}}D=D.filter(d=>d.life>0);
comboT-=dt;if(comboT<=0)combo=0;bn-=dt;shake*=.9;zoom+=(1-zoom)*Math.min(1,dt*3);flash*=.9;
if(S=='play'&&!queue.length&&!E.length){P=[];RK=[];const reward=(p.style.noHit?100:0)+Math.min(150,p.style.bestCombo*3)+p.style.skillKills*10+p.style.airKills*8;score+=reward;if(reward)txt(p.x,p.y-110,'STYLE BONUS +'+reward,'#fd3',20);p.style={bestCombo:0,skillKills:0,airKills:0,noHit:true};S='upgrade';upDelay=.7;const fresh=shuffle(upgradePool()).filter(o=>!p.upgrades.has(o.id));opts=(fresh.length>=3?fresh:shuffle(upgradePool())).slice(0,3)}
if(p)cam+=(Math.max(0,Math.min(WORLD-W,p.x-W/2+p.f*60))-cam)*Math.min(1,dt*6)}
function bar(x,y,w,h,v,col){X.fillStyle='#1118';X.fillRect(x,y,w,h);X.fillStyle=col;X.fillRect(x,y,w*Math.max(0,Math.min(1,v)),h);X.strokeStyle='#fff4';X.lineWidth=1;X.strokeRect(x,y,w,h)}
function say(s,x,y,sz,col,al='center'){X.font='bold '+sz+'px system-ui,sans-serif';X.textAlign=al;X.fillStyle=col;X.fillText(s,x,y)}
let _sk='';const SKILL_BTN=document.querySelector('.ctrl.skill'),ULT_BTN=document.querySelector('.ctrl.ult');
function syncTouchStateUI(){const touch=controlMode=='touch';GAME.classList.toggle('playing',S=='play');
const key=[S,touch,wave,score,opts.map(o=>o.n).join('|'),p?synergyNames().join('|'):'',p?Math.ceil(Math.max(0,p.cd)):0,p&&p.ult>=100].join('~');if(key===_sk)return;_sk=key;
UPGRADE_TOUCH.classList.toggle('show',touch&&S=='upgrade');GAMEOVER_TOUCH.classList.toggle('show',touch&&S=='over');MOBILE_PAUSE.classList.toggle('show',touch&&S=='pause');
if(touch&&S=='upgrade')document.querySelectorAll('.upgradeBtn').forEach((b,i)=>{b.style.display=opts[i]?'block':'none';if(opts[i]){const hints=synergyHints(opts[i].id);b.querySelector('b').textContent=opts[i].n+(hints.length?' | Sinergi: '+hints.join(', '):'')}});
if(touch&&S=='over')GAMEOVER_SUMMARY.textContent='Wave '+wave+'  |  Skor '+score;
if(touch&&p){const cd=p.cd>0;SKILL_BTN.classList.toggle('cooling',cd);SKILL_BTN.textContent=cd?Math.ceil(p.cd):'SKILL';ULT_BTN.classList.toggle('ready',p.ult>=100);ULT_BTN.classList.toggle('cooling',p.ult<100)}}
function draw(){
X.setTransform(1,0,0,1,0,0);X.shadowBlur=0;X.globalAlpha=1;const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0a1f');g.addColorStop(1,'#1a0f2e');X.fillStyle=g;X.fillRect(0,0,W,H);
if(S=='menu'){say('STICKMEN WAR',W/2,110,64,'#4df');X.shadowColor='#4df';X.shadowBlur=20;say('STICKMEN WAR',W/2,110,64,'#4df');X.shadowBlur=0;
say('Pilih karakter: 1 / 2 / 3 atau panah, lalu Enter',W/2,150,18,'#aab');
CH.forEach((c,i)=>{const x=60+i*300,s=i==sel;X.fillStyle=s?'#ffffff18':'#ffffff08';X.fillRect(x,190,260,250);X.strokeStyle=s?c.col:'#ffffff30';X.lineWidth=s?3:1;X.strokeRect(x,190,260,250);
man(x+130,330,c.col,1,s?1:0,tm,1.75,s?1-((tm*1.3)%1):0,c.wp,undefined,1,{cls:['sw','ar','mg'][i]});say(c.n,x+130,365,22,c.col);say(c.d,x+130,390,15,'#ccd');say(c.sk,x+130,414,14,'#aab');say(c.ul,x+130,432,14,'#aab')});
say(controlMode=='touch'?'Mobile: pilih karakter dengan mengetuk kartu':'A/D gerak   W/Spasi lompat   S turun   J serang   K skill   L ultimate',W/2,490,16,'#889');say('Rintangan: '+HZN[CFG.hz]+(controlMode=='touch'?'  (atur lewat tombol ⚙)':'  [tekan H untuk ubah]'),W/2,518,15,'#fd3');return}
const sx=(R()-.5)*shake,sy=(R()-.5)*shake;X.translate(sx,sy);X.translate(W/2,H/2);X.scale(zoom,zoom);X.translate(-W/2,-H/2);
X.fillStyle='#ffffff';for(let i=0;i<50;i++){X.globalAlpha=.3+(i%4)*.15;X.fillRect((i*197-cam*.1)%W<0?(i*197-cam*.1)%W+W:(i*197-cam*.1)%W,(i*83)%300,2,2)}X.globalAlpha=1;
const mg=X.createRadialGradient(720,110,5,720,110,170);mg.addColorStop(0,'#fff8');mg.addColorStop(.15,'#a8f4');mg.addColorStop(1,'#0000');X.fillStyle=mg;X.fillRect(480,0,480,300);X.fillStyle='#e8e4ff';X.beginPath();X.arc(720,110,22,0,6.28);X.fill();
for(const[l,c,k,h]of[[1,'#1a1038',.15,110],[2,'#120a22',.3,70]]){X.fillStyle=c;X.beginPath();X.moveTo(0,G);for(let i=0;i<=W;i+=30)X.lineTo(i,G-h-60*Math.abs(Math.sin((i+cam*k)/(120+l*50))));X.lineTo(W,G);X.fill()}
X.fillStyle='#0b0716';X.fillRect(-20,G,W+40,H);X.strokeStyle='#4df';X.shadowColor='#4df';X.shadowBlur=10;X.lineWidth=2;X.beginPath();X.moveTo(-20,G);X.lineTo(W+20,G);X.stroke();X.shadowBlur=0;
for(const l of LV){const x=l.x-cam,lg=X.createLinearGradient(0,G,0,H);lg.addColorStop(0,'#ff8a1f');lg.addColorStop(1,'#8a1000');X.fillStyle=lg;X.shadowColor='#f60';X.shadowBlur=25;X.beginPath();X.moveTo(x,G-2);for(let i=0;i<=l.w;i+=10)X.lineTo(x+i,G-2+Math.sin(tm*4+i*.2+l.x)*3);X.lineTo(x+l.w,H);X.lineTo(x,H);X.fill();
const gl=X.createLinearGradient(0,G-90,0,G);gl.addColorStop(0,'#f600');gl.addColorStop(1,'#f604');X.shadowBlur=0;X.fillStyle=gl;X.fillRect(x-10,G-90,l.w+20,90)}
X.lineWidth=2;for(const pl of PL){X.fillStyle='#1b1240';X.strokeStyle=X.shadowColor=pl.m?'#fc4':'#4df';X.shadowBlur=12;X.fillRect(pl.x-cam,pl.y,pl.w,10);X.strokeRect(pl.x-cam,pl.y,pl.w,10)}
X.shadowColor=X.strokeStyle=X.fillStyle='#f33';X.shadowBlur=14;for(const s of SP){X.beginPath();for(let x=0;x<s.w;x+=12){X.moveTo(s.x-cam+x,G);X.lineTo(s.x-cam+x+6,G-20);X.lineTo(s.x-cam+x+12,G)}X.fill()}
for(const s of SW){X.save();X.translate(s.x-cam,G-s.r);X.rotate(s.rot);X.fillStyle=X.strokeStyle=X.shadowColor='#fa4';X.beginPath();for(let i=0;i<16;i++){const r=i%2?s.r*.7:s.r*1.1,a=i/16*6.28;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.fill();X.fillStyle='#120a22';X.beginPath();X.arc(0,0,5,0,6.28);X.fill();X.restore()}
X.fillStyle=X.strokeStyle=X.shadowColor='#6f8';for(const j of JP){X.beginPath();X.moveTo(j.x-cam-26,G);X.lineTo(j.x-cam-18,G-10);X.lineTo(j.x-cam+18,G-10);X.lineTo(j.x-cam+26,G);X.fill();const b=Math.sin(tm*6)*4;X.beginPath();X.moveTo(j.x-cam-8,G-18-b);X.lineTo(j.x-cam,G-28-b);X.lineTo(j.x-cam+8,G-18-b);X.stroke()}X.shadowBlur=0;
for(const r of RK){const x=r.x-cam;if(r.warn>0){X.globalAlpha=.15+.15*Math.sin(tm*30);X.fillStyle='#f33';X.fillRect(x-26,0,52,G);X.globalAlpha=1;X.fillStyle='#f55';X.font='bold 28px system-ui';X.textAlign='center';X.fillText('!',x,40)}else{X.save();X.translate(x,r.y);X.rotate(r.y*.02);X.fillStyle='#4a3f5a';X.strokeStyle='#fa6';X.shadowColor='#fa6';X.shadowBlur=14;X.lineWidth=2;X.beginPath();for(let i=0;i<7;i++){const a=i/7*6.28,rr=i%2?15:20;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}X.closePath();X.fill();X.stroke();X.restore()}}
for(const l of LS){const ph=lsPh(l),a=l.x1-cam,b=l.x2-cam;X.shadowColor=X.strokeStyle=X.fillStyle='#f4f';X.shadowBlur=14;X.lineWidth=2;for(const ex of[a,b]){X.globalAlpha=.5;X.beginPath();X.moveTo(ex,l.y);X.lineTo(ex,G);X.stroke();X.globalAlpha=1;X.beginPath();X.arc(ex,l.y,7,0,6.28);X.fill()}
if(ph==1){X.globalAlpha=.4+.4*Math.sin(tm*40);X.lineWidth=1;X.setLineDash([8,8]);X.beginPath();X.moveTo(a,l.y);X.lineTo(b,l.y);X.stroke();X.setLineDash([])}
else if(ph==2){X.lineWidth=9;X.shadowBlur=26;X.beginPath();X.moveTo(a,l.y);X.lineTo(b,l.y);X.stroke();X.strokeStyle='#fff';X.lineWidth=3;X.beginPath();X.moveTo(a,l.y);X.lineTo(b,l.y);X.stroke()}X.globalAlpha=1;X.shadowBlur=0}
for(const d of PD){const ax=d.x-cam,bx=d.bx-cam;X.strokeStyle='#889';X.lineWidth=3;X.shadowBlur=0;X.beginPath();X.moveTo(ax,d.y);X.lineTo(bx,d.by);X.stroke();X.fillStyle='#889';X.beginPath();X.arc(ax,d.y,6,0,6.28);X.fill();
X.save();X.translate(bx,d.by);X.rotate(tm*10*(d.w>0?1:-1));X.fillStyle=X.strokeStyle=X.shadowColor='#f64';X.shadowBlur=18;X.beginPath();for(let i=0;i<14;i++){const r=i%2?d.r*.7:d.r*1.15,a=i/14*6.28;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.fill();X.fillStyle='#120a22';X.beginPath();X.arc(0,0,6,0,6.28);X.fill();X.restore()}X.shadowBlur=0;
for(const b of BR){X.save();X.translate(b.x-cam,G);X.fillStyle='#6b3a1f';X.strokeStyle=b.fuse>0&&Math.floor(tm*30)%2?'#fff':'#fb4';X.shadowColor='#f93';X.shadowBlur=8;X.lineWidth=2;X.beginPath();X.rect(-14,-36,28,36);X.fill();X.stroke();X.beginPath();X.moveTo(-14,-24);X.lineTo(14,-24);X.moveTo(-14,-12);X.lineTo(14,-12);X.stroke();X.fillStyle='#fb4';X.font='bold 14px system-ui';X.textAlign='center';X.fillText('!',0,-17);X.restore()}
for(const d of D){X.globalAlpha=Math.min(1,d.life*1.5);X.strokeStyle=X.fillStyle=X.shadowColor=d.col;X.shadowBlur=10;X.lineWidth=4*Math.pow(d.s,.7);X.lineCap='round';X.beginPath();for(const[a,b]of d.cs){X.moveTo(d.pts[a].x-cam,d.pts[a].y);X.lineTo(d.pts[b].x-cam,d.pts[b].y)}X.stroke();X.beginPath();X.arc(d.pts[0].x-cam,d.pts[0].y,9*d.s,0,6.28);X.stroke()}X.globalAlpha=1;X.shadowBlur=0;
for(const e of E){const ex=e.x-cam+(e.wind>0||e.telegraph>0?(R()-.5)*6:0);man(ex,e.y,e.fl>0?'#fff':e.col,e.f,e.run,e.t,e.s,e.atk>0?e.atk/.25:0,e.k=='shield'?'shield':e.k=='archer'?'bow':'sword',undefined,1,{cls:e.boss?'boss':e.k,air:e.k=='flying'||!e.on&&!e.boss,vy:e.vy||0});
if(e.wind>0){X.strokeStyle='#f55';X.lineWidth=2;X.beginPath();X.arc(ex,G,200*(1-e.wind/.7),0,6.28);X.stroke()}
if(e.telegraph>0){const radius=e.k=='bomber'?125:55;X.strokeStyle=e.k=='bomber'?'#f83':'#fd3';X.globalAlpha=.35+.3*Math.sin(tm*24);X.lineWidth=3;X.beginPath();X.arc(ex,G-8,radius*(1-e.telegraph/(e.k=='bomber'?.72:.55)),0,6.28);X.stroke();X.globalAlpha=1}
if(!e.boss)bar(ex-18,e.y-80*e.s,36,4,e.hp/e.mhp,'#f55')}
if(S!='over'){const c=CH[sel];if(p.inv<=0||Math.floor(tm*20)%2)man(p.x-cam,p.y,c.col,p.f,p.run*(p.on?1:0),p.t,1.1,p.atkT>0?p.atkT/.25:0,c.wp,undefined,1,{cls:['sw','ar','mg'][sel],air:!p.on,vy:p.vy,trail:1,up:((p.cmb||1)-1)%3==1})}
X.globalCompositeOperation='lighter';
for(const f of F){X.globalAlpha=Math.max(0,f.life/f.ml);X.fillStyle=X.strokeStyle=f.col;if(f.st){X.lineWidth=f.sz*.6;X.beginPath();X.moveTo(f.x-cam,f.y);X.lineTo(f.x-cam-f.vx*.04,f.y-f.vy*.04);X.stroke()}else X.fillRect(f.x-cam-f.sz/2,f.y-f.sz/2,f.sz,f.sz)}X.globalAlpha=1;
for(const q of P){X.fillStyle=X.strokeStyle=q.col;X.shadowColor=q.col;X.shadowBlur=14;if(q.wave){X.fillRect(q.x-cam-10,G-34,20,34)}else if(q.aoe){X.beginPath();X.arc(q.x-cam,q.y,q.big?14:9,0,6.28);X.fill()}else{X.lineWidth=3;X.beginPath();X.moveTo(q.x-cam,q.y);X.lineTo(q.x-cam-(q.vx?Math.sign(q.vx)*22:0),q.y-(q.vy?q.vy/40:0));X.stroke()}}
for(let i=TR.length-1;i>=0;i--)if(tm-TR[i].t>.22)TR.splice(i,1);
for(let i=1;i<TR.length;i++){const a=TR[i-1],b=TR[i],k=1-(tm-b.t)/.22;if(k<=0||b.t-a.t>.06)continue;X.globalAlpha=k;X.lineCap='round';X.strokeStyle=b.col;X.shadowColor=b.col;X.shadowBlur=18;X.lineWidth=12*k;X.beginPath();X.moveTo(a.x-cam,a.y);X.lineTo(b.x-cam,b.y);X.stroke();X.strokeStyle='#fff';X.lineWidth=3*k;X.stroke()}
for(const f of FX){const a=f.life/f.ml;X.globalAlpha=Math.max(0,a);X.strokeStyle=X.fillStyle=f.col;X.shadowColor=f.col;X.shadowBlur=18;
if(f.t=='flash'){X.beginPath();X.arc(f.x-cam,f.y,14+40*(1-a),0,6.28);X.globalAlpha=a*.8;X.fill()}else if(f.t=='ring'){X.lineWidth=8*a+2;X.beginPath();X.ellipse(f.x-cam,f.y,f.r,f.r*.25,0,0,6.28);X.stroke()}
else if(f.t=='slash'){const g=Math.min(1,(1-a)*2.6),r=f.r;X.save();X.translate(f.x-cam+f.f*10,f.y);X.scale(f.f,1);X.shadowBlur=22;
const sw=(a0,a1,rr,rot)=>{X.save();X.rotate(rot);cres(rr,a0,a0+(a1-a0)*g,26*a,f.col,a);cres(rr,a0,a0+(a1-a0)*g,9*a,'#fff',a);X.restore()};
if(f.kind==2){for(const sg of[-1,1]){X.save();X.translate(r*.8,0);X.rotate(sg*.75);X.translate(-300,0);cres(300,-.34,-.34+.68*g,24*a,f.col,a);cres(300,-.34,-.34+.68*g,8*a,'#fff',a);X.restore()}}else if(f.kind==1)sw(1.2,-1.5,r,0);else sw(-1.7,1.1,r,0);X.restore()}
else if(f.t=='thrust'){const L=190*(1.1-a*.3);X.save();X.translate(f.x-cam,f.y);X.scale(f.f,1);X.beginPath();X.moveTo(0,-9*a);X.lineTo(L,0);X.lineTo(0,9*a);X.closePath();X.fill();X.fillStyle='#fff';X.beginPath();X.moveTo(0,-3*a);X.lineTo(L,0);X.lineTo(0,3*a);X.closePath();X.fill();X.restore()}
else if(f.t=='crack'){X.lineWidth=5*a+1;for(const ln of f.p){X.beginPath();ln.forEach((q,i)=>i?X.lineTo(f.x-cam+q[0],G+q[1]):X.moveTo(f.x-cam+q[0],G+q[1]));X.stroke()}}
else if(f.t=='spin'){X.save();X.translate(f.x-cam,f.y);X.rotate((1-a)*9);X.shadowBlur=20;for(const o of[0,Math.PI]){cres(80,o,o+2.4,24*a,f.col,a);cres(80,o,o+2.4,8*a,'#fff',a)}X.restore()}
else if(f.t=='bolt'){X.lineWidth=3+4*a;X.beginPath();f.pts.forEach((q,i)=>i?X.lineTo(q[0]-cam,q[1]):X.moveTo(q[0]-cam,q[1]));X.stroke()}
else if(f.t=='beam'){const h=40*a+4,x0=f.x-cam;X.fillRect(f.f>0?x0:x0-1100,f.y-h/2,1100,h)}
else if(f.t=='ghost'){X.globalCompositeOperation='source-over';man(f.x-cam,f.y,f.col,f.f,1,0,1.1,0,'sword',undefined,a*.4);X.globalCompositeOperation='lighter'}}
X.globalAlpha=1;X.shadowBlur=0;X.globalCompositeOperation='source-over';
for(const t of T){X.globalAlpha=Math.min(1,t.life*2);say(t.s,t.x-cam,t.y,t.sz,t.col)}X.globalAlpha=1;
X.setTransform(1,0,0,1,0,0);
X.globalCompositeOperation='lighter';X.fillStyle='#fa8';for(let i=0;i<30;i++){X.globalAlpha=.25+.25*Math.sin(tm*2+i);X.fillRect(((i*131-cam*(.3+i%3*.2)-tm*10)%W+W)%W,((i*71-tm*(15+i%5*8))%H+H)%H,2,2)}X.globalCompositeOperation='source-over';X.globalAlpha=1;
const vg=X.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*.95);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000b');X.fillStyle=vg;X.fillRect(0,0,W,H);
if(flash>.02){X.globalAlpha=Math.min(1,flash);X.fillStyle='#fff';X.fillRect(0,0,W,H);X.globalAlpha=1}
if(p&&p.hp<p.mhp*.3&&S=='play'){X.globalAlpha=.15+.1*Math.sin(tm*8);X.fillStyle='#f00';X.fillRect(0,0,W,H);X.globalAlpha=1}
if(p){X.save();X.translate(controlMode=='touch'?78:0,0);bar(20,20,220,16,p.hp/p.mhp,'#e44');bar(20,42,220,10,p.ult/100,p.ult>=100&&Math.floor(tm*8)%2?'#fff':'#fd3');say('HP '+Math.ceil(p.hp),24,33,12,'#fff','left');
const c=CH[sel];X.fillStyle='#ffffff14';X.fillRect(20,60,50,36);X.fillStyle=p.cd<=0?c.col:'#ffffff30';X.fillRect(20,60+36*(p.cd>0?Math.min(1,p.cd/(c.cd*p.cdm)):0),50,36*(p.cd>0?1-Math.min(1,p.cd/(c.cd*p.cdm)):1));say('K',45,84,20,'#000');
say(p.ult>=100?'L = ULTIMATE!':'L ultimate '+Math.floor(p.ult)+'%',80,84,13,p.ult>=100?'#fd3':'#889','left');
X.restore();say('WAVE '+wave,W-20,34,24,'#4df','right');say('Skor '+score,W-20,58,16,'#ccd','right');say('Musuh tersisa: '+(E.length+queue.length),W-20,78,17,'#f88','right');
const oL=E.filter(e=>e.x-cam<-10).length,oR=E.filter(e=>e.x-cam>W+10).length;if(oL)say('◀ '+oL,16,H/2,22,'#f66','left');if(oR)say(oR+' ▶',W-16,H/2,22,'#f66','right');
if(combo>1){say(combo+' COMBO',W-20,112,26+Math.min(combo,30)/2,'#fd3','right')}
say(WAVENAME,W-20,132,13,'#aab','right');const activeSynergies=synergyNames();if(activeSynergies.length)say('Sinergi: '+activeSynergies.join(' + '),W-20,150,12,'#fd3','right');
const b=E.find(e=>e.boss);if(b){bar(W/2-200,16,400,14,b.hp/b.mhp,b.ph2?'#f33':'#f94');say('BOSS',W/2,46,14,'#fff')}
if(bn>0&&S=='play'){say(wave%5==0?'WAVE '+wave+' : BOSS!':'WAVE '+wave,W/2,200,54,wave%5==0?'#f55':'#fff');say(HZNAME,W/2,240,22,'#fd3')}}
if(S=='upgrade'){X.fillStyle='#000a';X.fillRect(0,0,W,H);say('WAVE '+wave+' SELESAI!',W/2,120,40,'#4df');say('Pilih 1 upgrade (tekan 1 / 2 / 3)',W/2,160,18,'#ccd');
opts.forEach((o,i)=>{const x=80+i*290,hints=synergyHints(o.id);X.fillStyle='#ffffff14';X.fillRect(x,210,260,150);X.strokeStyle='#4df';X.lineWidth=2;X.strokeRect(x,210,260,150);say(String(i+1),x+130,260,40,'#4df');say(o.n,x+130,320,17,'#fff');if(hints.length)say('Sinergi: '+hints.join(', '),x+130,345,11,'#fd3')})}
if(S=='pause'){X.fillStyle='#000b';X.fillRect(0,0,W,H);say('PAUSE',W/2,220,58,'#4df');say(controlMode=='touch'?'Gunakan menu pause di layar':'Tekan Esc untuk lanjut',W/2,270,20,'#ccd');say('Rintangan wave berikutnya: '+HZN[CFG.hz]+(controlMode=='touch'?'':'  [H untuk ubah]'),W/2,310,16,'#fd3')}
if(S=='over'){X.fillStyle='#000a';X.fillRect(0,0,W,H);say('GAME OVER',W/2,200,60,'#f55');say('Sampai wave '+wave+'   Skor '+score,W/2,250,22,'#fff');say('Tekan R untuk kembali ke menu',W/2,300,18,'#aab')}}
let last=0;

function loop(ts){const d=Math.min(.05,(ts-last)/1000||0);last=ts;if(pressed('KeyH')&&(S=='menu'||S=='pause')){delete PR.KeyH;cycleHz()}
if(pressed('Escape')){delete PR.Escape;if(S=='play')S='pause';else if(S=='pause')S='play'}slow=slowT>0?.3:1;if(S!='pause'&&slowT>0)slowT-=d;
if(S!='pause'&&hit>0)hit-=d;else{step(d*slow);for(const k in PR)delete PR[k]}syncTouchStateUI();draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
