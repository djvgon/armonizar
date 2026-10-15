/* =====================================================================
   reja.js — La REJA DE ESCRITURA de la célula del retardo: dos voces,
   tres momentos, con sus ligaduras, la barra de compás y el intervalo
   escrito debajo de cada columna.

   Es la pantalla en la que el alumno escribe (2.5 y 2.6 del documento de
   contrapunto), y la misma que sirve para enseñar la célula hecha. Se
   dibuja aparte de `partitura.js` a propósito: aquella está construida
   alrededor de UN bajo con sus casillas de cifrado debajo, y aquí no hay
   cifras, hay dos voces, ligaduras y una barra que pone el alumno. Lo
   que sí se comparte son los convenios: la fuente Bravura, el espacio de
   pentagrama (SP) y la manera de contar los pasos diatónicos.

   UNO O DOS PENTAGRAMAS, SEGÚN QUEPA (Diego, 15/10/2026). Si las dos
   voces caben holgadas en un solo pentagrama —que es lo normal en una
   célula, donde están a una 3.ª o a una 6.ª—, se escriben juntas, con
   las plicas contrarias, como se escribe el contrapunto a dos voces: así
   el intervalo se VE. Cuando se separan —el registro de la célula llega
   de fa1 a do5—, cada voz coge su pentagrama y su clave.

   Uso:
     Reja.dibujar(contenedor, estado, alPulsar)

       contenedor : elemento HTML donde se inserta el SVG
       estado :
         tonalidad   : {tonica, modo} — de ella sale la armadura
         momentos    : [{alta: nota|null, baja: nota|null} × 3]
                       (`null` = casilla vacía, que el alumno ha de llenar)
         modelo      : los momentos COMPLETOS, para decidir la
                       disposición y las claves sin que bailen mientras
                       el alumno escribe
         ligaduras   : [{voz:'alta'|'baja', desde: 0|1}]
         barra       : 1 | 2 | null — índice del momento DELANTE del cual
                       va la barra (la de la célula es 1)
         dadas       : [{momento, voz}] casillas que vienen escritas y no
                       se pueden mover: se dibujan en color
         activa      : {momento, voz} | null — donde está el alumno
         mal         : [{momento, voz}] casillas en rojo (al corregir)
         intervalos  : true para escribir el intervalo bajo cada columna
         alSonar     : función(momento) — con ella, un ▶ encima de cada
                       columna
         sonando     : índice del momento que está sonando
         soloLectura : true para enseñarla sin casillas pulsables

       alPulsar : función(momento, que) donde `que` es 'alta', 'baja' o
                  'barra'

   Las notas son notas de `teoria.js` ({letra, alt, octava}), no textos.
   ===================================================================== */

