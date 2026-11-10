(() => {
'use strict';

// ---------- data ----------
const D = window.DP700;
const SKILLS = {
  ws:     { d: 1, name: 'Workspace settings' },
  lcm:    { d: 1, name: 'Lifecycle management' },
  sec:    { d: 1, name: 'Security and governance' },
  orch:   { d: 1, name: 'Orchestration' },
  load:   { d: 2, name: 'Loading patterns' },
  batch:  { d: 2, name: 'Batch ingest and transform' },
  stream: { d: 2, name: 'Streaming ingest and transform' },
  mon:    { d: 3, name: 'Monitoring' },
  err:    { d: 3, name: 'Identify and resolve errors' },
  opt:    { d: 3, name: 'Optimize performance' },
};
const DOMAINS = {
  1: 'Implement and manage an analytics solution',
  2: 'Ingest and transform data',
  3: 'Monitor and optimize an analytics solution',
};
const Q = D.questions.map(q => ({ ...q, d: SKILLS[q.s].d }));
const QI = Object.fromEntries(Q.map(q => [q.id, q]));
const CASES = Object.fromEntries(D.cases.map(c => [c.id, c]));
const EXAM_MINUTES = 100;
const PER_DOMAIN = 13;

// ---------- storage ----------
const KEY = 'dp700-progress-v1';
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.q) return s; } catch (e) {}
  return { q: {}, exams: [], active: null };
}
let S = loadState();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

function record(id, frac) {
  const r = S.q[id] || (S.q[id] = { n: 0, c: 0, box: 0, last: 0, ok: null });
  const ok = frac >= 0.999;
  r.n++; if (ok) { r.c++; r.box = Math.min(4, r.box + 1); } else r.box = 0;
  r.last = Date.now(); r.ok = ok;
}

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const range = n => [...Array(n).keys()];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = x => Math.round(x * 100) + '%';
function fmtInline(s) {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}
function fmt(s) {
  return String(s).split(/\n\n+/).map(p => {
    const lines = p.split('\n');
    if (lines.every(l => l.startsWith('- '))) return '<ul>' + lines.map(l => '<li>' + fmtInline(l.slice(2)) + '</li>').join('') + '</ul>';
    return '<p>' + lines.map(fmtInline).join('<br>') + '</p>';
  }).join('');
}

function blankResponse(q) {
  if (q.type === 'multi' || q.type === 'order') return [];
  if (q.type === 'dropdown') return q.blanks.map(() => null);
  if (q.type === 'statements') return q.statements.map(() => null);
  return null;
}
function makeItem(q) {
  let perm = null;
  if ((q.type === 'single' || q.type === 'multi') && !q.series && !q.fixed) perm = shuffle(range(q.options.length));
  if (q.type === 'order') perm = shuffle(range(q.options.length));
  return { id: q.id, perm, r: blankResponse(q), done: false, frac: null, flag: false };
}
function answered(item) {
  const q = QI[item.id], r = item.r;
  if (q.type === 'single') return r !== null;
  if (q.type === 'multi') return r.length === q.answer.length;
  if (q.type === 'order') return r.length > 0;
  return r.every(v => v !== null);
}
function grade(q, r) {
  switch (q.type) {
    case 'single': return r === q.answer ? 1 : 0;
    case 'multi': {
      const A = new Set(q.answer); let good = 0, bad = 0;
      r.forEach(i => A.has(i) ? good++ : bad++);
      return Math.max(0, (good - bad) / A.size);
    }
    case 'order': return r.length === q.answer.length && r.every((v, i) => v === q.answer[i]) ? 1 : 0;
    case 'dropdown': return q.blanks.reduce((s, b, i) => s + (r[i] === b.answer ? 1 : 0), 0) / q.blanks.length;
    case 'statements': return q.statements.reduce((s, st, i) => s + (r[i] === st.answer ? 1 : 0), 0) / q.statements.length;
  }
  return 0;
}
const fracClass = f => f >= 0.999 ? 'ok' : f > 0 ? 'part' : 'bad';

// ---------- selection ----------
function skillAccuracy() {
  const acc = {};
  for (const k in SKILLS) acc[k] = { n: 0, c: 0 };
  for (const q of Q) { const r = S.q[q.id]; if (r) { acc[q.s].n += r.n; acc[q.s].c += r.c; } }
  return acc;
}
function weight(q, acc) {
  const r = S.q[q.id];
  let w;
  if (!r) w = 3;
  else if (r.box === 0) w = 5;
  else w = (5 - r.box) * 0.6;
  const a = acc[q.s];
  if (a.n >= 5) w *= 1 + (1 - a.c / a.n);
  if (r && Date.now() - r.last < 15 * 60 * 1000) w *= 0.1;
  return w;
}
function weightedSample(pool, n, wfn) {
  const items = pool.map(q => ({ q, w: Math.max(0.01, wfn(q)) }));
  const out = [];
  while (out.length < n && items.length) {
    const total = items.reduce((s, x) => s + x.w, 0);
    let t = Math.random() * total, i = 0;
    for (; i < items.length - 1; i++) { t -= items[i].w; if (t <= 0) break; }
    out.push(items.splice(i, 1)[0].q);
  }
  return out;
}

