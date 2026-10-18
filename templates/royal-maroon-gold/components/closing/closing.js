K.split('.clo h2,.cn2');
var hasPh=$$('#ph img').length>0;
if(ok&&full&&hasPh)G.set('#ph img',{scale:1.3});
enter('#clo',function(){$('clo').classList.add('live');var t=tlx();head(t,$('clt'));head(t,$$('.cn2',$('clo'))[0],.2);
 t.fromTo('#clo .arch',{opacity:0,yPercent:10},{opacity:1,yPercent:0,duration:1.4},.35);
 if(full&&hasPh)t.fromTo('#ph img',{scale:1.3},{scale:1.12,duration:2.2,ease:'power2.out'},.35);bloom(t,'#clo .flr',.9);fade(t,'#clo .div2,#clo .love,#clo .top',1.4,.14)},'top 70%');
if(ok&&full&&hasPh)G.fromTo('#ph img',{yPercent:-5},{yPercent:5,ease:'none',scrollTrigger:{trigger:'#clo',start:'top bottom',end:'bottom top',scrub:.8}});
if($('top'))$('top').addEventListener('click',function(){scrollTo({top:0,behavior:full?'smooth':'auto'})});
