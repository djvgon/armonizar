/* =====================================================================
   musicxml.js — Importa un archivo MusicXML (por ejemplo, exportado de
   MuseScore) y extrae la línea del bajo como fragmentos de ejercicio.

   Uso:
     const r = MusicXML.importar(textoXML, { voz: 'bajo' | 'soprano' });
       voz 'bajo' (por defecto): pentagrama inferior y nota más grave de cada acorde;
       voz 'soprano' (melodía dada): pentagrama superior y nota más aguda.
     r.fragmentos → [ { compases:[[['C3',2],…],…] (la voz pedida), compasesBajo, compasesSoprano,
                        tieneBajo, tieneSoprano, tonalidad:{tonica,modo}, compas:[4,4],
                        tonalidadSegura:bool, numCompases, modulaciones (de la voz pedida),
                        modulacionesBajo, modulacionesSoprano }, … ]
     r.avisos     → ['…']   (ligaduras, cambios de armadura, etc.)

   Convenciones que sigue:
     · Si la partitura tiene dos pentagramas (piano), se toma el inferior;
       si tiene uno, ese.
     · Los silencios se importan como acontecimientos [null, duración]: hacen falta
       para la pausa tras una semicadencia o al final de una cadencia. En un acorde se
       toma la nota más grave (o la más aguda, para la melodía).
     · La duración sale de <type> (whole/half/quarter/eighth → 4/2/1/0.5
       negras, ×1.5 con <dot>); si falta, de <duration>/<divisions>.
       Cualquier compás (4/4, 3/4, 2/4, 3/2…) se toma de <time>.
     · Cada barra doble cierra un fragmento: la final (light-heavy) o la doble fina
       (light-light), que es la que conviene cuando el fragmento es muy corto. Un archivo
       con siete ejercicios da siete fragmentos.
     · Se leen LAS DOS VOCES a la vez: un archivo con la melodía arriba y el bajo abajo
       sirve para los dos tipos de ejercicio sin volver a importarlo.
     · La tonalidad se deduce de la armadura (<fifths>) y del modo: si el archivo lo
       trae (<mode>), se usa; si no, se suman indicios —acabar en la tónica, empezar en
       ella y, sobre todo, que aparezca la SENSIBLE del relativo menor como alteración
       accidental (sol♯ con la armadura de Do, si♮ con la de Mi♭)—, que es lo que
       distingue una semicadencia en menor de un fragmento en el relativo mayor. Si los
       indicios empatan se toma el mayor y se marca con (?) en la lista de fragmentos.
     · Un **texto de pauta con el nombre de una tonalidad** («Sol M», «mi m», «→ Sol M»)
       sobre una nota marca ahí una modulación: es la forma precisa de indicar el acorde
       pivote. Sobre la primera nota del fragmento, fija su tonalidad.
     · Un cambio de armadura CIERRA el fragmento: en un archivo de lecciones, cada
       ejercicio va en su tonalidad, y así no hace falta acordarse de la barra doble. Si el
       fragmento ya lleva una etiqueta de tonalidad —es decir, si la modulación está escrita
       a conciencia—, entonces el cambio de armadura se lee como modulación desde la primera
       nota de ese compás (r.fragmentos[k].modulaciones = [{nota, tonalidad, segura}]).
   ===================================================================== */

