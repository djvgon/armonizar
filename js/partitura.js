/* =====================================================================
   partitura.js — Dibuja el pentagrama del bajo en SVG y las casillas
   de cifrado pulsables debajo de cada nota.

   Uso:
     Partitura.dibujar(contenedor, ejercicio, estado, alPulsar)

       contenedor : elemento HTML donde se inserta el SVG
       ejercicio  : objeto de ejercicios.js
       estado     : { respuestas:[ids|null], romanos:['V'|null], pedirRomano:bool,
                      activa:índice de nota, campo:'cifra'|'romano', corregido:bool,
                      resultados:[{ok, okCifra, okRomano, modelo:id, modeloRomano:'V'}],
                      soloLectura:bool (vista previa sin interacción),
                      realizacion:[[n1,n2,n3]|null…] (si existe, se dibuja el pentagrama
                      de sol con esos acordes), realizacionMal:[bool] (acordes en rojo),
                      alSonar:función(i) (si existe, un botón ▶ encima de cada acorde la llama),
                      sonando:índice (nota cuyo botón ▶ se resalta),
                      numerar:bool (número de cada acorde encima del sistema, como en la
                      tabla de revisión del configurador), alPulsarNumero:función(i),
                      etiquetas:[{i, texto, clase}] (rótulos de tonalidad encima del sistema),
                      dobles:[bool] (la casilla de grado de la nota se parte en dos:
                      'romano' = tonalidad anterior, 'romano2' = nueva; pivote),
                      romanos2:[…], filaTonalidad:{visible, editable, celdas:[{texto, clase, fija}]}
                      (fila «Tonalidad» bajo los grados, campo 'tonalidad'),
                      ocultarBajo:bool (no se dibuja el pentagrama del bajo —ni sus notas—:
                      solo las casillas y los botones ▶; ejercicio de Audición sin cerrar),
                      vozDada:'soprano' (las notas del ejercicio son la melodía y van en el
                      pentagrama de sol; el bajo lo aporta bajos:[nota|null…], deducido de
                      cada respuesta, y bajosMal:[bool] lo pinta en rojo),
                      filaFunciones:{visible, editable, celdas:[{texto, clase, fija}]}
                      (fila «Función» T · S · D bajo los grados, campo 'funcion') }
       alPulsar   : función(índiceDeNota, campo) que se llama al pulsar una casilla

   Duraciones en negras: 4 redonda, 2 blanca, 1 negra, 0.5 corchea; ×1.5 = con puntillo.

   Todo se dibuja con la fuente Bravura (SMuFL): clave de fa, armadura,
   compás, cabezas de nota, alteraciones y cifras. La unidad de medida es
   el "espacio" (SP = distancia entre dos líneas del pentagrama); un em de
   Bravura equivale a 4 espacios.
   ===================================================================== */

