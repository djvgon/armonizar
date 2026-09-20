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

  /* =====================================================================
     Melodía de soprano (Etapa 7). Reglas.proponerSoprano(ej, opciones)

     El alumno responde, para cada nota de la melodía, la fundamental y la cifra;
     el bajo se deduce (Teoria.bajoDe). Aquí se calculan, para cada nota, todos los
     acordes del repertorio que contienen la nota de la melodía (candidatos) y, de
     entre ellos, los que caben en alguna sucesión válida (admisibles), con una
     sucesión modelo elegida por programación dinámica.

       opciones.funciones : lista por nota con 'T' | 'S' | 'D' | null (función fijada
                            por el profesor; los candidatos de otra función se excluyen)

     Devuelve por nota:
       { candidatos: [{id:'V|65d', romano, cifra, bajo:{letra,alt}, funciones:[…],
                       avisos:[…], coste}],
         admisibles: [ids]  (los que están en alguna sucesión válida; la primera es la modelo),
         modelo: id | null, explicacion, regla }

     Sucesiones válidas (enlace entre dos acordes seguidos):
       · no se retrocede de la dominante a la subdominante (D → S), salvo que sea el
         mismo acorde;
       · la sensible en el bajo sube a la tónica (o sigue el mismo acorde, arpegiado);
         la séptima en el bajo (+4) baja de grado;
       · no hay octavas ni quintas seguidas entre el bajo y la soprano;
       · el 6/4 (cadencial) va sobre el 5.º grado y resuelve en V (— o 7/+);
       · la última nota es I o V en estado fundamental (cadencia conclusiva o
         semicadencia).
     Candidatos excluidos de entrada: la nota de la melodía doblada en el bajo cuando es
     sensible o séptima; 6/4 que no sea el cadencial. Se avisa (sin excluir) de la
     tercera doblada en una primera inversión.
     ===================================================================== */

  const RO_PREF = { 1: ['53'], 2: ['+6', '53', '6', '7'], 3: ['6'], 4: ['53', '65', '+4', '6'], 5: ['53', '7+'], 6: ['53', '6', '43', '+6'], 7: ['65d', '6'] };
  const MIEMBRO_TXT = { 0: 'fundamental', 2: 'tercera', 4: 'quinta', 6: 'séptima', 1: 'novena' };

  function claseDe(n) { return Teoria.clase(Teoria.nota(n)); }

  // Candidatos de la nota i (melodía s, tonalidad ton) dentro del repertorio.
  function candidatosSoprano(s, ton, repertorio, esUltima) {
    const out = [];
    const cs = claseDe(s);
    const sensibleTon = (Teoria.clase(Teoria.nota(ton.tonica + '4')) + 11) % 12;
    Teoria.ROMANOS.forEach(romano => {
      repertorio.forEach(id => {
        if (romano === 'III') return;                                   // fuera de la sintaxis diatónica del cuadro (T = I, VI; S = II, IV, VI; D = V, VII)
        if ((id === '65' || id === '43' || id === '7') && romano !== 'II') return;   // séptimas diatónicas: solo el II (II7, II6/5, II4/3)
        if (id === '9' && romano !== 'V') return;
        if (romano === 'VI' && id !== '53') return;                     // el VI solo en estado fundamental (sobre el 1.º grado del bajo siempre va I)
        if (romano === 'VII' && id !== '6') return;                     // el VII solo en primera inversión (VII6), como en la RO
        const b = Teoria.bajoDe(romano, id, ton);
        if (!b) return;
        const bajo = { letra: b.letra, alt: b.alt, octava: 3 };
        const cb = Teoria.clase(bajo);
        const sup = Teoria.vocesSuperiores(id, bajo, ton);
        const clases = [cb, ...sup.map(v => Teoria.clase(v))];
        if (!clases.includes(cs)) return;
        const fund = Teoria.fundamental(id, bajo, ton);
        const letra = n => Teoria.LETRAS.indexOf(Teoria.nota(n).letra);
        const miembroDe = n => ((letra(n) - letra(fund)) % 7 + 7) % 7;
        const sNota = Teoria.nota(s);
        const miembro = miembroDe(sNota);
        // Notas que no se doblan: la sensible de la tonalidad y la tercera de un acorde de dominante
        const sensibles = new Set([sensibleTon]);
        if (Teoria.DOMINANTES.includes(id)) { const t = sup.concat([bajo]).find(n => miembroDe(n) === 2); if (t) sensibles.add(Teoria.clase(t)); }
        const avisos = [];
        if (cs === cb) {
          if (miembro === 6 || miembro === 1) return;                 // séptima (o novena) doblada
          if (sensibles.has(cs)) return;                               // sensible doblada
          if (id === '6' && (romano === 'I' || romano === 'IV' || romano === 'V')) return;   // tercera de una tríada mayor doblada en las voces extremas
          if (id === '6' || id === '65' || id === '65d') avisos.push('dobla la tercera');
        }
        if (id === '64' && !(romano === 'I' && !esUltima)) return;     // solo el 6/4 cadencial (I6/4 sobre el 5.º grado)
        if (esUltima && id !== '53') return;                           // final: estado fundamental
        if (esUltima && romano !== 'I' && romano !== 'V') return;
        const gradoBajo = Teoria.grado(bajo, ton).grado;
        const pref = RO_PREF[gradoBajo] || [];
        let coste = pref.includes(id) ? 3 * pref.indexOf(id) : 8;
        if (avisos.length) coste += 6;
        if (romano === 'VII' || romano === 'III') coste += 3;
        if (id === '64') coste += 2;
        if (id === '9') coste += 4;
        out.push({ id: romano + '|' + id, romano, cifra: id, bajo: b, gradoBajo, funciones: Teoria.funcionesDeAcorde(romano, id),
          miembro, sensibleBajo: sensibles.has(cb), septimaBajo: id === '+4', claseBajo: cb, claseFund: Teoria.clase(fund), avisos, coste });
      });
    });
    return out;
  }

  // ¿Puede seguir el candidato q (nota i) al candidato p (nota i-1)? sp, sq: notas de la melodía.
  function enlaceValido(p, q, sp, sq, fp, fq) {
    const mismoAcorde = p.claseFund === q.claseFund && p.cifra !== '64' && q.cifra !== '64';
    // Funciones: no se retrocede D → S
    const fsP = fp ? [fp] : p.funciones, fsQ = fq ? [fq] : q.funciones;
    if (!mismoAcorde && fsP.every(f => f === 'D') && fsQ.every(f => f === 'S')) return false;
    // Sensible en el bajo: sube a la tónica (semitono) o sigue el mismo acorde
    if (p.sensibleBajo && !mismoAcorde && q.claseBajo !== (p.claseBajo + 1) % 12) return false;
    // Séptima en el bajo (+4): baja de grado
    if (p.septimaBajo && !mismoAcorde) { const d = (p.claseBajo - q.claseBajo + 12) % 12; if (d !== 1 && d !== 2) return false; }
    // 6/4 cadencial: resuelve en V (— o 7/+) sobre el mismo bajo
    if (p.cifra === '64' && !(q.romano === 'V' && (q.cifra === '53' || q.cifra === '7+'))) return false;
    if (q.cifra === '64' && p.cifra === '64') return false;
    // Octavas y quintas seguidas entre bajo y soprano
    const csP = claseDe(sp), csQ = claseDe(sq);
    const ivP = (csP - p.claseBajo + 12) % 12, ivQ = (csQ - q.claseBajo + 12) % 12;
    if (p.claseBajo !== q.claseBajo && csP !== csQ && ivP === ivQ && (ivP === 0 || ivP === 7)) return false;
    return true;
  }

  // Coste del paso p → q (para elegir la sucesión modelo). esFinal: q es el último acorde.
  function costeEnlace(p, q, sp, sq, esFinal = false) {
    let coste = 0;
    const mismoAcorde = p.claseFund === q.claseFund;
    // Movimiento del bajo: por grados, barato; los saltos, según su tamaño
    const bp = Teoria.midi(Object.assign({ octava: 3 }, p.bajo)), bq = Teoria.midi(Object.assign({ octava: 3 }, q.bajo));
    let d = Math.abs(bq - bp); if (d > 6) d = 12 - d;
    coste += d <= 2 ? 0.5 * d : 2;                                     // por grados, casi gratis; los saltos, un poco
    if (mismoAcorde && p.cifra === q.cifra) coste += 3;               // el mismo acorde repetido
    else if (mismoAcorde) coste += 1;                                  // arpegio
    // Sintaxis preferida: S → D mejor que T → D; la plagal (S → T) solo si no hay otra cosa
    if (!mismoAcorde && p.cifra !== '64') {
      const fp = p.funciones, fq = q.funciones;
      if (fp.every(f => f === 'T') && fq.every(f => f === 'D')) coste += 2;
      if (fp.every(f => f === 'S') && fq.every(f => f === 'T') && !esFinal) coste += 3;   // plagal: vale como cadencia final si no hay dominante
    }
    // Quinta u octava directa entre bajo y soprano con salto de la soprano
    const csP = claseDe(sp), csQ = claseDe(sq);
    const ivQ = (csQ - q.claseBajo + 12) % 12;
    const salta = Math.abs(Teoria.midi(Teoria.nota(sq)) - Teoria.midi(Teoria.nota(sp))) > 2;
    const dirB = Math.sign(bq - bp), dirS = Math.sign(Teoria.midi(Teoria.nota(sq)) - Teoria.midi(Teoria.nota(sp)));
    if (salta && dirB && dirB === dirS && (ivQ === 0 || ivQ === 7)) coste += 5;
    return coste;
  }

  function proponerSoprano(ej, opciones = {}) {
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const notas = notasDe(ej);
    const n = notas.length;
    const tons = Teoria.tonalidadesPorNota(ej);
    const forzadas = Array.isArray(opciones.funciones) ? opciones.funciones : [];
    // Candidatos por nota: todos los que contienen la nota (se devuelven para la revisión) y,
    // para las sucesiones, solo los de la función fijada, si la hay
    const candsTodos = notas.map((s, i) => candidatosSoprano(s, tons[i], repertorio, i === n - 1));
    const cands = candsTodos.map((cs, i) => (forzadas[i] ? cs.filter(x => x.funciones.includes(forzadas[i])) : cs.slice()));
    /* Comienzo y cadencia final (reglas de Diego, 20/9/2026), salvo en las notas con la
       función fijada por el profesor:
         · se empieza por la tónica (I); si la nota no está en I, por la dominante (anacrusa);
           nunca por el VI;
         · la frase acaba S – D – T siempre que la melodía lo permita: penúltima nota,
           dominante; antepenúltima, subdominante (solo subdominantes, si la nota admite
           alguna); y, si se puede, 6/4 cadencial: cuando la nota anterior a la dominante
           es de la tónica y la dominante va en estado fundamental, el I6/4 es el modelo
           (con las subdominantes también admitidas) y la subdominante pasa a la nota anterior;
         · en una semicadencia (final en V), la penúltima nota lleva subdominante si puede. */
    const esFun = (x, f) => x.funciones.includes(f);
    const soloFun = (cs, f) => { const s = cs.filter(x => esFun(x, f)); return s.length ? s : null; };
    if (n > 0 && !forzadas[0]) {
      const c0 = cands[0].filter(x => x.cifra !== '64');
      const tonica = c0.filter(x => x.romano === 'I');
      const dominante = c0.filter(x => x.romano === 'V' || x.romano === 'VII');
      cands[0] = tonica.length ? tonica : dominante.length ? dominante : c0;
    }
    let con64 = false, plagal = false;
    if (n >= 3 && !forzadas[n - 1]) {
      const finalEnI = cands[n - 1].some(x => x.romano === 'I');
      if (finalEnI) {
        if (!forzadas[n - 2]) {
          const d = (() => { const x = cands[n - 2].filter(y => esFun(y, 'D') && y.cifra !== '64'); return x.length ? x : null; })();   // dominante de verdad (el 6/4 no cuenta)
          if (d) cands[n - 2] = d;
          else { const s = soloFun(cands[n - 2], 'S'); if (s) { cands[n - 2] = s; plagal = true; } }   // sin dominante posible: cadencia plagal
        }
        if (n >= 4 && !forzadas[n - 3] && !plagal) {
          const seisCuatro = cands[n - 3].filter(x => x.romano === 'I' && x.cifra === '64');
          const vRaiz = cands[n - 2].some(x => x.romano === 'V' && (x.cifra === '53' || x.cifra === '7+'));
          if (seisCuatro.length && vRaiz) {
            con64 = true;
            seisCuatro.forEach(x => { x.coste = -4; });
            cands[n - 3] = seisCuatro.concat(cands[n - 3].filter(x => x.cifra !== '64' && esFun(x, 'S')));
          }
        }
        // Subdominante antes de la dominante (o antes del 6/4 cadencial), siempre que la nota lo permita
        const posS = con64 ? n - 4 : n - 3;
        if (!plagal && posS >= 1 && !forzadas[posS]) { const s = soloFun(cands[posS], 'S'); if (s) cands[posS] = s; }
      } else if (cands[n - 1].some(x => x.romano === 'V') && !forzadas[n - 2]) {
        const s = soloFun(cands[n - 2], 'S');
        if (s) cands[n - 2] = s;
        else { const noD = cands[n - 2].filter(x => !x.funciones.every(f => f === 'D')); if (noD.length) cands[n - 2] = noD; }
      }
    }
    // El 6/4 solo como cadencial, en su sitio (la nota anterior a la dominante final)
    for (let i = 0; i < n; i++) if (!(con64 && i === n - 3)) cands[i] = cands[i].filter(x => x.cifra !== '64' || forzadas[i]);
    // Programación dinámica hacia delante: mejor coste de llegar a cada candidato
    const capas = cands.map((cs, i) => cs.map(x => ({ x, coste: Infinity, ant: null, alcanzable: false })));
    capas[0].forEach(nd => { nd.coste = nd.x.coste + (nd.x.romano === 'I' ? 0 : 4) + (nd.x.cifra === '53' ? 0 : 2); nd.alcanzable = true; });   // empezar en I, mejor en estado fundamental
    for (let i = 1; i < n; i++) {
      capas[i].forEach(nd => {
        capas[i - 1].forEach((pv, k) => {
          if (!pv.alcanzable || !enlaceValido(pv.x, nd.x, notas[i - 1], notas[i], forzadas[i - 1], forzadas[i])) return;
          let extra = nd.x.coste + costeEnlace(pv.x, nd.x, notas[i - 1], notas[i], i === n - 1);
          // Cadencia: mejor V en estado fundamental → I (perfecta); antes, mejor una subdominante (T S D T) o el 6/4 cadencial
          if (i === n - 1) extra += (pv.x.romano === 'V' && (pv.x.cifra === '53' || pv.x.cifra === '7+')) ? 0 : pv.x.funciones.every(f => f === 'D') ? 3 : plagal ? 0 : pv.x.funciones.includes('S') ? 4 : 6;
          if (i === n - 2 && n > 3) extra += (pv.x.cifra === '64' || pv.x.funciones.includes('S')) ? 0 : 4;
          const total = pv.coste + extra;
          if (total < nd.coste) { nd.coste = total; nd.ant = k; }
        });
        nd.alcanzable = nd.coste < Infinity;
      });
    }
    // Hacia atrás: qué candidatos llegan al final por un camino válido
    const util = capas.map(capa => capa.map(() => false));
    capas[n - 1].forEach((nd, k) => { util[n - 1][k] = nd.alcanzable; });
    for (let i = n - 1; i > 0; i--) {
      capas[i].forEach((nd, k) => {
        if (!util[i][k]) return;
        capas[i - 1].forEach((pv, j) => { if (pv.alcanzable && enlaceValido(pv.x, nd.x, notas[i - 1], notas[i], forzadas[i - 1], forzadas[i])) util[i - 1][j] = true; });
      });
    }
    // Camino modelo
    const modeloIdx = new Array(n).fill(null);
    let mejor = null;
    capas[n - 1].forEach((nd, k) => { if (nd.alcanzable && (mejor === null || nd.coste < capas[n - 1][mejor].coste)) mejor = k; });
    if (mejor !== null) { let k = mejor; for (let i = n - 1; i >= 0; i--) { modeloIdx[i] = k; k = capas[i][k].ant; } }
    return notas.map((s, i) => {
      const cs = cands[i];
      const admIdx = cs.map((_, k) => k).filter(k => util[i][k]);
      const orden = k => (modeloIdx[i] === k ? -1 : cs[k].coste);
      admIdx.sort((a, b) => orden(a) - orden(b));
      const admisibles = admIdx.map(k => cs[k].id);
      const modelo = modeloIdx[i] !== null ? cs[modeloIdx[i]] : (admIdx.length ? cs[admIdx[0]] : null);
      let explicacion;
      if (!cs.length) explicacion = '⚠ Ningún acorde del repertorio contiene esta nota' + (forzadas[i] ? ' con la función ' + forzadas[i] : '') + '.';
      else if (!modelo) explicacion = '⚠ Ninguno de los acordes que contienen esta nota encaja en una sucesión válida (revisa las funciones o el repertorio).';
      else {
        const cif = Teoria.CIFRADOS[modelo.cifra].etiqueta;
        const f = forzadas[i] || Teoria.funcionDe(modelo.romano, i + 1 < n && modeloIdx[i + 1] !== null ? cands[i + 1][modeloIdx[i + 1]].romano : null);
        explicacion = Teoria.nombreEs(Teoria.nota(s)) + ' es la ' + MIEMBRO_TXT[modelo.miembro] + ' de ' + modelo.romano + (cif === '—' ? '' : ' ' + cif)
          + ' (bajo ' + Teoria.nombreEs(modelo.bajo) + '; función ' + f + ', ' + Teoria.NOMBRE_FUNCION[f] + ')' + (modelo.avisos.length ? '; ' + modelo.avisos.join(', ') : '') + '.';
      }
      return { candidatos: candsTodos[i], admisibles, modelo: modelo ? modelo.id : null, explicacion, regla: 'Melodía', contexto: { i, nota: Teoria.nota(s), grado: Teoria.grado(s, tons[i]).grado } };
    });
  }

  // Candidato (como los de proponerSoprano) que corresponde a la respuesta del alumno en la
  // nota i, o null si esa combinación no contiene la nota de la melodía o no es válida.
  function candidatoDe(ej, i, romano, cifra) {
    if (!romano || !cifra) return null;
    const notas = notasDe(ej);
    const ton = Teoria.tonalidadesPorNota(ej)[i];
    return candidatosSoprano(notas[i], ton, [cifra], false).find(x => x.romano === romano) || null;
  }

  // Enlace entre las respuestas del alumno en las notas i-1 e i: {ok, motivo}
  function enlaceAlumno(ej, i, parAnt, parAct) {
    const p = candidatoDe(ej, i - 1, parAnt.romano, parAnt.cifra), q = candidatoDe(ej, i, parAct.romano, parAct.cifra);
    if (!p || !q) return { ok: true, motivo: '' };
    const notas = notasDe(ej);
    if (enlaceValido(p, q, notas[i - 1], notas[i])) return { ok: true, motivo: '' };
    const mismoAcorde = p.claseFund === q.claseFund;
    let motivo = 'el enlace con el acorde anterior no es correcto';
    if (p.sensibleBajo && !mismoAcorde && q.claseBajo !== (p.claseBajo + 1) % 12) motivo = 'la sensible en el bajo (' + Teoria.nombreEs(p.bajo) + ') ha de subir a la tónica';
    else if (p.septimaBajo && !mismoAcorde) motivo = 'la séptima en el bajo (' + Teoria.nombreEs(p.bajo) + ') ha de bajar de grado';
    else if (p.cifra === '64') motivo = 'el 6/4 cadencial resuelve en V sobre el mismo bajo';
    else if (!mismoAcorde && p.funciones.every(f => f === 'D') && q.funciones.every(f => f === 'S')) motivo = 'no se vuelve de la dominante a la subdominante';
    else {
      const csP = Teoria.clase(Teoria.nota(notas[i - 1])), csQ = Teoria.clase(Teoria.nota(notas[i]));
      const iv = (csP - p.claseBajo + 12) % 12;
      if (iv === 0) motivo = 'octavas seguidas entre el bajo y la melodía';
      else if (iv === 7) motivo = 'quintas seguidas entre el bajo y la melodía';
      void csQ;
    }
    return { ok: false, motivo };
  }

  return { proponer, proponerEn, proponerSoprano, candidatoDe, enlaceAlumno, contexto, notasDe, movimiento };
})();
