K.split('.cd h2');
var cells={d:$('n-d'),h:$('n-h'),m:$('n-m'),s:$('n-s')},last={},T=new Date(CONFIG.event.iso).getTime();
function pad(n,l){n=String(n);while(n.length<l)n='0'+n;return n}
function setv(k,v){var el=cells[k],cur=el.firstChild;if(last[k]===v)return;last[k]=v;
 if(!S.cdOn||!window.gsap||d.hidden){cur.textContent=v;return}
 var nx=d.createElement('b');nx.className='nx';nx.textContent=v;el.appendChild(nx);
 gsap.fromTo(nx,{yPercent:100},{yPercent:0,duration:.45,ease:'power3.out'});
 gsap.to(cur,{yPercent:-100,opacity:0,duration:.45,ease:'power3.out',onComplete:function(){cur.textContent=v;gsap.set(cur,{yPercent:0,opacity:1});nx.remove()}})}
var C=289.03,rings={d:$('r-d'),h:$('r-h'),m:$('r-m'),s:$('r-s')},rl={};
function ring(k,f){var r=rings[k];if(!r)return;var o=C*(1-f);if(rl[k]!==undefined&&f>rl[k]+.4){r.style.transition='none';r.style.strokeDashoffset=o;void r.getBoundingClientRect();r.style.transition=''}else r.style.strokeDashoffset=o;rl[k]=f}
function tick(){var s=Math.max(0,Math.floor((T-Date.now())/1000)),dd=Math.floor(s/86400);
 setv('d',pad(dd,3));setv('h',pad(Math.floor(s%86400/3600),2));setv('m',pad(Math.floor(s%3600/60),2));setv('s',pad(s%60,2));ring('d',Math.min(dd,365)/365);ring('h',Math.floor(s%86400/3600)/24);ring('m',Math.floor(s%3600/60)/60);ring('s',(s%60)/60);
 if(s===0)$('today').hidden=false;
 if(last.sr!==dd){last.sr=dd;$('cdsr').textContent=CONFIG.countdown.srLabel.replace('{days}',dd)}}
(function loop(){tick();setTimeout(loop,1000-(Date.now()%1000)+5)})();
d.addEventListener('visibilitychange',tick);
enter('#cd',function(){S.cdOn=true;var t=tlx();head(t,$('cdt'));t.fromTo('#cd .rg',{opacity:0,y:Y,scale:.94},{opacity:1,y:0,scale:1,duration:.9,stagger:.12},.35)});
