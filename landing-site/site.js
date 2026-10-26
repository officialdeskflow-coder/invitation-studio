(function(){
'use strict';
var d=document,nav=d.getElementById('nav');

/* two-tone headlines: the first sentence (or half) in full colour, the rest in grey */
[].slice.call(d.querySelectorAll('[data-duo]')).forEach(function(h){
  var t=h.textContent.replace(/\s+/g,' ').trim(),m=/^(.+?[.?!])\s+(.+)$/.exec(t),a,b;
  if(m){a=m[1];b=m[2]}else{var w=t.split(' ');if(w.length<3)return;var k=Math.ceil(w.length*.5);a=w.slice(0,k).join(' ');b=w.slice(k).join(' ')}
  h.textContent='';h.appendChild(d.createTextNode(a+' '));var sp=d.createElement('span');sp.className='dim';sp.textContent=b;h.appendChild(sp);
});
/* the wordmark: one quiet letter, like a watermark */
[].slice.call(d.querySelectorAll('.wordmark')).forEach(function(w){var s=w.textContent,i=s.toUpperCase().indexOf('A',2);if(i<0)return;w.textContent='';w.appendChild(d.createTextNode(s.slice(0,i)));var q=d.createElement('span');q.className='quiet';q.textContent=s[i];w.appendChild(q);w.appendChild(d.createTextNode(s.slice(i+1)))});
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

/* phone menu: closes on link tap, Escape, outside tap, or when the screen grows */
var mnav=d.getElementById('mnav');
if(mnav){
  mnav.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.mpanel a'))mnav.removeAttribute('open')});
  d.addEventListener('click',function(e){if(mnav.open&&!mnav.contains(e.target))mnav.removeAttribute('open')});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mnav.open){mnav.removeAttribute('open');var s=mnav.querySelector('summary');if(s)s.focus()}});
  if(window.matchMedia){var mq=matchMedia('(min-width:900px)');var close=function(m){if(m.matches)mnav.removeAttribute('open')};if(mq.addEventListener)mq.addEventListener('change',close)}
}
/* floating chat button hides while a booking button or the form is already on screen */
var fab=d.querySelector('.fab');
if(fab&&'IntersectionObserver' in window){
  var seen=[];var io2=new IntersectionObserver(function(es){es.forEach(function(e){var i=seen.indexOf(e.target);if(e.isIntersecting&&i<0)seen.push(e.target);if(!e.isIntersecting&&i>-1)seen.splice(i,1)});fab.classList.toggle('off',seen.length>0)},{threshold:.5});
  [].slice.call(d.querySelectorAll('.btn[href*="wa.me"], #bform, .foot')).forEach(function(el){io2.observe(el)});
}
/* packages: start on the most chosen card when they are shown as a swipe row */
var rail=d.querySelector('.plans'),feat=d.querySelector('.plan.featured');
function centerFeatured(){if(rail&&feat&&rail.scrollWidth>rail.clientWidth+4&&!rail.__moved){rail.scrollLeft=feat.offsetLeft-(rail.clientWidth-feat.offsetWidth)/2}}
if(rail){rail.addEventListener('scroll',function(){rail.__moved=true},{passive:true});centerFeatured();addEventListener('load',centerFeatured);addEventListener('resize',centerFeatured)}
})();
