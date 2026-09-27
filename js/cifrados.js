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
    { familia: 'triada', titulo: 'Tríada',
      acorde: 'el acorde de tónica, do – mi – sol, desde sus tres bajos',
      cifras: [['53', 'C3'], ['6', 'E3'], ['64', 'G3']] },
    { familia: 'dominante', titulo: 'Séptima de dominante',
      acorde: 'la dominante con séptima, sol – si – re – fa, desde sus cuatro bajos',
      cifras: [['7+', 'G3'], ['65d', 'B2'], ['+6', 'D3'], ['+4', 'F3']] },
    { familia: 'septima', titulo: 'Otras séptimas diatónicas',
      acorde: 'la séptima del II, re – fa – la – do, desde sus cuatro bajos',
      cifras: [['7', 'D3'], ['65', 'F3'], ['43', 'A2'], ['42', 'C3']] }
  ];

  let rotacion = 0;                      // 1.ª, 2.ª o 3.ª posición
  let sonando = null;

  /* ---------- Un acorde suelto, realizado por el motor ---------- */

  function ejercicioDe(bajo) {
    return { tonalidad: DO, compas: [4, 4], compases: [[[bajo, 4]]], respuestas: [[null]] };
  }

  function vocesDe(id, bajo) {
    const ej = ejercicioDe(bajo);
    ej.respuestas = [[id]];
    try {
      const r = Realizacion.realizar(ej, [id], { modo: 'auto', rotacion });
      const a = r && r.acordes && r.acordes[0];
      if (a && a.length === 3) return a;
    } catch (e) { /* si el motor no puede, se dibuja solo el bajo */ }
    return null;
  }

  function estadoDe(id, bajo, voces) {
    const rom = (() => { try { return Teoria.romano(id, Teoria.nota(bajo), DO); } catch (e) { return null; } })();
    return {
      respuestas: [id],
      romanos: [rom], romanos2: [null], dobles: [false],
      pedirRomano: !!rom,
      etiquetas: [], activa: -1, campo: 'cifra', corregido: false, resultados: null,
      soloLectura: true, gradosBajo: true,
      realizacion: voces ? [voces] : null,
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

  function ficha(id, bajo) {
    const caja = el('div', 'pieza');
    const voces = vocesDe(id, bajo);
    const cabeza = el('div', 'cabeza-pieza');
    const btn = el('button', 'btn-sonar');
    btn.type = 'button';
    btn.innerHTML = '<span aria-hidden="true">▶</span> Escuchar';
    btn.setAttribute('aria-label', 'Escuchar el acorde de ' + (Teoria.CIFRADOS[id] || {}).nombre);
    btn.addEventListener('click', () => tocar(bajo, voces, btn));
    cabeza.appendChild(btn);
    const c = Teoria.CIFRADOS[id] || {};
    if (c.nombre) cabeza.appendChild(el('span', 'var', c.nombre));
    caja.appendChild(cabeza);

    const pent = el('div', 'pent');
    caja.appendChild(pent);
    Partitura.dibujar(pent, ejercicioDe(bajo), estadoDe(id, bajo, voces), () => {});
    return caja;
  }

  function pintar() {
    parar();
    const cont = $('#cuadro');
    cont.textContent = '';
    CUADRO.forEach(g => {
      const banda = el('div', 'esquema');
      banda.innerHTML = '<b></b> <span class="acorde-familia"></span>';
      banda.querySelector('b').textContent = g.titulo;
      banda.querySelector('.acorde-familia').textContent = '· ' + g.acorde;
      cont.appendChild(banda);
      const r = el('div', 'renglon');
      const piezas = el('div', 'piezas');
      g.cifras.forEach(([id, bajo]) => piezas.appendChild(ficha(id, bajo)));
      r.appendChild(piezas);
      cont.appendChild(r);
    });
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
    const escala = Math.max(0.74, Math.min(1, W / (4 * maxU + 60)));
    svgs.forEach((s, k) => {
      const ancho = Math.round(anchos[k] * escala);
      s.setAttribute('width', ancho);
      const caja = s.closest('.pieza');
      if (caja) caja.style.width = ancho + 'px';
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
