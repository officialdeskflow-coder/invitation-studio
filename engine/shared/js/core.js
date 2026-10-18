/* ===== invi core: shared motion kit (template independent) =====
   Components receive these helpers through K.  House rules:
   animate transform/opacity only, never leave content hidden without a failsafe,
   honour calm mode (reduced motion) and never let one component break the others. */
var K={CONFIG:CONFIG,S:{started:false,cdOn:false},mods:[],errors:[],watchSel:['.rv','.flr','.sp-h']};
var d=document,html=d.documentElement;
K.d=d;K.html=html;
K.$=function(i){return d.getElementById(i)};
K.$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var sys=matchMedia('(prefers-reduced-motion: reduce)').matches,forced=false;
try{forced=localStorage.getItem('motionFull')==='1'||/[?&]motion=full/.test(location.search)}catch(e){}
K.sys=sys;K.forced=forced;K.full=!sys||forced;K.reduce=!K.full;
K.G=window.gsap;K.ST=window.ScrollTrigger;K.ok=!!(K.G&&K.ST);K.Y=K.full?26:8;
var G=K.G,ST=K.ST,ok=K.ok,full=K.full,$$=K.$$;
if(!full)html.classList.add('calm');
if(ok){G.registerPlugin(ST);ST.config({ignoreMobileResize:true})}else html.classList.add('nomo');
K.rnd=function(a,b){return a+Math.random()*(b-a)};
K.add=function(name,fn){K.mods.push([name,fn])};
K.watch=function(sel){K.watchSel.push(sel)};
K.burst=function(host,n,spread){if(!ok)return;for(var i=0;i<n;i++){var s=d.createElement('i');s.className='sk';host.appendChild(s);var a=Math.PI*2*i/n+K.rnd(-.3,.3),r=K.rnd(.55,1)*spread;
 G.fromTo(s,{x:0,y:0,scale:0,opacity:1,rotation:0},{x:Math.cos(a)*r,y:Math.sin(a)*r,scale:K.rnd(.7,1.5),opacity:0,rotation:K.rnd(-120,120),duration:K.rnd(.9,1.4),ease:'power2.out',onComplete:(function(el){return function(){el.remove()}})(s)})}};
/* word-by-word split: masked rise, accessible through aria-label */
K.words=function(el){if(el.dataset.sp)return;el.dataset.sp=1;el.setAttribute('aria-label',el.textContent.trim().replace(/\s+/g,' '));
 (function walk(n){[].slice.call(n.childNodes).forEach(function(c){if(c.nodeType===3){var f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;
  if(/^\s+$/.test(t)){f.appendChild(d.createTextNode(' '));return}var w=d.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');var i=d.createElement('span');i.className='wi';i.textContent=t;w.appendChild(i);f.appendChild(w)});c.parentNode.replaceChild(f,c)}
  else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})})(el)};
K.WI=function(h){return K.$$('.wi',h)};
K.split=function(sel){if(!ok)return;K.$$(sel).forEach(function(h){K.words(h);h.classList.add('sp-h');G.set(h,{opacity:1,y:0});G.set(K.WI(h),{yPercent:115})})};
K.enter=function(el,fn,start){if(ok&&el)ST.create({trigger:el,start:start||'top 78%',end:'max',once:true,onEnter:fn})};
K.tlx=function(){return G.timeline({defaults:{ease:'power3.out'}})};
K.head=function(t,h,at){t.to(K.WI(h),{yPercent:0,duration:1,stagger:.1,ease:'power4.out'},at||0)};
K.fade=function(t,sel,at,st){t.fromTo(sel,{opacity:0,y:K.Y},{opacity:1,y:0,duration:.9,stagger:st==null?.14:st},at)};
K.sway=function(el,deg,dur){var t=G.to(el,{rotation:deg,duration:dur,ease:'sine.inOut',yoyo:true,repeat:-1,transformOrigin:'50% 100%'});
 ST.create({trigger:el,start:'top bottom',end:'bottom top',onToggle:function(s){t.paused(!s.isActive)}});return t};
K.bloom=function(t,sel,at){t.fromTo(sel,{opacity:0,yPercent:26,scale:.88,rotation:-4},{opacity:1,yPercent:0,scale:1,rotation:0,duration:1.6,stagger:.2,onComplete:function(){if(full)K.$$(sel).forEach(function(e,i){K.sway(e,i%2?1.2:-1.2,K.rnd(5,7))})}},at)};
K.drift=function(sel,trig,y){if(!full||!ok)return;K.$$(sel).forEach(function(e,i){G.to(e,{y:(i%2?1:-1)*y,ease:'none',scrollTrigger:{trigger:trig,start:'top bottom',end:'bottom top',scrub:.8}})})};
K.showAll=function(sel){K.$$(sel).forEach(function(e){e.style.opacity=1})};
K.plain=function(){K.$$('.hi').forEach(function(e){e.style.opacity=1;e.style.transform='none'});K.$$('.draw').forEach(function(e){e.style.opacity=1;e.style.strokeDashoffset=0});K.$$('.flr').forEach(function(e){e.style.opacity=1});K.S.started=true;
 if(K.finish)K.finish();else{var g=K.$('gate');if(g)g.style.display='none';html.classList.remove('locked')}};
