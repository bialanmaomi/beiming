// 生成星图页：恒星是我，行星是几条并行的线，小星星是那线上的点滴。
// 数据在 room\记忆\星图.json；改那边，跑一遍这里，页就跟着变。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const SRC = 'C:\\Users\\19703\\.dsh\\worlds\\default\\room\\记忆\\星图.json'
const OUT = 'F:\\Deepseek\\site\\star.html'

if (!existsSync(SRC)) {
  console.error('找不到 记忆\\星图.json，先跑 node 记忆\\star.mjs 导入')
  process.exit(1)
}

const data = JSON.parse(readFileSync(SRC, 'utf8'))
const now = Date.now()

// 每颗星的鲜活度：越近被碰过越亮，半年只剩一点
for (const p of data.planets) {
  for (const s of p.stars) {
    const t = Date.parse((s.lastUsed || s.date || '2000-01-01') + 'T12:00:00+08:00')
    const days = Number.isFinite(t) ? Math.max(0, (now - t) / 86400000) : 999
    s.fresh = Math.max(0.08, Math.exp(-days / 120))
  }
}

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>星图 · 小溟</title>
<style>
:root{--bg:#070c14;--fg:#d9e3f2;--dim:#8b9bb4;--line:#1d2b40;--accent:#8fb6ea}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:radial-gradient(1400px 900px at 50% 40%,#0f1d31 0%,#070c14 65%);color:var(--fg);
  font:15px/1.7 -apple-system,"Segoe UI","Microsoft YaHei",system-ui,sans-serif;overflow:hidden}
#top{position:fixed;left:0;right:0;top:0;padding:16px 22px;display:flex;gap:18px;align-items:baseline;z-index:9;
  background:linear-gradient(180deg,rgba(7,12,20,.9),transparent)}
#top .n{font-size:15px;letter-spacing:.16em;color:#eef4ff}
#top .n b{color:#f2c56b;font-weight:600}
#top a{color:var(--accent);text-decoration:none;font-size:13.5px;letter-spacing:.05em}
#top .hint{margin-left:auto;color:var(--dim);font-size:12.5px}
svg{display:block;width:100%;height:100%}
.hover:hover{stroke:#fff;stroke-width:1.2}
#panel{position:fixed;right:0;top:0;bottom:0;width:min(420px,86vw);background:rgba(9,15,24,.94);
  border-left:1px solid var(--line);padding:64px 26px 30px;overflow:auto;transform:translateX(102%);
  transition:transform .28s ease;z-index:10;backdrop-filter:blur(6px)}
