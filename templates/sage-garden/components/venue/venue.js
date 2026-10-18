K.split('.ven h2');
var hasMand=!!$('mand');
enter('#ven',function(){$('ven').classList.add('live');var t=tlx();head(t,$('vt'));fade(t,'#ven .vn,#ven .va',.2);
 if(hasMand){var ps=$$('#mand svg > g:first-child path');ps.forEach(function(p){var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L});
  t.fromTo('#mand',{opacity:0,scale:.94},{opacity:1,scale:1,duration:1,ease:'power2.out'},.3);
  if(ps.length)t.to(ps,{strokeDashoffset:0,duration:2.2,stagger:.06,ease:'power2.inOut'},.4)}
 fade(t,'#ven .map',1.4,0);t.fromTo('.pin',{y:-40,opacity:0},{y:0,opacity:1,duration:1,ease:'bounce.out'},2);fade(t,'#ven .mb,#ven .note',1.8,.15)});
