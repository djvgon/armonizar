/* =====================================================================
   escucha.js — oír el pasaje de verdad del que sale el fragmento.

   Un fragmento de música real puede decir de qué pasaje del banco
   auditivo viene (`e.auditivo = {fragmento, desde, hasta}`, compases de
   la obra). Cuando lo dice, bajo la partitura aparece el rótulo de la
   obra como botón y, al pulsarlo, se despliega AQUÍ MISMO —debajo del
   fragmento, no en otra ventana— la partitura del pasaje, su grabación y
   tres botones (acuerdo con el chat auditivo, apartado 6):

     1. «El fragmento»            los compases del ejercicio. Siempre.
     2. «En su contexto»          la unidad formal inmediatamente
                                  superior. Si el fragmento coincide con
                                  una unidad, se sube un nivel: los cc.
                                  15–18 de Beethoven son A′, así que
                                  suena B + A′ (cc. 11–18).
     3. «El fragmento completo»   todo el fragmento auditivo. Siempre.

   Si el segundo coincidiera con el primero o con el tercero, se oculta.

   DE DÓNDE SALEN LOS DATOS. Del repositorio del banco auditivo
   (`djvgon/auditivo`), que está al lado de este en la misma dirección,
   de modo que se leen sin copiarlos y sin problemas de origen:
   `../auditivo/auditivo.json`. De allí vienen la REJILLA —el segundo en
   que empieza cada compás—, las UNIDADES formales, el audio, la imagen
   de la partitura y los créditos. Si cambia la grabación solo se vuelve
   a medir la rejilla: las referencias en compás.tiempo siguen valiendo.

   TRES COSAS QUE LOS NAVEGADORES OBLIGAN A HACER ASÍ (avisos del chat
   auditivo, comprobados por él en Chromium):
   · saltar a un segundo exige un servidor que admita peticiones de
     rango; GitHub Pages las admite;
   · para parar a tiempo no basta `requestAnimationFrame`, que el
     navegador frena cuando la pestaña no está delante: se vigila también
     con `timeupdate`, que sigue llegando unas cuatro veces por segundo;
   · `play()` necesita un clic de verdad del alumno, y por eso suena al
     pulsar un botón y nunca por su cuenta.
   ===================================================================== */

