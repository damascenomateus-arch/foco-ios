'use strict';
/* =====================================================================
   FOCO — app de treino pessoal
   Dados salvos só no aparelho (localStorage + IndexedDB para fotos)
   ===================================================================== */

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const KEY = 'foco_v1';
const pad = n => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, d = 0) => Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: d });
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; };
const r1 = v => Math.round(v * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return h ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`; };
const hhmm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WDL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const dShort = k => { const d = parseKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const dayOfYear = () => { const n = new Date(); return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 864e5); };

/* ---------- ícones ---------- */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  flame: '<path d="M12 22c4.4 0 7-2.9 7-7 0-3.6-2.4-6.4-4-8-.4 2-1.4 3.4-2.8 4 .4-3.2-1.2-6.6-4.2-9 0 4.2-5 6.6-5 13 0 4.1 3.4 7 9 7z"/>',
  utensils: '<path d="M7 2v20M4 2v6a3 3 0 0 0 6 0V2M17 22V2c-2.2 0-4 2.7-4 7s1.8 5 4 5"/>',
  body: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevU: '<path d="m18 15-6-6-6 6"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
  droplet: '<path d="M12 2.7 6.3 9.2a7 7 0 1 0 11.4 0z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  swap: '<path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 9a5 5 0 0 1 8 0M12 9l1.5-2"/>',
  ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 2h4l2 4 2-4h4l-2.5 8"/>',
  crown: '<path d="m2 18 2-11 5 5 3-7 3 7 5-5 2 11z"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${IC[n] || ''}</svg>`;

/* ---------- configurações fixas ---------- */
const FOCUS = {
  massa: { n: 'Ganhar massa', d: 'Hipertrofia, força e volume muscular', ic: 'dumbbell' },
  gordura: { n: 'Perder gordura', d: 'Queimar gordura mantendo o músculo', ic: 'flame' },
  definicao: { n: 'Definição', d: 'Músculo marcado com gordura baixa', ic: 'target' },
  condicionamento: { n: 'Condicionamento', d: 'Fôlego, resistência e explosão', ic: 'zap' },
};
const LOCATION = {
  academia: { n: 'Academia', d: 'Máquinas, barras, cabos e halteres', allow: 'gdpb', ic: 'dumbbell' },
  halteres: { n: 'Casa com halteres', d: 'Halteres, barra fixa e peso do corpo', allow: 'dpb', ic: 'home' },
  casa: { n: 'Casa sem equipamento', d: 'Só o peso do corpo', allow: 'b', ic: 'user' },
  calistenia: { n: 'Calistenia / ar livre', d: 'Barra fixa, paralelas e peso do corpo', allow: 'pb', ic: 'mountain' },
};
const LEVEL = {
  iniciante: { n: 'Iniciante', d: 'Menos de 6 meses de treino', ic: 'shield' },
  intermediario: { n: 'Intermediário', d: 'De 6 meses a 2 anos', ic: 'medal' },
  avancado: { n: 'Avançado', d: 'Mais de 2 anos treinando sério', ic: 'crown' },
};
const EQUIP_LABEL = { g: 'Academia', d: 'Halteres', b: 'Peso corporal', p: 'Barra / paralelas', c: 'Personalizado' };
const MUSCLES = ['Todos', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Posterior', 'Glúteos', 'Panturrilha', 'Abdômen', 'Cardio'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
const MEASURES = [['peito', 'Peito'], ['braco', 'Braço'], ['cintura', 'Cintura'], ['abdomen', 'Abdômen'], ['quadril', 'Quadril'], ['coxa', 'Coxa'], ['panturrilha', 'Panturrilha'], ['bf', '% Gordura']];
const TEMPLATES = {
  fa: { n: 'Corpo inteiro', slots: ['quad', 'peito', 'costasH', 'ombro', 'hinge', 'core', 'biceps', 'triceps'] },
  fb: { n: 'Corpo inteiro', slots: ['hinge', 'costasV', 'peito', 'lateral', 'unilateral', 'core', 'triceps', 'biceps'] },
  fc: { n: 'Corpo inteiro', slots: ['unilateral', 'peito', 'costasH', 'ombro', 'gluteo', 'core', 'posterior', 'pant'] },
  ua: { n: 'Superiores', slots: ['peito', 'costasH', 'ombro', 'costasV', 'peitoIso', 'biceps', 'triceps', 'lateral'] },
  ub: { n: 'Superiores', slots: ['costasV', 'peito', 'lateral', 'costasH', 'posterior', 'triceps', 'biceps', 'peitoIso'] },
  la: { n: 'Inferiores', slots: ['quad', 'hinge', 'unilateral', 'pant', 'core', 'gluteo', 'core'] },
  lb: { n: 'Inferiores', slots: ['hinge', 'quad', 'gluteo', 'unilateral', 'pant', 'core', 'core'] },
  push: { n: 'Peito, ombro e tríceps', slots: ['peito', 'ombro', 'peito', 'peitoIso', 'lateral', 'triceps', 'triceps'] },
  pull: { n: 'Costas e bíceps', slots: ['costasV', 'costasH', 'costasH', 'posterior', 'biceps', 'biceps', 'core'] },
  legs: { n: 'Pernas completas', slots: ['quad', 'hinge', 'unilateral', 'quad', 'gluteo', 'pant', 'core'] },
};
const SPLITS = { 2: ['fa', 'fb'], 3: ['fa', 'fb', 'fc'], 4: ['ua', 'la', 'ub', 'lb'], 5: ['push', 'pull', 'legs', 'ua', 'lb'], 6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] };
const SPLITS_COND = { 2: ['fa', 'fb'], 3: ['fa', 'fb', 'fc'], 4: ['fa', 'fb', 'fc', 'fa'], 5: ['fa', 'fb', 'fc', 'fa', 'fb'], 6: ['fa', 'fb', 'fc', 'fa', 'fb', 'fc'] };
const COMPOUND = new Set(['peito', 'costasV', 'costasH', 'quad', 'hinge']);
const DEFAULT_HABITS = [
  { id: 'treino', n: 'Treinar', auto: 1 },
  { id: 'agua', n: 'Bater a meta de água', auto: 1 },
  { id: 'proteina', n: 'Bater a meta de proteína', auto: 1 },
  { id: 'sono', n: 'Dormir 7h ou mais', auto: 1 },
  { id: 'alcool', n: 'Zero álcool' },
  { id: 'acucar', n: 'Zero doce e refrigerante' },
  { id: 'leitura', n: 'Ler 10 páginas' },
  { id: 'gelado', n: 'Banho gelado' },
];

/* ---------- estado ---------- */
const defaultState = () => ({
  v: 1, profile: null, plan: null, customWorkouts: [], customExercises: [], sessions: [], active: null,
  food: {}, myFoods: [], water: {}, weights: [], measures: [], sleep: {},
  habits: { list: [], log: {} },
  fasting: { protocol: 16, start: null, history: [] },
  ach: {}, bestStreak: 0, photoCount: 0,
  settings: { sound: true, vibrate: true, notif: false, trainTime: '18:00', waterEvery: 0 },
  lastRem: {},
  sys: { xp: 0, rank: 'E', quests: {}, daily: {}, log: [], exams: {}, title: null, lastCheck: null, penaltyDay: null, penDone: 0, pts: 0, maxLvl: 1, alloc: { FOR: 0, AGI: 0, VIT: 0, RES: 0, DIS: 0 }, gold: 0, weeks: {}, shop: [], bought: [] },
});
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = Object.assign(defaultState(), JSON.parse(raw)); s.sys = Object.assign(defaultState().sys, s.sys); return s; }
  } catch (e) { console.error(e); }
  return defaultState();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Memória do navegador cheia. Exporte um backup.', 'info'); } }

const UI = { tt: 'plano', libQ: '', libM: 'Todos', nd: dkey(), mk: 'cintura', cmpMode: false, cmp: [], pick: { q: '', m: 'Todos' }, fs: null, pf: null };
let OB = { step: 0, d: { name: '', age: '', weight: '', height: '', goalWeight: '', focus: '', location: '', level: '', weekdays: [1, 3, 5] } };
let PICK = null, PENDING = null, TM = null, PHOTOS = [], deferredPrompt = null, lastRoute = '';

/* ---------- exercícios ---------- */
const EXMAP = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
const allEx = () => EXERCISES.concat(S.customExercises);
const getEx = id => EXMAP[id] || S.customExercises.find(e => e.id === id) || { id, n: 'Exercício removido', m: '—', e: 'c', i: '' };
const isTime = ex => getEx(ex.exId || ex.id).t === 'time';

function prescribe(ex, p = S.profile) {
  const f = p.focus, lv = p.level, comp = COMPOUND.has(ex.s);
  if (ex.t === 'time') {
    const cardio = ex.s === 'cardio';
    const secs = cardio ? (f === 'condicionamento' ? 45 : 40) : ({ iniciante: 30, intermediario: 45, avancado: 60 }[lv]);
    return { exId: ex.id, sets: cardio ? 4 : 3, reps: '', time: secs, rest: cardio ? 20 : 30 };
  }
  let sets, reps, rest;
  switch (f) {
    case 'massa': sets = 4; reps = comp ? '6-10' : '10-12'; rest = comp ? 120 : 75; break;
    case 'gordura': sets = 3; reps = '12-15'; rest = 45; break;
    case 'definicao': sets = 4; reps = comp ? '8-10' : '12-15'; rest = comp ? 90 : 60; break;
    default: sets = 3; reps = '15'; rest = 30;
  }
  if (ex.e === 'b') reps = { massa: '10-20', gordura: '15-20', definicao: '12-20', condicionamento: '20' }[f];
  if (ex.e === 'p' && (ex.s === 'costasV' || ex.s === 'biceps')) reps = f === 'massa' ? '5-10' : '6-12';
  if (lv === 'iniciante') sets = Math.max(2, sets - 1);
  if (lv === 'avancado' && comp) sets++;
  return { exId: ex.id, sets, reps, rest };
}

function genPlan(p) {
  const n = clamp(p.weekdays.length, 2, 6);
  const split = (p.focus === 'condicionamento' ? SPLITS_COND : SPLITS)[n];
  const allow = LOCATION[p.location].allow;
  const max = { iniciante: 5, intermediario: 6, avancado: 7 }[p.level];
  const seen = {};
  const days = split.map((tk, di) => {
    const t = TEMPLATES[tk];
    const offset = seen[tk] = (seen[tk] ?? -1) + 1;
    const used = new Set(), items = [];
    const slots = [...t.slots];
    if (p.focus === 'gordura' || p.focus === 'condicionamento') slots.push('cardio');
    for (const slot of slots) {
      if (items.length >= max && slot !== 'cardio') continue;
      const cands = EXERCISES.filter(e => e.s === slot && allow.includes(e.e) && !used.has(e.id))
        .sort((a, b) => allow.indexOf(a.e) - allow.indexOf(b.e));
      if (!cands.length) continue;
      const ex = cands[offset % cands.length];
      used.add(ex.id);
      items.push(prescribe(ex, p));
    }
    return { letter: String.fromCharCode(65 + di), name: t.n, items };
  });
  return { days, nextIdx: 0, createdAt: Date.now() };
}
const estMin = items => Math.max(5, Math.round(items.reduce((a, it) => a + 60 + it.sets * ((it.time || 40) + (it.rest || 60)), 0) / 60));
const presc = it => it.time ? `${it.sets} × ${it.time}s` : `${it.sets} × ${it.reps || '—'}`;

/* ---------- metas e cálculos ---------- */
const curWeight = () => S.weights.length ? S.weights[S.weights.length - 1].kg : S.profile.weight;
const startWeight = () => S.profile.startWeight ?? S.profile.weight;
function targets(p = S.profile, w) {
  w = w ?? (p === S.profile ? curWeight() : p.weight);
  const bmr = 10 * w + 6.25 * p.height - 5 * p.age + 5;
  const tdee = bmr * (1.2 + 0.06 * p.weekdays.length);
  const kcal = Math.round((tdee + { massa: 300, gordura: -500, definicao: -300, condicionamento: 0 }[p.focus]) / 10) * 10;
  const prot = Math.round(w * { massa: 2.0, gordura: 2.2, definicao: 2.2, condicionamento: 1.8 }[p.focus]);
  const fat = Math.round(w * (p.focus === 'gordura' ? 0.8 : 0.9));
  const carb = Math.max(50, Math.round((kcal - prot * 4 - fat * 9) / 4));
  const water = Math.round(w * 35 / 250) * 250;
  return { kcal, prot, fat, carb, water };
}
function dayTotals(k) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  (S.food[k] || []).forEach(x => { t.kcal += x.kcal; t.p += x.p; t.c += x.c; t.f += x.f; });
  return t;
}
function habitDone(h, k) {
  if (h.auto) {
    if (h.id === 'treino') return S.sessions.some(s => s.date === k);
    if (h.id === 'agua') return (S.water[k] || 0) >= targets().water;
    if (h.id === 'proteina') return dayTotals(k).p >= targets().prot;
    if (h.id === 'sono') return (S.sleep[k] || 0) >= 7;
  }
  return (S.habits.log[k] || []).includes(h.id);
}
const habitsDoneCount = k => S.habits.list.filter(h => habitDone(h, k)).length;
const dayActive = k => S.sessions.some(s => s.date === k) || !!(S.sys.quests[k] && S.sys.quests[k].done) || habitsDoneCount(k) >= 3;
function calcStreak() {
  let k = dkey(); if (!dayActive(k)) k = addDays(k, -1);
  let n = 0; while (dayActive(k) && n < 3650) { n++; k = addDays(k, -1); }
  if (n > S.bestStreak) { S.bestStreak = n; save(); }
  return n;
}
const metric = s => s.kg > 0 ? s.kg * (1 + s.reps / 30) : (s.reps || s.time || 0);
function bestMetric(exId) {
  let b = null;
  for (const ss of S.sessions) for (const e of ss.exercises) if (e.exId === exId) for (const st of e.sets) { const m = metric(st); if (b === null || m > b) b = m; }
  return b;
}
function lastSets(exId) {
  for (let i = S.sessions.length - 1; i >= 0; i--) { const e = S.sessions[i].exercises.find(x => x.exId === exId); if (e && e.sets.length) return e.sets; }
  return null;
}
function exHistory(exId) {
  const out = [];
  for (const ss of S.sessions) { const e = ss.exercises.find(x => x.exId === exId); if (e && e.sets.length) out.push({ date: ss.date, sets: e.sets, best: Math.max(...e.sets.map(metric)) }); }
  return out;
}
const setTxt = s => s.time ? `${s.time}s` : (s.kg ? `${fmt(s.kg, 1)} kg × ${s.reps}` : `${s.reps} reps`);
const totalSets = a => a.exercises.reduce((n, e) => n + e.sets.length, 0);
const doneSets = a => a.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);

/* ---------- conquistas ---------- */
const ACH = [
  { id: 't1', n: 'Primeiro passo', d: '1º treino concluído', ic: 'dumbbell', t: s => s.sessions >= 1 },
  { id: 't10', n: 'Constância', d: '10 treinos', ic: 'dumbbell', t: s => s.sessions >= 10 },
  { id: 't25', n: 'Máquina', d: '25 treinos', ic: 'zap', t: s => s.sessions >= 25 },
  { id: 't50', n: 'Inabalável', d: '50 treinos', ic: 'shield', t: s => s.sessions >= 50 },
  { id: 't100', n: 'Centurião', d: '100 treinos', ic: 'crown', t: s => s.sessions >= 100 },
  { id: 'q1', n: 'Desperto', d: '1ª missão diária', ic: 'zap', t: s => s.quests >= 1 },
  { id: 'q7', n: 'Aquele que não falha', d: '7 missões diárias', ic: 'shield', t: s => s.quests >= 7 },
  { id: 'q30', n: 'Rotina de ferro', d: '30 missões diárias', ic: 'shield', t: s => s.quests >= 30 },
  { id: 'pen', n: 'Sobrevivente', d: 'Cumprir uma penalidade', ic: 'heart', t: s => s.penDone >= 1 },
  { id: 'dg1', n: 'Explorador', d: '1ª masmorra concluída', ic: 'mountain', t: s => s.dungeons >= 1 },
  { id: 'boss1', n: 'Caçador de chefes', d: 'Derrotar um Chefe', ic: 'crown', t: s => s.bosses >= 1 },
  { id: 'boss4', n: 'Mês sem trégua', d: 'Derrotar 4 Chefes', ic: 'crown', t: s => s.bosses >= 4 },
  { id: 'buy1', n: 'Merecido', d: 'Resgatar uma recompensa', ic: 'heart', t: s => s.bought >= 1 },
  { id: 'l10', n: 'Em ascensão', d: 'Chegar ao nível 10', ic: 'chevU', t: s => s.lvl >= 10 },
  { id: 'rD', n: 'Promovido', d: 'Alcançar o Rank D', ic: 'medal', t: s => s.ri >= 1 },
  { id: 'rC', n: 'Acima da média', d: 'Alcançar o Rank C', ic: 'medal', t: s => s.ri >= 2 },
  { id: 'rB', n: 'Veterano', d: 'Alcançar o Rank B', ic: 'medal', t: s => s.ri >= 3 },
  { id: 'rA', n: 'Elite', d: 'Alcançar o Rank A', ic: 'crown', t: s => s.ri >= 4 },
  { id: 'rS', n: 'Absoluto', d: 'Alcançar o Rank S', ic: 'crown', t: s => s.ri >= 5 },
  { id: 's3', n: 'Aquecendo', d: '3 dias seguidos', ic: 'flame', t: s => s.streak >= 3 },
  { id: 's7', n: 'Semana de ferro', d: '7 dias seguidos', ic: 'flame', t: s => s.streak >= 7 },
  { id: 's30', n: 'Mês de aço', d: '30 dias seguidos', ic: 'flame', t: s => s.streak >= 30 },
  { id: 'pr1', n: 'Novo recorde', d: '1º recorde pessoal', ic: 'trophy', t: s => s.prs >= 1 },
  { id: 'pr10', n: 'Sem limites', d: '10 recordes', ic: 'trophy', t: s => s.prs >= 10 },
  { id: 'v10', n: '10 toneladas', d: 'Volume total levantado', ic: 'medal', t: s => s.volume >= 10000 },
  { id: 'v100', n: '100 toneladas', d: 'Volume total levantado', ic: 'medal', t: s => s.volume >= 100000 },
  { id: 'w7', n: 'Hidratado', d: '7 dias na meta de água', ic: 'droplet', t: s => s.waterDays >= 7 },
  { id: 'f1', n: 'Mente forte', d: 'Concluir um jejum', ic: 'clock', t: s => s.fasts >= 1 },
  { id: 'ph1', n: 'Registro', d: '1ª foto de progresso', ic: 'camera', t: s => s.photos >= 1 },
  { id: 'm1', n: 'Dia perfeito', d: 'Todos os hábitos do dia', ic: 'target', t: s => s.perfect },
  { id: 'goal', n: 'Meta batida', d: 'Chegou no peso-meta', ic: 'mountain', t: s => s.goal },
];
function achStats() {
  const p = S.profile, start = startWeight(), cur = curWeight(), g = p.goalWeight, wt = targets().water, k = dkey();
  return {
    sessions: S.sessions.length, streak: Math.max(calcStreak(), S.bestStreak),
    prs: S.sessions.reduce((a, s) => a + (s.prs?.length || 0), 0),
    volume: S.sessions.reduce((a, s) => a + (s.volume || 0), 0),
    waterDays: Object.values(S.water).filter(v => v >= wt).length,
    fasts: S.fasting.history.filter(f => (f.end - f.start) / 3.6e6 >= f.goal).length,
    photos: S.photoCount, perfect: S.habits.list.length > 0 && habitsDoneCount(k) === S.habits.list.length,
    goal: g && start !== g && (g < start ? cur <= g : cur >= g),
    quests: Object.values(S.sys.quests).filter(q => q.done && !q.pen).length,
    penDone: S.sys.penDone || 0, lvl: sysInfo().lvl, ri: rankI(),
    dungeons: Object.values(S.sys.weeks).reduce((a, w) => a + w.claimed.filter(Boolean).length, 0),
    bosses: S.sys.bosses || 0, bought: S.sys.bought.length,
  };
}

/* =====================================================================
   SISTEMA — XP, níveis, ranks, missão diária, penalidade, exames
   ===================================================================== */
const RANKS = [
  { r: 'E', min: 1, max: 9, c: '#9aa8bd', q: [20, 20, 20, 10], t: 'Caçador iniciante' },
  { r: 'D', min: 10, max: 19, c: '#4ade80', q: [35, 35, 35, 15], t: 'Caçador promissor' },
  { r: 'C', min: 20, max: 34, c: '#3da5ff', q: [50, 50, 50, 25], t: 'Caçador experiente' },
  { r: 'B', min: 35, max: 49, c: '#a78bfa', q: [70, 70, 70, 35], t: 'Caçador veterano' },
  { r: 'A', min: 50, max: 69, c: '#f5c542', q: [85, 85, 85, 45], t: 'Caçador de elite' },
  { r: 'S', min: 70, max: 9999, c: '#ff4d6d', q: [100, 100, 100, 60], t: 'Caçador absoluto' },
];
const QUEST_ITEMS = [['Flexões', 'reps', [5, 10]], ['Abdominais', 'reps', [5, 10]], ['Agachamentos', 'reps', [5, 10]], ['Cardio', 'min', [5, 10]], ['Prancha', 's', [30, 60]]];
const xpNeed = n => 80 + n * 20;
const xpFor = n => 80 * (n - 1) + 10 * (n - 1) * n;
function levelOf(xp) { let n = 1; while (xpFor(n + 1) <= xp) n++; return n; }
const rankI = () => Math.max(0, RANKS.findIndex(x => x.r === S.sys.rank));
function sysInfo() {
  const ri = rankI(), R = RANKS[ri], lvl = clamp(levelOf(S.sys.xp), R.min, R.max), need = xpNeed(lvl);
  const locked = ri < RANKS.length - 1 && lvl >= R.max;
  const full = locked && S.sys.xp >= xpFor(R.max + 1) - 1;
  return { ri, R, lvl, need, cur: clamp(S.sys.xp - xpFor(lvl), 0, need), locked, full, next: RANKS[ri + 1] };
}
function sysLog(msg) { S.sys.log.unshift({ ts: Date.now(), msg }); S.sys.log = S.sys.log.slice(0, 40); }
function grantXP(amt, reason, quiet = false) {
  if (!S.profile || !amt) return 0;
  const before = sysInfo(), last = before.ri === RANKS.length - 1;
  const cap = last ? Infinity : xpFor(before.R.max + 1) - 1, floor = xpFor(before.R.min), old = S.sys.xp;
  S.sys.xp = clamp(old + amt, floor, cap);
  const got = S.sys.xp - old;
  if (got > 0) S.sys.gold += Math.round(got / 2);
  sysLog(`${reason}: ${got >= 0 ? '+' : ''}${got} XP${amt > 0 && got < amt ? ' (travado)' : ''}`);
  const pts = syncLevel();
  save();
  const after = sysInfo();
  if (after.lvl > before.lvl) sysPop('levelup', { ...after, from: before.lvl, pts });
  else if (!quiet) {
    if (amt > 0 && got === 0) toast('XP travado. Faça o Exame de Promoção', 'lock');
    else toast(`${got >= 0 ? '+' : ''}${got} XP · ${reason}`, 'zap');
  }
  return got;
}
function syncLevel() { const l = sysInfo().lvl, m = S.sys.maxLvl || 1; if (l > m) { S.sys.pts += 3 * (l - m); S.sys.maxLvl = l; return 3 * (l - m); } return 0; }
const ATTR_INFO = [['FOR', 'Força', 'Cargas e recordes nos exercícios'], ['AGI', 'Agilidade', 'Cardio, abdômen e unilaterais'], ['VIT', 'Vitalidade', 'Sono, água e proteína'], ['RES', 'Resistência', 'Volume e tempo de treino'], ['DIS', 'Disciplina', 'Missões, sequência e hábitos']];
function pointsSheet() {
  const a = attrs();
  openSheet(`${sheetHead('Pontos de atributo', `${S.sys.pts} ${S.sys.pts === 1 ? 'ponto disponível' : 'pontos disponíveis'}`)}
  <div class="small mut" style="margin-bottom:8px">Você ganha 3 pontos a cada nível. Os atributos também crescem sozinhos com o que você faz. Cada ponto distribuído é permanente.</div>
  <div class="card tight">${ATTR_INFO.map(([k, n, d]) => `<div class="li"><div class="grow"><div class="lt">${k} · ${n}</div><div class="ls">${d}${S.sys.alloc[k] ? ` · <span class="acc">+${S.sys.alloc[k]} distribuídos</span>` : ''}</div></div><span class="num" style="font-size:1.6rem;width:46px;text-align:center">${a[k]}</span><button class="icon-btn acc" data-a="ptAdd" data-k="${k}" ${S.sys.pts ? '' : 'disabled style="opacity:.3"'}>${ic('plus')}</button></div>`).join('')}</div>
  <button class="btn block" data-a="closeSheet">Pronto</button>`);
}

