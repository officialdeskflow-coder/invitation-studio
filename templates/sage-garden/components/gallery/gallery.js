K.split('.gal h2');K.watch('.pol');
if(ok){G.set('.pol',{opacity:0})}
enter('#gal',function(){var t=tlx();head(t,$('gt'));if($$('#gal .gs').length)fade(t,'#gal .gs',.3)});
if($$('#gal .cap').length)enter($$('#gal .cap')[0],function(){G.fromTo('#gal .cap',{opacity:0,y:Y},{opacity:1,y:0,duration:.9,ease:'power3.out'})},'top 92%');
$$('.pol').forEach(function(f,i){var r=+f.getAttribute('data-r')||0,im=$$('img',f)[0];
 if(ok)G.set(f,{rotation:r});
 enter(f,function(){G.fromTo(f,{opacity:0,y:full?-110:20,rotation:full?r+(i%2?9:-9):r},{opacity:1,y:0,rotation:r,duration:full?1.5:.8,ease:full?'back.out(1.25)':'power2.out'});
  if(full)G.fromTo(im,{scale:1.15},{scale:1,duration:1.8,ease:'power2.out'})},'top 85%')});
