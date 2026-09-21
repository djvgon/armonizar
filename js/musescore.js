/* =====================================================================
   musescore.js — Lee directamente los archivos de MuseScore (.mscz y
   .mscx), sin tener que exportarlos antes a MusicXML.

   Uso:
     MuseScore.esMuseScore(nombre, bytes)   → ¿parece un archivo de MuseScore?
     await MuseScore.importar(bytes, {voz}) → lo mismo que MusicXML.importar

   Cómo funciona:
     · Un `.mscz` es un ZIP que contiene un `.mscx` (XML plano con la
       partitura). Aquí se abre el ZIP a mano —cabecera central, entradas,
       descompresión con DecompressionStream('deflate-raw')— y se saca ese
       `.mscx`; no hace falta ninguna biblioteca externa.
     · El `.mscx` se traduce a MusicXML (solo lo que la aplicación usa:
       pentagramas, notas, silencios, armaduras, compases, barras dobles,
       ligaduras y textos de pauta) y se pasa al importador de siempre
       (`js/musicxml.js`), de modo que el resto del programa no cambia.

   Del `.mscx` se leen:
     <Staff id="N">  pentagramas (el 1 es el superior)
     <Measure>       compases, con <voice> (se toma la primera voz)
     <Chord>         <durationType>, <dots>, <Note><pitch><tpc>
     <Rest>          <durationType> ('measure' = compás entero)
     <KeySig><concertKey>, <TimeSig><sigN><sigD>
     <BarLine><subtype>  'double' (doble fina) y 'end' (barra final)
     <StaffText>, <SystemText>  el rótulo de tonalidad del acorde pivote
     <location><fractions>    dónde va ese rótulo dentro del compás
     <Spanner type="Tie"> con <prev>: nota ligada a la anterior

   La altura se reconstruye con `pitch` (MIDI) y `tpc` (escritura): el tpc
   da la letra y la alteración, y de ahí sale la octava.
   ===================================================================== */

