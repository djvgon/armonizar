/* =====================================================================
   sonido.js — Reproducción de acordes con Web Audio: instrumentos reales
   (muestras) o, si no están cargadas, osciladores.

   Uso:
     Sonido.acorde(notas, segundos)                → suena un acorde (objetos nota)
     Sonido.secuencia([{notas, segundos, alEmpezar}], alTerminar)
                                                   → suena una serie encadenada; cada
                                                     elemento puede avisar cuando empieza
                                                     y la serie avisa cuando acaba (o se para)
     Sonido.parar()                                → detiene todo lo que suena
     Sonido.enCurso()                              → true mientras suena una secuencia
     Sonido.desbloquear()                          → crear y arrancar el contexto de audio y
                                                     precargar el instrumento (llamar en el
                                                     primer gesto del usuario)
     Sonido.estado()                               → 'sin crear' | 'suspended' | 'running' |
                                                     'interrupted' | 'closed' | 'sin web audio'
     Sonido.INSTRUMENTOS                           → [{id, nombre}] disponibles
     Sonido.elegirInstrumento(id)                  → cambia el instrumento (y lo carga)
     Sonido.instrumentoActual()                    → id
     Sonido.registrarInstrumento(id, {nombre, muestras})
                                                   → lo llaman los archivos sonidos/<id>.js
     Sonido.alCambiarEstado = función(estado)     → aviso cuando el navegador cambia el estado
     Sonido.alCargar = función(id, listo)         → aviso al empezar/terminar de cargar

   Instrumentos: piano, clave y órgano son muestras reales (FluidR3_GM, CC BY
   3.0) incrustadas en base64 en sonidos/<id>.js, una cada tercera menor entre
   do1 y do6; las notas intermedias se obtienen transportando la muestra más
   cercana (playbackRate). El archivo del instrumento se carga solo cuando hace
   falta (un <script> añadido a la página, que funciona también desde file://) y
   se decodifica una vez. «Sintético» son osciladores triangulares, sin archivos.

   Bloqueo del navegador: Chrome y Safari solo dejan arrancar el audio tras un
   gesto del usuario (clic o tecla). Por eso el contexto se crea en el primer
   gesto (desbloquear) y se intenta reanudar en cada reproducción; si sigue
   suspendido, la aplicación lo avisa. En iPad/iPhone, además, el interruptor
   de silencio apaga Web Audio aunque el contexto esté en marcha.
   ===================================================================== */

