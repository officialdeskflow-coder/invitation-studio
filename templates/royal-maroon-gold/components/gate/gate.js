var gate=$('gate'),btn=$('openBtn'),opened=false,idle=[];
if(ok)G.set('#icard',{opacity:0,y:80,scale:.95});
function music(){if(K.music)K.music()}
function idleGate(){if(!ok||reduce)return;idle.push(G.to('#openBtn',{scale:1.05,duration:1.8,ease:'sine.inOut',yoyo:true,repeat:-1}),G.to('#glow',{opacity:.38,scale:.95,duration:2.2,ease:'sine.inOut',yoyo:true,repeat:-1}),G.to('#hint',{opacity:.6,duration:1.4,ease:'sine.inOut',yoyo:true,repeat:-1}))}
function warm(){var u={};$$('.flr').forEach(function(e){var m=/url\(["']?([^"')]+)/.exec(getComputedStyle(e).backgroundImage);if(m&&!u[m[1]]){u[m[1]]=1;var i=new Image();i.src=m[1];i.decode&&i.decode().catch(function(){})}});
 $$('img').forEach(function(i,n){if(i.decode)setTimeout(function(){i.decode().catch(function(){})},400+n*250)})}
function finish(){gate.style.display='none';gate.setAttribute('aria-hidden','true');html.classList.remove('locked');var h=$('hero');if(h)h.classList.add('on');setTimeout(warm,300);try{$('names').focus({preventScroll:true})}catch(e){}if(ok)ST.refresh()}
K.finish=finish;
function open(){if(opened)return;opened=true;btn.disabled=true;music();if(!ok){K.plain();return}
 idle.forEach(function(t){t.kill()});
 var t=G.timeline({defaults:{ease:'power3.out'}});
 t.to('#hint',{opacity:0,duration:.3}).to(btn,{scale:1,duration:.3,ease:'power2.out'},0)
  .to('#glow',{opacity:1,scale:1.15,duration:.6,ease:'power2.out'},0).add(function(){burst(btn,12,110)},.5)
  .to('#openBtn .sl',{x:'-34%',rotation:-8,opacity:0,duration:.6,ease:'power3.inOut'},.55).to('#openBtn .sr',{x:'34%',rotation:8,opacity:0,duration:.6,ease:'power3.inOut'},.55)
  .to('#glow',{opacity:0,scale:2,duration:.7,ease:'power1.out'},.8).fromTo('#beam',{opacity:0,scale:.5},{opacity:1,scale:1.25,duration:.9},.8)
  .to('#fl',{x:'-104%',rotation:-6,duration:.9,ease:'power3.inOut'},.8).to('#fr',{x:'104%',rotation:6,duration:.9,ease:'power3.inOut'},.8)
  .to('#pocket',{y:'102%',duration:.9,ease:'power3.inOut'},1.2).to('#beam',{opacity:0,duration:.9},1.8)
  .to('#icard',{opacity:1,y:0,scale:1,duration:1,ease:'power3.out'},2.15)
  .to('#icard',{opacity:0,scale:1.07,y:-18,duration:.8,ease:'power2.in'},3.55).to(gate,{opacity:0,duration:.8,ease:'power1.inOut',onComplete:finish},3.6);
 if(K.hero)K.hero.reveal(t,3.8);else t.add(function(){S.started=true})}
btn.addEventListener('click',open);idleGate();