/* masmorras semanais */
const DUNGEONS = [['Masmorra de Ferro', 'treinos concluídos na semana', 'dumbbell'], ['Masmorra da Resistência', 'min de cardio (missão + treinos)', 'zap'], ['Masmorra da Disciplina', 'missões diárias cumpridas', 'shield']];
function weekStart(k = dkey()) { const d = parseKey(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dkey(d); }
function getWeek() {
  const ws = weekStart(); let w = S.sys.weeks[ws];
  if (!w) {
    const created = dkey(new Date(S.profile.createdAt || Date.now())), from = created > ws ? created : ws, end = addDays(ws, 6);
    let avail = 0, train = 0;
    for (let k = from; k <= end; k = addDays(k, 1)) { avail++; if (S.profile.weekdays.includes(parseKey(k).getDay())) train++; }
    const q = RANKS[rankI()].q;
    w = S.sys.weeks[ws] = { ws, t: [Math.max(1, train), Math.max(15, Math.round((q[3] * 7 + 30) * avail / 7 / 5) * 5), Math.max(1, avail - 1)], claimed: [false, false, false], boss: false };
    save();
  }
  return w;
}
function weekProgress(w) {
  const end = addDays(w.ws, 6), inW = k => k >= w.ws && k <= end, ses = S.sessions.filter(s => inW(s.date));
  let cardio = 0;
  ses.forEach(s => s.exercises.forEach(e => { if (getEx(e.exId).m === 'Cardio') e.sets.forEach(st => cardio += (st.time || 0) / 60); }));
  const qs = Object.entries(S.sys.quests).filter(([k]) => inW(k));
  qs.forEach(([, q]) => cardio += q.v[3] || 0);
  return [ses.length, Math.floor(cardio), qs.filter(([, q]) => q.done).length];
}
function weekWin() {
  const w = getWeek(), p = weekProgress(w), left = (parseKey(addDays(w.ws, 7)) - Date.now()) / 1000;
  const d = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), cleared = w.claimed.filter(Boolean).length, allC = cleared === 3;
  const rk = RANKS[rankI()].r;
  const items = DUNGEONS.map(([n, desc, icn], i) => {
    const v = Math.min(p[i], w.t[i]), ok = p[i] >= w.t[i], c = w.claimed[i], pct = Math.round(v / w.t[i] * 100);
    const st = c ? 'done' : ok ? 'ready' : 'idle';
    const lbl = c ? `${ic('check')} Masmorra limpa` : ok ? 'Portal estável · pronta para limpar' : pct ? `Em andamento · ${pct}%` : 'Portal aberto · aguardando caçador';
    return `<div class="dg dgc ${st}" data-dg="${i}" style="--c:${DG_COLORS[i]};--spd:${(6 - pct / 25).toFixed(2)}s">
      ${portalSVG('g' + i, DG_COLORS[i], st, DG_GLYPH[i])}
      <div class="grow">
        <div class="dg-h"><b>${n}</b><span class="dg-rk" title="Masmorra Rank ${rk}"><i>${rk}</i></span><span class="dg-n">${v}<i>/${w.t[i]}</i></span></div>
        <div class="dg-d">${desc}</div>
        <div class="dg-bar"><i style="width:${pct}%"></i></div>
        <div class="dg-st">${lbl}</div>
        ${ok && !c ? `<button class="btn sm block dg-claim" data-a="dClaim" data-i="${i}">${ic(icn)} Limpar masmorra · +150 XP</button>` : ''}
      </div></div>`;
  }).join('');
  const bst = w.boss ? 'slain' : allC ? 'open' : 'sealed';
  const seals = [0, 1, 2].map(k => `<i class="${w.claimed[k] ? 'on' : ''}" style="--c:${DG_COLORS[k]}"></i>`).join('');
  const boss = `<div class="dg dgc boss ${bst}" data-dg="b" style="--c:#ff4d6d;--spd:1.6s">
    ${portalSVG('gb', '#ff4d6d', bst, DG_GLYPH[3])}
    <div class="grow">
      <div class="dg-h"><b>Portal do Chefe</b>${w.boss ? '' : `<span class="dg-seals" aria-label="${cleared} de 3 selos quebrados">${seals}</span>`}</div>
      ${w.boss ? `<div class="dg-st ok">${ic('crown')} Chefe da semana derrotado</div>`
        : allC ? `<div class="dg-d">Os selos se romperam. Algo enorme está do outro lado.</div><button class="btn block dg-claim boss-btn" data-a="dBoss">${ic('crown')} Enfrentar o Chefe · +200 XP</button>`
        : `<div class="dg-d">Selado por correntes. Limpe as 3 masmorras para romper os selos (+200 XP).</div><div class="dg-st">${cleared}/3 selos rompidos</div>`}
    </div></div>`;
  return `<div class="sys dgs"><span class="sys-h">Masmorras</span><div class="dg-timer"><span class="dg-hg" aria-hidden="true"></span>Fecham em <b>${d}d ${h}h</b> · novas toda segunda</div>${items}${boss}</div>`;
}

/* loja de recompensas */
const SHOP_SUG = [['Refeição livre', 300], ['Dia de descanso extra', 200], ['Sobremesa', 150], ['Comprar um suplemento', 800], ['Roupa nova de treino', 1200]];
function shopSheet() {
  const g = S.sys.gold;
  openSheet(`${sheetHead('Loja', `<span style="color:#f5c542">${fmt(g)} Ouro</span> disponível`)}
  ${S.sys.shop.length ? `<div class="card tight">${S.sys.shop.map(r => `<div class="li"><div class="grow"><div class="lt">${esc(r.n)}</div><div class="ls" style="color:#f5c542">${fmt(r.cost)} Ouro</div></div><button class="btn sm ${g >= r.cost ? 'pri' : ''}" data-a="buy" data-id="${r.id}" ${g >= r.cost ? '' : 'disabled'}>Resgatar</button><button class="icon-btn sm danger" data-a="shopDel" data-id="${r.id}">${ic('trash')}</button></div>`).join('')}</div>` : `<div class="card">${empty('medal', 'Sua loja está vazia. Crie recompensas que valham o esforço e troque pelo Ouro que você ganha.')}</div>`}
  <div class="section-t">Nova recompensa</div>
  <div class="field"><input class="inp" id="rwN" placeholder="Nome da recompensa"></div>
  <div class="row"><div class="inp-unit grow"><input class="inp" id="rwC" type="number" inputmode="numeric" placeholder="Preço"><span>Ouro</span></div><button class="btn pri" data-a="shopAdd">${ic('plus')}</button></div>
  <div class="xs mut" style="margin:14px 0 8px">Sugestões (toque para preencher)</div>
  <div class="chips" style="flex-wrap:wrap">${SHOP_SUG.map(([n, c], i) => `<button class="chip" data-a="shopSug" data-i="${i}">${n} · ${c}</button>`).join('')}</div>
  ${S.sys.bought.length ? `<div class="section-t">Resgatadas</div><div class="card tight">${S.sys.bought.slice(0, 8).map(b => `<div class="kv"><span>${dShort(dkey(new Date(b.ts)))}</span><span>${esc(b.n)} · <span style="color:#f5c542">${fmt(b.cost)}</span></span></div>`).join('')}</div>` : ''}`);
}
function awardDaily(key, amt, reason) { const k = dkey(), d = S.sys.daily[k] = S.sys.daily[k] || {}; if (d[key]) return; d[key] = 1; grantXP(amt, reason); }

/* missão diária */
function questTargets(pen) { const q = RANKS[rankI()].q, t = pen ? q.map(v => Math.ceil(v * 1.5 / 5) * 5) : [...q]; if (pen) t.push(120); return t; }
function getQuest(k = dkey()) {
  let q = S.sys.quests[k];
  if (!q) { const pen = S.sys.penaltyDay === k; q = S.sys.quests[k] = { pen, t: questTargets(pen), v: [], done: false }; q.v = q.t.map(() => 0); save(); }
  return q;
}
const secsToMidnight = () => { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); return (m - n) / 1000; };
function questSet(i, val) {
  const q = getQuest(); if (q.done) return;
  q.v[i] = clamp(val, 0, q.t[i]);
  if (q.v.every((v, j) => v >= q.t[j])) completeQuest(q);
  save(); render();
}
function completeQuest(q) {
  q.done = true;
  const st = calcStreak();
  if (q.pen) {
    S.sys.penDone = (S.sys.penDone || 0) + 1;
    sysPop('msg', { snd: 'quest', h: 'Penalidade', msg: 'Penalidade cumprida.', sub: 'Você sobreviveu. Amanhã a missão volta ao normal. +40 XP' });
    grantXP(40, 'Penalidade cumprida', true);
  } else {
    const bonus = 2 * Math.min(st, 20);
    sysPop('msg', { snd: 'quest', h: 'Missão cumprida', msg: 'Missão diária concluída.', sub: `Recompensa: +${60 + bonus} XP${bonus ? ` (inclui +${bonus} pela sequência de ${st} ${st === 1 ? 'dia' : 'dias'})` : ''}` });
    grantXP(60 + bonus, 'Missão diária', true);
  }
  checkAch();
}
function sysRollover() {
  const today = dkey(), sy = S.sys;
  if (sy.lastCheck === today) return;
  const y = addDays(today, -1), created = dkey(new Date(S.profile.createdAt || Date.now()));
  if (sy.lastCheck && y >= created) {
    const q = sy.quests[y];
    if (!q || !q.done) {
      if (q && q.pen) {
        const lost = -grantXP(-100, 'Penalidade não cumprida', true);
        sysPop('msg', { red: true, h: 'Penalidade', msg: 'Penalidade não cumprida.', sub: `-${lost} XP. Hoje a missão volta ao normal. Não falhe de novo.` });
      } else {
        sy.penaltyDay = today;
        sysLog('Missão diária não cumprida. Zona de Penalidade ativada');
        PEN_SHOWN = true;
        sysPop('msg', { red: true, timer: true, h: 'Alerta', msg: 'A missão diária de ontem não foi cumprida.<br>Zona de Penalidade ativada.', sub: 'Zona de Penalidade ativada: a missão de hoje é 50% maior e inclui 2 min de prancha. Se falhar de novo, você perde 100 XP.', btn: 'Aceitar penalidade' });
      }
    }
  }
  sy.lastCheck = today; save();
}

/* exames de promoção */
const L_ = (ex, r) => ({ type: 'lift', ex, r }), R_ = (n, v) => ({ type: 'reps', n, v }), T_ = (n, v) => ({ type: 'time', n, v }), BAR = v => ({ type: 'reps', n: 'Barra fixa (máx.)', v, bar: 1 });
const EXAMS = {
  D: { ses: 8, gym: [L_('supino-reto', .6), L_('agachamento', .8), R_('Flexões (máx.)', 20), T_('Prancha', 60)], bw: [R_('Flexões (máx.)', 25), R_('Agachamentos em 2 min', 50), T_('Prancha', 60), R_('Burpees em 3 min', 30), BAR(3)] },
  C: { ses: 20, gym: [L_('supino-reto', .8), L_('agachamento', 1.1), L_('terra', 1.3), BAR(5)], bw: [R_('Flexões (máx.)', 40), R_('Agachamentos em 2 min', 75), T_('Prancha', 90), R_('Burpees em 3 min', 45), BAR(8)] },
  B: { ses: 45, gym: [L_('supino-reto', 1), L_('agachamento', 1.4), L_('terra', 1.7), BAR(10)], bw: [R_('Flexões (máx.)', 55), R_('Agachamentos em 2 min', 100), T_('Prancha', 150), R_('Burpees em 3 min', 60), BAR(12)] },
  A: { ses: 80, gym: [L_('supino-reto', 1.25), L_('agachamento', 1.75), L_('terra', 2.1), BAR(15)], bw: [R_('Flexões (máx.)', 70), R_('Agachamentos em 2 min', 130), T_('Prancha', 210), R_('Burpees em 3 min', 75), BAR(18)] },
  S: { ses: 130, gym: [L_('supino-reto', 1.5), L_('agachamento', 2), L_('terra', 2.5), BAR(20)], bw: [R_('Flexões (máx.)', 90), R_('Agachamentos em 2 min', 160), T_('Prancha', 300), R_('Burpees em 3 min', 90), BAR(25)] },
};
function examTests(r) { const e = EXAMS[r], loc = S.profile.location; let t = loc === 'academia' ? e.gym : e.bw; if (loc === 'casa') t = t.filter(x => !x.bar); return t; }
const liftTarget = t => Math.round(curWeight() * t.r * 2) / 2;
function examSheet() {
  const si = sysInfo(); if (!si.next) return;
  const r = si.next.r, e = EXAMS[r], tests = examTests(r);
  const lvOk = si.lvl >= si.R.max, sesOk = S.sessions.length >= e.ses, ok = lvOk && sesOk;
  const rows = tests.map((t, i) => {
    if (t.type === 'lift') {
      const best = bestMetric(t.ex);
      return `<div class="exam-t"><div class="row between"><b>${esc(getEx(t.ex).n)}</b><span class="tag acc">1RM ≥ ${fmt(liftTarget(t), 1)} kg</span></div><div class="small mut" style="margin:4px 0 8px">${fmt(t.r * 100)}% do seu peso · melhor registrado: ${best ? fmt(best, 1) + ' kg' : '—'}</div><div class="grid2"><div class="inp-unit"><input class="inp" id="ex_${i}_kg" type="number" inputmode="decimal" placeholder="Carga"><span>kg</span></div><div class="inp-unit"><input class="inp" id="ex_${i}_r" type="number" inputmode="numeric" placeholder="Reps"><span>reps</span></div></div></div>`;
    }
    return `<div class="exam-t"><div class="row between"><b>${esc(t.n)}</b><span class="tag acc">≥ ${t.type === 'time' ? mmss(t.v) : t.v}</span></div><div class="inp-unit" style="margin-top:8px"><input class="inp" id="ex_${i}_v" type="number" inputmode="numeric" placeholder="Resultado"><span>${t.type === 'time' ? 'seg' : 'reps'}</span></div></div>`;
  }).join('');
  openSheet(`${sheetHead('Exame de Promoção', `Rank ${si.R.r} → Rank ${r}`)}
  <div class="sys"><span class="sys-h">Requisitos</span>
    <div class="req ${lvOk ? 'ok' : ''}"><span class="d">${ic('check')}</span>Nível ${si.R.max} (atual: ${si.lvl})</div>
    <div class="req ${sesOk ? 'ok' : ''}"><span class="d">${ic('check')}</span>${e.ses} treinos concluídos (atual: ${S.sessions.length})</div></div>
  <div class="sys"><span class="sys-h">Provas</span><div class="small mut" style="margin-bottom:4px">Faça cada prova de verdade, depois de aquecer, e registre o resultado. Nas cargas, informe peso e repetições da sua melhor série: o Sistema calcula o 1RM.</div>${rows}</div>
  <button class="btn pri block" data-a="examSubmit" ${ok ? '' : 'disabled'}>${ic('shield')} Submeter ao Sistema</button>
  ${ok ? '' : '<div class="xs dim center" style="margin-top:8px">Cumpra os requisitos para liberar o exame.</div>'}`);
}
function examSubmit() {
  const si = sysInfo(), next = si.next; if (!next) return;
  const tests = examTests(next.r), fails = [];
  tests.forEach((t, i) => {
    if (t.type === 'lift') {
      const kg = num($(`#ex_${i}_kg`).value), reps = Math.round(num($(`#ex_${i}_r`).value));
      const e1 = reps <= 1 ? kg : kg * (1 + Math.min(reps, 12) / 30);
      if (!kg || !reps || e1 < liftTarget(t)) fails.push(`${getEx(t.ex).n}: ${kg && reps ? fmt(e1, 1) : 0} de ${fmt(liftTarget(t), 1)} kg`);
    } else {
      const v = num($(`#ex_${i}_v`).value);
      if (v < t.v) fails.push(`${t.n}: ${v} de ${t.type === 'time' ? t.v + ' s' : t.v}`);
    }
  });
  closeSheet();
  if (fails.length) {
    sysLog(`Exame Rank ${next.r} reprovado`); save();
    sysPop('msg', { red: true, h: 'Reprovado', msg: 'Você ainda não está pronto.', sub: `<div style="text-align:left;margin:4px auto 0;max-width:300px">${fails.map(f => `<div style="padding:4px 0;border-bottom:1px dashed rgba(255,77,109,.25)"><span style="color:#ff8ea3">✗</span> ${esc(f)}</div>`).join('')}</div><div style="margin-top:12px">Treine e tente novamente.</div>` });
    return;
  }
  S.sys.rank = next.r; S.sys.xp = Math.max(S.sys.xp, xpFor(next.min)); S.sys.exams[next.r] = dkey();
  const pts = syncLevel();
  sysLog(`Promovido ao Rank ${next.r}${pts ? ` · +${pts} pontos` : ''}`); save(); render();
  sysPop('rankup', next); checkAch();
}

