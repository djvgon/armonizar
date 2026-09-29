/* =====================================================================
   configurador.js — Lógica de la página del profesor (configurar.html).

   Flujo:
     1. El bajo entra por texto (Teoria.bajoDesdeTexto) o por archivo
        (MusicXML.importar → fragmentos; o un .json de esta aplicación).
     2. Se eligen tonalidad, compás, título, repertorio y opciones.
     3. «Analizar» pide al motor (Reglas.proponer) las cifras de cada nota
        y las vuelca en una tabla editable: cifras admisibles y modelo.
     4. «Generar dirección» construye el ejercicio, lo valida y lo codifica
        en la URL de index.html (#e=…). También se puede descargar como
        .json o generar de golpe las direcciones de todos los fragmentos
        de un archivo importado.

   El borrador (texto, opciones y respuestas revisadas) se guarda en
   localStorage para no perderlo al recargar.
   ===================================================================== */

(() => {

  const $ = sel => document.querySelector(sel);
  const CLAVE_BORRADOR = 'armonizar.configurador.borrador';
  const ORDEN_CIFRAS = ['53', '6', '64', '65', '43', '42', '7', '9', '7+', '+6', '65d', '+4'];
  // Acordes por función tonal para la armonización de soprano (cuadro verde de Diego).
  // Los marcados por defecto son el repertorio de tercero; VI, V/V y 6/4 cadencial se activan a mano.
  const CATALOGO_ACORDES = [
    { fun: 'T', id: 'I|53', rom: 'I', defecto: true },
    { fun: 'T', id: 'I|6', rom: 'I', defecto: true },
    { fun: 'T', id: 'VI|53', rom: 'VI', nota: 'también S ante la dominante', defecto: false },
    { fun: 'S', id: 'IV|53', rom: 'IV', defecto: true },
    { fun: 'S', id: 'IV|6', rom: 'IV', defecto: true },
    { fun: 'S', id: 'IV|7', rom: 'IV', nota: 'IV7 en estado fundamental', defecto: false },
    { fun: 'S', id: 'IV|65', rom: 'IV', nota: 'IV7, primera inversión (sobre el 6.º grado)', defecto: false },
    { fun: 'S', id: 'IV|43', rom: 'IV', nota: 'IV7, segunda inversión (sobre la tónica)', defecto: false },
    { fun: 'S', id: 'IV|42', rom: 'IV', nota: 'IV7, tercera inversión (sobre el 3.er grado)', defecto: false },
    { fun: 'S', id: 'II|53', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|6', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|7', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|65', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|43', rom: 'II', nota: 'sobre el 6.º grado', defecto: true },
    { fun: 'S', id: 'II|42', rom: 'II', nota: 'séptima preparada en el bajo, que baja de grado', defecto: true },
    { fun: 'S', id: 'II|65d', rom: 'II', nota: 'V/V sobre el 4.º grado elevado (do♯ en Sol M)', defecto: false },
    { fun: 'S', id: 'II|7+', rom: 'II', nota: 'V/V en estado fundamental', defecto: false },
    { fun: 'S', id: 'II|+6', rom: 'II', nota: 'V/V en segunda inversión (sobre el 6.º grado)', defecto: false },
    { fun: 'S', id: 'II|+4', rom: 'II', nota: 'V/V en tercera inversión (sobre la tónica)', defecto: false },
    { fun: 'D', id: 'V|53', rom: 'V', defecto: true },
    { fun: 'D', id: 'V|7+', rom: 'V', defecto: true },
    { fun: 'D', id: 'V|6', rom: 'V', defecto: true },
    { fun: 'D', id: 'V|65d', rom: 'V', defecto: true },
    { fun: 'D', id: 'V|+6', rom: 'V', defecto: true },
    { fun: 'D', id: 'V|+4', rom: 'V', defecto: true },
    { fun: 'D', id: 'VII|6', rom: 'VII', defecto: true },
    { fun: 'D', id: 'I|64', rom: 'I', nota: '6/4 cadencial', defecto: false }
  ];
  const TONICAS = [['C', 'do'], ['C#', 'do♯'], ['Db', 're♭'], ['D', 're'], ['Eb', 'mi♭'], ['E', 'mi'], ['F', 'fa'], ['F#', 'fa♯'], ['Gb', 'sol♭'], ['G', 'sol'], ['Ab', 'la♭'], ['A', 'la'], ['Bb', 'si♭'], ['B', 'si']];

  const estado = {
    publicado: null,         // firma del banco.json publicado, para saber qué está sin subir (decisión 78)
    publicadoFallo: false,   // se ha intentado leerlo y no ha podido: el semáforo lo dice (decisión 85)
    compases: [],            // bajo actual (compases → notas [nombre, dur])
    respuestas: null,        // respuestas revisadas (lista de ids por nota) o null
    propuesta: null,         // salida del motor para la tabla
    fragmentos: null,        // fragmentos del último MusicXML importado (cada uno con sus dos voces)
    fragmentoActual: null,   // índice del fragmento cargado
    companera: null,         // por nota: la nota de la OTRA voz que suena a la vez (si el archivo traía las dos)
    ejercicio: null,         // último ejercicio generado
    modulaciones: [],        // [{nota, tonalidad}]: desde la nota (pivote) rige la tonalidad nueva
    melodica: [],            // notas con el 6.º grado elevado (menor melódica ascendente, decisión 179)
    funciones: null,         // función tonal por nota ('T' | 'S' | 'D') fijada en la revisión, o null (las del modelo)
    banco: null              // {entrada, voz}: el fragmento del banco que se está revisando
  };
  const esSoprano = () => modoElegido() === 'soprano';

  /* ---------- Lectura del formulario ---------- */

  function tonalidad() { return { tonica: $('#tonica').value, modo: $('#modo').value }; }
  function compas() { return $('#compas').value.split('/').map(Number); }
  // Cifras del ejercicio: las marcadas o, en la armonización de soprano, las de los acordes marcados
  function repertorio() {
    if (esSoprano()) {
      const cifras = new Set(acordesElegidos().map(id => Ejercicios.cifraDe(id)));
      return ORDEN_CIFRAS.filter(id => cifras.has(id));
    }
    return [...document.querySelectorAll('#repertorio-opciones input:checked')].map(i => i.value);
  }
  function acordesElegidos() { return [...document.querySelectorAll('#acordes-lista input:checked')].map(i => i.value); }
  function marcarAcordes(lista) {
    document.querySelectorAll('#acordes-lista input').forEach(i => { i.checked = lista.includes(i.value); });
    contarAcordes();
  }
  // Con el panel plegado hay que poder ver de un vistazo cuántos acordes lleva la lección
  function contarAcordes() {
    const e = $('#acordes-cuenta'); if (!e) return;
    const n = acordesElegidos().length;
    e.textContent = n ? '· ' + n + (n === 1 ? ' marcado' : ' marcados') : '· ninguno marcado';
  }
  const modoElegido = () => (document.querySelector('input[name="modo-ej"]:checked') || {}).value || 'armonizar';
  const elegirModo = m => { const r = document.querySelector('input[name="modo-ej"][value="' + m + '"]'); if (r) r.checked = true; };

  /* Las opciones que ve el alumno son UNAS, no dos juegos (decisión 66). Antes había
     un juego en el paso 3 y otro en la ficha, y cuatro de los del paso 3 se colaban
     en la ficha sin que se viera. Ahora todas viven en la zona A y de ahí las leen
     tanto la ficha como la vista previa y el enlace de un fragmento suelto. */
  function opciones() {
    const pref = $('#ficha-preferir').value;
    const fun = $('#ficha-funciones').value;
    return { pedirRomano: $('#pedir-romano').checked, reintentos: $('#reintentos').checked,
      ayudaGrados: $('#ficha-ayuda-grados').value,
      modo: modoElegido(), preferir: pref ? [pref] : [], tonalidades: $('#ficha-tonalidades').value,
      bajoAudicion: $('#bajo-audicion').value === 'bajo',
      gradosBajo: $('#grados-bajo').value,          // 'dado' | 'oculto' (decisiones 91 y 113)
      gradosPrimero: $('#grados-primero').checked,
      funciones: fun === 'dadas' || fun === 'pedir' ? fun : null };
  }
  // Campos y rótulos que dependen del tipo de ejercicio: la opción «qué ve el alumno en
  // Audición» y, en la melodía de soprano, los textos del paso 1 (la voz dada es la melodía)
  function ajustarCampoAudicion() {
    const sel = $('#ficha-modo');
    $('#campo-bajo-audicion').hidden = (sel && sel.value ? sel.value : modoElegido()) !== 'audicion';
    const sop = esSoprano();
    $('#titulo-voz').textContent = 'El fragmento en curso · ' + (sop ? 'la melodía' : 'el bajo');
    $('#etiqueta-voz').textContent = sop ? 'Escribe la melodía (soprano)' : 'Escribe el bajo';
    $('#texto-bajo').placeholder = sop ? 'mi4 fa4n mi4n | re4 si3 | do4r' : 'do3 re3 | mi3 do3 | sol3r | do3r';
    $('#ayuda-octava-soprano').hidden = !sop;
    $('#btn-analizar').textContent = sop ? 'Analizar la melodía' : 'Analizar el bajo';
    $('#th-admisibles').textContent = sop ? 'Acordes admisibles (● modelo)' : 'Cifrados admisibles (● modelo)';
    pintarColumnaOtraVoz();
    $('#repertorio-opciones').hidden = sop; $('#ayuda-repertorio').hidden = sop;
    // El panel de acordes está siempre (plegado); en la soprano se abre solo, porque allí
    // no hay otra manera de decidir el repertorio.
    if (sop) $('#acordes-plegable').open = true;
    $('#pedir-romano').closest('label').hidden = sop;   // en la soprano el grado siempre se pide: de él sale el bajo
    document.querySelectorAll('#tabla-revision .col-fun').forEach(e => { e.hidden = !opciones().funciones; });
  }

  /* Un fragmento importado puede traer las dos voces: se toma la que pide el tipo de
     ejercicio, y la otra sirve para fijar la respuesta modelo (el bajo escrito en una
     armonización de soprano; la nota de la melodía, en un bajo dado). */
  function vozDe(f) {
    const sop = f.compasesSoprano || [], baj = f.compasesBajo || [];
    const propia = esSoprano() ? sop : baj;
    const otra = esSoprano() ? baj : sop;
    const modP = (esSoprano() ? f.modulacionesSoprano : f.modulacionesBajo) || f.modulaciones || [];
    const modO = (esSoprano() ? f.modulacionesBajo : f.modulacionesSoprano) || f.modulaciones || [];
    // Si el fragmento no trae la voz que pide el tipo de ejercicio, se usa la que tenga
    if (propia.length) return { compases: propia, otra, modulaciones: modP };
    return { compases: otra.length ? otra : (f.compases || []), otra: [], modulaciones: otra.length ? modO : modP };
  }
  // Por cada nota de la voz propia, la nota de la otra voz que suena en ese momento
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
  /* Con las dos voces escritas, la respuesta modelo de cada nota es el acorde que encaja con
     la otra voz: en una melodía, el que pone en el bajo la nota escrita; en un bajo dado, el
     que contiene la nota de la melodía. Solo reordena: no añade ni quita acordes admisibles. */
  function preferirCompanera(ej) {
    const comp = estado.companera;
    if (!comp || !estado.respuestas) return;
    const tons = Teoria.tonalidadesPorNota(ej);
    const notas = Teoria.notasDeCompases(estado.compases);
    const clase = n => Teoria.clase(Teoria.nota(n));
    estado.respuestas = estado.respuestas.map((adm, i) => {
      if (!adm.length || !comp[i] || !notas[i]) return adm;
      let bueno = null;
      try {
        bueno = adm.find(id => {
          if (esSoprano()) {
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

  // Modulaciones válidas para un bajo de n notas (sin la nota 1 ni fuera de rango), ordenadas
  function modulacionesValidas(n) {
    return estado.modulaciones.filter(m => m.nota >= 0 && m.nota < n).slice().sort((a, b) => a.nota - b.nota);   // la 0 también (183)
  }
  function ajustarCampoModulacion() { /* la fila «Tonalidad» se elige siempre: module o no (decisión 56) */ }

  // Compases cuya suma de duraciones no coincide con el compás indicado (aviso, no error:
  // puede haber anacrusa o compás final incompleto).
  function compasesIrregulares(compases) {
    const [num, den] = compas();
    const esperado = num * 4 / den;
    const malos = [];
    compases.forEach((c, i) => { const suma = c.reduce((s, [, d]) => s + d, 0); if (Math.abs(suma - esperado) > 1e-6) malos.push(i + 1); });
    return malos;
  }

  function leerBajo() {
    const r = Teoria.bajoDesdeTexto($('#texto-bajo').value, esSoprano() ? 4 : 3);
    const err = $('#errores-bajo');
    const mensajes = r.errores.slice();
    if (!r.errores.length && r.compases.length) {
      const malos = compasesIrregulares(r.compases);
      if (malos.length) mensajes.push('Aviso: en ' + $('#compas').value + ' no cuadran las duraciones de ' + (malos.length === 1 ? 'el compás ' : 'los compases ') + malos.join(', ') + ' (se admite igualmente).');
    }
    if (mensajes.length) { err.textContent = mensajes.join(' · '); err.hidden = false; }
    else err.hidden = true;
    estado.compases = r.compases;
    return r;
  }

  // Ejercicio tal como se enviaría, con las respuestas revisadas o, si no las hay, las del motor.
  function construirEjercicio(compases, ton, resp, extra = {}) {
    const op = opciones();
    const ej = {
      id: extra.id || ('url-' + Date.now().toString(36)),
      coleccion: extra.coleccion !== undefined ? extra.coleccion : $('#coleccion').value.trim(),
      titulo: extra.titulo !== undefined ? extra.titulo : ($('#titulo').value.trim() || 'Ejercicio'),
      tonalidad: ton,
      compas: extra.compas || compas(),
      repertorio: repertorio(),
      compases,
      respuestas: resp
    };
    if (op.preferir.length) ej.preferir = op.preferir;
    if (!op.pedirRomano) ej.pedirRomano = false;
    if (!op.reintentos) ej.reintentos = false;
    if (op.ayudaGrados !== 'lista') ej.ayudaGrados = op.ayudaGrados;
    if (op.gradosBajo === 'oculto') ej.gradosBajo = 'oculto';
    if (op.modo !== 'armonizar') ej.modo = op.modo;
    if (op.modo === 'audicion' && op.bajoAudicion) ej.mostrarBajo = true;
    if (op.modo === 'soprano') {
      ej.acordes = acordesElegidos();
      if (!$('#formula-tst').checked) ej.formulaTST = false;
    }
    if (op.funciones) {
      ej.funciones = op.funciones;
      if (extra.funcionesNotas !== undefined) { if (extra.funcionesNotas) ej.funcionesNotas = extra.funcionesNotas; }
      else if (Array.isArray(estado.funciones) && estado.funciones.length === Ejercicios.numNotas({ compases })) ej.funcionesNotas = estado.funciones.slice();
    }
    // La fila «Tonalidad» se elige module o no el fragmento (decisión 56)
    if (op.tonalidades) ej.tonalidades = op.tonalidades;
    const mods = extra.modulaciones !== undefined ? extra.modulaciones : modulacionesValidas(Ejercicios.numNotas({ compases }));
    if (mods.length) ej.modulaciones = mods.map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } }));
    if (estado.melodica && estado.melodica.length) ej.melodica = estado.melodica.slice();   // 6.º elevado (179)
    return ej;
  }

  /* ---------- Análisis con el motor ---------- */

  // Motor según el tipo: bajo dado (RO) o melodía de soprano (acordes que contienen la nota,
  // en sucesión válida; con las funciones fijadas por el profesor, si las hay)
  function proponerPara(ej, funcionesFijadas) {
    return Ejercicios.esSoprano(ej) ? Reglas.proponerSoprano(ej, { funciones: funcionesFijadas || null }) : Reglas.proponer(ej);
  }
  // Funciones que se deducen de los acordes modelo (para rellenar la columna «Función»)
  function funcionesDeModelo(ej) { return ej.respuestas.map((_, i) => Ejercicios.funcionModelo(ej, i)); }

  /* conservarFunciones: mantiene las funciones fijadas (al cambiar una en la tabla).
     reajustar: además, si con esas funciones alguna nota se queda sin ningún acorde posible
     (por ejemplo al reducir el repertorio), se vuelven a deducir del modelo, para no dejar
     el ejercicio bloqueado por una función que ya no puede cumplirse. */
  function analizar(conservarFunciones = false, reajustar = false) {
    /* EL SELLO (decisión 166). Un fragmento cerrado no se reanaliza ni aunque se pulse el
       botón: primero hay que reabrirlo, y eso es un gesto consciente del profesor. */
    if (estado.banco && Banco.estaCerrada(estado.banco.entrada)) {
      aviso('El fragmento ' + (estado.banco.entrada.id || '') + ' está cerrado: lo firmaste el '
        + estado.banco.entrada.cerrado + ' y el motor no lo toca. Si de verdad quieres rehacerlo, pulsa «Reabrir para cambiarlo».', 10000);
      return;
    }
    const r = leerBajo();
    if (r.errores.length || !r.compases.length) { aviso('Corrige ' + (esSoprano() ? 'la melodía' : 'el bajo') + ' antes de analizar.'); return; }
    const rep = repertorio();
    if (!rep.length) { aviso('Marca al menos un cifrado interválico en el repertorio.'); return; }
    // Con las funciones «dadas», los acordes admisibles de la melodía se limitan a los de la
    // función que ve el alumno (análisis con las funciones fijadas); con «pedirlas» no se limitan
    // (se acepta cualquier función de un acorde admisible).
    const forzar = esSoprano() && opciones().funciones === 'dadas';
    if (!conservarFunciones || !Array.isArray(estado.funciones)) estado.funciones = null;
    const ej = construirEjercicio(r.compases, tonalidad(), null, { funcionesNotas: null });
    const aplicar = prop => {
      estado.propuesta = prop;
      ej.respuestas = prop.map(p => p.admisibles.slice());
      estado.respuestas = ej.respuestas.map((_, i) => Ejercicios.admisibles(ej, i));
    };
    aplicar(proponerPara(ej, forzar && estado.funciones ? estado.funciones : null));
    preferirCompanera(ej);
    if (!Array.isArray(estado.funciones) || estado.funciones.length !== estado.respuestas.length) {
      estado.funciones = funcionesDeModelo(ej);
      if (forzar) { aplicar(proponerPara(ej, estado.funciones)); preferirCompanera(ej); }
    } else if (forzar && reajustar && estado.respuestas.some(a => !a.length)) {
      aplicar(proponerPara(ej, null));                 // con las funciones fijadas no hay salida: se deducen otra vez
      preferirCompanera(ej);
      estado.funciones = funcionesDeModelo(ej);
      aplicar(proponerPara(ej, estado.funciones));
      preferirCompanera(ej);
      aviso('Con las funciones anteriores algún acorde se quedaba sin opciones: se han recalculado.');
    }
    pintarRevision();
    $('#paso-revision').hidden = false;
    $('#paso-direccion').hidden = false;
    $('#todos-fragmentos').hidden = !(estado.fragmentos && estado.fragmentos.length > 1);
    guardarBorrador();
    $('#paso-revision').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pintarRevision() {
    prepararOtraVoz();                 // qué admite la otra voz del fragmento (decisión 174)
    const rep = repertorio();
    const notas = Teoria.notasDeCompases(estado.compases);      // los silencios no llevan fila
    const ejTon = { tonalidad: tonalidad(), compases: estado.compases, modulaciones: modulacionesValidas(notas.length), melodica: estado.melodica };
    const tons = Teoria.tonalidadesPorNota(ejTon);
    // Las mismas tonalidades SIN el 6.º elevado: hacen falta para poder desmarcarlo (179)
    const tonsBase = Teoria.tonalidadesPorNota(Object.assign({}, ejTon, { melodica: [] }));
    const pivotes = new Set(ejTon.modulaciones.map(m => m.nota));
    const tbody = $('#tabla-revision tbody');
    tbody.innerHTML = '';
    const sinPropuesta = [];
    const fueraDeLeccion = [];    // marcadas que la lista de acordes de la lección no admite (decisión 101)
    estado.resumen = [];          // lo que enseña el globo al pasar el ratón por un acorde
    const sop = esSoprano();
    const conFun = !!opciones().funciones;
    const ejFun = construirEjercicio(estado.compases, tonalidad(), estado.respuestas, { funcionesNotas: null });
    if (!Array.isArray(estado.funciones) || estado.funciones.length !== notas.length) estado.funciones = funcionesDeModelo(ejFun);
    notas.forEach((n, i) => {
      const adm = estado.respuestas[i] || [];
      const prop = estado.propuesta ? estado.propuesta[i] : null;
      if (!adm.length) sinPropuesta.push(i + 1);
      const ton = tons[i];
      const tonAntes = i > 0 ? tons[i - 1] : tonalidad();     // en la nota 0, la tonalidad del fragmento (183)
      const esPivote = pivotes.has(i);
      const elevada = (estado.melodica || []).indexOf(i) >= 0;     // 6.º grado elevado (179)
      const tr = document.createElement('tr');
      tr.id = 'fila-' + (i + 1);
      if (!adm.length) tr.className = 'sin-propuesta';
      if (esPivote) tr.classList.add('pivote');
      const gradoBajo = Teoria.grado(n, ton);
      const gradoTxt = g => g.grado + (g.alt > 0 ? '♯' : g.alt < 0 ? '♭' : '');
      tr.innerHTML = '<td class="num-fila">' + (i + 1) + '</td><td>' + Teoria.nombreEs(Teoria.nota(n), true) + '</td>'
        + '<td class="celda-ton"></td>'
        + '<td>' + (esPivote ? gradoTxt(Teoria.grado(n, tonAntes)) + ' = ' + gradoTxt(gradoBajo) : gradoTxt(gradoBajo)) + '</td>'
        + '<td class="col-fun celda-fun"></td>'
        + '<td class="chips"></td>'
        + '<td class="otra-voz">' + textoOtraVoz(i) + '</td>'
        + '<td class="explicacion">' + (prop ? '<b>' + prop.regla + '</b> · ' + prop.explicacion : '') + '</td>';
      // Columna «Función»: T · S · D; cambiarla toca SOLO esa nota, nunca el resto (decisión 178)
      const cf = tr.querySelector('.celda-fun');
      cf.hidden = !conFun;
      {
        const sel = document.createElement('select');
        sel.className = 'sel-fun';
        sel.title = 'Función tonal de este acorde (la ve el alumno si las funciones se dan; se corrige si se piden)';
        Teoria.TODAS_FUNCIONES.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = Teoria.textoFuncion(f) + ' · ' + Teoria.NOMBRE_FUNCION[f]; if (estado.funciones[i] === f) o.selected = true; sel.appendChild(o); });
        sel.addEventListener('change', () => {
          limpiarDireccion();
          estado.funciones[i] = sel.value;
          /* CAMBIAR LA FUNCIÓN TOCA SOLO ESA NOTA (decisión 178, Diego 29/9/2026: «si cambio
             la función de un acorde, después de haber introducido varios acordes o modificado
             las asignaciones, no quiero que elimines las que he introducido… me haces perder
             todo el trabajo hecho»). En la melodía esto llamaba a `analizar(true)`, que rehace
             el fragmento ENTERO con el motor y, por tanto, sustituye todo lo asignado a mano:
             era el tercer camino silencioso de los que cerró la 163, y se había quedado
             abierto. Ahora las dos voces se comportan igual que el bajo desde la 82: se
             marcan los acordes de esa función que caben en ESA nota y no se toca ninguna
             otra. Y lo que él ya tuviera marcado de esa función se conserva, y se conserva
             DELANTE, así que su modelo sigue siendo el modelo. Si no cabe ninguno, no se
             toca nada: más vale dejarlo como estaba que vaciar la nota. */
          try {
            const cand = sop
              ? Reglas.candidatosSoprano(n, ton, rep, i === notas.length - 1, acordesElegidos())
                .filter(c => (c.funciones || []).indexOf(sel.value) >= 0)
                .sort((a, b) => a.coste - b.coste).map(c => c.id)
              : Reglas.candidatosFuncion(Teoria.nota(n), ton, rep, acordesElegidos(), sel.value, null, null, null);
            if (cand.length) {
              const mios = (estado.respuestas[i] || []).filter(id => cand.indexOf(id) >= 0);
              estado.respuestas[i] = mios.concat(cand.filter(id => mios.indexOf(id) < 0));
              guardarBorrador();
              pintarRevision();
              const nombra = id => (sop ? Teoria.gradoEscrito(Ejercicios.par(id).romano, Ejercicios.par(id).cifra)
                : Teoria.romanoEscrito(id, n, ton));
              aviso('Nota ' + (i + 1) + ': marcados los acordes de función ' + sel.value + ' que caben en '
                + Teoria.nombreEs(Teoria.nota(n)) + ' — ' + estado.respuestas[i].map(nombra).join(', ')
                + '. Solo cambia esta nota; el resto queda como lo tenías.'
                + (mios.length ? ' Tu modelo se conserva.' : ' La modelo es la primera; cámbiala si quieres otra.'), 9000);
              return;
            }
            aviso('Nota ' + (i + 1) + ': ningún acorde del repertorio de la lección con función '
              + sel.value + ' cabe en ' + Teoria.nombreEs(Teoria.nota(n)) + '. Se dejan los acordes como estaban.', 8000);
          } catch (e) { /* si algo falla, se deja como estaba */ }
          guardarBorrador(); pintarVistaPrevia();
        });
        cf.appendChild(sel);
      }
      /* Columna «Tonalidad»: la que rige, y un desplegable para empezar aquí una tonalidad
         vecina. TAMBIÉN EN LA PRIMERA NOTA (decisión 183): el primer acorde suele ser la
         tónica, en estado fundamental o invertida, pero no tiene por qué —puede ser ya el
         pivote de una inflexión a otro tono—. La tonalidad de partida no se pierde: es la
         del fragmento, la de la armadura, y es el «antes» del pivote. */
      const ct = tr.querySelector('.celda-ton');
      {
        const sel = document.createElement('select');
        sel.className = 'sel-ton' + (esPivote ? ' pivote' : '');
        sel.title = esPivote
          ? 'Tonalidad nueva desde esta nota (pivote). Elige «(quitar)» para deshacer la modulación.'
          : (i === 0
            ? 'El fragmento está en ' + Teoria.nombreCorto(tonAntes) + '. Si el primer acorde ya es el pivote de una inflexión a otro tono, elígelo aquí.'
            : 'Rige ' + Teoria.nombreCorto(tonAntes) + '. Despliega y elige una tonalidad vecina para que la modulación empiece en esta nota (acorde pivote).');
        /* En la primera nota hecha pivote, el tono de PARTIDA no se ve en ninguna otra fila
           —no hay fila anterior—, así que se escribe aquí delante (decisión 184). */
        if (i === 0 && esPivote) {
          const de = document.createElement('span');
          de.className = 'ton-partida';
          de.textContent = Teoria.nombreCorto(tonAntes);
          de.title = 'El fragmento empieza en ' + Teoria.nombreCorto(tonAntes)
            + ', y este primer acorde es a la vez el pivote hacia ' + Teoria.nombreCorto(ton)
            + '. La tonalidad de partida se cambia arriba, en «Tónica» y «Modo».';
          ct.appendChild(de);
        }
        /* La primera opción de un pivote decía «(quitar)» a secas y no se entendía a qué
           tono se volvía (decisión 187, Diego 29/9/2026: «no permite modular a Do Mayor»).
           Ahora lo dice. */
        const o0 = document.createElement('option'); o0.value = '';
        o0.textContent = esPivote ? '(quitar) · sigue en ' + Teoria.nombreCorto(tonAntes) : Teoria.nombreCorto(tonAntes);
        sel.appendChild(o0);
        /* VOLVER SIEMPRE ES POSIBLE (decisión 187). La lista eran solo las cinco tonalidades
           VECINAS del tono que rige, y con eso no siempre se puede volver: desde Re M, el
           tono del fragmento —Do M— está a dos alteraciones y no aparecía, de modo que una
           vez ida la música no había manera de traerla de vuelta. A las vecinas se añaden
           ahora el tono DEL FRAGMENTO y los que el pasaje ya ha visitado: volver a un tono
           por el que ya se ha pasado es lo más corriente de todo y no puede faltar. */
        const destinos = Teoria.tonalidadesVecinas(tonAntes).slice();
        const mete = x => {
          if (!x || !x.tonica) return;
          if (Teoria.mismaTonalidad(x, tonAntes)) return;
          if (destinos.some(y => Teoria.mismaTonalidad(y, x))) return;
          destinos.push({ tonica: x.tonica, modo: x.modo, vuelta: true });
        };
        mete(tonalidad());
        estado.modulaciones.forEach(m => { if (m && m.nota !== i) mete(m.tonalidad); });
        destinos.forEach(t => {
          const o = document.createElement('option'); o.value = t.tonica + '/' + t.modo;
          o.textContent = '→ ' + Teoria.nombreCorto(t) + (t.vuelta ? ' (vuelta)' : '');
          if (esPivote && Teoria.mismaTonalidad(t, ton)) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', () => { fijarModulacion(i, sel.value); });
        ct.appendChild(sel);
      }
      /* EL 6.º GRADO ELEVADO, POR NOTA (decisión 179). Solo aparece donde de verdad cambia
         algo: tono menor y un acorde marcado que toque el 6.º grado —el IV, que pasa a
         mayor; el II, que pasa a menor; el VI—. No lo decide el motor: lo marca Diego. */
      if (sextaCambia(i, n, tonsBase[i], sop, adm)) {
        const lab = document.createElement('label');
        lab.className = 'sexta-elevada' + (elevada ? ' puesta' : '');
        lab.title = 'El 6.º grado elevado (menor melódica ascendente): el IV pasa a ser mayor y el II, menor. '
          + 'Márcalo donde la línea suba 6 – ♯7 – 8, como en ' + Teoria.nombreCorto(tonsBase[i]) + '.';
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = elevada;
        cb.addEventListener('change', () => { marcarSexta(i, cb.checked); });
        const tx = document.createElement('span'); tx.textContent = '6.º ♮';
        lab.appendChild(cb); lab.appendChild(tx);
        ct.appendChild(lab);
      }
      const celda = tr.querySelector('.chips');
      // Opciones de la nota: en el bajo dado, las cifras del repertorio; en la melodía de soprano,
      // los acordes (fundamental + cifra) que contienen la nota, según el motor (o los marcados, si no hay análisis)
      /* ¿Admite la lista de acordes de la lección esta opción? (decisión 101). Desde que la
         lista corrige, una opción que no esté en ella dejará de darse por buena, así que
         aquí se señala en la ficha, en el globo y en el aviso de debajo de la tabla. */
      const listaAcordes = acordesElegidos();
      const loAdmiteLaLeccion = id => {
        if (!listaAcordes.length) return true;
        if (String(id).indexOf('|') >= 0) return listaAcordes.indexOf(id) >= 0;
        try {
          return Reglas.acordePermitido(id, n, ton, listaAcordes)
            || Reglas.acordePermitido(id, n, tonAntes, listaAcordes);
        } catch (e) { return true; }
      };
      let opcionesNota;
      if (sop) {
        const ids = adm.slice();                                   // primero las admisibles (la modelo delante), luego el resto de acordes con la nota
        if (prop && prop.candidatos) prop.candidatos.forEach(x => { if (!ids.includes(x.id)) ids.push(x.id); });
        /* SIN ANÁLISIS RECIENTE, LOS ACORDES QUE CONTIENEN LA NOTA (decisión 176, Diego
           29/9/2026: «¿cómo hago para que aparezcan como opciones para el acorde 4 el
           V7?»). Al traer un fragmento del banco no hay `propuesta` —se cargan sus
           respuestas tal cual, que es lo que se quiere—, y entonces en la melodía solo se
           veían los acordes YA marcados: se podían quitar, pero no añadir ninguno. En el
           bajo nunca pasó, porque allí se pintan siempre todas las cifras del repertorio.
           Ahora, cuando no hay análisis, se añaden sin marcar todos los acordes de la
           lección que contienen esa nota. No cambia nada de lo guardado: solo deja verlos
           para poder marcarlos. */
        /* En modo PERMISIVO (decisión 180): las reglas de duplicación no descartan acordes
           de esta lista, solo los marcan con un aviso que sale en el globo. Descartar
           escondía acordes que Diego quiere admitir —el I6 con la melodía en su tercera—, y
           esas reglas hablan de cómo se reparten las cuatro voces, no de qué acorde cabe. */
        const avisosDe = {};
        /* También cuando el análisis no da NINGUNA opción para esa nota: así ninguna fila se
           queda sin una casilla que pulsar (pasa, por ejemplo, al hacer pivote el primer
           acorde en una lección de repertorio corto). */
        if (!prop || !ids.length) {
          try {
            Reglas.candidatosSoprano(n, ton, rep, i === notas.length - 1, acordesElegidos(), false, true)
              .forEach(c => { if (!ids.includes(c.id)) ids.push(c.id); if (c.avisos && c.avisos.length) avisosDe[c.id] = c.avisos; });
          } catch (e) { /* si el repertorio no da para tanto, se queda con lo marcado */ }
        }
        opcionesNota = ids.map(id => {
          const p = Ejercicios.par(id);
          const cand = prop && prop.candidatos ? prop.candidatos.find(x => x.id === id) : null;
          const b = cand ? cand.bajo : Teoria.bajoDe(p.romano, p.cifra, ton);
          const fuera = !loAdmiteLaLeccion(id);
          const avs = (cand && cand.avisos && cand.avisos.length) ? cand.avisos : (avisosDe[id] || []);
          return { id, cifra: p.cifra, bajo: b, romTxt: Teoria.gradoEscrito(p.romano, p.cifra), extra: b ? ' (' + Teoria.nombreEs(b) + ')' : '', titulo: Teoria.CIFRADOS[p.cifra].descripcion + (b ? ' · bajo ' + Teoria.nombreEs(b) : '') + (avs.length ? ' · ' + avs.join(', ') : '') + (fuera ? ' · NO está en la lista de acordes de esta lección' : ''), aviso: !!avs.length, fuera };
        });
      } else {
        opcionesNota = rep.map(id => {
          const romTxt = esPivote ? Teoria.romanoEscrito(id, n, tonAntes) + ' = ' + Teoria.romanoEscrito(id, n, ton) : Teoria.romanoEscrito(id, n, ton);
          const noComun = esPivote && !Teoria.acordeComun(id, n, tonAntes, ton);
          const fuera = !loAdmiteLaLeccion(id);
          return { id, cifra: id, bajo: n, romTxt, extra: '', titulo: Teoria.CIFRADOS[id].descripcion + ' → ' + romTxt + (noComun ? ' (no es acorde común)' : '') + (fuera ? ' · NO está en la lista de acordes de esta lección' : ''), noComun, fuera };
        });
      }
      opcionesNota.forEach(op => {
        const id = op.id;
        const chip = document.createElement('label');
        chip.className = 'chip' + (adm.includes(id) ? ' marcada' : '') + (adm[0] === id ? ' modelo' : '') + (op.noComun ? ' no-comun' : '') + (op.aviso ? ' con-aviso' : '')
          + (op.fuera && adm.includes(id) ? ' fuera-leccion' : '');
        chip.title = op.titulo;
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = adm.includes(id);
        cb.addEventListener('change', () => { alternar(i, id, cb.checked); });
        const rb = document.createElement('input');
        rb.type = 'radio'; rb.name = 'modelo-' + i; rb.checked = adm[0] === id; rb.title = 'Hacer modelo';
        rb.addEventListener('change', () => { hacerModelo(i, id); });
        chip.appendChild(cb);
        if (sop) { const r = document.createElement('span'); r.className = 'chip-romano chip-fund'; r.textContent = op.romTxt; chip.appendChild(r); }
        chip.appendChild(Partitura.iconoCifra(op.cifra, 30, op.bajo ? { bajo: op.bajo, ton } : null));
        const rom = document.createElement('span');
        rom.className = 'chip-romano'; rom.textContent = sop ? op.extra.trim() : op.romTxt;
        chip.appendChild(rom);
        chip.appendChild(rb);
        celda.appendChild(chip);
      });
      /* Lo mismo que muestran las fichas de esta fila, guardado para el globo: así el
         globo y la tabla no pueden decir cosas distintas, porque salen del mismo sitio.
         Solo las MARCADAS, y en el orden de `adm`, que pone la modelo la primera. */
      estado.resumen[i] = {
        nota: Teoria.nombreEs(Teoria.nota(n), true),
        ton: Teoria.nombreCorto(ton), tonObj: ton,
        grado: esPivote ? gradoTxt(Teoria.grado(n, tonAntes)) + ' = ' + gradoTxt(gradoBajo) : gradoTxt(gradoBajo),
        fun: conFun ? estado.funciones[i] : null,
        opciones: adm.map(id => opcionesNota.find(op => op.id === id)).filter(Boolean)
      };
      // Marcadas que la lista de acordes de la lección NO admite: dejarán de valer al corregir
      estado.resumen[i].opciones.forEach((op, k) => {
        if (op && op.fuera) fueraDeLeccion.push({ nota: i + 1, romTxt: op.romTxt, cifra: op.cifra, modelo: k === 0 });
      });
      tbody.appendChild(tr);
    });
    document.querySelectorAll('#tabla-revision .col-fun').forEach(e => { e.hidden = !conFun; });
    ajustarCampoModulacion();
    const av = $('#avisos-revision');
    /* Dos avisos distintos. El de siempre: notas sin ninguna cifra admisible. Y el nuevo
       (decisión 101): opciones marcadas que la lista de acordes de la lección no admite y
       que, por tanto, ya no se darán por buenas. Si la que sobra es la MODELO, es más
       grave: el modelo se respeta igual (la nota no se queda sin respuesta correcta), pero
       significa que la lista de la lección está incompleta o que el modelo está mal. */
    const partes = [];
    if (sinPropuesta.length) partes.push('Notas sin ninguna cifra admisible: ' + sinPropuesta.join(', ') + '. Márcalas a mano o cambia el repertorio.');
    if (fueraDeLeccion.length) {
      const di = x => 'nota ' + x.nota + ' (' + x.romTxt + ')' + (x.modelo ? ' —¡y es la MODELO!—' : '');
      partes.push('Fuera de la lista de acordes de esta lección: ' + fueraDeLeccion.map(di).join(', ')
        + '. Al corregir ya no se dan por buenas'
        + (fueraDeLeccion.some(x => x.modelo) ? '; la modelo sí se respeta, pero conviene añadir ese acorde a la lección o cambiar el modelo.' : '. Desmárcalas, o añade el acorde a la lección si ya se ha visto.'));
    }
    if (partes.length) { av.textContent = partes.join(' · '); av.hidden = false; }
    else av.hidden = true;
    pintarColumnaOtraVoz();
    pintarVistaPrevia();
  }

  /* ---------- El 6.º grado elevado, nota a nota (decisión 179) ----------
     Diego, 29/9/2026: «cómo introduzco el si becuadro del IV mayor, porque quiero que el si
     suba al do♯ y de ahí al re». En el modo menor, la octava ascendente eleva el 6.º y el
     7.º grados, y eso convierte el IV en mayor y el II en menor. El motor sabía construirlo
     —la tonalidad con `{melodica: true}`—, pero solo lo elegía cuando la nota de la melodía
     obligaba; con la melodía en sol, que está en las dos formas, se quedaba con el si♭.

     No se marca con un acorde nuevo, y es a propósito: `IV 6` con si♭ y `IV 6` con si♮ son
     LA MISMA RESPUESTA para el alumno —fundamental IV, cifrado 6—, así que no es una opción
     de la lista sino una propiedad del pasaje. Va, pues, en la columna «Tonalidad», que es
     donde se dice qué escala rige en cada nota, y lo marca Diego, no el motor. */
  function marcarSexta(i, puesta) {
    limpiarDireccion();
    const hay = (estado.melodica || []).filter(x => x !== i);
    estado.melodica = puesta ? hay.concat([i]).sort((a, b) => a - b) : hay;
    guardarBorrador();
    pintarRevision();
  }

  /* ¿Cambia algo elevar el 6.º grado en esta nota? Se compara el acorde MARCADO en las dos
     formas de la escala: si da las mismas notas, el interruptor no pinta nada y no sale. */
  function sextaCambia(i, n, tonBase, sop, adm) {
    if (!tonBase || tonBase.modo !== 'menor' || tonBase.melodica) return false;
    if (!adm || !adm.length) return false;
    const mel = { tonica: tonBase.tonica, modo: 'menor', melodica: true };
    const clases = (id, ton) => {
      try {
        let bajo, cifra;
        if (sop) {
          const p = Ejercicios.par(id);
          const b = Teoria.bajoDe(p.romano, p.cifra, ton);
          if (!b) return null;
          bajo = { letra: b.letra, alt: b.alt, octava: 3 }; cifra = p.cifra;
        } else { bajo = Teoria.nota(n); cifra = id; }
        return [Teoria.clase(bajo), ...Teoria.vocesSuperiores(cifra, bajo, ton).map(x => Teoria.clase(x))]
          .sort((a, b) => a - b).join(',');
      } catch (e) { return null; }
    };
    return adm.some(id => { const a = clases(id, tonBase), b = clases(id, mel); return !!(a && b && a !== b); });
  }

  // Empieza (o quita) una tonalidad nueva en la nota i y vuelve a analizar con el motor.
  function fijarModulacion(i, valor) {
    limpiarDireccion();
    estado.modulaciones = estado.modulaciones.filter(m => m.nota !== i);
    if (valor) {
      const [tonica, modo] = valor.split('/');
      estado.modulaciones.push({ nota: i, tonalidad: { tonica, modo } });
    }
    // Las modulaciones posteriores parten de una tonalidad distinta: se descartan si ya no son vecinas
    const n = Ejercicios.numNotas({ compases: estado.compases });
    const ejTon = { tonalidad: tonalidad(), compases: estado.compases, modulaciones: modulacionesValidas(n), melodica: estado.melodica };
    const tons = Teoria.tonalidadesPorNota(ejTon);
    /* La vuelta al tono del fragmento no se descarta nunca (decisión 187), aunque quede a
       más de una alteración del que rige en ese momento. */
    estado.modulaciones = estado.modulaciones.filter(m => m.nota <= i
      || Teoria.mismaTonalidad(m.tonalidad, tonalidad())
      || Teoria.tonalidadesVecinas(tons[m.nota - 1]).some(t => Teoria.mismaTonalidad(t, m.tonalidad)));
    analizar();
  }

  function alternar(i, id, marcado) {
    limpiarDireccion();
    let adm = estado.respuestas[i].slice();
    if (marcado && !adm.includes(id)) adm.push(id);
    if (!marcado) adm = adm.filter(x => x !== id);
    estado.respuestas[i] = adm;
    pintarRevision();
    guardarBorrador();
  }

  function hacerModelo(i, id) {
    limpiarDireccion();
    let adm = estado.respuestas[i].slice();
    if (!adm.includes(id)) adm.push(id);
    adm = [id, ...adm.filter(x => x !== id)];
    estado.respuestas[i] = adm;
    pintarRevision();
    guardarBorrador();
  }

  /* La OTRA voz del fragmento del banco, la que no se está revisando, y si encaja nota a
     nota con esta. Encajan cuando tienen el mismo número de ataques y en los mismos
     tiempos: entonces una sola rejilla de acordes vale para las dos. Medido sobre el banco
     el 29/9/2026: de los 110 fragmentos con las dos voces, 104 comparten ritmo; los seis
     que no —A3-1-29, A3-2-11, A3-3-04, A3-5-11, A4-11-01 y A4-11-07— se dicen y se dejan
     como estaban. */
  function vocesDelBanco(ej) {
    const b = estado.banco;
    if (!b) return null;
    const e = b.entrada;
    if (!e || !e.bajo || !e.soprano) return { hayDos: false };
    const otraParte = b.voz === 'bajo' ? e.soprano : e.bajo;
    try {
      const propias = MusicXML.conTiempos(ej.compases);
      const otras = MusicXML.conTiempos(otraParte.compases);
      const alineadas = propias.length === otras.length
        && propias.every((p, i) => Math.abs(p.tiempo - otras[i].tiempo) < 0.01);
      return { hayDos: true, alineadas, notas: otras.map(o => o.nota), cuantas: otras.length, propias: propias.length,
        cual: b.voz === 'bajo' ? 'soprano' : 'bajo' };
    } catch (err) { return { hayDos: true, alineadas: false, cuantas: 0, propias: 0, cual: b.voz === 'bajo' ? 'soprano' : 'bajo' }; }
  }

  // Qué se está viendo, dicho en una línea bajo la partitura
  function pintarAvisoVoces(dos, sop) {
    const p = $('#aviso-voces');
    if (!p) return;
    if (!estado.banco) { p.hidden = true; return; }
    p.hidden = false;
    /* Qué se está viendo (decisión 177). La vista previa enseña el ejercicio que se revisa:
       su voz, y las demás las deduce el motor con los acordes asignados. La otra voz del
       fragmento es otro ejercicio y vive en su propia columna. */
    const mia = sop ? 'la melodía' : 'el bajo';
    const otra = sop ? 'el bajo' : 'la melodía';
    let t = 'Se ve <b>' + mia + '</b>, que es la voz de este ejercicio, en morado; en negro, las demás voces que escribe el motor con los acordes asignados'
      + (sop ? ' —incluido el bajo, que aquí lo deduce él—' : '') + '.';
    if (dos && dos.hayDos) {
      t += ' Este fragmento tiene también <b>' + otra + '</b>, que es <b>otro ejercicio</b> con su propia lista de acordes: la tienes en la columna «'
        + (sop ? 'El bajo admite' : 'La melodía admite') + '». No tienen por qué coincidir.';
    } else {
      t += ' Este fragmento solo tiene escrita esta voz.';
    }
    p.innerHTML = t;
  }

  /* LO QUE ADMITE LA OTRA VOZ (decisión 174, Diego 29/9/2026, sobre `A3-5-02`: «si se
     armoniza la soprano sola solo se podrá armonizar ese acorde con II6, pero si se armoniza
     el bajo solo también se podría usar el IV… ¿qué se puede hacer?»).

     La respuesta es que **ya está resuelto en los datos**: cada voz guarda su propia lista de
     admisibles, así que el bajo puede admitir el IV y la soprano no. Lo que faltaba era
     VERLO: el configurador enseña solo la lista de la voz que se está revisando —la del tipo
     de ejercicio elegido arriba— y por eso parecía que había una sola. Esta columna pone al
     lado, en gris y solo de lectura, lo que admite la otra voz en esa misma nota. */
  function textoOtraVoz(i) {
    const dos = estado.otraVoz;
    if (!dos || !dos.respuestas || !dos.respuestas[i]) return '';
    const adm = dos.respuestas[i];
    if (!adm.length) return '<span class="otra-nada">—</span>';
    // El grado y, detrás, su cifrado: sin él, «II 5/3» y «II 6» salían los dos como «II»
    const conCifra = (rom, cifra) => rom + (cifra === '53' || !Teoria.CIFRADOS[cifra] ? ''
      : '<span class="otra-cifra">' + Teoria.CIFRADOS[cifra].etiqueta + '</span>');
    const pinta = (id, k) => {
      let txt = id;
      try {
        if (dos.esSoprano) { const p = Ejercicios.par(id); txt = conCifra(Teoria.gradoEscrito(p.romano, p.cifra), p.cifra); }
        else txt = conCifra(Teoria.romanoEscrito(id, dos.notas[i], dos.tonalidades[i] || tonalidad()), id);
      } catch (e) { txt = id; }
      return '<span class="otra-chip' + (k === 0 ? ' otra-modelo' : '') + '">' + txt + '</span>';
    };
    return adm.map(pinta).join(' ');
  }

  // La columna de la otra voz solo tiene sentido cuando el fragmento trae las dos (decisión 174)
  function pintarColumnaOtraVoz() {
    const th = $('#th-otra-voz');
    if (!th) return;
    const hay = !!estado.otraVoz;
    th.hidden = !hay;
    th.textContent = hay ? (estado.otraVoz.esSoprano ? 'La melodía admite' : 'El bajo admite') : 'La otra voz';
    document.querySelectorAll('#tabla-revision .otra-voz').forEach(c => { c.hidden = !hay; });
  }

  /* Prepara esa lista una sola vez por repintado: la otra voz del fragmento del banco,
     cuando existe y comparte ritmo con la que se revisa (si no, las notas no se
     corresponden una a una y comparar no significaría nada). */
  function prepararOtraVoz() {
    estado.otraVoz = null;
    const b = estado.banco;
    if (!b || !b.entrada) return;
    const e = b.entrada;
    if (!e.bajo || !e.soprano) return;
    const otra = b.voz === 'bajo' ? e.soprano : e.bajo;
    try {
      const propias = MusicXML.conTiempos(estado.compases);
      const otras = MusicXML.conTiempos(otra.compases);
      if (propias.length !== otras.length
        || !propias.every((p, k) => Math.abs(p.tiempo - otras[k].tiempo) < 0.01)) return;
      const esSoprano = b.voz === 'bajo';          // la OTRA voz es la soprano
      const notas = Teoria.notasDeCompases(otra.compases);
      let tons = [];
      try {
        tons = Teoria.tonalidadesPorNota({ compases: otra.compases, tonalidad: tonalidad(), modulaciones: otra.modulaciones || [] });
      } catch (err) { tons = []; }
      estado.otraVoz = { esSoprano, respuestas: otra.respuestas || [], notas, tonalidades: tons,
        nombre: esSoprano ? 'la melodía' : 'el bajo' };
    } catch (err) { estado.otraVoz = null; }
  }

  function pintarVistaPrevia() {
    const ej = construirEjercicio(estado.compases, tonalidad(), estado.respuestas);
    const n = Ejercicios.numNotas(ej);
    const ver = $('#ver-solucion').checked;
    const notas = Teoria.notasDeCompases(ej.compases);
    const sop = Ejercicios.esSoprano(ej);
    const modelos = ej.respuestas.map(a => (a[0] ? Ejercicios.cifraDe(a[0]) : null));
    const mods = Ejercicios.modulaciones(ej);
    const pivotes = new Set(mods.map(m => m.nota));
    /* La vista previa enseña lo que vería el alumno. El grado es el de la FUNDAMENTAL en
       los cuatro tipos (decisión 113). Con «solo en el primer fragmento» marcado, la
       previa es el fragmento 1, así que los circulitos del bajo van puestos. */
    const ejV = opciones().gradosPrimero ? Object.assign({}, ej, { gradosBajo: 'dado' }) : ej;
    /* EL PIVOTE, LEÍDO EN LOS DOS TONOS TAMBIÉN EN LA MELODÍA (decisión 186, Diego
       29/9/2026: «en el primer acorde ha de aparecer ya que el primer acorde es el acorde
       común entre la menor (I) y Do Mayor (VI)»). En la armonización de bajo esto ya salía,
       porque allí el grado se DEDUCE de la nota del bajo y de la cifra, y basta leerlo con
       otra tonalidad. En la melodía no: el acorde se guarda como pareja «grado|cifra», ya
       escrita en el tono que rige en esa nota, y el dibujo devolvía ese grado tal cual para
       las dos lecturas —de ahí que en el pivote saliera `IV` encima de `IV`—. Ahora, cuando
       se pide la lectura en OTRO tono, se deduce el bajo del acorde en su propio tono y se
       vuelve a leer en el que se pide: el acorde común sale así `I` sobre `VI`. */
    const romanoModelo = (a, i, ton) => {
      if (!a[0]) return null;
      if (sop) {
        const p = Ejercicios.par(a[0]);
        const suya = Ejercicios.tonalidadEn(ej, i);
        if (!ton || Teoria.mismaTonalidad(ton, suya)) return Teoria.gradoEscrito(p.romano, p.cifra);
        try {
          const b = Teoria.bajoDe(p.romano, p.cifra, Teoria.tonParaAcorde(p.romano, p.cifra, suya, notas[i]));
          if (b) return Teoria.romanoEscrito(p.cifra, { letra: b.letra, alt: b.alt, octava: 3 }, ton);
        } catch (e) { /* si no se puede leer en el otro tono, se deja el suyo */ }
        return Teoria.gradoEscrito(p.romano, p.cifra);
      }
      return Teoria.romanoEscrito(a[0], notas[i], ton);
    };
    const romanos = ver ? ej.respuestas.map((a, i) => romanoModelo(a, i, pivotes.has(i) ? Ejercicios.tonalidadAntes(ej, i) : Ejercicios.tonalidadEn(ej, i))) : new Array(n).fill(null);
    /* CADA EJERCICIO, SU VOZ (decisión 177, Diego 29/9/2026: «si estoy introduciendo los
       acordes de la soprano, entonces no debería aparecer la melodía del bajo, ¿no? Y
       viceversa cuando introduzco los del bajo»). Tiene razón, y **deroga la 167**, que era
       mía: el bajo y la soprano de un fragmento son DOS EJERCICIOS DISTINTOS sobre la misma
       música —eso ya estaba dicho y anotado el 26/9—, no dos voces de una misma
       armonización. Dibujarlos juntos obligaba a que casaran, y no tienen por qué: medido
       sobre el banco, de las 461 notas de los 103 fragmentos con las dos voces, 110 no
       casaban, y 78 de esas 110 son el MISMO acorde en otra inversión (la lista del bajo
       dice `I 6` donde la de la melodía dice `I 5/3`, porque en el ejercicio de melodía el
       bajo lo deduce el motor). De ahí salían 92 de los 103 avisos de conducción: ninguno
       era un error suyo. Se vuelve a lo de antes —la voz que se revisa, y el motor deduce
       las demás— y lo que aporta la otra voz se queda donde sí sirve: la columna «El bajo
       admite / La melodía admite» (decisión 174). */
    const dos = vocesDelBanco(ej);
    const opReal = { modo: 'auto', rotacion: 0 };
    if (sop) {
      opReal.bajos = Ejercicios.bajosDe(ej, romanos, ver ? modelos : new Array(n).fill(null));
      opReal.sopranos = notas;
    }
    const real = ver ? Realizacion.realizar(ej, modelos, opReal) : null;
    pintarAvisoVoces(dos, sop);
    const est = {
      respuestas: ver ? modelos : new Array(n).fill(null),
      // Grado en la tonalidad que rige; en el pivote, también en la anterior (casilla partida)
      romanos,
      romanos2: ver ? ej.respuestas.map((a, i) => (a[0] && pivotes.has(i) ? romanoModelo(a, i, Ejercicios.tonalidadEn(ej, i)) : null)) : new Array(n).fill(null),
      dobles: ej.respuestas.map((_, i) => pivotes.has(i)),
      /* En el pivote de la primera nota se escriben LOS DOS TONOS (decisión 186): el de
         partida no aparece en ninguna otra parte —no hay etiqueta anterior— y sin él no se
         sabe a qué tono corresponde cada uno de los dos renglones del acorde común. */
      etiquetas: mods.map(m => ({ i: m.nota,
        texto: (m.nota === 0 ? Teoria.nombreCorto(Ejercicios.tonalidadAntes(ej, 0)) + ' ' : '') + '→ ' + Teoria.nombreCorto(m.tonalidad),
        clase: 'dada' })),
      pedirRomano: opciones().pedirRomano || sop,
      activa: -1, campo: 'cifra', corregido: false, resultados: null, soloLectura: true,
      realizacion: real ? real.acordes : null,   // el profesor siempre puede ver la realización modelo
      realizacionMal: null,
      extremasDadas: false,
      /* Qué voz es del profesor y cuáles escribe el motor (decisión 169, ajustada por la
         177): la del ejercicio que se revisa. En la armonización de bajo, el bajo; en la de
         soprano, la melodía —y el bajo que se dibuja es deducido, no el suyo—. */
      bajoDado: !sop,
      sopranoDada: sop,
      realizacionDada: false,                    // tenor y contralto siempre los pone el motor
      vozDada: sop ? 'soprano' : null,
      bajos: sop ? opReal.bajos : null,
      /* La fila de funciones, con el pivote partido en dos (decisión 95): arriba la función
         en el tono de partida y abajo en el de llegada. */
      filaFunciones: opciones().funciones ? {
        visible: true, editable: false,
        celdas: ej.respuestas.map((_, i) => ({ texto: pivotes.has(i) ? Ejercicios.funcionModeloEn(ej, i, Ejercicios.tonalidadAntes(ej, i)) : Ejercicios.funcionModelo(ej, i), clase: 'dada', fija: true })),
        celdas2: ej.respuestas.map((_, i) => (pivotes.has(i) ? { texto: Ejercicios.funcionModelo(ej, i), clase: 'dada', fija: true } : null)),
        dobles: ej.respuestas.map((_, i) => pivotes.has(i))
      } : null,
      /* La fila «Tonalidad», solo si el fragmento modula (decisión 186): es la que pone el
         nombre del tono a la izquierda de cada renglón, y sin ella los dos renglones del
         acorde común no dicen a qué tono pertenece cada uno. En un fragmento que no modula
         sería un renglón de casillas todas iguales, así que no se dibuja. */
      filaTonalidad: mods.length ? {
        visible: true, editable: false,
        celdas: ej.respuestas.map((_, i) => ({ texto: Teoria.nombreCorto(Ejercicios.tonalidadEn(ej, i)), clase: 'dada', fija: true }))
      } : null,
      gradosBajo: Ejercicios.gradosBajo(ejV),   // el circulito sobre el bajo (decisiones 91 y 113)
      numerar: true,                       // el número de cada acorde es el de su fila en la tabla de revisión
      alPulsarNumero: irAFila,
      alPasarNumero: globoAcorde
    };
    globoAcorde(-1, null);                 // si estaba abierto, apuntaba a un dibujo que ya no existe
    Partitura.dibujar($('#vista-previa'), ej, est, () => {});
  }

  /* ---------- El globo de repaso (decisión 100) ----------
     Revisar cien fragmentos obliga a comprobar, acorde por acorde, qué cifras han
     quedado marcadas como válidas. Hacerlo en la tabla es ir y venir —la tabla está
     debajo y tiene una fila por nota—; con el globo basta pasar el ratón por el acorde
     en la vista previa y se ven ahí mismo, sobre la música. Es SOLO LECTURA: para
     cambiar algo se sigue pulsando el acorde, que lleva a su fila. */
  function globoAcorde(i, g) {
    const caja = $('#globo-acorde');
    if (!caja) return;
    const r = i >= 0 && estado.resumen ? estado.resumen[i] : null;
    if (!r || !g) { caja.hidden = true; return; }
    caja.innerHTML = '';
    const cab = document.createElement('div');
    cab.className = 'globo-cab';
    cab.textContent = 'Acorde ' + (i + 1) + ' · ' + r.nota + ' · grado ' + r.grado + ' de ' + r.ton
      + (r.fun ? ' · función ' + r.fun : '');
    caja.appendChild(cab);
    if (!r.opciones.length) {
      const v = document.createElement('div');
      v.className = 'globo-vacio';
      v.textContent = 'Sin ningún cifrado admisible.';
      caja.appendChild(v);
    } else {
      const ops = document.createElement('div');
      ops.className = 'globo-ops';
      r.opciones.forEach((op, k) => {
        const d = document.createElement('span');
        d.className = 'globo-op' + (k === 0 ? ' modelo' : '') + (op.fuera ? ' fuera-leccion' : '');
        d.title = op.titulo;
        d.appendChild(Partitura.iconoCifra(op.cifra, 26, op.bajo ? { bajo: op.bajo, ton: r.tonObj } : null));
        const t = document.createElement('span');
        t.className = 'chip-romano';
        t.textContent = op.romTxt;
        d.appendChild(t);
        ops.appendChild(d);
      });
      caja.appendChild(ops);
      const pie = document.createElement('div');
      pie.className = 'globo-pie';
      const nf = r.opciones.filter(o => o && o.fuera).length;
      pie.textContent = (r.opciones.length === 1 ? '1 cifra admisible (es la modelo)'
        : r.opciones.length + ' cifras admisibles · la modelo, la primera, en verde')
        + (nf ? ' · ' + (nf === 1 ? '1 tachada: no está' : nf + ' tachadas: no están') + ' en la lista de acordes de la lección' : '');
      caja.appendChild(pie);
    }
    // Debajo del acorde; si no cabe, encima. Siempre dentro de la ventana.
    caja.hidden = false;
    // El ancla es el CIRCULITO, no el grupo: el grupo incluye la zona transparente de
    // toda la columna, y colgar el globo de ella lo mandaría al pie de la partitura.
    const ancla = g.querySelector('circle') || g;
    const b = ancla.getBoundingClientRect(), c = caja.getBoundingClientRect();
    let x = b.left + b.width / 2 - c.width / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - c.width - 8));
    /* ENCIMA del circulito, no debajo: los números van en la banda de arriba, fuera del
       pentagrama, así que el globo cae sobre el margen y NO tapa la música que se está
       revisando —que es justo lo que hay que mirar al mismo tiempo—. Solo baja cuando
       arriba no cabe. */
    let y = b.top - c.height - 8;
    if (y < 8) y = Math.min(b.bottom + 8, window.innerHeight - c.height - 8);
    caja.style.left = Math.round(x) + 'px';
    caja.style.top = Math.round(y) + 'px';
  }

  // Al pulsar el número de un acorde en la vista previa, se resalta su fila en la tabla.
  function irAFila(i) {
    const tr = $('#fila-' + (i + 1));
    if (!tr) return;
    document.querySelectorAll('#tabla-revision tr.resaltada').forEach(x => x.classList.remove('resaltada'));
    tr.classList.add('resaltada');
    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    clearTimeout(irAFila.t);
    irAFila.t = setTimeout(() => tr.classList.remove('resaltada'), 2500);
  }

  /* ---------- Generación de la dirección ---------- */

  /* Cada tipo de ejercicio tiene su portada —analisis.html, armonizacion-bajo.html…— y
     todas llevan a index.html conservando el ejercicio. No es un capricho: Classroom pide
     la página al servidor para poner la etiqueta del enlace, y la parte que lleva el
     ejercicio (#e=… o #f=…) no viaja al servidor. Sin una dirección por tipo, todos los
     enlaces salen etiquetados igual (decisión 58). */
  function baseAlumno(modo) {
    const pagina = Banco.paginaDeModo(modo || modoElegido());
    return location.href.split('#')[0].replace(/configurar\.html$/, pagina);
  }

  function generar() {
    if (!estado.respuestas) { aviso('Analiza primero el bajo.'); return; }
    const ej = construirEjercicio(estado.compases, tonalidad(), estado.respuestas);
    const errores = Ejercicios.validar(ej);
    const vacias = ej.respuestas.map((a, i) => (a.length ? null : i + 1)).filter(Boolean);
    if (vacias.length) errores.push('Faltan respuestas en las notas ' + vacias.join(', ') + '.');
    if (errores.length) { aviso(errores.join(' ')); return; }
    estado.ejercicio = ej;
    const url = baseAlumno(Ejercicios.modo(ej)) + '#e=' + Ejercicios.codificar(ej);
    $('#direccion').value = url;
    $('#btn-copiar').disabled = false;
    $('#btn-json').disabled = false;
    const a = $('#btn-abrir'); a.href = url; a.setAttribute('aria-disabled', 'false');
    aviso('Dirección generada (' + url.length + ' caracteres).');
  }

  function limpiarDireccion() {
    $('#direccion').value = '';
    $('#btn-copiar').disabled = true; $('#btn-json').disabled = true;
    const a = $('#btn-abrir'); a.href = '#'; a.setAttribute('aria-disabled', 'true');
    $('#direcciones-todos').hidden = true; $('#btn-copiar-todos').disabled = true;
    estado.ejercicio = null;
  }

  function copiar(texto, mensaje) {
    const fin = () => aviso(mensaje);
    if (navigator.clipboard) navigator.clipboard.writeText(texto).then(fin, () => prompt('Copia el texto:', texto));
    else prompt('Copia el texto:', texto);
  }

  function descargarJSON() {
    if (!estado.ejercicio) return;
    const blob = new Blob([JSON.stringify(estado.ejercicio, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (estado.ejercicio.titulo || 'ejercicio').replace(/[^\wáéíóúñÁÉÍÓÚÑ -]+/g, '').trim().replace(/\s+/g, '_') + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    /* Descargar no es publicar: hasta que el archivo esté en GitHub, los alumnos siguen
       viendo el banco anterior. El cartel de «sin publicar» tampoco se apaga aquí; se
       apaga solo cuando, al recargar, el publicado ya coincide. */
    aviso('Descargado banco.json con ' + banco.length + ' fragmentos. Falta subirlo a GitHub: hasta entonces los alumnos siguen con el banco anterior.', 10000);
  }

  function generarTodos() {
    if (!estado.fragmentos) return;
    const lineas = [];
    const problemas = [];
    const base = $('#coleccion').value.trim() || $('#titulo').value.trim() || 'Ejercicio';
    estado.fragmentos.forEach((f, k) => {
      const v = vozDe(f);
      const ej = construirEjercicio(v.compases, f.tonalidad, null, { titulo: 'Ejercicio ' + (k + 1), coleccion: base, compas: f.compas, id: 'url-' + Date.now().toString(36) + '-' + (k + 1), modulaciones: v.modulaciones || [], funcionesNotas: null });
      const prop = proponerPara(ej, null);
      ej.respuestas = prop.map(p => p.admisibles.slice());
      ej.respuestas = ej.respuestas.map((_, i) => Ejercicios.admisibles(ej, i));
      if (ej.funciones) ej.funcionesNotas = funcionesDeModelo(ej);
      const vacias = ej.respuestas.map((a, i) => (a.length ? null : i + 1)).filter(Boolean);
      if (!v.compases.length) problemas.push('Fragmento ' + (k + 1) + ': no tiene ' + (esSoprano() ? 'melodía' : 'bajo') + ' escrito');
      if (vacias.length) problemas.push('Fragmento ' + (k + 1) + ': notas sin propuesta ' + vacias.join(', '));
      if (!f.tonalidadSegura) problemas.push('Fragmento ' + (k + 1) + ': tonalidad deducida con dudas (' + Teoria.nombreTonalidad(f.tonalidad) + ')');
      (f.modulaciones || []).forEach(m => { if (!m.segura) problemas.push('Fragmento ' + (k + 1) + ': cambio de armadura en la nota ' + (m.nota + 1) + ' leído como modulación a ' + Teoria.nombreTonalidad(m.tonalidad) + ' (revisa el modo y el pivote)'); });
      lineas.push('Ejercicio ' + (k + 1) + ' · ' + Teoria.nombreTonalidad(f.tonalidad) + ' · ' + Teoria.textoDesdeBajo(v.compases) + '\n' + baseAlumno(Ejercicios.modo(ej)) + '#e=' + Ejercicios.codificar(ej));
    });
    const ta = $('#direcciones-todos');
    ta.value = (problemas.length ? 'AVISOS:\n' + problemas.join('\n') + '\n\n' : '') + lineas.join('\n\n');
    ta.hidden = false;
    $('#btn-copiar-todos').disabled = false;
  }

  /* ---------- Importación de archivos ---------- */

  function importarArchivo(file) {
    const lector = new FileReader();
    const deMuseScore = typeof MuseScore !== 'undefined' && MuseScore.esMuseScore(file.name);
    lector.onload = async () => {
      try {
        // Archivo de MuseScore (.mscz o .mscx): se lee tal cual, sin exportar a MusicXML
        if (deMuseScore) {
          const r = await MuseScore.importar(new Uint8Array(lector.result), { voz: esSoprano() ? 'soprano' : 'bajo' });
          cargarMusicXML(r, file.name);
          return;
        }
        const txt = lector.result;
        if (/\.json$/i.test(file.name) || txt.trim().startsWith('{')) cargarJSON(JSON.parse(txt));
        else cargarMusicXML(MusicXML.importar(txt, { voz: esSoprano() ? 'soprano' : 'bajo' }), file.name);   // se leen las dos voces; esta es la que se carga
      } catch (e) {
        aviso('No se ha podido importar: ' + e.message);
      }
    };
    if (deMuseScore) lector.readAsArrayBuffer(file); else lector.readAsText(file);
  }

  function cargarMusicXML(r, nombre) {
    estado.banco = null; pintarOrigenBanco();
    estado.fragmentos = r.fragmentos;
    abrirAnadir(); abrirFragmento();
    estado.nombreArchivo = nombre;
    const cont = $('#lista-fragmentos');
    cont.innerHTML = '';
    $('#fragmentos-titulo').textContent = r.fragmentos.length + (r.fragmentos.length === 1 ? ' fragmento encontrado en ' : ' fragmentos encontrados en ') + nombre + '. Pulsa uno para cargarlo:';
    r.fragmentos.forEach((f, k) => {
      const v = vozDe(f);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fragmento';
      b.innerHTML = '<b>' + (k + 1) + '</b> ' + Teoria.textoDesdeBajo(v.compases) + '<span class="fragmento-ton">' + Teoria.nombreTonalidad(f.tonalidad)
        + (f.tonalidadSegura ? '' : ' (?)') + (f.tieneBajo && f.tieneSoprano ? ' · dos voces' : '') + '</span>';
      b.addEventListener('click', () => cargarFragmento(k));
      cont.appendChild(b);
    });
    const av = $('#avisos-importacion');
    if (r.avisos.length) { av.textContent = r.avisos.join(' · '); av.hidden = false; } else av.hidden = true;
    $('#fragmentos').hidden = false;
    if (!$('#coleccion').value) $('#coleccion').value = nombre.replace(/\.(mscz|mscx|musicxml|xml)$/i, '');
    prepararAnadirAlBanco();
    cargarFragmento(0);
    $('#todos-fragmentos').hidden = !(r.fragmentos.length > 1) || $('#paso-direccion').hidden;
  }

  function cargarFragmento(k) {
    const f = estado.fragmentos[k];
    const v = vozDe(f);
    estado.fragmentoActual = k;
    estado.companera = companera(v.compases, v.otra);
    $('#texto-bajo').value = Teoria.textoDesdeBajo(v.compases);
    $('#tonica').value = f.tonalidad.tonica;
    $('#modo').value = f.tonalidad.modo;
    $('#compas').value = f.compas.join('/');
    estado.modulaciones = (v.modulaciones || []).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    estado.melodica = (v.melodica || []).slice();
    if (!$('#titulo').value || /^Ejercicio \d+$/.test($('#titulo').value)) $('#titulo').value = 'Ejercicio ' + (k + 1);
    document.querySelectorAll('.fragmento').forEach((b, i) => b.classList.toggle('elegido', i === k));
    estado.respuestas = null; estado.propuesta = null;
    $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true;
    limpiarDireccion();
    leerBajo();
    guardarBorrador();
  }

  function cargarJSON(ej) {
    const errores = Ejercicios.validar(ej);
    if (errores.length) throw new Error(errores.join(' '));
    $('#texto-bajo').value = Teoria.textoDesdeBajo(ej.compases);
    $('#tonica').value = ej.tonalidad.tonica; $('#modo').value = ej.tonalidad.modo;
    $('#compas').value = (ej.compas || [4, 4]).join('/');
    $('#titulo').value = ej.titulo || ''; $('#coleccion').value = ej.coleccion || '';
    document.querySelectorAll('#repertorio-opciones input').forEach(i => { i.checked = (ej.repertorio || Ejercicios.REPERTORIO_RO).includes(i.value); });
    $('#pedir-romano').checked = ej.pedirRomano !== false;
    $('#reintentos').checked = ej.reintentos !== false;
    $('#ficha-ayuda-grados').value = Ejercicios.ayudaGrados(ej);
    $('#grados-bajo').value = Ejercicios.estadoGrados(ej);
    elegirModo(Ejercicios.modo(ej));
    $('#bajo-audicion').value = ej.mostrarBajo === true ? 'bajo' : '';
    $('#ficha-funciones').value = Ejercicios.funciones(ej) || '';
    estado.funciones = Array.isArray(ej.funcionesNotas) ? ej.funcionesNotas.slice() : null;
    if (Array.isArray(ej.acordes)) marcarAcordes(ej.acordes);
    $('#formula-tst').checked = ej.formulaTST !== false;
    ajustarCampoAudicion();
    $('#ficha-preferir').value = ej.preferir && ej.preferir.includes('+6') ? '+6' : '';
    estado.modulaciones = Ejercicios.modulaciones(ej).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    estado.melodica = Array.isArray(ej.melodica) ? ej.melodica.slice() : [];
    $('#ficha-tonalidades').value = ['dadas', 'pedir', 'no'].includes(ej.tonalidades) ? ej.tonalidades : '';
    estado.compases = ej.compases;
    abrirFragmento();
    estado.respuestas = ej.respuestas.map(a => a.slice());
    try { estado.propuesta = proponerPara(ej, estado.funciones); } catch (e) { estado.propuesta = null; }
    leerBajo();
    pintarRevision();
    $('#paso-revision').hidden = false; $('#paso-direccion').hidden = false;
    guardarBorrador();
    aviso('Ejercicio cargado desde el archivo.');
  }

  /* El fragmento en curso vive en un plegable (decisión 66): se abre solo cuando hay
     algo que mirar dentro —al cargar del banco o al importar un archivo—, para que no
     estorbe el resto del tiempo. */
  function abrirFragmento() { const d = $('#paso-bajo'); if (d) d.open = true; }
  function abrirAnadir() { const d = $('#det-anadir'); if (d) d.open = true; }

  /* ---------- Borrador ---------- */

  function guardarBorrador() {
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
        texto: $('#texto-bajo').value, tonica: $('#tonica').value, modo: $('#modo').value, compas: $('#compas').value,
        titulo: $('#titulo').value, coleccion: $('#coleccion').value, repertorio: repertorio(),
        pedirRomano: $('#pedir-romano').checked, reintentos: $('#reintentos').checked,
        tipo: modoElegido(), respuestas: estado.respuestas,
        bancoId: estado.banco ? estado.banco.entrada.id : null, bancoVoz: estado.banco ? estado.banco.voz : null,
        modulaciones: estado.modulaciones, melodica: estado.melodica, bajoAudicion: $('#bajo-audicion').value,
        gradosBajo: $('#grados-bajo').value, gradosPrimero: $('#grados-primero').checked,
        fichaAyudaGrados: $('#ficha-ayuda-grados').value, fichaPreferir: $('#ficha-preferir').value, fichaFunciones: $('#ficha-funciones').value,
        fichaTonalidades: $('#ficha-tonalidades').value,
        // El filtro de la ficha: es lo que se toca cada semana, y perderlo al recargar molesta
        ficha: ['#ficha-modo', '#ficha-leccion', '#ficha-modotonal', '#ficha-alteraciones', '#ficha-nivel',
          '#ficha-modula', '#ficha-compases-min', '#ficha-compases-max', '#ficha-titulo',
          '#ficha-armadura', '#ficha-armadura-pct'].reduce((o, id) => { o[id] = $(id).value; return o; }, {}),
        funcionesNotas: estado.funciones,
        acordes: acordesElegidos(), formulaTST: $('#formula-tst').checked
      }));
    } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  function cargarBorrador() {
    try {
      const b = JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || 'null');
      if (!b) return false;
      // (En borradores antiguos, 'modo' guardaba el tipo de ejercicio en vez del modo de la tonalidad.)
      const modoTon = b.modo === 'menor' ? 'menor' : 'mayor';
      const tipo = b.tipo || (Ejercicios.MODOS[b.modo] ? b.modo : 'armonizar');
      $('#texto-bajo').value = b.texto || ''; $('#tonica').value = b.tonica || 'C'; $('#modo').value = modoTon;
      $('#compas').value = b.compas || '4/4'; $('#titulo').value = b.titulo || ''; $('#coleccion').value = b.coleccion || '';
      document.querySelectorAll('#repertorio-opciones input').forEach(i => { i.checked = (b.repertorio || Ejercicios.REPERTORIO_RO).includes(i.value); });
      $('#pedir-romano').checked = b.pedirRomano !== false; $('#reintentos').checked = b.reintentos !== false; $('#grados-bajo').value = b.gradosBajo === 'oculto' || b.gradosBajo === 'pedido' ? 'oculto' : 'dado';
      $('#grados-primero').checked = !!b.gradosPrimero;
      /* Las opciones del alumno viven ahora solo en la ficha (decisión 66). En un borrador
         antiguo estaban por duplicado: se recogen las de la ficha y, si no las hubiera,
         las del paso 3 de entonces, para no perder lo que hubiera elegido. */
      $('#ficha-ayuda-grados').value = b.fichaAyudaGrados || b.ayudaGrados || 'lista';
      $('#ficha-preferir').value = b.fichaPreferir || b.preferir || '';
      $('#ficha-funciones').value = b.fichaFunciones || (b.funciones === 'dadas' || b.funciones === 'pedir' ? b.funciones : '');
      const ton = b.fichaTonalidades || b.tonalidades;
      $('#ficha-tonalidades').value = ['dadas', 'pedir', 'no'].includes(ton) ? ton : '';
      estado.fichaGuardada = b.ficha && typeof b.ficha === 'object' ? b.ficha : null;
      elegirModo(tipo);
      $('#bajo-audicion').value = b.bajoAudicion === 'bajo' ? 'bajo' : '';
      estado.funciones = Array.isArray(b.funcionesNotas) ? b.funcionesNotas : null;
      if (Array.isArray(b.acordes)) marcarAcordes(b.acordes);
      $('#formula-tst').checked = b.formulaTST !== false;
      ajustarCampoAudicion();
      estado.modulaciones = Array.isArray(b.modulaciones) ? b.modulaciones.filter(m => m && m.tonalidad && Number.isInteger(m.nota)) : [];
      estado.melodica = Array.isArray(b.melodica) ? b.melodica.filter(Number.isInteger) : [];
      // Si se estaba revisando un fragmento del banco, se vuelve a enganchar con él
      estado.banco = null;
      if (b.bancoId && b.bancoVoz) {
        const e = banco.find(x => x.id === b.bancoId);
        if (e && e[b.bancoVoz]) estado.banco = { entrada: e, voz: b.bancoVoz };
      }
      leerBajo();
      ajustarCampoModulacion();
      if (b.respuestas && b.respuestas.length === Ejercicios.numNotas({ compases: estado.compases })) {
        estado.respuestas = b.respuestas;
        try { estado.propuesta = Reglas.proponer(construirEjercicio(estado.compases, tonalidad(), null)); } catch (e) { estado.propuesta = null; }
        pintarRevision();
        $('#paso-revision').hidden = false; $('#paso-direccion').hidden = false;
      }
      return true;
    } catch (e) { return false; }
  }

  function limpiar() {
    try { localStorage.removeItem(CLAVE_BORRADOR); } catch (e) { /* nada */ }
    location.reload();
  }

  /* ---------- Utilidades de interfaz ---------- */

  function aviso(txt, ms) {
    const a = $('#aviso');
    a.textContent = txt; a.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { a.hidden = true; }, ms || 4500);
  }

  function pintarRepertorio() {
    const cont = $('#repertorio-opciones');
    ORDEN_CIFRAS.forEach(id => {
      const c = Teoria.CIFRADOS[id];
      const lab = document.createElement('label');
      lab.className = 'opcion-cifra';
      lab.title = c.descripcion;
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = id; cb.checked = Ejercicios.REPERTORIO_RO.includes(id);
      cb.addEventListener('change', () => { guardarBorrador(); if (estado.respuestas) { pintarRevision(); } });
      lab.appendChild(cb);
      lab.appendChild(Partitura.iconoCifra(id, 34));
      const s = document.createElement('span'); s.textContent = c.nombre;
      lab.appendChild(s);
      cont.appendChild(lab);
    });
  }

  // Rejilla de acordes por función (armonización de soprano)
  function pintarAcordes() {
    const cont = $('#acordes-lista');
    const filas = { T: 'Tónica', S: 'Subdominante', D: 'Dominante' };
    Object.entries(filas).forEach(([fun, nombre]) => {
      const fila = document.createElement('div');
      fila.className = 'fila-funcion';
      const et = document.createElement('span'); et.className = 'fun-etiqueta'; et.innerHTML = '<b>' + fun + '</b> · ' + nombre; fila.appendChild(et);
      CATALOGO_ACORDES.filter(a => a.fun === fun).forEach(a => {
        const p = Ejercicios.par(a.id);
        const c = Teoria.CIFRADOS[p.cifra];
        const lab = document.createElement('label');
        lab.className = 'opcion-cifra opcion-acorde';
        lab.title = a.rom + ' ' + c.nombre + ' — ' + c.descripcion + (a.nota ? ' (' + a.nota + ')' : '');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = a.id; cb.checked = a.defecto;
        cb.addEventListener('change', () => { contarAcordes(); guardarBorrador(); limpiarDireccion(); reanalizarSalvoBanco(); });
        lab.appendChild(cb);
        const r = document.createElement('span'); r.className = 'acorde-rom'; r.textContent = a.rom; lab.appendChild(r);
        lab.appendChild(Partitura.iconoCifra(p.cifra, 30));
        if (a.nota) { const s = document.createElement('span'); s.className = 'acorde-nota'; s.textContent = a.nota; lab.appendChild(s); }
        fila.appendChild(lab);
      });
      cont.appendChild(fila);
    });
    $('#formula-tst').addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); reanalizarSalvoBanco(); });
    contarAcordes();
  }

  function arranque() {
    TONICAS.forEach(([v, n]) => { const o = document.createElement('option'); o.value = v; o.textContent = n; $('#tonica').appendChild(o); });
    pintarRepertorio();
    pintarAcordes();

    // Ejemplo por defecto si no hay borrador
    if (!cargarBorrador()) {
      $('#texto-bajo').value = 'do3 re3 | mi3 do3 | sol3r | do3r';
      $('#titulo').value = 'Ejercicio 1';
      leerBajo();
    }

    $('#texto-bajo').addEventListener('input', () => { estado.banco = null; pintarOrigenBanco(); estado.companera = null; leerBajo(); estado.respuestas = null; $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true; limpiarDireccion(); guardarBorrador(); });
    ['#tonica', '#modo', '#compas', '#titulo', '#coleccion', '#pedir-romano', '#reintentos', '#ficha-ayuda-grados', '#ficha-preferir', '#ficha-tonalidades', '#bajo-audicion', '#grados-bajo', '#grados-primero'].forEach(sel => {
      $(sel).addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); ajustarCampoAudicion(); if (estado.respuestas) pintarRevision(); });
    });
    // Cambiar la opción de funciones en una melodía cambia qué acordes se admiten: se vuelve a analizar
    $('#ficha-funciones').addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); ajustarCampoAudicion(); if (estado.respuestas) { if (esSoprano()) reanalizarSalvoBanco(); else pintarRevision(); } });
    /* LA TONALIDAD DE PARTIDA SE PUEDE CAMBIAR AUNQUE HAYA MODULACIÓN (decisión 184, Diego
       29/9/2026: «si incluye modulación, se ha de poder especificar la tonalidad en la que
       comienza el fragmento, aunque ese primer acorde sirva de pivote para comenzar
       modulación a otro tono —así, el primer acorde puede ser I de la menor y, al mismo
       tiempo, VI de Do Mayor—»). Hasta aquí, tocar «Tónica» o «Modo» con una modulación
       puesta las BORRABA TODAS y además volvía a analizar el fragmento entero, con lo que se
       perdía también lo asignado a mano: justo el camino que hacía imposible lo que pide.
       Ahora se conservan las que siguen siendo vecinas desde el tono nuevo, se descartan solo
       las que dejan de serlo —diciendo cuáles— y no se vuelve a analizar nada: lo marcado es
       suyo. Lo que sí cambia es la LECTURA (las mismas cifras dan otros grados), y eso se
       avisa. */
    ['#tonica', '#modo'].forEach(sel => $(sel).addEventListener('change', () => {
      if (!estado.modulaciones.length) return;
      const antes = estado.modulaciones.length;
      let ton = tonalidad();
      const validas = [];
      estado.modulaciones.slice().sort((a, b) => a.nota - b.nota).forEach(m => {
        if (!m || !m.tonalidad) return;
        if (Teoria.mismaTonalidad(ton, m.tonalidad)) return;          // modular al mismo tono no es modular
        if (!Teoria.mismaTonalidad(m.tonalidad, tonalidad())            // la vuelta al tono del fragmento, siempre (187)
          && !Teoria.tonalidadesVecinas(ton).some(x => Teoria.mismaTonalidad(x, m.tonalidad))) return;
        validas.push(m); ton = m.tonalidad;
      });
      estado.modulaciones = validas;
      guardarBorrador();
      if (estado.respuestas) pintarRevision();
      const caidas = antes - validas.length;
      aviso('Tonalidad de partida: ' + Teoria.nombreCorto(tonalidad()) + '. '
        + (caidas ? 'Se han quitado ' + caidas + (caidas > 1 ? ' modulaciones que ya no parten de un tono vecino' : ' modulación que ya no parte de un tono vecino') + '; las demás se conservan. '
          : 'Las modulaciones se conservan. ')
        + 'No se ha vuelto a analizar nada: los acordes que marcaste siguen ahí, pero ahora se leen en el tono nuevo.', 11000);
    }));
    document.querySelectorAll('input[name="modo-ej"]').forEach(r => r.addEventListener('change', () => {
      // La armonización de soprano parte de la función tonal de cada acorde: si no había fila, se activa
      if (esSoprano() && !$('#ficha-funciones').value) $('#ficha-funciones').value = 'dadas';
      ajustarCampoAudicion(); limpiarDireccion();
      // Entre bajo dado y melodía de soprano cambia la voz dada y la forma de las respuestas
      const eraSoprano = estado.respuestas && estado.respuestas.some(a => a.some(x => String(x).includes('|')));
      const cambia = !estado.respuestas || eraSoprano !== esSoprano();
      if (cambia && estado.fragmentos) {
        // El archivo importado trae las dos voces: se carga la que ahora hace falta
        if (estado.fragmentos.length > 1) cargarMusicXML({ fragmentos: estado.fragmentos, avisos: [] }, $('#coleccion').value || 'el archivo');
        else cargarFragmento(estado.fragmentoActual || 0);
        if (estado.respuestas || eraSoprano !== esSoprano()) analizar();
      } else if (cambia && estado.respuestas) { leerBajo(); analizar(); }
      else { guardarBorrador(); if (estado.respuestas) pintarRevision(); }
    }));
    ajustarCampoAudicion();
    $('#ver-solucion').addEventListener('change', pintarVistaPrevia);
    $('#btn-analizar').addEventListener('click', () => analizar(false));
    $('#btn-generar').addEventListener('click', generar);
    $('#btn-copiar').addEventListener('click', () => copiar($('#direccion').value, 'Dirección copiada.'));
    $('#btn-json').addEventListener('click', descargarJSON);
    $('#btn-todos').addEventListener('click', generarTodos);
    $('#btn-copiar-todos').addEventListener('click', () => copiar($('#direcciones-todos').value, 'Lista copiada.'));
    $('#btn-limpiar').addEventListener('click', limpiar);
    $('#btn-abrir').addEventListener('click', ev => { if ($('#btn-abrir').getAttribute('aria-disabled') === 'true') ev.preventDefault(); });

    // Zona de archivo: arrastrar o pulsar
    const zona = $('#zona-archivo'), input = $('#archivo');
    zona.addEventListener('click', () => input.click());
    zona.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { if (input.files[0]) importarArchivo(input.files[0]); input.value = ''; });
    ['dragenter', 'dragover'].forEach(t => zona.addEventListener(t, ev => { ev.preventDefault(); zona.classList.add('sobre'); }));
    ['dragleave', 'drop'].forEach(t => zona.addEventListener(t, ev => { ev.preventDefault(); zona.classList.remove('sobre'); }));
    zona.addEventListener('drop', ev => { const f = ev.dataTransfer.files[0]; if (f) importarArchivo(f); });

    arranqueBanco();
    /* El banco se lee en arranqueBanco(), después del borrador: aquí se vuelve a enganchar
       el fragmento que se estaba revisando, si lo había. */
    const br = (() => { try { return JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || 'null'); } catch (e) { return null; } })();
    if (br && br.bancoId && br.bancoVoz) {
      const e = banco.find(x => x.id === br.bancoId);
      if (e && e[br.bancoVoz]) estado.banco = { entrada: e, voz: br.bancoVoz };
    }
    pintarOrigenBanco();
  }


  /* =================================================================
     Banco de fragmentos y fichas (paso 6)
     ================================================================= */

  const CLAVE_BANCO = 'armonizar.banco';
  let banco = [];
  /* El `#id=` de la URL se resuelve al arrancar, pero si este navegador no tenía banco
     todavía no hay dónde buscar: se guarda aquí para reintentarlo en cuanto llegue el
     banco.json publicado (decisión 82). */
  let reintentarHash = null;

  function leerBanco() {
    try { banco = Banco.leerArchivo(localStorage.getItem(CLAVE_BANCO) || '[]'); } catch (e) { banco = []; }
  }
  function guardarBanco() {
    try { localStorage.setItem(CLAVE_BANCO, JSON.stringify(Banco.archivo(banco))); } catch (e) { aviso('El banco no cabe en este navegador; descárgalo como banco.json.'); }
  }

  function prepararAnadirAlBanco() {
    const caja = $('#banco-anadir');
    if (!estado.fragmentos || !estado.fragmentos.length) { caja.hidden = true; return; }
    caja.hidden = false;
    const lec = Banco.leccionDeNombre(estado.nombreArchivo || '');
    const nom = Banco.nombreDeLeccion(estado.nombreArchivo || '');
    if (lec) $('#banco-leccion').value = lec;
    if (nom) $('#banco-leccion-nombre').value = nom;
    $('#banco-anadir-ayuda').textContent = 'Se analizan los ' + estado.fragmentos.length
      + ' fragmentos del archivo con las opciones actuales (repertorio, acordes y fórmula T S T).';
  }

  /* Dos entradas son el mismo ejercicio cuando, en la misma tonalidad, coincide TODA voz
     que las dos tengan escrita (y comparten al menos una). Así el archivo «… - Bajo» y el
     «… - Bajo y soprano» de una misma lección no se duplican —se funden en una entrada con
     las dos voces—, pero dos melodías distintas sobre el mismo bajo siguen siendo dos
     ejercicios, porque como armonización de soprano no son el mismo. */
  const mismaMusica = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
  function mismoQue(e) {
    return banco.find(x => {
      const bajos = x.bajo && e.bajo, sopranos = x.soprano && e.soprano;
      if (!bajos && !sopranos) return false;                                        // no comparten ninguna voz
      if (bajos && !mismaMusica(x.bajo.compases, e.bajo.compases)) return false;    // el mismo bajo…
      if (sopranos && !mismaMusica(x.soprano.compases, e.soprano.compases)) return false;   // …y la misma melodía
      if (Teoria.mismaTonalidad(x.tonalidad, e.tonalidad)) return true;
      /* La misma música leída en dos tonalidades distintas es el mismo ejercicio cuando al
         juntarlas aparece la voz que a una le faltaba: es normal que el archivo de bajos y
         el de melodías traigan los mismos ejercicios, y que solo la melodía —con su
         sensible escrita— diga de verdad en qué tonalidad están. */
      return (!x.bajo && !!e.bajo) || (!x.soprano && !!e.soprano);
    });
  }
  // Completa la entrada vieja con la voz que le falte; devuelve true si ha añadido algo
  // Fragmentos cuya entrada se ha reemplazado entera en la última importación
  let reemplazados = [];
  let intactos = [];        // cerrados que la importación ha dejado como estaban (decisión 166)

  function fundir(viejo, nuevo) {
    /* Si las dos lecturas no coinciden en la tonalidad, manda la del fragmento que trae
       LAS DOS VOCES: es el que tiene la prueba. Se sustituye entero —también sus
       respuestas, leídas ya en la tonalidad buena—, conservando el identificador. */
    /* UN FRAGMENTO CERRADO NO SE TOCA (decisión 166). Ni siquiera aquí, que era el único
       sitio donde una entrada se reemplazaba entera. Se anota para decirlo al terminar. */
    if (Banco.estaCerrada(viejo)) { intactos.push(viejo.id || '(sin id)'); return false; }
    if (!Teoria.mismaTonalidad(viejo.tonalidad, nuevo.tonalidad) && nuevo.bajo && nuevo.soprano) {
      /* Este es el único sitio donde una entrada del banco se reemplaza ENTERA, respuestas
         incluidas. Tiene motivo —las viejas estaban leídas en una tonalidad equivocada—,
         pero pasaba callando, y el profesor podía perder ahí una revisión hecha a mano. Se
         anota para decirlo en el resumen (Diego, 28/9/2026). */
      reemplazados.push(viejo.id || '(sin id)');
      const id = viejo.id, lec = viejo.leccion, nom = viejo.leccionNombre;
      Object.keys(viejo).forEach(k => { delete viejo[k]; });
      Object.assign(viejo, nuevo);
      viejo.id = id;
      if (lec) { viejo.leccion = lec; viejo.leccionNombre = nom; }
      return true;
    }
    let cambio = false;
    ['bajo', 'soprano'].forEach(v => { if (!viejo[v] && nuevo[v]) { viejo[v] = nuevo[v]; cambio = true; } });
    if (cambio) {
      const et = viejo.etiquetas || (viejo.etiquetas = {});
      et.voces = viejo.bajo && viejo.soprano ? 'ambas' : (viejo.bajo ? 'bajo' : 'soprano');
      if (!viejo.leccion && nuevo.leccion) viejo.leccion = nuevo.leccion;
    }
    return cambio;
  }

  // Primer identificador libre de esa lección (A3-3-01, A3-3-02…)
  function identificadorLibre(lec) {
    let n = 1, id;
    do { id = lec + '-' + String(n++).padStart(2, '0'); } while (banco.some(x => x.id === id));
    return id;
  }

  function anadirAlBanco() {
    if (!estado.fragmentos || !estado.fragmentos.length) { aviso('Importa antes un archivo.'); return; }
    const leccion = $('#banco-leccion').value.trim();
    const leccionNombre = $('#banco-leccion-nombre').value.trim();
    const fuente = estado.nombreArchivo || '';
    const op = { leccion, leccionNombre, fuente, repertorio: repertorio(), acordes: acordesElegidos(), formulaTST: $('#formula-tst').checked };
    let nuevos = 0, repetidos = 0, fallidos = 0, conAviso = 0, fundidos = 0;
    reemplazados = []; intactos = [];
    estado.fragmentos.forEach((f, k) => {
      let e;
      try { e = Banco.entrada(f, Object.assign({ compas: f.compas }, op)); } catch (err) { e = null; }
      if (!e) { fallidos++; return; }
      const viejo = mismoQue(e);
      if (viejo) { if (fundir(viejo, e)) fundidos++; else repetidos++; return; }
      /* El número va por LECCIÓN, no por archivo: una misma lección puede repartirse en
         varios archivos (bajos, sopranos, melodías) y cada fragmento ha de tener su
         identificador propio. Se toma el primero libre. */
      e.id = identificadorLibre(leccion || 'X');
      if (e.avisos && e.avisos.length) conAviso++;
      banco.push(e);
      nuevos++;
    });
    guardarBanco();
    pintarBanco();
    aviso('Banco: ' + nuevos + ' fragmentos añadidos'
      + (fundidos ? ', ' + fundidos + ' completados con la otra voz' : '')
      + (repetidos ? ', ' + repetidos + ' ya estaban' : '')
      + (fallidos ? ', ' + fallidos + ' sin música aprovechable' : '')
      + (conAviso ? ' · ' + conAviso + ' con alguna nota sin propuesta (revísalos)' : '')
      + (intactos.length ? ' · ' + intactos.length + ' cerrados, que se han dejado intactos' : '') + '.', 7000);
    /* Y, aparte y bien visible, lo único que puede haberse llevado por delante una revisión
       hecha a mano: una entrada reemplazada entera por venir en otra tonalidad. */
    if (reemplazados.length) setTimeout(() => aviso('OJO: ' + reemplazados.length
      + (reemplazados.length > 1 ? ' fragmentos venían' : ' fragmento venía') + ' en otra tonalidad y se '
      + (reemplazados.length > 1 ? 'han reemplazado enteros' : 'ha reemplazado entero') + ', con sus cifras: '
      + reemplazados.join(', ') + '. Si los tenías revisados, vuelve a revisarlos.', 15000), 7200);
  }

  /* ---------- Las tonalidades de la ficha (decisión 102) ----------
     El desplegable «Curso» es un atajo: pone el tope de alteraciones que corresponde a
     cada curso y marca las tónicas que caben. A partir de ahí el profesor toca las que
     quiera y el desplegable pasa solo a «A medida». */
  const CURSOS = { 2: '1.º de Armonía', 3: '2.º de Armonía', 5: '1.º de Análisis / Fundamentos', 7: '2.º de Análisis / Fundamentos' };

  function pintarTonos(marcar) {
    const caja = $('#ficha-tonos-caja');
    const v = $('#ficha-curso').value;
    caja.hidden = !v;
    if (!v) return;
    const tope = v === 'x' ? 7 : parseInt(v, 10);
    ['mayor', 'menor'].forEach(modo => {
      const div = $('#ficha-tonos-' + modo);
      const antes = new Set([...div.querySelectorAll('input:checked')].map(i => i.value));
      div.innerHTML = '';
      Teoria.tonicasPorAlteraciones(modo, 7).forEach(t => {
        const ton = { tonica: t, modo };
        const arm = Teoria.armadura(ton);
        const lab = document.createElement('label');
        lab.className = 'opcion-cifra';
        lab.title = Math.abs(arm) + ' ' + (Math.abs(arm) === 1 ? 'alteración' : 'alteraciones');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = t; cb.dataset.modo = modo;
        cb.checked = marcar ? Math.abs(arm) <= tope : antes.has(t);
        cb.addEventListener('change', () => {
          if ($('#ficha-curso').value !== 'x') $('#ficha-curso').value = 'x';
          limpiarDireccion(); guardarBorrador(); avisoTonos();
        });
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(Teoria.nombreCorto(ton)));
        div.appendChild(lab);
      });
    });
    avisoTonos();
  }
  const tonosMarcados = () => [...document.querySelectorAll('#ficha-tonos-caja input:checked')].map(i => i.value);
  function avisoTonos() {
    const n = tonosMarcados().length;
    const may = [...document.querySelectorAll('#ficha-tonos-mayor input:checked')].length;
    const men = n - may;
    /* El recordatorio de las dobles alteraciones. La fuente incrustada no tiene 𝄪 ni 𝄫,
       así que cuando un fragmento no se puede dibujar en la tónica que le tocaba, se le
       da la siguiente. Pasa sobre todo en las menores con muchos sostenidos —sol♯, re♯,
       la♯ menor piden 𝄪 en la sensible— y en las tonalidades de 6 y 7 bemoles. */
    const finas = [...document.querySelectorAll('#ficha-tonos-caja input:checked')]
      .filter(i => Math.abs(Teoria.armadura({ tonica: i.value, modo: i.dataset.modo })) >= 5)
      .map(i => Teoria.nombreCorto({ tonica: i.value, modo: i.dataset.modo }));
    $('#ficha-tonos-aviso').innerHTML = (may + ' mayores y ' + men + ' menores marcadas.')
      + (finas.length ? ' <b>Aviso:</b> ' + finas.join(', ') + ' piden dobles alteraciones en algunos fragmentos (sobre todo la sensible de las menores con muchos sostenidos), y la fuente de la partitura no las dibuja. En esos casos el fragmento sale en la siguiente tonalidad marcada, así que nunca se rompe nada; simplemente esas tonalidades salen menos.' : '');
  }

  function filtroFicha() {
    const alt = parseInt($('#ficha-alteraciones').value, 10);
    const niv = $('#ficha-nivel').value.split('-').map(Number);
    const mod = $('#ficha-modula').value;
    /* Ya no hay tope de ejercicios (decisión 191): la ficha se mide en compases. */
    const f = {
      modo: $('#ficha-modo').value,
      nivel: niv,
      alteraciones: [0, alt]
    };
    /* El tamaño, en compases (decisión 127). Con el mínimo en 0 se desactiva y manda el
       número de ejercicios, como antes. */
    const cmin = parseInt($('#ficha-compases-min').value, 10) || 0;
    const cmax = parseInt($('#ficha-compases-max').value, 10) || 0;
    if (cmin > 0 && cmax >= cmin) f.compases = [cmin, cmax];
    if ($('#ficha-leccion').value) f.leccion = $('#ficha-leccion').value;
    if ($('#ficha-modotonal').value) f.modoTonal = $('#ficha-modotonal').value;
    if (mod === 'si') f.modula = true; else if (mod === 'no') f.modula = false;
    if ($('#ficha-titulo').value.trim()) f.titulo = $('#ficha-titulo').value.trim();
    /* Opciones PROPIAS de la ficha (Diego, 22/9/2026): la ayuda con los grados, la
       respuesta modelo sobre el 6.º descendente y la fila de funciones se eligen aquí, no
       en el paso 3, porque una ficha se prepara para un grupo y un momento del curso. */
    const ayuda = $('#ficha-ayuda-grados').value;
    if (ayuda !== 'lista') f.ayudaGrados = ayuda;
    const pref = $('#ficha-preferir').value;
    if (pref) f.preferir = [pref];
    const fun = $('#ficha-funciones').value;
    if (fun === 'dadas' || fun === 'pedir') f.funciones = fun;
    const tons = $('#ficha-tonalidades').value;
    if (['dadas', 'pedir', 'no'].includes(tons)) f.tonalidades = tons;
    /* Armadura distinta de la tonalidad del fragmento (decisión 185): hasta 1, 2 o 3
       alteraciones de diferencia según el curso. Necesita semilla, como el transporte, para
       que el mismo enlace dé siempre los mismos fragmentos con armadura ajena. */
    const arm = parseInt($('#ficha-armadura').value, 10) || 0;
    const armPct = Math.max(0, Math.min(100, parseInt($('#ficha-armadura-pct').value, 10) || 0));
    if (arm > 0 && armPct > 0) { f.armaduraAjena = arm; f.armaduraPct = armPct; }
    /* El transporte (decisión 102). Con un curso elegido viaja el TOPE, que es más corto
       en el enlace y se adapta al modo de cada fragmento; «a medida» manda la lista. La
       semilla va también: es lo que hace que el mismo enlace dé siempre los mismos tonos
       sin guardar nada, y se renueva cada vez que se genera un enlace nuevo. */
    const curso = $('#ficha-curso').value;
    if (curso === 'x') { const t = tonosMarcados(); if (t.length) f.tonos = t; }
    else if (curso) f.maxAlt = parseInt(curso, 10);
    if (f.tonos || typeof f.maxAlt === 'number' || f.armaduraAjena) f.semilla = estado.semillaFicha || (estado.semillaFicha = Math.random().toString(36).slice(2, 7));
    // Las demás siguen viniendo del paso 3
    const op = opciones();
    if (!op.pedirRomano && f.modo !== 'soprano') f.pedirRomano = false;
    if (!op.reintentos) f.reintentos = false;
    if (op.gradosBajo === 'oculto') f.gradosBajo = 'oculto';
    if (op.gradosPrimero) f.gradosPrimero = true;
    if (f.modo === 'audicion' && op.bajoAudicion) f.mostrarBajo = true;
    if (f.modo === 'soprano') {
      f.acordes = acordesElegidos();
      if (!$('#formula-tst').checked) f.formulaTST = false;
    }
    return f;
  }

  function pintarBanco() {
    const hay = banco.length > 0;
    $('#banco-cuerpo').hidden = !hay;
    const caja = $('#banco-tabla'); if (caja) caja.hidden = !hay;
    $('#btn-banco-descargar').disabled = !hay;
    $('#btn-banco-vaciar').disabled = !hay;
    if (!hay) { $('#banco-resumen').textContent = 'El banco está vacío.'; pintarSemaforo(); return; }
    const lecs = Banco.lecciones(banco);
    const nombres = Banco.nombresDeLecciones(banco);
    const etiqueta = l => l + (nombres[l] ? ' · ' + nombres[l] : '');
    $('#banco-resumen').textContent = banco.length + ' fragmentos en el banco'
      + (lecs.length ? ' · ' + lecs.length + (lecs.length > 1 ? ' lecciones' : ' lección') : '') + '.';
    pintarSemaforo();        // ¿coincide con lo publicado? (decisión 85)
    pintarDesfase();         // ¿queda algo tocado que no esté subido? (decisión 78)
    /* Desplegable de lecciones: con el nombre, no solo el código, que es lo que dice qué
       acordes entran en la lección (conservando la elegida). */
    const selLec = $('#ficha-leccion'), antes = selLec.value;
    selLec.innerHTML = '<option value="">Todas las lecciones</option>';
    lecs.forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = etiqueta(l); selLec.appendChild(o); });
    selLec.value = lecs.includes(antes) ? antes : '';

    const filtro = filtroFicha();
    const lista = Banco.filtrar(banco, filtro);
    /* La cola de repaso (decisión 166) afecta a LA TABLA y a las flechas, no a la ficha:
       una ficha se reparte por lección y nivel, no por si el profesor ya lo ha firmado. */
    const repaso = ($('#banco-revision') || {}).value || '';
    const conAvisos = Banco.filtrar(banco, Object.assign({}, filtro, { conAvisos: true, cerrado: repaso }));
    const nCerrados = Banco.cuentaCerradas(banco);
    const elCont = $('#banco-cerrados');
    if (elCont) elCont.textContent = nCerrados + ' de ' + banco.length + ' fragmentos cerrados'
      + (nCerrados < banco.length ? ' · quedan ' + (banco.length - nCerrados) + ' por revisar.' : ' · el banco entero está firmado.');
    /* El recorrido va sobre LOS MISMOS fragmentos y en el mismo orden que la tabla —los
       que cumplen el filtro, incluidos los que tienen avisos—: si no, «siguiente» no
       llevaría a donde el ojo espera. Son los objetos del banco, no copias, para poder
       saber por cuál se va con indexOf. */
    estado.recorrido = { lista: conAvisos.slice(), modo: filtro.modo };
    $('#ficha-cuenta').textContent = lista.length
      ? lista.length + ' fragmentos cumplen el filtro; cada ficha tomará al azar los que quepan en ' + sitiosDeFicha(filtro, lista) + '.'
      : 'Ningún fragmento cumple el filtro. Prueba con otro tipo de ejercicio o menos restricciones (recuerda que la armonización de soprano necesita fragmentos con la melodía escrita).';
    if (conAvisos.length > lista.length) $('#ficha-cuenta').textContent += ' ' + (conAvisos.length - lista.length) + ' quedan fuera por tener alguna nota sin cifra posible (marcados con ⚠ abajo): revísalos o quítalos.';
    $('#btn-ficha').disabled = !lista.length;

    /* Repertorio de la lección elegida: es lo que verá el alumno y lo que hace posible
       mezclar lecciones en una ficha. Se puede rehacer con el del paso 3. */
    const pRep = $('#leccion-repertorio'), bRep = $('#btn-leccion-repertorio');
    if (filtro.leccion) {
      const r = Banco.repertorioDeLeccion(banco, filtro.leccion);
      const cifras = (r && r.cifras.length ? r.cifras : []).map(id => (Teoria.CIFRADOS[id] ? Teoria.CIFRADOS[id].nombre.split(' ')[0] : id));
      const acs = (r && r.acordes.length ? r.acordes : []).map(id => { const p = Ejercicios.par(id); return Teoria.gradoEscrito(p.romano, p.cifra) + (p.cifra === '53' ? '' : ' ' + Teoria.CIFRADOS[p.cifra].etiqueta); });
      pRep.innerHTML = '<b>Repertorio de ' + etiqueta(filtro.leccion) + '</b> — cifrados: '
        + (cifras.length ? cifras.join(', ') : '(todos)')
        + (acs.length ? '. Acordes para la armonización de soprano: ' + acs.join(', ') : '')
        + '. Es lo que se le muestra al alumno en cada fragmento de esta lección.';
      bRep.disabled = false;
      bRep.textContent = 'Dar a ' + filtro.leccion + ' el repertorio del paso 3';
    } else {
      pRep.textContent = 'Cada fragmento guarda el repertorio de su lección —los cifrados interválicos y los acordes marcados en el paso 3 cuando se añadió— y es el que se le muestra al alumno. Es lo que permite mezclar lecciones en una ficha. Elige una lección arriba para verlo o rehacerlo.';
      bRep.disabled = true;
      bRep.textContent = 'Dar a esta lección el repertorio del paso 3';
    }

    const cuerpo = $('#tabla-banco').querySelector('tbody');
    cuerpo.innerHTML = '';
    conAvisos.forEach(e => {
      const et = e.etiquetas || {};
      const tr = document.createElement('tr');
      const mal = !!(e.avisos && e.avisos.length);
      if (mal) tr.className = 'con-aviso';
      const cerrada = Banco.estaCerrada(e), rota = Banco.huellaRota(e);
      if (cerrada) tr.classList.add(rota ? 'sello-roto' : 'sello-cerrado');
      tr.innerHTML = '<td class="celda-sello" title="' + (cerrada ? (rota ? 'Cerrado el ' + e.cerrado + ', pero su contenido ya no coincide con la huella' : 'Cerrado el ' + e.cerrado) : 'Sin cerrar') + '">'
        + (cerrada ? (rota ? '⚠🔒' : '🔒') : '') + '</td>'
        + '<td class="celda-id"><code>' + (e.id || '—') + '</code></td>'
        + '<td title="' + ((mal ? e.avisos.join('; ') + ' — ' : '') + (nombres[e.leccion] || '')).replace(/"/g, '') + '">' + (mal ? '⚠ ' : '') + etiqueta(e.leccion || '—') + '</td>'
        + '<td>' + Teoria.nombreCorto(e.tonalidad) + (e.tonalidadSegura === false ? ' (?)' : '') + '</td>'
        + '<td>' + (e.compas || [4, 4]).join('/') + '</td>'
        + '<td>' + (et.notas || 0) + (et.modula ? ' · modula' : '') + '</td>'
        + '<td>' + (et.voces === 'ambas' ? 'bajo y melodía' : et.voces) + '</td>'
        + '<td>' + (et.cifras || []).map(c => (Teoria.CIFRADOS[c] ? Teoria.CIFRADOS[c].nombre.split(' ')[0] : c)).join(' ') + '</td>'
        + '<td class="celda-nivel"></td><td class="celda-acciones"></td>';
      const sel = document.createElement('select');
      sel.className = 'sel-nivel';
      sel.title = 'Nivel para este tipo de ejercicio. Cámbialo si no te convence el calculado.';
      [1, 2, 3, 4, 5].forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
      sel.value = Banco.nivel(e, filtro.modo);
      sel.addEventListener('change', () => {
        // El nivel que se guarda es el base: se descuenta el ajuste del tipo
        const ajuste = Banco.modoDe(filtro.modo).ajuste;
        e.nivelManual = Math.max(1, Math.min(5, parseInt(sel.value, 10) - ajuste));
        guardarBanco(); pintarBanco();
      });
      tr.querySelector('.celda-nivel').appendChild(sel);
      const acc = tr.querySelector('.celda-acciones');
      const bCargar = document.createElement('button');
      bCargar.type = 'button'; bCargar.className = 'enlace-texto'; bCargar.textContent = 'Cargar';
      bCargar.addEventListener('click', () => cargarDelBanco(e, filtro.modo));
      const bSello = document.createElement('button');
      bSello.type = 'button'; bSello.className = 'enlace-texto';
      bSello.textContent = cerrada ? 'Reabrir' : 'Cerrar';
      bSello.title = cerrada ? 'Quitarle el sello para poder cambiarlo' : 'Firmarlo: quedará con la fecha de hoy y nada del programa lo reescribirá';
      bSello.addEventListener('click', () => {
        if (cerrada) Banco.abrir(e); else Banco.cerrar(e);
        guardarBanco(); pintarBanco(); pintarSello();
      });
      const bQuitar = document.createElement('button');
      bQuitar.type = 'button'; bQuitar.className = 'enlace-texto'; bQuitar.textContent = 'Quitar';
      bQuitar.addEventListener('click', () => { banco = banco.filter(x => x !== e); guardarBanco(); pintarBanco(); });
      acc.appendChild(bCargar); acc.appendChild(document.createTextNode(' · '));
      acc.appendChild(bSello); acc.appendChild(document.createTextNode(' · ')); acc.appendChild(bQuitar);
      cuerpo.appendChild(tr);
    });
    pintarRecorrido();
  }

  /* ---------- Recorrido por los fragmentos del filtro (decisión 67) ----------
     Repasar 116 fragmentos volviendo a la tabla entre uno y otro es inviable; con dos
     flechas se hace de corrido. */
  function indiceRecorrido() {
    const r = estado.recorrido;
    if (!r || !r.lista.length || !estado.banco) return -1;
    return r.lista.indexOf(estado.banco.entrada);
  }

  function pintarRecorrido() {
    const caja = $('#recorrido');
    if (!caja) return;
    const r = estado.recorrido, i = indiceRecorrido();
    caja.hidden = i < 0;
    if (i < 0) return;
    const e = r.lista[i];
    $('#btn-recorrido-ant').disabled = i === 0;
    $('#btn-recorrido-sig').disabled = i === r.lista.length - 1;
    const mal = !!(e.avisos && e.avisos.length);
    $('#recorrido-cuenta').innerHTML = (mal ? '<b class="recorrido-aviso">⚠</b> ' : '')
      + 'Fragmento <b>' + (i + 1) + '</b> de ' + r.lista.length
      + ' · <code>' + (e.id || '—') + '</code> · ' + Teoria.nombreCorto(e.tonalidad)
      + (mal ? ' — ' + e.avisos.join('; ') : '');
  }

  /* ¿Se ha tocado algo desde que se cargó del banco? Se compara con lo que hay guardado:
     respuestas, tonalidad y modulaciones. Sin esto, pasar al siguiente se llevaría por
     delante una corrección a medias sin decir nada. */
  function hayCambiosSinGuardar() {
    const b = estado.banco;
    if (!b || !estado.respuestas) return false;
    const parte = b.entrada[b.voz];
    if (!parte || !Array.isArray(parte.respuestas)) return false;
    const mismas = JSON.stringify(parte.respuestas) === JSON.stringify(estado.respuestas);
    const ton = b.entrada.tonalidad || {};
    const mismaTon = ton.tonica === $('#tonica').value && ton.modo === $('#modo').value;
    const planas = m => JSON.stringify((m || []).map(x => ({ n: x.nota, t: x.tonalidad })));
    return !(mismas && mismaTon && planas(parte.modulaciones) === planas(estado.modulaciones));
  }

  function recorrer(salto) {
    const r = estado.recorrido, i = indiceRecorrido();
    if (i < 0) return;
    const j = i + salto;
    if (j < 0 || j >= r.lista.length) return;
    if (hayCambiosSinGuardar()
      && !confirm('Has cambiado este fragmento y no lo has guardado en el banco. Si pasas al siguiente se perderá lo que hayas tocado. ¿Seguir?')) return;
    cargarDelBanco(r.lista[j], r.modo);
  }

  /* ---------- Borrador ---------- */

  // Trae un fragmento del banco al paso 1, para revisarlo o retocarlo
  /* ---------- Ir a un fragmento por su identificador (decisión 73) ----------
     Con 131 fragmentos, la única manera de decir «mira este» era el Cmd+F del navegador.
     Ahora el id es una dirección: la casilla de búsqueda de la tabla y, sobre todo,
     `configurar.html#id=A3-4-04`, que se puede pegar en un mensaje y abre el fragmento
     cargado y listo para corregir. El fragmento se abre aunque no cumpla el filtro de la
     ficha —es lo que se quiere cuando a uno le mandan un enlace—, y entonces se avisa,
     porque el recorrido con las flechas sí va por el filtro. */
  function abrirPorId(id, silencioso) {
    const busca = String(id || '').trim().toUpperCase();
    if (!busca) return false;
    const e = banco.find(x => String(x.id || '').toUpperCase() === busca);
    if (!e) { if (!silencioso) aviso('No hay ningún fragmento con el id «' + id + '» en el banco.'); return false; }
    // Se abre con la voz que tenga: si no hay bajo, la melodía
    const modo = e[Banco.vozDeModo(filtroFicha().modo)] ? filtroFicha().modo : (e.bajo ? 'armonizar' : 'soprano');
    cargarDelBanco(e, modo);
    const enFiltro = Banco.filtrar(banco, Object.assign({}, filtroFicha(), { conAvisos: true })).some(x => x.id === e.id);
    if (!enFiltro) aviso('Abierto ' + e.id + '. Ojo: no cumple el filtro de arriba, así que las flechas de recorrido no pasan por él.', 7000);
    return true;
  }

  function cargarDelBanco(e, modo) {
    const parte = e[Banco.vozDeModo(modo)];
    if (!parte) { aviso('Ese fragmento no tiene esa voz escrita.'); return; }
    elegirModo(modo);
    ajustarCampoAudicion();
    /* El origen se apunta AQUÍ, antes de pintar nada (decisión 167). Estaba al final, y
       entonces la vista previa se dibujaba sin saber todavía de qué fragmento del banco
       venía: la otra voz llegaba un paso tarde y el cartel hablaba del fragmento anterior. */
    estado.banco = { entrada: e, voz: Banco.vozDeModo(modo) };
    estado.fragmentos = null; estado.fragmentoActual = null; estado.companera = null;
    $('#fragmentos').hidden = true;
    $('#texto-bajo').value = Teoria.textoDesdeBajo(parte.compases);
    $('#tonica').value = e.tonalidad.tonica;
    $('#modo').value = e.tonalidad.modo;
    $('#compas').value = (e.compas || [4, 4]).join('/');
    /* El repertorio de SU lección, no el que hubiera puesto (decisión 82). Faltaba, y tenía
       dos consecuencias feas: al revisar un fragmento se veían marcadas las cifras y los
       acordes de por defecto —el repertorio de tercero— en vez de los de su lección, de modo
       que el 6/4 cadencial no aparecía entre los de dominante ni aunque la lección fuera la
       del 6/4; y si se volvía a analizar, se analizaba con la paleta equivocada. */
    if (Array.isArray(e.leccionRepertorio) && e.leccionRepertorio.length)
      document.querySelectorAll('#repertorio-opciones input').forEach(i => { i.checked = e.leccionRepertorio.includes(i.value); });
    if (Array.isArray(e.leccionAcordes) && e.leccionAcordes.length) marcarAcordes(e.leccionAcordes);
    $('#titulo').value = e.titulo || (e.leccion ? e.leccion : 'Ejercicio');
    estado.modulaciones = (parte.modulaciones || []).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    estado.melodica = (parte.melodica || []).slice();          // 6.º grado elevado (179)
    estado.respuestas = null; estado.propuesta = null;
    estado.funciones = null;
    $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true;
    limpiarDireccion();
    leerBajo();
    /* Se traen las RESPUESTAS QUE HAY EN EL BANCO, no un análisis nuevo: así se ve
       exactamente lo que el alumno va a recibir, que es de lo que se trata al revisar.
       Quien quiera volver a empezar tiene el botón «Analizar». */
    if (estado.compases.length && Array.isArray(parte.respuestas)
        && Teoria.numeroDeNotas(estado.compases) === parte.respuestas.length) {
      estado.respuestas = parte.respuestas.map(a => a.slice());
      estado.propuesta = null;
      $('#paso-revision').hidden = false;
      pintarRevision();
      $('#paso-direccion').hidden = false;
    }
    pintarOrigenBanco();
    pintarRecorrido();
    guardarBorrador();
    abrirFragmento();
    /* Se aterriza en la partitura, no en el título del plegable: lo que se viene a hacer
       al pulsar «Cargar» es mirar el fragmento, y si no está a la vista hay que bajar. */
    const destino = (!$('#paso-revision').hidden && $('#vista-previa')) ? $('#vista-previa') : $('#paso-bajo');
    destino.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- Guardar en el banco lo revisado a mano ---------- */

  /* NADA REANALIZA UN FRAGMENTO DEL BANCO POR SU CUENTA (Diego, 28/9/2026: «si yo asigno
     algo a un fragmento no puedes modificarlo porque mi criterio es experto y el tuyo es
     ciego»). Cambiar los acordes de la lección, la casilla «Fórmula T S T» o la opción de
     funciones de la ficha disparaba un reanálisis automático que borraba EN SILENCIO las
     cifras asignadas a mano. Con un fragmento del banco en revisión ya no ocurre: se avisa
     y queda el botón «Analizar la melodía» para quien de verdad lo quiera. */
  function reanalizarSalvoBanco() {
    if (!estado.respuestas || !esSoprano()) return;
    if (estado.banco) {
      aviso('Este fragmento es del banco y conserva las cifras que le asignaste: no se ha vuelto a analizar. Si quieres que el motor las rehaga con lo que acabas de cambiar, pulsa «Analizar la melodía».', 10000);
      return;
    }
    analizar(true, true);
  }

  // Cartel del paso 4 que dice qué fragmento del banco se está revisando
  function pintarOrigenBanco() {
    const caja = $('#banco-origen');
    if (!caja) return;
    const b = estado.banco;
    caja.hidden = !b;
    if (!b) return;
    const e = b.entrada;
    $('#banco-origen-texto').textContent = 'Estás revisando el fragmento ' + (e.id || '(sin identificador)')
      + (e.leccion ? ' de la lección ' + Banco.etiquetaLeccion(e) : '')
      + ' · voz: ' + (b.voz === 'bajo' ? 'el bajo' : 'la melodía') + '.';
    pintarVozRevision();
    pintarSello();
  }

  /* QUÉ VOZ SE ESTÁ REVISANDO (decisión 175, Diego 29/9/2026: «¿dónde está ese desplegable
     que permite cambiar de lista?»). No existía. La voz la decidía el desplegable de «A ·
     Preparar una ficha», y solo en el instante de pulsar «Cargar»: con el fragmento ya
     abierto, cambiarlo no hacía nada, porque `cargarDelBanco` recibe el modo UNA vez. Y
     preparar una ficha y revisar el banco son dos tareas distintas metidas en el mismo
     control. Ahora hay un mando propio aquí, que recarga el mismo fragmento en la otra voz
     y no toca el filtro de arriba. */
  function pintarVozRevision() {
    const caja = $('#voz-revision'), b = estado.banco;
    if (!caja) return;
    caja.hidden = !b;
    if (!b) return;
    const e = b.entrada;
    [['bajo', $('#btn-voz-bajo')], ['soprano', $('#btn-voz-soprano')]].forEach(([voz, bot]) => {
      if (!bot) return;
      const hay = !!e[voz];
      bot.disabled = !hay;
      bot.title = hay ? (voz === b.voz ? 'Es la que estás revisando' : 'Abrir la otra voz de este mismo fragmento')
        : 'Este fragmento no tiene ' + (voz === 'bajo' ? 'el bajo' : 'la melodía') + ' escrita';
      bot.classList.toggle('activo', voz === b.voz);
      bot.setAttribute('aria-pressed', voz === b.voz ? 'true' : 'false');
    });
  }

  /* Cambiar de voz sin salir del fragmento. Se conserva el tipo de ejercicio elegido si ya
     corresponde a esa voz —análisis, audición y armonización de bajo van todos con el bajo—,
     para no cambiarle a Diego las opciones del paso 3 sin motivo. */
  function revisarVoz(voz) {
    const b = estado.banco;
    if (!b || voz === b.voz) return;
    const e = b.entrada;
    if (!e[voz]) { aviso('Este fragmento no tiene ' + (voz === 'bajo' ? 'el bajo escrito' : 'la melodía escrita') + '.'); return; }
    if (hayCambiosSinGuardar()
      && !confirm('Has cambiado este fragmento y no lo has guardado en el banco. Si cambias de voz se perderá lo que hayas tocado. ¿Seguir?')) return;
    const actual = modoElegido();
    const modo = voz === 'soprano' ? 'soprano' : (Banco.vozDeModo(actual) === 'bajo' ? actual : 'armonizar');
    cargarDelBanco(e, modo);
    aviso('Ahora revisas ' + (voz === 'bajo' ? 'el bajo' : 'la melodía') + ' de ' + (e.id || '') + '.');
  }

  /* ---------- El sello (decisión 166) ----------
     Cerrar un fragmento es firmarlo: queda la fecha y una huella de su contenido armónico,
     y a partir de ahí ninguna parte del programa lo reescribe. Reabrirlo es un gesto
     explícito. La huella no es una promesa mía: se comprueba al cargar el banco. */
  function pintarSello() {
    const caja = $('#banco-sello'), b = estado.banco;
    pintarSelloChip();
    if (!caja) return;
    const bCerrar = $('#btn-banco-cerrar'), bAbrir = $('#btn-banco-abrir'), bGuardar = $('#btn-banco-guardar');
    if (!b) { caja.hidden = true; return; }
    const e = b.entrada, cerrada = Banco.estaCerrada(e);
    caja.hidden = false;
    caja.dataset.estado = cerrada ? (Banco.huellaRota(e) ? 'rota' : 'cerrado') : 'abierto';
    caja.textContent = !cerrada
      ? 'Sin cerrar. Cuando lo des por bueno, ciérralo: quedará firmado con la fecha de hoy y nada del programa volverá a tocarlo.'
      : Banco.huellaRota(e)
        ? '⚠ CERRADO el ' + e.cerrado + ', pero su contenido NO coincide con la huella que se guardó. Algo lo ha cambiado después de firmarlo. Revísalo y vuelve a cerrarlo.'
        : '🔒 Cerrado el ' + e.cerrado + ' · huella ' + e.huella + '. Nada del programa lo reescribe.';
    if (bCerrar) { bCerrar.hidden = cerrada; }
    if (bAbrir) { bAbrir.hidden = !cerrada; }
    if (bGuardar) { bGuardar.disabled = cerrada; bGuardar.title = cerrada ? 'Este fragmento está cerrado: reábrelo si quieres cambiarlo.' : ''; }
  }

  /* La chapa del sello, pegada al título de la partitura (Diego, 29/9/2026). Repasar
     fragmento por fragmento obligaba a subir a la tabla para saber si este estaba cerrado.
     Ahora se ve aquí, junto a la música, y además se cierra y se reabre desde aquí. */
  function pintarSelloChip() {
    const chip = $('#sello-chip'), b = estado.banco;
    if (!chip) return;
    chip.hidden = !b;
    /* LA LECCIÓN, JUNTO AL TÍTULO (decisión 181, Diego 29/9/2026: «añade el nombre de la
       lección, para que sepa qué acordes se espera que use el estudiante»). Va delante de
       la chapa del candado, y su globo lleva la lista de acordes de esa lección, que es la
       respuesta a la pregunta de verdad. */
    const lec = $('#sello-leccion');
    if (lec) {
      const e0 = b && b.entrada;
      const txt = e0 ? Banco.etiquetaLeccion(e0) : '';
      lec.hidden = !txt;
      if (txt) {
        lec.textContent = txt;
        const ac = (e0.leccionAcordes || []).map(id => {
          try { const p = Ejercicios.par(id); return Teoria.gradoEscrito(p.romano, p.cifra)
            + (p.cifra === '53' || !Teoria.CIFRADOS[p.cifra] ? '' : ' ' + Teoria.CIFRADOS[p.cifra].etiqueta); }
          catch (err) { return id; }
        });
        lec.title = ac.length ? 'Acordes de esta lección: ' + ac.join(', ') : 'Esta lección no lleva lista de acordes.';
      }
    }
    if (!b) return;
    const e = b.entrada, cerrada = Banco.estaCerrada(e), rota = Banco.huellaRota(e);
    chip.dataset.estado = cerrada ? (rota ? 'rota' : 'cerrado') : 'abierto';
    chip.textContent = cerrada
      ? (rota ? '⚠🔒 ' + (e.id || '') + ' · cerrado el ' + e.cerrado + ', pero cambiado — reabrir' : '🔒 ' + (e.id || '') + ' · cerrado el ' + e.cerrado + ' — reabrir')
      /* Candado SOLO cuando está cerrado (Diego, 29/9/2026): el candado abierto confundía,
         porque un candado dibujado se lee como «aquí hay cerradura», esté o no echada. */
      : (e.id || '') + ' · sin cerrar — cerrar ahora';
    chip.title = cerrada
      ? 'Este fragmento está firmado por ti y nada del programa lo reescribe. Pulsa para reabrirlo.'
      : 'Este fragmento todavía no está firmado. Pulsa para cerrarlo.';
  }

  /* Cerrar el que se está revisando. Si la cola de repaso está puesta en «sin cerrar», el
     fragmento sale de la lista al firmarlo, así que se pasa solo al siguiente: repasar
     ciento y pico fragmentos ha de ser cerrar, mirar, cerrar. */
  function cerrarActual() {
    const b = estado.banco;
    if (!b) { aviso('No hay ningún fragmento del banco en revisión.'); return; }
    if (hayCambiosSinGuardar()) {
      aviso('Has cambiado algo y no lo has guardado. Pulsa antes «Guardar los cambios en el banco» (o vuelve a cargarlo para descartar) y ciérralo después.', 10000);
      return;
    }
    const r = estado.recorrido, i = indiceRecorrido();
    const siguiente = (r && i >= 0) ? (r.lista[i + 1] || r.lista[i - 1] || null) : null;
    Banco.cerrar(b.entrada);
    guardarBanco();
    pintarBanco();
    pintarSello();
    if (indiceRecorrido() < 0 && siguiente && estado.recorrido.lista.includes(siguiente)) {
      cargarDelBanco(siguiente, estado.recorrido.modo);
      aviso('Cerrado ' + (b.entrada.id || '') + '. Siguiente: ' + (siguiente.id || '') + '.');
    } else if (indiceRecorrido() < 0) {
      aviso('Cerrado ' + (b.entrada.id || '') + '. No quedan más fragmentos en la cola de repaso.', 8000);
    } else {
      aviso('Cerrado ' + (b.entrada.id || '') + ' · huella ' + b.entrada.huella + '.');
    }
  }

  function abrirActual() {
    const b = estado.banco;
    if (!b) return;
    Banco.abrir(b.entrada);
    guardarBanco();
    pintarBanco();
    pintarSello();
    aviso('Reabierto ' + (b.entrada.id || '') + ': ya se puede analizar y guardar. Acuérdate de volver a cerrarlo cuando lo des por bueno.', 8000);
  }

  /* La comprobación que hace innecesario fiarse: al cargar el banco se recalculan las
     huellas de todos los cerrados y se dice, con los identificadores delante, cuáles no
     cuadran. Si esto sale vacío, lo que hay es exactamente lo que se firmó. */
  function revisarHuellas(donde) {
    const malas = Banco.rotas(banco);
    if (!malas.length) return 0;
    setTimeout(() => aviso('⚠ ' + malas.length + (malas.length > 1 ? ' fragmentos cerrados no coinciden' : ' fragmento cerrado no coincide')
      + ' con la huella que se guardó al firmarlo' + (donde ? ' (' + donde + ')' : '') + ': '
      + malas.map(e => e.id || '(sin id)').join(', ') + '. Revísalos y vuelve a cerrarlos.', 20000), 400);
    return malas.length;
  }

  /* Escribe en el fragmento del banco lo que hay ahora en el configurador: la tonalidad,
     las modulaciones y las cifras admisibles de esta voz, con la modelo delante. Si la
     tonalidad o las modulaciones han cambiado, la OTRA voz se vuelve a analizar sola, que
     sus respuestas estaban hechas en la tonalidad de antes. Las etiquetas (cifras, grados,
     nivel, si modula) se recalculan a partir de lo guardado. */
  function guardarEnBanco() {
    const b = estado.banco;
    if (!b) { aviso('Este fragmento no viene del banco: usa «Añadir los fragmentos del archivo al banco».'); return; }
    if (!estado.respuestas || !estado.respuestas.length) { aviso('Analiza o revisa antes las respuestas.'); return; }
    if (estado.respuestas.some(a => !a.length)) { aviso('Hay notas sin ninguna cifra marcada: márcalas antes de guardar.'); return; }
    const e = b.entrada;
    if (!banco.includes(e)) { aviso('Ese fragmento ya no está en el banco.'); return; }
    // El sello (decisión 166): un fragmento cerrado no se sobrescribe sin reabrirlo antes
    if (Banco.estaCerrada(e)) {
      aviso('El fragmento ' + (e.id || '') + ' está cerrado (lo firmaste el ' + e.cerrado + '). Pulsa «Reabrir para cambiarlo» si de verdad quieres tocarlo.', 10000);
      return;
    }
    const ton = tonalidad();
    const mods = estado.modulaciones.filter(m => m && m.tonalidad && Number.isInteger(m.nota))
      .map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } }))
      .sort((x, y) => x.nota - y.nota);
    const cambiaTon = !Teoria.mismaTonalidad(e.tonalidad, ton)
      || JSON.stringify(mods) !== JSON.stringify((e[b.voz] && e[b.voz].modulaciones) || []);

    e.tonalidad = { tonica: ton.tonica, modo: ton.modo };
    e.tonalidadSegura = true;                       // la ha fijado el profesor a mano
    e.compas = compas();
    e[b.voz] = {
      compases: estado.compases.map(c => c.map(x => x.slice())),
      modulaciones: mods,
      respuestas: estado.respuestas.map(a => a.slice())
    };
    // El 6.º grado elevado (179) solo se guarda cuando lo hay: así no cambia nada de lo ya firmado
    const mel = (estado.melodica || []).filter(Number.isInteger).sort((x, y) => x - y);
    if (mel.length) e[b.voz].melodica = mel;

    // La otra voz, si la hay y ha cambiado la tonalidad: se vuelve a analizar en la nueva
    const otra = b.voz === 'bajo' ? 'soprano' : 'bajo';
    let rehecha = false;
    if (cambiaTon && e[otra]) {
      const r = Banco.analizarVoz(e[otra].compases, ton, mods, otra === 'soprano', {
        compas: e.compas, repertorio: e.leccionRepertorio, acordes: e.leccionAcordes,
        companera: Banco.companeraDe(e[otra].compases, e[b.voz].compases)
      });
      if (r) { e[otra] = { compases: e[otra].compases, modulaciones: mods.slice(), respuestas: r.respuestas }; rehecha = true; }
    }
    Banco.etiquetar(e);
    guardarBanco();
    pintarBanco();
    aviso('Guardado en el fragmento ' + (e.id || '') + ' del banco'
      + (rehecha ? ' (y se ha rehecho ' + (otra === 'bajo' ? 'el bajo' : 'la melodía') + ' en la tonalidad nueva)' : '')
      + '. Acuérdate de descargar banco.json y subirlo a GitHub.', 9000);
  }

  /* Si el banco de este navegador está vacío y la página está publicada, se lee el
     banco.json que hay junto a la aplicación: así el configurador publicado tiene los
     ejercicios sin que haya que cargar el archivo a mano. Desde el disco no se puede
     (el navegador no deja leer archivos vecinos), y entonces está el botón «Cargar». */
  /* Firma de un fragmento: lo que de verdad distingue una versión de otra —sus notas, sus
     cifras y su tonalidad—, sin depender del orden de las claves del JSON. */
  function firmaFragmento(e) {
    return [JSON.stringify((e.bajo && e.bajo.compases) || []),
      JSON.stringify((e.bajo && e.bajo.respuestas) || []),
      JSON.stringify((e.soprano && e.soprano.compases) || []),
      JSON.stringify((e.soprano && e.soprano.respuestas) || []),
      JSON.stringify(e.tonalidad || {}),
      JSON.stringify(e.leccionRepertorio || []),
      JSON.stringify(e.leccionAcordes || [])].join('~');
  }
  const firmasPorId = lista => {
    const m = {};
    (lista || []).forEach(e => { if (e && e.id) m[e.id] = firmaFragmento(e); });
    return m;
  };

  /* ---------- Cambios sin publicar (decisión 78) ----------
     El banco vive en este navegador y solo llega a los alumnos cuando se descarga como
     `banco.json` y se sube a GitHub. Entre una cosa y otra es facilísimo olvidarse, y
     entonces el profesor cree que sus correcciones están repartidas y no lo están. Al
     arrancar se guarda la firma del banco PUBLICADO, y a partir de ahí se compara con lo
     que hay aquí después de cada cambio.
     Solo funciona con la aplicación publicada: desde el disco no hay con qué comparar. */
  function comparaConPublicado() {
    const pub = estado.publicado;
    if (!pub) return null;
    const aqui = firmasPorId(banco);
    const nuevos = [], modificados = [], faltan = [];
    Object.keys(aqui).forEach(id => {
      if (!(id in pub.firmas)) nuevos.push(id);
      else if (aqui[id] !== pub.firmas[id]) modificados.push(id);
    });
    Object.keys(pub.firmas).forEach(id => { if (!(id in aqui)) faltan.push(id); });
    return { nuevos, modificados, faltan, sinPublicar: nuevos.length + modificados.length + faltan.length };
  }

  const listaCorta = ids => ids.slice(0, 6).join(', ') + (ids.length > 6 ? ' y ' + (ids.length - 6) + ' más' : '');

  /* ¿Quién va por delante? (decisión 79)
     Cuando el PUBLICADO tiene fragmentos que aquí no están, lo más probable con diferencia
     es que la copia de este navegador se haya quedado vieja: uno no borra fragmentos por
     accidente, pero sí abre el configurador en un navegador que lleva semanas sin mirar.
     Cuando los fragmentos de más están AQUÍ, es al revés. Y si solo cambia lo que dicen
     algunos, no hay manera de saberlo y no se finge que sí. */
  function direccionDesfase(d) {
    if (d.faltan.length && !d.nuevos.length) return 'atrasado';   // al publicado le sobran: este navegador va detrás
    if (d.nuevos.length && !d.faltan.length) return 'adelantado'; // aquí hay cosas que no están subidas
    return 'incierto';
  }

  /* ---------- El semáforo del banco (decisión 85) ----------
     El aviso de desfase solo sale cuando hay desfase, y eso deja sin contestar la
     pregunta que de verdad se hace uno al abrir el configurador: «lo que estoy viendo,
     ¿es lo que ven los alumnos?». Callar puede querer decir «todo en orden» o «ni lo he
     mirado», y la diferencia importa. El semáforo está siempre y dice siempre algo.
       verde  = idénticos
       ámbar  = aquí hay cambios que no están subidos
       rojo   = esta copia va por detrás (subirla borraría fragmentos publicados)
       gris   = no hay con qué comparar (desde el disco, o sin banco publicado)
     El botón «Igualar» hace lo que toca en cada caso, no siempre lo mismo. */
  function pintarSemaforo() {
    const caja = $('#banco-semaforo');
    if (!caja) return;
    const txt = $('#banco-semaforo-texto');
    const bIg = $('#btn-semaforo-igualar'), bRe = $('#btn-semaforo-recomprobar');
    const d = comparaConPublicado();
    bIg.hidden = true;
    bRe.hidden = location.protocol === 'file:';
    if (!estado.publicado) {
      caja.dataset.estado = 'sin';
      txt.textContent = location.protocol === 'file:'
        ? 'Abierto desde el disco: no hay banco publicado con el que comparar. Lo que cambies aquí solo está aquí.'
        : (estado.publicadoFallo ? 'No se ha podido leer el banco publicado: no hay con qué comparar.'
          : 'Comprobando el banco publicado…');
      return;
    }
    const pub = 'publicado: ' + estado.publicado.n + (estado.publicado.n === 1 ? ' fragmento' : ' fragmentos')
      + (estado.publicado.creado ? ' del ' + estado.publicado.creado : '');
    if (!d || !d.sinPublicar) {
      caja.dataset.estado = 'verde';
      txt.textContent = 'Al día: este navegador y lo que ven los alumnos son lo mismo (' + pub + ').';
      return;
    }
    const dir = direccionDesfase(d);
    const cuenta = n => n + (n === 1 ? ' fragmento' : ' fragmentos');
    if (dir === 'atrasado') {
      caja.dataset.estado = 'rojo';
      txt.textContent = 'Esta copia va por detrás: le faltan ' + cuenta(d.faltan.length)
        + ' que sí están publicados. No la subas (' + pub + ').';
      bIg.textContent = 'Traer el banco publicado en GitHub';
      bIg.hidden = false;
      bIg.onclick = () => cargarPublicado();
    } else if (dir === 'adelantado') {
      caja.dataset.estado = 'ambar';
      txt.textContent = 'Tienes ' + cuenta(d.nuevos.length) + ' sin subir: los alumnos todavía ven el banco anterior ('
        + pub + ').';
      bIg.textContent = 'Descargar banco.json para subirlo';
      bIg.hidden = false;
      bIg.onclick = () => descargarBanco();
    } else {
      caja.dataset.estado = 'ambar';
      const uno = n => n === 1;
      txt.textContent = 'No coinciden: ' + (d.modificados.length
        ? cuenta(d.modificados.length) + (uno(d.modificados.length) ? ' dice' : ' dicen') + ' cosas distintas aquí y en lo publicado'
        : 'el contenido no es el mismo')
        + (d.nuevos.length ? ', ' + cuenta(d.nuevos.length) + (uno(d.nuevos.length) ? ' solo está aquí' : ' solo están aquí') : '')
        + (d.faltan.length ? ', ' + cuenta(d.faltan.length) + (uno(d.faltan.length) ? ' solo está publicado' : ' solo están publicados') : '')
        + '. Mira el detalle en «El banco de fragmentos» (' + pub + ').';
    }
  }

  /* Volver a comprobar sin recargar la página. Es el paso que faltaba: se descarga
     banco.json, se sube a GitHub y el aviso seguía ahí, porque la foto de lo publicado
     se tomaba una sola vez al arrancar. Con `?t=` se salta la caché, que es lo que hacía
     que recargar tampoco sirviera hasta pasado un rato. */
  async function recomprobarPublicado() {
    const b = $('#btn-semaforo-recomprobar');
    if (b) { b.disabled = true; b.textContent = 'Comprobando…'; }
    const ok = await leerPublicado();
    if (b) { b.disabled = false; b.textContent = 'Volver a comprobar'; }
    pintarSemaforo();
    pintarDesfase();
    if (!ok) { aviso('No se ha podido leer el banco publicado.', 6000); return; }
    const d = comparaConPublicado();
    aviso(d && d.sinPublicar
      ? 'Comprobado: sigue sin coincidir con lo publicado.'
      : 'Comprobado: este navegador y el banco publicado son lo mismo.', 6000);
  }

  function cargarPublicado() {
    const lista = estado.publicado && estado.publicado.lista;
    if (!lista) { aviso('No hay banco publicado que cargar.'); return; }
    banco = lista.map(e => JSON.parse(JSON.stringify(e)));
    guardarBanco();
    pintarBanco();
    aviso('Cargado el banco publicado: ' + banco.length + ' fragmentos.', 6000);
  }

  function pintarDesfase() {
    const caja = $('#banco-desfase');
    if (!caja) return;
    const d = comparaConPublicado();
    if (!d || !d.sinPublicar) { caja.hidden = true; return; }
    if (caja.dataset.cerrado === '1') return;        // «Ahora no»: vuelve a salir al recargar
    const dir = direccionDesfase(d);
    const ul = $('#banco-desfase-lista');
    ul.innerHTML = '';
    const linea = txt => { const li = document.createElement('li'); li.textContent = txt; ul.appendChild(li); };
    /* Del contenido distinto NO se dice «lo has cambiado tú»: puede ser que la copia de
       aquí sea la vieja, y afirmarlo llevaba a subir precisamente la mala. */
    if (d.modificados.length) linea('Dicen cosas distintas aquí y en el publicado: ' + listaCorta(d.modificados)
      + (d.modificados.length > 1 ? ' (' + d.modificados.length + ' fragmentos)' : ''));
    if (d.nuevos.length) linea('Solo están aquí, no en el publicado: ' + listaCorta(d.nuevos));
    if (d.faltan.length) linea('Están en el publicado y aquí no: ' + listaCorta(d.faltan));
    linea('En total: ' + banco.length + ' fragmentos aquí y ' + estado.publicado.n + ' publicados'
      + (estado.publicado.creado ? ', del ' + estado.publicado.creado : '') + '.');

    const titulo = $('#banco-desfase-titulo'), pista = $('#banco-desfase-pista');
    const bDesc = $('#btn-desfase-descargar'), bCarg = $('#btn-desfase-cargar');
    bDesc.classList.toggle('primario', dir === 'adelantado');
    bCarg.classList.toggle('primario', dir === 'atrasado');
    caja.classList.toggle('peligro', dir === 'atrasado');
    if (dir === 'atrasado') {
      titulo.textContent = 'La copia de este navegador se ha quedado atrás.';
      pista.textContent = 'El banco publicado tiene fragmentos que aquí no están, así que lo más seguro es que esta copia sea la vieja. Carga el publicado. Ojo: si descargas y subes lo de aquí, esos fragmentos desaparecerán para los alumnos.';
    } else if (dir === 'adelantado') {
      titulo.textContent = 'Tienes cambios sin subir.';
      pista.textContent = 'Aquí hay fragmentos que no están publicados. Descarga banco.json y súbelo a GitHub: hasta entonces los alumnos siguen viendo el banco anterior.';
    } else {
      titulo.textContent = 'El banco de este navegador no coincide con el publicado.';
      pista.textContent = 'Hay el mismo número de fragmentos pero alguno dice cosas distintas, así que la aplicación no puede saber cuál es el bueno. Si lo que vale es lo de aquí, descárgalo y súbelo; si ya subiste tus cambios desde otro sitio, carga el publicado.';
    }
    caja.hidden = false;
  }


  /* El banco publicado (decisión 77). Hasta ahora, si este navegador ya tenía un banco
     guardado, el publicado NI SE MIRABA: se subía una versión nueva a GitHub y el
     configurador seguía enseñando la vieja, sin decir nada. Ahora se compara siempre.
     Lo que NO se hace es sustituirlo solo: lo que hay en el navegador puede llevar
     correcciones todavía sin descargar, y machacarlas sería perderlas. Así que se avisa
     y se deja elegir. */
  /* Lee banco.json de al lado y guarda la foto de lo publicado. Devuelve true si lo ha
     conseguido. `?t=` esquiva la caché del navegador y la de GitHub Pages: sin eso, el
     archivo recién subido tardaba en verse y parecía que subirlo no había servido. */
  async function leerPublicado() {
    if (location.protocol === 'file:') return false;
    try {
      const base = location.href.split('#')[0].replace(/[^/]*$/, '');
      const r = await fetch(base + 'banco.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return false;
      const datos = await r.json();
      const lista = Banco.leerArchivo(datos);
      if (!lista.length) return false;
      estado.publicado = { firmas: firmasPorId(lista), n: lista.length, creado: datos.creado || '', lista };
      estado.publicadoFallo = false;
      return true;
    } catch (e) { return false; }   // no hay banco publicado todavía: no es un error
    finally { if (!estado.publicado) estado.publicadoFallo = true; }
  }

  async function bancoPublicado() {
    $('#btn-semaforo-recomprobar').onclick = () => recomprobarPublicado();
    if (location.protocol === 'file:') { pintarSemaforo(); return; }
    const ok = await leerPublicado();
    if (!ok) { pintarSemaforo(); return; }
    if (!banco.length) {                                   // este navegador no tenía nada
      cargarPublicado();
      if (reintentarHash) reintentarHash(false);   // el enlace #id= esperaba a tener banco
      return;
    }
    pintarSemaforo();
    const d = comparaConPublicado();
    if (d && !d.sinPublicar) return;                        // el mismo: nada que decir
    pintarDesfase();
    aviso('El banco de este navegador no coincide con el publicado. Baja a «El banco de fragmentos».', 12000);
    $('#btn-desfase-descargar').onclick = () => descargarBanco();
    $('#btn-desfase-cargar').onclick = () => cargarPublicado();
    $('#btn-desfase-cerrar').onclick = () => {
      const c = $('#banco-desfase'); c.dataset.cerrado = '1'; c.hidden = true;
    };
  }

  /* Cuántos ejercicios tendrá la ficha, y cuántos compases (decisión 191). Con presupuesto
     de compases no se sabe de antemano —depende de cuáles toquen—, así que se estima con la
     media de compases de los que cumplen el filtro. */
  function numSitios(filtro, lista) {
    const n = (lista || []).length;
    if (!n) return 0;
    if (!filtro.compases) return Math.max(1, Math.min(n, filtro.n || 8));
    const med = lista.reduce((t, e) => t + Banco.compasesDe(e), 0) / n;
    return Math.max(1, Math.min(n, Math.round(filtro.compases[1] / Math.max(1, med))));
  }
  function sitiosDeFicha(filtro, lista) {
    const k = numSitios(filtro, lista);
    if (!k) return '0 ejercicios';
    const cuantos = k + (k === 1 ? ' ejercicio' : ' ejercicios');
    return filtro.compases
      ? filtro.compases[0] + ' a ' + filtro.compases[1] + ' compases (unos ' + cuantos + ')'
      : cuantos;
  }

  function generarFicha() {
    const filtro = filtroFicha();
    /* AL ALUMNO SOLO SE LE SIRVEN FRAGMENTOS CERRADOS (decisión 182). La lista con la que se
       cuenta aquí —los tonos que saldrán, cuántos sitios tiene la ficha— ha de ser esa
       misma, o el configurador prometería lo que el enlace no da. */
    const todos = Banco.filtrar(banco, filtro);
    const lista = Banco.filtrar(banco, Object.assign({}, filtro, { cerrado: 'si' }));
    if (!todos.length) { aviso('Ningún fragmento cumple el filtro.'); return; }
    if (!lista.length) {
      aviso('Cumplen el filtro ' + todos.length + ' fragmentos, pero NINGUNO está cerrado, y al alumno '
        + 'solo se le sirven los cerrados. Ciérralos en el banco y vuelve a generar el enlace.', 12000);
      return;
    }
    if (lista.length < todos.length) {
      aviso('Cumplen el filtro ' + todos.length + ' fragmentos y están cerrados ' + lista.length
        + ': el alumno solo verá esos ' + lista.length + '. Los demás salen en cuanto los cierres, '
        + 'sin tocar el enlace.', 11000);
    }
    const url = baseAlumno(filtro.modo) + '#f=' + Banco.codificar(filtro);
    $('#ficha-direccion').value = url;
    $('#btn-ficha-copiar').disabled = false;
    const abrir = $('#btn-ficha-abrir');
    abrir.href = url; abrir.setAttribute('aria-disabled', 'false');
    /* En qué tonos va a salir (decisión 102). Es determinista, así que se puede enseñar
       aquí mismo: son los que verá el alumno con ESTE enlace. Se mira sobre todos los
       fragmentos del filtro, no sobre los n que toquen, porque el sorteo de cuáles
       entran sí es al azar y cambia en cada alumno. */
    /* En qué tonos van a salir (decisiones 102 y 109). El reparto es por POSICIÓN en la
       ficha, no por fragmento, así que lo que se puede anticipar es la vuelta completa:
       el 1.º saldrá en este tono, el 2.º en este otro… y sin repetir mientras queden
       tónicas libres. Cada tono se enseña en sus dos modos, porque el fragmento que
       toque decide con cuál de las dos listas se cuenta. */
    const p = $('#ficha-tonos-reparto');
    if (filtro.tonos || typeof filtro.maxAlt === 'number') {
      // Cuántos sitios tiene la ficha (decisiones 127 y 191)
      const n = Math.max(1, numSitios(filtro, lista));
      const paso = [];
      for (let k = 0; k < n; k++) {
        const may = Banco.tonicaEn(filtro, 'mayor', k), men = Banco.tonicaEn(filtro, 'menor', k);
        const txt = [may && Teoria.nombreCorto({ tonica: may, modo: 'mayor' }),
          men && Teoria.nombreCorto({ tonica: men, modo: 'menor' })].filter(Boolean).join(' / ');
        paso.push((k + 1) + '.º ' + txt);
      }
      p.innerHTML = '<b>Los tonos de esta ficha, por orden:</b> ' + paso.join(' · ')
        + '. Según sea mayor o menor el fragmento que toque en cada sitio, sale uno u otro de los dos. '
        + 'No se repite ninguno mientras queden libres; para repartirlos de otra manera, cambia cualquier opción y vuelve a generar el enlace.';
      p.hidden = false;
    } else p.hidden = true;
    /* Sin título, la ficha llega a la hoja de calificaciones con un nombre automático
       (decisión 109). Es estable y distingue unas fichas de otras, pero no dice de qué va,
       y es el nombre que vas a tener que reconocer dentro de tres meses. Se avisa aquí,
       con el nombre que le va a tocar, en vez de dejarlo a que uno se acuerde. */
    if (!filtro.titulo) {
      // Cuántos sitios tiene la ficha (decisiones 127 y 191)
      const n = Math.max(1, numSitios(filtro, lista));
      const auto = [filtro.leccion || 'Varias lecciones', Ejercicios.MODOS[filtro.modo] || 'Ejercicios',
        n + (n === 1 ? ' ejercicio' : ' ejercicios')].join(' · ');
      aviso('Esta ficha va sin título: en tu hoja de calificaciones saldrá como «' + auto
        + ' · (código)». Ponle uno —«Ficha 1 · El 6/4 cadencial»— y vuelve a generarla si quieres reconocerla de un vistazo.', 11000);
    }
    // Desde el disco el enlace no le sirve a nadie: las fichas necesitan la aplicación publicada
    if (location.protocol === 'file:') aviso('Ojo: esta dirección es de tu disco. Las fichas hay que generarlas desde el configurador publicado en GitHub, porque necesitan leer banco.json del servidor.', 10000);
  }

  /* ---------- Recogida de resultados (envio.json) ----------
     Solo hay un dato que configurar: la dirección plantilla del formulario, la que
     imprime CrearFormularioPractica.gs con sus marcas ZZ…ZZ. Se guarda en el navegador
     para no tener que pegarla otra vez, y se descarga como envio.json. */
  const CLAVE_ENVIO = 'armonizar.envio';
  /* La hoja de respuestas se guarda SOLO en este navegador (Diego, 28/9/2026). No entra en
     `envio.json` a propósito: ese archivo se sube a GitHub, y la dirección de la hoja es
     suya. Aquí basta con tenerla a mano para el botón de la cabecera. */
  const CLAVE_RESPUESTAS = 'armonizar.respuestas';

  const hojaValida = t => {
    t = (t || '').trim();
    return /^https:\/\/docs\.google\.com\/(spreadsheets|document)\//.test(t) || /^https:\/\/drive\.google\.com\//.test(t);
  };

  function conectarResultados() {
    const campo = $('#envio-respuestas'), boton = $('#btn-resultados');
    if (!campo || !boton) return;
    try { campo.value = localStorage.getItem(CLAVE_RESPUESTAS) || ''; } catch (e) { /* sin almacenamiento */ }
    const revisar = () => {
      const t = campo.value.trim();
      const ok = hojaValida(t);
      boton.hidden = !ok;
      if (ok) boton.href = t;
      campo.setAttribute('aria-invalid', t && !ok ? 'true' : 'false');
      try { localStorage.setItem(CLAVE_RESPUESTAS, ok ? t : ''); } catch (e) { /* nada */ }
    };
    campo.addEventListener('input', revisar);
    revisar();
  }

  function plantillaValida(t) {
    t = (t || '').trim();
    return t.indexOf('docs.google.com/forms/') > 0 && /ZZ[A-Z]+ZZ/.test(t) && t.indexOf('ZZCODIGOZZ') > 0;
  }

  function conectarEnvio() {
    const campo = $('#envio-plantilla'), btn = $('#btn-envio-descargar'), est = $('#envio-estado');
    if (!campo) return;
    try { campo.value = localStorage.getItem(CLAVE_ENVIO) || ''; } catch (e) { /* sin almacenamiento */ }
    const revisar = () => {
      const t = campo.value.trim();
      const ok = plantillaValida(t);
      btn.disabled = !ok;
      est.textContent = !t ? 'Pega aquí la dirección que imprime el script.'
        : ok ? 'Dirección correcta: ' + (t.match(/ZZ[A-Z]+ZZ/g) || []).length + ' campos reconocidos.'
          : 'Esto no parece la dirección plantilla: tiene que ser la del formulario y llevar las marcas ZZ…ZZ sin tocar.';
      if (ok) { try { localStorage.setItem(CLAVE_ENVIO, t); } catch (e) { /* nada */ } }
    };
    campo.addEventListener('input', revisar);
    revisar();
    conectarResultados();
    btn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ plantilla: campo.value.trim() }, null, 2) + '\n'], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'envio.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      aviso('envio.json descargado. Súbelo a GitHub junto a banco.json.', 8000);
    });
  }

  function descargarBanco() {
    /* Red de seguridad (decisión 79). Descargar es el paso previo a subir, y subir un banco
       más corto que el publicado borra fragmentos para los alumnos sin que nadie lo note.
       Si este navegador va por detrás, se pregunta antes. */
    const d = comparaConPublicado();
    if (d && d.faltan.length) {
      const msg = 'Cuidado: el banco publicado tiene ' + d.faltan.length
        + (d.faltan.length > 1 ? ' fragmentos que aquí no están (' : ' fragmento que aquí no está (')
        + listaCorta(d.faltan) + ').\n\nSi subes este archivo a GitHub, '
        + (d.faltan.length > 1 ? 'desaparecerán' : 'desaparecerá') + ' para los alumnos.'
        + '\n\nSi lo que querías era ponerte al día, cancela y pulsa «Cargar el banco publicado en GitHub».'
        + '\n\n¿Descargar de todas formas?';
      if (!confirm(msg)) return;
    }
    const blob = new Blob([JSON.stringify(Banco.archivo(banco), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'banco.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function cargarBancoArchivo(file) {
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const lista = Banco.leerArchivo(lector.result);
        let nuevos = 0, fundidos = 0;
        lista.forEach(e => {
          const viejo = mismoQue(e);
          if (viejo) { if (fundir(viejo, e)) fundidos++; return; }
          banco.push(e); nuevos++;
        });
        guardarBanco(); pintarBanco();
        aviso(nuevos + ' fragmentos añadidos al banco' + (fundidos ? ', ' + fundidos + ' completados' : '') + ' (los repetidos se han omitido).');
        revisarHuellas('al cargar el archivo');
      } catch (err) { aviso('No se ha podido leer el banco: ' + err.message); }
    };
    lector.readAsText(file);
  }

  function arranqueBanco() {
    const sel = $('#ficha-modo');
    Banco.MODOS.forEach(m => { const o = document.createElement('option'); o.value = m.id; o.textContent = m.nombre; sel.appendChild(o); });
    sel.value = 'armonizar';
    leerBanco();
    pintarBanco();
    revisarHuellas('al abrir el configurador');      // decisión 166: comprobar, no fiarse
    /* El filtro guardado se repone DESPUÉS de llenar los desplegables (el de lecciones
       lo llena pintarBanco con las que hay en el banco), y se vuelve a pintar con él. */
    const g = estado.fichaGuardada;
    if (g) {
      Object.keys(g).forEach(id => {
        const e = $(id);
        if (!e || g[id] === undefined || g[id] === '') return;
        if (e.tagName === 'SELECT' && ![...e.options].some(o => o.value === g[id])) return;
        e.value = g[id];
      });
      pintarBanco();
      ajustarCampoAudicion();
    }
    /* Siempre, tenga o no banco este navegador: si no lo tiene lo carga, y si lo tiene
       compara con el publicado y avisa si no coinciden (decisión 77). */
    bancoPublicado();
    $('#btn-banco-anadir').addEventListener('click', anadirAlBanco);
    $('#btn-banco-guardar').addEventListener('click', guardarEnBanco);
    $('#btn-banco-cerrar').addEventListener('click', cerrarActual);
    $('#btn-banco-abrir').addEventListener('click', abrirActual);
    $('#btn-voz-bajo').addEventListener('click', () => revisarVoz('bajo'));
    $('#btn-voz-soprano').addEventListener('click', () => revisarVoz('soprano'));
    $('#sello-chip').addEventListener('click', () => {
      if (!estado.banco) return;
      if (Banco.estaCerrada(estado.banco.entrada)) abrirActual(); else cerrarActual();
    });
    $('#banco-revision').addEventListener('change', pintarBanco);
    $('#btn-banco-soltar').addEventListener('click', () => { estado.banco = null; pintarOrigenBanco(); guardarBorrador(); });
    $('#btn-banco-descargar').addEventListener('click', descargarBanco);
    $('#btn-banco-cargar').addEventListener('click', () => $('#banco-archivo').click());
    $('#banco-archivo').addEventListener('change', ev => { if (ev.target.files[0]) cargarBancoArchivo(ev.target.files[0]); ev.target.value = ''; });
    $('#btn-banco-vaciar').addEventListener('click', () => {
      if (!banco.length) return;
      if (!confirm('¿Vaciar el banco? Se borran los ' + banco.length + ' fragmentos guardados en este navegador. Descárgalo antes si quieres conservarlo.')) return;
      banco = []; guardarBanco(); pintarBanco();
    });
    conectarEnvio();
    $('#btn-leccion-repertorio').addEventListener('click', () => {
      const lec = $('#ficha-leccion').value;
      if (!lec) return;
      const cifras = repertorio(), acs = acordesElegidos();
      let n = 0;
      banco.forEach(e => { if (e.leccion === lec) { e.leccionRepertorio = cifras.slice(); e.leccionAcordes = acs.slice(); n++; } });
      guardarBanco(); pintarBanco();
      aviso('Repertorio de ' + lec + ' actualizado en ' + n + ' fragmentos. Descarga el banco.json y vuelve a subirlo.', 7000);
    });
    /* El atajo se escribe con la tecla de cada sistema: en el Mac, Option (⌥); en lo
       demás, Alt. Es la misma tecla para el navegador, pero no en el teclado. */
    const pistas = [(navigator.userAgentData && navigator.userAgentData.platform) || '',
      navigator.platform || '', navigator.userAgent || ''].join(' ');
    const esMac = /Mac|iPhone|iPad/.test(pistas);
    const mod = esMac ? '⌥' : 'Alt +';
    $('#atajo-ant').textContent = mod + ' ←';
    $('#atajo-sig').textContent = mod + ' →';
    $('#btn-recorrido-ant').title += ' (' + mod + ' ←)';
    $('#btn-recorrido-sig').title += ' (' + mod + ' →)';
    $('#btn-recorrido-ant').addEventListener('click', () => recorrer(-1));
    $('#btn-recorrido-sig').addEventListener('click', () => recorrer(1));
    /* Alt + flechas para repasar de corrido. Con Alt para no estorbar al escribir, y
       nunca cuando el foco está en un campo de texto o en un desplegable. */
    document.addEventListener('keydown', ev => {
      if (!ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      const t = ev.target, et = t && t.tagName;
      if (et === 'INPUT' || et === 'TEXTAREA' || et === 'SELECT' || (t && t.isContentEditable)) return;
      if ($('#recorrido').hidden) return;
      ev.preventDefault();
      recorrer(ev.key === 'ArrowRight' ? 1 : -1);
    });
    $('#btn-ficha').addEventListener('click', generarFicha);
    $('#btn-ficha-copiar').addEventListener('click', () => copiar($('#ficha-direccion').value, 'Dirección de la ficha copiada.'));
    $('#btn-ficha-abrir').addEventListener('click', ev => { if ($('#btn-ficha-abrir').getAttribute('aria-disabled') === 'true') ev.preventDefault(); });
    ['#ficha-modo', '#ficha-leccion', '#ficha-modotonal', '#ficha-alteraciones', '#ficha-nivel', '#ficha-modula',
     '#ficha-compases-min', '#ficha-compases-max',
     '#ficha-ayuda-grados', '#ficha-preferir', '#ficha-funciones', '#ficha-tonalidades',
     '#ficha-armadura', '#ficha-armadura-pct'].forEach(id => {
      $(id).addEventListener('change', () => { pintarBanco(); limpiarFicha(); ajustarCampoAudicion(); guardarBorrador(); });
    });
    // El título de la ficha no filtra nada, pero sí conviene no perderlo al recargar
    $('#ficha-titulo').addEventListener('input', () => { limpiarFicha(); guardarBorrador(); });
    /* Las tonalidades del transporte (decisión 102). Cambiar el curso vuelve a marcar
       las tónicas que caben; tocar una tónica ya pasa el curso a «a medida» (lo hace el
       propio manejador de la casilla). Cada cambio invalida la dirección generada y,
       de paso, renueva la semilla: son otras tonalidades, es otra ficha. */
    $('#ficha-curso').addEventListener('change', () => {
      estado.semillaFicha = null;
      pintarTonos(true); limpiarFicha(); guardarBorrador();
    });
    pintarTonos(true);

    /* Búsqueda por id: la casilla, el botón y el Enter hacen lo mismo. */
    const buscar = () => { if (abrirPorId($('#banco-buscar').value)) $('#banco-buscar').value = ''; };
    $('#btn-banco-buscar').addEventListener('click', buscar);
    $('#banco-buscar').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); buscar(); } });

    /* `configurar.html#id=A3-4-04` abre ese fragmento al cargar la página, y también si se
       cambia el hash con la página ya abierta (así funcionan varios enlaces seguidos de una
       lista). El hash se limpia después para que recargar no vuelva a saltar al fragmento. */
    const porHash = silencioso => {
      const m = /^#id=(.+)$/i.exec(location.hash || '');
      if (!m) return;
      if (abrirPorId(decodeURIComponent(m[1]), silencioso)) history.replaceState(null, '', location.pathname + location.search);
    };
    window.addEventListener('hashchange', () => porHash(false));
    reintentarHash = porHash;
    porHash(false);

    /* Último recordatorio: al cerrar la pestaña con cambios sin subir (decisión 78). El
       navegador enseña su propio texto, no el nuestro; lo que importa es que pregunte. */
    window.addEventListener('beforeunload', ev => {
      const d = comparaConPublicado();
      if (!d || !d.sinPublicar) return;
      /* Solo cuando hay algo AQUÍ que perder. Si esta copia es la que va por detrás, no hay
         nada que salvar y preguntar en cada salida sería una lata (decisión 79). */
      if (direccionDesfase(d) === 'atrasado') return;
      ev.preventDefault();
      ev.returnValue = '';
      return '';
    });
  }
  function limpiarFicha() {
    $('#ficha-direccion').value = '';
    $('#btn-ficha-copiar').disabled = true;
    $('#btn-ficha-abrir').setAttribute('aria-disabled', 'true');
    /* Al cambiar cualquier opción, la semilla del transporte se renueva: es otra ficha,
       que reparta los tonos de otra manera. Pulsar «Generar» dos veces seguidas sin tocar
       nada, en cambio, da el mismo enlace — que es lo que uno espera. */
    estado.semillaFicha = null;
    const p = $('#ficha-tonos-reparto');
    if (p) p.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', arranque);

})();
