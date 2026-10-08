/* =====================================================================
   banco.js — El banco de fragmentos con etiquetas, y las fichas.

   Un BANCO es una lista de fragmentos ya analizados. Cada entrada guarda la
   música (una voz o las dos), las respuestas admisibles que dio el motor y un
   puñado de ETIQUETAS que salen solas del propio análisis: lección, tonalidad,
   modo, alteraciones de la armadura, número de notas y de compases, qué cifras
   y qué grados usa la respuesta modelo, si modula y un nivel de dificultad.

   Una FICHA es un filtro sobre el banco más un tipo de ejercicio: «ocho
   armonizaciones de bajo de la lección A3-5, de nivel 1 a 3». La página del
   alumno lee el banco publicado (banco.json, junto a la aplicación), aplica el
   filtro, baraja y encadena los ejercicios que salgan.

   Uso:
     Banco.entrada(fragmento, {leccion, fuente, autor, obra, repertorio, acordes, formulaTST})
         → una entrada con sus etiquetas, o null si el fragmento no sirve
     Banco.nivel(entrada, modo)       → nivel 1-5 ajustado al tipo de ejercicio
     Banco.filtrar(entradas, filtro)  → las que cumplen el filtro
     Banco.elegir(entradas, filtro)   → N al azar de las que cumplen
     Banco.ejercicio(entrada, filtro) → un ejercicio listo para la página del alumno
     Banco.codificar(filtro) / Banco.decodificar(texto)   → para el #f= de la URL
     Banco.MODOS                      → los cuatro tipos, con su nombre

   Nada de esto necesita conexión ni servidor: el banco es un archivo .json que
   el profesor descarga del configurador y sube al repositorio.
   ===================================================================== */

