/* =====================================================================
   cadenas.js — La CADENA DE RETARDOS a dos voces, con su cadencia
   compuesta. Es el paso que sigue a la célula suelta (`celulas.js`) y el
   que lleva al apartado 3 del documento de contrapunto: escribir la voz
   superior sobre un bajo dado.

   QUÉ ES. Varias células 6–7–6 encadenadas: la resolución de una es la
   preparación de la siguiente, de modo que la voz de arriba baja por
   grados ligada sobre cada barra y la de abajo baja por grados también,
   moviéndose en la percusión y quedándose en la resolución. Los
   intervalos van 6 · 7 · 6 · 7 · 6 …

   CÓMO ACABA (Diego, 15/10/2026): «la cadencia compuesta (a dos voces)
   es cuando la nota retardada cae sobre sensible y luego esta, en el
   siguiente tiempo fuerte, va a tónica». De ahí que el ÚLTIMO retardo
   sea el de la tónica: la tónica retardada resuelve en la sensible, y
   la sensible sube a la tónica en el tiempo fuerte siguiente.

       las dos voces acaban en tónica   → cadencia compuesta PERFECTA
       una en tónica y otra en tercera  → cadencia compuesta IMPERFECTA

   Y sobre la tónica no cabe otra cosa, que es la regla general que él
   mismo da —«sobre la tónica solo se ha de poner tónica (octava) o
   tercera (a dos voces) para que se haga sonar la sonoridad de
   tónica»— y que `celulas.js` aplica en las consonancias.

   QUÉ ESCRIBE EL ALUMNO (Diego, 15/10): se le da **el bajo entero**, con
   sus ligaduras, y él escribe **la voz superior** —las notas, sus
   ligaduras y las barras de compás—. Es, en pequeño, el ejercicio de
   partimento al que lleva todo esto.

   Depende de `teoria.js` y de `celulas.js`.
   ===================================================================== */

