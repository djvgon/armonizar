/* =====================================================================
   teoria.js — Núcleo teórico: notas, tonalidades, grados y cifrados.

   Este archivo no sabe nada de la pantalla. Solo contiene "verdades
   musicales" que los demás módulos consultan:

     · Teoria.nota('F#3')            → objeto nota {letra, alt, octava}
     · Teoria.grado(nota, tonalidad) → {grado: 1..7, alt}
     · Teoria.CIFRADOS               → catálogo de cifrados (id → datos)
     · Teoria.vocesSuperiores(id, bajo, tonalidad) → notas del acorde
     · Teoria.canonizar('6/3')       → '6'

   Convenciones:
     · Las notas se escriben al estilo anglosajón con octava científica:
       'C3' = do3 (el do de la clave de fa, segundo espacio), 'F#2', 'Bb3'.
       El do central es C4.
     · La tonalidad es {tonica: 'C', modo: 'mayor'} o {tonica: 'A', modo: 'menor'}.
     · En modo menor, el grado del bajo se mide respecto a la escala
       NATURAL (sol♯ es «7̂ elevado»); las voces superiores se construyen
       sobre la escala ARMÓNICA (sensible elevada).
   ===================================================================== */

const Teoria = (() => {

  const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const NOMBRE_ES = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
  const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const ALT_TEXTO = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };

  /* ---------- Notas ---------- */

  // 'F#3' → {letra:'F', alt:1, octava:3}
  function nota(txt) {
    if (typeof txt === 'object') return txt;
    const m = /^([A-Ga-g])(#{1,2}|b{1,2}|n)?(-?\d)$/.exec(txt.trim());
    if (!m) throw new Error('Nota no reconocida: ' + txt);
    const letra = m[1].toUpperCase();
    let alt = 0;
    if (m[2] === '#') alt = 1; else if (m[2] === '##') alt = 2;
    else if (m[2] === 'b') alt = -1; else if (m[2] === 'bb') alt = -2;
    return { letra, alt, octava: parseInt(m[3], 10) };
  }

  // 'sol♯2', 'Sib3', 'do3', 'fa#' (octava 3 por defecto) → 'G#2', 'Bb3', 'C3', 'F#3'
  const ES_A_LETRA = { do: 'C', re: 'D', mi: 'E', fa: 'F', sol: 'G', la: 'A', si: 'B' };
  function notaEs(txt, octavaDefecto = 3) {
    const m = /^(do|re|mi|fa|sol|la|si|[a-g])\s*(♯♯|##|♯|#|♭♭|bb|♭|b)?\s*(-?\d)?$/i.exec(txt.trim());
    if (!m) throw new Error('Nota no reconocida: «' + txt + '»');
    const l = m[1].toLowerCase();
    const letra = ES_A_LETRA[l] || l.toUpperCase();
    let alt = '';
    if (m[2]) {
      const a = m[2];
      alt = (a === '♯' || a === '#') ? '#' : (a === '♯♯' || a === '##') ? '##' : (a === '♭' || a === 'b') ? 'b' : 'bb';
    }
    return letra + alt + (m[3] !== undefined ? m[3] : String(octavaDefecto));
  }

  // Texto de un bajo → compases. Sintaxis: notas separadas por espacios y
  // compases por «|». Duración con sufijo: nada = blanca, «r» = redonda,
  // «n» = negra, «c» = corchea; un punto añade el puntillo
  // (do3 re3 | mi3 do3 | sol3r | do3. | la3n si3n do4n). Sin octava se toma la
  // 3 (bajo) o la que se indique (4 para una melodía de soprano).
  const DURACION_SUFIJO = { r: 4, '': 2, n: 1, c: 0.5 };
  function bajoDesdeTexto(txt, octavaDefecto = 3) {
    const compases = [];
    const errores = [];
    txt.split(/\|/).forEach((trozo, ci) => {
      const notas = [];
      trozo.trim().split(/\s+/).filter(Boolean).forEach(tok => {
        const m = /^(.*?)([rncRNC])?(\.)?$/.exec(tok);
        let dur = DURACION_SUFIJO[(m[2] || '').toLowerCase()];
        if (m[3]) dur *= 1.5;
        try { notas.push([notaEs(m[1], octavaDefecto), dur]); }
        catch (e) { errores.push('Compás ' + (ci + 1) + ': ' + e.message); }
      });
      if (notas.length) compases.push(notas);
    });
    return { compases, errores };
  }

  // Duración en negras → sufijo de texto ('r', '', 'n', 'c', con '.' si lleva puntillo).
  function sufijoDuracion(d) {
    const base = d >= 4 ? 4 : d >= 2 ? 2 : d >= 1 ? 1 : 0.5;
    const suf = base >= 4 ? 'r' : base >= 2 ? '' : base >= 1 ? 'n' : 'c';
    return suf + (d >= base * 1.5 ? '.' : '');
  }

  // Compases → texto (para volcar en el editor un bajo importado).
  function textoDesdeBajo(compases) {
    return compases.map(c => c.map(([n, d]) => nombreEs(nota(n), true) + sufijoDuracion(d)).join(' ')).join(' | ');
  }

  function texto(n) {                       // {C,1,3} → 'C#3'
    const a = n.alt === 1 ? '#' : n.alt === 2 ? '##' : n.alt === -1 ? 'b' : n.alt === -2 ? 'bb' : '';
    return n.letra + a + n.octava;
  }

  function nombreEs(n, conOctava = false) { // {C,1,3} → 'do♯' (o 'do♯3')
    return NOMBRE_ES[n.letra] + ALT_TEXTO[String(n.alt)] + (conOctava ? n.octava : '');
  }

  function midi(n) { return 12 * (n.octava + 1) + SEMITONOS[n.letra] + n.alt; }
  function clase(n) { return ((midi(n) % 12) + 12) % 12; }           // clase de altura 0..11

  // Índice diatónico: cuenta de "pasos de letra" desde C0. Sirve para
  // colocar la nota en el pentagrama y para medir intervalos por letra.
  function indice(n) { return n.octava * 7 + LETRAS.indexOf(n.letra); }

  // Nota situada 'pasos' letras por encima de 'n', con la alteración
  // necesaria para que diste exactamente 'semitonos'.
  function transportar(n, pasos, semitonos) {
    const idx = indice(n) + pasos;
    const letra = LETRAS[((idx % 7) + 7) % 7];
    const octava = Math.floor(idx / 7);
    const objetivo = midi(n) + semitonos;
    const base = 12 * (octava + 1) + SEMITONOS[letra];
    return { letra, alt: objetivo - base, octava };
  }

  /* ---------- Tonalidades y escalas ---------- */

  // Escala mayor sobre una tónica, como 7 notas {letra, alt} (octava irrelevante).
  const PATRON_MAYOR = [0, 2, 4, 5, 7, 9, 11];
  const PATRON_MENOR_NAT = [0, 2, 3, 5, 7, 8, 10];
  const PATRON_MENOR_ARM = [0, 2, 3, 5, 7, 8, 11];

  function escalaCon(tonica, patron) {
    const t = nota(tonica + '4');
    return patron.map((st, i) => {
      const n = transportar(t, i, st);
      return { letra: n.letra, alt: n.alt };
    });
  }

  function escalaNatural(ton) {             // referencia para medir el GRADO del bajo
    return escalaCon(ton.tonica, ton.modo === 'menor' ? PATRON_MENOR_NAT : PATRON_MAYOR);
  }
  function escalaVoces(ton) {               // referencia para construir las VOCES superiores
    return escalaCon(ton.tonica, ton.modo === 'menor' ? PATRON_MENOR_ARM : PATRON_MAYOR);
  }

  // Número de alteraciones en la armadura (+ sostenidos, − bemoles).
  function armadura(ton) {
    const esc = escalaNatural(ton);
    // La armadura del relativo mayor: contar sostenidos/bemoles de la escala natural.
    return esc.reduce((s, n) => s + n.alt, 0);
  }

  // Grado del bajo respecto a la escala natural: {grado:1..7, alt: desviación}
  function grado(n, ton) {
    n = nota(n);
    const esc = escalaNatural(ton);
    const i = esc.findIndex(e => e.letra === n.letra);
    return { grado: i + 1, alt: n.alt - esc[i].alt };
  }

  function nombreTonalidad(ton) {
    const t = nota(ton.tonica + '4');
    const nombre = nombreEs(t);
    return ton.modo === 'menor' ? nombre + ' menor' : nombre.charAt(0).toUpperCase() + nombre.slice(1) + ' mayor';
  }
  // 'Sol M' / 'mi m' (para casillas y etiquetas)
  function nombreCorto(ton) {
    const nombre = nombreEs(nota(ton.tonica + '4'));
    return ton.modo === 'menor' ? nombre + ' m' : nombre.charAt(0).toUpperCase() + nombre.slice(1) + ' M';
  }
  const mismaTonalidad = (a, b) => !!a && !!b && a.tonica === b.tonica && a.modo === b.modo;

  /* ---------- Tonalidades por armadura y tonalidades vecinas ---------- */

  // Tónica de la tonalidad mayor / menor con n alteraciones (+ sostenidos, − bemoles)
  const TONICAS_MAYOR = { '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F', '0': 'C', '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'B', '6': 'F#', '7': 'C#' };
  const TONICAS_MENOR = { '-7': 'Ab', '-6': 'Eb', '-5': 'Bb', '-4': 'F', '-3': 'C', '-2': 'G', '-1': 'D', '0': 'A', '1': 'E', '2': 'B', '3': 'F#', '4': 'C#', '5': 'G#', '6': 'D#', '7': 'A#' };
  function tonalidadPorArmadura(n, modo) {
    const t = (modo === 'menor' ? TONICAS_MENOR : TONICAS_MAYOR)[String(n)];
    return t ? { tonica: t, modo: modo === 'menor' ? 'menor' : 'mayor' } : null;
  }

  // Las cinco tonalidades vecinas (misma armadura o una alteración de diferencia),
  // en orden pedagógico: desde mayor, V, IV, relativo menor, II, III; desde menor,
  // relativo mayor, v (dominante menor), VII, iv, VI.
  function tonalidadesVecinas(ton) {
    const n = armadura(ton);
    const orden = ton.modo === 'menor'
      ? [[n, 'mayor'], [n + 1, 'menor'], [n + 1, 'mayor'], [n - 1, 'menor'], [n - 1, 'mayor']]
      : [[n + 1, 'mayor'], [n - 1, 'mayor'], [n, 'menor'], [n - 1, 'menor'], [n + 1, 'menor']];
    return orden.map(([k, m]) => tonalidadPorArmadura(k, m)).filter(Boolean);
  }

  /* ---------- Modulación ----------
     Un ejercicio puede llevar ej.modulaciones = [{nota: i, tonalidad}, …]: desde la
     nota i (el acorde pivote, que pertenece a las dos tonalidades) rige la tonalidad
     nueva. Sin modulaciones, rige ej.tonalidad en todas las notas. */

  function tonalidadesPorNota(ej) {
    let n = 0;
    ej.compases.forEach(c => { n += c.length; });
    const out = new Array(n).fill(ej.tonalidad);
    (ej.modulaciones || []).slice().sort((a, b) => a.nota - b.nota).forEach(m => {
      for (let i = Math.max(0, m.nota); i < n; i++) out[i] = m.tonalidad;
    });
    return out;
  }

  // Clases de altura «propias» de una tonalidad: escala natural más, en menor,
  // la sensible elevada (armónica).
  function clasesPropias(ton) {
    const cl = new Set();
    escalaNatural(ton).forEach(e => cl.add(((SEMITONOS[e.letra] + e.alt) % 12 + 12) % 12));
    escalaVoces(ton).forEach(e => cl.add(((SEMITONOS[e.letra] + e.alt) % 12 + 12) % 12));
    return cl;
  }

  // ¿El acorde (cifra sobre el bajo, construido en tonA) es común a tonA y tonB?
  function acordeComun(id, bajo, tonA, tonB) {
    bajo = nota(bajo);
    const clases = [clase(bajo), ...vocesSuperiores(id, bajo, tonA).map(clase)];
    const a = clasesPropias(tonA), b = clasesPropias(tonB);
    return clases.every(c => a.has(c) && b.has(c));
  }

  // ¿Tiene el acorde alguna nota ajena a la tonalidad ton?
  function acordeAjeno(id, bajo, tonAcorde, ton) {
    bajo = nota(bajo);
    const propias = clasesPropias(ton);
    return [clase(bajo), ...vocesSuperiores(id, bajo, tonAcorde).map(clase)].some(c => !propias.has(c));
  }

  /* ---------- Cifrados ----------
     Cada cifrado tiene:
       etiqueta    : texto corto para botones y mensajes
       filas       : cómo se dibuja, de arriba abajo; cada fila es una
                     lista de signos: {num:'6'} {num:'5', tachado:true}
                     {signo:'+'} {signo:'#'} …
       descripcion : explicación breve para el alumno
       voces(bajo, ton) : notas de las voces superiores (sin el bajo)

     Las voces se calculan de dos maneras:
       · "diatónicas": intervalos sobre el bajo tomando la alteración de
         la escala de la tonalidad (armónica en menor).
       · "de dominante": cifrados con + o con numeral tachado (V7 en sus
         inversiones). Se localiza la fundamental por letra y se construye
         sobre ella un acorde de séptima de dominante (3ªM, 5ªJ, 7ªm); el
         bajo se mantiene tal cual (así, sobre ♭6̂ en menor, +6 produce la
         sexta aumentada francesa, como en la RO descendente en menor).
  ------------------------------------------------ */

  // Intervalo diatónico sobre el bajo: 'num' letras por encima, alteración de la escala.
  function diatonico(bajo, num, esc) {
    const idx = indice(bajo) + (num - 1);
    const letra = LETRAS[((idx % 7) + 7) % 7];
    const e = esc.find(x => x.letra === letra);
    return { letra, alt: e.alt, octava: Math.floor(idx / 7) };
  }

  function vocesDiatonicas(nums) {
    return (bajo, ton) => {
      const esc = escalaVoces(ton);
      return nums.map(n => diatonico(bajo, n, esc));
    };
  }

  // Séptima de dominante cuya fundamental está 'pasosFund' letras sobre el bajo
  // (por ejemplo +6: fundamental a la 4ª; +4: a la 2ª; 6/5̸: a la 6ª = 3ª por debajo).
  // 'miembros' indica qué miembros del acorde forman las voces superiores
  // (1 = fundamental, 3, 5, 7); el bajo ya aporta el miembro restante.
  function vocesDominante(pasosFund, miembros) {
    return (bajo, ton) => {
      const esc = escalaVoces(ton);
      const fund = diatonico(bajo, pasosFund, esc);
      const st = { 1: 0, 3: 4, 5: 7, 7: 10 };
      const pasos = { 1: 0, 3: 2, 5: 4, 7: 6 };
      return miembros.map(m => transportar(fund, pasos[m], st[m]));
    };
  }

  const CIFRADOS = {
    '53': {
      etiqueta: '—', nombre: '5/3 (sin cifra)',
      filas: [[{ signo: '—' }]],
      descripcion: 'Tríada en estado fundamental (3ª y 5ª). No lleva cifra.',
      voces: vocesDiatonicas([3, 5])
    },
    '6': {
      etiqueta: '6', nombre: '6',
      filas: [[{ num: '6' }]],
      descripcion: 'Tríada en primera inversión (3ª y 6ª).',
      voces: vocesDiatonicas([3, 6])
    },
    '64': {
      etiqueta: '6/4', nombre: '6/4',
      filas: [[{ num: '6' }], [{ num: '4' }]],
      descripcion: 'Tríada en segunda inversión (4ª y 6ª).',
      voces: vocesDiatonicas([4, 6])
    },
    '+6': {
      etiqueta: '+6', nombre: '+6',
      filas: [[{ signo: '+' }, { num: '6' }]],
      descripcion: 'V7 en segunda inversión (3ª, 4ª y 6ª; la 6ª es sensible).',
      voces: vocesDominante(4, [1, 3, 7])
    },
    '65': {
      etiqueta: '6/5', nombre: '6/5',
      filas: [[{ num: '6' }], [{ num: '5' }]],
      descripcion: 'Acorde de séptima en primera inversión (3ª, 5ª y 6ª).',
      voces: vocesDiatonicas([3, 5, 6])
    },
    '43': {
      etiqueta: '4/3', nombre: '4/3',
      filas: [[{ num: '4' }], [{ num: '3' }]],
      descripcion: 'Acorde de séptima en segunda inversión (3ª, 4ª y 6ª diatónicas; por ejemplo II4/3 sobre el grado 6).',
      voces: vocesDiatonicas([3, 4, 6])
    },
    '65d': {
      etiqueta: '6/5̸', nombre: '6/5 tachado',
      filas: [[{ num: '6' }], [{ num: '5', tachado: true }]],
      descripcion: 'V7 en primera inversión: 3ª, 5ª disminuida (quinta falsa) y 6ª.',
      voces: vocesDominante(6, [1, 5, 7])
    },
    '+4': {
      etiqueta: '+4', nombre: '+4',
      filas: [[{ signo: '+' }, { num: '4' }]],
      descripcion: 'V7 en tercera inversión (2ª, 4ª aumentada y 6ª). El + marca la 4ª aumentada; el tachado se reserva a los intervalos disminuidos.',
      voces: vocesDominante(2, [1, 3, 5])
    },
    '7': {
      etiqueta: '7', nombre: '7',
      filas: [[{ num: '7' }]],
      descripcion: 'Séptima diatónica en estado fundamental (por ejemplo II7 antes de la cadencia).',
      voces: vocesDiatonicas([3, 5, 7])
    },
    '7+': {
      etiqueta: '7/+', nombre: '7/+',
      filas: [[{ num: '7' }], [{ signo: '+' }]],
      descripcion: 'V7 en estado fundamental: séptima con la sensible como tercera.',
      voces: vocesDominante(1, [3, 5, 7])
    },
    '9': {
      etiqueta: '9', nombre: '9',
      filas: [[{ num: '9' }]],
      descripcion: 'Acorde de novena en estado fundamental.',
      voces: vocesDiatonicas([3, 5, 7, 9])
    }
  };

  // Posición de la fundamental respecto al bajo, en letras (0 = el bajo es la fundamental,
  // 5 = una 6ª por encima = 3ª por debajo, etc.). Sirve para nombrar el acorde y para
  // reconocer inversiones distintas de un mismo acorde.
  const FUNDAMENTAL = { '53': 0, '6': 5, '64': 3, '+6': 3, '65': 5, '43': 3, '65d': 5, '+4': 1, '7': 0, '7+': 0, '9': 0 };
  const DOMINANTES = ['7+', '+6', '+4', '65d'];   // cifrados que denotan V7 (fundamental e inversiones)
  // Parejas (diatónico, marcado) que producen las mismas notas cuando el
  // intervalo diatónico ya es el de dominante: entonces vale el marcado.
  const MARCADOS = { '65': '65d', '43': '+6', '7': '7+' };

  function vocesSuperiores(id, bajo, ton) {
    const c = CIFRADOS[id];
    if (!c) throw new Error('Cifrado desconocido: ' + id);
    return c.voces(nota(bajo), ton);
  }

  // Fundamental del acorde (objeto nota) para un cifrado sobre un bajo.
  function fundamental(id, bajo, ton) {
    bajo = nota(bajo);
    const pasos = FUNDAMENTAL[id];
    if (pasos === 0) return bajo;
    const voces = vocesSuperiores(id, bajo, ton);
    const idxObj = indice(bajo) + pasos;
    return voces.find(v => (indice(v) - idxObj) % 7 === 0) || bajo;
  }

  /* ---- Grado de la fundamental (números romanos) ----
     El alumno indica, además de la cifra, sobre qué grado de la escala se
     construye la fundamental del acorde. Se deriva de la cifra: para +6 sobre
     re en Do mayor la fundamental es sol → V; para 6 sobre re, si → VII.
     Se escribe siempre en mayúsculas (I … VII), sin distinguir el modo del
     acorde; los grados elevados o rebajados (sol♯ en la menor) cuentan como
     el grado natural (VII). */
  const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  function gradoFundamental(id, bajo, ton) {
    return grado(fundamental(id, bajo, ton), ton).grado;
  }
  function romano(id, bajo, ton) {
    return ROMANOS[gradoFundamental(id, bajo, ton) - 1];
  }

  /* ---- Funciones tonales (cuadro verde de Diego) ----
     T = I y VI · S = II, IV y VI · D = V, VII y V7. El VI es T o S según el contexto:
     S si va hacia la dominante, T en los demás casos (cadencia rota incluida). */
  const FUNCIONES = ['T', 'S', 'D'];
  const FUNCION_DE = { I: ['T'], II: ['S'], III: ['T'], IV: ['S'], V: ['D'], VI: ['T', 'S'], VII: ['D'] };
  const NOMBRE_FUNCION = { T: 'tónica', S: 'subdominante', D: 'dominante' };
  // Funciones posibles de un grado (la primera es la habitual)
  function funcionesDe(romano) { return (FUNCION_DE[romano] || ['T']).slice(); }
  // Función habitual, dado el grado siguiente (para el VI: S si sigue una dominante)
  function funcionDe(romano, romanoSiguiente) {
    const f = funcionesDe(romano);
    if (romano === 'VI' && romanoSiguiente && funcionesDe(romanoSiguiente)[0] === 'D') return 'S';
    return f[0];
  }

  /* ---- Bajo a partir de la fundamental y la cifra ----
     La cifra dice qué nota del acorde está en el bajo (FUNDAMENTAL[id] = letras del
     bajo a la fundamental): —/7/7+/9 la fundamental; 6, 6/5, 6/5̸ la tercera; 6/4,
     4/3, +6 la quinta; +4 la séptima. Devuelve {letra, alt} sin octava, o null si la
     cifra no puede darse sobre esa fundamental en la tonalidad. En menor, el bajo
     sobre el 7.º grado lleva la sensible elevada salvo en el III. */
  function bajoDe(romano, id, ton) {
    const k = ROMANOS.indexOf(romano);
    const pasos = FUNDAMENTAL[id];
    if (k < 0 || pasos === undefined) return null;
    // Convenciones del cifrado: las cifras de dominante (7/+, 6/5̸, +6, +4) son el V7
    // (y +6 también el II como dominante secundaria del V, decisión 9); sobre el V la
    // séptima se escribe siempre marcada, nunca 7, 6/5 o 4/3 (decisión 11).
    if (DOMINANTES.includes(id) && !(romano === 'V' || (romano === 'II' && id === '+6'))) return null;
    if (romano === 'V' && MARCADOS[id]) return null;
    const gradoBajo = ((k - pasos) % 7 + 7) % 7;               // 0..6
    const esc = escalaNatural(ton), escV = escalaVoces(ton);
    const e = gradoBajo === 6 && romano !== 'III' ? escV[6] : esc[gradoBajo];
    const bajo = { letra: e.letra, alt: e.alt, octava: 3 };
    // Comprobación: la cifra sobre ese bajo ha de dar de verdad ese grado como fundamental
    try { if (romano_(id, bajo, ton) !== romano) return null; } catch (err) { return null; }
    return { letra: e.letra, alt: e.alt };
  }
  function romano_(id, bajo, ton) { return ROMANOS[grado(fundamental(id, bajo, ton), ton).grado - 1]; }

  // Conjunto de clases de altura del acorde completo (bajo incluido), como cadena ordenada.
  function claveAcorde(id, bajo, ton) {
    bajo = nota(bajo);
    const cls = new Set([clase(bajo), ...vocesSuperiores(id, bajo, ton).map(clase)]);
    return [...cls].sort((a, b) => a - b).join(',');
  }

  // Equivalencias de escritura → identificador canónico.
  const ALIAS = {
    '': '53', '—': '53', '-': '53', '3': '53', '5': '53', '53': '53', '5/3': '53', '8': '53', '8/5/3': '53',
    '6': '6', '63': '6', '6/3': '6',
    '64': '64', '6/4': '64',
    '65': '65', '6/5': '65', '653': '65', '6/5/3': '65',
    '65d': '65d', '6/5d': '65d', '6/5̸': '65d', '6/5-': '65d',
    '43': '43', '4/3': '43', '643': '43', '6/4/3': '43',
    '+6': '+6', '+6/4/3': '+6', '6/+4/3': '+6', '+4/3': '+6',
    '+4': '+4', '4+': '+4', '+4/2': '+4', '6/+4/2': '+4', '+42': '+4', '2': '+4', '4/2': '+4',
    '7': '7', '75': '7', '753': '7', '7/5/3': '7', '7/5': '7',
    '7+': '7+', '7/+': '7+', '+7': '7+', '7/5/+': '7+', '7/+/5': '7+',
    '9': '9'
  };
  function canonizar(txt) {
    const k = String(txt).replace(/\s+/g, '');
    return ALIAS.hasOwnProperty(k) ? ALIAS[k] : null;
  }

  return {
    LETRAS, nota, notaEs, bajoDesdeTexto, textoDesdeBajo, sufijoDuracion, texto, nombreEs, midi, clase, indice, transportar,
    escalaNatural, escalaVoces, armadura, grado, nombreTonalidad, nombreCorto, mismaTonalidad,
    tonalidadPorArmadura, tonalidadesVecinas, tonalidadesPorNota, clasesPropias, acordeComun, acordeAjeno,
    CIFRADOS, DOMINANTES, MARCADOS, ROMANOS, FUNDAMENTAL, vocesSuperiores, fundamental, gradoFundamental, romano, claveAcorde, canonizar,
    FUNCIONES, NOMBRE_FUNCION, funcionesDe, funcionDe, bajoDe
  };
})();
