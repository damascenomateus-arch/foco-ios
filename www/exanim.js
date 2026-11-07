'use strict';
/* =====================================================================
   FOCO — animações dos exercícios (ilustrações próprias)
   Cada movimento é descrito por ângulos das articulações em poses-chave.
   O gerador calcula as posições (cinemática direta), interpola as poses
   e devolve um SVG animado com SMIL — sem imagens externas.

   Convenções (figura de perfil, olhando para a direita):
   t  = tronco, ângulo a partir da vertical para cima (90 = inclinado para frente)
   a/b = braço e antebraço; c/d = coxa e canela — ângulo a partir de "apontando
         para baixo" (90 = para frente, 180 = para cima, -90 = para trás)
   a2..d2 = membros do outro lado (por padrão iguais; espelhados na vista frontal)
   ===================================================================== */
(() => {
  const L = { T: 28, N: 9, U: 14, F: 13, H: 17, S: 17 }, FLOOR = 92, RAD = Math.PI / 180, STEPS = 9;
  const dir = (ang, len) => [Math.sin(ang * RAD) * len, Math.cos(ang * RAD) * len];
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const mul = (p, s) => [p[0] * s, p[1] * s];

  /* ---------- poses-chave ---------- */
  const STAND = { t: 0, a: 0, b: 0, c: 0, d: 0 };
  const SQ_TOP = { t: 0, c: 0, d: 0 }, SQ_BOT = { t: 40, c: 85, d: -25 };
  const LIE = { t: -90, c: 72, d: 4 };
  const PATTERNS = {
    bench: { anchor: 'hip', hx: 60, hy: 70, props: ['bench'], dur: 2.4, k: [{ ...LIE, a: 180, b: 180 }, { ...LIE, a: 60, b: 180 }] },
    benchInc: { anchor: 'hip', hx: 64, hy: 70, props: ['bench'], dur: 2.4, k: [{ ...LIE, t: -58, a: 180, b: 180 }, { ...LIE, t: -58, a: 75, b: 180 }] },
    fly: { anchor: 'hip', hx: 60, hy: 70, props: ['bench'], dur: 2.6, k: [{ ...LIE, a: 180, b: 182 }, { ...LIE, a: 80, b: 100 }] },
    pullover: { anchor: 'hip', hx: 66, hy: 70, props: ['bench'], dur: 2.8, k: [{ ...LIE, a: 180, b: 180 }, { ...LIE, a: 262, b: 265 }] },
    skull: { anchor: 'hip', hx: 62, hy: 70, props: ['bench'], dur: 2.4, k: [{ ...LIE, a: 180, b: 180 }, { ...LIE, a: 200, b: 280 }] },
    pushup: { fx: 20, dur: 2, k: [{ t: 63, a: 0, b: 0, c: -63, d: -63 }, { t: 82, a: -100, b: 37, c: -82, d: -82 }] },
    pike: { fx: 26, dur: 2.2, k: [{ t: 120, a: 55, b: 55, c: -30, d: -30 }, { t: 140, a: 95, b: 40, c: -30, d: -30 }] },
    dip: { anchor: 'none', props: ['pbars'], dur: 2.2, k: [{ x: 59.8, y: 47.9, t: 5, a: 0, b: 0, c: 10, d: -60 }, { x: 65.5, y: 53.5, t: 20, a: -60, b: 0, c: 10, d: -60 }] },
    cableFly: { fx: 64, props: ['cableBack'], dur: 2.4, k: [{ t: 15, a: 150, b: 135, c: 12, d: 2, c2: -14, d2: -6 }, { t: 15, a: 62, b: 70, c: 12, d: 2, c2: -14, d2: -6 }] },
    pulldown: { fx: 80, props: ['seat', 'cableTop'], dur: 2.4, k: [{ t: -8, a: 180, b: 180, c: 90, d: 0 }, { t: -8, a: 330, b: 178, c: 90, d: 0 }] },
    pullup: { anchor: 'none', props: ['bar'], barY: 12, dur: 2.4, k: [{ x: 60, y: 64, a: 180, b: 180, c: 5, d: -35 }, { x: 64.8, y: 34.8, a: 340, b: 180, c: 5, d: -35 }] },
    hangingRaise: { anchor: 'none', props: ['bar'], barY: 12, dur: 2.4, k: [{ x: 60, y: 64, a: 180, b: 180, c: 0, d: 0 }, { x: 60, y: 64, a: 180, b: 180, c: 95, d: 95 }] },
    row: { fx: 66, dur: 2.2, k: [{ t: 70, a: 0, b: 0, c: 20, d: -5 }, { t: 70, a: -165, b: -10, c: 20, d: -5 }] },
    seatedRow: { fx: 90, props: ['cableFront'], dur: 2.4, k: [{ t: -2, a: 90, b: 90, c: 85, d: 95 }, { t: -12, a: -40, b: 85, c: 85, d: 95 }] },
    invRow: { fx: 18, props: ['barLow'], dur: 2.2, k: [{ t: 62, a: 178, b: 178, c: -62, d: -62 }, { t: 50, a: 310, b: 170, c: -50, d: -50 }] },
    press: { fx: 60, dur: 2.2, k: [{ ...STAND, a: 30, b: 180 }, { ...STAND, a: 178, b: 180 }] },
    overheadExt: { fx: 60, dur: 2.4, k: [{ ...STAND, a: 178, b: 180 }, { ...STAND, a: 172, b: 330 }] },
    lateral: { front: true, anchor: 'ground', dur: 2.2, k: [{ a: 12, b: 14, c: 4, d: 2 }, { a: 88, b: 92, c: 4, d: 2 }] },
    facePull: { fx: 66, props: ['cableFront'], dur: 2.2, k: [{ t: -5, a: 85, b: 88, c: 12, d: 0, c2: -12, d2: -2 }, { t: -5, a: 100, b: 200, c: 12, d: 0, c2: -12, d2: -2 }] },
    curl: { fx: 60, dur: 2, k: [{ ...STAND, a: 4, b: 4 }, { ...STAND, a: 10, b: 165 }] },
    pushdown: { fx: 60, props: ['cableTop'], dur: 2, k: [{ ...STAND, t: 10, a: 0, b: 140 }, { ...STAND, t: 10, a: 0, b: 2 }] },
    squatBar: { fx: 64, dur: 2.4, k: [{ ...SQ_TOP, a: -30, b: 170 }, { ...SQ_BOT, a: -30, b: 170 }] },
    squatAir: { fx: 64, dur: 2.2, k: [{ ...SQ_TOP, a: 8, b: 8 }, { ...SQ_BOT, a: 92, b: 92 }] },
    goblet: { fx: 64, dur: 2.4, k: [{ ...SQ_TOP, a: 15, b: 165 }, { ...SQ_BOT, a: 30, b: 175 }] },
    squatJump: { fx: 64, dur: 1.8, k: [{ ...STAND }, { ...SQ_BOT, a: -40, b: -40 }, { t: 0, a: 170, b: 175, c: 0, d: -6, lift: 14 }] },
    thruster: { fx: 64, dur: 1.9, k: [{ ...SQ_BOT, a: 30, b: 180 }, { ...SQ_TOP, a: 178, b: 180 }] },
    legPress: { anchor: 'hip', hx: 40, hy: 72, props: ['bench', 'sled'], benchBack: 2, dur: 2.4, k: [{ t: -55, a: 30, b: 60, c: 135, d: 55 }, { t: -55, a: 30, b: 60, c: 112, d: 115 }] },
    legExt: { anchor: 'hip', hx: 50, hy: 62, props: ['seat', 'pad'], dur: 2, k: [{ t: -6, a: 15, b: 20, c: 90, d: 2 }, { t: -6, a: 15, b: 20, c: 90, d: 85 }] },
    hinge: { fx: 58, dur: 2.6, k: [{ t: 72, a: 0, b: 0, c: 55, d: -15 }, { ...STAND }] },
    rdl: { fx: 58, dur: 2.6, k: [{ ...STAND }, { t: 80, a: 0, b: 0, c: 12, d: -8 }] },
    goodMorning: { fx: 58, rel: true, dur: 2.6, k: [{ t: 0, a: 20, b: 160, c: 0, d: 0 }, { t: 80, a: 20, b: 160, c: 12, d: -8 }] },
    legCurl: { anchor: 'hip', hx: 64, hy: 68, props: ['bench', 'pad'], benchSide: -1, benchBack: 18, dur: 2, k: [{ t: 90, a: 50, b: -10, c: -90, d: -90 }, { t: 90, a: 50, b: -10, c: -90, d: -178 }] },
    nordic: { fx: 30, props: ['padFoot'], dur: 3, k: [{ t: 0, a: 30, b: 150, c: 0, d: -90 }, { t: 60, a: 80, b: 100, c: -60, d: -90 }] },
    lunge: { fx: 76, dur: 2.4, k: [{ t: 0, a: 0, b: 0, c: 30, d: 10, c2: -45, d2: -40 }, { t: 5, a: 0, b: 0, c: 80, d: 0, c2: -10, d2: -80 }] },
    hipThrust: { fx: 84, props: ['benchS'], benchAt: 1, dur: 2.2, k: [{ t: -70, a: -100, b: -100, c: 110, d: -5 }, { t: -90, a: -100, b: -100, c: 90, d: 0 }] },
    abduction: { front: true, anchor: 'hip', hx: 60, hy: 64, props: ['seatF'], dur: 2, k: [{ a: 15, b: 25, c: 10, d: 2 }, { a: 15, b: 25, c: 38, d: 12 }] },
    calf: { fx: 56, floor: 86, props: ['step'], dur: 1.6, k: [{ ...STAND }, { ...STAND, lift: 7 }] },
    cableCrunch: { fx: 34, rel: true, props: ['cableTop'], dur: 2.4, k: [{ t: 10, a: 160, b: 250, c: 0, d: -90 }, { t: 100, a: 160, b: 250, c: -20, d: -90 }] },
    plank: { anchor: 'none', dur: 3, k: [{ x: 50, y: 83.9, t: 76.3, a: 0, b: 90, c: -76.3, d: -76.3 }, { x: 50, y: 82.6, t: 77, a: 0, b: 90, c: -77.4, d: -77.4 }] },
    crunch: { anchor: 'hip', hx: 62, hy: 88, rel: true, dur: 2, k: [{ t: -90, a: 40, b: 160, c: 135, d: 20 }, { t: -62, a: 40, b: 160, c: 135, d: 20 }] },
    legRaise: { anchor: 'hip', hx: 64, hy: 88, rel: true, dur: 2.4, k: [{ t: -90, a: 0, b: 0, c: 88, d: 88 }, { t: -90, a: 0, b: 0, c: 175, d: 175 }] },
    hollow: { anchor: 'hip', hx: 60, hy: 86, rel: true, dur: 2.4, k: [{ t: -78, a: 180, b: 180, c: 78, d: 78 }, { t: -84, a: 180, b: 180, c: 84, d: 84 }] },
    superman: { anchor: 'hip', hx: 58, hy: 86, rel: true, dur: 2.2, k: [{ t: 90, a: 180, b: 180, c: -90, d: -90 }, { t: 76, a: 180, b: 180, c: -102, d: -104 }] },
    twist: { front: true, anchor: 'hip', hx: 60, hy: 74, dur: 1.6, k: [{ t: -8, a: 50, b: 95, a2: 10, b2: 70, c: 30, d: -20 }, { t: 8, a: -10, b: -70, a2: -50, b2: -95, c: 30, d: -20 }] },
    burpee: { fx: 36, dur: 3.2, k: [{ ...STAND }, { t: 55, a: 0, b: 0, c: 95, d: -35 }, { t: 63, a: 0, b: 0, c: -63, d: -63 }, { t: 55, a: 0, b: 0, c: 95, d: -35 }, { t: 0, a: 175, b: 178, c: 0, d: -5, lift: 12 }] },
    climber: { anchor: 'hand', fx: 86, dur: 0.9, k: [{ t: 63, a: 0, b: 0, c: -63, d: -63, c2: 40, d2: -60 }, { t: 63, a: 0, b: 0, c: 40, d: -60, c2: -63, d2: -63 }] },
    jack: { front: true, anchor: 'ground', dur: 1, k: [{ a: 8, b: 8, c: 3, d: 3 }, { a: 165, b: 172, c: 22, d: 22, lift: 3 }] },
    rope: { front: true, anchor: 'ground', props: ['rope'], dur: 0.8, k: [{ a: 25, b: 60, c: 2, d: 2, lift: 6, ry: 0 }, { a: 25, b: 60, c: 2, d: 2, lift: 0, ry: 1 }] },
    run: { anchor: 'ground', props: ['tread'], dur: 0.75, k: [{ t: 10, a: -40, b: 40, a2: 45, b2: 130, c: 35, d: -10, c2: -25, d2: -85 }, { t: 10, a: 45, b: 130, a2: -40, b2: 40, c: -25, d: -85, c2: 35, d2: -10 }] },
    bike: { anchor: 'hip', hx: 46, hy: 56, props: ['bike'], dur: 1, k: [{ t: 35, a: 70, b: 85, c: 75, d: -10, c2: 30, d2: 25 }, { t: 35, a: 70, b: 85, c: 30, d: 25, c2: 75, d2: -10 }] },
    swing: { fx: 62, dur: 1.4, k: [{ t: 60, a: -25, b: -25, c: 30, d: -12 }, { t: -3, a: 92, b: 92, c: 0, d: 0 }] },
  };

  /* exercício do FOCO → [movimento, peso na mão] (bb = barra, db = halter, hipbb/hipdb = peso no quadril) */
  const MAP = {
    'supino-reto': ['bench', 'bb'], 'supino-inclinado': ['benchInc', 'bb'], 'supino-maquina': ['bench'], 'supino-halteres': ['bench', 'db'],
    'supino-inc-halteres': ['benchInc', 'db'], 'paralelas-peito': ['dip'], 'flexao': ['pushup'], 'flexao-declinada': ['pushup'],
    'crossover': ['cableFly'], 'peck-deck': ['cableFly'], 'crucifixo': ['fly', 'db'], 'flexao-aberta': ['pushup'],
    'puxada-frontal': ['pulldown'], 'puxada-triangulo': ['pulldown'], 'barra-fixa': ['pullup'], 'barra-supinada': ['pullup'],
    'pullover': ['pullover', 'db'], 'superman': ['superman'], 'remada-curvada': ['row', 'bb'], 'remada-baixa': ['seatedRow'],
    'remada-unilateral': ['row', 'db'], 'remada-halteres': ['row', 'db'], 'remada-australiana': ['invRow'], 'remada-mesa': ['invRow'],
    'desenvolvimento-barra': ['press', 'bb'], 'desenvolvimento-maquina': ['press'], 'desenvolvimento-halteres': ['press', 'db'],
    'arnold': ['press', 'db'], 'flexao-pike': ['pike'], 'elevacao-lateral': ['lateral', 'db'], 'elevacao-lateral-cabo': ['lateral'],
    'face-pull': ['facePull'], 'crucifixo-inverso': ['lateral', 'db'], 'ytw': ['superman'],
    'rosca-direta': ['curl', 'bb'], 'rosca-scott': ['curl', 'bb'], 'rosca-cabo': ['curl', 'cableLow'], 'rosca-alternada': ['curl', 'db'],
    'rosca-martelo': ['curl', 'db'], 'chinup-negativo': ['pullup'], 'rosca-toalha': ['curl'],
    'triceps-pulley': ['pushdown'], 'triceps-corda': ['pushdown'], 'triceps-testa': ['skull', 'bb'], 'triceps-frances': ['overheadExt', 'db'],
    'paralelas-triceps': ['dip'], 'mergulho-banco': ['dip'], 'flexao-diamante': ['pushup'],
    'agachamento': ['squatBar', 'bb'], 'leg-press': ['legPress'], 'hack': ['squatBar'], 'extensora': ['legExt'], 'goblet': ['goblet', 'db'],
    'agachamento-livre': ['squatAir'], 'agachamento-salto': ['squatJump'],
    'terra': ['hinge', 'bb'], 'stiff-barra': ['rdl', 'bb'], 'flexora': ['legCurl'], 'stiff-halteres': ['rdl', 'db'], 'good-morning': ['goodMorning'], 'nordic': ['nordic'],
    'bulgaro': ['lunge', 'db'], 'avanco': ['lunge', 'db'], 'step-up': ['lunge', 'db'], 'afundo': ['lunge'], 'bulgaro-livre': ['lunge'],
    'elevacao-pelvica': ['hipThrust', 'hipbb'], 'abdutora': ['abduction'], 'elevacao-pelvica-halter': ['hipThrust', 'hipdb'], 'ponte': ['hipThrust'],
    'panturrilha-maquina': ['calf'], 'panturrilha-sentado': ['calf'], 'panturrilha-halter': ['calf', 'db'], 'panturrilha-degrau': ['calf'],
    'abdominal-cabo': ['cableCrunch'], 'elevacao-pernas-barra': ['hangingRaise'], 'prancha': ['plank'], 'prancha-lateral': ['plank'],
    'abdominal-infra': ['legRaise'], 'crunch': ['crunch'], 'hollow': ['hollow'], 'russian-twist': ['twist', 'db'],
    'burpee': ['burpee'], 'mountain-climber': ['climber'], 'polichinelo': ['jack'], 'corda': ['rope'], 'esteira-hiit': ['run'],
    'bike-hiit': ['bike'], 'thruster': ['thruster', 'db'], 'swing-halter': ['swing', 'db'],
  };
  /* exercícios criados pela pessoa: usa o movimento típico do grupo muscular */
  const BY_MUSCLE = { 'Peito': 'pushup', 'Costas': 'row', 'Ombros': 'press', 'Bíceps': 'curl', 'Tríceps': 'pushdown', 'Pernas': 'squatAir', 'Posterior': 'rdl', 'Glúteos': 'hipThrust', 'Panturrilha': 'calf', 'Abdômen': 'crunch', 'Cardio': 'jack' };

  /* ---------- cinemática ---------- */
  function norm(k, P) {
    const m = P.front ? -1 : 1, a = k.a ?? 0, b = k.b ?? a, c = k.c ?? 0, d = k.d ?? c;
    return { t: k.t ?? 0, a, b, c, d, a2: k.a2 ?? a * m, b2: k.b2 ?? b * m, c2: k.c2 ?? c * m, d2: k.d2 ?? d * m, lift: k.lift ?? 0, x: k.x ?? 0, y: k.y ?? 0, ry: k.ry ?? 0 };
  }
  function pose(k, P) {
    const u = [Math.sin(k.t * RAD), -Math.cos(k.t * RAD)], rel = P.rel ? -k.t : 0;
    const hip = [0, 0], neck = mul(u, L.T), head = add(neck, mul(u, L.N));
    const sh1 = P.front ? add(neck, [6, 3]) : add(neck, mul(u, -3)), sh2 = P.front ? add(neck, [-6, 3]) : sh1;
    const h1 = P.front ? [4, 0] : hip, h2 = P.front ? [-4, 0] : hip;
    const arm = (s, A, B) => { const e = add(s, dir(A + rel, L.U)); return [s, e, add(e, dir(B + rel, L.F))]; };
    const leg = (h, C, D) => { const kn = add(h, dir(C, L.H)); return [h, kn, add(kn, dir(D, L.S))]; };
    return { u, hip, neck, head, sh1, sh2, ar1: arm(sh1, k.a, k.b), ar2: arm(sh2, k.a2, k.b2), lg1: leg(h1, k.c, k.d), lg2: leg(h2, k.c2, k.d2), ry: k.ry };
  }
  function place(j, k, P) {
    const fl = P.floor ?? FLOOR, fx = P.fx ?? 60, an = P.anchor || 'foot';
    let off;
    if (an === 'none') off = [k.x, k.y];
    else if (an === 'hip') off = [P.hx, P.hy];
    else if (an === 'hand') off = sub([fx, fl], j.ar1[2]);
    else if (an === 'ground') off = [fx, fl - Math.max(j.lg1[2][1], j.lg2[2][1])];
    else off = sub([fx, fl], j.lg1[2]);
    off[1] -= k.lift;
    const T = p => add(p, off);
    const o = { u: j.u, ry: j.ry, fl, hip: T(j.hip), neck: T(j.neck), head: T(j.head), sh1: T(j.sh1), sh2: T(j.sh2), ar1: j.ar1.map(T), ar2: j.ar2.map(T), lg1: j.lg1.map(T), lg2: j.lg2.map(T) };
    if (!P.front) [o.lg1, o.lg2].forEach(l => l.push(toe(l[1], l[2], fl)));
    return o;
  }
  function toe(kn, f, fl) {
    const h = fl - f[1];
    if (h < 1.5) return [f[0] + 6, f[1]];
    if (h < 6) return [f[0] + Math.sqrt(36 - h * h), fl];
    const s = sub(f, kn), n = Math.hypot(s[0], s[1]) || 1;
    return add(f, [s[1] / n * 6, -s[0] / n * 6]);
  }
  const ease = x => x * x * (3 - 2 * x);
  function frames(P) {
    const K = P.k.map(k => norm(k, P)), out = [];
    for (let i = 0; i < K.length; i++) {
      const A = K[i], B = K[(i + 1) % K.length];
      for (let s = 0; s < STEPS; s++) {
        const e = ease(s / STEPS), k = {};
        for (const f in A) k[f] = A[f] + (B[f] - A[f]) * e;
        out.push(place(pose(k, P), k, P));
      }
    }
    out.push(out[0]);
    return { all: out, key: K.map(k => place(pose(k, P), k, P)) };
  }

  /* ---------- SVG ---------- */
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const pts = a => a.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  function svgFor(id, muscle, still) {
    const m = MAP[id] || [BY_MUSCLE[muscle] || 'squatAir'], P = PATTERNS[m[0]], W = m[1] || '';
    const { all, key } = frames(P), S = key[Math.min(1, key.length - 1)], dur = P.dur + 's';
    const seq = still ? [S] : all;
    const anim = (attr, fn) => still ? '' : `<animate attributeName="${attr}" dur="${dur}" repeatCount="indefinite" values="${seq.map(fn).join(';')}"/>`;
    const poly = (cls, fn) => `<polyline class="${cls}" points="${pts(fn(seq[0]))}">${anim('points', f => pts(fn(f)))}</polyline>`;
    const circ = (cls, r, fn) => `<circle class="${cls}" r="${r}" cx="${f1(fn(seq[0])[0])}" cy="${f1(fn(seq[0])[1])}">${anim('cx', f => f1(fn(f)[0]))}${anim('cy', f => f1(fn(f)[1]))}</circle>`;
    const path = (cls, fn) => `<path class="${cls}" d="${fn(seq[0])}">${anim('d', fn)}</path>`;
    const k0 = key[0], kb = key[P.benchAt || 0], w0 = k0.ar1[2], fl = k0.fl;
    const eq = [], mov = [];
    const legsDown = (...ps) => ps.filter(p => p[1] < FLOOR - 3).map(p => `<polyline class="eq" points="${pts([p, [p[0], FLOOR]])}"/>`).join('');
    for (const pr of P.props || []) {
      if (pr === 'bench') {
        const n = mul([kb.u[1], -kb.u[0]], 5 * (P.benchSide || 1)), a = add(sub(kb.hip, mul(kb.u, P.benchBack ?? 6)), n), b = add(add(kb.neck, mul(kb.u, 2)), n);
        eq.push(`<polyline class="eq pad" points="${pts([a, b])}"/>` + legsDown(a, b));
      }
      if (pr === 'benchS') { const s = kb.sh1, a = [s[0] - 16, s[1] + 6], b = [s[0] + 3, s[1] + 6]; eq.push(`<polyline class="eq pad" points="${pts([a, b])}"/>` + legsDown(a, b)); }
      if (pr === 'seat') { const h = k0.hip, a = [h[0] - 9, h[1] + 6], b = [h[0] + 9, h[1] + 6]; eq.push(`<polyline class="eq pad" points="${pts([a, b])}"/>` + legsDown([h[0], h[1] + 6])); }
      if (pr === 'seatF') { const h = k0.hip, a = [h[0] - 13, h[1] + 5], b = [h[0] + 13, h[1] + 5]; eq.push(`<polyline class="eq pad" points="${pts([a, b])}"/>` + legsDown([h[0], h[1] + 5])); }
      if (pr === 'bar') eq.push(`<polyline class="eq" points="${pts([[32, FLOOR], [32, P.barY], [92, P.barY], [92, FLOOR]])}"/>`);
      if (pr === 'pbars') eq.push(`<polyline class="eq" points="${pts([[48, 51.5], [80, 51.5]])}"/><polyline class="eq" points="${pts([[76, 51.5], [76, FLOOR]])}"/>`);
      if (pr === 'barLow') eq.push(`<polyline class="eq" points="${pts([[w0[0] - 10, w0[1] - 1.5], [w0[0] + 10, w0[1] - 1.5]])}"/><polyline class="eq" points="${pts([[w0[0] + 10, w0[1] - 1.5], [w0[0] + 10, FLOOR]])}"/>`);
      if (pr === 'step') { const f = k0.lg1[2]; eq.push(`<polyline class="eq" points="${pts([[f[0] - 6, FLOOR], [f[0] - 6, fl + 2], [f[0] + 14, fl + 2], [f[0] + 14, FLOOR]])}"/>`); }
      if (pr === 'padFoot') eq.push(`<circle class="eqf" r="3.5" cx="${f1(k0.lg1[2][0])}" cy="${f1(k0.lg1[2][1] - 4)}"/>`);
      if (pr === 'tread') eq.push(`<polyline class="eq" points="${pts([[18, 94], [102, 94], [106, 52], [98, 50]])}"/>`);
      if (pr === 'bike') { const h = k0.hip, c = [h[0] + 16, 84]; eq.push(`<circle class="eq" r="8" cx="${f1(c[0])}" cy="${f1(c[1])}" fill="none"/><polyline class="eq" points="${pts([[h[0] - 5, h[1] + 4], [h[0] + 5, h[1] + 4]])}"/><polyline class="eq" points="${pts([[h[0], h[1] + 4], c, [w0[0] + 2, w0[1] + 2]])}"/>`); }
      if (pr === 'pad') mov.push(circ('eqf', 3.5, f => f.lg1[2]));
      if (pr === 'sled') mov.push(poly('eq', f => { const p = f.lg1[2]; return [[p[0] - 3, p[1] + 7], [p[0] + 5, p[1] - 6]]; }));
      if (pr === 'rope') mov.push(path('cb', f => { const a = f.ar1[2], b = f.ar2[2], cy = (FLOOR + 6) + (f.head[1] - 30 - (FLOOR + 6)) * f.ry; return `M${f1(a[0])},${f1(a[1])} Q${f1((a[0] + b[0]) / 2)},${f1(cy)} ${f1(b[0])},${f1(b[1])}`; }));
      const cable = anchor => mov.push(poly('cb', f => [anchor, f.ar1[2]]));
      if (pr === 'cableTop') cable([w0[0] + 2, 3]);
      if (pr === 'cableFront') cable([117, w0[1]]);
      if (pr === 'cableBack') cable([w0[0] - 24, 6]);
    }
    if (W === 'cableLow') mov.push(poly('cb', f => [[w0[0] + 18, 90], f.ar1[2]]));
    if (W === 'bb') mov.push(circ('plate', 7.5, f => f.ar1[2]));
    if (W === 'hipbb') mov.push(circ('plate', 7.5, f => add(f.hip, [2, -8])));
    const db = fn => poly('db', f => { const p = fn(f); return [[p[0] - 4.5, p[1]], [p[0] + 4.5, p[1]]]; });
    if (W === 'db') { mov.push(db(f => f.ar1[2])); if (P.front && m[0] !== 'twist') mov.push(db(f => f.ar2[2])); }
    if (W === 'hipdb') mov.push(db(f => add(f.hip, [2, -6])));
    const fig = P.front
      ? [poly('lim', f => f.lg2), poly('lim', f => f.lg1), poly('lim', f => [f.hip, f.neck]), poly('lim', f => [f.sh2, f.neck, f.sh1]), poly('lim', f => [f.lg2[0], f.lg1[0]]), poly('lim', f => f.ar2), poly('lim', f => f.ar1), circ('hd', 6.5, f => f.head)]
      : [poly('far', f => f.lg2), poly('far', f => f.ar2), poly('lim', f => f.lg1), poly('lim', f => [f.hip, f.neck]), circ('hd', 6.5, f => f.head), poly('lim', f => f.ar1)];
    return `<svg class="exfig" viewBox="0 0 120 100" aria-hidden="true" focusable="false"><line class="fl" x1="4" x2="116" y1="${FLOOR + 3}" y2="${FLOOR + 3}"/>${eq.join('')}<g class="fig">${fig.join('')}</g>${mov.join('')}</svg>`;
  }

  const CACHE = {};
  /* exFig(id, músculo, {still}) → SVG; respeita "reduzir movimento" (mostra a pose principal parada) */
  window.exFig = (id, muscle, opt = {}) => {
    let still = !!opt.still;
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) still = true; } catch (e) { }
    const key = id + '|' + muscle + '|' + still;
    return CACHE[key] || (CACHE[key] = svgFor(id, muscle, still));
  };
  window.EX_PATTERNS = PATTERNS;
  window.EX_MAP = MAP;
})();
