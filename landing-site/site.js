(function(){
'use strict';
var d=document,nav=d.getElementById('nav');
/* nav shadow once the page scrolls */
function onScroll(){if(nav)nav.classList.toggle('on',(window.scrollY||0)>8)}
onScroll();addEventListener('scroll',onScroll,{passive:true});
/* reveal on scroll, with a guaranteed fallback so nothing can stay hidden */
var items=[].slice.call(d.querySelectorAll('[data-reveal]'));
function show(e){e.classList.add('in')}
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  items.forEach(function(e){io.observe(e)});
}else items.forEach(show);
setTimeout(function(){items.forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight*1.05)show(e)})},1800);
setTimeout(function(){items.forEach(show)},6000);
/* booking form: builds a WhatsApp message, nothing is stored or sent to a server */
var f=d.getElementById('bform');
if(f)f.addEventListener('submit',function(ev){
  ev.preventDefault();
  var v=function(n){var el=f.elements[n];return el?String(el.value||'').trim():''};
  var lines=[f.getAttribute('data-intro')||'Hello!'];
  if(v('names'))lines.push('Names: '+v('names'));
  if(v('date')){var dt=new Date(v('date')+'T00:00:00');lines.push('Wedding date: '+(isNaN(dt)?v('date'):dt.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})))}
  if(v('style'))lines.push('Design: '+v('style'));
  if(v('notes'))lines.push('Notes: '+v('notes'));
  var url=f.getAttribute('data-wa')+'?text='+encodeURIComponent(lines.join('\n'));
  var w=window.open(url,'_blank','noopener');if(!w)location.href=url;
});
})();
