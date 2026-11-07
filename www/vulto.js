/* ===== VULTO — o caçador animado do FOCO (Rank E → S) ===== */
const VR = [
  { cloak: '#39465A', back: '#232D3D', body: '#2B3445', metal: '#4B5A70', scarf: '#B5562F', scarfDark: '#8C3F20', blade: '#7E7466', eyeOp: .35, eyeR: 6, trim: 0, maskLine: 0, bladeGlow: 0, scarfGlow: 0, rune: 0, flames: 0, ring: 0, dustOp: .7, slashW: 4, patch: 1, wrap: 1, bracer: 0, dual: 0, shoulder: 0, armor: 0, long: 0, greave: 0, crest: 0 },
  { cloak: '#36465C', back: '#212C3C', body: '#2A3648', metal: '#4B5A70', scarf: '#BE5A2E', scarfDark: '#913F1F', blade: '#AAB5C3', eyeOp: .5, eyeR: 7, trim: 0, maskLine: 0, bladeGlow: 0, scarfGlow: 0, rune: 0, flames: 0, ring: 0, dustOp: .8, slashW: 4, patch: 0, wrap: 1, bracer: 1, dual: 0, shoulder: 0, armor: 0, long: 0, greave: 0, crest: 0 },
  { cloak: '#2F4058', back: '#1D2939', body: '#273347', metal: '#4E5E78', scarf: '#C9622E', scarfDark: '#974421', blade: '#C2CCD8', eyeOp: .65, eyeR: 8, trim: .7, maskLine: 0, bladeGlow: .25, scarfGlow: 0, rune: 0, flames: 0, ring: 0, dustOp: .9, slashW: 5, patch: 0, wrap: 0, bracer: 1, dual: 1, shoulder: 1, armor: 0, long: 0, greave: 0, crest: 0 },
  { cloak: '#26364F', back: '#182336', body: '#222E43', metal: '#3F5076', scarf: '#D06A2E', scarfDark: '#9C4821', blade: '#D3DBE5', eyeOp: .8, eyeR: 9, trim: .9, maskLine: 0, bladeGlow: .5, scarfGlow: 0, rune: 0, flames: 0, ring: .8, dustOp: 1, slashW: 5, patch: 0, wrap: 0, bracer: 1, dual: 1, shoulder: 1, armor: 1, long: 1, greave: 1, crest: 0 },
  { cloak: '#1F2B44', back: '#141D2F', body: '#1E283C', metal: '#463F6E', scarf: '#DB7230', scarfDark: '#A34D22', blade: '#E2E8F0', eyeOp: .95, eyeR: 10, trim: 1, maskLine: .9, bladeGlow: .85, scarfGlow: 0, rune: .45, flames: .55, ring: 1, dustOp: 1, slashW: 6, patch: 0, wrap: 0, bracer: 1, dual: 1, shoulder: 1, armor: 1, long: 1, greave: 1, crest: 0 },
  { cloak: '#141C2E', back: '#0E1524', body: '#192236', metal: '#5A4A22', scarf: '#FFB547', scarfDark: '#E08A1E', blade: '#FFF4D6', eyeOp: 1, eyeR: 11, trim: 1, maskLine: 1, bladeGlow: 1, scarfGlow: .9, rune: 1, flames: 1, ring: 1, dustOp: 1, slashW: 7, patch: 0, wrap: 0, bracer: 1, dual: 1, shoulder: 1, armor: 1, long: 1, greave: 1, crest: 1 }
];
const VMOVES = [
  ['Golpe Rápido', 'Uma estocada curta. Ainda falta técnica, sobra vontade.', 750],
  ['Investida', 'Dispara para a frente e corta na passagem.', 650],
  ['Lâmina Dupla', 'Salta e cruza as duas lâminas em X.', 750],
  ['Véu de Névoa', 'Some na névoa e corta três vezes antes de reaparecer.', 900],
  ['Dança das Mil Lâminas', 'Gira no ar e abre seis cortes ao redor.', 1050],
  ['Eclipse', 'Para o tempo. Quando volta, o corte já aconteceu.', 1500]
];
const VWEAP = [
  ['Adaga de Treino', 'Comum', 3], ['Adaga do Caçador', 'Incomum', 12], ['Presas Gêmeas', 'Rara', 28],
  ['Lâminas do Vento', 'Épica', 55], ['Crescentes Noturnas', 'Lendária', 96], ['Fragmentos do Eclipse', 'Mítica', 180]
];
function vWeapon(ri, C) {
  const W = [
    ['M259 358 L269 358 L268 392 L265 396 L266 401 L262 408 L259 396 Z',
      `<rect x="258" y="336" width="12" height="22" rx="2" fill="#7A6A55"/><path d="M258 341 L270 343 M258 347 L270 349 M258 353 L270 355" stroke="#5A4C3C" stroke-width="1.5"/><circle cx="263" cy="372" r="2" fill="#7A4A2E"/><circle cx="266" cy="385" r="1.5" fill="#7A4A2E"/>`],
    ['M259 356 L269 356 L267 422 L264 430 L261 422 Z',
      `<rect x="258" y="334" width="12" height="20" rx="2" fill="#4A3B2E"/><circle cx="264" cy="332" r="4" fill="#8A94A6"/><rect x="249" y="352" width="30" height="5" rx="1.5" fill="#8A94A6"/><path d="M264 358 L264 422" stroke="#EEF2F6" stroke-width="1"/>`],
    ['M258 356 L270 356 Q284 396 267 440 Q265 406 258 356 Z',
      `<rect x="258" y="332" width="12" height="22" rx="2" fill="#2E3646"/><path d="M258 338 L270 342 M258 346 L270 350" stroke="${C}" stroke-width="1" opacity=".7"/><path d="M245 351 L283 351 L278 358 L250 358 Z" fill="#4E5E78"/><circle cx="247" cy="354.5" r="2.5" fill="${C}"/><circle cx="281" cy="354.5" r="2.5" fill="${C}"/><path d="M263 362 Q273 392 267 424" stroke="${C}" stroke-width="1.3" fill="none" opacity=".7"/>`],
    ['M257 357 L271 357 L272 444 L262 458 L257 446 Z',
      `<rect x="257" y="330" width="14" height="25" rx="2" fill="#222A38"/><path d="M257 336 L271 342 M271 336 L257 342 M257 345 L271 351 M271 345 L257 351" stroke="${C}" stroke-width=".9" opacity=".8"/><path d="M264 320 L270 327 L264 334 L258 327 Z" fill="${C}"/><path d="M240 351 Q264 343 288 351 L285 359 Q264 353 243 359 Z" fill="#3F5076" stroke="${C}" stroke-width="1"/><path d="M271 361 L272 444 L263 456" stroke="${C}" stroke-width="1.8" fill="none"/>`],
    ['M260 356 L270 356 Q308 394 294 454 Q288 472 274 478 Q290 438 266 386 Q262 372 260 356 Z',
      `<rect x="257" y="328" width="14" height="27" rx="3" fill="#1E1A33"/><path d="M257 334 L271 334 M257 341 L271 341 M257 348 L271 348" stroke="${C}" stroke-width="1"/><path d="M245 351 L283 351 L277 360 L251 360 Z" fill="#463F6E" stroke="${C}" stroke-width="1"/><circle cx="273" cy="380" r="2.2" fill="#fff"/><circle cx="283" cy="404" r="2.2" fill="#fff"/><circle cx="286" cy="430" r="2.2" fill="#fff"/><path d="M268 366 Q296 400 284 456" stroke="${C}" stroke-width="1.2" fill="none"/>`],
    ['M258 354 L272 354 L283 410 L266 490 L249 410 Z',
      `<rect x="257" y="326" width="14" height="27" rx="3" fill="#2A2210"/><path d="M257 332 L271 336 M257 340 L271 344 M257 348 L271 352" stroke="${C}" stroke-width="1"/><path d="M264 314 L271 322 L264 330 L257 322 Z" fill="${C}"/><path d="M236 356 Q250 338 264 350 Q278 338 292 356 L281 361 L247 361 Z" fill="#5A4A22" stroke="${C}" stroke-width="1.2"/><path d="M265.5 362 L266 480" stroke="#FFFFFF" stroke-width="2"/>`]
  ];
  return W[ri];
}
function vultoSVG(ri, C, mode = '') {
  const R = VR[ri], k = 'v' + ri, D = v => (v ? '' : ' display="none"');
  const [bp, det] = vWeapon(ri, C);
  const weapon = `<g class="v-forge"><path d="${bp}" fill="${C}" filter="url(#${k}b)" opacity="${R.bladeGlow}"/><path d="${bp}" fill="${R.blade}"/>${det}<path class="v-glint" d="M262 372 L268 372" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const sil = 'M200 124 L214 146 Q254 156 258 205 Q260 240 248 250 Q284 300 276 420 L262 430 L242 506 L210 506 L200 440 L190 506 L158 506 L138 420 Q118 300 152 250 Q140 240 142 205 Q146 150 200 140 Z';
  const spark = (x, y, cls, r = 9, l = 26) => `<g transform="translate(${x} ${y})"><g class="v-fx ${cls}" stroke="${C}" stroke-width="2.4" stroke-linecap="round"><circle r="${r}" fill="#fff" stroke="none"/><path d="M0 -${r + 5} L0 -${l} M0 ${r + 5} L0 ${l} M-${r + 5} 0 L-${l} 0 M${r + 5} 0 L${l} 0 M${r} -${r} L${l * .73} -${l * .73} M-${r} ${r} L-${l * .73} ${l * .73} M${r} ${r} L${l * .73} ${l * .73} M-${r} -${r} L-${l * .73} -${l * .73}"/></g></g>`;
  const pet = d => [0, 60, 120, 180, 240, 300].map((a, i) => `<g transform="rotate(${a} 210 250)"><path class="v-fx v-pet p${i + 1}" d="M210 150 Q275 155 297 200 Q262 175 210 150 Z" fill="${C}"/></g>`).join('');
  const shards = [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<g transform="rotate(${a} 200 300)"><path class="v-fx v-bsh" d="M200 290 L207 300 L200 310 L193 300 Z" fill="${C}"/></g>`).join('');
  const fx = mode === 'big' ? `
  <g fill="#8A94A6"><circle class="v-fx v-puff" cx="160" cy="514" r="8"/><circle class="v-fx v-puff q2" cx="140" cy="512" r="7"/><circle class="v-fx v-puff q3" cx="178" cy="518" r="6"/></g>
  <line class="v-fx v-streak" x1="268" y1="380" x2="352" y2="372" stroke="${C}" stroke-width="3" stroke-linecap="round"/>${spark(352, 372, 'v-spkE', 6, 18)}
  <g stroke="${C}" stroke-width="2" stroke-linecap="round"><line class="v-fx v-wind" x1="40" y1="300" x2="140" y2="300"/><line class="v-fx v-wind w2" x1="30" y1="345" x2="130" y2="345"/><line class="v-fx v-wind w3" x1="50" y1="392" x2="150" y2="392"/></g>
  <g class="v-fx v-slD"><path d="M88 292 Q240 196 372 334 Q250 238 88 292 Z" fill="${C}" opacity=".9"/><path d="M88 292 Q240 196 372 334" stroke="#fff" stroke-width="1.6" fill="none"/></g>${spark(372, 334, 'v-spkD')}
  <g class="v-fx v-xc1"><path d="M150 200 Q245 300 330 430 Q235 318 150 200 Z" fill="${C}"/><path d="M150 200 Q245 300 330 430" stroke="#fff" stroke-width="1.5" fill="none"/></g>
  <g class="v-fx v-xc2"><path d="M330 200 Q235 300 150 430 Q245 318 330 200 Z" fill="${C}"/><path d="M330 200 Q235 300 150 430" stroke="#fff" stroke-width="1.5" fill="none"/></g>${spark(240, 315, 'v-spkC', 11, 32)}
  <g filter="url(#${k}s)" fill="${C}"><circle class="v-fx v-mist1" cx="200" cy="330" r="70"/><circle class="v-fx v-mist2" cx="264" cy="330" r="70"/></g>
  <g stroke="${C}" stroke-width="2.6" stroke-linecap="round"><line class="v-fx v-wb wb1" x1="150" y1="250" x2="390" y2="332"/><line class="v-fx v-wb wb2" x1="160" y1="390" x2="392" y2="250"/><line class="v-fx v-wb wb3" x1="130" y1="320" x2="398" y2="316"/></g>
  ${pet()}<ellipse class="v-fx v-aring" cx="200" cy="530" rx="80" ry="12" fill="none" stroke="${C}" stroke-width="3"/>
  <g class="v-fx v-ecl"><circle cx="200" cy="170" r="70" fill="${C}" filter="url(#${k}s)"/><circle cx="200" cy="170" r="58" fill="#03050A"/><circle cx="200" cy="170" r="60" fill="none" stroke="${C}" stroke-width="2"/></g>
  <g class="v-gsl"><path d="M-10 40 Q230 250 410 560 Q190 300 -10 40 Z" fill="${C}" filter="url(#${k}b)"/><path d="M-10 40 Q230 250 410 560 Q190 300 -10 40 Z" fill="${C}"/><path d="M-10 40 Q230 250 410 560" stroke="#fff" stroke-width="3" fill="none"/></g>${shards}` : '';
  const evo = mode === 'big' || mode === 'evolve' ? `<rect class="v-pillar" x="150" y="0" width="100" height="540" fill="${C}" filter="url(#${k}s)"/><g fill="none" stroke="${C}" stroke-width="3"><circle class="v-ring" cx="200" cy="320" r="70"/><circle class="v-ring r2" cx="200" cy="320" r="70"/><circle class="v-ring r3" cx="200" cy="320" r="70"/></g>` : '';
  const trails = mode === 'big' ? `<g opacity=".55"><path class="v-trail tb" fill="${C}" d="${sil}"/></g><path class="v-trail ta" fill="${C}" d="${sil}"/>` : '';
  return `<svg class="avatar vulto ${mode === 'evolve' ? 'evolve' : ''}" viewBox="${mode === 'big' ? '0 60 400 500' : '0 100 400 440'}" aria-hidden="true"><defs>
<filter id="${k}e" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${k}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="${k}b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter></defs>
<g opacity="${R.rune}"><g class="v-spin"><circle cx="200" cy="300" r="172" fill="none" stroke="${C}" stroke-width="1.5" stroke-dasharray="3 9"/><path d="M200 128 L208 140 L200 152 L192 140 Z M372 300 L360 308 L348 300 L360 292 Z M200 472 L192 460 L200 448 L208 460 Z M28 300 L40 292 L52 300 L40 308 Z" fill="${C}"/></g><g class="v-spin-r"><circle cx="200" cy="300" r="148" fill="none" stroke="${C}" stroke-width="1" stroke-dasharray="40 10 4 10" opacity=".7"/></g></g>
<g opacity="${R.flames}"><g filter="url(#${k}s)" fill="${C}"><path class="v-flame" d="M112 525 Q92 420 132 330 Q128 440 170 525 Z"/><path class="v-flame f2" d="M288 525 Q310 420 268 330 Q272 440 230 525 Z"/><path class="v-flame f3" d="M150 525 Q140 360 200 200 Q180 380 205 525 Z" opacity=".7"/><path class="v-flame f2" d="M250 525 Q262 360 200 200 Q222 380 195 525 Z" opacity=".7"/></g></g>
<ellipse cx="200" cy="532" rx="120" ry="14" fill="#000" opacity=".55"/>
<g opacity="${R.ring}"><ellipse class="v-pulse" cx="200" cy="532" rx="132" ry="18" fill="none" stroke="${C}" stroke-width="2"/></g>
<g fill="${ri ? C : '#8A94A6'}" opacity="${R.dustOp}">${[[120, 520, 2.2], [280, 515, 1.8], [160, 525, 1.5], [245, 522, 2.4], [95, 510, 1.6], [310, 520, 2], [200, 528, 1.8], [70, 515, 2.2]].map(([x, y, r], i) => `<circle class="v-dust" style="animation-delay:${(i * .5).toFixed(1)}s" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
${evo}
<g class="v-lift">${trails}<g class="v-char"><g class="v-breathe">
<g class="v-hemlag"><g class="v-hem">${R.long ? `<path d="M158 240 Q118 380 128 500 L144 512 L160 498 L176 514 L192 500 L206 516 L222 500 L238 514 L254 498 L272 510 Q282 380 242 240 Z" fill="${R.back}"/><path d="M132 492 Q200 506 268 492" stroke="${C}" stroke-width="2" fill="none" opacity="${R.trim}"/>` : `<path d="M160 240 Q128 360 138 420 L150 432 L164 418 L178 434 L192 420 L206 436 L220 420 L234 434 L248 418 L262 430 Q272 360 240 240 Z" fill="${R.back}"/>`}</g></g>
<path d="M165 365 L195 365 L190 450 L182 505 L152 505 L160 450 Z" fill="#161C28"/><path d="M205 365 L235 365 L242 450 L250 505 L220 505 L212 450 Z" fill="#161C28"/>
<g stroke="#B9A88E" stroke-width="2.4" stroke-linecap="round" opacity=".85"${D(R.wrap)}><path d="M158 462 L188 458 M156 474 L186 470 M154 486 L184 482 M214 458 L244 462 M216 470 L246 474 M217 482 L248 486"/></g>
<g${D(R.greave)}><path d="M157 452 L189 448 L186 490 L153 494 Z M211 448 L243 452 L247 494 L214 490 Z" fill="${R.metal}" stroke="${C}" stroke-width="1.2"/></g>
<path d="M150 500 L186 500 L188 516 L136 516 Q136 504 150 500 Z M218 500 L252 500 Q266 504 266 516 L216 516 Z" fill="#2A2F3A"/>
<path d="M160 250 L240 250 L248 370 L152 370 Z" fill="${R.body}"/><path d="M200 252 L200 352 M172 262 L190 300 M228 262 L210 300" stroke="#1B2230" stroke-width="2" fill="none"/>
<g${D(R.armor)}><path d="M172 268 L228 268 L224 322 L200 340 L176 322 Z" fill="${R.metal}" stroke="${C}" stroke-width="1.5"/><path d="M200 274 L200 332 M182 290 L218 290" stroke="${C}" stroke-width="1" opacity=".7"/></g>
<rect x="150" y="350" width="100" height="14" rx="2" fill="#4A3B2E"/><rect x="193" y="351" width="14" height="12" rx="1" fill="${ri ? C : '#8A94A6'}"/><rect x="222" y="360" width="20" height="20" rx="3" fill="#4A3B2E"/>
<g class="v-cloak-l">${R.long ? `<path d="M152 226 Q108 320 118 478 L144 470 Q142 330 166 258 Z" fill="${R.cloak}"/>` : `<path d="M152 226 Q118 300 126 404 L148 398 Q146 320 166 258 Z" fill="${R.cloak}"/>`}<path d="M166 258 Q146 320 146 396" stroke="${C}" stroke-width="2" fill="none" opacity="${R.trim}"/></g>
<g class="v-cloak-r">${R.long ? `<path d="M248 226 Q294 320 284 482 L256 474 Q258 330 234 258 Z" fill="${R.cloak}"/>` : `<path d="M248 226 Q284 300 276 408 L254 400 Q254 320 234 258 Z" fill="${R.cloak}"/>`}<path d="M234 258 Q254 320 254 398" stroke="${C}" stroke-width="2" fill="none" opacity="${R.trim}"/>${R.patch ? '<rect x="258" y="360" width="14" height="14" fill="#4B5A70" transform="rotate(-6 265 367)"/><rect x="258" y="360" width="14" height="14" fill="none" stroke="#B9A88E" stroke-dasharray="2 2" transform="rotate(-6 265 367)"/>' : ''}</g>
<g class="v-arm-l"><path d="M150 258 L170 268 L152 340 L132 336 Z" fill="${R.body}"/>${R.wrap ? '<path d="M138 318 L156 322 M136 327 L154 331" stroke="#B9A88E" stroke-width="2.2" stroke-linecap="round"/>' : ''}${R.bracer ? `<path d="M136 310 L158 316 L154 336 L131 332 Z" fill="#4A3B2E" stroke="${C}"/>` : ''}${R.dual ? `<g transform="translate(404 4) scale(-1 1)">${weapon}</g>` : ''}<circle cx="140" cy="346" r="10" fill="#D9B79A"/></g>
<g class="v-arm-r"><path d="M232 262 L252 256 L272 328 L252 338 Z" fill="${R.body}"/>${R.wrap ? '<path d="M252 318 L270 313 M254 327 L272 322" stroke="#B9A88E" stroke-width="2.2" stroke-linecap="round"/>' : ''}${R.bracer ? `<path d="M250 312 L272 306 L276 326 L254 332 Z" fill="#4A3B2E" stroke="${C}"/>` : ''}${weapon}<circle cx="264" cy="342" r="10" fill="#D9B79A"/>${R.crest ? `<g class="v-orbit"><circle cx="266" cy="420" r="44" fill="none"/><path class="v-shard" d="M266 372 L271 380 L266 388 L261 380 Z" fill="#FFE08A"/><path class="v-shard" d="M306 432 L311 440 L306 448 L301 440 Z" fill="${C}"/><path class="v-shard" d="M228 438 L232 445 L228 452 L224 445 Z" fill="#FFF4D6"/></g>` : ''}</g>
<g${D(R.shoulder)}><path d="M144 250 Q160 236 178 252 L170 274 Q156 266 144 272 Z M256 250 Q240 236 222 252 L230 274 Q244 266 256 272 Z" fill="${R.metal}" stroke="${C}" stroke-width="1.2"/></g>
<g opacity="${R.scarfGlow}" filter="url(#${k}s)"><path d="M234 252 Q290 252 334 228 Q314 250 340 262 Q292 274 238 266 Z" fill="${R.scarf}"/></g>
<path d="M162 240 Q200 262 238 240 L242 258 Q200 280 158 258 Z" fill="${R.scarf}"/><path d="M170 252 Q200 268 230 252" stroke="${R.scarfDark}" stroke-width="2" fill="none"/>
<g class="v-scarflag"><g class="v-scarf1"><path d="M234 252 Q290 252 334 228 Q314 250 340 262 Q292 274 238 266 Z" fill="${R.scarf}"/></g><g class="v-scarf2"><path d="M236 262 Q280 274 316 270 Q300 282 318 292 Q276 290 238 274 Z" fill="${R.scarfDark}"/></g></g>
<path d="M200 140 L208 124 L214 146 Q254 156 258 205 Q260 240 236 256 L164 256 Q140 240 142 205 Q146 150 200 140 Z" fill="${R.cloak}"/>
<path d="M200 164 Q236 166 238 205 Q238 236 200 240 Q162 236 162 205 Q164 166 200 164 Z" fill="#0A0E17" stroke="${C}" stroke-width="2" stroke-opacity="${R.trim}"/>
${R.crest ? `<path d="M200 142 L208 153 L200 164 L192 153 Z" fill="${C}" filter="url(#${k}b)"/><path d="M200 144 L206 153 L200 162 L194 153 Z" fill="#FFF4D6"/>` : ''}
<g opacity="${R.eyeOp}"><g class="v-eyeglow" filter="url(#${k}e)" fill="${C}"><ellipse cx="186" cy="204" rx="${R.eyeR}" ry="4"/><ellipse cx="214" cy="204" rx="${R.eyeR}" ry="4"/></g></g>
<g class="v-eyes" fill="${ri ? C : '#4FD6FF'}"><path d="M179 205 Q186 199 193 204 Q186 207 179 205 Z M221 205 Q214 199 207 204 Q214 207 221 205 Z"/></g>
<path d="M164 214 Q200 230 236 214 L236 238 Q200 254 164 238 Z" fill="${R.body}"/><path d="M176 226 Q200 236 224 226" stroke="${C}" stroke-width="1.5" fill="none" opacity="${R.maskLine}"/>
</g></g></g>${fx}</svg>`;
}

/* ---------- tela do Vulto: golpe do rank, com som ---------- */
let VSTATE = { view: 0, busy: false, t: null };
function vultoSheet(view) {
  const cur = rankI(); VSTATE.view = view ?? cur;
  const v = VSTATE.view, R = RANKS[v], [mn, md] = VMOVES[v], [wn, wr, wa] = VWEAP[v];
  openSheet(`<div class="v-stage" id="vStage" style="--vc:${R.c}">
    <i class="v-tstop"></i><i class="v-sflash"></i>
    <div class="v-callout"><small>[ Habilidade · Rank ${R.r} ]</small><b>${mn}</b></div>
    <div class="v-evotxt"><small>Rank up</small><b>${R.r}</b></div>
    <div id="vSvg">${vultoSVG(v, R.c, 'big')}</div>
  </div>
  <div class="v-info">
    <div class="row between"><b class="h" style="font-size:1.4rem;color:${R.c}">${mn}</b><span class="tag" style="color:${R.c};background:${R.c}1a">Rank ${R.r}</span></div>
    <div class="small mut" style="margin:4px 0 10px">${md}</div>
    <div class="row between xs"><span class="mut">Arma · <b style="color:#fff">${wn}</b> · ${wr}</span><span class="num" style="font-size:1.1rem;color:${R.c}">ATQ ${wa}</span></div>
  </div>
  <div class="v-ranks">${RANKS.map((x, i) => i <= cur
    ? `<button class="v-rk ${i === v ? 'on' : ''}" style="--rc:${x.c}" data-a="vView" data-i="${i}" aria-label="Ver golpe do Rank ${x.r}">${x.r}</button>`
    : `<span class="v-rk lock" aria-label="Rank ${x.r} bloqueado">${ic('lock')}</span>`).join('')}</div>
  <button class="btn pri block" data-a="vStrike" style="margin-top:12px">${ic('zap')} Executar golpe</button>
  <div class="xs dim center" style="margin-top:8px">Novos golpes e armas liberam a cada promoção de rank.</div>`);
}
function vultoStrike() {
  const st = $('#vStage'); if (!st || VSTATE.busy) return;
  const v = VSTATE.view, K = 'EDCBAS'[v], dur = VMOVES[v][2];
  VSTATE.busy = true;
  st.className = 'v-stage'; void st.offsetWidth; st.classList.add('play', 'm' + K);
  playSound('mv' + K);
  clearTimeout(VSTATE.t);
  VSTATE.t = setTimeout(() => { st.classList.remove('play', 'm' + K); VSTATE.busy = false; }, dur + 40);
}
function vultoView(i) {
  const cur = rankI(); if (i > cur) return;
  const prev = VSTATE.view; VSTATE.busy = false;
  vultoSheet(i);
  if (i !== prev) {
    const st = $('#vStage'); if (!st) return;
    st.classList.add('evolve'); playSound('evolve');
    setTimeout(() => st && st.classList.remove('evolve'), 1600);
  }
}
/* sons dos golpes (usam o motor SY do app) */
(() => {
  const wh = (t, a, d, f0, f1, g) => SY.noise(t + a, d, f0, f1, g, 'bandpass', 1.4, .3);
  const sl = (t, a, g, p) => { SY.noise(t + a, .09, 2500, 7000, g * .9, 'highpass', .7, .3); SY.bell(p, t + a, g * .3, .35, .3); };
  const th = (t, a, g, f = 100) => SY.sub(t + a, f, 40, .25, g);
  const bm = (t, a, g) => { SY.sub(t + a, 75, 28, .9, g); SY.hit(t + a, g * .6); };
  const ch = (t, a, f, g, d) => SY.bell(f, t + a, g, d, .6);
  Object.assign(SYNTH, {
    mvE: t => { wh(t, .12, .22, 500, 1500, .25); sl(t, .3, .3, 2300); th(t, .5, .25, 130); th(t, .6, .15, 105); },
    mvD: t => { wh(t, 0, .12, 300, 600, .12); wh(t, .1, .24, 500, 3200, .45); sl(t, .24, .45, 2800); th(t, .28, .3, 85); },
    mvC: t => { th(t, .1, .22, 110); wh(t, .14, .2, 400, 1300, .2); sl(t, .36, .45, 3000); sl(t, .42, .4, 2600); ch(t, .45, 1760, .18, .6); th(t, .54, .3, 90); },
    mvB: t => { SY.noise(t + .1, .32, 2500, 300, .35, 'lowpass', .8, .4); [.22, .33, .44].forEach((a, i) => { wh(t, a, .12, 800, 4000, .25); sl(t, a + .03, .35, 2600 + i * 400); }); wh(t, .62, .2, 300, 1500, .25); th(t, .66, .22); },
    mvA: t => { th(t, .05, .25); wh(t, .1, .25, 300, 2200, .3); wh(t, .28, .2, 600, 2400, .2); wh(t, .48, .2, 600, 2600, .2); [.3, .37, .44, .51, .58, .65].forEach((a, i) => sl(t, a, .3, 2200 + i * 260)); bm(t, .86, .5); },
    mvS: t => { SY.pad([55, 82.4], t, .8, .1, 400, .5); SY.noise(t + .15, .5, 200, 2500, .25, 'bandpass', 2, .5); ch(t, .45, 1320, .14, 1.3); SY.noise(t + .6, .1, 4000, 800, .3, 'bandpass', 1.4, .3); sl(t, .73, .7, 3200); SY.noise(t + .73, .35, 4000, 500, .55, 'bandpass', .6, .5); bm(t, .74, .85); for (let i = 0; i < 7; i++) ch(t, .8 + i * .045, 3000 + i * 300, .05, .35); th(t, 1.14, .12, 120); SY.tick(t + 1.4, 2000, .15); },
    evolve: t => { SY.noise(t, .62, 200, 4200, .3, 'bandpass', 1.5, .5); bm(t, .6, .4); [1, 1.26, 1.5, 2].forEach((m, i) => ch(t, .58 + i * .09, 523 * m, .14, .9)); }
  });
})();
try { render(); } catch (e) { }
