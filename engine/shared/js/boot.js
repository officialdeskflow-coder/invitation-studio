/* ===== boot: run every component (isolated), then page-level behaviour ===== */
if(ok&&K.$$('.flr').length)G.set('.flr',{opacity:0});
K.mods.forEach(function(m){try{m[1]()}catch(e){K.errors.push(m[0]);if(window.console)console.error('[invi] component failed: '+m[0],e)}});
if(ok){
 if(CONFIG.features.progressBar&&K.$('prog'))G.to('#prog',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
 K.$$('.cl').forEach(function(p){ST.create({trigger:p,start:'top 92%',end:'max',once:true,onEnter:function(){G.fromTo(p,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.8,ease:'power2.inOut'})}})});
 addEventListener('load',function(){ST.refresh()});if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){ST.refresh()});
 /* failsafe: anything still hidden while on screen is revealed */
 var seen=new WeakMap();
 setInterval(function(){if(!K.S.started)return;K.$$(K.watchSel.join(',')).forEach(function(e){var r=e.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight*.92){seen.delete(e);return}var hid,w;
  if(e.classList.contains('sp-h')){w=e.querySelector('.wi');hid=w&&new DOMMatrix(getComputedStyle(w).transform).m42>2}else{var c=getComputedStyle(e);hid=+c.opacity<.05||(c.clipPath!=='none'&&c.clipPath.indexOf('100%')>-1)}
  if(!hid){seen.delete(e);return}var n=(seen.get(e)||0)+1;seen.set(e,n);if(n>=2){seen.delete(e);if(w)G.to(K.WI(e),{yPercent:0,duration:.5});else G.to(e,{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.6})}})},1500)}
/* optional notice for devices that ask for reduced motion (prototype / review builds) */
var mbn=K.$('mbn');if(mbn&&sys&&!forced){mbn.hidden=false;mbn.addEventListener('click',function(){try{localStorage.setItem('motionFull','1')}catch(e){}location.reload()});setTimeout(function(){mbn.hidden=true},16000)}
/* safety net: if the gate or hero failed, open the page instead of leaving guests stuck */
if(!ok||K.errors.indexOf('gate')>-1||K.errors.indexOf('hero')>-1)K.plain();