const Partitura = (() => {

  const SP = 10;                         // espacio de pentagrama en unidades del viewBox
  const ESCALA_PX = 1.0;                 // píxeles por unidad en pantalla (1.0 → un espacio de pentagrama = 10 px)
  const EM = 4 * SP;                     // tamaño de fuente para los signos del pentagrama
  const EM_CIFRA = 7 * SP;               // tamaño de fuente para las cifras (más grandes, para pulsar)
  const NS = 'http://www.w3.org/2000/svg';

  // Códigos SMuFL
  const G = {
    claveFa: '', claveSol: '',
    redonda: '', blanca: '', negra: '',
    puntillo: '', corcheteArriba: '', corcheteAbajo: '',
    sostenido: '', bemol: '', becuadro: '',
    compas: d => String.fromCodePoint(0xE080 + d),
    cifra: {
      '0': '', '1': '', '2': '', '3': '', '4': '', '5': '',
      '6': '', '7': '', '8': '', '9': '',
      '4t': '', '5t': '', '6t': '', '7t': '',   // numerales tachados
      '+': '', '#': '', 'b': '', 'n': ''
    }
  };
  // Anchuras de avance (en espacios) de los glifos que necesitamos alinear.
  const ANCHO = { redonda: 1.69, blanca: 1.18, negra: 1.18, sostenido: 1.0, bemol: 0.9, becuadro: 0.67 };

  // Figura de una duración en negras: 4 redonda, 2 blanca, 1 negra, 0.5 corchea; ×1.5 con puntillo.
  function figura(dur) {
    const base = dur >= 4 ? 4 : dur >= 2 ? 2 : dur >= 1 ? 1 : 0.5;
    return {
      base,
      cabeza: base >= 4 ? G.redonda : base >= 2 ? G.blanca : G.negra,
      ancho: base >= 4 ? ANCHO.redonda : ANCHO.blanca,
      plica: base < 4,
      corchete: base < 1,
      puntillo: dur >= base * 1.5
    };
  }

  // Posiciones de la armadura en clave de fa (índice diatónico de cada alteración).
  // Sostenidos: fa3 do3 sol3 re3 la2 mi3 si2 · Bemoles: si2 mi3 la2 re3 sol2 do3 fa2
  const ARMADURA_SOST = ['F3', 'C3', 'G3', 'D3', 'A2', 'E3', 'B2'];
  const ARMADURA_BEM = ['B2', 'E3', 'A2', 'D3', 'G2', 'C3', 'F2'];
  // …y en clave de sol: fa5 do5 sol5 re5 la4 mi5 si4 · si4 mi5 la4 re5 sol4 do5 fa4
  const ARMADURA_SOST_SOL = ['F5', 'C5', 'G5', 'D5', 'A4', 'E5', 'B4'];
  const ARMADURA_BEM_SOL = ['B4', 'E5', 'A4', 'D5', 'G4', 'C5', 'F4'];

  const el = (tag, atrs = {}, texto) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(atrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (texto !== undefined) e.textContent = texto;
    return e;
  };

  // Texto en fuente Bravura.
  const glifo = (x, y, txt, tam = EM, extra = {}) =>
    el('text', Object.assign({ x, y, 'font-family': 'Bravura', 'font-size': tam }, extra), txt);

  /* ---- Geometría vertical ----
     'paso' = índice diatónico relativo a sol2 (línea inferior de la clave de fa).
     Cada paso sube medio espacio. */
  const PASO_BASE = Teoria.indice(Teoria.nota('G2'));
  function paso(n) { return Teoria.indice(n) - PASO_BASE; }
  const PASO_BASE_SOL = Teoria.indice(Teoria.nota('E4'));       // línea inferior de la clave de sol
  function pasoSol(n) { return Teoria.indice(n) - PASO_BASE_SOL; }

  /* ---- Dibujo de una cifra (pila de filas) dentro de una casilla ----
     Cada signo se coloca por separado para poder tachar los numerales con
     una barra diagonal (tradición española: barra = intervalo disminuido).
     Anchuras de avance en fracciones de em (medidas en Bravura). */
  const AVANCE = { num: 0.236, '+': 0.135, '#': 0.19, 'b': 0.177, 'n': 0.134 };

  function dibujarCifra(g, id, cx, cyCentro, escala = 1, color = null) {
    const c = Teoria.CIFRADOS[id];
    if (!c) return;
    const em = EM_CIFRA * escala;
    const altoFila = 2.1 * SP * escala;                     // los numerales miden 1/4 de em; se deja aire
    const filas = c.filas;
    const totalAlto = filas.length * altoFila;
    filas.forEach((fila, k) => {
      const yBase = cyCentro - totalAlto / 2 + (k + 1) * altoFila - 0.25 * altoFila;
      if (fila.length === 1 && fila[0].signo === '—') {
        g.appendChild(el('line', { x1: cx - 0.9 * SP * escala, x2: cx + 0.9 * SP * escala, y1: yBase - 0.8 * SP * escala, y2: yBase - 0.8 * SP * escala, class: 'cifra-raya', stroke: color || 'currentColor', 'stroke-width': 0.22 * SP * escala, 'stroke-linecap': 'round' }));
        return;
      }
      const anchos = fila.map(s => (s.num ? AVANCE.num : (AVANCE[s.signo] || 0.2)) * em);
      const total = anchos.reduce((a, b) => a + b, 0);
      let x = cx - total / 2;
      fila.forEach((s, j) => {
        const txt = s.num ? (G.cifra[s.num] || s.num) : (G.cifra[s.signo] || s.signo);
        const t = glifo(x, yBase, txt, em, { class: 'cifra-texto' });
        if (color) t.setAttribute('fill', color);
        g.appendChild(t);
        if (s.tachado) {
          g.appendChild(el('line', {
            x1: x + 0.005 * em, y1: yBase + 0.035 * em, x2: x + 0.225 * em, y2: yBase - 0.285 * em,
            class: 'cifra-raya', stroke: color || 'currentColor', 'stroke-width': 0.026 * em, 'stroke-linecap': 'round'
          }));
        }
        x += anchos[j];
      });
    });
  }

  /* ---- Dibujo principal ---- */
  function dibujar(contenedor, ej, estado, alPulsar) {
    const ton = ej.tonalidad;
    const notas = [];                                      // [{nota, dur, compasIdx}]
    ej.compases.forEach((c, ci) => c.forEach(([n, d]) => notas.push({ nota: Teoria.nota(n), dur: d, ci })));

    // Medidas horizontales (en unidades del viewBox)
    const MARGEN = 1.5 * SP;
    const ANCHO_CLAVE = 4.2 * SP;
    const nArm = Teoria.armadura(ton);
    const ANCHO_ARM = Math.abs(nArm) * 1.1 * SP + (nArm ? 0.6 * SP : 0);
    const ANCHO_COMPAS = 3.2 * SP;
    const HUECO_BLANCA = 7.5 * SP, HUECO_REDONDA = 9.5 * SP, HUECO_NEGRA = 6 * SP, RELLENO_COMPAS = 1.6 * SP;

    // Medidas verticales
    const pedirRomano = !!estado.pedirRomano;
    const soloLectura = !!estado.soloLectura;
    const sopranoDada = estado.vozDada === 'soprano';     // melodía de soprano: las notas van arriba y el bajo se deduce
    const conSol = Array.isArray(estado.realizacion) || sopranoDada;   // ¿se dibuja el pentagrama de sol?
    const bajoDe = i => (sopranoDada ? (estado.bajos && estado.bajos[i] ? Teoria.nota(estado.bajos[i]) : null) : notas[i].nota);
    const numerar = !!estado.numerar;                      // ¿número de cada acorde encima del sistema (revisión del profesor)?
    const etiquetas = Array.isArray(estado.etiquetas) ? estado.etiquetas : [];   // rótulos de tonalidad encima del sistema
    const conSonar = typeof estado.alSonar === 'function' && !soloLectura;   // botón ▶ ENCIMA de cada acorde (suena ese acorde)
    const sinBajo = !!estado.ocultarBajo;                  // Audición: no se ve el bajo (solo casillas y botones ▶)
    const sinSistema = sinBajo && !conSol;                 // no hay ningún pentagrama que dibujar
    // Banda superior, de arriba abajo: números (configurador), rótulos de tonalidad, botones ▶
    const Y0 = (numerar ? 3 * SP : 0) + (etiquetas.length ? 3 * SP : 0) + (conSonar ? 3 * SP : 0);
    const Y_TOP_SOL = 5 * SP + Y0, Y_BOT_SOL = Y_TOP_SOL + 4 * SP;
    const Y_TOP = conSol ? Y_BOT_SOL + 7.5 * SP : 5.5 * SP + Y0; // línea superior del pentagrama del bajo
    const Y_BOT = Y_TOP + 4 * SP;                          // línea inferior
    const Y_CASILLA = sinSistema ? Y0 + 1.2 * SP : Y_BOT + 3.4 * SP;   // borde superior de las casillas de cifra
    const ALTO_CASILLA = 4.3 * SP, ANCHO_CASILLA = 4.4 * SP;
    const ESCALA_CIFRA = 0.65;                              // tamaño de las cifras en las casillas (igual que en la paleta)
    const Y_ROMANO = Y_CASILLA + ALTO_CASILLA + 0.8 * SP;  // borde superior de las casillas de grado
    const ALTO_ROMANO = 3.1 * SP;
    /* Modulación: cada tonalidad escribe sus grados en un renglón nuevo, un poco más
       abajo; el pivote (dobles[i]) lleva dos grados apilados —el de la tonalidad anterior
       en su renglón y el de la nueva en el siguiente— unidos por dos líneas verticales.
       renglon[i] = renglón de la nota i (el pivote ocupa renglon[i]-1 y renglon[i]). */
    const dobles = Array.isArray(estado.dobles) ? estado.dobles : [];
    const renglon = [];
    { let r = 0; for (let i = 0; i < notas.length; i++) { if (dobles[i] && i > 0) r++; renglon.push(r); } }
    const NUM_RENGLONES = (renglon[notas.length - 1] || 0) + 1;
    const PASO_RENGLON = ALTO_ROMANO + 0.5 * SP;
    const yRenglon = r => Y_ROMANO + r * PASO_RENGLON;
    const Y_FIN_ROMANO = pedirRomano ? yRenglon(NUM_RENGLONES - 1) + ALTO_ROMANO : Y_CASILLA + ALTO_CASILLA;
    const filaFun = estado.filaFunciones && estado.filaFunciones.visible ? estado.filaFunciones : null;   // fila «Función» (T · S · D)
    const Y_FUN = Y_FIN_ROMANO + 0.8 * SP, ALTO_FUN = 2.7 * SP;
    const Y_FIN_FUN = filaFun ? Y_FUN + ALTO_FUN : Y_FIN_ROMANO;
    const filaTon = estado.filaTonalidad && estado.filaTonalidad.visible ? estado.filaTonalidad : null;   // fila «Tonalidad» (modulación)
    const Y_TON = Y_FIN_FUN + 0.8 * SP, ALTO_TON = 2.7 * SP;
    const Y_FIN_CASILLAS = filaTon ? Y_TON + ALTO_TON : Y_FIN_FUN;
    const R_SONAR = 1.25 * SP, CY_SONAR = Y0 - 1.6 * SP;   // botones ▶ en la banda superior, justo sobre el sistema
    const Y_MODELO = Y_FIN_CASILLAS + 2.4 * SP;            // centro de la respuesta modelo (tras corregir)
    const ALTO_TOTAL = Y_MODELO + 2.6 * SP;

    // Cálculo de posiciones x
    let x = sinSistema ? MARGEN + 6 * SP : MARGEN + ANCHO_CLAVE + ANCHO_ARM + ANCHO_COMPAS;   // sin sistema queda sitio para «Do M:»
    const barras = [];                                     // x de cada barra de compás
    const xNotas = [];
    ej.compases.forEach((c, ci) => {
      x += RELLENO_COMPAS;
      c.forEach(([n, d]) => {
        const f = figura(d);
        xNotas.push(x);
        x += f.base >= 4 ? HUECO_REDONDA : f.base <= 1 ? HUECO_NEGRA : HUECO_BLANCA;
        if (f.puntillo) x += 1.2 * SP;
      });
      x += 0.2 * SP;
      barras.push({ x, final: ci === ej.compases.length - 1 });
    });
    const ANCHO_TOTAL = x + MARGEN;

    // Tamaño en pantalla: ESCALA_PX píxeles por unidad (SP = 10 unidades → 10 px por espacio);
    // si no cabe, el CSS lo reduce proporcionalmente (max-width: 100 %)
    const svg = el('svg', { viewBox: `0 0 ${ANCHO_TOTAL} ${ALTO_TOTAL}`, width: Math.round(ANCHO_TOTAL * ESCALA_PX), class: 'partitura', role: 'img',
      'aria-label': sinBajo ? 'Casillas de cifrado del ejercicio (el bajo no se muestra)' : sopranoDada ? 'Melodía del ejercicio, bajo deducido y casillas de cifrado' : 'Bajo del ejercicio con casillas de cifrado' });
    const yLinea = i => Y_BOT - i * SP;                    // i = 0 (inferior) … 4 (superior)

    const yLineaSol = i => Y_BOT_SOL - i * SP;
    const Y_SISTEMA_TOP = conSol ? Y_TOP_SOL : Y_TOP;      // las barras abarcan todo el sistema

    // Pentagrama del bajo (salvo que el ejercicio lo oculte: Audición)
    if (!sinBajo) {
      for (let i = 0; i < 5; i++)
        svg.appendChild(el('line', { x1: MARGEN, x2: x, y1: yLinea(i), y2: yLinea(i), class: 'linea' }));
      // Clave de fa: su línea de referencia es la 4ª (fa3)
      svg.appendChild(glifo(MARGEN + 0.4 * SP, yLinea(3), G.claveFa));
    }
    // Pentagrama de sol (realización)
    if (conSol) {
      for (let i = 0; i < 5; i++)
        svg.appendChild(el('line', { x1: MARGEN, x2: x, y1: yLineaSol(i), y2: yLineaSol(i), class: 'linea' }));
      svg.appendChild(glifo(MARGEN + 0.4 * SP, yLineaSol(1), G.claveSol));
      if (!sinBajo) svg.appendChild(el('line', { x1: MARGEN, x2: MARGEN, y1: Y_TOP_SOL, y2: Y_BOT, class: 'barra' }));
    }
    // Armadura
    if (nArm && !sinSistema) {
      const lista = nArm > 0 ? ARMADURA_SOST : ARMADURA_BEM;
      const listaSol = nArm > 0 ? ARMADURA_SOST_SOL : ARMADURA_BEM_SOL;
      for (let k = 0; k < Math.abs(nArm); k++) {
        const p = paso(Teoria.nota(lista[k]));
        if (!sinBajo) svg.appendChild(glifo(MARGEN + ANCHO_CLAVE + 0.3 * SP + k * 1.1 * SP, Y_BOT - p * SP / 2, nArm > 0 ? G.sostenido : G.bemol));
        if (conSol) {
          const ps = pasoSol(Teoria.nota(listaSol[k]));
          svg.appendChild(glifo(MARGEN + ANCHO_CLAVE + 0.3 * SP + k * 1.1 * SP, Y_BOT_SOL - ps * SP / 2, nArm > 0 ? G.sostenido : G.bemol));
        }
      }
    }
    // Compás (numerador centrado en la 4ª línea, denominador en la 2ª)
    const xC = MARGEN + ANCHO_CLAVE + ANCHO_ARM + 0.5 * SP;
    if (!sinBajo) {
      svg.appendChild(glifo(xC, yLinea(3), G.compas(ej.compas[0])));
      svg.appendChild(glifo(xC, yLinea(1), G.compas(ej.compas[1])));
    }
    if (conSol) {
      svg.appendChild(glifo(xC, yLineaSol(3), G.compas(ej.compas[0])));
      svg.appendChild(glifo(xC, yLineaSol(1), G.compas(ej.compas[1])));
    }
    // Barras (de todo el sistema); sin sistema no hay barras
    const Y_SISTEMA_BOT = sinBajo ? Y_BOT_SOL : Y_BOT;
    if (!sinSistema) barras.forEach(b => {
      if (b.final) {
        svg.appendChild(el('line', { x1: b.x - 0.5 * SP, x2: b.x - 0.5 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
        svg.appendChild(el('line', { x1: b.x + 0.1 * SP, x2: b.x + 0.1 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra gruesa' }));
      } else {
        svg.appendChild(el('line', { x1: b.x, x2: b.x, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
      }
    });

    // Alteración necesaria según la armadura: solo se dibuja si la nota difiere de ella
    const escalaArm = Teoria.escalaNatural(ton);
    const altArmadura = letra => { const e = escalaArm.find(x => x.letra === letra); return e ? e.alt : 0; };
    const glifoAlt = alt => (alt > 0 ? G.sostenido : alt < 0 ? G.bemol : G.becuadro);
    const anchoAlt = alt => (alt > 0 ? ANCHO.sostenido : alt < 0 ? ANCHO.bemol : ANCHO.becuadro);

    // Números de los acordes (los mismos que la columna # de la tabla de revisión)
    if (numerar) notas.forEach((it, i) => {
      const cx = xNotas[i] + figura(it.dur).ancho * SP / 2, cy = 1.7 * SP;
      const g = el('g', { class: 'numero-acorde', 'data-indice': i });
      g.appendChild(el('title', {}, 'Acorde ' + (i + 1) + ' (fila ' + (i + 1) + ' de la tabla)'));
      g.appendChild(el('circle', { cx, cy, r: 1.35 * SP }));
      g.appendChild(el('text', { x: cx, y: cy + 0.5 * SP, 'text-anchor': 'middle' }, String(i + 1)));
      if (typeof estado.alPulsarNumero === 'function') {
        g.setAttribute('role', 'button');
        g.addEventListener('click', () => estado.alPulsarNumero(i));
      }
      svg.appendChild(g);
    });

    // Rótulos de tonalidad encima del sistema ({i, texto, clase}), en la banda superior
    // (debajo de los números si también los hay)
    etiquetas.forEach(et => {
      if (et.i < 0 || et.i >= notas.length) return;
      const cx = xNotas[et.i] + figura(notas[et.i].dur).ancho * SP / 2;
      const cy = (numerar ? 3 * SP : 0) + 1.6 * SP;
      const g = el('g', { class: 'etiqueta-ton ' + (et.clase || '') });
      const ancho = Math.max(4.6 * SP, 0.62 * SP * et.texto.length + 1.2 * SP);
      g.appendChild(el('rect', { x: cx - ancho / 2, y: cy - 1.25 * SP, width: ancho, height: 2.5 * SP, rx: 0.7 * SP }));
      g.appendChild(el('text', { x: cx, y: cy + 0.45 * SP, 'text-anchor': 'middle' }, et.texto));
      svg.appendChild(g);
    });

    // Puntillo: a la derecha de la cabeza; si la nota está en una línea, en el espacio superior
    const puntillo = (g, xDer, p, yBase) => g.appendChild(glifo(xDer + 0.45 * SP, yBase - p * SP / 2 - (p % 2 === 0 ? SP / 2 : 0), G.puntillo, EM, { class: 'nota' }));
    // Corchete de corchea en el extremo de la plica
    const corchete = (g, xP, y2, arriba) => g.appendChild(glifo(xP, y2, arriba ? G.corcheteArriba : G.corcheteAbajo, EM, { class: 'nota' }));

    // Una nota suelta (cabeza, alteración, líneas adicionales, puntillo y plica) en un
    // pentagrama cuya línea inferior está en yBase; p = paso diatónico desde esa línea.
    function notaSuelta(g, n, p, yBase, xN, f, plicaAbajoDesde = 4) {
      const ancho = f.ancho, y = yBase - p * SP / 2, extra = 0.4 * SP;
      if (p >= 10) for (let q = 10; q <= p; q += 2)
        g.appendChild(el('line', { x1: xN - extra, x2: xN + ancho * SP + extra, y1: yBase - q * SP / 2, y2: yBase - q * SP / 2, class: 'linea' }));
      if (p <= -2) for (let q = -2; q >= p; q -= 2)
        g.appendChild(el('line', { x1: xN - extra, x2: xN + ancho * SP + extra, y1: yBase - q * SP / 2, y2: yBase - q * SP / 2, class: 'linea' }));
      if (n.alt !== altArmadura(n.letra)) g.appendChild(glifo(xN - (anchoAlt(n.alt) + 0.25) * SP, y, glifoAlt(n.alt)));
      g.appendChild(glifo(xN, y, f.cabeza, EM, { class: 'nota' }));
      if (f.puntillo) puntillo(g, xN + ancho * SP, p, yBase);
      if (f.plica) {
        const arriba = p < plicaAbajoDesde;
        const xP = arriba ? xN + ancho * SP - 0.07 * SP : xN + 0.07 * SP;
        const y1 = arriba ? y - 0.17 * SP : y + 0.17 * SP;
        const y2 = arriba ? y - 3.5 * SP : y + 3.5 * SP;
        g.appendChild(el('line', { x1: xP, x2: xP, y1, y2, class: 'plica' }));
        if (f.corchete) corchete(g, xP, y2, arriba);
      }
    }

    // Melodía de soprano en el pentagrama de sol (cuando no la lleva ya el acorde de la realización)
    if (sopranoDada) notas.forEach((it, i) => {
      if (Array.isArray(estado.realizacion) && estado.realizacion[i]) return;
      const g = el('g', { class: 'melodia' });
      notaSuelta(g, it.nota, pasoSol(it.nota), Y_BOT_SOL, xNotas[i], figura(it.dur));
      svg.appendChild(g);
    });

    // Acordes de la realización sobre el pentagrama de sol
    if (Array.isArray(estado.realizacion)) notas.forEach((it, i) => {
      const ac = estado.realizacion[i];
      if (!ac) return;
      const xN = xNotas[i];
      const f = figura(it.dur);
      const ancho = f.ancho;
      const g = el('g', { class: 'acorde' + (estado.realizacionMal && estado.realizacionMal[i] ? ' mal' : '') });
      const pasos = ac.map(n => pasoSol(n));
      const media = pasos.reduce((a, b) => a + b, 0) / pasos.length;
      const arriba = media < 4;                            // dirección de la plica (redondas: como si fuera arriba)
      /* Segundas: las dos notas van pegadas a la plica, la inferior a la izquierda y la
         superior a la derecha. Con la plica arriba la posición normal es a la izquierda,
         así que se corre la nota SUPERIOR a la derecha; con la plica abajo la posición
         normal es a la derecha y se corre la nota INFERIOR a la izquierda. En un racimo
         de tres notas seguidas se alterna. */
      const dx = pasos.map(() => 0);
      if (arriba || !f.plica) {
        for (let k = 1; k < pasos.length; k++) if (pasos[k] - pasos[k - 1] === 1 && dx[k - 1] === 0) dx[k] = ancho * SP;
      } else {
        for (let k = pasos.length - 2; k >= 0; k--) if (pasos[k + 1] - pasos[k] === 1 && dx[k + 1] === 0) dx[k] = -ancho * SP;
      }
      const xIzq = xN + Math.min(0, ...dx), xDer = xN + Math.max(0, ...dx) + ancho * SP;
      const extra = 0.4 * SP;
      pasos.forEach((p, k) => {
        const y = Y_BOT_SOL - p * SP / 2;
        if (p >= 10) for (let q = 10; q <= p; q += 2)
          g.appendChild(el('line', { x1: xIzq - extra, x2: xDer + extra, y1: Y_BOT_SOL - q * SP / 2, y2: Y_BOT_SOL - q * SP / 2, class: 'linea' }));
        if (p <= -2) for (let q = -2; q >= p; q -= 2)
          g.appendChild(el('line', { x1: xIzq - extra, x2: xDer + extra, y1: Y_BOT_SOL - q * SP / 2, y2: Y_BOT_SOL - q * SP / 2, class: 'linea' }));
        g.appendChild(glifo(xN + dx[k], y, f.cabeza, EM, { class: 'nota' }));
        if (f.puntillo) puntillo(g, xDer, p, Y_BOT_SOL);
      });
      // Alteraciones (de arriba abajo, escalonadas hacia la izquierda)
      let columna = 0;
      for (let k = ac.length - 1; k >= 0; k--) {
        const n = ac[k];
        if (n.alt === altArmadura(n.letra)) continue;
        const y = Y_BOT_SOL - pasos[k] * SP / 2;
        g.appendChild(glifo(xIzq - (anchoAlt(n.alt) + 0.25) * SP - columna * 1.1 * SP, y, glifoAlt(n.alt)));
        columna++;
      }
      // Plica única del acorde
      if (f.plica) {
        const yMin = Y_BOT_SOL - Math.max(...pasos) * SP / 2, yMax = Y_BOT_SOL - Math.min(...pasos) * SP / 2;
        const xP = arriba ? xN + ancho * SP - 0.07 * SP : xN + 0.07 * SP;
        const y1 = arriba ? yMax - 0.17 * SP : yMin + 0.17 * SP;
        const y2 = arriba ? yMin - 3.5 * SP : yMax + 3.5 * SP;
        g.appendChild(el('line', { x1: xP, x2: xP, y1, y2, class: 'plica' }));
        if (f.corchete) corchete(g, xP, y2, arriba);
      }
      svg.appendChild(g);
    });

    // Notas del bajo (dadas, o deducidas de las respuestas en la melodía de soprano) y,
    // bajo cada una, sus casillas
    notas.forEach((it, i) => {
      const n = it.nota;
      const xN = xNotas[i];
      const f = figura(it.dur);
      const ancho = f.ancho;
      const nb = bajoDe(i);
      if (!sinBajo && nb) {
        const g = el('g', { class: (sopranoDada ? 'bajo-alumno' : 'bajo') + (estado.bajosMal && estado.bajosMal[i] ? ' mal' : '') });
        notaSuelta(g, nb, paso(nb), Y_BOT, xN, f);
        svg.appendChild(g);
      }

      const cx = xN + ancho * SP / 2;
      const res = estado.corregido && estado.resultados ? estado.resultados[i] : null;
      const activa = estado.activa === i && !estado.corregido && !soloLectura;
      const bloq = estado.bloqueadas && estado.bloqueadas[i] ? estado.bloqueadas[i] : { cifra: false, romano: false };

      // Casilla de cifrado (bajo la nota)
      {
        const g = el('g', { 'data-indice': i, 'data-campo': 'cifra', tabindex: 0, role: 'button',
          'aria-label': 'Cifrado de la nota ' + (i + 1) + (sinBajo ? '' : ' (' + Teoria.nombreEs(n) + ')') });
        const clases = ['casilla', 'casilla-cifra'];
        const otroCampo = ['romano', 'romano2', 'funcion', 'tonalidad'].includes(estado.campo);   // la casilla activa es otra de la misma nota
        if (activa && !bloq.cifra && !otroCampo) clases.push('activa');
        else if (activa && !bloq.cifra) clases.push('activa-nota');
        const resp = estado.respuestas[i];
        if (res) clases.push(res.okCifra ? 'bien' : 'mal');
        else if (bloq.cifra) clases.push('bien', 'fija');
        else if (resp) clases.push('llena');
        g.setAttribute('class', clases.join(' '));
        g.appendChild(el('rect', { x: cx - ANCHO_CASILLA / 2, y: Y_CASILLA, width: ANCHO_CASILLA, height: ALTO_CASILLA, rx: 0.8 * SP, class: 'fondo' }));
        if (resp) dibujarCifra(g, resp, cx, Y_CASILLA + ALTO_CASILLA / 2, ESCALA_CIFRA);
        else if (!estado.corregido) g.appendChild(el('text', { x: cx, y: Y_CASILLA + ALTO_CASILLA / 2 + 0.55 * SP, 'text-anchor': 'middle', class: 'interrogante' }, '?'));
        if (!soloLectura) {
          g.addEventListener('click', () => alPulsar(i, 'cifra'));
          g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, 'cifra'); } });
        }
        svg.appendChild(g);
      }

      // Casilla del grado (número romano), debajo de la cifra, en el renglón de su
      // tonalidad. En un pivote (dobles[i]) hay dos apiladas: grado en la tonalidad
      // anterior (renglón de arriba) y en la nueva (renglón de abajo), unidas por dos
      // líneas verticales continuas.
      if (pedirRomano) {
        const esPivote = !!dobles[i] && i > 0;
        const partes = esPivote ? ['romano', 'romano2'] : ['romano'];
        const x0 = cx - ANCHO_CASILLA / 2;
        partes.forEach((campo, k) => {
          const r = esPivote ? renglon[i] - 1 + k : renglon[i];
          const y0 = yRenglon(r);
          const alto = esPivote && k === 0 ? PASO_RENGLON : ALTO_ROMANO;    // la de arriba llega hasta la de abajo
          const g = el('g', { 'data-indice': i, 'data-campo': campo, tabindex: 0, role: 'button',
            'aria-label': 'Grado de la nota ' + (i + 1) + (sinBajo ? '' : ' (' + Teoria.nombreEs(n) + ')') + (esPivote ? (k ? ' en la tonalidad nueva' : ' en la tonalidad anterior') : '') });
          const clases = ['casilla', 'casilla-romano'];
          if (esPivote) clases.push(k ? 'pivote-abajo' : 'pivote-arriba');
          const bloqueadaAqui = !!bloq[campo];
          if (activa && !bloqueadaAqui && estado.campo === campo) clases.push('activa');
          else if (activa && !bloqueadaAqui) clases.push('activa-nota');
          const lista = campo === 'romano2' ? estado.romanos2 : estado.romanos;
          const rom = lista ? lista[i] : null;
          const okAqui = res ? (campo === 'romano2' ? res.okRomano2 : res.okRomano) : null;
          if (res) clases.push(okAqui ? 'bien' : 'mal');
          else if (bloqueadaAqui) clases.push('bien', 'fija');
          else if (rom) clases.push('llena');
          g.setAttribute('class', clases.join(' '));
          g.appendChild(el('rect', { x: x0, y: y0, width: ANCHO_CASILLA, height: alto, rx: esPivote ? 0 : 0.7 * SP, class: 'fondo' }));
          g.appendChild(el('text', { x: cx, y: y0 + ALTO_ROMANO / 2 + 0.75 * SP, 'text-anchor': 'middle', class: rom ? 'romano' : 'interrogante' }, rom || (estado.corregido ? '' : '?')));
          if (!soloLectura) {
            g.addEventListener('click', () => alPulsar(i, campo));
            g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, campo); } });
          }
          svg.appendChild(g);
        });
        if (esPivote) {
          // Las dos líneas verticales que unen los dos grados del pivote: | I | sobre | V |
          const yA = yRenglon(renglon[i] - 1), yB = yRenglon(renglon[i]) + ALTO_ROMANO;
          [x0, x0 + ANCHO_CASILLA].forEach(x => svg.appendChild(el('line', { x1: x, x2: x, y1: yA - 0.3 * SP, y2: yB + 0.3 * SP, class: 'pivote-barra' })));
        }
        // Nombre de la tonalidad al principio de cada renglón (si hay modulación)
        if (filaTon && filaTon.celdas) {
          const celda = filaTon.celdas[i] || {};
          if ((i === 0 || esPivote) && celda.texto && celda.texto !== '¿?') {
            const r = esPivote ? renglon[i] : 0;
            svg.appendChild(el('text', { x: x0 - 0.7 * SP, y: yRenglon(r) + ALTO_ROMANO / 2 + 0.55 * SP, 'text-anchor': 'end', class: 'renglon-ton' }, celda.texto + ':'));
          }
        }
      }

      // Fila «Función»: T · S · D de cada acorde (dada por el profesor o pedida al alumno)
      if (filaFun) {
        const celda = filaFun.celdas[i] || {};
        const editable = filaFun.editable && !celda.fija;
        const g = el('g', { 'data-indice': i, 'data-campo': 'funcion', tabindex: editable ? 0 : -1, role: editable ? 'button' : 'note',
          'aria-label': 'Función tonal de la nota ' + (i + 1) });
        const clases = ['casilla', 'casilla-fun'];
        if (!editable) clases.push('fija');
        if (celda.clase) clases.push(celda.clase);
        if (activa && editable && estado.campo === 'funcion') clases.push('activa');
        else if (activa && editable) clases.push('activa-nota');
        if (celda.texto) clases.push('llena');
        g.setAttribute('class', clases.join(' '));
        g.appendChild(el('rect', { x: cx - ANCHO_CASILLA / 2, y: Y_FUN, width: ANCHO_CASILLA, height: ALTO_FUN, rx: 0.6 * SP, class: 'fondo' }));
        g.appendChild(el('text', { x: cx, y: Y_FUN + ALTO_FUN / 2 + 0.6 * SP, 'text-anchor': 'middle', class: celda.texto ? 'fun' : 'interrogante-ton' }, celda.texto || (editable && !estado.corregido ? '?' : '')));
        if (editable && !soloLectura) {
          g.addEventListener('click', () => alPulsar(i, 'funcion'));
          g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, 'funcion'); } });
        }
        svg.appendChild(g);
        if (i === 0) svg.appendChild(el('text', { x: cx - ANCHO_CASILLA / 2 - 0.7 * SP, y: Y_FUN + ALTO_FUN / 2 + 0.55 * SP, 'text-anchor': 'end', class: 'renglon-ton' }, 'Función:'));
      }

      // Fila «Tonalidad»: desde qué nota rige cada tonalidad (modulación)
      if (filaTon) {
        const celda = filaTon.celdas[i] || {};
        const editable = filaTon.editable && i > 0 && !celda.fija;
        const g = el('g', { 'data-indice': i, 'data-campo': 'tonalidad', tabindex: editable ? 0 : -1, role: editable ? 'button' : 'note',
          'aria-label': 'Tonalidad desde la nota ' + (i + 1) });
        const clases = ['casilla', 'casilla-ton'];
        if (!editable) clases.push('fija');
        if (celda.clase) clases.push(celda.clase);
        if (activa && editable && estado.campo === 'tonalidad') clases.push('activa');
        else if (activa && editable) clases.push('activa-nota');
        if (celda.texto) clases.push('llena');
        g.setAttribute('class', clases.join(' '));
        g.appendChild(el('rect', { x: cx - ANCHO_CASILLA / 2, y: Y_TON, width: ANCHO_CASILLA, height: ALTO_TON, rx: 0.6 * SP, class: 'fondo' }));
        g.appendChild(el('text', { x: cx, y: Y_TON + ALTO_TON / 2 + 0.55 * SP, 'text-anchor': 'middle', class: celda.texto ? 'ton' : 'interrogante-ton' }, celda.texto || (editable && !estado.corregido ? '·' : '')));
        if (editable && !soloLectura) {
          g.addEventListener('click', () => alPulsar(i, 'tonalidad'));
          g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, 'tonalidad'); } });
        }
        svg.appendChild(g);
      }

      // Botón ▶ encima del acorde: hace sonar ese acorde de la propuesta
      if (conSonar) {
        const cy = CY_SONAR;
        const g = el('g', { class: 'boton-sonar' + (estado.sonando === i ? ' sonando' : ''), 'data-indice': i, tabindex: 0, role: 'button',
          'aria-label': 'Escuchar el acorde ' + (i + 1) + ' de la propuesta' });
        g.appendChild(el('title', {}, 'Escuchar este acorde de la propuesta'));
        g.appendChild(el('circle', { cx, cy, r: R_SONAR, class: 'fondo' }));
        g.appendChild(el('path', { d: `M ${cx - 0.42 * SP} ${cy - 0.6 * SP} L ${cx + 0.62 * SP} ${cy} L ${cx - 0.42 * SP} ${cy + 0.6 * SP} Z`, class: 'triangulo' }));
        g.addEventListener('click', ev => { ev.stopPropagation(); estado.alSonar(i); });
        g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); estado.alSonar(i); } });
        svg.appendChild(g);
      }

      // Al mostrar la solución, la respuesta modelo (cifra y grado) bajo las notas con algún error
      if (res && !res.ok && estado.mostrarSolucion) {
        const gm = el('g', { class: 'modelo' });
        if (pedirRomano) {
          dibujarCifra(gm, res.modelo, cx - 0.9 * SP, Y_MODELO, 0.75);
          gm.appendChild(el('text', { x: cx + 1.1 * SP, y: Y_MODELO + 0.75 * SP, 'text-anchor': 'start', class: 'romano modelo-romano' }, res.modeloRomano));
        } else {
          dibujarCifra(gm, res.modelo, cx, Y_MODELO, 0.8);
        }
        svg.appendChild(gm);
      }
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(svg);
    return svg;
  }

  // Dibuja una cifra suelta como SVG pequeño (para los botones de la paleta).
  function iconoCifra(id, alto = 44) {
    const svg = el('svg', { viewBox: `0 0 ${5 * SP} ${5 * SP}`, width: alto, height: alto, class: 'icono-cifra', 'aria-hidden': 'true' });
    const g = el('g');
    dibujarCifra(g, id, 2.5 * SP, 2.5 * SP, 0.85);
    svg.appendChild(g);
    return svg;
  }

  return { dibujar, iconoCifra, figura, SP };
})();
