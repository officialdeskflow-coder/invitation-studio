"""Original vector art for the sage-garden template (no external assets).
Run: python engine/tools/sage-garden-art.py   to rewrite templates/sage-garden/svg/*.
Edit the colour constants below to recolour the whole template, then rebuild."""
import math, random, json
SAGE_D,SAGE,SAGE_L,SAGE_P='#4e6b57','#7d9378','#9fb49a','#c9d6c2'
BLUSH,BLUSH_L,TERRA,TERRA_D,GOLD,CREAM,INK='#e8b9a8','#f4d9cd','#c4745a','#a85a43','#c9a96a','#f6f1e7','#2f3a33'
def leaf(x,y,a,L,W,fill):
    return f'<path transform="translate({x:.1f} {y:.1f}) rotate({a:.1f})" d="M0 0C{W:.1f} {-L*.25:.1f} {W*.7:.1f} {-L*.8:.1f} 0 {-L:.1f}C{-W*.7:.1f} {-L*.8:.1f} {-W:.1f} {-L*.25:.1f} 0 0Z" fill="{fill}"/>'
def rleaf(x,y,a,r,fill):
    return f'<ellipse transform="translate({x:.1f} {y:.1f}) rotate({a:.1f})" cx="0" cy="{-r:.1f}" rx="{r*.8:.1f}" ry="{r:.1f}" fill="{fill}"/>'
def blossom(x,y,r=6,fill=BLUSH_L,core=GOLD):
    s=''.join(f'<circle cx="{x+math.cos(k*1.2566)*r*.95:.1f}" cy="{y+math.sin(k*1.2566)*r*.95:.1f}" r="{r*.72:.1f}" fill="{fill}"/>' for k in range(5))
    return s+f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*.42:.1f}" fill="{core}"/>'
def bez(P,t):
    u=1-t; return tuple(u**3*P[0][k]+3*u*u*t*P[1][k]+3*u*t*t*P[2][k]+t**3*P[3][k] for k in(0,1))
def tang(P,t):
    u=1-t; return tuple(3*u*u*(P[1][k]-P[0][k])+6*u*t*(P[2][k]-P[1][k])+3*t*t*(P[3][k]-P[2][k]) for k in(0,1))
def vine(W,H,P,n,seed,mirror=False,round_=True,blossoms=(0.28,0.55,0.8),scale=1.0):
    random.seed(seed); M=(lambda x:W-x) if mirror else (lambda x:x)
    pts=[(M(p[0]),p[1]) for p in P]
    out=[f'<path d="M{pts[0][0]:.1f} {pts[0][1]:.1f}C{pts[1][0]:.1f} {pts[1][1]:.1f} {pts[2][0]:.1f} {pts[2][1]:.1f} {pts[3][0]:.1f} {pts[3][1]:.1f}" fill="none" stroke="{SAGE_D}" stroke-width="2.2" stroke-linecap="round"/>']
    cols=[SAGE_D,SAGE,SAGE_L,SAGE]
    for i in range(n):
        t=.06+.9*i/(n-1); x,y=bez(pts,t); tx,ty=tang(pts,t); base=math.degrees(math.atan2(ty,tx))+90
        for side in (1,-1):
            a=base+side*random.uniform(48,70); r=(11.5-7*t)*scale*random.uniform(.85,1.12); c=cols[(i+(side>0))%4]
            out.append(rleaf(x,y,a,r,c) if round_ else leaf(x,y,a,r*2.1,r*.8,c))
    for b in blossoms:
        x,y=bez(pts,b); out.append(blossom(x+random.uniform(-3,3),y,6.5*scale))
    x,y=bez(pts,1.0); out.append(blossom(x,y+4,5*scale,BLUSH))
    return f'<svg viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'+''.join(out)+'</svg>'
def garland(mirror): return vine(170,440,[(16,0),(70,90),(8,230),(74,432)],17,3 if not mirror else 5,mirror)
def sprig(mirror): return vine(150,190,[(10,186),(30,110),(86,92),(136,10)],10,8 if not mirror else 9,mirror,blossoms=(.35,.62,.85),scale=1.05)
def wreath(R=84,n=22,seed=4):
    random.seed(seed); out=[]
    for i in range(n):
        a=360*i/n; x=R*math.cos(math.radians(a)); y=R*math.sin(math.radians(a))
        out.append(leaf(100+x,100+y,a+90+random.uniform(-6,6),20,7,[SAGE,SAGE_L,SAGE_D][i%3])); out.append(leaf(100+x,100+y,a-90+random.uniform(-6,6),15,5.5,[SAGE_L,SAGE][i%2]))
    for k in range(6): a=math.radians(30+60*k); out.append(blossom(100+R*math.cos(a),100+R*math.sin(a),5.2,BLUSH if k%2 else BLUSH_L))
    return f'<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="{R}" fill="none" stroke="{SAGE_D}" stroke-width="1.2" opacity=".6"/>'+''.join(out)+'</svg>'
