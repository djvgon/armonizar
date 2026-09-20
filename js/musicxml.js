/* =====================================================================
   musicxml.js — Importa un archivo MusicXML (por ejemplo, exportado de
   MuseScore) y extrae la línea del bajo como fragmentos de ejercicio.

   Uso:
     const r = MusicXML.importar(textoXML, { voz: 'bajo' | 'soprano' });
       voz 'bajo' (por defecto): pentagrama inferior y nota más grave de cada acorde;
       voz 'soprano' (melodía dada): pentagrama superior y nota más aguda.
     r.fragmentos → [ { compases:[[['C3',2],…],…], tonalidad:{tonica,modo},
                        compas:[4,4], tonalidadSegura:bool, numCompases }, … ]
     r.avisos     → ['…']   (ligaduras, cambios de armadura, etc.)

   Convenciones que sigue:
     · Si la partitura tiene dos pentagramas (piano), se toma el inferior;
       si tiene uno, ese.
     · Los silencios se omiten. En un acorde se toma la nota más grave.
     · La duración sale de <type> (whole/half/quarter/eighth → 4/2/1/0.5
       negras, ×1.5 con <dot>); si falta, de <duration>/<divisions>.
       Cualquier compás (4/4, 3/4, 2/4, 3/2…) se toma de <time>.
     · Cada barra final (<bar-style>light-heavy</bar-style>) cierra un
       fragmento: un archivo con siete ejercicios da siete fragmentos.
     · La tonalidad se deduce de la armadura (<fifths>) y del modo: si el
       archivo lo trae (<mode>), se usa; si no, se mira la última nota del
       fragmento: si es la tónica del relativo menor, se toma menor.
     · Un cambio de armadura dentro de un fragmento se lee como modulación
       desde la primera nota de ese compás (r.fragmentos[k].modulaciones =
       [{nota, tonalidad, segura}]); el profesor ajusta el pivote y el modo.
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
    const soprano = opciones.voz === 'soprano';
    const doc = new DOMParser().parseFromString(xmlTexto, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('El archivo no es un XML válido.');
    const part = doc.querySelector('score-partwise > part');
    if (!part) throw new Error('No se encuentra ninguna parte (<part>) en el archivo; solo se admite MusicXML «partwise».');

    const avisos = [];
    let divisions = 1, fifths = 0, modo = null, compas = [4, 4], staves = 1;
    let armaduraFijada = false;
    const fragmentos = [];
    let actual = { compases: [], fifths: 0, modulaciones: [] };

    const measures = [...part.querySelectorAll(':scope > measure')];
    measures.forEach((m, mi) => {
      const attr = m.querySelector(':scope > attributes');
      if (attr) {
        const d = texto(attr, 'divisions'); if (d) divisions = parseInt(d, 10);
        const f = texto(attr, 'key > fifths');
        const md = texto(attr, 'key > mode');
        if (f !== null) {
          const nf = parseInt(f, 10);
          if (armaduraFijada && nf !== fifths && actual.compases.length) {
            // Cambio de armadura dentro del fragmento: se lee como modulación desde la primera nota del compás
            const nota = actual.compases.reduce((s, c) => s + c.length, 0);
            actual.modulaciones.push({ nota, fifths: nf, modo: md || null });
            avisos.push('Cambio de armadura en el compás ' + (mi + 1) + ': se ha anotado una modulación desde la nota ' + (nota + 1) + ' (revisa el modo y el acorde pivote).');
          }
          fifths = nf; armaduraFijada = true;
        }
        if (md) modo = md;
        const b = texto(attr, 'time > beats'), bt = texto(attr, 'time > beat-type');
        if (b && bt) compas = [parseInt(b, 10), parseInt(bt, 10)];
        const st = texto(attr, 'staves'); if (st) staves = parseInt(st, 10);
      }
      if (actual.compases.length === 0) { actual.fifths = fifths; actual.modo = modo; }

      const notas = [];
      let ultimaNota = null;
      [...m.querySelectorAll(':scope > note')].forEach(n => {
        if (n.querySelector('rest') || n.querySelector('grace')) return;
        const staff = parseInt(texto(n, 'staff') || '1', 10);
        if (staff !== (soprano ? 1 : staves)) return;        // solo el pentagrama inferior (o el superior, para la melodía)
        const pitch = n.querySelector('pitch');
        if (!pitch) return;
        const nombre = nombreNota(pitch);
        const tie = [...n.querySelectorAll('tie')].map(t => t.getAttribute('type'));
        if (n.querySelector('chord')) {                       // nota de un acorde: quedarse con la más grave (o la más aguda, para la melodía)
          if (ultimaNota) { const m = Teoria.midi(Teoria.nota(nombre)), u = Teoria.midi(Teoria.nota(ultimaNota.nota)); if (soprano ? m > u : m < u) ultimaNota.nota = nombre; }
          return;
        }
        if (tie.includes('stop')) {
          avisos.push('Ligadura en el compás ' + (mi + 1) + ': la nota ligada se ha sumado a la anterior.');
          if (ultimaNota) { ultimaNota.dur += duracion(n); return; }
        }
        ultimaNota = { nota: nombre, dur: duracion(n) };
        notas.push(ultimaNota);
      });
      function duracion(n) {
        const t = texto(n, 'type');
        const puntillos = n.querySelectorAll(':scope > dot').length;
        if (t && TIPOS[t]) return TIPOS[t] * (puntillos === 1 ? 1.5 : puntillos >= 2 ? 1.75 : 1);
        if (t && !avisos.includes('Figuras menores que la corchea: se han redondeado.')) avisos.push('Figuras menores que la corchea: se han redondeado.');
        const d = parseInt(texto(n, 'duration') || '0', 10);
        return Math.max(0.5, Math.round(2 * d / divisions) / 2);
      }
      if (notas.length) actual.compases.push(notas.map(x => [x.nota, x.dur]));

      const estilo = texto(m, 'barline[location="right"] > bar-style');
      const esFinal = estilo === 'light-heavy' || estilo === 'heavy-light' || estilo === 'heavy-heavy' || mi === measures.length - 1;
      if (esFinal && actual.compases.length) {
        fragmentos.push(cerrar(actual, actual.modo, compas));
        actual = { compases: [], fifths, modulaciones: [] };
      }
    });

    if (!fragmentos.length) throw new Error('No se ha encontrado ninguna nota en el pentagrama ' + (soprano ? 'superior' : 'del bajo') + '.');
    return { fragmentos, avisos };
  }

  function cerrar(frag, modoXML, compas) {
    const f = String(frag.fifths);
    const ultima = frag.compases[frag.compases.length - 1].slice(-1)[0][0];
    const sinOctava = ultima.replace(/-?\d+$/, '');
    let modo, seguro = true;
    if (modoXML === 'minor') modo = 'menor';
    else if (modoXML === 'major') modo = 'mayor';
    else if (sinOctava === MAYORES[f]) modo = 'mayor';
    else if (sinOctava === MENORES[f]) modo = 'menor';
    else { modo = 'mayor'; seguro = false; }
    const tonica = modo === 'menor' ? MENORES[f] : MAYORES[f];
    // Modulaciones por cambio de armadura: el modo, si el archivo no lo dice, se supone
    // el mismo (V o IV) o, con la misma armadura, el relativo.
    let modoPrevio = modo, fPrevio = frag.fifths;
    const modulaciones = (frag.modulaciones || []).filter(m => m.nota > 0).map(m => {
      let md, segura = true;
      if (m.modo === 'minor') md = 'menor'; else if (m.modo === 'major') md = 'mayor';
      else { md = m.fifths === fPrevio ? (modoPrevio === 'menor' ? 'mayor' : 'menor') : modoPrevio; segura = false; }
      const t = (md === 'menor' ? MENORES : MAYORES)[String(m.fifths)];
      modoPrevio = md; fPrevio = m.fifths;
      return t ? { nota: m.nota, tonalidad: { tonica: t, modo: md }, segura } : null;
    }).filter(Boolean);
    return {
      compases: frag.compases,
      tonalidad: { tonica, modo },
      tonalidadSegura: seguro,
      compas: compas.slice(),
      numCompases: frag.compases.length,
      modulaciones
    };
  }

  return { importar };
})();
