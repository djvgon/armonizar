/* =====================================================================
   reglas.js — Motor de reglas: propone los cifrados admisibles para
   cada nota de un bajo, a partir de la Regla de la octava (Furno) y de
   las fórmulas acordadas para saltos, arpegios y cadencias.

   Uso:
     Reglas.proponer(ejercicio) → [ {admisibles:[ids], modelo:id, explicacion:'…', regla:'…'}, … ]

   El motor NO es la fuente de verdad de los ejercicios del corpus
   (esos llevan sus respuestas fijadas a mano en ejercicios.js). Sirve
   para: (a) proponer cifrados al profesor en el configurador, (b) dar
   explicaciones en la corrección y (c) comprobarse a sí mismo contra
   el corpus (pruebas.html).

   Cada nota se analiza con una ventana de contexto:
     grado        1..7 (respecto a la escala natural)
     llegada      'inicio' | 'unisono' | '2asc' | '2desc' | 'saltoAsc' | 'saltoDesc'
     salida       'final'  | 'unisono' | '2asc' | '2desc' | 'saltoAsc' | 'saltoDesc'
     gradoSig     grado de la nota siguiente (o null)
     gradoAnt     grado de la nota anterior (o null)

   Las reglas se prueban EN ORDEN; gana la primera que se cumple:
     R1 nota final              R2 penúltima sobre 5̂ (cadencia)
     R3 nota repetida / octava  R4 salto dentro del acorde anterior (arpegio)
     R5 fórmulas funcionales por salto (subdominante → dominante)
     R6 4̂ que salta a una nota del V7 (V4/2 arpegiado)
     R7 Regla de la octava por grados conjuntos (según la nota siguiente)
   Después, las cifras que no estén en el repertorio del ejercicio se
   descartan (y si no queda ninguna, se avisa).
   ===================================================================== */

