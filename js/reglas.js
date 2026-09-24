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

  // Lista plana de notas del ejercicio (objetos nota; los silencios no cuentan).
  function notasDe(ej) { return Teoria.notasDeCompases(ej.compases).map(n => Teoria.nota(n)); }
  // Frases: un silencio corta, de modo que la nota anterior es un final y la siguiente un comienzo
  const cortesDe = ej => Teoria.cortes(ej.compases);

  function contexto(notas, i, ton, cortes) {
    const cor = cortes || [];
    const inicioFrase = i === 0 || cor[i];
    const finFrase = i === notas.length - 1 || cor[i + 1];
    const n = notas[i], ant = inicioFrase ? null : notas[i - 1], sig = finFrase ? null : notas[i + 1];
    return {
      i, nota: n,
      grado: Teoria.grado(n, ton).grado,
      alt: Teoria.grado(n, ton).alt,
      llegada: ant ? movimiento(ant, n) : 'inicio',
      salida: sig ? movimiento(n, sig) : 'final',
      gradoAnt: ant ? Teoria.grado(ant, ton).grado : null,
      altAnt: ant ? Teoria.grado(ant, ton).alt : null,
      gradoSig: sig ? Teoria.grado(sig, ton).grado : null,
      altSig: sig ? Teoria.grado(sig, ton).alt : null,
      esUltima: finFrase,
      esPenultima: !finFrase && (i === notas.length - 2 || cor[i + 2]),
      total: notas.length
    };
  }

  const R = (admisibles, explicacion, regla) => ({ admisibles, explicacion, regla });

  /* ---- Las reglas, en orden de precedencia ---- */

  function r1_final(c) {
    if (!c.esUltima) return null;
    if (c.grado === 1) return R(['53'], 'Tónica final: tríada en estado fundamental.', 'R1 final');
    if (c.grado === 5) return R(['53'], 'Semicadencia: dominante en estado fundamental.', 'R1 final');
    /* El 3.er grado como nota final es la TÓNICA EN PRIMERA INVERSIÓN: es lo que pide el
       acorde anterior (la sensible sube a la tónica y la séptima baja a la tercera), y un
       III en estado fundamental dejaría el fragmento sin acabar. */
    if (c.grado === 3) return R(['6'], 'Nota final sobre el 3.er grado: tónica en primera inversión (I6).', 'R1 final');
    return R(['53'], 'Nota final: estado fundamental.', 'R1 final');
  }

  /* CUARTO GRADO ELEVADO (do♯ en Sol M, fa♯ en Do M): no es una nota diatónica, así que el
     acorde tampoco lo es. Esa nota es la SENSIBLE DE LA DOMINANTE, y el acorde, la
     DOMINANTE DE LA DOMINANTE: el V7 del V, cuya fundamental está en el 2.º grado (la en
     Sol M). Sobre este bajo va en primera inversión, de modo que el cifrado es el mismo
     6/5̸ del V7 —el + y la 5.ª tachada dicen «esto es dominante»— y la alteración la lleva
     el propio bajo escrito. El grado que se pide es el de la fundamental: II. */
  /* Cuarto grado ELEVADO. Es la sensible de la dominante, así que el acorde es la
     dominante de la dominante: V/V, con la fundamental en el 2.º grado, y sobre este bajo
     la cifra marcada 6/5̸. El caso típico —el que describen Aldwell y Schachter y el que
     practican en sus ejercicios— es el paso cromático 4 – ♯4 – 5 en el bajo. */
  function r0_dominanteDeLaDominante(c) {
    if (c.grado !== 4 || c.alt !== 1) return null;
    const tipico = c.gradoAnt === 4 && !c.altAnt && c.gradoSig === 5 && !c.altSig;
    return R(['65d'], tipico
      ? 'Cuarto grado elevado entre el cuarto natural y el quinto (do – do♯ – re): es el paso que Aldwell y Schachter describen como dominante de la dominante. El do♯ es la sensible de la dominante, la fundamental está en el 2.º grado y sobre este bajo se cifra 6/5̸: V/V, función DD.'
      : 'Cuarto grado elevado: es la sensible de la dominante, así que el acorde es la dominante de la dominante (V/V), cuya fundamental está en el 2.º grado; sobre este bajo, 6/5̸. Su función no es S ni D, sino DD.', 'R0 V/V');
  }

  function r2_cadencia(c, notas, ton) {
    if (!c.esPenultima || c.grado !== 5) return null;
    if (c.gradoSig !== 1) return null;
    return R(['53', '7+'], 'Cadencia auténtica: V (o V7, cifrado 7/+) → I.', 'R2 cadencia');
  }

  /* Misma nota que la anterior. Normalmente se mantiene el acorde; pero si además se pasa
     a una parte MÁS FUERTE, mantenerlo sería una síncopa armónica, así que la armonía ha de
     cambiar: lo natural es que la nota repetida se vuelva SÉPTIMA PREPARADA del acorde
     siguiente —4/2 (II4/2 sobre la tónica) o +4 si el intervalo ya es el de dominante— y
     baje de grado. Si la nota siguiente no baja de grado, se dejan los acordes del
     repertorio que contienen esta nota con otra fundamental. */
  function r3_repeticion(c, previo, ton, repertorio, cambia) {
    if (c.llegada !== 'unisono' || !previo) return null;
    if (cambia) {
      if (c.salida === '2desc') {
        const ids = ['42', '+4'].filter(id => repertorio.includes(id))
          .filter(id => { try { return !!Teoria.vocesSuperiores(id, c.nota, ton); } catch (e) { return false; } });
        // Si el 4/2 y el +4 dan las mismas notas, vale el marcado (el intervalo es de dominante)
        const iguales = ids.length === 2 && Teoria.claveAcorde('42', c.nota, ton) === Teoria.claveAcorde('+4', c.nota, ton);
        const fin = iguales ? ['+4'] : ids;
        if (fin.length) return R(fin, 'Nota repetida sobre el tiempo fuerte: la armonía ha de cambiar (si no, sería una síncopa armónica). La nota se vuelve séptima preparada y baja de grado.', 'R3 séptima preparada');
      }
      const otros = Object.keys(Teoria.CIFRADOS).filter(id => repertorio.includes(id) && id !== '64'
        && !previo.admisibles.some(a => { try { return Teoria.claveAcorde(a, c.nota, ton) === Teoria.claveAcorde(id, c.nota, ton); } catch (e) { return true; } }));
      if (otros.length) return R(otros, 'Nota repetida sobre el tiempo fuerte: la armonía ha de cambiar (si no, sería una síncopa armónica).', 'R3 cambio en el fuerte');
    }
    const adm = [...previo.admisibles];
    if (c.grado === 5 && !adm.includes('7+')) adm.push('7+');
    // Si el acorde anterior no dio ninguna cifra (pasa al leer un tramo en la tonalidad
    // de la modulación), no hay nada que mantener: que decidan las reglas siguientes.
    if (!adm.length) return null;
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
        /* Grado 4 que sube al 5: la subdominante que va a la dominante. El orden es el de
           Diego (decisión 76): primero el 6/5 (II6/5, la respuesta de la RO, que además trae
           la tónica); si la lección todavía no lo tiene, **II6 antes que IV**, porque IV → V
           con los dos acordes en estado fundamental es el tropiezo clásico de las quintas
           paralelas. El IV solo cuando la melodía trae la tónica —que el II6 no contiene—, y
           de eso se encarga solo el desempate por voz compañera de más abajo. Es además lo
           que ya hacía R5 para el 4.º grado entre el 6.º y el 5.º: ahora R7 dice lo mismo. */
        if (s === '2asc') return R(['65', '6', '53'], 'Grado 4 que asciende a grado 5: 6/5; si la lección no lo tiene, II6 (IV solo si la melodía trae la tónica).', 'R7 RO');
        if (s === '2desc') {
          if (c.llegada === '2desc') return R(['+4'], 'Grado 4 que desciende de grado 5 a grado 3: +4 (V7 en tercera inversión).', 'R7 RO');
          return R(['+4', '53'], 'Grado 4 que desciende a grado 3 (llegando por salto): +4, o IV.', 'R7 RO');
        }
        return R(['53'], 'Grado 4 que ni asciende a grado 5 ni desciende a grado 3: IV en estado fundamental.', 'R7 RO');
      /* Grado 5: la dominante; y, cuando la nota se repite, también el 6/4 CADENCIAL
         (I6/4 – V sobre el mismo bajo), que es la fórmula de A3-5. Se ofrece detrás de la
         dominante: lo elige la melodía cuando trae la tónica o la tercera, que son las
         notas que el 6/4 tiene y el V no. */
      case 5: return R(['53', '7+', '64'], 'Grado 5: dominante (sin 7ª, o V7 cifrado 7/+); si la nota se repite, también el 6/4 cadencial.', 'R7 RO');
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

  /* Las cifras de dominante sobre un bajo que no es el V dan una DOMINANTE SECUNDARIA
     (el +6 sobre el 6.º grado es el II como dominante del V, decisión 9). Es un recurso
     de más adelante, así que solo se propone cuando el ejercicio lo trae expresamente en
     su lista de acordes: si no, sobre esa misma nota se toma el acorde propio de la
     tonalidad (el VI, el IV6…), que es lo que espera la lección. */
  /* Si el ejercicio trae la lista de acordes de su lección, el modelo y las admisibles se
     limitan a ella: el alumno solo tiene esos acordes a mano —son los que se le muestran—,
     así que proponerle cualquier otro es ponerle una trampa. Es lo que deja fuera, por
     ejemplo, el III: en estas lecciones la tónica es solo I en estado fundamental o en
     primera inversión. */
  function acordePermitido(id, nota, ton, acordes) {
    if (!Array.isArray(acordes) || !acordes.length) return true;
    let rom;
    try { rom = Teoria.romano(id, nota, ton); } catch (e) { return true; }
    if (!rom) return true;
    return acordes.indexOf(rom + '|' + id) >= 0;
  }

  /* El 6/4 de estas lecciones es el CADENCIAL: va sobre el 5.º grado y resuelve en el V
     sobre ese mismo bajo, de modo que solo se propone cuando la nota siguiente repite la
     nota. Fuera de ahí —el 6/4 como arpegio de la tónica, do → sol— no se propone: sería
     un 6/4 que no resuelve, y además la fila de funciones lo daría por dominante. */
  function seiscuatroCadencial(id, c, notas, cortes, ton) {
    if (id !== '64') return true;
    if (c.esUltima) return false;
    const sig = notas[c.i + 1];
    if (!sig || (cortes && cortes[c.i + 1])) return false;
    try {
      if (Teoria.clase(sig) !== Teoria.clase(c.nota)) return false;
      return Teoria.grado(c.nota, ton).grado === 5;
    } catch (e) { return false; }
  }

  function dominanteSecundariaPermitida(id, nota, ton, acordes) {
    if (!Teoria.DOMINANTES.includes(id)) return true;
    let rom;
    try { rom = Teoria.romano(id, nota, ton); } catch (e) { return true; }
    if (!rom || rom === 'V') return true;
    return Array.isArray(acordes) && acordes.indexOf(rom + '|' + id) >= 0;
  }

  /* La cifra ha de cuadrar con el bajo escrito: el bajo teórico del acorde (el grado que
     esa cifra pone debajo) tiene que ser la nota que hay. Así un V6 sobre un sol♮ en la
     menor —que pediría sol♯— no se propone, en vez de salir como una dominante sin
     sensible. */
  function cuadraConElBajo(id, n, ton) {
    let rom; try { rom = Teoria.romano(id, n, ton); } catch (e) { return true; }
    if (!rom) return true;
    for (const t of Teoria.variantesTon(ton)) {
      const esp = Teoria.bajoDe(rom, id, t, false);
      if (esp && esp.letra === n.letra && esp.alt === n.alt) return true;
    }
    return false;
  }

  // Todas las notas leídas en una sola tonalidad.
  function proponerEn(ej, ton, fijos) {
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const notas = notasDe(ej);
    const cortes = cortesDe(ej);
    const fuerzas = Teoria.fuerzasMetricas(ej.compases, ej.compas);
    const salida = [];
    for (let i = 0; i < notas.length; i++) {
      const c = contexto(notas, i, ton, cortes);
      const previo = cortes[i] ? null : (salida[i - 1] || null);   // tras un silencio no se arrastra el acorde anterior
      const cambia = Teoria.pideCambio(fuerzas, i) && !cortes[i];  // se pasa a una parte más fuerte
      /* Las reglas se prueban en orden y gana la primera que deja alguna cifra DEL
         REPERTORIO de la lección. Que una regla se cumpla no basta: si lo que propone no
         está en el repertorio —el arpegio del VII sobre la sensible cuando la lección solo
         tiene I, V y VII6—, se sigue probando con las siguientes, que es lo que haría el
         alumno con los acordes que tiene a mano. */
      const filtra = ids => ids.filter(id => repertorio.includes(id) && cuadraConElBajo(id, c.nota, ton)
        && dominanteSecundariaPermitida(id, c.nota, ton, ej.acordes) && acordePermitido(id, c.nota, ton, ej.acordes)
        && seiscuatroCadencial(id, c, notas, cortes, ton));
      const candidatas = [
        () => r1_final(c), () => r0_dominanteDeLaDominante(c), () => r2_cadencia(c, notas, ton),
        () => r3_repeticion(c, previo, ton, repertorio, cambia),
        () => r4_arpegio(c, previo, notas, ton, repertorio), () => r5_funcional(c),
        () => r6_cuartoSalta(c), () => r7_regla_octava(c)
      ];
      let r = null, adm = [], primera = null;
      for (const regla of candidatas) {
        const x = regla();
        if (!x) continue;
        if (!primera) primera = x;
        const ids = filtra(x.admisibles);
        if (ids.length) { r = x; adm = ids; break; }
      }
      if (!r) { r = primera || R([], 'Sin regla aplicable.', '—'); adm = []; }
      /* La VOZ COMPAÑERA (la melodía escrita, cuando el archivo trae las dos voces) elige
         entre las admisibles: se pone delante la que contiene la nota que suena a la vez.
         Se hace aquí dentro, y no después, para que las reglas de las notas siguientes
         —el arpegio, la nota repetida— partan del acorde que de verdad se ha elegido. */
      if (ej.companera && ej.companera[i] && adm.length > 1) {
        let mejor = null;
        try {
          const cl = Teoria.clase(Teoria.nota(ej.companera[i]));
          mejor = adm.find(id => {
            const t = Teoria.tonParaBajo(id, c.nota, ton, ej.companera[i]);
            return [Teoria.clase(c.nota), ...Teoria.vocesSuperiores(id, c.nota, t).map(Teoria.clase)].includes(cl);
          });
        } catch (e) { mejor = null; }
        if (mejor) adm = [mejor, ...adm.filter(x => x !== mejor)];
      }
      /* Cifras ya decididas por la sintaxis de la cadencia: se imponen aquí para que las
         reglas de las notas siguientes —el arpegio, la nota repetida— vean el acorde bueno
         y no el que había antes de corregirlo. */
      if (fijos && fijos[i]) adm = [fijos[i], ...adm.filter(x => x !== fijos[i])];
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
  /* ---- Síncopa armónica en un bajo dado ----
     Dos cifras seguidas que dan el MISMO acorde al pasar a una parte más fuerte. Se compara
     el acorde entero (sus clases de altura), de modo que I y I6 cuentan como el mismo. */
  function sincopaBajo(ej, i, cifraAnt, cifraAct) {
    if (i < 1 || !cifraAnt || !cifraAct) return false;
    if (cifraAnt === '64' || cifraAct === '64') return false;        // el 6/4 cadencial es otra armonía
    const fuerzas = Teoria.fuerzasMetricas(ej.compases, ej.compas);
    if (!Teoria.pideCambio(fuerzas, i) || cortesDe(ej)[i]) return false;
    const notas = notasDe(ej), tons = Teoria.tonalidadesPorNota(ej);
    try {
      // Arpegio del mismo acorde (el bajo cambia de nota): no es síncopa, es la marcha de la RO
      if (Teoria.clase(Teoria.nota(notas[i - 1])) !== Teoria.clase(Teoria.nota(notas[i]))) return false;
      return Teoria.claveAcorde(cifraAnt, notas[i - 1], tons[i - 1]) === Teoria.claveAcorde(cifraAct, notas[i], tons[i]);
    } catch (e) { return false; }
  }

  /* La respuesta MODELO no sincopa nunca: donde la haya se busca otra cifra admisible de
     esa nota (o de la anterior) que cambie de armonía. Las cifras siguen siendo admisibles
     —el fallo es de la pareja, no de la cifra—, solo cambia cuál es la modelo. */
  /* ---- Sintaxis de la cadencia (reglas de Diego, 21/9/2026) ----

     El motor de la regla de la octava mira cada nota con su contexto inmediato, así que
     puede acertar en cada acorde y equivocarse en la frase. Dos reglas la enderezan:

     · **Delante de la tónica solo va la dominante.** La subdominante no vuelve a la
       tónica mientras no se haya dado la fórmula T S T (que hoy no tiene fragmentos).
       Si el modelo pone una subdominante antes de una tónica, se cambia por la dominante
       que cabe sobre ese mismo bajo: casi siempre el **V4/2**, con la séptima preparada
       por el acorde anterior, que baja de grado a la tercera de la tónica (fa–mi sobre
       IV – V4/2 – I6).
     · **En la cadencia final, la subdominante antes de la dominante**, siempre que se
       pueda. Si el final es una fila de acordes de dominante —el V arpegiado durante dos
       compases—, los primeros se cambian por subdominante (IV, II, II6…) y se deja la
       dominante pegada a la tónica: el esquema es S – D – T.

     Cuando sobre ese bajo no cabe lo que la regla pide, se deja lo que había y se marca
     (`sinSubdominante`) para que el profesor lo confirme. */

  // Orden de preferencia al buscar un acorde de cada función (el de la regla de la octava)
  const ORDEN_S = ['53', '6', '65', '43', '7', '42', '64'];
  const ORDEN_D = ['+4', '65d', '+6', '53', '7+', '6', '65', '43', '7', '42', '64'];

  function funcionDeId(id, n, ton, idSig, nSig, tonSig) {
    try {
      const rom = Teoria.romano(id, n, ton);
      let romSig = null;
      if (idSig && nSig && tonSig) { try { romSig = Teoria.romano(idSig, nSig, tonSig); } catch (e) { romSig = null; } }
      return Teoria.funcionDe(rom, romSig, id);
    } catch (e) { return null; }
  }

  // Tríada disminuida en estado fundamental (el II del menor, el VII): no se propone
  function disminuidaEnFundamental(id, n, ton) {
    if (id !== '53') return false;
    try {
      const b = Teoria.clase(n);
      return Teoria.vocesSuperiores(id, n, ton).some(x => (Teoria.clase(x) - b + 12) % 12 === 6);
    } catch (e) { return false; }
  }

  // Cifras del repertorio que sobre ese bajo dan un acorde de la función pedida
  function candidatosFuncion(n, ton, repertorio, acordes, fun, idSig, nSig, tonSig) {
    return (fun === 'S' ? ORDEN_S : ORDEN_D).filter(id => Teoria.CIFRADOS[id] && repertorio.includes(id)
      && cuadraConElBajo(id, n, ton)
      && dominanteSecundariaPermitida(id, n, ton, acordes)
      && acordePermitido(id, n, ton, acordes)
      && !disminuidaEnFundamental(id, n, ton)
      && funcionDeId(id, n, ton, idSig, nSig, tonSig) === fun);
  }

  /* ¿Se puede poner esta cifra en la nota i sin romper nada? Se comprueban las dos
     obligaciones del bajo: la séptima (+4, 4/2) baja de grado y ha de venir preparada
     —el acorde anterior contiene ya esa nota—, y no se crea una síncopa armónica. */
  function cabeAqui(ej, salida, notas, ton, i, id, previo) {
    const septima = id === '+4' || id === '42';
    if (septima) {
      const sig = notas[i + 1];
      if (!sig) return false;
      const d = Teoria.indice(notas[i]) - Teoria.indice(sig);
      if (d !== 1) return false;                                    // la séptima baja de grado
      if (previo) {
        try {
          const clases = [Teoria.clase(notas[i - 1]), ...Teoria.vocesSuperiores(previo, notas[i - 1], ton).map(Teoria.clase)];
          if (!clases.includes(Teoria.clase(notas[i]))) return false;   // séptima sin preparar
        } catch (e) { return false; }
      }
    }
    if (previo && sincopaBajo(ej, i, previo, id)) return false;
    const sig = (salida[i + 1] && salida[i + 1].admisibles && salida[i + 1].admisibles[0]) || null;
    if (sig && sincopaBajo(ej, i + 1, id, sig)) return false;
    return true;
  }

  function sintaxisCadencial(ej, salida) {
    const notas = notasDe(ej);
    if (notas.length < 3 || notas.length !== salida.length) return salida;
    let tons;
    try { tons = Teoria.tonalidadesPorNota(ej); } catch (e) { return salida; }
    const cortes = cortesDe(ej);
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const modelo = i => (salida[i] && salida[i].admisibles && salida[i].admisibles[0]) || null;
    const fun = i => { const id = modelo(i); return id ? funcionDeId(id, notas[i], tons[i], modelo(i + 1), notas[i + 1], tons[i + 1]) : null; };
    const poner = (i, id, texto) => {
      salida[i].admisibles = [id, ...salida[i].admisibles.filter(x => x !== id)];
      salida[i].modelo = id;
      salida[i].explicacion = texto;
      salida[i].fijado = true;      // lo eligió la sintaxis de la cadencia: no se reordena después
    };

    /* 1) Cadencia final: subdominante antes de la dominante. Se recorre hacia atrás la
          fila de acordes de dominante que preceden a la tónica final; si son dos o más y
          delante no hay ya una subdominante, los primeros se cambian por subdominante. */
    const f = salida.length - 1;
    if (fun(f) === 'T') {
      let d0 = f - 1;
      while (d0 > 0 && fun(d0) === 'D' && !cortes[d0 + 1]) d0--;
      if (fun(d0) !== 'D' || cortes[d0 + 1]) d0++;
      if (f - d0 >= 2 && (d0 === 0 || cortes[d0] || fun(d0 - 1) !== 'S')) {
        let puesta = false;
        for (let i = d0; i <= f - 2; i++) {
          const id = candidatosFuncion(notas[i], tons[i], repertorio, ej.acordes, 'S', modelo(i + 1), notas[i + 1], tons[i + 1])
            .find(x => cabeAqui(ej, salida, notas, tons[i], i, x, i > 0 && !cortes[i] ? modelo(i - 1) : null));
          if (!id) break;
          poner(i, id, 'Cadencia final: antes de la dominante va la subdominante (S – D – T).');
          puesta = true;
        }
        if (!puesta) salida[f].sinSubdominante = true;
      }
    }

    /* 2) Delante de la tónica solo va la dominante. */
    for (let i = 0; i < f; i++) {
      const id = modelo(i), sig = modelo(i + 1);
      if (!id || !sig || cortes[i + 1]) continue;
      if (fun(i) !== 'S' || fun(i + 1) !== 'T') continue;
      let rom, romSig;
      try { rom = Teoria.romano(id, notas[i], tons[i]); romSig = Teoria.romano(sig, notas[i + 1], tons[i + 1]); } catch (e) { continue; }
      if (rom === romSig) continue;                                   // el mismo acorde, no hay sucesión
      const otro = candidatosFuncion(notas[i], tons[i], repertorio, ej.acordes, 'D', sig, notas[i + 1], tons[i + 1])
        .find(x => cabeAqui(ej, salida, notas, tons[i], i, x, i > 0 && !cortes[i] ? modelo(i - 1) : null));
      if (otro) poner(i, otro, 'Delante de la tónica va la dominante: la subdominante no vuelve a la tónica (no hay aquí fórmula T S T).');
      else salida[i].sinDominante = true;
    }
    return salida;
  }

  function evitarSincopas(ej, salida) {
    const modelo = i => (salida[i] && salida[i].admisibles && salida[i].admisibles[0]) || null;
    const poner = (i, id) => {
      const adm = salida[i].admisibles;
      salida[i].admisibles = [id, ...adm.filter(x => x !== id)];
      salida[i].modelo = id;
    };
    for (let i = 1; i < salida.length; i++) {
      if (!sincopaBajo(ej, i, modelo(i - 1), modelo(i))) continue;
      const otra = (salida[i].admisibles || []).find(id => !sincopaBajo(ej, i, modelo(i - 1), id));
      if (otra) { poner(i, otra); continue; }
      // Si esta nota no tiene alternativa, se prueba a cambiar la anterior
      const antes = (salida[i - 1].admisibles || []).find(id =>
        !sincopaBajo(ej, i, id, modelo(i)) && (i < 2 || !sincopaBajo(ej, i - 1, modelo(i - 2), id)));
      if (antes) poner(i - 1, antes);
    }
    return salida;
  }

  /* El motor se pasa DOS VECES: la primera da la lectura de la regla de la octava, la
     sintaxis de la cadencia corrige lo que haga falta, y la segunda vuelve a leerlo todo
     con esas correcciones ya puestas, para que las reglas que miran el acorde anterior
     —el arpegio, la nota repetida— partan del acorde bueno. */
  function proponer(ej) {
    let salida = sintaxisCadencial(ej, proponerBase(ej));
    for (let vuelta = 0; vuelta < 2; vuelta++) {
      const fijos = {};
      salida.forEach((x, i) => { if (x.fijado && x.admisibles && x.admisibles[0]) fijos[i] = x.admisibles[0]; });
      if (!Object.keys(fijos).length) break;
      const otra = sintaxisCadencial(ej, proponerBase(ej, fijos));
      const igual = otra.length === salida.length && otra.every((x, i) => (x.admisibles[0] || null) === (salida[i].admisibles[0] || null));
      salida = otra;
      if (igual) break;
    }
    return evitarSincopas(ej, salida);
  }

  function proponerBase(ej, fijos) {
    const mods = (ej.modulaciones || []).filter(m => m && m.tonalidad && Number.isInteger(m.nota)).slice().sort((a, b) => a.nota - b.nota);
    if (!mods.length) return proponerEn(ej, ej.tonalidad, fijos);
    const repertorio = ej.repertorio || Object.keys(Teoria.CIFRADOS);
    const notas = notasDe(ej);
    const tramos = [{ desde: 0, tonalidad: ej.tonalidad }].concat(mods.map(m => ({ desde: m.nota, tonalidad: m.tonalidad })));
    const ejecuciones = tramos.map(t => proponerEn(ej, t.tonalidad, fijos));
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
        ids = Object.keys(Teoria.CIFRADOS).filter(id => repertorio.includes(id) && comun(id)
          && dominanteSecundariaPermitida(id, notas[i], tonA, ej.acordes) && dominanteSecundariaPermitida(id, notas[i], tonB, ej.acordes)
          && acordePermitido(id, notas[i], tonA, ej.acordes) && acordePermitido(id, notas[i], tonB, ej.acordes));
        regla = 'Pivote (sin RO)';
      }
      /* Si no hay ningún acorde común, la modulación es CROMÁTICA: la nota rotulada lleva
         una alteración ajena a la tonalidad de partida (el do♯ al pasar de Sol M a Re M),
         y entonces no hay acorde pivote que valga. La tonalidad nueva empieza ahí sin más,
         con sus propios acordes; se dice así en la explicación. */
      let cromatica = false;
      if (!ids.length) { ids = actual.admisibles.slice(); regla = 'Modulación cromática'; cromatica = ids.length > 0; }
      const dobles = [];
      if (!cromatica) ids.forEach(id => { const d = romA(id) + ' de ' + Teoria.nombreCorto(tonA) + ' = ' + romB(id) + ' de ' + Teoria.nombreCorto(tonB); if (!dobles.includes(d)) dobles.push(d); });
      salida.push({
        admisibles: ids,
        modelo: ids[0] || null,
        explicacion: cromatica
          ? 'Modulación cromática: la alteración de esta nota es ajena a ' + Teoria.nombreCorto(tonA)
            + ', así que no hay acorde pivote; aquí empieza ya ' + Teoria.nombreCorto(tonB) + '.'
          : ids.length
            ? 'Acorde pivote, común a las dos tonalidades: ' + dobles.join('; ') + '.'
            : '⚠ Ninguna cifra del repertorio da sobre esta nota un acorde común a ' + Teoria.nombreCorto(tonA) + ' y ' + Teoria.nombreCorto(tonB) + '. Elige otra nota como pivote.',
        regla,
        contexto: actual.contexto,
        pivote: { tonalidadAntes: tonA, tonalidadDespues: tonB, cromatica }
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

  // Candidatos de la nota i (melodía s, tonalidad ton) dentro del repertorio de cifras o,
  // si el ejercicio trae una lista de acordes (ej.acordes = ['I|53', 'IV|6', …]), solo entre esos.
  function candidatosSoprano(s, tonBase, repertorio, esUltima, acordes) {
    const out = [];
    const cs = claseDe(s);
    const sensibleTon = (Teoria.clase(Teoria.nota(tonBase.tonica + '4')) + 11) % 12;
    const lista = Array.isArray(acordes) && acordes.length ? acordes.map(x => { const k = String(x).indexOf('|'); return { romano: x.slice(0, k), id: x.slice(k + 1) }; }) : null;
    Teoria.ROMANOS.forEach(romano => {
      repertorio.forEach(id => {
        if (lista && !lista.some(a => a.romano === romano && a.id === id)) return;
        // Menor melódica: el acorde se construye con la inflexión que contenga la nota de la melodía
        const ton = Teoria.tonParaAcorde(romano, id, tonBase, s);
        if (!lista) {
          if (romano === 'III') return;                                 // fuera de la sintaxis diatónica del cuadro (T = I, VI; S = II, IV, VI; D = V, VII)
          if ((id === '65' || id === '43' || id === '7') && romano !== 'II') return;   // séptimas diatónicas: solo el II (II7, II6/5, II4/3)
          if (id === '9' && romano !== 'V') return;
          if (romano === 'VI' && id !== '53') return;                   // el VI solo en estado fundamental (sobre el 1.º grado del bajo siempre va I)
          if (romano === 'VII' && id !== '6') return;                   // el VII solo en primera inversión (VII6), como en la RO
        }
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
          miembro, sensibleBajo: sensibles.has(cb), septimaBajo: id === '+4', claseBajo: cb, claseFund: Teoria.clase(fund),
          melodica: !!ton.melodica, avisos, coste });
      });
    });
    return out;
  }

  // ¿Puede seguir el candidato q (nota i) al candidato p (nota i-1)? sp, sq: notas de la melodía;
  // fp, fq: funciones fijadas; reglas: {tst: se admite la fórmula T S T (I – IV – I), esFinal: q es el último acorde}.
  function enlaceValido(p, q, sp, sq, fp, fq, reglas = {}) {
    const mismoAcorde = p.claseFund === q.claseFund && p.cifra !== '64' && q.cifra !== '64';
    /* Síncopa armónica: al pasar a una parte más fuerte —el primer tiempo del compás, o el
       3.º de 4/4— la armonía ha de cambiar. Un acorde que entra en parte débil y se
       prolonga sobre la fuerte suena sincopado. (En los compases ternarios el 2.º y el
       3.er tiempo pesan igual, así que del 2.º al 3.º no hay síncopa.) No cuenta el
       ARPEGIO —el mismo acorde con el bajo en otra nota, como V4/3 → V6/5—, que es la
       marcha normal de la regla de la octava—, ni añadir la séptima al mismo acorde
       (V → V7 sobre el mismo bajo), que sí es un cambio de armonía. */
    if (reglas.pideCambio && mismoAcorde && p.claseBajo === q.claseBajo && p.cifra === q.cifra) return false;
    // Funciones: no se retrocede D → S
    const fsP = fp ? [fp] : p.funciones, fsQ = fq ? [fq] : q.funciones;
    if (!mismoAcorde && fsP.every(f => f === 'D') && fsQ.every(f => f === 'S')) return false;
    // La dominante secundaria (V/V, función DD) va a la dominante, y a nada más
    if (!mismoAcorde && fsP.every(f => f === 'DD') && !fsQ.every(f => f === 'D')) return false;
    if (!mismoAcorde && fsQ.every(f => f === 'DD') && fsP.every(f => f === 'D')) return false;
    // Subdominante → tónica: la subdominante (II, IV o VI) no vuelve a la tónica, va a la
    // dominante (regla de Diego). Única excepción: el IV como fórmula T S T (bordadura
    // I – IV – I), si está permitida, o como cadencia plagal final.
    if (!mismoAcorde && (fsP.every(f => f === 'S') || p.romano === 'VI') && fsQ.every(f => f === 'T') && q.romano !== 'VI') {
      if (p.romano !== 'IV') return false;
      if (!reglas.tst && !reglas.esFinal) return false;
    }
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
    const tst = ej.formulaTST !== false;
    const cortes = cortesDe(ej);
    /* Frases: un silencio corta el fragmento. Cada frase tiene su comienzo (tónica) y su
       cadencia (S – D – T), y no hay enlace entre el final de una y el principio de la siguiente. */
    const frases = [];
    for (let i = 0; i < n; i++) { if (i === 0 || cortes[i]) frases.push({ ini: i, fin: i }); else frases[frases.length - 1].fin = i; }
    const fraseDe = new Array(n);
    frases.forEach((f, q) => { for (let i = f.ini; i <= f.fin; i++) fraseDe[i] = q; });
    const finDeFrase = i => frases[fraseDe[i]].fin === i;
    const fuerzas = Teoria.fuerzasMetricas(ej.compases, ej.compas);
    const reglasEn = i => ({ tst, esFinal: finDeFrase(i), pideCambio: Teoria.pideCambio(fuerzas, i) && !cortes[i] });
    const esFun = (x, f) => x.funciones.includes(f);
    const soloFun = (cs, f) => { const s = cs.filter(x => esFun(x, f)); return s.length ? s : null; };

    // Todos los acordes que contienen cada nota (se devuelven para la revisión del profesor)
    const candsTodos = notas.map((s, i) => candidatosSoprano(s, tons[i], repertorio, finDeFrase(i), ej.acordes));
    // …y, para las sucesiones, solo los de la función fijada por el profesor, si la hay
    const base = candsTodos.map((cs, i) => (forzadas[i] ? cs.filter(x => x.funciones.includes(forzadas[i])) : cs.slice()));
    // Una nota sin ningún acorde posible rompe la cadena, para no invalidar el resto del fragmento
    const rompe = i => i === 0 || cortes[i] || base[i - 1].length === 0;

    /* Un intento de análisis: aplica (o no, frase por frase) las reglas de comienzo y de
       cadencia y busca con programación dinámica la mejor sucesión. Si una frase se queda
       sin salida por culpa de esas reglas —por ejemplo, la única subdominante posible haría
       quintas con la melodía—, se repite sin ellas en esa frase. */
    function intentar(conReglas) {
      const cands = base.map(cs => cs.map(x => Object.assign({}, x)));
      const pos64 = new Set(), finPlagal = new Set();
      frases.forEach((fr, q) => {
        if (!conReglas[q]) return;
        const ini = fr.ini, fin = fr.fin, largo = fin - ini + 1;
        if (!forzadas[ini]) {
          const c0 = cands[ini].filter(x => x.cifra !== '64');
          const tonica = c0.filter(x => x.romano === 'I');
          const dominante = c0.filter(x => x.romano === 'V' || x.romano === 'VII');
          if (tonica.length || dominante.length || c0.length) cands[ini] = tonica.length ? tonica : dominante.length ? dominante : c0;
        }
        if (largo < 3 || forzadas[fin]) return;
        let con64 = false, plagal = false;
        const finalEnI = cands[fin].some(x => x.romano === 'I');
        if (finalEnI) {
          if (!forzadas[fin - 1]) {
            const d = (() => { const x = cands[fin - 1].filter(y => esFun(y, 'D') && y.cifra !== '64'); return x.length ? x : null; })();   // dominante de verdad (el 6/4 no cuenta)
            if (d) cands[fin - 1] = d;
            else { const s = soloFun(cands[fin - 1], 'S'); if (s) { cands[fin - 1] = s; plagal = true; } }   // sin dominante posible: cadencia plagal
          }
          if (largo >= 4 && !forzadas[fin - 2] && !plagal) {
            const seisCuatro = cands[fin - 2].filter(x => x.romano === 'I' && x.cifra === '64');
            const vRaiz = cands[fin - 1].some(x => x.romano === 'V' && (x.cifra === '53' || x.cifra === '7+'));
            if (seisCuatro.length && vRaiz) {
              con64 = true;
              pos64.add(fin - 2);
              seisCuatro.forEach(x => { x.coste = -4; });
              cands[fin - 2] = seisCuatro.concat(cands[fin - 2].filter(x => x.cifra !== '64' && esFun(x, 'S')));
            }
          }
          // Subdominante antes de la dominante (o antes del 6/4 cadencial), siempre que la nota lo permita
          const posS = con64 ? fin - 3 : fin - 2;
          if (!plagal && posS > ini && !forzadas[posS]) { const s = soloFun(cands[posS], 'S'); if (s) cands[posS] = s; }
        } else if (cands[fin].some(x => x.romano === 'V') && !forzadas[fin - 1]) {
          const s = soloFun(cands[fin - 1], 'S');
          if (s) cands[fin - 1] = s;
          else { const noD = cands[fin - 1].filter(x => !x.funciones.every(f => f === 'D')); if (noD.length) cands[fin - 1] = noD; }
        }
        if (plagal) finPlagal.add(fin);
      });
      // El 6/4 solo como cadencial, en su sitio
      for (let i = 0; i < n; i++) if (!pos64.has(i)) cands[i] = cands[i].filter(x => x.cifra !== '64' || forzadas[i]);

      // Programación dinámica hacia delante: mejor coste de llegar a cada candidato
      const capas = cands.map(cs => cs.map(x => ({ x, coste: Infinity, ant: null, alcanzable: false })));
      const costeInicio = nd => nd.x.coste + (nd.x.romano === 'I' ? 0 : 4) + (nd.x.cifra === '53' ? 0 : 2);   // empezar en I, mejor en estado fundamental
      for (let i = 0; i < n; i++) {
        if (rompe(i)) { capas[i].forEach(nd => { nd.coste = costeInicio(nd); nd.ant = null; nd.alcanzable = true; }); continue; }
        const fin = frases[fraseDe[i]].fin, largo = fin - frases[fraseDe[i]].ini + 1;
        capas[i].forEach(nd => {
          capas[i - 1].forEach((pv, k) => {
            if (!pv.alcanzable || !enlaceValido(pv.x, nd.x, notas[i - 1], notas[i], forzadas[i - 1], forzadas[i], reglasEn(i))) return;
            let extra = nd.x.coste + costeEnlace(pv.x, nd.x, notas[i - 1], notas[i], i === fin);
            // Cadencia: mejor V en estado fundamental → I (perfecta); antes, mejor una subdominante (T S D T) o el 6/4 cadencial
            if (i === fin) extra += (pv.x.romano === 'V' && (pv.x.cifra === '53' || pv.x.cifra === '7+')) ? 0 : pv.x.funciones.every(f => f === 'D') ? 3 : finPlagal.has(fin) ? 0 : pv.x.funciones.includes('S') ? 4 : 6;
            if (i === fin - 1 && largo > 3) extra += (pv.x.cifra === '64' || pv.x.funciones.includes('S')) ? 0 : 4;
            const total = pv.coste + extra;
            if (total < nd.coste) { nd.coste = total; nd.ant = k; }
          });
          nd.alcanzable = nd.coste < Infinity;
        });
      }
      return { cands, capas };
    }

    let r = intentar(frases.map(() => true));
    const fallan = frases.map(fr => base[fr.fin].length > 0 && !r.capas[fr.fin].some(nd => nd.alcanzable));
    if (fallan.some(Boolean)) r = intentar(fallan.map(x => !x));      // sin las reglas de cadencia en las frases que se quedaban sin salida
    const cands = r.cands, capas = r.capas;

    // Hacia atrás: qué candidatos llegan al final de su frase por un camino válido
    const util = capas.map(capa => capa.map(() => false));
    // Final de cadena: fin de frase, o la nota anterior a una que no tiene ningún acorde posible
    for (let i = 0; i < n; i++) if (finDeFrase(i) || (i + 1 < n && base[i + 1].length === 0))
      capas[i].forEach((nd, k) => { util[i][k] = nd.alcanzable; });
    for (let i = n - 1; i > 0; i--) {
      if (rompe(i)) { capas[i - 1].forEach((pv, j) => { if (pv.alcanzable) util[i - 1][j] = true; }); continue; }
      capas[i].forEach((nd, k) => {
        if (!util[i][k]) return;
        capas[i - 1].forEach((pv, j) => { if (pv.alcanzable && enlaceValido(pv.x, nd.x, notas[i - 1], notas[i], forzadas[i - 1], forzadas[i], reglasEn(i))) util[i - 1][j] = true; });
      });
    }

    // Camino modelo (en cada frase, el de menor coste)
    const modeloIdx = new Array(n).fill(null);
    const mejorDe = i => { let m = null; capas[i].forEach((nd, k) => { if (nd.alcanzable && util[i][k] && (m === null || nd.coste < capas[i][m].coste)) m = k; }); return m; };
    { let k = mejorDe(n - 1);
      for (let i = n - 1; i >= 0; i--) {
        if (k === null || k === undefined) k = mejorDe(i);
        modeloIdx[i] = k;
        k = (k === null || k === undefined) ? null : capas[i][k].ant;   // al comienzo de una frase, ant es null: se toma el mejor de la anterior
      } }

    return notas.map((s, i) => {
      const cs = cands[i];
      const admIdx = cs.map((_, k) => k).filter(k => util[i][k]);
      const orden = k => (modeloIdx[i] === k ? -1 : cs[k].coste);
      admIdx.sort((a, b) => orden(a) - orden(b));
      const admisibles = admIdx.map(k => cs[k].id);
      const modelo = modeloIdx[i] !== null && modeloIdx[i] !== undefined ? cs[modeloIdx[i]] : (admIdx.length ? cs[admIdx[0]] : null);
      let explicacion;
      if (!candsTodos[i].length) explicacion = '⚠ Ningún acorde del repertorio contiene esta nota' + (forzadas[i] ? ' con la función ' + forzadas[i] : '') + '.';
      else if (!base[i].length) explicacion = '⚠ Ningún acorde con la función ' + forzadas[i] + ' contiene esta nota.';
      else if (!modelo) explicacion = '⚠ Ninguno de los acordes que contienen esta nota encaja en una sucesión válida (revisa las funciones o el repertorio).';
      else {
        const cif = Teoria.CIFRADOS[modelo.cifra].etiqueta;
        const sig = i + 1 < n && modeloIdx[i + 1] !== null && modeloIdx[i + 1] !== undefined && cands[i + 1][modeloIdx[i + 1]] ? cands[i + 1][modeloIdx[i + 1]].romano : null;
        const f = forzadas[i] || Teoria.funcionDe(modelo.romano, sig, modelo.cifra);
        explicacion = Teoria.nombreEs(Teoria.nota(s)) + ' es la ' + MIEMBRO_TXT[modelo.miembro] + ' de ' + Teoria.gradoEscrito(modelo.romano, modelo.cifra) + (cif === '—' ? '' : ' ' + cif)
          + ' (bajo ' + Teoria.nombreEs(modelo.bajo) + (modelo.melodica ? ', menor melódica' : '') + '; función ' + f + ', ' + Teoria.NOMBRE_FUNCION[f] + ')' + (modelo.avisos.length ? '; ' + modelo.avisos.join(', ') : '') + '.';
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
    const rom = Teoria.gradoInterno(romano);   // el alumno escribe V/V; por dentro es el II
    return candidatosSoprano(notas[i], ton, [cifra], false, null).find(x => x.romano === rom) || null;
  }

  // Enlace entre las respuestas del alumno en las notas i-1 e i: {ok, motivo}
  function enlaceAlumno(ej, i, parAnt, parAct) {
    const p = candidatoDe(ej, i - 1, parAnt.romano, parAnt.cifra), q = candidatoDe(ej, i, parAct.romano, parAct.cifra);
    if (!p || !q) return { ok: true, motivo: '' };
    const notas = notasDe(ej);
    const fuerzas = Teoria.fuerzasMetricas(ej.compases, ej.compas);
    const reglas = { tst: ej.formulaTST !== false, esFinal: i === notas.length - 1,
      pideCambio: Teoria.pideCambio(fuerzas, i) && !cortesDe(ej)[i] };
    if (enlaceValido(p, q, notas[i - 1], notas[i], null, null, reglas)) return { ok: true, motivo: '' };
    const mismoAcorde = p.claseFund === q.claseFund;
    let motivo = 'el enlace con el acorde anterior no es correcto';
    if (mismoAcorde && reglas.pideCambio && p.claseBajo === q.claseBajo && p.cifra === q.cifra && p.cifra !== '64' && q.cifra !== '64') {
      return { ok: false, motivo: 'síncopa armónica: el acorde entra en parte débil y se prolonga sobre la fuerte; en el tiempo fuerte la armonía ha de cambiar' };
    }
    const esS = x => x.funciones.every(f => f === 'S'), esT = x => x.funciones.every(f => f === 'T');
    if (!mismoAcorde && (esS(p) || p.romano === 'VI') && esT(q) && q.romano !== 'VI' && p.romano !== 'IV') motivo = 'la subdominante (' + p.romano + ') no vuelve a la tónica: va a la dominante';
    else if (!mismoAcorde && esS(p) && esT(q) && p.romano === 'IV') motivo = 'la fórmula I – IV – I no está admitida en este ejercicio: la subdominante va a la dominante';
    else if (!mismoAcorde && p.funciones.every(f => f === 'DD') && !q.funciones.every(f => f === 'D')) motivo = 'la dominante de la dominante (V/V) resuelve en la dominante: es su tónica momentánea';
    else if (p.sensibleBajo && !mismoAcorde && q.claseBajo !== (p.claseBajo + 1) % 12) motivo = 'la sensible en el bajo (' + Teoria.nombreEs(p.bajo) + ') ha de subir a la tónica';
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

  return { proponer, proponerEn, proponerSoprano, candidatoDe, enlaceAlumno, sincopaBajo, contexto, notasDe, cortesDe, movimiento };
})();