// ---------- view state ----------
let V = { screen: 'home' };
let caseTab = 0;
let timerHandle = null;

function go(screen, extra = {}) {
  V = { screen, ...extra };
  caseTab = 0;
  render();
  window.scrollTo(0, 0);
}

// ---------- rendering: question ----------
function caseHtml(c) {
  const tabs = c.sections.map((s, i) => `<button class="${i === caseTab ? 'on' : ''}" data-act="casetab" data-i="${i}">${esc(s.h)}</button>`).join('');
  return `<aside class="casepane card"><div class="small muted" style="margin-bottom:6px">Case study</div><h3 style="margin-top:0">${esc(c.title)}</h3><div class="tabs">${tabs}</div><div class="body">${fmt(c.sections[caseTab].body)}</div></aside>`;
}

function qBody(item, review) {
  const q = QI[item.id], r = item.r;
  let h = `<div class="stem">${fmt(q.stem)}</div>`;
  if (q.code && q.type !== 'dropdown') h += `<pre class="code">${esc(q.code)}</pre>`;

  if (q.type === 'single' || q.type === 'multi') {
    const order = item.perm || range(q.options.length);
    const ans = q.type === 'single' ? [q.answer] : q.answer;
    if (q.type === 'multi') h += `<p class="hint">Each correct answer presents part of the solution. Select ${ans.length}.</p>`;
    h += '<div class="opts">' + order.map((oi, k) => {
      const sel = q.type === 'single' ? r === oi : r.includes(oi);
      let cls = 'opt' + (q.type === 'multi' ? ' multi' : '') + (sel ? ' sel' : '');
      if (review) { cls = 'opt' + (q.type === 'multi' ? ' multi' : ''); if (ans.includes(oi)) cls += ' ok'; else if (sel) cls += ' bad'; }
      return `<button class="${cls}" data-act="pick" data-o="${oi}" ${review ? 'disabled' : ''}><span class="key">${String.fromCharCode(65 + k)}</span><span>${fmtInline(q.options[oi])}</span></button>`;
    }).join('') + '</div>';
  }

  if (q.type === 'order') {
    h += `<p class="hint">Move the actions you need to the answer area and put them in the correct order. Not every action is used.</p>`;
    const pool = item.perm.filter(i => !r.includes(i));
    const slots = r.map((oi, k) => {
      const cls = review ? (q.answer[k] === oi ? 'slot ok' : 'slot bad') : 'slot';
      const ctrls = review ? '' : `<button data-act="up" data-k="${k}" title="Move up">↑</button><button data-act="down" data-k="${k}" title="Move down">↓</button><button data-act="rm" data-k="${k}" title="Remove">✕</button>`;
      return `<div class="${cls}"><span class="n">${k + 1}</span><span class="txt">${fmtInline(q.options[oi])}</span>${ctrls}</div>`;
    }).join('') || '<div class="muted small" style="padding:8px">Click actions on the left to add them here.</div>';
    h += `<div class="order"><div><h4>Actions</h4><div class="opts">${pool.map(oi => `<button class="opt" data-act="add" data-o="${oi}" ${review ? 'disabled' : ''}><span>${fmtInline(q.options[oi])}</span></button>`).join('')}</div></div><div><h4>Answer area</h4><div class="area">${slots}</div></div></div>`;
    if (review) h += `<h4 style="margin:14px 0 6px">Correct sequence</h4><ol>${q.answer.map(oi => `<li>${fmtInline(q.options[oi])}</li>`).join('')}</ol>`;
  }

  if (q.type === 'dropdown') {
    const parts = q.code.split(/\[\[(\d+)\]\]/);
    let c = '';
    parts.forEach((p, idx) => {
      if (idx % 2 === 0) { c += esc(p); return; }
      const b = +p, bl = q.blanks[b], v = r[b];
      if (review) {
        const ok = v === bl.answer;
        c += `<span class="blank ${ok ? 'ok' : 'bad'}">${esc(v == null ? '(blank)' : bl.options[v])}</span>${ok ? '' : `<span class="blank ok"> ${esc(bl.options[bl.answer])}</span>`}`;
      } else {
        c += `<select data-act="blank" data-b="${b}"><option value="">Select…</option>${bl.options.map((o, oi) => `<option value="${oi}" ${v === oi ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      }
    });
    h += `<p class="hint">Select the correct option for each box.</p><pre class="code">${c}</pre>`;
  }

  if (q.type === 'statements') {
    h += `<p class="hint">For each statement, select Yes if it is true. Otherwise, select No.</p><table class="stmts"><thead><tr><th>Statement</th><th class="yn">Yes</th><th class="yn">No</th></tr></thead><tbody>`;
    q.statements.forEach((st, k) => {
      const v = r[k];
      const cell = val => {
        let cls = v === val ? 'sel' : '';
        if (review) { cls = v === val ? (st.answer === val ? 'ok' : 'bad') : (st.answer === val ? 'miss' : ''); }
        return `<td class="yn"><button class="${cls}" data-act="stmt" data-k="${k}" data-v="${val ? 1 : 0}" ${review ? 'disabled' : ''} aria-label="${val ? 'Yes' : 'No'}">${val ? 'Yes' : 'No'}</button></td>`;
      };
      h += `<tr><td>${fmtInline(st.text)}</td>${cell(true)}${cell(false)}</tr>`;
    });
    h += '</tbody></table>';
  }

  if (review) {
    const f = item.frac ?? grade(q, r);
    const cls = fracClass(f);
    const label = cls === 'ok' ? 'Correct' : cls === 'part' ? `Partly correct (${pct(f)})` : 'Incorrect';
    const refs = (q.refs || []).map(x => `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}</a>`).join('');
    h += `<div class="explain ${cls}"><div class="verdict">${label}</div>${fmt(q.explain)}${refs ? `<div class="refs">Docs: ${refs}</div>` : ''}</div>`;
  }
  return h;
}

function questionLayout(item, review, barHtml, actionsHtml) {
  const q = QI[item.id];
  const c = q.case ? CASES[q.case] : null;
  const tags = `<div class="row" style="margin-bottom:10px"><span class="tag">${esc(SKILLS[q.s].name)}</span>${c ? '<span class="tag case">Case study</span>' : ''}${q.series ? '<span class="tag case">Yes/No series</span>' : ''}</div>`;
  const main = `<section class="card">${tags}${qBody(item, review)}<div class="actions">${actionsHtml}</div></section>`;
  return `${barHtml}<div class="qwrap ${c ? 'withcase' : ''}">${c ? caseHtml(c) : ''}${main}</div>`;
}

// ---------- screens ----------
function renderHome() {
  const seen = Object.keys(S.q).filter(id => QI[id]).length;
  const attempts = Object.values(S.q).reduce((s, r) => s + r.n, 0);
  const correct = Object.values(S.q).reduce((s, r) => s + r.c, 0);
  const missed = Q.filter(q => S.q[q.id] && S.q[q.id].box === 0).length;
  const est = readiness();
  const last = S.exams[S.exams.length - 1];
  let h = `<div class="narrow" style="max-width:none">
  <h1>DP-700 Trainer</h1>
  <p class="sub">Original exam-style questions for <b>Implementing Data Engineering Solutions Using Microsoft Fabric</b>, mapped to the official skills outline (updated 30 Oct 2026). Every answer links to the Microsoft Learn page it is based on.</p>`;
  if (S.active) h += `<div class="notice">You have an unfinished ${S.active.kind === 'exam' ? 'mock exam' : 'practice session'}. <button class="btn small primary" data-act="resume">Resume</button> <button class="btn small" data-act="discard">Discard</button></div>`;
  h += `<div class="grid3" style="margin:18px 0">
    <div class="card stat"><div class="num">${seen} / ${Q.length}</div><div class="lbl">Questions seen</div></div>
    <div class="card stat"><div class="num">${attempts ? pct(correct / attempts) : '–'}</div><div class="lbl">Accuracy across ${attempts} answers</div></div>
    <div class="card stat"><div class="num">${est ? est : '–'}</div><div class="lbl">${est ? 'Estimated score (pass is 700)' : 'Estimated score appears after 30 answers'}</div></div>
  </div>
  <div class="grid3">
    <div class="card"><h3 style="margin-top:0">Smart practice</h3><p class="muted small">20 questions weighted toward what you haven't seen, what you missed and your weakest skills. Explanations after each answer.</p><button class="btn primary" data-act="quick" data-mode="smart">Start 20 questions</button></div>
    <div class="card"><h3 style="margin-top:0">Mock exam</h3><p class="muted small">50 questions, ${EXAM_MINUTES} minutes, same structure as the real exam. ${last ? `Last score: <b>${last.score}</b>.` : ''}</p><button class="btn primary" data-act="go" data-to="examIntro">Set up exam</button></div>
    <div class="card"><h3 style="margin-top:0">Review mistakes</h3><p class="muted small">${missed} question${missed === 1 ? '' : 's'} you got wrong last time. They come back until you get them right.</p><button class="btn" data-act="quick" data-mode="missed" ${missed ? '' : 'disabled'}>Review ${Math.min(missed, 20) || ''}</button></div>
  </div>
  <h2>By domain</h2><div class="card">${domainTable(false)}</div>
  </div>`;
  return h;
}

function readiness() {
  let total = 0, n = 0;
  const per = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
  for (const q of Q) { const r = S.q[q.id]; if (r) { per[q.d][0] += r.c; per[q.d][1] += r.n; n += r.n; } }
  if (n < 30) return null;
  for (const d of [1, 2, 3]) total += per[d][1] ? per[d][0] / per[d][1] : 0;
  return Math.round(total / 3 * 1000);
}

function domainTable(withButtons) {
  const acc = skillAccuracy();
  let h = `<table class="t"><thead><tr><th>Skill</th><th class="num">In bank</th><th class="num">Seen</th><th class="num">Mastered</th><th style="width:28%">Accuracy</th>${withButtons ? '<th></th>' : ''}</tr></thead><tbody>`;
  for (const d of [1, 2, 3]) {
    const ks = Object.keys(SKILLS).filter(k => SKILLS[k].d === d);
    const dn = ks.reduce((s, k) => s + acc[k].n, 0), dc = ks.reduce((s, k) => s + acc[k].c, 0);
    h += `<tr class="dom"><td colspan="4">${d}. ${esc(DOMAINS[d])} <span class="muted small">(30–35%)</span></td><td>${dn ? pct(dc / dn) : ''}</td>${withButtons ? '<td></td>' : ''}</tr>`;
    for (const k of ks) {
      const qs = Q.filter(q => q.s === k);
      const seen = qs.filter(q => S.q[q.id]).length;
      const mastered = qs.filter(q => S.q[q.id] && S.q[q.id].box >= 2).length;
      const a = acc[k], p = a.n ? a.c / a.n : 0;
      const cls = !a.n ? '' : p >= 0.75 ? 'ok' : p >= 0.55 ? 'warn' : 'bad';
      h += `<tr><td>${esc(SKILLS[k].name)}</td><td class="num">${qs.length}</td><td class="num">${seen}</td><td class="num">${mastered}</td><td><div class="row" style="flex-wrap:nowrap"><div class="bar ${cls}" style="flex:1"><span style="width:${a.n ? p * 100 : 0}%"></span></div><span class="small muted" style="width:40px;text-align:right">${a.n ? pct(p) : '–'}</span></div></td>${withButtons ? `<td><button class="btn small" data-act="quick" data-mode="skill" data-skill="${k}">Practise</button></td>` : ''}</tr>`;
    }
  }
  return h + '</tbody></table>';
}

function renderSetup() {
  const sel = V.sel || (V.sel = new Set(Object.keys(SKILLS)));
  V.count = V.count || 20; V.filter = V.filter || 'smart';
  let h = `<div class="narrow"><h1>Practice</h1><p class="sub">Pick the skills to drill. You get the explanation straight after each answer.</p><div class="card checks">`;
  for (const d of [1, 2, 3]) {
    h += `<h3 style="margin-top:${d === 1 ? 0 : 16}px">${d}. ${esc(DOMAINS[d])}</h3>`;
    for (const k of Object.keys(SKILLS).filter(k => SKILLS[k].d === d)) {
      const n = Q.filter(q => q.s === k).length;
      h += `<label><input type="checkbox" data-act="skillchk" data-k="${k}" ${sel.has(k) ? 'checked' : ''}> ${esc(SKILLS[k].name)} <span class="muted small">(${n})</span></label>`;
    }
  }
  h += `<div class="row" style="margin-top:10px"><button class="btn small" data-act="selall">All</button><button class="btn small" data-act="selnone">None</button></div></div>
  <h3>How many</h3><div class="seg">${[10, 20, 40].map(n => `<button class="${V.count === n ? 'on' : ''}" data-act="count" data-n="${n}">${n}</button>`).join('')}</div>
  <h3>Which questions</h3><div class="seg">${[['smart', 'Smart mix'], ['unseen', 'Unseen first'], ['missed', 'Missed only'], ['random', 'Random']].map(([k, l]) => `<button class="${V.filter === k ? 'on' : ''}" data-act="filter" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="actions"><button class="btn primary" data-act="startpractice" ${sel.size ? '' : 'disabled'}>Start</button><span class="muted small" id="poolinfo"></span></div></div>`;
  return h;
}

function startPractice(skills, count, filter) {
  let pool = Q.filter(q => skills.has(q.s));
  if (filter === 'missed') pool = pool.filter(q => S.q[q.id] && S.q[q.id].box === 0);
  let picked;
  if (filter === 'random') picked = shuffle(pool).slice(0, count);
  else if (filter === 'unseen') {
    const un = shuffle(pool.filter(q => !S.q[q.id]));
    picked = un.slice(0, count);
    if (picked.length < count) picked = picked.concat(weightedSample(pool.filter(q => S.q[q.id]), count - picked.length, q => weight(q, skillAccuracy())));
  } else {
    const acc = skillAccuracy();
    picked = weightedSample(pool, count, q => weight(q, acc));
  }
  if (!picked.length) { alert('No questions match that selection.'); return; }
  // keep case-study questions together so the case text stays on screen
  picked.sort((a, b) => (a.case || '').localeCompare(b.case || ''));
  picked = groupCases(picked);
  S.active = { kind: 'practice', items: picked.map(makeItem), i: 0 };
  save();
  go('practice');
}
function groupCases(list) {
  const out = [], seen = new Set();
  const shuffled = shuffle(list);
  for (const q of shuffled) {
    if (seen.has(q.id)) continue;
    if (q.case) { for (const x of shuffled.filter(x => x.case === q.case)) { out.push(x); seen.add(x.id); } }
    else { out.push(q); seen.add(q.id); }
  }
  return out;
}

function renderPractice() {
  const P = S.active;
  if (!P || P.kind !== 'practice') return renderHome();
  if (P.i >= P.items.length) return renderPracticeSummary();
  const item = P.items[P.i];
  const doneN = P.items.filter(x => x.done).length;
  const score = P.items.filter(x => x.done).reduce((s, x) => s + x.frac, 0);
  const bar = `<div class="qbar"><b>Practice</b><span>Question ${P.i + 1} of ${P.items.length}</span><span class="muted">${doneN ? `Score so far ${pct(score / doneN)}` : ''}</span><span class="spacer"></span><button class="btn small" data-act="endpractice">End session</button></div>`;
  const actions = item.done
    ? `<button class="btn primary" data-act="next" id="primary">${P.i + 1 < P.items.length ? 'Next question' : 'See summary'}</button><span class="muted small">Enter</span>`
    : `<button class="btn primary" data-act="check" id="primary" ${answered(item) ? '' : 'disabled'}>Check answer</button><button class="btn" data-act="skip">Skip</button>`;
  return questionLayout(item, item.done, bar, actions);
}

function renderPracticeSummary() {
  const P = S.active;
  const done = P.items.filter(x => x.done);
  const score = done.reduce((s, x) => s + x.frac, 0);
  let h = `<div class="narrow"><h1>Session done</h1><p class="sub">${done.length} answered, score ${done.length ? pct(score / done.length) : '–'}.</p>`;
  h += reviewList(done);
  h += `<div class="actions"><button class="btn primary" data-act="quick" data-mode="smart">Another 20</button><button class="btn" data-act="finishpractice">Back to home</button></div></div>`;
  return h;
}

function reviewList(items) {
  return items.map((it, k) => {
    const q = QI[it.id];
    const cls = fracClass(it.frac);
    const title = q.stem.replace(/[`*]/g, '').split('\n')[0].slice(0, 120);
    return `<details class="rev"><summary><span class="dot ${cls}"></span><span class="small muted">${k + 1}.</span><span>${esc(title)}${title.length >= 120 ? '…' : ''}</span></summary><div class="inner">${q.case ? `<p class="small muted">Case study: ${esc(CASES[q.case].title)}</p>` : ''}${qBody(it, true)}</div></details>`;
  }).join('');
}