const MuseScore = (() => {

  const LETRAS_TPC = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const DURACION = { breve: 8, whole: 4, half: 2, quarter: 1, eighth: 0.5, '16th': 0.25, '32nd': 0.125, '64th': 0.0625 };
  const TIPO_XML = { 8: 'breve', 4: 'whole', 2: 'half', 1: 'quarter', 0.5: 'eighth', 0.25: '16th', 0.125: '32nd' };
  const DIVISIONES = 4;                       // unidades por negra en el MusicXML que se genera

  const esMscz = bytes => bytes && bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4B;   // «PK»
  function esMuseScore(nombre, bytes) {
    if (/\.mscz$/i.test(nombre || '')) return true;
    if (/\.mscx$/i.test(nombre || '')) return true;
    return esMscz(bytes);
  }

  /* ---------- Lectura del ZIP (solo lo necesario) ---------- */

  const leer16 = (b, i) => b[i] | (b[i + 1] << 8);
  const leer32 = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;

  async function inflar(bytes, metodo) {
    if (metodo === 0) return bytes;                       // guardado sin comprimir
    if (metodo !== 8) throw new Error('El archivo usa una compresión que no se reconoce.');
    if (typeof DecompressionStream !== 'function') throw new Error('Este navegador no sabe descomprimir el archivo. Exporta la partitura a MusicXML o usa un navegador más reciente.');
    const flujo = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(flujo).arrayBuffer());
  }

  // Devuelve el texto del primer archivo que cumpla 'coincide' (por nombre)
  async function deZip(bytes, coincide) {
    // Final del directorio central (se busca hacia atrás; al final puede haber comentario)
    let fin = -1;
    for (let i = bytes.length - 22; i >= 0 && i > bytes.length - 66000; i--) {
      if (leer32(bytes, i) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) throw new Error('El archivo .mscz no se ha podido abrir (no parece un ZIP).');
    const numEntradas = leer16(bytes, fin + 10);
    let p = leer32(bytes, fin + 16);
    for (let k = 0; k < numEntradas; k++) {
      if (leer32(bytes, p) !== 0x02014b50) break;
      const metodo = leer16(bytes, p + 10);
      const compSize = leer32(bytes, p + 20);
      const nombreLen = leer16(bytes, p + 28), extraLen = leer16(bytes, p + 30), comentLen = leer16(bytes, p + 32);
      const desplaz = leer32(bytes, p + 42);
      const nombre = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nombreLen));
      if (coincide(nombre)) {
        // Cabecera local: el nombre y los extras pueden tener otra longitud
        if (leer32(bytes, desplaz) !== 0x04034b50) throw new Error('El archivo .mscz está dañado.');
        const nLocal = leer16(bytes, desplaz + 26), eLocal = leer16(bytes, desplaz + 28);
        const ini = desplaz + 30 + nLocal + eLocal;
        const datos = await inflar(bytes.subarray(ini, ini + compSize), metodo);
        return new TextDecoder().decode(datos);
      }
      p += 46 + nombreLen + extraLen + comentLen;
    }
    return null;
  }

  /* ---------- Traducción del .mscx a MusicXML ---------- */

  const texto = (el, sel) => { const e = el && el.querySelector(sel); return e ? e.textContent.trim() : null; };
  const escapar = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // pitch (MIDI) + tpc (escritura) → {step, alter, octave}
  function altura(pitch, tpc) {
    const letra = LETRAS_TPC[((tpc - 13) % 7 + 7) % 7];
    const alter = Math.floor((tpc - 6) / 7) - 1;
    const octava = Math.round((pitch - alter - SEMITONOS[letra]) / 12) - 1;
    return { step: letra, alter, octave: octava };
  }

  const negrasDe = (tipo, puntillos, compas) => {
    if (tipo === 'measure') return compas[0] * 4 / compas[1];
    const base = DURACION[tipo];
    if (!base) return null;
    return base * (puntillos === 1 ? 1.5 : puntillos === 2 ? 1.75 : 1);
  };

  // Figura de MusicXML para una duración en negras (con sus puntillos)
  function figuraXML(negras) {
    for (const p of [0, 1, 2]) {
      const base = negras / (p === 1 ? 1.5 : p === 2 ? 1.75 : 1);
      if (TIPO_XML[base]) return { tipo: TIPO_XML[base], puntillos: p };
    }
    return { tipo: 'quarter', puntillos: 0 };
  }

  function aMusicXML(mscx) {
    const doc = new DOMParser().parseFromString(mscx, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('El archivo de MuseScore no se ha podido leer (XML no válido).');
    const score = doc.querySelector('museScore > Score');
    if (!score) throw new Error('El archivo no parece una partitura de MuseScore.');
    const staves = [...score.children].filter(e => e.tagName === 'Staff');
    if (!staves.length) throw new Error('La partitura no tiene ningún pentagrama con música.');

    // Compases de cada pentagrama
    const compasesPorStaff = staves.map(s => [...s.children].filter(e => e.tagName === 'Measure'));
    const numCompases = Math.max(...compasesPorStaff.map(c => c.length));
    let compas = [4, 4];
    const salida = [];
    let primeraVez = true;

    for (let m = 0; m < numCompases; m++) {
      // Atributos comunes (armadura y compás) tomados del primer pentagrama que los traiga
      let fifths = null, sigN = null, sigD = null;
      compasesPorStaff.forEach(cs => {
        const c = cs[m];
        if (!c) return;
        const k = texto(c, 'KeySig > concertKey') || texto(c, 'KeySig > accidental');
        if (k !== null && fifths === null) fifths = parseInt(k, 10);
        const n = texto(c, 'TimeSig > sigN'), d = texto(c, 'TimeSig > sigD');
        if (n && d && sigN === null) { sigN = parseInt(n, 10); sigD = parseInt(d, 10); }
      });
      if (sigN && sigD) compas = [sigN, sigD];

      let cuerpo = '';
      if (fifths !== null || sigN || primeraVez) {
        cuerpo += '<attributes>';
        if (primeraVez) cuerpo += '<divisions>' + DIVISIONES + '</divisions>';
        if (fifths !== null) cuerpo += '<key><fifths>' + fifths + '</fifths></key>';
        if (sigN && sigD) cuerpo += '<time><beats>' + sigN + '</beats><beat-type>' + sigD + '</beat-type></time>';
        if (primeraVez) {
          cuerpo += '<staves>' + staves.length + '</staves>';
          staves.forEach((s, i) => {
            const clave = i === staves.length - 1 && staves.length > 1 ? '<sign>F</sign><line>4</line>' : '<sign>G</sign><line>2</line>';
            cuerpo += '<clef number="' + (i + 1) + '">' + clave + '</clef>';
          });
        }
        cuerpo += '</attributes>';
        primeraVez = false;
      }

      let barra = '';
      compasesPorStaff.forEach((cs, iStaff) => {
        const c = cs[m];
        if (!c) return;
        const numStaff = iStaff + 1;
        const voz = c.querySelector(':scope > voice') || c;
        let duracionStaff = 0;
        let ligar = false;

        /* Primero, LOS TEXTOS con su sitio exacto dentro del compás. MuseScore los coloca
           con <location><fractions>, que mueve el cursor hacia atrás o hacia adelante (en
           partes de redonda): así un rótulo escrito sobre la tercera nota queda anotado en
           el archivo después del silencio de compás, pero con un location que lo devuelve
           a su sitio. Como en MusicXML la posición la da el orden en la secuencia —y un
           silencio de compás entero es una sola nota—, los textos se emiten al principio
           del pentagrama con su <offset>, que es lo que el importador lee. */
        let cursor = 0;                       // negras desde el comienzo del compás
        [...voz.children].forEach(e => {
          if (e.tagName === 'location') {
            const fr = texto(e, ':scope > fractions');
            if (fr && fr.indexOf('/') > 0) {
              const [n, d] = fr.split('/').map(Number);
              if (d) cursor += (n / d) * 4;
            }
            const ms = parseInt(texto(e, ':scope > measures') || '0', 10);
            if (ms) cursor += ms * compas[0] * 4 / compas[1];
            return;
          }
          if (e.tagName === 'StaffText' || e.tagName === 'SystemText') {
            const t = (texto(e, 'text') || '').replace(/<[^>]*>/g, '').trim();
            if (!t) return;
            const off = Math.max(0, Math.round(cursor * DIVISIONES));
            cuerpo += '<direction placement="above"><direction-type><words>' + escapar(t) + '</words></direction-type>'
              + (off ? '<offset>' + off + '</offset>' : '') + '<staff>' + numStaff + '</staff></direction>';
            return;
          }
          if (e.tagName !== 'Chord' && e.tagName !== 'Rest') return;
          if (e.querySelector('acciaccatura, appoggiatura, graceNote, grace4, grace8after, grace16, grace32')) return;
          const negras = negrasDe(texto(e, ':scope > durationType') || 'quarter', parseInt(texto(e, ':scope > dots') || '0', 10), compas);
          if (negras !== null) cursor += negras;
        });

        [...voz.children].forEach(e => {
          if (e.tagName === 'BarLine') {
            const sub = texto(e, 'subtype') || '';
            if (sub.indexOf('double') === 0) barra = '<barline location="right"><bar-style>light-light</bar-style></barline>';
            else if (sub.indexOf('end') === 0) barra = '<barline location="right"><bar-style>light-heavy</bar-style></barline>';
            return;
          }
          if (e.tagName !== 'Chord' && e.tagName !== 'Rest') return;
          if (e.querySelector('acciaccatura, appoggiatura, graceNote, grace4, grace8after, grace16, grace32')) return;   // notas de adorno
          const tipo = texto(e, ':scope > durationType') || 'quarter';
          const puntillos = parseInt(texto(e, ':scope > dots') || '0', 10);
          const negras = negrasDe(tipo, puntillos, compas);
          if (negras === null) return;
          const dur = Math.round(negras * DIVISIONES);
          const fig = figuraXML(negras);
          const puntos = '<dot/>'.repeat(fig.puntillos);
          if (e.tagName === 'Rest') {
            cuerpo += '<note><rest/><duration>' + dur + '</duration><type>' + fig.tipo + '</type>' + puntos + '<staff>' + numStaff + '</staff></note>';
            duracionStaff += dur;
            ligar = false;
            return;
          }
          const notas = [...e.querySelectorAll(':scope > Note')];
          if (!notas.length) return;
          notas.forEach((n, k) => {
            const pitch = parseInt(texto(n, 'pitch') || '60', 10);
            const tpc = parseInt(texto(n, 'tpc') || texto(n, 'tpc1') || '14', 10);
            const a = altura(pitch, tpc);
            // Ligadura: la nota que cierra la ligadura lleva un Spanner de tipo Tie con <prev>
            const ligadaAntes = [...n.querySelectorAll(':scope > Spanner')].some(s => s.getAttribute('type') === 'Tie' && s.querySelector(':scope > prev'));
            const liga = (ligadaAntes || ligar) && k === 0 ? '<tie type="stop"/>' : '';
            cuerpo += '<note>' + (k ? '<chord/>' : '') + liga
              + '<pitch><step>' + a.step + '</step>' + (a.alter ? '<alter>' + a.alter + '</alter>' : '') + '<octave>' + a.octave + '</octave></pitch>'
              + '<duration>' + dur + '</duration><type>' + fig.tipo + '</type>' + puntos
              + (liga ? '<notations><tied type="stop"/></notations>' : '')
              + '<staff>' + numStaff + '</staff></note>';
          });
          duracionStaff += dur;
          ligar = false;
        });
        if (iStaff < compasesPorStaff.length - 1 && duracionStaff > 0) cuerpo += '<backup><duration>' + duracionStaff + '</duration></backup>';
      });
      salida.push('<measure number="' + (m + 1) + '">' + cuerpo + barra + '</measure>');
    }

    return '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="3.1">'
      + '<part-list><score-part id="P1"><part-name>MuseScore</part-name></score-part></part-list>'
      + '<part id="P1">' + salida.join('') + '</part></score-partwise>';
  }

  /* ---------- Entrada ---------- */

  // bytes: Uint8Array (.mscz) o texto (.mscx). Devuelve lo mismo que MusicXML.importar.
  async function importar(entrada, opciones = {}) {
    let mscx;
    if (typeof entrada === 'string') mscx = entrada;
    else {
      const bytes = entrada instanceof Uint8Array ? entrada : new Uint8Array(entrada);
      if (esMscz(bytes)) {
        mscx = await deZip(bytes, n => /\.mscx$/i.test(n) && !/^Thumbnails/i.test(n));
        if (!mscx) throw new Error('Dentro del .mscz no se ha encontrado la partitura (.mscx).');
      } else mscx = new TextDecoder().decode(bytes);
    }
    return MusicXML.importar(aMusicXML(mscx), opciones);
  }

  return { esMuseScore, importar, aMusicXML };
})();
