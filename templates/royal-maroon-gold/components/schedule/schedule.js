K.split('.sch h2');
if(ok&&full)$$('.ev').forEach(function(e){G.set($$('time',e),{x:-22});G.set($$('div',e),{x:22})});
enter('#sch',function(){var t=tlx();head(t,$('sct'))});
if(ok)$$('.ev').forEach(function(e){ST.create({trigger:e,start:'top 88%',end:'max',once:true,onEnter:function(){if(full)G.to($$('time,div',e),{x:0,duration:.9,ease:'power3.out'})}})});
/* marker: scroll-driven with eased follow */
var tlEl=$('tl'),mk=$('mk'),fill=$('fill'),evs=$$('.ev'),ys=[],cur=null,busy=false;
function measure(){ys=evs.map(function(e){return e.offsetTop+e.offsetHeight/2})}
function upd(){busy=false;var H=tlEl.offsetHeight,r=tlEl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/H)),tg=ys.length?ys[0]+(ys[ys.length-1]-ys[0])*p:0;
 cur=(cur===null||!full)?tg:cur+(tg-cur)*.18;var y=cur;
 mk.style.transform='translate3d(0,'+y.toFixed(1)+'px,0) rotate('+(full?(p*200).toFixed(0):0)+'deg)';fill.style.transform='scaleY('+(y/H).toFixed(4)+')';
 evs.forEach(function(e,i){e.classList.toggle('on',ys[i]<=y+2)});if(full&&Math.abs(tg-cur)>.4){busy=true;requestAnimationFrame(upd)}}
function req(){if(!busy){busy=true;requestAnimationFrame(upd)}}
measure();upd();addEventListener('scroll',req,{passive:true});addEventListener('resize',function(){measure();req()});addEventListener('load',function(){measure();req()});
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){measure();req()});