// ---------- exam ----------
function renderExamIntro() {
  const caseCount = D.cases.length;
  return `<div class="narrow"><h1>Mock exam</h1><p class="sub">Built to feel like the real DP-700.</p>
  <div class="card"><ul>
    <li><b>50 questions, ${EXAM_MINUTES} minutes.</b> The timer keeps running if you reload the page.</li>
    <li><b>Starts with a case study</b> (one of ${caseCount}). You can move freely inside it, but once you finish the section you can't go back.</li>
    <li><b>Then ${PER_DOMAIN * 3} questions</b>, ${PER_DOMAIN} from each domain. You can flag questions and review them before ending the section.</li>
    <li><b>Ends with a Yes/No series</b>: the same goal with different solutions. Each answer is final once you move on.</li>
    <li>Scored out of 1000; 700 passes. Multi-part questions give partial credit, as on the real exam. Treat the score as an estimate.</li>
    <li>The real exam is open book: you can use Microsoft Learn in a split window. Practise looking things up, not memorising them.</li>
  </ul></div>
  <div class="actions"><button class="btn primary" data-act="startexam">Start exam</button></div></div>`;
}

function pickLeastSeen(groups) {
  const scored = groups.map(g => ({ g, n: g.reduce((s, q) => s + (S.q[q.id] ? S.q[q.id].n : 0), 0) + Math.random() }));
  scored.sort((a, b) => a.n - b.n);
  return scored[0].g;
}
function startExam() {
  const caseGroups = D.cases.map(c => Q.filter(q => q.case === c.id));
  const caseQs = pickLeastSeen(caseGroups.filter(g => g.length));
  const seriesIds = [...new Set(Q.filter(q => q.series).map(q => q.series))];
  const seriesQs = pickLeastSeen(seriesIds.map(sid => Q.filter(q => q.series === sid)));
  let main = [];
  for (const d of [1, 2, 3]) {
    const pool = Q.filter(q => q.d === d && !q.case && !q.series);
    main = main.concat(weightedSample(pool, PER_DOMAIN, q => S.q[q.id] ? 1 : 3));
  }
  main = shuffle(main);
  S.active = {
    kind: 'exam',
    sections: [
      { name: 'Case study: ' + CASES[caseQs[0].case].title, items: caseQs.map(makeItem), locked: false, kind: 'case' },
      { name: 'Questions', items: main.map(makeItem), locked: false, kind: 'main' },
      { name: 'Yes/No series', items: seriesQs.map(makeItem), locked: false, kind: 'series' },
    ],
    si: 0, i: 0, reviewing: false,
    deadline: Date.now() + EXAM_MINUTES * 60 * 1000,
  };
  save();
  go('exam');
}

