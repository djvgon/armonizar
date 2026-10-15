/* =====================================================================
   sonido.js — Reproducción con Web Audio: la instrumentación nueva (15/10/2026)

   Preparado por el chat «Schemata app» a partir de la «Prueba de instrumentos» que Diego
   escuchó y aprobó; lo integra y lo mantiene el chat de armonía. Sustituye al sonido.js
   anterior SIN CAMBIAR SU INTERFAZ: el resto de la aplicación lo llama igual.

   Uso (igual que antes):
     Sonido.acorde(notas, segundos)                → suena un acorde (objetos nota)
     Sonido.secuencia([{notas, segundos, alEmpezar}], alTerminar)
     Sonido.parar() · Sonido.enCurso() · Sonido.desbloquear() · Sonido.estado()
     Sonido.INSTRUMENTOS                           → [{id, nombre, grupo}], en el orden del menú
     Sonido.GRUPOS                                 → los nombres de grupo, en orden
     Sonido.elegirInstrumento(id) · Sonido.instrumentoActual() · Sonido.cargarInstrumento(id)
     Sonido.alCambiarEstado · Sonido.alCargar · Sonido.anotarAlSonar(fn)
     Sonido.registrarInstrumento(id, {nombre, muestras})   → lo llaman sonidos/organo.js y coro.js
     Sonido.registrarBanco(id, {muestras, afin, recorte})  → lo llaman los demás sonidos/<banco>.js
   Novedades: `grupo` en cada instrumento y `Sonido.GRUPOS`, para el menú «Instrumentación»;
   `Sonido.negra` (0,6 s, como SEG_POR_NEGRA de app.js), que usan los instrumentos con ritmo.

   Qué recibe: cada acorde llega como lo prepara app.js —[bajo a la octava grave, bajo, tenor,
   contralto, soprano]— o solo [bajo grave, bajo] o una nota suelta. Aquí se reconoce el bajo
   doblado, se quita y se reparten las voces: bajo, tenor, contralto y soprano (de grave a
   agudo). Cada instrumento decide qué toca cada voz y si dobla el bajo a la octava grave.

   Qué cambia en el sonido (los «hachazos» del anterior venían de la ganancia alta, el
   compresor rápido, el corte en 0,15 s, el ataque de cada acorde y la falta de sala):
   · cada voz es una línea: en los instrumentos sostenidos, la nota que se repite de un acorde
     al siguiente se sostiene, sin volver a atacarla; si dura más que la grabación, se
     encadena consigo misma con un fundido;
   · final natural de cada nota y una sala calculada aquí (sin grabaciones);
   · cada muestra con su afinación medida y su volumen igualado;
   · los instrumentos «con ritmo» tienen su propia manera de tocar (bulerías, «a la italiana»,
     cuatro marimbas): cada negra del ejercicio se convierte en su compás.

   Muestras: cada banco es un archivo sonidos/<banco>.js que se carga solo cuando un
   instrumento lo necesita, y se decodifica una vez. Orígenes y licencias, en
   sonidos/LICENCIA-muestras.txt.
   ===================================================================== */

