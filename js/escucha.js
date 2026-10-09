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
  /* El segundo en que empieza un punto. La rejilla da el segundo de cada compás; dentro del
     compás se reparte en partes iguales, que es lo que vale para un tempo estable. */
  function segundo(fr, txt) {
    const p = punto(txt);
    const rej = fr && fr.rejilla;
    if (!p || !Array.isArray(rej) || !rej.length) return null;
    const i = rej.findIndex(x => x[0] === p.compas);
    if (i < 0) return null;
    const s = rej[i][1];
    if (p.tiempo <= 1) return s;
    // El largo de este compás: el siguiente menos este; en el último, el del anterior
    const largo = (i + 1 < rej.length) ? rej[i + 1][1] - s : (i > 0 ? s - rej[i - 1][1] : 0);
    return s + (p.tiempo - 1) * largo / negrasDe(fr.compas);
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
      + '<img class="escucha-partitura" alt="Partitura del pasaje" hidden>'
      + '<div class="escucha-botones" role="group" aria-label="Qué oír"></div>'
      + '<audio class="escucha-audio" preload="metadata" controls hidden></audio>'
      + '<p class="escucha-credito"></p>';
    audio = caja.querySelector('.escucha-audio');
    caja.querySelector('.escucha-cerrar').addEventListener('click', () => cerrar());
    /* Parar donde toca. `timeupdate` es el que vale cuando la pestaña no está delante;
       `requestAnimationFrame` afina mientras sí lo está. */
    audio.addEventListener('timeupdate', comprobarLimite);
    /* La grabación y la realización del alumno no suenan a la vez: el que empieza para al
       otro (acuerdo, apartado 6). Aquí, la grabación para lo que estuviera sonando; al
       final del módulo se apunta lo contrario en `Sonido`. */
    audio.addEventListener('play', () => {
      if (typeof Sonido !== 'undefined' && Sonido.parar) Sonido.parar();
      vigilar();
    });
    audio.addEventListener('pause', () => cancelAnimationFrame(rafId));
    audio.addEventListener('ended', () => { limite = null; });
    /* Si el alumno se mueve por el audio a mano y se sale del tramo, se le deja: el límite
       era del botón que pulsó, no una cárcel. */
    audio.addEventListener('seeked', () => {
      if (limite != null && audio.currentTime > limite + 0.05) limite = null;
    });
    return caja;
  }

  function comprobarLimite() {
    if (limite != null && audio.currentTime >= limite - 0.02) { audio.pause(); limite = null; }
  }
  function vigilar() {
    cancelAnimationFrame(rafId);
    const paso = () => { comprobarLimite(); if (!audio.paused) rafId = requestAnimationFrame(paso); };
    rafId = requestAnimationFrame(paso);
  }

  function parar() {
    if (audio && !audio.paused) audio.pause();
    limite = null;
    cancelAnimationFrame(rafId);
  }
  function cerrar() { parar(); if (caja) caja.hidden = true; }

  /* `play()` se llama DENTRO del clic, que es lo que el navegador exige; el salto al segundo
     se hace en cuanto el audio sepa cuánto dura (con `preload="metadata"` normalmente ya lo
     sabe, y si no, se espera a saberlo). El límite se pone después del salto para que el
     `seeked` de ese mismo salto no lo borre. */
  function sonar(tramo) {
    if (!audio || !tramo) return;
    limite = null;
    const ir = () => { try { audio.currentTime = tramo.t0; } catch (e) { /* aún no se puede */ } limite = tramo.t1; };
    const p = audio.play();
    if (audio.readyState >= 1) ir(); else audio.addEventListener('loadedmetadata', ir, { once: true });
    if (p && p.catch) p.catch(() => { aviso('El navegador no ha dejado sonar el audio. Vuelve a pulsar el botón.'); });
  }

  function aviso(txt) {
    const p = caja.querySelector('.escucha-aviso');
    p.textContent = txt || '';
    p.hidden = !txt;
  }

  /* Prepara el panel para el ejercicio que hay en pantalla y lo mete donde se le diga.
     No carga nada todavía: eso pasa cuando el alumno pulsa el rótulo. */
  function montar(ej, donde) {
    const c = construir();
    if (donde && c.parentNode !== donde) donde.appendChild(c);
    actual = (ej && ej.auditivo && ej.auditivo.fragmento) ? ej.auditivo : null;
    ejercicio = ej || null;
    cerrar();
    if (audio) { audio.removeAttribute('src'); audio.hidden = true; audio.load(); }
    return !!actual;
  }

  // Abre el panel (o lo cierra, si ya estaba abierto)
  function alternar() {
    if (!caja || !actual) return;
    if (!caja.hidden) { cerrar(); return; }
    caja.hidden = false;
    aviso('Cargando la grabación…');
    caja.querySelector('.escucha-botones').textContent = '';
    cargar().then(d => {
      const fr = d && d.fragmentos && d.fragmentos[actual.fragmento];
      if (!fr) throw new Error('el banco auditivo no tiene el fragmento ' + actual.fragmento);
      pintar(fr);
    }).catch(e => {
      aviso('No se ha podido abrir la música real: ' + e.message + '.');
      caja.querySelector('.escucha-partitura').hidden = true;
      if (audio) audio.hidden = true;
    });
  }

  function pintar(fr) {
    aviso('');
    caja.querySelector('.escucha-titulo').textContent = fr.obra || 'La música real';
    const tono = caja.querySelector('.escucha-tono');
    tono.textContent = avisoDeTono(ejercicio);
    tono.hidden = !tono.textContent;
    const img = caja.querySelector('.escucha-partitura');
    if (fr.partitura) { img.src = raiz() + fr.partitura; img.hidden = false; } else { img.hidden = true; }
    if (fr.audio) { if (!audio.getAttribute('src')) audio.src = raiz() + fr.audio; audio.hidden = false; }
    else { audio.hidden = true; }

    const t = tramos(fr, actual.desde, actual.hasta);
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

  return { montar, alternar, parar, cerrar, tramos, segundo, unidadContexto, punto, rotuloCompases };
})();
