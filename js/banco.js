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

  const MODOS = [
    { id: 'cifrar', nombre: 'Análisis', ajuste: -1, voz: 'bajo' },
    { id: 'armonizar', nombre: 'Armonización de bajo', ajuste: 0, voz: 'bajo' },
    { id: 'audicion', nombre: 'Audición', ajuste: 1, voz: 'bajo' },
    { id: 'soprano', nombre: 'Armonización de soprano', ajuste: 1, voz: 'soprano' }
  ];
  const modoDe = id => MODOS.find(m => m.id === id) || MODOS[1];
  const vozDeModo = id => modoDe(id).voz;

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
     siguen siendo válidas. */
  function preferir(respuestas, compases, comp, ton, mods, esSop) {
    if (!comp) return respuestas;
    const ej = { compases, tonalidad: ton, modulaciones: mods || [] };
    let tons;
    try { tons = Teoria.tonalidadesPorNota(ej); } catch (e) { return respuestas; }
    const notas = Teoria.notasDeCompases(compases);
    const clase = n => Teoria.clase(Teoria.nota(n));
    return respuestas.map((adm, i) => {
      if (!adm || adm.length < 2 || !comp[i] || !notas[i]) return adm;
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
    if (esSop && opciones.acordes && opciones.acordes.length) ej.acordes = opciones.acordes.slice();
    if (esSop && opciones.formulaTST === false) ej.formulaTST = false;
    let prop;
    try { prop = esSop ? Reglas.proponerSoprano(ej) : Reglas.proponer(ej); } catch (e) { return null; }
    if (!prop || !prop.length) return null;
    const respuestas = prop.map(p => (p.admisibles || []).slice());
    if (respuestas.some(r => !r.length)) return { respuestas, incompleto: true, ej };
    return { respuestas, incompleto: false, ej };
  }

  /* fragmento: lo que devuelve MusicXML.importar / MuseScore.importar.
     opciones: {leccion, fuente, repertorio, acordes, formulaTST}. */
  function entrada(fragmento, opciones = {}) {
    const f = fragmento;
    const ton = f.tonalidad;
    const compas = f.compas || [4, 4];
    const hayB = Teoria.numeroDeNotas(f.compasesBajo || []) > 0;
    const hayS = Teoria.numeroDeNotas(f.compasesSoprano || []) > 0;
    if (!hayB && !hayS) return null;
    const op = Object.assign({ compas }, opciones);

    const partes = {};
    const avisos = [];
    if (hayB) {
      const r = analizar(f.compasesBajo, ton, f.modulacionesBajo, false, op);
      if (r) {
        partes.bajo = {
          compases: f.compasesBajo,
          modulaciones: (f.modulacionesBajo || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          respuestas: preferir(r.respuestas, f.compasesBajo, hayS ? companera(f.compasesBajo, f.compasesSoprano) : null, ton, f.modulacionesBajo, false)
        };
        if (r.incompleto) avisos.push('alguna nota del bajo se queda sin cifra posible');
      }
    }
    if (hayS) {
      const r = analizar(f.compasesSoprano, ton, f.modulacionesSoprano, true, op);
      if (r) {
        partes.soprano = {
          compases: f.compasesSoprano,
          modulaciones: (f.modulacionesSoprano || []).map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } })),
          respuestas: preferir(r.respuestas, f.compasesSoprano, hayB ? companera(f.compasesSoprano, f.compasesBajo) : null, ton, f.modulacionesSoprano, true)
        };
        if (r.incompleto) avisos.push('alguna nota de la melodía se queda sin acorde posible');
      }
    }
    if (!partes.bajo && !partes.soprano) return null;

    // Etiquetas: todas salen del análisis
    const principal = partes.bajo || partes.soprano;
    const esSopPrincipal = !partes.bajo;
    const modelo = principal.respuestas.map(r => r[0]).filter(Boolean);
    const cifras = [], grados = [];
    modelo.forEach(id => {
      const cifra = esSopPrincipal ? Ejercicios.cifraDe(id) : id;
      if (cifra && !cifras.includes(cifra)) cifras.push(cifra);
    });
    if (esSopPrincipal) modelo.forEach(id => { const r = Ejercicios.par(id).romano; if (r && !grados.includes(r)) grados.push(r); });

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

    return {
      id: opciones.id || null,
      leccion: opciones.leccion || '',
      fuente: opciones.fuente || '',
      titulo: opciones.titulo || '',
      tonalidad: { tonica: ton.tonica, modo: ton.modo },
      tonalidadSegura: f.tonalidadSegura !== false,
      compas: compas.slice(),
      bajo: partes.bajo || null,
      soprano: partes.soprano || null,
      etiquetas: et,
      nivelManual: null,
      avisos
    };
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
    const ej = {
      id: e.id || ('banco-' + (k || 0)),
      coleccion: f.titulo || (e.leccion ? 'Lección ' + e.leccion : ''),
      titulo: e.titulo || e.leccion || ('Ejercicio ' + ((k || 0) + 1)),
      tonalidad: e.tonalidad,
      compas: e.compas,
      compases: parte.compases,
      respuestas: parte.respuestas,
      repertorio: f.repertorio || repertorioDe(parte, modo)
    };
    if (modo !== 'armonizar') ej.modo = modo;
    if (modo === 'audicion' && f.mostrarBajo) ej.mostrarBajo = true;
    if (modo === 'soprano' && f.acordes && f.acordes.length) ej.acordes = f.acordes.slice();
    if (modo === 'soprano' && f.formulaTST === false) ej.formulaTST = false;
    if (f.pedirRomano === false) ej.pedirRomano = false;
    if (f.reintentos === false) ej.reintentos = false;
    if (f.ayudaGrados && f.ayudaGrados !== 'lista') ej.ayudaGrados = f.ayudaGrados;
    if (f.funciones) ej.funciones = f.funciones;
    if (parte.modulaciones && parte.modulaciones.length) {
      ej.modulaciones = parte.modulaciones;
      if (f.avisoMod === 'existe') ej.aviso = 'existe';
    }
    return ej;
  }

  // Paleta del alumno: las cifras que de verdad hacen falta en ese fragmento, en el orden de siempre
  const ORDEN = ['53', '6', '64', '65', '43', '7', '9', '7+', '+6', '65d', '+4'];
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

  return { VERSION, MODOS, modoDe, vozDeModo, entrada, nivel, nivelBase, cumple, filtrar, elegir,
    ejercicio, repertorioDe, codificar, decodificar, archivo, leerArchivo, lecciones, leccionDeNombre };
})();
