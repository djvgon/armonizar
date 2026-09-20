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
    romanos2: [],             // en un pivote, grado en la tonalidad nueva (la casilla se parte: romano = anterior, romano2 = nueva)
    marcas: {},               // modulación según el alumno: índice de nota → tonalidad que rige desde ahí
    avisoMod: null,           // null (sin modulación) | 'completo' (se muestra dónde y a qué tonalidad) | 'existe' (solo se avisa)
    tonalidadBloqueada: false,// la fila «Tonalidad» ya no se edita (modo completo, o marcas acertadas en un reintento)
    resultadoMod: null,       // corrección de la modulación: {ok, info:[…], sobrantes:[…]}
    pedirRomano: true,
    activa: 0,                // nota activa
    campo: 'cifra',           // 'cifra' | 'romano' | 'romano2' | 'tonalidad': qué casilla de la nota activa está resaltada
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
    alSonar: null,            // función que la partitura llama al pulsar el ▶ de una nota
    libre: false              // práctica libre: la página se abrió sin ejercicio en la dirección (se ve el desplegable del corpus)
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
    estado.romanos2 = new Array(n).fill(null);
    estado.pedirRomano = Ejercicios.pideRomano(ej);
    estado.activa = 0;
    estado.campo = Ejercicios.pideRomano(ej) ? 'romano' : 'cifra';
    estado.corregido = false;
    estado.resultados = null;
    estado.resultadoMod = null;
    estado.intento = 0;
    estado.primerIntento = null;
    estado.bloqueadas = Array.from({ length: n }, () => ({ cifra: false, romano: false, romano2: false }));
    // Modulación: en modo 'completo' las marcas vienen dadas; en 'existe' las pone el alumno
    estado.avisoMod = Ejercicios.modula(ej) ? Ejercicios.aviso(ej) : null;
    estado.marcas = estado.avisoMod === 'completo' ? marcasModelo() : {};
    estado.tonalidadBloqueada = estado.avisoMod === 'completo';
    estado.mostrarSolucion = false;
    estado.reintentos = ej.reintentos !== false;
    estado.modoEj = Ejercicios.modo(ej);
    estado.realizacionCuando = Ejercicios.realizacion(ej);
    estado.sonando = null;
    estado.alSonar = sonarAcorde;
    Sonido.parar();
    try { estado.propuesta = Reglas.proponer(ej); } catch (e) { estado.propuesta = null; }
    // El desplegable del corpus y «Otro ejercicio» solo se ven en la práctica libre
    // (la dirección se abrió sin ejercicio). Un enlace a un ejercicio concreto, sea del
    // corpus (#ej=) o configurado (#e=), muestra solo ese ejercicio.
    const delCorpus = !!Ejercicios.porId(ej.id);
    const navegable = estado.libre && delCorpus;
    $('#selector').value = delCorpus ? ej.id : '';
    document.querySelector('.selector-caja').hidden = !navegable;
    $('#btn-siguiente').hidden = !navegable;
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
    // Primero el grado de la fundamental, después el cifrado (orden en que se rellenan)
    const que = estado.pedirRomano ? 'el grado sobre el que se construye la fundamental del acorde y después el cifrado' : 'el cifrado';
    const b = t => '<span class="ref-boton">' + t + '</span>';
    let html;
    if (estado.modoEj === 'cifrar') {
      html = '<b>Análisis.</b> Observa la armonización a cuatro voces y, para cada acorde, indica ' + que + '. Tonalidad: ' + ton + '. '
        + b('▶ Tono inicial') + ' sitúa la tonalidad; ' + b('▶ Escuchar propuesta') + ' hace sonar la armonización que ves, y el ' + b('▶') + ' sobre cada acorde, solo ese acorde; '
        + b('▶ Mi cifrado') + ' hace sonar lo que llevas cifrado.';
    } else if (estado.modoEj === 'audicion') {
      html = '<b>Audición.</b> Pulsa ' + b('▶ Tono inicial') + ' para situarte en la tonalidad (' + ton + ') y ' + b('▶ Escuchar propuesta') + ' para oír la armonización que has de reconocer, '
        + 'o el ' + b('▶') + ' sobre cada acorde para oírlo uno a uno. Para cada nota del bajo indica, de lo que suena, ' + que + '. '
        + 'A medida que cifres verás tu propia realización, y ' + b('▶ Mi cifrado') + ' la hace sonar para compararla.';
    } else {
      html = '<b>Armonización.</b> Para cada nota del bajo indica ' + que + '. Tonalidad: ' + ton + '. '
        + b('▶ Tono inicial') + ' sitúa la tonalidad; ' + b('▶ Escuchar propuesta') + ' hace sonar el bajo (el ' + b('▶') + ' sobre cada nota, solo esa nota) y '
        + b('▶ Mi cifrado') + ', lo que llevas cifrado.';
    }
    if (estado.avisoMod === 'completo') {
      const mods = Ejercicios.modulaciones(ej);
      html += ' <b>Modula</b> ' + mods.map(m => 'a <b>' + Teoria.nombreTonalidad(m.tonalidad) + '</b> desde la nota ' + (m.nota + 1)).join(' y ')
        + ' (fila «Tonalidad»). En la nota del cambio, el acorde es común a las dos tonalidades: indica su grado en la anterior y en la nueva.';
    } else if (estado.avisoMod === 'existe') {
      html += ' <b>Este fragmento modula.</b> En la fila «Tonalidad», marca desde qué nota rige la tonalidad nueva y cuál es (vale la primera nota que ya no pertenece a la tonalidad anterior, o el acorde común que hace de pivote); en la nota marcada indica el grado en las dos tonalidades.';
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
      cont.appendChild(Partitura.iconoCifra(id, 26));
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
    pintarPaletaTonalidades();
  }

  /* ---------- Modulación: lecturas y marcas ---------- */

  // Marcas del ejercicio (índice de la nota pivote → tonalidad nueva)
  function marcasModelo() {
    const m = {};
    Ejercicios.modulaciones(estado.ejercicio).forEach(x => { m[x.nota] = x.tonalidad; });
    return m;
  }
  // Tonalidad que rige en cada nota según unas marcas: [{ton, antes}] (antes solo en las notas marcadas)
  function lecturaCon(marcas) {
    const n = estado.respuestas.length;
    let ton = estado.ejercicio.tonalidad;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (marcas[i] && i > 0) { out.push({ ton: marcas[i], antes: ton }); ton = marcas[i]; }
      else out.push({ ton });
    }
    return out;
  }
  const lecturaAlumno = () => lecturaCon(estado.marcas);
  // ¿La casilla de grado de la nota i está partida en dos (nota marcada)?
  const esDoble = i => !!estado.marcas[i] && i > 0 && estado.pedirRomano;
  const hayFilaTonalidad = () => estado.avisoMod !== null;
  const tonalidadEditable = () => estado.avisoMod === 'existe' && !estado.tonalidadBloqueada && !estado.corregido;

  // Paleta de tonalidades: las cinco vecinas de la que rige antes de la nota activa
  function pintarPaletaTonalidades() {
    const caja = $('#paleta-tonalidades-caja');
    const pal = $('#paleta-tonalidades');
    pal.innerHTML = '';
    if (!hayFilaTonalidad() || !estado.pedirRomano) { caja.hidden = true; return; }
    caja.hidden = !tonalidadEditable();
    const i = estado.activa;
    const sinEsta = Object.assign({}, estado.marcas); delete sinEsta[i];
    const antes = lecturaCon(sinEsta)[i].ton;
    Teoria.tonalidadesVecinas(antes).forEach((t, k) => {
      const cont = document.createDocumentFragment();
      const txt = document.createElement('span'); txt.className = 'tecla-romano-texto'; txt.textContent = Teoria.nombreCorto(t); cont.appendChild(txt);
      const num = document.createElement('span'); num.className = 'tecla-num'; num.textContent = String(k + 1); cont.appendChild(num);
      const b = tecla('tecla-ton', cont, Teoria.nombreTonalidad(t) + ' (tecla ' + (k + 1) + ')', () => marcarTonalidad(t));
      b.dataset.atajo = String(k + 1);
      b.dataset.ton = t.tonica + '/' + t.modo;
      if (estado.marcas[i] && Teoria.mismaTonalidad(estado.marcas[i], t)) b.classList.add('elegida');
      pal.appendChild(b);
    });
    pal.appendChild(tecla('tecla-borrar', 'Quitar', 'Quitar la marca de esta nota (Retroceso)', borrar));
  }

  // Estado que la partitura necesita para la fila «Tonalidad» y los rótulos
  function prepararModulacion() {
    const ej = estado.ejercicio;
    if (!hayFilaTonalidad()) { estado.filaTonalidad = null; estado.dobles = []; estado.etiquetas = []; return; }
    const n = estado.respuestas.length;
    estado.dobles = estado.respuestas.map((_, i) => esDoble(i));
    const celdas = [];
    const resMarcas = estado.corregido && estado.resultadoMod ? estado.resultadoMod : null;
    for (let i = 0; i < n; i++) {
      const c = { texto: '', clase: '', fija: false };
      if (i === 0) { c.texto = Teoria.nombreCorto(ej.tonalidad); c.clase = 'inicial'; c.fija = true; }
      else if (estado.marcas[i]) {
        c.texto = Teoria.nombreCorto(estado.marcas[i]);
        if (estado.avisoMod === 'completo') { c.clase = 'dada'; c.fija = true; }
        else if (resMarcas) c.clase = resMarcas.correctas.includes(i) ? 'bien' : 'mal';
        else if (estado.tonalidadBloqueada) c.clase = 'bien fija';
      } else if (resMarcas && resMarcas.faltan.includes(i)) { c.clase = 'mal'; c.texto = '¿?'; }
      celdas.push(c);
    }
    estado.filaTonalidad = { visible: true, editable: tonalidadEditable(), celdas };
    // Rótulos encima del sistema: en modo completo, siempre; en 'existe', al mostrar la solución
    estado.etiquetas = [];
    if (estado.avisoMod === 'completo' || estado.mostrarSolucion) {
      Ejercicios.modulaciones(ej).forEach(m => estado.etiquetas.push({ i: m.nota, texto: '→ ' + Teoria.nombreCorto(m.tonalidad), clase: estado.avisoMod === 'completo' ? 'dada' : 'solucion' }));
    }
  }

  function marcarTonalidad(t) {
    if (!tonalidadEditable()) return;
    const i = estado.activa;
    if (i === 0) return;
    estado.marcas[i] = t;
    if (estado.tocadas) estado.tocadas[i].tonalidad = true;
    // Al marcar, la casilla de grado de esa nota se parte: se pasa a rellenar su segunda mitad si falta
    estado.campo = estado.pedirRomano ? (estado.romanos[i] ? 'romano2' : 'romano') : 'cifra';
    pintar();
  }

  // ¿Puede verse ahora el pentagrama de sol?
  function realizacionVisible() {
    if (estado.realizacionCuando === 'nunca') return false;
    if (estado.realizacionCuando === 'alCorregir' && !estado.corregido) return false;
    return estado.verRealizacion;
  }

  // ¿La nota i tiene ya cifra y grado (o solo cifra, si no se pide el grado)?
  // En una nota marcada como cambio de tonalidad hacen falta los dos grados.
  function notaCompleta(i) {
    return !!estado.respuestas[i] && (!estado.pedirRomano || (!!estado.romanos[i] && (!esDoble(i) || !!estado.romanos2[i])));
  }

  const cifrasModelo = () => estado.ejercicio.respuestas.map((_, i) => Ejercicios.admisibles(estado.ejercicio, i)[0]);

  // Cifras que se dibujan en el pentagrama de sol: las modelo en Análisis; en
  // Armonización y Audición, las del alumno, solo en las notas completas (grado y cifra).
  function cifrasParaRealizar() {
    if (estado.modoEj === 'cifrar') return cifrasModelo();
    return estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null));
  }

  // El bajo se dobla a la octava grave al sonar, para que destaque y se oigan bien las inversiones.
  const conBajoDoblado = (bajo, voces) => [{ letra: bajo.letra, alt: bajo.alt, octava: bajo.octava - 1 }, bajo, ...voces];

  function calcularRealizacion() {
    if (!realizacionVisible()) { estado.realizacion = null; estado.realizacionMal = null; estado.paralelas = []; return; }
    const r = Realizacion.realizar(estado.ejercicio, cifrasParaRealizar(), { modo: estado.rigida ? 'rigida' : 'auto', rotacion: estado.rotacion });
    estado.realizacion = r.acordes;
    estado.paralelas = r.paralelas;
    estado.realizacionMal = (estado.modoEj !== 'cifrar' && estado.corregido && estado.resultados) ? estado.resultados.map(x => !x.okCifra) : null;
  }

  // «Escuchar propuesta» suena siempre: en Armonización propone solo el bajo.
  const propuestaAudible = () => true;

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
    prepararModulacion();
    Partitura.dibujar($('#partitura'), estado.ejercicio, estado, seleccionar);
    pintarPaletaTonalidades();
    const n = estado.respuestas.length;
    const hechas = estado.respuestas.filter((r, i) => notaCompleta(i)).length;
    // Tras corregir, el número de intento solo tiene sentido si el ejercicio sigue abierto (hay errores que corregir)
    const enCurso = estado.intento > 0 && !estado.mostrarSolucion;
    $('#progreso').textContent = hechas + ' de ' + n + ' notas completas' + (enCurso ? ' · intento ' + (estado.intento + 1) : '');
    $('#btn-corregir').disabled = estado.corregido;
    document.querySelectorAll('.paleta .tecla').forEach(b => { b.disabled = estado.corregido; });
    document.querySelectorAll('.paleta-caja').forEach(p => p.classList.remove('destacada'));
    if (!estado.corregido) {
      const caja = estado.campo === 'tonalidad' && tonalidadEditable() ? '#paleta-tonalidades-caja'
        : (estado.campo === 'romano' || estado.campo === 'romano2') && estado.pedirRomano ? '#paleta-romanos-caja' : '#paleta-caja';
      $(caja).classList.add('destacada');
    }
  }

  /* ---------- Interacción ---------- */

  // Casillas de respuesta de la nota j en el ORDEN en que se rellenan: primero el grado
  // de la fundamental (los dos, en un pivote) y después el cifrado (así lo pidió Diego).
  // La fila «Tonalidad» no entra: es opcional.
  const camposDe = j => (estado.pedirRomano ? (esDoble(j) ? ['romano', 'romano2', 'cifra'] : ['romano', 'cifra']) : ['cifra']);
  // Las mismas casillas en su orden VISUAL, de arriba abajo (para las flechas ↑ ↓)
  const camposVisuales = j => (estado.pedirRomano ? (esDoble(j) ? ['cifra', 'romano', 'romano2'] : ['cifra', 'romano']) : ['cifra']);
  const campoInicial = () => (estado.pedirRomano ? 'romano' : 'cifra');
  const valorDe = (j, campo) => (campo === 'cifra' ? estado.respuestas[j] : campo === 'romano2' ? estado.romanos2[j] : estado.romanos[j]);

  function seleccionar(i, campo) {
    if (estado.corregido) return;
    campo = campo || campoInicial();
    if (campo === 'tonalidad') { if (!tonalidadEditable() || i === 0) return; }
    else if (!camposDe(i).includes(campo)) campo = campoInicial();
    if (campo !== 'tonalidad' && bloqueada(i, campo)) {
      // Si la casilla pulsada está bloqueada, ir a otra editable de la misma nota
      const otra = camposDe(i).find(c => !bloqueada(i, c));
      if (otra) campo = otra; else return;
    }
    estado.activa = i;
    estado.campo = campo;
    pintar();
  }

  const bloqueada = (j, campo) => estado.bloqueadas[j] && estado.bloqueadas[j][campo];

  // Tras responder, pasa a la siguiente casilla pendiente: primero las otras casillas
  // de la misma nota, después las de las notas siguientes. Pendiente = editable y vacía;
  // en un reintento (hay casillas bloqueadas), pendiente = editable y aún no tocada
  // desde la corrección.
  function avanzar() {
    const n = estado.respuestas.length, i = estado.activa;
    const enReintento = estado.intento > 0;
    const pendiente = (j, campo) => !bloqueada(j, campo) && (enReintento ? !estado.tocadas[j][campo] : !valorDe(j, campo));
    const campos = camposDe(i);
    const posicion = campos.indexOf(estado.campo);
    for (const c of campos.slice(posicion + 1)) if (pendiente(i, c)) { estado.campo = c; return; }
    for (let k = 1; k <= n; k++) {
      const j = (i + k) % n;
      for (const c of camposDe(j)) if (pendiente(j, c)) { estado.activa = j; estado.campo = c; return; }
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
      const voces = id ? Realizacion.posicion(Realizacion.trio(id, notas[i], Ejercicios.tonalidadEn(ej, i)), estado.rotacion) : [];
      Sonido.acorde(conBajoDoblado(notas[i], voces), 1.1);
    } catch (e) { /* sin audio */ }
  }

  /* ---------- Escuchar ----------
     Tres cosas pueden sonar, siempre con el bajo doblado a la octava grave:
       · «Tono inicial»: la cadencia I–IV–V7–I de la tonalidad inicial, para situar el oído;
       · «Escuchar propuesta»: lo que propone el ejercicio. En Análisis, la armonización
         que se ve; en Audición, la armonización que se ha de reconocer (no se ve); en
         Armonización, solo el bajo (no hay armonización propuesta que oír).
       · «Mi cifrado»: la realización de lo que el alumno ha cifrado hasta el momento
         (las notas sin grado y cifra suenan solo con el bajo).
     El ▶ que hay ENCIMA de cada acorde hace sonar ese acorde de la propuesta (en
     Armonización, esa nota del bajo): reproduce el acorde, no el cifrado introducido. */

  const SEG_POR_NEGRA = 0.6;
  const opcionesRealizacion = () => ({ modo: estado.rigida ? 'rigida' : 'auto', rotacion: estado.rotacion });
  const duraciones = () => { const d = []; estado.ejercicio.compases.forEach(c => c.forEach(([, x]) => d.push(x))); return d; };

  // La propuesta: armonización modelo (Análisis y Audición) o solo el bajo (Armonización).
  function acordesPropuesta() {
    if (estado.modoEj === 'armonizar') return estado.respuestas.map(() => []);
    return Realizacion.realizar(estado.ejercicio, cifrasModelo(), opcionesRealizacion()).acordes;
  }
  function acordesMios() { return Realizacion.realizar(estado.ejercicio, estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null)), opcionesRealizacion()).acordes; }

  // Resalta el botón ▶ de la nota que suena (sin redibujar la partitura)
  function marcarSonando(i) {
    estado.sonando = i;
    document.querySelectorAll('#partitura .boton-sonar').forEach(b => b.classList.toggle('sonando', Number(b.dataset.indice) === i));
  }

  // Si medio segundo después de pedir sonido el navegador no ha arrancado el audio, se avisa
  // (bloqueo del navegador, pestaña silenciada, iPad en modo silencio…).
  function vigilarAudio() {
    clearTimeout(vigilarAudio.t);
    vigilarAudio.t = setTimeout(() => {
      const st = Sonido.estado();
      if (st === 'running') return;
      const causa = st === 'sin web audio' ? 'este navegador no tiene Web Audio'
        : st === 'interrupted' ? 'otra aplicación está usando el audio'
        : 'el navegador mantiene el audio bloqueado (estado: ' + st + '). Vuelve a pulsar el botón; si sigue sin sonar, comprueba el volumen, que la pestaña no esté silenciada y, en un iPad, el interruptor de silencio';
      aviso('No suena: ' + causa + '.', 7000);
    }, 500);
  }

  function reproducir(acordes) {
    const notas = Reglas.notasDe(estado.ejercicio);
    const dur = duraciones();
    const items = notas.map((n, i) => ({ notas: conBajoDoblado(n, acordes[i] || []), segundos: SEG_POR_NEGRA * dur[i], alEmpezar: () => marcarSonando(i) }));
    try {
      Sonido.secuencia(items, () => { marcarSonando(null); $('#btn-parar').hidden = true; });
      $('#btn-parar').hidden = false;
      vigilarAudio();
    } catch (e) { aviso('No se ha podido reproducir el sonido en este navegador: ' + e.message); }
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
      vigilarAudio();
    } catch (e) { aviso('No se ha podido reproducir el sonido en este navegador: ' + e.message); }
  }

  // Botón ▶ sobre la nota i: suena ese acorde de la propuesta (en Armonización, la nota del bajo)
  function sonarAcorde(i) {
    const notas = Reglas.notasDe(estado.ejercicio);
    const ac = acordesPropuesta()[i];
    try {
      Sonido.acorde(conBajoDoblado(notas[i], ac || []), 1.4);
      marcarSonando(i);
      vigilarAudio();
      setTimeout(() => { if (estado.sonando === i && !Sonido.enCurso()) marcarSonando(null); }, 1400);
    } catch (e) { aviso('No se ha podido reproducir el sonido: ' + e.message); }
  }

  function parar() { Sonido.parar(); marcarSonando(null); $('#btn-parar').hidden = true; }

  function responderRomano(r) {
    if (estado.corregido || !estado.pedirRomano) return;
    const i = estado.activa;
    // El grado va a la mitad activa de la casilla (en un pivote hay dos: anterior y nueva)
    const campo = estado.campo === 'romano2' && esDoble(i) ? 'romano2' : 'romano';
    if (bloqueada(i, campo)) return;
    estado.campo = campo;
    if (campo === 'romano2') estado.romanos2[i] = r; else estado.romanos[i] = r;
    if (estado.tocadas) estado.tocadas[i][campo] = true;
    avanzar();
    pintar();
    if (estado.sonar && notaCompleta(i)) sonarNota(i, estado.respuestas[i]);
  }

  function borrar() {
    if (estado.corregido) return;
    const i = estado.activa;
    if (estado.campo === 'tonalidad') {
      if (!tonalidadEditable() || !estado.marcas[i]) return;
      delete estado.marcas[i];
      estado.romanos2[i] = null;
      pintar();
      return;
    }
    if (bloqueada(i, estado.campo)) return;
    if (estado.campo === 'romano2') estado.romanos2[i] = null;
    else if (estado.campo === 'romano') estado.romanos[i] = null;
    else estado.respuestas[i] = null;
    pintar();
  }

  /* ---------- Corrección ----------
     Cifra: correcta si está entre las admisibles. Grado: correcto si coincide con el de
     la cifra dada (o, si la cifra no es admisible, con el de alguna admisible), leído en
     la tonalidad que rige en la nota. Con modulación, la lectura depende de las marcas:
     si las del alumno son correctas (una por modulación, en el pivote o hasta la primera
     nota ajena a la tonalidad anterior, con la tonalidad acertada), los grados se leen
     según sus marcas; si no, según las del ejercicio, aceptando en el pivote cualquiera
     de las dos lecturas. */

  function corregirMarcas() {
    const ej = estado.ejercicio;
    const mods = Ejercicios.modulaciones(ej);
    if (!mods.length) return null;
    const marcas = estado.marcas;
    const indices = Object.keys(marcas).map(Number).sort((a, b) => a - b);
    const usadas = new Set(), correctas = [], faltan = [], info = [];
    let ok = true;
    mods.forEach(m => {
      const ajena = Ejercicios.primeraAjena(ej, m);
      const rango = [m.nota, ajena === null ? m.nota : ajena];
      const idx = indices.find(k => k >= rango[0] && k <= rango[1] && !usadas.has(k));
      const bien = idx !== undefined && Teoria.mismaTonalidad(marcas[idx], m.tonalidad);
      if (idx !== undefined) usadas.add(idx);
      if (bien) correctas.push(idx); else { ok = false; if (idx === undefined) faltan.push(m.nota); }
      info.push({ m, rango, idx, bien, tonAlumno: idx !== undefined ? marcas[idx] : null });
    });
    const sobrantes = indices.filter(k => !usadas.has(k));
    if (sobrantes.length) ok = false;
    return { ok, info, correctas, faltan, sobrantes };
  }

  function corregir() {
    const ej = estado.ejercicio;
    estado.resultadoMod = corregirMarcas();
    const marcasOk = !estado.resultadoMod || estado.resultadoMod.ok;
    const lectura = lecturaCon(marcasOk ? estado.marcas : marcasModelo());
    estado.resultados = ej.respuestas.map((_, i) => {
      const l = lectura[i];
      const parejas = Ejercicios.parejasEn(ej, i, l.ton);
      const adm = parejas.map(p => p.cifra);
      const cifra = estado.respuestas[i], rom = estado.romanos[i], rom2 = estado.romanos2[i];
      const okCifra = cifra !== null && adm.includes(cifra);
      const cand = pares => (okCifra ? pares.filter(p => p.cifra === cifra) : pares);
      const acierta = (pares, r) => r !== null && cand(pares).some(p => p.romano === r);
      let okRomano = true, okRomano2 = true, modeloRomano = parejas[0].romano;
      if (estado.pedirRomano) {
        const doble = esDoble(i);
        if (marcasOk && l.antes) {
          // Nota marcada (pivote): grado en la tonalidad anterior y en la nueva
          const antes = Ejercicios.parejasEn(ej, i, l.antes);
          okRomano = acierta(antes, rom);
          okRomano2 = acierta(parejas, rom2);
          modeloRomano = antes[0].romano + ' = ' + parejas[0].romano;
        } else if (!marcasOk && Ejercicios.esPivote(ej, i)) {
          // Marcas equivocadas: en el pivote vale cualquiera de las dos lecturas
          const antes = Ejercicios.parejasEn(ej, i, Ejercicios.tonalidadAntes(ej, i));
          okRomano = acierta(parejas, rom) || acierta(antes, rom);
          okRomano2 = !doble || acierta(parejas, rom2) || acierta(antes, rom2);
          modeloRomano = antes[0].romano + ' = ' + parejas[0].romano;
        } else {
          okRomano = acierta(parejas, rom);
          okRomano2 = !doble || acierta(parejas, rom2);   // marca sobrante: la segunda mitad se juzga en la tonalidad que rige
        }
      }
      return { ok: okCifra && okRomano && okRomano2, okCifra, okRomano, okRomano2, modelo: parejas[0].cifra, modeloRomano, cifra, romano: rom, romano2: rom2 };
    });
    estado.intento += 1;
    const aciertos = estado.resultados.filter(r => r.ok).length;
    if (estado.intento === 1) estado.primerIntento = aciertos;
    estado.corregido = true;
    const todoBien = aciertos === estado.resultados.length && marcasOk;
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
      if (!estado.pedirRomano || !esDoble(i) || r.okRomano2) estado.bloqueadas[i].romano2 = true;
    });
    if (estado.resultadoMod) {
      if (estado.resultadoMod.ok) estado.tonalidadBloqueada = true;
      else {
        // Marcas equivocadas: se quitan las sobrantes y se dejan las demás para corregirlas
        estado.resultadoMod.sobrantes.forEach(k => { delete estado.marcas[k]; estado.romanos2[k] = null; });
        estado.resultadoMod.info.forEach(x => { if (x.idx !== undefined && !x.bien) { delete estado.marcas[x.idx]; estado.romanos2[x.idx] = null; } });
      }
    }
    estado.tocadas = estado.bloqueadas.map(() => ({ cifra: false, romano: false, romano2: false, tonalidad: false }));
    estado.corregido = false;
    estado.resultados = null;
    // Primera casilla editable
    estado.activa = 0; estado.campo = campoInicial();
    busqueda: for (let j = 0; j < estado.respuestas.length; j++)
      for (const c of camposDe(j)) if (!bloqueada(j, c)) { estado.activa = j; estado.campo = c; break busqueda; }
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
    if (estado.pedirRomano) html += '<p class="desglose">Grados: ' + aciertosRomano + ' de ' + n + ' · Cifrados: ' + aciertosCifra + ' de ' + n
      + (estado.intento > 1 && estado.primerIntento !== null ? ' · Al primer intento: ' + estado.primerIntento + ' de ' + n : '') + '</p>';
    else if (estado.intento > 1 && estado.primerIntento !== null) html += '<p class="desglose">Al primer intento: ' + estado.primerIntento + ' de ' + n + '</p>';
    // Modulación
    const rm = estado.resultadoMod;
    if (rm) {
      const partes = rm.info.map(x => {
        const nombre = Teoria.nombreTonalidad(x.m.tonalidad);
        if (estado.avisoMod === 'completo') return 'Modulación a ' + nombre + ' desde la nota ' + (x.m.nota + 1) + '.';
        const donde = x.rango[0] === x.rango[1] ? 'en la nota ' + (x.rango[0] + 1) : 'entre la nota ' + (x.rango[0] + 1) + ' (acorde pivote) y la ' + (x.rango[1] + 1) + ' (primera nota ajena a la tonalidad anterior)';
        if (x.bien) return 'Modulación a ' + nombre + ': <span class="cif bien">bien marcada</span> (nota ' + (x.idx + 1) + ').';
        if (x.idx === undefined) return 'Modulación a ' + nombre + ': <span class="cif mal">sin marcar</span>' + (estado.mostrarSolucion ? '; empieza ' + donde : '') + '.';
        return 'Modulación: has marcado <span class="cif mal">' + Teoria.nombreCorto(x.tonAlumno) + ' en la nota ' + (x.idx + 1) + '</span>' + (estado.mostrarSolucion ? '; es a ' + nombre + ', ' + donde : ' (la tonalidad no es esa)') + '.';
      });
      if (rm.sobrantes.length) partes.push('Marca' + (rm.sobrantes.length > 1 ? 's' : '') + ' de tonalidad que sobra' + (rm.sobrantes.length > 1 ? 'n' : '') + ': nota' + (rm.sobrantes.length > 1 ? 's' : '') + ' ' + rm.sobrantes.map(k => k + 1).join(', ') + '.');
      html += '<p class="desglose modulacion">' + partes.join(' ') + '</p>';
    }
    const todoBien = aciertos === n && (!rm || rm.ok);
    if (todoBien) {
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
        const gradoDado = esDoble(i) ? (r.romano || '¿?') + ' = ' + (r.romano2 || '¿?') : (r.romano || '¿grado?');
        const dada = (estado.pedirRomano ? gradoDado + ' ' : '') + (r.cifra ? Teoria.CIFRADOS[r.cifra].etiqueta : '¿cifra?');
        const modelo = (estado.pedirRomano ? r.modeloRomano + ' ' : '') + Teoria.CIFRADOS[r.modelo].etiqueta;
        let expl = '';
        if (estado.propuesta && estado.propuesta[i] && estado.propuesta[i].modelo === r.modelo) expl = estado.propuesta[i].explicacion;
        const otras = parejas.slice(1).map(ver);
        const que = !r.okCifra && !(r.okRomano && r.okRomano2) ? '' : (!r.okCifra ? ' (falla la cifra)' : ' (falla el grado)');
        html += '<li><b>Nota ' + (i + 1) + ' (' + nombre + ')</b>' + que + ': has puesto <span class="cif mal">' + dada + '</span>; '
          + 'la respuesta modelo es <span class="cif bien">' + modelo + '</span>'
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

  function aviso(txt, ms = 4000) {
    const a = $('#aviso');
    a.textContent = txt;
    a.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { a.hidden = true; }, ms);
  }

  /* ---------- Teclado: flechas para moverse, números para elegir en la paleta activa,
     retroceso para borrar, Esc para parar el sonido ---------- */
  document.addEventListener('keydown', ev => {
    if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return;
    if (ev.key === 'Escape') { parar(); return; }
    if (estado.corregido || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const n = estado.respuestas.length;
    // Filas de casillas de la nota activa, de arriba abajo (la de tonalidad solo si se edita)
    const filas = camposVisuales(estado.activa).concat(tonalidadEditable() && estado.activa > 0 ? ['tonalidad'] : []);
    const pos = Math.max(0, filas.indexOf(estado.campo));
    if (ev.key === 'ArrowRight') { estado.activa = (estado.activa + 1) % n; if (!camposDe(estado.activa).concat(['tonalidad']).includes(estado.campo)) estado.campo = campoInicial(); pintar(); }
    else if (ev.key === 'ArrowLeft') { estado.activa = (estado.activa - 1 + n) % n; if (!camposDe(estado.activa).concat(['tonalidad']).includes(estado.campo)) estado.campo = campoInicial(); pintar(); }
    else if (ev.key === 'ArrowDown') { if (pos < filas.length - 1) { estado.campo = filas[pos + 1]; pintar(); } }
    else if (ev.key === 'ArrowUp') { if (pos > 0) { estado.campo = filas[pos - 1]; pintar(); } }
    else if (/^[0-9]$/.test(ev.key)) {
      // El número pequeño de cada tecla de la paleta activa (cifra, grado o tonalidad)
      const paleta = estado.campo === 'tonalidad' ? '#paleta-tonalidades'
        : (estado.campo === 'romano' || estado.campo === 'romano2') && estado.pedirRomano ? '#paleta-romanos' : '#paleta';
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
    // Instrumento: lista, elección guardada y aviso de carga
    const selInst = $('#instrumento');
    Sonido.INSTRUMENTOS.forEach(x => { const o = document.createElement('option'); o.value = x.id; o.textContent = x.nombre; selInst.appendChild(o); });
    try { const g = localStorage.getItem('armonizar.instrumento'); if (g && Sonido.INSTRUMENTOS.some(x => x.id === g)) Sonido.elegirInstrumento(g); } catch (e) { /* sin almacenamiento */ }
    selInst.value = Sonido.instrumentoActual();
    selInst.addEventListener('change', () => {
      Sonido.parar(); marcarSonando(null); $('#btn-parar').hidden = true;
      Sonido.elegirInstrumento(selInst.value);
      try { localStorage.setItem('armonizar.instrumento', selInst.value); } catch (e) { /* nada */ }
    });
    Sonido.alCargar = (id, listo) => {
      const e = $('#instrumento-estado');
      if (!listo) { e.textContent = 'cargando…'; e.hidden = false; }
      else if (id === Sonido.instrumentoActual()) e.hidden = true;
    };
    // El audio del navegador solo arranca tras un gesto del usuario: se prepara en el primero
    // (y se precarga el instrumento elegido)
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => Sonido.desbloquear(), { once: true, passive: true }));
    $('#btn-cadencia').addEventListener('click', escucharCadencia);
    $('#btn-propuesta').addEventListener('click', escucharPropuesta);
    $('#btn-mio').addEventListener('click', escucharMio);
    $('#btn-parar').addEventListener('click', parar);
    const inicial = new URLSearchParams(location.hash.replace(/^#/, ''));
    estado.libre = !inicial.has('e') && !inicial.has('ej');
    window.addEventListener('hashchange', () => cargar(ejercicioDesdeURL()));
    cargar(ejercicioDesdeURL());
  });

})();
