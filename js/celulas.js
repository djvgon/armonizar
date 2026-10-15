/* =====================================================================
   celulas.js — LA CÉLULA DEL RETARDO: generarla, revisarla y corregirla.

   El piloto de Schemata dentro de armonizar (Diego, 15/10/2026: «el piloto va dentro de
   armonizar, como modo nuevo, con Co-1 y su pestaña en el mismo cuaderno»). El diseño y las
   reglas los fija el chat «Schemata app» en
   `claude/App-armonizacion-contrapunto-y-esquemas.md`, apartado 2; aquí está el motor.

   UNA CÉLULA son TRES MOMENTOS en DOS VOCES:

       | preparación | percusión | resolución |     (los nombres, propuestos por este chat
       |   (débil)   | (fuerte)  |            |      y pendientes del visto bueno de Diego)

   · la NOTA RETARDADA es la síncopa que prepara la disonancia: suena en la preparación, en
     parte débil y en consonancia, y se LIGA a la percusión, donde ya no se vuelve a atacar;
   · la NOTA REAL es la que la vuelve disonante al moverse, y va siempre en parte fuerte:
     una 7.ª si está por debajo de la retardada, una 2.ª si está por encima;
   · en la resolución la retardada BAJA UN GRADO a una consonancia.
   (Los nombres son de Diego, 15/10/2026.)

   LOS CUATRO TIPOS. Solo los de IJzerman (Diego, 14/10): el 6–7–6 y su variante el 3–7–3,
   con la retardada en la voz superior; y en el bajo sus inversiones, el 3–2–3 y el 6–2–6,
   PENDIENTES de que Diego las confirme (apartado 7.1 de aquel documento). Nada de 4–3 ni
   de 9–8.

   TODO SALE DE LA NOTA RETARDADA. Fijados el tipo y la tonalidad, la célula entera está
   determinada: la nota real, la preparación de la otra voz y las dos resoluciones se cuentan
   en grados de la escala desde la retardada. Por eso la variante cerrada tiene UNA sola
   respuesta, que es lo que pide el 2.7.

   LOS INTERVALOS SE CUENTAN POR GRADOS, NO POR SEMITONOS: la 6.ª de resolución es menor en
   la célula de sol3 y mayor en la de do3, y la 3.ª del 2–3 es mayor al preparar y menor al
   resolver. Una regla escrita en semitonos daría por malas la mitad de las células buenas.

   Uso:
     Celulas.TIPOS                                   → los cuatro tipos y su forma
     Celulas.generar({tonalidad, tipo, retardada})   → la célula, o null con el motivo
     Celulas.todas({tonalidad, tipos, …})            → todas las que valen, con las descartadas
     Celulas.revisar(celula)                         → [] si las reglas y el modelo coinciden
     Celulas.comprobar(celula, respuesta)            → los fallos de la respuesta del alumno
   ===================================================================== */