const Reglas = (() => {

  function movimiento(a, b) {               // a → b (objetos nota)
    const d = Teoria.indice(b) - Teoria.indice(a);
    if (d === 0 || Math.abs(d) === 7) return 'unisono';
    if (d === 1) return '2asc';
    if (d === -1) return '2desc';
    return d > 0 ? 'saltoAsc' : 'saltoDesc';
  }
  const esSalto = m => m === 'saltoAsc' || m === 'saltoDesc';

  // Lista plana de notas del ejercicio (objetos nota).
  function notasDe(ej) {
    const out = [];
    ej.compases.forEach(c => c.forEach(([n]) => out.push(Teoria.nota(n))));
    return out;
  }

  function contexto(notas, i, ton) {
    const n = notas[i], ant = notas[i - 1] || null, sig = notas[i + 1] || null;
    return {
      i, nota: n,
      grado: Teoria.grado(n, ton).grado,
      alt: Teoria.grado(n, ton).alt,
      llegada: ant ? movimiento(ant, n) : 'inicio',
      salida: sig ? movimiento(n, sig) : 'final',
      gradoAnt: ant ? Teoria.grado(ant, ton).grado : null,
      gradoSig: sig ? Teoria.grado(sig, ton).grado : null,
      esUltima: i === notas.length - 1,
      esPenultima: i === notas.length - 2,
      total: notas.length
    };
  }

  const R = (admisibles, explicacion, regla) => ({ admisibles, explicacion, regla });

  /* ---- Las reglas, en orden de precedencia ---- */

  function r1_final(c) {
    if (!c.esUltima) return null;
    if (c.grado === 1) return R(['53'], 'Tónica final: tríada en estado fundamental.', 'R1 final');
    if (c.grado === 5) return R(['53'], 'Semicadencia: dominante en estado fundamental.', 'R1 final');
    return R(['53'], 'Nota final: estado fundamental.', 'R1 final');
  }

  function r2_cadencia(c, notas, ton) {
    if (!c.esPenultima || c.grado !== 5) return null;
    if (c.gradoSig !== 1) return null;
    return R(['53', '7+'], 'Cadencia auténtica: V (o V7, cifrado 7/+) → I.', 'R2 cadencia');
  }

  function r3_repeticion(c, previo) {
    if (c.llegada !== 'unisono' || !previo) return null;
    const adm = [...previo.admisibles];
    if (c.grado === 5 && !adm.includes('7+')) adm.push('7+');
    return R(adm, 'Misma nota que la anterior: se mantiene el acorde' + (c.grado === 5 ? ' (o se añade la 7ª).' : '.'), 'R3 repetición');
  }

  function r4_arpegio(c, previo, notas, ton, repertorio) {
    if (!esSalto(c.llegada) || !previo || !previo.modelo) return null;
    const ant = notas[c.i - 1];
    const claveAnt = Teoria.claveAcorde(previo.modelo, ant, ton);
    const clasesAnt = claveAnt.split(',').map(Number);
    if (!clasesAnt.includes(Teoria.clase(c.nota))) return null;
    const fundAnt = Teoria.clase(Teoria.fundamental(previo.modelo, ant, ton));
    // (a) cifrados sobre ESTE bajo que reproducen exactamente el acorde anterior;
    // (b) cifrados con la misma fundamental cuyas notas son un subconjunto
    //     (por ejemplo V7 → V6: la misma dominante sin la séptima).
    let exactos = [], parciales = [];
    Object.keys(Teoria.CIFRADOS).forEach(id => {
      if (!repertorio.includes(id)) return;
      const clave = Teoria.claveAcorde(id, c.nota, ton);
      if (clave === claveAnt) { exactos.push(id); return; }
      const clases = clave.split(',').map(Number);
      if (clases.every(x => clasesAnt.includes(x)) && Teoria.clase(Teoria.fundamental(id, c.nota, ton)) === fundAnt) parciales.push(id);
    });
    // Si el cifrado diatónico y el marcado producen las mismas notas (6/5 y 6/5̸,
    // 4/3 y +6), el intervalo ya es el de dominante: vale el marcado.
    Object.entries(Teoria.MARCADOS).forEach(([diat, marc]) => {
      if (exactos.includes(diat) && exactos.includes(marc)) exactos = exactos.filter(id => id !== diat);
    });
    // Los cifrados de dominante se anteponen (son los más precisos).
    const orden = id => (Teoria.DOMINANTES.includes(id) ? 0 : 1);
    exactos.sort((a, b) => orden(a) - orden(b));
    const ids = [...exactos, ...parciales];
    if (!ids.length) return null;
    return R(ids, 'Salto dentro del acorde anterior (arpegio): mismo acorde en otra inversión' + (parciales.length ? ' (o sin la séptima)' : '') + '.', 'R4 arpegio');
  }

  function r5_funcional(c) {
    // 6̂ que salta a 4̂ y este va a 5̂: VI–II6–V o IV6–IV–V
    if (c.grado === 6 && c.salida === 'saltoDesc' && c.gradoSig === 4)
      return R(['53', '6'], 'Grado 6 que salta a grado 4 hacia la dominante: VI (o IV6).', 'R5 funcional');
    if (c.grado === 4 && c.llegada === 'saltoDesc' && c.gradoAnt === 6 && c.gradoSig === 5)
      return R(['6', '53', '65'], 'Grado 4 entre grado 6 y grado 5: II6 (o IV, o II6/5) hacia la dominante.', 'R5 funcional');
    // 2̂ que salta a 5̂: II o II7
    if (c.grado === 2 && esSalto(c.salida) && c.gradoSig === 5)
      return R(['53', '7'], 'Grado 2 que salta a la dominante: II (o II7, séptima diatónica), función subdominante.', 'R5 funcional');
    return null;
  }

  function r6_cuartoSalta(c) {
    if (c.grado !== 4 || !esSalto(c.salida)) return null;
    if ([7, 2].includes(c.gradoSig))
      return R(['+4'], 'Grado 4 que salta a una nota del V7: V4/2 que se arpegia.', 'R6 4̂ salta');
    return null;
  }

  function r7_regla_octava(c) {
    const g = c.grado, s = c.salida;
    switch (g) {
      case 1: return R(['53'], 'Grado 1: estado fundamental.', 'R7 RO');
      case 2: return R(['+6', '6'], 'Grado 2: +6 (V7 en segunda inversión); también VII6.', 'R7 RO');
      case 3: return R(['6'], 'Grado 3: primera inversión de la tónica.', 'R7 RO');
      case 4:
        if (s === '2asc') return R(['65', '53'], 'Grado 4 que asciende a grado 5: 6/5 (o IV).', 'R7 RO');
        if (s === '2desc') {
          if (c.llegada === '2desc') return R(['+4'], 'Grado 4 que desciende de grado 5 a grado 3: +4 (V7 en tercera inversión).', 'R7 RO');
          return R(['+4', '53'], 'Grado 4 que desciende a grado 3 (llegando por salto): +4, o IV.', 'R7 RO');
        }
        return R(['53'], 'Grado 4 que ni asciende a grado 5 ni desciende a grado 3: IV en estado fundamental.', 'R7 RO');
      case 5: return R(['53', '7+'], 'Grado 5: dominante (sin 7ª, o V7 cifrado 7/+).', 'R7 RO');
      case 6:
        if (s === '2asc') return R(['6', '53'], 'Grado 6 que asciende a grado 7: 6 (IV6), o VI.', 'R7 RO');
        if (s === '2desc') return R(['43', '+6', '6', '53'], 'Grado 6 que desciende a grado 5: II4/3; o +6 (dominante secundaria del V); o 6; o VI.', 'R7 RO');
        return R(['53', '6'], 'Grado 6 que ni asciende ni desciende por grado: VI (o IV6).', 'R7 RO');
      case 7:
        if (s === '2asc') return R(['65d', '6'], 'Grado 7 que asciende a grado 1: 6/5̸ (V7 en primera inversión), o VII6.', 'R7 RO');
        return R(['6'], 'Grado 7: primera inversión (VII6 / V6).', 'R7 RO');
    }
    return null;
  }

  /* ---- Bucle principal ---- */

  // Todas las notas leídas en una sola tonalidad.
  function proponerEn(ej, ton) {
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const notas = notasDe(ej);
    const salida = [];
    for (let i = 0; i < notas.length; i++) {
      const c = contexto(notas, i, ton);
      const previo = salida[i - 1] || null;
      let r = r1_final(c) || r2_cadencia(c, notas, ton) || r3_repeticion(c, previo)
        || r4_arpegio(c, previo, notas, ton, repertorio) || r5_funcional(c)
        || r6_cuartoSalta(c) || r7_regla_octava(c);
      if (!r) r = R([], 'Sin regla aplicable.', '—');
      const adm = r.admisibles.filter(id => repertorio.includes(id));
      salida.push({
        admisibles: adm,
        modelo: adm[0] || null,
        explicacion: adm.length ? r.explicacion : '⚠ Ninguna cifra del repertorio se ajusta a esta nota (' + r.explicacion + ')',
        regla: r.regla,
        contexto: c
      });
    }
    return salida;
  }

  /* Con modulaciones (ej.modulaciones = [{nota, tonalidad}]), cada tramo se lee en su
     tonalidad: se ejecuta el motor completo en cada tonalidad y se toma de cada
     ejecución la parte que le corresponde. El pivote (primera nota del tramo nuevo)
     debe ser un acorde común a las dos tonalidades: se proponen primero las cifras
     que ambos motores admiten y que dan un acorde común; si no las hay, las cifras
     del catálogo (del repertorio) que producen un acorde común; y si tampoco, se
     avisa. La explicación del pivote lleva los dos grados (II = V). */
  function proponer(ej) {
    const mods = (ej.modulaciones || []).filter(m => m && m.tonalidad && Number.isInteger(m.nota)).slice().sort((a, b) => a.nota - b.nota);
    if (!mods.length) return proponerEn(ej, ej.tonalidad);
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const notas = notasDe(ej);
    const tramos = [{ desde: 0, tonalidad: ej.tonalidad }].concat(mods.map(m => ({ desde: m.nota, tonalidad: m.tonalidad })));
    const ejecuciones = tramos.map(t => proponerEn(ej, t.tonalidad));
    const salida = [];
    for (let i = 0; i < notas.length; i++) {
      let k = 0;
      while (k + 1 < tramos.length && tramos[k + 1].desde <= i) k++;
      const actual = ejecuciones[k][i];
      const esPivote = k > 0 && tramos[k].desde === i;
      if (!esPivote) { salida.push(actual); continue; }
      const tonA = tramos[k - 1].tonalidad, tonB = tramos[k].tonalidad;
      const anterior = ejecuciones[k - 1][i];
      const comun = id => Teoria.acordeComun(id, notas[i], tonA, tonB);
      const romA = id => Teoria.romano(id, notas[i], tonA), romB = id => Teoria.romano(id, notas[i], tonB);
      let ids = [];
      [...actual.admisibles, ...anterior.admisibles].forEach(id => { if (comun(id) && !ids.includes(id)) ids.push(id); });
      let regla = 'Pivote';
      if (!ids.length) {
        ids = Object.keys(Teoria.CIFRADOS).filter(id => repertorio.includes(id) && comun(id));
        regla = 'Pivote (sin RO)';
      }
      const dobles = [];
      ids.forEach(id => { const d = romA(id) + ' de ' + Teoria.nombreCorto(tonA) + ' = ' + romB(id) + ' de ' + Teoria.nombreCorto(tonB); if (!dobles.includes(d)) dobles.push(d); });
      salida.push({
        admisibles: ids,
        modelo: ids[0] || null,
        explicacion: ids.length
          ? 'Acorde pivote, común a las dos tonalidades: ' + dobles.join('; ') + '.'
          : '⚠ Ninguna cifra del repertorio da sobre esta nota un acorde común a ' + Teoria.nombreCorto(tonA) + ' y ' + Teoria.nombreCorto(tonB) + '. Elige otra nota como pivote.',
        regla,
        contexto: actual.contexto,
        pivote: { tonalidadAntes: tonA, tonalidadDespues: tonB }
      });
    }
    return salida;
  }

  return { proponer, proponerEn, contexto, notasDe, movimiento };
})();
