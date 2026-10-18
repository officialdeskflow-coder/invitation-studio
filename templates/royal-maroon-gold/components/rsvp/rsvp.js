K.split('.rsvp h2');
var RS=CONFIG.rsvp,M=RS.messages,rform=$('rform'),rseal=$('rseal'),rst=$('rst'),att=null,subm=false,t0=Date.now(),rdone=false,sealTw=[];
function fmt(s,o){return String(s).replace(/\{(\w+)\}/g,function(_,k){return o[k]!=null?o[k]:''})}
(function(){var g=$('rg');g.innerHTML='';for(var i=1;i<=RS.maxGuests;i++){var o=d.createElement('option');o.value=i;o.textContent=i+' '+(i===1?M.guestOne:M.guestMany);g.appendChild(o)}
 $('rnote').textContent=RS.endpoint?M.noteLive:M.noteDemo})();
function uid(){var c=window.crypto;if(c&&c.randomUUID)return c.randomUUID();var a=new Uint32Array(4);if(c&&c.getRandomValues){c.getRandomValues(a)}else{a=[Date.now(),Math.random()*4e9,Math.random()*4e9,Math.random()*4e9]}
 return 'r'+Array.prototype.map.call(a,function(v){return Math.floor(v).toString(36)}).join('')+'-'+Date.now().toString(36)+'-rsvp'}
function send(p){if(!RS.endpoint)return Promise.resolve({mode:'demo'});var u;
 try{u=new URL(RS.endpoint)}catch(e){return Promise.reject(new Error(M.errConfig))}
 if(u.protocol!=='https:')return Promise.reject(new Error(M.errSecure));
 var c=new AbortController(),tm=setTimeout(function(){c.abort()},12000);
 return fetch(u.href,{method:'POST',body:JSON.stringify(p),signal:c.signal,redirect:'follow'}).then(function(r){clearTimeout(tm);
  return r.json().then(function(j){if(!r.ok||!j||j.ok!==true||j.saved!==true)throw new Error((j&&j.message)||M.errSave);return{mode:'live',dup:!!j.duplicate}},function(){throw new Error(M.errUnexpected)})},
  function(e){clearTimeout(tm);throw new Error(e&&e.name==='AbortError'?M.errTimeout:M.errNetwork)})}
function say(m,k){rst.textContent=m;rst.dataset.s=k||''}
rform.addEventListener('submit',function(ev){ev.preventDefault();if(subm)return;
 if(!rform.reportValidity()){say(M.invalid,'error');return}
 subm=true;var f=new FormData(rform),p={invitationId:RS.invitationId,guestName:String(f.get('guestName')).trim(),attendance:f.get('attendance'),guestCount:Number(f.get('guestCount')),message:String(f.get('message')||'').trim(),website:String(f.get('website')||''),formAgeMs:Date.now()-t0},
 sig=[p.invitationId,p.guestName,p.attendance,p.guestCount,p.message].join('|');if(!att||att.sig!==sig)att={sig:sig,id:uid()};p.submissionId=att.id;
 var b=$('rsub');b.disabled=true;b.textContent=M.sendingBtn;say(M.sending);
 send(p).then(function(r){var w=p.attendance==='yes'?M.accepted:M.declined,o={name:p.guestName,status:w};
  say(r.mode==='demo'?fmt(M.thanksDemo,o):(r.dup?fmt(M.thanksDup,o):fmt(M.thanksSaved,o)),'ok');rform.reset();att=null;t0=Date.now()})
 .catch(function(e){say(e.message||M.errGeneric,'error')})
 .then(function(){subm=false;b.disabled=false;b.textContent=M.sendBtn})});
function showForm(){rseal.style.display='none';$('tap').style.display='none';rform.classList.add('shown');rseal.setAttribute('aria-expanded','true');t0=Date.now();
 if(ok){G.fromTo('#rform .fld,#rform .sub',{opacity:0,y:16},{opacity:1,y:0,duration:.7,stagger:.09,delay:.1,ease:'power3.out'});ST.refresh()}
 try{rform.focus({preventScroll:true})}catch(e){}}
rseal.addEventListener('click',function(){if(rdone)return;rdone=true;rseal.disabled=true;if(!ok){showForm();return}
 sealTw.forEach(function(t){t.kill()});G.set('#rseal',{scale:1});
 G.timeline({onComplete:showForm}).to('#rglow',{opacity:1,scale:1.2,duration:.4,ease:'power2.out'},0).to('#tap',{opacity:0,duration:.3},0).add(function(){burst(rseal,12,95)},.25)
  .to('#rseal .sl',{x:'-40%',rotation:-10,opacity:0,duration:.6,ease:'power3.inOut'},.25).to('#rseal .sr',{x:'40%',rotation:10,opacity:0,duration:.6,ease:'power3.inOut'},.25).to('#rglow',{opacity:0,scale:2,duration:.6},.5)});
enter('#rsvp',function(){var t=tlx();head(t,$('rt'));fade(t,'#rsvp .rp,#rsvp .tap',.3);
 t.fromTo('#rseal',{opacity:0,scale:.7},{opacity:1,scale:1,duration:1.1,ease:'back.out(1.6)',onComplete:function(){if(full)sealTw.push(G.to('#rseal',{scale:1.045,duration:1.8,ease:'sine.inOut',yoyo:true,repeat:-1}),G.to('#rglow',{opacity:.35,scale:1,duration:1.8,ease:'sine.inOut',yoyo:true,repeat:-1}))}},.5)});
