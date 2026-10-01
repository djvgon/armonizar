/* ------------------------------------------------------------------------------------
   Cuadro de cifrados · la ventana de ayuda

   Lo que en papel es una tabla de cifras, aquí es un cuadro de ACORDES: cada cifra con el
   acorde que produce en Do mayor, escrito a cuatro voces por el mismo motor de la
   aplicación, y con un botón para oírlo (Diego, 27/9/2026). Es más ilustrativo que la lista
   de símbolos, porque lo que hay que aprender no es el dibujo de la cifra sino qué acorde
   manda escribir.

   Las tres familias son las mismas de la paleta —tríada, séptima de dominante y demás
   séptimas diatónicas—, y dentro de cada una las cifras van sobre EL MISMO acorde: así se
   ve que 5/3, 6 y 6/4 son el mismo do–mi–sol visto desde tres bajos distintos.
   ------------------------------------------------------------------------------------ */
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const DO = { tonica: 'C', modo: 'mayor' };
  const SEG = 1.8;                       // lo que dura el acorde al pulsar

  /* ---------- En qué tonalidad sale el cuadro (decisión 226) ----------
     Diego, 1/10/2026: «cuando el alumno pulsa el botón cifrados, sería muy útil que se le
     mostraran los acordes de ejemplo de los cifrados en la tonalidad de inicio del fragmento
     que está analizando o armonizando». Lo que el cuadro enseña no es el dibujo de la cifra
     —eso se aprende una vez— sino QUÉ ACORDE manda escribir, y eso depende del tono: el 6/5
     de Do mayor no tiene las mismas notas que el de si menor, y traducir mentalmente de un
     tono al suyo es justo el trabajo que el cuadro venía a ahorrarle.

     La tonalidad llega en la dirección, «?ton=Bb-M» o «?ton=E-m», puesta por el ejercicio.
     Si no llega —la ventana abierta a pelo, o un ejercicio cuyo tono el alumno todavía no ha
     marcado—, el cuadro sale en Do mayor, como siempre. */
  let ton = DO;

  function tonDeLaDireccion() {
    const t = new URLSearchParams(location.search).get('ton');
    const m = /^([A-Ga-g](?:#|b){0,2})-([Mm])$/.exec(String(t || '').trim());
    if (!m) return null;
    const cand = { tonica: m[1][0].toUpperCase() + m[1].slice(1), modo: m[2] === 'm' ? 'menor' : 'mayor' };
    try { Teoria.escalaVoces(cand); } catch (e) { return null; }
    return cand;
  }

  /* El cuadro, por GRADOS de la escala y no por notas: así vale para cualquier tonalidad y
     para los dos modos sin una segunda tabla. Dentro de cada familia es siempre el mismo
     acorde —la tónica, la dominante con séptima y el II7—, visto desde cada uno de sus
     bajos. El «modelo» es la nota que llevaba el cuadro en Do mayor, y solo sirve para
     elegir la OCTAVA: el bajo transportado se pone en la octava que lo deja más cerca de
     donde estaba, de modo que el cuadro conserva su hechura en todos los tonos.

     La escala es la de las VOCES —la menor armónica en el modo menor—, que es la que sube
     la sensible: el bajo del 6/5̸ es precisamente ella. */
  const CUADRO = [
    { titulo: 'Tríadas', nombre: 'el acorde de tónica', voces: 'tres',
      cifras: [['53', 1, 'C3'], ['6', 3, 'E3'], ['64', 5, 'G3']] },
    { titulo: 'Séptimas con función de dominante', nombre: 'la dominante con séptima', voces: 'cuatro',
      cifras: [['7+', 5, 'G3'], ['65d', 7, 'B2'], ['+6', 2, 'D3'], ['+4', 4, 'F3']] },
    { titulo: 'Séptimas diatónicas (sin función de dominante)', nombre: 'la séptima del II', voces: 'cuatro',
      cifras: [['7', 2, 'D3'], ['65', 4, 'F3'], ['43', 6, 'A2'], ['42', 1, 'C3']] },
    { titulo: 'Novenas', fijo: 'la de dominante sobre el ⑤ y una sin función de dominante, la del II',
      cifras: [['9', 5, 'G3'], ['9', 2, 'D3']] }
  ];

  /* El bajo de una cifra: el grado que le toca, en la octava que lo deja más cerca de la
     nota que llevaba el cuadro en Do mayor. */
  function bajoDe(grado, modelo) {
    const g = Teoria.escalaVoces(ton)[grado - 1];
    const ref = Teoria.midi(Teoria.nota(modelo));
    let mejor = null;
    for (let o = 1; o <= 5; o++) {
      const n = { letra: g.letra, alt: g.alt, octava: o };
      const d = Math.abs(Teoria.midi(n) - ref);
      if (!mejor || d < mejor.d) mejor = { n, d };
    }
    return mejor.n;
  }

  /* Las notas del acorde de una familia, en palabras: «sol – si – re – fa». Se le preguntan
     al motor sobre la cifra de estado fundamental —la primera de cada familia—, de modo que
     la frase dice siempre la verdad, sea cual sea el tono. */
  function notasDe(g, bajos) {
    try {
      const nb = Teoria.nota(bajos[0]);
      return [nb, ...Teoria.vocesSuperiores(g.cifras[0][0], nb, ton)].map(n => Teoria.nombreEs(n)).join(' – ');
    } catch (e) { return ''; }
  }
  function descripcion(g, bajos) {
    if (g.fijo) return g.fijo;
    const notas = notasDe(g, bajos);
    return g.nombre + (notas ? ', ' + notas : '') + ', desde sus ' + g.voces + ' bajos';
  }

  let rotacion = 0;                      // 1.ª, 2.ª o 3.ª posición
  let sonando = null;

  /* ---------- Un acorde suelto, realizado por el motor ---------- */

  /* Toda la familia en UN SOLO sistema, con cada acorde en su compás y una barra doble
     fina entre ellos: se lee de una tirada, la clave y el compás se escriben una sola vez y
     en una pantalla pequeña cabe (Diego, 27/9/2026). */
  function ejercicioDe(bajos) {
    return { tonalidad: ton, compas: [4, 4],
             compases: bajos.map(b => [[b, 4]]),
             respuestas: bajos.map(() => [null]) };
  }

  /* Las disposiciones se piden al motor y se ORDENAN POR SU COSTE, que es el que sabe de
     conducción: así las tres posiciones del cuadro son tres disposiciones correctas y no la
     rotación mecánica del trío, que en el acorde de novena colocaba la sensible por encima
     de la novena —que es justo lo que no puede ser— (Diego, 27/9/2026). */
  function vocesDe(id, bajo) {
    try {
      const d = Realizacion.describir(id, Teoria.nota(bajo), ton);
      const cands = Realizacion.candidatas(d)
        .map(c => ({ c, coste: Realizacion.costeLocal(c, d, false, ton) }))
        .sort((a, b) => a.coste - b.coste);
      if (!cands.length) return null;
      const limpias = cands.filter(x => x.coste < 60);
      const lista = limpias.length ? limpias : cands;
      return lista[rotacion % lista.length].c.voces;
    } catch (e) { /* si el motor no puede, se dibuja solo el bajo */ }
    return null;
  }

  function estadoDe(cifras, bajos, voces) {
    const rom = cifras.map((id, k) => {
      try { return Teoria.romano(id, Teoria.nota(bajos[k]), ton); } catch (e) { return null; }
    });
    const vacio = v => cifras.map(() => v);
    return {
      respuestas: cifras.slice(),
      romanos: rom, romanos2: vacio(null), dobles: vacio(false),
      pedirRomano: rom.some(Boolean),
      etiquetas: [], activa: -1, campo: 'cifra', corregido: false, resultados: null,
      soloLectura: true, gradosBajo: true,
      realizacion: voces.every(Boolean) ? voces : null,
      barrasDobles: cifras.map((x, k) => k).slice(0, -1),   // doble fina tras cada acorde menos el último
      filaTonalidad: null, filaFunciones: null
    };
  }

  /* ---------- Sonar ---------- */

  const conBajoDoblado = (bajo, voces) =>
    [{ letra: bajo.letra, alt: bajo.alt, octava: bajo.octava - 1 }, bajo].concat(voces);

  function parar() {
    Sonido.parar();
    if (sonando) { sonando.classList.remove('sonando'); sonando = null; }
  }

  function tocar(bajo, voces, boton) {
    if (sonando === boton) { parar(); return; }
    parar();
    if (!voces) return;
    const nb = Teoria.nota(bajo);
    try {
      Sonido.secuencia([{ notas: conBajoDoblado(nb, voces), segundos: SEG }],
                       () => { if (sonando === boton) { boton.classList.remove('sonando'); sonando = null; } });
      boton.classList.add('sonando');
      sonando = boton;
    } catch (e) { aviso('No se ha podido reproducir el sonido: ' + e.message); }
  }

  /* ---------- Pintar ---------- */

  function el(etiqueta, clase, texto) {
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function familia(g) {
    const caja = el('div', 'pieza');
    const cifras = g.cifras.map(x => x[0]);
    const bajos = g.cifras.map(x => Teoria.texto(bajoDe(x[1], x[2])));
    const voces = cifras.map((id, k) => vocesDe(id, bajos[k]));
    // Qué acorde es esta familia, con sus notas EN ESTE TONO (decisión 226)
    caja.dataset.acorde = descripcion(g, bajos);

    /* Un botón por acorde, ENCIMA de su acorde y a su izquierda: se pulsa mirando el
       acorde, no una lista aparte (Diego, 27/9/2026). Se coloca por la posición que la
       partitura le ha dado a la casilla del cifrado, guardada como fracción del ancho para
       que siga cuadrando cuando la escala cambie. */
    const cabeza = el('div', 'cabeza-pieza');
    const pent = el('div', 'pent');
    caja.appendChild(cabeza);
    caja.appendChild(pent);
    const svg = Partitura.dibujar(pent, ejercicioDe(bajos), estadoDe(cifras, bajos, voces), () => {});
    const anchoU = Number((svg.getAttribute('viewBox') || '0 0 1 1').split(/\s+/)[2]) || 1;
    cifras.forEach((id, k) => {
      const btn = el('button', 'btn-sonar btn-acorde');
      btn.type = 'button';
      btn.innerHTML = '<span aria-hidden="true">▶</span>';
      const c = Teoria.CIFRADOS[id] || {};
      btn.title = 'Escuchar el acorde de ' + (c.nombre || id);
      btn.setAttribute('aria-label', btn.title);
      const casilla = svg.querySelector('g[data-campo="cifra"][data-indice="' + k + '"] rect');
      btn.dataset.fx = casilla ? (Number(casilla.getAttribute('x')) || 0) / anchoU : 0;
      btn.addEventListener('click', () => tocar(bajos[k], voces[k], btn));
      cabeza.appendChild(btn);
    });
    return caja;
  }

  function pintar() {
    parar();
    const cont = $('#cuadro');
    cont.textContent = '';
    /* Los cuatro grupos fluyen en el mismo renglón mientras quepan: en un ordenador o una
       tableta caben dos y dos, y el cuadro entero se ve de un golpe sin desplazar la
       página, como el cuadro impreso (Diego, 27/9/2026). */
    const piezas = el('div', 'piezas');
    CUADRO.forEach(g => {
      const grupo = familia(g);
      const banda = el('div', 'esquema');
      banda.innerHTML = '<b></b> <span class="acorde-familia"></span>';
      banda.querySelector('b').textContent = g.titulo;
      banda.querySelector('.acorde-familia').textContent = '· ' + grupo.dataset.acorde;
      grupo.insertBefore(banda, grupo.firstChild);
      piezas.appendChild(grupo);
    });
    cont.appendChild(piezas);
    igualarTamano();
  }

  /* Todas las fichas, del mismo tamaño: son todas un acorde, así que la escala es la misma
     y basta con no dejar que el navegador las estire (Diego, 27/9/2026). */
  function igualarTamano() {
    const cont = $('#cuadro');
    const svgs = [...cont.querySelectorAll('.pent svg')];
    if (!svgs.length) return;
    const anchos = svgs.map(s => Number((s.getAttribute('viewBox') || '0 0 0 0').split(/\s+/)[2]) || 0);
    const maxU = Math.max(...anchos);
    const fila = cont.querySelector('.piezas');
    const W = (fila ? fila.clientWidth : cont.clientWidth) - 4;
    if (!maxU || W <= 0) return;
    /* Dos grupos por renglón: la escala es la mayor con la que caben los dos más anchos
       uno al lado del otro, y nunca mayor que el tamaño natural. */
    const escala = Math.max(0.5, Math.min(1, (W - 30) / (2 * maxU)));
    svgs.forEach((s, k) => {
      const ancho = Math.round(anchos[k] * escala);
      s.setAttribute('width', ancho);
      const caja = s.closest('.pieza');
      if (!caja) return;
      caja.style.width = ancho + 'px';
      // Cada botón, encima de su acorde: la fracción se convierte en píxeles
      caja.querySelectorAll('.btn-acorde').forEach(btn => {
        btn.style.left = Math.round((Number(btn.dataset.fx) || 0) * ancho) + 'px';
      });
    });
  }

  function aviso(texto) {
    const a = $('#aviso');
    a.textContent = texto;
    a.hidden = false;
  }

  /* ---------- Mandos ---------- */

  function mandos() {
    // Posición inicial: la misma idea que en el ejercicio, con las tres rotaciones del motor
    document.querySelectorAll('#posicion button').forEach(b => {
      b.addEventListener('click', () => {
        rotacion = Number(b.dataset.rot) || 0;
        document.querySelectorAll('#posicion button').forEach(x => x.classList.toggle('elegida', x === b));
        pintar();
      });
    });
    // Instrumento: la misma lista que en el ejercicio
    const sel = $('#instrumento');
    Sonido.INSTRUMENTOS.forEach(x => {
      const o = document.createElement('option');
      o.value = x.id; o.textContent = x.nombre;
      sel.appendChild(o);
    });
    try {
      const g = localStorage.getItem('armonizar.instrumento');
      if (g && Sonido.INSTRUMENTOS.some(x => x.id === g)) { sel.value = g; Sonido.elegirInstrumento(g); }
    } catch (e) { /* sin almacenamiento */ }
    sel.addEventListener('change', () => {
      Sonido.elegirInstrumento(sel.value);
      try { localStorage.setItem('armonizar.instrumento', sel.value); } catch (e) { /* sin almacenamiento */ }
    });
    // Cerrar: devuelve el foco al ejercicio, como la ventana de estructuras
    const btn = $('#btn-volver');
    if (btn) btn.addEventListener('click', () => {
      parar();
      let abierta = false;
      try { abierta = !!window.opener && !window.opener.closed; } catch (e) { abierta = false; }
      if (!abierta) { location.href = 'index.html'; return; }
      try { window.opener.focus(); } catch (e) { /* el navegador puede negarse */ }
      window.close();
      setTimeout(() => { if (!window.closed) location.href = 'index.html'; }, 300);
    });
    let esperando = null;
    window.addEventListener('resize', () => { clearTimeout(esperando); esperando = setTimeout(igualarTamano, 120); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });
  }

  /* El rótulo dice en qué tono está el cuadro: el alumno tiene que saber que lo que ve son
     SUS acordes y no los de Do mayor, y es lo primero que mira al abrir la ventana. */
  function rotular() {
    const nombre = Teoria.nombreTonalidad(ton);
    const q = $('#titulo .quees');
    if (q) q.textContent = '— cada cifrado interválico y el acorde que manda escribir, en ' + nombre;
    document.title = 'Práctica armónica · Cuadro de cifrados en ' + nombre;
  }

  document.addEventListener('DOMContentLoaded', () => {
    ton = tonDeLaDireccion() || DO;
    rotular();
    mandos();
    pintar();
  });
})();