const MusicXML = (() => {

  const MAYORES = { '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F', '0': 'C', '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'B', '6': 'F#', '7': 'C#' };
  const MENORES = { '-7': 'Ab', '-6': 'Eb', '-5': 'Bb', '-4': 'F', '-3': 'C', '-2': 'G', '-1': 'D', '0': 'A', '1': 'E', '2': 'B', '3': 'F#', '4': 'C#', '5': 'G#', '6': 'D#', '7': 'A#' };
  const TIPOS = { whole: 4, half: 2, quarter: 1, eighth: 0.5, breve: 8 };

  function texto(el, sel) { const e = el && el.querySelector(sel); return e ? e.textContent.trim() : null; }

  function nombreNota(pitch) {
    const step = texto(pitch, 'step');
    const alter = parseInt(texto(pitch, 'alter') || '0', 10);
    const octave = texto(pitch, 'octave');
    const alt = alter === 1 ? '#' : alter === 2 ? '##' : alter === -1 ? 'b' : alter === -2 ? 'bb' : '';
    return step + alt + octave;
  }

  function importar(xmlTexto, opciones = {}) {
    const vozPedida = opciones.voz === 'soprano' ? 'soprano' : 'bajo';
    const doc = new DOMParser().parseFromString(xmlTexto, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('El archivo no es un XML válido.');
    const part = doc.querySelector('score-partwise > part');
    if (!part) throw new Error('No se encuentra ninguna parte (<part>) en el archivo; solo se admite MusicXML «partwise».');

    const avisos = [];
    let divisions = 1, fifths = 0, modo = null, compas = [4, 4], staves = 1;
    let armaduraFijada = false;
    const fragmentos = [];
    const VOCES = ['soprano', 'bajo'];
    const nuevo = () => ({ voces: { soprano: [], bajo: [] }, tiempo: { soprano: 0, bajo: 0 }, etiquetas: [], cambios: [], fifths, modo });
    let actual = nuevo();
    const hayNotas = frag => VOCES.some(v => frag.voces[v].some(c => c.some(([n]) => n !== null)));

    const measures = [...part.querySelectorAll(':scope > measure')];
    // La última nota escrita en cada voz; vive fuera del compás para que una ligadura
    // de unión pueda cruzar la barra y sumarse a la nota anterior.
    const ultima = { soprano: null, bajo: null };
    measures.forEach((m, mi) => {
      let inicio = Math.max(actual.tiempo.soprano, actual.tiempo.bajo);   // tiempo (en negras) en que empieza este compás
      const attr = m.querySelector(':scope > attributes');
      if (attr) {
        const d = texto(attr, 'divisions'); if (d) divisions = parseInt(d, 10);
        const f = texto(attr, 'key > fifths');
        const md = texto(attr, 'key > mode');
        if (f !== null) {
          const nf = parseInt(f, 10);
          if (armaduraFijada && nf !== fifths && hayNotas(actual)) {
            /* Un cambio de armadura dentro del fragmento se lee de dos maneras:
               · si el fragmento ya lleva una ETIQUETA de tonalidad, es una modulación
                 escrita a conciencia y se anota como tal;
               · si no, es que empieza otro ejercicio: se CIERRA aquí el fragmento, aunque
                 falte la barra doble. Es lo normal en un archivo de lecciones, donde cada
                 ejercicio va en su tonalidad. */
            if ((actual.etiquetas || []).some(e => e.tiempo > 0.01)) {
              actual.cambios.push({ tiempo: inicio, fifths: nf, modo: md || null });
              avisos.push('Cambio de armadura en el compás ' + (mi + 1) + ': se ha anotado una modulación ahí (revisa el modo y el acorde pivote).');
            } else {
              fragmentos.push(cerrar(actual, actual.modo, compas, vozPedida, avisos));
              actual = nuevo();
              ultima.soprano = null; ultima.bajo = null;
              inicio = 0;
              avisos.push('Cambio de armadura en el compás ' + (mi + 1) + ': se ha cerrado ahí el fragmento, como ejercicio aparte (conviene poner también la barra doble). Si era una modulación, pon sobre el acorde pivote la etiqueta con el nombre de la tonalidad nueva.');
            }
          }
          fifths = nf; armaduraFijada = true;
        }
        if (md) modo = md;
        const b = texto(attr, 'time > beats'), bt = texto(attr, 'time > beat-type');
        if (b && bt) compas = [parseInt(b, 10), parseInt(bt, 10)];
        const st = texto(attr, 'staves'); if (st) staves = parseInt(st, 10);
      }
      if (!hayNotas(actual)) { actual.fifths = fifths; actual.modo = modo; }

      /* Se leen LAS DOS VOCES a la vez: la soprano del pentagrama superior y el bajo del
         inferior (en una sola pauta, ambas del mismo; dentro de un acorde, la soprano toma
         la nota más aguda y el bajo la más grave). Así un archivo con las dos voces sirve
         para los dos tipos de ejercicio sin volver a importarlo. */
      const pentaDe = { soprano: 1, bajo: staves };
      const enCompas = { soprano: [], bajo: [] };
      const tiempoLocal = { soprano: 0, bajo: 0 };
      function duracion(n) {
        const t = texto(n, 'type');
        const puntillos = n.querySelectorAll(':scope > dot').length;
        if (t && TIPOS[t]) return TIPOS[t] * (puntillos === 1 ? 1.5 : puntillos >= 2 ? 1.75 : 1);
        if (t && !avisos.includes('Figuras menores que la corchea: se han redondeado.')) avisos.push('Figuras menores que la corchea: se han redondeado.');
        const d = parseInt(texto(n, 'duration') || '0', 10);
        return Math.max(0.5, Math.round(2 * d / divisions) / 2);
      }
      [...m.querySelectorAll(':scope > note, :scope > direction')].forEach(n => {
        // Texto de pauta: se anota con su posición en el tiempo (después se asigna a la nota de cada voz)
        if (n.tagName === 'direction') {
          const st = parseInt(texto(n, 'staff') || '1', 10);
          const palabras = [...n.querySelectorAll('direction-type > words')].map(w => w.textContent.trim()).join(' ');
          if (!palabras) return;
          const t = Teoria.tonalidadDesdeTexto(palabras);
          if (!t) return;
          const voz = VOCES.find(v => pentaDe[v] === st) || vozPedida;
          // <offset> (en divisiones) corre el texto respecto del sitio en que está escrito:
          // así un rótulo puesto sobre la tercera nota se anota en esa nota y no al principio.
          const off = parseFloat(texto(n, 'offset') || '0') / divisions;
          actual.etiquetas.push({ tiempo: inicio + tiempoLocal[voz] + (isFinite(off) ? off : 0), tonalidad: t });
          return;
        }
        if (n.querySelector('grace')) return;
        const staff = parseInt(texto(n, 'staff') || '1', 10);
        const voces = VOCES.filter(v => pentaDe[v] === staff);
        if (!voces.length) return;
        const esSilencio = !!n.querySelector('rest');
        const pitch = n.querySelector('pitch');
        if (!esSilencio && !pitch) return;
        const nombre = esSilencio ? null : nombreNota(pitch);
        const enAcorde = !!n.querySelector('chord');
        const tie = [...n.querySelectorAll('tie')].map(t => t.getAttribute('type'));
        voces.forEach(v => {
          if (enAcorde) {                                     // nota de un acorde: la más aguda para la soprano, la más grave para el bajo
            const u = ultima[v];
            if (u && u[0] && nombre) {
              const a = Teoria.midi(Teoria.nota(nombre)), b = Teoria.midi(Teoria.nota(u[0]));
              if (v === 'soprano' ? a > b : a < b) u[0] = nombre;
            }
            return;
          }
          const dur = duracion(n);
          // Ligadura de unión: la nota se suma a la anterior (aunque esté en el compás anterior)
          if (!esSilencio && tie.includes('stop') && ultima[v] && ultima[v][0]) {
            if (v === 'bajo') avisos.push('Ligadura en el compás ' + (mi + 1) + ': la nota ligada se ha sumado a la anterior.');
            ultima[v][1] += dur;
            tiempoLocal[v] += dur;
            return;
          }
          ultima[v] = [nombre, dur];
          enCompas[v].push(ultima[v]);
          tiempoLocal[v] += dur;
          if (esSilencio) ultima[v] = null;
        });
      });
      VOCES.forEach(v => {
        if (enCompas[v].length) actual.voces[v].push(enCompas[v]);
        actual.tiempo[v] += tiempoLocal[v];
      });

      /* Cada fragmento se cierra con una barra doble: final (fina y gruesa) o doble fina,
         que es la que conviene cuando el fragmento es muy corto. */
      const estilo = texto(m, 'barline[location="right"] > bar-style');
      const esFinal = estilo === 'light-heavy' || estilo === 'heavy-light' || estilo === 'heavy-heavy'
        || estilo === 'light-light' || mi === measures.length - 1;
      if (esFinal && hayNotas(actual)) {
        fragmentos.push(cerrar(actual, actual.modo, compas, vozPedida, avisos));
        actual = nuevo();
      }
    });

    if (!fragmentos.length) throw new Error('No se ha encontrado ninguna nota en el archivo. Comprueba que el ejercicio está escrito en el pentagrama del bajo o en el de la melodía.');
    /* Si el archivo solo trae la otra voz, no es un error: se importa igual y cada
       fragmento dice qué voz tiene. Así un archivo de melodías sirve aunque el tipo de
       ejercicio elegido sea todavía el de bajo dado. */
    const conVoz = fragmentos.filter(f => f.compases.length && f.compases.some(c => c.some(([n]) => n !== null)));
    if (!conVoz.length) avisos.push('En el pentagrama ' + (vozPedida === 'soprano' ? 'superior (el de la melodía)' : 'inferior (el del bajo)') + ' no hay notas: el archivo trae la otra voz. Cambia el tipo de ejercicio para usarlo.');
    return { fragmentos, avisos };
  }

  // Notas (sin silencios) y tiempo de entrada de cada una, en negras desde el comienzo del fragmento
  function conTiempos(compases) {
    const out = [];
    let t = 0;
    compases.forEach(c => c.forEach(([n, d]) => { if (n !== null) out.push({ nota: n, tiempo: t }); t += d; }));
    return out;
  }
  // Índice de la nota de esa voz que empieza en ese momento (o la primera posterior)
  function notaEnTiempo(compases, tiempo) {
    const notas = conTiempos(compases);
    for (let i = 0; i < notas.length; i++) if (notas[i].tiempo >= tiempo - 0.01) return i;
    return -1;
  }

  /* Quita los silencios del final: los compases vacíos que quedan tras la última nota
     (el resto de la página en MuseScore) y el silencio final de un fragmento, que no
     dice nada. Los silencios de en medio —el respiro tras una semicadencia— se quedan. */
  function sinColaDeSilencios(compases) {
    const out = compases.map(c => c.slice());
    while (out.length) {
      const ultimo = out[out.length - 1];
      while (ultimo.length && ultimo[ultimo.length - 1][0] === null) ultimo.pop();
      if (ultimo.length) break;
      out.pop();
    }
    return out;
  }

  /* ¿Suena en el fragmento la sensible de esa tonalidad menor? (la 7.ª elevada: sol♯ en
     la menor, si♮ en do menor). Es lo que distingue el menor de su relativo mayor. */
  function haySensible(frag, tonicaMenor) {
    if (!tonicaMenor) return false;
    let sens;
    try { sens = Teoria.transportar(Teoria.nota(tonicaMenor + '3'), 6, 11); } catch (e) { return false; }
    return ['soprano', 'bajo'].some(v => frag.voces[v].some(c => c.some(([n]) => {
      if (n === null) return false;
      let x; try { x = Teoria.nota(n); } catch (e) { return false; }
      return x.letra === sens.letra && x.alt === sens.alt;
    })));
  }

  // Todas las notas escritas del fragmento (las dos voces), como objetos nota
  function todasLasNotas(frag) {
    const out = [];
    ['soprano', 'bajo'].forEach(v => frag.voces[v].forEach(c => c.forEach(([n]) => {
      if (n === null) return;
      try { out.push(Teoria.nota(n)); } catch (e) { /* nada */ }
    })));
    return out;
  }
  const CUANTAS = { Cb: -7, Gb: -6, Db: -5, Ab: -4, Eb: -3, Bb: -2, F: -1, C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7 };

  /* ¿Caben todas esas notas en esa tonalidad? Se admiten las tres formas del menor —la
     natural, la armónica (sensible elevada) y la melódica (6.ª y 7.ª elevadas al subir)—,
     porque las tres se escriben. Es la prueba que dice si la música concuerda con la
     armadura o si la contradice. */
  function cabeEn(notas, t) {
    return Teoria.cabeEnTonalidad(notas, t);      // vive en teoria.js, que lo usa también el banco
  }
  // ¿Cabe la música en alguna de las dos tonalidades de la armadura?
  const cabeEnLaArmadura = (notas, f) =>
    cabeEn(notas, { tonica: MAYORES[f], modo: 'mayor' }) || cabeEn(notas, { tonica: MENORES[f], modo: 'menor' });

  /* Cuando la ARMADURA no corresponde a la música. Pasa cuando un ejercicio se escribe con
     la armadura del anterior y nadie se acuerda de cambiarla: entonces la tonalidad que
     saldría de la armadura no contiene las notas que suenan (un sol♯ con la armadura de
     un sostenido). Se busca una tonalidad vecina —hasta dos alteraciones— encabezada por
     la nota final (que pesa más) o por la inicial, y en la que quepa toda la música; se
     toma esa, marcada con (?) para que el profesor lo vea y arregle la armadura. */
  function tonalidadPorLaMusica(frag, fifths, nombreUltima, nombrePrimera) {
    const notas = todasLasNotas(frag);
    const cand = [];
    const mete = nombre => {
      const letra = String(nombre || '').replace(/-?\d+$/, '');
      if (!letra) return;
      if (CUANTAS[letra] !== undefined && Math.abs(CUANTAS[letra] - fifths) <= 2) cand.push({ tonica: letra, modo: 'mayor' });
      Object.keys(MENORES).forEach(k => {
        if (MENORES[k] === letra && Math.abs(parseInt(k, 10) - fifths) <= 2) cand.push({ tonica: letra, modo: 'menor' });
      });
    };
    mete(nombreUltima);                       // acabar en la tónica es el indicio más fuerte
    mete(nombrePrimera);
    return cand.find(t => cabeEn(notas, t)) || null;
  }

  /* Un rótulo que abre una tonalidad y otro que devuelve a la de partida una o dos notas
     después no son una modulación: son una TONICIZACIÓN —el do♯ que hace de sensible de la
     dominante y vuelve—. Ahí no se anota cambio de tonalidad: el pasaje se sigue leyendo en
     la tonalidad de partida y ese acorde es una dominante secundaria (el V/V). Los rótulos
     de la partitura no sobran: siguen marcando dónde está el acorde alterado. */
  function sinTonicizaciones(mods, tonInicial) {
    const out = [];
    let previa = tonInicial;
    for (let i = 0; i < mods.length; i++) {
      const m = mods[i], sig = mods[i + 1];
      if (sig && Teoria.mismaTonalidad(sig.tonalidad, previa) && sig.nota - m.nota <= 2) { i++; continue; }
      out.push(m);
      previa = m.tonalidad;
    }
    return out;
  }

  function cerrar(frag, modoXML, compas, vozPedida, avisos) {
    ['soprano', 'bajo'].forEach(v => { frag.voces[v] = sinColaDeSilencios(frag.voces[v]); });
    const f = String(frag.fifths);
    const tiene = v => frag.voces[v].some(c => c.some(([n]) => n !== null));
    /* Modo: una armadura sirve para dos tonalidades, así que hay que elegir. Se suman
       indicios: acabar en la tónica pesa más que empezar en ella, y **la sensible del
       relativo menor escrita como alteración accidental** (sol♯ con la armadura de Do,
       si♮ con la de Mi♭) es el indicio más claro de que el fragmento está en menor —así
       se reconocen las semicadencias en menor, que no acaban en la tónica—. Si los
       indicios empatan, se toma el mayor y se avisa con (?) en la lista de fragmentos. */
    const vozRef = tiene('bajo') ? 'bajo' : 'soprano';
    const notasRef = conTiempos(frag.voces[vozRef]);
    const sinOct = n => String(n).replace(/-?\d+$/, '');
    const ultima = notasRef.length ? notasRef[notasRef.length - 1].nota : 'C3';
    const primera = notasRef.length ? notasRef[0].nota : null;
    let puntosMenor = 0, puntosMayor = 0;
    if (sinOct(ultima) === MENORES[f]) puntosMenor += 2;
    if (sinOct(ultima) === MAYORES[f]) puntosMayor += 2;
    if (primera && sinOct(primera) === MENORES[f]) puntosMenor += 1;
    if (primera && sinOct(primera) === MAYORES[f]) puntosMayor += 1;
    const conSensible = haySensible(frag, MENORES[f]);
    if (conSensible) puntosMenor += 2;
    let modo, seguro = true;
    if (modoXML === 'minor') modo = 'menor';
    else if (modoXML === 'major') modo = 'mayor';
    else if (puntosMenor > puntosMayor) {
      modo = 'menor';
      /* Para el menor se pide una prueba de verdad —la sensible escrita o el final en la
         tónica—, porque empezar en la tónica menor es también empezar en el VI del
         relativo mayor, y eso solo no basta. */
      seguro = conSensible || sinOct(ultima) === MENORES[f];
    } else if (puntosMayor > puntosMenor) modo = 'mayor';
    else { modo = 'mayor'; seguro = false; }
    let tonica = modo === 'menor' ? MENORES[f] : MAYORES[f];
    /* Un texto de pauta al principio del fragmento fija su tonalidad… pero solo si no
       contradice a la armadura. En un archivo de lecciones, un rótulo pegado al comienzo
       suele ser el del final del ejercicio anterior (la llegada de su modulación), y
       tomarlo por la tonalidad del fragmento nuevo deja la armadura, la tonalidad y el
       cifrado diciendo cosas distintas. Así que la etiqueta manda en dos casos: cuando
       nombra una de las dos tonalidades de la armadura, o cuando la música NO cabe en
       ninguna de ellas (entonces es la armadura la que está mal escrita). */
    const etiquetas = (frag.etiquetas || []).slice().sort((a, b) => a.tiempo - b.tiempo);
    const inicial = etiquetas.find(e => e.tiempo <= 0.01);
    if (inicial) {
      const et = inicial.tonalidad;
      const deLaArmadura = (et.modo === 'menor' ? MENORES : MAYORES)[f] === et.tonica;
      if (deLaArmadura || !cabeEnLaArmadura(todasLasNotas(frag), f)) {
        tonica = et.tonica; modo = et.modo; seguro = true;
      } else if (avisos) {
        const nom = t => { try { return Teoria.nombreCorto(t); } catch (e) { return t.tonica; } };
        avisos.push('Un rótulo de «' + nom(et) + '» abre un fragmento cuya armadura y cuyas notas son de '
          + nom({ tonica: MAYORES[f], modo: 'mayor' }) + ' / ' + nom({ tonica: MENORES[f], modo: 'menor' })
          + ': se ha dejado la tonalidad de la armadura. Si ese rótulo era la llegada del ejercicio anterior, muévelo allí.');
      }
    }
    /* COHERENCIA entre la armadura, la tonalidad y la música. Si el fragmento no modula
       —ni etiquetas ni cambios de armadura— y alguna de sus notas no cabe en la tonalidad
       elegida, es que la armadura escrita no es la suya: se busca la tonalidad en la que
       de verdad está y se marca con (?) para que el profesor arregle la armadura. */
    if (!(frag.cambios || []).length && !etiquetas.length && !cabeEn(todasLasNotas(frag), { tonica, modo })) {
      const otra = tonalidadPorLaMusica(frag, parseInt(f, 10), ultima, primera);
      if (otra) { tonica = otra.tonica; modo = otra.modo; }
      seguro = false;
    }

    // Cambios de armadura → tonalidad (el modo, si el archivo no lo dice, se supone el mismo o el relativo)
    let modoPrevio = modo, fPrevio = frag.fifths;
    const porArmadura = (frag.cambios || []).map(cb => {
      let md, segura = true;
      if (cb.modo === 'minor') md = 'menor'; else if (cb.modo === 'major') md = 'mayor';
      else { md = cb.fifths === fPrevio ? (modoPrevio === 'menor' ? 'mayor' : 'menor') : modoPrevio; segura = false; }
      const t = (md === 'menor' ? MENORES : MAYORES)[String(cb.fifths)];
      modoPrevio = md; fPrevio = cb.fifths;
      return t ? { tiempo: cb.tiempo, tonalidad: { tonica: t, modo: md }, segura } : null;
    }).filter(Boolean);
    // Las etiquetas de texto mandan sobre los cambios de armadura (son más precisas)
    const porTexto = etiquetas.filter(e => e.tiempo > 0.01).map(e => ({ tiempo: e.tiempo, tonalidad: e.tonalidad, segura: true }));
    const cambios = porTexto.concat(porArmadura.filter(a => !porTexto.some(p => Math.abs(p.tiempo - a.tiempo) < 2))).sort((a, b) => a.tiempo - b.tiempo);
    // …y se traducen a índices de nota en cada voz
    const modulacionesDe = voz => sinTonicizaciones(cambios.map(cb => {
      const i = notaEnTiempo(frag.voces[voz], cb.tiempo);
      return i > 0 ? { nota: i, tonalidad: cb.tonalidad, segura: cb.segura } : null;
    }).filter(Boolean), { tonica, modo });

    const compasesBajo = tiene('bajo') ? frag.voces.bajo : [];
    const compasesSoprano = tiene('soprano') ? frag.voces.soprano : [];
    const elegida = vozPedida === 'soprano' ? compasesSoprano : compasesBajo;
    return {
      compases: elegida,
      compasesBajo,
      compasesSoprano,
      tieneBajo: tiene('bajo'),
      tieneSoprano: tiene('soprano'),
      tonalidad: { tonica, modo },
      tonalidadSegura: seguro,
      compas: compas.slice(),
      numCompases: (elegida.length || compasesBajo.length || compasesSoprano.length),
      modulaciones: modulacionesDe(vozPedida === 'soprano' ? 'soprano' : 'bajo'),
      modulacionesBajo: modulacionesDe('bajo'),
      modulacionesSoprano: modulacionesDe('soprano')
    };
  }

  return { importar, conTiempos, notaEnTiempo };
})();
