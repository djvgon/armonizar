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

  /* Qué bajo lleva cada cifra para que el acorde salga diatónico de Do mayor. Dentro de
     cada familia es siempre el mismo acorde: la tónica, la dominante con séptima y el II7. */
  const CUADRO = [
    { titulo: 'Tríadas',
      acorde: 'el acorde de tónica, do – mi – sol, desde sus tres bajos',
      cifras: [['53', 'C3'], ['6', 'E3'], ['64', 'G3']] },
    { titulo: 'Séptimas con función de dominante',
      acorde: 'la dominante con séptima, sol – si – re – fa, desde sus cuatro bajos',
      cifras: [['7+', 'G3'], ['65d', 'B2'], ['+6', 'D3'], ['+4', 'F3']] },
    { titulo: 'Séptimas diatónicas (sin función de dominante)',
      acorde: 'la séptima del II, re – fa – la – do, desde sus cuatro bajos',
      cifras: [['7', 'D3'], ['65', 'F3'], ['43', 'A2'], ['42', 'C3']] },
    { titulo: 'Novenas',
      acorde: 'la de dominante sobre el ⑤ y una sin función de dominante, la del II',
      cifras: [['9', 'G3'], ['9', 'D3']] }
  ];

  let rotacion = 0;                      // 1.ª, 2.ª o 3.ª posición
  let sonando = null;

  /* ---------- Un acorde suelto, realizado por el motor ---------- */

  /* Toda la familia en UN SOLO sistema, con cada acorde en su compás y una barra doble
     fina entre ellos: se lee de una tirada, la clave y el compás se escriben una sola vez y
     en una pantalla pequeña cabe (Diego, 27/9/2026). */
  function ejercicioDe(bajos) {
    return { tonalidad: DO, compas: [4, 4],
             compases: bajos.map(b => [[b, 4]]),
             respuestas: bajos.map(() => [null]) };
  }

  /* Las disposiciones se piden al motor y se ORDENAN POR SU COSTE, que es el que sabe de
     conducción: así las tres posiciones del cuadro son tres disposiciones correctas y no la
     rotación mecánica del trío, que en el acorde de novena colocaba la sensible por encima
     de la novena —que es justo lo que no puede ser— (Diego, 27/9/2026). */
  function vocesDe(id, bajo) {
    try {
      const d = Realizacion.describir(id, Teoria.nota(bajo), DO);
      const cands = Realizacion.candidatas(d)
        .map(c => ({ c, coste: Realizacion.costeLocal(c, d, false, DO) }))
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
      try { return Teoria.romano(id, Teoria.nota(bajos[k]), DO); } catch (e) { return null; }
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
    const cifras = g.cifras.map(x => x[0]), bajos = g.cifras.map(x => x[1]);
    const voces = cifras.map((id, k) => vocesDe(id, bajos[k]));

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
      banda.querySelector('.acorde-familia').textContent = '· ' + g.acorde;
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

  document.addEventListener('DOMContentLoaded', () => { mandos(); pintar(); });
})();