def petal(L): return f'M0 0C{.19*L:.1f} {-.24*L:.1f} {.2*L:.1f} {-.62*L:.1f} 0 {-L}C{-.2*L:.1f} {-.62*L:.1f} {-.19*L:.1f} {-.24*L:.1f} 0 0Z'
def lotus(idp='lt'):
    defs=f'<defs><linearGradient id="{idp}1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="{TERRA}"/><stop offset=".55" stop-color="{BLUSH}"/><stop offset="1" stop-color="#fff3ec"/></linearGradient><linearGradient id="{idp}2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d98f77"/><stop offset="1" stop-color="{BLUSH_L}"/></linearGradient></defs>'
    pads=f'<ellipse cx="100" cy="176" rx="74" ry="9" fill="{SAGE}" opacity=".55"/><ellipse cx="100" cy="172" rx="48" ry="6" fill="{SAGE_L}" opacity=".7"/>'
    back=''.join(f'<g class="lp" data-a="{a}" data-s="0.9" transform="translate(100 168) rotate({a}) scale(.9)"><path d="{petal(78-abs(a)*.35)}" fill="url(#{idp}2)" stroke="{GOLD}" stroke-width=".8" opacity=".95"/></g>' for a in (-70,-54,-38,-22,22,38,54,70))
    front=''.join(f'<g class="lp" data-a="{a}" data-s="1" transform="translate(100 168) rotate({a})"><path d="{petal(94-abs(a)*.42)}" fill="url(#{idp}1)" stroke="{GOLD}" stroke-width=".9"/><path d="M0 -6C2 -30 2 -52 0 {-(86-abs(a)*.4):.1f}" fill="none" stroke="{GOLD}" stroke-width=".6" opacity=".55"/></g>' for a in (-60,-40,-20,0,20,40,60))
    core=f'<circle cx="100" cy="150" r="6" fill="{GOLD}"/>'+''.join(f'<circle cx="{100+math.cos(math.radians(k*45))*11:.1f}" cy="{150+math.sin(math.radians(k*45))*5:.1f}" r="1.6" fill="{GOLD}"/>' for k in range(8))
    return defs+pads+back+front+core
# ------------- couple illustration (faceless flat style)
SKIN,SKIN_D,HAIR='#d9a27c','#c58c68','#2b211c'
def couple(): 
    g=[]
    # groom
    g.append(f'<ellipse cx="102" cy="327" rx="11" ry="4.5" fill="#6b4a35"/><ellipse cx="126" cy="327" rx="11" ry="4.5" fill="#6b4a35"/>')
    g.append(f'<path d="M96 232H110L108 324H95Z M114 232H128L130 324H116Z" fill="#e7dac0"/>')
    g.append(f'<path d="M80 134Q112 120 144 134L150 236Q112 248 74 236Z" fill="#f3e8d3"/><path d="M112 124V242" stroke="{GOLD}" stroke-width="1.6"/>'+''.join(f'<circle cx="112" cy="{y}" r="1.9" fill="{GOLD}"/>' for y in (150,170,190,210,228)))
    g.append(f'<path d="M76 140L68 214L80 218L88 148Z" fill="#efe2c8"/><circle cx="73" cy="220" r="6" fill="{SKIN}"/>')
    g.append(f'<path d="M144 140L158 190L168 204L160 212L146 192Z" fill="#efe2c8"/>')
    g.append(f'<path d="M126 128L148 134L142 240L122 238Z" fill="{TERRA}" opacity=".96"/><path d="M122 238L142 240" stroke="{GOLD}" stroke-width="2" stroke-dasharray="2 2"/>')
    g.append(f'<rect x="105" y="108" width="14" height="18" rx="5" fill="{SKIN_D}"/><circle cx="112" cy="98" r="16" fill="{SKIN}"/>')
    g.append(f'<path d="M97 104Q112 126 127 104Q125 116 112 119Q99 116 97 104Z" fill="{HAIR}" opacity=".9"/>')
    g.append(f'<path d="M91 96Q89 66 112 62Q136 66 133 96Q124 82 112 82Q100 82 91 96Z" fill="{TERRA_D}"/><path d="M96 80Q112 70 128 80M94 88Q112 76 130 88" stroke="#d98f77" stroke-width="1.6" fill="none"/><circle cx="112" cy="62" r="5" fill="{GOLD}"/>')
    # bride
    g.append(f'<path d="M176 112Q150 130 156 220Q160 300 150 336L252 336Q236 270 232 190Q232 120 204 108Z" fill="{BLUSH}" opacity=".82" stroke="{GOLD}" stroke-width="1.2"/>')
    g.append(f'<path d="M176 160L202 160L270 336L112 336Z" fill="url(#lg)"/><path d="M118 322H264" stroke="{GOLD}" stroke-width="5"/><path d="M122 312H260" stroke="#fff3ec" stroke-width="1.2" stroke-dasharray="3 4"/>'+''.join(f'<circle cx="{x}" cy="{y}" r="2.2" fill="{GOLD}"/>' for x,y in ((160,262),(190,250),(222,266),(176,288),(206,290),(236,300),(150,300))))
    g.append(f'<path d="M171 128Q188 120 205 128L202 164L174 164Z" fill="{TERRA}"/><path d="M178 128Q188 140 198 128" stroke="{GOLD}" stroke-width="1.6" fill="none"/>')
    g.append(f'<path d="M205 132L216 186L208 190L196 140Z" fill="{SKIN}"/><circle cx="212" cy="190" r="4" fill="{SKIN}"/><path d="M206 186L218 188" stroke="{GOLD}" stroke-width="2.4"/>')
    g.append(f'<path d="M172 134L160 186L152 205" fill="none" stroke="{SKIN}" stroke-width="7" stroke-linecap="round"/><circle cx="150" cy="207" r="5" fill="{SKIN}"/>')
    g.append(f'<rect x="181" y="110" width="12" height="16" rx="5" fill="{SKIN_D}"/><circle cx="188" cy="101" r="14" fill="#e0ac88"/><path d="M174 98Q176 82 190 82Q202 84 202 98Q196 92 188 92Q180 92 174 98Z" fill="{HAIR}"/><circle cx="188" cy="92" r="1.8" fill="{GOLD}"/><circle cx="188" cy="97" r="1.5" fill="#b5453a"/>')
    g.append(f'<path d="M176 124Q188 140 200 124" fill="none" stroke="{GOLD}" stroke-width="2.2"/><circle cx="174" cy="108" r="2" fill="{GOLD}"/><circle cx="202" cy="108" r="2" fill="{GOLD}"/>')
    return ''.join(g)
