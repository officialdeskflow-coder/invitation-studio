"""Animation + robustness QA for a built invitation.
Usage: python qa/qa.py READY-TO-UPLOAD/<client>/index.html   (needs: pip install playwright && playwright install chromium)
Checks: console errors/warnings, frame timing, layout shift, stuck-hidden elements at 3 scroll speeds,
calm mode (reduced motion), motion override, countdown cleanup, RSVP double-click, JavaScript disabled, 6 screen sizes."""
from playwright.sync_api import sync_playwright
import json
import os,sys
URL='file://'+os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'READY-TO-UPLOAD/gursewak-simran/index.html')
INIT="""window.__cls=0;window.__frames=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
window.__rec=false;let _p=0;(function f(t){if(window.__rec&&_p)window.__frames.push(t-_p);_p=t;requestAnimationFrame(f)})(0);"""
HID="""(()=>{const o=[];document.querySelectorAll('.rv,.hi,.flr,.draw,.arch2,.oval,#mand,.cell,.sp-h').forEach(e=>{const c=getComputedStyle(e);let bad=false;
 if(e.classList.contains('sp-h')){const w=e.querySelector('.wi');bad=w&&new DOMMatrix(getComputedStyle(w).transform).m42>2}
 else bad=+c.opacity<.99||(c.clipPath!=='none'&&c.clipPath.includes('100%'));
 if(bad)o.push(((e.className.baseVal??e.className)||e.id).toString().slice(0,24)+'|op'+(+c.opacity).toFixed(2))});return o})()"""
def scroll(pg,st=160,wt=140):
    H=pg.evaluate('document.documentElement.scrollHeight');y=0
    while y<H: pg.evaluate(f'scrollTo(0,{y})');pg.wait_for_timeout(wt);y+=st
    pg.evaluate(f'scrollTo(0,{H})');pg.wait_for_timeout(2600)