const Escucha = (() => {

  /* ---------- Cálculo (no toca la pantalla: se puede probar aparte) ---------- */

  // «16.2» → { compas: 16, tiempo: 2 }. El tiempo es 1-based, como lo lee un músico.
  function punto(txt) {
    const m = /^(\d+)\.(\d+)$/.exec(String(txt || '').trim());
    return m ? { compas: parseInt(m[1], 10), tiempo: parseInt(m[2], 10) } : null;
  }
  // Las negras que tiene un compás: 2/4 → 2, 6/8 → 3
  const negrasDe = compas => (compas && compas.length === 2) ? compas[0] * 4 / compas[1] : 4;
  /* Un punto como número, para poder comparar intervalos: el compás más la parte del compás
     ya recorrida. «16.2» en 2/4 es 16,5. Así «contiene» y «coincide» son dos comparaciones. */
  function posicion(fr, txt) {
    const p = punto(txt);
    if (!p) return null;
    return p.compas + (p.tiempo - 1) / negrasDe(fr.compas);
  }
  /* El segundo en que cae una posición dada EN NEGRAS desde el principio de la obra. La
     rejilla da el segundo de cada compás; dentro del compás se reparte en partes iguales,
     que es lo que vale para un tempo estable. */
  function segundoEnNegra(fr, negra) {
    const rej = fr && fr.rejilla;
    if (!Array.isArray(rej) || !rej.length || !isFinite(negra)) return null;
    const negras = negrasDe(fr.compas);
    const compas = Math.floor(negra / negras) + 1;
    const resto = negra - (compas - 1) * negras;
    const i = rej.findIndex(x => x[0] === compas);
    if (i < 0) return null;
    const s = rej[i][1];
    if (resto <= 0) return s;
    // El largo de este compás: el siguiente menos este; en el último, el del anterior
    const largo = (i + 1 < rej.length) ? rej[i + 1][1] - s : (i > 0 ? s - rej[i - 1][1] : 0);
    return s + resto * largo / negras;
  }
  // El segundo en que empieza un punto «compás.tiempo»
  function segundo(fr, txt) {
    const p = punto(txt);
    if (!p) return null;
    return segundoEnNegra(fr, (p.compas - 1) * negrasDe(fr.compas) + (p.tiempo - 1));
  }

  /* CUÁNDO SUENA CADA ACORDE DEL EJERCICIO (Diego, 9/10/2026: «que se vaya iluminando la
     reducción armónica que trabaja el estudiante a medida que suena el fragmento grabado»).
     Tres datos que ya existen, encadenados, sin medir nada a ojo: el ejercicio sabe en qué
     negra —contando desde su primera nota— entra cada acorde (`tiempos`, la rejilla de la
     decisión 238); el uso dice en qué compás y parte DE LA OBRA empieza el fragmento; y la
     rejilla del banco auditivo, en qué segundo empieza cada compás de la grabación. */
  function tiemposDeCompases(compases) {
    const out = []; let t = 0;
    (compases || []).forEach(c => (c || []).forEach(([n, d]) => { if (n !== null) out.push(t); t += d; }));
    return out;
  }
  /* ===== DÓNDE ESTÁ CADA COMPÁS EN LA IMAGEN (asunto 9 con el chat auditivo, 9/10/2026) =====
     `compasesEnLaImagen` da, en píxeles de la imagen, el rectángulo de cada compás:
     `[número, x0, x1, y0, y1]`, con el alto del sistema en que está. Con eso y la rejilla
     —que dice en qué segundo empieza cada compás— se puede dibujar encima de la partitura el
     recuadro del pasaje y una línea que avanza con la música. Todo se calcula en TANTO POR
     CIENTO del tamaño de la imagen: así no hay que medir nada en pantalla ni rehacerlo cuando
     cambia el ancho. Si un fragmento no trae estas medidas, no se dibuja nada y lo demás
     sigue igual. */
  const medidasDe = fr => (fr && fr.compasesEnLaImagen && Array.isArray(fr.compasesEnLaImagen.compases)
    && fr.compasesEnLaImagen.ancho > 0 && fr.compasesEnLaImagen.alto > 0) ? fr.compasesEnLaImagen : null;
  const cajaDeCompas = (med, n) => (med.compases || []).find(c => c[0] === n) || null;
  // La x de un tiempo dentro de un compás: el compás se reparte en partes iguales
  const xEnCompas = (caja, parte, negras) => caja[1] + Math.max(0, Math.min(1, (parte - 1) / negras)) * (caja[2] - caja[1]);
  // De píxeles de la imagen a tanto por ciento, que es como se coloca en la pantalla
  const porciento = (med, x0, x1, y0, y1) => ({
    left: (100 * x0 / med.ancho) + '%', width: (100 * (x1 - x0) / med.ancho) + '%',
    top: (100 * y0 / med.alto) + '%', height: (100 * (y1 - y0) / med.alto) + '%'
  });

  /* El recuadro —o los recuadros— del pasaje: uno por sistema, porque un fragmento puede
     empezar en un sistema y acabar en el siguiente. El primero empieza donde empieza de
     verdad el pasaje dentro de su compás (el uso de A-5 arranca en el 2.º tiempo del c. 16),
     y el último acaba donde acaba. */
  function marcosDe(fr, desde, hasta) {
    const med = medidasDe(fr);
    const d = punto(desde), h = punto(hasta);
    if (!med || !d || !h) return [];
    const negras = negrasDe(fr.compas);
    const ultimo = h.tiempo <= 1 ? h.compas - 1 : h.compas;
    const cajas = (med.compases || []).filter(c => c[0] >= d.compas && c[0] <= ultimo)
      .sort((a, b) => a[0] - b[0]);
    if (!cajas.length) return [];
    const grupos = [];
    cajas.forEach(c => {
      const ult = grupos[grupos.length - 1];
      if (ult && ult.y0 === c[3] && ult.y1 === c[4]) { ult.x1 = Math.max(ult.x1, c[2]); ult.hasta = c; }
      else grupos.push({ x0: c[1], x1: c[2], y0: c[3], y1: c[4], desde: c, hasta: c });
    });
    // Ajuste fino de los extremos dentro de su compás
    const primero = grupos[0], fin = grupos[grupos.length - 1];
    if (primero.desde[0] === d.compas && d.tiempo > 1) primero.x0 = xEnCompas(primero.desde, d.tiempo, negras);
    if (fin.hasta[0] === h.compas && h.tiempo > 1) fin.x1 = xEnCompas(fin.hasta, h.tiempo, negras);
    return grupos.map(g => porciento(med, g.x0, g.x1, g.y0, g.y1));
  }

  /* Dónde está la música en la imagen en el segundo `t`: el compás que suena y la línea
     dentro de él. Devuelve `null` fuera de los compases medidos. */
  function puntoEnLaImagen(fr, t) {
    const med = medidasDe(fr);
    const rej = fr && fr.rejilla;
    if (!med || !Array.isArray(rej) || !rej.length || !isFinite(t)) return null;
    let i = -1;
    for (let k = 0; k < rej.length; k++) { if (rej[k][1] <= t) i = k; else break; }
    if (i < 0 || i + 1 >= rej.length) return null;            // antes del primero o después del último
    const caja = cajaDeCompas(med, rej[i][0]);
    if (!caja) return null;
    const largo = rej[i + 1][1] - rej[i][1];
    const parte = largo > 0 ? Math.max(0, Math.min(1, (t - rej[i][1]) / largo)) : 0;
    const x = caja[1] + parte * (caja[2] - caja[1]);
    const alto = porciento(med, caja[1], caja[2], caja[3], caja[4]);
    // La línea no lleva ancho: se lo pone el estilo, en píxeles, para que no adelgace
    return { compas: alto,
      linea: { left: (100 * x / med.ancho) + '%', top: alto.top, height: alto.height } };
  }

  function momentosDe(fr, ej) {
    if (!fr || !ej || !ej.auditivo) return null;
    const p = punto(ej.auditivo.desde);
    if (!p) return null;
    const negras = negrasDe(fr.compas);
    const base = (p.compas - 1) * negras + (p.tiempo - 1);
    const t = (Array.isArray(ej.tiempos) && ej.tiempos.length) ? ej.tiempos : tiemposDeCompases(ej.compases);
    if (!t.length) return null;
    return t.map(x => segundoEnNegra(fr, base + x));
  }

  // «cc. 15–18» a partir del intervalo medio abierto [desde, hasta)
  function rotuloCompases(desde, hasta) {
    const d = punto(desde), h = punto(hasta);
    if (!d || !h) return '';
    const ultimo = h.tiempo <= 1 ? h.compas - 1 : h.compas;
    return ultimo > d.compas ? 'cc. ' + d.compas + '–' + ultimo : 'c. ' + d.compas;
  }

  /* LA UNIDAD DE «EN SU CONTEXTO». La más pequeña que contenga el pasaje; si el pasaje es
     exactamente una unidad, la de encima. Las unidades vienen como
     [nombre, desde, hasta, nombre de la superior o null], y los nombres se repiten —«B» y
     «A′» salen dos veces, en la segunda parte y en su repetición—, así que la superior se
     busca por nombre Y porque contenga a la de abajo. */
  function unidadContexto(fr, desde, hasta) {
    const us = Array.isArray(fr.unidades) ? fr.unidades : [];
    if (!us.length) return null;
    const d = posicion(fr, desde), h = posicion(fr, hasta);
    if (d == null || h == null) return null;
    const con = us.map(u => ({ nombre: u[0], desde: u[1], hasta: u[2], de: u[3], d: posicion(fr, u[1]), h: posicion(fr, u[2]) }))
      .filter(u => u.d != null && u.h != null);
    const dentro = con.filter(u => u.d <= d && u.h >= h).sort((a, b) => (a.h - a.d) - (b.h - b.d));
    if (!dentro.length) return null;             // el pasaje cruza dos unidades: no hay contexto
    let u = dentro[0];
    if (Math.abs(u.d - d) < 1e-9 && Math.abs(u.h - h) < 1e-9) {
      // coincide con la unidad: se sube un nivel
      if (!u.de) return null;
      const arriba = con.find(x => x.nombre === u.de && x.d <= u.d && x.h >= u.h);
      if (!arriba) return null;
      u = arriba;
    }
    return u;
  }

  /* Los tres tramos, en segundos, con su rótulo. `contexto` viene `null` cuando no hay
     unidad intermedia o cuando coincidiría con uno de los otros dos: entonces su botón se
     oculta, tal como dice el acuerdo. */
  function tramos(fr, desde, hasta) {
    const rej = (fr && fr.rejilla) || [];
    const t0 = segundo(fr, desde), t1 = segundo(fr, hasta);
    const todo = rej.length ? { t0: rej[0][1], t1: rej[rej.length - 1][1],
      rotulo: rotuloCompases(rej[0][0] + '.1', rej[rej.length - 1][0] + '.1') } : null;
    const u = unidadContexto(fr, desde, hasta);
    let contexto = null;
    if (u) {
      const a = segundo(fr, u.desde), b = segundo(fr, u.hasta);
      const igualAlFragmento = Math.abs(a - t0) < 1e-6 && Math.abs(b - t1) < 1e-6;
      const igualAlTodo = todo && Math.abs(a - todo.t0) < 1e-6 && Math.abs(b - todo.t1) < 1e-6;
      if (!igualAlFragmento && !igualAlTodo) {
        contexto = { t0: a, t1: b, rotulo: rotuloCompases(u.desde, u.hasta), nombre: u.nombre };
      }
    }
    return {
      fragmento: (t0 == null || t1 == null) ? null : { t0, t1, rotulo: rotuloCompases(desde, hasta) },
      contexto,
      completo: todo
    };
  }

  /* ---------- Los datos del banco auditivo ---------- */

  let datos = null, pidiendo = null;
  const raiz = () => new URL('../auditivo/', location.href.split('#')[0]).href;

  function cargar() {
    if (datos) return Promise.resolve(datos);
    if (!pidiendo) {
      pidiendo = fetch(raiz() + 'auditivo.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('no se ha podido leer auditivo.json'); return r.json(); })
        .then(d => { datos = d; pidiendo = null; return d; })
        .catch(e => { pidiendo = null; throw e; });
    }
    return pidiendo;
  }

  /* ---------- El panel ---------- */

  let caja = null, audio = null, limite = null, rafId = 0, actual = null, ejercicio = null;
  /* Para iluminar el acorde que suena sobre la partitura del propio ejercicio: la función que
     lo enciende (la pone la página del alumno), el segundo en que entra cada acorde, hasta
     dónde llega el fragmento y cuál está encendido ahora mismo. */
  let iluminar = null, momentos = null, finDelFragmento = null, encendido = -1;
  // Los datos del pasaje y sus tres tramos, listos desde que se carga el ejercicio: así el
  // botón «Escuchar la grabación» de la barra del alumno suena en el mismo clic que lo pulsa.
  let frActual = null, tramosActuales = null;
  // Los dos dibujos que se mueven sobre la imagen de la partitura
  let compasEl = null, lineaEl = null;
  /* LAS NOTAS QUE LA REDUCCIÓN QUITA (asunto 10 con el chat auditivo; Diego, 10/10/2026).
     Una nota de paso cromática, un 6/4 de arpegio, una bordadura: no llevan acorde y el
     alumno no las cifra, pero conviene que las vea. Van marcadas con un asterisco sobre la
     partitura real y un globo con la explicación. `marcas` son los botones; `globo`, el
     cartelito; `marcaAbierta`, cuál se está leyendo, y `globoHasta`, hasta qué segundo lo
     deja puesto la grabación cuando lo ha abierto ella. */
  let marcas = [], globo = null, marcaAbierta = -1, globoHasta = null;

  /* EL AVISO DEL TONO (Diego, 9/10/2026). La grabación se ofrece también cuando la ficha ha
     transportado el fragmento, y entonces hay que decirlo: el audio suena en la tonalidad en
     que lo escribió el compositor y el alumno está armonizando en otra. Dicho así, de paso,
     es una lección de transporte y no una trampa. */
  function avisoDeTono(ej) {
    if (!ej || !ej.transportadoDe || !ej.tonalidad) return '';
    const corto = t => (typeof Teoria !== 'undefined' && Teoria.nombreCorto) ? Teoria.nombreCorto(t) : (t.tonica || '');
    const original = corto({ tonica: ej.transportadoDe, modo: ej.tonalidad.modo });
    const ahora = corto(ej.tonalidad);
    if (!original || original === ahora) return '';
    return 'La grabación suena en la tonalidad original, ' + original
      + ', y tú lo estás armonizando en ' + ahora + '.';
  }

  function construir() {
    if (caja) return caja;
    caja = document.createElement('div');
    caja.id = 'escucha';
    caja.className = 'escucha';
    caja.hidden = true;
    caja.innerHTML = '<div class="escucha-cabeza">'
      + '<span class="escucha-titulo"></span>'
      + '<button type="button" class="escucha-cerrar" title="Cerrar la escucha">Cerrar</button></div>'
      + '<p class="escucha-aviso" hidden></p>'
      + '<p class="escucha-tono" hidden></p>'
      /* Los tres botones ENCIMA de la imagen (Diego, 9/10/2026): son lo que se usa, y así se
         tienen a mano sin pasar por delante toda la partitura, que en el móvil es alta. */
      + '<div class="escucha-botones" role="group" aria-label="Qué oír"></div>'
      /* La lámina: la imagen de la partitura y, encima, una capa transparente donde se
         dibujan el recuadro de los compases del ejercicio, el compás que suena y la línea
         que avanza. Todo en porcentajes del tamaño de la imagen, así que vale igual en el
         ordenador y en el teléfono sin recalcular nada al cambiar de tamaño. */
      + '<span class="escucha-lamina" hidden>'
      + '<img class="escucha-partitura" alt="Partitura del pasaje">'
      + '<span class="escucha-capa"></span>'
      + '</span>'
      + '<audio class="escucha-audio" preload="metadata" controls hidden></audio>'
      + '<p class="escucha-credito"></p>';
    audio = caja.querySelector('.escucha-audio');
    caja.querySelector('.escucha-cerrar').addEventListener('click', () => cerrar());
    /* La partitura, a tamaño completo en otra pestaña: en el móvil entra reducida a unos
       340 px y así se puede leer de verdad, con el zoom del propio navegador. */
    caja.querySelector('.escucha-partitura').addEventListener('click', ev => {
      // Con un globo abierto, el primer toque en la partitura lo cierra y no abre nada más
      if (marcaAbierta >= 0) { cerrarGlobo(); return; }
      const s = ev.currentTarget.getAttribute('src');
      if (s) window.open(s, '_blank', 'noopener');
    });
    /* Parar donde toca. `timeupdate` es el que vale cuando la pestaña no está delante;
       `requestAnimationFrame` afina mientras sí lo está. */
    audio.addEventListener('timeupdate', comprobarLimite);
    /* La grabación y la realización del alumno no suenan a la vez: el que empieza para al
       otro (acuerdo, apartado 6). Aquí, la grabación para lo que estuviera sonando; al
       final del módulo se apunta lo contrario en `Sonido`. */
    audio.addEventListener('play', () => {
      if (typeof Sonido !== 'undefined' && Sonido.parar) Sonido.parar();
      vigilar(); contar(true);
    });
    audio.addEventListener('pause', () => { cancelAnimationFrame(rafId); apagar(); contar(false); });
    audio.addEventListener('ended', () => { limite = null; apagar(); contar(false); });
    /* Si el alumno se mueve por el audio a mano y se sale del tramo, se le deja: el límite
       era del botón que pulsó, no una cárcel. */
    audio.addEventListener('seeked', () => {
      if (limite != null && audio.currentTime > limite + 0.05) limite = null;
    });
    return caja;
  }

  function comprobarLimite() {
    if (limite != null && audio.currentTime >= limite - 0.02) { audio.pause(); limite = null; }
    alumbrar();
  }

  /* Enciende el acorde por el que va la grabación. Funciona con los tres botones: oyendo «En
     su contexto» o el fragmento completo, la luz entra justo cuando la música llega a los
     compases del ejercicio y se apaga al salir de ellos. */
  function alumbrar() {
    if (!audio || audio.paused) return;
    const t = audio.currentTime;
    situarEnLaImagen(t);                       // el compás y la línea sobre la partitura real
    globoQueSuena(t);                          // y la explicación de la nota por la que pasa
    if (!iluminar || !momentos || !momentos.length) return;
    let k = -1;
    if (finDelFragmento == null || t < finDelFragmento) {
      for (let i = 0; i < momentos.length; i++) {
        if (momentos[i] == null) continue;
        if (momentos[i] <= t + 0.03) k = i; else break;
      }
    }
    if (k !== encendido) { encendido = k; iluminar(k < 0 ? null : k); }
  }
  function apagar() {
    if (iluminar && encendido >= 0) { encendido = -1; iluminar(null); }
    encendido = -1;
    borrarDeLaImagen();
  }

  /* Avisar de si la grabación suena o no. Lo usa la página del alumno para enseñar y
     esconder su botón «■ Parar», que es el único sitio desde donde se puede detener cuando el
     panel está cerrado. */
  let alCambiar = null;
  function anotarEstado(fn) { alCambiar = typeof fn === 'function' ? fn : null; }
  function contar(suena) { if (alCambiar) { try { alCambiar(!!suena); } catch (e) { /* no es asunto nuestro */ } } }
  function vigilar() {
    cancelAnimationFrame(rafId);
    const paso = () => { comprobarLimite(); if (!audio.paused) rafId = requestAnimationFrame(paso); };
    rafId = requestAnimationFrame(paso);
  }

  function parar() {
    if (audio && !audio.paused) audio.pause();
    limite = null;
    cancelAnimationFrame(rafId);
    apagar();
  }
  function cerrar() { parar(); if (caja) caja.hidden = true; }

  /* PRIMERO EL SALTO Y DESPUÉS `play()`, las dos cosas dentro del mismo clic: así el
     navegador acepta que suene —lo exige— y no se oye un pellizco del sitio donde estuviera
     el audio antes de saltar. Si todavía no sabe cuánto dura (no debería, con
     `preload="metadata"`), se arranca y se salta en cuanto lo sepa. El límite se pone
     después del salto, para que el `seeked` de ese mismo salto no lo borre. */
  function sonar(tramo) {
    if (!audio || !tramo) return;
    limite = null;
    const ir = () => { try { audio.currentTime = tramo.t0; } catch (e) { /* aún no se puede */ } limite = tramo.t1; };
    if (audio.readyState >= 1) ir(); else audio.addEventListener('loadedmetadata', ir, { once: true });
    const p = audio.play();
    if (p && p.catch) p.catch(() => {
      // Si el aviso cae en un panel cerrado no lo lee nadie: se abre para decirlo
      if (caja.hidden) { caja.hidden = false; aLaVista(); }
      aviso('El navegador no ha dejado sonar el audio. Vuelve a pulsar el botón.');
    });
  }

  /* Sonar los compases del ejercicio SIN abrir el panel (Diego, 9/10/2026): es el botón
     «Escuchar la grabación» de la barra del alumno, al lado de «Escuchar propuesta». Hace lo
     mismo que «El fragmento» del panel. Con los datos ya preparados suena en el mismo clic;
     si todavía no han llegado, se esperan y suena en cuanto lleguen. */
  function sonarFragmento() {
    if (tramosActuales && tramosActuales.fragmento) { sonar(tramosActuales.fragmento); return; }
    preparar().then(() => { if (tramosActuales && tramosActuales.fragmento) sonar(tramosActuales.fragmento); });
  }

  /* QUE SE VEA AL ABRIRSE (Diego, 9/10/2026, desde un móvil: «la partitura y el reproductor
     de la grabación no se muestran si presiono el nombre de Beethoven»). No es que no se
     mostraran: el panel se abre DEBAJO del ejercicio, y en una pantalla de teléfono eso cae
     fuera de lo que se ve, de modo que al pulsar no parecía pasar nada. Si no cabe entero en
     la pantalla, la página se desplaza hasta él —despacio, para que se vea que ha sido eso—.
     Se llama también cuando acaba de cargar la imagen de la partitura, porque entonces el
     panel crece de golpe y lo que se había calculado ya no vale. */
  function aLaVista() {
    if (!caja || caja.hidden) return;
    const r = caja.getBoundingClientRect();
    const alto = window.innerHeight || document.documentElement.clientHeight || 0;
    if (r.top >= 0 && r.bottom <= alto) return;              // ya se ve entero: no se toca nada
    try { caja.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (e) { caja.scrollIntoView(true); }
  }

  function aviso(txt) {
    const p = caja.querySelector('.escucha-aviso');
    p.textContent = txt || '';
    p.hidden = !txt;
  }

  /* Deja listo lo que no se ve: los datos del pasaje, los tres tramos, el segundo de cada
     acorde y la dirección del audio. Son unos pocos kilobytes —el JSON y la cabecera del
     mp3—, y a cambio los botones suenan en el mismo clic, que es lo que exige el navegador.
     Si algo falla aquí no se dice nada: ya se dirá al abrir el panel. */
  function preparar() {
    if (!actual) return Promise.resolve(null);
    return cargar().then(d => {
      const fr = (d && d.fragmentos && d.fragmentos[actual.fragmento]) || null;
      if (!fr) return null;
      frActual = fr;
      momentos = momentosDe(fr, ejercicio);
      finDelFragmento = segundo(fr, actual.hasta);
      tramosActuales = tramos(fr, actual.desde, actual.hasta);
      if (fr.audio && audio) {
        const s = raiz() + fr.audio;
        if (audio.getAttribute('src') !== s) audio.src = s;
      }
      return fr;
    }).catch(() => null);
  }

  /* Prepara el panel para el ejercicio que hay en pantalla y lo mete donde se le diga. El
     panel no se enseña: eso pasa cuando el alumno pulsa el rótulo. */
  function montar(ej, donde, alIluminar) {
    const c = construir();
    if (donde && c.parentNode !== donde) donde.appendChild(c);
    apagar();
    actual = (ej && ej.auditivo && ej.auditivo.fragmento) ? ej.auditivo : null;
    ejercicio = ej || null;
    iluminar = typeof alIluminar === 'function' ? alIluminar : null;
    momentos = null; finDelFragmento = null; frActual = null; tramosActuales = null;
    marcas = []; globo = null; marcaAbierta = -1; globoHasta = null;
    cerrar();
    if (audio) { audio.removeAttribute('src'); audio.hidden = true; audio.load(); }
    if (actual) preparar();          // en segundo plano, para que los botones suenen al pulsarlos
    return !!actual;
  }

  // Abre el panel (o lo cierra, si ya estaba abierto)
  function alternar() {
    if (!caja || !actual) return;
    if (!caja.hidden) { cerrar(); return; }
    caja.hidden = false;
    aviso('Cargando la grabación…');
    caja.querySelector('.escucha-botones').textContent = '';
    aLaVista();
    (frActual ? Promise.resolve(frActual) : preparar()).then(fr => {
      if (!fr) throw new Error('el banco auditivo no tiene el fragmento ' + actual.fragmento);
      pintar(fr);
      aLaVista();
    }).catch(e => {
      aviso('No se ha podido abrir la música real: ' + e.message + '.');
      caja.querySelector('.escucha-partitura').hidden = true;
      if (audio) audio.hidden = true;
    });
  }

  /* Dibuja sobre la imagen: el recuadro de los compases del ejercicio —fijo, como el de las
     etiquetas de las técnicas armónicas— y, encima, los dos que se mueven: el compás que
     suena y la línea. Si el fragmento no trae medidas, la capa se queda vacía. */
  function dibujarEnLaImagen(fr) {
    const capa = caja.querySelector('.escucha-capa');
    capa.textContent = '';
    compasEl = lineaEl = null;
    if (!medidasDe(fr) || !actual) return;
    marcosDe(fr, actual.desde, actual.hasta).forEach(m => {
      const e = document.createElement('i');
      e.className = 'escucha-marco';
      Object.assign(e.style, m);
      capa.appendChild(e);
    });
    compasEl = document.createElement('i');
    compasEl.className = 'escucha-compas';
    compasEl.hidden = true;
    capa.appendChild(compasEl);
    lineaEl = document.createElement('i');
    lineaEl.className = 'escucha-linea';
    lineaEl.hidden = true;
    capa.appendChild(lineaEl);
    dibujarMarcas(fr, capa);
  }

  /* Las marcas de las notas que la reducción quita (asunto 10). Cada una es un BOTÓN —se
     puede tocar con el dedo y llegar con el teclado—, con el texto como su nombre accesible;
     el globo es solo la manera de verlo. Las que caen fuera del pasaje del ejercicio se
     dibujan más tenues: ahí están, porque el alumno puede oír el fragmento entero, pero no
     compiten con lo suyo. */
  function dibujarMarcas(fr, capa) {
    marcas = []; globo = null; marcaAbierta = -1; globoHasta = null;
    const med = medidasDe(fr);
    const lista = Array.isArray(fr.notasEnLaImagen) ? fr.notasEnLaImagen : [];
    if (!med || !lista.length) return;
    const d = actual ? punto(actual.desde) : null, h = actual ? punto(actual.hasta) : null;
    const negras = negrasDe(fr.compas);
    const enNegras = m => ((Number(m.compas) || 0) - 1) * negras + (parseFloat(m.tiempo) || 1) - 1;
    const desde = d ? (d.compas - 1) * negras + (d.tiempo - 1) : -Infinity;
    const hasta = h ? (h.compas - 1) * negras + (h.tiempo - 1) : Infinity;

    lista.forEach((m, i) => {
      if (!(m && isFinite(m.x) && isFinite(m.y))) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'escucha-nota';
      const n = enNegras(m);
      if (n < desde || n >= hasta) b.classList.add('fuera');
      b.textContent = '∗';
      b.setAttribute('aria-label', m.texto || 'Nota que no lleva acorde');
      b.title = m.texto || '';
      b.style.left = (100 * m.x / med.ancho) + '%';
      b.style.top = (100 * m.y / med.alto) + '%';
      b.addEventListener('click', ev => { ev.stopPropagation(); abrirGlobo(i, true); });
      capa.appendChild(b);
      marcas.push({ el: b, texto: m.texto || '', segundo: segundoEnNegra(fr, n), arriba: (m.y / med.alto) > 0.4 });
    });
    if (!marcas.length) return;
    /* La capa no recibe pulsaciones —así se puede pulsar la imagen para verla entera—, pero
       las marcas y el globo sí: son lo único de la capa con lo que se interactúa. */
    capa.style.pointerEvents = 'none';
    marcas.forEach(m => { m.el.style.pointerEvents = 'auto'; });
    globo = document.createElement('span');
    globo.className = 'escucha-globo';
    globo.hidden = true;
    capa.appendChild(globo);
  }

  function abrirGlobo(i, aMano) {
    if (!globo || !marcas[i]) return;
    if (aMano && marcaAbierta === i) { cerrarGlobo(); return; }     // pulsar otra vez, cerrar
    marcas.forEach((m, k) => m.el.classList.toggle('abierta', k === i));
    globo.textContent = marcas[i].texto;
    globo.style.left = marcas[i].el.style.left;
    globo.style.top = marcas[i].el.style.top;
    globo.classList.toggle('debajo', !marcas[i].arriba);
    globo.hidden = false;
    marcaAbierta = i;
    globoHasta = aMano ? null : null;                               // lo pone quien lo abre
  }
  function cerrarGlobo() {
    if (globo) globo.hidden = true;
    marcas.forEach(m => m.el.classList.remove('abierta'));
    marcaAbierta = -1; globoHasta = null;
  }

  /* Mientras suena: se abre el globo de la marca por la que pasa la música y se queda tres
     segundos —o hasta la marca siguiente—, que es lo que se tarda en leer una línea. */
  const SEG_GLOBO = 3;
  function globoQueSuena(t) {
    if (!marcas.length) return;
    let k = -1;
    for (let i = 0; i < marcas.length; i++) {
      const s = marcas[i].segundo;
      if (s == null) continue;
      if (s <= t + 0.05 && t - s < SEG_GLOBO) { if (k < 0 || s > marcas[k].segundo) k = i; }
    }
    if (k < 0) { if (globoHasta != null) cerrarGlobo(); return; }
    if (k !== marcaAbierta) { abrirGlobo(k, false); }
    globoHasta = marcas[k].segundo + SEG_GLOBO;
  }

  // Pone el compás que suena y la línea donde toca; los esconde fuera de lo medido
  function situarEnLaImagen(t) {
    if (!compasEl || !lineaEl) return;
    const p = frActual ? puntoEnLaImagen(frActual, t) : null;
    if (!p) { compasEl.hidden = true; lineaEl.hidden = true; return; }
    Object.assign(compasEl.style, p.compas); compasEl.hidden = false;
    Object.assign(lineaEl.style, p.linea); lineaEl.hidden = false;
  }
  function borrarDeLaImagen() {
    if (compasEl) compasEl.hidden = true;
    if (lineaEl) lineaEl.hidden = true;
    // El globo que había abierto la grabación se cierra; el que abrió el alumno, se queda
    if (globoHasta != null) cerrarGlobo();
  }

  function pintar(fr) {
    aviso('');
    caja.querySelector('.escucha-titulo').textContent = fr.obra || 'La música real';
    const tono = caja.querySelector('.escucha-tono');
    tono.textContent = avisoDeTono(ejercicio);
    tono.hidden = !tono.textContent;
    const lamina = caja.querySelector('.escucha-lamina');
    const img = caja.querySelector('.escucha-partitura');
    if (fr.partitura) {
      /* Al cargar, el panel crece: hay que volver a mirar si cabe en la pantalla. Y la
         imagen se puede abrir a tamaño completo en otra pestaña, que en un teléfono es la
         manera de leerla de verdad. */
      img.onload = () => aLaVista();
      img.src = raiz() + fr.partitura;
      img.title = 'Pulsa para verla a tamaño completo';
      lamina.hidden = false;
      dibujarEnLaImagen(fr);
    } else { lamina.hidden = true; compasEl = lineaEl = null; }
    if (fr.audio) { if (!audio.getAttribute('src')) audio.src = raiz() + fr.audio; audio.hidden = false; }
    else { audio.hidden = true; }

    const t = tramosActuales || tramos(fr, actual.desde, actual.hasta);
    const botones = caja.querySelector('.escucha-botones');
    botones.textContent = '';
    const poner = (texto, tramo, titulo) => {
      if (!tramo) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.title = titulo + (tramo.rotulo ? ' (' + tramo.rotulo + ')' : '');
      b.addEventListener('click', () => sonar(tramo));
      botones.appendChild(b);
    };
    poner('El fragmento', t.fragmento, 'Los compases del ejercicio');
    poner('En su contexto', t.contexto, t.contexto ? 'La unidad formal en que está: ' + t.contexto.nombre : '');
    poner('El fragmento completo', t.completo, 'Todo el pasaje grabado');
    if (!t.fragmento) aviso('La grabación no trae todavía medidos estos compases.');

    const cred = [];
    if (fr.creditoAudio) cred.push('Grabación: ' + fr.creditoAudio);
    if (fr.creditoPartitura) cred.push('Partitura: ' + fr.creditoPartitura);
    caja.querySelector('.escucha-credito').textContent = cred.join(' · ');
  }

  /* Y al revés: cuando suena la aplicación —el acorde de una tecla, la realización del
     alumno—, la grabación se para. `sonido.js` avisa aquí. */
  if (typeof Sonido !== 'undefined' && Sonido.anotarAlSonar) Sonido.anotarAlSonar(() => parar());

  return { montar, alternar, sonarFragmento, parar, cerrar, anotarEstado, tramos, segundo, segundoEnNegra,
    momentosDe, marcosDe, puntoEnLaImagen, unidadContexto, punto, rotuloCompases };
})();