/* atributos */
function attrs() {
  let vol = 0, sets = 0, mins = 0, agi = 0, prs = 0;
  for (const s of S.sessions) {
    mins += s.dur / 60; prs += s.prs?.length || 0;
    for (const e of s.exercises) { const ex = getEx(e.exId); sets += e.sets.length; if (ex.m === 'Cardio' || ex.m === 'Abdômen' || ex.s === 'unilateral') agi += e.sets.length; for (const st of e.sets) vol += st.kg * st.reps; }
  }
  const qs = Object.values(S.sys.quests), qDone = qs.filter(q => q.done).length, cardio = qs.reduce((a, q) => a + (q.v[3] || 0), 0);
  const days = Object.values(S.sys.daily), vit = days.reduce((a, d) => a + (d.agua ? 1 : 0) + (d.prot ? 1 : 0) + (d.sono ? 1 : 0), 0);
  const hab = days.reduce((a, d) => a + Object.keys(d).filter(k => k.startsWith('h-')).length, 0);
  const al = S.sys.alloc || {};
  return {
    FOR: 10 + Math.floor(vol / 2500) + prs * 2 + (al.FOR || 0), AGI: 10 + Math.floor(agi / 8) + Math.floor(cardio / 30) + (al.AGI || 0),
    VIT: 10 + Math.floor(vit / 2) + (al.VIT || 0), RES: 10 + Math.floor(sets / 15) + Math.floor(mins / 60) + (al.RES || 0), DIS: 10 + qDone + S.bestStreak + Math.floor(hab / 3) + (al.DIS || 0),
  };
}
function radar(a) {
  const keys = ['FOR', 'AGI', 'VIT', 'RES', 'DIS'], max = Math.max(30, ...keys.map(k => a[k])) * 1.1, cx = 110, cy = 102, Rr = 70;
  const pt = (i, v) => { const g = -Math.PI / 2 + i * 2 * Math.PI / 5; return [(cx + Math.cos(g) * Rr * v).toFixed(1), (cy + Math.sin(g) * Rr * v).toFixed(1)]; };
  let grid = ''; for (const f of [.25, .5, .75, 1]) grid += `<polygon points="${keys.map((_, i) => pt(i, f).join(',')).join(' ')}" fill="none" stroke="rgba(90,170,255,${f === 1 ? .45 : .14})"/>`;
  const axes = keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" stroke="rgba(90,170,255,.14)"/>`).join('');
  const poly = keys.map((k, i) => pt(i, a[k] / max).join(',')).join(' ');
  const labels = keys.map((k, i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${+y + 4}" text-anchor="middle">${k} ${a[k]}</text>`; }).join('');
  return `<svg class="radar" viewBox="0 0 220 205" style="width:100%;max-width:280px;display:block;margin:0 auto">${grid}${axes}<polygon points="${poly}" fill="rgba(61,165,255,.22)" stroke="#5ab8ff" stroke-width="2" style="filter:drop-shadow(0 0 6px rgba(61,165,255,.9))"/>${labels}</svg>`;
}

/* ---------- ilustrações originais do FOCO ---------- */
const CLASSES = {
  massa: ['Lutador', 'Guerreiro', 'Berserker', 'Gladiador', 'Titã', 'Colosso'],
  gordura: ['Caçador', 'Rastreador', 'Predador', 'Executor', 'Ceifador', 'Fantasma'],
  definicao: ['Assassino', 'Lâmina', 'Sombra', 'Duelista', 'Mestre das Lâminas', 'Lâmina Absoluta'],
  condicionamento: ['Corredor', 'Batedor', 'Vanguarda', 'Tempestade', 'Relâmpago', 'Furacão'],
};
const className = (ri = rankI()) => (CLASSES[S.profile.focus] || CLASSES.massa)[ri];
function avatarSVG(ri, color, mode) { return typeof vultoSVG === 'function' ? vultoSVG(ri, color, mode) : avatarOld(ri, color); }
function avatarOld(ri, color) {
  const id = 'a' + uid();
  const aura = ri >= 1 ? `<ellipse cx="100" cy="118" rx="${66 + ri * 6}" ry="${90 + ri * 5}" fill="url(#${id}r)" class="av-aura"/>` : '';
  const flames = ri >= 3 ? `<path class="av-flame" d="M40 205 C28 160 48 132 44 96 C60 122 62 84 76 62 C79 92 91 70 100 40 C109 70 121 92 124 62 C138 84 140 122 156 96 C152 132 172 160 160 205" fill="none" stroke="${color}" stroke-width="2.2" opacity=".6" filter="url(#${id}g)"/>` : '';
  const ring = ri >= 4 ? `<circle cx="100" cy="80" r="50" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="2 6 12 6" opacity=".85" class="av-ring"/>` : '';
  const armor = (ri >= 2 ? `<path d="M57 122 L83 110 L87 133 L61 144 Z M143 122 L117 110 L113 133 L139 144 Z" fill="#111c36" stroke="${color}" stroke-width="1.6"/>` : '')
    + (ri >= 3 ? `<path d="M88 138 L100 148 L112 138 L108 176 L100 184 L92 176 Z" fill="#0d1630" stroke="${color}" stroke-width="1.3"/>` : '');
  const parts = ri >= 5 ? Array.from({ length: 10 }, (_, i) => `<circle cx="${32 + (i * 53) % 136}" cy="${70 + (i * 37) % 130}" r="${1.2 + (i % 3) * .6}" fill="${color}" class="av-p" style="animation-delay:${(i * .33).toFixed(2)}s"/>`).join('') : '';
  return `<svg class="avatar" viewBox="0 0 200 220" aria-hidden="true"><defs><radialGradient id="${id}r"><stop offset="0" stop-color="${color}" stop-opacity="${(.16 + ri * .06).toFixed(2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2744"/><stop offset="1" stop-color="#060a14"/></linearGradient></defs>
  ${aura}${flames}${ring}<ellipse cx="100" cy="209" rx="62" ry="7" fill="${color}" opacity=".28"/>
  <path d="M100 30 C70 30 54 56 55 86 C55 100 59 110 62 118 L38 210 L162 210 L138 118 C141 110 145 100 145 86 C146 56 130 30 100 30 Z" fill="url(#${id}c)" stroke="${color}" stroke-opacity=".55" stroke-width="1.5"/>
  <path d="M100 30 C96 60 94 90 100 118 M100 118 L92 210 M100 118 L108 210" stroke="${color}" stroke-opacity=".12" stroke-width="1" fill="none"/>
  <path d="M100 38 C80 40 68 60 70 88 C72 104 84 116 100 118 C116 116 128 104 130 88 C132 60 120 40 100 38 Z" fill="#020409"/>
  ${armor}<g filter="url(#${id}g)" class="av-eyes"><path d="M83 85 L96 89 L95 93 L86 91 Z" fill="${color}"/><path d="M117 85 L104 89 L105 93 L114 91 Z" fill="${color}"/></g>${parts}</svg>`;
}
function dgFx(k) {
  const el = document.querySelector(`[data-dg="${k}"]`); if (!el) return;
  el.classList.remove('clearing'); void el.offsetWidth; el.classList.add('clearing');
  setTimeout(() => el.classList.remove('clearing'), 1400);
}
function portalSVG(key, color, st, glyph) {
  const id = 'pg' + key;
  const parts = [[-30, -26, 0], [28, -30, .7], [32, 22, 1.4], [-26, 30, 2.1], [0, -38, 1.05], [-38, 4, 1.75]]
    .map(([x, y, dl]) => `<circle class="pg-p" cx="40" cy="40" r="1.7" fill="${color}" style="--x:${x}px;--y:${y}px;animation-delay:${dl}s"/>`).join('');
  const arm = `<path d="M40 40 C46 36 54 38 56 46 C58 54 52 62 44 64" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
  const chains = st === 'sealed' ? `<g class="pg-chains"><path d="M10 14 L70 66" stroke="#6b5a64" stroke-width="5" stroke-dasharray="7 3" stroke-linecap="round"/><path d="M70 14 L10 66" stroke="#6b5a64" stroke-width="5" stroke-dasharray="7 3" stroke-linecap="round"/><path d="M10 14 L70 66 M70 14 L10 66" stroke="#a8939f" stroke-width="1.2" stroke-dasharray="7 3"/><rect x="31" y="34" width="18" height="15" rx="2.5" fill="#1a0d13" stroke="${color}" stroke-width="1.6"/><path d="M35 34 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${color}" stroke-width="1.6"/><circle class="pg-lockeye" cx="40" cy="41" r="2" fill="${color}"/></g>` : '';
  const bolt = st === 'open' ? `<path class="pg-bolt" d="M44 12 L36 30 L44 32 L34 52" fill="none" stroke="#ffd0d9" stroke-width="1.6" stroke-linejoin="round"/>` : '';
  const done = st === 'done' || st === 'slain';
  return `<svg class="portal pg ${st}" viewBox="0 0 80 80" aria-hidden="true"><defs>
  <radialGradient id="${id}c"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#04060c"/><stop offset=".82" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity=".95"/></radialGradient>
  <radialGradient id="${id}h"><stop offset=".45" stop-color="${color}" stop-opacity=".55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
  <clipPath id="${id}k"><ellipse cx="40" cy="40" rx="25" ry="29"/></clipPath></defs>
  <circle class="pg-halo" cx="40" cy="40" r="39" fill="url(#${id}h)"/>
  <g class="pg-runes"><ellipse cx="40" cy="40" rx="34" ry="37.5" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="3 6 12 6"/><path d="M40 1.5 l2.5 4 -2.5 4 -2.5 -4z M40 70.5 l2.5 4 -2.5 4 -2.5 -4z M5 40 l4 -2.5 4 2.5 -4 2.5z M67 40 l4 -2.5 4 2.5 -4 2.5z" fill="${color}"/></g>
  <ellipse cx="40" cy="40" rx="27" ry="31" fill="url(#${id}c)"/>
  <ellipse class="pg-rim" cx="40" cy="40" rx="27" ry="31" fill="none" stroke="${color}" stroke-width="2"/>
  <g clip-path="url(#${id}k)">${done ? '' : `<g class="pg-vortex">${arm}<g transform="rotate(120 40 40)">${arm}</g><g transform="rotate(240 40 40)">${arm}</g></g><ellipse class="pg-inner" cx="40" cy="40" rx="15" ry="18" fill="none" stroke="${color}" stroke-opacity=".6" stroke-width="1.3" stroke-dasharray="3 5"/>`}
  <g class="pg-glyph" fill="none" stroke="${done ? '#4ade80' : color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${done ? (st === 'slain' ? DG_GLYPH[3] : '<path d="M30 41 l7 7 14-15"/>') : glyph}</g>
  <circle class="pg-eye" cx="40" cy="40" r="4" fill="${color}"/></g>
  ${done ? '' : parts}${chains}${bolt}</svg>`;
}
const DG_GLYPH = [
  '<path d="M29 40 h22 M27 34 v12 M24 36 v8 M53 34 v12 M56 36 v8"/>',
  '<path d="M43 28 L34 42 h8 l-4 12 L48 38 h-8 z"/>',
  '<path d="M40 28 l10 4 v7 c0 7-4 11-10 14 c-6-3-10-7-10-14 v-7 z"/>',
  '<path d="M29 48 l-2 -16 l7 7 l6 -10 l6 10 l7 -7 l-2 16 z"/>'
];
const DG_COLORS = ['#8fb0dd', '#2dd4bf', '#a78bfa'];
const CRACKS = `<svg class="cracks" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#ff2d55" stroke-width="2" opacity=".55"><path d="M0 120 L60 142 L92 200 L150 212 L172 284 L230 300"/><path d="M92 200 L58 262 L82 324"/><path d="M400 300 L342 322 L318 382 L262 402 L250 470 L198 500"/><path d="M318 382 L362 432 L352 480"/><path d="M60 800 L92 722 L150 702 L162 642 L222 612"/><path d="M400 650 L352 642 L312 692 L300 762"/><path d="M0 520 L40 540 L46 600"/></g></svg>`;
let ASSETS = {};
function applyAssets() {
  const r = document.documentElement.style;
  [['avatar', '--avimg'], ['bg', '--bgimg'], ['lvl', '--lvlimg']].forEach(([k, v]) => ASSETS[k] ? r.setProperty(v, `url(${ASSETS[k]})`) : r.removeProperty(v));
}
const avatarHtml = () => ASSETS.avatar ? `<div class="av-photo" style="--rc:${RANKS[rankI()].c}"></div>` : avatarSVG(rankI(), RANKS[rankI()].c);

/* janelas do sistema (pop-ups) */
const POPQ = [];
let PEN_SHOWN = false;
function penaltyReminder() {
  if (PEN_SHOWN || !S.profile || POPQ.length) return;
  const q = S.sys.quests[dkey()];
  if (q && q.pen && !q.done) { PEN_SHOWN = true; sysPop('msg', { red: true, timer: true, h: 'Penalidade', msg: 'Zona de Penalidade ativa.', sub: 'A missão reforçada ainda não foi cumprida. Se o tempo acabar, você perde 100 XP.', btn: 'Entendido' }); }
}
function sysPop(kind, data) { POPQ.push({ kind, data }); if (POPQ.length === 1) showPop(); }
function showPop() {
  const p = POPQ[0]; if (!p) return;
  const d = p.data; let html = '';
  const fx = (color, n = 34) => `<div class="pop-rays" style="--rc:${color}"></div><div class="pop-flash" style="--rc:${color}"></div>${Array.from({ length: n }, () => { const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 260; return `<i class="particle" style="--dx:${(Math.cos(a) * r).toFixed(0)}px;--dy:${(Math.sin(a) * r).toFixed(0)}px;--pc:${color};animation-delay:${(Math.random() * .25).toFixed(2)}s"></i>`; }).join('')}`;
  if (p.kind === 'levelup') html = `${fx('#5ab8ff')}<div class="sys"><i class="scan"></i><span class="sys-h">Sistema</span><div class="sys-msg">Você subiu de nível!</div><div class="big-n" id="popN">${d.from || d.lvl - 1}</div><div class="xs up mut">Nível</div>${ASSETS.lvl ? '<div class="pop-img"></div>' : ''}${d.pts ? `<div class="tag acc" style="margin-top:12px">+${d.pts} pontos de atributo</div>` : ''}${d.locked ? `<p class="small" style="color:#f5c542;margin:14px 0 0">Nível máximo do Rank ${d.R.r}. O Exame de Promoção para o Rank ${d.next.r} está disponível.</p>` : ''}<div style="height:18px"></div><button class="btn pri block" data-a="popClose">Continuar</button></div>`;
  if (p.kind === 'rankup') html = `${fx(d.c, 48)}<div class="sys" style="border-color:${d.c}"><i class="scan"></i><span class="sys-h">Promoção</span><div class="sys-msg">Avaliação concluída. Novo rank atribuído.</div><div class="rank-spin" style="width:170px;margin:10px auto 0;position:relative">${avatarSVG(RANKS.indexOf(d), d.c, 'evolve')}<div class="rank-wrap" style="--rc:${d.c};position:absolute;right:-4px;bottom:4px"><div class="rank-badge"><span>${d.r}</span></div></div></div><h1>Rank ${d.r}</h1><div class="mut">${d.t} · nova classe: <b style="color:${d.c}">${className(RANKS.indexOf(d))}</b></div><div class="small" style="margin-top:12px;color:#cfe8ff">Nova missão diária: ${d.q[0]} flexões, abdominais e agachamentos + ${d.q[3]} min de cardio.</div><div style="height:18px"></div><button class="btn pri block" data-a="popClose">Aceitar</button></div>`;
  if (p.kind === 'msg') html = `${d.red ? CRACKS : ''}<div class="sys ${d.red ? 'red' : ''}"><i class="scan"></i><span class="sys-h">${d.red ? '<span class="bang">!</span> ' : ''}${d.h || 'Sistema'}</span><div class="sys-msg" style="font-size:1.2667rem">${d.msg}</div>${d.timer ? `<div class="pop-timer" id="popTimer">${mmss(secsToMidnight())}</div>` : ''}${d.sub ? `<p class="small" style="margin:12px 0 0;color:#b8c6dc">${d.sub}</p>` : ''}<div style="height:18px"></div><button class="btn ${d.red ? 'danger' : 'pri'} block" data-a="popClose">${d.btn || 'Entendido'}</button></div>`;
  let el = $('#sysPop'); if (!el) { el = document.createElement('div'); el.id = 'sysPop'; document.body.appendChild(el); }
  el.className = 'sys-pop' + (p.kind === 'msg' && d.red ? ' red' : ''); el.innerHTML = html;
  if (p.kind === 'levelup') {
    const n = $('#popN'), from = d.from || d.lvl - 1, to = d.lvl, t0 = performance.now();
    const step = t => { const k = clamp((t - t0 - 350) / 700, 0, 1); if (n) n.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if (S.settings.vibrate && navigator.vibrate) navigator.vibrate(p.kind === 'msg' ? (d.red ? [300, 100, 300] : 60) : [80, 60, 80, 60, 200]);
  playSound(p.kind === 'levelup' ? 'level' : p.kind === 'rankup' ? 'rank' : d.red ? 'pen' : (d.snd || 'notify'));
}

/* ---------- motor de sons do FOCO (sintetizados, funcionam offline) ---------- */
const SOUNDS = [['notify', 'Notificação do Sistema'], ['xp', 'Recompensa de XP'], ['rest', 'Fim do descanso'], ['quest', 'Missão cumprida'], ['level', 'Level up'], ['rank', 'Promoção de rank'], ['pen', 'Alerta de penalidade']];
const SND = { M: null, R: null, buf: {} };
function audioInit() {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  if (SND.M) return;
  const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(actx.destination);
  SND.M = actx.createGain(); SND.M.gain.value = .8; SND.M.connect(comp);
  SND.R = actx.createConvolver();
  const len = actx.sampleRate * 2.2, b = actx.createBuffer(2, len, actx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  SND.R.buffer = b; const rg = actx.createGain(); rg.gain.value = .35; SND.R.connect(rg).connect(SND.M);
}
const SY = {
  out(node, wet = .4) { node.connect(SND.M); const w = actx.createGain(); w.gain.value = wet; node.connect(w).connect(SND.R); },
  env(g, t, a, peak, dec) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + dec); },
  bell(f, t, vol = .25, dec = 1.4, wet = .5) { const c = actx.createOscillator(), m = actx.createOscillator(), mg = actx.createGain(), g = actx.createGain(); c.frequency.value = f; m.frequency.value = f * 3.51; mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * .05, t + dec); m.connect(mg).connect(c.frequency); c.connect(g); SY.env(g, t, .004, vol, dec); SY.out(g, wet); c.start(t); m.start(t); c.stop(t + dec + .1); m.stop(t + dec + .1); },
  noise(t, dur, f0, f1, vol = .3, type = 'bandpass', q = 1.2, wet = .4) { const len = Math.ceil(actx.sampleRate * dur), b = actx.createBuffer(1, len, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; const s = actx.createBufferSource(); s.buffer = b; const fl = actx.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); const g = actx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .75); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(fl).connect(g); SY.out(g, wet); s.start(t); s.stop(t + dur); },
  hit(t, vol = .35) { const len = Math.ceil(actx.sampleRate * .25), b = actx.createBuffer(1, len, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6); const s = actx.createBufferSource(); s.buffer = b; const fl = actx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2500; const g = actx.createGain(); g.gain.value = vol; s.connect(fl).connect(g); SY.out(g, .6); s.start(t); },
  sub(t, f0, f1, dur, vol = .6) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); SY.env(g, t, .01, vol, dur); o.connect(g); SY.out(g, .15); o.start(t); o.stop(t + dur + .05); },
  pad(freqs, t, dur, vol = .12, open = 3000, wet = .6) { const fl = actx.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(open, t + dur * .35); fl.frequency.exponentialRampToValueAtTime(500, t + dur); const g = actx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + dur); fl.connect(g); SY.out(g, wet); freqs.forEach(f => [-7, 0, 7].forEach(dt => { const o = actx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(fl); o.start(t); o.stop(t + dur + .05); })); },
  tick(t, f = 1500, vol = .4) { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .55, t + .05); SY.env(g, t, .002, vol, .12); o.connect(g); SY.out(g, .2); o.start(t); o.stop(t + .2); SY.hit(t, .08); },
  dist(t, f, dur, vol = .25) { const o = actx.createOscillator(); o.type = 'square'; o.frequency.value = f; const ws = actx.createWaveShaper(), cv = new Float32Array(256); for (let i = 0; i < 256; i++) cv[i] = Math.tanh((i / 128 - 1) * 4); ws.curve = cv; const fl = actx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 900; const g = actx.createGain(); SY.env(g, t, .01, vol, dur); o.connect(ws).connect(fl).connect(g); SY.out(g, .35); o.start(t); o.stop(t + dur + .05); },
};
const SYNTH = {
  set: t => { SY.tick(t, 1900, .18); SY.bell(1568, t + .01, .07, .35, .15); },
  notify: t => { SY.noise(t, .08, 6000, 9000, .06, 'highpass', .7, .2); SY.bell(1318.5, t + .01, .22, 1.2); SY.bell(1975.5, t + .13, .18, 1.6); },
  xp: t => { SY.noise(t, .35, 2000, 12000, .05, 'bandpass', 2, .5); [1046.5, 1318.5, 1568, 2093].forEach((f, i) => SY.bell(f, t + i * .055, .12, .9, .6)); },
  rest: t => { [0, .32, .64].forEach((o, i) => SY.tick(t + o, i === 2 ? 2000 : 1500, .45)); },
  quest: t => { SY.pad([261.6, 329.6, 392, 493.9], t, 1.6, .09, 2600); SY.bell(1046.5, t + .02, .2, 1.8); SY.bell(1568, t + .18, .14, 1.8); SY.sub(t, 110, 80, .5, .35); },
  level: t => { SY.noise(t, .7, 250, 7000, .22, 'bandpass', 1.4, .5); const h = t + .62; SY.hit(h, .4); SY.sub(h, 95, 42, .9, .75); SY.pad([220, 277.2, 329.6, 415.3, 493.9], h, 2.2, .11, 3500); [880, 1108.7, 1318.5, 1760].forEach((f, i) => SY.bell(f, h + .05 + i * .07, .14, 1.6, .7)); },
  rank: t => { SY.noise(t, 1.3, 120, 9000, .25, 'bandpass', 1.6, .6); SY.sub(t, 40, 80, 1.25, .25); const h = t + 1.25; SY.hit(h, .55); SY.sub(h, 70, 32, 1.4, .9); SY.pad([146.8, 220, 293.7, 370, 440, 587.3], h, 3.2, .12, 4200, .8); [1174.7, 1480, 1760, 2349.3].forEach((f, i) => SY.bell(f, h + .15 + i * .1, .13, 2.2, .8)); },
  gate: t => { SY.noise(t, .55, 300, 5000, .2, 'bandpass', 1.5, .5); SY.sub(t + .45, 140, 38, .7, .7); SY.hit(t + .47, .45); SY.bell(1318.5, t + .5, .14, 1.6, .7); SY.bell(1975.5, t + .62, .1, 1.8, .7); },
  chains: t => { [0, .07, .16, .22, .31].forEach((o, i) => { SY.tick(t + o, 2400 - i * 180, .25); SY.noise(t + o, .12, 3000, 1500, .08, 'bandpass', 3, .3); }); SY.sub(t + .35, 70, 30, 1, .7); SY.dist(t + .35, 41, .8, .18); },
  pen: t => { SY.dist(t, 55, .45, .3); SY.dist(t, 77.8, .45, .12); SY.dist(t + .55, 55, .6, .32); SY.dist(t + .55, 77.8, .6, .14); SY.noise(t, .9, 400, 150, .08, 'lowpass', .7, .3); },
};
async function customBuffer(key) {
  const data = ASSETS['snd-' + key]; if (!data) return null;
  if (SND.buf[key] && SND.buf[key].src === data) return SND.buf[key].b;
  const ab = await (await fetch(data)).arrayBuffer();
  const b = await new Promise((res, rej) => actx.decodeAudioData(ab, res, rej));
  SND.buf[key] = { src: data, b }; return b;
}
async function playSound(key, force = false) {
  if (!S.settings.sound && !force) return;
  try {
    audioInit();
    const b = await customBuffer(key).catch(() => null);
    if (b) { const s = actx.createBufferSource(), g = actx.createGain(); g.gain.value = .9; s.buffer = b; s.connect(g).connect(SND.M); s.start(); s.stop(actx.currentTime + 10); return; }
    SYNTH[key] && SYNTH[key](actx.currentTime + .02);
  } catch (e) { }
}
function checkAch() {
  if (!S.profile) return;
  const st = achStats(), newly = [];
  for (const a of ACH) if (!S.ach[a.id] && a.t(st)) { S.ach[a.id] = dkey(); newly.push(a); }
  if (newly.length) { save(); setTimeout(() => toast(`Conquista desbloqueada: ${newly[0].n}`, 'trophy'), 700); }
}