function timeLeft() { return Math.max(0, S.active.deadline - Date.now()); }
function timerText() {
  const ms = timeLeft(), m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function startTimer() {
  stopTimer();
  timerHandle = setInterval(() => {
    if (!S.active || S.active.kind !== 'exam') return stopTimer();
    const el = $('#timer');
    if (el) { el.textContent = timerText(); el.classList.toggle('low', timeLeft() < 10 * 60000); }
    if (timeLeft() <= 0) { stopTimer(); alert('Time is up. Your exam will be scored now.'); finishExam(); }
  }, 1000);
}
function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }

function renderExam() {
  const E = S.active;
  if (!E || E.kind !== 'exam') return renderHome();
  const sec = E.sections[E.si];
  const total = E.sections.reduce((s, x) => s + x.items.length, 0);
  const before = E.sections.slice(0, E.si).reduce((s, x) => s + x.items.length, 0);
  const bar = `<div class="qbar"><b>${esc(sec.name)}</b><span>Section ${E.si + 1} of ${E.sections.length}</span><span class="muted">Question ${before + E.i + 1} of ${total}</span><span class="spacer"></span><span>Time left <span id="timer" class="timer">${timerText()}</span></span></div>`;

  if (E.reviewing) {
    const grid = sec.items.map((it, k) => `<button class="${answered(it) ? 'ans' : ''} ${it.flag ? 'flag' : ''}" data-act="jump" data-k="${k}">${before + k + 1}</button>`).join('');
    const unans = sec.items.filter(it => !answered(it)).length, flagged = sec.items.filter(it => it.flag).length;
    return `${bar}<div class="narrow card"><h2 style="margin-top:0">Review this section</h2><p class="muted">${unans} unanswered, ${flagged} flagged. Click a number to go back to it. Once you finish the section you can't return to it.</p><div class="nav-grid">${grid}</div><div class="actions"><button class="btn" data-act="jump" data-k="0">Back to questions</button><button class="btn primary" data-act="finishsection">Finish section</button></div></div>`;
  }

  const item = sec.items[E.i];
  const isSeries = sec.kind === 'series';
  const last = E.i === sec.items.length - 1;
  let actions;
  if (isSeries) {
    actions = `<button class="btn primary" data-act="seriesnext" id="primary">${last ? 'Submit and finish exam' : 'Submit and continue'}</button><span class="muted small">You can't come back to this question.</span>`;
  } else {
    actions = `<button class="btn" data-act="prev" ${E.i === 0 ? 'disabled' : ''}>Previous</button><button class="btn" data-act="flag">${item.flag ? 'Unflag' : 'Flag for review'}</button><span class="spacer"></span>${last ? '<button class="btn primary" data-act="reviewsection" id="primary">Review section</button>' : '<button class="btn primary" data-act="enext" id="primary">Next</button>'}`;
  }
  let nav = '';
  if (!isSeries) nav = `<div class="nav-grid" style="margin-top:18px">${sec.items.map((it, k) => `<button class="${answered(it) ? 'ans' : ''} ${it.flag ? 'flag' : ''} ${k === E.i ? 'cur' : ''}" data-act="jump" data-k="${k}">${before + k + 1}</button>`).join('')}</div>`;
  return questionLayout(item, false, bar, actions) + nav;
}