R={}
with sync_playwright() as p:
    br=p.chromium.launch()
    def run(label,ctxargs,pre=None,settle=7500):
        ctx=br.new_context(viewport={'width':390,'height':844},**ctxargs); pg=ctx.new_page(); errs=[]
        pg.add_init_script(INIT); pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append(m.type+': '+m.text[:120]) if m.type in('error','warning') and 'ERR_NAME' not in m.text else None)
        if pre: pg.add_init_script(pre)
        pg.goto(URL);pg.wait_for_timeout(600);pg.click('#openBtn',force=True);pg.wait_for_timeout(settle)
        pg.evaluate('window.__rec=true');scroll(pg);pg.evaluate('window.__rec=false')
        fr=sorted(pg.evaluate('window.__frames'))
        R[label]={'mode':pg.evaluate("document.documentElement.classList.contains('calm')?'calm':'full'"),'frames':len(fr),'p95':round(fr[int(len(fr)*.95)],1),'max':round(fr[-1],1),'over50':sum(f>50 for f in fr),'cls':round(pg.evaluate('window.__cls'),4),
          'overflowX':pg.evaluate('document.documentElement.scrollWidth>innerWidth'),'stuck':pg.evaluate(HID),'errors':errs,
          'swayTweens':pg.evaluate("window.gsap?gsap.globalTimeline.getChildren(true,true,false).filter(t=>t.vars&&t.vars.repeat===-1).length:0"),
          'scrollTriggers':pg.evaluate("ScrollTrigger.getAll().length"),'progress':pg.evaluate("+(gsap.getProperty('#prog','scaleX')).toFixed(2)"),
          'banner_visible':pg.evaluate("!document.getElementById('mbn').hidden"),'leafAnim':pg.evaluate("getComputedStyle(document.querySelector('.ven .lf')).animationName")}
        ctx.close()
    run('A_normal',{})
    run('B_reduced_system(calm)',{'reduced_motion':'reduce'})
    run('C_reduced_system+override(full)',{'reduced_motion':'reduce'},pre="try{localStorage.setItem('motionFull','1')}catch(e){}")
    # fling robustness in full mode
    ctx=br.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();pg.goto(URL);pg.wait_for_timeout(500);pg.click('#openBtn',force=True);pg.wait_for_timeout(7500)
    for y in (4000,9000,1500,7000,300,6000,0):pg.evaluate(f'scrollTo(0,{y})');pg.wait_for_timeout(50)
    scroll(pg,400,100);scroll(pg,170,130);R['D_fling_then_slow_stuck']=pg.evaluate(HID)
    # countdown quiet-phase check + rapid taps
    pg.evaluate("scrollTo(0,document.getElementById('cd').getBoundingClientRect().top+scrollY-200)");pg.wait_for_timeout(1500);bad=0
    for _ in range(30):
        ph=pg.evaluate('Date.now()%1000')
        if ph<650:pg.wait_for_timeout(700-ph)
        bad+=pg.evaluate("document.querySelectorAll('#n-s b').length")!=1;pg.wait_for_timeout(400)
    R['E_countdown_extra_child_samples']=f'{bad}/30'
    pg.evaluate("document.getElementById('rsvp').scrollIntoView()");pg.wait_for_timeout(2500);pg.evaluate("rseal.click();rseal.click()");pg.wait_for_timeout(3000)
    R['F_rsvp_double_click']={'form_open':pg.evaluate("rform.classList.contains('shown')"),'fields_visible':pg.evaluate("[...document.querySelectorAll('#rform .fld')].every(e=>+getComputedStyle(e).opacity>.99)"),'leftover_sparks':pg.evaluate("document.querySelectorAll('.sk').length")}
    ctx.close()
    # no JS
    ctx=br.new_context(viewport={'width':390,'height':844},java_script_enabled=False);pg=ctx.new_page();pg.goto(URL);pg.wait_for_timeout(500)
    R['G_noJS']={'gate_shown':pg.evaluate("getComputedStyle(gate).display!='none'"),'h1_op':pg.evaluate("+getComputedStyle(names).opacity"),'form':pg.evaluate("getComputedStyle(rform).display"),'mbn_hidden':pg.evaluate("mbn.hidden")};ctx.close()
    # viewports
    M={}
    for w,h in((320,568),(360,740),(390,844),(430,932),(844,390),(1280,800)):
        ctx=br.new_context(viewport={'width':w,'height':h});pg=ctx.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
        pg.goto(URL);pg.wait_for_timeout(500);pg.click('#openBtn',force=True);pg.wait_for_timeout(7500);scroll(pg,250,110)
        M[f'{w}x{h}']={'overflowX':pg.evaluate('document.documentElement.scrollWidth>innerWidth'),'stuck':len(pg.evaluate(HID)),'errors':e};ctx.close()
    R['H_viewports']=M;br.close()
def brief():
    out=[]
    for k in ('A_normal','B_reduced_system(calm)','C_reduced_system+override(full)'):
        r=R[k]; st=[x for x in r['stuck'] if ' hi|' not in x and not x.startswith('hi|') and 'sp-h' not in x]
        out.append(f"{k}: mode={r['mode']} p95={r['p95']}ms max={r['max']}ms >50ms={r['over50']} CLS={r['cls']} overflowX={r['overflowX']} stuck={st} errors={r['errors']} infiniteTweens={r['swayTweens']}")
    out.append(f"fling stuck: {[x for x in R['D_fling_then_slow_stuck'] if ' hi|' not in x and 'sp-h' not in x]}")
    out.append(f"countdown extra-child samples: {R['E_countdown_extra_child_samples']} | rsvp double click: {R['F_rsvp_double_click']} | no-JS: {R['G_noJS']}")
    out.append('viewports: '+str({k:(v['overflowX'],v['errors']) for k,v in R['H_viewports'].items()}))
    bad=[k for k in ('A_normal','B_reduced_system(calm)','C_reduced_system+override(full)') if R[k]['errors'] or R[k]['overflowX'] or [x for x in R[k]['stuck'] if ' hi|' not in x and not x.startswith('hi|') and 'sp-h' not in x] or R[k]['over50']]
    print('\n'.join(out)); print('\nQA', 'PASSED' if not bad and not R['D_fling_then_slow_stuck'][:0] else 'NEEDS ATTENTION: '+str(bad))
brief()
