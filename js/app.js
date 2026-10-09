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
    funciones: [],            // función tonal elegida por nota ('T' | 'S' | 'D') o null
    modoFun: null,            // null (sin fila «Función») | 'dadas' (rellena, fija) | 'pedir' (la rellena el alumno)
    bajos: [],                // melodía de soprano: bajo deducido de cada respuesta (nota o null)
    bajosMal: null,           // melodía de soprano: tras corregir, qué bajos van en rojo
    avisosVoces: [],          // errores de conducción de voces de la realización que se ve (notas en rojo + globo)
    tecnicas: [],             // prolongaciones y cadencias detectadas, para los cuadros (decisión 155)
    marcas: {},               // modulación según el alumno: índice de nota → tonalidad que rige desde ahí
    modoTon: null,            // fila «Tonalidad»: null (no hay) | 'dadas' (rellena) | 'pedir' (la pone el alumno)
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
    /* Por nota: {cifra:bool, romano:bool…} — las casillas que ya estaban bien en la
       corrección anterior. Se pintan en verde, pero SIGUEN EDITÁNDOSE (decisión 126):
       bloquearlas dejaba al alumno sin salida, porque a veces el error de una casilla
       solo se arregla tocando otra que estaba bien —cambiar el cifrado obliga a menudo a
       cambiar la fundamental, y al revés—. */
    acertadas: [],
    mostrarSolucion: false,   // si se enseñan las respuestas modelo y las explicaciones
    reintentos: true,         // si el alumno puede corregir solo los errores antes de ver la solución
    modoEj: 'armonizar',      // 'armonizar' | 'cifrar' (Análisis: se muestra la realización modelo) | 'audicion' | 'soprano' (melodía dada; el bajo se deduce)
    realizacionCuando: 'siempre', // 'siempre' (Análisis) | 'alCerrar' (Armonización y Audición: al mostrar la solución)
    verRealizacion: true,     // siempre: quien decide si se ve la realización es la ficha (Diego, 27/9/2026)
    verGrados: true,          // grados de la escala en circulito sobre el bajo (Gjerdingen)
    gradosPermitidos: true,   // el profesor puede quitarlos en el ejercicio
    rotacion: 0,              // posición inicial de Furno (0, 1, 2)
    rigida: false,            // misma disposición en todos los acordes (solo en pruebas.html; el alumno ya no lo ve)
    sonar: true,              // sonar el acorde al completar cifra y grado (marcada por defecto, decisión 96)
    sonando: null,            // nota cuyo acorde está sonando (para resaltar su botón ▶)
    alSonar: null,            // función que la partitura llama al pulsar el ▶ de una nota
    libre: false,             // práctica libre: la página se abrió sin ejercicio en la dirección (se ve el desplegable del corpus)
    ficha: null,              // ficha en curso: {filtro, lista, k, marcador} (varios ejercicios encadenados)
    avisosRespuesta: [],      // avisos de conducción de voces de lo que el alumno ha escrito (al corregir)
    notasAviso: null,         // Set con las notas implicadas en esos avisos: quedan editables
    verEnlaces: false,        // una vez han salido avisos, la realización se queda a la vista para poder arreglarlos
    leerErrores: false        // leer en voz alta la explicación de los errores al corregir (decisión 121)
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
    /* Registro de la práctica (etapa 8b). Si el enlace no es de ficha, la práctica es
       este único ejercicio. */
    if (!Registro.resumen()) Registro.iniciarPractica({ tipo: 'ejercicio', titulo: ej.coleccion || ej.titulo || '', modo: Ejercicios.modo(ej), n: 1 });
    Registro.iniciarEjercicio(ej, estado.ficha ? estado.ficha.k : 0);
    estado.ejercicio = ej;
    estado.respuestas = new Array(n).fill(null);
    estado.romanos = new Array(n).fill(null);
    estado.romanos2 = new Array(n).fill(null);
    /* La fila del grado es la de la FUNDAMENTAL en los cuatro tipos (decisión 113). O se
       pide o no hay fila: no existe el estado «viene escrita» de la decisión 94. */
    estado.pedirRomano = Ejercicios.pideRomano(ej) || Ejercicios.esSoprano(ej);   // en la melodía de soprano el grado es imprescindible: de él sale el bajo
    estado.modoFun = Ejercicios.funciones(ej);
    estado.funciones = estado.modoFun === 'dadas' ? ej.respuestas.map((_, i) => Ejercicios.funcionModelo(ej, i)) : new Array(n).fill(null);
    /* La función en el PIVOTE se parte en dos, una por tonalidad (decisión 95): la de
       arriba es la del tono de partida y la de abajo la del de llegada. */
    estado.funciones2 = estado.modoFun === 'dadas'
      ? ej.respuestas.map((_, i) => (Ejercicios.esPivote(ej, i) ? Ejercicios.funcionModelo(ej, i) : null))
      : new Array(n).fill(null);
    if (estado.modoFun === 'dadas') ej.respuestas.forEach((_, i) => {
      if (Ejercicios.esPivote(ej, i)) estado.funciones[i] = Ejercicios.funcionModeloEn(ej, i, Ejercicios.tonalidadAntes(ej, i));
    });
    estado.bajos = new Array(n).fill(null);
    estado.bajosMal = null;
    estado.corregido = false;
    estado.resultados = null;
    estado.resultadoMod = null;
    estado.intento = 0;
    estado.primerIntento = null;
    estado.acertadas = Array.from({ length: n }, () => ({ cifra: false, romano: false, romano2: false, funcion: false, funcion2: false, tonalidad: false }));
    // Modulación: en modo 'completo' las marcas vienen dadas; en 'existe' las pone el alumno
    estado.modoTon = Ejercicios.tonalidades(ej);
    /* Sin fila y con modulación, el fragmento se cifra igualmente en sus tonalidades
       verdaderas: simplemente no se le dicen al alumno (modulación sin anunciar). */
    estado.marcas = estado.modoTon === 'pedir' ? {} : marcasModelo();
    estado.tonalidadBloqueada = estado.modoTon !== 'pedir';
    /* La primera casilla, la que dicte el ORDEN de la nota 0 (decisión 197): con las
       tonalidades por pedir es la del tono de partida, y si no, la función o el grado.
       Va DESPUÉS de fijar `modoTon` y `marcas`, que son de lo que depende. */
    estado.activa = 0;
    estado.campo = campoInicial(0);
    estado.mostrarSolucion = false;
    estado.avisosRespuesta = [];
    estado.notasAviso = null;
    estado.verEnlaces = false;
    estado.reintentos = ej.reintentos !== false;
    estado.modoEj = Ejercicios.modo(ej);
    estado.realizacionCuando = Ejercicios.realizacion(ej);
    estado.gradosPermitidos = Ejercicios.gradosBajo(ej);
    estado.verGrados = estado.gradosPermitidos;
    estado.sonando = null;
    estado.alSonar = sonarAcorde;
    Sonido.parar();
    try { estado.propuesta = Ejercicios.esSoprano(ej) ? Reglas.proponerSoprano(ej, { funciones: ej.funcionesNotas || null }) : Reglas.proponer(ej); } catch (e) { estado.propuesta = null; }
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
    const f = estado.ficha;
    /* La banda dice DE DÓNDE viene este ejercicio y nada más: «Lección» y el nombre de la
       lección (Diego, 28/9/2026). Por dónde va la ficha —«Ejercicio 1 de 4»— bajó junto a
       «Comprobar», que es donde el alumno mira cuando termina uno. La palabra «Ficha» no
       aportaba nada, y el renglón «Lección …» que había debajo era lo mismo ocupando sitio. */
    const deDonde = ej.leccion || ej.coleccion || (f && f.filtro.titulo) || '';
    const tema = ej.leccion || deDonde;      // ya viene como «Tema 14 · …» (1/10/2026)
    /* El título del fragmento solo se añade si dice algo NUEVO: cuando el fragmento no
       tiene título propio hereda el nombre de la lección, y la banda repetía «A3-5 · El
       6/4 cadencial · El 6/4 cadencial». */
    const suyo = ej.titulo && !tema.includes(ej.titulo) ? ej.titulo : '';
    $('#titulo').textContent = tema + (suyo ? (tema ? ' · ' : '') + suyo : '');
    /* EL CRÉDITO DE LA OBRA, bajo la partitura y desde el principio (decisión 198, Diego
       29/9/2026). No es lo mismo que la banda de arriba, que dice de qué LECCIÓN viene el
       ejercicio: esto dice de qué MÚSICA se ha tomado el fragmento. */
    const cred = $('#procedencia-ej');
    /* ¿SE PUEDE OÍR LA MÚSICA DE VERDAD? (acuerdo con el chat auditivo, apartado 6;
       9/10/2026). El panel se prepara para TODO ejercicio —así se cierra y se calla el que
       estuviera abierto— y dice si este trae conexión con el banco auditivo. Si la trae, el
       crédito de la obra es un botón: al pulsarlo se despliega la partitura del pasaje, su
       grabación y los tres botones. */
    const hayEscucha = typeof Escucha !== 'undefined' && Escucha.montar(ej, $('#escucha-sitio'));
    if (cred) {
      const obra = ej.obra || '';
      const rotulo = obra ? (ej.autor ? ej.autor + ', ' : '') + obra : '';
      cred.textContent = '';
      if (rotulo && hayEscucha) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'escuchar-obra';
        b.textContent = rotulo;
        b.title = 'Ver la partitura de la obra y oír la grabación';
        b.addEventListener('click', () => Escucha.alternar());
        cred.appendChild(b);
      } else if (rotulo) {
        cred.appendChild(document.createTextNode(rotulo));
      }
      /* Y, si el fragmento trae enlace, dónde ver la partitura de verdad (decisión 199).
         Se abre en otra pestaña y con `noopener`: es una página de fuera. El texto no
         promete nada del otro sitio —«Ver la partitura»— y el globo dice a qué dominio
         lleva, para que el alumno sepa adónde va antes de pulsar. */
      let dominio = '';
      if (ej.enlace) { try { dominio = new URL(ej.enlace).hostname.replace(/^www\./, ''); } catch (e) { dominio = ''; } }
      if (ej.enlace && dominio) {
        const a = document.createElement('a');
        a.href = ej.enlace; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.className = 'enlace-obra';
        a.textContent = 'Ver la partitura';
        a.title = 'Se abre en otra pestaña, en ' + dominio;
        cred.appendChild(document.createTextNode(obra ? ' · ' : ''));
        cred.appendChild(a);
      }
      cred.hidden = !obra && !(ej.enlace && dominio);
    }
    /* Por dónde va la ficha, abajo y junto al botón de comprobar */
    const donde = $('#donde-ficha');
    if (donde) {
      donde.textContent = f ? 'Ejercicio ' + (f.k + 1) + ' de ' + f.lista.length : '';
      donde.hidden = !f;
    }
    /* ---- El enunciado ----
       Una sola cosa clara —qué hay que hacer— y, debajo, cómo responde la aplicación. Los
       botones de sonido y la tonalidad del fragmento no se explican: están a la vista, se
       entienden pulsándolos y llenaban el enunciado de letra menuda (decisión 57). Solo se
       dice lo que el alumno no puede adivinar mirando: qué se le pide en cada casilla, qué
       filas ha de rellenar y qué significan las notas en rojo. */
    const señala = [];
    if (estado.modoFun === 'pedir') señala.push('su <b>función tonal</b>');
    if (pideGrado()) señala.push('su <b>sonido fundamental</b>');
    señala.push('su <b>cifrado interválico</b> (la inversión en que lo escribes)');
    const que = señala.length > 1
      ? señala.slice(0, -1).join(', ') + ' y ' + señala[señala.length - 1]
      : señala[0];
    const frases = [];
    if (estado.modoEj === 'cifrar') {
      frases.push('<b>Análisis.</b> Tienes este bajo con su armonización a cuatro voces: di qué acorde es cada uno señalando ' + que + '.');
    } else if (estado.modoEj === 'audicion') {
      frases.push('<b>Audición.</b> Escucha la armonización y reconócela: para cada acorde señala ' + que + '.');
    } else if (estado.modoEj === 'soprano') {
      frases.push('<b>Armonización de soprano.</b> Armoniza esta melodía: para cada nota elige un acorde y señala ' + que + '.');
    } else {
      frases.push('<b>Armonización de bajo.</b> Armoniza este bajo: para cada nota elige un acorde y señala ' + que + '.');
    }
    /* Marcar las tonalidades es tarea suya, así que va en la primera línea (decisión 56) */
    const mods = Ejercicios.modulaciones(ej);
    if (estado.modoTon === 'pedir') {
      frases.push('Marca además, en la fila <b>Tonalidad</b>, desde qué nota rige una tonalidad nueva y cuál es'
        + (mods.length ? ': <b>este fragmento modula</b>.' : ', <b>si es que el fragmento cambia de tono</b>.'));
    }
    /* Segunda línea: lo que la aplicación le DA o le enseña por su cuenta, que no es tarea
       y no debe competir con el enunciado. */
    const notas = [];
    if (estado.modoFun === 'dadas') notas.push('La fila <b>Función</b> te da la función tonal de cada acorde: elige acordes que la cumplan.');
    if (estado.modoTon === 'dadas' && mods.length) {
      notas.push('<b>Modula</b> ' + mods.map(m => 'a <b>' + Teoria.nombreTonalidad(m.tonalidad) + '</b> desde la nota ' + (m.nota + 1)).join(' y ')
        + '; ese acorde es común a las dos tonalidades, así que se te pide su sonido fundamental en las dos.');
    }
    if (estado.modoEj === 'armonizar' || estado.modoEj === 'soprano') {
      notas.push('La realización a cuatro voces se va escribiendo a medida que cifras'
        + (estado.modoEj === 'soprano' ? ', con el bajo debajo y la melodía arriba' : '') + '. '
        + 'Si dos acordes seguidos producen un error de conducción de voces (octavas o quintas seguidas, una sensible o una séptima sin resolver), '
        + 'las notas implicadas salen en <span class="ref-mal">rojo</span>: púlsalas para ver de qué error se trata.');
    } else if (estado.modoEj === 'audicion') {
      notas.push('Al terminar verás el bajo y la realización a cuatro voces.');
    }
    /* El aviso del envío, con el enunciado (Diego, 28/9/2026): el alumno tiene que saber
       desde el principio que enviar exige terminar la ficha, no descubrirlo al final. */
    if (estado.ficha && Envio.disponible())
      notas.push('Podrás <b>enviar el resultado</b> al terminar los ' + estado.ficha.lista.length + ' ejercicios de la ficha.');
    $('#instruccion').innerHTML = frases.join(' ')
      + (notas.length ? '<span class="instruccion-nota">' + notas.join(' ') + '</span>' : '');
    /* Lección y repertorio de acordes. Cada lección tiene el suyo, y en una ficha que
       mezcla lecciones hay que decir con qué acordes se espera armonizar cada fragmento:
       si no, no hay forma de acertar. */
    /* La tonalidad del fragmento, en el recuadro de abajo junto a la lección: el enunciado
       ya no la repite (decisión 57), pero el alumno la necesita para cifrar —una armadura
       de un bemol vale para Fa M y para re m—. */
    $('#tonalidad-fragmento').textContent = Teoria.nombreTonalidad(ej.tonalidad);
    // El título de la pestaña dice qué tipo de ejercicio es (decisión 58)
    document.title = 'Práctica armónica · ' + Banco.modoDe(estado.modoEj).etiqueta;
    const filaLec = $('#leccion-fila');
    if (ej.leccion) { $('#leccion').textContent = ej.leccion; filaLec.hidden = false; }
    else filaLec.hidden = true;
    /* El botón de ayuda solo aparece si la lección tiene cuadro de estructuras. */
    const btnEst = $('#btn-estructuras');
    if (btnEst) {
      /* El tema lo trae ya el ejercicio servido (1/10/2026). Antes se sacaba del código
         de la lección leyendo el principio de `ej.leccion`, y eso dejó de valer el día en
         que esa etiqueta pasó a decir «Tema 14 · …» en vez de «A4-11 · …». */
      const codigo = String(ej.leccion || '').match(/^[A-Za-z]{1,3}\d*-\d{1,2}/);
      const tema = ej.tema || (codigo ? temaDeCodigo(codigo[0]) : null);
      btnEst.hidden = !tema;
      btnEst.dataset.tema = tema ? String(tema) : '';
    }
    const deLaLeccion = ej.leccion ? 'de este tema' : 'en este ejercicio';
    const rep = $('#repertorio');
    rep.innerHTML = '';
    const acordes = Array.isArray(ej.acordes) && ej.acordes.length ? ej.acordes : null;
    /* El inventario de acordes, SIN inversiones (decisión 92). En una ficha es el de
       TODA la ficha —la unión de las lecciones que entran, que por ser acumulativas es
       «todo lo visto hasta la más avanzada»— y no cambia de un fragmento a otro: es la
       lista que Diego escribe en la pizarra al empezar la clase. */
    const acordesFicha = estado.ficha
      ? [...new Set([].concat(...estado.ficha.lista.map(e => e.leccionAcordes || [])))]
      : null;
    const inv = Ejercicios.inventario((acordesFicha && acordesFicha.length) ? acordesFicha : acordes);
    if (inv.length) {
      $('#etiqueta-repertorio').textContent = estado.ficha ? 'En esta ficha entran' : 'En este ejercicio entran';
      inv.forEach(a => {
        const s = document.createElement('span');
        s.className = 'ficha ficha-romano';
        s.textContent = a.nombre;
        // El detalle sigue a mano, sin llenar la cabecera: las inversiones, en el título
        s.title = a.posiciones.length > 1
          ? a.nombre + ' — en este repertorio, en ' + a.posiciones.length + ' posiciones: ' + a.posiciones.join(' · ')
          : a.nombre + ' — solo en ' + a.posiciones[0];
        rep.appendChild(s);
      });
    } else {
      $('#etiqueta-repertorio').textContent = 'Cifrados ' + deLaLeccion;
      ej.repertorio.forEach(id => {
        const c = Teoria.CIFRADOS[id];
        const s = document.createElement('span');
        s.className = 'ficha';
        s.title = c.descripcion;
        s.appendChild(Partitura.iconoCifra(id, 26));
        rep.appendChild(s);
      });
    }
    const gr = $('#grados');
    gr.innerHTML = '';
    const ayuda = Ejercicios.ayudaGrados(ej);
    $('#etiqueta-grados').textContent = 'Sonidos fundamentales en este ejercicio';
    $('#grados-fila').hidden = !pideGrado() || ayuda === 'ninguna' || (estado.modoEj === 'soprano' && !!acordes);
    if (pideGrado() && ayuda !== 'ninguna') Ejercicios.grados(ej).forEach(r => {
      const s = document.createElement('span');
      s.className = 'ficha ficha-romano';
      /* El grado, con el color de su función tonal, igual que su tecla (Diego, 28/9/2026):
         el alumno ve de un vistazo qué funciones entran en el ejercicio. */
      s.dataset.romano = r;
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
    /* Paleta de funciones tonales (solo si se piden). El número de cada tecla es el GRADO
       de la escala que da nombre a la función (decisión 107, Diego): tónica 1,
       subdominante 4, dominante 5. Así la tecla se aprende sola y no depende del sitio que
       ocupe el botón. La dominante de la dominante lleva el 2, que es el grado sobre el
       que se construye. */
    const NUM_FUNCION = { T: '1', S: '4', D: '5', DD: '2', N: '0' };   // «ninguna» lleva el 0 (decisión 116)
    const pf = $('#paleta-funciones');
    pf.innerHTML = '';
    $('#paleta-funciones-caja').hidden = estado.modoFun !== 'pedir';
    if (estado.modoFun === 'pedir') {
      Ejercicios.funcionesDelEjercicio(estado.ejercicio).forEach(f => {
        const n = NUM_FUNCION[f] || '';
        const cont = document.createDocumentFragment();
        const txt = document.createElement('span'); txt.className = 'tecla-romano-texto'; txt.textContent = Teoria.textoFuncion(f); cont.appendChild(txt);
        const num = document.createElement('span'); num.className = 'tecla-num'; num.textContent = n; cont.appendChild(num);
        const b = tecla('tecla-fun', cont, Teoria.NOMBRE_FUNCION[f] + (n ? ' (tecla ' + n + ')' : ''), () => responderFuncion(f));
        b.dataset.funcion = f; if (n) b.dataset.atajo = n;
        b.setAttribute('aria-label', 'Función ' + Teoria.NOMBRE_FUNCION[f]);
        pf.appendChild(b);
      });
      pf.appendChild(tecla('tecla-borrar', 'Borrar', 'Vaciar la casilla activa (Retroceso)', borrar));
    }
    // Paleta de grados: el número pequeño es el del grado (I = 1 … VII = 7)
    const pr = $('#paleta-romanos');
    pr.innerHTML = '';
    $('#paleta-romanos-caja').hidden = !pideGrado();
    if (pideGrado()) {
      /* Los grados de la FUNDAMENTAL en romano, en los cuatro tipos de ficha (decisión
         113): los siete diatónicos y, detrás, los CROMÁTICOS —la dominante de la
         dominante (V/V), que no es un grado de la escala sino una dominante secundaria
         (decisión 48)—, que solo aparecen cuando el ejercicio los usa o cuando la paleta
         está completa y la lección los trae en su repertorio. */
      /* El número pequeño es el del GRADO, no el sitio que ocupa en la paleta (I = 1 …
         VII = 7), de modo que la tecla es la misma esté la paleta completa o recortada. */
      const todos = Teoria.ROMANOS.concat(Teoria.GRADOS_CROMATICOS);
      const numeroDe = r => (todos.indexOf(r) >= 0 ? todos.indexOf(r) + 1 : null);
      Ejercicios.paletaGrados(estado.ejercicio).forEach(r => {
        const k = numeroDe(r);
        const cont = document.createDocumentFragment();
        const txt = document.createElement('span');
        txt.className = 'tecla-romano-texto';
        txt.textContent = r;
        cont.appendChild(txt);
        if (k !== null) {
          const num = document.createElement('span');
          num.className = 'tecla-num';
          num.textContent = String(k);
          cont.appendChild(num);
        }
        const b = tecla('tecla-romano', cont, 'Sonido fundamental ' + r + (k !== null ? ' (tecla ' + k + ')' : ''), () => responderRomano(r));
        b.dataset.romano = r;
        if (k !== null) b.dataset.atajo = String(k);
        b.setAttribute('aria-label', 'Sonido fundamental ' + r);
        pr.appendChild(b);
      });
    }
    /* Paleta de cifras: el número pequeño es la posición en la paleta (1, 2, 3…). El orden
       lo pone `ordenarCifras` —tríadas, dominantes y séptimas diatónicas, cada familia por
       inversiones (decisión 107)—, no el orden en que esté guardado el repertorio de la
       lección; así las fichas ya repartidas también salen ordenadas. */
    const pc = $('#paleta');
    pc.innerHTML = '';
    /* Las cifras van dentro del recuadro de su familia —tríada, séptima de dominante y
       demás séptimas diatónicas—, que es como se explican en clase; la lista entera
       seguida era demasiado larga para leerla de un vistazo (Diego, 27/9/2026). */
    let familia = null, caja = null;
    Ejercicios.ordenarCifras(estado.ejercicio.repertorio).forEach((id, k) => {
      const c = Teoria.CIFRADOS[id];
      const f = Ejercicios.familiaCifra(id);
      if (f !== familia) {
        familia = f;
        caja = document.createElement('span');
        caja.className = 'familia-cifras';
        const nom = document.createElement('span');
        nom.className = 'familia-nombre';
        const nombres = (Ejercicios.FAMILIAS && Ejercicios.FAMILIAS[f]) || { larga: '', corta: '' };
        nom.innerHTML = '<span class="etq-larga"></span><span class="etq-corta"></span>';
        nom.querySelector('.etq-larga').textContent = nombres.larga;
        nom.querySelector('.etq-corta').textContent = nombres.corta;
        caja.appendChild(nom);
        pc.appendChild(caja);
      }
      const cont = document.createDocumentFragment();
      cont.appendChild(Partitura.iconoCifra(id, 38));
      const num = document.createElement('span');
      num.className = 'tecla-num';
      num.textContent = atajo(k);
      cont.appendChild(num);
      const b = tecla('tecla-cifra', cont, c.nombre + ' — ' + c.descripcion + (atajo(k) ? ' (tecla ' + atajo(k) + ')' : ''), () => responderCifra(id));
      b.dataset.id = id;
      b.dataset.atajo = atajo(k);
      b.setAttribute('aria-label', 'Cifrado interválico ' + c.nombre);
      caja.appendChild(b);
    });
    pc.appendChild(tecla('tecla-borrar', 'Borrar', 'Vaciar la casilla activa (Retroceso)', borrar));
    pintarPaletaTonalidades();
    colocarMandos();
  }

  /* DÓNDE VAN «SONAR AL ELEGIR» Y «CUADRO DE CIFRADOS»

     En pantalla grande, donde sobra sitio, siguen con las paletas (Diego, 28/9/2026):
     «Sonar al elegir» EN el primer renglón que esté a la vista —el de la función tonal
     cuando se piden— pegado al borde derecho del recuadro de la partitura, porque no es
     una herramienta de audio como las de arriba sino lo que hacen ESTAS teclas; y el
     acceso al cuadro de cifrados al pie, centrado bajo las teclas que explica.

     En el MÓVIL los dos salen del teclado flotante y se van al segundo renglón de la
     barra, bajo el encabezado (decisión 196, Diego 29/9/2026): «saca del espacio flotante
     de los selectores de cifrado la casilla de sonar cuando se selecciona y el botón sobre
     cifrados… de manera que se aproveche más espacio en el espacio flotante». Abajo solo
     quedan TECLAS, y el renglón de la función tonal —que iba estrujado contra «Sonar al
     elegir», con T, S y D en poco más de media pantalla— recupera el ancho entero.

     Se MUEVE el nodo, no se vuelve a crear: conserva su estado (la casilla marcada) y su
     escuchador. Y se recoloca en cada repintado y en cada `resize`, que es cuando puede
     cambiar el tamaño de la pantalla o la paleta que encabeza. */
  function colocarMandos() {
    const barra = $('#realizacion-barra');
    if (!barra) return;
    const etiqueta = $('#sonar') && $('#sonar').closest('label');
    const pie = document.querySelector('.paletas-pie');
    if (compacto()) {
      let hueco = $('#mandos-movil');
      if (!hueco) {
        hueco = document.createElement('span');
        hueco.id = 'mandos-movil';
        hueco.className = 'control mandos-movil';
        barra.appendChild(hueco);
      }
      if (etiqueta && etiqueta.parentElement !== hueco) hueco.appendChild(etiqueta);
      if (pie && pie.parentElement !== hueco) hueco.appendChild(pie);
    } else {
      const caja = [...document.querySelectorAll('#paletas .paleta-caja')].find(c => !c.hidden);
      if (etiqueta && caja && etiqueta.parentElement !== caja) caja.appendChild(etiqueta);
      const panel = $('#paletas');
      if (pie && panel && pie.parentElement !== panel) panel.appendChild(pie);
    }
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
      /* La marca de la nota 0 dice en qué tono EMPIEZA: solo es pivote si es un tono
         distinto del del fragmento (decisiones 188 y 194). */
      if (marcas[i] && !(i === 0 && Teoria.mismaTonalidad(marcas[i], ton))) { out.push({ ton: marcas[i], antes: ton }); ton = marcas[i]; }
      else if (marcas[i]) out.push({ ton });
      else out.push({ ton });
    }
    return out;
  }
  const lecturaAlumno = () => lecturaCon(estado.marcas);
  // ¿La casilla de grado de la nota i está partida en dos (nota marcada)?
  // La casilla de grado se parte en dos solo si la fila «Tonalidad» está a la vista: sin
  // ella, el pivote se cifra en la tonalidad que rige, sin desvelar que hay un cambio.
  /* ¿Hay fila de grado? Desde la decisión 113 no hay más que dos posibilidades —se pide o
     no está—, así que `pideGrado` y `estado.pedirRomano` son lo mismo. Se conserva el
     nombre porque por él pasan la navegación, la paleta, el enunciado y la corrección. */
  const pideGrado = () => estado.pedirRomano;
  const marcaPivote = i => !!estado.marcas[i] && !(i === 0 && estado.ejercicio && Teoria.mismaTonalidad(estado.marcas[0], estado.ejercicio.tonalidad));
  const esDoble = i => hayFilaTonalidad() && marcaPivote(i) && estado.pedirRomano;        // la nota 0 incluida (188 y 194)
  const hayFilaTonalidad = () => estado.modoTon !== null;
  const tonalidadEditable = () => estado.modoTon === 'pedir' && !estado.tonalidadBloqueada && !estado.corregido;

  // Paleta de tonalidades: las cinco vecinas de la que rige antes de la nota activa
  function pintarPaletaTonalidades() {
    const caja = $('#paleta-tonalidades-caja');
    const pal = $('#paleta-tonalidades');
    pal.innerHTML = '';
    /* La paleta de tonos hace falta SIEMPRE que la fila «Tonalidad» se pueda editar, y eso
       no tiene nada que ver con que se pida además el sonido fundamental.
       Hasta la decisión 236 esta condición exigía `estado.pedirRomano`, y con ella un enlace
       de los repartidos antes de la decisión 233 —los que llevan `pedirRomano: false`— abría
       la fila editable y sin ninguna manera de rellenarla: ni paleta ni atajos de teclado,
       porque las teclas ni se construían. El ejercicio no se podía terminar (Diego,
       2/10/2026: «no aparecen los controles para seleccionar la tonalidad, con lo que es
       imposible resolver el ejercicio satisfactoriamente»).
       Al salir aquí sin construir las teclas, un número pulsado con el foco en una casilla
       de tonalidad NO rellena nada cuando la fila viene dada: antes las teclas se creaban
       igual, escondidas, y seguían respondiendo al atajo. */
    if (!tonalidadEditable()) { caja.hidden = true; return; }
    caja.hidden = false;
    const i = estado.activa;
    const sinEsta = Object.assign({}, estado.marcas); delete sinEsta[i];
    const antes = lecturaCon(sinEsta)[i].ton;
    /* En la PRIMERA nota, lo que se pregunta es en qué tono empieza el fragmento, así que
       su propio tono ha de estar en la paleta —y el primero— además de los vecinos, por si
       el primer acorde es ya el pivote de una modulación (decisión 194). */
    const destinos = i === 0 ? [antes].concat(Teoria.tonalidadesVecinas(antes)) : Teoria.tonalidadesVecinas(antes);
    destinos.forEach((t, k) => {
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
    if (!hayFilaTonalidad()) {
      estado.filaTonalidad = null;
      estado.dobles = [];
      // Sin fila, la modulación solo se descubre al ver la solución
      const rotulo = m => (m.nota === 0 ? Teoria.nombreCorto(Ejercicios.tonalidadAntes(ej, 0)) + ' ' : '') + '→ ' + Teoria.nombreCorto(m.tonalidad);   // los dos tonos en el pivote de la 1.ª nota (186)
      estado.etiquetas = estado.mostrarSolucion
        ? Ejercicios.modulaciones(ej).map(m => ({ i: m.nota, texto: rotulo(m), clase: 'solucion' }))
        : [];
      return;
    }
    const n = estado.respuestas.length;
    estado.dobles = estado.respuestas.map((_, i) => esDoble(i));
    const celdas = [];
    const resMarcas = estado.corregido && estado.resultadoMod ? estado.resultadoMod : null;
    for (let i = 0; i < n; i++) {
      const c = { texto: '', clase: '', fija: false };
      /* En la nota 0, la casilla enseña la tonalidad del fragmento… salvo que ESA nota sea
         ya el pivote de una modulación (decisión 188): entonces enseña la que empieza ahí, y
         el tono de partida se escribe como rótulo del renglón que se deja.
         Y SALVO QUE LAS TONALIDADES SE PIDAN (decisión 194, Diego 29/9/2026: «no le debe
         aparecer la tonalidad inicial mostrada por defecto, sino que ha de marcarla él»):
         entonces la casilla sale vacía y editable, porque decir en qué tono empieza el
         fragmento es la primera parte del ejercicio. */
      if (i === 0 && !estado.marcas[0] && estado.modoTon !== 'pedir') { c.texto = Teoria.nombreCorto(ej.tonalidad); c.clase = 'inicial'; c.fija = true; }
      else if (estado.marcas[i]) {
        c.texto = Teoria.nombreCorto(estado.marcas[i]);
        if (estado.modoTon === 'dadas') { c.clase = 'dada'; c.fija = true; }
        else if (resMarcas) c.clase = resMarcas.correctas.includes(i) ? 'bien' : 'mal';
        else if (estado.tonalidadBloqueada) c.clase = 'bien fija';   // 'dadas' o 'completo': esta sí es fija de verdad
      } else if (resMarcas && resMarcas.faltan.includes(i)) { c.clase = 'mal'; c.texto = '¿?'; }
      celdas.push(c);
    }
    estado.filaTonalidad = { visible: true, editable: tonalidadEditable(), celdas };
    // Rótulos encima del sistema: con las tonalidades dadas, siempre; si las pone el alumno, al mostrar la solución
    estado.etiquetas = [];
    if (estado.modoTon === 'dadas' || estado.mostrarSolucion) {
      const rotulo = m => (m.nota === 0 ? Teoria.nombreCorto(Ejercicios.tonalidadAntes(ej, 0)) + ' ' : '') + '→ ' + Teoria.nombreCorto(m.tonalidad);   // los dos tonos en el pivote de la 1.ª nota (186)
      Ejercicios.modulaciones(ej).forEach(m => estado.etiquetas.push({ i: m.nota, texto: rotulo(m), clase: estado.modoTon === 'dadas' ? 'dada' : 'solucion' }));
    }
  }

  // Estado que la partitura necesita para la fila «Función»
  function prepararFunciones() {
    const ej = estado.ejercicio;
    if (!estado.modoFun) { estado.filaFunciones = null; return; }
    const una = (i, campo) => {
      const lista = campo === 'funcion2' ? estado.funciones2 : estado.funciones;
      const ok = r => (campo === 'funcion2' ? r.okFuncion2 : r.okFuncion);
      const c = { texto: Teoria.textoFuncion(lista[i]), clase: '', fija: false };
      if (estado.modoFun === 'dadas') { c.clase = 'dada'; c.fija = true; }
      else if (estado.corregido && estado.resultados) c.clase = ok(estado.resultados[i]) ? 'bien' : 'mal';
      else if (acertada(i, campo)) c.clase = 'bien';
      /* La función del modelo YA NO se escribe dentro de la casilla vacía (Diego,
         28/9/2026, decisión 152). Se escribía ahí y, como la casilla está corregida, salía
         pintada de rojo: parecía una respuesta del alumno, y encima equivocada. Ahora va al
         renglón naranja de la solución, con el grado y la cifra del mismo acorde. La
         casilla se queda diciendo solo lo tuyo: verde, rojo o vacía. */
      return c;
    };
    const celdas = estado.respuestas.map((_, i) => una(i, 'funcion'));
    const celdas2 = estado.respuestas.map((_, i) => (esDobleFun(i) ? una(i, 'funcion2') : null));
    estado.filaFunciones = { visible: true, editable: estado.modoFun === 'pedir' && !estado.corregido,
      celdas, celdas2, dobles: estado.respuestas.map((_, i) => esDobleFun(i)) };
  }

  // Melodía de soprano: el bajo que corresponde a cada respuesta (fundamental + cifra)
  function prepararBajos() {
    if (estado.modoEj !== 'soprano') { estado.vozDada = null; estado.bajos = []; return; }
    estado.vozDada = 'soprano';
    /* Con la solución a la vista, el bajo que se dibuja es el del modelo: si no, la
       armonización buena se escribiría sobre el bajo que dedujo una respuesta equivocada. */
    estado.bajos = estado.mostrarSolucion
      ? Ejercicios.bajosDe(estado.ejercicio, romanosSolucion(), cifrasSolucion())
      : Ejercicios.bajosDe(estado.ejercicio, estado.romanos, estado.respuestas);
    estado.bajosMal = !estado.mostrarSolucion && estado.corregido && estado.resultados ? estado.resultados.map(r => !r.ok) : null;
  }
  const melodia = () => Reglas.notasDe(estado.ejercicio);

  function responderFuncion(f) {
    const campo = estado.campo === 'funcion2' && esDobleFun(estado.activa) ? 'funcion2' : 'funcion';
    if (estado.modoFun !== 'pedir' || !reabrir()) return;
    const i = estado.activa;
    estado.campo = campo;
    if (campo === 'funcion2') estado.funciones2[i] = f; else estado.funciones[i] = f;
    if (estado.tocadas) estado.tocadas[i].funcion = true;
    avanzar();
    pintar();
  }

  function marcarTonalidad(t) {
    if (!tonalidadEditable()) return;
    const i = estado.activa;
    estado.marcas[i] = t;
    if (estado.tocadas) estado.tocadas[i].tonalidad = true;
    /* Al marcar, el acorde se parte en DOS LECTURAS y aparecen la función y el grado de la
       tonalidad nueva. Se salta a la primera casilla de ESTA nota que quede por rellenar,
       en el orden en que se rellenan, para no pasar al acorde siguiente con el pivote a
       medias (Diego, 25/9). Antes solo se miraba el grado, así que con las funciones
       pedidas la segunda función se quedaba sin visitar.
       Con el orden de la 197 —las dos lecturas seguidas y el cifrado al final— esto vale
       igual se marque el tono antes o después de cifrar el acorde: si se marcó antes, se
       sigue por la función de partida; si se marcó después, por la del tono nuevo. */
    const pendiente = camposDe(i).find(c => !acertada(i, c) && !valorDe(i, c));
    if (pendiente) estado.campo = pendiente;
    pintar();
  }

  // ¿Puede verse ahora el pentagrama de sol? En Análisis, siempre; en Armonización y
  // Audición, cuando el ejercicio está cerrado (solución a la vista).
  const puedeVerseRealizacion = () => estado.realizacionCuando === 'siempre' || estado.mostrarSolucion || estado.verEnlaces;
  function realizacionVisible() { return puedeVerseRealizacion() && estado.verRealizacion; }
  // ¿Se dibuja el pentagrama del bajo? En Audición, solo al cerrar el ejercicio.
  const bajoVisible = () => Ejercicios.verBajo(estado.ejercicio) || estado.mostrarSolucion;

  // ¿La nota i tiene ya cifra y grado (o solo cifra, si no se pide el grado)?
  // En una nota marcada como cambio de tonalidad hacen falta los dos grados.
  function notaCompleta(i) {
    return !!estado.respuestas[i] && (!pideGrado() || (!!estado.romanos[i] && (!esDoble(i) || !!estado.romanos2[i])));
  }

  const cifrasModelo = () => estado.ejercicio.respuestas.map((_, i) => Ejercicios.admisibles(estado.ejercicio, i)[0]);
  /* La respuesta modelo, separada en grado y cifra: en las armonizaciones la respuesta se
     guarda como pareja «V|65d», y la realización necesita solo la cifra. */
  const modeloPar = i => Ejercicios.par(Ejercicios.admisibles(estado.ejercicio, i)[0]);
  /* QUÉ SE ENSEÑA AL VER LA SOLUCIÓN (Diego, 28/9/2026, corrigiendo la decisión 145).
     No la respuesta del modelo entera, sino **la del alumno con lo que falló arreglado**:
     donde acertó se queda SU acorde, aunque el modelo prefiera otro de los admitidos. Si no,
     alguien que lo tiene TODO bien veía cambiada media armonización y marcada en naranja,
     que es justo lo contrario de lo que el naranja quiere decir. */
  const acertoElAcorde = i => {
    const r = (estado.resultados || [])[i];
    return !!(r && r.okCifra && (estado.modoEj !== 'soprano' || r.okRomano));
  };
  const cifrasSolucion = () => estado.ejercicio.respuestas.map((_, i) =>
    (acertoElAcorde(i) && estado.respuestas[i] ? estado.respuestas[i] : modeloPar(i).cifra));
  const romanosSolucion = () => estado.ejercicio.respuestas.map((_, i) =>
    (acertoElAcorde(i) && estado.romanos[i] ? estado.romanos[i] : modeloPar(i).romano));

  /* ---------- EL RENGLÓN DE LA SOLUCIÓN (decisión 152, Diego 28/9/2026) ----------
     Una sola tinta y un solo sitio: bajo cada nota que falló, una línea NARANJA con
     función · grado · cifra. Queda así el reparto: naranja = lo que pone la solución;
     verde = lo que acertaste; rojo = lo que fallaste. Y es el MISMO naranja de las notas
     que la solución cambia en el pentagrama, que era lo que faltaba por explicar.

     Lo importante es de dónde sale: de los mismos pares grado+cifra con los que se realiza
     el pentagrama, así que el cifrado que se lee aquí es siempre el de los acordes
     dibujados arriba («el cifrado ha de coincidir con los acordes escritos», Diego). Antes
     se imprimía `parejas[0].cifra` —la primera admitida— pasara lo que pasara: bastaba
     acertar la cifra con otra admisible y fallar la función para que abajo pusiera un
     acorde y arriba sonara otro. */
  const paresSolucion = () => {
    // En Análisis el pentagrama es siempre el del modelo: el alumno no lo escribe, lo lee.
    if (estado.modoEj === 'cifrar') return estado.ejercicio.respuestas.map((_, i) => modeloPar(i));
    const rom = romanosSolucion(), cif = cifrasSolucion();
    return rom.map((r, i) => ({ romano: r, cifra: cif[i] }));
  };

  /* La función que corresponde al acorde DIBUJADO. Donde la solución es la del modelo la
     da el ejercicio, que sabe de tonalidades, de acordes prestados y de la cadencia rota, y
     respeta la que fije la ficha; donde se conserva el acorde del alumno —porque acertó con
     una admisible distinta— se deduce de SU grado y SU cifra, con sus vecinos. */
  function funcionSolucionEn(pares, i, ton) {
    const ej = estado.ejercicio, mod = modeloPar(i);
    if (pares[i].romano === mod.romano && pares[i].cifra === mod.cifra) {
      return ton ? Ejercicios.funcionModeloEn(ej, i, ton) : Ejercicios.funcionModelo(ej, i);
    }
    const sig = pares[i + 1] || {};
    return Teoria.funcionDe(pares[i].romano, sig.romano || null, pares[i].cifra, sig.cifra || null,
                            i > 0 ? pares[i - 1] : null);
  }

  /* EL PORQUÉ QUE VA EN EL GLOBO (decisión 154, Diego 28/9/2026): «ve al grano, no repitas
     lo que ya está en el cifrado naranja». Las explicaciones del motor vienen con la forma
     «<por qué>: <qué acorde>», y ese acorde es justo lo que se lee debajo de la nota. Así
     que se corta por los dos puntos cuando lo que sigue es corto —un acorde y poco más— y
     se deja entero cuando lo que sigue trae razonamiento de verdad («la armonía ha de
     cambiar…»). Si al cortar queda un jirón de tres palabras, no se corta: «Grado 1» a
     secas no es una frase. Y se quita el paréntesis final del modo soprano —«(bajo do;
     función T, tónica)»—, que repite el bajo y la función una por una. */
  function alGrano(texto) {
    let t = String(texto || '').trim();
    t = t.replace(/\s*\(bajo [^)]*\)\s*(?=\.?$)/i, '');
    const k = t.indexOf(': ');
    if (k >= 14) {
      const cola = t.slice(k + 2);
      if (cola.length <= 45 && !/\.\s/.test(cola)) t = t.slice(0, k);
    }
    return t ? t.replace(/[.;,\s]+$/, '') + '.' : '';
  }

  /* ---------- LAS TÉCNICAS ARMÓNICAS (decisión 155, Diego 28/9/2026) ----------
     Prolongaciones y cadencias, encerradas en un cuadro sobre los acordes que las forman.
     Se calculan AL COMPROBAR y sobre lo que escribió el ALUMNO, acertado o no: lo que
     enseña es ver qué ha construido él. Con la solución a la vista se redibujan sobre la
     buena, que es la que entonces está en el papel. */
  /* El grado del acorde modelo de una nota, en la tonalidad que rige ahí y como un solo
     romano (sin la doble lectura del pivote). */
  function gradoModeloEn(i) {
    try { return Ejercicios.gradoDe(estado.ejercicio, Ejercicios.parejas(estado.ejercicio, i)[0]) || null; }
    catch (e) { return null; }
  }

  function prepararTecnicas() {
    estado.tecnicas = [];
    if (!estado.corregido || typeof Tecnicas === 'undefined') return;
    const ej = estado.ejercicio, res = estado.resultados || [];
    if (!res.length) return;
    const sol = estado.mostrarSolucion ? paresSolucion() : null;
    const funs = sol ? null : cadenaDeFunciones(res);
    const acordes = res.map((r, i) => {
      let ton = null;
      try { ton = Ejercicios.tonalidadEn(ej, i); } catch (e) { ton = ej.tonalidad; }
      if (sol) {
        if (!sol[i] || !sol[i].cifra) return null;
        /* En Análisis y en la armonización de BAJO las respuestas del banco son cifras a
           secas, sin grado, así que `paresSolucion()` trae `romano: null`. El grado existe
           igual —la cifra sobre esa nota del bajo lo determina—, y la corrección ya lo tiene
           calculado: el del modelo en `modeloRomano` y el del alumno en `gradoReal`. Sin
           esto, en esos dos modos no salía ni un solo cuadro. */
        let rom = sol[i].romano;
        if (!rom && r) {
          /* OJO CON `modeloRomano`: en un acorde PIVOTE viene como cadena compuesta —«I = V»,
             las dos lecturas—, y con eso el detector no reconocía ni un grado. Así se perdía
             la cadencia de `A4-10-05`, que salía «imperfecta» porque el «I = V» no casaba con
             «V» (Diego, 28/9/2026). Aquí hace falta UN grado, el de la tonalidad que rige, y
             quien lo da limpio es la pareja modelo de esa nota. */
          const suyo = (sol[i].cifra === (r.cifraReal || r.cifra)) ? r.gradoReal : null;
          rom = suyo || gradoModeloEn(i);
        }
        if (!rom) return null;
        let f = null;
        try { f = funcionSolucionEn(sol, i, null); } catch (e) { f = null; }
        return { romano: rom, cifra: sol[i].cifra, funcion: f, ton };
      }
      /* La cadena del alumno: su grado y su cifra reales —los que de verdad escribió,
         los pida el ejercicio o los deduzca de la cifra— y la función que de ahí sale. */
      if (!r || !r.gradoReal) return null;
      return { romano: r.gradoReal, cifra: r.cifraReal || r.cifra, funcion: funs[i], ton };
    });
    /* La soprano de CADA acorde: es lo que separa la cadencia perfecta de la imperfecta, y
       hace falta por frase, no solo al final del fragmento (decisión 157). Y los cortes, que
       son los que dicen dónde acaba cada frase: los mismos que usa el motor. */
    const voces = estado.realizacion || [];
    const sopranos = acordes.map((_, i) => {
      const ac = voces[i];
      return ac && ac.length ? ac[ac.length - 1] : null;
    });
    let cortes = [];
    try { cortes = Reglas.cortesDe(ej) || []; } catch (e) { cortes = []; }
    /* El BAJO de cada acorde: en la melodía de soprano lo deduce la respuesta y en los demás
       modos es la nota escrita. Hace falta para distinguir la prolongación de la cadencia,
       que es cosa de si el bajo borda o salta (decisión 159). */
    let bajos = [];
    try { bajos = estado.modoEj === 'soprano' ? (estado.bajos || []) : Reglas.notasDe(ej); } catch (e) { bajos = []; }
    const ultimo = acordes[acordes.length - 1];
    const opciones = {
      sopranos: sopranos,
      cortes: cortes,
      bajos: bajos,
      soprano: sopranos[sopranos.length - 1],
      ton: ultimo ? ultimo.ton : ej.tonalidad,
      menor: !!(ultimo && ultimo.ton && ultimo.ton.modo === 'menor')
    };
    try { estado.tecnicas = Tecnicas.detectar(acordes, opciones) || []; } catch (e) { estado.tecnicas = []; }
  }

  function prepararSolucion() {
    if (!estado.corregido || !estado.mostrarSolucion || !estado.resultados) { estado.filaSolucion = null; return; }
    const ej = estado.ejercicio, pares = paresSolucion();
    estado.filaSolucion = estado.respuestas.map((_, i) => {
      const r = estado.resultados[i];
      if (!r || r.ok) return null;                  // lo que está bien no necesita solución
      const funciones = [];
      if (estado.modoFun) {
        // En el pivote, las dos lecturas del mismo acorde, la vieja sobre la nueva: T/S.
        if (esDobleFun(i)) funciones.push(Teoria.textoFuncion(funcionSolucionEn(pares, i, Ejercicios.tonalidadAntes(ej, i))));
        funciones.push(Teoria.textoFuncion(funcionSolucionEn(pares, i, null)));
      }
      /* El porqué solo se ofrece cuando el acorde que se enseña ES el del modelo: es el que
         el motor razonó. Donde se conserva el del alumno —acertó con otra admisible— la
         regla no habla de ese acorde, y colgarle la explicación sería mentir. */
      const mod = modeloPar(i);
      let porque = '';
      if (pares[i].romano === mod.romano && pares[i].cifra === mod.cifra) {
        const prop = estado.propuesta && estado.propuesta[i];
        const parejas = Ejercicios.parejas(ej, i);
        const modeloId = parejas[0] ? parejas[0].id : r.modelo;
        if (prop && prop.explicacion && prop.modelo === modeloId) porque = alGrano(prop.explicacion);
      }
      return { funcion: funciones.filter(Boolean).join('/'),
               romano: pideGrado() ? pares[i].romano : null,
               cifra: pares[i].cifra,
               porque };
    });
  }

  // Cifras que se dibujan en el pentagrama de sol: las modelo en Análisis; en
  // Armonización, Audición y Melodía de soprano, las del alumno, solo en las notas completas (grado y cifra).
  function cifrasParaRealizar() {
    if (estado.modoEj === 'cifrar') return cifrasModelo();
    /* Con la solución a la vista, la realización que se dibuja es la BUENA (Diego,
       28/9/2026): ver la solución es ver el ejercicio bien resuelto, no la propia
       armonización fallida con la lista de errores al lado. Las casillas siguen diciendo,
       en verde y en rojo, lo que respondió cada uno. */
    if (estado.mostrarSolucion) return cifrasSolucion();
    return estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null));
  }
  // ¿La nota está respondida del todo (también la función, si se pide)?
  const notaRespondida = i => notaCompleta(i) && (estado.modoFun !== 'pedir' || (!!estado.funciones[i] && (!esDobleFun(i) || !!estado.funciones2[i])));

  // El bajo se dobla a la octava grave al sonar, para que destaque y se oigan bien las inversiones.
  /* ---------- La ayuda con las estructuras armónicas (27/9/2026) ----------
     Cada lección tiene su cuadro de estructuras —las mismas que encabezan la hoja de
     ejercicios en papel—, y el alumno lo abre cuando lo necesita, no siempre. Va en otra
     ventana para poder dejarlo al lado mientras se trabaja. */
  /* Ya no hay tabla: con una sola numeración (8/10/2026) el número de la lección ES el
     número del tema, y sale del propio código. Antes aquí vivía una COPIA de la tabla de
     `banco.js`, que es exactamente la clase de cosa que se queda desfasada. */
  const temaDeCodigo = c => { const m = /-(\d{1,2})$/.exec(String(c || '')); return m ? parseInt(m[1], 10) : null; };

  /* ---------- La tonalidad con la que se abren las ventanas de ayuda (decisión 226) ----------
     Diego, 1/10/2026: los acordes de ejemplo del cuadro de cifrados han de salir «en la
     tonalidad de inicio del fragmento que está analizando o armonizando el estudiante —si
     la tonalidad le viene dada por el ejercicio— o en la tonalidad que haya señalado el
     estudiante —si la tonalidad se le pide—».

     De modo que hay tres casos, y el tercero importa tanto como los otros dos:
     · tonalidad dada (o sin fila): la del fragmento, `ej.tonalidad`;
     · tonalidad por pedir y el alumno ya ha marcado la de la primera nota: LA SUYA, aunque
       se haya equivocado — la ayuda tiene que servirle para comprobar su hipótesis, no para
       desmentirla por la espalda;
     · tonalidad por pedir y todavía no ha marcado nada: NINGUNA. La ventana sale entonces
       en Do mayor, como siempre, porque decir en qué tono empieza el fragmento es la primera
       parte del ejercicio y abrir la ayuda no puede ser la manera de saltárselo. */
  function tonalidadDeAyuda() {
    const ej = estado.ejercicio;
    if (!ej) return null;
    if (estado.modoTon === 'pedir' && !estado.mostrarSolucion) return estado.marcas[0] || null;
    return ej.tonalidad || null;
  }
  /* En la dirección, «C-M» o «A-m». Se codifica porque la tónica puede llevar sostenido,
     y una almohadilla sin codificar partiría la dirección en dos. */
  function paramTon(t) {
    return t && t.tonica
      ? 'ton=' + encodeURIComponent(t.tonica + '-' + (t.modo === 'menor' ? 'm' : 'M'))
      : '';
  }

  /* ---------- Y la marca de versión, también en la dirección (decisión 228) ----------
     Las páginas de ayuda piden sus `.js` con `?v=…`, de modo que el guion nuevo llega
     siempre; lo que NO llevaba marca era el HTML, y ese es el que el navegador se guarda.
     Resultado: se abría una ventana de ayuda GUARDADA DE ANTES, que pedía el guion viejo
     —el que no sabe de `?ton=`— y el cuadro salía en Do mayor por mucho que la dirección
     dijera otra cosa. Diego, 1/10/2026: «los cifrados y las estructuras de ejemplo no se
     muestran en la tonalidad del fragmento». Con la marca en la dirección, cada versión es
     una dirección distinta y no hay copia vieja que valga. */
  const marcaVersion = () => {
    const v = $('#version');
    const m = /\d{8}-\d{4}/.exec((v && v.textContent) || '');
    return m ? m[0] : '';
  };
  function paramsAyuda(extra) {
    const p = [paramTon(tonalidadDeAyuda()), marcaVersion() ? 'v=' + marcaVersion() : '']
      .concat(extra || []).filter(Boolean);
    return p.length ? '&' + p.join('&') : '';
  }

  function abrirEstructuras() {
    const t = $('#btn-estructuras').dataset.tema;
    if (!t) return;
    /* Sin `noopener`: la ventana de ayuda necesita poder devolver el foco a esta para su
       botón de «Volver a la práctica» (Diego, 27/9/2026). Es una página nuestra. */
    /* Ancha: la música de todos los cuadros va a una misma escala, y esa escala la fija el
       fragmento más largo (ocho compases en un solo sistema). Cuanto más ancha la ventana,
       más grande se ve la música en TODOS los temas. */
    const an = Math.min(1240, (window.screen && screen.availWidth) || 1240);
    const al = Math.min(900, (window.screen && screen.availHeight) || 900);
    /* Las estructuras se transportan solo si la ficha lo pide (decisión 226): aquí la
       opción es del profesor, no automática, porque un cuadro siempre en Do mayor / la
       menor también tiene su razón —es el mismo que hay impreso en el libro—. */
    const tr = estado.ejercicio && estado.ejercicio.estructurasTon === 'fragmento' ? ['tr=1'] : [];
    const v = window.open('estructuras.html?tema=' + t + paramsAyuda(tr),
                          'estructuras-armonicas',
                          'width=' + an + ',height=' + al);
    if (v) v.focus();
  }

  /* El cuadro de cifrados: la misma ventana de ayuda que las estructuras, con cada cifra
     y el acorde que manda escribir (Diego, 27/9/2026). */
  function abrirCifrados() {
    const an = Math.min(1240, (window.screen && screen.availWidth) || 1240);
    const al = Math.min(900, (window.screen && screen.availHeight) || 900);
    /* Aquí el transporte NO se elige: el cuadro sale siempre en la tonalidad del fragmento
       (decisión 226). Lo que enseña no es un cuadro de referencia, sino qué acorde manda
       escribir cada cifra AQUÍ, y en otra tonalidad que la suya no le sirve de nada. */
    const q = paramsAyuda();
    const v = window.open('cifrados.html' + (q ? '?' + q.slice(1) : ''),
                          'cuadro-cifrados', 'width=' + an + ',height=' + al);
    if (v) v.focus();
  }

  const conBajoDoblado = (bajo, voces) => [{ letra: bajo.letra, alt: bajo.alt, octava: bajo.octava - 1 }, bajo, ...voces];

  /* LO QUE DA EL EJERCICIO, EN COLOR; LO QUE SALE DE LO QUE ESCRIBE EL ALUMNO, EN NEGRO
     (decisión 169, Diego 29/9/2026: «destacar en morado las notas propuestas por el
     ejercicio —y los circulitos del mismo color—, de manera que se distinga fácilmente lo
     propuesto de lo escrito por el estudiante»).

       · Armonización de bajo: el bajo es dado; las voces superiores salen de su cifrado.
       · Armonización de soprano: la melodía es dada; el bajo y las voces de en medio salen
         de los acordes que él elige.
       · Análisis: se le dan el bajo Y la realización a cuatro voces — no escribe ninguna
         nota, solo las nombra—, así que va todo en color.
       · Audición: igual que el análisis, pero solo cuando se destapa al terminar. */
  function marcarVocesDadas() {
    const m = estado.modoEj;
    /* El color solo dice algo cuando en la MISMA partitura hay también algo del alumno. En
       análisis y en audición él no escribe ninguna nota —se le dan el bajo y la realización
       enteros y solo los nombra—, de modo que todo iría en color y el color dejaría de
       distinguir nada: allí la partitura va en negro, como cualquier partitura. */
    const mezcla = m === 'armonizar' || m === 'soprano';
    estado.bajoDado = mezcla && m !== 'soprano';          // en soprano el bajo se deduce de sus acordes
    estado.sopranoDada = mezcla && m === 'soprano';
    estado.realizacionDada = false;                       // las voces de en medio nunca las da el ejercicio
  }

  /* LAS CUATRO VOCES ESCRITAS POR EL PROFESOR (decisión 200, Diego 30/9/2026). Cuando el
     fragmento las trae, son ellas las que se dibujan —no las que deduce el motor—, porque
     son la armonización de verdad de la obra y su criterio es el experto.
     Solo donde lo que se dibuja es el MODELO: en Análisis, que da la realización hecha, y
     al destapar la solución en los demás tipos. Mientras el alumno cifra, lo que se dibuja
     sale de SUS respuestas y ahí no pintan nada. */
  function vocesEscritas() {
    const v = estado.ejercicio && estado.ejercicio.voces;
    if (!Array.isArray(v) || v.length !== estado.respuestas.length) return null;
    if (estado.modoEj !== 'cifrar' && !estado.mostrarSolucion) return null;
    try { return v.map(ac => (Array.isArray(ac) ? ac.map(n => Teoria.nota(n)) : null)); }
    catch (e) { return null; }
  }

  function calcularRealizacion() {
    marcarVocesDadas();
    estado.licenciasVoces = false;      // se enciende solo con las voces escritas (decisión 202)
    if (!realizacionVisible()) { estado.realizacion = null; estado.realizacionMal = null; estado.realizacionCambio = null; estado.paralelas = []; estado.avisosVoces = []; return; }
    const escritas = vocesEscritas();
    if (escritas) {
      estado.realizacion = escritas;
      estado.realizacionCambio = estado.mostrarSolucion ? diferenciasConLaSuya(escritas) : null;
      estado.realizacionMal = null;
      estado.paralelas = [];
      /* LAS LICENCIAS DEL COMPOSITOR (decisión 202, Diego 30/9/2026: «sí que es bueno
         señalar las voces armónicas que no cumplen las reglas en este fragmento de John
         Williams. No tanto como "errores" del compositor, sino como ejemplos narrativos de
         saltarse las reglas: una historia que se salta todo lo esperado»). Deroga el «ni
         auditoría» que puse en la 200.
         Se audita igual que cualquier realización —las reglas son las mismas—, pero lo que
         se dice y cómo se pinta es otra cosa: no van en rojo sino en verde oliva, y cada
         aviso empieza diciendo que ahí la música se aparta de la regla. El juicio lo pone
         el alumno; la aplicación solo señala dónde mirar. Las quintas y octavas del motor
         (`paralelas`) sí se quedan fuera: esas se dibujan como marca de error sobre la
         propia realización, y aquí la realización no es de quien responde. */
      estado.licenciasVoces = true;
      calcularAvisosVoces();
      /* QUÉ SE SEÑALA Y QUÉ NO (Diego, 30/9/2026: «lo único a señalar en verde son las
         séptimas que no resuelven»). Tiene razón, y el motivo es de fondo: estas reglas
         hablan de CUATRO VOCES INDEPENDIENTES, y una partitura de piano no las tiene. El
         mi♭ que «salta» una segunda aumentada al fa♯ es una nota interior de un bloque de
         acordes, no una línea que canta; el salto sin compensar y la quinta por movimiento
         directo entre voces de en medio, lo mismo. Lo que sí sobrevive al cambio de textura
         es el comportamiento ARMÓNICO: una séptima que no baja no baja toque quien toque.
         Se deja `septima` —la resolución— y se callan las demás familias. */
      estado.avisosVoces = (estado.avisosVoces || [])
        .filter(av => av.tipo === 'septima')
        .map(av => Object.assign({}, av, { texto: 'Aquí la música se aparta de la regla. ' + av.texto }));
      return;
    }
    const r = Realizacion.realizar(estado.ejercicio, cifrasParaRealizar(), opcionesRealizacion());
    estado.realizacion = r.acordes;
    estado.realizacionCambio = estado.mostrarSolucion ? diferenciasConLaSuya(r.acordes) : null;
    estado.paralelas = r.paralelas;
    /* Y no se marca en rojo lo que está bien: con la solución a la vista, la realización
       dibujada es la del modelo. */
    estado.realizacionMal = (estado.modoEj !== 'cifrar' && estado.corregido && !estado.mostrarSolucion && estado.resultados)
      ? estado.resultados.map(x => !x.okCifra) : null;
    calcularAvisosVoces();
  }

  /* Qué acordes de la solución hay que mirar: los que el alumno FALLÓ (Diego, 28/9/2026).
     Se probó a comparar nota a nota con su realización, pero entonces un acorde bien
     respondido salía marcado solo porque la disposición cambiaba —la conducción se decide
     para la frase entera—, y eso confunde más que ayuda. Se marca el acorde entero.
     El acorde depende del CIFRADO; en la melodía de soprano, también del grado, porque de
     él se deduce el bajo. */
  function diferenciasConLaSuya(buenos) {
    const modeloC = cifrasSolucion(), modeloR = romanosSolucion();
    return buenos.map((ac, i) => {
      if (!ac) return null;
      /* Lo que cambia en el pentagrama es el ACORDE, y el acorde lo fija el cifrado sobre
         el bajo dado; en la melodía de soprano, también el grado, porque de él se deduce el
         bajo. No vale mirar si la respuesta estaba «bien»: una cifra puede ser admisible
         —y salir en verde— y no ser la del modelo, y entonces el acorde dibujado no es el
         que escribió el alumno y hay que señalarlo igual (Diego, 28/9/2026). */
      const suyaC = notaCompleta(i) ? estado.respuestas[i] : null;
      const distinto = modeloC[i] !== suyaC
        || (estado.modoEj === 'soprano' && modeloR[i] !== (estado.romanos[i] || null));
      /* Con todo bien no hay nada que señalar: lo que se ve es su propia armonización. */
      return ac.map(() => distinto);
    });
  }

  /* Errores de conducción de voces de la realización que se está viendo (octavas y quintas
     seguidas o directas, notas tendenciales sin resolver, cruces). Las notas implicadas se
     dibujan en rojo y, al pulsarlas, se abre un globo con la explicación. Sirve sobre todo
     en la armonización de soprano: un acorde puede ser correcto en sí (II6) y no poder
     usarse ahí porque produce octavas con el bajo. */
  function calcularAvisosVoces() {
    estado.avisosVoces = [];
    if (!Array.isArray(estado.realizacion)) return;
    const bajos = estado.modoEj === 'soprano' ? estado.bajos : Reglas.notasDe(estado.ejercicio);
    try { estado.avisosVoces = Realizacion.auditar(estado.ejercicio, bajos, estado.realizacion); } catch (e) { estado.avisosVoces = []; }
    estado.avisosVoces = avisosDeMelodia().concat(estado.avisosVoces);
  }

  /* LA NOTA DE LA MELODÍA HA DE CABER EN EL ACORDE (Diego, 28/9/2026).
     En la armonización de soprano, el acorde que escribe el alumno puede no contener la
     nota que tiene encima: un 6/4 de tónica bajo una melodía que lleva la sensible, por
     ejemplo. La realización respeta siempre la melodía —el alumno ha de ver lo que ha
     escrito, sin arreglos—, así que el acorde sale con una nota de más y aparecen segundas
     que no son culpa de la conducción, sino del acorde elegido. Hasta ahora eso no se
     decía. Ahora la nota sale en rojo y, al pulsarla, explica qué pasa. */
  function avisosDeMelodia() {
    if (estado.modoEj !== 'soprano' || !Array.isArray(estado.bajos)) return [];
    const notas = melodia();
    const clase = n => ((Teoria.midi({ letra: n.letra, alt: n.alt, octava: 4 }) % 12) + 12) % 12;
    const out = [];
    estado.respuestas.forEach((id, i) => {
      if (!id || !notaCompleta(i) || !estado.bajos[i] || !notas[i]) return;
      let d;
      try { d = Realizacion.describir(id, estado.bajos[i], Ejercicios.tonalidadEn(estado.ejercicio, i)); } catch (e) { return; }
      const s = Teoria.nota(notas[i]);
      if (!d || !Array.isArray(d.tonos) || d.tonos.some(t => clase(t) === clase(s))) return;
      out.push({ i, tipo: 'melodia', notas: [{ i, voz: 3 }],
        texto: 'El acorde que has escrito no contiene la nota de la melodía (' + Teoria.nombreEs(s)
          + '): sobre ese bajo no cabe ahí. Elige otro acorde, u otra inversión.' });
    });
    return out;
  }

  /* ¿Los avisos de conducción de voces cuentan en este tipo de ejercicio? Cuentan donde la
     realización sale de lo que escribe el alumno y puede enseñársele para que la arregle:
     Armonización de bajo y Armonización de soprano. En Análisis la realización que se ve es
     la del modelo —no depende de su respuesta, así que no habría nada que corregir— y en
     Audición no puede enseñarse sin descubrirle el ejercicio; ahí los avisos se siguen
     viendo y explicando, pero no impiden terminar. */
  const ENLACES_CUENTAN = ['armonizar', 'soprano'];
  const enlacesCuentan = () => ENLACES_CUENTAN.includes(estado.modoEj);

  // Audita la conducción de voces de unas cifras, esté o no dibujada la realización
  function auditar(cifras, bajos) {
    try {
      const r = Realizacion.realizar(estado.ejercicio, cifras, opcionesRealizacion());
      return Realizacion.auditar(estado.ejercicio, bajos, r.acordes) || [];
    } catch (e) { return []; }
  }
  const firma = av => av.tipo + '@' + (av.notas || []).map(nv => nv.i).join(',');
  /* Avisos que ha causado el alumno: los de su armonización que NO tiene también la
     respuesta modelo. Si el choque ya está en el modelo no es cosa suya —puede que ese
     bajo no admita nada mejor—, así que no se le pide que lo arregle. */
  function avisosDeLaRespuesta() {
    if (!enlacesCuentan()) return [];
    const esSop = estado.modoEj === 'soprano';
    const notas = Reglas.notasDe(estado.ejercicio);
    const suyos = auditar(cifrasParaRealizar(), esSop ? estado.bajos : notas);
    if (!suyos.length) return [];
    const ids = cifrasModelo();
    const cifras = esSop ? ids.map(id => (id ? Ejercicios.par(id).cifra : null)) : ids;
    const bajos = esSop
      ? Ejercicios.bajosDe(estado.ejercicio, ids.map(id => (id ? Ejercicios.par(id).romano : null)), cifras)
      : notas;
    const delModelo = new Set(auditar(cifras, bajos).map(firma));
    return suyos.filter(av => !delModelo.has(firma(av)));
  }
  const notasDeAvisos = avisos => {
    const s = new Set();
    (avisos || []).forEach(av => (av.notas || []).forEach(nv => s.add(nv.i)));
    return s;
  };

  // «Escuchar propuesta» suena siempre: en Armonización propone solo el bajo.
  const propuestaAudible = () => true;

  function pintarBarraRealizacion() {
    // Controles de la realización visible: solo cuando puede verse ahora
    const puedeVerse = puedeVerseRealizacion();
    $('#control-realizacion').hidden = !puedeVerse;
    $('#sonar').checked = estado.sonar;
    $('#btn-propuesta').hidden = !propuestaAudible();
    $('#btn-parar').hidden = !Sonido.enCurso();
    document.querySelectorAll('#posicion-control .segmentos button').forEach(b => b.classList.toggle('activo', Number(b.dataset.pos) === estado.rotacion));
    $('#posicion-control').hidden = !estado.verRealizacion || estado.modoEj === 'soprano';   // en soprano la disposición la marca la melodía
    // Grados del bajo: solo donde hay bajo a la vista (en Audición no se ve)
    const puedeGrados = estado.gradosPermitidos && estado.modoEj !== 'audicion';
    $('#control-grados').hidden = !puedeGrados;
    $('#ver-grados').checked = estado.verGrados;
    estado.gradosBajo = puedeGrados && estado.verGrados;    // lo que lee la partitura
    /* Los circulitos cuentan el grado desde la tonalidad que el ALUMNO tiene por buena: la
       dada, la que él ha marcado o —si no hay fila de tonalidades— la inicial. Si contaran
       desde las verdaderas, la numeración se reiniciaría en el pivote y descubriría la
       modulación que precisamente se le está preguntando (decisión 56). */
    estado.tonalidadesNota = (estado.mostrarSolucion || estado.modoTon === 'dadas')
      ? null                                                  // la partitura usa las verdaderas
      : hayFilaTonalidad()
        ? lecturaCon(estado.marcas).map(l => l.ton)
        : estado.respuestas.map(() => estado.ejercicio.tonalidad);
    $('#realizacion-barra').classList.toggle('audicion', estado.modoEj === 'audicion');
  }

  function pintar() {
    prepararBajos();
    calcularRealizacion();
    pintarBarraRealizacion();
    prepararModulacion();
    prepararFunciones();
    prepararSolucion();
    prepararTecnicas();
    estado.ocultarBajo = !bajoVisible();
    Partitura.dibujar($('#partitura'), estado.ejercicio, estado, seleccionar);
    pintarPaletaTonalidades();
    // Tras corregir, el número de intento solo tiene sentido si el ejercicio sigue abierto (hay errores que corregir)
    const enCurso = estado.intento > 0 && !estado.mostrarSolucion;
    /* En una ficha, el progreso dice también por dónde va y que el envío espera al
       final: el alumno tiene que saber desde el principio que enviar exige terminar,
       no descubrirlo cuando ya no le queda tiempo. */
    /* El renglón de progreso se queda con lo que NO se ve solo (Diego, 28/9/2026): el
       recuento de notas es redundante —basta mirar las casillas— y el «Ejercicio k de n»
       ya lo dice la banda. Y el aviso del envío subió al enunciado (Diego, 28/9/2026), que
       es donde se dice lo que la ficha exige: aquí abajo, después de la partitura, llegaba
       tarde. Solo sobrevive el número de intento. */
    const partes = [];
    if (enCurso) partes.push('Intento ' + (estado.intento + 1));
    const texto = partes.join(' · ');
    $('#progreso').textContent = texto;
    $('#progreso').hidden = !texto;
    $('#btn-corregir').disabled = estado.corregido;
    /* El botón dice lo que el alumno ha hecho, no una abreviatura: en los modos en que
       escribe las voces es su ARMONIZACIÓN; en los que solo pone cifras y grados, su
       CIFRADO (Diego, 28/9/2026). */
    $('#btn-mio').textContent = '▶ Escuchar mi '
      + (estado.modoEj === 'armonizar' || estado.modoEj === 'soprano' ? 'armonización' : 'cifrado');
    document.querySelectorAll('.paleta .tecla').forEach(b => { b.disabled = estado.corregido; });
    /* Cuál es la paleta que toca ahora. En pantalla grande solo se destaca; en el móvil
       es además la ÚNICA que se dibuja (decisión 111), así que acertar aquí importa:
       `funcion2` estaba fuera de la lista —llegó con la decisión 95— y en la segunda
       función del pivote se destacaba la de cifrados. */
    document.querySelectorAll('.paleta-caja').forEach(p => p.classList.remove('destacada'));
    if (!estado.corregido) {
      const c = estado.campo;
      const caja = c === 'tonalidad' && tonalidadEditable() ? '#paleta-tonalidades-caja'
        : (c === 'funcion' || c === 'funcion2') && estado.modoFun === 'pedir' ? '#paleta-funciones-caja'
        : (c === 'romano' || c === 'romano2') && pideGrado() ? '#paleta-romanos-caja' : '#paleta-caja';
      $(caja).classList.add('destacada');
    }
    // Con la paleta ya elegida: el hueco que hay que dejarle abajo y la casilla activa a la vista
    ajustarCompacto();
    enfocarActiva();
  }

  /* ---------- Pantalla estrecha (móvil) ----------
     Con menos de 720 px de ancho, las paletas se fijan abajo como un teclado y la
     página deja hueco para ellas; la casilla activa se mantiene a la vista. */
  const compacto = () => document.body.classList.contains('compacto');

  function ajustarCompacto() {
    // Estrecho O bajo: el móvil en horizontal es ancho (844) pero bajísimo (390).
    // Los dos umbrales son los mismos que los de la @media de estilo.css: si se cambia
    // uno hay que cambiar el otro, o el CSS y el JS dejarán de estar de acuerdo.
    const estrecho = window.innerWidth < 720 || window.innerHeight < 560;
    document.body.classList.toggle('compacto', estrecho);
    // Antes de medir: en el móvil, «Sonar al elegir» y el cuadro de cifrados se van
    // arriba, y el teclado flotante mide menos (decisión 196)
    colocarMandos();
    const panel = $('#paletas');
    document.body.style.paddingBottom = estrecho ? (panel.offsetHeight + 12) + 'px' : '';
  }

  // Desplaza lo justo para que la casilla activa se vea (sobre el panel fijo y dentro de la partitura)
  function enfocarActiva() {
    if (!compacto() || estado.corregido) return;
    const g = document.querySelector('#partitura .casilla.activa') || document.querySelector('#partitura .casilla.activa-nota');
    if (!g) return;
    const r = g.getBoundingClientRect();
    const caja = $('#partitura');
    const cr = caja.getBoundingClientRect();
    if (r.left < cr.left + 8) caja.scrollLeft -= (cr.left + 8 - r.left);
    else if (r.right > cr.right - 8) caja.scrollLeft += (r.right - (cr.right - 8));
    const limite = window.innerHeight - $('#paletas').offsetHeight - 12;
    if (r.bottom > limite) window.scrollBy({ top: r.bottom - limite + 8, behavior: 'smooth' });
    else if (r.top < 8) window.scrollBy({ top: r.top - 8, behavior: 'smooth' });
  }

  /* ---------- Interacción ---------- */

  // Casillas de respuesta de la nota j en el ORDEN en que se rellenan: primero el grado
  // de la fundamental (los dos, en un pivote) y después el cifrado (así lo pidió Diego).
  // La fila «Tonalidad» no entra: es opcional.
  // Si se pide la función tonal, va la primera (es el plan del que sale el acorde).
  const conFuncion = () => estado.modoFun === 'pedir';
  /* La casilla de función se parte en el pivote, igual que la del grado: la tonalidad ha
     de estar a la vista para que las dos lecturas signifiquen algo (decisión 95). */
  const esDobleFun = i => hayFilaTonalidad() && marcaPivote(i) && !!estado.modoFun;       // la nota 0 incluida (188 y 194)
  /* EL ORDEN EN QUE SE RELLENA UNA NOTA (Diego, 28/9/2026): función → fundamental →
     cifrado, y a la nota siguiente.

     DOS CAMBIOS DE LA DECISIÓN 197 (Diego, 29/9/2026: «resulta confuso al llegar al punto
     del acorde pivote… hemos de clarificar los movimientos automáticos del cursor»):

     · En la NOTA 0, cuando las tonalidades se piden, lo primero es la casilla del tono de
       PARTIDA: en qué tono empieza el fragmento (decisión 194). Antes no entraba en el
       recorrido —ni se dejaba pulsar—, y la corrección la exigía igualmente: «Tonalidad de
       partida: sin marcar» en un ejercicio que no había manera de contestar. En las demás
       notas la fila «Tonalidad» sigue fuera del recorrido: el cambio de tono se marca
       cuando se oye, pulsando la casilla, no acorde por acorde.

     · En el acorde PIVOTE, las DOS LECTURAS van seguidas y el cifrado cierra la nota:
       función y fundamental en el tono de partida, función y fundamental en el nuevo, y
       después el cifrado, que es uno solo porque el acorde es el mismo. Antes el cifrado se
       colaba entre las dos lecturas y partía en dos el mismo razonamiento. */
  const camposDe = j => {
    const orden = [];
    if (j === 0 && tonalidadEditable()) orden.push('tonalidad');
    if (conFuncion()) orden.push('funcion');
    if (pideGrado()) orden.push('romano');
    if (conFuncion() && esDobleFun(j)) orden.push('funcion2');
    if (pideGrado() && esDoble(j)) orden.push('romano2');
    orden.push('cifra');
    return orden;
  };
  /* Las mismas casillas en su orden VISUAL, de arriba abajo, para las flechas ↑ ↓:
     cifra · fundamental · función, y en el pivote cada una con su segunda lectura
     debajo (decisión 106). */
  const camposVisuales = j => {
    const out = ['cifra'];
    if (pideGrado()) { out.push('romano'); if (esDoble(j)) out.push('romano2'); }
    if (conFuncion()) { out.push('funcion'); if (esDobleFun(j)) out.push('funcion2'); }
    return out;
  };
  /* La primera casilla de una nota es, sencillamente, la primera de su orden: así el tono
     de partida de la nota 0 no hay que repetirlo aquí (decisión 197). */
  const campoInicial = j => camposDe(typeof j === 'number' ? j : estado.activa)[0];
  const valorDe = (j, campo) => (campo === 'cifra' ? estado.respuestas[j] : campo === 'romano2' ? estado.romanos2[j] : campo === 'funcion2' ? estado.funciones2[j] : campo === 'funcion' ? estado.funciones[j] : campo === 'tonalidad' ? estado.marcas[j] : estado.romanos[j]);

  /* ---- Reabrir el ejercicio sin pulsar nada (Diego, 27/9/2026) ----
     Después de corregir, el verde y el rojo son INFORMACIÓN, no una puerta cerrada: en
     cuanto el alumno toca una casilla o una tecla de la paleta, el ejercicio se reabre solo.
     Antes había que pulsar «Corregir los errores» primero, y además el reintento se sentía
     como si solo se pudiera tocar lo rojo; pero para arreglar un rojo hay veces que hay que
     mover un verde —con la fundamental acertada y el cifrado mal, por ejemplo— y entonces
     no había salida. Ahora se toca cualquier casilla, del color que sea.
     Solo se queda cerrado cuando ya está la solución a la vista: ahí no hay nada que hacer. */
  function reabrir() {
    if (!estado.corregido) return true;
    if (estado.mostrarSolucion) return false;
    corregirErrores();
    return true;
  }

  function seleccionar(i, campo) {
    if (!reabrir()) return;
    campo = campo || campoInicial(i);
    /* La casilla de tonalidad de la NOTA 0 también se pulsa (decisión 197): ahí se dice en
       qué tono empieza el fragmento, y hasta ahora el clic no hacía nada. */
    if (campo === 'tonalidad') { if (!tonalidadEditable()) return; }
    else if ((campo === 'funcion' || campo === 'funcion2') && !conFuncion()) return;
    else if (!camposDe(i).includes(campo)) campo = campoInicial(i);
    // (Antes, si la casilla estaba acertada se saltaba a otra; ahora se entra en todas.)
    estado.activa = i;
    estado.campo = campo;
    pintar();
  }

  const acertada = (j, campo) => !!(estado.acertadas[j] && estado.acertadas[j][campo]);

  /* Se avanza SIEMPRE a la casilla siguiente del orden, esté o no rellena (Diego,
     28/9/2026): antes se saltaban las que ya tenían respuesta, y el recorrido daba brincos
     imprevisibles en cuanto se corregía algo. En la última casilla de la última nota se
     queda donde está. */
  function avanzar() {
    const n = estado.respuestas.length, i = estado.activa;
    const campos = camposDe(i);
    const k = campos.indexOf(estado.campo);
    if (k >= 0 && k + 1 < campos.length) { estado.campo = campos[k + 1]; return; }
    if (i + 1 < n) { estado.activa = i + 1; estado.campo = camposDe(i + 1)[0]; return; }
  }

  function responderCifra(id) {
    if (!reabrir()) return;
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
      if (estado.modoEj === 'soprano') {
        const bajo = estado.bajos[i];
        if (!bajo || !id) { Sonido.acorde([notas[i]], 1.1); return; }
        Sonido.acorde(conBajoDoblado(bajo, Realizacion.acordeConSoprano(id, bajo, Ejercicios.tonalidadEn(ej, i), notas[i])), 1.1);
        return;
      }
      const voces = id ? Realizacion.posicion(Realizacion.trio(id, notas[i], Ejercicios.tonalidadEn(ej, i)), estado.rotacion) : [];
      Sonido.acorde(conBajoDoblado(notas[i], voces), 1.1);
    } catch (e) { /* sin audio */ }
  }

  /* ---------- Escuchar ----------
     Tres cosas pueden sonar, siempre con el bajo doblado a la octava grave:
       · «Escuchar tono»: la cadencia I–IV–V7–I de la tonalidad inicial, para situar el oído;
       · «Escuchar propuesta»: lo que propone el ejercicio. En Análisis, la armonización
         que se ve; en Audición, la armonización que se ha de reconocer (no se ve); en
         Armonización, solo el bajo (no hay armonización propuesta que oír).
       · «Mi cifrado»: la realización de lo que el alumno ha cifrado hasta el momento
         (las notas sin grado y cifra suenan solo con el bajo).
     El ▶ que hay ENCIMA de cada acorde hace sonar ese acorde de la propuesta (en
     Armonización, esa nota del bajo): reproduce el acorde, no el cifrado introducido. */

  const SEG_POR_NEGRA = 0.6;
  const opcionesRealizacion = () => {
    const op = { modo: estado.rigida ? 'rigida' : 'auto', rotacion: estado.rotacion };
    if (estado.modoEj === 'soprano') { op.bajos = estado.bajos; op.sopranos = melodia(); }
    return op;
  };
  const eventos = () => Teoria.eventos(estado.ejercicio.compases);   // notas y silencios, en orden

  // La propuesta: armonización modelo (Análisis y Audición), solo el bajo (Armonización) o solo la melodía (Soprano).
  function acordesPropuesta() {
    if (estado.modoEj === 'armonizar' || estado.modoEj === 'soprano') return estado.respuestas.map(() => []);
    return Realizacion.realizar(estado.ejercicio, cifrasModelo(), opcionesRealizacion()).acordes;
  }
  function acordesMios() { return Realizacion.realizar(estado.ejercicio, estado.respuestas.map((c, i) => (notaCompleta(i) ? c : null)), opcionesRealizacion()).acordes; }
  // Qué suena en cada nota: el bajo (doblado a la octava grave) con las voces, o, en la melodía de
  // soprano, la nota de la melodía sola cuando aún no tiene bajo (en la propuesta, siempre).
  function notasQueSuenan(i, voces, conBajos) {
    const dadas = Reglas.notasDe(estado.ejercicio);
    if (estado.modoEj !== 'soprano') return conBajoDoblado(dadas[i], voces || []);
    const bajo = conBajos ? estado.bajos[i] : null;
    return bajo && voces && voces.length ? conBajoDoblado(bajo, voces) : [dadas[i]];
  }

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

  function reproducir(acordes, conBajos = true) {
    const items = eventos().map(e => (e.k < 0
      ? { notas: [], segundos: SEG_POR_NEGRA * e.dur, alEmpezar: () => marcarSonando(null) }    // silencio
      : { notas: notasQueSuenan(e.k, acordes[e.k], conBajos), segundos: SEG_POR_NEGRA * e.dur, alEmpezar: () => marcarSonando(e.k) }));
    try {
      Sonido.secuencia(items, () => { marcarSonando(null); $('#btn-parar').hidden = true; });
      $('#btn-parar').hidden = false;
      vigilarAudio();
    } catch (e) { aviso('No se ha podido reproducir el sonido en este navegador: ' + e.message); }
  }

  function escucharPropuesta() { if (propuestaAudible()) reproducir(acordesPropuesta(), estado.modoEj !== 'soprano'); }
  function escucharMio() {
    if (!estado.respuestas.some((_, i) => notaCompleta(i))) { aviso('Todavía no hay ninguna nota con sonido fundamental y cifrado interválico.'); return; }
    reproducir(acordesMios());
  }

  function escucharCadencia() {
    const ej = estado.ejercicio;
    const notas = Reglas.notasDe(ej);
    try {
      const cad = Realizacion.cadencia(ej.tonalidad, estado.modoEj === 'soprano' ? 'C3' : notas[0]);
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
      Sonido.acorde(notasQueSuenan(i, ac, estado.modoEj !== 'soprano'), 1.4);
      marcarSonando(i);
      vigilarAudio();
      setTimeout(() => { if (estado.sonando === i && !Sonido.enCurso()) marcarSonando(null); }, 1400);
    } catch (e) { aviso('No se ha podido reproducir el sonido: ' + e.message); }
  }

  function parar() {
    Sonido.parar(); Voz.parar();
    if (typeof Escucha !== 'undefined') Escucha.parar();      // y la grabación de música real (9/10/2026)
    marcarSonando(null); $('#btn-parar').hidden = true;
  }

  function responderRomano(r) {
    if (!pideGrado() || !reabrir()) return;
    const i = estado.activa;
    // El grado va a la mitad activa de la casilla (en un pivote hay dos: anterior y nueva)
    const campo = estado.campo === 'romano2' && esDoble(i) ? 'romano2' : 'romano';
    estado.campo = campo;
    if (campo === 'romano2') estado.romanos2[i] = r; else estado.romanos[i] = r;
    if (estado.tocadas) estado.tocadas[i][campo] = true;
    avanzar();
    pintar();
    if (estado.sonar && notaCompleta(i)) sonarNota(i, estado.respuestas[i]);
  }

  function borrar() {
    if (!reabrir()) return;
    const i = estado.activa;
    if (estado.campo === 'tonalidad') {
      if (!tonalidadEditable() || !estado.marcas[i]) return;
      delete estado.marcas[i];
      estado.romanos2[i] = null;
      pintar();
      return;
    }
    if (estado.campo === 'romano2') estado.romanos2[i] = null;
    else if (estado.campo === 'romano') estado.romanos[i] = null;
    else if (estado.campo === 'funcion2') estado.funciones2[i] = null;
    else if (estado.campo === 'funcion') estado.funciones[i] = null;
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
    /* Si no modula, no hay nada que marcar… salvo que el alumno haya marcado algo: con las
       tonalidades por pedir, decidir que NO cambia de tono es parte del ejercicio. */
    /* EL TONO DE PARTIDA TAMBIÉN SE MARCA (decisión 194), cuando las tonalidades se piden:
       la casilla 0 pregunta en qué tono empieza el fragmento. Si ahí hay además una
       modulación, la que rige es la nueva y de eso se encarga el bucle de las modulaciones;
       si no, se comprueba aquí y la casilla 0 deja de contar como sobrante. */
    const pidePartida = estado.modoTon === 'pedir' && !mods.some(m => m.nota === 0);
    const marcas = estado.marcas;
    if (!mods.length && !pidePartida) {
      const sobra = Object.keys(marcas).map(Number);
      if (!sobra.length) return null;
      return { ok: false, info: [], correctas: [], faltan: [], sobrantes: sobra, partida: null };
    }
    const indices = Object.keys(marcas).map(Number).sort((a, b) => a - b);
    const usadas = new Set(), correctas = [], faltan = [], info = [];
    let ok = true;
    let partida = null;
    if (pidePartida) {
      usadas.add(0);
      const debe = Ejercicios.tonalidadEn(ej, 0);
      const bien = !!(marcas[0] && Teoria.mismaTonalidad(marcas[0], debe));
      partida = { debe, suya: marcas[0] || null, bien };
      if (bien) correctas.push(0);
      else { ok = false; if (!marcas[0]) faltan.push(0); }
    }
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
    return { ok, info, correctas, faltan, sobrantes, partida };
  }

  /* POR QUÉ NO VALE LA CIFRA (decisión 119). «Falla la cifra» no enseña nada: el alumno
     necesita saber cuál de las tres cosas ha pasado. O el acorde no se puede construir
     sobre esa nota del bajo; o se puede, pero no es de su lección; o es de su lección y la
     que no anda es la SUCESIÓN —y entonces se le dice con las palabras de la regla—.
     Cuando no se sabe, no se inventa: se deja el mensaje de siempre. */
  function porQueCifra(ej, i, ton, cifra) {
    const notas = Teoria.notasDeCompases(ej.compases);
    const et = c => (Teoria.CIFRADOS[c] ? Teoria.CIFRADOS[c].etiqueta : c);
    let rom = null;
    try { rom = Teoria.romano(cifra, notas[i], ton); } catch (e) { rom = null; }
    if (!rom) return 'el cifrado interválico ' + et(cifra) + ' sobre esta nota no da ningún acorde de ' + Teoria.nombreCorto(ton);
    const acorde = rom + ' ' + et(cifra);
    const lista = ej.acordes;
    if (lista && lista.length && !lista.includes(rom + '|' + cifra)) return 'el ' + acorde + ' no entra en este tema';
    const ultima = i === notas.length - 1;
    if (ultima && (cifra !== '53' || (rom !== 'I' && rom !== 'V')))
      return 'el fragmento acaba en cadencia o en semicadencia: el último acorde ha de ser la tónica o la dominante, en estado fundamental';
    // La sintaxis: con el acorde de antes y con el de después
    const par = { romano: rom, cifra };
    const suyo = k => {
      const res = estado.resultados[k];
      if (res && res.okCifra && res.romanoReal) return { romano: res.romanoReal, cifra: res.cifra };
      return modeloEn(ej, k);
    };
    try {
      if (i > 0) {
        const ant = suyo(i - 1);
        if (ant && Reglas.sincopaBajo(ej, i, ant.cifra, cifra)) return 'el ' + acorde + ' ya sonaba en el acorde anterior y aquí cae en parte fuerte: en el tiempo fuerte la armonía ha de cambiar';
        const e = ant ? Reglas.enlaceAlumno(ej, i, ant, par) : { ok: true };
        if (!e.ok) return e.motivo;
      }
      if (!ultima) {
        const sig = modeloEn(ej, i + 1);
        const e = sig ? Reglas.enlaceAlumno(ej, i + 1, par, sig) : { ok: true };
        if (!e.ok) return 'con el acorde que viene después, ' + e.motivo;
      }
    } catch (e) { /* si algo no se puede leer, no se dice nada */ }
    return null;
  }
  // El acorde modelo de la nota k, como pareja {romano, cifra}
  function modeloEn(ej, k) {
    const id = (ej.respuestas[k] || [])[0];
    if (!id) return null;
    if (String(id).indexOf('|') >= 0) return Ejercicios.par(id);
    try {
      const rom = Teoria.romano(id, Teoria.notasDeCompases(ej.compases)[k], Ejercicios.tonalidadEn(ej, k));
      return rom ? { romano: rom, cifra: id } : null;
    } catch (e) { return null; }
  }

  /* ---------- El esquema de lo que ha escrito el alumno (decisión 122) ----------
     Dos líneas que resumen SU armonización, no la del modelo: la cadena de funciones
     —T – S – D – T, que es como se ve de un vistazo si la sintaxis anda— y el nombre de
     la cadencia con la que cierra. Enseñar aquí el esquema del modelo sería cantarle la
     solución; el suyo, en cambio, es un espejo. */
  const ET = c => (Teoria.CIFRADOS[c] ? Teoria.CIFRADOS[c].etiqueta : c);
  function nombreAcorde(rom, cif) {
    if (!rom) return '';
    if (cif === '53') return rom;
    if (rom === 'V' && cif === '7+') return 'V7';
    return rom + ' ' + ET(cif);
  }
  /* Un acorde de dos funciones —el VI es tónica o subdominante (decisión 88)— se lee por
     el contexto, y quien sabe leerlo es `Teoria.funcionDe`: el MISMO juez que marca la
     función bajo cada nota del fragmento y el que usa el motor, de modo que el esquema y
     lo que está escrito en la partitura no pueden discrepar (decisión 125).

     Antes esto se resolvía aquí con una regla propia y más corta —subdominante solo si lo
     siguiente era dominante—, y tenía dos fallos: el VI que va a OTRA subdominante
     (I – VI – II – V) salía como tónica, cuando el criterio de Diego es que subdominante
     es toda sonoridad que prepara la dominante, aunque entre medias haya otra; y el
     esquema podía contradecir a las etiquetas de la propia partitura. */
  function cadenaDeFunciones(res) {
    const cif = r => (r ? (r.cifraReal || r.cifra) : null);
    return res.map((r, i) => {
      if (!r.gradoReal) return null;
      const sig = res[i + 1], ant = res[i - 1];
      const rSig = sig && sig.gradoReal ? sig.gradoReal : null;
      const rAnt = ant && ant.gradoReal ? { romano: ant.gradoReal, cifra: cif(ant) } : null;
      try { return Teoria.funcionDe(r.gradoReal, rSig, cif(r), rSig ? cif(sig) : null, rAnt); }
      catch (e) { return (r.funcionReal || [])[0] || null; }
    });
  }
  function nombreDeLaCadencia(res, cadena) {
    const n = res.length;
    if (n < 2) return null;
    const u = res[n - 1], p = res[n - 2];
    const gu = u.gradoReal, gp = p.gradoReal;
    if (!gu || !gp) return null;
    const par = nombreAcorde(gp, p.cifra) + ' – ' + nombreAcorde(gu, u.cifra);
    let menor = false;
    try { menor = Ejercicios.tonalidadEn(estado.ejercicio, n - 1).modo === 'menor'; } catch (e) { menor = false; }
    const vRaiz = gp === 'V' && (p.cifra === '53' || p.cifra === '7+');
    if (gu === 'I' && u.cifra === '53') {
      if (vRaiz) return 'cadencia auténtica (' + par + ')';
      if (gp === 'VII' && p.cifra === '6') return 'cadencia auténtica, con el VII6 (' + par + ')';
      if (cadena[n - 2] === 'D') return 'acaba en la tónica, con la dominante invertida (' + par + ')';
      if (cadena[n - 2] === 'S') return 'cadencia plagal (' + par + ')';
    }
    if (gu === 'I' && u.cifra === '6') return 'acaba en la tónica en primera inversión (' + par + ')';
    if (gu === 'V') {
      if (menor && gp === 'IV' && p.cifra === '6') return 'semicadencia frigia (' + par + ')';
      return 'semicadencia: acaba en la dominante (' + par + ')';
    }
    if (cadena[n - 2] === 'D' && (gu === 'VI' || (gu === 'IV' && u.cifra === '6'))) return 'cadencia rota (' + par + ')';
    return null;
  }
  function esquemaDelAlumno() {
    const res = estado.resultados || [];
    if (!res.length) return null;
    const cadena = cadenaDeFunciones(res);
    if (!cadena.some(f => f)) return null;
    /* Una barra donde cambia el tono: las funciones de después ya no son del mismo tono
       que las de antes, y sin la marca el esquema engaña. */
    let tons = null;
    try { tons = res.map((x, i) => Ejercicios.tonalidadEn(estado.ejercicio, i)); } catch (e) { tons = null; }
    const nuevo = i => !!(tons && i > 0 && !Teoria.mismaTonalidad(tons[i - 1], tons[i]));
    const une = (lista, sep) => lista.reduce((a, x, i) => a + (i ? (nuevo(i) ? ' | ' : sep) : '') + x, '');
    return {
      cadena,
      texto: une(cadena.map(f => (f ? Teoria.textoFuncion(f) : '·')), ' – '),
      dicho: une(cadena.map(f => (f ? (Teoria.NOMBRE_FUNCION[f] || f) : 'sin contestar')), ', ').replace(/ \| /g, '; y en el tono nuevo, '),
      cadencia: nombreDeLaCadencia(res, cadena)
    };
  }

  /* ---------- La explicación hablada (decisión 121) ----------
     El texto que se lee no es un resumen aparte: son los mismos motivos que la
     corrección escribe. Lo que NO se dice es la respuesta modelo, para no cantarle la
     solución al alumno mientras aún puede volver a intentarlo; el modelo lo tiene en
     pantalla cuando pulsa «Ver la solución». */
  const MAX_DICHOS = 5;         // errores que se leen antes de resumir «y N más»
  function textoDeLosErrores() {
    const res = estado.resultados || [];
    if (!res.length) return '';
    const notas = Reglas.notasDe(estado.ejercicio);
    const n = res.length;
    const aciertos = res.filter(r => r.ok).length;
    const partes = [aciertos + ' de ' + n + ' acordes correctos.'];
    const esq = esquemaDelAlumno();
    if (esq) partes.push('Tu armonización hace ' + esq.dicho + '.' + (esq.cadencia ? ' Es una ' + esq.cadencia.split(' (')[0] + '.' : ''));
    const rm = estado.resultadoMod;
    if (rm && rm.partida && !rm.partida.bien) partes.push(rm.partida.suya ? 'La tonalidad de partida no es la que has marcado.' : 'Falta marcar la tonalidad en la que empieza el fragmento.');
    if (rm && !rm.ok && rm.info.some(x => !x.bien)) partes.push(rm.info.some(x => x.idx === undefined) ? 'Falta marcar el cambio de tonalidad.' : 'El cambio de tonalidad no está bien marcado.');
    const malas = [];
    res.forEach((r, i) => {
      if (r.ok) return;
      let que;
      if (!r.okEnlace) que = r.enlace;
      else if (!r.okCifra) que = r.porQue || 'el acorde que has puesto no vale aquí';
      else if (!(r.okRomano && r.okRomano2)) que = 'el acorde está bien, pero no su sonido fundamental';
      else if (!(r.okFuncion && r.okFuncion2)) que = 'el acorde está bien, pero no su función tonal';
      else return;
      malas.push('Nota ' + (i + 1) + ', ' + Teoria.nombreEs(Teoria.nota(notas[i])) + ': ' + que + '.');
    });
    malas.slice(0, MAX_DICHOS).forEach(x => partes.push(x));
    if (malas.length > MAX_DICHOS) partes.push('Y ' + (malas.length - MAX_DICHOS) + ' notas más con algún error.');
    const avisos = (estado.avisosRespuesta || []).map(a => a.texto).filter(x => x);
    if (avisos.length) {
      partes.push('En la conducción de voces:');
      avisos.slice(0, 3).forEach(x => partes.push(x.replace(/\s*\(\d+→\d+\)/, '') + '.'));
      if (avisos.length > 3) partes.push('Y ' + (avisos.length - 3) + ' avisos más.');
    }
    if (aciertos === n && !avisos.length && (!rm || rm.ok)) partes.push('Está todo bien.');
    return partes.join(' ');
  }
  function leerErrores() {
    if (!Voz.hay()) return;
    parar();                       // que no se pisen la voz y el instrumento
    Voz.decir(textoDeLosErrores());
  }

  function corregir() {
    const ej = estado.ejercicio;
    // Sin fila de tonalidades no hay nada que corregir ahí: el alumno no marcó nada
    estado.resultadoMod = hayFilaTonalidad() ? corregirMarcas() : null;
    const marcasOk = !estado.resultadoMod || estado.resultadoMod.ok;
    const lectura = lecturaCon(marcasOk ? estado.marcas : marcasModelo());
    estado.resultados = ej.respuestas.map((_, i) => {
      const l = lectura[i];
      const parejas = Ejercicios.parejasEn(ej, i, l.ton);
      const adm = parejas.map(p => p.cifra);
      const cifra = estado.respuestas[i], rom = estado.romanos[i], rom2 = estado.romanos2[i];
      const okCifra = cifra !== null && adm.includes(cifra);
      /* El grado se juzga contra las parejas que quedan tras la cifra, cuando la cifra es
         correcta: así «V» solo vale si la cifra elegida da de verdad un V. Esto es lo que
         hace que la fundamental se pueda pedir también en las dos fichas de ARMONIZAR,
         donde el acorde lo elige el alumno: se corrige contra la cifra que él ha puesto,
         no contra un modelo (decisión 113). */
      const cand = pares => (okCifra ? pares.filter(p => p.cifra === cifra) : pares);
      const gr = p => Ejercicios.gradoDe(ej, p);
      const acierta = (pares, r) => r !== null && cand(pares).some(p => gr(p) === r);
      let okRomano = true, okRomano2 = true, modeloRomano = gr(parejas[0]);
      if (pideGrado()) {
        const doble = esDoble(i);
        if (l.antes && !hayFilaTonalidad()) {
          /* Modulación sin anunciar: el pivote tiene una sola casilla, porque el alumno no
             sabe que hay un cambio de tono. Vale leerlo en cualquiera de las dos
             tonalidades: en la anterior, que es donde él se cree, o en la nueva. */
          const antes = Ejercicios.parejasEn(ej, i, l.antes);
          okRomano = acierta(parejas, rom) || acierta(antes, rom);
          okRomano2 = true;
          modeloRomano = gr(antes[0]) + ' = ' + gr(parejas[0]);
        } else if (marcasOk && l.antes) {
          // Nota marcada (pivote): grado en la tonalidad anterior y en la nueva
          const antes = Ejercicios.parejasEn(ej, i, l.antes);
          okRomano = acierta(antes, rom);
          okRomano2 = acierta(parejas, rom2);
          modeloRomano = gr(antes[0]) + ' = ' + gr(parejas[0]);
        } else if (!marcasOk && Ejercicios.esPivote(ej, i)) {
          // Marcas equivocadas: en el pivote vale cualquiera de las dos lecturas
          const antes = Ejercicios.parejasEn(ej, i, Ejercicios.tonalidadAntes(ej, i));
          okRomano = acierta(parejas, rom) || acierta(antes, rom);
          okRomano2 = !doble || acierta(parejas, rom2) || acierta(antes, rom2);
          modeloRomano = gr(antes[0]) + ' = ' + gr(parejas[0]);
        } else {
          okRomano = acierta(parejas, rom);
          okRomano2 = !doble || acierta(parejas, rom2);   // marca sobrante: la segunda mitad se juzga en la tonalidad que rige
        }
      }
      // Función tonal (si se pide): vale la del acorde modelo, la de cualquier admisible o la del acorde dado si es correcto
      let okFuncion = true, okFuncion2 = true;
      const fun = estado.funciones[i], fun2 = estado.funciones2[i];
      const dobleFun = esDobleFun(i);
      const tonAntes = dobleFun ? Ejercicios.tonalidadAntes(ej, i) : null;
      /* En el pivote se juzga cada casilla en SU tonalidad: arriba la de partida, abajo la
         de llegada. El mismo acorde puede ser T en una y S en la otra, y las dos valen. */
      if (estado.modoFun === 'pedir') {
        const vale = (f, adm) => !!f && (adm.includes(f) || (okRomano && okCifra && Teoria.funcionesDeAcorde(rom, cifra).includes(f)));
        okFuncion = vale(fun, dobleFun ? Ejercicios.funcionesAdmisiblesEn(ej, i, tonAntes) : Ejercicios.funcionesAdmisibles(ej, i));
        okFuncion2 = !dobleFun || vale(fun2, Ejercicios.funcionesAdmisibles(ej, i));
      }
      const modeloFuncion = dobleFun
        ? Ejercicios.funcionModeloEn(ej, i, tonAntes) + ' = ' + Ejercicios.funcionModelo(ej, i)
        : Ejercicios.funcionModelo(ej, i);
      /* El grado del acorde que el alumno ha escrito DE VERDAD. En la armonización de bajo
         la cifra y la nota ya determinan el acorde, así que sale aunque no se le pida el
         grado; hace falta para juzgar la sintaxis del enlace. */
      const propio = okCifra ? cand(parejas)[0] : null;
      /* El acorde que el alumno ha escrito de verdad, para el esquema (decisión 122). En la
         melodía manda el grado que él ha puesto —la misma cifra puede ser de dos acordes—;
         en el bajo, el que sale de su cifra sobre esa nota. */
      const suyo = estado.modoEj === 'soprano'
        ? (okCifra && okRomano && rom ? (cand(parejas).find(x => gr(x) === rom) || null) : null)
        : propio;
      return { ok: okCifra && okRomano && okRomano2 && okFuncion && okFuncion2, okCifra, okRomano, okRomano2, okFuncion, okFuncion2, okEnlace: true, enlace: '', modelo: parejas[0].cifra, modeloRomano, modeloFuncion, cifra, romano: rom, romano2: rom2, romanoReal: propio ? propio.romano : null,
        gradoReal: suyo ? suyo.romano : null, cifraReal: suyo ? suyo.cifra : null,
        funcionReal: suyo ? Teoria.funcionesDeAcorde(suyo.romano, suyo.cifra) : null,
        funcion: fun, funcion2: fun2 };
    });
    /* LA SINTAXIS DEL ENLACE (decisión 119). Dos acordes pueden ser los dos correctos
       sobre sus notas y no poder ir seguidos: la subdominante no vuelve a la tónica, la
       sensible del bajo sube, la séptima baja, el 6/4 cadencial resuelve en V, no se
       vuelve de la dominante a la subdominante. `enlaceAlumno` lo dice con esas palabras,
       y es lo que el alumno necesita oír: no «tocaba el V», sino por qué lo suyo no anda.
       Antes solo se miraba en la armonización de melodía; ahora también en la de bajo, que
       es donde el alumno construye la armonía y donde «(falla la cifra)» no explicaba
       nada. La síncopa armónica va aparte porque `sincopaBajo` la ve también cuando el
       bajo se mueve dentro del mismo acorde. */
    if (enlacesCuentan()) estado.resultados.forEach((r, i) => {
      if (i === 0 || !r.okCifra) return;
      const ant = estado.resultados[i - 1];
      if (!ant.okCifra) return;
      const esSop = estado.modoEj === 'soprano';
      /* En la melodía manda el grado que ha escrito el alumno —la misma cifra puede ser de
         dos acordes distintos—; en el bajo, el que sale de su cifra sobre esa nota, que es
         uno solo y no depende de que se le pida el grado. */
      const grado = res => (esSop ? res.romano : res.romanoReal);
      /* LA SÍNCOPA, TAMBIÉN EN LA MELODÍA DE SOPRANO (Diego, 28/9/2026, decisión 160).
         Estaba excluida con un `!esSop` porque la regla no servía allí: tomaba la melodía
         por bajo, y un error mudo hacía que contestara «aquí no hay síncopa» a todo
         (decisión 158). Arreglada aquella, se le pide lo mismo que en los demás modos. Lo
         que cambia es lo que hay que darle: allí basta la cifra sobre el bajo escrito; aquí
         hace falta el acorde entero —«grado|cifra»— para que pueda deducir el bajo. Si el
         alumno aún no ha puesto el grado, no hay acorde que juzgar y se deja pasar. */
      const idDe = res => (esSop ? (grado(res) ? grado(res) + '|' + res.cifra : null) : res.cifra);
      const idAnt = idDe(ant), idAct = idDe(r);
      if (idAnt && idAct && Reglas.sincopaBajo(ej, i, idAnt, idAct)) {
        r.okEnlace = false; r.ok = false;
        r.enlace = 'síncopa armónica: el acorde entra en parte débil y se prolonga sobre la fuerte; en el tiempo fuerte la armonía ha de cambiar';
        return;
      }
      if (!grado(ant) || !grado(r)) return;
      if (esSop && (!ant.okRomano || !r.okRomano)) return;
      const e = Reglas.enlaceAlumno(ej, i, { romano: grado(ant), cifra: ant.cifra }, { romano: grado(r), cifra: r.cifra });
      if (!e.ok) { r.okEnlace = false; r.enlace = e.motivo; r.ok = false; }
    });
    // Y, cuando la cifra no vale, por qué no vale (decisión 119)
    if (estado.modoEj !== 'soprano') estado.resultados.forEach((r, i) => {
      if (r.okCifra || r.cifra === null) return;
      r.porQue = porQueCifra(ej, i, lectura[i].ton, r.cifra);
    });
    estado.intento += 1;
    const aciertos = estado.resultados.filter(r => r.ok).length;
    if (estado.intento === 1) estado.primerIntento = aciertos;
    Registro.anotarCorreccion(ej, estado);
    estado.corregido = true;
    /* Conducción de voces: los avisos no restan aciertos, pero hay que limpiarlos. Mientras
       queden, el ejercicio no se cierra y sus notas siguen editables; y la realización se
       queda a la vista para que el alumno vea lo que ha de arreglar. */
    estado.avisosRespuesta = avisosDeLaRespuesta();
    estado.notasAviso = notasDeAvisos(estado.avisosRespuesta);
    if (estado.notasAviso.size) estado.verEnlaces = true;
    const todoBien = aciertos === estado.resultados.length && marcasOk && !estado.notasAviso.size;
    // Sin reintentos, o todo correcto: se enseña la solución y se cierra el ejercicio
    estado.mostrarSolucion = todoBien || !estado.reintentos;
    pintar();
    pintarResultado();
    if (estado.leerErrores) leerErrores();
    anotarFicha();
  }

  /* Anota en verde lo que ya estaba bien y deja TODO editable (decisión 126). Antes las
     casillas acertadas quedaban fijas, y eso dejaba callejones sin salida: con la
     fundamental acertada y el cifrado mal, no había manera de escribir un cifrado que
     pertenece a otra fundamental. El verde es información, no una puerta cerrada. */
  function corregirErrores() {
    if (!estado.corregido || estado.mostrarSolucion) return;
    estado.avisosRespuesta = [];
    const conAviso = estado.notasAviso || new Set();
    estado.resultados.forEach((r, i) => {
      // Con un enlace incorrecto —de sucesión o de conducción de voces— el acorde sigue
      // editable aunque sus dos casillas estén entre las admisibles
      const enlaceOk = r.okEnlace && !conAviso.has(i);
      if (r.okCifra && enlaceOk) estado.acertadas[i].cifra = true;
      if (!pideGrado() || (r.okRomano && enlaceOk)) estado.acertadas[i].romano = true;
      if (!pideGrado() || !esDoble(i) || r.okRomano2) estado.acertadas[i].romano2 = true;
      if (estado.modoFun !== 'pedir' || r.okFuncion) estado.acertadas[i].funcion = true;
      if (estado.modoFun !== 'pedir' || !esDobleFun(i) || r.okFuncion2) estado.acertadas[i].funcion2 = true;
    });
    /* El TONO DE PARTIDA, acertado o no (decisión 197): ahora que la casilla 0 entra en el
       recorrido, si no se diera por buena el cursor volvería a ella una y otra vez en cada
       reintento, aunque estuviera bien puesta. */
    estado.acertadas[0].tonalidad = !estado.resultadoMod || !estado.resultadoMod.partida
      || estado.resultadoMod.partida.bien;
    /* La tonalidad acertada tampoco se bloquea (decisión 126): mover el pivote puede ser
       justo la salida cuando los acordes de alrededor no cuadran. */
    if (estado.resultadoMod && !estado.resultadoMod.ok) {
      // Marcas equivocadas: se quitan las sobrantes y se dejan las demás para corregirlas
      estado.resultadoMod.sobrantes.forEach(k => { delete estado.marcas[k]; estado.romanos2[k] = null; });
      // El tono de partida mal marcado también se borra (194)
      if (estado.marcas[0] && !estado.resultadoMod.correctas.includes(0)
        && !estado.resultadoMod.info.some(x => x.idx === 0)) { delete estado.marcas[0]; estado.romanos2[0] = null; }
      estado.resultadoMod.info.forEach(x => { if (x.idx !== undefined && !x.bien) { delete estado.marcas[x.idx]; estado.romanos2[x.idx] = null; } });
    }
    estado.tocadas = estado.acertadas.map(() => ({ cifra: false, romano: false, romano2: false, funcion: false, tonalidad: false }));
    estado.corregido = false;
    estado.resultados = null;
    // Primera casilla editable
    estado.activa = 0; estado.campo = campoInicial(0);
    busqueda: for (let j = 0; j < estado.respuestas.length; j++)
      for (const c of camposDe(j)) if (!acertada(j, c)) { estado.activa = j; estado.campo = c; break busqueda; }
    $('#resultado').hidden = true;
    pintar();
    aviso('En verde, lo que ya estaba bien. Puedes cambiar cualquier casilla —también las verdes— y volver a pulsar «Comprobar».');
  }

  function verSolucion() {
    if (!estado.corregido) return;
    estado.mostrarSolucion = true;
    // Al cerrar el ejercicio ya no queda nada «por arreglar»: los avisos solo se muestran
    estado.avisosRespuesta = [];
    estado.notasAviso = null;
    pintar();
    pintarResultado();
  }

  function pintarResultado() {
    const ej = estado.ejercicio;
    const res = estado.resultados;
    const n = res.length;
    const aciertos = res.filter(r => r.ok).length;
    const caja = $('#resultado');
    const pct = Math.round(100 * aciertos / n);
    let html = '<h2>' + aciertos + ' de ' + n + ' acordes correctos <span class="pct">(' + pct + ' %' + (estado.intento > 1 ? ' · intento ' + estado.intento : '') + ')</span></h2>';
    const enlacesMal = res.filter(r => !r.okEnlace).length;
    const porArreglar = (estado.avisosRespuesta || []).length;          // los que ha causado el alumno
    const vocesMal = Math.max((estado.avisosVoces || []).length, porArreglar);   // los que se dibujan en rojo
    const notasArreglar = [...(estado.notasAviso || new Set())].sort((a, b) => a - b).map(k => k + 1);
    const hayQueArreglar = notasArreglar.length > 0;
    /* El recuento por casillas —funciones, grados y cifrados— se quitó (Diego, 28/9/2026):
       cada casilla ya lleva su contorno y su ✓ o ✗ en la partitura, así que contarlas otra
       vez aquí es decir dos veces lo mismo. Queda lo que NO se ve de un vistazo: los
       enlaces, los avisos de conducción de voces y cómo fue el primer intento. */
    const trozos = [];
    if (enlacesMal) trozos.push('Enlaces incorrectos: ' + enlacesMal);
    if (vocesMal) trozos.push('Conducción de voces: ' + vocesMal + (vocesMal > 1 ? ' avisos' : ' aviso')
      + (porArreglar ? ' (' + porArreglar + ' por arreglar)' : '') + ' (notas en rojo)');
    if (estado.intento > 1 && estado.primerIntento !== null) trozos.push('Al primer intento: ' + estado.primerIntento + ' de ' + n);
    if (trozos.length) html += '<p class="desglose">' + trozos.join(' · ') + '</p>';
    /* El renglón «Tu armonización: T – D – T · cadencia auténtica» se quitó del informe
       (Diego, 28/9/2026): con las funciones pintadas en la partitura, la cadena se lee en
       ella. El comentario hablado sí la sigue diciendo, que ahí no hay nada que mirar. */
    // Que lo lea en voz alta, se haya marcado o no la casilla (decisión 121)
    if (Voz.hay() && (aciertos < n || porArreglar))
      html += '<p class="botonera-voz">'
        + '<button type="button" id="btn-leer" class="boton-pequeno" title="Lee en voz alta el comentario de cada nota que falla">▶ Escuchar el comentario</button>'
        /* La casilla, JUNTO A SU BOTÓN y no en la botonera de arriba: es la misma cosa
           —una automática y la otra a petición— y separarlas obligaba a buscarla
           (Diego, 28/9/2026). */
        + '<label class="control junto-a-voz" title="Al comprobar, el comentario se escucha solo, sin tener que pedirlo">'
        + '<input id="leer-errores" type="checkbox"' + (estado.leerErrores ? ' checked' : '') + '><span>Lectura automática del comentario al comprobar</span></label>'
        + '</p>';
    // Modulación
    const rm = estado.resultadoMod;
    if (rm) {
      const partes = [];
      /* El tono de partida, cuando se pide (decisión 194): va delante de las modulaciones,
         porque es la primera pregunta del ejercicio. */
      if (rm.partida) {
        const nom = Teoria.nombreTonalidad(rm.partida.debe);
        partes.push(rm.partida.bien
          ? 'Tonalidad de partida: <span class="cif bien">bien marcada</span> (' + Teoria.nombreCorto(rm.partida.debe) + ').'
          : !rm.partida.suya
            ? 'Tonalidad de partida: <span class="cif mal">sin marcar</span>' + (estado.mostrarSolucion ? '; el fragmento empieza en ' + nom : '') + '.'
            : 'Tonalidad de partida: has marcado <span class="cif mal">' + Teoria.nombreCorto(rm.partida.suya) + '</span>'
              + (estado.mostrarSolucion ? '; empieza en ' + nom : ' (no es esa)') + '.');
      }
      rm.info.forEach(x => {
        const nombre = Teoria.nombreTonalidad(x.m.tonalidad);
        if (estado.modoTon === 'dadas') { partes.push('Modulación a ' + nombre + ' desde la nota ' + (x.m.nota + 1) + '.'); return; }
        const donde = x.rango[0] === x.rango[1] ? 'en la nota ' + (x.rango[0] + 1) : 'entre la nota ' + (x.rango[0] + 1) + ' (acorde pivote) y la ' + (x.rango[1] + 1) + ' (primera nota ajena a la tonalidad anterior)';
        if (x.bien) { partes.push('Modulación a ' + nombre + ': <span class="cif bien">bien marcada</span> (nota ' + (x.idx + 1) + ').'); return; }
        if (x.idx === undefined) { partes.push('Modulación a ' + nombre + ': <span class="cif mal">sin marcar</span>' + (estado.mostrarSolucion ? '; empieza ' + donde : '') + '.'); return; }
        partes.push('Modulación: has marcado <span class="cif mal">' + Teoria.nombreCorto(x.tonAlumno) + ' en la nota ' + (x.idx + 1) + '</span>' + (estado.mostrarSolucion ? '; es a ' + nombre + ', ' + donde : ' (la tonalidad no es esa)') + '.');
      });
      if (rm.sobrantes.length && !rm.info.length) partes.push('<b>Este fragmento no cambia de tono</b>: la' + (rm.sobrantes.length > 1 ? 's marcas sobran' : ' marca sobra') + ' (nota' + (rm.sobrantes.length > 1 ? 's' : '') + ' ' + rm.sobrantes.map(k => k + 1).join(', ') + ').');
      else if (rm.sobrantes.length) partes.push('Marca' + (rm.sobrantes.length > 1 ? 's' : '') + ' de tonalidad que sobra' + (rm.sobrantes.length > 1 ? 'n' : '') + ': nota' + (rm.sobrantes.length > 1 ? 's' : '') + ' ' + rm.sobrantes.map(k => k + 1).join(', ') + '.');
      html += '<p class="desglose modulacion">' + partes.join(' ') + '</p>';
    }
    const respuestasBien = aciertos === n && (!rm || rm.ok);
    const todoBien = respuestasBien && !hayQueArreglar;
    if (todoBien) {
      html += '<p class="enhorabuena">Todas las respuestas son correctas' + (estado.intento > 1 ? ' (en ' + estado.intento + ' intentos)' : '') + '.</p>';
    } else if (!estado.mostrarSolucion) {
      /* Un aviso de conducción de voces se corrige como cualquier otro error: el alumno
         prueba otra de las cifras admisibles en las notas señaladas. */
      const listaNotas = notasArreglar.length > 1
        ? 'las notas ' + notasArreglar.slice(0, -1).join(', ') + ' y ' + notasArreglar[notasArreglar.length - 1]
        : 'la nota ' + notasArreglar[0];
      const queArreglar = (porArreglar > 1 ? 'hay ' + porArreglar + ' errores de conducción de voces' : 'hay un error de conducción de voces') + ' en ' + listaNotas;
      html += '<p>' + (respuestasBien
        ? 'Los sonidos fundamentales y los cifrados interválicos están bien, pero en la armonización que producen ' + queArreglar + '. Pulsa esas notas en el pentagrama (están en <span class="ref-mal">rojo</span>) para ver por qué, y prueba otro de los cifrados admitidos.'
        : 'Las casillas en rojo tienen algún error' + (hayQueArreglar ? ', y en la armonización ' + queArreglar : '') + '. Toca cualquier casilla —también las verdes— para cambiarla, y vuelve a pulsar «Comprobar».')
        + '</p>'
        + '<div class="botonera botonera-resultado">'
        + '<button type="button" id="btn-solucion">Ver la solución</button></div>';
    } else {
      /* AL VER LA SOLUCIÓN, UNA FRASE Y NO UNA LISTA (decisión 153, Diego 28/9/2026).
         Aquí iba la lista numerada de errores —«Nota 3 (la): has puesto…; la respuesta
         modelo es…»— y era decir por segunda vez lo que la partitura ya dice mejor: las
         casillas llevan su ✓ y su ✗ y, desde la decisión 152, bajo cada nota fallada está en
         naranja lo que pone la solución. La lista además tiraba la mirada hacia abajo, que
         es justo donde NO está la corrección. Ahora una frase manda mirar el pentagrama y
         explica qué significa cada color; el detalle nota a nota, que es lo único que la
         lista tenía de suyo, sigue en «Escuchar el comentario». */
      const fallos = res.map((r, i) => (r.ok ? 0 : i + 1)).filter(Boolean);
      const naranja = '<span class="ref-cambio">naranja</span>';
      const partes = ['<b>Mira el pentagrama</b>:'];
      if (fallos.length) {
        // Las lecturas que este ejercicio pide, que son las que lleva el renglón naranja
        const lect = [];
        if (estado.modoFun) lect.push('su función');
        if (pideGrado()) lect.push('su sonido fundamental');
        lect.push('su cifrado interválico');
        const lectTexto = lect.length > 1 ? lect.slice(0, -1).join(', ') + ' y ' + lect[lect.length - 1] : lect[0];
        const donde = fallos.length === n ? 'cada nota'
          : fallos.length === 1 ? 'la nota ' + fallos[0]
          : 'las notas ' + fallos.slice(0, -1).join(', ') + ' y ' + fallos[fallos.length - 1];
        partes.push('ahí está el ejercicio resuelto.');
        partes.push('Lo que pone la solución va en ' + naranja + ': bajo ' + donde + ', ' + lectTexto
          + '; y, en la partitura, ' + (estado.modoEj === 'cifrar'
            ? 'los acordes que no analizaste bien.'
            : 'las notas que por eso cambian.'));
        if (fallos.length < n) partes.push('Donde acertaste se queda tu acorde, aunque el modelo prefiriese otro de los admitidos.');
      } else {
        /* Caso raro pero real: las respuestas están todas bien y lo que la solución arregla
           es la conducción de voces. Entonces no hay nada en naranja, y prometerlo sería
           mandar al alumno a buscar lo que no está. */
        partes.push('los sonidos fundamentales y los cifrados interválicos están todos bien; lo que la solución arregla es la armonización que producen.');
      }
      partes.push('Las casillas siguen diciendo lo tuyo: en <span class="ref-bien">verde</span> lo que acertaste, en <span class="ref-mal">rojo</span> lo que no.');
      /* El porqué no se cuenta aquí: se ofrece (decisión 154). Y solo si de verdad hay
         alguno que enseñar —el motor no razona todos los acordes—, que prometer una ayuda
         que no aparece es peor que no ofrecerla. */
      if ((estado.filaSolucion || []).some(s => s && s.porque))
        partes.push('Pon el ratón sobre un cifrado ' + naranja + ' —o tócalo— y te dice por qué va ahí.');
      html += '<p class="mira-partitura">' + partes.join(' ') + '</p>';
    }
    // En una ficha, el paso al ejercicio siguiente (o al resumen) va siempre a la vista
    if (estado.ficha) {
      const f = estado.ficha;
      const ultimo = f.k + 1 >= f.lista.length;
      html += '<div class="botonera botonera-resultado botonera-ficha">'
        + '<button type="button" id="btn-ficha-sig" class="' + (todoBien || estado.mostrarSolucion ? 'primario' : 'secundario') + '">'
        + (ultimo ? 'Terminar la ficha y ver el resumen' : 'Ejercicio siguiente (' + (f.k + 2) + ' de ' + f.lista.length + ')') + '</button></div>';
    }
    /* Ejercicio suelto terminado: aquí acaba la práctica, así que va el informe. En una
       ficha el informe espera al resumen final, que abarca los N ejercicios. */
    const cerrado = todoBien || estado.mostrarSolucion;
    if (!estado.ficha && cerrado) html += bloqueInforme();
    caja.innerHTML = html;
    caja.hidden = false;
    if (!estado.ficha && cerrado) conectarInforme();
    const be = $('#btn-errores'), bs = $('#btn-solucion');
    if (be) be.addEventListener('click', corregirErrores);
    if (bs) bs.addEventListener('click', verSolucion);
    const bv = $('#btn-leer');
    if (bv) bv.addEventListener('click', () => { if (Voz.hablando()) Voz.parar(); else leerErrores(); });
    /* La casilla vive dentro del informe, así que nace y muere con él: su escucha se
       conecta aquí cada vez, no una sola vez al arrancar. */
    const cv = $('#leer-errores');
    if (cv) cv.addEventListener('change', ev => {
      estado.leerErrores = ev.target.checked;
      try { localStorage.setItem('armonizar.voz', estado.leerErrores ? '1' : '0'); } catch (e) { /* nada */ }
      if (estado.leerErrores && estado.corregido) leerErrores();
    });
    const bf = $('#btn-ficha-sig');
    if (bf) bf.addEventListener('click', siguienteDeFicha);
    caja.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* =================================================================
     Fichas: varios ejercicios encadenados, sacados al azar del banco
     ================================================================= */

  // Apunta el resultado del ejercicio en curso (se actualiza en cada intento)
  function anotarFicha() {
    const f = estado.ficha;
    if (!f || !estado.resultados) return;
    const res = estado.resultados;
    f.marcador[f.k] = {
      titulo: estado.ejercicio.titulo || ('Ejercicio ' + (f.k + 1)),
      tonalidad: Teoria.nombreCorto(estado.ejercicio.tonalidad),
      n: res.length,
      aciertos: res.filter(r => r.ok).length,
      intento: estado.intento,
      primero: estado.primerIntento
    };
    guardarFicha();
  }

  function siguienteDeFicha() {
    const f = estado.ficha;
    if (!f) return;
    if (f.k + 1 >= f.lista.length) { resumenFicha(); return; }
    f.k++;
    cargar(Banco.ejercicio(f.lista[f.k], f.filtro, f.k));
    guardarFicha();                    // ya está cerrado el ejercicio anterior en el registro
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resumenFicha() {
    const f = estado.ficha;
    const m = f.marcador;
    const n = m.reduce((a, x) => a + (x ? x.n : 0), 0);
    const bien = m.reduce((a, x) => a + (x ? x.aciertos : 0), 0);
    const primero = m.reduce((a, x) => a + (x && x.primero !== null && x.primero !== undefined ? x.primero : (x ? x.aciertos : 0)), 0);
    const pct = n ? Math.round(100 * bien / n) : 0;
    let html = '<h2>Ficha terminada: ' + bien + ' de ' + n + ' acordes correctos <span class="pct">(' + pct + ' %)</span></h2>';
    if (primero !== bien) html += '<p class="desglose">Al primer intento de cada ejercicio: ' + primero + ' de ' + n + '.</p>';
    html += '<ol class="resumen-ficha">';
    f.lista.forEach((e, k) => {
      const x = m[k];
      const nombre = (e.leccion ? e.leccion + ' · ' : '') + Teoria.nombreCorto(e.tonalidad);
      html += '<li>' + nombre + ' — ' + (x
        ? '<span class="cif ' + (x.aciertos === x.n ? 'bien' : 'mal') + '">' + x.aciertos + ' de ' + x.n + '</span>' + (x.intento > 1 ? ' (intento ' + x.intento + ')' : '')
        : '<span class="cif mal">sin hacer</span>') + '</li>';
    });
    html += '</ol>';
    html += bloqueInforme();
    html += '<div class="botonera botonera-resultado"><button type="button" id="btn-ficha-otra" class="primario">Otra ficha como esta</button></div>';
    const caja = $('#resultado');
    caja.innerHTML = html;
    caja.hidden = false;
    conectarInforme();
    $('#btn-ficha-otra').addEventListener('click', () => location.reload());
    // En el resumen se retira todo lo del ejercicio: solo queda el marcador
    ['#realizacion-barra', '#partitura', '#paletas', '#progreso'].forEach(sel => { const e = document.querySelector(sel); if (e) e.hidden = true; });
    const bot = document.querySelector('main > .botonera'); if (bot) bot.hidden = true;
    document.querySelector('.repertorio-caja').hidden = true;
    $('#titulo').textContent = f.filtro.titulo || 'Ficha';
    $('#instruccion').textContent = 'Has terminado la ficha. Este es el resultado de cada ejercicio.';
    caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Informe de la práctica (etapa 8b) ----------
     Al terminar, el alumno ve su resultado y puede llevárselo: copiarlo para pegarlo en
     la tarea de Classroom —donde Classroom ya sabe quién es— o descargar el detalle nota
     a nota. El envío automático al formulario del profesor llegará después; el módulo de
     registro ya guarda todo lo que hará falta. */
  function bloqueInforme() {
    Registro.cerrarEjercicio();
    const r = Registro.resumen();
    if (!r) return '';
    const cont = Registro.porContenido().filter(x => x.fallos);
    let h = '<div class="informe">';
    h += '<h3>Tu informe</h3>';
    h += '<p class="nota-informe">Nota: <b>' + String(r.nota10).replace('.', ',') + '</b> <span>sobre 10</span></p>';
    h += '<p class="desglose">Al primer intento <b>' + r.pctPrimero + ' %</b> (' + r.aciertosPrimero + ' de ' + r.notas + ')'
      + ' · tras corregir <b>' + r.pctFinal + ' %</b> · tiempo de trabajo ' + Registro.mmss(r.segundos) + '.</p>';
    if (cont.length) {
      h += '<p class="desglose">Lo que más se te ha resistido: '
        + cont.slice(0, 4).map(x => '<b>' + x.acorde + '</b> (' + x.fallos + ' de ' + x.veces + ')').join(' · ') + '.</p>';
    }
    /* Enviar exige haber terminado la práctica entera (decisión 64): así todas las
       filas que le llegan al profesor miden lo mismo. Sin formulario configurado, o
       con la práctica a medias, queda la vía de copiar el informe. */
    const hayForm = Envio.disponible();
    const puedeEnviar = hayForm && r.completa;
    if (hayForm && !r.completa) {
      h += '<p class="ayuda-informe">Has hecho <b>' + r.hechos + ' de ' + r.previstos + '</b> ejercicios. '
        + 'Para enviar el resultado a tu profesor hay que terminar la ficha entera: así todos los resultados miden lo mismo. '
        + 'Vuelve a abrir el enlace y continuarás donde lo dejaste.</p>';
    }
    h += '<label class="campo-informe"><span>Escribe tu nombre y apellidos para el informe</span>'
      + '<input id="informe-alumno" type="text" autocomplete="name" placeholder="Nombre y apellidos"></label>';
    h += '<div class="botonera botonera-resultado">'
      + (puedeEnviar ? '<button type="button" id="btn-informe-enviar" class="primario">Enviar al profesor</button>' : '')
      + (puedeEnviar ? '' : '<button type="button" id="btn-informe-copiar" class="primario">Copiar el informe</button>'
        + '<button type="button" id="btn-informe-csv">Descargar el detalle</button>')
      + '</div>';
    h += '<p class="ayuda-informe">' + (puedeEnviar
      ? 'Al enviar se abre el formulario del centro con tus datos ya puestos: compruébalos y pulsa Enviar. Tendrás que iniciar sesión con tu correo de murciaeduca.es.'
      : 'Copia el informe y pégalo en la tarea de Classroom.') + '</p>';
    h += '</div>';
    return h;
  }

  function conectarInforme() {
    const campo = $('#informe-alumno');
    if (campo) {
      try { campo.value = localStorage.getItem('armonizar.alumno') || ''; } catch (e) { /* nada */ }
      Registro.fijarAlumno(campo.value);
      campo.addEventListener('input', () => {
        Registro.fijarAlumno(campo.value);
        try { localStorage.setItem('armonizar.alumno', campo.value.trim()); } catch (e) { /* nada */ }
      });
    }
    const bc = $('#btn-informe-copiar');
    if (bc) bc.addEventListener('click', () => {
      const t = Registro.informeTexto();
      const ok = () => aviso('Informe copiado. Pégalo en la tarea de Classroom.', 6000);
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, () => volcar(t));
      else volcar(t);
    });
    /* Enviar = abrir el formulario relleno en otra pestaña. La aplicación no manda nada
       por su cuenta: el envío lo hace el alumno, y la identidad la pone Google. */
    const be2 = $('#btn-informe-enviar');
    if (be2) be2.addEventListener('click', () => {
      const r = Registro.resumen();
      if (!r) return;
      if (typeof Escucha !== 'undefined') Escucha.parar();    // nada suena mientras se envía (9/10/2026)
      const url = Envio.direccion(r);
      if (!url) { aviso('No se ha podido preparar el envío. Copia el informe y pégalo en Classroom.', 8000); return; }
      window.open(url, '_blank', 'noopener');
      aviso('Se ha abierto el formulario con tus datos. Revísalos y pulsa Enviar allí.', 9000);
    });
    const bd = $('#btn-informe-csv');
    if (bd) bd.addEventListener('click', () => {
      const r = Registro.resumen();
      const nombre = 'practica-' + (r && r.alumno ? r.alumno.replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, '-').toLowerCase() + '-' : '') + new Date().toISOString().slice(0, 10) + '.csv';
      descargar(nombre, Registro.informeTexto() + '\n\n' + Registro.detalleCSV());
    });
  }

  // Si el portapapeles no está disponible (http sin cifrar, navegador antiguo), se enseña el texto
  function volcar(t) {
    const caja = $('#resultado');
    const ta = document.createElement('textarea');
    ta.className = 'informe-texto'; ta.readOnly = true; ta.rows = 10; ta.value = t;
    caja.appendChild(ta); ta.select();
    aviso('Copia este texto y pégalo en la tarea de Classroom.', 8000);
  }
  function descargar(nombre, texto) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + texto], { type: 'text/csv;charset=utf-8' }));
    a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* Cómo se llama esta ficha en el informe y en la hoja del profesor. Si le pusiste
     título en el configurador, ese; si no, uno construido con lo que la distingue
     —lección, tipo de ejercicio y cuántos—, porque «Ficha» a secas en todas las filas
     de la hoja no deja distinguir una práctica de otra. */
  /* El nombre con el que la práctica llega a la hoja de calificaciones (decisión 109).
     Sin título puesto por el profesor sale uno automático, y sale del FILTRO, no de los
     fragmentos que le hayan tocado a este alumno: el sorteo es distinto para cada uno, así
     que antes, con una ficha de varias lecciones, a un alumno le salía «2 lecciones · …» y
     a otro «3 lecciones · …» y sus filas no se agrupaban. Lleva además un código corto
     del filtro, para que dos fichas de la misma lección, tipo y tamaño —la de esta semana
     y la de la que viene— no se confundan entre sí. */
  function codigoDeFicha(filtro) {
    const txt = JSON.stringify(filtro);
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0).toString(36) + '0000').slice(0, 4);
  }
  function nombreDeFicha(filtro, lista) {
    if (filtro.titulo) return filtro.titulo;
    const n = (lista ? lista.length : 0) || filtro.n || 0;
    return [filtro.leccion || 'Varias lecciones',
      Ejercicios.MODOS[filtro.modo] || 'Ejercicios',
      n + (n === 1 ? ' ejercicio' : ' ejercicios'),
      codigoDeFicha(filtro)].join(' · ');
  }

  async function iniciarFicha(texto) {
    let filtro;
    try { filtro = Banco.decodificar(texto); } catch (e) {
      aviso('No se ha podido leer la ficha de la dirección.'); cargar(Ejercicios.CORPUS[0]); return;
    }
    let entradas = null;
    const base = location.href.split('#')[0].replace(/[^/]*$/, '');
    try {
      const r = await fetch(base + 'banco.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error('el archivo banco.json no está en el servidor');
      entradas = Banco.leerArchivo(await r.json());
    } catch (e) {
      aviso('No se ha podido leer el banco de ejercicios (banco.json): ' + e.message
        + '. Si has abierto la página desde el disco, las fichas solo funcionan con la aplicación publicada.', 12000);
      cargar(Ejercicios.CORPUS[0]); return;
    }
    // ¿Dejó esta misma ficha a medias? Entonces se continúa en vez de empezar de cero
    const vuelta = reanudarFicha(texto, entradas);
    if (vuelta) {
      estado.ficha = vuelta;
      aviso('Continúas la ficha que dejaste a medias: vas por el ejercicio '
        + (vuelta.k + 1) + ' de ' + vuelta.lista.length + '.', 9000);
      cargar(Banco.ejercicio(vuelta.lista[vuelta.k], vuelta.filtro, vuelta.k));
      return;
    }
    const lista = Banco.elegir(entradas, filtro);
    if (!lista.length) {
      /* Al alumno solo se le sirven fragmentos CERRADOS (decisión 182). Si la ficha se
         queda vacía, casi siempre es eso: los que cumplen el filtro están aún sin revisar. */
      aviso('En el banco no hay todavía ningún ejercicio revisado que cumpla lo que pide esta ficha. '
        + 'Díselo a tu profesor: los ejercicios se publican cuando él los da por buenos.', 12000);
      cargar(Ejercicios.CORPUS[0]); return;
    }
    /* Cuántos ejercicios tiene la ficha: lo necesita el cupo de la armadura ajena
       (decisión 190), que reparte entre el 25 % y el 75 % de los sitios. */
    filtro.nFicha = lista.length;
    estado.ficha = { filtro, lista, k: 0, marcador: [], hash: texto };
    Registro.iniciarPractica({ tipo: 'ficha', titulo: nombreDeFicha(filtro, lista), modo: filtro.modo, n: lista.length });
    guardarFicha();
    cargar(Banco.ejercicio(lista[0], filtro, 0));
  }

  /* ---------- Reanudar una ficha a medias (decisión 64) ----------
     Con el envío condicionado a terminarla, una ficha de ocho ejercicios es un
     compromiso largo: si se cierra la pestaña, se va el ordenador o se acaba la clase,
     perderlo todo y tener que repetir los ocho sería injusto. Se guarda qué fragmentos
     le tocaron —no basta el filtro, porque los saca al azar— y por cuál iba. */
  const CLAVE_FICHA = 'armonizar.ficha';

  function guardarFicha() {
    const f = estado.ficha;
    if (!f || !f.hash) return;
    try {
      localStorage.setItem(CLAVE_FICHA, JSON.stringify({
        hash: f.hash, ids: f.lista.map(e => e.id), k: f.k, marcador: f.marcador
      }));
    } catch (e) { /* sin almacenamiento: no se podrá reanudar, y no pasa nada */ }
  }

  function reanudarFicha(texto, entradas) {
    let g = null;
    try { const t = localStorage.getItem(CLAVE_FICHA); g = t ? JSON.parse(t) : null; } catch (e) { return null; }
    if (!g || g.hash !== texto || !Array.isArray(g.ids) || !g.ids.length) return null;
    // Los mismos fragmentos, en el mismo orden. Si el banco cambió y falta alguno, se empieza de nuevo
    const porId = new Map(entradas.map(e => [e.id, e]));
    const lista = g.ids.map(id => porId.get(id));
    if (!lista.every(Boolean)) return null;
    // Si alguno se ha reabierto desde que empezó la ficha, se empieza de nuevo (decisión 182)
    if (!lista.every(e => Banco.estaCerrada(e))) return null;
    const p = Registro.recuperar();
    if (!p || p.tipo !== 'ficha' || !Array.isArray(p.ejercicios)) return null;
    const k = p.ejercicios.length;
    if (k <= 0 || k >= lista.length) return null;        // ni empezada ni terminada: nada que reanudar
    Registro.restaurar(p);
    const filtro = Banco.decodificar(texto);
    filtro.nFicha = lista.length;                      // el cupo de la armadura ajena (190)
    return { filtro, lista, k, marcador: (g.marcador || []).slice(0, k), hash: texto };
  }

  /* Aquí estuvo `reiniciar()`, que recargaba el ejercicio en blanco. Fuera con su botón
     (decisión 225): los alumnos lo pulsaban sin querer y perdían el ejercicio entero. */

  function siguiente() {
    const lista = Ejercicios.CORPUS;
    const i = lista.findIndex(e => e.id === estado.ejercicio.id);
    const sig = lista[(i + 1) % lista.length];
    location.hash = 'ej=' + sig.id;
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
    // La nota 0 también llega a su casilla de tonalidad con las flechas (decisión 197)
    const filas = camposVisuales(estado.activa).concat(tonalidadEditable() ? ['tonalidad'] : []);
    const pos = Math.max(0, filas.indexOf(estado.campo));
    if (ev.key === 'ArrowRight') { estado.activa = (estado.activa + 1) % n; if (!camposDe(estado.activa).concat(['tonalidad']).includes(estado.campo)) estado.campo = campoInicial(estado.activa); pintar(); }
    else if (ev.key === 'ArrowLeft') { estado.activa = (estado.activa - 1 + n) % n; if (!camposDe(estado.activa).concat(['tonalidad']).includes(estado.campo)) estado.campo = campoInicial(estado.activa); pintar(); }
    else if (ev.key === 'ArrowDown') { if (pos < filas.length - 1) { estado.campo = filas[pos + 1]; pintar(); } }
    else if (ev.key === 'ArrowUp') { if (pos > 0) { estado.campo = filas[pos - 1]; pintar(); } }
    else if (/^[0-9]$/.test(ev.key)) {
      // El número pequeño de cada tecla de la paleta activa (cifra, grado o tonalidad)
      /* `funcion2` —la segunda lectura del pivote— faltaba en esta lista (Diego, 28/9/2026):
         con el foco ahí, el número iba a parar a la paleta de cifrados y el recorrido se
         quedaba dando vueltas entre el cifrado y la función. */
      const paleta = estado.campo === 'tonalidad' ? '#paleta-tonalidades'
        : (estado.campo === 'funcion' || estado.campo === 'funcion2') && estado.modoFun === 'pedir' ? '#paleta-funciones'
        : (estado.campo === 'romano' || estado.campo === 'romano2') && pideGrado() ? '#paleta-romanos' : '#paleta';
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
    Envio.preparar();            // lee envio.json en segundo plano; si no está, no pasa nada
    rellenarSelector();
    if ($('#btn-estructuras')) $('#btn-estructuras').addEventListener('click', abrirEstructuras);
    if ($('#btn-cifrados')) $('#btn-cifrados').addEventListener('click', abrirCifrados);
    $('#btn-corregir').addEventListener('click', corregir);
    $('#btn-siguiente').addEventListener('click', siguiente);
    $('#ver-grados').addEventListener('change', ev => { estado.verGrados = ev.target.checked; pintar(); });
    $('#sonar').addEventListener('change', ev => { estado.sonar = ev.target.checked; });
    /* La voz: la casilla solo aparece si el navegador tiene sintetizador, y se recuerda.
       No se enciende sola: en el iPhone y en el iPad la voz solo arranca después de que el
       alumno toque algo, y de todos modos empezar a hablar sin que nadie lo haya pedido
       asusta más que ayuda. */
    if (Voz.hay()) {
      try { estado.leerErrores = localStorage.getItem('armonizar.voz') === '1'; } catch (e) { /* sin almacenamiento */ }
    }
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
    // Indicador de carga del instrumento: solo si tarda más de medio segundo, y sin desplazar nada
    let avisoCarga = null;
    Sonido.alCargar = (id, listo) => {
      const e = $('#instrumento-estado');
      clearTimeout(avisoCarga);
      if (!listo) avisoCarga = setTimeout(() => { e.textContent = 'cargando ' + (Sonido.INSTRUMENTOS.find(x => x.id === id) || {}).nombre + '…'; e.hidden = false; }, 500);
      else e.hidden = true;
    };
    // El audio del navegador solo arranca tras un gesto del usuario: se prepara en el primero
    // (y se precarga el instrumento elegido)
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => Sonido.desbloquear(), { once: true, passive: true }));
    $('#btn-cadencia').addEventListener('click', escucharCadencia);
    $('#btn-propuesta').addEventListener('click', escucharPropuesta);
    $('#btn-mio').addEventListener('click', escucharMio);
    $('#btn-parar').addEventListener('click', parar);
    const inicial = new URLSearchParams(location.hash.replace(/^#/, ''));
    estado.libre = !inicial.has('e') && !inicial.has('ej') && !inicial.has('f');
    /* ---- Los enlaces de la banda oscura, fuera cuando el enlace trae trabajo (decisión 225)
       En una ficha —o en un ejercicio que viene en la dirección— los tres enlaces no llevan
       al alumno donde él cree: «Ejercicio» no devuelve a SU ejercicio, sino a la práctica
       libre, y los otros dos abandonan la página y se llevan por delante lo escrito. Las
       estructuras y el cuadro de cifrados ya tienen sus botones, que abren una ventana
       aparte sin perder nada. En la práctica libre los enlaces se quedan: allí son la única
       manera de moverse y no hay ficha que perder (Diego, 3/10/2026). */
    if (!estado.libre) document.querySelectorAll('.barra-app a').forEach(a => { a.hidden = true; });
    ajustarCompacto();
    window.addEventListener('resize', ajustarCompacto);
    // En pantalla estrecha el enunciado va recortado; pulsarlo lo despliega
    $('#instruccion').addEventListener('click', () => { if (compacto()) $('#instruccion').classList.toggle('desplegada'); });
    // Ventana baja (móvil en horizontal): plegar y desplegar las filas de referencia.
    // Al desplegarlas la partitura baja, así que se vuelve a enfocar la casilla activa.
    $('#btn-datos').addEventListener('click', () => {
      const abierto = document.body.classList.toggle('datos-abiertos');
      const b = $('#btn-datos');
      b.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      b.textContent = 'Fundamentales y cifrados ' + (abierto ? '▴' : '▾');
      enfocarActiva();
    });
    window.addEventListener('hashchange', () => { if (!estado.ficha) cargar(ejercicioDesdeURL()); });
    if (inicial.has('f') && typeof Banco !== 'undefined') iniciarFicha(inicial.get('f'));
    else cargar(ejercicioDesdeURL());
  });

})();

/* =====================================================================
   LA VERSIÓN DEL PIE, LEÍDA DEL PROPIO SELLO  (decisión 207, 30/9/2026)

   Estaba escrita A MANO en el HTML, en un <span id="version">, y el sello
   `?v=…` que se cambia en cada despliegue va en los <script> y <link>: dos
   sitios distintos para el mismo dato. El resultado fue que el pie se quedó
   anclado en `20261001-1605` mientras el código cambiaba diez veces, Diego
   lo leyó como «la web no se actualiza» y estuvimos una hora buscando en
   GitHub Pages un problema que no existía.

   Ahora el pie no puede mentir: sale del `?v=` con el que el navegador ha
   pedido este mismo archivo. Un solo dato, un solo sitio.
   ===================================================================== */
(function () {
  try {
    const caja = document.getElementById('version');
    if (!caja) return;
    const m = [...document.querySelectorAll('script[src*="v="], link[href*="v="]')]
      .map(x => String(x.src || x.href).match(/[?&]v=([0-9][0-9-]*)/))
      .find(Boolean);
    if (m) caja.textContent = caja.textContent.replace(/\d{8}-\d{4}/, m[1]);
  } catch (e) { /* si algo falla, se queda lo que ponga el HTML */ }
})();
