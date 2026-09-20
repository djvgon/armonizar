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
  const ORDEN_CIFRAS = ['53', '6', '64', '65', '43', '7', '9', '7+', '+6', '65d', '+4'];
  const TONICAS = [['C', 'do'], ['C#', 'do♯'], ['Db', 're♭'], ['D', 're'], ['Eb', 'mi♭'], ['E', 'mi'], ['F', 'fa'], ['F#', 'fa♯'], ['Gb', 'sol♭'], ['G', 'sol'], ['Ab', 'la♭'], ['A', 'la'], ['Bb', 'si♭'], ['B', 'si']];

  const estado = {
    compases: [],            // bajo actual (compases → notas [nombre, dur])
    respuestas: null,        // respuestas revisadas (lista de ids por nota) o null
    propuesta: null,         // salida del motor para la tabla
    fragmentos: null,        // fragmentos del último MusicXML importado
    ejercicio: null,         // último ejercicio generado
    modulaciones: []         // [{nota, tonalidad}]: desde la nota (pivote) rige la tonalidad nueva
  };

  /* ---------- Lectura del formulario ---------- */

  function tonalidad() { return { tonica: $('#tonica').value, modo: $('#modo').value }; }
  function compas() { return $('#compas').value.split('/').map(Number); }
  function repertorio() {
    return [...document.querySelectorAll('#repertorio-opciones input:checked')].map(i => i.value);
  }
  const modoElegido = () => (document.querySelector('input[name="modo-ej"]:checked') || {}).value || 'armonizar';
  const elegirModo = m => { const r = document.querySelector('input[name="modo-ej"][value="' + m + '"]'); if (r) r.checked = true; };

  function opciones() {
    const pref = $('#preferir').value;
    return { pedirRomano: $('#pedir-romano').checked, reintentos: $('#reintentos').checked, ayudaGrados: $('#ayuda-grados').value,
      modo: modoElegido(), realizacion: $('#realizacion-cuando').value, preferir: pref ? [pref] : [], avisoMod: $('#aviso-mod').value };
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
    const r = Teoria.bajoDesdeTexto($('#texto-bajo').value);
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
    if (op.modo === 'armonizar' && op.realizacion !== 'siempre') ej.realizacion = op.realizacion;
    const mods = extra.modulaciones !== undefined ? extra.modulaciones : modulacionesValidas(Ejercicios.numNotas({ compases }));
    if (mods.length) {
      ej.modulaciones = mods.map(m => ({ nota: m.nota, tonalidad: { tonica: m.tonalidad.tonica, modo: m.tonalidad.modo } }));
      if (op.avisoMod === 'existe') ej.aviso = 'existe';
    }
    return ej;
  }

  /* ---------- Análisis con el motor ---------- */

  function analizar() {
    const r = leerBajo();
    if (r.errores.length || !r.compases.length) { aviso('Corrige el bajo antes de analizar.'); return; }
    const rep = repertorio();
    if (!rep.length) { aviso('Marca al menos una cifra en el repertorio.'); return; }
    const ej = construirEjercicio(r.compases, tonalidad(), null);
    const prop = Reglas.proponer(ej);
    estado.propuesta = prop;
    ej.respuestas = prop.map(p => p.admisibles.slice());
    estado.respuestas = ej.respuestas.map((_, i) => Ejercicios.admisibles(ej, i));
    pintarRevision();
    $('#paso-revision').hidden = false;
    $('#paso-direccion').hidden = false;
    $('#todos-fragmentos').hidden = !(estado.fragmentos && estado.fragmentos.length > 1);
    guardarBorrador();
    $('#paso-revision').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pintarRevision() {
    const rep = repertorio();
    const notas = [];
    estado.compases.forEach(c => c.forEach(([n]) => notas.push(n)));
    const ejTon = { tonalidad: tonalidad(), compases: estado.compases, modulaciones: modulacionesValidas(notas.length) };
    const tons = Teoria.tonalidadesPorNota(ejTon);
    const pivotes = new Set(ejTon.modulaciones.map(m => m.nota));
    const tbody = $('#tabla-revision tbody');
    tbody.innerHTML = '';
    const sinPropuesta = [];
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
        + '<td class="chips"></td>'
        + '<td class="explicacion">' + (prop ? '<b>' + prop.regla + '</b> · ' + prop.explicacion : '') + '</td>';
      // Columna «Tonalidad»: la que rige; en las notas 2… un desplegable para empezar aquí una tonalidad vecina
      const ct = tr.querySelector('.celda-ton');
      if (i === 0) {
        ct.textContent = Teoria.nombreCorto(ton);
      } else {
        const sel = document.createElement('select');
        sel.className = 'sel-ton' + (esPivote ? ' pivote' : '');
        sel.title = 'Tonalidad que rige desde esta nota';
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
      rep.forEach(id => {
        const chip = document.createElement('label');
        chip.className = 'chip' + (adm.includes(id) ? ' marcada' : '') + (adm[0] === id ? ' modelo' : '');
        const romTxt = esPivote ? Teoria.romano(id, n, tonAntes) + ' = ' + Teoria.romano(id, n, ton) : Teoria.romano(id, n, ton);
        chip.title = Teoria.CIFRADOS[id].descripcion + ' → ' + romTxt + (esPivote && !Teoria.acordeComun(id, n, tonAntes, ton) ? ' (no es acorde común)' : '');
        if (esPivote && !Teoria.acordeComun(id, n, tonAntes, ton)) chip.classList.add('no-comun');
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = adm.includes(id);
        cb.addEventListener('change', () => { alternar(i, id, cb.checked); });
        const rb = document.createElement('input');
        rb.type = 'radio'; rb.name = 'modelo-' + i; rb.checked = adm[0] === id; rb.title = 'Hacer modelo';
        rb.addEventListener('change', () => { hacerModelo(i, id); });
        chip.appendChild(cb);
        chip.appendChild(Partitura.iconoCifra(id, 30));
        const rom = document.createElement('span');
        rom.className = 'chip-romano'; rom.textContent = romTxt;
        chip.appendChild(rom);
        chip.appendChild(rb);
        celda.appendChild(chip);
      });
      tbody.appendChild(tr);
    });
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
    const notas = [];
    ej.compases.forEach(c => c.forEach(([x]) => notas.push(x)));
    const modelos = ej.respuestas.map(a => a[0] || null);
    const mods = Ejercicios.modulaciones(ej);
    const pivotes = new Set(mods.map(m => m.nota));
    const est = {
      respuestas: ver ? modelos : new Array(n).fill(null),
      // Grado en la tonalidad que rige; en el pivote, también en la anterior (casilla partida)
      romanos: ver ? ej.respuestas.map((a, i) => (a[0] ? Teoria.romano(a[0], notas[i], pivotes.has(i) ? Ejercicios.tonalidadAntes(ej, i) : Ejercicios.tonalidadEn(ej, i)) : null)) : new Array(n).fill(null),
      romanos2: ver ? ej.respuestas.map((a, i) => (a[0] && pivotes.has(i) ? Teoria.romano(a[0], notas[i], Ejercicios.tonalidadEn(ej, i)) : null)) : new Array(n).fill(null),
      dobles: ej.respuestas.map((_, i) => pivotes.has(i)),
      etiquetas: mods.map(m => ({ i: m.nota, texto: '→ ' + Teoria.nombreCorto(m.tonalidad), clase: 'dada' })),
      pedirRomano: opciones().pedirRomano, activa: -1, campo: 'cifra', corregido: false, resultados: null, soloLectura: true,
      realizacion: (ver || opciones().modo !== 'armonizar') && (opciones().modo !== 'armonizar' || opciones().realizacion !== 'nunca') ? Realizacion.realizar(ej, modelos, { modo: 'auto', rotacion: 0 }).acordes : null,
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
      const ej = construirEjercicio(f.compases, f.tonalidad, null, { titulo: 'Ejercicio ' + (k + 1), coleccion: base, compas: f.compas, id: 'url-' + Date.now().toString(36) + '-' + (k + 1), modulaciones: f.modulaciones || [] });
      const prop = Reglas.proponer(ej);
      ej.respuestas = prop.map(p => p.admisibles.slice());
      ej.respuestas = ej.respuestas.map((_, i) => Ejercicios.admisibles(ej, i));
      const vacias = ej.respuestas.map((a, i) => (a.length ? null : i + 1)).filter(Boolean);
      if (vacias.length) problemas.push('Fragmento ' + (k + 1) + ': notas sin propuesta ' + vacias.join(', '));
      if (!f.tonalidadSegura) problemas.push('Fragmento ' + (k + 1) + ': tonalidad deducida con dudas (' + Teoria.nombreTonalidad(f.tonalidad) + ')');
      (f.modulaciones || []).forEach(m => { if (!m.segura) problemas.push('Fragmento ' + (k + 1) + ': cambio de armadura en la nota ' + (m.nota + 1) + ' leído como modulación a ' + Teoria.nombreTonalidad(m.tonalidad) + ' (revisa el modo y el pivote)'); });
      lineas.push('Ejercicio ' + (k + 1) + ' · ' + Teoria.nombreTonalidad(f.tonalidad) + ' · ' + Teoria.textoDesdeBajo(f.compases) + '\n' + baseAlumno() + '#e=' + Ejercicios.codificar(ej));
    });
    const ta = $('#direcciones-todos');
    ta.value = (problemas.length ? 'AVISOS:\n' + problemas.join('\n') + '\n\n' : '') + lineas.join('\n\n');
    ta.hidden = false;
    $('#btn-copiar-todos').disabled = false;
  }

  /* ---------- Importación de archivos ---------- */

  function importarArchivo(file) {
    const lector = new FileReader();
    lector.onload = () => {
      const txt = lector.result;
      try {
        if (/\.json$/i.test(file.name) || txt.trim().startsWith('{')) cargarJSON(JSON.parse(txt));
        else cargarMusicXML(MusicXML.importar(txt), file.name);
      } catch (e) {
        aviso('No se ha podido importar: ' + e.message);
      }
    };
    lector.readAsText(file);
  }

  function cargarMusicXML(r, nombre) {
    estado.fragmentos = r.fragmentos;
    const cont = $('#lista-fragmentos');
    cont.innerHTML = '';
    $('#fragmentos-titulo').textContent = r.fragmentos.length + (r.fragmentos.length === 1 ? ' fragmento encontrado en ' : ' fragmentos encontrados en ') + nombre + '. Pulsa uno para cargarlo:';
    r.fragmentos.forEach((f, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fragmento';
      b.innerHTML = '<b>' + (k + 1) + '</b> ' + Teoria.textoDesdeBajo(f.compases) + '<span class="fragmento-ton">' + Teoria.nombreTonalidad(f.tonalidad) + (f.tonalidadSegura ? '' : ' (?)') + '</span>';
      b.addEventListener('click', () => cargarFragmento(k));
      cont.appendChild(b);
    });
    const av = $('#avisos-importacion');
    if (r.avisos.length) { av.textContent = r.avisos.join(' · '); av.hidden = false; } else av.hidden = true;
    $('#fragmentos').hidden = false;
    if (!$('#coleccion').value) $('#coleccion').value = nombre.replace(/\.(musicxml|xml)$/i, '');
    cargarFragmento(0);
    $('#todos-fragmentos').hidden = !(r.fragmentos.length > 1) || $('#paso-direccion').hidden;
  }

  function cargarFragmento(k) {
    const f = estado.fragmentos[k];
    $('#texto-bajo').value = Teoria.textoDesdeBajo(f.compases);
    $('#tonica').value = f.tonalidad.tonica;
    $('#modo').value = f.tonalidad.modo;
    $('#compas').value = f.compas.join('/');
    estado.modulaciones = (f.modulaciones || []).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
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
    $('#realizacion-cuando').value = ej.realizacion && ['siempre', 'alCorregir', 'nunca'].includes(ej.realizacion) ? ej.realizacion : 'siempre';
    ajustarCamposModo();
    $('#preferir').value = ej.preferir && ej.preferir.includes('+6') ? '+6' : '';
    estado.modulaciones = Ejercicios.modulaciones(ej).map(m => ({ nota: m.nota, tonalidad: m.tonalidad }));
    $('#aviso-mod').value = Ejercicios.aviso(ej);
    estado.compases = ej.compases;
    estado.respuestas = ej.respuestas.map(a => a.slice());
    try { estado.propuesta = Reglas.proponer(ej); } catch (e) { estado.propuesta = null; }
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
        tipo: modoElegido(), realizacion: $('#realizacion-cuando').value, preferir: $('#preferir').value, respuestas: estado.respuestas,
        modulaciones: estado.modulaciones, avisoMod: $('#aviso-mod').value
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
      elegirModo(tipo); $('#realizacion-cuando').value = b.realizacion || 'siempre'; $('#preferir').value = b.preferir || '';
      estado.modulaciones = Array.isArray(b.modulaciones) ? b.modulaciones.filter(m => m && m.tonalidad && Number.isInteger(m.nota)) : [];
      $('#aviso-mod').value = b.avisoMod === 'existe' ? 'existe' : 'completo';
      ajustarCamposModo();
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

  // La opción «cuándo se ve la realización» solo tiene sentido en Armonización.
  function ajustarCamposModo() {
    const m = modoElegido();
    const campo = $('#campo-realizacion');
    campo.classList.toggle('desactivado', m !== 'armonizar');
    $('#realizacion-cuando').disabled = m !== 'armonizar';
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

  function arranque() {
    TONICAS.forEach(([v, n]) => { const o = document.createElement('option'); o.value = v; o.textContent = n; $('#tonica').appendChild(o); });
    pintarRepertorio();

    // Ejemplo por defecto si no hay borrador
    if (!cargarBorrador()) {
      $('#texto-bajo').value = 'do3 re3 | mi3 do3 | sol3r | do3r';
      $('#titulo').value = 'Ejercicio 1';
      leerBajo();
    }

    $('#texto-bajo').addEventListener('input', () => { leerBajo(); estado.respuestas = null; $('#paso-revision').hidden = true; $('#paso-direccion').hidden = true; limpiarDireccion(); guardarBorrador(); });
    ['#tonica', '#modo', '#compas', '#titulo', '#coleccion', '#pedir-romano', '#reintentos', '#ayuda-grados', '#realizacion-cuando', '#preferir', '#aviso-mod'].forEach(sel => {
      $(sel).addEventListener('change', () => { guardarBorrador(); limpiarDireccion(); if (estado.respuestas) pintarRevision(); });
    });
    // Si cambia la tonalidad inicial, las modulaciones dejan de tener sentido
    ['#tonica', '#modo'].forEach(sel => $(sel).addEventListener('change', () => { if (estado.modulaciones.length) { estado.modulaciones = []; if (estado.respuestas) analizar(); } }));
    document.querySelectorAll('input[name="modo-ej"]').forEach(r => r.addEventListener('change', () => { ajustarCamposModo(); guardarBorrador(); limpiarDireccion(); if (estado.respuestas) pintarRevision(); }));
    ajustarCamposModo();
    $('#ver-solucion').addEventListener('change', pintarVistaPrevia);
    $('#btn-analizar').addEventListener('click', analizar);
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
  }

  document.addEventListener('DOMContentLoaded', arranque);

})();
