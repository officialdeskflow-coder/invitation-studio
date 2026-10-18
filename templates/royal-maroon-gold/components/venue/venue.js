K.split('.ven h2');K.watch('#mand');
var hasMand=!!$('mand');
if(ok&&hasMand)G.set('#mand',{clipPath:'inset(100% 0% 0% 0%)'});
enter('#ven',function(){$('ven').classList.add('live');var t=tlx();head(t,$('vt'));fade(t,'#ven .vn,#ven .va',.2);
 if(hasMand)t.fromTo('#mand',{clipPath:'inset(100% 0% 0% 0%)',scale:full?1.08:1},{clipPath:'inset(0% 0% 0% 0%)',scale:1,duration:2.2,ease:'power2.inOut'},.4);
 fade(t,'#ven .map',1.6,0);t.fromTo('.pin',{y:-46,opacity:0},{y:0,opacity:1,duration:1,ease:'bounce.out'},2.1);fade(t,'#ven .mb,#ven .note',2,.15)});
if(hasMand)drift('#mand','#ven',24);
