var hero=$('hero');
K.split('#names');
if(ok)G.set('.brr',{rotation:0,scaleX:-1,scaleY:1});
function heroFx(){if(reduce)return;
 $$('.hfl').forEach(function(e,i){sway(e,i?1.3:-1.3,rnd(5,7))});$$('.br').forEach(function(e,i){sway(e,i?1.2:-1.2,rnd(6,8))});
 G.to('.hero .hi',{y:-36,opacity:.25,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 30%',scrub:.7}})}
K.hero={reveal:function(t,at){var h1=WI($('names'));
 t.fromTo(h1,{yPercent:115},{yPercent:0,duration:1.2,stagger:.14,ease:'power4.out'},at)
  .to('.draw',{opacity:1,strokeDashoffset:0,duration:1.8,stagger:.03,ease:'power2.inOut'},at)
  .to('.hi:not(h1)',{opacity:1,y:0,duration:.9,stagger:.16,ease:'power3.out'},at+.15)
  .fromTo('.hfl',{opacity:0,yPercent:28,scale:.9,rotation:-5},{opacity:1,yPercent:0,scale:1,rotation:0,duration:1.8,stagger:.22,ease:'power3.out'},at+.4)
  .add(function(){S.started=true;heroFx()},'>')}};