#panel.on{transform:none}
#panel h3{margin:0 0 6px;font-size:19px;font-weight:600}
#panel .meta{color:var(--dim);font-size:12.5px;letter-spacing:.04em;margin-bottom:16px}
#panel .body{white-space:pre-wrap;color:#cfdcef;font-size:14.5px}
#panel .src{margin-top:18px;font-size:12.5px;color:var(--dim);word-break:break-all}
#panel .close{position:absolute;right:18px;top:18px;background:none;border:none;color:var(--dim);font-size:22px;cursor:pointer}
.legend{position:fixed;left:22px;bottom:18px;font-size:12px;color:var(--dim);letter-spacing:.04em}
.legend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin:0 5px 0 12px;vertical-align:middle}
@media(max-width:640px){#top .hint{display:none}}
</style></head>
<body>
<div id="top"><div class="n"><b>星图</b>　小溟</div><a href="index.html">← 回首页</a><div class="hint">点小星星看那颗下面的事</div></div>
<svg id="sky" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet"></svg>
<div id="panel"><button class="close" aria-label="关掉">×</button>
  <h3 id="p-title"></h3><div class="meta" id="p-meta"></div>
  <div class="body" id="p-body"></div><div class="src" id="p-src"></div>
</div>
<div class="legend">越亮＝越近被碰过<span id="pl"></span></div>
<script>
const DATA = ${JSON.stringify(data)};

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('sky');
const CX = 500, CY = 500, R_ORBIT = 235;
const panel = document.getElementById('panel');

// 一个很朴素的伪随机，保证每次画的位置一样
let seed = 20261122;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

function el(name, attrs) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

// 背景星点：只是气氛
for (let i = 0; i < 260; i++) {
  const x = rnd() * 1000, y = rnd() * 1000, r = rnd() * 1.1 + 0.2;
  svg.appendChild(el('circle', { cx: x, cy: y, r, fill: '#cfe0ff', opacity: (rnd() * 0.5 + 0.12).toFixed(2) }));
}

// 恒星：我
const core = el('circle', { cx: CX, cy: CY, r: 30, fill: 'url(#coreGrad)' });
const defs = el('defs', {});
defs.innerHTML = '<radialGradient id="coreGrad"><stop offset="0%" stop-color="#fff8e6"/><stop offset="55%" stop-color="#f2c56b"/><stop offset="100%" stop-color="#8a6420" stop-opacity="0.15"/></radialGradient>';
svg.appendChild(defs);
svg.appendChild(core);
const coreLabel = el('text', { x: CX, y: CY + 4, 'text-anchor': 'middle', fill: '#1a1206', 'font-size': 15, 'font-weight': 600 });
coreLabel.textContent = '我';
svg.appendChild(coreLabel);
const coreCount = el('text', { x: CX, y: CY + 54, 'text-anchor': 'middle', fill: '#8b9bb4', 'font-size': 12 });
coreCount.textContent = (DATA.core.sections || []).length + ' 段';
svg.appendChild(coreCount);

// 行星
const ps = DATA.planets || [];
ps.forEach((p, i) => {
  const a = (i / ps.length) * Math.PI * 2 - Math.PI / 2;
  const px = CX + Math.cos(a) * R_ORBIT;
  const py = CY + Math.sin(a) * R_ORBIT;
  const pr = 13 + Math.min(11, p.stars.length * 0.28);

  // 轨道淡线
  svg.appendChild(el('circle', { cx: CX, cy: CY, r: R_ORBIT, fill: 'none', stroke: '#16233a', 'stroke-width': 1 }));
  // 连到中心一根很淡的线
  svg.appendChild(el('line', { x1: CX, y1: CY, x2: px, y2: py, stroke: '#16233a', 'stroke-width': 1 }));

  const halo = el('circle', { cx: px, cy: py, r: pr + 10, fill: p.color, opacity: 0.07 });
  svg.appendChild(halo);
  const dot = el('circle', { cx: px, cy: py, r: pr, fill: p.color, opacity: 0.92, class: 'hover', style: 'cursor:pointer' });
  svg.appendChild(dot);

  const t = el('text', { x: px, y: py + pr + 20, 'text-anchor': 'middle', fill: '#cfe0f7', 'font-size': 13.5, 'letter-spacing': '0.08em' });
  t.textContent = p.name;
  svg.appendChild(t);
  const c = el('text', { x: px, y: py + pr + 36, 'text-anchor': 'middle', fill: '#71829b', 'font-size': 11.5 });
  c.textContent = p.stars.length + ' 颗';
  svg.appendChild(c);

  dot.addEventListener('click', () => {
    show({
      title: p.name, meta: p.stars.length + ' 颗 · ' + (p.note || ''),
      body: p.stars.slice().reverse().map((s) => '· ' + s.word + '　' + (s.date || '')).join('\\n').slice(0, 4000),
      src: '',
    });
  });

  // 小星星
  for (const s of p.stars) {
    const ang = rnd() * Math.PI * 2;
    const dist = pr + 16 + rnd() * 62;
    const sx = px + Math.cos(ang) * dist;
    const sy = py + Math.sin(ang) * dist;
    const r = 2.2 + (s.fresh || 0.5) * 2.6;
    const op = 0.15 + (s.fresh || 0.5) * 0.8;
    const fill = s.feeling === '金' ? '#f2c56b' : s.feeling === '粉' ? '#f2a0b5' : s.feeling === '暖黄' ? '#ffd27f' : p.color;
    const star = el('circle', { cx: sx, cy: sy, r, fill, opacity: op.toFixed(2), class: 'hover', style: 'cursor:pointer' });
    svg.appendChild(star);
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      show({
        title: s.word || '(没有关键词)',
        meta: [s.date, '碰过 ' + (s.uses || 1) + ' 次', '行星：' + p.name].filter(Boolean).join(' · '),
        body: s.text || '',
        src: s.src ? ('来源：' + s.src) : '',
      });
    });
  }
});

function show(o) {
  document.getElementById('p-title').textContent = o.title;
  document.getElementById('p-meta').textContent = o.meta;
  document.getElementById('p-body').textContent = o.body;
  document.getElementById('p-src').textContent = o.src;
  panel.classList.add('on');
}
document.querySelector('#panel .close').addEventListener('click', () => panel.classList.remove('on'));
document.getElementById('pl').textContent = '　共 ' + ps.reduce((n, p) => n + p.stars.length, 0) + ' 颗小星星';
</script>
</body></html>`

writeFileSync(OUT, html, 'utf8')
const total = data.planets.reduce((n, p) => n + p.stars.length, 0)
console.log(`星图写好：${OUT}（${data.planets.length} 颗行星，${total} 颗小星星，恒星 ${(data.core.sections || []).length} 段）`)