def scene(kind='day',idp='cp'):
    defs=f'<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{TERRA}"/><stop offset="1" stop-color="{TERRA_D}"/></linearGradient>'
    if kind=='day': defs+=f'<linearGradient id="{idp}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e3d3"/><stop offset=".7" stop-color="#fbf3e6"/></linearGradient></defs>'
    elif kind=='sunset': defs+=f'<linearGradient id="{idp}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a98c"/><stop offset=".55" stop-color="#f5cfae"/><stop offset="1" stop-color="#fbe9d2"/></linearGradient></defs>'
    else: defs+=f'<linearGradient id="{idp}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a34"/><stop offset="1" stop-color="#3f5f52"/></linearGradient></defs>'
    sky=f'<rect width="300" height="400" fill="url(#{idp}sky)"/>'
    if kind=='night': sky+=''.join(f'<circle cx="{random.Random(i).randint(10,290)}" cy="{random.Random(i+9).randint(8,150)}" r="{random.Random(i+3).choice([.8,1.2,1.6])}" fill="#fff6dc"/>' for i in range(40))+'<circle cx="228" cy="62" r="20" fill="#f6ecd0"/><circle cx="237" cy="57" r="18" fill="#2b4a42"/>'
    else: sky+=f'<circle cx="150" cy="150" r="{78 if kind=="day" else 90}" fill="{"#f3cdb3" if kind=="day" else "#f7b98f"}" opacity=".85"/>'
    hills=f'<path d="M0 300Q60 250 130 282T300 262V400H0Z" fill="{SAGE_P if kind!="night" else "#2f5246"}"/><path d="M0 330Q80 296 160 322T300 308V400H0Z" fill="{SAGE_L if kind!="night" else "#3a6152"}"/><path d="M0 352Q100 330 190 348T300 340V400H0Z" fill="{SAGE if kind!="night" else "#2c4d41"}"/>'
    trees=''.join(f'<path d="M{x} 300q-9 -50 0 -100q9 50 0 100z" fill="{SAGE_D if kind!="night" else "#223f35"}" opacity=".7"/>' for x in (24,44,262,282))
    lights=''.join(f'<circle cx="{20+i*30}" cy="{16+8*math.sin(i*.9)+ (i%2)*3:.1f}" r="2.4" fill="#ffe7a8"/>' for i in range(10))+f'<path d="M0 14Q150 34 300 14" fill="none" stroke="{GOLD}" stroke-width=".8" opacity=".7"/>'
    fore=vine(300,400,[(-10,402),(30,350),(60,330),(110,404)],6,21,False,False,(.5,),1.1)
    fore2=vine(300,400,[(310,402),(270,350),(240,330),(190,404)],6,22,True,False,(.5,),1.1)
    return defs+sky+trees+hills+f'<g>{couple()}</g>'+lights+fore.replace('<svg viewBox="0 0 300 400" aria-hidden="true" focusable="false">','').replace('</svg>','')+fore2.replace('<svg viewBox="0 0 300 400" aria-hidden="true" focusable="false">','').replace('</svg>','')
