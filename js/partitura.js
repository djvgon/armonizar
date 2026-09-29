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
                      realizacionCambio:[[bool]] (notas en naranja: las que cambian
                      respecto a la realización del alumno, al ver la solución),
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
                      filaFunciones:{visible, editable, celdas:[{texto, clase, fija}], celdas2, dobles}
                      (fila «Función» T · S · D bajo los grados, campo 'funcion'),
                      avisosVoces:[{texto, notas:[{i, voz}]}] (errores de conducción de voces:
                      las notas implicadas se dibujan en rojo y, al pulsar cualquiera de
                      ellas, se abre un globo con la explicación; voz 0 = bajo, 1 tenor,
                      2 contralto, 3 soprano) }
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
    silRedonda: '', silBlanca: '', silNegra: '', silCorchea: '',
    puntillo: '', corcheteArriba: '', corcheteAbajo: '',
    sostenido: '', bemol: '', becuadro: '',
    dobleSostenido: '', dobleBemol: '',   // decisión 114
    compas: d => String.fromCodePoint(0xE080 + d),
    cifra: {
      '0': '', '1': '', '2': '', '3': '', '4': '', '5': '',
      '6': '', '7': '', '8': '', '9': '',
      '4t': '', '5t': '', '6t': '', '7t': '',   // numerales tachados
      '+': '', '#': '', 'b': '', 'n': '', 'x': '', 'bb': ''
    }
  };
  // Anchuras de avance (en espacios) de los glifos que necesitamos alinear.
  const ANCHO = { redonda: 1.69, blanca: 1.18, negra: 1.18, sostenido: 1.0, bemol: 0.9, becuadro: 0.67,
    dobleSostenido: 1.0, dobleBemol: 1.65 };   // medidas en la propia Bravura (1 em = 4 espacios)

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
  const AVANCE = { num: 0.236, '+': 0.135, '#': 0.19, 'b': 0.177, 'n': 0.134, x: 0.22, bb: 0.3 };

  /* 'ctx' = {bajo, ton}: con él se escriben las alteraciones accidentales de la cifra
     (la sensible del V en menor, etc.). Sin ctx —la paleta— se dibuja la cifra escueta. */
  function dibujarCifra(g, id, cx, cyCentro, escala = 1, color = null, ctx = null) {
    const c = Teoria.CIFRADOS[id];
    if (!c) return;
    const em = EM_CIFRA * escala;
    const altoFila = 2.1 * SP * escala;                     // los numerales miden 1/4 de em; se deja aire
    const filas = ctx && ctx.bajo && ctx.ton ? Teoria.filasCifra(id, ctx.bajo, ctx.ton) : c.filas;
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

  /* Ancho que ocupará una cifra dibujada —su fila más ancha—, para poder centrar un grupo
     que la lleve dentro. Se mide con la misma tabla de avances que usa `dibujarCifra`, de
     modo que las dos no puedan discrepar. */
  function anchoCifra(id, escala = 1, ctx = null) {
    const c = Teoria.CIFRADOS[id];
    if (!c) return 0;
    const em = EM_CIFRA * escala;
    const filas = ctx && ctx.bajo && ctx.ton ? Teoria.filasCifra(id, ctx.bajo, ctx.ton) : c.filas;
    return filas.reduce((m, fila) => {
      if (fila.length === 1 && fila[0].signo === '—') return Math.max(m, 1.8 * SP * escala);
      return Math.max(m, fila.reduce((a, s) => a + (s.num ? AVANCE.num : (AVANCE[s.signo] || 0.2)) * em, 0));
    }, 0);
  }

  /* Ancho aproximado de un texto en la partitura. No hace falta precisión tipográfica:
     solo sirve para centrar y para saber si un grupo cabe entre nota y nota. Las letras
     que de verdad descuadran son la I —estrechísima— y la raya del «sin cifra». */
  const ANCHO_LETRA = { I: 0.34, V: 0.72, X: 0.7, T: 0.66, S: 0.62, D: 0.74, '/': 0.34, '—': 1.0 };
  const anchoTexto = (txt, tam) => String(txt).split('')
    .reduce((a, ch) => a + (ANCHO_LETRA[ch] !== undefined ? ANCHO_LETRA[ch] : 0.6) * tam, 0);

  /* ---- Dibujo principal ---- */
  function dibujar(contenedor, ej, estado, alPulsar) {
    const ton = ej.tonalidad;
    /* Acontecimientos: notas y silencios. Las respuestas del alumno van por NOTA, así que
       cada acontecimiento lleva su índice de nota (k) o −1 si es un silencio. */
    const notas = Teoria.eventos(ej.compases).map(e => ({ nota: e.nota === null ? null : Teoria.nota(e.nota), dur: e.dur, ci: e.ci, k: e.k }));
    const numNotas = notas.filter(e => e.k >= 0).length;

    // Medidas horizontales (en unidades del viewBox)
    const MARGEN = 1.5 * SP;
    const ANCHO_CLAVE = 4.2 * SP;
    /* LA ARMADURA PUEDE NO SER LA DEL FRAGMENTO (decisión 185, Diego 29/9/2026). En medio
       de una composición la música ha modulado, así que el fragmento está en un tono y la
       armadura escrita es la del tono de la obra. `ej.armadura` dice cuál se DIBUJA; el
       fragmento sigue estando en `ej.tonalidad`, y las notas se escriben igual. Lo único
       que cambia es qué alteraciones hace falta escribir delante de las notas: un fragmento
       en Do M con armadura de Sol M llevará becuadro en cada fa. Eso sale solo, porque el
       dibujo de alteraciones compara cada nota con la escala de la armadura. */
    const tonArm = (ej.armadura && ej.armadura.tonica) ? ej.armadura : ton;
    const nArm = Teoria.armadura(tonArm);
    const ANCHO_ARM = Math.abs(nArm) * 1.1 * SP + (nArm ? 0.6 * SP : 0);
    const ANCHO_COMPAS = 3.2 * SP;
    const HUECO_BLANCA = 7.5 * SP, HUECO_REDONDA = 9.5 * SP, HUECO_NEGRA = 6 * SP, RELLENO_COMPAS = 1.6 * SP;

    // Medidas verticales
    const pedirRomano = !!estado.pedirRomano;
    const soloLectura = !!estado.soloLectura;
    const sopranoDada = estado.vozDada === 'soprano';     // melodía de soprano: las notas van arriba y el bajo se deduce
    const conSol = Array.isArray(estado.realizacion) || sopranoDada;   // ¿se dibuja el pentagrama de sol?
    // Nota del bajo de un acontecimiento: la escrita (bajo dado) o la deducida de la respuesta (soprano)
    const bajoDe = it => (sopranoDada ? (estado.bajos && estado.bajos[it.k] ? Teoria.nota(estado.bajos[it.k]) : null) : it.nota);
    const numerar = !!estado.numerar;                      // ¿número de cada acorde encima del sistema (revisión del profesor)?
    const etiquetas = Array.isArray(estado.etiquetas) ? estado.etiquetas : [];   // rótulos de tonalidad encima del sistema
    const conSonar = typeof estado.alSonar === 'function' && !soloLectura;   // botón ▶ ENCIMA de cada acorde (suena ese acorde)
    const sinBajo = !!estado.ocultarBajo;                  // Audición: no se ve el bajo (solo casillas y botones ▶)
    const sinSistema = sinBajo && !conSol;                 // no hay ningún pentagrama que dibujar
    /* Grados de la escala sobre el bajo, al modo de Gjerdingen: encima de cada nota del
       bajo, la cifra arábiga del grado que esa nota ocupa en la escala del tono, dentro de
       un circulito negro sin relleno; si el grado va alterado (el ♯4 del V/V, o el de la
       monte cromática), la alteración va dentro con la cifra y el óvalo se ensancha. Sirve
       para enlazar de un vistazo el bajo con la regla de la octava (decisión 52). */
    const conGrados = !!estado.gradosBajo && !sinBajo;
    /* Los circulitos van en una FILA, por encima de todo lo que el bajo ocupe: la nota más
       aguda y, si su plica va hacia arriba, la punta de la plica. A una altura fija se le
       montarían encima a los bajos agudos —un re4 sale tres posiciones por encima del
       pentagrama—, así que la altura de la fila se calcula a partir de la música. Se mide
       en «pasos» (medios espacios sobre la línea inferior): 8 es la línea superior. */
    const TOPE_CABEZA = 2.5 * SP;        // del centro del circulito a lo que haya debajo
    const RADIO_GRADO = 1.05 * SP;
    let pasoTope = 8;
    if (conGrados) notas.forEach(it => {
      const n = bajoDe(it);
      if (!n) return;
      const p = paso(n);
      pasoTope = Math.max(pasoTope, p < 4 ? p + 7 : p);    // plica hacia arriba: 3.5 espacios
    });
    // Subida de la fila por encima de la línea superior del pentagrama
    const SUBIDA_GRADOS = Math.max(1.35 * SP, (pasoTope - 8) * SP / 2 + TOPE_CABEZA);
    const ALTO_GRADOS = conGrados ? SUBIDA_GRADOS + RADIO_GRADO + 0.4 * SP : 0;
    // Banda superior, de arriba abajo: números (configurador), rótulos de tonalidad, botones ▶
    const Y0 = (numerar ? 3 * SP : 0) + (etiquetas.length ? 3 * SP : 0) + (conSonar ? 3 * SP : 0);
    const Y_TOP_SOL = 5 * SP + Y0, Y_BOT_SOL = Y_TOP_SOL + 4 * SP;
    /* Hueco entre los dos pentagramas: el de siempre, salvo que los circulitos pidan más.
       Necesitan ALTO_GRADOS por encima del pentagrama del bajo, y hay que dejar además
       sitio para las plicas que bajan del pentagrama de sol (3.5 espacios). */
    const HUECO_SISTEMA = conGrados ? Math.max(7.5 * SP, ALTO_GRADOS + 4 * SP) : 7.5 * SP;
    const Y_TOP = conSol ? Y_BOT_SOL + HUECO_SISTEMA : 5.5 * SP + Y0 + ALTO_GRADOS; // línea superior del pentagrama del bajo
    const Y_BOT = Y_TOP + 4 * SP;                          // línea inferior
    /* ---- Orden de las filas bajo el pentagrama (decisión 106, Diego) ----
       De arriba abajo: CIFRADO · FUNDAMENTAL · FUNCIÓN · TONALIDAD, cada uno en su banda,
       y en el acorde pivote la casilla se parte en dos apiladas dentro de su propia banda.

       Es el reparto en bandas de la decisión 93 con el orden cambiado, y deja sin efecto el
       de bloques por tonalidad de la decisión 104: aquel ponía juntas las tres lecturas de
       cada tonalidad, pero repetía el renglón de función y el de tonalidad una vez por
       tonalidad y crecía demasiado a lo alto. Probado en pantalla, Diego prefiere las
       bandas. Lo que sí cambia respecto de la 93 es el orden: la cifra arriba, pegada a la
       música, y debajo lo que se deduce de ella —la fundamental, su función y el tono. */
    const filaFun = estado.filaFunciones && estado.filaFunciones.visible ? estado.filaFunciones : null;   // fila «Función» (T · S · D)
    const filaTon = estado.filaTonalidad && estado.filaTonalidad.visible ? estado.filaTonalidad : null;   // fila «Tonalidad» (modulación)
    const marcasB = !!estado.marcasBerklee;                       // flecha de resolución y corchete del II emparentado
    const Y_CASILLA = sinSistema ? Y0 + 1.2 * SP : Y_BOT + 3.4 * SP;   // el cifrado, lo primero
    const ALTO_ROMANO = 3.1 * SP;
    /* La casilla del cifrado se queda más alta que la de la fundamental: se probó a
       igualarlas, pero la cifra hay que encogerla tanto —el 6/4 y el 6/5 van en dos pisos—
       que se pierde de vista, y además esta casilla es donde se pulsa. Lo que sí se iguala
       es la SEPARACIÓN: va pegada al renglón igual que la función a su fundamental, de modo
       que las tres lecturas del acorde forman columna (Diego, 27/9/2026). */
    const ALTO_CASILLA = 4.3 * SP, ANCHO_CASILLA = 4.4 * SP;
    const ESCALA_CIFRA = 0.65;                              // tamaño de las cifras en las casillas (igual que en la paleta)
    /* UN SOLO RADIO para las casillas del análisis (punto 1 del repaso de interfaz,
       27/9/2026). Las cuatro filas llevaban cuatro redondeos distintos —0,8 el cifrado,
       0,7 el romano, 0,6 la función y la tonalidad—, que es la misma incoherencia que
       tenía el CSS con sus ocho radios. Y todas eran demasiado redondas: la esquina blanda
       es lo que hace que una casilla parezca una pegatina y no un campo donde se escribe. */
    const RADIO_CASILLA = 0.5 * SP;

    /* LA MARCA DE LA CORRECCIÓN (decisión 132). Antes el acierto y el fallo teñían el
       RELLENO de la casilla; ahora el relleno es de la FUNCIÓN —color plano— y no puede
       compartirse. Así que la corrección pasa a decirse con el contorno y con un símbolo
       en la esquina: ✓ o ✗. Además de no competir, deja de depender del color, y en
       escala de grises o con cualquier daltonismo se sigue leyendo. */
    const marcaCorreccion = (g, clases, xDer, yArriba) => {
      const ok = clases.includes('bien'), mal = clases.includes('mal');
      if (!ok && !mal) return;
      g.appendChild(el('text', { x: xDer - 0.62 * SP, y: yArriba + 1.25 * SP, 'text-anchor': 'middle',
        class: 'marca-corr ' + (ok ? 'marca-bien' : 'marca-mal') }, ok ? '✓' : '✗'));
    };
    /* La función ya no necesita banda doble para el pivote: cada una de sus dos lecturas va
       con la fundamental de SU tonalidad, o sea en su propio renglón (Diego, 27/9/2026). */
    const ALTO_FUN = 2.7 * SP;
    const ALTO_TON = 2.7 * SP;
    const TAM_ROTULO = 1.6 * SP;              // el nombre de la tonalidad, como las fundamentales
    /* Modulación: cada tonalidad escribe sus grados en un renglón nuevo, un poco más
       abajo; el pivote (dobles[i]) lleva dos grados apilados —el de la tonalidad anterior
       en su renglón y el de la nueva en el siguiente— unidos por dos líneas verticales.
       renglon[i] = renglón de la nota i (el pivote ocupa renglon[i]-1 y renglon[i]). */
    const avisosVoces = Array.isArray(estado.avisosVoces) ? estado.avisosVoces : [];
    const ANCHO_LINEA = 46, ALTO_LINEA = 1.45 * SP;
    const trozos = (txt, ancho) => {
      const palabras = String(txt).split(' '), lineas = [];
      let linea = '';
      palabras.forEach(p => {
        if ((linea + ' ' + p).trim().length > ancho) { if (linea) lineas.push(linea); linea = p; }
        else linea = (linea ? linea + ' ' : '') + p;
      });
      if (linea) lineas.push(linea);
      return lineas;
    };
    const lineasDe = av => trozos(av.texto, ANCHO_LINEA);
    /* Notas señaladas por un error de conducción de voces: clave 'nota:voz' → avisos.
       Al pulsar una de ellas se abre un globo con la explicación (y se resaltan las
       demás notas del mismo aviso). */
    const marcasVoz = new Map();
    avisosVoces.forEach((av, k) => (av.notas || []).forEach(nv => {
      const clave = nv.i + ':' + nv.voz;
      if (!marcasVoz.has(clave)) marcasVoz.set(clave, []);
      if (!marcasVoz.get(clave).includes(k)) marcasVoz.get(clave).push(k);
    }));
    /* Contexto para escribir las alteraciones de la cifra (la sensible del V en menor,
       etc.): el bajo de cada nota y la tonalidad que rige en ella. */
    const tonsNota = (() => { try { return Teoria.tonalidadesPorNota(ej); } catch (e) { return null; } })();
    const ctxCifra = (i, nb) => (nb ? { bajo: nb, ton: (tonsNota && tonsNota[i]) || ton } : null);
    /* El bajo que hace falta para escribir las alteraciones del renglón de la solución es
       el que ya está dibujado: con la solución a la vista, `estado.bajos` trae el del
       modelo, así que `bajoDe(it)` devuelve el del acorde bueno sin más cuentas. Antes se
       recalculaba aparte (`modeloBajo`), y era una fuente más de la que discrepar. */
    const dobles = Array.isArray(estado.dobles) ? estado.dobles : [];
    /* Un renglón por TONALIDAD, no uno nuevo por cada cambio (decisión 83). Antes, cada
       pivote abría un renglón más: un fragmento que sale de Sol M, toma prestado un acorde
       de Re M y vuelve a Sol M gastaba TRES renglones, y el tercero repetía el primero.
       Ahora cada tonalidad tiene el suyo y, al volver a una ya usada, se vuelve a SU
       renglón. Lo normal pasa así a dos —el de partida y el de la modulación—, que es como
       se escribe a mano, donde el sitio entre sistemas es el que es. */
    const renglon = [], renglonAntes = [];
    {
      /* Los bloques se reparten según la lectura DEL ALUMNO (`estado.tonalidadesNota`),
         no según las tonalidades verdaderas. Es la misma razón que los circulitos de grado
         (decisión 56): si se repartieran por las verdaderas, abrir un bloque nuevo en la
         nota 2 le estaría diciendo que ahí hay una modulación, que es justo lo que se le
         pregunta. Cuando la tonalidad viene dada, `tonalidadesNota` es null y se usan las
         verdaderas, que es lo correcto. */
      const tonsBloque = Array.isArray(estado.tonalidadesNota) ? estado.tonalidadesNota : tonsNota;
      const clave = t => t ? (t.tonica + '/' + t.modo) : '?';
      const fila = new Map();
      for (let i = 0; i < numNotas; i++) {
        const tAct = (tonsBloque && tonsBloque[i]) || ton;
        /* En la nota 0 no hay nota anterior de la que sacar el tono de partida; si ESA nota
           es el pivote (decisión 186), el de partida es el del fragmento, y así el acorde
           común abre los dos renglones —el de la tonalidad que se deja y el de la que
           empieza— y cada uno lleva escrito su nombre a la izquierda. */
        const tAnt = i > 0 ? ((tonsBloque && tonsBloque[i - 1]) || ton) : (dobles[0] ? ton : tAct);
        [clave(tAnt), clave(tAct)].forEach(k => { if (!fila.has(k)) fila.set(k, fila.size); });
        renglonAntes.push(fila.get(clave(tAnt)));
        renglon.push(fila.get(clave(tAct)));
      }
    }
    const NUM_RENGLONES = Math.max(1, ...renglon.map(r => r + 1), ...renglonAntes.map(r => r + 1));
    const rotuladas = new Set();     // renglones que ya llevan escrito el nombre de su tonalidad
    /* El PRIMER acorde de cada renglón: ahí, a su izquierda, se escribe el nombre de la
       tonalidad que lo rige. Un pivote inaugura el renglón de la tonalidad nueva (y cierra
       el de la anterior), de modo que puede ser el primero de dos. */
    const rotulosAqui = new Map();
    {
      const vistos = new Set();
      /* También en la nota 0 (decisión 186). Hasta la 183 no se podía modular en la primera
         nota, así que el pivote se descartaba ahí con un `i > 0`; ahora sí se puede, y el
         acorde común ha de partirse en dos lecturas también al principio del fragmento. */
      for (let i = 0; i < numNotas; i++) {
        const esPiv = !!dobles[i];
        (esPiv ? [renglonAntes[i], renglon[i]] : [renglon[i]]).forEach(r => {
          if (vistos.has(r)) return;
          vistos.add(r);
          if (!rotulosAqui.has(i)) rotulosAqui.set(i, []);
          rotulosAqui.get(i).push(r);
        });
      }
    }
    /* Debajo del cifrado, un renglón por tonalidad (decisión 83), y cada renglón lleva DOS
       casillas: la FUNDAMENTAL y, casi pegada debajo, su FUNCIÓN tonal. Las dos lecturas
       del mismo acorde van juntas, y al modular baja el renglón entero —fundamental y
       función—, como ya bajaba antes la fundamental sola. La TONALIDAD queda en una única
       banda al pie, debajo del último renglón (Diego, 27/9/2026).
       Antes la función era una banda propia debajo de TODOS los renglones: se separaba de la
       fundamental a la que se refiere y gastaba alto de más. */
    const HUECO_FUN = 0.3 * SP;                                   // fundamental y función, casi pegadas
    const conRenglones = pedirRomano || !!filaFun;
    const ALTO_MARCAS = marcasB ? 2.5 * SP : 0;                   // la banda de los símbolos de Berklee
    const ALTO_RENGLON = (pedirRomano ? ALTO_ROMANO : 0)
                       + (filaFun ? (pedirRomano ? HUECO_FUN : 0) + ALTO_FUN : 0)
                       + ALTO_MARCAS;
    const PASO_RENGLON = ALTO_RENGLON + 0.5 * SP;
    const Y_RENGLON = Y_CASILLA + ALTO_CASILLA + HUECO_FUN;       // el primer renglón, pegado al cifrado
    const yRenglon = r => Y_RENGLON + r * PASO_RENGLON;           // casilla de la fundamental
    const yRenglonFun = r => yRenglon(r) + (pedirRomano ? ALTO_ROMANO + HUECO_FUN : 0);
    const Y_FIN_RENGLONES = conRenglones
      ? yRenglon(NUM_RENGLONES - 1) + ALTO_RENGLON : Y_CASILLA + ALTO_CASILLA;
    const Y_TON = Y_FIN_RENGLONES + 0.8 * SP;
    const Y_FIN_CASILLAS = filaTon ? Y_TON + ALTO_TON : Y_FIN_RENGLONES;
    const R_SONAR = 1.25 * SP, CY_SONAR = Y0 - 1.6 * SP;   // botones ▶ en la banda superior, justo sobre el sistema
    /* El renglón de la SOLUCIÓN, en naranja, bajo las casillas (decisión 152): función,
       grado y cifra en una sola línea centrada en la nota. Se encoge si no cabe entre nota
       y nota —el caso malo es un VII con una DD—, que es preferible a que se solapen. */
    const Y_SOLUCION = Y_FIN_CASILLAS + 2.4 * SP;          // centro del renglón de la solución
    /* La FUNCIÓN, un punto por encima del grado (Diego, 28/9/2026): en este renglón la
       función es la lectura que manda —es lo que se pregunta primero y lo que ordena la
       frase—, y el grado viene detrás. Ligeramente, no más: 18 contra 16. */
    const TAM_SOL_FUN = 1.8 * SP, TAM_SOL_ROM = 1.6 * SP, ESCALA_SOL = 0.7;
    const HUECO_SOL = 0.5 * SP, ANCHO_SOL_MAX = 5.4 * SP;  // el hueco mínimo entre notas es 6 SP
    /* Si hay errores de conducción de voces, se reserva al pie una banda para el globo de
       explicación, de modo que nunca tape la música. Se calcula la altura del globo más
       alto que puede abrirse (el texto se reparte en líneas de 46 caracteres). */
    /* La banda la comparten los dos globos: el del aviso de voces y el del porqué de la
       solución (decisión 154), así que la reserva mira los dos. */
    const porques = (estado.filaSolucion || []).map(s => (s && s.porque) || '').filter(Boolean)
      .concat((estado.tecnicas || []).map(t => (t && t.porque) ? t.porque + ' ' : '').filter(Boolean));
    const maxLineas = Math.max(
      avisosVoces.reduce((m, av) => Math.max(m, lineasDe(av).length), 0),
      porques.reduce((m, t) => Math.max(m, trozos(t, ANCHO_LINEA).length + 1), 0));
    const ALTO_GLOBO = (avisosVoces.length || porques.length) ? maxLineas * ALTO_LINEA + 3.2 * SP : 0;
    const Y_GLOBO = Y_SOLUCION + 2.6 * SP;                 // borde superior de la banda del globo
    const ALTO_TOTAL = Y_SOLUCION + 2.6 * SP + ALTO_GLOBO;

    // Cálculo de posiciones x
    let x = sinSistema ? MARGEN + 6 * SP : MARGEN + ANCHO_CLAVE + ANCHO_ARM + ANCHO_COMPAS;   // sin sistema queda sitio para «Do M:»
    const barras = [];                                     // x de cada barra de compás
    const xNotas = [];                                     // por acontecimiento
    const xDeNota = [];                                    // por nota (rótulos y números)
    let ev = 0;
    ej.compases.forEach((c, ci) => {
      x += RELLENO_COMPAS;
      c.forEach(([n, d]) => {
        const f = figura(d);
        xNotas.push(x);
        if (notas[ev] && notas[ev].k >= 0) xDeNota[notas[ev].k] = x;
        ev++;
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
    /* Barra doble FINA entre compases: la que separa dos cosas distintas dentro del mismo
       sistema —dos fragmentos en el cuadro del papel, dos cifras en el cuadro de cifrados—.
       Se pide con `estado.barrasDobles`, una lista de índices de compás (Diego, 27/9/2026). */
    const dobleBarra = new Set(Array.isArray(estado.barrasDobles) ? estado.barrasDobles : []);
    if (!sinSistema) barras.forEach((b, ci) => {
      if (!b.final && dobleBarra.has(ci)) {
        svg.appendChild(el('line', { x1: b.x - 0.32 * SP, x2: b.x - 0.32 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
        svg.appendChild(el('line', { x1: b.x + 0.32 * SP, x2: b.x + 0.32 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
        return;
      }
      if (b.final) {
        svg.appendChild(el('line', { x1: b.x - 0.5 * SP, x2: b.x - 0.5 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
        svg.appendChild(el('line', { x1: b.x + 0.1 * SP, x2: b.x + 0.1 * SP, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra gruesa' }));
      } else {
        svg.appendChild(el('line', { x1: b.x, x2: b.x, y1: Y_SISTEMA_TOP, y2: Y_SISTEMA_BOT, class: 'barra' }));
      }
    });

    // Alteración necesaria según la armadura: solo se dibuja si la nota difiere de ella
    const escalaArm = Teoria.escalaNatural(tonArm);
    const altArmadura = letra => { const e = escalaArm.find(x => x.letra === letra); return e ? e.alt : 0; };
    /* Cinco alteraciones, no tres (decisión 114): el doble sostenido y el doble bemol hacen falta
       en cuanto se transporta a sol♯, re♯ o la♯ menor —donde la sensible es fa𝄪, do𝄪 o sol𝄪— y a las
       tonalidades de muchos bemoles. El doble bemol es ANCHO (1,65 espacios, son dos bemoles
       pegados), así que sin su medida propia la nota se le montaba encima. */
    const glifoAlt = alt => (alt >= 2 ? G.dobleSostenido : alt === 1 ? G.sostenido
      : alt <= -2 ? G.dobleBemol : alt === -1 ? G.bemol : G.becuadro);
    const anchoAlt = alt => (alt >= 2 ? ANCHO.dobleSostenido : alt === 1 ? ANCHO.sostenido
      : alt <= -2 ? ANCHO.dobleBemol : alt === -1 ? ANCHO.bemol : ANCHO.becuadro);

    // Números de los acordes (los mismos que la columna # de la tabla de revisión)
    const zonasAcorde = [];
    if (numerar) notas.forEach((it, idx) => {
      if (it.k < 0) return;
      const i = it.k;
      const cx = xNotas[idx] + figura(it.dur).ancho * SP / 2, cy = 1.7 * SP;
      const g = el('g', { class: 'numero-acorde', 'data-indice': i });
      g.appendChild(el('title', {}, 'Acorde ' + (i + 1) + ' (fila ' + (i + 1) + ' de la tabla)'));
      g.appendChild(el('circle', { cx, cy, r: 1.35 * SP }));
      g.appendChild(el('text', { x: cx, y: cy + 0.5 * SP, 'text-anchor': 'middle' }, String(i + 1)));
      if (typeof estado.alPulsarNumero === 'function') {
        g.setAttribute('role', 'button');
        g.addEventListener('click', () => estado.alPulsarNumero(i));
      }
      /* Zona de paso del ratón: toda la COLUMNA del acorde, no solo el circulito, que es
         un blanco de 27 px y obliga a apuntar. La pone solo quien define `alPasarNumero`
         —el configurador, en la vista previa, donde nada más es pulsable—; en la página
         del alumno no existe, y así no tapa las casillas. Transparente, de modo que
         tampoco se ve: lo único que hace es ensanchar el blanco. */
      if (typeof estado.alPasarNumero === 'function') {
        const anchoFig = figura(it.dur).ancho * SP;
        /* La zona va en una lista y se pega al FINAL del dibujo (más abajo), no aquí:
           los circulitos se dibujan antes que el pentagrama, así que una zona puesta
           ahora quedaría debajo de las notas y de las casillas, y el ratón solo la
           encontraría en los huecos. Pegada al final, la columna entera es sensible. */
        zonasAcorde.push({ i, g, x: xNotas[idx] - 0.35 * SP, w: anchoFig + 0.7 * SP });
      }
      svg.appendChild(g);
    });

    // Rótulos de tonalidad encima del sistema ({i, texto, clase}), en la banda superior
    // (debajo de los números si también los hay)
    etiquetas.forEach(et => {
      if (et.i < 0 || et.i >= numNotas || xDeNota[et.i] === undefined) return;
      const cx = xDeNota[et.i] + ANCHO.blanca * SP / 2;
      const cy = (numerar ? 3 * SP : 0) + 1.6 * SP;
      const g = el('g', { class: 'etiqueta-ton ' + (et.clase || '') });
      const ancho = Math.max(4.6 * SP, 0.62 * SP * et.texto.length + 1.2 * SP);
      g.appendChild(el('rect', { x: cx - ancho / 2, y: cy - 1.25 * SP, width: ancho, height: 2.5 * SP, rx: 0.7 * SP }));
      g.appendChild(el('text', { x: cx, y: cy + 0.45 * SP, 'text-anchor': 'middle' }, et.texto));
      svg.appendChild(g);
    });

    /* ---- Grados de la escala sobre el bajo (Gjerdingen) ----
       Un circulito por nota del bajo, centrado sobre ella y justo encima del pentagrama,
       con la cifra arábiga del grado. El grado se mide en la tonalidad que rige en esa
       nota, así que en un fragmento que modula cada tramo cuenta desde su tónica; y en el
       pivote se usa ya la nueva, que es la lectura que se le pide al alumno. */
    if (conGrados) {
      /* estado.tonalidadesNota, si viene, manda: es la lectura del alumno, que puede no
         coincidir con las tonalidades verdaderas mientras no las haya marcado. */
      let tonsNota = Array.isArray(estado.tonalidadesNota) ? estado.tonalidadesNota : null;
      if (!tonsNota) { try { tonsNota = Teoria.tonalidadesPorNota(ej); } catch (e) { tonsNota = null; } }
      const cyG = Y_TOP - SUBIDA_GRADOS;      // la fila, por encima de la nota más aguda del bajo
      notas.forEach(it => {
        if (it.k < 0 || xDeNota[it.k] === undefined) return;
        const n = bajoDe(it);            // en la melodía de soprano, el bajo deducido
        if (!n) return;
        let gr;
        try { gr = Teoria.grado(n, (tonsNota && tonsNota[it.k]) || ton); } catch (e) { return; }
        if (!gr) return;
        const alt = gr.alt > 0 ? '♯' : gr.alt < 0 ? '♭' : '';
        const texto = alt + gr.grado;
        const cx = xDeNota[it.k] + figura(it.dur).ancho * SP / 2;
        /* El circulito del grado, del color de la voz que anota (decisión 169): con el bajo
           dado va en color como él; con el bajo deducido de los acordes del alumno, en
           negro. Estaba siempre en negro, y desde la 167 el bajo del configurador salía en
           color con sus grados en negro, que es justo al revés. */
        const g = el('g', { class: 'grado-bajo' + (estado.bajoDado ? ' dada' : '') });
        const rx = alt ? 1.4 * RADIO_GRADO : RADIO_GRADO;
        g.appendChild(el('ellipse', { cx, cy: cyG, rx, ry: RADIO_GRADO, class: 'grado-circulo' }));
        g.appendChild(el('text', { x: cx, y: cyG + 0.42 * SP, 'text-anchor': 'middle', class: 'grado-cifra' }, texto));
        svg.appendChild(g);
      });
    }

    /* ---- Globo de explicación de un error de conducción de voces ----
       Se dibuja encima de todo, apuntando a la nota pulsada; se cierra al volver a
       pulsarla, al pulsar el globo o al pulsar cualquier otra nota señalada. */
    let globoAbierto = null;
    function cerrarGlobo() {
      if (globoAbierto) { globoAbierto.remove(); globoAbierto = null; }
      svg.querySelectorAll('.voz-mal.activo, .solucion-zona.activo, .tecnica-zona.activo').forEach(e => e.classList.remove('activo'));
    }
    /* El globo se dibuja en la banda reservada al pie, con una línea fina hasta lo que se
       ha señalado. Sirve para dos cosas: los avisos de conducción de voces (borde rojo, se
       abre al pulsar una nota marcada) y, desde la decisión 154, el porqué de cada acorde
       de la solución (borde naranja, se abre al pasar el ratón o tocar su cifrado). */
    function abrirGlobo(cx, cy, lineas, elementos, clase) {
      cerrarGlobo();
      elementos.forEach(e => e.classList.add('activo'));
      const ANCHO_CAR = 4.6, TAM = 11;
      const anchoTexto = Math.max(...lineas.map(l => l.length)) * ANCHO_CAR + 2.2 * SP;
      const alto = lineas.length * ALTO_LINEA + 1.6 * SP;
      const x = Math.min(Math.max(cx - anchoTexto / 2, 0.5 * SP), Math.max(0.5 * SP, ANCHO_TOTAL - anchoTexto - 0.5 * SP));
      const y = Y_GLOBO + 1.3 * SP;
      const g = el('g', { class: 'globo-aviso' + (clase ? ' ' + clase : '') });
      const px = Math.min(Math.max(cx, x + 2 * SP), x + anchoTexto - 2 * SP);
      g.appendChild(el('line', { x1: cx, y1: cy + 1 * SP, x2: px, y2: y, class: 'globo-guia' }));
      g.appendChild(el('rect', { x, y, width: anchoTexto, height: alto, rx: 0.9 * SP, class: 'globo-fondo' }));
      g.appendChild(el('path', { d: 'M ' + (px - 0.9 * SP) + ' ' + y + ' L ' + px + ' ' + (y - 1.3 * SP) + ' L ' + (px + 0.9 * SP) + ' ' + y + ' Z', class: 'globo-fondo globo-punta' }));
      lineas.forEach((l, j) => {
        if (!l) return;
        g.appendChild(el('text', { x: x + 1.1 * SP, y: y + 1.2 * SP + (j + 1) * ALTO_LINEA - 0.4 * SP, 'font-size': TAM, class: 'globo-texto' }, l));
      });
      g.addEventListener('click', ev => { ev.stopPropagation(); cerrarGlobo(); });
      svg.appendChild(g);
      globoAbierto = g;
    }
    /* Marca en rojo una cabeza de nota señalada y anota dónde está, para poner encima
       (al final del dibujo) una zona pulsable del tamaño de la cabeza: las cabezas son
       glifos de una fuente y su caja invisible es mucho mayor que la nota, así que
       pulsar directamente sobre ellas sería impreciso. */
    const marcasPendientes = [];
    function señalar(elemento, i, voz, cx, cy) {
      const clave = i + ':' + voz;
      const indices = marcasVoz.get(clave);
      if (!indices) return false;
      elemento.classList.add('voz-mal');
      elemento.setAttribute('data-voz', clave);
      marcasPendientes.push({ clave, indices, cx, cy });
      return true;
    }
    function dibujarMarcasVoz() {
      if (!marcasPendientes.length) return;
      const capa = el('g', { class: 'marcas-voz' });
      marcasPendientes.forEach(m => {
        const z = el('circle', { cx: m.cx, cy: m.cy, r: 0.62 * SP, class: 'voz-zona', 'data-voz': m.clave, tabindex: 0, role: 'button',
          'aria-label': avisosVoces[m.indices[0]].texto });
        z.appendChild(el('title', {}, avisosVoces[m.indices[0]].texto + (m.indices.length > 1 ? ' (y ' + (m.indices.length - 1) + ' más)' : '')));
        const abrir = ev => {
          ev.stopPropagation();
          if (globoAbierto && z.classList.contains('activo')) { cerrarGlobo(); return; }
          const hermanas = [];
          m.indices.forEach(k => (avisosVoces[k].notas || []).forEach(nv => {
            svg.querySelectorAll('[data-voz="' + nv.i + ':' + nv.voz + '"]').forEach(e => hermanas.push(e));
          }));
          const lineas = [];
          m.indices.forEach((k, j) => { if (j) lineas.push(''); lineasDe(avisosVoces[k]).forEach(l => lineas.push(l)); });
          abrirGlobo(m.cx, m.cy, lineas, hermanas);
        };
        z.addEventListener('click', abrir);
        z.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(ev); } });
        capa.appendChild(z);
      });
      svg.appendChild(capa);
    }
    // Al pulsar fuera de una nota señalada o del propio globo, se cierra
    svg.addEventListener('click', ev => {
      const t = ev.target;
      if (t && typeof t.closest === 'function' && t.closest('.voz-zona, .solucion-zona, .tecnica-zona, .globo-aviso')) return;
      cerrarGlobo();
    });

    // Puntillo: a la derecha de la cabeza; si la nota está en una línea, en el espacio superior
    const puntillo = (g, xDer, p, yBase) => g.appendChild(glifo(xDer + 0.45 * SP, yBase - p * SP / 2 - (p % 2 === 0 ? SP / 2 : 0), G.puntillo, EM, { class: 'nota' }));
    /* Silencio: redonda colgando de la 4.ª línea, blanca sobre la línea central y negra y
       corchea centradas en ella (el puntillo, a su derecha). */
    function silencio(g, dur, xN, yBase) {
      const f = figura(dur);
      const txt = f.base >= 4 ? G.silRedonda : f.base >= 2 ? G.silBlanca : f.base >= 1 ? G.silNegra : G.silCorchea;
      const y = f.base >= 4 ? yBase - 3 * SP : yBase - 2 * SP;
      g.appendChild(glifo(xN, y, txt, EM, { class: 'silencio' }));
      if (f.puntillo) g.appendChild(glifo(xN + 1.5 * SP, yBase - 2.5 * SP, G.puntillo, EM, { class: 'silencio' }));
    }
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
      const cabeza = glifo(xN, y, f.cabeza, EM, { class: 'nota' });
      g.appendChild(cabeza);
      if (f.puntillo) puntillo(g, xN + ancho * SP, p, yBase);
      if (f.plica) {
        const arriba = p < plicaAbajoDesde;
        const xP = arriba ? xN + ancho * SP - 0.07 * SP : xN + 0.07 * SP;
        const y1 = arriba ? y - 0.17 * SP : y + 0.17 * SP;
        const y2 = arriba ? y - 3.5 * SP : y + 3.5 * SP;
        g.appendChild(el('line', { x1: xP, x2: xP, y1, y2, class: 'plica' }));
        if (f.corchete) corchete(g, xP, y2, arriba);
      }
      return cabeza;
    }

    // Melodía de soprano en el pentagrama de sol (cuando no la lleva ya el acorde de la realización)
    if (sopranoDada) notas.forEach((it, idx) => {
      if (it.k < 0) return;
      const i = it.k;
      if (Array.isArray(estado.realizacion) && estado.realizacion[i]) return;
      const g = el('g', { class: 'melodia' + (estado.sopranoDada || estado.extremasDadas ? ' dada' : '') });
      const f = figura(it.dur);
      const cabeza = notaSuelta(g, it.nota, pasoSol(it.nota), Y_BOT_SOL, xNotas[idx], f);
      señalar(cabeza, i, 3, xNotas[idx] + f.ancho * SP / 2, Y_BOT_SOL - pasoSol(it.nota) * SP / 2);
      svg.appendChild(g);
    });

    // Acordes de la realización sobre el pentagrama de sol
    if (Array.isArray(estado.realizacion)) notas.forEach((it, idx) => {
      if (it.k < 0) return;
      const i = it.k;
      const ac = estado.realizacion[i];
      if (!ac) return;
      const xN = xNotas[idx];
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
      /* Las líneas adicionales van SOLO alrededor de las cabezas que las piden. Antes se
         dibujaban de punta a punta del acorde, de modo que, cuando había una segunda, la
         cabeza corrida alargaba también la línea de las demás y el do de abajo salía con
         una raya larguísima (Diego, 27/9/2026). Si dos cabezas comparten línea —una
         segunda por debajo del pentagrama—, la línea abarca las dos. */
      const adicionales = new Map();                       // paso de la línea → [xMin, xMax]
      pasos.forEach((p, k) => {
        const x1 = xN + dx[k], x2 = x1 + ancho * SP;
        const anota = q => {
          const v = adicionales.get(q);
          if (v) { v[0] = Math.min(v[0], x1); v[1] = Math.max(v[1], x2); }
          else adicionales.set(q, [x1, x2]);
        };
        if (p >= 10) for (let q = 10; q <= p; q += 2) anota(q);
        if (p <= -2) for (let q = -2; q >= p; q -= 2) anota(q);
      });
      adicionales.forEach((x, q) => g.appendChild(el('line', {
        x1: x[0] - extra, x2: x[1] + extra,
        y1: Y_BOT_SOL - q * SP / 2, y2: Y_BOT_SOL - q * SP / 2, class: 'linea' })));
      /* Las notas que CAMBIAN respecto a lo que escribió el alumno, en naranja: al ver la
         solución, lo que importa no es la realización entera sino en qué se diferencia de
         la suya (Diego, 28/9/2026). `estado.realizacionCambio[i][k]` lo dice voz a voz. */
      const cambio = estado.realizacionCambio && estado.realizacionCambio[i];
      pasos.forEach((p, k) => {
        const y = Y_BOT_SOL - p * SP / 2;
        /* Con las dos voces dadas (configurador, decisión 167), la voz más aguda del acorde
           es la SOPRANO DEL PROFESOR, no una que elija el motor: va en color, como el bajo. */
        /* En color, lo que NO escribe el alumno (decisión 169): toda la realización cuando
           el ejercicio la da —análisis y audición—, y solo la voz más aguda cuando la
           soprano es la melodía dada (o, en el configurador, la del profesor). */
        const suya = estado.realizacionDada || ((estado.extremasDadas || estado.sopranoDada) && k === pasos.length - 1);
        const cabeza = glifo(xN + dx[k], y, f.cabeza, EM, { class: 'nota' + (cambio && cambio[k] ? ' cambiada' : '') + (suya ? ' dada' : '') });
        g.appendChild(cabeza);
        señalar(cabeza, i, k + 1, xN + dx[k] + ancho * SP / 2, y);
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
    const cxNota = [], bajoNota = [];          // centro y bajo de cada acorde, para las marcas de después
    notas.forEach((it, idx) => {
      const xN = xNotas[idx];
      const f = figura(it.dur);
      const ancho = f.ancho;
      if (it.k < 0) {                                      // silencio: se dibuja en los pentagramas visibles, sin casillas
        if (!sinBajo) { const g = el('g', { class: 'silencio-g' }); silencio(g, it.dur, xN, Y_BOT); svg.appendChild(g); }
        if (conSol) { const g = el('g', { class: 'silencio-g' }); silencio(g, it.dur, xN, Y_BOT_SOL); svg.appendChild(g); }
        return;
      }
      const i = it.k;
      const n = it.nota;
      const nb = bajoDe(it);
      bajoNota[i] = nb;
      if (!sinBajo && nb) {
        const g = el('g', { class: (sopranoDada ? 'bajo-alumno' : 'bajo') + (estado.bajosMal && estado.bajosMal[i] ? ' mal' : '') + (estado.bajoDado ? ' dada' : '') });
        const cabeza = notaSuelta(g, nb, paso(nb), Y_BOT, xN, f);
        señalar(cabeza, i, 0, xN + ancho * SP / 2, Y_BOT - paso(nb) * SP / 2);
        svg.appendChild(g);
      }

      const cx = xN + ancho * SP / 2;
      cxNota[i] = cx;
      const res = estado.corregido && estado.resultados ? estado.resultados[i] : null;
      const activa = estado.activa === i && !estado.corregido && !soloLectura;
      // Verde = acertado en la corrección anterior; se sigue pudiendo tocar (decisión 126)
      const bloq = estado.acertadas && estado.acertadas[i] ? estado.acertadas[i] : { cifra: false, romano: false };

      // Casilla de cifrado (bajo la nota)
      {
        const g = el('g', { 'data-indice': i, 'data-campo': 'cifra', tabindex: 0, role: 'button',
          'aria-label': 'Cifrado de la nota ' + (i + 1) + (sinBajo ? '' : ' (' + Teoria.nombreEs(n) + ')') });
        const clases = ['casilla', 'casilla-cifra'];
        /* ¿La casilla activa es OTRA de la misma nota? Antes iba por lista y se le había
           quedado fuera `funcion2` (llegó con la decisión 95), así que al bajar a la
           función del segundo bloque se encendían dos casillas a la vez, esta y aquella.
           Preguntando al revés no vuelve a pasar cuando aparezca un campo nuevo. */
        const otroCampo = estado.campo !== 'cifra';
        if (activa && !otroCampo) clases.push('activa');
        else if (activa) clases.push('activa-nota');
        const resp = estado.respuestas[i];
        if (res) clases.push(res.okCifra ? 'bien' : 'mal');
        else if (bloq.cifra) clases.push('bien');
        else if (resp) clases.push('llena');
        g.setAttribute('class', clases.join(' '));
        g.appendChild(el('rect', { x: cx - ANCHO_CASILLA / 2, y: Y_CASILLA, width: ANCHO_CASILLA, height: ALTO_CASILLA, rx: RADIO_CASILLA, class: 'fondo' }));
        marcaCorreccion(g, clases, cx + ANCHO_CASILLA / 2, Y_CASILLA);
        if (resp) dibujarCifra(g, resp, cx, Y_CASILLA + ALTO_CASILLA / 2, ESCALA_CIFRA, null, ctxCifra(i, nb));
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
      /* ¿Parte este acorde su función en dos (pivote)? Hace falta saberlo ya aquí: las barras
         verticales que unen las dos lecturas se dibujan con la fundamental y han de bajar
         hasta la última casilla de función. */
      const dobleFun = !!(filaFun && filaFun.dobles && filaFun.dobles[i]
                          && filaFun.celdas2 && filaFun.celdas2[i]);
      const pivoteRomano = pedirRomano && !!dobles[i];

      if (pedirRomano) {
        const esPivote = !!dobles[i];
        const partes = esPivote ? ['romano', 'romano2'] : ['romano'];
        const x0 = cx - ANCHO_CASILLA / 2;
        /* En el pivote, los dos grados van en el renglón de SU tonalidad: el de la anterior
           en renglonAntes[i] y el de la nueva en renglon[i]. Al volver a una tonalidad ya
           usada, el de la nueva puede quedar ARRIBA del de la anterior; la casilla que
           queda arriba es la que se estira hasta la de abajo, sea cuál sea (decisión 83). */
        const rArriba = Math.min(renglonAntes[i], renglon[i]);
        const rAbajo = Math.max(renglonAntes[i], renglon[i]);
        partes.forEach((campo, k) => {
          const r = esPivote ? (k === 0 ? renglonAntes[i] : renglon[i]) : renglon[i];
          const y0 = yRenglon(r);
          /* Cada casilla mide lo suyo: la de arriba ya no se estira hasta la de abajo, porque
             entre las dos va ahora la función de su propia tonalidad. Lo que ata las dos
             lecturas del pivote son las barras verticales. */
          const alto = ALTO_ROMANO;
          const g = el('g', { 'data-indice': i, 'data-campo': campo, tabindex: 0, role: 'button',
            'aria-label': 'Sonido fundamental de la nota ' + (i + 1) + (sinBajo ? '' : ' (' + Teoria.nombreEs(n) + ')') + (esPivote ? (k ? ' en la tonalidad nueva' : ' en la tonalidad anterior') : '') });
          const clases = ['casilla', 'casilla-romano'];
          if (esPivote) clases.push(k ? 'pivote-abajo' : 'pivote-arriba');
          const bloqueadaAqui = !!bloq[campo];
          const lista = campo === 'romano2' ? estado.romanos2 : estado.romanos;
          const rom = lista ? lista[i] : null;
          if (activa && estado.campo === campo) clases.push('activa');
          else if (activa) clases.push('activa-nota');
          const okAqui = res ? (campo === 'romano2' ? res.okRomano2 : res.okRomano) : null;
          if (res) clases.push(okAqui ? 'bien' : 'mal');
          else if (bloqueadaAqui) clases.push('bien');
          else if (rom) clases.push('llena');
          g.setAttribute('class', clases.join(' '));
          g.appendChild(el('rect', { x: x0, y: y0, width: ANCHO_CASILLA, height: alto, rx: esPivote ? 0 : RADIO_CASILLA, class: 'fondo' }));
          marcaCorreccion(g, clases, x0 + ANCHO_CASILLA, y0);
          g.appendChild(el('text', { x: cx, y: y0 + ALTO_ROMANO / 2 + 0.75 * SP, 'text-anchor': 'middle', class: rom ? 'romano' : 'interrogante' }, rom || (estado.corregido ? '' : '?')));
          if (!soloLectura) {
            g.addEventListener('click', () => alPulsar(i, campo));
            g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, campo); } });
          }
          svg.appendChild(g);
        });
        if (esPivote) {
          // Las dos líneas verticales que unen los dos grados del pivote: | I | sobre | IV |
          const yA = yRenglon(rArriba);
          const yB = dobleFun ? yRenglonFun(rAbajo) + ALTO_FUN : yRenglon(rAbajo) + ALTO_ROMANO;
          [x0, x0 + ANCHO_CASILLA].forEach(x => svg.appendChild(el('line', { x1: x, x2: x, y1: yA - 0.3 * SP, y2: yB + 0.3 * SP, class: 'pivote-barra' })));
        }
      }

      /* Nombre de la tonalidad que rige el renglón, a su izquierda y justo antes de su
         primer acorde: «Do M:» delante del primero de todos y «Sol M:» delante del primero
         que ya está en Sol M. No es un rótulo insípido como «Función:» —dice de qué tono se
         leen esos grados—, así que va del tamaño de las fundamentales (Diego, 27/9/2026).
         Se escribe una vez por renglón: al volver a una tonalidad ya rotulada, no se repite. */
      if (conRenglones && filaTon && filaTon.celdas) {
        (rotulosAqui.get(i) || []).forEach(r => {
          /* En la primera nota hecha pivote nacen LOS DOS renglones a la vez (decisión 186),
             y la fila «Tonalidad» solo trae un texto por nota —el del tono que empieza—. El
             renglón que se deja lleva el tono de partida del fragmento, que es el suyo. */
          const departida = i === 0 && !!dobles[0] && r === renglonAntes[0] && r !== renglon[0];
          const celda = departida ? { texto: Teoria.nombreCorto(ton) } : (filaTon.celdas[i] || {});
          if (rotuladas.has(r) || !celda.texto || celda.texto === '¿?') return;
          rotuladas.add(r);
          /* En su propia casilla, más clarita que las demás: así se ve que pertenece al
             renglón de las fundamentales y no es un rótulo suelto al margen. */
          const yR = pedirRomano ? yRenglon(r) : yRenglonFun(r);
          const altoR = pedirRomano ? ALTO_ROMANO : ALTO_FUN;
          const anchoR = Math.max(ANCHO_CASILLA, celda.texto.length * 0.58 * TAM_ROTULO + 0.9 * SP);
          const xD = cx - ANCHO_CASILLA / 2 - 0.55 * SP;        // pegada a la izquierda del primer acorde
          const gR = el('g', { class: 'casilla casilla-rotulo-ton' });
          gR.appendChild(el('rect', { x: xD - anchoR, y: yR, width: anchoR, height: altoR, rx: RADIO_CASILLA, class: 'fondo' }));
          gR.appendChild(el('text', { x: xD - anchoR / 2, y: yR + altoR / 2 + 0.6 * SP,
            'text-anchor': 'middle', class: 'rotulo-ton' }, celda.texto));
          svg.appendChild(gR);
        });
      }

      /* Fila «Función»: T · S · D de cada acorde (dada por el profesor o pedida al alumno).
         En el acorde PIVOTE se parte en dos, una por tonalidad (decisión 95): arriba la
         función en el tono de partida y abajo en el de llegada —el mismo acorde es tónica
         en uno y subdominante en el otro—, unidas por las mismas barras verticales que
         llevan los grados. */
      if (filaFun) {
        const partesFun = dobleFun ? ['funcion', 'funcion2'] : ['funcion'];
        const xF = cx - ANCHO_CASILLA / 2;
        partesFun.forEach((campo, k) => {
          const celda = (campo === 'funcion2' ? filaFun.celdas2[i] : filaFun.celdas[i]) || {};
          const editable = filaFun.editable && !celda.fija;
          /* En el pivote, cada función va en el renglón de SU tonalidad, justo debajo de la
             fundamental que le corresponde. */
          const yF = yRenglonFun(dobleFun ? (k === 0 ? renglonAntes[i] : renglon[i]) : renglon[i]);
          const g = el('g', { 'data-indice': i, 'data-campo': campo, tabindex: editable ? 0 : -1, role: editable ? 'button' : 'note',
            'aria-label': 'Función tonal de la nota ' + (i + 1) + (dobleFun ? (k ? ' en la tonalidad nueva' : ' en la tonalidad anterior') : '') });
          const clases = ['casilla', 'casilla-fun'];
          if (dobleFun) clases.push(k ? 'pivote-abajo' : 'pivote-arriba');
          if (!editable) clases.push('fija');
          if (celda.clase) clases.push(celda.clase);
          if (activa && editable && estado.campo === campo) clases.push('activa');
          else if (activa && editable) clases.push('activa-nota');
          if (celda.texto) clases.push('llena');
          const fun = String(celda.texto || '').trim();
          /* Cada función, su tinta (decisión 130): T azul pizarra, S ciruela, D oro. El color
             va en la CLASE; el tono, en la hoja de estilo. La casilla se queda neutra y el
             color vive en la letra y en una banda fina debajo: así el verde y el carmín de
             la corrección tienen la casilla entera para ellos y no compiten con la función. */
          if (/^(T|S|D|DD)$/.test(fun)) clases.push('fun-' + fun);
          g.setAttribute('class', clases.join(' '));
          g.appendChild(el('rect', { x: xF, y: yF, width: ANCHO_CASILLA, height: ALTO_FUN, rx: dobleFun ? 0 : RADIO_CASILLA, class: 'fondo' }));
          g.appendChild(el('text', { x: cx, y: yF + ALTO_FUN / 2 + 0.45 * SP, 'text-anchor': 'middle', class: celda.texto ? 'fun' : 'interrogante-ton' }, celda.texto || (editable && !estado.corregido ? '?' : '')));
          marcaCorreccion(g, clases, xF + ANCHO_CASILLA, yF);
          if (editable && !soloLectura) {
            g.addEventListener('click', () => alPulsar(i, campo));
            g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, campo); } });
          }
          svg.appendChild(g);
        });
        /* Las barras del pivote las dibuja ya la fundamental, que abarca los dos renglones
           enteros; solo hacen falta aquí si este cuadro no lleva fundamentales. */
        if (dobleFun && !pivoteRomano) {
          const yA = yRenglonFun(Math.min(renglonAntes[i], renglon[i]));
          const yB = yRenglonFun(Math.max(renglonAntes[i], renglon[i])) + ALTO_FUN;
          [xF, xF + ANCHO_CASILLA].forEach(x => svg.appendChild(
            el('line', { x1: x, x2: x, y1: yA - 0.3 * SP, y2: yB + 0.3 * SP, class: 'pivote-barra' })));
        }
        if (i === 0) svg.appendChild(el('text', { x: cx - ANCHO_CASILLA / 2 - 0.7 * SP, y: yRenglonFun(renglon[0]) + ALTO_FUN / 2 + 0.55 * SP, 'text-anchor': 'end', class: 'renglon-ton' }, 'Función:'));
      }

      // Fila «Tonalidad»: desde qué nota rige cada tonalidad (modulación)
      if (filaTon) {
        const celda = filaTon.celdas[i] || {};
        const editable = filaTon.editable && i > 0 && !celda.fija;
        /* Una casilla vacía que además no se responde no dice nada, y repartida por los
           bloques de cada tonalidad llenaba la página de recuadros huecos. Cuando la
           tonalidad viene DADA solo se dibujan las notas donde se declara una.
           Ojo: aquí no vale un `return`, que se saltaría el botón ▶ y la solución modelo
           de esta misma nota; la condición envuelve el dibujo y ya está. */
        if (editable || celda.texto) {
        const g = el('g', { 'data-indice': i, 'data-campo': 'tonalidad', tabindex: editable ? 0 : -1, role: editable ? 'button' : 'note',
          'aria-label': 'Tonalidad desde la nota ' + (i + 1) });
        const clases = ['casilla', 'casilla-ton'];
        if (!editable) clases.push('fija');
        if (celda.clase) clases.push(celda.clase);
        if (activa && editable && estado.campo === 'tonalidad') clases.push('activa');
        else if (activa && editable) clases.push('activa-nota');
        if (celda.texto) clases.push('llena');
        g.setAttribute('class', clases.join(' '));
        g.appendChild(el('rect', { x: cx - ANCHO_CASILLA / 2, y: Y_TON, width: ANCHO_CASILLA, height: ALTO_TON, rx: RADIO_CASILLA, class: 'fondo' }));
        g.appendChild(el('text', { x: cx, y: Y_TON + ALTO_TON / 2 + 0.55 * SP, 'text-anchor': 'middle', class: celda.texto ? 'ton' : 'interrogante-ton' }, celda.texto || (editable && !estado.corregido ? '·' : '')));
        if (editable && !soloLectura) {
          g.addEventListener('click', () => alPulsar(i, 'tonalidad'));
          g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alPulsar(i, 'tonalidad'); } });
        }
        svg.appendChild(g);
        }
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

      /* EL RENGLÓN DE LA SOLUCIÓN (decisión 152): bajo cada nota que falló, lo que la
         solución pone en ella —función · grado · cifra—, en naranja y en una sola línea.
         Lo que se escribe aquí lo calcula `app.js` a partir de los mismos pares con los que
         realiza el pentagrama, de modo que este cifrado y esos acordes no pueden discrepar.
         Las casillas de arriba, mientras, siguen diciendo solo lo que respondió el alumno. */
      const sol = estado.filaSolucion ? estado.filaSolucion[i] : null;
      if (sol) {
        const partes = [];
        if (sol.funcion) partes.push({ txt: sol.funcion, tam: TAM_SOL_FUN, clase: 'sol-fun', ancho: anchoTexto(sol.funcion, TAM_SOL_FUN) });
        if (sol.romano) partes.push({ txt: sol.romano, tam: TAM_SOL_ROM, clase: 'sol-romano', ancho: anchoTexto(sol.romano, TAM_SOL_ROM) });
        if (sol.cifra) partes.push({ cifra: sol.cifra, ancho: anchoCifra(sol.cifra, ESCALA_SOL, ctxCifra(i, nb)) });
        if (partes.length) {
          // Ojo con el nombre: `ancho` ya existe arriba y es el de la cabeza de nota.
          const anchoSol = partes.reduce((a, p) => a + p.ancho, 0) + HUECO_SOL * (partes.length - 1);
          const escala = Math.min(1, ANCHO_SOL_MAX / anchoSol);
          const gm = el('g', { class: 'solucion-cifrado',
            transform: 'translate(' + cx.toFixed(2) + ',' + Y_SOLUCION.toFixed(2) + ') scale(' + escala.toFixed(3) + ')' });
          let xp = -anchoSol / 2;
          partes.forEach(p => {
            const cp = xp + p.ancho / 2;
            if (p.cifra) dibujarCifra(gm, p.cifra, cp, 0, ESCALA_SOL, null, ctxCifra(i, nb));
            else gm.appendChild(el('text', { x: cp, y: 0.36 * p.tam, 'text-anchor': 'middle',
              'font-size': p.tam, class: p.clase }, p.txt));
            xp += p.ancho + HUECO_SOL;
          });
          svg.appendChild(gm);
          /* EL PORQUÉ, EN UN GLOBO (decisión 154): con el ratón encima del cifrado naranja
             o tocándolo con el dedo. La zona sensible es un rectángulo transparente aparte,
             porque el renglón lleva `pointer-events: none` —si no, el ratón tropezaría con
             cada glifo y el globo parpadearía al pasar entre ellos—. Con el dedo no hay
             «pasar por encima», así que el toque lo abre y lo cierra. */
          if (sol.porque) {
            const anchoZ = Math.max(anchoSol * escala, 3 * SP) + SP, altoZ = 3 * SP;
            const z = el('rect', { x: cx - anchoZ / 2, y: Y_SOLUCION - altoZ / 2, width: anchoZ, height: altoZ,
              class: 'solucion-zona', tabindex: 0, role: 'button',
              'aria-label': 'Por qué la solución pone este acorde: ' + sol.porque });
            z.appendChild(el('title', {}, sol.porque));
            const lineas = trozos(sol.porque, ANCHO_LINEA);
            const abrir = () => abrirGlobo(cx, Y_SOLUCION + SP, lineas, [z], 'globo-solucion');
            /* Ratón y dedo no se pueden tratar igual. El móvil sintetiza un `mouseenter`
               antes del toque, así que con `mouseenter` + `click` el dedo abría el globo y
               lo cerraba en el mismo gesto: parpadeo y nada más. Se mira de qué es el
               puntero: si es ratón, abre al entrar y cierra al salir, y el clic no hace nada
               —ya está abierto—; si es dedo (o lápiz), el toque abre y el siguiente cierra. */
            let porRaton = false;
            z.addEventListener('pointerenter', ev => { porRaton = ev.pointerType === 'mouse'; if (porRaton) abrir(); });
            z.addEventListener('pointerleave', ev => { if (porRaton) cerrarGlobo(); porRaton = false; });
            /* El foco abre el globo SOLO cuando viene del teclado. Al tocar con el dedo, el
               `pointerdown` también da el foco, y entonces el globo se abría aquí y el clic
               que venía detrás lo cerraba: otra vez el parpadeo. `:focus-visible` es justo
               la distinción que hace falta; si el navegador no la conoce, se abre igual. */
            z.addEventListener('focus', () => {
              let soloTeclado = true;
              try { soloTeclado = z.matches(':focus-visible'); } catch (e) { soloTeclado = true; }
              if (soloTeclado) abrir();
            });
            z.addEventListener('blur', cerrarGlobo);
            z.addEventListener('click', ev => {
              ev.stopPropagation();
              if (porRaton) return;
              if (globoAbierto && z.classList.contains('activo')) cerrarGlobo(); else abrir();
            });
            svg.appendChild(z);
          }
        }
      }
    });

    /* ---- LOS CUADROS DE LAS TÉCNICAS ARMÓNICAS (decisión 155, Diego 28/9/2026) ----
       Cada prolongación y cada cadencia, encerrada en un cuadro que abarca DE ARRIBA ABAJO
       lo que la forma: los acordes en el pentagrama y sus casillas, que es como Diego lo
       pidió. El rótulo va en el centro del cuadro, sobre una pastilla opaca para que no se
       confunda con la música, y es él —no el cuadro entero— quien recoge el ratón y el
       dedo: si el rectángulo capturase el puntero, no se podrían pulsar las casillas.
       Dos técnicas seguidas COMPARTEN el acorde de cierre, así que sus cuadros se pisarían;
       se reparten en carriles, y cada carril se mete un poco hacia dentro. */
    const tecnicas = Array.isArray(estado.tecnicas) ? estado.tecnicas : [];
    if (tecnicas.length && cxNota.length) {
      const TAM_TEC = 1.2 * SP;
      /* Primero se MIDE todo y después se dibuja, porque el carril no lo decide el cuadro
         sino lo que de verdad ocupa la técnica: el cuadro O su rótulo, lo que sobresalga
         más. Con el carril decidido solo por el cuadro, dos pastillas vecinas se tocaban
         aunque los cuadros no llegaran a rozarse. */
      const piezas = [];
      const t0 = p => p.t.desde, t1 = p => p.t.hasta;
      tecnicas.forEach(t => {
        const a = cxNota[t.desde], b = cxNota[t.hasta];
        if (a === undefined || b === undefined || b <= a) return;
        const x1 = a - ANCHO_CASILLA / 2 - 0.45 * SP;
        const x2 = b + ANCHO_CASILLA / 2 + 0.45 * SP;
        const anchoR = anchoTexto(t.nombre, TAM_TEC);
        /* Un suelo al encogido: en un cuadro de dos acordes, ajustar el rótulo a lo ancho
           lo dejaba en letra de mosca. Por debajo de 0,8 se deja que la pastilla ASOME por
           los lados —es opaca, así que se lee igual—, y del carril se encarga la medida. */
        const escala = Math.max(0.8, Math.min(1, (x2 - x1 - 1.2 * SP) / Math.max(anchoR + 1.6 * SP, 1)));
        const anchoP = (anchoR + 1.6 * SP) * escala;
        const cxR = (x1 + x2) / 2;
        piezas.push({ t, x1, x2, anchoR, escala, cxR,
          izq: Math.min(x1, cxR - anchoP / 2), der: Math.max(x2, cxR + anchoP / 2) });
      });
      const finCarril = [];                       // hasta dónde llega lo ocupado en cada carril
      const capa = el('g', { class: 'tecnicas' });
      piezas.forEach((p, k) => {
        let carril = 0;
        while (finCarril[carril] !== undefined && finCarril[carril] >= p.izq - 0.3 * SP) carril++;
        finCarril[carril] = p.der;
        const dentro = carril * 0.55 * SP;
        const x1 = p.x1 + dentro, x2 = p.x2 - dentro;
        /* Los topes se ALTERNAN (Diego, 28/9/2026): uno un poco más alto, el siguiente a la
           altura de siempre, y así. Con todos a la misma altura, dos cuadros seguidos se
           leían como uno solo; escalonados se distingue dónde acaba cada uno. */
        const y1 = (sinSistema ? Y_CASILLA - SP : Y_SISTEMA_TOP - 0.8 * SP) - (k % 2 === 0 ? 1.1 * SP : 0);
        /* Y por abajo el cuadro llega hasta el CIFRADO NARANJA de la solución, «pues es
           precisamente este el que cumple la técnica que describe el cuadro» (Diego). Solo
           cuando lo hay: si el alumno acertó esos acordes no hay renglón naranja debajo, y
           el cuadro no ha de bajar a encerrar un hueco vacío. */
        let hastaSolucion = false;
        for (let q = t0(p); q <= t1(p) && !hastaSolucion; q++)
          if (estado.filaSolucion && estado.filaSolucion[q]) hastaSolucion = true;
        const y2 = (hastaSolucion ? Y_SOLUCION + 1.7 * SP : Y_FIN_CASILLAS + 0.5 * SP);
        const t = p.t;
        const g = el('g', { class: 'tecnica tecnica-' + (t.clase || 'prolongacion') });
        g.appendChild(el('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, rx: 0.8 * SP, class: 'tecnica-caja' }));
        /* El rótulo no va al centro geométrico del cuadro —ahí caía sobre el pentagrama del
           bajo y tapaba las notas—, sino al HUECO entre el sistema y las casillas, que es el
           único sitio del cuadro donde no hay nada dibujado. Cada carril baja un escalón. */
        const hueco = sinSistema ? (y1 + y2) / 2 : (Y_SISTEMA_BOT + Y_CASILLA) / 2;
        const cyR = Math.min(Math.max(hueco + carril * 2.4 * SP, y1 + 1.2 * SP), y2 - 1.2 * SP);
        const gr = el('g', { class: 'tecnica-rotulo',
          transform: 'translate(' + p.cxR.toFixed(2) + ',' + cyR.toFixed(2) + ') scale(' + p.escala.toFixed(3) + ')' });
        gr.appendChild(el('rect', { x: -(p.anchoR / 2 + 0.8 * SP), y: -1.05 * SP,
          width: p.anchoR + 1.6 * SP, height: 2.1 * SP, rx: 0.7 * SP, class: 'tecnica-pastilla' }));
        gr.appendChild(el('text', { x: 0, y: 0.45 * SP, 'text-anchor': 'middle', 'font-size': TAM_TEC, class: 'tecnica-texto' }, t.nombre));
        capa.appendChild(g);
        g.appendChild(gr);
        if (t.porque) {
          // La zona sensible cubre la pastilla; el globo cuelga de ella, como el del porqué
          const anchoP = (p.anchoR + 1.6 * SP) * p.escala, altoP = 2.1 * SP * p.escala;
          const z = el('rect', { x: p.cxR - anchoP / 2, y: cyR - altoP / 2, width: anchoP, height: altoP, rx: 0.7 * SP,
            class: 'tecnica-zona', tabindex: 0, role: 'button', 'aria-label': t.nombre + '. ' + t.porque });
          z.appendChild(el('title', {}, t.porque));
          const lineas = [t.nombre].concat(trozos(t.porque, ANCHO_LINEA));
          const abrir = () => abrirGlobo(p.cxR, y2, lineas, [z], 'globo-tecnica');
          let porRaton = false;
          z.addEventListener('pointerenter', ev => { porRaton = ev.pointerType === 'mouse'; if (porRaton) abrir(); });
          z.addEventListener('pointerleave', ev => { if (porRaton) cerrarGlobo(); porRaton = false; });
          z.addEventListener('focus', () => {
            let soloTeclado = true;
            try { soloTeclado = z.matches(':focus-visible'); } catch (e) { soloTeclado = true; }
            if (soloTeclado) abrir();
          });
          z.addEventListener('blur', cerrarGlobo);
          z.addEventListener('click', ev => {
            ev.stopPropagation();
            if (porRaton) return;
            if (globoAbierto && z.classList.contains('activo')) cerrarGlobo(); else abrir();
          });
          g.appendChild(z);
        }
      });
      svg.appendChild(capa);
    }

    /* ---- Los símbolos de Berklee (prueba, Diego 27/9/2026) ----
       Los mismos dos signos que usa la armonía de Berklee —y con ellos el «Mapping Tonal
       Harmony» de mDecks— debajo de los grados; no se inventa ninguno nuevo:
         · FLECHA continua: la dominante que resuelve BAJANDO UNA QUINTA. Vale para la
           dominante de la tonalidad (V → I) y para las secundarias (V/V → V), que es
           justamente lo que Berklee quiere que se vea: la cadena de quintas.
         · CORCHETE: el acorde que prepara a esa dominante una quinta por encima —el «II
           emparentado»—, atado a ella. Así, II7 · V7 · I sale con corchete sobre II–V y
           flecha de V a I.
       Lo que Berklee NO marca se queda sin marca: la resolución rota, el IV que va al V
       (no está a una quinta) y el VII, que no baja de quinta. */
    if (marcasB) {
      const gradoDe = i => {
        const c = estado.respuestas[i], nb = bajoNota[i];
        if (!c || !nb) return null;
        try { return Teoria.gradoFundamental(c, nb, (tonsNota && tonsNota[i]) || ton); } catch (e) { return null; }
      };
      const esDominante = i => {
        const c = estado.respuestas[i];
        return !!c && (Teoria.DOMINANTES.includes(c) || gradoDe(i) === 5);
      };
      const bajaQuinta = (a, b) => a != null && b != null && ((a - 1 + 3) % 7) + 1 === b;
      const punta = (x, y, vx, vy, L) => {
        const m = Math.hypot(vx, vy) || 1, ux = vx / m, uy = vy / m, px = -uy, py = ux;
        const bx = x - ux * L, by = y - uy * L, a = L * 0.45;
        return `M ${x} ${y} L ${bx + px * a} ${by + py * a} L ${bx - px * a} ${by - py * a} Z`;
      };
      const flecha = (x1, x2, y) => {
        const cxm = (x1 + x2) / 2, dip = y + 1.5 * SP;
        svg.appendChild(el('path', { d: `M ${x1} ${y} Q ${cxm} ${dip} ${x2} ${y}`, class: 'marca-flecha' }));
        svg.appendChild(el('path', { d: punta(x2, y, x2 - cxm, y - dip, 0.62 * SP), class: 'marca-punta' }));
      };
      const corchete = (x1, x2, y) => {
        const t = 0.5 * SP;
        svg.appendChild(el('path', { d: `M ${x1} ${y - t} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - t}`, class: 'marca-corchete' }));
      };
      /* El 6/4 CADENCIAL es dominante a todos los efectos: su sexta y su cuarta son
         apoyaturas de la quinta y la tercera del V, no un acorde de tónica. Por eso el
         corchete lo atraviesa: II – I6/4 – V lleva corchete del II al V, igual que II – V
         (Diego, 27/9/2026). Se reconoce por la cifra 64 seguida de una dominante. */
      const dominanteDesde = j => {
        if (j >= numNotas) return -1;
        if (esDominante(j)) return j;
        if (estado.respuestas[j] === '64' && j + 1 < numNotas && esDominante(j + 1)) return j + 1;
        return -1;
      };
      for (let i = 0; i + 1 < numNotas; i++) {
        if (cxNota[i] == null) continue;
        const g1 = gradoDe(i);
        // Flecha: la dominante que baja de quinta a su resolución, que es el acorde siguiente
        if (esDominante(i) && cxNota[i + 1] != null && bajaQuinta(g1, gradoDe(i + 1))) {
          const yB = yRenglon(Math.max(renglon[i], renglon[i + 1])) + ALTO_RENGLON - ALTO_MARCAS;
          flecha(cxNota[i], cxNota[i + 1], yB + 1.25 * SP);
          continue;
        }
        // Corchete: el II emparentado con su dominante, aunque entre los dos se cuele el 6/4
        const d = dominanteDesde(i + 1);
        if (d < 0 || esDominante(i) || cxNota[d] == null) continue;
        if (!bajaQuinta(g1, gradoDe(d))) continue;
        const yB = yRenglon(Math.max(renglon[i], renglon[d])) + ALTO_RENGLON - ALTO_MARCAS;
        corchete(cxNota[i] - ANCHO_CASILLA / 2, cxNota[d] + ANCHO_CASILLA / 2, yB + 0.65 * SP);
      }
    }

    dibujarMarcasVoz();

    /* Zonas de paso del ratón por columna, lo último de todo para que nada las tape.
       Transparentes y sin dibujo: solo ensanchan el blanco del circulito del acorde.
       Cada una reenvía al grupo del número, de modo que pulsar la columna sigue
       llevando a la fila de la tabla, igual que pulsar el circulito. */
    zonasAcorde.forEach(z => {
      const r = el('rect', { x: z.x, y: 0, width: z.w, height: ALTO_TOTAL, class: 'zona-acorde' });
      r.addEventListener('mouseenter', () => estado.alPasarNumero(z.i, z.g));
      r.addEventListener('mouseleave', () => estado.alPasarNumero(-1, null));
      if (typeof estado.alPulsarNumero === 'function') r.addEventListener('click', () => estado.alPulsarNumero(z.i));
      svg.appendChild(r);
    });

    contenedor.innerHTML = '';
    contenedor.appendChild(svg);
    return svg;
  }

  /* Dibuja una cifra suelta como SVG pequeño (para los botones de la paleta).
     Con ctx = {bajo, ton} escribe además sus alteraciones (la revisión del profesor,
     donde cada chip corresponde a una nota concreta). */
  function iconoCifra(id, alto = 44, ctx = null) {
    const svg = el('svg', { viewBox: `0 0 ${5 * SP} ${5 * SP}`, width: alto, height: alto, class: 'icono-cifra', 'aria-hidden': 'true' });
    const g = el('g');
    dibujarCifra(g, id, 2.5 * SP, 2.5 * SP, 0.85, null, ctx);
    svg.appendChild(g);
    return svg;
  }

  return { dibujar, iconoCifra, figura, SP };
})();