/* ---------- componentes ---------- */
/* animação do exercício (figura própria, ver exanim.js); vazio se o script não carregou */
function figHtml(ex, wrap = '', still = false) {
  if (!window.exFig) return wrap ? '' : ic('dumbbell');
  const svg = window.exFig(ex.id, ex.m, { still });
  return wrap ? `<div class="${wrap}">${svg}</div>` : svg;
}
function ring(pct, size, sw, color, inner) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct || 0, 0, 1));
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="#1a2436" stroke-width="${sw}" fill="none"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" style="stroke:${color};transition:stroke-dashoffset .5s" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="in">${inner}</div></div>`;
}
function bar(label, v, goal, cls = '', unit = 'g', dec = 0) {
  return `<div class="macro"><div class="row between"><span class="mut">${label}</span><span><b>${fmt(v, dec)}</b><span class="mut"> / ${fmt(goal, dec)} ${unit}</span></span></div><div class="progress ${cls}"><i style="width:${clamp(goal ? v / goal * 100 : 0, 0, 100)}%"></i></div></div>`;
}
function lineChart(pts, { h = 150, color = 'var(--acc)', unit = '' } = {}) {
  if (pts.length < 2) return `<div class="empty small">${ic('chart')}<div>Registre pelo menos 2 valores para ver o gráfico.</div></div>`;
  const W = 320, H = h, pl = 34, pr = 12, pt = 12, pb = 22, ys = pts.map(p => p.y);
  let mn = Math.min(...ys), mx = Math.max(...ys);
  if (mn === mx) { mn -= 1; mx += 1; }
  const pv = (mx - mn) * 0.15; mn -= pv; mx += pv;
  const X = i => pl + (W - pl - pr) * (i / (pts.length - 1)), Y = v => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const gid = 'g' + uid();
  let grid = '';
  for (let i = 0; i < 3; i++) { const v = mn + (mx - mn) * (i / 2), y = Y(v); grid += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#1e2a40" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 3}" text-anchor="end">${fmt(v, 1)}</text>`; }
  const li = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  const xl = li.map(i => `<text x="${X(i)}" y="${H - 5}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">${esc(pts[i].x)}</text>`).join('');
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${color};stop-opacity:.35"/><stop offset="1" style="stop-color:${color};stop-opacity:0"/></linearGradient></defs>${grid}<path d="${d}L${X(pts.length - 1)},${H - pb}L${X(0)},${H - pb}Z" fill="url(#${gid})"/><path d="${d}" fill="none" style="stroke:${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="${i === pts.length - 1 ? 4.5 : 2.5}" style="fill:${i === pts.length - 1 ? color : '#0c111c'};stroke:${color}" stroke-width="2"/>`).join('')}<text x="${X(pts.length - 1) - 6}" y="${Y(last.y) - 9}" text-anchor="end" style="fill:#f3f3f1;font-weight:700;font-size:0.7333rem">${fmt(last.y, 1)}${unit}</text>${xl}</svg>`;
}
const toggle = (on, a, extra = '') => `<button class="toggle ${on ? 'on' : ''}" data-a="${a}" ${extra}></button>`;
const empty = (icn, txt) => `<div class="empty">${ic(icn)}<div>${txt}</div></div>`;

/* ---------- sheet / toast / confirmação ---------- */
/* molas no estilo Apple: damping ratio (1 = sem quicar) + response (s) */
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function spring(from, to, { response = .35, damping = 1, velocity = 0, onUpdate, onDone } = {}) {
  const k = Math.pow(2 * Math.PI / response, 2), c = 4 * Math.PI * damping / response;
  let x = from, v = velocity, last = performance.now(), raf = 0, stopped = false;
  const step = now => {
    if (stopped) return;
    const dt = Math.min(.064, Math.max(0, (now - last) / 1000)); last = now;
    const n = Math.max(1, Math.ceil(dt / .004)), h = dt / n;
    for (let i = 0; i < n; i++) { v += (-k * (x - to) - c * v) * h; x += v * h; }
    if (Math.abs(x - to) < .5 && Math.abs(v) < 10) { onUpdate(to, 0); onDone && onDone(); return; }
    onUpdate(x, v); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return { stop() { stopped = true; cancelAnimationFrame(raf); } };
}
const rubber = (o, d, c = .55) => (o * d * c) / (d + c * Math.abs(o));
const project = (v, d = .998) => (v / 1000) * d / (1 - d);

/* folha de baixo: sobe e desce pelo mesmo caminho, arrastável e interrompível */
const SH = { y: 0, v: 0, anim: null, state: 'closed' };
const shH = () => $('#sheet').offsetHeight || innerHeight;
function shSet(y) { SH.y = y; $('#sheet').style.transform = `translate3d(0,${y}px,0)`; $('.sheet-bg').style.opacity = clamp(1 - Math.max(0, y) / shH(), 0, 1); }
function shAnimate(to, opts = {}, done) {
  if (SH.anim) SH.anim.stop();
  SH.anim = null;
  if (RM() || document.hidden) { SH.v = 0; shSet(to); done && done(); return; }
  SH.anim = spring(SH.y, to, { response: .32, damping: 1, velocity: SH.v, ...opts, onUpdate: (x, v) => { SH.v = v; shSet(x); }, onDone: () => { SH.anim = null; SH.v = 0; done && done(); } });
}
function openSheet(html) {
  const sh = $('#sheet');
  sh.innerHTML = '<div class="grab" data-drag></div>' + html;
  labelIcons(sh);
  if (SH.state === 'open') return;
  if (SH.state === 'closed') { $('#sheetWrap').classList.remove('hidden'); sh.scrollTop = 0; SH.v = 0; shSet(shH()); }
  SH.state = 'open';
  shAnimate(0);
}
function closeSheet() {
  PICK = null;
  if (SH.state !== 'open') return;
  SH.state = 'closing';
  shAnimate(shH() + 24, {}, () => { if (SH.state !== 'closing') return; SH.state = 'closed'; $('#sheetWrap').classList.add('hidden'); $('#sheet').innerHTML = ''; });
}
(() => {
  const sh = $('#sheet'); let d = null;
  sh.addEventListener('pointerdown', e => {
    if (SH.state !== 'open' || e.button > 0) return;
    if (!e.target.closest('[data-drag], .sheet-h') || e.target.closest('button, input, select, textarea')) return;
    d = { id: e.pointerId, y0: e.clientY, s0: SH.y, on: false, hist: [[e.timeStamp, e.clientY]] };
  });
  sh.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    if (!d.on) {
      if (Math.abs(e.clientY - d.y0) < 6) return;
      d.on = true; try { sh.setPointerCapture(e.pointerId); } catch (er) { }
      if (SH.anim) SH.anim.stop(); SH.anim = null; d.s0 = SH.y; d.y0 = e.clientY;
    }
    const raw = d.s0 + (e.clientY - d.y0);
    shSet(raw < 0 ? rubber(raw, shH()) : raw);
    d.hist.push([e.timeStamp, e.clientY]); if (d.hist.length > 6) d.hist.shift();
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const g = d; d = null; if (!g.on) return;
    const a = g.hist[0], b = g.hist[g.hist.length - 1], dt = (b[0] - a[0]) / 1000;
    const v = dt > 0 && e.timeStamp - b[0] < 100 ? (b[1] - a[1]) / dt : 0;
    SH.v = v;
    if (e.type !== 'pointercancel' && SH.y + project(v) > shH() * .5) closeSheet();
    else shAnimate(0, { damping: Math.abs(v) > 300 ? .8 : 1, response: .3 });
  };
  sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
})();
document.addEventListener('touchstart', () => { }, { passive: true }); /* liga o :active no iPhone */
const sheetHead = (t, sub = '') => `<div class="sheet-h"><div class="grow"><h2>${t}</h2>${sub ? `<div class="small mut" style="margin-top:4px">${sub}</div>` : ''}</div><button class="icon-btn sm" data-a="closeSheet">${ic('x')}</button></div>`;
let toastT;
let UNDO = null;
function toastUndo(msg, restore) {
  toast(msg, 'trash', 'Removido');
  UNDO = restore;
  const t = $('#toast');
  t.insertAdjacentHTML('beforeend', '<button class="toast-undo" data-a="undo">Desfazer</button>');
  clearTimeout(toastT); toastT = setTimeout(() => { t.classList.remove('show'); UNDO = null; }, 5000);
}
function toast(msg, icn = 'check', label) {
  UNDO = null;
  const t = $('#toast');
  const L = label || (icn === 'info' || icn === 'lock' ? 'Alerta' : ['zap', 'trophy', 'medal', 'droplet'].includes(icn) ? 'Recompensa' : 'Sistema');
  t.innerHTML = `<span class="bang">!</span><div><div class="tl">[ ${L} ]</div><div>${esc(msg)}</div></div>`;
  if (L === 'Recompensa' && !POPQ.length) playSound('xp'); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function confirmSheet(title, msg, yes, fn, danger = false) {
  PENDING = fn;
  openSheet(`${sheetHead(title)}<p class="mut" style="margin:0 0 20px">${msg}</p><div class="stack"><button class="btn block ${danger ? 'danger' : 'pri'}" data-a="confirmYes">${yes}</button><button class="btn block ghost" data-a="closeSheet">Cancelar</button></div>`);
}

/* ---------- navegação ---------- */
const route = () => (location.hash || '#home').slice(1);
function go(r) { if (route() === r) render(); else location.hash = r; }
window.addEventListener('hashchange', render);

function render() {
  let r = route();
  if (!S.profile) { document.body.classList.add('no-tabs'); paint(screenOnboarding()); return; }
  sysRollover();
  if (r === 'workout' && !S.active) r = 'home';
  const noTabs = r === 'workout';
  document.body.classList.toggle('no-tabs', noTabs);
  const screens = { home: screenHome, treino: screenTreino, nutri: screenNutri, corpo: screenCorpo, perfil: screenPerfil, workout: screenWorkout };
  paint((screens[r] || screenHome)() + (noTabs ? '' : tabbar(r)));
  if (r !== lastRoute) { window.scrollTo(0, 0); lastRoute = r; }
}
/* Atualiza só o que mudou: os elementos continuam os mesmos, então as transições
   de largura/anel animam do valor atual até o novo (em vez de saltar). */
function paint(html) {
  if (!window.morphdom) app.innerHTML = html;
  else {
    const next = document.createElement('div'); next.innerHTML = html;
    labelIcons(next);
    morphdom(app, next, { childrenOnly: true, onBeforeElUpdated: (from, to) => !from.isEqualNode(to) });
  }
  labelIcons(app);
}
function tabbar(r) {
  const t = [['home', 'shield', 'Status'], ['treino', 'dumbbell', 'Treino'], ['nutri', 'utensils', 'Nutrição'], ['corpo', 'body', 'Corpo'], ['perfil', 'user', 'Perfil']];
  return `<div class="tabs"><nav>${t.map(([k, i, l]) => `<a href="#${k}" class="${r === k ? 'on' : ''}">${ic(i)}<span>${l}</span></a>`).join('')}</nav></div>`;
}

/* =====================================================================
   ONBOARDING
   ===================================================================== */
const OB_STEPS = 8;
function optList(key, src, cur) {
  return Object.entries(src).map(([k, o]) => `<button class="opt ${cur === k ? 'on' : ''}" data-a="obPick" data-k="${key}" data-v="${k}"><div class="oi">${ic(o.ic)}</div><div><b>${o.n}</b><span class="small mut">${o.d}</span></div></button>`).join('');
}
function daysPicker(sel, a) { return `<div class="days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="${sel.includes(d) ? 'on' : ''}" data-a="${a}" data-v="${d}">${WD[d]}</button>`).join('')}</div>`; }
function screenOnboarding() {
  const s = OB.step, d = OB.d;
  if (s === 0) return `<div class="welcome"><div class="stripes"></div><div class="sys" style="margin-bottom:26px"><span class="sys-h">Sistema</span><div class="sys-msg center">Novo caçador detectado.<br>Deseja iniciar a avaliação?</div></div><div class="big">FOC<span>O</span></div><p>Cumpra missões diárias, treine pesado e suba do Rank E ao Rank S. O Sistema registra cada repetição.</p><button class="btn pri block" data-a="obNext">Aceitar ${ic('chevR')}</button><div class="xs dim center" style="margin-top:14px">Seus dados ficam só neste aparelho.</div></div>`;
  let body = '', title = '', lead = '';
  if (s === 1) { title = 'Quem é você?'; lead = 'Vamos montar tudo sob medida.'; body = `<div class="field"><label>Seu nome</label><input class="inp" data-in="ob" data-k="name" value="${esc(d.name)}" placeholder="Como quer ser chamado" autocomplete="given-name"></div><div class="field"><label>Idade</label><div class="inp-unit"><input class="inp" type="number" inputmode="numeric" data-in="ob" data-k="age" value="${esc(d.age)}"><span>anos</span></div></div>`; }
  if (s === 2) { title = 'Seu corpo hoje'; lead = 'Base para calcular calorias, proteína e água.'; body = `<div class="grid2"><div class="field"><label>Peso atual</label><div class="inp-unit"><input class="inp" type="number" inputmode="decimal" step="0.1" data-in="ob" data-k="weight" value="${esc(d.weight)}"><span>kg</span></div></div><div class="field"><label>Altura</label><div class="inp-unit"><input class="inp" type="number" inputmode="numeric" data-in="ob" data-k="height" value="${esc(d.height)}"><span>cm</span></div></div></div><div class="field"><label>Peso-meta</label><div class="inp-unit"><input class="inp" type="number" inputmode="decimal" step="0.1" data-in="ob" data-k="goalWeight" value="${esc(d.goalWeight)}"><span>kg</span></div></div>`; }
  if (s === 3) { title = 'Qual é o foco?'; lead = 'Isso define treino, calorias e intensidade. Dá pra mudar depois.'; body = optList('focus', FOCUS, d.focus); }
  if (s === 4) { title = 'Onde você treina?'; lead = 'Os exercícios vão usar só o que você tem.'; body = optList('location', LOCATION, d.location); }
  if (s === 5) { title = 'Seu nível'; lead = 'Ajusta volume e número de exercícios.'; body = optList('level', LEVEL, d.level); }
  if (s === 6) { title = 'Dias de treino'; lead = 'Escolha de 2 a 6 dias. A divisão do treino se adapta.'; body = daysPicker(d.weekdays, 'obDay') + `<div class="card" style="margin-top:18px"><div class="row">${ic('info')}<div class="small mut">${d.weekdays.length} dias por semana → ${{ 2: 'Corpo inteiro A/B', 3: 'Corpo inteiro A/B/C', 4: 'Superiores / Inferiores', 5: 'Empurrar / Puxar / Pernas + Sup / Inf', 6: 'Empurrar / Puxar / Pernas 2×' }[d.weekdays.length] || 'escolha de 2 a 6 dias'}</div></div></div>`; }
  if (s === 7) {
    const p = obProfile(), t = targets(p, p.weight), plan = genPlan(p);
    title = `Pronto, ${esc(p.name)}.`; lead = 'Seu plano inicial está montado.';
    body = `<div class="card hero"><div class="xs up acc">Metas diárias</div><div class="grid2" style="margin-top:12px"><div class="stat"><div class="v">${fmt(t.kcal)}</div><div class="l">kcal</div></div><div class="stat"><div class="v">${t.prot}g</div><div class="l">proteína</div></div><div class="stat"><div class="v">${t.carb}g</div><div class="l">carboidrato</div></div><div class="stat"><div class="v">${fmt(t.water / 1000, 2)}L</div><div class="l">água</div></div></div></div>
    <div class="card"><div class="xs up acc" style="margin-bottom:6px">Plano de treino · ${FOCUS[p.focus].n}</div>${plan.days.map(dd => `<div class="li"><div class="lic">${dd.letter}</div><div class="grow"><div class="lt">${dd.name}</div><div class="ls">${dd.items.length} exercícios · ~${estMin(dd.items)} min</div></div></div>`).join('')}</div>`;
  }
  return `<div class="ob"><div class="ob-top"><button class="icon-btn sm" data-a="obBack">${ic('chevL')}</button><div class="ob-bar"><i style="width:${s / (OB_STEPS - 1) * 100}%"></i></div><span class="xs dim">${s}/${OB_STEPS - 1}</span></div><div class="ob-body"><h1>${title}</h1><p class="lead">${lead}</p>${body}</div><div class="ob-foot"><button class="btn pri block" data-a="${s === 7 ? 'obFinish' : 'obNext'}">${s === 7 ? 'Iniciar o Sistema' : 'Continuar'} ${ic('chevR')}</button></div></div>`;
}
function obProfile() {
  const d = OB.d;
  return { name: d.name.trim(), age: num(d.age), weight: num(d.weight), height: num(d.height), goalWeight: num(d.goalWeight) || num(d.weight), focus: d.focus, location: d.location, level: d.level, weekdays: [...d.weekdays].sort() };
}
function obValidate() {
  const d = OB.d, s = OB.step;
  if (s === 1) { if (!d.name.trim()) return 'Digite seu nome'; if (num(d.age) < 12 || num(d.age) > 99) return 'Idade inválida'; }
  if (s === 2) { if (num(d.weight) < 30 || num(d.weight) > 300) return 'Peso inválido'; if (num(d.height) < 120 || num(d.height) > 230) return 'Altura inválida (em cm)'; }
  if (s === 3 && !d.focus) return 'Escolha um foco';
  if (s === 4 && !d.location) return 'Escolha onde treina';
  if (s === 5 && !d.level) return 'Escolha seu nível';
  if (s === 6 && (d.weekdays.length < 2 || d.weekdays.length > 6)) return 'Escolha de 2 a 6 dias';
  return null;
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function screenHome() {
  const p = S.profile, t = targets(), k = dkey(), tot = dayTotals(k), water = S.water[k] || 0, streak = calcStreak();
  const nd = S.plan.days.length, nx = nd ? S.plan.nextIdx % nd : 0, day = S.plan.days[nx];
  const trained = S.sessions.filter(s => s.date === k), isTrain = p.weekdays.includes(new Date().getDay());
  const h = new Date().getHours(), hi = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  let wo;
  if (S.active) wo = `<div class="card hero wo-card"><span class="tag acc">${ic('timer')} Em andamento</span><div class="bigname">${esc(S.active.name)}</div><div class="meta-row"><span>${ic('clock')} <b id="homeClock">${mmss((Date.now() - S.active.start) / 1000)}</b></span><span>${ic('list')} ${doneSets(S.active)}/${totalSets(S.active)} séries</span></div><button class="btn pri block" data-a="go" data-r="workout">${ic('play')} Continuar treino</button></div>`;
  else if (trained.length) { const s = trained[trained.length - 1]; wo = `<div class="card hero wo-card"><span class="tag ok">${ic('check')} Treino concluído</span><div class="bigname">${esc(s.name)}</div><div class="meta-row"><span>${ic('clock')} ${Math.max(1, Math.round(s.dur / 60))} min</span><span>${ic('dumbbell')} ${fmt(s.volume)} kg</span>${s.prs.length ? `<span class="acc">${ic('trophy')} ${s.prs.length} recorde${s.prs.length > 1 ? 's' : ''}</span>` : ''}</div><div class="small mut">Missão cumprida. Agora é comida, água e sono.${day ? ` Próximo: <b>Treino ${day.letter}</b>.` : ''}</div></div>`; }
  else if (day && isTrain) wo = `<div class="card hero wo-card"><span class="tag acc">${ic('zap')} Treino de hoje</span><div class="bigname">Treino ${day.letter}</div><div class="mut">${esc(day.name)}</div><div class="meta-row"><span>${ic('list')} ${day.items.length} exercícios</span><span>${ic('clock')} ~${estMin(day.items)} min</span></div><div class="row"><button class="btn pri grow" data-a="startWk" data-k="plan" data-i="${nx}">${ic('play')} Começar</button><button class="btn" data-a="openWk" data-k="plan" data-i="${nx}">Ver</button></div></div>`;
  else wo = `<div class="card wo-card"><span class="tag">${ic('moon')} Descanso</span><div class="bigname">Dia de recuperação</div><div class="mut small">Músculo cresce no descanso. Capricha na proteína e no sono.</div>${day ? `<div style="height:14px"></div><button class="btn block" data-a="startWk" data-k="plan" data-i="${nx}">Treinar mesmo assim · Treino ${day.letter}</button>` : ''}</div>`;

  let week = '';
  for (let i = 6; i >= 0; i--) {
    const k2 = addDays(k, -i), wd = parseKey(k2).getDay(), tr = S.sessions.some(s => s.date === k2), act = !tr && dayActive(k2);
    week += `<div>${WD[wd].slice(0, 3)}<i class="${tr ? 'on' : ''} ${i === 0 ? 'today' : ''}" style="${act ? 'background:var(--accbg);color:var(--acc)' : ''}">${tr ? ic('check') : act ? ic('target') : ''}</i></div>`;
  }
  const hd = habitsDoneCount(k), ht = S.habits.list.length, sl = S.sleep[k] || 0;
  return `
  <div class="top"><div class="logo"><b></b>FOCO</div><div class="row"><span class="xs up mut">${WD[new Date().getDay()]}, ${dShort(k)}</span><button class="icon-btn" data-a="go" data-r="perfil">${ic('user')}</button></div></div>
  <div class="greet" style="margin-bottom:12px"><h1 style="font-size:2rem">${hi}, ${esc(p.name.split(' ')[0])}.</h1></div>
  <div class="quote">${QUOTES[dayOfYear() % QUOTES.length]}</div>
  ${statusMini()}
  ${wo}
  ${questWin()}
  <div class="card"><div class="row" style="gap:16px">${ring(tot.kcal / t.kcal, 100, 9, 'var(--acc)', `<div><div class="num" style="font-size:1.5333rem">${fmt(tot.kcal)}</div><div class="xs mut">/ ${fmt(t.kcal)} kcal</div></div>`)}<div class="grow">${bar('Proteína', tot.p, t.prot)}${bar('Água', water / 1000, t.water / 1000, 'blue', 'L', 2)}</div></div><div class="row" style="margin-top:12px"><button class="btn sm grow" data-a="water" data-v="250">${ic('droplet')} +250 ml</button><button class="btn sm grow" data-a="go" data-r="nutri">${ic('plus')} Refeição</button></div></div>
  <div class="card"><div class="card-h"><h3>${ic('target')} Hábitos diários</h3><span class="tag ${ht && hd === ht ? 'ok' : ''}">${hd}/${ht}</span></div>${ht ? S.habits.list.map(h => habitRow(h, k)).join('') : `<div class="small mut">Nenhum hábito ainda. Cada hábito cumprido vale +5 XP.</div><div style="height:10px"></div><button class="btn sm block" data-a="go" data-r="perfil">${ic('plus')} Adicionar hábitos no Perfil</button>`}</div>
  <div class="card tight"><div class="row between"><div class="row">${ic('moon')}<div><b>Sono</b><div class="small mut">Horas na noite passada</div></div></div><div class="row"><button class="icon-btn sm" data-a="sleep" data-v="-0.5">${ic('minus')}</button><span class="num" style="font-size:1.4667rem;min-width:54px;text-align:center">${sl ? fmt(sl, 1) + 'h' : '—'}</span><button class="icon-btn sm" data-a="sleep" data-v="0.5">${ic('plus')}</button></div></div></div>
  <div class="card"><div class="streak"><div class="fire">${ic('flame')}</div><div class="grow"><div class="num" style="font-size:2rem;line-height:1">${streak} ${streak === 1 ? 'dia' : 'dias'}</div><div class="small mut">Sequência · recorde ${Math.max(S.bestStreak, streak)}</div></div></div><div class="week">${week}</div><div class="xs dim" style="margin-top:10px">O dia conta quando você treina ou cumpre 3 itens da missão.</div></div>
  ${weekWin()}
  ${logWin()}`;
}
/* ficha compacta: o essencial à vista, a ficha completa a um toque */
function statusMini() {
  const si = sysInfo(), alerts = [];
  if (S.sys.pts) alerts.push(`<span class="tag acc">${S.sys.pts} ${S.sys.pts === 1 ? 'ponto' : 'pontos'} para distribuir</span>`);
  if (si.locked) alerts.push(`<span class="tag" style="color:#f5c542;background:rgba(245,197,66,.1)">Exame do Rank ${si.next.r} liberado</span>`);
  return `<div class="sys status st-mini" role="button" tabindex="0" data-a="statusFull" aria-label="Abrir ficha completa">
  <div class="av-mini">${avatarHtml()}</div>
  <div class="grow" style="min-width:0">
    <div class="row between"><b class="h ellipsis" style="font-size:1.2667rem">${esc(className())}</b><span class="num" style="font-size:1.0667rem;color:#9fd0ff">NV ${si.lvl}</span></div>
    <div class="xpbar ${si.full ? 'lock' : ''}" style="margin:8px 0 6px"><i style="width:${clamp(si.cur / si.need * 100, 0, 100)}%"></i></div>
    <div class="row between xs"><span class="mut">${si.full ? 'XP travado · faça o exame' : `${fmt(si.cur)} / ${fmt(si.need)} XP`}</span><span style="color:#f5c542">${fmt(S.sys.gold)} Ouro</span></div>
    ${alerts.length ? `<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">${alerts.join('')}</div>` : ''}
  </div>
  <div class="rank-wrap" style="--rc:${si.R.c}"><div class="rank-badge sm"><span>${si.R.r}</span></div></div>
  ${ic('chevR', 'mut')}</div>`;
}
function statusWin() {
  const si = sysInfo(), p = S.profile, a = attrs();
  const title = S.sys.title && S.ach[S.sys.title] ? ACH.find(x => x.id === S.sys.title) : null;
  return `<div class="sys status"><span class="sys-h">Ficha</span>
  <div class="ficha"><div class="av-box ${ASSETS.avatar ? '' : 'v-tap'}" ${ASSETS.avatar ? '' : 'role="button" tabindex="0" data-a="vulto" aria-label="Ver o golpe do seu caçador"'}>${avatarHtml()}<div class="rank-wrap" style="--rc:${si.R.c}"><div class="rank-badge sm"><span>${si.R.r}</span></div></div></div>
  <div style="min-width:0"><div class="frow"><b>Nome</b><span class="ellipsis">${esc(p.name)}</span></div><div class="frow"><b>Classe</b><span class="ellipsis">${className()}</span></div><div class="frow"><b>Título</b><span class="ellipsis">${esc(title ? title.n : si.R.t)}</span></div><div class="frow" style="border:0"><b>Nível</b><span class="num" style="font-size:1.8667rem;line-height:1">${si.lvl}</span></div></div></div>
  <div style="margin-top:14px"><div class="row between xs" style="margin-bottom:5px"><span class="up" style="color:#9fd0ff">XP</span><span class="mut">${si.full ? 'TRAVADO · faça o exame' : `${fmt(si.cur)} / ${fmt(si.need)}`}</span></div><div class="xpbar ${si.full ? 'lock' : ''}"><i style="width:${clamp(si.cur / si.need * 100, 0, 100)}%"></i></div></div>
  ${si.locked ? `<button class="btn block" style="margin-top:12px;border-color:#f5c542;color:#f5c542;background:rgba(245,197,66,.08)" data-a="exam">${ic('shield')} Exame de Promoção · Rank ${si.next.r}</button>` : si.next ? `<button class="xs dim" style="margin-top:8px" data-a="exam">Exame para o Rank ${si.next.r} no nível ${si.R.max} · ver requisitos ${ic('chevR')}</button>` : '<div class="xs center" style="margin-top:8px;color:#ff8ea3">Rank máximo alcançado.</div>'}
  <div class="row between" style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(90,170,255,.15)"><span class="row" style="gap:6px;color:#f5c542">${ic('medal')}<b class="num" style="font-size:1.3333rem">${fmt(S.sys.gold)}</b><span class="xs up">Ouro</span></span><button class="btn sm" data-a="shop">Loja ${ic('chevR')}</button></div>
  <div class="fattrs">${ATTR_INFO.map(([k]) => `<div class="frow"><b>${k}</b><span>${a[k]}</span></div>`).join('')}<div class="frow"><b>Pontos</b><span class="${S.sys.pts ? 'acc' : ''}">${S.sys.pts}</span></div></div>
  <div style="height:8px"></div>${radar(a)}
  ${S.sys.pts ? `<button class="btn pri block" data-a="points">${ic('plus')} Distribuir ${S.sys.pts} ${S.sys.pts === 1 ? 'ponto' : 'pontos'} de atributo</button>` : `<button class="xs dim center" style="display:block;width:100%" data-a="points">Atributos · 3 pontos por nível ${ic('chevR')}</button>`}</div>`;
}
function questWin() {
  const q = getQuest(), red = q.pen && !q.done;
  const items = q.t.map((t, i) => {
    const [n, u, inc] = QUEST_ITEMS[i], v = q.v[i], ok = v >= t;
    const f = x => u === 's' ? mmss(x) : u === 'min' ? `${x} min` : x;
    return `<div class="quest ${ok ? 'ok' : ''}"><div class="qh"><b>${n}</b><span>${ok ? ic('check') + ' ' : ''}${f(v)} / ${f(t)}</span></div><div class="xpbar"><i style="width:${v / t * 100}%"></i></div>${q.done || ok ? '' : `<div class="qb"><button data-a="qAdd" data-i="${i}" data-v="-${inc[0]}">−${inc[0]}</button><button data-a="qAdd" data-i="${i}" data-v="${inc[0]}">+${inc[0]}</button><button data-a="qAdd" data-i="${i}" data-v="${inc[1]}">+${inc[1]}</button><button data-a="qFill" data-i="${i}">${ic('check')}</button></div>`}</div>`;
  }).join('');
  return `<div class="sys ${red ? 'red' : ''} ${q.done ? 'done' : ''}"><span class="sys-h">${q.pen ? 'Penalidade' : 'Missão diária'}</span>
  <div class="sys-msg center" style="margin-bottom:4px">${q.done ? 'Missão cumprida. O Sistema reconhece seu esforço.' : q.pen ? 'Zona de Penalidade ativa. Cumpra ou perca XP.' : 'Treinamento diário para ficar mais forte.'}</div>
  ${q.done ? '' : `<div class="center xs mut" style="margin-bottom:4px">Tempo restante <b id="qLeft" style="color:#fff">${mmss(secsToMidnight())}</b></div>`}
  ${items}
  <div class="xs center" style="margin-top:10px;color:${red ? '#ffb3c1' : '#9fd0ff'}">${q.pen ? 'Recompensa: +40 XP · falhar: −100 XP' : 'Recompensa: +60 XP + bônus de sequência · falhar ativa a penalidade'}</div></div>`;
}
function logWin() {
  if (!S.sys.log.length) return '';
  const today = dkey();
  return `<div class="sys"><span class="sys-h">Registros</span><div class="log">${S.sys.log.slice(0, 6).map(l => { const k = dkey(new Date(l.ts)); return `<div><time>${k === today ? hhmm(l.ts) : dShort(k)}</time><span>${esc(l.msg)}</span></div>`; }).join('')}</div></div>`;
}
function habitRow(h, k) {
  const on = habitDone(h, k);
  return `<button class="habit ${on ? 'on' : ''}" data-a="habit" data-id="${h.id}"><span class="ck">${ic('check')}</span><span class="hn">${esc(h.n)}</span>${h.auto ? '<span class="tag">auto</span>' : ''}</button>`;
}

/* =====================================================================
   TREINO
   ===================================================================== */
function screenTreino() {
  const tabs = [['plano', 'Plano'], ['meus', 'Meus'], ['ex', 'Exercícios'], ['hist', 'Histórico']];
  let body = '';
  if (UI.tt === 'plano') body = treinoPlano();
  if (UI.tt === 'meus') body = treinoMeus();
  if (UI.tt === 'ex') body = treinoEx();
  if (UI.tt === 'hist') body = treinoHist();
  return `<div class="top"><h1>Treino</h1><button class="icon-btn acc" data-a="startWk" data-k="free" title="Treino livre">${ic('plus')}</button></div><div class="seg">${tabs.map(([k, l]) => `<button class="${UI.tt === k ? 'on' : ''}" data-a="tt" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}
function treinoPlano() {
  const p = S.profile, nd = S.plan.days.length, nx = nd ? S.plan.nextIdx % nd : 0;
  return `<div class="card hero"><div class="xs up acc">Seu plano</div><h2 style="margin:6px 0 4px">${FOCUS[p.focus].n}</h2><div class="small mut">${LOCATION[p.location].n} · ${LEVEL[p.level].n} · ${p.weekdays.map(d => WD[d]).join(', ')}</div></div>
  <div class="section-t">Divisão <span class="xs">toque para ver e editar</span></div>
  ${S.plan.days.map((d, i) => `<div class="card tight"><button class="day-card ${i === nx ? 'next' : ''}" data-a="openWk" data-k="plan" data-i="${i}"><div class="letter">${d.letter}</div><div class="grow"><div class="row"><h3>Treino ${d.letter}</h3>${i === nx ? '<span class="tag acc">Próximo</span>' : ''}</div><div class="small mut">${esc(d.name)} · ${d.items.length} exercícios · ~${estMin(d.items)} min</div></div>${ic('chevR')}</button></div>`).join('')}
  <div class="stack" style="margin-top:16px"><button class="btn block" data-a="startWk" data-k="free">${ic('plus')} Treino livre</button><button class="btn block ghost" data-a="regenPlan">${ic('refresh')} Gerar plano novamente</button></div>`;
}
function treinoMeus() {
  return `${S.customWorkouts.length ? S.customWorkouts.map((w, i) => `<div class="card tight"><button class="day-card" data-a="openWk" data-k="custom" data-i="${i}"><div class="letter">${ic('dumbbell')}</div><div class="grow"><h3 class="ellipsis">${esc(w.name)}</h3><div class="small mut">${w.items.length} exercícios · ~${estMin(w.items)} min</div></div>${ic('chevR')}</button></div>`).join('') : `<div class="card">${empty('dumbbell', 'Monte treinos do seu jeito, com os exercícios que quiser.')}</div>`}
  <button class="btn pri block" data-a="newWk">${ic('plus')} Criar treino</button>`;
}
function libList() {
  const q = UI.libQ.trim().toLowerCase();
  const list = allEx().filter(e => (UI.libM === 'Todos' || e.m === UI.libM) && (!q || e.n.toLowerCase().includes(q)));
  if (!list.length) return empty('search', 'Nenhum exercício encontrado.');
  return list.map(e => { const b = bestMetric(e.id); return `<button class="li" data-a="exInfo" data-id="${e.id}"><div class="lic exlic">${figHtml(e, '', true)}</div><div class="grow"><div class="lt">${esc(e.n)}</div><div class="ls">${e.m} · ${EQUIP_LABEL[e.e]}${b !== null ? ' · <span class="acc">recorde</span>' : ''}</div></div>${ic('chevR')}</button>`; }).join('');
}
function treinoEx() {
  return `<div class="search">${ic('search')}<input class="inp" data-in="libQ" value="${esc(UI.libQ)}" placeholder="Buscar exercício"></div>
  <div class="chips">${MUSCLES.map(m => `<button class="chip ${UI.libM === m ? 'on' : ''}" data-a="libM" data-v="${m}">${m}</button>`).join('')}</div>
  <div class="card tight" id="libList">${libList()}</div><button class="btn block" data-a="newEx">${ic('plus')} Criar exercício</button>`;
}
function treinoHist() {
  const ss = S.sessions, now = new Date(), mk = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const vol = ss.reduce((a, s) => a + s.volume, 0), month = ss.filter(s => s.date.startsWith(mk)).length;
  const weekStart = addDays(dkey(), -6), week = ss.filter(s => s.date >= weekStart).length;
  return `<div class="grid3" style="margin-bottom:12px"><div class="stat"><div class="v">${ss.length}</div><div class="l">treinos</div></div><div class="stat"><div class="v">${week}</div><div class="l">7 dias</div></div><div class="stat"><div class="v">${fmt(vol / 1000, 1)}t</div><div class="l">volume</div></div></div>
  ${ss.length ? `<div class="card tight">${[...ss].reverse().map(s => `<button class="li" data-a="sessInfo" data-id="${s.id}"><div class="lic" style="font-size:1rem;line-height:1;text-align:center">${parseKey(s.date).getDate()}<br><span class="xs mut">${MONTHS[parseKey(s.date).getMonth()]}</span></div><div class="grow"><div class="lt ellipsis">${esc(s.name)} ${s.prs.length ? `<span class="pr-badge">${ic('trophy')} ${s.prs.length}</span>` : ''}</div><div class="ls">${Math.max(1, Math.round(s.dur / 60))} min · ${s.exercises.length} exercícios · ${fmt(s.volume)} kg</div></div>${ic('chevR')}</button>`).join('')}</div>` : `<div class="card">${empty('clock', 'Nenhum treino registrado ainda. O primeiro é o mais importante.')}</div>`}`;
}

/* ----- sheets de treino ----- */
function wkRef(kind, idx) { return kind === 'plan' ? S.plan.days[idx] : S.customWorkouts[idx]; }
function openWk(kind, idx) {
  const w = wkRef(kind, idx); if (!w) return closeSheet();
  const title = kind === 'plan' ? `Treino ${w.letter}` : esc(w.name);
  const items = w.items.map((it, ii) => { const ex = getEx(it.exId); return `<div class="li"><button class="grow" style="text-align:left" data-a="exInfo" data-id="${it.exId}"><div class="lt">${esc(ex.n)}</div><div class="ls">${presc(it)} · desc. ${it.rest}s · ${ex.m}</div></button>${ii ? `<button class="icon-btn sm" data-a="itUp" data-k="${kind}" data-i="${idx}" data-ii="${ii}">${ic('chevU')}</button>` : ''}<button class="icon-btn sm" data-a="itEdit" data-k="${kind}" data-i="${idx}" data-ii="${ii}">${ic('edit')}</button><button class="icon-btn sm" data-a="itSwap" data-k="${kind}" data-i="${idx}" data-ii="${ii}">${ic('swap')}</button><button class="icon-btn sm danger" data-a="itDel" data-k="${kind}" data-i="${idx}" data-ii="${ii}">${ic('trash')}</button></div>`; }).join('');
  openSheet(`${sheetHead(title, kind === 'plan' ? esc(w.name) + ` · ~${estMin(w.items)} min` : `~${estMin(w.items)} min`)}
  ${kind === 'custom' ? `<div class="field"><label>Nome do treino</label><input class="inp" id="wkName" value="${esc(w.name)}" data-in="wkName" data-i="${idx}"></div>` : ''}
  <div class="card tight">${items || empty('dumbbell', 'Nenhum exercício ainda.')}</div>
  <button class="btn block" data-a="itAdd" data-k="${kind}" data-i="${idx}">${ic('plus')} Adicionar exercício</button>
  <div style="height:10px"></div>
  <button class="btn pri block" data-a="startWk" data-k="${kind}" data-i="${idx}" ${w.items.length ? '' : 'disabled'}>${ic('play')} Começar treino</button>
  ${kind === 'custom' ? `<div style="height:10px"></div><button class="btn block danger" data-a="delWk" data-i="${idx}">${ic('trash')} Excluir treino</button>` : ''}`);
}
function itemEditSheet(kind, idx, ii) {
  const it = wkRef(kind, idx).items[ii], ex = getEx(it.exId), tm = ex.t === 'time';
  openSheet(`${sheetHead('Ajustar', esc(ex.n))}
  <div class="grid2"><div class="field"><label>Séries</label><input class="inp" id="ieSets" type="number" inputmode="numeric" value="${it.sets}"></div>
  ${tm ? `<div class="field"><label>Tempo (seg)</label><input class="inp" id="ieTime" type="number" inputmode="numeric" value="${it.time}"></div>` : `<div class="field"><label>Repetições</label><input class="inp" id="ieReps" value="${esc(it.reps)}" placeholder="8-12"></div>`}</div>
  <div class="field"><label>Descanso (seg)</label><input class="inp" id="ieRest" type="number" inputmode="numeric" value="${it.rest}"></div>
  <button class="btn pri block" data-a="itSave" data-k="${kind}" data-i="${idx}" data-ii="${ii}">Salvar</button><div style="height:8px"></div><button class="btn ghost block" data-a="openWk" data-k="${kind}" data-i="${idx}">Voltar</button>`);
}
function pickList() {
  const q = UI.pick.q.trim().toLowerCase();
  const list = allEx().filter(e => (UI.pick.m === 'Todos' || e.m === UI.pick.m) && (!q || e.n.toLowerCase().includes(q)));
  const allow = LOCATION[S.profile.location].allow + 'c';
  list.sort((a, b) => (allow.includes(a.e) ? 0 : 1) - (allow.includes(b.e) ? 0 : 1));
  return list.length ? list.map(e => `<button class="li" data-a="pickEx" data-id="${e.id}"><div class="grow"><div class="lt">${esc(e.n)}</div><div class="ls">${e.m} · ${EQUIP_LABEL[e.e]}</div></div>${ic('plus')}</button>`).join('') : empty('search', 'Nada encontrado.');
}
function openPicker(ctx) {
  PICK = ctx; UI.pick = { q: '', m: ctx.m || 'Todos' };
  renderPicker();
}
function renderPicker() {
  openSheet(`${sheetHead(PICK.mode === 'swap' ? 'Trocar exercício' : 'Adicionar exercício')}
  <div class="search">${ic('search')}<input class="inp" data-in="pickQ" placeholder="Buscar exercício" value="${esc(UI.pick.q)}"></div>
  <div class="chips">${MUSCLES.map(m => `<button class="chip ${UI.pick.m === m ? 'on' : ''}" data-a="pickM" data-v="${m}">${m}</button>`).join('')}</div>
  <div class="card tight" id="pickList">${pickList()}</div>
  ${PICK.kind !== 'active' ? `<button class="btn ghost block" data-a="openWk" data-k="${PICK.kind}" data-i="${PICK.idx}">Voltar</button>` : ''}`);
}
function exSheet(id) {
  const ex = getEx(id), hist = exHistory(id), weighted = hist.some(h => h.sets.some(s => s.kg > 0));
  let best = null; hist.forEach(h => h.sets.forEach(s => { if (!best || metric(s) > metric(best)) best = s; }));
  const pts = hist.slice(-20).map(h => ({ x: dShort(h.date), y: r1(h.best) }));
  openSheet(`${sheetHead(esc(ex.n), `${ex.m} · ${EQUIP_LABEL[ex.e]}`)}
  ${figHtml(ex, 'exanim')}
  ${ex.i ? `<div class="card"><div class="xs up acc" style="margin-bottom:6px">Como fazer</div><div>${esc(ex.i)}</div></div>` : ''}
  <div class="grid2" style="margin-bottom:12px"><div class="stat"><div class="v">${best ? setTxt(best) : '—'}</div><div class="l">Melhor série</div></div><div class="stat"><div class="v">${hist.length}</div><div class="l">Vezes treinado</div></div></div>
  ${hist.length ? `<div class="card"><div class="xs up mut" style="margin-bottom:8px">${weighted ? 'Força estimada (1RM, kg)' : 'Melhor série'}</div>${lineChart(pts)}</div>
  <div class="section-t">Últimas vezes</div><div class="card tight">${[...hist].reverse().slice(0, 6).map(h => `<div class="kv"><span>${dShort(h.date)}</span><span>${h.sets.map(setTxt).join(' · ')}</span></div>`).join('')}</div>` : ''}
  ${ex.e === 'c' && S.customExercises.some(e => e.id === id) ? `<button class="btn danger block" data-a="delEx" data-id="${id}">${ic('trash')} Excluir exercício</button>` : ''}`);
}
function sessSheet(id) {
  const s = S.sessions.find(x => x.id === id); if (!s) return;
  openSheet(`${sheetHead(esc(s.name), `${WDL[parseKey(s.date).getDay()]}, ${dShort(s.date)} · ${hhmm(s.start)}`)}
  <div class="grid3" style="margin-bottom:12px"><div class="stat"><div class="v">${Math.max(1, Math.round(s.dur / 60))}</div><div class="l">minutos</div></div><div class="stat"><div class="v">${s.exercises.reduce((a, e) => a + e.sets.length, 0)}</div><div class="l">séries</div></div><div class="stat"><div class="v">${fmt(s.volume)}</div><div class="l">kg volume</div></div></div>
  <div class="card tight">${s.exercises.map(e => `<div class="li"><div class="grow"><div class="lt">${esc(getEx(e.exId).n)} ${s.prs.includes(e.exId) ? `<span class="pr-badge">${ic('trophy')} PR</span>` : ''}</div><div class="ls">${e.sets.map(setTxt).join(' · ')}</div></div></div>`).join('')}</div>
  <button class="btn danger block" data-a="delSess" data-id="${id}">${ic('trash')} Apagar registro</button>`);
}

/* ----- treino ativo ----- */
function startWorkout(kind, idx) {
  const begin = () => {
    const w = kind === 'free' ? { name: 'Treino livre', items: [] } : wkRef(kind, idx);
    S.active = {
      id: uid(), kind, idx: +idx, start: Date.now(),
      name: kind === 'plan' ? `Treino ${w.letter}` : w.name,
      sub: kind === 'plan' ? w.name : kind === 'custom' ? 'Meu treino' : 'Monte na hora',
      exercises: w.items.map(itemToActive),
    };
    save(); closeSheet(); go('workout');
  };
  if (S.active) confirmSheet('Treino em andamento', 'Você já tem um treino aberto. Descartar e começar outro?', 'Descartar e começar', begin, true);
  else begin();
}
function itemToActive(it) {
  return { exId: it.exId, reps: it.reps || '', time: it.time || 0, rest: it.rest || 60, sets: Array.from({ length: it.sets || 3 }, () => ({ kg: '', reps: '', time: '', done: false })) };
}
function setPh(ex, si) {
  const prev = lastSets(ex.exId), p = prev ? prev[Math.min(si, prev.length - 1)] : null;
  const before = si > 0 ? ex.sets[si - 1] : null;
  return {
    kg: before && before.kg !== '' ? before.kg : (p && p.kg ? p.kg : ''),
    reps: p && p.reps ? p.reps : (parseInt(ex.reps) || ''),
    time: ex.time || (p && p.time) || 30,
    prev: p ? setTxt(p) : '—',
  };
}
function exCard(ex, ei) {
  const e = getEx(ex.exId), tm = e.t === 'time', done = ex.sets.filter(s => s.done).length;
  const rows = ex.sets.map((s, si) => {
    const ph = setPh(ex, si);
    const ins = tm
      ? `<td><input inputmode="numeric" data-in="set" data-ei="${ei}" data-si="${si}" data-f="time" value="${esc(s.time)}" placeholder="${ph.time}"></td><td style="width:50px"><button class="ckb play" data-a="woPlay" data-ei="${ei}" data-si="${si}">${ic('play')}</button></td>`
      : `<td><input inputmode="decimal" data-in="set" data-ei="${ei}" data-si="${si}" data-f="kg" value="${esc(s.kg)}" placeholder="${ph.kg === '' ? 'kg' : ph.kg}"></td><td><input inputmode="numeric" data-in="set" data-ei="${ei}" data-si="${si}" data-f="reps" value="${esc(s.reps)}" placeholder="${ph.reps}"></td>`;
    return `<tr class="${s.done ? 'done' : ''}"><td class="n">${si + 1}</td><td class="prev">${ph.prev}</td>${ins}<td style="width:50px"><button class="ckb" data-a="setDone" data-ei="${ei}" data-si="${si}">${ic('check')}</button></td></tr>`;
  }).join('');
  return `<div class="card ex-card"><div class="row" style="align-items:flex-start"><button class="exthumb" data-a="exInfo" data-id="${ex.exId}" aria-label="Ver como fazer ${esc(e.n)}">${figHtml(e)}</button><button class="grow" style="text-align:left" data-a="exInfo" data-id="${ex.exId}"><div class="exn">${esc(e.n)}</div><div class="small mut" style="margin-top:3px">${tm ? `${ex.sets.length} × ${ex.time}s` : `${ex.sets.length} × ${ex.reps || 'livre'}`} · <span class="${done === ex.sets.length ? 'ok' : ''}">${done}/${ex.sets.length} feitas</span></div></button><button class="icon-btn sm" data-a="woSwap" data-ei="${ei}">${ic('swap')}</button><button class="icon-btn sm danger" data-a="woDelEx" data-ei="${ei}">${ic('trash')}</button></div>
  <table class="sets"><thead><tr><th>#</th><th>Anterior</th>${tm ? '<th>Seg</th><th></th>' : '<th>Kg</th><th>Reps</th>'}<th></th></tr></thead><tbody>${rows}</tbody></table>
  <div class="ex-actions"><button class="btn sm" data-a="woAddSet" data-ei="${ei}">${ic('plus')} Série</button>${ex.sets.length > 1 ? `<button class="btn sm ghost" data-a="woRmSet" data-ei="${ei}">${ic('minus')}</button>` : ''}<span class="grow"></span><button class="btn sm ghost" data-a="woRest" data-ei="${ei}">${ic('timer')} ${ex.rest}s</button></div></div>`;
}
function screenWorkout() {
  const a = S.active, ds = doneSets(a), ts = totalSets(a);
  return `<div class="wo-top"><button class="icon-btn sm" data-a="go" data-r="home">${ic('chevL')}</button><div class="grow"><div class="xs up mut ellipsis">${esc(a.sub)}</div><h3 class="ellipsis">${esc(a.name)}</h3></div><div class="clock" id="woClock">${mmss((Date.now() - a.start) / 1000)}</div></div>
  <div class="card tight"><div class="row between small" style="margin-bottom:8px"><span class="mut">Progresso</span><b>${ds}/${ts} séries</b></div><div class="progress"><i style="width:${ts ? ds / ts * 100 : 0}%"></i></div></div>
  ${a.exercises.map(exCard).join('')}
  <button class="btn block" data-a="woAddEx">${ic('plus')} Adicionar exercício</button>
  <div style="height:10px"></div><button class="btn ok block" data-a="woFinishAsk">${ic('check')} Finalizar treino</button>
  <div style="height:10px"></div><button class="btn ghost block" data-a="woCancel" style="color:var(--bad)">Descartar treino</button><div style="height:110px"></div>`;
}
function finishWorkout() {
  const a = S.active;
  const exs = a.exercises.map(e => ({ exId: e.exId, sets: e.sets.filter(s => s.done).map(s => ({ kg: num(s.kg), reps: Math.round(num(s.reps)), time: Math.round(num(s.time)) })) })).filter(e => e.sets.length);
  if (!exs.length) { toast('Marque pelo menos uma série como feita', 'info'); closeSheet(); return; }
  const prs = [];
  exs.forEach(e => { const prev = bestMetric(e.exId), cur = Math.max(...e.sets.map(metric)); if (prev !== null && cur > prev) prs.push(e.exId); });
  const volume = Math.round(exs.reduce((v, e) => v + e.sets.reduce((x, s) => x + s.kg * s.reps, 0), 0));
  const sess = { id: uid(), date: dkey(new Date(a.start)), start: a.start, dur: Math.round((Date.now() - a.start) / 1000), name: a.name, kind: a.kind, exercises: exs, volume, prs };
  S.sessions.push(sess);
  if (a.kind === 'plan' && S.plan.days.length) S.plan.nextIdx = (a.idx + 1) % S.plan.days.length;
  S.active = null; TM = null; hideTimer();
  const nSets = exs.reduce((n, e) => n + e.sets.length, 0);
  const xp = 50 + Math.min(50, nSets * 2) + prs.length * 25 + (a.kind === 'plan' ? 30 : 0);
  sess.xp = xp;
  save(); go('home');
  openSheet(`<div class="celebrate"><div class="big-ic">${ic('trophy')}</div><h1>Treino feito.</h1><p class="mut">${esc(sess.name)} · ${Math.max(1, Math.round(sess.dur / 60))} min</p>
  <div class="sys" style="margin:14px 0 0"><span class="sys-h">Recompensa</span><div class="big-n" style="font-size:3.0667rem">+${xp} XP</div><div class="xs mut">50 treino · ${Math.min(50, nSets * 2)} séries${prs.length ? ` · ${prs.length * 25} recordes` : ''}${a.kind === 'plan' ? ' · 30 bônus do plano' : ''}</div></div></div>
  <div class="grid3" style="margin:14px 0"><div class="stat"><div class="v">${exs.reduce((n, e) => n + e.sets.length, 0)}</div><div class="l">séries</div></div><div class="stat"><div class="v">${fmt(volume)}</div><div class="l">kg volume</div></div><div class="stat"><div class="v acc">${prs.length}</div><div class="l">recordes</div></div></div>
  ${prs.length ? `<div class="card tight">${prs.map(id => `<div class="li"><span class="pr-badge">${ic('trophy')} PR</span><div class="lt grow">${esc(getEx(id).n)}</div></div>`).join('')}</div>` : ''}
  <button class="btn pri block" data-a="closeSheet">Fechar</button>`);
  grantXP(xp, 'Treino concluído', true);
  checkAch();
}

/* ----- cronômetro de descanso / execução ----- */
function startTimer(sec, label, work = false, onEnd = null) {
  sec = Math.round(sec); if (!sec) return;
  TM = { end: Date.now() + sec * 1000, total: sec, label, work, onEnd };
  const el = $('#timer'); el.className = 'timer' + (work ? ' work' : '');
  el.innerHTML = `<div class="row"><div class="grow"><div class="tl">${label}</div><div class="tv" id="tmV">${mmss(sec)}</div></div><button class="btn sm" data-a="tmAdd" data-v="-15">−15</button><button class="btn sm" data-a="tmAdd" data-v="15">+15</button><button class="btn sm ${work ? 'ok' : 'pri'}" data-a="tmSkip">${work ? 'Feito' : 'Pular'}</button></div><div class="progress"><i id="tmP" style="width:100%"></i></div>`;
}
function hideTimer() { $('#timer').className = 'timer hidden'; }
function timerEnd(skipped) {
  const t = TM; TM = null; hideTimer();
  if (!skipped) alertDone(t.work ? 'Série concluída' : 'Descanso acabou', t.work ? 'Hora de descansar.' : 'Bora pra próxima série!');
  if (t.onEnd) t.onEnd();
}
var actx;
function alertDone(title, body) {
  playSound('rest');
  if (S.settings.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  if (document.hidden) notify(title, body);
}
async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) reg.showNotification(title, { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: title });
    else new Notification(title, { body, icon: 'icons/icon-192.png' });
  } catch (e) { }
}
function tick() {
  if (TM) {
    const left = (TM.end - Date.now()) / 1000;
    const v = $('#tmV'), p = $('#tmP');
    if (v) v.textContent = mmss(Math.ceil(left));
    if (p) p.style.width = clamp(left / TM.total * 100, 0, 100) + '%';
    if (left <= 0) timerEnd(false);
  }
  if (S.active) { const c = $('#woClock') || $('#homeClock'); if (c) c.textContent = mmss((Date.now() - S.active.start) / 1000); }
  const ql = $('#qLeft'); if (ql) ql.textContent = mmss(secsToMidnight());
  const pt = $('#popTimer'); if (pt) pt.textContent = mmss(secsToMidnight());
  if (S.fasting.start) { const f = $('#fastTime'); if (f) f.textContent = mmss((Date.now() - S.fasting.start) / 1000); }
  const today = dkey();
  if (today !== TICK_DAY) { const first = !TICK_DAY; TICK_DAY = today; if (!first && S.profile && route() !== 'workout' && $('#sheetWrap').classList.contains('hidden')) { UI.nd = today; render(); } }
}
let TICK_DAY = '';
setInterval(tick, 250);

/* =====================================================================
   NUTRIÇÃO
   ===================================================================== */
function screenNutri() {
  const k = UI.nd, t = targets(), tot = dayTotals(k), water = S.water[k] || 0, isToday = k === dkey();
  const label = isToday ? 'Hoje' : k === addDays(dkey(), -1) ? 'Ontem' : `${WD[parseKey(k).getDay()]}, ${dShort(k)}`;
  const left = t.kcal - tot.kcal, cups = Math.max(1, Math.round(t.water / 250)), filled = Math.floor(water / 250);
  const food = S.food[k] || [];
  const meals = MEALS.map(m => {
    const it = food.filter(f => f.meal === m), kc = it.reduce((a, f) => a + f.kcal, 0);
    return `<div class="card"><div class="meal-h"><div><h3>${m}</h3><div class="small mut">${fmt(kc)} kcal</div></div><button class="icon-btn sm acc" data-a="foodAdd" data-v="${m}">${ic('plus')}</button></div>${it.length ? `<div style="margin-top:8px">${it.map(f => `<div class="food-item"><div class="grow"><div class="ellipsis" style="font-weight:600">${esc(f.name)}</div><div class="small mut">${f.g ? fmt(f.g) + ' g · ' : ''}${fmt(f.kcal)} kcal · P ${fmt(f.p)} · C ${fmt(f.c)} · G ${fmt(f.f)}</div></div><button class="icon-btn sm" data-a="foodDel" data-id="${f.id}">${ic('x')}</button></div>`).join('')}</div>` : ''}</div>`;
  }).join('');
  return `<div class="top"><h1>Nutrição</h1></div>
  <div class="date-nav"><button class="icon-btn sm" data-a="nd" data-v="-1">${ic('chevL')}</button><b>${label}</b><button class="icon-btn sm" data-a="nd" data-v="1" ${isToday ? 'disabled style="opacity:.3"' : ''}>${ic('chevR')}</button></div>
  <div class="card hero"><div class="row" style="gap:18px">${ring(tot.kcal / t.kcal, 124, 11, left < 0 ? 'var(--bad)' : 'var(--acc)', `<div><div class="kcal-big">${fmt(Math.abs(left))}</div><div class="xs mut up">${left < 0 ? 'kcal acima' : 'kcal restam'}</div></div>`)}<div class="grow">${bar('Proteína', tot.p, t.prot)}${bar('Carbo', tot.c, t.carb, 'yel')}${bar('Gordura', tot.f, t.fat, 'blue')}</div></div><div class="row between small mut" style="margin-top:10px"><span>Consumido <b style="color:var(--tx)">${fmt(tot.kcal)}</b></span><span>Meta <b style="color:var(--tx)">${fmt(t.kcal)}</b> kcal</span></div></div>
  <div class="card"><div class="card-h"><h3>${ic('droplet')} Água</h3><span class="num" style="font-size:1.3333rem">${fmt(water / 1000, 2)} <span class="mut small">/ ${fmt(t.water / 1000, 2)} L</span></span></div><div class="cups">${Array.from({ length: cups }, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('')}</div><div class="row"><button class="btn sm" data-a="water" data-v="-250">${ic('minus')}</button><button class="btn sm grow" data-a="water" data-v="250">+250 ml</button><button class="btn sm grow" data-a="water" data-v="500">+500 ml</button></div></div>
  ${isToday ? fastCard() : ''}
  <div class="section-t">Refeições ${isToday && !food.length && (S.food[addDays(k, -1)] || []).length ? `<button class="link" data-a="copyDay">${ic('copy')} Repetir ontem</button>` : ''}</div>
  ${meals}`;
}
function fastCard() {
  const f = S.fasting;
  if (f.start) {
    const el = (Date.now() - f.start) / 3.6e6, pct = el / f.protocol;
    return `<div class="card"><div class="card-h"><h3>${ic('clock')} Jejum ${f.protocol}h</h3><span class="tag ${pct >= 1 ? 'ok' : 'acc'}">${pct >= 1 ? 'Meta batida' : 'Em andamento'}</span></div><div class="row between"><div><div class="num" style="font-size:2.2667rem" id="fastTime">${mmss((Date.now() - f.start) / 1000)}</div><div class="small mut">Começou ${hhmm(f.start)} · termina ${hhmm(f.start + f.protocol * 3.6e6)}</div></div><button class="btn sm danger" data-a="fastStop">${ic('stop')} Encerrar</button></div><div class="progress ${pct >= 1 ? 'ok' : ''}" style="margin-top:12px"><i style="width:${clamp(pct * 100, 0, 100)}%"></i></div></div>`;
  }
  const last = f.history[f.history.length - 1];
  return `<div class="card"><div class="card-h"><h3>${ic('clock')} Jejum intermitente</h3>${last ? `<span class="small mut">Último: ${fmt((last.end - last.start) / 3.6e6, 1)}h</span>` : ''}</div><div class="chips">${[12, 14, 16, 18, 20].map(h => `<button class="chip ${f.protocol === h ? 'on' : ''}" data-a="fastProto" data-v="${h}">${h}:${24 - h}</button>`).join('')}</div><button class="btn block" data-a="fastStart">${ic('play')} Iniciar jejum de ${f.protocol}h</button></div>`;
}
function foodSheet() {
  const fs = UI.fs;
  const tabs = `<div class="seg"><button class="${fs.tab === 'busca' ? 'on' : ''}" data-a="fsTab" data-v="busca">Buscar</button><button class="${fs.tab === 'manual' ? 'on' : ''}" data-a="fsTab" data-v="manual">Manual</button></div>`;
  let body;
  if (fs.tab === 'manual') {
    body = `<div class="field"><label>Alimento</label><input class="inp" id="mfName" placeholder="Ex.: Marmita frango e arroz"></div>
    <div class="grid2"><div class="field"><label>Calorias</label><div class="inp-unit"><input class="inp" id="mfK" type="number" inputmode="decimal"><span>kcal</span></div></div><div class="field"><label>Proteína</label><div class="inp-unit"><input class="inp" id="mfP" type="number" inputmode="decimal"><span>g</span></div></div><div class="field"><label>Carboidrato</label><div class="inp-unit"><input class="inp" id="mfC" type="number" inputmode="decimal"><span>g</span></div></div><div class="field"><label>Gordura</label><div class="inp-unit"><input class="inp" id="mfF" type="number" inputmode="decimal"><span>g</span></div></div></div>
    <div class="row between" style="margin-bottom:16px"><span>Salvar em "Meus alimentos"</span>${toggle(fs.saveMine, 'fsMine')}</div>
    <button class="btn pri block" data-a="mfAdd">Adicionar</button>`;
  } else {
    body = `<div class="search">${ic('search')}<input class="inp" data-in="fsQ" placeholder="Buscar alimento" value="${esc(fs.q)}"></div><div id="fsSel">${fsSelHtml()}</div><div class="card tight" id="fsList">${fsListHtml()}</div>`;
  }
  openSheet(`${sheetHead('Adicionar', fs.meal)}${tabs}${body}`);
}
function fsListHtml() {
  const q = UI.fs.q.trim().toLowerCase();
  const mine = S.myFoods.filter(f => !q || f.name.toLowerCase().includes(q)).map(f => `<div class="li" style="cursor:pointer" data-a="fsPick" data-src="mine" data-id="${f.id}"><div class="grow"><div class="lt">${esc(f.name)} <span class="tag acc">meu</span></div><div class="ls">1 porção · ${fmt(f.kcal)} kcal · P ${fmt(f.p)}g</div></div><button class="icon-btn sm" data-a="myFoodDel" data-id="${f.id}">${ic('trash')}</button></div>`);
  const base = FOODS.map((f, i) => [f, i]).filter(([f]) => !q || f[0].toLowerCase().includes(q)).map(([f, i]) => `<button class="li" data-a="fsPick" data-src="db" data-id="${i}"><div class="grow"><div class="lt">${f[0]}</div><div class="ls">${f[6]} (${f[5]} g) · ${fmt(f[1] * f[5] / 100)} kcal · P ${fmt(f[2] * f[5] / 100, 1)}g</div></div>${ic('plus')}</button>`);
  const all = mine.concat(base);
  return all.length ? all.join('') : empty('search', 'Não achou? Use a aba Manual.');
}
function fsCalc() {
  const s = UI.fs.sel; if (!s) return null;
  const q = num(UI.fs.g);
  if (s.src === 'db') { const f = FOODS[s.id], m = q / 100; return { name: f[0], g: q, kcal: Math.round(f[1] * m), p: r1(f[2] * m), c: r1(f[3] * m), f: r1(f[4] * m) }; }
  const f = S.myFoods.find(x => x.id === s.id); if (!f) return null;
  return { name: q !== 1 ? `${f.name} (${fmt(q, 1)}×)` : f.name, g: 0, kcal: Math.round(f.kcal * q), p: r1(f.p * q), c: r1(f.c * q), f: r1(f.f * q) };
}
function fsSelHtml() {
  const s = UI.fs.sel; if (!s) return '';
  const name = s.src === 'db' ? FOODS[s.id][0] : (S.myFoods.find(x => x.id === s.id) || {}).name;
  const c = fsCalc();
  return `<div class="card hero"><div class="row between"><h3>${esc(name)}</h3><button class="icon-btn sm" data-a="fsUnsel">${ic('x')}</button></div><div class="row" style="margin:12px 0"><div class="inp-unit grow"><input class="inp" type="number" inputmode="decimal" data-in="fsG" value="${esc(UI.fs.g)}"><span>${s.src === 'db' ? 'g' : 'porções'}</span></div></div><div class="small mut" id="fsPrev">${fsPrevTxt(c)}</div><div style="height:12px"></div><button class="btn pri block" data-a="fsAdd">Adicionar</button></div>`;
}
const fsPrevTxt = c => c ? `<b style="color:var(--tx)">${fmt(c.kcal)} kcal</b> · P ${fmt(c.p, 1)}g · C ${fmt(c.c, 1)}g · G ${fmt(c.f, 1)}g` : '';
function addFood(e) {
  const k = UI.nd; (S.food[k] = S.food[k] || []).push({ id: uid(), meal: UI.fs.meal, ...e });
  save(); closeSheet(); render(); toast(`${e.name} adicionado`);
  if (k === dkey() && dayTotals(k).p >= targets().prot) awardDaily('prot', 10, 'Meta de proteína');
  checkAch();
}

/* =====================================================================
   CORPO
   ===================================================================== */
function screenCorpo() {
  const p = S.profile, cur = curWeight(), start = startWeight(), g = p.goalWeight, diff = cur - start;
  const imc = cur / Math.pow(p.height / 100, 2);
  const imcTxt = imc < 18.5 ? 'abaixo' : imc < 25 ? 'normal' : imc < 30 ? 'sobrepeso' : 'obesidade';
  const prog = g === start ? 1 : clamp((cur - start) / (g - start), 0, 1);
  const wpts = S.weights.slice(-30).map(w => ({ x: dShort(w.date), y: w.kg }));
  const lastM = S.measures[S.measures.length - 1], prevM = S.measures[S.measures.length - 2];
  const mpts = S.measures.filter(m => m[UI.mk]).slice(-20).map(m => ({ x: dShort(m.date), y: m[UI.mk] }));
  const photos = PHOTOS.slice().reverse();
  return `<div class="top"><h1>Corpo</h1></div>
  <div class="card hero"><div class="card-h"><h3>${ic('scale')} Peso</h3><button class="btn sm pri" data-a="weightAdd">${ic('plus')} Registrar</button></div>
  <div class="row" style="align-items:flex-end;gap:8px"><span class="num" style="font-size:3.4667rem;line-height:.9">${fmt(cur, 1)}</span><span class="mut" style="margin-bottom:6px">kg</span><span class="grow"></span><span class="tag ${diff === 0 ? '' : (g < start ? diff < 0 : diff > 0) ? 'ok' : 'acc'}">${diff > 0 ? '+' : ''}${fmt(diff, 1)} kg</span></div>
  <div style="margin:14px 0 6px" class="row between small mut"><span>Início ${fmt(start, 1)} kg</span><span>Meta ${fmt(g, 1)} kg</span></div><div class="progress ok"><i style="width:${prog * 100}%"></i></div>
  <div style="margin-top:14px">${lineChart(wpts, { unit: '' })}</div></div>
  <div class="grid2" style="margin-bottom:12px"><div class="stat"><div class="v">${fmt(imc, 1)}</div><div class="l">IMC · ${imcTxt}</div></div><div class="stat"><div class="v">${fmt(Math.abs(g - cur), 1)} kg</div><div class="l">para a meta</div></div></div>
  <div class="card"><div class="card-h"><h3>${ic('ruler')} Medidas</h3><button class="btn sm" data-a="measAdd">${ic('plus')} Registrar</button></div>
  ${lastM ? `<div class="grid2" style="margin-bottom:12px">${MEASURES.filter(([k]) => lastM[k]).map(([k, l]) => { const d = prevM && prevM[k] ? lastM[k] - prevM[k] : 0; return `<div class="stat"><div class="v">${fmt(lastM[k], 1)}<span class="small mut"> ${k === 'bf' ? '%' : 'cm'}</span></div><div class="l">${l}${d ? ` · <span class="${d > 0 ? 'acc' : 'ok'}">${d > 0 ? '+' : ''}${fmt(d, 1)}</span>` : ''}</div></div>`; }).join('')}</div>
  <div class="chips">${MEASURES.map(([k, l]) => `<button class="chip ${UI.mk === k ? 'on' : ''}" data-a="mk" data-v="${k}">${l}</button>`).join('')}</div>${lineChart(mpts, { color: 'var(--blue)' })}<div class="xs dim" style="margin-top:6px">Última medição: ${dShort(lastM.date)}</div>` : empty('ruler', 'Meça peito, braço, cintura e coxa a cada 2–4 semanas. A balança não conta tudo.')}</div>
  <div class="card"><div class="card-h"><h3>${ic('camera')} Fotos de progresso</h3>${PHOTOS.length >= 2 ? `<button class="link" data-a="cmpMode">${UI.cmpMode ? 'Cancelar' : 'Comparar'}</button>` : ''}</div>
  ${UI.cmpMode ? `<div class="small mut" style="margin-bottom:10px">Selecione 2 fotos (${UI.cmp.length}/2)</div>` : ''}
  <div class="photos">${UI.cmpMode ? '' : `<button class="add" data-a="photoAdd">${ic('plus')}</button>`}${photos.map(ph => `<button class="${UI.cmp.includes(ph.id) ? 'sel' : ''}" style="background-image:url(${ph.data})" data-a="photo" data-id="${ph.id}"><span>${dShort(ph.date)}</span></button>`).join('')}</div>
  ${UI.cmpMode && UI.cmp.length === 2 ? `<div style="height:12px"></div><button class="btn pri block" data-a="cmpShow">Ver antes e depois</button>` : ''}
  <div class="xs dim" style="margin-top:10px">${ic('lock')} As fotos ficam só neste aparelho.</div></div>
  ${S.weights.length > 1 ? `<div class="section-t">Histórico de peso</div><div class="card tight">${[...S.weights].reverse().slice(0, 8).map(w => `<div class="kv"><span>${dShort(w.date)}</span><span class="row"><b>${fmt(w.kg, 1)} kg</b><button class="icon-btn sm" data-a="weightDel" data-v="${w.date}">${ic('x')}</button></span></div>`).join('')}</div>` : ''}`;
}

/* ---------- fotos (IndexedDB) ---------- */
const DB = {
  db: null,
  open() { return this.db ? Promise.resolve(this.db) : new Promise((res, rej) => { const r = indexedDB.open('foco', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' }); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('photos', mode), st = t.objectStore('photos'), q = fn(st); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
  all() { return this.tx('readonly', s => s.getAll()); },
  put(o) { return this.tx('readwrite', s => s.put(o)); },
  del(id) { return this.tx('readwrite', s => s.delete(id)); },
  clear() { return this.tx('readwrite', s => s.clear()); },
};
async function loadPhotos() {
  let all = [];
  try { all = (await DB.all()) || []; } catch (e) { }
  PHOTOS = all.filter(p => !p.kind).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts);
  ASSETS = {}; all.filter(p => p.kind).forEach(p => ASSETS[p.kind] = p.data);
  applyAssets();
  S.photoCount = PHOTOS.length; save();
}
function compress(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const m = 1000, sc = Math.min(1, m / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .8)); };
    img.onerror = rej; img.src = url;
  });
}

/* =====================================================================
   PERFIL
   ===================================================================== */
function screenPerfil() {
  const p = S.profile, t = targets(), st = S.settings, unlocked = ACH.filter(a => S.ach[a.id]).length;
  const notifOk = 'Notification' in window;
  return `<div class="top"><h1>Perfil</h1><button class="icon-btn" data-a="profEdit">${ic('edit')}</button></div>
  <div class="card hero"><div class="row" style="gap:14px"><div class="lic" style="width:58px;height:58px;border-radius:16px;background:var(--acc);color:#020b18;display:grid;place-items:center;font-family:var(--head);font-weight:800;font-size:1.8667rem">${esc(p.name[0] || 'F').toUpperCase()}</div><div class="grow"><h2>${esc(p.name)}</h2><div class="small mut">${p.age} anos · ${p.height} cm · ${fmt(curWeight(), 1)} kg</div></div></div>
  <div class="row" style="margin-top:14px;gap:12px"><div class="rank-wrap" style="--rc:${sysInfo().R.c}"><div class="rank-badge sm"><span>${sysInfo().R.r}</span></div></div><div class="grow"><b>Rank ${sysInfo().R.r} · Nível ${sysInfo().lvl}</b><div class="small mut">${fmt(S.sys.xp)} XP total · ${Object.values(S.sys.quests).filter(q => q.done).length} missões cumpridas</div></div></div>
  <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:14px"><span class="tag acc">${FOCUS[p.focus].n}</span><span class="tag">${LOCATION[p.location].n}</span><span class="tag">${LEVEL[p.level].n}</span><span class="tag">${p.weekdays.length}× semana</span></div></div>
  <div class="section-t">Metas diárias</div>
  <div class="card tight"><div class="kv"><span>Calorias</span><b>${fmt(t.kcal)} kcal</b></div><div class="kv"><span>Proteína</span><b>${t.prot} g</b></div><div class="kv"><span>Carboidrato</span><b>${t.carb} g</b></div><div class="kv"><span>Gordura</span><b>${t.fat} g</b></div><div class="kv"><span>Água</span><b>${fmt(t.water / 1000, 2)} L</b></div></div>
  <div class="xs dim" style="margin:-4px 2px 0">Recalculadas automaticamente quando você registra um novo peso.</div>
  <div class="section-t">Títulos <span>${unlocked}/${ACH.length}</span></div>
  <div class="xs dim" style="margin:-4px 2px 10px">Toque num título desbloqueado para exibir no seu Status.</div>
  <div class="ach">${ACH.map(a => `<div class="${S.ach[a.id] ? 'on' : ''} ${S.sys.title === a.id ? 'eq' : ''}" ${S.ach[a.id] ? `data-a="equip" data-id="${a.id}" style="cursor:pointer"` : ''}><div class="ai">${ic(S.ach[a.id] ? a.ic : 'lock')}</div><b>${a.n}</b><small>${S.sys.title === a.id ? '<span class="acc">Equipado</span>' : a.d}</small></div>`).join('')}</div>
  <div class="section-t">Evolução do caçador</div>
  <div class="evo">${RANKS.map((R, i) => `<div class="${i > rankI() ? 'lock' : ''} ${i === rankI() ? 'cur' : ''}">${avatarSVG(i, R.c)}<b style="color:${R.c}">Rank ${R.r}</b><small>${className(i)}</small></div>`).join('')}</div>
  <div class="section-t">Personalização</div>
  <div class="card tight">${[['avatar', 'Foto do caçador', 'Substitui o avatar ilustrado na ficha'], ['bg', 'Fundo da ficha', 'Imagem atrás do seu Status'], ['lvl', 'Imagem do level up', 'Aparece quando você sobe de nível']].map(([k, n, d]) => `<div class="li"><div class="lic" style="${ASSETS[k] ? `background:center/cover no-repeat url(${ASSETS[k]})` : ''}">${ASSETS[k] ? '' : ic('camera')}</div><div class="grow"><div class="lt">${n}</div><div class="ls">${d}</div></div><button class="btn sm" data-a="assetPick" data-k="${k}">${ASSETS[k] ? 'Trocar' : 'Escolher'}</button>${ASSETS[k] ? `<button class="icon-btn sm danger" data-a="assetDel" data-k="${k}">${ic('trash')}</button>` : ''}</div>`).join('')}
  <div class="xs dim" style="padding:8px 0 4px">${ic('lock')} As imagens ficam só neste aparelho.</div></div>
  <div class="section-t">Sons</div>
  <div class="card tight">${SOUNDS.map(([k, n]) => { const c = !!ASSETS['snd-' + k]; return `<div class="li"><button class="icon-btn sm acc" data-a="sndTest" data-k="${k}" aria-label="Ouvir ${n}">${ic('play')}</button><div class="grow"><div class="lt">${n}</div><div class="ls">${c ? '<span class="acc">Arquivo seu</span>' : 'Som padrão do FOCO'}</div></div><button class="btn sm" data-a="sndPick" data-k="${k}">${c ? 'Trocar' : 'Escolher'}</button>${c ? `<button class="icon-btn sm danger" data-a="sndDel" data-k="${k}" aria-label="Voltar ao som padrão">${ic('trash')}</button>` : ''}</div>`; }).join('')}
  <div class="xs dim" style="padding:8px 0 4px">Escolha um áudio do celular (mp3, m4a, wav, até 3 MB). Toca no máximo 10 segundos. Os arquivos ficam só neste aparelho.</div></div>
  <div class="section-t">Hábitos diários</div>
  <div class="card tight">${S.habits.list.map(h => `<div class="kv"><span style="color:var(--tx)">${esc(h.n)} ${h.auto ? '<span class="tag">auto</span>' : ''}</span><button class="icon-btn sm danger" data-a="habitDel" data-id="${h.id}">${ic('trash')}</button></div>`).join('')}
  ${S.habits.list.length ? '' : '<div class="small mut" style="padding:6px 0">Nenhum hábito ainda. Cada um cumprido vale +5 XP por dia.</div>'}
  <div class="row" style="padding-top:10px"><input class="inp grow" id="habitNew" placeholder="Novo hábito" style="height:44px"><button class="icon-btn acc" data-a="habitAdd">${ic('plus')}</button></div>
  ${DEFAULT_HABITS.some(h => !S.habits.list.some(x => x.id === h.id)) ? `<div class="xs mut" style="margin:12px 0 8px">Sugestões (toque para adicionar)</div><div class="chips" style="flex-wrap:wrap">${DEFAULT_HABITS.map((h, i) => S.habits.list.some(x => x.id === h.id) ? '' : `<button class="chip" data-a="habitSug" data-i="${i}">+ ${h.n}${h.auto ? ' (auto)' : ''}</button>`).join('')}</div>` : ''}</div>
  <div class="section-t">Lembretes</div>
  <div class="card tight">
    <div class="kv"><span style="color:var(--tx)">Notificações</span>${notifOk ? toggle(st.notif, 'notifToggle') : '<span class="small mut">Não suportado</span>'}</div>
    <div class="kv"><span>Lembrete de treino</span><input type="time" class="inp" style="width:120px;height:38px" data-ch="trainTime" value="${st.trainTime || ''}"></div>
    <div class="kv"><span>Lembrete de água</span><select class="inp" style="width:140px;height:38px" data-ch="waterEvery">${[[0, 'Desligado'], [1, 'A cada 1h'], [2, 'A cada 2h'], [3, 'A cada 3h']].map(([v, l]) => `<option value="${v}" ${+st.waterEvery === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="xs dim" style="padding:8px 0 4px">No celular, os lembretes funcionam melhor com o FOCO instalado na tela inicial e aberto em segundo plano. No iPhone, só funcionam com o app instalado.</div>
  </div>
  <div class="section-t">Preferências</div>
  <div class="card tight"><div class="kv"><span style="color:var(--tx)">Sons do app</span>${toggle(st.sound, 'setToggle', 'data-k="sound"')}</div><div class="kv"><span style="color:var(--tx)">Vibração</span>${toggle(st.vibrate, 'setToggle', 'data-k="vibrate"')}</div></div>
  <div class="section-t">Seus dados</div>
  <div class="stack"><button class="btn block" data-a="exportData">${ic('download')} Exportar backup</button><button class="btn block" data-a="importData">${ic('upload')} Importar backup</button><button class="btn block danger" data-a="resetAll">${ic('trash')} Apagar tudo</button></div>
  <div class="xs dim center" style="margin:24px 0 4px">FOCO v1.0 · dados salvos só neste aparelho</div>`;
}
function profileSheet() {
  const d = UI.pf;
  const sel = (k, src) => `<select class="inp" data-ch="pf" data-k="${k}">${Object.entries(src).map(([v, o]) => `<option value="${v}" ${d[k] === v ? 'selected' : ''}>${o.n}</option>`).join('')}</select>`;
  openSheet(`${sheetHead('Editar perfil')}
  <div class="field"><label>Nome</label><input class="inp" data-in="pf" data-k="name" value="${esc(d.name)}"></div>
  <div class="grid2"><div class="field"><label>Idade</label><input class="inp" type="number" inputmode="numeric" data-in="pf" data-k="age" value="${esc(d.age)}"></div><div class="field"><label>Altura (cm)</label><input class="inp" type="number" inputmode="numeric" data-in="pf" data-k="height" value="${esc(d.height)}"></div></div>
  <div class="field"><label>Peso-meta (kg)</label><input class="inp" type="number" inputmode="decimal" data-in="pf" data-k="goalWeight" value="${esc(d.goalWeight)}"></div>
  <div class="field"><label>Foco</label>${sel('focus', FOCUS)}</div>
  <div class="field"><label>Local de treino</label>${sel('location', LOCATION)}</div>
  <div class="field"><label>Nível</label>${sel('level', LEVEL)}</div>
  <div class="field"><label>Dias de treino</label>${daysPicker(d.weekdays, 'pfDay')}</div>
  <div class="xs dim" style="margin-bottom:14px">Mudar foco, local, nível ou dias gera um novo plano de treino (o histórico é mantido).</div>
  <button class="btn pri block" data-a="profSave">Salvar</button>`);
}

/* ---------- backup ---------- */
async function exportBackup() {
  let photos = []; try { photos = await DB.all(); } catch (e) { }
  const txt = JSON.stringify({ app: 'FOCO', v: 1, date: new Date().toISOString(), state: S, photos });
  openSheet(`${sheetHead('Exportar backup', `${fmt(txt.length / 1024)} KB · ${photos.length} imagens`)}
  <p class="small mut" style="margin:0 0 12px">Copie o texto abaixo e guarde num arquivo ou nota. Para restaurar, use "Importar backup" e cole esse mesmo texto.</p>
  <textarea class="inp backup-txt" id="bkOut" readonly></textarea>
  <button class="btn pri block" data-a="bkCopy">${ic('copy')} Copiar backup</button>`);
  $('#bkOut').value = txt;
}
function importSheet() {
  openSheet(`${sheetHead('Importar backup')}
  <p class="small mut" style="margin:0 0 12px">Cole o texto do backup ou escolha um arquivo .json exportado pelo FOCO.</p>
  <textarea class="inp backup-txt" id="bkIn" placeholder='{"app":"FOCO", ...}'></textarea>
  <div class="stack"><button class="btn pri block" data-a="bkPaste">${ic('upload')} Importar texto colado</button><button class="btn block" data-a="bkFile">Escolher arquivo</button></div>`);
}
async function importBackup(file) { return importText(await file.text()); }
async function importText(raw) {
  try {
    const data = JSON.parse(raw);
    if (data.app !== 'FOCO' || !data.state) throw new Error('arquivo inválido');
    confirmSheet('Importar backup', `Backup de ${new Date(data.date).toLocaleDateString('pt-BR')}. Isso substitui todos os dados atuais deste aparelho.`, 'Importar', async () => {
      S = Object.assign(defaultState(), data.state); S.sys = Object.assign(defaultState().sys, S.sys || {}); save();
      try { await DB.clear(); for (const p of data.photos || []) await DB.put(p); } catch (e) { }
      await loadPhotos(); closeSheet(); go('home'); render(); toast('Backup importado');
    });
  } catch (e) { toast('Arquivo de backup inválido', 'info'); }
}

/* ---------- lembretes ---------- */
function checkReminders() {
  if (!S.profile || !S.settings.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(), k = dkey(now), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`, L = S.lastRem;
  if (S.settings.trainTime && hm >= S.settings.trainTime && L.train !== k && S.profile.weekdays.includes(now.getDay()) && !S.sessions.some(s => s.date === k) && !S.active) {
    L.train = k; save();
    const d = S.plan.days[S.plan.nextIdx % S.plan.days.length];
    notify('Hora do treino', `Treino ${d ? d.letter : ''} te esperando. Sem desculpas.`);
  }
  const ev = +S.settings.waterEvery, w = S.water[k] || 0, goal = targets().water;
  if (ev && now.getHours() >= 8 && now.getHours() < 22 && w < goal && Date.now() - (L.water || 0) > ev * 3.6e6) {
    L.water = Date.now(); save();
    notify('Bebe água', `${fmt(w / 1000, 2)} L de ${fmt(goal / 1000, 2)} L hoje.`);
  }
}
setInterval(checkReminders, 30000);

/* =====================================================================
   AÇÕES (cliques)
   ===================================================================== */
const A = {
  vulto: () => vultoSheet(),
  vView: el => vultoView(+el.dataset.i),
  vStrike: () => vultoStrike(),
  go: el => go(el.dataset.r),
  closeSheet,
  confirmYes: () => { const f = PENDING; PENDING = null; closeSheet(); f && f(); },

  // onboarding
  obNext: () => { const err = obValidate(); if (err) return toast(err, 'info'); OB.step++; render(); window.scrollTo(0, 0); },
  obBack: () => { OB.step = Math.max(0, OB.step - 1); render(); },
  obPick: el => { OB.d[el.dataset.k] = el.dataset.v; render(); },
  obDay: el => { const v = +el.dataset.v, w = OB.d.weekdays; OB.d.weekdays = w.includes(v) ? w.filter(x => x !== v) : [...w, v]; render(); },
  obFinish: () => {
    const p = obProfile(); p.createdAt = Date.now(); p.startWeight = p.weight;
    S.profile = p; S.plan = genPlan(p); S.weights = [{ date: dkey(), kg: p.weight }];
    S.sys = defaultState().sys; S.sys.lastCheck = dkey(); sysLog('Caçador registrado. Rank inicial: E');
    save(); location.hash = 'home'; render();
    sysPop('msg', { h: 'Sistema', msg: `Avaliação concluída.<br>Bem-vindo, <b>${esc(p.name.split(' ')[0])}</b>.`, sub: 'Rank inicial: E · Nível 1.<br>Sua primeira missão diária já está disponível. Cumpra todos os dias ou enfrente a Zona de Penalidade.', btn: 'Aceitar' });
  },
  popClose: () => { POPQ.shift(); if (POPQ.length) showPop(); else { const el = $('#sysPop'); if (el) el.remove(); } },
  qAdd: el => { const q = getQuest(), i = +el.dataset.i; questSet(i, q.v[i] + +el.dataset.v); },
  qFill: el => { const q = getQuest(), i = +el.dataset.i; questSet(i, q.t[i]); },
  statusFull: () => openSheet(`${sheetHead('Ficha', `Rank ${sysInfo().R.r} · Nível ${sysInfo().lvl}`)}${statusWin()}`),
  undo: () => { const f = UNDO; UNDO = null; $('#toast').classList.remove('show'); if (f) { f(); save(); render(); toast('Desfeito'); } },
  exam: examSheet,
  examSubmit,
  points: pointsSheet,
  ptAdd: el => { if (S.sys.pts <= 0) return; S.sys.pts--; S.sys.alloc[el.dataset.k] = (S.sys.alloc[el.dataset.k] || 0) + 1; sysLog(`+1 ${el.dataset.k}`); save(); render(); pointsSheet(); },
  dClaim: el => {
    const w = getWeek(), i = +el.dataset.i; if (w.claimed[i] || weekProgress(w)[i] < w.t[i]) return;
    w.claimed[i] = true; save(); render(); dgFx(String(i)); playSound('gate');
    const all = w.claimed.every(Boolean);
    if (all) setTimeout(() => { dgFx('b'); playSound('chains'); }, 700);
    setTimeout(() => {
      sysPop('msg', { snd: 'quest', h: 'Masmorra concluída', msg: `${DUNGEONS[i][0]} concluída.`, sub: `Recompensa: +150 XP e +75 Ouro.${all ? '<br><b style="color:#ff8ea3">Os selos se romperam. O Chefe da semana apareceu.</b>' : ''}` });
      grantXP(150, DUNGEONS[i][0], true); checkAch();
    }, all ? 1500 : 950);
  },
  dBoss: () => {
    const w = getWeek(); if (w.boss || !w.claimed.every(Boolean)) return;
    w.boss = true; S.sys.bosses = (S.sys.bosses || 0) + 1; save(); render(); dgFx('b'); playSound('gate');
    setTimeout(() => {
      sysPop('msg', { snd: 'rank', h: 'Chefe derrotado', msg: 'Você limpou todas as masmorras da semana.', sub: 'Recompensa: +200 XP e +100 Ouro.' });
      grantXP(200, 'Chefe da semana', true); checkAch();
    }, 1100);
  },
  shop: shopSheet,
  shopSug: el => { const [n, c] = SHOP_SUG[+el.dataset.i]; $('#rwN').value = n; $('#rwC').value = c; },
  shopAdd: () => { const n = $('#rwN').value.trim(), c = Math.round(num($('#rwC').value)); if (!n) return toast('Dê um nome à recompensa', 'info'); if (c <= 0) return toast('Defina um preço em Ouro', 'info'); S.sys.shop.push({ id: uid(), n, cost: c }); save(); shopSheet(); toast('Recompensa criada', 'medal'); },
  shopDel: el => {
    const i = S.sys.shop.findIndex(r => r.id === el.dataset.id); if (i < 0) return;
    const [r] = S.sys.shop.splice(i, 1); save(); shopSheet();
    toastUndo(`${r.n} removida`, () => { S.sys.shop.splice(i, 0, r); if (SH.state === 'open') shopSheet(); });
  },
  buy: el => {
    const r = S.sys.shop.find(x => x.id === el.dataset.id); if (!r || S.sys.gold < r.cost) return;
    confirmSheet('Resgatar recompensa', `${esc(r.n)} por ${fmt(r.cost)} Ouro?`, 'Resgatar', () => {
      S.sys.gold -= r.cost; S.sys.bought.unshift({ n: r.n, cost: r.cost, ts: Date.now() }); sysLog(`Recompensa resgatada: ${r.n} (−${r.cost} Ouro)`); save(); render();
      sysPop('msg', { snd: 'xp', h: 'Recompensa', msg: `${esc(r.n)}`, sub: 'Resgatada. Você mereceu. Aproveite e volte mais forte.' }); checkAch();
    });
  },
  habitSug: el => { const h = DEFAULT_HABITS[+el.dataset.i]; if (S.habits.list.some(x => x.id === h.id)) return; S.habits.list.push({ ...h }); save(); render(); },
  equip: el => { const id = el.dataset.id; S.sys.title = S.sys.title === id ? null : id; save(); render(); toast(S.sys.title ? `Título equipado: ${ACH.find(a => a.id === id).n}` : 'Título removido', 'medal'); },

  // home
  water: el => { const k = route() === 'nutri' ? UI.nd : dkey(); S.water[k] = Math.max(0, (S.water[k] || 0) + +el.dataset.v); save(); render(); if (k === dkey() && S.water[k] >= targets().water) awardDaily('agua', 10, 'Meta de água'); checkAch(); },
  sleep: el => { const k = dkey(), cur = S.sleep[k]; S.sleep[k] = cur ? clamp(cur + +el.dataset.v, 0, 14) : (+el.dataset.v > 0 ? 7 : 6.5); save(); render(); if (S.sleep[k] >= 7) awardDaily('sono', 10, 'Sono de 7h+'); checkAch(); },
  habit: el => {
    const h = S.habits.list.find(x => x.id === el.dataset.id); if (!h) return;
    if (h.auto) return toast({ treino: 'Marca sozinho quando você finaliza um treino', agua: 'Marca sozinho ao bater a meta de água', proteina: 'Marca sozinho ao bater a meta de proteína', sono: 'Marca sozinho com 7h+ de sono registradas' }[h.id] || 'Automático', 'info');
    const k = dkey(), log = S.habits.log[k] = S.habits.log[k] || [];
    const i = log.indexOf(h.id); if (i >= 0) log.splice(i, 1); else log.push(h.id);
    save(); render(); if (i < 0) awardDaily('h-' + h.id, 5, h.n); checkAch();
  },

  // treino
  tt: el => { UI.tt = el.dataset.v; render(); },
  openWk: el => openWk(el.dataset.k, +el.dataset.i),
  startWk: el => startWorkout(el.dataset.k, +el.dataset.i || 0),
  regenPlan: () => confirmSheet('Gerar plano novamente', 'O plano atual (incluindo as edições que você fez) será substituído por um novo com base no seu perfil.', 'Gerar novo plano', () => { S.plan = genPlan(S.profile); save(); render(); toast('Plano atualizado'); }),
  newWk: () => openSheet(`${sheetHead('Novo treino')}<div class="field"><label>Nome</label><input class="inp" id="nwName" placeholder="Ex.: Braço pesado"></div><button class="btn pri block" data-a="newWkSave">Criar e adicionar exercícios</button>`),
  newWkSave: () => { const n = $('#nwName').value.trim(); if (!n) return toast('Dê um nome ao treino', 'info'); S.customWorkouts.push({ id: uid(), name: n, items: [] }); save(); render(); const i = S.customWorkouts.length - 1; openPicker({ mode: 'add', kind: 'custom', idx: i }); },
  delWk: el => confirmSheet('Excluir treino', 'Esse treino será removido. O histórico continua salvo.', 'Excluir', () => { S.customWorkouts.splice(+el.dataset.i, 1); save(); render(); }, true),
  itUp: el => { const w = wkRef(el.dataset.k, +el.dataset.i), ii = +el.dataset.ii; [w.items[ii - 1], w.items[ii]] = [w.items[ii], w.items[ii - 1]]; save(); render(); openWk(el.dataset.k, +el.dataset.i); },
  itEdit: el => itemEditSheet(el.dataset.k, +el.dataset.i, +el.dataset.ii),
  itSave: el => {
    const it = wkRef(el.dataset.k, +el.dataset.i).items[+el.dataset.ii];
    it.sets = clamp(Math.round(num($('#ieSets').value)) || 1, 1, 12); it.rest = clamp(Math.round(num($('#ieRest').value)), 0, 600);
    if ($('#ieTime')) it.time = clamp(Math.round(num($('#ieTime').value)) || 30, 5, 3600); else it.reps = $('#ieReps').value.trim();
    save(); render(); openWk(el.dataset.k, +el.dataset.i);
  },
  itSwap: el => { const it = wkRef(el.dataset.k, +el.dataset.i).items[+el.dataset.ii]; openPicker({ mode: 'swap', kind: el.dataset.k, idx: +el.dataset.i, ii: +el.dataset.ii, m: getEx(it.exId).m }); },
  itDel: el => {
    const k = el.dataset.k, i = +el.dataset.i, ii = +el.dataset.ii, w = wkRef(k, i), [it] = w.items.splice(ii, 1);
    save(); render(); openWk(k, i);
    toastUndo(`${getEx(it.exId).n} removido`, () => { const w2 = wkRef(k, i); if (!w2) return; w2.items.splice(ii, 0, it); if (SH.state === 'open') openWk(k, i); });
  },
  itAdd: el => openPicker({ mode: 'add', kind: el.dataset.k, idx: +el.dataset.i }),
  pickM: el => { UI.pick.m = el.dataset.v; renderPicker(); },
  pickEx: el => {
    const ex = getEx(el.dataset.id), it = prescribe(ex), c = PICK;
    if (c.kind === 'active') {
      if (c.mode === 'swap') { const old = S.active.exercises[c.ei]; const n = itemToActive({ ...it, sets: old.sets.length }); S.active.exercises[c.ei] = n; }
      else S.active.exercises.push(itemToActive(it));
      save(); closeSheet(); render(); toast(ex.n + (c.mode === 'swap' ? ' no lugar' : ' adicionado'));
      return;
    }
    const w = wkRef(c.kind, c.idx);
    if (c.mode === 'swap') w.items[c.ii] = it; else w.items.push(it);
    save(); render();
    if (c.mode === 'add') { toast(ex.n + ' adicionado'); renderPicker(); } else openWk(c.kind, c.idx);
  },
  exInfo: el => exSheet(el.dataset.id),
  libM: el => { UI.libM = el.dataset.v; render(); },
  newEx: () => openSheet(`${sheetHead('Novo exercício')}<div class="field"><label>Nome</label><input class="inp" id="neName" placeholder="Ex.: Remada cavalinho"></div><div class="field"><label>Grupo muscular</label><select class="inp" id="neM">${MUSCLES.slice(1).map(m => `<option>${m}</option>`).join('')}</select></div><div class="field"><label>Tipo</label><select class="inp" id="neT"><option value="">Séries × repetições (com carga)</option><option value="time">Por tempo (segundos)</option></select></div><div class="field"><label>Como fazer (opcional)</label><textarea class="inp" id="neI" style="height:90px;padding:12px"></textarea></div><button class="btn pri block" data-a="newExSave">Salvar exercício</button>`),
  newExSave: () => { const n = $('#neName').value.trim(); if (!n) return toast('Dê um nome ao exercício', 'info'); const e = { id: 'c-' + uid(), n, m: $('#neM').value, s: 'custom', e: 'c', i: $('#neI').value.trim() }; if ($('#neT').value) e.t = 'time'; S.customExercises.push(e); save(); closeSheet(); render(); toast('Exercício criado'); },
  delEx: el => confirmSheet('Excluir exercício', 'O exercício sai da biblioteca. Treinos que já usam ele vão mostrar "Exercício removido".', 'Excluir', () => { S.customExercises = S.customExercises.filter(e => e.id !== el.dataset.id); save(); render(); }, true),
  sessInfo: el => sessSheet(el.dataset.id),
  delSess: el => confirmSheet('Apagar treino', 'Esse registro sai do histórico e das estatísticas.', 'Apagar', () => { S.sessions = S.sessions.filter(s => s.id !== el.dataset.id); save(); render(); }, true),

  // treino ativo
  setDone: el => {
    const ex = S.active.exercises[+el.dataset.ei], si = +el.dataset.si, s = ex.sets[si];
    if (s.done) { s.done = false; save(); render(); return; }
    const ph = setPh(ex, si);
    if (isTime(ex)) { if (s.time === '') s.time = ph.time; }
    else { if (s.kg === '') s.kg = ph.kg === '' ? 0 : ph.kg; if (s.reps === '') s.reps = ph.reps || 0; }
    s.done = true;
    if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(12); } catch (e) { }
    playSound('set');
    save(); render();
    const all = S.active.exercises.every(e => e.sets.every(x => x.done));
    if (all) { TM = null; hideTimer(); toast('Todas as séries feitas. Finaliza o treino!', 'trophy'); }
    else startTimer(ex.rest, 'Descanso');
  },
  woPlay: el => {
    const ei = +el.dataset.ei, si = +el.dataset.si, ex = S.active.exercises[ei], s = ex.sets[si];
    const secs = num(s.time) || setPh(ex, si).time;
    startTimer(secs, `${getEx(ex.exId).n} · série ${si + 1}`, true, () => {
      if (!S.active) return; const st = S.active.exercises[ei]?.sets[si]; if (!st) return;
      st.time = st.time || secs; st.done = true; save(); render(); startTimer(ex.rest, 'Descanso');
    });
  },
  woAddSet: el => { const ex = S.active.exercises[+el.dataset.ei], last = ex.sets[ex.sets.length - 1]; ex.sets.push({ kg: last ? last.kg : '', reps: '', time: '', done: false }); save(); render(); },
  woRmSet: el => { const ex = S.active.exercises[+el.dataset.ei]; if (ex.sets.length > 1) ex.sets.pop(); save(); render(); },
  woRest: el => { const ei = +el.dataset.ei; openSheet(`${sheetHead('Descanso', esc(getEx(S.active.exercises[ei].exId).n))}<div class="grid3">${[30, 45, 60, 90, 120, 180].map(v => `<button class="btn ${S.active.exercises[ei].rest === v ? 'pri' : ''}" data-a="woRestSet" data-ei="${ei}" data-v="${v}">${v}s</button>`).join('')}</div>`); },
  woRestSet: el => { S.active.exercises[+el.dataset.ei].rest = +el.dataset.v; save(); closeSheet(); render(); },
  woSwap: el => { const ex = S.active.exercises[+el.dataset.ei]; openPicker({ mode: 'swap', kind: 'active', ei: +el.dataset.ei, m: getEx(ex.exId).m }); },
  woDelEx: el => confirmSheet('Remover exercício', 'Tirar esse exercício do treino de hoje?', 'Remover', () => { S.active.exercises.splice(+el.dataset.ei, 1); save(); render(); }, true),
  woAddEx: () => openPicker({ mode: 'add', kind: 'active' }),
  woFinishAsk: () => {
    const a = S.active, ds = doneSets(a), ts = totalSets(a);
    openSheet(`${sheetHead('Finalizar treino?')}<div class="grid2" style="margin-bottom:16px"><div class="stat"><div class="v">${mmss((Date.now() - a.start) / 1000)}</div><div class="l">duração</div></div><div class="stat"><div class="v">${ds}/${ts}</div><div class="l">séries feitas</div></div></div>${ds < ts ? `<p class="small mut" style="margin-top:0">Ainda faltam ${ts - ds} séries. Só as marcadas como feitas serão salvas.</p>` : ''}<div class="stack"><button class="btn ok block" data-a="woFinish">${ic('check')} Salvar treino</button><button class="btn ghost block" data-a="closeSheet">Continuar treinando</button></div>`);
  },
  woFinish: finishWorkout,
  woCancel: () => confirmSheet('Descartar treino', 'Nada desse treino será salvo.', 'Descartar', () => { S.active = null; TM = null; hideTimer(); save(); go('home'); }, true),
  tmAdd: el => { if (!TM) return; TM.end += +el.dataset.v * 1000; TM.total = Math.max(TM.total + +el.dataset.v, 1); if (TM.end <= Date.now()) TM.end = Date.now() + 1000; },
  tmSkip: () => { if (TM) timerEnd(true); },

  // nutrição
  nd: el => { const n = addDays(UI.nd, +el.dataset.v); if (n > dkey()) return; UI.nd = n; render(); },
  foodAdd: el => { UI.fs = { meal: el.dataset.v, tab: 'busca', q: '', sel: null, g: '', saveMine: true }; foodSheet(); },
  fsTab: el => { UI.fs.tab = el.dataset.v; foodSheet(); },
  fsMine: el => { UI.fs.saveMine = !UI.fs.saveMine; el.classList.toggle('on', UI.fs.saveMine); },
  fsPick: (el, e) => { if (e.target.closest('[data-a="myFoodDel"]')) return; UI.fs.sel = { src: el.dataset.src, id: el.dataset.src === 'db' ? +el.dataset.id : el.dataset.id }; UI.fs.g = el.dataset.src === 'db' ? String(FOODS[+el.dataset.id][5]) : '1'; $('#fsSel').innerHTML = fsSelHtml(); $('#sheet').scrollTop = 0; },
  fsUnsel: () => { UI.fs.sel = null; $('#fsSel').innerHTML = ''; },
  fsAdd: () => { const c = fsCalc(); if (!c || num(UI.fs.g) <= 0) return toast('Informe a quantidade', 'info'); addFood(c); },
  myFoodDel: el => {
    const i = S.myFoods.findIndex(f => f.id === el.dataset.id); if (i < 0) return;
    const [f] = S.myFoods.splice(i, 1); save(); $('#fsList').innerHTML = fsListHtml();
    toastUndo(`${f.name} removido`, () => { S.myFoods.splice(i, 0, f); const l = $('#fsList'); if (l) l.innerHTML = fsListHtml(); });
  },
  mfAdd: () => {
    const name = $('#mfName').value.trim(); if (!name) return toast('Dê um nome ao alimento', 'info');
    const e = { name, g: 0, kcal: Math.round(num($('#mfK').value)), p: r1(num($('#mfP').value)), c: r1(num($('#mfC').value)), f: r1(num($('#mfF').value)) };
    if (!e.kcal) e.kcal = Math.round(e.p * 4 + e.c * 4 + e.f * 9);
    if (UI.fs.saveMine) S.myFoods.unshift({ id: uid(), name: e.name, kcal: e.kcal, p: e.p, c: e.c, f: e.f });
    addFood(e);
  },
  foodDel: el => {
    const k = UI.nd, arr = S.food[k] || [], i = arr.findIndex(f => f.id === el.dataset.id); if (i < 0) return;
    const [f] = arr.splice(i, 1); save(); render();
    toastUndo(`${f.name} removido`, () => { (S.food[k] = S.food[k] || []).splice(i, 0, f); });
  },
  copyDay: () => { const k = UI.nd, y = S.food[addDays(k, -1)] || []; S.food[k] = y.map(f => ({ ...f, id: uid() })); save(); render(); toast('Refeições de ontem copiadas'); checkAch(); },
  fastProto: el => { S.fasting.protocol = +el.dataset.v; save(); render(); },
  fastStart: () => { S.fasting.start = Date.now(); save(); render(); toast(`Jejum de ${S.fasting.protocol}h iniciado`, 'clock'); },
  fastStop: () => {
    const f = S.fasting, h = (Date.now() - f.start) / 3.6e6;
    const stop = () => { f.history.push({ start: f.start, end: Date.now(), goal: f.protocol }); f.start = null; save(); render(); toast(h >= f.protocol ? `Jejum concluído: ${fmt(h, 1)}h` : `Jejum encerrado: ${fmt(h, 1)}h`, 'clock'); checkAch(); };
    if (h < f.protocol) confirmSheet('Encerrar jejum?', `Você está em ${fmt(h, 1)}h de ${f.protocol}h.`, 'Encerrar', stop, true); else stop();
  },

  // corpo
  weightAdd: () => openSheet(`${sheetHead('Registrar peso', 'Pese de manhã, em jejum, depois do banheiro.')}<div class="field"><label>Peso de hoje</label><div class="inp-unit"><input class="inp" id="wIn" type="number" inputmode="decimal" step="0.1" value="${curWeight()}"><span>kg</span></div></div><button class="btn pri block" data-a="weightSave">Salvar</button>`),
  weightSave: () => {
    const kg = r1(num($('#wIn').value)); if (kg < 30 || kg > 300) return toast('Peso inválido', 'info');
    const k = dkey(); S.weights = S.weights.filter(w => w.date !== k); S.weights.push({ date: k, kg }); S.weights.sort((a, b) => a.date < b.date ? -1 : 1);
    save(); closeSheet(); render(); toast('Peso registrado', 'scale'); checkAch();
  },
  weightDel: el => {
    if (S.weights.length <= 1) return toast('Mantenha pelo menos um registro', 'info');
    const w = S.weights.find(x => x.date === el.dataset.v); if (!w) return;
    S.weights = S.weights.filter(x => x !== w); save(); render();
    toastUndo(`Peso de ${dShort(w.date)} removido`, () => { S.weights.push(w); S.weights.sort((a, b) => a.date < b.date ? -1 : 1); });
  },
  measAdd: () => { const l = S.measures[S.measures.length - 1] || {}; openSheet(`${sheetHead('Registrar medidas', 'Fita métrica justa, sem apertar. Mesmo horário sempre.')}<div class="grid2">${MEASURES.map(([k, lb]) => `<div class="field"><label>${lb}</label><div class="inp-unit"><input class="inp" id="m_${k}" type="number" inputmode="decimal" step="0.1" placeholder="${l[k] || ''}"><span>${k === 'bf' ? '%' : 'cm'}</span></div></div>`).join('')}</div><button class="btn pri block" data-a="measSave">Salvar</button>`); },
  measSave: () => {
    const m = { date: dkey() }; let any = false;
    MEASURES.forEach(([k]) => { const v = num($('#m_' + k).value); if (v > 0) { m[k] = r1(v); any = true; } });
    if (!any) return toast('Preencha pelo menos uma medida', 'info');
    const ex = S.measures.find(x => x.date === m.date);
    if (ex) Object.assign(ex, m); else S.measures.push(m);
    save(); closeSheet(); render(); toast('Medidas salvas', 'ruler');
  },
  mk: el => { UI.mk = el.dataset.v; render(); },
  photoAdd: () => { UI.photoKind = null; $('#photoInput').click(); },
  sndTest: el => playSound(el.dataset.k, true),
  sndPick: el => { UI.sndKind = el.dataset.k; $('#soundInput').click(); },
  sndDel: async el => { await DB.del('asset-snd-' + el.dataset.k); delete SND.buf[el.dataset.k]; await loadPhotos(); render(); toast('Som padrão restaurado'); },
  assetPick: el => { UI.photoKind = el.dataset.k; $('#photoInput').click(); },
  assetDel: async el => { await DB.del('asset-' + el.dataset.k); await loadPhotos(); render(); toast('Imagem removida'); },
  photo: el => {
    const id = el.dataset.id;
    if (UI.cmpMode) { const i = UI.cmp.indexOf(id); if (i >= 0) UI.cmp.splice(i, 1); else if (UI.cmp.length < 2) UI.cmp.push(id); render(); return; }
    const ph = PHOTOS.find(p => p.id === id); if (!ph) return;
    openSheet(`${sheetHead(dShort(ph.date), WDL[parseKey(ph.date).getDay()])}<img src="${ph.data}" style="width:100%;border-radius:14px;display:block;margin-bottom:14px"><button class="btn danger block" data-a="photoDel" data-id="${id}">${ic('trash')} Apagar foto</button>`);
  },
  photoDel: el => confirmSheet('Apagar foto', 'A foto será removida deste aparelho.', 'Apagar', async () => { await DB.del(el.dataset.id); await loadPhotos(); render(); }, true),
  cmpMode: () => { UI.cmpMode = !UI.cmpMode; UI.cmp = []; render(); },
  cmpShow: () => {
    const [a, b] = UI.cmp.map(id => PHOTOS.find(p => p.id === id)).sort((x, y) => x.date < y.date ? -1 : 1);
    const days = Math.round((parseKey(b.date) - parseKey(a.date)) / 864e5);
    openSheet(`${sheetHead('Antes e depois', `${days} dias de diferença`)}<div class="compare"><div><img src="${a.data}"><div class="center small mut" style="margin-top:6px">${dShort(a.date)}</div></div><div><img src="${b.data}"><div class="center small mut" style="margin-top:6px">${dShort(b.date)}</div></div></div>`);
  },

  // perfil
  profEdit: () => { UI.pf = { ...S.profile, weekdays: [...S.profile.weekdays] }; profileSheet(); },
  pfDay: el => { const v = +el.dataset.v, w = UI.pf.weekdays; UI.pf.weekdays = w.includes(v) ? w.filter(x => x !== v) : [...w, v]; profileSheet(); },
  profSave: () => {
    const d = UI.pf, o = S.profile;
    if (!String(d.name).trim()) return toast('Digite seu nome', 'info');
    if (num(d.age) < 12 || num(d.height) < 120) return toast('Confira idade e altura', 'info');
    if (d.weekdays.length < 2 || d.weekdays.length > 6) return toast('Escolha de 2 a 6 dias', 'info');
    const np = { ...o, name: String(d.name).trim(), age: num(d.age), height: num(d.height), goalWeight: num(d.goalWeight) || o.goalWeight, focus: d.focus, location: d.location, level: d.level, weekdays: [...d.weekdays].sort() };
    const regen = np.focus !== o.focus || np.location !== o.location || np.level !== o.level || np.weekdays.join() !== o.weekdays.join();
    S.profile = np; if (regen) S.plan = genPlan(np);
    save(); closeSheet(); render(); toast(regen ? 'Perfil salvo e plano atualizado' : 'Perfil salvo'); checkAch();
  },
  habitAdd: () => { const n = $('#habitNew').value.trim(); if (!n) return; S.habits.list.push({ id: 'h-' + uid(), n }); save(); render(); },
  habitDel: el => {
    const i = S.habits.list.findIndex(h => h.id === el.dataset.id); if (i < 0) return;
    const [h] = S.habits.list.splice(i, 1); save(); render();
    toastUndo(`${h.n} removido`, () => { S.habits.list.splice(i, 0, h); });
  },
  notifToggle: async () => {
    if (S.settings.notif) { S.settings.notif = false; save(); render(); return; }
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Permissão de notificação negada no navegador', 'info'); return; }
    S.settings.notif = true; S.lastRem.water = Date.now(); save(); render(); notify('FOCO', 'Lembretes ativados. Sem desculpas.');
  },
  setToggle: el => { const k = el.dataset.k; S.settings[k] = !S.settings[k]; save(); render(); },
  install: async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; render(); },
  exportData: exportBackup,
  importData: importSheet,
  bkFile: () => $('#importInput').click(),
  bkPaste: () => { const v = $('#bkIn').value.trim(); if (!v) return toast('Cole o texto do backup', 'info'); importText(v); },
  bkCopy: () => {
    const ta = $('#bkOut');
    const fallback = () => { ta.focus(); ta.select(); toast('Texto selecionado. Copie com Ctrl+C ou segurando o dedo', 'info'); };
    try { navigator.clipboard.writeText(ta.value).then(() => toast('Backup copiado'), fallback); } catch (e) { fallback(); }
  },
  resetAll: () => confirmSheet('Apagar tudo', 'Todos os treinos, refeições, medidas e fotos deste aparelho serão apagados para sempre. Exporte um backup antes se quiser guardar.', 'Apagar tudo', async () => { try { localStorage.removeItem(KEY); } catch (e) { } try { await DB.clear(); } catch (e) { } location.hash = ''; location.reload(); }, true),
};

/* inputs com atualização ao digitar */
const IN = {
  ob: el => { OB.d[el.dataset.k] = el.value; },
  pf: el => { UI.pf[el.dataset.k] = el.value; },
  set: el => { const s = S.active?.exercises[+el.dataset.ei]?.sets[+el.dataset.si]; if (s) { s[el.dataset.f] = el.value.replace(',', '.'); save(); } },
  pickQ: el => { UI.pick.q = el.value; $('#pickList').innerHTML = pickList(); },
  libQ: el => { UI.libQ = el.value; $('#libList').innerHTML = libList(); },
  fsQ: el => { UI.fs.q = el.value; $('#fsList').innerHTML = fsListHtml(); },
  fsG: el => { UI.fs.g = el.value; const p = $('#fsPrev'); if (p) p.innerHTML = fsPrevTxt(fsCalc()); },
  wkName: el => { const w = S.customWorkouts[+el.dataset.i]; if (w && el.value.trim()) { w.name = el.value.trim(); save(); render(); } },
};
const CH = {
  trainTime: el => { S.settings.trainTime = el.value; save(); },
  waterEvery: el => { S.settings.waterEvery = +el.value; S.lastRem.water = Date.now(); save(); },
  pf: el => { UI.pf[el.dataset.k] = el.value; },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const f = A[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('input', e => { const k = e.target.dataset?.in; if (k && IN[k]) IN[k](e.target, e); });
document.addEventListener('change', e => { const k = e.target.dataset?.ch; if (k && CH[k]) CH[k](e.target, e); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'habitNew') A.habitAdd();
  if (e.key === 'Escape') closeSheet();
});
document.addEventListener('pointerdown', () => { if (!actx && S.settings.sound) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } else if (actx && actx.state === 'suspended') actx.resume(); }, { passive: true });

$('#photoInput').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const kind = UI.photoKind; UI.photoKind = null;
  try {
    const data = await compress(f);
    if (kind) { await DB.put({ id: 'asset-' + kind, kind, date: dkey(), ts: Date.now(), data }); await loadPhotos(); render(); toast('Imagem aplicada', 'camera'); return; }
    await DB.put({ id: uid(), date: dkey(), ts: Date.now(), data }); await loadPhotos(); render(); toast('Foto salva', 'camera'); checkAch();
  }
  catch (err) { toast('Não foi possível salvar a foto', 'info'); }
});
$('#soundInput').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; const k = UI.sndKind; UI.sndKind = null; if (!f || !k) return;
  if (f.size > 3 * 1024 * 1024) return toast('Arquivo grande demais (máx. 3 MB)', 'info');
  try {
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
    audioInit();
    const ab = await (await fetch(data)).arrayBuffer();
    await new Promise((res, rej) => actx.decodeAudioData(ab, res, rej));
    await DB.put({ id: 'asset-snd-' + k, kind: 'snd-' + k, date: dkey(), ts: Date.now(), data });
    delete SND.buf[k]; await loadPhotos(); render(); toast('Som aplicado'); playSound(k, true);
  } catch (err) { toast('Não foi possível ler esse áudio', 'info'); }
});
$('#importInput').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBackup(f); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (route() === 'perfil') render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); if (route() === 'home' || route() === 'nutri') render(); } });

/* ---------- acessibilidade: nomes para botões só com ícone ---------- */
const ARIA = {
  closeSheet: 'Fechar', obBack: 'Voltar', profEdit: 'Editar perfil', itUp: 'Mover para cima', itEdit: 'Ajustar séries e descanso',
  itSwap: 'Trocar exercício', itDel: 'Remover exercício', woSwap: 'Trocar exercício', woDelEx: 'Remover exercício do treino',
  setDone: 'Marcar série como feita', woPlay: 'Iniciar cronômetro da série', woRmSet: 'Remover última série', foodAdd: 'Adicionar alimento',
  foodDel: 'Remover alimento', myFoodDel: 'Apagar dos meus alimentos', fsUnsel: 'Limpar seleção', weightDel: 'Apagar registro de peso',
  habitDel: 'Apagar hábito', habitAdd: 'Adicionar hábito', shopDel: 'Apagar recompensa', shopAdd: 'Criar recompensa', ptAdd: 'Adicionar ponto',
  assetDel: 'Remover imagem', photoAdd: 'Adicionar foto', startWk: 'Começar treino livre',
  notifToggle: 'Notificações', fsMine: 'Salvar em meus alimentos', qFill: 'Completar este item da missão',
};
function labelIcons(root) {
  root.querySelectorAll('button:not([aria-label])').forEach(b => {
    if (b.textContent.trim()) return;
    const a = b.dataset.a, v = b.dataset.v;
    let l = ARIA[a];
    if (a === 'go') l = b.dataset.r === 'perfil' ? 'Perfil' : 'Voltar';
    if (a === 'nd') l = +v < 0 ? 'Dia anterior' : 'Próximo dia';
    if (a === 'sleep') l = +v < 0 ? 'Menos meia hora de sono' : 'Mais meia hora de sono';
    if (a === 'water') l = +v < 0 ? 'Remover 250 ml de água' : `Adicionar ${v} ml de água`;
    if (a === 'ptAdd') l = `Adicionar ponto em ${b.dataset.k}`;
    if (a === 'setToggle') l = { sound: 'Sons do app', vibrate: 'Vibração' }[b.dataset.k];
    if (l) b.setAttribute('aria-label', l);
  });
  root.querySelectorAll('button.toggle').forEach(b => { b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', b.classList.contains('on') ? 'true' : 'false'); });
}
const labelAll = () => ['#app', '#sheet', '#timer'].forEach(s => labelIcons($(s)));
new MutationObserver(muts => {
  if (muts.some(m => m.type === 'attributes' ? m.target.classList.contains('toggle') : [...m.addedNodes].some(n => n.nodeType === 1))) labelAll();
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
document.addEventListener('keydown', e => {
  const el = e.target.closest && e.target.closest('[role="button"][data-a]');
  if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); el.click(); }
});

/* ---------- início ---------- */
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
render();
loadPhotos().then(() => { if (['corpo', 'home', 'perfil'].includes(route())) render(); setTimeout(penaltyReminder, 400); });
checkReminders();
