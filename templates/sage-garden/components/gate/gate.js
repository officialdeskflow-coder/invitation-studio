var gate=$('gate'),btn=$('openBtn'),opened=false,idle=[];
var pet=$$('.lp').map(function(g){return{g:g,a:+g.getAttribute('data-a'),s:+g.getAttribute('data-s'),p:0}});
function setP(o){o.g.setAttribute('transform','translate(100 168) rotate('+(o.a*(1+.75*o.p)).toFixed(2)+') scale('+(o.s*(1+.14*o.p)).toFixed(3)+')');o.g.style.opacity=1-.5*o.p}
function music(){if(K.music)K.music()}
function idleGate(){if(!ok||reduce)return;idle.push(G.to('#openBtn',{scale:1.04,duration:1.9,ease:'sine.inOut',yoyo:true,repeat:-1}),G.to('#glow',{opacity:.35,scale:.95,duration:2.2,ease:'sine.inOut',yoyo:true,repeat:-1}),G.to('#hint',{opacity:.55,duration:1.4,ease:'sine.inOut',yoyo:true,repeat:-1}))}
function warm(){$$('img').forEach(function(i,n){if(i.decode)setTimeout(function(){i.decode().catch(function(){})},400+n*250)})}
function finish(){gate.style.display='none';gate.setAttribute('aria-hidden','true');html.classList.remove('locked');var h=$('hero');if(h)h.classList.add('on');setTimeout(warm,300);try{$('names').focus({preventScroll:true})}catch(e){}if(ok)ST.refresh()}
K.finish=finish;
function open(){if(opened)return;opened=true;btn.disabled=true;music();if(!ok){K.plain();return}
 idle.forEach(function(t){t.kill()});
 var t=G.timeline({defaults:{ease:'power3.out'}});
 t.to('#hint',{opacity:0,duration:.3}).to(btn,{scale:1,duration:.3,ease:'power2.out'},0)
  .to('#glow',{opacity:1,scale:1.15,duration:.7,ease:'power2.out'},0).add(function(){burst(btn,14,130)},.45);
 pet.forEach(function(o,i){t.to(o,{p:1,duration:1.1,ease:'power3.out',onUpdate:function(){setP(o)}},.12+i*.035)});
 t.to('.g-rings',{scale:1.35,opacity:0,duration:1.4,ease:'power2.out'},.3)
  .to('.g-top,.g-names',{opacity:0,y:-14,duration:.6},.9)
  .to(btn,{scale:1.55,opacity:0,duration:.9,ease:'power2.in'},1.2)
  .to(gate,{y:-(innerHeight+40),duration:1.5,ease:'power3.inOut',onComplete:finish},1.8);
 if(K.hero)K.hero.reveal(t,2.5);else t.add(function(){S.started=true})}
btn.addEventListener('click',open);idleGate();