const Reja = (() => {

  const NS = 'http://www.w3.org/2000/svg';
  const SP = 10;                      // espacio de pentagrama, como en partitura.js
  const EM = 4 * SP;                  // un em de Bravura = cuatro espacios

  /* Los signos, por su número en SMuFL y no como carácter escrito: así el archivo se lee
     y se corrige en cualquier editor, sin depender de que la fuente esté instalada. */
  const G = {
    claveSol: String.fromCodePoint(0xE050),
    claveFa: String.fromCodePoint(0xE062),
    blanca: String.fromCodePoint(0xE0A3),
    sostenido: String.fromCodePoint(0xE262),
    bemol: String.fromCodePoint(0xE260),
    becuadro: String.fromCodePoint(0xE261),
    dobleSostenido: String.fromCodePoint(0xE263),
    dobleBemol: String.fromCodePoint(0xE264)
  };
  const ANCHO = { blanca: 1.18, sostenido: 1.0, bemol: 0.9, becuadro: 0.67, dobleSostenido: 1.0, dobleBemol: 1.65 };
  const glifoAlt = alt => (alt >= 2 ? G.dobleSostenido : alt === 1 ? G.sostenido
    : alt <= -2 ? G.dobleBemol : alt === -1 ? G.bemol : G.becuadro);
  const anchoAlt = alt => (alt >= 2 ? ANCHO.dobleSostenido : alt === 1 ? ANCHO.sostenido
    : alt <= -2 ? ANCHO.dobleBemol : alt === -1 ? ANCHO.bemol : ANCHO.becuadro);

  /* La armadura en su sitio de siempre, en las dos claves (las mismas posiciones que usa
     `partitura.js`): sostenidos fa do sol re la mi si, bemoles si mi la re sol do fa. */
  const ARMADURA = {
    sol: { sost: ['F5', 'C5', 'G5', 'D5', 'A4', 'E5', 'B4'], bem: ['B4', 'E5', 'A4', 'D5', 'G4', 'C5', 'F4'] },
    fa: { sost: ['F3', 'C3', 'G3', 'D3', 'A2', 'E3', 'B2'], bem: ['B2', 'E3', 'A2', 'D3', 'G2', 'C3', 'F2'] }
  };
  // La línea inferior de cada pentagrama: sol2 en la clave de fa, mi4 en la de sol
  const BASE_CLAVE = { fa: 'G2', sol: 'E4' };

  const el = (tag, atrs = {}, txt) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(atrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (txt !== undefined) e.textContent = txt;
    return e;
  };
  const glifo = (x, y, txt, tam = EM, extra = {}) =>
    el('text', Object.assign({ x, y, 'font-family': 'Bravura', 'font-size': tam }, extra), txt);

  /* ---- Geometría ---- */
  const ANCHO_COL = 13 * SP;          // una columna por momento
  const X_IZQ = 1.2 * SP;             // margen antes de la clave
  const ALTO_PENTA = 4 * SP;
  const HUECO = 6.5 * SP;             // entre dos pentagramas: cabe una línea adicional
  const Y_ARRIBA = 3.2 * SP;          // sitio para los ▶ encima del sistema

  // Paso diatónico de una nota en un pentagrama: medio espacio por paso
  const pasoEn = (n, clave) => Teoria.indice(n) - Teoria.indice(Teoria.nota(BASE_CLAVE[clave]));
  const CLAVES = ['fa', 'sol'];
  // Lo lejos que queda una lista de notas del centro del pentagrama, en esa clave
  const descentrado = (notas, clave) =>
    notas.reduce((s, n) => s + Math.abs(pasoEn(n, clave) - 4), 0) / (notas.length || 1);

  /* La clave de una voz sale de SUS notas, no de un reparto fijo: el registro de la célula va
     de fa1 a do5 (Diego, 15/10), de modo que la voz de arriba de una célula grave puede estar
     entera en la clave de fa. */
  function claveDe(notas) {
    const ns = (notas || []).filter(Boolean);
    if (!ns.length) return 'fa';
    return descentrado(ns, 'sol') < descentrado(ns, 'fa') ? 'sol' : 'fa';
  }

  /* UNO O DOS PENTAGRAMAS. Caben en uno si hay una clave en la que TODAS las notas de las dos
     voces quedan entre dos líneas adicionales por debajo y dos por encima (pasos −4 a 12), que
     es lo que se lee sin contar rayas. La ventana es ancha, pero la célula no: entre la nota
     más aguda y la más grave de una célula no hay nunca más de una séptima, así que la
     ventana solo dice DÓNDE cae, no cuánto ocupa. Con este listón, 442 de las 460 células de
     una ficha se escriben en un solo pentagrama; las 18 restantes, a caballo entre las dos
     claves, en dos. */
  const VENTANA = [-4, 12];
  function disposicion(momentos) {
    const notas = (momentos || []).reduce((a, m) => a.concat([m && m.alta, m && m.baja]), []).filter(Boolean);
    if (!notas.length) return { unico: true, clave: 'fa', claves: { alta: 'fa', baja: 'fa' } };
    const caben = CLAVES.filter(c => notas.every(n => { const p = pasoEn(n, c); return p >= VENTANA[0] && p <= VENTANA[1]; }));
    if (caben.length) {
      const clave = caben.length === 1 ? caben[0]
        : (descentrado(notas, caben[0]) <= descentrado(notas, caben[1]) ? caben[0] : caben[1]);
      return { unico: true, clave, claves: { alta: clave, baja: clave } };
    }
    const alta = (momentos || []).map(m => m && m.alta).filter(Boolean);
    const baja = (momentos || []).map(m => m && m.baja).filter(Boolean);
    return { unico: false, claves: { alta: claveDe(alta), baja: claveDe(baja) } };
  }

  /* Qué alteración hay que escribir: la nota se compara con la armadura, y lo que ya se ha
     escrito en el mismo compás queda vigente, como en la notación de verdad. En la célula los
     compases los parte la BARRA, que es la del estado (y puede no estar puesta todavía:
     entonces todo es un compás). */
  function alteracionesEscritas(momentos, ton, barra) {
    const escala = Teoria.escalaNatural(ton);
    const deArmadura = letra => { const e = escala.find(x => x.letra === letra); return e ? e.alt : 0; };
    const pide = [];
    let vigente = {};
    (momentos || []).forEach((m, k) => {
      if (barra !== null && barra !== undefined && k === barra) vigente = {};   // compás nuevo
      const fila = {};
      ['alta', 'baja'].forEach(voz => {
        const n = m && m[voz];
        if (!n) return;
        const clave = n.letra + n.octava;
        const actual = vigente[clave] !== undefined ? vigente[clave] : deArmadura(n.letra);
        if (n.alt !== actual) { fila[voz] = true; vigente[clave] = n.alt; }
      });
      pide.push(fila);
    });
    return pide;
  }

  function dibujar(contenedor, estado, alPulsar) {
    const ton = estado.tonalidad || { tonica: 'C', modo: 'mayor' };
    const momentos = estado.momentos || [];
    const n = momentos.length || 3;
    const modelo = (estado.modelo && estado.modelo.length) ? estado.modelo : momentos;
    const disp = disposicion(modelo);
    const unico = disp.unico;
    const claves = disp.claves;
    const nArm = Teoria.armadura(ton);
    const anchoArm = Math.abs(nArm) * 1.15 * SP;
    const X0 = X_IZQ + 3.6 * SP + anchoArm + 1.4 * SP;      // donde empieza la primera columna
    const ancho = X0 + n * ANCHO_COL + 1.2 * SP;

    /* EL ALTO SE MIDE, Y SE MIDE SOBRE LA TINTA, no sobre el pentagrama (Diego, 15/10: «el
       símbolo de play se superpone y tapa las notas»). Una cabeza no acaba en sí misma: la
       plica sube o baja 3,5 espacios y la ligadura se aparta casi uno, de modo que lo más
       alto del dibujo puede estar bastante por encima de la línea superior del pentagrama.
       Se calcula primero CUÁNTO OCUPA el sistema —hacia arriba y hacia abajo de la línea
       base— y después dónde empieza, dejando por encima el sitio del ▶; así no hay manera de
       que el botón caiga sobre una nota ni de que una nota se salga del recuadro. */
    const AIRE = 3.9 * SP;             // lo que añaden por fuera de la cabeza la plica y la ligadura
    const pasosDe = voz => modelo.concat(momentos).map(m => m && m[voz]).filter(Boolean)
      .map(x => pasoEn(x, claves[voz]));
    const limites = ps => ({ max: Math.max(8, ...(ps.length ? ps : [8])), min: Math.min(0, ...(ps.length ? ps : [0])) });
    const hayPlay = typeof estado.alSonar === 'function';
    const sitioPlay = hayPlay ? 3.6 * SP : 0.8 * SP;   // el ▶ mide 2,3 y el resto es aire

    let yBase, alto, sobra, cima;
    if (unico) {
      const lim = limites(pasosDe('alta').concat(pasosDe('baja')));
      cima = ALTO_PENTA + (lim.max - 8) * SP / 2 + AIRE;     // tinta por encima de la línea base
      sobra = (-lim.min) * SP / 2 + AIRE;                    // y por debajo
      const y = cima + sitioPlay;
      yBase = { alta: y, baja: y };
      alto = y + sobra + (estado.intervalos ? 2.6 * SP : 0.6 * SP);
    } else {
      const la = limites(pasosDe('alta')), lb = limites(pasosDe('baja'));
      cima = ALTO_PENTA + (la.max - 8) * SP / 2 + AIRE;
      const choque = (lb.max - 8) * SP / 2 + (-la.min) * SP / 2;
      const hueco = Math.max(HUECO, choque + 2 * AIRE);
      sobra = (-lb.min) * SP / 2 + AIRE;
      const y = cima + sitioPlay;
      yBase = { alta: y, baja: y + hueco + ALTO_PENTA };
      alto = yBase.baja + sobra + (estado.intervalos ? 2.6 * SP : 0.6 * SP);
    }

    const svg = el('svg', {
      viewBox: '0 0 ' + Math.round(ancho) + ' ' + Math.round(alto),
      width: Math.round(ancho), height: Math.round(alto),
      class: 'reja' + (unico ? ' reja-unica' : ''), role: 'img',
      'aria-label': estado.titulo || 'Célula de retardo a dos voces'
    });
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    /* ---- Pentagramas, claves y armadura ---- */
    const pentagramas = unico ? [{ clave: disp.clave, y: yBase.alta }]
      : [{ clave: claves.alta, y: yBase.alta }, { clave: claves.baja, y: yBase.baja }];
    pentagramas.forEach(p => {
      for (let i = 0; i < 5; i++) svg.appendChild(el('line', {
        x1: X_IZQ, x2: ancho - 1.2 * SP, y1: p.y - i * SP, y2: p.y - i * SP, class: 'linea'
      }));
      // La clave se cuelga de SU línea: la de fa de la cuarta, la de sol de la segunda
      svg.appendChild(glifo(X_IZQ + 0.5 * SP, p.y - (p.clave === 'fa' ? 3 : 1) * SP,
        p.clave === 'fa' ? G.claveFa : G.claveSol));
      const lista = (nArm >= 0 ? ARMADURA[p.clave].sost : ARMADURA[p.clave].bem).slice(0, Math.abs(nArm));
      lista.forEach((t, i) => svg.appendChild(glifo(
        X_IZQ + 3.9 * SP + i * 1.15 * SP, p.y - pasoEn(Teoria.nota(t), p.clave) * SP / 2,
        nArm >= 0 ? G.sostenido : G.bemol)));
    });
    const yAlto = yBase.alta - 4 * SP, yBajo = yBase.baja;
    // La llave del sistema: solo cuando hay dos pentagramas que unir
    if (!unico) svg.appendChild(el('line', { x1: X_IZQ, x2: X_IZQ, y1: yAlto, y2: yBajo, class: 'barra' }));

    /* ---- La barra de compás, en el hueco que le toca ---- */
    const xHueco = k => X0 + k * ANCHO_COL - 0.5 * SP;      // delante del momento k
    if (estado.barra !== null && estado.barra !== undefined && estado.barra > 0) {
      svg.appendChild(el('line', { x1: xHueco(estado.barra), x2: xHueco(estado.barra), y1: yAlto, y2: yBajo, class: 'barra' }));
    }
    // El doble barra del final, que cierra la célula
    svg.appendChild(el('line', { x1: ancho - 1.9 * SP, x2: ancho - 1.9 * SP, y1: yAlto, y2: yBajo, class: 'barra' }));
    svg.appendChild(el('line', { x1: ancho - 1.3 * SP, x2: ancho - 1.3 * SP, y1: yAlto, y2: yBajo, class: 'barra gruesa' }));

    /* ---- Las notas ---- */
    const alts = alteracionesEscritas(momentos, ton, estado.barra);
    const esta = (lista, k, voz) => (lista || []).some(x => x.momento === k && x.voz === voz);
    const xDe = k => X0 + k * ANCHO_COL + 2.2 * SP;
    const cabezas = { alta: [], baja: [] };

    /* LA CASILLA EN LA QUE ESTÁ EL ALUMNO se marca con un fondo, y el fondo va DEBAJO de la
       música: pintarlo encima —que es donde están las zonas pulsables— taparía la nota, que
       es justo lo que no puede pasar. */
    if (estado.activa) {
      const a = estado.activa;
      const alto1 = unico
        ? { y: yBase.alta - cima + 0.4 * SP, h: (yBase.baja + sobra) - (yBase.alta - cima) - 0.8 * SP }
        : { y: yBase[a.voz] - 4.8 * SP, h: 5.6 * SP };
      let y = alto1.y, h = alto1.h;
      if (unico) {
        const medio = (yBase.alta - 2 * SP);
        if (a.voz === 'alta') h = medio - y;
        else { h = (y + h) - medio; y = medio; }
      }
      svg.appendChild(el('rect', {
        x: X0 + a.momento * ANCHO_COL, y, width: ANCHO_COL - 0.6 * SP, height: Math.max(h, 2 * SP),
        rx: 0.5 * SP, class: 'casilla-fondo'
      }));
    }

    momentos.forEach((m, k) => {
      /* Con las dos voces en el mismo pentagrama, una SEGUNDA no cabe en la misma columna: la
         de arriba se corre a la derecha, que es como se escribe. */
      let corre = 0;
      if (unico && m && m.alta && m.baja
        && Math.abs(pasoEn(m.alta, disp.clave) - pasoEn(m.baja, disp.clave)) === 1) corre = ANCHO.blanca * SP;

      ['alta', 'baja'].forEach(voz => {
        const nota = m && m[voz];
        const xN = xDe(k) + (voz === 'alta' ? corre : 0);
        if (!nota) {
          /* Casilla vacía: una raya tenue donde va la nota. Con un solo pentagrama, la de la
             voz de arriba va en el tercer espacio y la de abajo en el primero, para que se vea
             cuál es cuál; con dos, cada una en el centro del suyo. */
          const p = unico ? (voz === 'alta' ? 6 : 2) : 4;
          const y = yBase[voz] - p * SP / 2;
          /* El hueco también se marca: si no, el alumno no ve en qué casilla vacía está, ni
             cuál le falta cuando la corrección se lo dice. */
          svg.appendChild(el('line', {
            x1: xN - 0.1 * SP, x2: xN + ANCHO.blanca * SP + 0.1 * SP, y1: y, y2: y,
            class: 'hueco'
              + (esta(estado.mal, k, voz) ? ' mal' : '')
              + (estado.activa && estado.activa.momento === k && estado.activa.voz === voz ? ' activa' : '')
          }));
          cabezas[voz].push(null);
          return;
        }
        const p = pasoEn(nota, claves[voz]);
        const y = yBase[voz] - p * SP / 2;
        const g = el('g', {
          class: 'nota-reja'
            + (esta(estado.dadas, k, voz) ? ' dada' : '')
            + (esta(estado.mal, k, voz) ? ' mal' : '')
            + (estado.activa && estado.activa.momento === k && estado.activa.voz === voz ? ' activa' : '')
        });
        // Líneas adicionales, solo alrededor de esta cabeza
        const extra = 0.4 * SP;
        const raya = q => g.appendChild(el('line', {
          x1: xN - extra, x2: xN + ANCHO.blanca * SP + extra,
          y1: yBase[voz] - q * SP / 2, y2: yBase[voz] - q * SP / 2, class: 'linea'
        }));
        if (p >= 10) for (let q = 10; q <= p; q += 2) raya(q);
        if (p <= -2) for (let q = -2; q >= p; q -= 2) raya(q);
        if (alts[k] && alts[k][voz]) g.appendChild(glifo(xN - (anchoAlt(nota.alt) + 0.25) * SP, y, glifoAlt(nota.alt)));
        g.appendChild(glifo(xN, y, G.blanca, EM, { class: 'nota' }));
        /* La plica. Con las dos voces en un pentagrama manda la VOZ —arriba la superior, abajo
           la inferior—, que es lo que las distingue; con una voz por pentagrama, manda la
           posición de la cabeza, como en cualquier partitura. */
        const arriba = unico ? voz === 'alta' : p < 4;
        const xP = arriba ? xN + ANCHO.blanca * SP - 0.07 * SP : xN + 0.07 * SP;
        g.appendChild(el('line', {
          x1: xP, x2: xP,
          y1: arriba ? y - 0.17 * SP : y + 0.17 * SP,
          y2: arriba ? y - 3.5 * SP : y + 3.5 * SP, class: 'plica'
        }));
        svg.appendChild(g);
        cabezas[voz].push({ x: xN, y, arriba });
      });
    });

    /* ---- Las ligaduras ----
       Con un pentagrama por voz van del lado contrario a la plica, como manda la notación.
       Con las dos voces juntas mandan la voz —la de arriba por encima, la de abajo por
       debajo—, porque ahí lo que hay que separar son las voces y no los signos. */
    (estado.ligaduras || []).forEach(l => {
      const a = cabezas[l.voz] && cabezas[l.voz][l.desde];
      const b = cabezas[l.voz] && cabezas[l.voz][l.desde + 1];
      if (!a || !b) return;
      const abajo = unico ? l.voz === 'baja' : a.arriba;
      const y0 = a.y + (abajo ? 0.9 : -0.9) * SP;
      const x0 = a.x + ANCHO.blanca * SP * 0.55;
      const x1 = b.x + ANCHO.blanca * SP * 0.45;
      const y1 = b.y + (abajo ? 0.9 : -0.9) * SP;
      const curva = (abajo ? 1 : -1) * 1.5 * SP;
      svg.appendChild(el('path', {
        d: 'M ' + x0 + ' ' + y0 + ' Q ' + ((x0 + x1) / 2) + ' ' + ((y0 + y1) / 2 + curva) + ' ' + x1 + ' ' + y1,
        class: 'ligadura'
      }));
    });

    /* ---- El intervalo debajo de cada columna (2.6) ---- */
    if (estado.intervalos) momentos.forEach((m, k) => {
      if (!m || !m.alta || !m.baja) return;
      svg.appendChild(el('text', {
        x: xDe(k) + ANCHO.blanca * SP / 2, y: yBajo + sobra + 1.9 * SP,
        class: 'reja-intervalo', 'text-anchor': 'middle'
      }, String(Celulas.gradosEntre(m.alta, m.baja))));
    });

    /* ---- El ▶ de cada momento ---- */
    if (typeof estado.alSonar === 'function') momentos.forEach((m, k) => {
      const x = xDe(k) + ANCHO.blanca * SP / 2;
      const yPlay = sitioPlay / 2;          // la banda libre va de 0 a `sitioPlay`
      const g = el('g', { class: 'reja-play' + (estado.sonando === k ? ' suena' : ''), role: 'button', tabindex: '0' });
      g.appendChild(el('circle', { cx: x, cy: yPlay, r: 1.15 * SP, class: 'reja-play-fondo' }));
      g.appendChild(el('path', {
        d: 'M ' + (x - 0.38 * SP) + ' ' + (yPlay - 0.6 * SP)
         + ' L ' + (x + 0.52 * SP) + ' ' + yPlay
         + ' L ' + (x - 0.38 * SP) + ' ' + (yPlay + 0.6 * SP) + ' Z', class: 'reja-play-triangulo'
      }));
      g.appendChild(el('title', {}, 'Oír este momento'));
      const suena = e => { e.preventDefault(); estado.alSonar(k); };
      g.addEventListener('click', suena);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') suena(e); });
      svg.appendChild(g);
    });

    /* ---- Las casillas pulsables ----
       Se dibujan al final, por encima de todo, y solo cuando hay con quién hablar: la pantalla
       que enseña una célula hecha pasa `soloLectura` y no lleva ninguna.
       Con un solo pentagrama la columna se parte por la mitad entre las dos notas: se pulsa
       arriba para la voz superior y abajo para la inferior. */
    if (!estado.soloLectura && typeof alPulsar === 'function') {
      const zona = (x, y, w, h, que, k, etiqueta) => {
        const r = el('rect', {
          x, y, width: w, height: Math.max(h, 2 * SP),
          class: 'casilla-reja' + (esta(estado.dadas, k, que) ? ' fija' : ''),
          role: 'button', tabindex: '0', 'aria-label': etiqueta
        });
        const pulsa = e => { e.preventDefault(); alPulsar(k, que); };
        r.addEventListener('click', pulsa);
        r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pulsa(e); });
        svg.appendChild(r);
      };
      const nombre = (k, voz) => 'Momento ' + (k + 1) + ', voz ' + (voz === 'alta' ? 'superior' : 'inferior');
      momentos.forEach((m, k) => {
        const x = X0 + k * ANCHO_COL, w = ANCHO_COL - 0.6 * SP;
        if (unico) {
          const ca = cabezas.alta[k], cb = cabezas.baja[k];
          const arriba = yBase.alta - cima;
          const abajo = yBajo + sobra;
          const corte = (ca && cb) ? (ca.y + cb.y) / 2 : (arriba + abajo) / 2;
          zona(x, arriba, w, corte - arriba, 'alta', k, nombre(k, 'alta'));
          zona(x, corte, w, abajo - corte, 'baja', k, nombre(k, 'baja'));
        } else {
          ['alta', 'baja'].forEach(voz => zona(
            x, yBase[voz] - 4.8 * SP, w, 5.6 * SP, voz, k, nombre(k, voz)));
        }
      });
      // El hueco de la barra: se pulsa para ponerla o quitarla (2.5)
      for (let k = 1; k < n; k++) zona(
        xHueco(k) - 0.9 * SP, yAlto, 1.8 * SP, yBajo - yAlto,
        'barra', k, 'Poner o quitar la barra de compás delante del momento ' + (k + 1)
      );
    }

    contenedor.textContent = '';
    contenedor.appendChild(svg);
    return svg;
  }

  return { dibujar, claveDe, disposicion, pasoEn, alteracionesEscritas, SP };
})();
