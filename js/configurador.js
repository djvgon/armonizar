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
    { fun: 'S', id: 'II|53', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|6', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|7', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|65', rom: 'II', defecto: true },
    { fun: 'S', id: 'II|43', rom: 'II', nota: 'sobre el 6.º grado', defecto: true },
    { fun: 'S', id: 'II|42', rom: 'II', nota: 'séptima preparada en el bajo, que baja de grado', defecto: true },
    { fun: 'S', id: 'II|+6', rom: 'II', nota: 'V/V, dominante secundaria (cuarto)', defecto: false },
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
    compases: [],            // bajo actual (compases → notas [nombre, dur])
    respuestas: null,        // respuestas revisadas (lista de ids por nota) o null
    propuesta: null,         // salida del motor para la tabla
    fragmentos: null,        // fragmentos del último MusicXML importado (cada uno con sus dos voces)
    fragmentoActual: null,   // índice del fragmento cargado
    companera: null,         // por nota: la nota de la OTRA voz que suena a la vez (si el archivo traía las dos)
    ejercicio: null,         // último ejercicio generado
    modulaciones: [],        // [{nota, tonalidad}]: desde la nota (pivote) rige la tonalidad nueva
    funciones: null          // función tonal por nota ('T' | 'S' | 'D') fijada en la revisión, o null (las del modelo)
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
  }
  const modoElegido = () => (document.querySelector('input[name="modo-ej"]:checked') || {}).value || 'armonizar';
  const elegirModo = m => { const r = document.querySelector('input[name="modo-ej"][value="' + m + '"]'); if (r) r.checked = true; };

  function opciones() {
    const pref = $('#preferir').value;
    return { pedirRomano: $('#pedir-romano').checked, reintentos: $('#reintentos').checked, ayudaGrados: $('#ayuda-grados').value,
      modo: modoElegido(), preferir: pref ? [pref] : [], avisoMod: $('#aviso-mod').value, bajoAudicion: $('#bajo-audicion').value === 'bajo',
      funciones: $('#funciones').value === 'dadas' || $('#funciones').value === 'pedir' ? $('#funciones').value : null };
  }
  // Campos y rótulos que dependen del tipo de ejercicio: la opción «qué ve el alumno en
  // Audición» y, en la melodía de soprano, los textos del paso 1 (la voz dada es la melodía)
  function ajustarCampoAudicion() {
    $('#campo-bajo-audicion').hidden = modoElegido() !== 'audicion';
    const sop = esSoprano();
    $('#titulo-voz').textContent = sop ? 'La melodía' : 'El bajo';
    $('#etiqueta-voz').textContent = sop ? 'Escribe la melodía (soprano)' : 'Escribe el bajo';
    $('#texto-bajo').placeholder = sop ? 'mi4 fa4n mi4n | re4 si3 | do4r' : 'do3 re3 | mi3 do3 | sol3r | do3r';
    $('#ayuda-octava-soprano').hidden = !sop;
    $('#btn-analizar').textContent = sop ? 'Analizar la melodía' : 'Analizar el bajo';
    $('#th-admisibles').textContent = sop ? 'Acordes admisibles (● modelo)' : 'Cifras admisibles (● modelo)';
    $('#repertorio-opciones').hidden = sop; $('#ayuda-repertorio').hidden = sop;
    $('#acordes-funciones').hidden = !sop;
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
    return estado.modulaciones.filter(m => m.nota > 0 && m.nota < n).slice().sort((a, b) => a.nota - b.nota);
  }
  function ajustarCampoModulacion() {
    const hay = modulacionesValidas(Ejercicios.numNotas({ compases: estado.compases })).length > 0;
    $('#campo-aviso-mod').hidden = !hay;
  }

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
    const mods = extra.modulaciones !== undefined ? extra.modulaciones : modulacionesValidas(Ejercicios.numNotas({ compases }));
    if (mods.length) {
      ej.modulaciones = mods.map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } }));
      if (op.avisoMod === 'existe') ej.aviso = 'existe';
    }
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
    const r = leerBajo();
    if (r.errores.length || !r.compases.length) { aviso('Corrige ' + (esSoprano() ? 'la melodía' : 'el bajo') + ' antes de analizar.'); return; }
    const rep = repertorio();
    if (!rep.length) { aviso('Marca al menos una cifra en el repertorio.'); return; }
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
    const rep = repertorio();
    const notas = Teoria.notasDeCompases(estado.compases);      // los silencios no llevan fila
    const ejTon = { tonalidad: tonalidad(), compases: estado.compases, modulaciones: modulacionesValidas(notas.length) };
    const tons = Teoria.tonalidadesPorNota(ejTon);
    const pivotes = new Set(ejTon.modulaciones.map(m => m.nota));
    const tbody = $('#tabla-revision tbody');
    tbody.innerHTML = '';
    const sinPropuesta = [];
    const sop = esSoprano();
    const conFun = !!opciones().funciones;
    const ejFun = construirEjercicio(estado.compases, tonalidad(), estado.respuestas, { funcionesNotas: null });
    if (!Array.isArray(estado.funciones) || estado.funciones.length !== notas.length) estado.funciones = funcionesDeModelo(ejFun);
    notas.forEach((n, i) => {
      const adm = estado.respuestas[i] || [];
      const prop = estado.propuesta ? estado.propuesta[i] : null;
      if (!adm.length) sinPropuesta.push(i + 1);
      const ton = tons[i];
      const tonAntes = i > 0 ? tons[i - 1] : ton;
      const esPivote = pivotes.has(i);
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
        + '<td class="explicacion">' + (prop ? '<b>' + prop.regla + '</b> · ' + prop.explicacion : '') + '</td>';
      // Columna «Función»: T · S · D; en la melodía de soprano, cambiarla vuelve a analizar con esa función fijada
      const cf = tr.querySelector('.celda-fun');
      cf.hidden = !conFun;
      {
        const sel = document.createElement('select');
        sel.className = 'sel-fun';
        sel.title = 'Función tonal de este acorde (la ve el alumno si las funciones se dan; se corrige si se piden)';
        Teoria.FUNCIONES.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = f + ' · ' + Teoria.NOMBRE_FUNCION[f]; if (estado.funciones[i] === f) o.selected = true; sel.appendChild(o); });
        sel.addEventListener('change', () => {
          limpiarDireccion();
          estado.funciones[i] = sel.value;
          if (sop) analizar(true); else { guardarBorrador(); pintarVistaPrevia(); }
        });
        cf.appendChild(sel);
      }
      // Columna «Tonalidad»: la que rige; en las notas 2… un desplegable para empezar aquí una tonalidad vecina
      const ct = tr.querySelector('.celda-ton');
      if (i === 0) {
        ct.textContent = Teoria.nombreCorto(ton);
      } else {
        const sel = document.createElement('select');
        sel.className = 'sel-ton' + (esPivote ? ' pivote' : '');
        sel.title = esPivote ? 'Tonalidad nueva desde esta nota (pivote). Elige «(quitar)» para deshacer la modulación.' : 'Rige ' + Teoria.nombreCorto(tonAntes) + '. Despliega y elige una tonalidad vecina para que la modulación empiece en esta nota (acorde pivote).';
        const o0 = document.createElement('option'); o0.value = ''; o0.textContent = esPivote ? '(quitar)' : Teoria.nombreCorto(tonAntes); sel.appendChild(o0);
        Teoria.tonalidadesVecinas(tonAntes).forEach(t => {
          const o = document.createElement('option'); o.value = t.tonica + '/' + t.modo; o.textContent = '→ ' + Teoria.nombreCorto(t);
          if (esPivote && Teoria.mismaTonalidad(t, ton)) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', () => { fijarModulacion(i, sel.value); });
        ct.appendChild(sel);
      }
      const celda = tr.querySelector('.chips');
      // Opciones de la nota: en el bajo dado, las cifras del repertorio; en la melodía de soprano,
      // los acordes (fundamental + cifra) que contienen la nota, según el motor (o los marcados, si no hay análisis)
      let opcionesNota;
      if (sop) {
        const ids = adm.slice();                                   // primero las admisibles (la modelo delante), luego el resto de acordes con la nota
        if (prop && prop.candidatos) prop.candidatos.forEach(x => { if (!ids.includes(x.id)) ids.push(x.id); });
        opcionesNota = ids.map(id => {
          const p = Ejercicios.par(id);
          const cand = prop && prop.candidatos ? prop.candidatos.find(x => x.id === id) : null;
          const b = cand ? cand.bajo : Teoria.bajoDe(p.romano, p.cifra, ton);
          return { id, cifra: p.cifra, bajo: b, romTxt: p.romano, extra: b ? ' (' + Teoria.nombreEs(b) + ')' : '', titulo: Teoria.CIFRADOS[p.cifra].descripcion + (b ? ' · bajo ' + Teoria.nombreEs(b) : '') + (cand && cand.avisos.length ? ' · ' + cand.avisos.join(', ') : ''), aviso: !!(cand && cand.avisos.length) };
        });
      } else {
        opcionesNota = rep.map(id => {
          const romTxt = esPivote ? Teoria.romano(id, n, tonAntes) + ' = ' + Teoria.romano(id, n, ton) : Teoria.romano(id, n, ton);
          const noComun = esPivote && !Teoria.acordeComun(id, n, tonAntes, ton);
          return { id, cifra: id, bajo: n, romTxt, extra: '', titulo: Teoria.CIFRADOS[id].descripcion + ' → ' + romTxt + (noComun ? ' (no es acorde común)' : ''), noComun };
        });
      }
      opcionesNota.forEach(op => {
        const id = op.id;
        const chip = document.createElement('label');
        chip.className = 'chip' + (adm.includes(id) ? ' marcada' : '') + (adm[0] === id ? ' modelo' : '') + (op.noComun ? ' no-comun' : '') + (op.aviso ? ' con-aviso' : '');
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
      tbody.appendChild(tr);
    });
    document.querySelectorAll('#tabla-revision .col-fun').forEach(e => { e.hidden = !conFun; });
    ajustarCampoModulacion();
    const av = $('#avisos-revision');
    if (sinPropuesta.length) { av.textContent = 'Notas sin ninguna cifra admisible: ' + sinPropuesta.join(', ') + '. Márcalas a mano o cambia el repertorio.'; av.hidden = false; }
    else av.hidden = true;
    pintarVistaPrevia();
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
    const ejTon = { tonalidad: tonalidad(), compases: estado.compases, modulaciones: modulacionesValidas(n) };
    const tons = Teoria.tonalidadesPorNota(ejTon);
    estado.modulaciones = estado.modulaciones.filter(m => m.nota <= i || Teoria.tonalidadesVecinas(tons[m.nota - 1]).some(t => Teoria.mismaTonalidad(t, m.tonalidad)));
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

  function pintarVistaPrevia() {
    const ej = construirEjercicio(estado.compases, tonalidad(), estado.respuestas);
    const n = Ejercicios.numNotas(ej);
    const ver = $('#ver-solucion').checked;
    const notas = Teoria.notasDeCompases(ej.compases);
    const sop = Ejercicios.esSoprano(ej);
    const modelos = ej.respuestas.map(a => (a[0] ? Ejercicios.cifraDe(a[0]) : null));
    const mods = Ejercicios.modulaciones(ej);
    const pivotes = new Set(mods.map(m => m.nota));
    const romanoModelo = (a, i, ton) => (a[0] ? (sop ? Ejercicios.par(a[0]).romano : Teoria.romano(a[0], notas[i], ton)) : null);
    const romanos = ver ? ej.respuestas.map((a, i) => romanoModelo(a, i, pivotes.has(i) ? Ejercicios.tonalidadAntes(ej, i) : Ejercicios.tonalidadEn(ej, i))) : new Array(n).fill(null);
    const opReal = { modo: 'auto', rotacion: 0 };
    if (sop) { opReal.bajos = Ejercicios.bajosDe(ej, romanos, ver ? modelos : new Array(n).fill(null)); opReal.sopranos = notas; }
    const est = {
      respuestas: ver ? modelos : new Array(n).fill(null),
      // Grado en la tonalidad que rige; en el pivote, también en la anterior (casilla partida)
      romanos,
      romanos2: ver ? ej.respuestas.map((a, i) => (a[0] && pivotes.has(i) ? romanoModelo(a, i, Ejercicios.tonalidadEn(ej, i)) : null)) : new Array(n).fill(null),
      dobles: ej.respuestas.map((_, i) => pivotes.has(i)),
      etiquetas: mods.map(m => ({ i: m.nota, texto: '→ ' + Teoria.nombreCorto(m.tonalidad), clase: 'dada' })),
      pedirRomano: opciones().pedirRomano || sop, activa: -1, campo: 'cifra', corregido: false, resultados: null, soloLectura: true,
      realizacion: ver ? Realizacion.realizar(ej, modelos, opReal).acordes : null,   // el profesor siempre puede ver la realización modelo
      vozDada: sop ? 'soprano' : null,
      bajos: sop ? opReal.bajos : null,
      filaFunciones: opciones().funciones ? { visible: true, editable: false, celdas: ej.respuestas.map((_, i) => ({ texto: Ejercicios.funcionModelo(ej, i), clase: 'dada', fija: true })) } : null,
      numerar: true,                       // el número de cada acorde es el de su fila en la tabla de revisión
      alPulsarNumero: irAFila
    };
    Partitura.dibujar($('#vista-previa'), ej, est, () => {});
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

  function baseAlumno() { return location.href.split('#')[0].replace(/configurar\.html$/, 'index.html'); }

  function generar() {
    if (!estado.respuestas) { aviso('Analiza primero el bajo.'); return; }
    const ej = construirEjercicio(estado.compases, tonalidad(), estado.respuestas);
    const errores = Ejercicios.validar(ej);
    const vacias = ej.respuestas.map((a, i) => (a.length ? null : i + 1)).filter(Boolean);
    if (vacias.length) errores.push('Faltan respuestas en las notas ' + vacias.join(', ') + '.');
    if (errores.length) { aviso(errores.join(' ')); return; }
    estado.ejercicio = ej;
    const url = baseAlumno() + '#e=' + Ejercicios.codificar(ej);
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
      lineas.push('Ejercicio ' + (k + 1) + ' · ' + Teoria.nombreTonalidad(f.tonalidad) + ' · ' + Teoria.textoDesdeBajo(v.compases) + '\n' + baseAlumno() + '#e=' + Ejercicios.codificar(ej));
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
    estado.fragmentos = r.fragmentos;
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
    $('#ayuda-grados').value = Ejercicios.ayudaGrados(ej);
    elegirModo(Ejercicios.modo(ej));
    $('#bajo-audicion').value = ej.mostrarBajo === true ? 'bajo' : '';
    $('#funciones').value = Ejercicios.funciones(ej) || '';
    estado.funciones = Array.isArray(ej.funcionesNotas) ? ej.funcionesNotas.slice() : null;
    if (Array.isArray(ej.acordes)) marcarAcordes(ej.acordes);
    $('#formula-tst').checked = ej.formulaTST !== false;
    ajustarCampoAudicion();
    $('#preferir').value = ej.preferir && ej.preferir.includes('+6') ? '+6' : '';
    estado.modulaciones = Ejercicios.modulaciones(ej).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    $('#aviso-mod').value = Ejercicios.aviso(ej);
    estado.compases = ej.compases;
    estado.respuestas = ej.respuestas.map(a => a.slice());
    try { estado.propuesta = proponerPara(ej, estado.funciones); } catch (e) { estado.propuesta = null; }
    leerBajo();
    pintarRevision();
    $('#paso-revision').hidden = false; $('#paso-direccion').hidden = false;
    guardarBorrador();
    aviso('Ejercicio cargado desde el archivo.');
  }

  /* ---------- Borrador ---------- */

  function guardarBorrador() {
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
        texto: $('#texto-bajo').value, tonica: $('#tonica').value, modo: $('#modo').value, compas: $('#compas').value,
        titulo: $('#titulo').value, coleccion: $('#coleccion').value, repertorio: repertorio(),
        pedirRomano: $('#pedir-romano').checked, reintentos: $('#reintentos').checked, ayudaGrados: $('#ayuda-grados').value,
        tipo: modoElegido(), preferir: $('#preferir').value, respuestas: estado.respuestas,
        modulaciones: estado.modulaciones, avisoMod: $('#aviso-mod').value, bajoAudicion: $('#bajo-audicion').value,
        funciones: $('#funciones').value, funcionesNotas: estado.funciones,
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
      $('#pedir-romano').checked = b.pedirRomano !== false; $('#reintentos').checked = b.reintentos !== false; $('#ayuda-grados').value = b.ayudaGrados || 'lista';
      elegirModo(tipo); $('#preferir').value = b.preferir || '';
      $('#bajo-audicion').value = b.bajoAudicion === 'bajo' ? 'bajo' : '';
      $('#funciones').value = b.funciones === 'dadas' || b.funciones === 'pedir' ? b.funciones : '';
      estado.funciones = Array.isArray(b.funcionesNotas) ? b.funcionesNotas : null;
      if (Array.isArray(b.acordes)) marcarAcordes(b.acordes);
      $('#formula-tst').checked = b.formulaTST !== false;
      ajustarCampoAudicion();
      estado.modulaciones = Array.isArray(b.modulaciones) ? b.modulaciones.filter(m => m && m.tonalidad && Number.isInteger(m.nota)) : [];
      $('#aviso-mod').value = b.avisoMod === 'existe' ? 'existe' : 'completo';
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

  function aviso(txt) {
    const a = $('#aviso');
    a.textContent = txt; a.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { a.hidden = true; }, 4500);
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
        cb.addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); if (estado.respuestas && esSoprano()) analizar(true, true); });
        lab.appendChild(cb);
        const r = document.createElement('span'); r.className = 'acorde-rom'; r.textContent = a.rom; lab.appendChild(r);
        lab.appendChild(Partitura.iconoCifra(p.cifra, 30));
        if (a.nota) { const s = document.createElement('span'); s.className = 'acorde-nota'; s.textContent = a.nota; lab.appendChild(s); }
        fila.appendChild(lab);
      });
      cont.appendChild(fila);
    });
    $('#formula-tst').addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); if (estado.respuestas && esSoprano()) analizar(true, true); });
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

    $('#texto-bajo').addEventListener('input', () => { estado.companera = null; leerBajo(); estado.respuestas = null; $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true; limpiarDireccion(); guardarBorrador(); });
    ['#tonica', '#modo', '#compas', '#titulo', '#coleccion', '#pedir-romano', '#reintentos', '#ayuda-grados', '#preferir', '#aviso-mod', '#bajo-audicion'].forEach(sel => {
      $(sel).addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); ajustarCampoAudicion(); if (estado.respuestas) pintarRevision(); });
    });
    // Cambiar la opción de funciones en una melodía cambia qué acordes se admiten: se vuelve a analizar
    $('#funciones').addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); ajustarCampoAudicion(); if (estado.respuestas) { if (esSoprano()) analizar(true, true); else pintarRevision(); } });
    // Si cambia la tonalidad inicial, las modulaciones dejan de tener sentido
    ['#tonica', '#modo'].forEach(sel => $(sel).addEventListener('change', () => { if (estado.modulaciones.length) { estado.modulaciones = []; if (estado.respuestas) analizar(); } }));
    document.querySelectorAll('input[name="modo-ej"]').forEach(r => r.addEventListener('change', () => {
      // La armonización de soprano parte de la función tonal de cada acorde: si no había fila, se activa
      if (esSoprano() && !$('#funciones').value) $('#funciones').value = 'dadas';
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
  }


  /* =================================================================
     Banco de fragmentos y fichas (paso 6)
     ================================================================= */

  const CLAVE_BANCO = 'armonizar.banco';
  let banco = [];

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
      if (!Teoria.mismaTonalidad(x.tonalidad, e.tonalidad)) return false;
      const bajos = x.bajo && e.bajo, sopranos = x.soprano && e.soprano;
      if (!bajos && !sopranos) return false;                                        // no comparten ninguna voz
      if (bajos && !mismaMusica(x.bajo.compases, e.bajo.compases)) return false;    // el mismo bajo…
      if (sopranos && !mismaMusica(x.soprano.compases, e.soprano.compases)) return false;   // …y la misma melodía
      return true;
    });
  }
  // Completa la entrada vieja con la voz que le falte; devuelve true si ha añadido algo
  function fundir(viejo, nuevo) {
    let cambio = false;
    ['bajo', 'soprano'].forEach(v => { if (!viejo[v] && nuevo[v]) { viejo[v] = nuevo[v]; cambio = true; } });
    if (cambio) {
      const et = viejo.etiquetas || (viejo.etiquetas = {});
      et.voces = viejo.bajo && viejo.soprano ? 'ambas' : (viejo.bajo ? 'bajo' : 'soprano');
      if (!viejo.leccion && nuevo.leccion) viejo.leccion = nuevo.leccion;
    }
    return cambio;
  }

  function anadirAlBanco() {
    if (!estado.fragmentos || !estado.fragmentos.length) { aviso('Importa antes un archivo.'); return; }
    const leccion = $('#banco-leccion').value.trim();
    const leccionNombre = $('#banco-leccion-nombre').value.trim();
    const fuente = estado.nombreArchivo || '';
    const op = { leccion, leccionNombre, fuente, repertorio: repertorio(), acordes: acordesElegidos(), formulaTST: $('#formula-tst').checked };
    let nuevos = 0, repetidos = 0, fallidos = 0, conAviso = 0, fundidos = 0;
    estado.fragmentos.forEach((f, k) => {
      let e;
      try { e = Banco.entrada(f, Object.assign({ compas: f.compas }, op)); } catch (err) { e = null; }
      if (!e) { fallidos++; return; }
      e.id = (leccion || 'X') + '-' + String(k + 1).padStart(2, '0');
      const viejo = mismoQue(e);
      if (viejo) { if (fundir(viejo, e)) fundidos++; else repetidos++; return; }
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
      + (conAviso ? ' · ' + conAviso + ' con alguna nota sin propuesta (revísalos)' : '') + '.', 7000);
  }

  function filtroFicha() {
    const alt = parseInt($('#ficha-alteraciones').value, 10);
    const niv = $('#ficha-nivel').value.split('-').map(Number);
    const mod = $('#ficha-modula').value;
    const f = {
      n: Math.max(1, parseInt($('#ficha-n').value, 10) || 8),
      modo: $('#ficha-modo').value,
      nivel: niv,
      alteraciones: [0, alt]
    };
    if ($('#ficha-leccion').value) f.leccion = $('#ficha-leccion').value;
    if ($('#ficha-modotonal').value) f.modoTonal = $('#ficha-modotonal').value;
    if (mod === 'si') f.modula = true; else if (mod === 'no') f.modula = false;
    if ($('#ficha-titulo').value.trim()) f.titulo = $('#ficha-titulo').value.trim();
    // Opciones del paso 3 que también rigen en la ficha
    const op = opciones();
    if (!op.pedirRomano && f.modo !== 'soprano') f.pedirRomano = false;
    if (!op.reintentos) f.reintentos = false;
    if (op.ayudaGrados !== 'lista') f.ayudaGrados = op.ayudaGrados;
    if (op.funciones) f.funciones = op.funciones;
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
    $('#btn-banco-descargar').disabled = !hay;
    $('#btn-banco-vaciar').disabled = !hay;
    if (!hay) { $('#banco-resumen').textContent = 'El banco está vacío.'; return; }
    const lecs = Banco.lecciones(banco);
    const nombres = Banco.nombresDeLecciones(banco);
    const etiqueta = l => l + (nombres[l] ? ' · ' + nombres[l] : '');
    $('#banco-resumen').textContent = banco.length + ' fragmentos en el banco'
      + (lecs.length ? ' · ' + lecs.length + (lecs.length > 1 ? ' lecciones' : ' lección') : '') + '.';
    /* Desplegable de lecciones: con el nombre, no solo el código, que es lo que dice qué
       acordes entran en la lección (conservando la elegida). */
    const selLec = $('#ficha-leccion'), antes = selLec.value;
    selLec.innerHTML = '<option value="">Todas las lecciones</option>';
    lecs.forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = etiqueta(l); selLec.appendChild(o); });
    selLec.value = lecs.includes(antes) ? antes : '';

    const filtro = filtroFicha();
    const lista = Banco.filtrar(banco, filtro);
    $('#ficha-cuenta').textContent = lista.length
      ? lista.length + ' fragmentos cumplen el filtro; cada ficha tomará ' + Math.min(lista.length, filtro.n) + ' al azar.'
      : 'Ningún fragmento cumple el filtro. Prueba con otro tipo de ejercicio o menos restricciones (recuerda que la armonización de soprano necesita fragmentos con la melodía escrita).';
    $('#btn-ficha').disabled = !lista.length;

    const cuerpo = $('#tabla-banco').querySelector('tbody');
    cuerpo.innerHTML = '';
    lista.forEach(e => {
      const et = e.etiquetas || {};
      const tr = document.createElement('tr');
      tr.innerHTML = '<td title="' + (nombres[e.leccion] || '').replace(/"/g, '') + '">' + etiqueta(e.leccion || '—') + '</td>'
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
      const bQuitar = document.createElement('button');
      bQuitar.type = 'button'; bQuitar.className = 'enlace-texto'; bQuitar.textContent = 'Quitar';
      bQuitar.addEventListener('click', () => { banco = banco.filter(x => x !== e); guardarBanco(); pintarBanco(); });
      acc.appendChild(bCargar); acc.appendChild(document.createTextNode(' · ')); acc.appendChild(bQuitar);
      cuerpo.appendChild(tr);
    });
  }

  // Trae un fragmento del banco al paso 1, para revisarlo o retocarlo
  function cargarDelBanco(e, modo) {
    const parte = e[Banco.vozDeModo(modo)];
    if (!parte) { aviso('Ese fragmento no tiene esa voz escrita.'); return; }
    elegirModo(modo);
    ajustarCampoAudicion();
    estado.fragmentos = null; estado.fragmentoActual = null; estado.companera = null;
    $('#fragmentos').hidden = true;
    $('#texto-bajo').value = Teoria.textoDesdeBajo(parte.compases);
    $('#tonica').value = e.tonalidad.tonica;
    $('#modo').value = e.tonalidad.modo;
    $('#compas').value = (e.compas || [4, 4]).join('/');
    $('#titulo').value = e.titulo || (e.leccion ? e.leccion : 'Ejercicio');
    estado.modulaciones = (parte.modulaciones || []).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    estado.respuestas = null; estado.propuesta = null;
    $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true;
    limpiarDireccion();
    leerBajo();
    guardarBorrador();
    $('#paso-bajo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Si el banco de este navegador está vacío y la página está publicada, se lee el
     banco.json que hay junto a la aplicación: así el configurador publicado tiene los
     ejercicios sin que haya que cargar el archivo a mano. Desde el disco no se puede
     (el navegador no deja leer archivos vecinos), y entonces está el botón «Cargar». */
  async function bancoPublicado() {
    if (location.protocol === 'file:') return;
    try {
      const r = await fetch(location.href.split('#')[0].replace(/[^/]*$/, '') + 'banco.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const lista = Banco.leerArchivo(await r.json());
      if (!lista.length || banco.length) return;
      banco = lista;
      guardarBanco();
      pintarBanco();
      aviso('Banco cargado del archivo banco.json publicado: ' + banco.length + ' fragmentos.', 6000);
    } catch (e) { /* no hay banco publicado todavía: no es un error */ }
  }

  function generarFicha() {
    const filtro = filtroFicha();
    const lista = Banco.filtrar(banco, filtro);
    if (!lista.length) { aviso('Ningún fragmento cumple el filtro.'); return; }
    const url = baseAlumno() + '#f=' + Banco.codificar(filtro);
    $('#ficha-direccion').value = url;
    $('#btn-ficha-copiar').disabled = false;
    const abrir = $('#btn-ficha-abrir');
    abrir.href = url; abrir.setAttribute('aria-disabled', 'false');
    // Desde el disco el enlace no le sirve a nadie: las fichas necesitan la aplicación publicada
    if (location.protocol === 'file:') aviso('Ojo: esta dirección es de tu disco. Las fichas hay que generarlas desde el configurador publicado en GitHub, porque necesitan leer banco.json del servidor.', 10000);
  }

  function descargarBanco() {
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
    if (!banco.length) bancoPublicado();
    $('#btn-banco-anadir').addEventListener('click', anadirAlBanco);
    $('#btn-banco-descargar').addEventListener('click', descargarBanco);
    $('#btn-banco-cargar').addEventListener('click', () => $('#banco-archivo').click());
    $('#banco-archivo').addEventListener('change', ev => { if (ev.target.files[0]) cargarBancoArchivo(ev.target.files[0]); ev.target.value = ''; });
    $('#btn-banco-vaciar').addEventListener('click', () => {
      if (!banco.length) return;
      if (!confirm('¿Vaciar el banco? Se borran los ' + banco.length + ' fragmentos guardados en este navegador. Descárgalo antes si quieres conservarlo.')) return;
      banco = []; guardarBanco(); pintarBanco();
    });
    $('#btn-ficha').addEventListener('click', generarFicha);
    $('#btn-ficha-copiar').addEventListener('click', () => copiar($('#ficha-direccion').value, 'Dirección de la ficha copiada.'));
    $('#btn-ficha-abrir').addEventListener('click', ev => { if ($('#btn-ficha-abrir').getAttribute('aria-disabled') === 'true') ev.preventDefault(); });
    ['#ficha-modo', '#ficha-leccion', '#ficha-modotonal', '#ficha-alteraciones', '#ficha-nivel', '#ficha-modula', '#ficha-n'].forEach(id => {
      $(id).addEventListener('change', () => { pintarBanco(); limpiarFicha(); });
    });
  }
  function limpiarFicha() {
    $('#ficha-direccion').value = '';
    $('#btn-ficha-copiar').disabled = true;
    $('#btn-ficha-abrir').setAttribute('aria-disabled', 'true');
  }

  document.addEventListener('DOMContentLoaded', arranque);

})();