function finishExam() {
  const E = S.active;
  stopTimer();
  const all = E.sections.flatMap(s => s.items);
  const per = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
  for (const it of all) {
    const q = QI[it.id];
    it.frac = grade(q, it.r); it.done = true;
    per[q.d][0] += it.frac; per[q.d][1] += 1;
    record(it.id, it.frac);
  }
  const raw = all.reduce((s, it) => s + it.frac, 0) / all.length;
  const score = Math.round(raw * 1000);
  const result = {
    date: Date.now(), score, pass: score >= 700,
    per: { 1: per[1][0] / per[1][1], 2: per[2][0] / per[2][1], 3: per[3][0] / per[3][1] },
    used: Math.round((EXAM_MINUTES * 60000 - timeLeft()) / 60000),
    sections: E.sections.map(s => ({ name: s.name, items: s.items.map(({ id, r, frac, perm }) => ({ id, r, frac, perm })) })),
  };
  S.exams.push(result);
  if (S.exams.length > 20) S.exams.shift();
  S.active = null;
  save();
  go('results', { idx: S.exams.length - 1 });
}

function renderResults() {
  const R = S.exams[V.idx];
  if (!R) return renderHome();
  let h = `<div class="narrow" style="max-width:900px"><h1>Exam result</h1><p class="sub">${new Date(R.date).toLocaleString()} · ${R.used} of ${EXAM_MINUTES} minutes used</p>
  <div class="card row" style="gap:28px"><div><div class="big-score ${R.pass ? 'pass' : 'fail'}">${R.score}</div><div class="muted">${R.pass ? 'Pass' : 'Below 700'}</div></div><div style="flex:1;min-width:260px">`;
  for (const d of [1, 2, 3]) {
    const p = R.per[d];
    h += `<div style="margin:6px 0"><div class="row small"><span>${esc(DOMAINS[d])}</span><span class="spacer"></span><b>${pct(p)}</b></div><div class="bar ${p >= 0.7 ? 'ok' : p >= 0.55 ? 'warn' : 'bad'}"><span style="width:${p * 100}%"></span></div></div>`;
  }
  h += `</div></div>`;
  for (const s of R.sections) {
    h += `<h2>${esc(s.name)}</h2>` + reviewList(s.items.map(x => ({ ...x, done: true })));
  }
  h += `<div class="actions"><button class="btn primary" data-act="quick" data-mode="missed">Practise what I missed</button><button class="btn" data-act="go" data-to="home">Home</button></div></div>`;
  return h;
}

