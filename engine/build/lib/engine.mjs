// Tiny mustache-style template engine (no dependencies).
//   {{path}} escaped value      {{{path}}} raw value
//   {{#if path}}..{{else}}..{{/if}}      {{#each path}}..{{/each}}  ({{@index}} {{@number}} {{this}})
//   {{> partial}}               {{tpl:rel/file}} template asset     {{img:config.path}} client asset     {{json:path}}
export class TemplateError extends Error {}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function compile(src, name = 'template') {
  const tokens = [];
  const re = /\{\{\{([\s\S]+?)\}\}\}|\{\{([\s\S]+?)\}\}/g;
  let last = 0, m;
  while ((m = re.exec(src))) {
    if (m.index > last) tokens.push({ t: 'text', v: src.slice(last, m.index) });
    tokens.push(m[1] !== undefined ? { t: 'raw', v: m[1].trim() } : { t: 'tag', v: m[2].trim() });
    last = re.lastIndex;
  }
  if (last < src.length) tokens.push({ t: 'text', v: src.slice(last) });
  let i = 0;
  const parse = (until) => {
    const out = [];
    while (i < tokens.length) {
      const tk = tokens[i];
      if (tk.t === 'text') { out.push(tk); i++; continue; }
      if (tk.t === 'raw') { out.push({ t: 'var', p: tk.v, raw: true }); i++; continue; }
      const v = tk.v;
      if (v.startsWith('#each ') || v.startsWith('#if ')) {
        const kind = v.startsWith('#each') ? 'each' : 'if';
        const p = v.slice(v.indexOf(' ') + 1).trim();
        i++;
        const body = parse(['/' + kind, 'else']);
        let alt = [];
        if (tokens[i] && tokens[i].v === 'else') { i++; alt = parse(['/' + kind]); }
        if (!tokens[i] || tokens[i].v !== '/' + kind) throw new TemplateError(`${name}: unclosed {{#${kind} ${p}}}`);
        i++;
        out.push({ t: kind, p, body, alt });
        continue;
      }
      if (until && until.includes(v)) return out;
      if (v === 'else' || v.startsWith('/')) throw new TemplateError(`${name}: unexpected {{${v}}}`);
      if (v.startsWith('> ')) { out.push({ t: 'partial', n: v.slice(2).trim() }); i++; continue; }
      out.push({ t: 'var', p: v }); i++;
    }
    if (until) throw new TemplateError(`${name}: missing {{${until[0]}}}`);
    return out;
  };
  return parse(null);
}

function lookup(path, stack) {
  if (path === 'this' || path === '.') return { found: true, value: stack[stack.length - 1] };
  const parts = path.split('.');
  for (let k = stack.length - 1; k >= 0; k--) {
    const ctx = stack[k];
    if (ctx !== null && typeof ctx === 'object' && parts[0] in ctx) {
      let v = ctx[parts[0]];
      for (const p of parts.slice(1)) { if (v == null) break; v = v[p]; }
      return { found: true, value: v };
    }
  }
  return { found: false, value: undefined };
}
const truthy = (v) => Array.isArray(v) ? v.length > 0 : !!v;

export function render(ast, stack, opts, loops = []) {
  let out = '';
  for (const n of ast) {
    if (n.t === 'text') out += n.v;
    else if (n.t === 'if') { const { value } = lookup(n.p, stack); out += render(truthy(value) ? n.body : n.alt, stack, opts, loops); }
    else if (n.t === 'each') {
      const { value } = lookup(n.p, stack);
      if (Array.isArray(value)) value.forEach((item, idx) => { out += render(n.body, [...stack, item], opts, [...loops, idx]); });
      else if (truthy(value)) throw new TemplateError(`${opts.name}: {{#each ${n.p}}} needs a list`);
    } else if (n.t === 'partial') out += render(opts.partial(n.n), stack, opts, loops);
    else if (n.t === 'var') {
      const p = n.p;
      if (p === '@index') { out += loops[loops.length - 1]; continue; }
      if (p === '@number') { out += loops[loops.length - 1] + 1; continue; }
      if (p.startsWith('tpl:')) { out += opts.assets.tpl(p.slice(4).trim()); continue; }
      if (p.startsWith('img:')) { const { value } = lookup(p.slice(4).trim(), stack); if (!value) throw new TemplateError(`${opts.name}: {{${p}}} is empty`); out += opts.assets.client(value); continue; }
      if (p.startsWith('json:')) { const { value } = lookup(p.slice(5).trim(), stack); out += JSON.stringify(value).replace(/</g, '\\u003c'); continue; }
      const { found, value } = lookup(p, stack);
      if (value === undefined) throw new TemplateError(`${opts.name}: {{${p}}} is not defined${found ? '' : ' (no such field)'}`);
      out += value === null ? '' : n.raw ? String(value) : esc(value);
    }
  }
  return out;
}
