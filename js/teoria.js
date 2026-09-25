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
       sobre la escala ARMÓNICA (sensible elevada), pero **solo en los acordes
       de dominante** (V y VII): en los demás la 7.ª se queda natural, para que
       el III no salga aumentado ni el I con séptima mayor.
   ===================================================================== */

const Teoria = (() => {

  const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const NOMBRE_ES = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
  const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  /* En el TEXTO —«fa♯♯3», «si♭♭2»— la doble alteración se escribe con dos signos sencillos y no
     con 𝄪 y 𝄫 (decisión 114): esos dos caracteres no los tiene ninguna fuente de sistema y salían
     como un cuadradito. En el PENTAGRAMA sí van los signos de verdad, que los dibuja Bravura. */
  const ALT_TEXTO = { '-2': '♭♭', '-1': '♭', '0': '', '1': '♯', '2': '♯♯' };

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
  // compases por «|»; un guion bajo «_» es un silencio (con los mismos sufijos de
  // duración: «_», «_n», «_c», «_r»). Duración con sufijo: nada = blanca, «r» = redonda,
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
        if (m[1] === '_') { notas.push([null, dur]); return; }      // silencio
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
    return compases.map(c => c.map(([n, d]) => (n === null ? '_' : nombreEs(nota(n), true)) + sufijoDuracion(d)).join(' ')).join(' | ');
  }
  /* ---- Fuerza métrica de cada nota ----
     3 = primer tiempo del compás; 2 = mitad del compás (solo en los compases binarios:
     el 3.º de 4/4, el 2.º de 2/4); 1 = otro tiempo; 0 = a contratiempo. En los compases
     ternarios (3/4, 3/2) no hay mitad, así que el 2.º y el 3.er tiempo pesan igual: un
     acorde que entre en el 2.º y se prolongue al 3.º no es una síncopa armónica.
     La síncopa armónica es pasar a una parte MÁS FUERTE sin cambiar de acorde. */
  /* Fuerza métrica de cada nota: 3 el primer tiempo del compás, 2 la mitad (solo en los
     compases binarios), 1 los demás tiempos, 0 lo que cae a contratiempo.

     La posición se cuenta DENTRO DE CADA COMPÁS, no sobre un reloj corrido desde el
     principio (decisión 81). Con un reloj corrido, una ANACRUSA —un primer compás
     incompleto— desplazaba todo lo que venía detrás y el motor tomaba por primer tiempo
     notas que no lo eran. Un compás corto al final no desplaza nada, porque no hay nada
     detrás; el de una anacrusa sí, y por eso sus notas se alinean por la DERECHA: una
     anacrusa de una negra en 3/4 cae en el tercer tiempo, que es débil, como debe ser. */
  function fuerzasMetricas(compases, compas) {
    const c = compas && compas.length === 2 ? compas : [4, 4];
    const porCompas = (c[0] * 4) / c[1];          // duración del compás, en negras
    const unidad = 4 / c[1];                      // duración de un tiempo, en negras
    const mitad = c[0] % 2 === 0 ? porCompas / 2 : null;
    const out = [];
    (compases || []).forEach((cp, k) => {
      const dura = cp.reduce((a, x) => a + (x[1] || 0), 0);
      // Anacrusa: el primer compás, si viene corto, se pega al final del compás
      let t = (k === 0 && dura < porCompas - 0.01) ? porCompas - dura : 0;
      cp.forEach(([n, d]) => {
        const p = ((t % porCompas) + porCompas) % porCompas;
        let f = 0;
        if (Math.abs(p) < 0.01) f = 3;
        else if (mitad !== null && Math.abs(p - mitad) < 0.01) f = 2;
        else if (Math.abs(p % unidad) < 0.01 || Math.abs((p % unidad) - unidad) < 0.01) f = 1;
        if (n !== null) out.push(f);
        t += d;
      });
    });
    return out;
  }
  // ¿La nota i está en parte más fuerte que la anterior? (entonces el acorde ha de cambiar)
  const pideCambio = (fuerzas, i) => i > 0 && !!fuerzas && fuerzas[i] > fuerzas[i - 1];

  /* ¿En este compás se divide el tiempo? (decisión 89)
     Lo que decide no es la figura de una nota suelta, sino el nivel en que se mueve la
     armonía: aquí cada nota del bajo lleva un acorde, así que la figura más corta DEL
     COMPÁS es el ritmo armónico de ese compás. Si es más breve que el tiempo —corcheas
     en un 2/4—, el tiempo está dividido y la cabeza de cada tiempo pasa a ser fuerte
     respecto de lo que la rodea. Devuelve un valor por nota, como `fuerzasMetricas`. */
  function divideElTiempo(compases, compas) {
    const c = compas && compas.length === 2 ? compas : [4, 4];
    const unidad = 4 / c[1];
    const out = [];
    (compases || []).forEach(cp => {
      const duras = cp.filter(x => x[0] !== null).map(x => x[1] || 0);
      const divide = duras.length ? Math.min.apply(null, duras) < unidad - 0.01 : false;
      cp.forEach(x => { if (x[0] !== null) out.push(divide); });
    });
    return out;
  }

  /* ¿Cabe aquí el 6/4 cadencial? (decisión 87, criterio de Diego, 25/9/2026)
     El 6/4 cadencial retrasa la dominante, y para que se oiga como retraso y no como un
     tropiezo tiene que caer en parte fuerte:
       · compás binario → solo tiempo fuerte: el primero y, en el de cuatro tiempos, el
         tercero (la mitad del compás). En 2/4, donde la mitad del compás ES el segundo
         tiempo y es débil, solo el primero.
       · compás ternario → además, el segundo o el tercero.
       · nunca a contratiempo.
     Los compases compuestos (6/8, 12/8) se cuentan como binarios: la cabeza de cada
     tiempo con puntillo es lo que marca `fuerzasMetricas` con 3 y 2.

     Y una corrección de Diego (decisión 89): «fuerte» es relativo al nivel en que se
     mueve la armonía. Si el ritmo armónico divide el tiempo —corcheas en un 2/4—, la
     cabeza de CADA tiempo es fuerte respecto de las notas que la rodean, y el 6/4 cabe
     también ahí. Lo que sigue sin caber, en ningún compás, es el contratiempo. */
  function cabeSeisCuatro(compas, fuerza, divide) {
    if (fuerza === null || fuerza === undefined) return true;   // sin métrica que consultar
    if (fuerza === 3) return true;                              // primer tiempo, siempre
    if (fuerza === 0) return false;                             // a contratiempo, nunca
    if (divide) return fuerza >= 1;                             // el tiempo dividido sube todo un nivel
    const c = compas && compas.length === 2 ? compas : [4, 4];
    if (c[0] === 3 || c[0] === 9) return fuerza >= 1;           // ternario: también 2.º y 3.er tiempo
    if (c[0] === 2) return false;                               // dos tiempos: solo el primero
    return fuerza >= 2;                                         // 4/4, 6/8, 12/8: la mitad del compás
  }

  /* ---- Acontecimientos: notas y silencios ----
     Un acontecimiento del bajo o de la melodía es [nombre, duración]; con nombre null es un
     silencio. Las respuestas del alumno van por NOTA, así que cada acontecimiento lleva su
     índice de nota (k) o −1 si es un silencio. Un silencio rompe la frase: la nota anterior
     se comporta como final y la siguiente como comienzo. */
  const esSilencio = ev => !ev || ev[0] === null || ev[0] === undefined;
  function eventos(compases) {
    const out = [];
    let k = 0;
    (compases || []).forEach((c, ci) => c.forEach(([n, d]) => {
      const sil = n === null || n === undefined;
      out.push({ nota: sil ? null : n, dur: d, ci, k: sil ? -1 : k++ });
    }));
    return out;
  }
  const notasDeCompases = compases => eventos(compases).filter(e => e.k >= 0).map(e => e.nota);
  const numeroDeNotas = compases => notasDeCompases(compases).length;
  // cortes[k] = true si justo antes de la nota k hay un silencio (o es la primera)
  function cortes(compases) {
    const out = [];
    let silencio = true;
    eventos(compases).forEach(e => {
      if (e.k < 0) { silencio = true; return; }
      out[e.k] = silencio;
      silencio = false;
    });
    return out;
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
  /* Menor melódica (Diego, 21/9/2026): «los grados 6 y 7 de la escala menor no tienen
     afinación fija: cuando ascienden se toman del modo mayor (elevados medio tono) y
     cuando descienden, de la escala natural». La función del acorde no cambia, solo su
     cualidad: en la menor, con 6 elevado, el II es si–re–fa♯ y el IV, re–fa♯–la. Una
     tonalidad con la marca {melodica: true} construye las voces con el 6 elevado. */
  const PATRON_MENOR_MEL = [0, 2, 3, 5, 7, 9, 11];

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
    if (ton.modo !== 'menor') return escalaCon(ton.tonica, PATRON_MAYOR);
    if (ton.natural) return escalaCon(ton.tonica, PATRON_MENOR_NAT);
    return escalaCon(ton.tonica, ton.melodica ? PATRON_MENOR_MEL : PATRON_MENOR_ARM);
  }
  /* ¿Caben todas estas notas en esta tonalidad? Se admiten las tres formas del menor
     (natural, armónica y melódica) y el 4.º grado ELEVADO, que es la sensible de la
     dominante —la del V/V— y no saca al fragmento de su tonalidad (decisión 46). */
  function cabeEnTonalidad(notas, t) {
    if (!t || !t.tonica) return false;
    let clases;
    try {
      clases = new Set();
      const mete = e => clases.add(clase(Object.assign({ octava: 3 }, e)));
      escalaNatural(t).forEach(mete);
      escalaVoces(t).forEach(mete);
      if (t.modo === 'menor') escalaVoces({ tonica: t.tonica, modo: 'menor', melodica: true }).forEach(mete);
      const cuarta = escalaNatural(t)[3];
      if (cuarta) mete({ letra: cuarta.letra, alt: cuarta.alt + 1 });
    } catch (e) { return false; }
    return notas.every(n => clases.has(clase(n)));
  }

  /* Tonalidades en las que puede estar un fragmento cuya armadura no cuadra, en orden de
     plausibilidad y sin repetir la que ya se probó:
       1. la RELATIVA (misma armadura, el otro modo);
       2. la que tiene por tónica la última nota —final en cadencia—;
       3. la que tiene esa última nota por 5.º grado —final en SEMICADENCIA—, que es el
          caso que se confunde con el anterior: un fragmento en la menor que acaba en mi
          se lee como mi menor si la armadura no lo desmiente.
     Solo salen las que admiten todas las notas del fragmento. */
  function tonalidadesCandidatas(ton, notas, ultima) {
    const fuera = [];
    const mete = t => {
      if (!t || !t.tonica) return;
      if (mismaTonalidad(t, ton)) return;
      if (fuera.some(x => mismaTonalidad(x, t))) return;
      if (!cabeEnTonalidad(notas, t)) return;
      fuera.push(t);
    };
    // Nombre de tónica ('Bb', 'F#') a partir de una nota
    const nombreTonica = n => n.letra + (n.alt > 0 ? '#'.repeat(n.alt) : n.alt < 0 ? 'b'.repeat(-n.alt) : '');
    // 1. la relativa: 3.ª menor abajo si es mayor, 3.ª menor arriba si es menor
    try {
      const t0 = { letra: nota(ton.tonica + '4').letra, alt: nota(ton.tonica + '4').alt, octava: 4 };
      const rel = ton.modo === 'mayor' ? transportar(t0, -2, -3) : transportar(t0, 2, 3);
      mete({ tonica: nombreTonica(rel), modo: ton.modo === 'mayor' ? 'menor' : 'mayor' });
    } catch (e) { /* nada */ }
    let u = null;
    try { u = ultima ? nota(ultima) : null; } catch (e) { u = null; }
    if (u) {
      // 2. cadencia: la última nota es la tónica
      mete({ tonica: nombreTonica(u), modo: 'mayor' });
      mete({ tonica: nombreTonica(u), modo: 'menor' });
      // 3. semicadencia: la última nota es el 5.º grado (la tónica está una 5.ª justa abajo)
      try {
        const q = transportar({ letra: u.letra, alt: u.alt, octava: 4 }, -4, -7);
        mete({ tonica: nombreTonica(q), modo: 'menor' });
        mete({ tonica: nombreTonica(q), modo: 'mayor' });
      } catch (e) { /* nada */ }
    }
    return fuera;
  }

  // La misma tonalidad con el 6.º grado elevado (menor melódica); en mayor, ella misma.
  const menorMelodica = ton => (ton.modo === 'menor' && !ton.melodica ? { tonica: ton.tonica, modo: 'menor', melodica: true } : ton);
  const variantesTon = ton => (ton.modo === 'menor' && !ton.melodica ? [ton, menorMelodica(ton)] : [ton]);

  // Número de alteraciones en la armadura (+ sostenidos, − bemoles).
  function armadura(ton) {
    const esc = escalaNatural(ton);
    // La armadura del relativo mayor: contar sostenidos/bemoles de la escala natural.
    return esc.reduce((s, n) => s + n.alt, 0);
  }

  /* ---------- Transportar de tono (decisión 102) ----------
     El banco está escrito mayormente en Do M y la menor (74 de 132 fragmentos). Como las
     respuestas son CIFRAS y GRADOS ROMANOS —no notas—, un fragmento transportado es el
     mismo ejercicio con las mismas respuestas: lo único que lleva altura son los compases
     y la tonalidad. Esto es lo que permite dar el mismo fragmento en varios tonos sin
     guardar ni una copia. */

  // Las tónicas por el círculo de quintas, de menos a más alteraciones y alternando
  // sostenidos y bemoles: así, al cortar por un tope, quedan las de siempre.
  const CIRCULO = {
    mayor: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db', 'F#', 'Gb', 'C#', 'Cb'],
    menor: ['A', 'E', 'D', 'B', 'G', 'F#', 'C', 'C#', 'F', 'G#', 'Bb', 'D#', 'Eb', 'A#', 'Ab']
  };

  /* Las tónicas de ese modo cuya armadura no pasa de `max` alteraciones. El tope se
     comprueba con `armadura`, no con la posición en la lista: si la lista tuviera un
     error, el tope seguiría siendo el correcto. */
  function tonicasPorAlteraciones(modo, max) {
    const lista = CIRCULO[modo === 'menor' ? 'menor' : 'mayor'];
    return lista.filter(t => {
      try { return Math.abs(armadura({ tonica: t, modo })) <= max; } catch (e) { return false; }
    });
  }

  /* El intervalo MÁS CORTO de una tónica a otra, en {pasos de letra, semitonos}. Corto
     importa: transportar Do M a Si M por una séptima mayor ascendente subiría el
     fragmento casi una octava y se saldría del pentagrama; por un semitono descendente,
     no. Nunca pasa de un tritono. */
  function intervaloEntreTonicas(a, b) {
    const na = nota(String(a) + '4'), nb = nota(String(b) + '4');
    /* Los pasos de letra y los semitonos se reducen A LA VEZ, no cada uno por su lado:
       son dos maneras de medir el MISMO intervalo y han de quedar de acuerdo. Reducirlos
       por separado da pares imposibles —bajar una cuarta de letra y subir un tritono de
       semitonos—, y de ahí salen dobles alteraciones a mansalva. */
    const pasos = ((LETRAS.indexOf(nb.letra) - LETRAS.indexOf(na.letra)) % 7 + 7) % 7;         // 0…6
    const semis = (((SEMITONOS[nb.letra] + nb.alt) - (SEMITONOS[na.letra] + na.alt)) % 12 + 12) % 12;  // 0…11
    /* Y del par ascendente se toma el camino más corto. Al bajar, los pasos de letra son
       los que FALTAN para la octava, en negativo: `-((7 - pasos) % 7)`. El módulo no
       sobra, y es el fallo que tenía esto (decisión 114): con la MISMA letra —do → do♭,
       la → la♭— `pasos` vale 0 y `pasos - 7` daba una octava entera de más, de modo que
       la nota salía con once alteraciones y el transporte descartaba el tono. Do♭ M era
       el caso más ruidoso: 48 de los 101 transportes que seguían cayéndose. */
    return semis > 6
      ? { pasos: -((7 - pasos) % 7), semitonos: semis - 12 }
      : { pasos, semitonos: semis };
  }

  // La misma tonalidad, transportada. Conserva el modo (una menor sigue siendo menor).
  function transportarTonalidad(ton, pasos, semitonos) {
    const t = transportar(nota(String(ton.tonica) + '4'), pasos, semitonos);
    const alt = t.alt > 0 ? '#'.repeat(t.alt) : t.alt < 0 ? 'b'.repeat(-t.alt) : '';
    return { tonica: t.letra + alt, modo: ton.modo };
  }

  // Grado del bajo respecto a la escala natural: {grado:1..7, alt: desviación}
  function grado(n, ton) {
    n = nota(n);
    const esc = escalaNatural(ton);
    const i = esc.findIndex(e => e.letra === n.letra);
    return { grado: i + 1, alt: n.alt - esc[i].alt };
  }

  /* El grado de la escala tal como se escribe: «4» o, si va alterado, «♯4» / «♭6»
     (decisión 52). Es lo que va dentro del circulito sobre el bajo y —desde la
     decisión 90— lo que el alumno responde en la armonización de bajo. */
  function textoGrado(n, ton) {
    let g;
    try { g = grado(n, ton); } catch (e) { return null; }
    if (!g || !g.grado) return null;
    return (g.alt > 0 ? '♯' : g.alt < 0 ? '♭' : '') + g.grado;
  }
  // Orden de los grados escritos: por número y, dentro, ♭ · natural · ♯
  function ordenGrado(txt) {
    const m = String(txt || '').match(/^([♯♭]?)(\d)$/);
    if (!m) return 99;
    return Number(m[2]) * 3 + (m[1] === '♭' ? 0 : m[1] === '♯' ? 2 : 1);
  }

  /* Texto → tonalidad: «Sol M», «Sol mayor», «SolM», «sol m», «mi menor», «→ Sol M».
     Sin indicación de modo, la inicial mayúscula se lee como mayor y la minúscula como menor
     (convención española). Devuelve {tonica, modo} o null. */
  function tonalidadDesdeTexto(txt) {
    if (!txt) return null;
    const limpio = String(txt).replace(/[→>\s]+/g, ' ').trim();
    const m = /^(do|re|mi|fa|sol|la|si|[a-g])\s*(♯|#|♭|b)?\s*(.*)$/i.exec(limpio);
    if (!m) return null;
    const nombre = m[1];
    const alt = m[2] === '♯' || m[2] === '#' ? '#' : (m[2] === '♭' || m[2] === 'b') ? 'b' : '';
    const suf = (m[3] || '').trim();
    let modo;
    if (suf === 'M' || /^may/i.test(suf)) modo = 'mayor';
    else if (suf === 'm' || /^men/i.test(suf)) modo = 'menor';
    else if (suf) return null;
    else modo = nombre[0] === nombre[0].toUpperCase() ? 'mayor' : 'menor';   // convención: Do = mayor, do = menor
    try { return { tonica: notaEs(nombre.toLowerCase() + alt, 4).replace(/\d+$/, ''), modo }; } catch (e) { return null; }
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
    const n = numeroDeNotas(ej.compases);
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
    '42': {
      etiqueta: '4/2', nombre: '4/2',
      filas: [[{ num: '4' }], [{ num: '2' }]],
      descripcion: 'Acorde de séptima en tercera inversión (2ª, 4ª y 6ª diatónicas): la séptima en el bajo, preparada, que baja de grado. Por ejemplo II4/2 sobre la tónica.',
      voces: vocesDiatonicas([2, 4, 6])
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
  const FUNDAMENTAL = { '53': 0, '6': 5, '64': 3, '+6': 3, '65': 5, '43': 3, '42': 1, '65d': 5, '+4': 1, '7': 0, '7+': 0, '9': 0 };
  const DOMINANTES = ['7+', '+6', '+4', '65d'];   // cifrados que denotan V7 (fundamental e inversiones)
  // Parejas (diatónico, marcado) que producen las mismas notas cuando el
  // intervalo diatónico ya es el de dominante: entonces vale el marcado.
  const MARCADOS = { '65': '65d', '43': '+6', '7': '7+', '42': '+4' };

  /* En el modo menor la sensible se eleva en los acordes de DOMINANTE (V y VII), no en
     todos. En el III se queda natural: con la sensible elevada saldría una tríada aumentada
     (do–mi–sol♯ en la menor), que no es un acorde del lenguaje de estas lecciones y, al
     cifrarla, obligaría a escribir un ♯5 que el alumno no ha puesto. */
  function tonDeLasVoces(id, nb, ton) {
    if (ton.modo !== 'menor' || ton.natural || ton.melodica) return ton;
    if (DOMINANTES.includes(id)) return ton;              // se construyen como séptima de dominante
    const pasos = FUNDAMENTAL[id] || 0;
    const letra = LETRAS[((indice(nb) + pasos) % 7 + 7) % 7];
    const grado = escalaNatural(ton).findIndex(e => e.letra === letra) + 1;
    if (grado === 5 || grado === 7) return ton;           // V y VII: la sensible, elevada
    return { tonica: ton.tonica, modo: 'menor', natural: true };
  }

  function vocesSuperiores(id, bajo, ton) {
    const c = CIFRADOS[id];
    if (!c) throw new Error('Cifrado desconocido: ' + id);
    const nb = nota(bajo);
    return c.voces(nb, tonDeLasVoces(id, nb, ton));
  }

  /* ---- Alteraciones accidentales en la cifra ----
     Regla del bajo cifrado: toda voz superior alterada RESPECTO DE LA ARMADURA lleva su
     alteración escrita junto al número de su intervalo. Si la alterada es la TERCERA, la
     alteración va sola (sin número): es el caso del V en el modo menor, cuya tercera es
     la sensible —♯ en la menor (sol♯), ♮ en do menor (si♮, porque la armadura lleva si♭)—.
     Los cifrados que ya marcan la sensible con el + de Furno (7/+, +6, +4) no se tocan.
     Esto solo afecta a cómo se DIBUJA la cifra: la paleta y las respuestas no cambian. */
  const SIGNO_ALTERACION = { '2': 'x', '1': '#', '0': 'n', '-1': 'b', '-2': 'bb' };
  const CON_MAS = ['7+', '+6', '+4'];               // ya llevan el + de la sensible

  // { númeroDeIntervalo: signo } de las voces superiores alteradas respecto de la armadura
  function alteracionesCifra(id, bajo, ton) {
    if (!CIFRADOS[id] || !bajo || !ton || CON_MAS.includes(id)) return {};
    let voces;
    try { voces = vocesSuperiores(id, bajo, ton); } catch (e) { return {}; }
    const armad = {};
    escalaNatural(ton).forEach(e => { armad[e.letra] = e.alt; });
    const iBajo = indice(nota(bajo));
    const out = {};
    voces.forEach(v => {
      if (armad[v.letra] === undefined || v.alt === armad[v.letra]) return;
      const num = ((indice(v) - iBajo) % 7 + 7) % 7 + 1;        // intervalo reducido a la octava
      out[num] = SIGNO_ALTERACION[String(v.alt)] || '#';
    });
    return out;
  }

  /* Filas que se dibujan para una cifra sobre un bajo concreto: las de CIFRADOS[id],
     con las alteraciones puestas donde toca. Sin bajo ni tonalidad, las de siempre. */
  function filasCifra(id, bajo, ton) {
    const c = CIFRADOS[id];
    if (!c) return [];
    const filas = c.filas.map(f => f.map(s => Object.assign({}, s)));
    const alt = alteracionesCifra(id, bajo, ton);
    const numeros = Object.keys(alt).map(Number);
    if (!numeros.length) return filas;
    const puestos = {};
    // 1) La alteración se pega delante del número que ya aparece en la cifra
    const conNumeros = filas.map(fila => {
      const nueva = [];
      fila.forEach(s => {
        const n = s.num ? parseInt(s.num, 10) : 0;
        const reducido = n > 7 ? n - 7 : n;
        if (n && alt[reducido] && !puestos[reducido]) { puestos[reducido] = true; nueva.push({ signo: alt[reducido] }); }
        nueva.push(s);
      });
      return nueva;
    });
    // 2) La tercera alterada no se escribe con número: va sola, en su propia fila
    //    (sustituye a la raya del 5/3 y, si no, se añade debajo, como el + de 7/+)
    let out = conNumeros;
    if (alt[3] && !puestos[3]) {
      puestos[3] = true;
      out = out.filter(f => !(f.length === 1 && f[0].signo === '—'));
      out.push([{ signo: alt[3] }]);
    }
    /* 3) Un intervalo alterado que la cifra no escribe (ni es la tercera) también ha de
       aparecer: se añade su fila, de mayor a menor. No se hace en las cifras que tienen
       equivalente marcado (6/5, 4/3, 7 → 6/5̸, +6, 7/+): ahí la alteración ya la lleva
       ese otro cifrado, que es el que se ofrece en el repertorio. */
    const pendientes = MARCADOS[id] ? [] : numeros.filter(n => !puestos[n]);
    if (pendientes.length) {
      out = out.filter(f => !(f.length === 1 && f[0].signo === '—'));
      pendientes.forEach(n => out.push([{ signo: alt[n] }, { num: String(n) }]));
      out.sort((a, b) => {
        const v = f => { const s = f.find(x => x.num); return s ? parseInt(s.num, 10) : -1; };
        return v(b) - v(a);
      });
    }
    return out;
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
  /* ---- Grados cromáticos: las dominantes secundarias ----
     T, S y D son las funciones tonales DIATÓNICAS: no llevan alteraciones (salvo la del
     modo menor que toma la dominante mayor del homónimo). Un acorde alterado no es ni S ni
     D, porque escribirlo así induce a confusión: lleva su propio signo. La dominante de la
     dominante se escribe **V/V** —la barra dice «dominante secundaria de»— y su función es
     **DD**, la doble dominante de Diether de la Motte.
     Por dentro el acorde sigue siendo la séptima de dominante levantada sobre el 2.º grado
     (II con cifra marcada); lo que cambia es cómo se escribe y cómo se llama. */
  const SECUNDARIAS = { II: { grado: 'V/V', funcion: 'DD', nombre: 'dominante de la dominante' } };
  const GRADOS_CROMATICOS = Object.keys(SECUNDARIAS).map(k => SECUNDARIAS[k].grado);
  // ¿Este acorde es una dominante secundaria? (cifra de dominante sobre un grado que no es el V)
  const esSecundaria = (romano, cifra) => !!(DOMINANTES.includes(cifra) && romano !== 'V' && SECUNDARIAS[romano]);
  // El grado tal como se ESCRIBE (V/V) y el que se usa por dentro (II)
  const gradoEscrito = (romano, cifra) => (esSecundaria(romano, cifra) ? SECUNDARIAS[romano].grado : romano);
  const gradoInterno = txt => (Object.keys(SECUNDARIAS).find(k => SECUNDARIAS[k].grado === txt) || txt);
  const secundariaDe = txt => SECUNDARIAS[gradoInterno(txt)] || null;
  /* La misma pregunta, pero SABIENDO el bajo y el tono (decisión 103, Diego). `esSecundaria`
     solo mira la cifra, así que reconoce la dominante secundaria cuando lleva séptima
     (7/+, +6, 6/5̸, +4) y se le escapa la TRÍADA MAYOR sobre el 2.º grado —la-do♯-mi en
     Sol M, que es la V/V sin séptima y se rotulaba «II»—. Con el bajo y el tono delante sí
     se puede: si la 3.ª sobre la fundamental es mayor, el acorde es dominante de algo. En
     el II diatónico —tercera menor en mayor, disminuido en menor— la prueba da falso, de
     modo que el II de siempre se sigue rotulando II. */
  function terceraMayorSobreFundamental(id, bajo, ton) {
    try {
      const nb = nota(bajo);
      const cf = clase(fundamental(id, nb, ton));
      const notas = [clase(nb), ...vocesSuperiores(id, nb, ton).map(clase)];
      return notas.includes((cf + 4) % 12) && !notas.includes((cf + 3) % 12);
    } catch (e) { return false; }
  }
  function esSecundariaEn(id, bajo, ton) {
    const rom = romano(id, bajo, ton);
    if (rom === 'V' || !SECUNDARIAS[rom]) return false;
    return DOMINANTES.includes(id) || terceraMayorSobreFundamental(id, bajo, ton);
  }
  // Igual que romano(), pero devuelve el grado tal como se ESCRIBE (V/V en vez de II)
  function romanoEscrito(id, bajo, ton) {
    const rom = romano(id, bajo, ton);
    return esSecundariaEn(id, bajo, ton) && SECUNDARIAS[rom] ? SECUNDARIAS[rom].grado : gradoEscrito(rom, id);
  }

  const FUNCIONES = ['T', 'S', 'D'];                 // las diatónicas (cuadro verde)
  const FUNCIONES_CROMATICAS = Object.keys(SECUNDARIAS).map(k => SECUNDARIAS[k].funcion);   // DD (cuadro azul)
  /* Y una función que no es función: **ninguna** (decisión 116, Diego). El III no tiene
     función tonal —ni tónica ni subdominante ni dominante—, y se ve con toda claridad
     cuando hace de acorde pivote: viniendo de Do M, el mi menor es el III de Do y el v
     natural de la menor, y ninguna de las dos lecturas es una función. En la paleta y en
     la casilla se escribe **—**; por dentro es 'N', porque `null` ya significa «sin
     responder» y hacían falta cosas distintas. */
  const SIN_FUNCION = 'N';
  const FUNCIONES_EXTRA = FUNCIONES_CROMATICAS.concat([SIN_FUNCION]);   // solo se ofrecen si el ejercicio las pide
  const TODAS_FUNCIONES = FUNCIONES.concat(FUNCIONES_EXTRA);
  const FUNCION_DE ={ I: ['T'], II: ['S'], III: [SIN_FUNCION], IV: ['S'], V: ['D'], VI: ['T', 'S'], VII: ['D'] };
  const NOMBRE_FUNCION = { T: 'tónica', S: 'subdominante', D: 'dominante', DD: 'dominante de la dominante', N: 'sin función tonal' };
  const TEXTO_FUNCION = { T: 'T', S: 'S', D: 'D', DD: 'DD', N: '—' };
  // Cómo se ESCRIBE una función en la paleta, la casilla y el desplegable
  const textoFuncion = f => (f ? (TEXTO_FUNCION[f] || f) : '');
  // Funciones posibles de un grado (la primera es la habitual)
  function funcionesDe(romano) {
    const sec = SECUNDARIAS[gradoInterno(romano)];
    if (sec && GRADOS_CROMATICOS.includes(romano)) return [sec.funcion];
    return (FUNCION_DE[romano] || ['T']).slice();
  }
  // …y de un acorde concreto: el 6/4 cadencial (I6/4 sobre el 5.º grado) es un adorno de la dominante
  function funcionesDeAcorde(romano, cifra) {
    if (esSecundaria(romano, cifra)) return [SECUNDARIAS[romano].funcion];
    return cifra === '64' && romano === 'I' ? ['D'] : funcionesDe(romano);
  }
  /* ---- El relieve de cada nota (decisión 98, regla de Diego) ----
     Qué notas usa un pasaje se resume en una escala, y una escala no distingue Do mayor de
     re dórico: las notas son las mismas y lo que cambia es cuál manda. Lo que decide es
     **en cuáles insiste la melodía**, y Diego da tres señales:
       · empezar y acabar en ella —acabar pesa más que empezar—;
       · llegar a ella **por salto** (el do–sol de «Campanitas del lugar»);
       · destacarla por **cambio de dirección** melódica (un pico o un valle).
     Devuelve un mapa clase de altura → puntos. Los pesos son un orden de importancia, no
     una medida: el final por encima del principio, y el salto por encima del giro.
     NO se cuentan ni la duración ni la parte métrica: Diego nombró estas tres, y añadir
     más por mi cuenta sería cambiarle la regla. */
  function relievePorNota(notas) {
    const puntos = new Map();
    const suma = (n, p) => { const c = clase(n); puntos.set(c, (puntos.get(c) || 0) + p); };
    const ns = (notas || []).map(n => { try { return nota(n); } catch (e) { return null; } }).filter(Boolean);
    if (!ns.length) return puntos;
    suma(ns[0], 3);                       // la primera
    suma(ns[ns.length - 1], 4);           // la última, que pesa más
    const letra = n => LETRAS.indexOf(n.letra);
    const paso = (a, b) => { const d = (letra(b) - letra(a) + 7) % 7; return Math.min(d, 7 - d); };
    for (let i = 1; i < ns.length; i++) {
      if (paso(ns[i - 1], ns[i]) >= 2) suma(ns[i], 2);        // llegada por salto (3.ª o más)
    }
    for (let i = 1; i < ns.length - 1; i++) {
      const a = midi(ns[i - 1]), b = midi(ns[i]), c = midi(ns[i + 1]);
      if ((b - a) * (c - b) < 0) suma(ns[i], 1);              // pico o valle
    }
    return puntos;
  }
  // Relieve de la tónica de una tonalidad dentro de un pasaje
  function relieveDeTonica(ton, notas) {
    try { return relievePorNota(notas).get(clase(nota(ton.tonica + '4'))) || 0; } catch (e) { return 0; }
  }

  /* El acorde SIN su posición (decisión 92): el grado y, si lo lleva, la séptima o la
     novena. «V 6/5̸» y «V +4» son el mismo acorde —V7— en inversiones distintas, y en el
     inventario que ve el alumno han de contar como uno solo. El número de notas sale de
     las voces del cifrado: 2 por encima del bajo es tríada, 3 es acorde de séptima.
     En una dominante secundaria la cifra va antes de la barra: V7/V, no V/V7. */
  const NOTAS_CIFRADO = {};     // cuántas notas tiene el acorde de cada cifrado, calculado una vez
  function notasDelCifrado(cifra) {
    if (NOTAS_CIFRADO[cifra] !== undefined) return NOTAS_CIFRADO[cifra];
    let n = 3;
    // Se cuentan sobre un bajo cualquiera: el número de voces superiores no depende de él
    try { n = vocesSuperiores(cifra, { letra: 'C', alt: 0, octava: 3 }, { tonica: 'C', modo: 'mayor' }).length + 1; } catch (e) { n = 3; }
    NOTAS_CIFRADO[cifra] = n;
    return n;
  }

  function acordeSinPosicion(romano, cifra) {
    const notas = notasDelCifrado(cifra);
    const sufijo = notas >= 5 ? '9' : notas === 4 ? '7' : '';
    const rom = gradoEscrito(romano, cifra);
    if (!sufijo) return rom;
    const barra = rom.indexOf('/');
    return barra < 0 ? rom + sufijo : rom.slice(0, barra) + sufijo + rom.slice(barra);
  }

  /* Función habitual del acorde, mirando a los vecinos.
     El acorde siguiente se mira CON su cifra (decisión 86): el 6/4 cadencial se escribe
     I6/4 pero suena como dominante, y mirando solo el grado se contaba como tónica, de
     modo que un VI que va a parar a él se etiquetaba T cuando ya está haciendo de S.

     El VI (decisión 88, criterio de Diego): subdominante son «las sonoridades sobre
     movimientos del bajo que preparan la dominante», así que el VI de I – VI – IV – V ya
     es subdominante, aunque entre él y la dominante haya otra subdominante. Solo hay una
     excepción, y es la cadencia rota: el VI que RESUELVE una dominante la sustituye a la
     tónica, y ahí es tónica. */
  function funcionDe(romano, romanoSiguiente, cifra, cifraSiguiente, anterior) {
    if (esSecundaria(romano, cifra)) return SECUNDARIAS[romano].funcion;
    if (cifra === '64' && romano === 'I') return 'D';
    const f = funcionesDe(romano);
    if (romano === 'VI') {
      const fAnt = anterior && anterior.romano ? funcionesDeAcorde(anterior.romano, anterior.cifra)[0] : null;
      if (fAnt === 'D' || fAnt === 'DD') return 'T';         // cadencia rota: el VI hace de tónica
      const fSig = romanoSiguiente ? funcionesDeAcorde(romanoSiguiente, cifraSiguiente)[0] : null;
      if (fSig === 'D' || fSig === 'DD' || fSig === 'S') return 'S';
    }
    return f[0];
  }

  /* ---- Bajo a partir de la fundamental y la cifra ----
     La cifra dice qué nota del acorde está en el bajo (FUNDAMENTAL[id] = letras del
     bajo a la fundamental): —/7/7+/9 la fundamental; 6, 6/5, 6/5̸ la tercera; 6/4,
     4/3, +6 la quinta; +4 la séptima. Devuelve {letra, alt} sin octava, o null si la
     cifra no puede darse sobre esa fundamental en la tonalidad. En menor, el bajo
     sobre el 7.º grado lleva la sensible elevada salvo en el III. */
  /* Inflexión de la menor melódica que hace que el acorde contenga la nota dada (la de la
     melodía): se prueba primero la forma natural y, si no la contiene, la melódica. */
  function tonParaAcorde(romano, id, ton, notaSop) {
    if (!notaSop || ton.modo !== 'menor' || ton.melodica) return ton;
    const cl = clase(nota(notaSop));
    for (const t of variantesTon(ton)) {
      const b = bajoDe(romano, id, t, false);
      if (!b) continue;
      const bn = { letra: b.letra, alt: b.alt, octava: 3 };
      if ([clase(bn), ...vocesSuperiores(id, bn, t).map(clase)].includes(cl)) return t;
    }
    return ton;
  }
  // La misma comprobación cuando solo se conoce el bajo (la realización)
  function tonParaBajo(id, bajo, ton, notaSop) {
    if (!notaSop || ton.modo !== 'menor' || ton.melodica) return ton;
    const cl = clase(nota(notaSop));
    for (const t of variantesTon(ton)) {
      if ([clase(nota(bajo)), ...vocesSuperiores(id, nota(bajo), t).map(clase)].includes(cl)) return t;
    }
    return ton;
  }

  function bajoDe(romano, id, ton, estricto = true) {
    const k = ROMANOS.indexOf(romano);
    const pasos = FUNDAMENTAL[id];
    if (k < 0 || pasos === undefined) return null;
    // Convenciones del cifrado (solo en modo estricto, el del análisis): las cifras de
    // dominante (7/+, 6/5̸, +6, +4) son el V7 (y +6 también el II como dominante secundaria
    // del V, decisión 9); sobre el V la séptima se escribe siempre marcada, nunca 7, 6/5 o
    // 4/3 (decisión 11). En modo no estricto se devuelve el bajo que resulta de lo escrito,
    // sea lo que sea, para mostrárselo al alumno tal cual.
    if (estricto) {
      /* Las cifras de dominante son el V7… o el V7 DE LA DOMINANTE (V/V), cuya fundamental
         es el 2.º grado: es el acorde del 4.º grado elevado (do♯ en Sol M), decisión 46. */
      if (DOMINANTES.includes(id) && !(romano === 'V' || romano === 'II')) return null;
      if (romano === 'V' && MARCADOS[id]) return null;
    }
    const gradoBajo = ((k - pasos) % 7 + 7) % 7;               // 0..6
    const esc = escalaNatural(ton), escV = escalaVoces(ton);
    let bajo;
    if (DOMINANTES.includes(id)) {
      /* El acorde de séptima de dominante se construye ENTERO sobre su fundamental (3ª
         mayor, 5ª justa y 7ª menor), sea la del V o la del V/V; el bajo es el miembro que
         la cifra pone debajo. Así el 6/5̸ del V/V cae sobre el 4.º grado ELEVADO, que es
         la sensible de la dominante, y no sobre el diatónico. */
      const ef = (k === 6 && romano !== 'III') || (ton.melodica && k === 5) ? escV[k] : esc[k];
      const fund = { letra: ef.letra, alt: ef.alt, octava: 3 };
      const miembro = { 0: [0, 0], 5: [2, 4], 3: [4, 7], 1: [6, 10] }[pasos];
      if (!miembro) return null;
      const b = transportar(fund, miembro[0], miembro[1]);
      bajo = { letra: b.letra, alt: b.alt, octava: 3 };
    } else {
      // El 7.º grado del bajo lleva la sensible (salvo en el III); con la menor melódica,
      // el 6.º grado también se eleva.
      const e = (gradoBajo === 6 && romano !== 'III') || (ton.melodica && gradoBajo === 5) ? escV[gradoBajo] : esc[gradoBajo];
      bajo = { letra: e.letra, alt: e.alt, octava: 3 };
    }
    // Comprobación: la cifra sobre ese bajo ha de dar de verdad ese grado como fundamental
    try { if (romano_(id, bajo, ton) !== romano) return null; } catch (err) { return null; }
    return { letra: bajo.letra, alt: bajo.alt };
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
    LETRAS, nota, notaEs, bajoDesdeTexto, textoDesdeBajo, sufijoDuracion, esSilencio, eventos, notasDeCompases, numeroDeNotas, cortes, texto, nombreEs, midi, clase, indice, transportar,
    CIRCULO_TONICAS: CIRCULO, tonicasPorAlteraciones, intervaloEntreTonicas, transportarTonalidad,
    escalaNatural, escalaVoces, armadura, grado, textoGrado, ordenGrado, relievePorNota, relieveDeTonica, cabeEnTonalidad, tonalidadesCandidatas, nombreTonalidad, nombreCorto, mismaTonalidad, fuerzasMetricas, pideCambio, cabeSeisCuatro, divideElTiempo,
    tonalidadDesdeTexto, tonalidadPorArmadura, tonalidadesVecinas, tonalidadesPorNota, clasesPropias, acordeComun, acordeAjeno,
    CIFRADOS, DOMINANTES, MARCADOS, ROMANOS, FUNDAMENTAL, vocesSuperiores, alteracionesCifra, filasCifra, fundamental, gradoFundamental, romano, claveAcorde, canonizar,
    FUNCIONES, FUNCIONES_CROMATICAS, FUNCIONES_EXTRA, SIN_FUNCION, TODAS_FUNCIONES, NOMBRE_FUNCION, textoFuncion, funcionesDe, funcionesDeAcorde, funcionDe, bajoDe, menorMelodica, variantesTon, tonParaAcorde, tonParaBajo,
    SECUNDARIAS, GRADOS_CROMATICOS, esSecundaria, esSecundariaEn, gradoEscrito, acordeSinPosicion, gradoInterno, secundariaDe, romanoEscrito
  };
})();