const Banco = (() => {

  const VERSION = 1;

  /* `pagina` es la portada de cada tipo: una dirección distinta por tipo de ejercicio, para
     que Classroom etiquete el enlace con el nombre que le corresponde (decisión 58). Todas
     llevan al mismo index.html conservando el ejercicio. */
  const MODOS = [
    { id: 'cifrar', nombre: 'Análisis', ajuste: -1, voz: 'bajo', pagina: 'analisis.html', etiqueta: 'Análisis armónico' },
    { id: 'armonizar', nombre: 'Armonización de bajo', ajuste: 0, voz: 'bajo', pagina: 'armonizacion-bajo.html', etiqueta: 'Armonización de melodía de bajo' },
    { id: 'audicion', nombre: 'Audición', ajuste: 1, voz: 'bajo', pagina: 'audicion.html', etiqueta: 'Reconocimiento auditivo' },
    { id: 'soprano', nombre: 'Armonización de soprano', ajuste: 1, voz: 'soprano', pagina: 'armonizacion-soprano.html', etiqueta: 'Armonización de melodía de soprano' }
  ];
  const modoDe = id => MODOS.find(m => m.id === id) || MODOS[1];
  const vozDeModo = id => modoDe(id).voz;
  const paginaDeModo = id => modoDe(id).pagina;

  /* Los dos avisos que son DE UNA VOZ. Se escriben una sola vez para poder reconocerlos
     después: un aviso de la melodía no tiene por qué tapar el ejercicio de bajo. */
  const AVISO_BAJO = 'alguna nota del bajo se queda sin cifra posible';
  const AVISO_SOPRANO = 'alguna nota de la melodía se queda sin acorde posible';

  /* ---------- Etiquetas ---------- */

  // Nivel base (1-5) del fragmento, por la música: cuántas notas, cuántas cifras
  // distintas usa el modelo, cuántas alteraciones tiene la armadura, si es menor
  // y si modula. El tipo de ejercicio se suma después (ver nivel()).
  function nivelBase(et) {
    let p = 0;
    p += et.notas <= 4 ? 0 : et.notas <= 7 ? 1 : et.notas <= 11 ? 2 : 3;
    const distintas = (et.cifras || []).length;
    p += distintas <= 2 ? 0 : distintas <= 4 ? 1 : 2;
    p += et.alteraciones <= 1 ? 0 : et.alteraciones <= 3 ? 1 : 2;
    if (et.modo === 'menor') p += 1;
    if (et.modula) p += 2;
    return p <= 1 ? 1 : p <= 3 ? 2 : p <= 5 ? 3 : p <= 7 ? 4 : 5;
  }

  // Nivel de una entrada para un tipo de ejercicio: el manual, si lo hay, o el
  // calculado; armonizar una soprano cuesta más que armonizar un bajo, y ver ya
  // la realización (Análisis) cuesta menos.
  function nivel(entrada, modo) {
    const base = entrada.nivelManual || (entrada.etiquetas && entrada.etiquetas.nivel) || 1;
    const n = base + (modo ? modoDe(modo).ajuste : 0);
    return Math.max(1, Math.min(5, n));
  }

  /* ---------- Construir una entrada a partir de un fragmento importado ---------- */

  /* ---------- LA REJILLA DE ACORDES (decisión 238) ----------
     Diego, 4/10/2026. Dos observaciones suyas, en este orden:
     «Aunque haya una blanca, que pueda haber sobre ella dos números de acorde… el la de la
     soprano sirve tanto para el sol negra como para el fa negra»; y después: «las corcheas
     de la soprano no todas implican cambio de acorde, sino que las armonías van al ritmo
     de las notas del bajo… también puede suceder que sea el bajo el que se mueva en
     corcheas y la soprano en ritmo de acorde: por ejemplo, el do corchea del final, que no
     le corresponde acorde ninguno».

     Esto es RITMO ARMÓNICO, y hasta aquí la aplicación no lo tenía: daba por supuesto que
     cada nota escrita lleva un acorde y solo uno. En un fragmento de práctica eso es cierto
     porque las dos voces se escriben al mismo paso; en música de verdad no.

     LA REGLA. No manda ninguna de las dos voces: manda el PULSO. Hay acorde en cada
     momento en que ataca alguna de las dos voces y ese momento cae en parte del compás;
     lo que ataca a contratiempo es nota de paso, bordadura o escapada, y no lleva acorde.
     Así sale bien en los dos sentidos —la blanca de la soprano recibe los dos acordes de
     las dos negras del bajo, y el do corchea del bajo no recibe ninguno— sin tener que
     decidir quién lleva la voz cantante. Además se exige que las DOS voces estén sonando:
     donde el bajo calla no hay acorde, que es lo que pasa en la anacrusa.

     LO QUE LA REGLA NO VE: una armonía sincopada de verdad, que cambie a contratiempo.
     Para eso —y para cualquier excepción— el profesor retoca la rejilla a mano en el
     configurador, y lo que él marque manda (la rejilla viaja en `opciones.rejilla`).

     QUÉ SE GUARDA. En la entrada, las dos voces TAL COMO ESTÁN ESCRITAS y, aparte,
     `rejilla`: los momentos en que hay acorde, en negras desde el principio del fragmento.
     Las respuestas van por ACORDE, no por nota, y las dos voces tienen por fuerza las
     mismas, que para eso es la misma armonía. Al construir el ejercicio, la voz se
     REMUESTREA sobre la rejilla —en cada acorde, la nota que está sonando—, de modo que el
     motor, la corrección, el recorrido y el registro siguen viendo exactamente un acorde
     por nota y no se enteran de nada. La voz escrita viaja aparte, solo para dibujarla. */

  // Acontecimientos de una voz con su momento absoluto, en negras desde el principio
  function conTiempo(compases) {
    const out = [];
    let t = 0;
    (compases || []).forEach(c => c.forEach(([n, d]) => { out.push({ nota: n, dur: d, t }); t += d; }));
    return out;
  }

  // Momento en que empieza cada compás (y, al final, el final del fragmento)
  function iniciosDeCompas(compases) {
    const out = [];
    let t = 0;
    (compases || []).forEach(c => { out.push(t); c.forEach(([, d]) => { t += d; }); });
    out.push(t);
    return out;
  }

  /* El PULSO del compás, en negras: 4/4 y 3/4 → negra · 2/2 → blanca · 6/8, 9/8 y 12/8 →
     negra con puntillo · 3/8 → corchea. Es lo que decide qué es «caer en parte». */
  function pulso(compas) {
    const num = (compas && compas[0]) || 4, den = (compas && compas[1]) || 4;
    if (den === 2) return 2;
    if (den === 8) return (num % 3 === 0 && num > 3) ? 1.5 : 0.5;
    if (den === 16) return 0.25;
    return 1;
  }

  // ¿Suena esa voz en ese momento? (dentro de una nota, no de un silencio ni fuera)
  function sonandoEn(evs, t) {
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i];
      if (t >= e.t - 0.01 && t < e.t + e.dur - 0.01) return e.nota !== null && e.nota !== undefined;
    }
    return false;
  }

  /* Los momentos que PODRÍAN llevar acorde: ataca alguna de las dos voces y las dos están
     sonando. Es la lista que se le ofrece al profesor en el configurador para marcar y
     desmarcar; la regla del pulso solo elige dentro de ella. */
  function candidatas(cb, cs) {
    const eb = conTiempo(cb), es = conTiempo(cs);
    if (!eb.length || !es.length) return [];
    const ts = [];
    eb.concat(es).forEach(e => {
      if (e.nota === null || e.nota === undefined) return;
      if (!ts.some(x => Math.abs(x - e.t) < 0.01)) ts.push(e.t);
    });
    ts.sort((a, b) => a - b);
    return ts.filter(t => sonandoEn(eb, t) && sonandoEn(es, t));
  }

  // ¿Cae ese momento en parte del compás?
  function enParte(t, inicios, p) {
    let inicio = 0;
    for (let i = 0; i < inicios.length - 1; i++) if (t >= inicios[i] - 0.01) inicio = inicios[i];
    const q = (t - inicio) / p;
    return Math.abs(q - Math.round(q)) < 0.01;
  }

  // La rejilla que propone la regla: las candidatas que caen en parte
  function rejillaAutomatica(cb, cs, compas) {
    const inicios = iniciosDeCompas(cb && cb.length ? cb : cs);
    const p = pulso(compas);
    return candidatas(cb, cs).filter(t => enParte(t, inicios, p));
  }

  /* La voz vista desde la rejilla: un acontecimiento por acorde, con la nota que esté
     sonando en ese momento. Cada uno dura hasta el acorde siguiente (el último, hasta el
     final), y se guarda en el compás en el que empieza. */
  function enRejilla(compases, rejilla) {
    if (!rejilla || !rejilla.length) return compases;
    const evs = conTiempo(compases);
    const inicios = iniciosDeCompas(compases);
    const total = inicios[inicios.length - 1];
    const fuera = (compases || []).map(() => []);
    rejilla.forEach((t, i) => {
      const hasta = (i + 1 < rejilla.length) ? rejilla[i + 1] : total;
      let nota = null;
      for (let q = 0; q < evs.length; q++) {
        const e = evs[q];
        if (t >= e.t - 0.01 && t < e.t + e.dur - 0.01) { nota = e.nota; break; }
      }
      let ci = 0;
      for (let q = 0; q < inicios.length - 1; q++) if (t >= inicios[q] - 0.01) ci = q;
      if (fuera[ci]) fuera[ci].push([nota, Math.max(hasta - t, 0.25)]);
    });
    return fuera;
  }

  /* LA NOTA REAL DE LA MELODÍA EN CADA ACORDE (decisión 238, Diego 4/10/2026: «ese si
     corchea no es nota real, sino nota de paso en tiempo fuerte, y la nota real es el do
     –buf, qué lío para computarlo como regla, eh?–, y lo mismo con el fa♯: la nota real es
     el mi de a continuación»).

     Una nota de paso puede caer EN PARTE, justo donde empieza el acorde. Entonces la nota
     que representa a la melodía en ese acorde no es la que ataca con él, sino la siguiente.
     Y no es ningún lío de computar, porque el BAJO lo dice: en estos fragmentos está
     escrito y ya lo ha analizado el motor. De las notas de la melodía que ATACAN dentro del
     acorde se toma la primera que forme acorde con el bajo —la que cabe en alguno de los
     cifrados que el motor admite ahí—; si ninguna cabe, o si la melodía no ataca en ese
     tramo porque viene ligada, se deja la que suena, que es lo de siempre.

     La prueba es la misma que usa `preferir` para poner delante el acorde que encaja con la
     otra voz, de modo que las dos piezas hablan del mismo acorde.

     Devuelve una lista por acorde: la nota elegida, o `null` cuando es la de siempre. */
  function notasReales(compasesS, rejilla, vb, respuestasBajo, ton, mods) {
    if (!rejilla || !rejilla.length || !respuestasBajo || !compasesS) return null;
    const evS = conTiempo(compasesS).filter(e => e.nota !== null && e.nota !== undefined);
    if (!evS.length) return null;
    const bajos = Teoria.notasDeCompases(vb).map(n => Teoria.nota(n));
    const total = iniciosDeCompas(compasesS).slice(-1)[0];
    let tons = null;
    try { tons = Teoria.tonalidadesPorNota({ compases: vb, tonalidad: ton, modulaciones: mods || [] }); }
    catch (e) { tons = null; }
    const clase = n => Teoria.clase(Teoria.nota(n));
    let alguna = false;
    const fuera = rejilla.map((t, i) => {
      const hasta = (i + 1 < rejilla.length) ? rejilla[i + 1] : total;
      const dentro = evS.filter(e => e.t >= t - 0.01 && e.t < hasta - 0.01);
      if (dentro.length < 2 || !bajos[i]) return null;        // nada que elegir
      const tonI = (tons && tons[i]) || ton;
      const cabe = nota => (respuestasBajo[i] || []).some(id => {
        try {
          const tt = Teoria.tonParaBajo(id, bajos[i], tonI, Teoria.nota(nota));
          return [clase(bajos[i]), ...Teoria.vocesSuperiores(id, bajos[i], tt).map(v => Teoria.clase(v))]
            .includes(clase(nota));
        } catch (e) { return false; }
      });
      if (cabe(dentro[0].nota)) return null;                  // la que ataca ya es la buena
      const buena = dentro.slice(1).find(e => cabe(e.nota));
      if (!buena) return null;                                // ninguna cabe: se deja como está
      alguna = true;
      return buena.nota;
    });
    return alguna ? fuera : null;
  }

  // Aplica las notas reales a la voz ya remuestreada (una por acorde, en orden)
  function conNotasReales(compases, reales) {
    if (!reales || !reales.length) return compases;
    let i = 0;
    return (compases || []).map(c => c.map(([n, d]) => {
      const nueva = reales[i++];
      return [nueva || n, d];
    }));
  }

  /* Dónde cae cada modulación cuando se pasa a la rejilla: el índice que traía era de
     notas escritas y pasa a ser de acordes. Se va al primer acorde que empiece en esa
     nota o después de ella, que es donde empieza a regir la tonalidad nueva. */
  function modulacionesEnRejilla(mods, compases, rejilla) {
    if (!rejilla || !rejilla.length || !mods || !mods.length) return mods || [];
    const notas = conTiempo(compases).filter(e => e.nota !== null && e.nota !== undefined);
    return mods.map(m => {
      const e = notas[m.nota];
      if (!e) return m;
      let k = rejilla.findIndex(t => t >= e.t - 0.01);
      if (k < 0) k = rejilla.length - 1;
      return Object.assign({}, m, { nota: k });
    });
  }

  // Por cada nota de una voz, la nota de la otra que suena a la vez (fija el modelo)
  function companera(propios, otros) {
    if (!otros || !otros.length || !propios || !propios.length) return null;
    const propias = MusicXML.conTiempos(propios), otras = MusicXML.conTiempos(otros);
    if (!propias.length || !otras.length) return null;
    return propias.map(p => {
      let mejor = null;
      otras.forEach(o => { if (o.tiempo <= p.tiempo + 0.01) mejor = o.nota; });
      return mejor;
    });
  }

  /* La voz escrita que no se usa solo REORDENA las admisibles: pone delante la que
     encaja con ella. No añade ni quita ninguna; las demás armonizaciones correctas
     siguen siendo válidas.
     Ordena cada lista de admisibles poniendo delante el acorde que contiene la nota que
     suena a la vez en la OTRA voz, para que el modelo del bajo y el de la melodía hablen
     del mismo acorde. No toca las notas que fijó la sintaxis de la cadencia (`fijados`):
     ahí manda la regla de Diego —subdominante antes de la dominante, dominante antes de
     la tónica— por encima de la coincidencia entre las dos voces. */
  function preferir(respuestas, compases, comp, ton, mods, esSop, fijados, modeloOtra) {
    if (!comp) return respuestas;
    const ej = { compases, tonalidad: ton, modulaciones: mods || [] };
    let tons;
    try { tons = Teoria.tonalidadesPorNota(ej); } catch (e) { return respuestas; }
    const notas = Teoria.notasDeCompases(compases);
    /* LA CLASE DE ALTURA, SIN DEPENDER DE LA OCTAVA (4/10/2026). `Teoria.bajoDe` devuelve
       el bajo del acorde SIN octava —solo le hace falta decir qué nota es—, y la clase se
       calcula a partir de la nota midi, que sin octava sale NaN. La comparación daba
       siempre falso y esta preferencia NO SE ESTABA APLICANDO NUNCA en la melodía: el
       modelo del fragmento acababa siendo el primero que proponía el motor y no el acorde
       que de verdad encaja con el bajo escrito. Se le pone una octava cualquiera, que para
       comparar clases de altura da igual. */
    const clase = n => {
      const x = Teoria.nota(n);
      return Teoria.clase(x.octava === undefined ? { letra: x.letra, alt: x.alt, octava: 3 } : x);
    };
    return respuestas.map((adm, i) => {
      if (!adm || adm.length < 2 || !comp[i] || !notas[i]) return adm;
      if (fijados && fijados[i]) return adm;
      let bueno = null;
      try {
        const cuadra = id => {
          if (esSop) {
            const pr = Ejercicios.par(id);
            const t = Teoria.tonParaAcorde(pr.romano, pr.cifra, tons[i], notas[i]);
            const b = Teoria.bajoDe(pr.romano, pr.cifra, t);
            return b && clase(b) === clase(comp[i]);
          }
          const t = Teoria.tonParaBajo(id, notas[i], tons[i], comp[i]);
          return [clase(notas[i]), ...Teoria.vocesSuperiores(id, notas[i], t).map(v => Teoria.clase(v))].includes(clase(comp[i]));
        };
        const buenos = adm.filter(cuadra);
        /* Y ENTRE LOS QUE CUADRAN, EL DEL MISMO CIFRADO QUE LA OTRA VOZ (4/10/2026). Sobre
           un mismo bajo caben el 6 y el 6/5̸ —con séptima y sin ella—, y mirando solo la
           nota del bajo se quedaba el primero que propusiera el motor. Cuando la otra voz
           ya tiene su modelo, se toma el acorde que dice lo mismo que ella, de modo que el
           bajo y la melodía del fragmento describen la MISMA armonía. */
        bueno = (modeloOtra && buenos.find(id => Ejercicios.cifraDe(id) === modeloOtra[i])) || buenos[0] || null;
      } catch (e) { bueno = null; }
      return bueno ? [bueno, ...adm.filter(x => x !== bueno)] : adm;
    });
  }

  function analizar(compases, ton, mods, esSop, opciones) {
    const ej = {
      modo: esSop ? 'soprano' : 'armonizar',
      tonalidad: ton,
      compas: opciones.compas || [4, 4],
      compases,
      repertorio: opciones.repertorio || Ejercicios.REPERTORIO_RO,
      modulaciones: (mods || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } }))
    };
    // La lista de acordes de la lección vale para las dos maneras: en la melodía limita los
    // candidatos y en el bajo dice si se admiten las dominantes secundarias (II+6).
    if (opciones.acordes && opciones.acordes.length) ej.acordes = opciones.acordes.slice();
    // La otra voz escrita, nota a nota: el motor la usa para elegir entre las admisibles
    if (!esSop && opciones.companera) ej.companera = opciones.companera;
    if (esSop && opciones.formulaTST === false) ej.formulaTST = false;
    let prop;
    try { prop = esSop ? Reglas.proponerSoprano(ej) : Reglas.proponer(ej); } catch (e) { return null; }
    if (!prop || !prop.length) return null;
    const respuestas = prop.map(p => (p.admisibles || []).slice());
    const fijados = prop.map(p => !!(p && p.fijado));
    if (respuestas.some(r => !r.length)) return { respuestas, fijados, incompleto: true, ej };
    return { respuestas, fijados, incompleto: false, ej };
  }

  /* Un fragmento acaba en la tónica (cadencia) o en la dominante (semicadencia). Si el
     último acorde no es ni lo uno ni lo otro, es que la tonalidad del final no es la que
     dice el fragmento: falta un rótulo de vuelta a la tonalidad de partida, o sobra la
     modulación. Se avisa para que el profesor lo arregle en la partitura. */
  function finalExtrano(parte, ton, compas) {
    try {
      const notas = Teoria.notasDeCompases(parte.compases).map(n => Teoria.nota(n));
      const i = parte.respuestas.length - 1;
      const id = (parte.respuestas[i] || [])[0];
      if (!id || !notas[i]) return null;
      const tons = Teoria.tonalidadesPorNota({ tonalidad: ton, compas, compases: parte.compases, modulaciones: parte.modulaciones || [] });
      const rom = Teoria.romano(id, notas[i], tons[i]);
      if (rom === 'I' || rom === 'V') return null;
      return 'el fragmento acaba en el ' + rom + ' de ' + Teoria.nombreCorto(tons[i])
        + ', ni cadencia ni semicadencia: revisa la tonalidad del final (quizá falta el rótulo de vuelta a la tonalidad de partida)';
    } catch (e) { return null; }
  }

  /* ---- La tonalidad que de verdad cuadra ----
     Una armadura sirve para dos tonalidades, y la app elige entre ellas por cómo empieza y
     cómo acaba el fragmento. Eso falla en las SEMICADENCIAS: un fragmento en la menor que
     acaba en mi se lee como mi menor si la armadura no lo desmiente, porque acabar en la
     tónica es el indicio más fuerte. La prueba definitiva la da el repertorio de la
     lección: si con la tonalidad deducida hay notas del bajo que no admiten ningún acorde,
     esa tonalidad es la equivocada. Entonces se prueban las candidatas
     (Teoria.tonalidadesCandidatas: la relativa, la última nota como tónica y la última nota
     como 5.º grado) y se toma la primera en la que TODAS las notas del bajo tienen cifra.
     Solo se aplica cuando hay bajo y el fragmento no modula: en el bajo dado cada nota ha
     de llevar acorde, así que quedarse sin cifra es prueba de verdad; en una melodía de
     soprano no lo es. */
  /* ¿La armadura escrita es de verdad la del fragmento? Si la tonalidad corregida lleva
     las mismas alteraciones, solo se había equivocado el MODO (una armadura vale para dos
     tonalidades) y no hay nada que arreglar en la partitura: se corrige en silencio. Si
     lleva otras, la armadura está mal escrita y hay que decírselo al profesor. */
  const armaduraMal = (escrita, real) => {
    try { return Teoria.armadura(escrita) !== Teoria.armadura(real); } catch (e) { return false; }
  };
  const avisoDeArmadura = (escrita, real, ultimaBajo) => {
    let semi = false;
    try { semi = !!ultimaBajo && Teoria.grado(Teoria.nota(ultimaBajo), real).grado === 5; } catch (e) { semi = false; }
    return 'la armadura escrita es la de ' + Teoria.nombreCorto(escrita)
      + ', pero con ella hay notas del bajo que se quedan sin cifra: el fragmento está en '
      + Teoria.nombreCorto(real) + (semi ? ' y acaba en semicadencia sobre la dominante' : '')
      + '. Corrige la armadura en la partitura.';
  };

  /* ---- La sensible manda sobre el modo (decisión 97, regla de Diego) ----
     Una armadura vale para dos tonalidades, la mayor y su relativa menor, y hasta ahora
     el modo solo se corregía cuando la lectura mayor dejaba alguna nota del bajo sin
     cifra. Pero hay una prueba mucho más directa y más temprana, que es la que usa Diego
     al mirar la partitura: **si aparece la sensible de la relativa menor, el pasaje está
     en menor**. Con armadura de un bemol, un do♯ significa re menor y no Fa mayor; y lo
     mismo en todos los tonos.
     Esa sensible sola no bastaría: el do♯ podría ser la tercera de una dominante
     secundaria del VI en Fa mayor (V/vi). Por eso va con la subregla del RELIEVE
     (decisión 98): decide la nota en la que el pasaje **insiste** —empezar y acabar en
     ella, llegar a ella por salto, destacarla con un cambio de dirección—, no el conjunto
     de notas que emplea, que se resume en una escala y no distingue Do mayor de re dórico.
     Si el pasaje insiste en fa, es Fa mayor con un V/vi de paso; si insiste en re, es re
     menor. En el empate manda la sensible, que es la prueba más fuerte de las dos. */
  function modoPorLaSensible(ton, notas) {
    if (!ton || ton.modo !== 'mayor' || !notas.length) return null;
    let menor = null;
    try {
      menor = Teoria.tonalidadesCandidatas(ton, notas, null)
        .find(t => t.modo === 'menor' && Teoria.armadura(t) === Teoria.armadura(ton)) || null;
    } catch (e) { return null; }
    if (!menor) return null;
    try {
      const sept = Teoria.escalaNatural(menor)[6];          // 7.º grado natural de la menor
      const hay = notas.some(n => n.letra === sept.letra && n.alt === sept.alt + 1);   // …elevado
      if (!hay) return null;
      // El relieve decide entre las dos: la mayor solo se conserva si insiste MÁS que la menor
      return Teoria.relieveDeTonica(ton, notas) > Teoria.relieveDeTonica(menor, notas) ? null : menor;
    } catch (e) { return null; }
  }

  function tonalidadQueCuadra(f, op, hayB, hayS) {
    const ton = f.tonalidad;
    if ((f.modulacionesBajo || []).length || (f.modulacionesSoprano || []).length) return ton;
    /* La sensible de la relativa menor, antes que nada: vale con bajo o sin él, y vale
       aunque la lectura mayor no deje ninguna nota sin cifra, que es justo el caso que se
       colaba (decisión 97). */
    let todas = [];
    try {
      if (hayB) Teoria.notasDeCompases(f.compasesBajo).forEach(n => todas.push(Teoria.nota(n)));
      if (hayS) Teoria.notasDeCompases(f.compasesSoprano).forEach(n => todas.push(Teoria.nota(n)));
    } catch (e) { todas = []; }
    const porSensible = modoPorLaSensible(ton, todas);
    if (porSensible) return porSensible;
    if (!hayB) return ton;
    const prueba = t => {
      try {
        const r = analizar(f.compasesBajo, t, null, false, Object.assign({}, op, { companera: null }));
        return !!r && !r.incompleto;
      } catch (e) { return false; }
    };
    if (prueba(ton)) return ton;
    let notas;
    try {
      notas = Teoria.notasDeCompases(f.compasesBajo).map(n => Teoria.nota(n));
      if (hayS) Teoria.notasDeCompases(f.compasesSoprano).forEach(n => notas.push(Teoria.nota(n)));
    } catch (e) { return ton; }
    const ultima = notas.length ? Teoria.notasDeCompases(f.compasesBajo).slice(-1)[0] : null;
    /* Las candidatas, ordenadas por el RELIEVE de su tónica (decisión 98): si varias
       admiten todas las notas, gana aquella en cuya tónica insiste de verdad el pasaje.
       Es un desempate estable, así que el orden anterior se conserva cuando empatan. */
    const cands = Teoria.tonalidadesCandidatas(ton, notas, ultima)
      .map((t, k) => ({ t, k, r: Teoria.relieveDeTonica(t, todas.length ? todas : notas) }))
      .sort((a, b) => b.r - a.r || a.k - b.k)
      .map(x => x.t);
    return cands.find(prueba) || ton;
  }

  /* fragmento: lo que devuelve MusicXML.importar / MuseScore.importar.
     opciones: {leccion, fuente, repertorio, acordes, formulaTST}. */
  function entrada(fragmento, opciones = {}) {
    const f = fragmento;
    const compas = f.compas || [4, 4];
    const hayB = Teoria.numeroDeNotas(f.compasesBajo || []) > 0;
    const hayS = Teoria.numeroDeNotas(f.compasesSoprano || []) > 0;
    if (!hayB && !hayS) return null;
    const op = Object.assign({ compas }, opciones);
    const ton = tonalidadQueCuadra(f, op, hayB, hayS);
    // Solo se avisa (y se marca con ?) si la ARMADURA está mal; si solo se había
    // equivocado el modo dentro de la misma armadura, la corrección es firme y silenciosa
    const cambiada = !Teoria.mismaTonalidad(ton, f.tonalidad) && armaduraMal(f.tonalidad, ton);
    const ultimaBajo = hayB ? (Teoria.notasDeCompases(f.compasesBajo).slice(-1)[0] || null) : null;

    const partes = {};
    const avisos = [];
    if (cambiada) avisos.push(avisoDeArmadura(f.tonalidad, ton, ultimaBajo));
    /* LA REJILLA SOLO EN MÚSICA DE VERDAD (decisión 238). Un fragmento es «real» cuando
       dice de qué obra viene, que es el mismo criterio con el que ya los separa el filtro
       del configurador, y hacen falta las dos voces: la rejilla nace de compararlas. En los
       fragmentos de práctica las dos voces se escriben al mismo paso, cada nota lleva su
       acorde y todo sigue exactamente igual que antes. */
    const esReal = !!String(opciones.obra || f.obra || '').trim();
    const rejilla = (esReal && hayB && hayS)
      ? ((Array.isArray(opciones.rejilla) && opciones.rejilla.length)
        ? opciones.rejilla.slice().sort((a, b) => a - b)      // la que marcó el profesor
        : rejillaAutomatica(f.compasesBajo, f.compasesSoprano, compas))
      : null;
    // Las dos voces vistas desde la rejilla; sin rejilla, las escritas tal cual
    const vb = rejilla ? enRejilla(f.compasesBajo, rejilla) : f.compasesBajo;
    let vs = rejilla ? enRejilla(f.compasesSoprano, rejilla) : f.compasesSoprano;
    let reales = null;                       // notas de paso en tiempo fuerte, si las hay

    if (hayB) {
      const mods = modulacionesEnRejilla(f.modulacionesBajo, f.compasesBajo, rejilla);
      const r = analizar(vb, ton, mods, false,
        Object.assign({}, op, { companera: hayS ? companera(vb, vs) : null }));
      if (r) {
        partes.bajo = {
          // La voz TAL COMO ESTÁ ESCRITA; las respuestas van por acorde, no por nota
          compases: f.compasesBajo,
          modulaciones: (mods || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          // El bajo NO pasa por preferir(): la voz compañera ya entra en el motor
          // (ej.companera), de modo que la eligen las reglas y no un retoque posterior.
          respuestas: r.respuestas
        };
        if (r.incompleto) avisos.push(AVISO_BAJO);
        const fin = finalExtrano({ compases: vb, respuestas: r.respuestas, modulaciones: mods }, ton, compas);
        if (fin) avisos.push(fin);
        /* Y AHORA, con el bajo ya analizado, se mira si alguna nota de la melodía que cae en
           parte es nota de paso. El bajo se analizó con la nota que ataca como compañera: no
           se vuelve a analizar con la corregida, porque la compañera solo sirve para elegir
           entre los cifrados que YA son admisibles, y una nota extraña no cabe en ninguno,
           de modo que allí no estaba influyendo en nada. */
        if (rejilla && hayS) {
          reales = notasReales(f.compasesSoprano, rejilla, vb, r.respuestas, ton, mods);
          if (reales) vs = conNotasReales(vs, reales);
        }
      }
    }
    if (hayS) {
      const mods = modulacionesEnRejilla(f.modulacionesSoprano, f.compasesSoprano, rejilla);
      const r = analizar(vs, ton, mods, true, op);
      if (r) {
        partes.soprano = {
          compases: f.compasesSoprano,
          modulaciones: (mods || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          respuestas: preferir(r.respuestas, vs, hayB ? companera(vs, vb) : null, ton, mods, true, r.fijados,
            (partes.bajo && partes.bajo.respuestas) ? partes.bajo.respuestas.map(a => a[0]) : null)
        };
        /* La nota que representa a la melodía en cada acorde cuando no es la que ataca con
           él: hace falta guardarla, porque es lo que el ejercicio pone en la casilla y de
           ella salen el grado y la comprobación. Se guarda SOLO cuando la hay. */
        if (reales) partes.soprano.reales = reales.slice();
        if (r.incompleto) avisos.push(AVISO_SOPRANO);
      }
    }
    if (!partes.bajo && !partes.soprano) return null;

    const base = {
      id: opciones.id || null,
      leccion: opciones.leccion || '',
      leccionNombre: opciones.leccionNombre || '',
      leccionRepertorio: (opciones.repertorio || []).slice(),
      leccionAcordes: (opciones.acordes || []).slice(),
      fuente: opciones.fuente || '',
      titulo: opciones.titulo || '',
      /* DE QUÉ OBRA VIENE (decisión 198, Diego 29/9/2026: «quiero tomarlos de partituras de
         música… que luego pudiera identificar de dónde provienen»). `fuente` es el nombre
         del ARCHIVO del que se importó; esto es la obra. Sale del texto `@…` de la
         partitura, y el profesor puede escribirlo o corregirlo a mano en el configurador.
         NO entra en la huella del sello —`contenidoArmonico` solo mira la música y las
         respuestas—, así que se le puede poner la procedencia a un fragmento ya cerrado sin
         reabrirlo: comprobado sobre los 26 cerrados, 0 sellos rotos. */
      autor: opciones.autor || f.autor || '',
      obra: opciones.obra || f.obra || '',
      // Dónde ver la partitura de verdad (decisión 199): una dirección de internet
      enlace: opciones.enlace || f.enlace || '',
      tonalidad: { tonica: ton.tonica, modo: ton.modo },
      tonalidadSegura: f.tonalidadSegura !== false && !cambiada,
      // Si la armadura de la partitura no era la del fragmento, se guarda para poder avisar
      armaduraEscrita: cambiada ? { tonica: f.tonalidad.tonica, modo: f.tonalidad.modo } : null,
      ultimaBajo: cambiada ? ultimaBajo : null,      // solo hace falta para redactar ese aviso
      compas: compas.slice(),
      /* LA REJILLA DE ACORDES (decisión 238): los momentos del fragmento que llevan
         acorde, en negras desde el principio. Va en la entrada y no en cada voz porque la
         armonía es una sola: las dos voces tienen por fuerza los mismos acordes. `null`
         en todo lo que no sea música real a dos voces, y entonces nada cambia. */
      rejilla: rejilla,
      bajo: partes.bajo || null,
      soprano: partes.soprano || null,
      nivelManual: null,
      avisos
    };
    /* LAS CUATRO VOCES ESCRITAS (decisión 200, Diego 30/9/2026: «me interesa que se
       conserven las cuatro voces tal como las he escrito»). Se guardan las TRES de arriba
       —tenor, contralto y soprano, del grave al agudo—, una por nota del bajo; la cuarta es
       el bajo, que ya está en `bajo.compases`. Es la misma forma que devuelve
       `Realizacion.realizar`, así que la partitura las dibuja sin enterarse.

       Se exige que cada acorde traiga sus tres notas y que haya tantos acordes como notas
       tiene el bajo: si los dos pentagramas no van al mismo ritmo, no hay manera de saber
       qué acorde va con qué nota y es mejor decirlo que inventárselo. */
    const arriba = Array.isArray(f.acordes) ? f.acordes : [];
    if (partes.bajo && arriba.length) {
      const nB = Teoria.numeroDeNotas(f.compasesBajo || []);
      const aTres = arriba.filter(a => a && a.length >= 3).length;
      /* UNA SOLA CONDICIÓN: QUE HAYA ALGÚN ACORDE A CUATRO VOCES (decisión 216, 30/9/2026;
         rehace la 206). Con eso se sabe que el pentagrama de arriba es una armonización y
         no una melodía, y entonces se guarda ENTERA, tal como está escrita.
         Las dos versiones anteriores exigían además un mínimo de notas en CADA acorde
         —tres primero, dos después— y las dos dejaron fuera música de verdad: la sonata de
         Beethoven adelgaza a tres voces, y el tema de John Williams se queda en dos voces
         en un par de sitios. Donde el compositor escribió menos, se guardan menos; donde no
         escribió nada, va un hueco (`null`) y la partitura no dibuja ahí nada de arriba.
         Rellenarlo con el motor sería cambiarle la música. */
      if (aTres) {
        base.voces = arriba.map(a => (Array.isArray(a) && a.length ? a.slice() : null));
      }
    }
    /* Y, con la armonización del compositor delante, el modelo de cada nota sale de ella
       (decisión 219) y no de lo que el motor deduciría del bajo a secas. */
    const fuera = modeloDeLoEscrito(base);
    if (fuera.length) base.acordesFuera = fuera;
    etiquetar(base);
    return base;
  }

  /* ---------- EL CIFRADO QUE DE VERDAD ESTÁ ESCRITO (decisión 219) ----------

     Diego, 30/9/2026: «¿quién ha asignado esas armonías a cada nota del bajo? No se
     corresponden con los acordes que aparecen en la armonización que he subido».

     Tenía razón, y el fallo era de raíz. Los cifrados admisibles de cada nota salían del
     motor mirando SOLO EL BAJO —la regla de la octava, la sintaxis funcional, el repertorio
     de la lección— sin mirar ni una vez las voces que él había escrito encima. En el tema de
     John Williams eso daba diez modelos de veinte que no eran los de la partitura, casi
     todos por lo mismo: el motor lee tríadas donde el compositor escribe séptimas.

     Cuando el fragmento trae la armonización del compositor, la pregunta «¿qué acorde es
     este?» no es una conjetura: está ahí escrita. Así que se deduce de las notas y ese
     cifrado pasa a ser el MODELO. Los demás siguen siendo admisibles —son alternativas
     legítimas para un ejercicio de armonización de bajo—, pero el ● lo pone la partitura. */

  /* De las notas que suenan a la cifra que las describe. Devuelve null si no hay ninguna
     que cuadre: más vale decirlo que inventarse un acorde. */
  function cifraDeLoEscrito(bajo, arriba, ton) {
    if (!bajo || !Array.isArray(arriba) || !arriba.length) return null;
    let bajoN;
    try { bajoN = Teoria.nota(bajo); } catch (e) { return null; }
    const suena = new Set();
    try { [bajo, ...arriba].forEach(x => { if (x) suena.add(Teoria.clase(Teoria.nota(x))); }); }
    catch (e) { return null; }
    if (suena.size < 3) return null;          // con dos sonidos no se distingue un acorde
    /* `puedenFaltar`: qué miembros del acorde se admite no oír. Siempre la QUINTA, que a
       cuatro voces se suprime a cada paso. Se prueba primero así; y solo si nada cuadra, se
       admite además que falte la TERCERA —pasa cuando la textura adelgaza justo ahí— y
       únicamente si entonces queda UNA sola cifra posible: si quedaran dos, adivinar sería
       peor que callarse. */
    const busca = puedenFaltar => {
      const casan = [];
      Object.keys(Teoria.CIFRADOS).forEach(id => {
        let pide, fund;
        try {
          pide = [bajoN, ...Teoria.vocesSuperiores(id, bajoN, ton)];
          fund = Teoria.fundamental(id, bajoN, ton);
        } catch (e) { return; }
        if (!fund) return;
        const papel = x => (((Teoria.indice(x) - Teoria.indice(fund)) % 7) + 7) % 7;
        const clases = pide.map(x => Teoria.clase(x));
        // No puede sonar nada ajeno al acorde…
        if ([...suena].some(c => !clases.includes(c))) return;
        // …ni faltar ninguna de sus notas, salvo las que se admita
        if (pide.some(x => !suena.has(Teoria.clase(x)) && !puedenFaltar.includes(papel(x)))) return;
        casan.push({ id, miembros: pide.filter(x => suena.has(Teoria.clase(x))).length });
      });
      return casan;
    };
    let casan = busca([4]);                   // 4 = la quinta
    if (!casan.length) {
      const flojo = busca([4, 2]);            // 2 = la tercera
      if (flojo.length === 1) casan = flojo;
    }
    if (!casan.length) return null;
    /* Varias cifras pueden describir las mismas notas: fa–la–do–mi♭ en Si♭ M es «7» (la
       séptima diatónica del V) y «7+» (el V7 con su sensible). Se antepone el cifrado de
       DOMINANTE, que es el más preciso —el mismo criterio que usa el arpegio en las reglas—
       y, después, el que más notas del acorde tiene escritas. */
    casan.sort((a, b) => (Teoria.DOMINANTES.includes(b.id) ? 1 : 0) - (Teoria.DOMINANTES.includes(a.id) ? 1 : 0)
      || b.miembros - a.miembros);
    return casan[0].id;
  }

  /* Pone delante, en cada nota del bajo, el cifrado que está escrito. Devuelve la lista de
     números de nota cuyo acorde escrito NO estaba entre los admisibles: son los que se
     salen del repertorio de la lección y hay que mirar con calma —si no se añadieran, el
     ejercicio daría por mala la respuesta que trae la partitura—. */
  function modeloDeLoEscrito(e) {
    if (!e || !e.bajo || !Array.isArray(e.voces) || !e.voces.length) return [];
    const notas = Teoria.notasDeCompases(e.bajo.compases || []);
    const resp = e.bajo.respuestas || [];
    if (notas.length !== e.voces.length || notas.length !== resp.length) return [];
    const tons = Teoria.tonalidadesPorNota({
      compases: e.bajo.compases, tonalidad: e.tonalidad,
      modulaciones: e.bajo.modulaciones || [], melodica: e.bajo.melodica || []
    });
    const fuera = [];
    notas.forEach((n, i) => {
      const id = cifraDeLoEscrito(n, e.voces[i] || [], tons[i] || e.tonalidad);
      if (!id) return;
      if (!resp[i].includes(id)) { resp[i] = [id, ...resp[i]]; fuera.push(i + 1); }
      else if (resp[i][0] !== id) resp[i] = [id, ...resp[i].filter(x => x !== id)];
    });
    return fuera;
  }

  /* Recalcula las ETIQUETAS y los avisos de una entrada a partir de lo que tiene dentro
     (las dos voces y sus respuestas), sin volver a analizar nada. Es lo que hace falta
     cuando el profesor corrige a mano el cifrado o la tonalidad de un fragmento del banco:
     la música y las respuestas son las suyas, pero las etiquetas —cifras, grados, nivel,
     si modula— han de volver a salir de ahí. */
  function etiquetar(e) {
    const ton = e.tonalidad;
    const compas = e.compas || [4, 4];
    const partes = { bajo: e.bajo || null, soprano: e.soprano || null };
    const avisos = [];
    // La armadura escrita no era la del fragmento: el aviso va con la entrada y sobrevive
    // a que se vuelvan a calcular las etiquetas
    if (e.armaduraEscrita) avisos.push(avisoDeArmadura(e.armaduraEscrita, ton, e.ultimaBajo));
    if (partes.bajo) {
      if ((partes.bajo.respuestas || []).some(r => !r || !r.length)) avisos.push(AVISO_BAJO);
      /* El final se mira sobre la voz VISTA DESDE LA REJILLA (decisión 238): las respuestas
         van por acorde, y la voz escrita puede tener más notas que acordes —el do corchea
         del final de la Marcha no lleva ninguno—. Comparando una cosa con la otra, el
         último cifrado caía sobre la nota equivocada y salía un aviso falso. */
      const vb = e.rejilla ? enRejilla(partes.bajo.compases, e.rejilla) : partes.bajo.compases;
      const fin = finalExtrano({ compases: vb, respuestas: partes.bajo.respuestas, modulaciones: partes.bajo.modulaciones }, ton, compas);
      if (fin) avisos.push(fin);
    }
    if (partes.soprano && (partes.soprano.respuestas || []).some(r => !r || !r.length)) avisos.push(AVISO_SOPRANO);
    e.avisos = avisos;
    // Etiquetas: todas salen del análisis
    const principal = partes.bajo || partes.soprano;
    const esSopPrincipal = !partes.bajo;
    const modelo = principal.respuestas.map(r => r[0]).filter(Boolean);
    const cifras = [], grados = [];
    modelo.forEach(id => {
      const cifra = esSopPrincipal ? Ejercicios.cifraDe(id) : id;
      if (cifra && !cifras.includes(cifra)) cifras.push(cifra);
    });
    if (esSopPrincipal) modelo.forEach(id => { const p = Ejercicios.par(id); const r = Teoria.gradoEscrito(p.romano, p.cifra); if (r && !grados.includes(r)) grados.push(r); });

    const et = {
      voces: partes.bajo && partes.soprano ? 'ambas' : (partes.bajo ? 'bajo' : 'soprano'),
      // Cuántas casillas tiene el ejercicio: con rejilla son los acordes, no las notas escritas
      notas: e.rejilla ? (principal.respuestas || []).length : Teoria.numeroDeNotas(principal.compases),
      compases: principal.compases.length,
      modo: ton.modo,
      alteraciones: Math.abs(Teoria.armadura(ton)),
      modula: (principal.modulaciones || []).length > 0,
      // ¿Trae la armonización entera, escrita por el profesor? (decisión 200)
      cuatro: !!(e.voces && e.voces.length),
      cifras,
      grados
    };
    et.nivel = nivelBase(et);
    e.etiquetas = et;
    return e;
  }

  /* ---------- Retocar la rejilla a mano (decisión 238) ----------
     La regla del pulso acierta en lo corriente, pero no lo ve todo: una armonía sincopada
     de verdad cambia a contratiempo, y una nota de paso del bajo en tiempo fuerte lleva
     casilla sin merecerla. Para eso el profesor quita y pone acordes en el configurador, y
     lo que él marque manda. Aquí se rehace el fragmento con la rejilla nueva: la música
     escrita y todo lo que lo describe se quedan como están; lo que se vuelve a calcular son
     los acordes de las dos voces, que es lo que la rejilla cambia. */

  // Dónde cae un momento: número de compás y de tiempo, los dos empezando en 1
  function posicionDe(t, compases, compas) {
    const inicios = iniciosDeCompas(compases);
    let ci = 0;
    for (let i = 0; i < inicios.length - 1; i++) if (t >= inicios[i] - 0.01) ci = i;
    return { compas: ci + 1, tiempo: (t - inicios[ci]) / pulso(compas) + 1 };
  }

  /* El camino de vuelta de `modulacionesEnRejilla`: el índice vuelve a ser de notas
     escritas, que es lo que `entrada` espera recibir. */
  function modulacionesEnNotas(mods, compases, rejilla) {
    if (!rejilla || !rejilla.length || !mods || !mods.length) return mods || [];
    const notas = conTiempo(compases).filter(e => e.nota !== null && e.nota !== undefined);
    return mods.map(m => {
      const t = rejilla[m.nota];
      if (t === undefined) return m;
      let k = notas.findIndex(e => e.t >= t - 0.01);
      if (k < 0) k = notas.length - 1;
      return Object.assign({}, m, { nota: k });
    });
  }

  function rehacerConRejilla(e, rejilla) {
    if (!e || !e.bajo || !e.soprano) return null;
    const f = {
      compasesBajo: e.bajo.compases,
      compasesSoprano: e.soprano.compases,
      modulacionesBajo: modulacionesEnNotas(e.bajo.modulaciones, e.bajo.compases, e.rejilla),
      modulacionesSoprano: modulacionesEnNotas(e.soprano.modulaciones, e.soprano.compases, e.rejilla),
      tonalidad: e.tonalidad,
      tonalidadSegura: e.tonalidadSegura,
      compas: e.compas,
      autor: e.autor, obra: e.obra, enlace: e.enlace
    };
    const nuevo = entrada(f, {
      id: e.id, leccion: e.leccion, leccionNombre: e.leccionNombre, fuente: e.fuente,
      titulo: e.titulo, autor: e.autor, obra: e.obra, enlace: e.enlace, compas: e.compas,
      repertorio: e.leccionRepertorio, acordes: e.leccionAcordes,
      // Lo que marcó el profesor. Vacía quiere decir «ninguno», y entonces no hay ejercicio.
      rejilla: (rejilla && rejilla.length) ? rejilla.slice().sort((a, b) => a - b) : null
    });
    if (!nuevo) return null;
    // Lo que no describe la armonía y vale igual
    if (e.nivelManual !== undefined) nuevo.nivelManual = e.nivelManual;
    if (e.voces) nuevo.voces = e.voces;
    nuevo.tocado = new Date().toISOString().slice(0, 10);
    return nuevo;
  }

  /* ---------- Filtros ---------- */

  /* filtro: { n, modo, leccion, lecciones:[], modoTonal:'mayor'|'menor', alteraciones:[min,max],
               nivel:[min,max], notas:[min,max], modula:true|false|null, cifras:[ids],
               musica:'real'|'practica', titulo } — todo opcional salvo modo y n. */
  function cumple(e, filtro) {
    const f = filtro || {};
    const voz = vozDeModo(f.modo || 'armonizar');
    if (!e[voz]) return false;                                   // no tiene esa voz escrita
    const et = e.etiquetas || {};
    /* Un fragmento con avisos no sale en las fichas… PERO EL AVISO DE UNA VOZ SOLO TAPA A
       ESA VOZ (decisión 238, Diego 4/10/2026). En música de verdad la melodía puede llevar
       apoyaturas y notas de paso en parte, que se quedan sin acorde posible, mientras el
       bajo está impecable: la Marcha en Re de C. Ph. E. Bach es justo eso, y sirve
       perfectamente para cifrar el bajo aunque no sirva para armonizar la melodía. */
    const tapa = a => !((voz === 'bajo' && a === AVISO_SOPRANO) || (voz === 'soprano' && a === AVISO_BAJO));
    if (!f.conAvisos && (e.avisos || []).some(tapa)) return false;
    if (f.leccion && e.leccion !== f.leccion) return false;
    if (f.lecciones && f.lecciones.length && !f.lecciones.includes(e.leccion)) return false;
    if (f.modoTonal && et.modo !== f.modoTonal) return false;
    if (f.alteraciones && (et.alteraciones < f.alteraciones[0] || et.alteraciones > f.alteraciones[1])) return false;
    if (f.notas && (et.notas < f.notas[0] || et.notas > f.notas[1])) return false;
    /* MÚSICA REAL O FRAGMENTO DE PRÁCTICA (decisión 210, Diego 30/9/2026). La marca es
       tener OBRA: un fragmento con procedencia viene de una partitura (198); el resto son
       los esquemas armónicos escritos para practicar. */
    if (f.musica === 'real' && !e.obra) return false;
    if (f.musica === 'practica' && e.obra) return false;
    if (f.modula === true && !et.modula) return false;
    if (f.modula === false && et.modula) return false;
    if (f.cifras && f.cifras.length && !f.cifras.every(c => (et.cifras || []).includes(c))) return false;
    if (f.nivel) { const n = nivel(e, f.modo); if (n < f.nivel[0] || n > f.nivel[1]) return false; }
    // El sello (decisión 166): para repasar, «sin cerrar» convierte la tabla en una cola
    if (f.cerrado === 'si' && !e.cerrado) return false;
    if (f.cerrado === 'no' && e.cerrado) return false;
    return true;
  }
  const filtrar = (entradas, filtro) => (entradas || []).filter(e => cumple(e, filtro));

  /* Cuántos compases ocupa un fragmento. La etiqueta la pone el configurador al
     importarlo; si faltara, se cuentan las voces escritas. */
  function compasesDe(e) {
    const et = (e && e.etiquetas) || {};
    if (et.compases) return et.compases;
    return Math.max(((e.bajo || {}).compases || []).length,
                    ((e.soprano || {}).compases || []).length) || 1;
  }

  /* Baraja (Fisher-Yates) y toma fragmentos. Sin semilla: cada vez que se abre la ficha
     salen otros.

     El tamaño de una ficha se mide en COMPASES, no en número de ejercicios (decisión 127):
     lo que cansa al alumno es la música que tiene delante, y un fragmento de ocho compases
     da el trabajo de tres de tres. Si el filtro trae `compases: [min, max]`, se van tomando
     fragmentos hasta llegar al mínimo sin pasarse del máximo —el que no quepa se salta y se
     prueba con el siguiente—, y `n` queda como tope de ejercicios. Sin `compases`, se hace
     lo de siempre: los N primeros. */
  /* AL ALUMNO, SOLO FRAGMENTOS CERRADOS (decisión 182, Diego 29/9/2026: «los fragmentos que
     se muestren a los alumnos para la práctica han de ser solo de los que están cerrados,
     para tener la tranquilidad de que los alumnos no se encontrarán con fragmentos
     problemáticos o, directamente, con problemas»). El sello (166) ya decía que un fragmento
     cerrado es criterio del profesor; ahora además es la CONDICIÓN para servirlo. Se fuerza
     aquí, en el sorteo, y no en el filtro de la ficha: así vale para todos los enlaces ya
     repartidos, sin que haya que volver a generarlos, y ningún enlace puede saltárselo.
     El configurador sigue viéndolo todo: allí se filtra con `filtrar`, no con `elegir`. */
  function elegir(entradas, filtro) {
    filtro = Object.assign({}, filtro || {}, { cerrado: 'si' });
    const lista = filtrar(entradas, filtro).slice();
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    const f = filtro || {};
    const meta = Array.isArray(f.compases) && f.compases.length === 2 ? f.compases : null;
    // Sin presupuesto de compases (enlaces viejos), manda el tope de ejercicios de siempre
    if (!meta) return lista.slice(0, Math.max(1, Math.min(lista.length, f.n || 8)));
    /* LA FICHA SE LLENA HASTA EL MÁXIMO DE COMPASES (decisión 191, Diego 29/9/2026: «se
       muestran muy pocos fragmentos por ficha, solo 1 ó 2»). El fallo era una línea: en
       cuanto la suma llegaba al MÍNIMO se cortaba (`if (total >= min) break`), de modo que
       con «de 20 a 26 compases» bastaba un fragmento de 20 para cerrar la ficha. El mínimo
       no es donde se para, es el suelo: lo que se quiere es practicar esa cantidad de
       compases, repartida como sea. Ahora se van tomando fragmentos mientras quepan sin
       pasarse del máximo, y el tope de ejercicios deja de recortar —la ficha se mide en
       compases, no en número de fragmentos—. El primero entra siempre, aunque él solo pase
       del máximo: más vale una ficha larga que una vacía. */
    const min = Math.max(1, meta[0]), max = Math.max(min, meta[1]);
    const out = [];
    let total = 0;
    for (let i = 0; i < lista.length && total < max; i++) {
      const c = compasesDe(lista[i]);
      if (out.length && total + c > max) continue;   // no cabe: que pruebe el siguiente
      out.push(lista[i]); total += c;
    }
    return out.length ? out : lista.slice(0, 1);
  }

  /* ---------- Transportar un fragmento (decisión 102) ----------
     Devuelve una COPIA del fragmento en otra tónica, o `null` si no se puede dibujar.
     Lo único que se toca son las notas y las tonalidades: las respuestas, el repertorio
     y la lista de acordes de la lección están escritos en cifras y grados romanos, que
     no dependen del tono. Por eso esto son treinta líneas y no un proyecto. */
  function transportarEntrada(e, tonicaDestino) {
    if (!e || !tonicaDestino || tonicaDestino === e.tonalidad.tonica) return e;
    const iv = Teoria.intervaloEntreTonicas(e.tonalidad.tonica, tonicaDestino);
    const mueve = n => Teoria.transportar(Teoria.nota(n), iv.pasos, iv.semitonos);

    /* Primero, ¿se puede DIBUJAR? Desde la decisión 114 la fuente incrustada lleva también el
       doble sostenido y el doble bemol, así que el tope real es el TRIPLE: por encima de dos
       alteraciones en una nota no hay signo que ponerle, y eso no lo produce ninguna tonalidad
       de las que reparte el configurador (el tope son 7 alteraciones). El filtro se queda por si
       algún día se escribe a mano un fragmento que ya venga con alteraciones dobles. */
    let imposible = false;
    ['bajo', 'soprano'].forEach(v => {
      const p = e[v]; if (!p) return;
      p.compases.forEach(c => c.forEach(([n]) => {
        if (!n) return;
        try { if (Math.abs(mueve(n).alt) >= 3) imposible = true; } catch (err) { imposible = true; }
      }));
    });
    if (imposible) return null;

    /* Y después, ¿en qué octava? El intervalo nunca pasa de un tritono, pero medio tono
       arriba sobre un fragmento ya agudo lo saca del pentagrama. Se corre por octavas
       LAS DOS VOCES A LA VEZ —si no, se cruzarían— buscando dejar el conjunto donde
       estaba. */
    const todas = [];
    ['bajo', 'soprano'].forEach(v => {
      const p = e[v]; if (!p) return;
      p.compases.forEach(c => c.forEach(([n]) => { if (n) todas.push(n); }));
    });
    let octavas = 0;
    if (todas.length) {
      const viejas = todas.map(n => Teoria.midi(Teoria.nota(n)));
      const nuevas = todas.map(n => Teoria.midi(mueve(n)));
      const vLo = Math.min(...viejas), vHi = Math.max(...viejas);
      const media = viejas.reduce((a, x) => a + x, 0) / viejas.length;
      /* Se prueban tres octavas y gana la que menos se SALGA del registro que tenía el
         fragmento. Mirar el registro y no la media importa: una media parecida puede
         esconder una nota cuatro líneas adicionales por encima del pentagrama. */
      let mejor = null;
      [0, -1, 1].forEach(o => {
        const lo = Math.min(...nuevas) + 12 * o, hi = Math.max(...nuevas) + 12 * o;
        const exceso = Math.max(0, hi - vHi) + Math.max(0, vLo - lo);
        const centro = Math.abs((nuevas.reduce((a, x) => a + x, 0) / nuevas.length + 12 * o) - media);
        if (!mejor || exceso < mejor.exceso - 0.001 || (Math.abs(exceso - mejor.exceso) < 0.001 && centro < mejor.centro)) {
          mejor = { o, exceso, centro };
        }
      });
      octavas = mejor.o;
    }

    const copia = JSON.parse(JSON.stringify(e));
    copia.tonalidad = Teoria.transportarTonalidad(e.tonalidad, iv.pasos, iv.semitonos);
    ['bajo', 'soprano'].forEach(v => {
      const p = copia[v]; if (!p) return;
      p.compases = p.compases.map(c => c.map(([n, d]) => {
        if (!n) return [n, d];
        const x = mueve(n);
        return [Teoria.texto({ letra: x.letra, alt: x.alt, octava: x.octava + octavas }), d];
      }));
      p.modulaciones = (p.modulaciones || []).map(m => ({
        nota: m.nota, tonalidad: Teoria.transportarTonalidad(m.tonalidad, iv.pasos, iv.semitonos)
      }));
      // Las notas de paso en tiempo fuerte (238) viajan con la voz y con su misma octava
      if (Array.isArray(p.reales)) p.reales = p.reales.map(n => {
        if (!n) return n;
        const x = mueve(n);
        return Teoria.texto({ letra: x.letra, alt: x.alt, octava: x.octava + octavas });
      });
    });
    /* Las voces de en medio viajan con las otras dos y CON EL MISMO desplazamiento de
       octava (decisión 200): si no, se cruzarían con el bajo o con la soprano. */
    if (Array.isArray(copia.voces) && copia.voces.length) {
      let falla = false;
      copia.voces = copia.voces.map(ac => (Array.isArray(ac) ? ac.map(n => {
        try { const x = mueve(n); if (Math.abs(x.alt) >= 3) falla = true;
          return Teoria.texto({ letra: x.letra, alt: x.alt, octava: x.octava + octavas }); }
        catch (err) { falla = true; return n; }
      }) : ac));
      if (falla) return null;        // no se puede escribir en ese tono: mejor no dar el fragmento
    }
    // La armadura escrita en la partitura original ya no describe a esta copia
    delete copia.armaduraEscrita;
    copia.transportadoDe = e.tonalidad.tonica;      // para el pie del ejercicio y la revisión
    try { etiquetar(copia); } catch (err) { /* si algo falla, quedan las etiquetas viejas */ }
    return copia;
  }

  /* Qué tónica le toca a este fragmento en esta ficha. Determinista: sale del id del
     fragmento y de la semilla que viaja en el enlace, así que el MISMO enlace da
     siempre los mismos tonos —se puede imprimir, repetir y comparar entre alumnos—
     sin guardar nada. Si la tónica elegida no se puede dibujar, se prueba la siguiente. */
  function revoltijo(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function tonicasDeFicha(filtro, modo) {
    const f = filtro || {};
    const delModo = Teoria.CIRCULO_TONICAS[modo === 'menor' ? 'menor' : 'mayor'];
    /* La lista a mano manda sobre el tope. Lleva tónicas de los dos modos mezcladas —el
       profesor marca «Re M» y «si m» en la misma casilla—, así que aquí se queda con las
       que son de ESTE modo: a un fragmento en menor no se le ofrece Sol M. */
    if (Array.isArray(f.tonos) && f.tonos.length) return f.tonos.filter(t => delModo.includes(t));
    if (typeof f.maxAlt === 'number') return Teoria.tonicasPorAlteraciones(modo, f.maxAlt);
    return [];
  }
  /* La tónica que le toca a la POSICIÓN k de la ficha. Por rotación y no por sorteo
     (Diego, 25/9): así no se repite ninguna mientras queden libres, que es lo que se le
     pide a un reparto. La semilla, que viaja en el enlace, decide por dónde empieza la
     vuelta; la posición la pone la ficha. Antes salía de un revoltijo del id del
     fragmento y, con 7 tónicas y 8 ejercicios, repetía con más frecuencia de la cuenta. */
  /* ---------- ARMADURA AJENA (decisión 185) ----------
     Diego, 29/9/2026: «que la tonalidad del fragmento no coincida con la armadura. Esto se
     da cuando, en medio de una composición, la música ha modulado a un tono distinto del que
     aparece en la armadura». El fragmento no cambia: sigue en su tono —y puede modular
     dentro—; lo que cambia es la ARMADURA con que se presenta, y con ella las alteraciones
     que hay que escribir (un fragmento en Do M con armadura de Sol M lleva becuadro en cada
     fa). Es opción de la FICHA, no del fragmento, porque depende del curso:

       · 2.º de Armonía                  hasta 1 alteración de diferencia, en más o en menos
       · 1.º de Análisis/Fundamentos     hasta 2
       · 2.º de Análisis/Fundamentos     hasta 3

     Le toca a UNO DE CADA CUATRO como mucho, y la elección es determinista —sale de la
     semilla de la ficha, del id del fragmento y de su posición—, de modo que el mismo enlace
     da siempre lo mismo y una ficha a medias se reanuda igual. Se calcula DESPUÉS de
     transportar, sobre el tono en el que el fragmento se va a presentar de verdad. */
  function armaduraAjena(e, filtro, k) {
    const f = filtro || {};
    const max = Math.max(0, Math.min(3, parseInt(f.armaduraAjena, 10) || 0));
    if (!max || !e || !e.tonalidad) return null;
    if (!leToca(f, k)) return null;
    let n;
    try { n = Teoria.armadura(e.tonalidad); } catch (err) { return null; }
    const opciones = [];
    for (let d = -max; d <= max; d++) {
      if (!d || Math.abs(n + d) > 7) continue;
      const t = Teoria.tonalidadPorArmadura(n + d, e.tonalidad.modo);
      if (t) opciones.push(t);
    }
    if (!opciones.length) return null;
    const dado = revoltijo(String(f.semilla || '') + '|' + (e.id || '') + '|' + (k || 0));
    return opciones[dado % opciones.length];
  }

  /* ¿Le toca a ESTE sitio de la ficha? (decisión 190, Diego 29/9/2026: «afecta a entre un
     25 % y un 75 % de los fragmentos presentados al estudiante; como mínimo un 25 %, como
     máximo un 75 %»). Antes era una moneda por fragmento —25 % de media—, y con eso una
     ficha corta podía salir sin ninguno o con todos. Ahora es un CUPO sobre la ficha entera:
     sabiendo cuántos ejercicios tiene (`f.nFicha`), se sortea con la semilla cuántos llevan
     armadura ajena, entre ⌈n/4⌉ y ⌊3n/4⌋, y qué sitios son. Todo sale de la semilla y del
     número de ejercicios, así que el mismo enlace da siempre lo mismo y una ficha a medias
     se reanuda igual. Sin `nFicha` —la vista previa del configurador, un ejercicio suelto—
     se vuelve a la moneda de antes, que para un fragmento aislado es lo único que cabe. */
  function leToca(f, k) {
    const n = parseInt(f.nFicha, 10) || 0;
    const sitio = Math.max(0, parseInt(k, 10) || 0);
    /* EL PORCENTAJE LO PONE EL PROFESOR (decisión 195, Diego 29/9/2026: «quiero poder
       especificar el porcentaje de fragmentos que cumplirán la condición… entre 0 y 100 %
       y cualquier porcentaje sin decimales»). Con `armaduraPct` manda ese número; sin él
       —los enlaces repartidos antes— se conserva la banda del 25 al 75 % de la 190. */
    const pct = (f.armaduraPct === undefined || f.armaduraPct === null || f.armaduraPct === '')
      ? null : Math.max(0, Math.min(100, parseInt(f.armaduraPct, 10) || 0));
    if (pct === 0) return false;
    if (!n || sitio >= n) {
      if (pct === null) return revoltijo(String(f.semilla || '') + '|sitio|' + sitio) % 4 === 0;
      if (pct >= 100) return true;
      return revoltijo(String(f.semilla || '') + '|sitio|' + sitio) % 100 < pct;
    }
    let cuantos;
    if (pct !== null) cuantos = Math.max(0, Math.min(n, Math.round(n * pct / 100)));
    else {
      const min = Math.ceil(n / 4);
      const tope = Math.max(min, Math.floor(3 * n / 4));
      cuantos = min + (revoltijo(String(f.semilla || '') + '|cuantos|' + n) % (tope - min + 1));
    }
    if (!cuantos) return false;
    if (cuantos >= n) return true;
    // Los `cuantos` sitios de dado más bajo: determinista y con el cupo exacto
    const dados = [];
    for (let j = 0; j < n; j++) dados.push({ j, d: revoltijo(String(f.semilla || '') + '|sitio|' + j) });
    dados.sort((a, b) => (a.d - b.d) || (a.j - b.j));
    return dados.slice(0, cuantos).some(x => x.j === sitio);
  }

  function tonicaEn(filtro, modo, k) {
    const lista = tonicasDeFicha(filtro, modo);
    if (!lista.length) return null;
    return lista[(revoltijo(String((filtro || {}).semilla || '')) + (k || 0)) % lista.length];
  }
  function transportada(e, filtro, k) {
    const modo = e.tonalidad.modo;
    const lista = tonicasDeFicha(filtro, modo);
    if (!lista.length) return e;
    const desde = lista.indexOf(tonicaEn(filtro, modo, k));
    for (let i = 0; i < lista.length; i++) {
      const cand = transportarEntrada(e, lista[(desde + i + lista.length) % lista.length]);
      if (cand) return cand;                       // la primera que se pueda dibujar
    }
    return e;
  }

  /* ---------- De entrada a ejercicio ---------- */

  function ejercicio(e, filtro, k) {
    const f = filtro || {};
    // El tono de este fragmento en esta ficha (decisión 102). Va aquí y no en `elegir`
    // para que la ficha a medias se reanude en el MISMO tono: sale del id, no del azar.
    e = transportada(e, f, k);
    const modo = f.modo || 'armonizar';
    const parte = e[vozDeModo(modo)];
    if (!parte) return null;
    /* El repertorio y los acordes son los de SU lección, no los del filtro: en una ficha
       que mezcla lecciones, cada fragmento se juega con los acordes de la suya. */
    const suyos = (e.leccionRepertorio && e.leccionRepertorio.length) ? e.leccionRepertorio.slice() : repertorioDe(parte, modo);
    const acordes = (e.leccionAcordes && e.leccionAcordes.length) ? e.leccionAcordes.slice() : (f.acordes || []);
    const ej = {
      id: e.id || ('banco-' + (k || 0)),
      coleccion: f.titulo || (e.leccion ? rotuloLeccion(e.leccion, '') : ''),
      /* El tema del libro al que pertenece, para el botón de estructuras y para
         cualquier pantalla que quiera decirlo sin tener que traducir (1/10/2026). */
      tema: temaDeLeccion(e.leccion),
      // El título no repite el código de la lección: la colección ya dice «Lección A3-8»
      titulo: e.titulo || e.leccionNombre || etiquetaLeccion(e) || ('Ejercicio ' + ((k || 0) + 1)),
      leccion: etiquetaLeccion(e),
      // La obra de la que sale, para el crédito bajo la partitura (198), y dónde verla (199)
      autor: e.autor || '',
      obra: e.obra || '',
      enlace: e.enlace || '',
      // Las cuatro voces tal como las escribió el profesor, si las trae (decisión 200)
      voces: (e.voces && e.voces.length) ? e.voces : null,
      tonalidad: e.tonalidad,
      compas: e.compas,
      /* LA REJILLA (decisión 238). `compases` es la voz REMUESTREADA sobre la rejilla —un
         acontecimiento por acorde—, que es lo que mira todo lo que razona acorde a acorde:
         el motor, la corrección, el recorrido, el registro. Así ninguna de esas piezas se
         entera de nada y siguen valiendo tal cual: para ellas sigue habiendo un acorde por
         nota. `compasesEscritos` es la voz TAL COMO ESTÁ ESCRITA y `tiempos` dice en qué
         momento empieza cada acorde; las usa solo la partitura, para dibujar el ritmo de
         verdad y poner las casillas donde van. Sin rejilla, `compases` es la voz escrita y
         las otras dos van en blanco: todo igual que antes. */
      compases: e.rejilla ? conNotasReales(enRejilla(parte.compases, e.rejilla), parte.reales) : parte.compases,
      compasesEscritos: e.rejilla ? parte.compases : null,
      tiempos: e.rejilla ? e.rejilla.slice() : null,
      respuestas: parte.respuestas,
      repertorio: suyos
    };
    if (modo !== 'armonizar') ej.modo = modo;
    if (modo === 'audicion' && f.mostrarBajo) ej.mostrarBajo = true;
    // La lista de acordes viaja en los dos casos: en la melodía limita los candidatos y en
    // el bajo dice si la lección admite las dominantes secundarias (II+6).
    if (acordes.length) ej.acordes = acordes;
    if (modo === 'soprano' && f.formulaTST === false) ej.formulaTST = false;
    if (f.pedirRomano === false) ej.pedirRomano = false;
    if (f.reintentos === false) ej.reintentos = false;
    if (f.ayudaGrados && f.ayudaGrados !== 'lista') ej.ayudaGrados = f.ayudaGrados;
    /* El circulito de grado sobre el bajo (decisiones 91 y 113): dado · oculto. Con
       `gradosPrimero`, la ficha hace la rampa que pidió Diego —«se presenta la información
       en el fragmento 1 pero no en los siguientes»—: el primero los lleva puestos y los
       demás no. Vale en los cuatro tipos, porque el circulito ya no es una respuesta. */
    if (f.gradosPrimero) ej.gradosBajo = (k || 0) === 0 ? 'dado' : 'oculto';
    else if (f.gradosBajo === 'oculto' || f.gradosBajo === 'pedido' || f.gradosBajo === false) ej.gradosBajo = 'oculto';
    if (f.funciones) ej.funciones = f.funciones;
    // La respuesta modelo preferida sobre el 6.º descendente (+6 en cuarto curso)
    if (Array.isArray(f.preferir) && f.preferir.length) ej.preferir = f.preferir.slice();
    // …y la EXIGIDA, cuando la lección no admite la versión diatónica (8/10/2026)
    if (Array.isArray(f.exigir) && f.exigir.length) ej.exigir = f.exigir.slice();
    // La fila «Tonalidad»: rige module o no el fragmento (decisión 56)
    /* 'oculta' es el nivel avanzado, todavía sin ofrecer en el configurador; 'no' es el
       valor viejo, que el motor traduce a 'dadas' (decisión 232). */
    if (['dadas', 'pedir', 'no', 'oculta'].includes(f.tonalidades)) ej.tonalidades = f.tonalidades;
    // En qué tono abre el alumno el cuadro de estructuras (decisión 226)
    if (f.estructurasTon === 'fragmento') ej.estructurasTon = 'fragmento';
    if (parte.modulaciones && parte.modulaciones.length) ej.modulaciones = parte.modulaciones;
    if (parte.melodica && parte.melodica.length) ej.melodica = parte.melodica.slice();   // 6.º grado elevado (179)
    // La armadura con que se presenta puede no ser la del fragmento (decisión 185)
    const arm = armaduraAjena(e, f, k);
    if (arm) ej.armadura = arm;
    return ej;
  }

  // Paleta del alumno: las cifras que de verdad hacen falta en ese fragmento, en el orden de siempre
  const ORDEN = Ejercicios.ORDEN_CIFRAS;      // el orden por familias e inversiones (decisión 107)
  function repertorioDe(parte, modo) {
    const usadas = new Set();
    (parte.respuestas || []).forEach(adm => adm.forEach(id => {
      usadas.add(modo === 'soprano' ? Ejercicios.cifraDe(id) : id);
    }));
    const lista = ORDEN.filter(id => usadas.has(id));
    return lista.length ? lista : Ejercicios.REPERTORIO_RO;
  }

  /* ---------- El filtro viaja en la URL ---------- */

  function codificar(filtro) {
    const txt = JSON.stringify(filtro);
    const b64 = btoa(unescape(encodeURIComponent(txt)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodificar(texto) {
    let b64 = String(texto).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const f = JSON.parse(decodeURIComponent(escape(atob(b64))));
    /* UNA FICHA REPARTIDA ANTES DEL 8/10/2026 lleva dentro el código viejo de su lección
       (`A3-1`). Se traduce aquí, que es por donde entra TODA ficha, venga del enlace, del
       QR o del historial: así ninguna hoja entregada deja de funcionar. */
    if (f && f.leccion) f.leccion = leccionCanonica(f.leccion);
    return f;
  }

  /* ---------- El archivo del banco ---------- */

  const archivo = entradas => ({ version: VERSION, creado: new Date().toISOString().slice(0, 10), fragmentos: entradas });
  function leerArchivo(txt) {
    const d = typeof txt === 'string' ? JSON.parse(txt) : txt;
    const lista = Array.isArray(d) ? d : (d && d.fragmentos);
    if (!Array.isArray(lista)) throw new Error('El archivo no tiene una lista de fragmentos.');
    return lista.filter(e => e && (e.bajo || e.soprano));
  }
  /* Las lecciones, en el orden del PROGRAMA: del 3 al 23 seguido, con el prefijo de la
     asignatura delante (`A-` Armonía, `Co-` Fundamentos). Ordenar los códigos como texto
     pondría `A-10` entre `A-1` y `A-2`, así que se ordena por asignatura y por número,
     como números. Se hace aquí y no rellenando los códigos con ceros: el dato se queda
     legible y el arreglo vive en un solo sitio (decisión 117). */
  const troceaLeccion = c => {
    const m = /^([A-Z]*)(\d*)\D*(\d+)/i.exec(String(c || ''));
    return m ? [m[1].toUpperCase(), Number(m[2] || 0), Number(m[3])] : ['', 0, 0];
  };
  const comparaLecciones = (a, b) => {
    const x = troceaLeccion(a), y = troceaLeccion(b);
    return x[0].localeCompare(y[0]) || x[1] - y[1] || x[2] - y[2] || String(a).localeCompare(String(b));
  };
  const lecciones = entradas => {
    const out = [];
    (entradas || []).forEach(e => { if (e.leccion && !out.includes(e.leccion)) out.push(e.leccion); });
    return out.sort(comparaLecciones);
  };
  /* ===================================================================
     UNA SOLA NUMERACIÓN DE LECCIONES  (Diego, 8/10/2026)

     «Me gustaría poder [cambiar los títulos] sin tener que cambiar toda
     la estructura de la app. ¿Es posible que… el identificador entre
     archivos y tabla y lecciones/temas sea el código?»

     Hasta hoy vivían dos numeraciones: la interna de la aplicación
     (`A3-1`…`A3-8`, `A4-10`, `A4-11`) y la de las lecciones del libro
     (los temas 5…14). El desfase era +4 en 1.º y se rompía en 2.º, de
     modo que «A3-5» era AMBIGUO —la lección A3-5 o el tema 5— y el
     desempate tenía que hacerlo el título. De ahí venía el problema:
     cambiar un título movía fragmentos de lección.

     Desde hoy hay UNA: el código ES el número de lección, el del libro,
     el que Diego piensa y el que ven los alumnos. El prefijo dice la
     asignatura, no el curso —así un tema puede cambiar de curso sin
     tocar nada—:

         A-    Armonía
         Co-   Fundamentos de composición

     Y el TÍTULO deja de identificar: es una etiqueta que se enseña, y
     vive solo aquí. Cambiar uno es cambiar esta línea; ni los fragmentos
     del banco ni los nombres de los archivos se enteran.

     Las lecciones 22 y 23 no se corresponden con temas del libro (Diego,
     8/10/2026): son las dos de marchas progresivas, que van al final
     para no mover el tramo 5–21, que ya está impreso y repartido.
     =================================================================== */
  const LECCIONES = {
    'A-3':  'Melodías y esquemas de acordes. Escritura para coro',
    'A-4':  'Enlace de acordes. Escritura para coro',
    'A-5':  'I, V y V7',
    'A-6':  'I6, V6 y VII6',
    'A-7':  'V7 en inversión',
    'A-8':  'II, IV y II6',
    'A-9':  'El 64 cadencial',
    'A-10': 'El VI y IV6',
    'A-11': 'El II7',
    'A-12': 'Otros usos del IV, IV6 y VI',
    'A-13': 'La modulación al V',
    'A-14': 'La modulación al relativo',
    'A-15': 'Modulación diatónica al resto de tonos (1 alteración)',
    'A-16': 'Modulación diatónica al resto de tonos (2 alteraciones)',
    'A-17': 'Las dominantes secundarias',
    'A-18': 'Préstamos del homónimo',
    'A-19': 'La sexta napolitana',
    'A-20': 'La séptima disminuida (dominante)',
    'A-21': 'La séptima disminuida (dominante secundaria)',
    'A-22': 'Marchas progresivas (I)',
    'A-23': 'Marchas progresivas (II)'
  };

  /* Los códigos internos de antes del 8/10/2026 (`A3-1`…`A4-11`). Están escritos en los
     ENLACES DE FICHAS repartidos y en el redirector de los QR impresos, así que se traducen
     al leerlos y no hay que reimprimir nada.

     OJO: esta tabla NO vale para los nombres de los archivos. Los archivos de MuseScore se
     llamaban ya por el número de TEMA —«A3-5. I, V y V7» es el tema 5— y no por el código
     interno, que para ese archivo era A3-1. Traducirlos con esta tabla los mandaría a la
     lección equivocada: los 19 archivos de la carpeta de Diego, todos. De eso se encarga
     `leccionDeNombre`, que simplemente tira el dígito del curso. */
  const CODIGO_ANTIGUO = {
    'A3-1': 'A-5',  'A3-2': 'A-6',  'A3-3': 'A-7',  'A3-4': 'A-8',
    'A3-5': 'A-9',  'A3-6': 'A-10', 'A3-7': 'A-11', 'A3-8': 'A-12',
    'A3-9': 'A-22', 'A4-10': 'A-13', 'A4-11': 'A-14'
  };
  // Un código cualquiera, viejo o nuevo, llevado al de hoy
  const leccionCanonica = lec => {
    const c = String(lec || '').trim().toUpperCase();
    return CODIGO_ANTIGUO[c] || String(lec || '').trim();
  };

  /* El número de la lección sale del propio código: ya no hay tabla que consultar.
     Conserva el nombre `temaDeLeccion` porque es como la llaman el configurador y la
     pantalla del alumno, y porque sigue siendo el número de tema del libro en el tramo
     3–21. */
  const numeroDeLeccion = lec => {
    const m = /-(\d{1,2})$/.exec(String(lec || '').trim());
    return m ? parseInt(m[1], 10) : null;
  };
  const temaDeLeccion = numeroDeLeccion;

  /* «A-7. V7 en inversión - Fragmentos bajo.mscz» → «A-7».
     MANDA EL CÓDIGO (Diego, 8/10/2026). Antes mandaba el título, por la ambigüedad que
     ya no existe; ahora el título del archivo no decide nada, de modo que renombrarlo no
     puede llevarse un fragmento a otra lección.

     Y los nombres de antes se leen tirando el dígito del curso, porque **ya estaban
     numerados por el TEMA**: «A3-5. I, V y V7» es el tema 5, o sea A-5 (su código interno
     era A3-1, que es otra cosa); «A4-13. Modulación al V» es A-13. Comprobado contra los
     19 archivos de la carpeta «Fragmentos por lecciones». */
  function leccionDeNombre(nombre) {
    const m = /^\s*([A-Za-z]{1,3})\d*\s*-\s*(\d{1,2})/.exec(String(nombre || ''));
    if (!m) return '';
    const pre = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    return pre + '-' + m[2];
  }
  /* El título. Sale de la tabla, que es la única fuente; del nombre del archivo solo se
     saca cuando el código no está en ella —una lección nueva que todavía no se ha dado de
     alta—, y entonces se quita el código, la extensión y la coletilla «- Fragmentos …». */
  function nombreDeLeccion(nombre) {
    const lec = leccionDeNombre(nombre);
    if (lec && LECCIONES[lec]) return LECCIONES[lec];
    let t = String(nombre || '').replace(/\.(mscz|mscx|musicxml|xml|json)$/i, '');
    t = t.replace(/^\s*[A-Za-z]{1,3}\d*\s*-\s*\d{1,2}\s*[.)\-–]?\s*/, '');
    t = t.split(/\s+[-–]\s+/)[0];
    return t.trim();
  }
  /* Etiqueta que se enseña: «Tema 14 · Modulación al relativo mayor». El código interno
     —A4-11— no se enseña en ninguna pantalla: Diego piensa en temas, y tenerlo que
     traducir mentalmente era justo la queja (1/10/2026). Si una lección no tiene tema
     asignado todavía, se enseña su código, que es mejor que nada. */
  function rotuloLeccion(lec, nombre) {
    const t = temaDeLeccion(lec);
    const cabeza = t ? 'Tema ' + t : (lec || '');
    return cabeza + (nombre ? ' · ' + nombre : '');
  }
  /* El título lo manda la tabla, no lo que quedó guardado en el fragmento: así cambiar
     un título en LECCIONES se ve en todas las pantallas sin volver a migrar el banco. */
  const etiquetaLeccion = e => rotuloLeccion(e.leccion, LECCIONES[e.leccion] || e.leccionNombre);
  // El repertorio que tiene guardado una lección (el de su primer fragmento)
  function repertorioDeLeccion(entradas, leccion) {
    const e = (entradas || []).find(x => x.leccion === leccion);
    return e ? { cifras: (e.leccionRepertorio || []).slice(), acordes: (e.leccionAcordes || []).slice() } : null;
  }
  /* ---------- EL SELLO: un fragmento CERRADO es criterio del profesor ----------
     (decisión 166, Diego 29/9/2026: «si yo asigno algo a un fragmento no puedes
     modificarlo porque mi criterio es experto y el tuyo es ciego aplicando reglas que aún
     no están terminadas de formular bien»).

     Un fragmento CERRADO lleva dos cosas: la fecha en que el profesor lo firmó (`cerrado`)
     y una HUELLA de su contenido armónico (`huella`). La fecha es el permiso —ningún
     camino del programa reescribe un fragmento cerrado— y la huella es la prueba: al
     cargar el banco se recalcula y, si no cuadra, se avisa con el identificador delante.
     Así el profesor no tiene que fiarse de que nada lo haya tocado: lo comprueba.

     Qué entra en la huella: lo que él asigna —tonalidad, compás, y de cada voz su música,
     sus modulaciones y sus cifrados admisibles con el modelo delante—. NO entra el
     repertorio de la lección: eso se cambia a propósito desde el panel de lecciones y
     haría saltar el aviso en fragmentos que nadie ha tocado. */
  function contenidoArmonico(e) {
    /* El 6.º grado elevado (decisión 179) entra en la huella SOLO cuando lo hay: así los
       fragmentos firmados antes de existir esta marca conservan su huella intacta. */
    const voz = v => (e[v]
      ? [JSON.stringify(e[v].compases || []), JSON.stringify(e[v].modulaciones || []), JSON.stringify(e[v].respuestas || [])]
        .concat((e[v].melodica && e[v].melodica.length) ? [JSON.stringify(e[v].melodica)] : [])
        .concat((e[v].reales && e[v].reales.some(Boolean)) ? ['&' + JSON.stringify(e[v].reales)] : []).join('|')
      : '—');
    /* LA REJILLA (decisión 238) entra también SOLO cuando la hay, y por la misma razón: es
       parte de lo que el profesor firma —dice qué momentos llevan acorde, y él la retoca a
       mano— y sin ella las respuestas no cuadrarían con la música; pero los fragmentos
       cerrados antes de que existiera no la llevan y conservan su huella intacta. */
    const rej = (e.rejilla && e.rejilla.length) ? '%' + JSON.stringify(e.rejilla) : '';
    /* Las cuatro voces escritas (200) entran en la huella SOLO cuando las hay, igual que el
       6.º elevado: los fragmentos firmados antes de que existieran conservan la suya. */
    const cuatro = (e.voces && e.voces.length) ? '#' + JSON.stringify(e.voces) : '';
    return [JSON.stringify(e.tonalidad || {}), JSON.stringify(e.compas || []), voz('bajo'), voz('soprano')].join('#') + cuatro + rej;
  }
  /* Dos pasadas distintas sobre el mismo texto (FNV-1a y la de Java), en hexadecimal: 16
     dígitos. No es criptografía —no hace falta: aquí nadie falsifica nada—, es detección de
     cambios, y para eso sobra. */
  function huellaDe(e) {
    const t = contenidoArmonico(e);
    let a = 0x811c9dc5, b = 0;
    for (let i = 0; i < t.length; i++) {
      const c = t.charCodeAt(i);
      a = ((a ^ c) >>> 0);
      a = (a + ((a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24))) >>> 0;
      b = (Math.imul(b, 31) + c) >>> 0;
    }
    return ('0000000' + a.toString(16)).slice(-8) + ('0000000' + b.toString(16)).slice(-8);
  }
  const estaCerrada = e => !!(e && e.cerrado);
  function cerrar(e, fecha) {
    if (!e) return e;
    e.cerrado = fecha || new Date().toISOString().slice(0, 10);
    e.huella = huellaDe(e);
    return e;
  }
  function abrir(e) {
    if (!e) return e;
    delete e.cerrado;
    delete e.huella;
    return e;
  }
  // ¿Cerrado y con el contenido cambiado desde que se firmó? Eso es lo que nunca debería pasar.
  const huellaRota = e => !!(e && e.cerrado && e.huella && huellaDe(e) !== e.huella);
  const rotas = entradas => (entradas || []).filter(huellaRota);
  const cuentaCerradas = entradas => (entradas || []).filter(estaCerrada).length;

  // Nombre de cada lección del banco, por si alguna entrada vieja no lo trae
  function nombresDeLecciones(entradas) {
    const out = {};
    (entradas || []).forEach(e => {
      if (!e.leccion || out[e.leccion]) return;
      const n = LECCIONES[e.leccion] || e.leccionNombre || nombreDeLeccion(e.fuente);
      if (n) out[e.leccion] = n;
    });
    return out;
  }

  return { VERSION, MODOS, modoDe, vozDeModo, paginaDeModo, entrada, nivel, nivelBase, cumple, filtrar, elegir, compasesDe,
    ejercicio, repertorioDe, codificar, decodificar, archivo, leerArchivo, lecciones, comparaLecciones, etiquetar,
    transportarEntrada, transportada, tonicasDeFicha, tonicaEn,
    analizarVoz: analizar, companeraDe: companera,
    candidatas, rejillaAutomatica, enRejilla, conNotasReales, conTiempo, pulso, posicionDe, rehacerConRejilla,
    cifraDeLoEscrito, modeloDeLoEscrito,
    huellaDe, estaCerrada, cerrar, abrir, huellaRota, rotas, cuentaCerradas,
    leccionDeNombre, nombreDeLeccion, etiquetaLeccion, rotuloLeccion, temaDeLeccion,
    nombresDeLecciones, repertorioDeLeccion, LECCIONES, CODIGO_ANTIGUO, leccionCanonica };
})();
