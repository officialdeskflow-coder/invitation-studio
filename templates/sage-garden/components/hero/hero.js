var hero=$('hero');
K.split('#names');
function tsway(el,deg,dur){var t=G.to(el,{rotation:deg,duration:dur,ease:'sine.inOut',yoyo:true,repeat:-1,transformOrigin:'50% 0%'});ST.create({trigger:el,start:'top bottom',end:'bottom top',onToggle:function(s){t.paused(!s.isActive)}});return t}
function heroFx(){if(reduce)return;
 $$('.hfl').forEach(function(e,i){tsway(e,i?1.6:-1.6,rnd(5,7))});
 G.to('.hero .hi',{y:-36,opacity:.25,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 30%',scrub:.7}})}
K.hero={reveal:function(t,at){var h1=WI($('names'));
 t.fromTo(h1,{yPercent:115},{yPercent:0,duration:1.2,stagger:.14,ease:'power4.out'},at)
  .to('.hi:not(h1)',{opacity:1,y:0,duration:.9,stagger:.16,ease:'power3.out'},at+.15)
  .fromTo('.hfl',{opacity:0,yPercent:-22,rotation:function(i){return i?6:-6}},{opacity:1,yPercent:0,rotation:0,duration:1.8,stagger:.2,ease:'power3.out'},at+.3)
  .fromTo('.win svg,.win img',{scale:1.18},{scale:1,duration:2.2,ease:'power2.out'},at+.2)
  .add(function(){S.started=true;heroFx()},'>')}};
