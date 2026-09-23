/* =====================================================================
   registro.js — Qué ha hecho el alumno en esta práctica.

   Una PRÁCTICA es lo que hace desde que abre un enlace hasta que lo termina:
   una ficha de N ejercicios, o un ejercicio suelto. De cada una se guarda un
   resumen (tiempo, aciertos al primer intento y finales) y el detalle NOTA A
   NOTA, que es lo que permite después saber en qué contenidos falla: no basta
   con contar los fallos, hace falta saber cuántas veces apareció cada cosa.

   Nada de esto sale del navegador por su cuenta. El módulo solo mide y arma el
   informe; enviarlo es decisión del alumno, al terminar.

   El reloj cuenta TIEMPO DE TRABAJO: se para cuando la pestaña queda en segundo
   plano, para no medir el rato que el móvil estuvo en el bolsillo.

   Uso:
     Registro.iniciarPractica({tipo, titulo, n})
     Registro.iniciarEjercicio(ej, k)
     Registro.anotarCorreccion(ej, estado)      · en cada corrección
     Registro.cerrarEjercicio()
     Registro.resumen()                         · {…} con todo
     Registro.informeTexto() / Registro.detalleCSV()
   ===================================================================== */

const Registro = (() => {

  const CLAVE = 'armonizar.practica';
  let p = null;            // práctica en curso
  let ej = null;           // ejercicio en curso
  let reloj = null;

  /* ---------- Reloj de trabajo ---------- */
  function nuevoReloj() {
    const r = { ms: 0, desde: document.hidden ? null : Date.now() };
    return r;
  }
  function pausar(r) { if (r && r.desde !== null) { r.ms += Date.now() - r.desde; r.desde = null; } }
  function seguir(r) { if (r && r.desde === null) r.desde = Date.now(); }
  const leer = r => (r ? Math.round((r.ms + (r.desde !== null ? Date.now() - r.desde : 0)) / 1000) : 0);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pausar(reloj); pausar(p && p.reloj); }
    else { seguir(reloj); seguir(p && p.reloj); }
  });

  /* ---------- Etiquetas de contenido ----------
     La etiqueta de cada nota es el ACORDE MODELO tal como se escribe —«V/V 6/5̸»,
     «I 6/4», «II 4/3»—, más el grado de la escala que ocupa el bajo y el papel que
     hace esa nota en el fragmento. Con eso, una tabla dinámica responde sola a
     «¿en qué falla?»: cuántas veces salió el V/V y cuántas se falló. No hace falta
     inventar una clasificación aparte: los contenidos de las lecciones SON los
     acordes. */
  function etiquetaAcorde(romano, cifra) {
    const c = Teoria.CIFRADOS[cifra];
    const et = c ? c.etiqueta : cifra;
    return (romano || '?') + (et === '—' ? '' : ' ' + et);
  }
  /* ---------- Contenido del curso al que pertenece cada nota (etapa 8b·4) ----------
     Solo lo que se deduce con CERTEZA del acorde modelo y del papel de la nota; nada
     de adivinar. Las secuencias y las prolongaciones no están aquí a propósito: son
     patrones sobre varios acordes, no propiedades de uno, y habrá que declararlas en
     el banco. Lista corta a propósito: una rejilla de cuarenta contenidos ni se lee ni
     le llegan datos suficientes a ninguna casilla. */
  const CIFRAS_SEPTIMA = ['7', '7+', '65', '43', '42', '+6', '+4', '9'];
  const CIFRAS_DISMINUIDO = ['65d'];

  function contenidoDeNota(romano, cifra, papel) {
    if (papel === 'pivote') return 'Modulación';
    if (romano && romano.indexOf('/') >= 0) return 'Dominante secundaria';
    if (cifra === '64') return 'Cadencial 6/4';
    if (papel === 'final') return 'Cadencia';
    if (CIFRAS_DISMINUIDO.includes(cifra)) return 'Séptima disminuida';
    if (CIFRAS_SEPTIMA.includes(cifra)) return 'Séptima de dominante';
    if (cifra === '6' || cifra === '64') return 'Inversión de tríada';
    return 'Tríada en estado fundamental';
  }

  // Los contenidos de la práctica, con fallos y apariciones, igual que porContenido()
  function porContenidoCurso() {
    if (!p) return [];
    const m = new Map();
    p.notas.forEach(x => {
      const k = x.contenido || '?';
      const v = m.get(k) || { contenido: k, veces: 0, fallos: 0 };
      v.veces++; if (!x.bien) v.fallos++;
      m.set(k, v);
    });
    return [...m.values()].sort((a, b) => (b.fallos - a.fallos) || (b.veces - a.veces));
  }

  const contenidosCurso = () => porContenidoCurso().map(x => x.contenido + '=' + x.fallos + '/' + x.veces).join(' | ');

  function gradoDelBajo(nota, ton) {
    try {
      const g = Teoria.grado(Teoria.nota(nota), ton);
      return (g.alt > 0 ? '♯' : g.alt < 0 ? '♭' : '') + g.grado;
    } catch (e) { return ''; }
  }

  /* ---------- Práctica ---------- */
  function iniciarPractica(datos) {
    p = {
      tipo: datos.tipo || 'ejercicio',            // 'ficha' | 'ejercicio'
      titulo: datos.titulo || '',
      leccion: datos.leccion || '',
      modo: datos.modo || '',
      previstos: datos.n || 1,
      inicio: new Date().toISOString(),
      reloj: nuevoReloj(),
      alumno: '',
      ejercicios: [],
      notas: []                                   // detalle nota a nota
    };
    return p;
  }

  function iniciarEjercicio(e, k) {
    cerrarEjercicio();
    reloj = nuevoReloj();
    ej = {
      k: (k || 0) + 1,
      id: e.id || '',
      leccion: e.leccion || '',
      modo: Ejercicios.modo(e),
      tonalidad: (() => { try { return Teoria.nombreCorto(e.tonalidad); } catch (x) { return ''; } })(),
      modula: Ejercicios.modulaciones(e).length > 0,
      notas: e.respuestas.length,
      intentos: 0,
      primero: null,
      aciertos: null,
      segundos: 0
    };
  }

  function cerrarEjercicio() {
    if (!ej || !p) { ej = null; reloj = null; return; }
    ej.segundos = leer(reloj);
    p.ejercicios.push(ej);
    ej = null; reloj = null;
    guardar();
  }

  /* Se llama en CADA corrección. La primera es la que cuenta para la nota; las
     siguientes solo dicen si el alumno arregló sus errores. */
  function anotarCorreccion(e, estado) {
    if (!p || !ej) return;
    const res = estado.resultados || [];
    const aciertos = res.filter(r => r.ok).length;
    ej.intentos = estado.intento;
    ej.aciertos = aciertos;
    if (estado.intento === 1) {
      ej.primero = aciertos;
      // El detalle se guarda del PRIMER intento: es la medida limpia
      let notas = [];
      try { notas = Teoria.notasDeCompases(e.compases); } catch (x) { notas = []; }
      res.forEach((r, i) => {
        let ton = e.tonalidad;
        try { ton = Ejercicios.tonalidadEn(e, i); } catch (x) { /* la inicial */ }
        const falla = [];
        if (!r.okCifra) falla.push('cifra');
        if (!r.okRomano || !r.okRomano2) falla.push('grado');
        if (!r.okFuncion) falla.push('función');
        if (!r.okEnlace) falla.push('enlace');
        const esSop = Ejercicios.esSoprano(e);
        const bajo = esSop ? (estado.bajos && estado.bajos[i]) : notas[i];
        const papel = Ejercicios.esPivote(e, i) ? 'pivote'
          : i === res.length - 1 ? 'final'
            : i === 0 ? 'inicio' : '';
        p.notas.push({
          ej: ej.k,
          leccion: ej.leccion,
          modo: ej.modo,
          tonalidad: ej.tonalidad,
          nota: i + 1,
          gradoBajo: bajo ? gradoDelBajo(bajo, ton) : '',
          acorde: etiquetaAcorde(r.modeloRomano, r.modelo),
          funcion: r.modeloFuncion || '',
          papel,
          contenido: contenidoDeNota(r.modeloRomano, r.modelo, papel),
          bien: r.ok ? 1 : 0,
          falla: falla.join('+')
        });
      });
    }
    guardar();
  }

  const fijarAlumno = nombre => { if (p) { p.alumno = String(nombre || '').trim().slice(0, 80); guardar(); } };

  /* ---------- Resumen ---------- */
  function resumen() {
    if (!p) return null;
    const es = p.ejercicios.slice();
    if (ej) es.push(Object.assign({}, ej, { segundos: leer(reloj) }));
    const hechos = es.filter(x => x.aciertos !== null);
    const n = hechos.reduce((a, x) => a + x.notas, 0);
    const bien = hechos.reduce((a, x) => a + (x.aciertos || 0), 0);
    const pri = hechos.reduce((a, x) => a + (x.primero === null ? (x.aciertos || 0) : x.primero), 0);
    return {
      titulo: p.titulo,
      tipo: p.tipo,
      alumno: p.alumno,
      fecha: p.inicio,
      previstos: p.previstos,
      hechos: hechos.length,
      completa: hechos.length >= p.previstos,
      notas: n,
      aciertosPrimero: pri,
      aciertosFinal: bien,
      pctPrimero: n ? Math.round(100 * pri / n) : 0,
      pctFinal: n ? Math.round(100 * bien / n) : 0,
      // La nota sobre 10 sale del porcentaje al PRIMER intento: es la medida limpia,
      // la que dice lo que el alumno sabía antes de ver dónde fallaba. Lo de después
      // se guarda aparte (nota10Final) como prueba de que revisó y arregló.
      nota10: n ? Math.round(100 * pri / n) / 10 : 0,
      nota10Final: n ? Math.round(100 * bien / n) / 10 : 0,
      reintentos: hechos.reduce((a, x) => a + Math.max(0, x.intentos - 1), 0),
      segundos: leer(p.reloj),
      ejercicios: es
    };
  }

  // Los contenidos que más se fallan: por acorde modelo, fallados / apariciones
  function porContenido() {
    if (!p) return [];
    const m = new Map();
    p.notas.forEach(x => {
      const k = x.acorde || '?';
      const v = m.get(k) || { acorde: k, veces: 0, fallos: 0 };
      v.veces++; if (!x.bien) v.fallos++;
      m.set(k, v);
    });
    return [...m.values()].sort((a, b) => (b.fallos - a.fallos) || (b.veces - a.veces));
  }

  /* Los contenidos de la práctica en una línea, para el formulario del profesor:
     TODOS los acordes que salieron, con fallos y apariciones, no solo los fallados.
     Sin el denominador no se pueden sumar prácticas: «el V/V se falló 12 veces» no
     dice nada si no se sabe si salió 15 veces o 200. Formato «acorde=fallos/veces»,
     separados por « | », que se lee de un vistazo y se parte con una fórmula. */
  function contenidosCompactos() {
    return porContenido().map(x => x.acorde + '=' + x.fallos + '/' + x.veces).join(' | ');
  }

  const mmss = s => (s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s');

  /* Informe en texto: lo que el alumno copia y pega en la tarea de Classroom,
     donde ya está identificado. Compacto, legible y con un código al final que
     permite volcarlo a una hoja de cálculo sin transcribirlo a mano. */
  function informeTexto() {
    const r = resumen();
    if (!r) return '';
    const l = [];
    l.push('PRÁCTICA ARMÓNICA — informe');
    if (r.alumno) l.push('Alumno: ' + r.alumno);
    l.push('Práctica: ' + (r.titulo || '(sin título)'));
    l.push('Fecha: ' + new Date(r.fecha).toLocaleString('es-ES'));
    l.push('Ejercicios: ' + r.hechos + ' de ' + r.previstos + (r.completa ? '' : ' (INCOMPLETA)'));
    l.push('NOTA (primer intento): ' + r.nota10.toString().replace('.', ',') + ' sobre 10');
    l.push('Aciertos al primer intento: ' + r.aciertosPrimero + ' de ' + r.notas + ' (' + r.pctPrimero + ' %)');
    l.push('Aciertos tras corregir: ' + r.aciertosFinal + ' de ' + r.notas + ' (' + r.pctFinal + ' %)');
    l.push('Tiempo de trabajo: ' + mmss(r.segundos));
    const cont = porContenido().filter(x => x.fallos);
    if (cont.length) l.push('Más fallado: ' + cont.slice(0, 5).map(x => x.acorde + ' (' + x.fallos + '/' + x.veces + ')').join(', '));
    l.push('');
    l.push('CÓDIGO: ' + codigo(r));
    return l.join('\n');
  }

  // Fecha y hora LOCALES en formato fijo: la hora que el alumno vio en su reloj
  function fechaLocal(iso) {
    const d = new Date(iso), z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
  }

  // Una línea con lo esencial, separada por ; para pegarla en una hoja de cálculo
  function codigo(r) {
    r = r || resumen();
    if (!r) return '';
    return [
      (r.alumno || '').replace(/[;\n]/g, ' '),
      (r.titulo || '').replace(/[;\n]/g, ' '),
      fechaLocal(r.fecha),
      r.hechos, r.previstos, r.completa ? 'si' : 'no',
      String(r.nota10).replace('.', ','), String(r.nota10Final).replace('.', ','),
      r.notas, r.aciertosPrimero, r.pctPrimero, r.aciertosFinal, r.pctFinal,
      r.reintentos, r.segundos
    ].join(';');
  }

  // Detalle nota a nota, para el análisis fino
  function detalleCSV() {
    if (!p) return '';
    const cab = 'ejercicio;leccion;modo;tonalidad;nota;gradoBajo;acorde;funcion;papel;contenido;bien;falla';
    return [cab].concat(p.notas.map(x => [x.ej, x.leccion, x.modo, x.tonalidad, x.nota, x.gradoBajo, x.acorde, x.funcion, x.papel, x.contenido, x.bien, x.falla].join(';'))).join('\n');
  }

  /* ---------- Copia de seguridad en el navegador ----------
     Si el alumno cierra la pestaña antes de enviar, la práctica no se pierde: al
     volver, la aplicación puede ofrecerle enviarla. */
  /* Al guardar hay que consolidar el reloj: mientras corre, el tiempo vivido está en
     `desde` (una marca de hora de ESTA sesión), no en `ms`. Si se guardara tal cual, al
     reanudar en otra sesión esa marca no valdría nada y el tiempo trabajado se perdería. */
  function instantanea() {
    if (!p) return null;
    const r = p.reloj;
    const ms = r ? r.ms + (r.desde !== null ? Date.now() - r.desde : 0) : 0;
    return Object.assign({}, p, { reloj: { ms, desde: null } });
  }
  function guardar() {
    try { const s = instantanea(); if (s) localStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ }
  }
  function recuperar() {
    try { const t = localStorage.getItem(CLAVE); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }

  /* Retoma una práctica guardada (el alumno cerró la pestaña a media ficha).
     Dos cuidados: el reloj guardado trae un «desde» de otra sesión, que hay que
     descartar para no contar como trabajo el rato que estuvo cerrada; y el detalle
     del ejercicio que quedó a medias se tira, porque ese ejercicio se repite entero
     y si no se contaría dos veces. */
  function restaurar(guardada) {
    if (!guardada || !guardada.ejercicios) return null;
    p = guardada;
    p.reloj = { ms: (p.reloj && p.reloj.ms) || 0, desde: document.hidden ? null : Date.now() };
    const hechos = p.ejercicios.length;
    p.notas = (p.notas || []).filter(x => x.ej <= hechos);
    ej = null; reloj = null;
    guardar();
    return p;
  }
  function olvidar() { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } }

  return { iniciarPractica, iniciarEjercicio, cerrarEjercicio, anotarCorreccion, fijarAlumno,
    resumen, porContenido, contenidosCompactos, porContenidoCurso, contenidosCurso, informeTexto, detalleCSV, codigo, recuperar, restaurar, olvidar, mmss, fechaLocal };
})();
