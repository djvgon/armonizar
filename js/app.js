/* =====================================================================
   app.js — Interfaz del alumno: carga el ejercicio, dibuja las paletas,
   recoge las respuestas y corrige.

   Flujo:
     1. Se lee la URL: #ej=<id> carga un ejercicio del corpus; #e=<texto>
        carga un ejercicio codificado (Ejercicios.codificar). Sin nada,
        el primero del corpus.
     2. Se dibuja la partitura (partitura.js) y dos paletas: el grado de la
        fundamental (I … VII) y la cifra (las del repertorio del ejercicio).
        Cada tecla lleva un número pequeño que la elige desde el teclado.
     3. Para cada nota el alumno indica cifra y grado; la casilla activa
        avanza sola. Se puede pulsar cualquier casilla para volver a ella.
     4. «Corregir» compara cada pareja (cifra, grado) con las admisibles y
        muestra el resultado; la respuesta modelo aparece bajo cada error.
     5. Sonido: cadencia de referencia, realización propuesta, realización
        de lo escrito y un ▶ por nota (véase «Escuchar» más abajo).
   ===================================================================== */

(() => {

  const $ = sel => document.querySelector(sel);

  const estado = {
    ejercicio: null,
    respuestas: [],           // cifra elegida por nota (id) o null
    romanos: [],              // grado elegido por nota ('V') o null
    pedirRomano: true,
    activa: 0,                // nota activa
    campo: 'cifra',           // 'cifra' | 'romano': qué casilla de la nota activa está resaltada
    corregido: false,
    resultados: null,
    propuesta: null,          // salida del motor de reglas (para explicaciones)
    intento: 0,               // número de correcciones hechas
    primerIntento: null,      // aciertos en la primera corrección
    bloqueadas: [],           // por nota: {cifra:bool, romano:bool} — casillas acertadas que ya no se editan
    mostrarSolucion: false,   // si se enseñan las respuestas modelo y las explicaciones
    reintentos: true,         // si el alumno puede corregir solo los errores antes de ver la solución
    modoEj: 'armonizar',      // 'armonizar' | 'cifrar' (Análisis: se muestra la realización modelo) | 'audicion'
    realizacionCuando: 'siempre', // 'siempre' | 'alCorregir' | 'nunca'
    verRealizacion: true,     // interruptor del alumno
    rotacion: 0,              // posición inicial de Furno (0, 1, 2)
    rigida: false,            // misma disposición en todos los acordes
    sonar: false,             // sonar el acorde al completar cifra y grado
    sonando: null,            // nota cuyo acorde está sonando (para resaltar su botón ▶)
    alSonar: null             // función que la partitura llama al pulsar el ▶ de una nota
  };

  /* ---------- Carga ---------- */

  function ejercicioDesdeURL() {
    const h = location.hash.replace(/^#/, '');
    const params = new URLSearchParams(h);
    if (params.has('e')) {
      try {
        const ej = Ejercicios.decodificar(params.get('e'));
        const errores = Ejercicios.validar(ej);
        if (errores.length) throw new Error(errores.join(' '));
        if (!ej.id) ej.id = 'url';
        if (!ej.repertorio) ej.repertorio = Ejercicios.REPERTORIO_RO;
        return ej;
      } catch (err) {
        aviso('No se ha podido leer el ejercicio de la dirección: ' + err.message);
      }
    }
    if (params.has('ej')) {
      const ej = Ejercicios.porId(params.get('ej'));
      if (ej) return ej;
      aviso('No existe el ejercicio «' + params.get('ej') + '»; se muestra el primero.');
    }
    return Ejercicios.CORPUS[0];
  }

  function cargar(ej) {
    const n = Ejercicios.numNotas(ej);
    estado.ejercicio = ej;
    estado.respuestas = new Array(n).fill(null);
    estado.romanos = new Array(n).fill(null);
    estado.pedirRomano = Ejercicios.pideRomano(ej);
    estado.activa = 0;
    estado.campo = 'cifra';
    estado.corregido = false;
    estado.resultados = null;
    estado.intento = 0;
    estado.primerIntento = null;
    estado.bloqueadas = Array.from({ length: n }, () => ({ cifra: false, romano: false }));
    estado.mostrarSolucion = false;
    estado.reintentos = ej.reintentos !== false;
    estado.modoEj = Ejercicios.modo(ej);
    estado.realizacionCuando = Ejercicios.realizacion(ej);
    estado.sonando = null;
    estado.alSonar = sonarAcorde;
    Sonido.parar();
    try { estado.propuesta = Reglas.proponer(ej); } catch (e) { estado.propuesta = null; }
    const delCorpus = !!Ejercicios.porId(ej.id);
    $('#selector').value = delCorpus ? ej.id : '';
    document.querySelector('.selector-caja').hidden = !delCorpus;   // un ejercicio recibido por dirección no muestra el corpus
    $('#btn-siguiente').hidden = !delCorpus;
    pintarCabecera();
    pintarPaletas();
    pintar();
    $('#resultado').hidden = true;
    $('#resultado').innerHTML = '';
  }

  /* ---------- Pintado ---------- */

  function pintarCabecera() {
    const ej = estado.ejercicio;
    $('#titulo').textContent = (ej.coleccion ? ej.coleccion + ' · ' : '') + (ej.titulo || '');
    const ton = '<b>' + Teoria.nombreTonalidad(ej.tonalidad) + '</b>';
    const grado = estado.pedirRomano ? ' y el grado sobre el que se construye la fundamental del acorde' : '';
    const b = t => '<span class="ref-boton">' + t + '</span>';
    let html;
    if (estado.modoEj === 'cifrar') {
      html = '<b>Análisis.</b> Observa la realización a cuatro voces y, para cada acorde, elige la cifra' + grado + '. Tonalidad: ' + ton + '. '
        + b('▶ Cadencia') + ' sitúa la tonalidad; ' + b('▶ Propuesta') + ' y el ' + b('▶') + ' de cada nota hacen sonar la realización.';
    } else if (estado.modoEj === 'audicion') {
      html = '<b>Audición.</b> Pulsa ' + b('▶ Cadencia') + ' para situarte en la tonalidad (' + ton + ') y ' + b('▶ Propuesta') + ' para escuchar el fragmento, '
        + 'o el ' + b('▶') + ' de cada nota para oírlo acorde a acorde. Para cada nota del bajo elige la cifra de lo que suena' + grado + '. '
        + 'Con ' + b('▶ Mi cifrado') + ' oirás lo que has escrito, para compararlo.';
    } else {
      html = '<b>Armonización.</b> Para cada nota del bajo elige la cifra' + grado + '. Tonalidad: ' + ton + '. '
        + b('▶ Cadencia') + ' sitúa la tonalidad; ' + b('▶ Mi cifrado') + ' y el ' + b('▶') + ' de cada nota hacen sonar lo que vas escribiendo.';
    }
    $('#instruccion').innerHTML = html;
    const rep = $('#repertorio');
    rep.innerHTML = '';
    ej.repertorio.forEach(id => {
      const c = Teoria.CIFRADOS[id];
      const s = document.createElement('span');
      s.className = 'ficha';
      s.title = c.descripcion;
      s.appendChild(Partitura.iconoCifra(id, 26));
      rep.appendChild(s);
    });
    const gr = $('#grados');
    gr.innerHTML = '';
    const ayuda = Ejercicios.ayudaGrados(ej);
    $('#grados-fila').hidden = !estado.pedirRomano || ayuda === 'ninguna';
    if (estado.pedirRomano && ayuda !== 'ninguna') Ejercicios.grados(ej).forEach(r => {
      const s = document.createElement('span');
      s.className = 'ficha ficha-romano';
      s.textContent = r;
      gr.appendChild(s);
    });
  }

  function tecla(clase, contenido, titulo, alPulsar) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tecla ' + clase;
    b.title = titulo || '';
    if (typeof contenido === 'string') b.textContent = contenido; else b.appendChild(contenido);
    b.addEventListener('click', alPulsar);
    return b;
  }

  // Tecla del teclado que elige la opción k (0-based) de una paleta: 1…9 y 0 para la décima.
  const atajo = k => (k < 9 ? String(k + 1) : k === 9 ? '0' : '');

  function pintarPaletas() {
    // Paleta de grados: el número pequeño es el del grado (I = 1 … VII = 7)
    const pr = $('#paleta-romanos');
    pr.innerHTML = '';
    $('#paleta-romanos-caja').hidden = !estado.pedirRomano;
    if (estado.pedirRomano) {
      const permitidos = Ejercicios.ayudaGrados(estado.ejercicio) === 'paleta' ? Ejercicios.grados(estado.ejercicio) : Teoria.ROMANOS;
      Teoria.ROMANOS.forEach((r, k) => {
        if (!permitidos.includes(r)) return;
        const cont = document.createDocumentFragment();
        const txt = document.createElement('span');
        txt.className = 'tecla-romano-texto';
        txt.textContent = r;
        cont.appendChild(txt);
        const num = document.createElement('span');
        num.className = 'tecla-num';
        num.textContent = String(k + 1);
        cont.appendChild(num);
        const b = tecla('tecla-romano', cont, 'Grado ' + r + ' (tecla ' + (k + 1) + ')', () => responderRomano(r));
        b.dataset.romano = r;
        b.dataset.atajo = String(k + 1);
        b.setAttribute('aria-label', 'Grado ' + r);
        pr.appendChild(b);
      });
    }
    // Paleta de cifras: el número pequeño es la posición en la paleta (1, 2, 3…)
    const pc = $('#paleta');
    pc.innerHTML = '';
    estado.ejercicio.repertorio.forEach((id, k) => {
      const c = Teoria.CIFRADOS[id];
      const cont = document.createDocumentFragment();
      cont.appendChild(Partitura.iconoCifra(id, 40));
      const num = document.createElement('span');
      num.className = 'tecla-num';
      num.textContent = atajo(k);
      cont.appendChild(num);
      const b = tecla('tecla-cifra', cont, c.nombre + ' — ' + c.descripcion + (atajo(k) ? ' (tecla ' + atajo(k) + ')' : ''), () => responderCifra(id));
      b.dataset.id = id;
      b.dataset.atajo = atajo(k);
      b.setAttribute('aria-label', 'Cifra ' + c.nombre);
      pc.appendChild(b);
    });
    pc.appendChild(tecla('tecla-borrar', 'Borrar', 'Vaciar la casilla activa (Retroceso)', borrar));
  }

  // ¿Puede verse ahora el pentagrama de sol?
  function realizacionVisible() {
    if (estado.realizacionCuando === 'nunca') return false;
    if (estado.realizacionCuando === 'alCorregir' && !estado.corregido) return false;
    return estado.verRealizacion;
  }

  // ¿La nota i tiene ya cifra y grado (o solo cifra, si no se pide el grado)?
  function notaCompleta(i) {
    return !!estado.respuestas[i] && (!estado.pedirRomano || !!estado.romanos[i]);
  }

  const cifrasModelo = () => estado.ejercicio.respuestas.map((_, i) => Ejercicios.admisibles(estado.ejercicio, i)[0]);

  // Cifras que se realizan: las del alumno (armonizar), solo en las notas completas
  // —cifra y grado—, o las modelo (análisis y audición).
  function cifrasParaRealizar() {
    if (estado.modoEj === 'cifrar' || estado.modoEj === 'audicion') return cifrasModelo();
    return estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null));
  }

  // El bajo se dobla a la octava grave al sonar, para que destaque y se oigan bien las inversiones.
  const conBajoDoblado = (bajo, voces) => [{ letra: bajo.letra, alt: bajo.alt, octava: bajo.octava - 1 }, bajo, ...voces];

  function calcularRealizacion() {
    if (!realizacionVisible()) { estado.realizacion = null; estado.realizacionMal = null; estado.paralelas = []; return; }
    const r = Realizacion.realizar(estado.ejercicio, cifrasParaRealizar(), { modo: estado.rigida ? 'rigida' : 'auto', rotacion: estado.rotacion });
    estado.realizacion = r.acordes;
    estado.paralelas = r.paralelas;
    estado.realizacionMal = (estado.modoEj === 'armonizar' && estado.corregido && estado.resultados) ? estado.resultados.map(x => !x.okCifra) : null;
  }

  // ¿Puede oírse ya la realización propuesta? En análisis y audición, siempre; en
  // armonización, solo cuando se ha mostrado la solución (si no, delataría la respuesta).
  const propuestaAudible = () => estado.modoEj !== 'armonizar' || estado.mostrarSolucion;

  function pintarBarraRealizacion() {
    // Controles de la realización visible: solo cuando puede verse ahora
    const puedeVerse = !(estado.realizacionCuando === 'nunca' || (estado.realizacionCuando === 'alCorregir' && !estado.corregido));
    $('#control-realizacion').hidden = !puedeVerse;
    $('#ver-realizacion').checked = estado.verRealizacion;
    $('#rigida').checked = estado.rigida;
    $('#sonar').checked = estado.sonar;
    $('#btn-propuesta').hidden = !propuestaAudible();
    $('#btn-parar').hidden = !Sonido.enCurso();
    document.querySelectorAll('#posicion-control .segmentos button').forEach(b => b.classList.toggle('activo', Number(b.dataset.pos) === estado.rotacion));
    $('#posicion-control').hidden = !estado.verRealizacion;
    $('#realizacion-barra').classList.toggle('audicion', estado.modoEj === 'audicion');
    const par = $('#paralelas');
    if (!puedeVerse || !estado.verRealizacion || !estado.realizacion) { par.textContent = ''; par.className = 'paralelas'; return; }
    const n = estado.paralelas.length;
    par.textContent = n ? (n === 1 ? '1 paralela: ' : n + ' paralelas: ') + estado.paralelas.map(p => p.texto).join('; ') : 'sin quintas ni octavas paralelas';
    par.className = 'paralelas' + (n ? ' hay' : '');
  }

  function pintar() {
    calcularRealizacion();
    pintarBarraRealizacion();
    Partitura.dibujar($('#partitura'), estado.ejercicio, estado, seleccionar);
    const n = estado.respuestas.length;
    const hechas = estado.respuestas.filter((r, i) => r && (!estado.pedirRomano || estado.romanos[i])).length;
    // Tras corregir, el número de intento solo tiene sentido si el ejercicio sigue abierto (hay errores que corregir)
    const enCurso = estado.intento > 0 && !estado.mostrarSolucion;
    $('#progreso').textContent = hechas + ' de ' + n + ' notas completas' + (enCurso ? ' · intento ' + (estado.intento + 1) : '');
    $('#btn-corregir').disabled = estado.corregido;
    document.querySelectorAll('.paleta .tecla').forEach(b => { b.disabled = estado.corregido; });
    document.querySelectorAll('.paleta-caja').forEach(p => p.classList.remove('destacada'));
    if (!estado.corregido) {
      const caja = estado.campo === 'romano' && estado.pedirRomano ? '#paleta-romanos-caja' : '#paleta-caja';
      $(caja).classList.add('destacada');
    }
  }

  /* ---------- Interacción ---------- */

  function seleccionar(i, campo) {
    if (estado.corregido) return;
    campo = campo || 'cifra';
    if (bloqueada(i, campo)) {
      // Si la casilla pulsada está bloqueada, ir a la otra de la misma nota si es editable
      const otra = campo === 'cifra' ? 'romano' : 'cifra';
      if (estado.pedirRomano && !bloqueada(i, otra)) campo = otra; else return;
    }
    estado.activa = i;
    estado.campo = campo;
    pintar();
  }

  const bloqueada = (j, campo) => estado.bloqueadas[j] && estado.bloqueadas[j][campo];

  // Tras responder, pasa a la siguiente casilla pendiente: primero la otra casilla de
  // la misma nota, después las de las notas siguientes. Pendiente = editable y vacía;
  // en un reintento (hay casillas bloqueadas), pendiente = editable y aún no tocada
  // desde la corrección.
  function avanzar() {
    const n = estado.respuestas.length, i = estado.activa;
    const enReintento = estado.intento > 0;
    const pendiente = (j, campo) => !bloqueada(j, campo) && (enReintento ? !estado.tocadas[j][campo] : (campo === 'cifra' ? !estado.respuestas[j] : !estado.romanos[j]));
    const campos = estado.pedirRomano ? ['cifra', 'romano'] : ['cifra'];
    const posicion = campos.indexOf(estado.campo);
    for (const c of campos.slice(posicion + 1)) if (pendiente(i, c)) { estado.campo = c; return; }
    for (let k = 1; k <= n; k++) {
      const j = (i + k) % n;
      for (const c of campos) if (pendiente(j, c)) { estado.activa = j; estado.campo = c; return; }
    }
    // Nada pendiente: se queda donde está
  }

  function responderCifra(id) {
    if (estado.corregido || bloqueada(estado.activa, 'cifra')) return;
    estado.campo = 'cifra';
    const i = estado.activa;
    estado.respuestas[i] = id;
    if (estado.tocadas) estado.tocadas[i].cifra = true;
    avanzar();
    pintar();
    if (estado.sonar && notaCompleta(i)) sonarNota(i, id);
  }

  // Suena el acorde de la nota i con la cifra dada (aunque la realización no se vea):
  // en armonización, lo que el alumno ha escrito; el bajo va doblado a la octava grave.
  function sonarNota(i, id) {
    const ej = estado.ejercicio;
    const notas = Reglas.notasDe(ej);
    try {
      const voces = id ? Realizacion.posicion(Realizacion.trio(id, notas[i], ej.tonalidad), estado.rotacion) : [];
      Sonido.acorde(conBajoDoblado(notas[i], voces), 1.1);
    } catch (e) { /* sin audio */ }
  }

  /* ---------- Escuchar ----------
     Tres cosas pueden sonar, siempre con el bajo doblado a la octava grave:
       · la cadencia I–IV–V7–I de la tonalidad, para situar el oído;
       · la realización PROPUESTA por el ejercicio (las cifras modelo);
       · la realización de MI CIFRADO (lo que el alumno ha escrito; las notas sin
         cifra y grado suenan solo con el bajo).
     El ▶ de cada nota hace sonar un solo acorde: el propuesto en análisis y audición,
     el escrito en armonización (lo mismo que se dibuja en el pentagrama de sol). */

  const SEG_POR_NEGRA = 0.6;
  const opcionesRealizacion = () => ({ modo: estado.rigida ? 'rigida' : 'auto', rotacion: estado.rotacion });
  const duraciones = () => { const d = []; estado.ejercicio.compases.forEach(c => c.forEach(([, x]) => d.push(x))); return d; };

  function acordesPropuesta() { return Realizacion.realizar(estado.ejercicio, cifrasModelo(), opcionesRealizacion()).acordes; }
  function acordesMios() { return Realizacion.realizar(estado.ejercicio, estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null)), opcionesRealizacion()).acordes; }
  // Lo que se dibuja (y suena con el ▶ de cada nota): la propuesta en análisis y audición, lo escrito en armonización.
  function acordesVisibles() { return estado.modoEj === 'armonizar' ? acordesMios() : acordesPropuesta(); }

  // Resalta el botón ▶ de la nota que suena (sin redibujar la partitura)
  function marcarSonando(i) {
    estado.sonando = i;
    document.querySelectorAll('#partitura .boton-sonar').forEach(b => b.classList.toggle('sonando', Number(b.dataset.indice) === i));
  }

  function reproducir(acordes) {
    const notas = Reglas.notasDe(estado.ejercicio);
    const dur = duraciones();
    const items = notas.map((n, i) => ({ notas: conBajoDoblado(n, acordes[i] || []), segundos: SEG_POR_NEGRA * dur[i], alEmpezar: () => marcarSonando(i) }));
    try {
      Sonido.secuencia(items, () => { marcarSonando(null); $('#btn-parar').hidden = true; });
      $('#btn-parar').hidden = false;
    } catch (e) { aviso('No se ha podido reproducir el sonido en este navegador.'); }
  }

  function escucharPropuesta() { if (propuestaAudible()) reproducir(acordesPropuesta()); }
  function escucharMio() {
    if (!estado.respuestas.some((_, i) => notaCompleta(i))) { aviso('Todavía no hay ninguna nota con cifra y grado.'); return; }
    reproducir(acordesMios());
  }

  function escucharCadencia() {
    const ej = estado.ejercicio;
    const notas = Reglas.notasDe(ej);
    try {
      const cad = Realizacion.cadencia(ej.tonalidad, notas[0]);
      const items = cad.map(a => ({ notas: conBajoDoblado(a.bajo, a.voces), segundos: SEG_POR_NEGRA * a.duracion }));
      Sonido.secuencia(items, () => { marcarSonando(null); $('#btn-parar').hidden = true; });
      $('#btn-parar').hidden = false;
    } catch (e) { aviso('No se ha podido reproducir el sonido en este navegador.'); }
  }

  // Botón ▶ de la nota i: suena su acorde (propuesto o escrito, según el tipo de ejercicio)
  function sonarAcorde(i) {
    const notas = Reglas.notasDe(estado.ejercicio);
    const ac = acordesVisibles()[i];
    if (!ac && estado.modoEj === 'armonizar') aviso('Esta nota aún no tiene cifra y grado: suena solo el bajo.');
    try {
      Sonido.acorde(conBajoDoblado(notas[i], ac || []), 1.4);
      marcarSonando(i);
      setTimeout(() => { if (estado.sonando === i && !Sonido.enCurso()) marcarSonando(null); }, 1400);
    } catch (e) { /* sin audio */ }
  }

  function parar() { Sonido.parar(); marcarSonando(null); $('#btn-parar').hidden = true; }

  function responderRomano(r) {
    if (estado.corregido || !estado.pedirRomano || bloqueada(estado.activa, 'romano')) return;
    estado.campo = 'romano';
    const i = estado.activa;
    estado.romanos[i] = r;
    if (estado.tocadas) estado.tocadas[i].romano = true;
    avanzar();
    pintar();
    if (estado.sonar && notaCompleta(i)) sonarNota(i, estado.respuestas[i]);
  }

  function borrar() {
    if (estado.corregido || bloqueada(estado.activa, estado.campo)) return;
    if (estado.campo === 'romano') estado.romanos[estado.activa] = null;
    else estado.respuestas[estado.activa] = null;
    pintar();
  }

  function corregir() {
    const ej = estado.ejercicio;
    estado.resultados = ej.respuestas.map((_, i) => {
      const parejas = Ejercicios.parejas(ej, i);
      const adm = parejas.map(p => p.cifra);
      const cifra = estado.respuestas[i], rom = estado.romanos[i];
      const okCifra = cifra !== null && adm.includes(cifra);
      // El grado es correcto si coincide con el de la cifra dada (si esta es admisible)
      // o, si la cifra no lo es, con el de alguna cifra admisible.
      let okRomano = true;
      if (estado.pedirRomano) {
        const candidatas = okCifra ? parejas.filter(p => p.cifra === cifra) : parejas;
        okRomano = rom !== null && candidatas.some(p => p.romano === rom);
      }
      return { ok: okCifra && okRomano, okCifra, okRomano, modelo: parejas[0].cifra, modeloRomano: parejas[0].romano, cifra, romano: rom };
    });
    estado.intento += 1;
    const aciertos = estado.resultados.filter(r => r.ok).length;
    if (estado.intento === 1) estado.primerIntento = aciertos;
    estado.corregido = true;
    const todoBien = aciertos === estado.resultados.length;
    // Sin reintentos, o todo correcto: se enseña la solución y se cierra el ejercicio
    estado.mostrarSolucion = todoBien || !estado.reintentos;
    pintar();
    pintarResultado();
  }

  // Deja editables solo las casillas erróneas; las acertadas quedan fijas y en verde.
  function corregirErrores() {
    if (!estado.corregido || estado.mostrarSolucion) return;
    estado.resultados.forEach((r, i) => {
      if (r.okCifra) estado.bloqueadas[i].cifra = true;
      if (!estado.pedirRomano || r.okRomano) estado.bloqueadas[i].romano = true;
    });
    estado.tocadas = estado.bloqueadas.map(() => ({ cifra: false, romano: false }));
    estado.corregido = false;
    estado.resultados = null;
    // Primera casilla editable
    const campos = estado.pedirRomano ? ['cifra', 'romano'] : ['cifra'];
    estado.activa = 0; estado.campo = 'cifra';
    busqueda: for (let j = 0; j < estado.respuestas.length; j++)
      for (const c of campos) if (!bloqueada(j, c)) { estado.activa = j; estado.campo = c; break busqueda; }
    $('#resultado').hidden = true;
    pintar();
    aviso('Corrige solo las casillas que quedan editables y vuelve a pulsar «Corregir».');
  }

  function verSolucion() {
    if (!estado.corregido) return;
    estado.mostrarSolucion = true;
    pintar();
    pintarResultado();
  }

  function pintarResultado() {
    const ej = estado.ejercicio;
    const res = estado.resultados;
    const n = res.length;
    const aciertos = res.filter(r => r.ok).length;
    const aciertosCifra = res.filter(r => r.okCifra).length;
    const aciertosRomano = res.filter(r => r.okRomano).length;
    const notas = Reglas.notasDe(ej);
    const caja = $('#resultado');
    const pct = Math.round(100 * aciertos / n);
    let html = '<h2>' + aciertos + ' de ' + n + ' notas correctas <span class="pct">(' + pct + ' %' + (estado.intento > 1 ? ' · intento ' + estado.intento : '') + ')</span></h2>';
    if (estado.pedirRomano) html += '<p class="desglose">Cifras: ' + aciertosCifra + ' de ' + n + ' · Grados: ' + aciertosRomano + ' de ' + n
      + (estado.intento > 1 && estado.primerIntento !== null ? ' · Al primer intento: ' + estado.primerIntento + ' de ' + n : '') + '</p>';
    else if (estado.intento > 1 && estado.primerIntento !== null) html += '<p class="desglose">Al primer intento: ' + estado.primerIntento + ' de ' + n + '</p>';
    if (aciertos === n) {
      html += '<p class="enhorabuena">Todas las respuestas son correctas' + (estado.intento > 1 ? ' (en ' + estado.intento + ' intentos)' : '') + '.</p>';
    } else if (!estado.mostrarSolucion) {
      html += '<p>Las casillas en rojo tienen algún error. Puedes corregir solo esas, o ver la solución.</p>'
        + '<div class="botonera botonera-resultado"><button type="button" id="btn-errores" class="primario">Corregir los errores</button>'
        + '<button type="button" id="btn-solucion">Ver la solución</button></div>';
    } else {
      html += '<ol class="errores">';
      res.forEach((r, i) => {
        if (r.ok) return;
        const nombre = Teoria.nombreEs(notas[i]);
        const parejas = Ejercicios.parejas(ej, i);
        const ver = p => (estado.pedirRomano ? p.romano + ' ' : '') + Teoria.CIFRADOS[p.cifra].etiqueta;
        const dada = (estado.pedirRomano ? (r.romano || '¿grado?') + ' ' : '') + (r.cifra ? Teoria.CIFRADOS[r.cifra].etiqueta : '¿cifra?');
        let expl = '';
        if (estado.propuesta && estado.propuesta[i] && estado.propuesta[i].modelo === r.modelo) expl = estado.propuesta[i].explicacion;
        const otras = parejas.slice(1).map(ver);
        const que = !r.okCifra && !r.okRomano ? '' : (!r.okCifra ? ' (falla la cifra)' : ' (falla el grado)');
        html += '<li><b>Nota ' + (i + 1) + ' (' + nombre + ')</b>' + que + ': has puesto <span class="cif mal">' + dada + '</span>; '
          + 'la respuesta modelo es <span class="cif bien">' + ver(parejas[0]) + '</span>'
          + (otras.length ? ' (también se admite ' + otras.join(', ') + ')' : '') + '.'
          + (expl ? '<br><span class="explicacion">' + expl + '</span>' : '') + '</li>';
      });
      html += '</ol>';
    }
    caja.innerHTML = html;
    caja.hidden = false;
    const be = $('#btn-errores'), bs = $('#btn-solucion');
    if (be) be.addEventListener('click', corregirErrores);
    if (bs) bs.addEventListener('click', verSolucion);
    caja.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reiniciar() { cargar(estado.ejercicio); }

  function siguiente() {
    const lista = Ejercicios.CORPUS;
    const i = lista.findIndex(e => e.id === estado.ejercicio.id);
    const sig = lista[(i + 1) % lista.length];
    location.hash = 'ej=' + sig.id;
  }

  function copiarEnlace() {
    const ej = estado.ejercicio;
    const base = location.href.split('#')[0];
    const url = Ejercicios.porId(ej.id) ? base + '#ej=' + ej.id : base + '#e=' + Ejercicios.codificar(ej);
    const fin = () => aviso('Enlace copiado al portapapeles.');
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(fin, () => prompt('Copia este enlace:', url));
    else prompt('Copia este enlace:', url);
  }

  function aviso(txt) {
    const a = $('#aviso');
    a.textContent = txt;
    a.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { a.hidden = true; }, 4000);
  }

  /* ---------- Teclado: flechas para moverse, números para elegir en la paleta activa,
     retroceso para borrar, Esc para parar el sonido ---------- */
  document.addEventListener('keydown', ev => {
    if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return;
    if (ev.key === 'Escape') { parar(); return; }
    if (estado.corregido || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const n = estado.respuestas.length;
    if (ev.key === 'ArrowRight') { estado.activa = (estado.activa + 1) % n; pintar(); }
    else if (ev.key === 'ArrowLeft') { estado.activa = (estado.activa - 1 + n) % n; pintar(); }
    else if (ev.key === 'ArrowDown' && estado.pedirRomano) { estado.campo = 'romano'; pintar(); }
    else if (ev.key === 'ArrowUp') { estado.campo = 'cifra'; pintar(); }
    else if (/^[0-9]$/.test(ev.key)) {
      // El número pequeño de cada tecla de la paleta activa (cifra o grado)
      const paleta = estado.campo === 'romano' && estado.pedirRomano ? '#paleta-romanos' : '#paleta';
      const b = document.querySelector(paleta + ' .tecla[data-atajo="' + ev.key + '"]');
      if (b) { ev.preventDefault(); b.click(); }
    }
    else if (ev.key === 'Backspace' || ev.key === 'Delete') { ev.preventDefault(); borrar(); }
  });

  /* ---------- Arranque ---------- */
  function rellenarSelector() {
    const sel = $('#selector');
    Ejercicios.colecciones().forEach(col => {
      const og = document.createElement('optgroup');
      og.label = col;
      Ejercicios.CORPUS.filter(e => e.coleccion === col).forEach(e => {
        const o = document.createElement('option');
        o.value = e.id; o.textContent = e.titulo;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    sel.addEventListener('change', () => { location.hash = 'ej=' + sel.value; });
  }

  document.addEventListener('DOMContentLoaded', () => {
    rellenarSelector();
    $('#btn-corregir').addEventListener('click', corregir);
    $('#btn-reiniciar').addEventListener('click', reiniciar);
    $('#btn-siguiente').addEventListener('click', siguiente);
    $('#btn-enlace').addEventListener('click', copiarEnlace);
    $('#ver-realizacion').addEventListener('change', ev => { estado.verRealizacion = ev.target.checked; pintar(); });
    $('#rigida').addEventListener('change', ev => { estado.rigida = ev.target.checked; pintar(); });
    $('#sonar').addEventListener('change', ev => { estado.sonar = ev.target.checked; });
    document.querySelectorAll('#posicion-control .segmentos button').forEach(b => b.addEventListener('click', () => { estado.rotacion = Number(b.dataset.pos); pintar(); }));
    $('#btn-cadencia').addEventListener('click', escucharCadencia);
    $('#btn-propuesta').addEventListener('click', escucharPropuesta);
    $('#btn-mio').addEventListener('click', escucharMio);
    $('#btn-parar').addEventListener('click', parar);
    window.addEventListener('hashchange', () => cargar(ejercicioDesdeURL()));
    cargar(ejercicioDesdeURL());
  });

})();