function renderProgress() {
  let h = `<h1>Progress</h1><p class="sub">"Mastered" means answered correctly at least twice in a row. Progress is saved in this browser only; use Export to move it to another device.</p>
  <div class="card">${domainTable(true)}</div>
  <h2>Mock exams</h2>`;
  if (!S.exams.length) h += '<p class="muted">No mock exams yet.</p>';
  else h += `<div class="card"><table class="t"><thead><tr><th>Date</th><th class="num">Score</th><th class="num">D1</th><th class="num">D2</th><th class="num">D3</th><th class="num">Minutes</th><th></th></tr></thead><tbody>${S.exams.map((e, i) => `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td class="num ${e.pass ? 'pass' : 'fail'}"><b>${e.score}</b></td><td class="num">${pct(e.per[1])}</td><td class="num">${pct(e.per[2])}</td><td class="num">${pct(e.per[3])}</td><td class="num">${e.used}</td><td><button class="btn small" data-act="go" data-to="results" data-idx="${i}">Review</button></td></tr>`).reverse().join('')}</tbody></table></div>`;
  h += `<h2>Your data</h2><div class="row"><button class="btn" data-act="export">Export progress</button><label class="btn">Import progress<input type="file" accept="application/json" id="importfile" hidden></label><button class="btn" data-act="reset">Reset everything</button></div>`;
  return h;
}