const Cadenas = (() => {

  const ix = n => Teoria.indice(n);
  const mi = n => Teoria.midi(n);
  const clase = n => ((mi(n) % 12) + 12) % 12;

  /* De dos a cuatro retardos, al azar (Diego, 15/10). Con dos son seis momentos y con
     cuatro, diez: en la pantalla del móvil el de cuatro ya pide desplazar. */
  const LARGOS = [2, 3, 4];
  const CADENCIAS = ['perfecta', 'imperfecta'];
  const TONALIDADES = Celulas.TONALIDADES;
  const REGISTRO_FICHA = Celulas.REGISTRO_FICHA;

  const MENSAJES = {
    cadenaIncompleta: 'Falta alguna nota: la cadena tiene {n} momentos en cada voz.',
    enlace: 'La resolución de un retardo es la preparación del siguiente: esa nota no puede cambiar.',
    cadenciaSensible: 'El último retardo es el de la tónica: ha de resolver en la sensible.',
    cadenciaTonica: 'La sensible sube a la tónica en el tiempo fuerte siguiente: eso es la cadencia compuesta.',
    cadenciaSonoridad: 'Para que suene la tónica, las dos voces han de acabar en tónica (cadencia perfecta) o una en tónica y otra en su tercera (imperfecta).',
    barras: 'Las barras de compás van delante de cada percusión y delante del acorde final: el retardo cae siempre en parte fuerte.',
    ligadurasAlta: 'En una cadena, cada nota de la voz superior se liga de su preparación a su percusión: por eso es un retardo y no una nota repetida.'
  };
  const texto = (clave, datos) => Celulas.rellenar(MENSAJES[clave] || clave, datos);

  // La mediante de la tonalidad, que es lo que, con la tónica, hace sonar la tónica
  function mediante(ton) {
    const e = Teoria.escalaNatural(ton)
      .find(x => Teoria.textoGrado({ letra: x.letra, alt: x.alt, octava: 4 }, ton) === '3');
    return e ? { letra: e.letra, alt: e.alt } : null;
  }
  const esTonica = (n, ton) => clase(n) === clase(Teoria.nota(ton.tonica + '4'));
  function esMediante(n, ton) {
    const m = mediante(ton);
    return !!m && clase(n) === clase({ letra: m.letra, alt: m.alt, octava: 4 });
  }

  /* ---------- Generar ----------
     `tonica` es la nota de la voz SUPERIOR en la que acaba la cadena: la tónica a la que
     sube la sensible. De ella sale todo hacia atrás, porque el último retardo es el suyo. */
  function generar(op) {
    const ton = op.tonalidad;
    const n = Math.max(2, Math.min(6, op.n || 3));
    const cadencia = op.cadencia === 'imperfecta' ? 'imperfecta' : 'perfecta';
    const fin = Teoria.nota(op.tonica);
    if (!esTonica(fin, ton)) return { nula: true, motivo: 'La cadena acaba en la tónica, y ' + Teoria.texto(fin) + ' no lo es.' };

    const esc = Celulas.escalera(ton);
    const iFin = esc.findIndex(x => ix(x) === ix(fin));
    if (iFin < 0) return { nula: true, motivo: 'Esa tónica no está en la escalera de la tonalidad.' };
    // La primera retardada está n−1 grados por encima de la última, que es la tónica
    const iPrimera = iFin + (n - 1);
    if (iPrimera >= esc.length) return { nula: true, motivo: 'La cadena se sale de la escalera por arriba.' };

    const celulas = [];
    const momentos = [];
    const ligaduras = [];
    const barras = [];
    for (let k = 0; k < n; k++) {
      const r = esc[iPrimera - k];
      const c = Celulas.generar({ tonalidad: ton, tipo: '6-7-6', retardada: r });
      if (c.nula) return { nula: true, motivo: c.motivo };
      celulas.push(c);
      if (k === 0) momentos.push(c.momentos[0]);
      momentos.push(c.momentos[1], c.momentos[2]);
      const base = k * 2;
      ligaduras.push({ voz: 'alta', desde: base });       // la retardada, de preparación a percusión
      ligaduras.push({ voz: 'baja', desde: base + 1 });   // la nota real se queda
      barras.push(base + 1);                              // la barra, delante de la percusión
    }

    /* El acorde de la cadencia. La sensible sube a la tónica; abajo, la tónica (perfecta) o
       la mediante (imperfecta). El bajo viene del 2.º grado, de modo que en la perfecta baja
       un grado y en la imperfecta sube uno: en los dos casos, por grado conjunto. */
    const ultima = celulas[celulas.length - 1];
    const sensible = ultima.momentos[2].alta;
    const iSens = esc.findIndex(x => ix(x) === ix(sensible));
    const arriba = conAlteracion(esc[iSens + 1], fin);
    const bajoAntes = ultima.momentos[2].baja;
    const iBajo = esc.findIndex(x => ix(x) === ix(bajoAntes));
    const abajo = cadencia === 'perfecta' ? esc[iBajo - 1] : esc[iBajo + 1];
    if (!arriba || !abajo) return { nula: true, motivo: 'La cadencia se sale de la escalera.' };
    momentos.push({ alta: copia(arriba), baja: copia(abajo) });
    barras.push(momentos.length - 1);                     // y delante del acorde final

    const cadena = {
      tonalidad: ton, n, cadencia,
      momentos, ligaduras, barras, celulas,
      intervalos: momentos.map(m => Celulas.gradosEntre(m.alta, m.baja)),
      sensible: ultima.sensible || null,
      tonica: Teoria.texto(fin)
    };
    cadena.id = 'cadena·' + Teoria.nombreCorto(ton).replace(/ /g, '') + '·' + Teoria.texto(fin)
      + '·' + n + '·' + cadencia;
    return cadena;
  }
  const copia = n => ({ letra: n.letra, alt: n.alt, octava: n.octava });
  // La tónica del final se escribe como la tónica de la tonalidad, no como la dé la escalera
  const conAlteracion = (n, fin) => (n && ix(n) === ix(fin) ? copia(fin) : (n ? copia(n) : null));

  /* ---------- Las reglas ----------
     Las de cada célula las pone `celulas.js`; aquí van las de la cadena: el enlace entre una
     y la siguiente, las paralelas que cruzan el final y la cadencia. */
  function revisar(cadena, op) {
    const fallos = [];
    const ton = cadena.tonalidad;
    (cadena.celulas || []).forEach((c, k) => Celulas.revisar(c, op).forEach(f => {
      fallos.push(Object.assign({}, f, { momento: (f.momento || 0) + k * 2, celula: k }));
    }));

    const m = cadena.momentos;
    const fin = m[m.length - 1];
    const antes = m[m.length - 2];

    // La sensible sube a la tónica
    if (!esTonica(fin.alta, ton) || mi(fin.alta) - mi(antes.alta) !== 1)
      fallos.push({ regla: 'cadenciaTonica', momento: m.length - 1, mensaje: texto('cadenciaTonica') });
    // Y abajo, tónica o mediante: la sonoridad de tónica
    if (!esTonica(fin.baja, ton) && !esMediante(fin.baja, ton))
      fallos.push({ regla: 'cadenciaSonoridad', momento: m.length - 1, mensaje: texto('cadenciaSonoridad') });
    if (esTonica(fin.alta, ton) && !esTonica(fin.baja, ton) && !esMediante(fin.baja, ton))
      fallos.push({ regla: 'cadenciaSonoridad', momento: m.length - 1, mensaje: texto('cadenciaSonoridad') });

    // Las paralelas de todo el recorrido, incluido el paso a la cadencia
    for (let k = 0; k + 1 < m.length; k++) {
      const p = paralelas(m[k], m[k + 1]);
      if (p) fallos.push({ regla: 'esqueleto', momento: k, mensaje: 'Hay ' + p + ' paralelas entre el momento ' + (k + 1) + ' y el ' + (k + 2) + '.' });
    }
    return fallos;
  }
  function paralelas(a, b) {
    const pc = x => ((x % 12) + 12) % 12;
    const i1 = pc(mi(a.alta) - mi(a.baja)), i2 = pc(mi(b.alta) - mi(b.baja));
    if (i1 !== i2) return null;
    if (mi(a.alta) === mi(b.alta) && mi(a.baja) === mi(b.baja)) return null;
    if (i1 === 0) return 'octavas';
    if (i1 === 7) return 'quintas';
    return null;
  }

  /* ---------- Todas las cadenas de una tonalidad ---------- */
  function todas(op) {
    const ton = op.tonalidad;
    const largos = (op.largos && op.largos.length ? op.largos : LARGOS);
    const registro = op.registro || REGISTRO_FICHA;
    const bajo = mi(Teoria.nota(registro[0])), alto = mi(Teoria.nota(registro[1]));
    const cadenas = [], descartadas = [];
    Celulas.escalera(ton).filter(n => esTonica(n, ton)).forEach(t => {
      largos.forEach(n => CADENCIAS.forEach(cadencia => {
        const c = generar({ tonalidad: ton, n, tonica: Teoria.texto(t), cadencia });
        if (c.nula) return;
        const fuera = c.momentos.some(x => [x.alta, x.baja].some(y => mi(y) < bajo || mi(y) > alto));
        const fallos = revisar(c, { registro });
        if (fuera || fallos.length) descartadas.push({ cadena: c, fallos: fallos.length ? fallos : [{ regla: 'registro' }] });
        else cadenas.push(c);
      }));
    });
    return { cadenas, descartadas };
  }

  function porId(id) {
    const p = String(id || '').split('·');
    if (p.length < 5 || p[0] !== 'cadena') return null;
    let ton = null;
    try { ton = Teoria.tonalidadDesdeTexto(p[1]); } catch (e) { return null; }
    if (!ton || !ton.tonica) return null;
    const c = generar({ tonalidad: ton, tonica: p[2], n: Number(p[3]), cadencia: p[4] });
    return c && !c.nula ? c : null;
  }

  /* ---------- Elegir las de una ficha ----------
     Mismo criterio que con las células: variadas y **lejos unas de otras**, para que no se
     pueda transportar la anterior (Diego, 15/10). Aquí se mide por la tónica en la que
     acaban, que es lo que el alumno reconoce. */
  function elegir(op) {
    const o = op || {};
    const cuantas = Math.max(1, o.n || 6);
    const al = o.alAzar || Math.random;
    const tons = (o.tonalidades && o.tonalidades.length ? o.tonalidades : TONALIDADES);
    const monton = [];
    tons.forEach(ton => todas({ tonalidad: ton, largos: o.largos, registro: o.registro })
      .cadenas.forEach(c => monton.push(c)));
    const libres = Celulas.barajar(monton, al);
    const sep = (a, b) => (Math.abs(ix(Teoria.nota(a.tonica)) - ix(Teoria.nota(b.tonica))) % 7) + 1;
    const salen = [];
    while (salen.length < cuantas && libres.length) {
      const antes = salen.length ? salen[salen.length - 1] : null;
      let k = 0;
      if (antes) {
        const lejos = libres.findIndex(c => [4, 5].includes(sep(antes, c)));
        const vale = libres.findIndex(c => [3, 6].includes(sep(antes, c)));
        k = lejos >= 0 ? lejos : (vale >= 0 ? vale : 0);
      }
      salen.push(libres.splice(k, 1)[0]);
    }
    return salen;
  }

  /* ---------- El enunciado ----------
     Propuesta mía, a falta del visto bueno de Diego: el suyo para la célula es «Haz descender
     sol2 con un retardo 6–7–6», y este sigue el mismo tono. */
  const ENUNCIADO = 'Sobre este bajo, escribe la voz superior: una cadena de {n} retardos 7–6 que acabe en cadencia compuesta.';
  const enunciado = cadena => Celulas.rellenar(ENUNCIADO, { n: cadena.n });

  /* Lo que viene escrito: TODO el bajo, con sus ligaduras (Diego, 15/10). */
  const dadas = cadena => cadena.momentos.map((m, k) => ({ momento: k, voz: 'baja' }));
  const ligadurasDadas = cadena => cadena.ligaduras.filter(l => l.voz === 'baja');

  /* ---------- Corregir ---------- */
  function comprobar(cadena, respuesta, op) {
    const m = respuesta && respuesta.momentos;
    if (!m || m.length !== cadena.momentos.length)
      return { fallos: [{ regla: 'cadenaIncompleta', mensaje: texto('cadenaIncompleta', { n: cadena.momentos.length }) }], diferencias: [], bien: false };
    if (m.some(x => !x.alta || !x.baja))
      return { fallos: [{ regla: 'cadenaIncompleta', mensaje: texto('cadenaIncompleta', { n: cadena.momentos.length }) }], diferencias: [], bien: false };

    const suya = Object.assign({}, cadena, {
      momentos: m,
      intervalos: m.map(x => Celulas.gradosEntre(x.alta, x.baja)),
      // las células que salen de lo que ha escrito, para pasarles las reglas de la célula
      celulas: cadena.celulas.map((c, k) => Object.assign({}, c, {
        momentos: [m[k * 2], m[k * 2 + 1], m[k * 2 + 2]],
        intervalos: [m[k * 2], m[k * 2 + 1], m[k * 2 + 2]].map(x => Celulas.gradosEntre(x.alta, x.baja))
      }))
    });
    const fallos = revisar(suya, op);

    /* Las ligaduras de la voz superior: una por retardo, de la preparación a la percusión.
       Las del bajo vienen dadas, así que no se le piden. */
    const ls = respuesta.ligaduras || [];
    const faltan = cadena.ligaduras.filter(l => l.voz === 'alta')
      .filter(l => !ls.some(x => x.voz === 'alta' && x.desde === l.desde));
    if (faltan.length) fallos.push({ regla: 'ligadurasAlta', momento: faltan[0].desde, mensaje: texto('ligadurasAlta') });

    // Las barras: delante de cada percusión y delante del acorde final
    const suyas = (respuesta.barras || []).slice().sort((a, b) => a - b);
    const debidas = cadena.barras.slice().sort((a, b) => a - b);
    if (suyas.join(',') !== debidas.join(',')) fallos.push({ regla: 'barras', mensaje: texto('barras') });

    const diferencias = [];
    m.forEach((x, k) => ['alta', 'baja'].forEach(voz => {
      const mod = cadena.momentos[k][voz];
      if (!x[voz] || ix(x[voz]) !== ix(mod) || x[voz].alt !== mod.alt)
        diferencias.push({ momento: k, voz, suya: x[voz] ? Teoria.texto(x[voz]) : '', modelo: Teoria.texto(mod) });
    }));
    return { fallos, diferencias, bien: !fallos.length && !diferencias.length };
  }

  /* ---------- Para oírla ----------
     El acorde final, más largo: es el que cierra. */
  function aSonido(cadena, segundosPorMomento) {
    const s = segundosPorMomento || 0.8;
    const ultimo = cadena.momentos.length - 1;
    return cadena.momentos.map((m, k) => ({
      notas: [m.baja, m.alta].filter(Boolean),
      segundos: k === ultimo ? s * 2.4 : s, momento: k
    }));
  }

  const comoTexto = cadena => cadena.momentos
    .map(m => Teoria.texto(m.alta) + '/' + Teoria.texto(m.baja)).join(' → ');

  return { LARGOS, CADENCIAS, TONALIDADES, MENSAJES, ENUNCIADO,
    generar, revisar, todas, porId, elegir, comprobar, enunciado, dadas, ligadurasDadas,
    aSonido, comoTexto, esTonica, esMediante, mediante };
})();
