K.split('.gal h2');K.watch('.arch2,.oval');
if(ok){G.set('.arch2,.oval',{clipPath:'inset(100% 0% 0% 0%)'});G.set('.gp img',{scale:full?1.35:1})}
enter('#gal',function(){var t=tlx();head(t,$('gt'));if($$('#gal .gs').length)fade(t,'#gal .gs',.3)});
if($$('#gal .cap').length)enter($$('#gal .cap')[0],function(){G.fromTo('#gal .cap',{opacity:0,y:Y},{opacity:1,y:0,duration:.9,ease:'power3.out'})},'top 90%');
$$('.gp').forEach(function(f,i){var a=f.firstElementChild,im=$$('img',a)[0];
 enter(f,function(){G.to(a,{clipPath:'inset(0% 0% 0% 0%)',duration:1.4,ease:'power3.inOut'});if(full){G.fromTo(f,{rotation:i%2?2.5:-2.5},{rotation:0,duration:1.6,ease:'power3.out'});G.to(im,{scale:1.15,duration:2,ease:'power2.out'})}},'top 82%');
 if(ok&&full)G.fromTo(im,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:f,start:'top bottom',end:'bottom top',scrub:.8}})});