// ---------- render ----------
function render() {
  const app = $('#app');
  let h;
  switch (V.screen) {
    case 'setup': h = renderSetup(); break;
    case 'practice': h = renderPractice(); break;
    case 'examIntro': h = renderExamIntro(); break;
    case 'exam': h = renderExam(); break;
    case 'results': h = renderResults(); break;
    case 'progress': h = renderProgress(); break;
    default: h = renderHome();
  }
  app.innerHTML = h;
  document.querySelectorAll('.top nav button').forEach(b => {
    const to = b.dataset.to;
    b.classList.toggle('on', to === V.screen || (to === 'setup' && V.screen === 'practice') || (to === 'examIntro' && (V.screen === 'exam' || V.screen === 'results')));
  });
  if (V.screen === 'exam' && S.active && S.active.kind === 'exam') startTimer(); else stopTimer();
  if (V.screen === 'setup') updatePoolInfo();
}
function updatePoolInfo() {
  const el = $('#poolinfo'); if (!el) return;
  const n = Q.filter(q => V.sel.has(q.s) && (V.filter !== 'missed' || (S.q[q.id] && S.q[q.id].box === 0))).length;
  el.textContent = `${n} questions in this selection`;
}

function curItem() {
  const A = S.active;
  if (!A) return null;
  if (A.kind === 'practice') return A.items[A.i];
  return A.sections[A.si].items[A.i];
}
function editable() {
  const it = curItem();
  return it && ((V.screen === 'practice' && !it.done) || (V.screen === 'exam' && !S.active.reviewing));
}