def gazebo():
    c='#f6f1e7'; g=GOLD; o=[]
    o.append(f'<g fill="none" stroke="{c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">')
    o.append('<path d="M40 250H260M52 256H248"/>')
    for x in (70,110,150,190,230): o.append(f'<path d="M{x} 250V150"/><path d="M{x-5} 154H{x+5}M{x-5} 250H{x+5}"/>')
    for x in (70,110,150,190): o.append(f'<path d="M{x} 150Q{x+20} 112 {x+40} 150"/>')
    o.append('<path d="M62 150H238"/><path d="M62 146H238"/>')
    o.append('<path d="M70 146Q150 70 230 146"/><path d="M150 96Q150 62 150 52M144 56Q150 44 156 56"/><circle cx="150" cy="48" r="3"/>')
    o.append('<path d="M80 140Q150 86 220 140" opacity=".5"/>')
    o.append('<path d="M96 250V234H204V250M110 234V222H190V234"/><path d="M150 222V190M138 190H162"/>')
    o.append('</g>')
    for i,x in enumerate((84,118,152,186,220)):
        y=156+ (14 if i%2 else 6); o.append(f'<path d="M{x} 150V{y-8}" stroke="{g}" stroke-width=".8"/><path d="M{x-5} {y}h10l-2 12h-6z" fill="{g}" opacity=".95"/><circle cx="{x}" cy="{y+7}" r="9" fill="#ffe7a8" opacity=".18"/>')
    o.append(f'<g fill="none" stroke="{c}" stroke-width="1.2" opacity=".6"><path d="M30 268H270"/><path d="M60 280H240M90 292H210"/></g>')
    return f'<svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">'+''.join(o)+'</svg>'
def edges():
    def scallop(n=10,r=19.5,h=24):
        return f'M0 {h}'+''.join(f'a{r} {r} 0 0 1 {2*r} 0' for _ in range(n))+f'V{h}Z'
    def arcade(): return 'M0 56'+''.join('a65 54 0 0 1 130 0' for _ in range(3))+'V56Z'
    def line(d): return d.rsplit('V',1)[0]
    def svg(cls,tone,vb,d): 
        return f'<svg class="edge {cls} to-{tone}" viewBox="0 0 390 {vb}" preserveAspectRatio="none" aria-hidden="true"><path class="ef" d="{d}"/><path class="cl" pathLength="1" d="{line(d)}"/></svg>'
    s=scallop(); a=arcade()
    return {"scallop":{"dark":svg('sc','dark',24,s),"light":svg('sc','light',24,s)},"arcade":{"dark":svg('ar','dark',56,a),"light":svg('ar','light',56,a)}}


if __name__ == '__main__':
    # Regenerates the vector partials of templates/sage-garden/svg (palette = the constants at the top of this file).
    import sys
    from pathlib import Path
    out = Path(__file__).resolve().parent.parent.parent / 'templates' / 'sage-garden' / 'svg'
    def petal_svg(l, dur, dl, dx, r): return f'<svg class="lf" style="left:{l}%;--d:{dur}s;--dl:-{dl}s;--dx:{dx}px;--r:{r}deg" viewBox="-1 -8 22 16" aria-hidden="true"><path d="M0 0C4-7 14-7 20 0C14 7 4 7 0 0Z"/></svg>'
    files = {
        'lotus.html': lotus('lt'), 'garland-left.html': garland(False), 'garland-right.html': garland(True),
        'sprig-left.html': sprig(False), 'sprig-right.html': sprig(True), 'wreath.html': wreath(), 'gazebo.html': gazebo(),
        'couple.html': '<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + scene('day', 'cp') + '</svg>',
        'petals.html': ''.join([petal_svg(8, 13, 2, 40, 200), petal_svg(30, 10, 6, -30, -160), petal_svg(52, 14, 9, 50, 240), petal_svg(74, 11, 4, -40, 180), petal_svg(90, 12, 8, -20, -220)]),
        'gate-scallop.html': ''.join('a19.5 19.5 0 0 0 39 0' for _ in range(10)),
        'edges.json': json.dumps(edges(), indent=1)}
    for name, text in files.items(): (out / name).write_text(text, encoding='utf-8')
    print('wrote', len(files), 'files to', out)