const Sonido = (() => {
  /* ---------- Los instrumentos ---------- */

  const GRUPOS = ['Teclados', 'Voces', 'Orquesta y conjuntos', 'Con ritmo', 'Sin descarga'];
  const INSTRUMENTOS = [
    { id: 'piano',        nombre: 'Piano',                               grupo: 'Teclados' },
    { id: 'clave',        nombre: 'Clave',                               grupo: 'Teclados' },
    { id: 'organo',       nombre: 'Órgano pleno',                        grupo: 'Teclados' },
    { id: 'organo-suave', nombre: 'Órgano suave',                        grupo: 'Teclados' },
    { id: 'marimba',      nombre: 'Marimba',                             grupo: 'Teclados' },
    { id: 'coro',         nombre: 'Coro',                                grupo: 'Voces' },
    { id: 'cuerda',       nombre: 'Orquesta de cuerda',                  grupo: 'Orquesta y conjuntos' },
    { id: 'orquesta',     nombre: 'Orquesta clásica',                    grupo: 'Orquesta y conjuntos' },
    { id: 'quinteto',     nombre: 'Quinteto de viento',                  grupo: 'Orquesta y conjuntos' },
    { id: 'italiana',     nombre: 'Maderas «a la italiana»',               grupo: 'Con ritmo' },
    { id: 'metales',      nombre: 'Metales por bulerías',                grupo: 'Con ritmo' },
    { id: 'marimbas',     nombre: 'Marimbas «a lo Zimmer»',              grupo: 'Con ritmo' },
    { id: 'sintetico',    nombre: 'Sintético',                           grupo: 'Sin descarga' }
  ];

  // Voces: S soprano, A contralto, T tenor, B bajo; con 8: una octava más aguda (S8, A8) o
  // más grave (T8, B8). Las capas de octava se omiten si la nota queda lejos de las muestras.
  const CINCO = ['S', 'A', 'T', 'B', 'B8'];
  const CUERDA = [{ banco: 'violines', partes: ['S'] }, { banco: 'violines', partes: ['A'], g: 0.85 }, { banco: 'violas', partes: ['T'] },
                  { banco: 'violonchelos', partes: ['B'] }, { banco: 'contrabajo', partes: ['B8'], g: 0.75 }];
  const DEF = {
    piano:  { capas: [{ banco: 'piano-salamander', partes: CINCO }], vol: 0.51, ataque: 0.004, final: 0.9, sala: 0.25 },
    clave:  { capas: [{ banco: 'clave-frances', partes: CINCO }], vol: 1, ataque: 0.002, final: 0.35, sala: 0.22 },
    // Órgano pleno: las muestras de siempre (sonidos/organo.js), soprano y contralto también a la
    // octava aguda, el bajo grave reforzado con el pedal de tubos; poca sala para que los
    // acordes no se mezclen (Diego, 15/10: «la plenitud del sonido, no la reverberación»).
    organo: { capas: [{ banco: 'organo', partes: CINCO }, { banco: 'organo', partes: ['S8'], g: 0.55 }, { banco: 'organo', partes: ['A8'], g: 0.45 },
                      { banco: 'organo-tubos-pedal', partes: ['B8'], g: 0.7 }], vol: 1.45, ligar: true, ataque: 0.02, final: 0.3, solape: 0, separacion: 0.03, sala: 0.22 },
    'organo-suave': { capas: [{ banco: 'organo-tubos-manual', partes: ['S', 'A', 'T'] }, { banco: 'organo-tubos-pedal', partes: ['B'] },
                              { banco: 'organo-tubos-pedal', partes: ['B8'], g: 0.85 }], vol: 1.1, ligar: true, ataque: 0.03, final: 0.25, sala: 0.42 },
    marimba: { capas: [{ banco: 'marimba', partes: ['S', 'A', 'T', 'B'] }], vol: 1.9, ataque: 0.002, final: 0.7, sala: 0.25, redoble: true },
    coro:   { estilo: 'coro', banco: 'coro', vol: 1.05, sala: 0.3 },
    cuerda: { capas: CUERDA, vol: 1, ligar: true, ataque: 0.2, final: 0.6, solape: 0.18, sala: 0.5 },
    orquesta: { capas: [{ banco: 'violines', partes: ['S'], g: 0.85 }, { banco: 'violines', partes: ['A'], g: 0.72 }, { banco: 'violas', partes: ['T'], g: 0.85 },
                        { banco: 'violonchelos', partes: ['B'], g: 0.85 }, { banco: 'contrabajo', partes: ['B8'], g: 0.65 },
                        { banco: 'flauta', partes: ['S8'], g: 0.75 }, { banco: 'oboe', partes: ['S'], g: 0.75 }, { banco: 'clarinete', partes: ['A'], g: 0.75 },
                        { banco: 'trompa', partes: ['T8'], g: 0.8 }, { banco: 'fagot', partes: ['B'], g: 0.8 }], vol: 1.2, ligar: true, ataque: 0.07, final: 0.5, sala: 0.45 },
    quinteto: { capas: [{ banco: 'flauta', partes: ['S'], g: 0.85 }, { banco: 'oboe', partes: ['A'], g: 0.8 }, { banco: 'clarinete', partes: ['T'], g: 0.85 },
                        { banco: 'trompa', partes: ['T8'], g: 0.75 }, { banco: 'fagot', partes: ['B'], g: 0.9 }], vol: 1.25, ligar: true, ataque: 0.05, final: 0.35, sala: 0.36 },
    // «A la italiana»: el comienzo de la Sinfonía «Italiana» de Mendelssohn; acordes picados en
    // corcheas repetidas, tres por negra, a negra con puntillo = 152, y la cuerda en pizzicato al
    // empezar cada acorde.
    italiana: { estilo: 'italiana', pulso: 152, picado: 0.05, fuerte: 0.8, debil: 0.4, vol: 1.6, sala: 0.26,
                capas: [{ banco: 'flauta-picado', partes: ['S'], g: 0.85 }, { banco: 'oboe-picado', partes: ['A'], g: 0.8 }, { banco: 'clarinete-picado', partes: ['T'], g: 0.85 },
                        { banco: 'trompa-picado', partes: ['T8'], g: 0.7 }, { banco: 'fagot-picado', partes: ['B'], g: 0.9 }],
                pizz: [{ banco: 'violines-pizzicato', partes: ['S'], g: 0.6 }, { banco: 'violines-pizzicato', partes: ['A'], g: 0.5 }, { banco: 'violas-pizzicato', partes: ['T'], g: 0.6 },
                       { banco: 'violonchelos-pizzicato', partes: ['B'], g: 0.9 }, { banco: 'contrabajo-pizzicato', partes: ['B8'], g: 0.8 }] },
    // Metales por bulerías: compás de doce tiempos contado desde el 12 (6/8 + 3/4) a 228, acordes
    // picados en los acentos (12, 3, 6, 8 y 10); cada negra del ejercicio vale tres tiempos; el
    // último acorde, picado y sostenido.
    metales: { estilo: 'bulerias', cuenta: 60 / 228, vol: 0.85, sala: 0.3,
               capas: [{ banco: 'trompeta-picado', fin: 'trompeta', partes: ['S'] }, { banco: 'trompeta-picado', fin: 'trompeta', partes: ['A'], g: 0.85 },
                       { banco: 'trompa-picado', fin: 'trompa', partes: ['T'], g: 0.9 }, { banco: 'trombon-picado', fin: 'trombon', partes: ['B'], g: 0.95 },
                       { banco: 'tuba', fin: 'tuba', partes: ['B8'], g: 0.8 }] },
    // Cuatro marimbas, negra = 112: dos arpegian el acorde en semicorcheas (do4–do6 y do3–do5),
    // la tercera da el acorde con el ritmo 3 + 3 + 2 y la cuarta lleva el bajo.
    marimbas: { estilo: 'marimbas', pulso: 112, r1: [60, 84], r2: [48, 72], vol: 0.52, sala: 0.28 },
    sintetico: { estilo: 'sintetico' }
  };
  const PARTES = { S: 3, A: 2, T: 1, B: 0 };
  const GPARTE = { S: 1.0, A: 0.8, T: 0.8, B: 0.95, B8: 0.7, T8: 0.8, S8: 0.9, A8: 0.8 };
  const DOBLES = { B8: 1, T8: 1, S8: 1, A8: 1 };

  /* ---------- Estado ---------- */

  let ctx = null, comp = null, maestro = null, sala = null;
  let activos = [];            // {s: fuente, g: ganancia}
  let temporizadores = [];
  let alTerminarActual = null, sonando = false, generacion = 0;
  let actual = 'piano';
  const bancos = {};           // id → {muestras:{midi: base64}, afin, recorte, buffers, norma, cargando}
  // ajustes.percusionBulerias: cajón y palmas con los metales por bulerías. INACTIVO (Diego,
  // 15/10: «no se parece en nada al ritmo del flamenco; mejor no ponerlo de momento»); las
  // muestras y el dibujo están listos por si se activa cuando tenga claras las fórmulas rítmicas.
  const Sonido = { INSTRUMENTOS, GRUPOS, negra: 0.6, ajustes: { percusionBulerias: false }, alCambiarEstado: null, alCargar: null };

  /* ---------- Contexto y sala ---------- */

  function crearSala(segundos, caida, claridad) {
    const sr = ctx.sampleRate, len = Math.floor(segundos * sr), pre = Math.floor(0.025 * sr), ir = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let y = 0;
      for (let i = pre; i < len; i++) { const t = (i - pre) / sr; y += claridad * ((Math.random() * 2 - 1) * Math.exp(-t * caida) - y); d[i] = y; }
    }
    const cv = ctx.createConvolver(); cv.buffer = ir; return cv;
  }
  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('Este navegador no tiene Web Audio.');
      ctx = new AC();
      ctx.onstatechange = () => { if (typeof Sonido.alCambiarEstado === 'function') Sonido.alCambiarEstado(ctx.state); };
      try {
        comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 2.5; comp.attack.value = 0.01; comp.release.value = 0.3;
        comp.connect(ctx.destination);
      } catch (e) { comp = ctx.destination; }
      maestro = ctx.createGain(); maestro.gain.value = 0.9; maestro.connect(comp);
      try { sala = crearSala(3.0, 2.6, 0.32); sala.connect(maestro); } catch (e) { sala = null; }
    }
    if (ctx.state !== 'running') { try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* nada */ } }
    return ctx;
  }
  function desbloquear() {
    try {
      const c = contexto(), b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
      s.buffer = b; s.connect(c.destination); s.start(0);
    } catch (e) { /* sin audio */ }
    cargarInstrumento(actual).catch(() => {});
  }
  function estado() {
    if (!(window.AudioContext || window.webkitAudioContext)) return 'sin web audio';
    return ctx ? ctx.state : 'sin crear';
  }

  /* ---------- Bancos de muestras ---------- */

  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nombreAMidi(nombre) {
    if (/^\d+$/.test(nombre)) return Number(nombre);
    const m = /^([A-G])(b|#)?(-?\d)$/.exec(nombre);
    return 12 * (parseInt(m[3], 10) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function registrarBanco(id, datos) {
    const previo = bancos[id] || {};
    const muestras = {};
    Object.entries(datos.muestras || {}).forEach(([n, b64]) => { muestras[nombreAMidi(n)] = b64; });
    bancos[id] = { muestras, afin: datos.afin || {}, recorte: datos.recorte || 'largo', buffers: null, norma: null, cargando: previo.cargando || null };
  }
  // Los archivos antiguos (sonidos/organo.js y coro.js) registran un «instrumento»: aquí es un banco.
  function registrarInstrumento(id, datos) { registrarBanco(id, { muestras: datos.muestras, recorte: 'largo' }); }

  function cargarScript(ruta) {
    return new Promise((resolver, rechazar) => {
      const s = document.createElement('script');
      s.src = ruta; s.async = true;
      s.onload = () => resolver();
      s.onerror = () => rechazar(new Error('No se ha podido cargar ' + ruta));
      document.head.appendChild(s);
    });
  }
  function decodificarUna(c, b64) {
    const bin = atob(b64.indexOf(',') >= 0 ? b64.split(',')[1] : b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Promise((resolver, rechazar) => {
      const r = c.decodeAudioData(bytes.buffer, resolver, err => rechazar(err || new Error('decodeAudioData')));   // Safari antiguo: solo con funciones de retorno
      if (r && r.then) r.then(resolver, rechazar);
    });
  }
  // Volumen de cada muestra igualado por su energía entre 0,05 y 1,5 s.
  function normaDe(buf) {
    const d = buf.getChannelData(0), a = Math.floor(0.05 * buf.sampleRate), z = Math.min(d.length, Math.floor(1.5 * buf.sampleRate));
    let s = 0; for (let i = a; i < z; i++) s += d[i] * d[i];
    return Math.min(8, 0.12 / (Math.sqrt(s / Math.max(1, z - a)) || 0.1));
  }
  function cargarBanco(id) {
    const b = bancos[id];
    if (b && b.buffers) return Promise.resolve(b);
    if (b && b.cargando) return b.cargando;
    const p = (b ? Promise.resolve() : cargarScript('sonidos/' + id + '.js'))
      .then(() => {
        const r = bancos[id];
        if (!r || !Object.keys(r.muestras).length) throw new Error('El banco ' + id + ' no tiene muestras.');
        const c = contexto(), buffers = {}, norma = {};
        return Promise.all(Object.entries(r.muestras).map(([k, b64]) => decodificarUna(c, b64).then(buf => { buffers[k] = buf; norma[k] = normaDe(buf); })))
          .then(() => { r.buffers = buffers; r.norma = r.norma || norma; r.cargando = null; r.claves = Object.keys(buffers).map(Number).sort((x, y) => x - y); return r; });
      })
      .catch(err => { if (bancos[id]) bancos[id].cargando = null; throw err; });
    if (!bancos[id]) bancos[id] = { muestras: {}, afin: {}, buffers: null, cargando: p }; else bancos[id].cargando = p;
    return p;
  }
  function bancosDe(def) {
    if (!def || def.estilo === 'sintetico') return [];
    if (def.estilo === 'coro') return [def.banco];
    if (def.estilo === 'marimbas') return ['marimba', 'marimba-fuerte'];
    const capas = def.capas.concat(def.pizz || []);
    const extra = def.estilo === 'bulerias' && Sonido.ajustes.percusionBulerias ? Object.keys(G_PERC) : [];
    return [...new Set(capas.flatMap(c => (c.fin ? [c.banco, c.fin] : [c.banco])).concat(extra))];
  }
  function cargarInstrumento(id) {
    const def = DEF[id];
    if (!def) return Promise.reject(new Error('Instrumento desconocido: ' + id));
    const lista = bancosDe(def);
    if (!lista.length) return Promise.resolve(null);
    const listos = lista.every(b => bancos[b] && bancos[b].buffers);
    if (listos) return Promise.resolve(true);
    if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, false);
    return Promise.all(lista.map(cargarBanco))
      .then(() => { if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, true); return true; })
      .catch(err => { if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, true); throw err; });
  }
  function elegirInstrumento(id) {
    if (!DEF[id]) return;
    actual = id;
    if (ctx) cargarInstrumento(id).catch(() => {});
  }
  const instrumentoActual = () => actual;

  // La muestra más cercana y cuánto hay que transportarla (corrigiendo su afinación medida).
  function cercana(id, m) {
    const b = bancos[id], ks = b.claves;
    let k = ks[0]; for (const x of ks) if (Math.abs(x - m) < Math.abs(k - m)) k = x;
    return { banco: b, k, buf: b.buffers[k], norma: b.norma[k], semitonos: m - k - ((b.afin && b.afin[k]) || 0) / 100 };
  }

  /* ---------- Las voces de cada acorde ---------- */

  const midiDe = n => (typeof n === 'number' ? n : Teoria.midi(n));
  // [bajo grave, bajo, tenor, contralto, soprano] → [B, T, A, S] (null si falta).
  function vocesDe(notas) {
    if (!notas || !notas.length) return null;
    let ms = notas.map(midiDe);
    let doblado = false;
    if (ms.length >= 2 && ms[0] === ms[1] - 12) { ms = ms.slice(1); doblado = true; }
    ms = ms.slice().sort((a, b) => a - b);
    if (ms.length === 1) return doblado ? [ms[0], null, null, null] : [null, null, null, ms[0]];   // solo el bajo, o una nota de la melodía
    const v = [ms[0], null, null, ms[ms.length - 1]];
    if (ms.length >= 3) v[2] = ms[ms.length - 2];
    if (ms.length >= 4) v[1] = ms[ms.length - 3];
    return v;
  }
  function altura(ac, parte) {
    if (!ac) return null;
    const base = { S: ac[3], A: ac[2], T: ac[1], B: ac[0], S8: ac[3], A8: ac[2], T8: ac[1], B8: ac[0] }[parte];
    if (base == null) return null;
    return base + (parte === 'S8' || parte === 'A8' ? 12 : parte === 'T8' || parte === 'B8' ? -12 : 0);
  }
  // La pieza que suena: acordes (o null en los silencios), segundos y negras de cada uno.
  function pieza(items) {
    return {
      acordes: items.map(it => vocesDe(it.notas)),
      seg: items.map(it => Math.max(0.05, it.segundos || 0)),
      negras: items.map(it => Math.max(0.05, it.segundos || 0) / (Sonido.negra || 0.6))
    };
  }

  /* ---------- Piezas comunes ---------- */

  function salidaDe(def) {
    const c = contexto(), bus = c.createGain();
    const seca = c.createGain(); seca.gain.value = 1 - (def.sala || 0) * 0.5; bus.connect(seca); seca.connect(maestro);
    if (sala && def.sala) { const hum = c.createGain(); hum.gain.value = def.sala; bus.connect(hum); hum.connect(sala); }
    return bus;
  }
  function fuente(buf, semis) {
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = Math.pow(2, semis / 12); return s;
  }
  function curva(desde, hasta, nivel) {
    const c = new Float32Array(32);
    for (let i = 0; i < 32; i++) { const x = i / 31; c[i] = nivel * (desde < hasta ? Math.sin(x * Math.PI / 2) : Math.cos(x * Math.PI / 2)); }
    return c;
  }
  // Sostiene una nota el tiempo que haga falta: si la grabación se acaba antes, la encadena
  // consigo misma (desde «lazo») con un fundido de igual potencia.
  function sostener(m, t, dur, destino, off) {
    const b = m.banco, buf = m.buf, rate = Math.pow(2, m.semitonos / 12), XF = 0.3;
    const largo = b.recorte === 'largo';
    const fin = largo ? Math.min(3.0, buf.duration - 0.35) : buf.duration, lazo = Math.min(1.0, fin / 3);
    let ts = t, o = off || 0, k = 0;
    while (true) {
      const disp = (fin - o) / rate, restante = t + dur - ts;
      const g = ctx.createGain(); g.connect(destino);
      const s = fuente(buf, m.semitonos); s.connect(g);
      if (k > 0) g.gain.setValueCurveAtTime(curva(0, 1, 1), ts, XF); else g.gain.setValueAtTime(1, ts);
      if (!largo || disp >= restante + 0.5 || k > 40) { s.start(ts, o); s.stop(t + dur + 3); activos.push({ s, g }); break; }
      const f = ts + disp;
      g.gain.setValueCurveAtTime(curva(1, 0, 1), f - XF, XF);
      s.start(ts, o); s.stop(f + 0.05); activos.push({ s, g });
      ts = f - XF; o = lazo; k++;
    }
  }
  function lejos(m, parte) { return DOBLES[parte] && Math.abs(m.semitonos) > 7; }

  /* Cuándo se sostiene una nota que se repite (en vez de volver a atacarla): solo si hay al menos
     dos voces y el acorde cambia. Una melodía o un bajo solos, o un acorde que se repite igual,
     se vuelven a atacar, para que se oiga la nota repetida. */
  const reales = ac => (ac ? ac.filter(x => x != null).length : 0);
  const iguales = (a, b) => a && b && a.every((x, i) => x === b[i]);
  function seLiga(p, i) { return i > 0 && reales(p.acordes[i]) >= 2 && reales(p.acordes[i - 1]) >= 2 && !iguales(p.acordes[i], p.acordes[i - 1]); }

  /* ---------- Estilo general: cada voz, una línea ---------- */

  function tocarLineas(def, p, t0) {
    const ini = []; let t = 0;
    p.seg.forEach(s => { ini.push(t); t += s; });
    const voces = def.capas.reduce((k, c) => k + c.partes.length, 0), bus = salidaDe(def);
    def.capas.forEach(capa => capa.partes.forEach(parte => {
      const evs = [];
      p.acordes.forEach((ac, i) => {
        const m = altura(ac, parte), a = ini[i], b = ini[i] + p.seg[i], u = evs[evs.length - 1];
        if (m == null) return;
        if (def.ligar && u && u.m === m && Math.abs(u.fin - a) < 1e-6 && seLiga(p, i)) u.fin = b; else evs.push({ m, ini: a, fin: b });
      });
      evs.forEach(ev => {
        const mu = cercana(capa.banco, ev.m);
        if (lejos(mu, parte)) return;
        const nivel = 0.5 * (def.vol || 1) * mu.norma * GPARTE[parte] * (capa.g || 1) / Math.sqrt(voces);
        const ta = t0 + ev.ini;
        const tf = t0 + ev.fin + (def.solape !== undefined ? def.solape : (def.ligar ? 0.04 : 0)) - (def.separacion || 0);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ta); g.gain.linearRampToValueAtTime(nivel, ta + def.ataque);
        g.gain.setValueAtTime(nivel, Math.max(ta + def.ataque, tf)); g.gain.setTargetAtTime(0, Math.max(ta + def.ataque, tf), Math.max(0.01, def.final / 4));
        g.connect(bus);
        if (def.redoble && ev.fin - ev.ini >= 1.8) {          // marimba: la nota larga, redoblada
          let k = 0;
          for (let ts = ta; ts < tf - 0.05; ts += 0.075 + Math.random() * 0.02, k++) {
            const gg = ctx.createGain(); gg.gain.value = (k % 2 ? 0.5 : 0.62) * (k === 0 ? 1.4 : 1); gg.connect(g);
            const s = fuente(mu.buf, mu.semitonos); s.connect(gg); s.start(ts); s.stop(tf + def.final * 2.5 + 0.1);
            activos.push({ s, g: gg });
          }
          activos.push({ s: null, g });
          return;
        }
        if (def.ligar) sostener(mu, ta, tf - ta + def.final, g, 0);
        else { const s = fuente(mu.buf, mu.semitonos); s.connect(g); s.start(ta); s.stop(tf + def.final * 2.5 + 0.1); activos.push({ s, g }); }
      });
    }));
    /* `aviso`: cuánto tarda el acorde en estar AHÍ desde que se programa. La nota entra con
       una rampa de `ataque` mientras la anterior sigue sonando (`solape`), así que el oído
       registra el cambio al final de esa rampa, no al principio: con la orquesta de cuerda,
       0,2 s. Es lo que hay que esperar antes de encender el ▶ del acorde (Diego, 15/10: «no
       va sincronizada con el desplazamiento del cursor»). */
    return { ini, total: t + 0.3, aviso: def.ataque || 0 };
  }

  /* ---------- Coro cantado ----------
     Cada voz canta su línea: la nota común se sostiene; de una nota a otra, legato (la nueva
     entra ya cantando mientras la anterior se apaga, en 0,14 s); cada cuerda, doblada por un
     segundo cantor algo desafinado y desplazado; sopranos y contraltos a la izquierda, tenores y
     bajos a la derecha; la frase crece un poco hacia el final y el último acorde se apaga
     despacio. Sin doblar el bajo. (Diego, 15/10: «lo que suena ahora son notas separadas unas
     de otras que no ayudan a la armoniosidad del conjunto».) */
  const PAN_CORO = { S: -0.35, A: -0.12, T: 0.12, B: 0.35 }, G_CORO = { S: 1.0, A: 0.78, T: 0.8, B: 0.95 };
  function panorama(valor, destino) {
    const pn = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pn.pan) pn.pan.value = valor; pn.connect(destino); return pn;
  }
  function tocarCoro(def, p, t0) {
    const ini = []; let t = 0;
    p.seg.forEach(s => { ini.push(t); t += s; });
    const X = 0.14, total = t;
    const ultimo = Math.max(0, p.acordes.map((a, i) => (a ? i : -1)).filter(i => i >= 0).pop() || 0);
    const bus = salidaDe(def), frase = ctx.createGain(); frase.connect(bus);
    frase.gain.setValueAtTime(0.85, t0); frase.gain.linearRampToValueAtTime(1.0, t0 + Math.max(0.1, ini[ultimo] * 0.8));
    frase.gain.setValueAtTime(1.0, t0 + ini[ultimo] + 0.15); frase.gain.linearRampToValueAtTime(0.72, t0 + total + 0.01);
    ['S', 'A', 'T', 'B'].forEach(parte => {
      const evs = [];
      p.acordes.forEach((ac, i) => {
        const m = altura(ac, parte), a = ini[i], b = ini[i] + p.seg[i], u = evs[evs.length - 1];
        if (m == null) return;
        if (u && u.m === m && Math.abs(u.fin - a) < 1e-6 && seLiga(p, i)) u.fin = b; else evs.push({ m, ini: a, fin: b });
      });
      const pan = panorama(PAN_CORO[parte], frase);
      evs.forEach((ev, k) => {
        const prev = evs[k - 1], next = evs[k + 1];
        const desde = prev && Math.abs(prev.fin - ev.ini) < 1e-6, hacia = next && Math.abs(ev.fin - next.ini) < 1e-6;
        [{ c: 0, d: 0, g: 1, o: 0 }, { c: 0.07, d: 0.022, g: 0.55, o: 0.45 }].forEach(cantor => {
          const mu = cercana(def.banco, ev.m);
          const nivel = 0.5 * (def.vol || 1) * mu.norma * G_CORO[parte] * cantor.g / Math.sqrt(4 * 1.3);
          const a = t0 + ev.ini + cantor.d - (desde ? X / 2 : 0), b = t0 + ev.fin + cantor.d + (hacia ? X / 2 : 0);
          const g = ctx.createGain(), Xe = Math.min(X, (b - a) / 2.5); g.connect(pan);
          if (desde) g.gain.setValueCurveAtTime(curva(0, 1, nivel), a, Xe);
          else { g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(nivel, a + Math.min(0.07, Xe)); }
          if (hacia) g.gain.setValueCurveAtTime(curva(1, 0, nivel), b - Xe, Xe);
          else { g.gain.setValueAtTime(nivel, b); g.gain.setTargetAtTime(0, b, k === evs.length - 1 ? 0.35 : 0.12); }
          sostener({ ...mu, semitonos: mu.semitonos + cantor.c }, a, b - a, g, (desde ? 0.25 : 0) + cantor.o);
        });
      });
    });
    /* En el coro la nota ligada entra media cruzada antes (X/2) y se cruza con la anterior
       en X: el cambio se oye a mitad del cruce. */
    return { ini, total: total + 0.4, aviso: X / 2 };
  }

  /* ---------- Golpe corto de un acorde entero (estilos con ritmo) ---------- */

  function golpeAcorde(def, capas, voces, bus, ac, ts, v, dur, tau) {
    capas.forEach(capa => capa.partes.forEach(parte => {
      const m = altura(ac, parte); if (m == null) return;
      const mu = cercana(capa.banco, m); if (lejos(mu, parte)) return;
      const nivel = 0.5 * (def.vol || 1) * mu.norma * GPARTE[parte] * (capa.g || 1) * v / Math.sqrt(voces);
      const t = ts + (Math.random() - 0.5) * 0.008, g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(nivel, t + 0.004);
      g.gain.setValueAtTime(nivel, t + dur); g.gain.setTargetAtTime(0, t + dur, tau); g.connect(bus);
      const s = fuente(mu.buf, mu.semitonos); s.connect(g); s.start(t); s.stop(t + dur + tau * 8 + 0.1);
      activos.push({ s, g });
    }));
  }

  /* ---------- Metales por bulerías ---------- */

  const ACENTOS = [0, 3, 6, 8, 10];

  /* Cajón y palmas (inactivos: ver Sonido.ajustes). Compás de doce tiempos desde el 12.
     Cajón: grave en el 12 y el 6, tapa en el 3, el 8 y el 10 (el 10, el más fuerte), golpes
     suaves en el resto y un toque a medio tiempo antes del 3 y del 10. Palmas: claras en los
     acentos, sordas en el resto. Al final, golpe de todo. La percusión va por debajo de los
     metales para no tapar los acordes. */
  const G_PERC = { 'cajon-grave': 0.3, 'cajon-agudo': 0.23, 'cajon-suave': 0.17, 'palmas-claras': 0.17, 'palmas-sordas': 0.12 };
  function percu(banco, ts, v, bus) {
    const b = bancos[banco]; if (!b || !b.buffers) return;
    const ks = Object.keys(b.buffers), buf = b.buffers[ks[Math.floor(Math.random() * ks.length)]];
    const s = ctx.createBufferSource(); s.buffer = buf;
    const g = ctx.createGain(); g.gain.value = G_PERC[banco] * v;
    s.connect(g); g.connect(bus); s.start(Math.max(ctx.currentTime, ts + (Math.random() - 0.5) * 0.01));
    activos.push({ s, g });
  }
  function compasPercusion(t0, cuenta, ultimo) {
    const bus = salidaDe({ sala: 0.2 });
    for (let k = 0; k <= ultimo; k++) {
      const ts = t0 + k * cuenta, pos = k % 12, fin = (k === ultimo);
      if (fin) { percu('cajon-grave', ts, 1.2, bus); percu('cajon-agudo', ts, 1.0, bus); percu('palmas-claras', ts, 1.1, bus); percu('palmas-claras', ts + 0.012, 0.8, bus); continue; }
      if (pos === 0 || pos === 6) percu('cajon-grave', ts, pos === 0 ? 1 : 0.85, bus);
      else if (pos === 3 || pos === 8) percu('cajon-agudo', ts, 0.85, bus);
      else if (pos === 10) percu('cajon-agudo', ts, 1.15, bus);
      else percu('cajon-suave', ts, 0.8, bus);
      if (pos === 2 || pos === 9) percu('cajon-suave', ts + cuenta / 2, 0.7, bus);
      if (ACENTOS.includes(pos)) percu('palmas-claras', ts, pos === 10 ? 1.1 : 0.85, bus);
      else percu('palmas-sordas', ts, 0.8, bus);
    }
  }

  function tocarBulerias(def, p, t0, aislado) {
    const CUENTA = def.cuenta, voces = def.capas.reduce((k, c) => k + c.partes.length, 0), bus = salidaDe(def);
    const ultimo = p.acordes.map((a, i) => (a ? i : -1)).filter(i => i >= 0).pop();
    const ini = []; let c = 0, golpeFinal = 0;
    p.acordes.forEach((ac, i) => {
      ini.push(c * CUENTA);
      const len = Math.max(1, Math.round(p.negras[i] * 3));
      if (ac) {
        let g = [];
        for (let k = c; k < c + len; k++) if (ACENTOS.includes(k % 12)) g.push(k);
        if (!g.length) g = [c];
        const final = (i === ultimo) || aislado;
        if (final) { g = [g[0]]; golpeFinal = g[0]; }
        g.forEach(k => {
          const ts = t0 + k * CUENTA, v = (k % 12 === 10 || k % 12 === 0) ? 1.1 : 1.0;
          golpeAcorde(def, def.capas, voces, bus, ac, ts, v, final ? 0.12 : 0.17, 0.035);
          if (final) golpeAcorde(def, def.capas.map(x => ({ ...x, banco: x.fin })), voces, bus, ac, ts, 0.95, 1.1, 0.12);
        });
      }
      c += len;
    });
    if (Sonido.ajustes.percusionBulerias && !aislado) compasPercusion(t0, CUENTA, golpeFinal);
    return { ini, total: c * CUENTA + 1.2, aviso: 0 };      // picado: se oye al instante
  }

  /* ---------- Quinteto de viento «a la italiana» ---------- */

  function tocarItaliana(def, p, t0) {
    const corchea = 60 / (def.pulso * 3), voces = def.capas.reduce((k, c) => k + c.partes.length, 0), bus = salidaDe(def);
    const vp = def.pizz.reduce((k, c) => k + c.partes.length, 0);
    const ultimo = p.acordes.map((a, i) => (a ? i : -1)).filter(i => i >= 0).pop();
    const ini = []; let t = 0;
    p.acordes.forEach((ac, i) => {
      ini.push(t);
      const golpes = Math.max(1, Math.round(p.negras[i] * 3));
      if (ac) {
        for (let k = 0; k < golpes; k++) golpeAcorde(def, def.capas, voces, bus, ac, t0 + t + k * corchea, k === 0 ? def.fuerte * 1.1 : (k % 3 === 0 ? def.fuerte : def.debil), def.picado, 0.02);
        golpeAcorde(def, def.pizz, vp, bus, ac, t0 + t, 0.3, 0.5, 0.12);
      }
      t += golpes * corchea;
      if (i === ultimo) {
        golpeAcorde(def, def.capas, voces, bus, ac, t0 + t, def.fuerte * 1.2, 0.22, 0.05);
        golpeAcorde(def, def.pizz, vp, bus, ac, t0 + t, 0.35, 0.6, 0.15);
      }
    });
    return { ini, total: t + 3 * corchea + 0.3, aviso: 0 };   // picado: se oye al instante
  }

  /* ---------- Cuatro marimbas ---------- */

  function tocarMarimbas(def, p, t0, aislado) {
    const sc = 60 / (def.pulso * 4), bus = salidaDe(def);
    const M = [{ pan: -0.5, cents: -4, g: 0.62 }, { pan: 0.5, cents: 5, g: 0.58 }, { pan: -0.12, cents: 0, g: 0.8 }, { pan: 0.18, cents: -3, g: 1.0 }];
    const salidas = M.map(m => panorama(m.pan, bus));
    const golpe = (i, m, ts, v, fuerte, suena) => {
      const mu = cercana(fuerte ? 'marimba-fuerte' : 'marimba', m);
      const nivel = 0.3 * (def.vol || 1) * mu.norma * M[i].g * v, t = ts + (Math.random() - 0.5) * 0.006, g = ctx.createGain();
      g.gain.setValueAtTime(nivel, t); g.gain.setValueAtTime(nivel, t + suena); g.gain.setTargetAtTime(0, t + suena, 0.08); g.connect(salidas[i]);
      const s = fuente(mu.buf, mu.semitonos + M[i].cents / 100); s.connect(g); s.start(t); s.stop(t + suena + 0.6);
      activos.push({ s, g });
    };
    const clases = ac => [...new Set(ac.filter(x => x != null).map(x => ((x % 12) + 12) % 12))];
    const reserva = (ac, lo, hi) => { const c = clases(ac), r = []; for (let m = lo; m <= hi; m++) if (c.includes(m % 12)) r.push(m); return r; };
    const cercano = (lista, m) => { let j = 0; lista.forEach((x, k) => { if (Math.abs(x - m) < Math.abs(lista[j] - m)) j = k; }); return j; };
    const arriba = ac => [ac[3], ac[2], ac[1]].filter(x => x != null);
    const final = (ac, tf, roll) => {
      const B = ac[0];
      [ac[3] != null ? ac[3] + 12 : null, ...arriba(ac)].filter(x => x != null).forEach(m => golpe(0, m, tf, 1, true, 1.4));
      if (B != null) { golpe(3, B, tf, 1.1, true, 1.6); if (B - 12 >= 40) golpe(3, B - 12, tf, 0.95, true, 1.6); }
      let r = 0;
      for (let ts = tf + 0.07; ts < tf + roll; ts += 0.068 + Math.random() * 0.012, r++) {
        const v = 0.55 * Math.max(0.25, 1 - (ts - tf) / (roll + 0.3));
        arriba(ac).forEach((m, z) => golpe(2, m, ts + z * 0.008, (r % 2 ? 0.85 : 1) * v, false, 0.3));
      }
    };
    const ultimo = p.acordes.map((a, i) => (a ? i : -1)).filter(i => i >= 0).pop();
    if (aislado) {                                   // un acorde suelto: el golpe de las cuatro y un redoble corto
      const ac = p.acordes[0]; if (ac) final(ac, t0, 0.9);
      return { ini: [0], total: 1.6 };
    }
    const a1 = { m: def.r1[0] + 4, dir: 1 }, a2 = { m: def.r2[0] + 5, dir: 1, fase: 0 };
    const ini = []; let k = 0;
    p.acordes.forEach((ac, i) => {
      ini.push(k * sc);
      const semis = Math.max(1, Math.round(p.negras[i] * 4));
      if (!ac) { k += semis; return; }
      const r1 = reserva(ac, def.r1[0], def.r1[1]), r2 = reserva(ac, def.r2[0], def.r2[1]), sup = arriba(ac), B = ac[0];
      let j1 = cercano(r1, a1.m), j2 = cercano(r2, a2.m);
      for (let q = 0; q < semis; q++, k++) {
        const ts = t0 + k * sc, pos = k % 8, tres = (pos === 0 || pos === 3 || pos === 6), inicio = (q === 0);
        if (q > 0) { if (j1 + a1.dir < 0 || j1 + a1.dir >= r1.length) a1.dir *= -1; j1 += a1.dir; }
        a1.m = r1[j1]; golpe(0, a1.m, ts, k % 4 === 0 ? 1 : 0.62, k % 4 === 0, 0.32);
        if (q > 0) {
          const paso = a2.fase % 2 === 0 ? 2 * a2.dir : -a2.dir;
          if (j2 + paso < 0 || j2 + paso >= r2.length) { a2.dir *= -1; j2 = Math.max(0, Math.min(r2.length - 1, j2 + a2.dir)); a2.fase = 0; }
          else { j2 += paso; a2.fase++; }
        }
        a2.m = r2[j2]; golpe(1, a2.m, ts, tres ? 0.95 : 0.6, tres, 0.32);
        if (tres || inicio) sup.forEach(m => golpe(2, m, ts, pos === 0 || inicio ? 1 : 0.78, true, 0.7));
        if ((tres || inicio) && B != null) {
          const v = pos === 6 && !inicio ? 0.7 : 1;
          golpe(3, B, ts, v, true, 0.9); if (B - 12 >= 40) golpe(3, B - 12, ts, v * 0.85, true, 0.9);
        }
      }
    });
    if (ultimo != null) final(p.acordes[ultimo], t0 + k * sc, 1.6);
    return { ini, total: k * sc + 2.2, aviso: 0 };            // golpe de marimba: al instante
  }

  /* ---------- Sintético (osciladores, sin descarga) ---------- */

  function tocarSintetico(p, t0) {
    const ini = []; let t = 0;
    p.acordes.forEach((ac, i) => {
      ini.push(t);
      const dur = p.seg[i];
      if (ac) {
        const ms = [ac[0] != null ? ac[0] - 12 : null, ...ac].filter(x => x != null), n = Math.max(1, ms.length), ta = t0 + t;
        const master = ctx.createGain(), gan = 0.09 / Math.sqrt(n);
        master.gain.setValueAtTime(0, ta); master.gain.linearRampToValueAtTime(gan, ta + 0.02);
        master.gain.setValueAtTime(gan, ta + Math.max(0.03, dur - 0.12)); master.gain.linearRampToValueAtTime(0, ta + dur);
        master.connect(maestro);
        ms.forEach(m => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); o.connect(master); o.start(ta); o.stop(ta + dur + 0.05); activos.push({ s: o, g: master }); });
      }
      t += dur;
    });
    return { ini, total: t, aviso: 0.02 };
  }

  /* ---------- Reproducción ---------- */

  function tocarPieza(items, t0, aislado) {
    const def = DEF[actual] || DEF.piano, p = pieza(items);
    const listo = bancosDe(def).every(b => bancos[b] && bancos[b].buffers);
    if (def.estilo === 'sintetico' || !listo) return tocarSintetico(p, t0);       // si no se ha podido cargar, suena con osciladores
    if (def.estilo === 'coro') return tocarCoro(def, p, t0);
    if (def.estilo === 'bulerias') return tocarBulerias(def, p, t0, aislado);
    if (def.estilo === 'italiana') return tocarItaliana(def, p, t0);
    if (def.estilo === 'marimbas') return tocarMarimbas(def, p, t0, aislado);
    return tocarLineas(def, p, t0);
  }
  function preparar() { return cargarInstrumento(actual).catch(() => null); }

  /* QUE NO SUENEN DOS COSAS A LA VEZ (9/10/2026): la grabación de música real y la realización
     no deben pisarse; quien quiera enterarse se apunta con Sonido.anotarAlSonar(fn). */
  let alSonar = null;
  function avisarQueSuena() { if (alSonar) { try { alSonar(); } catch (e) { /* no es asunto nuestro */ } } }
  function anotarAlSonar(fn) { alSonar = typeof fn === 'function' ? fn : null; }

  function acorde(notas, segundos = 1.2) {
    avisarQueSuena();
    parar();
    contexto();
    const gen = ++generacion;
    preparar().then(() => {
      if (gen !== generacion) return;
      tocarPieza([{ notas, segundos }], contexto().currentTime + 0.03, true);
    });
  }

  function secuencia(items, alTerminar) {
    avisarQueSuena();
    parar();
    contexto();
    const gen = ++generacion;
    sonando = true;
    alTerminarActual = alTerminar || null;
    preparar().then(() => {
      if (gen !== generacion) return;
      const t0 = contexto().currentTime + 0.08;
      const { ini, total, aviso } = tocarPieza(items, t0, false);
      const espera = t => Math.max(0, (t0 + t - ctx.currentTime) * 1000);
      /* EL ▶ DEL ACORDE SE ENCIENDE CUANDO EL ACORDE SE OYE, no cuando se programa (Diego,
         15/10/2026: la instrumentación nueva «no va sincronizada con el desplazamiento del
         cursor sobre la partitura»). Los instrumentos de ataque lento —la orquesta de cuerda
         entra en 0,2 s— llegan tarde respecto de su propio comienzo, y la luz se adelantaba
         ese tanto. Cada estilo dice su `aviso`; aquí se espera, sin pasar nunca del 40 % del
         acorde, para que la luz no llegue cuando el acorde ya se ha ido. */
      const tarda = i => Math.min(aviso || 0, 0.4 * Math.max(0.05, items[i].segundos || 0));
      items.forEach((it, i) => { if (typeof it.alEmpezar === 'function') temporizadores.push(setTimeout(it.alEmpezar, espera((ini[i] || 0) + tarda(i)))); });
      temporizadores.push(setTimeout(terminar, espera(total) + 60));
    });
  }

  function terminar() {
    const f = alTerminarActual;
    alTerminarActual = null;
    sonando = false;
    if (f) f();
  }

  function parar() {
    generacion++;
    const t = ctx ? ctx.currentTime : 0;
    activos.forEach(({ s, g }) => {
      try { if (g) { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.03); } } catch (e) { /* nada */ }
      try { if (s) s.stop(t + 0.15); } catch (e) { /* ya parado */ }
    });
    activos = [];
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    if (sonando) terminar();
  }

  function enCurso() { return sonando; }

  /* ---------- QUÉ INSTRUMENTOS SUENAN, PARA DECÍRSELO AL ALUMNO ----------
     (Diego, 15/10/2026: «¿cómo se podría hacer explícito al estudiante qué instrumentos están
     sonando?».) Se saca de las PROPIAS CAPAS con las que suena cada instrumentación, no de una
     lista escrita a mano: así el cuadro no puede decir una cosa y sonar otra. Si algún día se
     cambia qué voz lleva el oboe, el texto cambia solo. */
  const NOMBRE_BANCO = {
    'piano-salamander': 'piano', 'clave-frances': 'clave',
    'organo': 'órgano', 'organo-tubos-manual': 'órgano de tubos', 'organo-tubos-pedal': 'pedal de tubos',
    'marimba': 'marimba', 'marimba-fuerte': 'marimba', 'coro': 'coro',
    'violines': 'violines', 'violas': 'violas', 'violonchelos': 'violonchelos', 'contrabajo': 'contrabajos',
    'flauta': 'flauta', 'oboe': 'oboe', 'clarinete': 'clarinete', 'trompa': 'trompa', 'fagot': 'fagot',
    'trompeta': 'trompetas', 'trombon': 'trombón', 'tuba': 'tuba',
    'cajon-grave': 'cajón', 'cajon-agudo': 'cajón', 'cajon-suave': 'cajón',
    'palmas-claras': 'palmas', 'palmas-sordas': 'palmas'
  };
  const NOMBRE_PARTE = { S: 'soprano', A: 'contralto', T: 'tenor', B: 'bajo' };
  const NOTA_ESTILO = {
    coro: 'Cada voz, una línea cantada, ligada de nota a nota, con un segundo cantor por cuerda. El bajo no se dobla.',
    marimbas: 'Cuatro marimbas: dos arpegian el acorde en semicorcheas —una por el centro, otra más grave—, la tercera da el acorde y la cuarta el bajo.',
    bulerias: 'Compás de doce tiempos: el acorde se pica en los acentos y el último se sostiene.',
    italiana: 'Acordes picados en corcheas repetidas, tres por negra, con la cuerda pellizcando al empezar cada acorde.'
  };
  const limpia = b => String(b).replace(/-(picado|pizzicato|fuerte)$/, '');
  const comoSuena = b => (/-picado$/.test(b) ? ' (picado)' : /-pizzicato$/.test(b) ? ' (pizzicato)' : '');
  const nombreBanco = b => (NOMBRE_BANCO[limpia(b)] || limpia(b)) + comoSuena(b);
  const CUATRO = ['S', 'A', 'T', 'B'];
  const conOctava = p => (NOMBRE_PARTE[p[0]] || p) + (p.length > 1 ? (p[0] === 'S' || p[0] === 'A' ? ', a la octava aguda' : ', a la octava grave') : '');
  function vocesDeTexto(partes) {
    const hay = p => partes.includes(p);
    if (!CUATRO.every(hay)) return partes.map(conOctava).join(' y ');
    let t = 'las cuatro voces' + (hay('B8') ? ', con el bajo doblado a la octava grave' : '');
    // los dobles de octava que añade el órgano pleno (la soprano y la contralto, como un 4 pies)
    const dobles = partes.filter(p => p.length > 1 && p !== 'B8').map(p => NOMBRE_PARTE[p[0]] || p);
    if (dobles.length) t += ', y la ' + dobles.join(' y la ') + ' también a la octava aguda';
    return t;
  }
  /* `describir(id)` → { nombre, grupo, lineas:[{instrumento, voces}], nota } */
  function describir(id) {
    const ins = INSTRUMENTOS.find(x => x.id === id);
    const def = DEF[id];
    if (!ins || !def) return null;
    const capas = (def.capas || []).concat(def.pizz || []);
    const juntas = [];
    capas.forEach(c => {
      const nom = nombreBanco(c.banco);
      const ya = juntas.find(x => x.instrumento === nom);
      if (ya) c.partes.forEach(p => { if (!ya.partes.includes(p)) ya.partes.push(p); });
      else juntas.push({ instrumento: nom, partes: c.partes.slice() });
    });
    if (!juntas.length && def.banco) juntas.push({ instrumento: nombreBanco(def.banco), partes: CUATRO.slice() });
    // las marimbas no se describen por voces: cada una hace lo suyo, y eso lo cuenta la nota
    return {
      nombre: ins.nombre, grupo: ins.grupo,
      lineas: juntas.map(x => ({ instrumento: x.instrumento, voces: vocesDeTexto(x.partes) })),
      nota: NOTA_ESTILO[def.estilo] || (def.estilo === 'sintetico' ? 'Sin muestras: osciladores, para cuando no se puede descargar nada.' : '')
    };
  }

  Sonido.contextoAudio = () => ctx;          // para las pruebas (pruebas.html)
  Object.assign(Sonido, { acorde, secuencia, parar, enCurso, anotarAlSonar, desbloquear, estado, registrarInstrumento, registrarBanco, cargarInstrumento, elegirInstrumento, instrumentoActual, describir });
  return Sonido;
})();