const Sonido = (() => {
  let ctx = null;
  let activos = [];           // fuentes en marcha (osciladores o muestras)
  let temporizadores = [];    // avisos pendientes (setTimeout)
  let alTerminarActual = null;
  let sonando = false;
  let generacion = 0;         // para descartar reproducciones pendientes tras un parar()

  const INSTRUMENTOS = [
    { id: 'piano', nombre: 'Piano' },
    { id: 'clave', nombre: 'Clave' },
    { id: 'organo', nombre: 'Órgano' },
    { id: 'sintetico', nombre: 'Sintético' }
  ];
  const registro = {};        // id → { nombre, muestras:{'C4': dataURI}, buffers:{midi: AudioBuffer}|null, cargando: Promise|null }
  const GANANCIA = { piano: 2.6, clave: 2.2, organo: 1.5 };   // por nota (÷ √n); las muestras son flojas
  let actual = 'piano';

  const Sonido = { INSTRUMENTOS, alCambiarEstado: null, alCargar: null };

  /* ---------- Contexto ---------- */

  let salida = null;          // nodo maestro (compresor suave) al que se conecta todo

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('Este navegador no tiene Web Audio.');
      ctx = new AC();
      ctx.onstatechange = () => { if (typeof Sonido.alCambiarEstado === 'function') Sonido.alCambiarEstado(ctx.state); };
      // Compresor suave para que un acorde de cinco notas no sature
      try {
        salida = ctx.createDynamicsCompressor();
        salida.threshold.value = -12; salida.knee.value = 12; salida.ratio.value = 4; salida.attack.value = 0.003; salida.release.value = 0.2;
        salida.connect(ctx.destination);
      } catch (e) { salida = ctx.destination; }
    }
    if (ctx.state !== 'running') {
      try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* nada */ }
    }
    return ctx;
  }

  // Primer gesto del usuario: crear el contexto, reproducir un búfer vacío (lo que
  // Safari e iOS exigen para «desbloquear» el audio) y precargar el instrumento.
  function desbloquear() {
    try {
      const c = contexto();
      const b = c.createBuffer(1, 1, 22050);
      const s = c.createBufferSource();
      s.buffer = b; s.connect(salida || c.destination); s.start(0);
    } catch (e) { /* sin audio */ }
    cargarInstrumento(actual).catch(() => {});
  }

  function estado() {
    if (!(window.AudioContext || window.webkitAudioContext)) return 'sin web audio';
    return ctx ? ctx.state : 'sin crear';
  }

  /* ---------- Instrumentos ---------- */

  function registrarInstrumento(id, datos) {
    const previo = registro[id] || {};
    registro[id] = { nombre: datos.nombre || id, muestras: datos.muestras || {}, buffers: null, cargando: previo.cargando || null };   // muestras: nombre de nota → mp3 en base64
  }

  // Carga el archivo sonidos/<id>.js si hace falta y decodifica sus muestras.
  function cargarInstrumento(id) {
    if (id === 'sintetico') return Promise.resolve(null);
    const r = registro[id];
    if (r && r.buffers) return Promise.resolve(r.buffers);
    if (r && r.cargando) return r.cargando;
    if (!INSTRUMENTOS.some(x => x.id === id)) return Promise.reject(new Error('Instrumento desconocido: ' + id));
    if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, false);
    const p = (r ? Promise.resolve() : cargarScript('sonidos/' + id + '.js'))
      .then(() => decodificar(id))
      .then(buffers => {
        registro[id].buffers = buffers;
        registro[id].cargando = null;
        if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, true);
        return buffers;
      })
      .catch(err => { if (registro[id]) registro[id].cargando = null; if (typeof Sonido.alCargar === 'function') Sonido.alCargar(id, true); throw err; });
    if (!registro[id]) registro[id] = { nombre: id, muestras: {}, buffers: null, cargando: p };
    else registro[id].cargando = p;
    return p;
  }

  function cargarScript(ruta) {
    return new Promise((resolver, rechazar) => {
      const s = document.createElement('script');
      s.src = ruta;
      s.async = true;
      s.onload = () => resolver();
      s.onerror = () => rechazar(new Error('No se ha podido cargar ' + ruta));
      document.head.appendChild(s);
    });
  }

  const NOMBRE_A_MIDI = (() => {
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    return nombre => {
      const m = /^([A-G])(b|#)?(\d)$/.exec(nombre);
      return 12 * (parseInt(m[3], 10) + 1) + base[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    };
  })();

  function decodificar(id) {
    const r = registro[id];
    if (!r || !Object.keys(r.muestras).length) return Promise.reject(new Error('El instrumento ' + id + ' no tiene muestras.'));
    const c = contexto();
    const buffers = {};
    const tareas = Object.entries(r.muestras).map(([nombre, uri]) => {
      const b64 = uri.indexOf(',') >= 0 ? uri.split(',')[1] : uri;   // admite «data:…;base64,XXX» o solo el base64
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Promise((resolver, rechazar) => {
        // Safari antiguo solo admite la forma con funciones de retorno
        const res = c.decodeAudioData(bytes.buffer, buf => { buffers[NOMBRE_A_MIDI(nombre)] = buf; resolver(); }, err => rechazar(err || new Error('decodeAudioData')));
        if (res && res.then) res.then(buf => { buffers[NOMBRE_A_MIDI(nombre)] = buf; resolver(); }, rechazar);
      });
    });
    return Promise.all(tareas).then(() => buffers);
  }

  function elegirInstrumento(id) {
    if (!INSTRUMENTOS.some(x => x.id === id)) return;
    actual = id;
    if (ctx) cargarInstrumento(id).catch(() => {});
  }
  const instrumentoActual = () => actual;

  /* ---------- Reproducción ---------- */

  const midiDe = n => Teoria.midi(n);
  const frecuencia = n => 440 * Math.pow(2, (midiDe(n) - 69) / 12);

  // Un acorde en t0 durante dur segundos, con muestras (si buffers) u osciladores.
  // Las muestras de FluidR3 son flojas (pico ≈ 0,12), de ahí la ganancia alta.
  function tocar(notas, t0, dur, buffers) {
    const c = contexto();
    const dest = salida || c.destination;
    const n = Math.max(1, notas.length);
    if (buffers) {
      const claves = Object.keys(buffers).map(Number);
      const sostenido = actual === 'organo';                  // el órgano no decae: si la nota es larga, se repite el tramo estable
      notas.forEach(nota => {
        const m = midiDe(nota);
        let mejor = claves[0];
        claves.forEach(k => { if (Math.abs(k - m) < Math.abs(mejor - m)) mejor = k; });
        const g = c.createGain();
        const gan = (GANANCIA[actual] || 2.0) / Math.sqrt(n);
        g.gain.setValueAtTime(gan, t0);
        g.gain.setValueAtTime(gan, t0 + Math.max(0.05, dur - 0.15));
        g.gain.linearRampToValueAtTime(0, t0 + dur);
        g.connect(dest);
        const s = c.createBufferSource();
        s.buffer = buffers[mejor];
        s.playbackRate.value = Math.pow(2, (m - mejor) / 12);
        if (sostenido && dur > s.buffer.duration - 0.4) { s.loop = true; s.loopStart = 0.8; s.loopEnd = Math.min(2.4, s.buffer.duration - 0.5); }
        s.connect(g);
        s.start(t0);
        s.stop(t0 + dur + 0.05);
        activos.push(s);
      });
      return;
    }
    const master = c.createGain();
    const ganancia = 0.22 / Math.sqrt(n);
    master.gain.setValueAtTime(0, t0);
    master.gain.linearRampToValueAtTime(ganancia, t0 + 0.02);
    master.gain.setValueAtTime(ganancia, t0 + Math.max(0.03, dur - 0.12));
    master.gain.linearRampToValueAtTime(0, t0 + dur);
    master.connect(dest);
    notas.forEach(nota => {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = frecuencia(nota);
      o.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
      activos.push(o);
    });
  }

  // Espera a que el instrumento esté listo (o cae a osciladores si no se puede cargar)
  function preparar() {
    return cargarInstrumento(actual).catch(() => null);
  }

  function acorde(notas, segundos = 1.2) {
    parar();
    contexto();
    const gen = ++generacion;
    preparar().then(buffers => {
      if (gen !== generacion) return;
      tocar(notas, contexto().currentTime + 0.02, segundos, buffers);
    });
  }

  function secuencia(items, alTerminar) {
    parar();
    contexto();
    const gen = ++generacion;
    sonando = true;
    alTerminarActual = alTerminar || null;
    preparar().then(buffers => {
      if (gen !== generacion) return;
      const c = contexto();
      let t = c.currentTime + 0.05;
      const inicio = t;
      items.forEach(it => {
        if (it.notas && it.notas.length) tocar(it.notas, t, it.segundos, buffers);
        if (typeof it.alEmpezar === 'function') temporizadores.push(setTimeout(it.alEmpezar, Math.max(0, (t - inicio) * 1000)));
        t += it.segundos;
      });
      temporizadores.push(setTimeout(terminar, Math.max(0, (t - inicio) * 1000 + 60)));
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
    activos.forEach(o => { try { o.stop(); } catch (e) { /* ya parado */ } });
    activos = [];
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    if (sonando) terminar();
  }

  function enCurso() { return sonando; }

  Object.assign(Sonido, { acorde, secuencia, parar, enCurso, desbloquear, estado, registrarInstrumento, cargarInstrumento, elegirInstrumento, instrumentoActual });
  return Sonido;
})();
