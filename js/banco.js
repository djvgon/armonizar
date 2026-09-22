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
     Banco.entrada(fragmento, {leccion, fuente, repertorio, acordes, formulaTST})
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
  function preferir(respuestas, compases, comp, ton, mods, esSop, fijados) {
    if (!comp) return respuestas;
    const ej = { compases, tonalidad: ton, modulaciones: mods || [] };
    let tons;
    try { tons = Teoria.tonalidadesPorNota(ej); } catch (e) { return respuestas; }
    const notas = Teoria.notasDeCompases(compases);
    const clase = n => Teoria.clase(Teoria.nota(n));
    return respuestas.map((adm, i) => {
      if (!adm || adm.length < 2 || !comp[i] || !notas[i]) return adm;
      if (fijados && fijados[i]) return adm;
      let bueno = null;
      try {
        bueno = adm.find(id => {
          if (esSop) {
            const pr = Ejercicios.par(id);
            const t = Teoria.tonParaAcorde(pr.romano, pr.cifra, tons[i], notas[i]);
            const b = Teoria.bajoDe(pr.romano, pr.cifra, t);
            return b && clase(b) === clase(comp[i]);
          }
          const t = Teoria.tonParaBajo(id, notas[i], tons[i], comp[i]);
          return [clase(notas[i]), ...Teoria.vocesSuperiores(id, notas[i], t).map(v => Teoria.clase(v))].includes(clase(comp[i]));
        });
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

  function tonalidadQueCuadra(f, op, hayB, hayS) {
    const ton = f.tonalidad;
    if (!hayB) return ton;
    if ((f.modulacionesBajo || []).length || (f.modulacionesSoprano || []).length) return ton;
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
    const cands = Teoria.tonalidadesCandidatas(ton, notas, ultima);
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
    if (hayB) {
      const r = analizar(f.compasesBajo, ton, f.modulacionesBajo, false,
        Object.assign({}, op, { companera: hayS ? companera(f.compasesBajo, f.compasesSoprano) : null }));
      if (r) {
        partes.bajo = {
          compases: f.compasesBajo,
          modulaciones: (f.modulacionesBajo || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          // El bajo NO pasa por preferir(): la voz compañera ya entra en el motor
          // (ej.companera), de modo que la eligen las reglas y no un retoque posterior.
          respuestas: r.respuestas
        };
        if (r.incompleto) avisos.push('alguna nota del bajo se queda sin cifra posible');
        const fin = finalExtrano(partes.bajo, ton, compas);
        if (fin) avisos.push(fin);
      }
    }
    if (hayS) {
      const r = analizar(f.compasesSoprano, ton, f.modulacionesSoprano, true, op);
      if (r) {
        partes.soprano = {
          compases: f.compasesSoprano,
          modulaciones: (f.modulacionesSoprano || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          respuestas: preferir(r.respuestas, f.compasesSoprano, hayB ? companera(f.compasesSoprano, f.compasesBajo) : null, ton, f.modulacionesSoprano, true, r.fijados)
        };
        if (r.incompleto) avisos.push('alguna nota de la melodía se queda sin acorde posible');
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
      tonalidad: { tonica: ton.tonica, modo: ton.modo },
      tonalidadSegura: f.tonalidadSegura !== false && !cambiada,
      // Si la armadura de la partitura no era la del fragmento, se guarda para poder avisar
      armaduraEscrita: cambiada ? { tonica: f.tonalidad.tonica, modo: f.tonalidad.modo } : null,
      ultimaBajo: cambiada ? ultimaBajo : null,      // solo hace falta para redactar ese aviso
      compas: compas.slice(),
      bajo: partes.bajo || null,
      soprano: partes.soprano || null,
      nivelManual: null,
      avisos
    };
    etiquetar(base);
    return base;
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
      if ((partes.bajo.respuestas || []).some(r => !r || !r.length)) avisos.push('alguna nota del bajo se queda sin cifra posible');
      const fin = finalExtrano(partes.bajo, ton, compas);
      if (fin) avisos.push(fin);
    }
    if (partes.soprano && (partes.soprano.respuestas || []).some(r => !r || !r.length)) avisos.push('alguna nota de la melodía se queda sin acorde posible');
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
      notas: Teoria.numeroDeNotas(principal.compases),
      compases: principal.compases.length,
      modo: ton.modo,
      alteraciones: Math.abs(Teoria.armadura(ton)),
      modula: (principal.modulaciones || []).length > 0,
      cifras,
      grados
    };
    et.nivel = nivelBase(et);
    e.etiquetas = et;
    return e;
  }

  /* ---------- Filtros ---------- */

  /* filtro: { n, modo, leccion, lecciones:[], modoTonal:'mayor'|'menor', alteraciones:[min,max],
               nivel:[min,max], notas:[min,max], modula:true|false|null, cifras:[ids],
               titulo } — todo opcional salvo modo y n. */
  function cumple(e, filtro) {
    const f = filtro || {};
    const voz = vozDeModo(f.modo || 'armonizar');
    if (!e[voz]) return false;                                   // no tiene esa voz escrita
    const et = e.etiquetas || {};
    // Un fragmento con avisos (alguna nota sin cifra posible) no sale en las fichas
    if (!f.conAvisos && e.avisos && e.avisos.length) return false;
    if (f.leccion && e.leccion !== f.leccion) return false;
    if (f.lecciones && f.lecciones.length && !f.lecciones.includes(e.leccion)) return false;
    if (f.modoTonal && et.modo !== f.modoTonal) return false;
    if (f.alteraciones && (et.alteraciones < f.alteraciones[0] || et.alteraciones > f.alteraciones[1])) return false;
    if (f.notas && (et.notas < f.notas[0] || et.notas > f.notas[1])) return false;
    if (f.modula === true && !et.modula) return false;
    if (f.modula === false && et.modula) return false;
    if (f.cifras && f.cifras.length && !f.cifras.every(c => (et.cifras || []).includes(c))) return false;
    if (f.nivel) { const n = nivel(e, f.modo); if (n < f.nivel[0] || n > f.nivel[1]) return false; }
    return true;
  }
  const filtrar = (entradas, filtro) => (entradas || []).filter(e => cumple(e, filtro));

  // Baraja (Fisher-Yates) y toma N. Sin semilla: cada vez que se abre la ficha salen otros.
  function elegir(entradas, filtro) {
    const lista = filtrar(entradas, filtro).slice();
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    const n = Math.max(1, Math.min(lista.length, (filtro && filtro.n) || 8));
    return lista.slice(0, n);
  }

  /* ---------- De entrada a ejercicio ---------- */

  function ejercicio(e, filtro, k) {
    const f = filtro || {};
    const modo = f.modo || 'armonizar';
    const parte = e[vozDeModo(modo)];
    if (!parte) return null;
    /* El repertorio y los acordes son los de SU lección, no los del filtro: en una ficha
       que mezcla lecciones, cada fragmento se juega con los acordes de la suya. */
    const suyos = (e.leccionRepertorio && e.leccionRepertorio.length) ? e.leccionRepertorio.slice() : repertorioDe(parte, modo);
    const acordes = (e.leccionAcordes && e.leccionAcordes.length) ? e.leccionAcordes.slice() : (f.acordes || []);
    const ej = {
      id: e.id || ('banco-' + (k || 0)),
      coleccion: f.titulo || (e.leccion ? 'Lección ' + e.leccion : ''),
      // El título no repite el código de la lección: la colección ya dice «Lección A3-8»
      titulo: e.titulo || e.leccionNombre || etiquetaLeccion(e) || ('Ejercicio ' + ((k || 0) + 1)),
      leccion: etiquetaLeccion(e),
      tonalidad: e.tonalidad,
      compas: e.compas,
      compases: parte.compases,
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
    if (f.gradosBajo === false) ej.gradosBajo = false;
    if (f.funciones) ej.funciones = f.funciones;
    // La respuesta modelo preferida sobre el 6.º descendente (+6 en cuarto curso)
    if (Array.isArray(f.preferir) && f.preferir.length) ej.preferir = f.preferir.slice();
    // La fila «Tonalidad»: rige module o no el fragmento (decisión 56)
    if (['dadas', 'pedir', 'no'].includes(f.tonalidades)) ej.tonalidades = f.tonalidades;
    if (parte.modulaciones && parte.modulaciones.length) ej.modulaciones = parte.modulaciones;
    return ej;
  }

  // Paleta del alumno: las cifras que de verdad hacen falta en ese fragmento, en el orden de siempre
  const ORDEN = ['53', '6', '64', '65', '43', '42', '7', '9', '7+', '+6', '65d', '+4'];
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
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  }

  /* ---------- El archivo del banco ---------- */

  const archivo = entradas => ({ version: VERSION, creado: new Date().toISOString().slice(0, 10), fragmentos: entradas });
  function leerArchivo(txt) {
    const d = typeof txt === 'string' ? JSON.parse(txt) : txt;
    const lista = Array.isArray(d) ? d : (d && d.fragmentos);
    if (!Array.isArray(lista)) throw new Error('El archivo no tiene una lista de fragmentos.');
    return lista.filter(e => e && (e.bajo || e.soprano));
  }
  const lecciones = entradas => {
    const out = [];
    (entradas || []).forEach(e => { if (e.leccion && !out.includes(e.leccion)) out.push(e.leccion); });
    return out.sort();
  };
  // «A3-1. I, V y V7 - Fragmentos Bajo.mscz» → «A3-1»
  function leccionDeNombre(nombre) {
    const m = /^\s*([AC]?\d\s*-\s*\d+)/i.exec(String(nombre || '').replace(/^([A-Z])(\d)/i, '$1$2'));
    return m ? m[1].replace(/\s+/g, '').toUpperCase() : '';
  }
  /* …y su NOMBRE: «I, V y V7». Hace falta para saber qué acordes trae cada lección, que es
     lo que de verdad dice el filtro de una ficha. Se quita el código, la extensión y la
     coletilla «- Fragmentos …» del nombre del archivo. */
  function nombreDeLeccion(nombre) {
    let t = String(nombre || '').replace(/\.(mscz|mscx|musicxml|xml|json)$/i, '');
    t = t.replace(/^\s*[AC]?\d\s*-\s*\d+\s*[.)\-–]?\s*/i, '');
    t = t.split(/\s+[-–]\s+/)[0];
    return t.trim();
  }
  // Etiqueta que se enseña: «A3-1 · I, V y V7»
  const etiquetaLeccion = e => (e.leccion || '') + (e.leccionNombre ? ' · ' + e.leccionNombre : '');
  // El repertorio que tiene guardado una lección (el de su primer fragmento)
  function repertorioDeLeccion(entradas, leccion) {
    const e = (entradas || []).find(x => x.leccion === leccion);
    return e ? { cifras: (e.leccionRepertorio || []).slice(), acordes: (e.leccionAcordes || []).slice() } : null;
  }
  // Nombre de cada lección del banco, por si alguna entrada vieja no lo trae
  function nombresDeLecciones(entradas) {
    const out = {};
    (entradas || []).forEach(e => {
      if (!e.leccion || out[e.leccion]) return;
      const n = e.leccionNombre || nombreDeLeccion(e.fuente);
      if (n) out[e.leccion] = n;
    });
    return out;
  }

  return { VERSION, MODOS, modoDe, vozDeModo, paginaDeModo, entrada, nivel, nivelBase, cumple, filtrar, elegir,
    ejercicio, repertorioDe, codificar, decodificar, archivo, leerArchivo, lecciones, etiquetar,
    analizarVoz: analizar, companeraDe: companera,
    leccionDeNombre, nombreDeLeccion, etiquetaLeccion, nombresDeLecciones, repertorioDeLeccion };
})();