const Celulas = (() => {
  'use strict';

  /* ---------- Los cuatro tipos ----------
     `voz`: dónde va la nota retardada. `prep`, `dis` y `res`: a cuántos GRADOS de ella está
     la otra voz en cada momento (la cuenta normal: 6.ª = cinco grados de distancia).
     `otraSeQueda`: en la resolución, la otra voz se queda donde está (y entonces está
     ligada desde la percusión) o se mueve también. */
  const TIPOS = {
    '6-7-6': {
      voz: 'alta', prep: 6, dis: 7, res: 6, otraSeQueda: true,
      titulo: 'retardo 7–6 preparado a la 6.ª',
      cuenta: 'la otra voz baja por grado a la nota real y se queda en la resolución'
    },
    '3-7-3': {
      voz: 'alta', prep: 3, dis: 7, res: 3, otraSeQueda: false,
      titulo: 'retardo 7–6 preparado a la 3.ª',
      cuenta: 'la otra voz llega a la nota real por salto de 5.ª y se mueve también en la resolución (el bajo por cuartas y quintas de IJzerman)'
    },
    '3-2-3': {
      voz: 'baja', prep: 3, dis: 2, res: 3, otraSeQueda: true, inversionDe: '6-7-6',
      titulo: 'retardo 2–3 en la voz inferior (inversión del 6–7–6)',
      cuenta: 'la nota ligada es la de abajo; la disonancia la produce la voz de arriba al bajar, y resuelve la de abajo'
    }
  };
  /* EL 6–2–6 SE RETIRÓ (Diego, 15/10/2026: «3–2–3 sí vale… 6–2–6 no tiene mucho sentido»). Era
     la inversión del 3–7–3, y al invertirla el salto de 5.ª descendente y la 4.ª ascendente —que
     en el bajo son el camino por cuartas y quintas de IJzerman— le tocaban a la voz de arriba,
     que no se mueve así. Y «el bajo» del 2–3 es, en una célula a dos voces, simplemente la voz
     inferior: el retardo 2–3 vale entre cualquier par de voces (Diego: «y en cualquier voz»). */

  /* Las tonalidades del curso: Do mayor / la menor y hasta dos alteraciones (2.8). */
  const TONALIDADES = [
    { tonica: 'C', modo: 'mayor' }, { tonica: 'G', modo: 'mayor' }, { tonica: 'D', modo: 'mayor' },
    { tonica: 'F', modo: 'mayor' }, { tonica: 'Bb', modo: 'mayor' },
    { tonica: 'A', modo: 'menor' }, { tonica: 'E', modo: 'menor' }, { tonica: 'B', modo: 'menor' },
    { tonica: 'D', modo: 'menor' }, { tonica: 'G', modo: 'menor' }
  ];

  /* EL REGISTRO LO FIJÓ DIEGO (15/10/2026): «por encima de fa1 y por debajo de do5». Son los
     dos extremos, tomados como límites inclusivos: fa1–do5, algo más de tres octavas. No es el
     pentagrama de la clave de fa —el del ejemplo del 2.1— sino el ámbito entero de las cuatro
     voces, porque el retardo vale entre cualquier par de ellas. */
  const REGISTRO = ['F1', 'C5'];
  /* LA DISTANCIA MÁXIMA: ninguna (Diego, 15/10: «aquí no rige lo de la octava como máximo entre
     soprano y tenor»). Lo que limita es el registro. El parámetro se queda para poder ponerle
     un límite desde la página de revisión si al verlas alguna canta demasiado. */
  const DISTANCIA_MAXIMA = null;

  const mi = n => Teoria.midi(n);
  const ix = n => Teoria.indice(n);                       // posición diatónica: cuenta letras
  const gradosEntre = (a, b) => Math.abs(ix(a) - ix(b)) + 1;    // 6.ª = seis grados contados

  /* ---------- La escalera: las notas de la escala, en orden, para moverse POR GRADOS ----------
     La escalera es la escala NATURAL: sirve para contar grados, que es lo que define la
     célula. Las alteraciones del menor se ponen DESPUÉS, nota a nota, según lo que hace la
     melodía de cada voz (ver `conSensible`). */
  function escalera(ton) {
    const esc = Teoria.escalaNatural(ton);
    const out = [];
    for (let o = 0; o <= 7; o++) esc.forEach(e => out.push({ letra: e.letra, alt: e.alt, octava: o }));
    return out.sort((a, b) => ix(a) - ix(b));
  }

  /* ---------- Generar una célula ----------
     `retardada` es la nota que se retarda (texto o nota). Devuelve la célula o
     {nula:true, motivo} si esa nota no da una célula posible en esa tonalidad. */
  function generar(op) {
    const ton = op.tonalidad;
    const t = TIPOS[op.tipo];
    if (!t) throw new Error('Tipo de retardo desconocido: ' + op.tipo);
    const esc = escalera(ton);
    const r = Teoria.nota(op.retardada);
    const i = esc.findIndex(n => ix(n) === ix(r));
    if (i < 0) return { nula: true, motivo: 'La nota ' + Teoria.texto(r) + ' no es de la escala de ' + Teoria.nombreCorto(ton) + '.' };

    const hacia = t.voz === 'alta' ? -1 : +1;             // hacia dónde está la otra voz
    const paso = (desde, grados) => esc[desde + hacia * (grados - 1)];
    const prep = paso(i, t.prep);
    const real = paso(i, t.dis);
    const resNatural = esc[i - 1];                        // la retardada SIEMPRE baja un grado
    if (!prep || !real || !resNatural) return { nula: true, motivo: 'La célula se sale de la escalera de la tonalidad.' };
    /* La resolución en el 7.º grado del menor es la SENSIBLE (Diego, 15/10). Los grados se
       cuentan en la escala natural; la alteración se pone aquí, al final, y no mueve ningún
       grado: sol♯ sigue siendo el 7.º. */
    const alzada = conSensible(resNatural, ton);
    const resRet = alzada.nota;
    const iRes = esc.findIndex(n => ix(n) === ix(resNatural));
    const otraRes = t.otraSeQueda ? real : paso(iRes, t.res);
    if (!otraRes) return { nula: true, motivo: 'La célula se sale de la escalera de la tonalidad.' };

    const arriba = t.voz === 'alta';
    const momento = (ret, otra) => (arriba ? { alta: ret, baja: otra } : { alta: otra, baja: ret });
    const momentos = [momento(r, prep), momento(r, real), momento(resRet, otraRes)];

    const celula = {
      tipo: op.tipo,
      tonalidad: ton,
      vozRetardada: t.voz,
      vozReal: arriba ? 'baja' : 'alta',
      dada: op.dada === 'real' ? 'real' : 'retardada',    // A: se da la retardada · B: la real
      momentos,
      /* Las ligaduras, como voz y momento de partida: la retardada se liga de la preparación
         a la percusión siempre; la nota real, de la percusión a la resolución solo cuando se
         queda (6–7–6 y 3–2–3). */
      ligaduras: [{ voz: t.voz, desde: 0 }].concat(t.otraSeQueda ? [{ voz: arriba ? 'baja' : 'alta', desde: 1 }] : []),
      barra: 1,                                           // la barra va DELANTE de la percusión
      intervalos: momentos.map(m => gradosEntre(m.alta, m.baja)),
      grados: momentos.map(m => ({ alta: Teoria.textoGrado(m.alta, ton), baja: Teoria.textoGrado(m.baja, ton) })),
      retardada: r,
      real,
      nombres: { retardada: Teoria.texto(r), real: Teoria.texto(real) },
      /* Qué se ha alterado y qué no, para que se vea en la página de revisión */
      sensible: alzada.elevada ? Teoria.texto(resRet) : null,
      naturales: naturalesDelMenor(momentos, ton)
    };
    celula.id = op.tipo + '·' + Teoria.nombreCorto(ton).replace(/ /g, '') + '·' + Teoria.texto(r);
    return celula;
  }

  /* ---------- Las reglas ----------
     Cada regla devuelve null si se cumple, o {regla, mensaje, momentos, voces}. Los TEXTOS
     son provisionales: los escribe Diego (7.4 del documento de Schemata). Cada uno lleva
     delante su etiqueta para que se puedan sustituir uno a uno sin tocar el código. */
  const MENSAJES = {
    registro: 'La célula se sale del pentagrama de la clave de fa.',
    cruce: 'Las dos voces se cruzan: la de arriba tiene que estar por encima de la de abajo.',
    unisono: 'Las dos voces caen en la misma nota.',
    distancia: 'Las dos voces quedan a más de {n} grados una de otra.',
    preparacion: 'La preparación tiene que ser una consonancia: a {n}.ª de la otra voz, en parte débil.',
    ligadura: 'La nota retardada se LIGA de la preparación a la percusión: no se vuelve a atacar.',
    ligaduraReal: 'En este retardo la nota real se queda en la resolución, ligada desde la percusión.',
    percusion: 'La disonancia ha de ser una {n}.ª, y la produce la otra voz al moverse, no la nota retardada.',
    percusionQuieta: 'La nota retardada no se mueve en la percusión: es la otra voz la que entra y crea la disonancia.',
    resolucion: 'La voz retardada resuelve BAJANDO UN GRADO, a una {n}.ª.',
    resuelveQuienNoDebe: 'Aquí resuelve la voz equivocada: la que baja es la que estaba ligada.',
    otraSeQueda: 'En este retardo la otra voz se queda quieta mientras la retardada resuelve.',
    otraSeMueve: 'En este retardo la otra voz también se mueve al resolver.',
    barra: 'La barra de compás va DELANTE de la percusión: el retardo cae en parte fuerte.',
    esqueleto: 'Quitando el retardo quedan {n} paralelas: el retardo no las salva.',
    segundaAumentada: 'Hay una segunda aumentada en la melodía.',
    tritono: 'La voz salta un tritono ({a} → {b}).',
    consonancia: 'El intervalo de {d} no es una consonancia.',
    calidad: 'Esa {d} no es mayor ni menor: con esa alteración sale aumentada o disminuida.'
  };
  const texto = (clave, datos) => String(MENSAJES[clave] || clave)
    .replace(/\{(\w+)\}/g, (_, k) => (datos && datos[k] !== undefined ? datos[k] : '{' + k + '}'));

  const CONSONANTES = [3, 6];                 // en el piloto, 3.ª y 6.ª (y sus octavas no entran)

  /* LA CALIDAD DE CADA INTERVALO, en semitonos. Mientras todo era diatónico esto sobraba —una
     3.ª de la escala es siempre mayor o menor—, pero con la sensible del menor ya no: fa–re♯
     es una 6.ª aumentada y sol♯–fa una 7.ª disminuida, y ninguna de las dos sirve. */
  const CALIDAD = { 2: [1, 2], 3: [3, 4], 6: [8, 9], 7: [10, 11] };
  const calidadBien = (grados, semitonos) => !CALIDAD[grados] || (semitonos >= CALIDAD[grados][0] && semitonos <= CALIDAD[grados][1]);

  /* LA SENSIBLE EN EL MENOR (Diego, 15/10/2026: «en menor la célula debe llevar sensible… en
     la menor será la–do / la–si / sol♯–si / la–la. En do Mayor no llevaría sostenido el mismo
     pasaje»). Su ejemplo es el 6–7–6 sobre la tónica: la retardada **resuelve en el 7.º
     grado**, y ese 7.º es la sensible porque la línea vuelve a la tónica. Es el único sitio de
     la célula cerrada donde el menor melódico se pronuncia, y es el que se eleva.

     Lo que **no** se altera, y está a la vista en la página para que Diego lo decida: un 7.º
     grado que **desciende** (la retardada que baja del 7.º al 6.º se queda natural, como manda
     la escala descendente) y el 6.º grado, que solo se eleva al subir hacia la sensible —un
     movimiento que en la célula de tres momentos no ocurre: llega con la ampliada (2.4)—. */
  function conSensible(n, ton) {
    if (!ton || ton.modo !== 'menor') return { nota: n, elevada: false };
    let g;
    try { g = Teoria.grado(n, ton); } catch (e) { return { nota: n, elevada: false }; }
    if (!g || g.grado !== 7 || g.alt !== 0) return { nota: n, elevada: false };
    return { nota: { letra: n.letra, alt: n.alt + 1, octava: n.octava }, elevada: true };
  }
  // Los grados 6.º y 7.º que se quedan naturales: para enseñárselos a Diego, no para avisar
  function naturalesDelMenor(momentos, ton) {
    if (!ton || ton.modo !== 'menor') return [];
    const out = [];
    momentos.forEach((m, k) => ['alta', 'baja'].forEach(voz => {
      try {
        const g = Teoria.grado(m[voz], ton);
        if ((g.grado === 6 || g.grado === 7) && g.alt === 0) out.push({ momento: k, voz, grado: g.grado });
      } catch (e) { /* nada */ }
    }));
    return out;
  }

  /* Tritono melódico: cuarta aumentada o quinta disminuida entre dos notas seguidas de la
     misma voz (6 semitonos y 4 o 5 grados). Hace falta porque el 3–7–3 y el 6–2–6 mueven la
     otra voz por salto de 5.ª, y en la escala diatónica ese salto puede caer en si–fa. */
  function tritono(a, b) {
    const st = Math.abs(mi(a) - mi(b)), g = gradosEntre(a, b);
    return st === 6 && (g === 4 || g === 5);
  }
  const segundaAumentada = (a, b) => Math.abs(mi(a) - mi(b)) === 3 && gradosEntre(a, b) === 2;

  /* Paralelas entre dos momentos: solo cuentan si se mueven LAS DOS voces. */
  function paralelas(m1, m2) {
    if (mi(m1.alta) === mi(m2.alta) || mi(m1.baja) === mi(m2.baja)) return null;
    const pc = x => ((x % 12) + 12) % 12;
    const a = pc(mi(m1.alta) - mi(m1.baja)), b = pc(mi(m2.alta) - mi(m2.baja));
    if (a !== b) return null;
    return a === 7 ? 'quintas' : a === 0 ? 'octavas' : null;
  }

  /* `revisar` pasa las reglas por la realización MODELO. Si devuelve algo, las reglas y el
     modelo no coinciden, y eso es un aviso para mirarlo (2.7): nunca se cambia la
     realización de Diego en silencio. */
  function revisar(celula, op) {
    const fallos = [];
    const t = TIPOS[celula.tipo];
    const m = celula.momentos;
    const registro = (op && op.registro) || REGISTRO;
    const dmax = (op && op.distanciaMaxima !== undefined) ? op.distanciaMaxima : DISTANCIA_MAXIMA;
    const bajo = Teoria.midi(Teoria.nota(registro[0])), alto = Teoria.midi(Teoria.nota(registro[1]));

    m.forEach((x, k) => {
      [x.alta, x.baja].forEach(n => {
        if (mi(n) < bajo || mi(n) > alto) fallos.push({ regla: 'registro', momento: k, mensaje: texto('registro') });
      });
      if (mi(x.alta) === mi(x.baja)) fallos.push({ regla: 'unisono', momento: k, mensaje: texto('unisono') });
      else if (mi(x.alta) < mi(x.baja)) fallos.push({ regla: 'cruce', momento: k, mensaje: texto('cruce') });
      if (dmax && gradosEntre(x.alta, x.baja) > dmax) fallos.push({ regla: 'distancia', momento: k, mensaje: texto('distancia', { n: dmax }) });
    });

    // Los intervalos de la preparación y de la resolución, consonantes y los que pide el tipo
    if (celula.intervalos[0] !== t.prep) fallos.push({ regla: 'preparacion', momento: 0, mensaje: texto('preparacion', { n: t.prep }) });
    if (celula.intervalos[1] !== t.dis) fallos.push({ regla: 'percusion', momento: 1, mensaje: texto('percusion', { n: t.dis }) });
    if (celula.intervalos[2] !== t.res) fallos.push({ regla: 'resolucion', momento: 2, mensaje: texto('resolucion', { n: t.res }) });
    [0, 2].forEach(k => {
      if (!CONSONANTES.includes(celula.intervalos[k])) fallos.push({ regla: 'consonancia', momento: k, mensaje: texto('consonancia', { d: celula.intervalos[k] + '.ª' }) });
    });
    /* La CALIDAD de los tres intervalos: con la sensible del menor en juego, una 6.ª por
       grados puede ser una 6.ª aumentada, y eso no es una consonancia. */
    m.forEach((x, k) => {
      const g = gradosEntre(x.alta, x.baja), st = Math.abs(mi(x.alta) - mi(x.baja));
      if (!calidadBien(g, st)) fallos.push({ regla: 'calidad', momento: k,
        mensaje: texto('calidad', { d: g + '.ª', n: st }) });
    });

    // La retardada no se mueve de la preparación a la percusión, y baja un grado al resolver
    const v = celula.vozRetardada;
    if (mi(m[0][v]) !== mi(m[1][v])) fallos.push({ regla: 'percusionQuieta', momento: 1, mensaje: texto('percusionQuieta') });
    /* Baja UN GRADO: se mira el índice diatónico, que no se entera de la alteración, de modo
       que la→sol♯ cuenta como bajar un grado igual que la→sol. */
    if (ix(m[2][v]) !== ix(m[1][v]) - 1) fallos.push({ regla: 'resolucion', momento: 2, mensaje: texto('resolucion', { n: t.res }) });

    // La otra voz: se queda o se mueve, según el tipo
    const o = celula.vozReal;
    const sigueQuieta = mi(m[1][o]) === mi(m[2][o]);
    if (t.otraSeQueda && !sigueQuieta) fallos.push({ regla: 'otraSeQueda', momento: 2, mensaje: texto('otraSeQueda') });
    if (!t.otraSeQueda && sigueQuieta) fallos.push({ regla: 'otraSeMueve', momento: 2, mensaje: texto('otraSeMueve') });

    // Melodía: ni tritono ni segunda aumentada en ninguna de las dos voces
    ['alta', 'baja'].forEach(voz => {
      for (let k = 0; k < m.length - 1; k++) {
        const a = m[k][voz], b = m[k + 1][voz];
        if (tritono(a, b)) fallos.push({ regla: 'tritono', momento: k, voz, mensaje: texto('tritono', { a: Teoria.texto(a), b: Teoria.texto(b) }) });
        if (segundaAumentada(a, b)) fallos.push({ regla: 'segundaAumentada', momento: k, voz, mensaje: texto('segundaAumentada') });
      }
    });

    /* El esqueleto, sin el retardo: de la preparación a la resolución. Programado porque lo
       necesitan las cadenas y los esquemas; en la célula de tres momentos **no puede
       saltar** (comprobado a fuerza bruta: 470 células, 1.410 comparaciones), y por eso no se
       le anuncia al alumno en el piloto. */
    [[0, 1], [1, 2], [0, 2]].forEach(([a, b]) => {
      const p = paralelas(m[a], m[b]);
      if (p) fallos.push({ regla: 'esqueleto', momento: b, mensaje: texto('esqueleto', { n: p }) });
    });

    return fallos;
  }

  /* ---------- Todas las células de una tonalidad ----------
     Devuelve {celulas, descartadas}: las que pasan las reglas y, para poder mirarlas, las que
     no, con el motivo. Así la página de revisión puede enseñar las dos cosas. */
  function todas(op) {
    const ton = op.tonalidad;
    const tipos = op.tipos && op.tipos.length ? op.tipos : Object.keys(TIPOS);
    const registro = op.registro || REGISTRO;
    const bajo = Teoria.midi(Teoria.nota(registro[0])), alto = Teoria.midi(Teoria.nota(registro[1]));
    const esc = escalera(ton).filter(n => mi(n) >= bajo && mi(n) <= alto);
    const celulas = [], descartadas = [];
    tipos.forEach(tipo => esc.forEach(r => {
      const c = generar({ tonalidad: ton, tipo, retardada: r, dada: op.dada });
      if (c.nula) return;
      const fallos = revisar(c, op);
      if (!fallos.length) celulas.push(c);
      else descartadas.push({ celula: c, fallos });
    }));
    return { celulas, descartadas };
  }

  /* ---------- Corregir la respuesta del alumno ----------
     `respuesta`: { momentos:[{alta, baja}], ligaduras:[{voz, desde}], barra:índice }.
     Vale si coincide con el modelo Y cumple las reglas (2.7). Se dan los dos informes: lo
     que no cumple, con su mensaje, y en qué se diferencia del modelo. */
  function comprobar(celula, respuesta, op) {
    const t = TIPOS[celula.tipo];
    const fallos = [];
    const m = respuesta && respuesta.momentos;
    if (!m || m.length !== 3) return [{ regla: 'incompleta', mensaje: 'Falta alguna nota de la célula.' }];

    const copia = Object.assign({}, celula, {
      momentos: m,
      intervalos: m.map(x => gradosEntre(x.alta, x.baja))
    });
    revisar(copia, op).forEach(f => fallos.push(f));

    // La ligadura de la retardada, que es lo que la hace un retardo
    const ligada = (respuesta.ligaduras || []).some(l => l.voz === celula.vozRetardada && l.desde === 0);
    if (!ligada) fallos.push({ regla: 'ligadura', momento: 0, mensaje: texto('ligadura') });
    if (t.otraSeQueda) {
      const ligadaReal = (respuesta.ligaduras || []).some(l => l.voz === celula.vozReal && l.desde === 1);
      if (!ligadaReal) fallos.push({ regla: 'ligaduraReal', momento: 1, mensaje: texto('ligaduraReal') });
    }
    if (respuesta.barra !== celula.barra) fallos.push({ regla: 'barra', mensaje: texto('barra') });

    /* El error típico del 2–3 (Diego, 14/10): el alumno liga y resuelve la voz equivocada.
       Se reconoce porque su respuesta es la célula con las voces al revés. */
    const alReves = m.every((x, k) => ix(x.alta) === ix(celula.momentos[k].baja) && ix(x.baja) === ix(celula.momentos[k].alta));
    if (alReves) fallos.push({ regla: 'resuelveQuienNoDebe', mensaje: texto('resuelveQuienNoDebe') });

    const diferencias = [];
    m.forEach((x, k) => ['alta', 'baja'].forEach(voz => {
      if (!celula.momentos[k][voz] || ix(x[voz]) !== ix(celula.momentos[k][voz]) || x[voz].alt !== celula.momentos[k][voz].alt)
        diferencias.push({ momento: k, voz, suya: Teoria.texto(x[voz]), modelo: Teoria.texto(celula.momentos[k][voz]) });
    }));

    return { fallos, diferencias, bien: !fallos.length && !diferencias.length };
  }

  /* ---------- Para oírla y para dibujarla ----------
     `aSonido` da lo que `Sonido.secuencia` espera, con la salvedad que hace audible el
     retardo: una nota ligada NO se vuelve a atacar. Los instrumentos sostenidos del
     `sonido.js` del 15/10 ya sostienen la nota común entre dos acordes, así que basta
     mandarle las dos voces de cada momento. */
  function aSonido(celula, segundosPorMomento) {
    const s = segundosPorMomento || 0.9;
    return celula.momentos.map((m, k) => ({ notas: [m.baja, m.alta], segundos: k === 2 ? s * 2 : s, momento: k }));
  }

  // «sol3/si2 → sol3/la2 → fa3/la2», para leerla de un vistazo
  const comoTexto = celula => celula.momentos
    .map(m => Teoria.texto(m.alta) + '/' + Teoria.texto(m.baja))
    .join(' → ');

  return { TIPOS, TONALIDADES, REGISTRO, DISTANCIA_MAXIMA, MENSAJES,
    escalera, generar, revisar, todas, comprobar, aSonido, comoTexto, gradosEntre };
})();
