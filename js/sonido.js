/* =====================================================================
   sonido.js — Reproducción sencilla de acordes con Web Audio.

   Uso:
     Sonido.acorde(notas, segundos)                → suena un acorde (objetos nota)
     Sonido.secuencia([{notas, segundos, alEmpezar}], alTerminar)
                                                   → suena una serie encadenada; cada
                                                     elemento puede avisar cuando empieza
                                                     y la serie avisa cuando acaba (o se para)
     Sonido.parar()                                → detiene todo lo que suena
     Sonido.enCurso()                              → true mientras suena una secuencia

   Sin muestras ni archivos: cada nota es un oscilador triangular con una
   envolvente suave. Suficiente para oír la armonía; no pretende sonar a
   instrumento.
   ===================================================================== */

const Sonido = (() => {
  let ctx = null;
  let activos = [];           // osciladores en marcha
  let temporizadores = [];    // avisos pendientes (setTimeout)
  let alTerminarActual = null;
  let sonando = false;

  function contexto() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const frecuencia = n => 440 * Math.pow(2, (Teoria.midi(n) - 69) / 12);

  function tocar(notas, t0, dur, ganancia) {
    const c = contexto();
    const master = c.createGain();
    master.gain.setValueAtTime(0, t0);
    master.gain.linearRampToValueAtTime(ganancia, t0 + 0.02);
    master.gain.setValueAtTime(ganancia, t0 + dur - 0.12);
    master.gain.linearRampToValueAtTime(0, t0 + dur);
    master.connect(c.destination);
    notas.forEach(n => {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = frecuencia(n);
      o.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
      activos.push(o);
    });
  }

  function acorde(notas, segundos = 1.2) {
    parar();
    tocar(notas, contexto().currentTime + 0.02, segundos, 0.22 / Math.max(1, Math.sqrt(notas.length)));
  }

  function secuencia(items, alTerminar) {
    parar();
    const c = contexto();
    let t = c.currentTime + 0.05;
    const inicio = t;
    sonando = true;
    alTerminarActual = alTerminar || null;
    items.forEach(it => {
      if (it.notas && it.notas.length) tocar(it.notas, t, it.segundos, 0.22 / Math.max(1, Math.sqrt(it.notas.length)));
      if (typeof it.alEmpezar === 'function') temporizadores.push(setTimeout(it.alEmpezar, Math.max(0, (t - inicio) * 1000)));
      t += it.segundos;
    });
    temporizadores.push(setTimeout(terminar, Math.max(0, (t - inicio) * 1000 + 60)));
  }

  function terminar() {
    const f = alTerminarActual;
    alTerminarActual = null;
    sonando = false;
    if (f) f();
  }

  function parar() {
    activos.forEach(o => { try { o.stop(); } catch (e) { /* ya parado */ } });
    activos = [];
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    if (sonando) terminar();
  }

  function enCurso() { return sonando; }

  return { acorde, secuencia, parar, enCurso };
})();