// ---------- events ----------
const actions = {
  go: t => { if (V.screen === 'exam' && t.dataset.to !== 'exam' && !confirm('Leave the exam? The timer keeps running and you can resume from Home.')) return; go(t.dataset.to, t.dataset.idx != null ? { idx: +t.dataset.idx } : {}); },
  resume: () => go(S.active.kind === 'exam' ? 'exam' : 'practice'),
  discard: () => { if (confirm('Discard the unfinished session?')) { S.active = null; save(); render(); } },
  quick: t => {
    const m = t.dataset.mode;
    if (m === 'smart') startPractice(new Set(Object.keys(SKILLS)), 20, 'smart');
    if (m === 'missed') startPractice(new Set(Object.keys(SKILLS)), 20, 'missed');
    if (m === 'skill') startPractice(new Set([t.dataset.skill]), 10, 'smart');
  },
  casetab: t => { caseTab = +t.dataset.i; render(); },
  pick: t => {
    if (!editable()) return;
    const it = curItem(), q = QI[it.id], o = +t.dataset.o;
    if (q.type === 'single') it.r = o;
    else {
      const k = it.r.indexOf(o);
      if (k >= 0) it.r.splice(k, 1);
      else { if (it.r.length >= q.answer.length) it.r.shift(); it.r.push(o); }
    }
    save(); render();
  },
  add: t => { if (!editable()) return; curItem().r.push(+t.dataset.o); save(); render(); },
  rm: t => { if (!editable()) return; curItem().r.splice(+t.dataset.k, 1); save(); render(); },
  up: t => { if (!editable()) return; const r = curItem().r, k = +t.dataset.k; if (k > 0) [r[k - 1], r[k]] = [r[k], r[k - 1]]; save(); render(); },
  down: t => { if (!editable()) return; const r = curItem().r, k = +t.dataset.k; if (k < r.length - 1) [r[k + 1], r[k]] = [r[k], r[k + 1]]; save(); render(); },
  stmt: t => { if (!editable()) return; curItem().r[+t.dataset.k] = t.dataset.v === '1'; save(); render(); },
  check: () => {
    const it = curItem(); if (!answered(it)) return;
    it.frac = grade(QI[it.id], it.r); it.done = true; record(it.id, it.frac); save(); render();
  },
  skip: () => { const P = S.active; const [it] = P.items.splice(P.i, 1); P.items.push(it); if (P.items.every(x => x.done || x === it)) {} save(); render(); },
  next: () => { S.active.i++; save(); render(); window.scrollTo(0, 0); },
  endpractice: () => { S.active.i = S.active.items.length; save(); render(); },
  finishpractice: () => { S.active = null; save(); go('home'); },
  // setup
  skillchk: t => { const k = t.dataset.k; t.checked ? V.sel.add(k) : V.sel.delete(k); render(); },
  selall: () => { V.sel = new Set(Object.keys(SKILLS)); render(); },
  selnone: () => { V.sel = new Set(); render(); },
  count: t => { V.count = +t.dataset.n; render(); },
  filter: t => { V.filter = t.dataset.f; render(); },
  startpractice: () => startPractice(V.sel, V.count, V.filter),
  // exam
  startexam: () => startExam(),
  enext: () => { S.active.i++; save(); render(); window.scrollTo(0, 0); },
  prev: () => { if (S.active.i > 0) S.active.i--; save(); render(); },
  flag: () => { const it = curItem(); it.flag = !it.flag; save(); render(); },
  jump: t => { S.active.reviewing = false; S.active.i = +t.dataset.k; save(); render(); window.scrollTo(0, 0); },
  reviewsection: () => { S.active.reviewing = true; save(); render(); },
  finishsection: () => {
    const E = S.active, sec = E.sections[E.si];
    const unans = sec.items.filter(it => !answered(it)).length;
    if (!confirm(unans ? `${unans} question(s) in this section are unanswered. Finish the section anyway?` : 'Finish this section? You can\'t come back to it.')) return;
    sec.locked = true; E.si++; E.i = 0; E.reviewing = false; save(); render(); window.scrollTo(0, 0);
  },
  seriesnext: () => {
    const E = S.active, sec = E.sections[E.si];
    if (!answered(curItem()) && !confirm('You haven\'t answered this question. Continue anyway?')) return;
    if (E.i < sec.items.length - 1) { E.i++; save(); render(); }
    else finishExam();
  },
  // data
  export: () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dp700-progress.json'; a.click();
  },
  reset: () => { if (confirm('Delete all progress and exam history from this browser?')) { S = { q: {}, exams: [], active: null }; save(); render(); } },
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t || t.tagName === 'INPUT' || t.tagName === 'SELECT') return;
  e.preventDefault();
  const fn = actions[t.dataset.act];
  if (fn) fn(t);
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'blank') {
    if (!editable()) return;
    curItem().r[+t.dataset.b] = t.value === '' ? null : +t.value; save(); render();
  } else if (t.dataset.act === 'skillchk') actions.skillchk(t);
  else if (t.id === 'importfile' && t.files[0]) {
    t.files[0].text().then(txt => {
      try { const s = JSON.parse(txt); if (!s.q) throw 0; S = { q: s.q, exams: s.exams || [], active: null }; save(); render(); alert('Progress imported.'); }
      catch (err) { alert('That file is not a DP-700 Trainer export.'); }
    });
  }
});
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (V.screen !== 'practice' && V.screen !== 'exam') return;
  if (e.key === 'Enter') { const b = $('#primary'); if (b && !b.disabled) { e.preventDefault(); b.click(); } return; }
  const it = curItem(); if (!it || !editable()) return;
  const q = QI[it.id];
  if (q.type !== 'single' && q.type !== 'multi') return;
  const k = e.key.toUpperCase().charCodeAt(0) - 65;
  const n = /^[1-9]$/.test(e.key) ? +e.key - 1 : (e.key.length === 1 ? k : -1);
  const order = it.perm || range(q.options.length);
  if (n >= 0 && n < order.length) actions.pick({ dataset: { o: order[n] } });
});

render();
})();
