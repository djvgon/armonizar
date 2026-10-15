/* =====================================================================
   contrapunto.js — La pantalla del tipo de ejercicio «Contrapunto»:
   el retardo a dos voces (lección Co-1).

   El alumno recibe UNA nota —la retardada o la real, según la dirección
   del ejercicio— y escribe la célula entera: las otras cinco notas, las
   ligaduras y la barra de compás. Después pulsa «Comprobar» y se le
   dice, regla por regla, qué no cumple.

   Cómo se escribe (2.6 del documento de contrapunto):

     · se pulsa una casilla del pentagrama (o se llega a ella con ← →);
     · ↑ y ↓ mueven la nota UN GRADO DE LA ESCALA, no un semitono: en
       estos ejercicios se piensa en melodía;
     · ♯/♮ eleva o devuelve a natural el 6.º y el 7.º grado del menor,
       que es cosa del alumno y no de la aplicación;
     · «Ligar» une la nota con la siguiente de su voz, y las dos pasan a
       ser la misma nota: eso es lo que hace que un retardo sea un
       retardo;
     · la barra de compás se pone pulsando el hueco entre dos notas
       (2.5): el alumno ha de recordar que el retardo va en parte fuerte.

   Cómo se corrige (2.7): deciden las reglas Y la realización modelo, y
   las dos han de coincidir. En el nivel FÁCIL el enunciado dice el tipo
   y hay una sola respuesta; en el DIFÍCIL no lo dice, y entonces vale
   cualquiera de los retardos que caben sobre la nota dada
   (`Celulas.posibles`), que es lo que arrastra la decisión de Diego del
   15/10.

   Dos maneras de abrirla:

     · con una ficha en la dirección (`#f=…`): las células que pide el
       filtro, una detrás de otra. El filtro no mira el banco —las
       células se GENERAN— y lleva, además de la lección y el tipo:
           celulas: { tipos:[…], tonalidades:['Do M', 'la m', …],
                      dada: 'retardada' | 'real' | 'ambas',
                      nivel: 'facil' | 'dificil' }
           n      : cuántas
     · sin ficha: práctica libre, con los mandos a la vista.

   El envío al cuaderno de resultados todavía no está puesto.
   ===================================================================== */

(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const VOCES = ['alta', 'baja'];

  const estado = {
    celula: null,
    escrito: null,         // { momentos:[{alta,baja}], ligaduras:[{voz,desde}], barra }
    activa: null,          // { momento, voz }
    mal: [],               // casillas en rojo tras corregir
    fallos: [],            // los mensajes de la última corrección
    intentos: 0,
    acertada: false,
    visto: false,          // ¿se ha pedido ver la solución?
    lista: null,           // las células de la ficha, si hay ficha
    k: 0,
    filtro: null
  };

  /* ---------- Avisos ---------- */
  function aviso(txt, ms = 5000) {
    const a = $('#aviso');
    a.textContent = txt; a.hidden = false;
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => { a.hidden = true; }, ms);
  }

  /* ---------- Los mandos de la práctica libre ---------- */
  function montarMandos() {
    const selTipo = $('#tipo');
    selTipo.appendChild(new Option('Mezclados', 'todos'));
    Object.keys(Celulas.TIPOS).forEach(id =>
      selTipo.appendChild(new Option(Celulas.CIFRA_TIPO[id] || id, id)));
    selTipo.value = 'todos';

    const selTon = $('#ton');
    selTon.appendChild(new Option('Todas las del curso', 'todas'));
    Celulas.TONALIDADES.forEach(t =>
      selTon.appendChild(new Option(Teoria.nombreCorto(t), t.tonica + '|' + t.modo)));
    selTon.value = 'C|mayor';

    /* La orquesta de cuerda por defecto: con un sonido sostenido se oye NACER la disonancia
       y resolverse, que es de lo que va el ejercicio (Diego, 14/10/2026). */
    const selInst = $('#inst');
    (Sonido.GRUPOS || []).forEach(gr => {
      const og = document.createElement('optgroup'); og.label = gr;
      Sonido.INSTRUMENTOS.filter(x => x.grupo === gr).forEach(x => og.appendChild(new Option(x.nombre, x.id)));
      selInst.appendChild(og);
    });
    selInst.value = Sonido.INSTRUMENTOS.some(x => x.id === 'cuerda') ? 'cuerda' : Sonido.instrumentoActual();
    Sonido.elegirInstrumento(selInst.value);
    selInst.addEventListener('change', () => { Sonido.parar(); Sonido.elegirInstrumento(selInst.value); });

    [selTipo, selTon, $('#dada'), $('#nivel')].forEach(s => s.addEventListener('change', otra));
  }

  function opcionesLibres() {
    const t = $('#tipo').value;
    const ton = $('#ton').value;
    return {
      n: 1,
      tipos: t === 'todos' ? null : [t],
      tonalidades: ton === 'todas' ? null : [{ tonica: ton.split('|')[0], modo: ton.split('|')[1] }],
      dada: $('#dada').value,
      nivel: $('#nivel').value
    };
  }

  /* ---------- La hoja en blanco: solo la nota que se da ---------- */
  function enBlanco(c) {
    const d = Celulas.dato(c);
    return {
      momentos: c.momentos.map((m, k) => ({
        alta: k === d.momento && d.voz === 'alta' ? m.alta : null,
        baja: k === d.momento && d.voz === 'baja' ? m.baja : null
      })),
      ligaduras: [],
      barra: null
    };
  }
  const dadaDe = c => { const d = Celulas.dato(c); return [{ momento: d.momento, voz: d.voz }]; };
  const esDada = (k, voz) => {
    const d = Celulas.dato(estado.celula);
    return d.momento === k && d.voz === voz;
  };

  /* ---------- Escribir ---------- */

  /* Mover una nota POR GRADOS DE LA ESCALA (2.6). La escalera es la escala natural de la
     tonalidad: subir o bajar es correrse una casilla en ella, de modo que en la menor se pasa
     de la a si y no de la a la♯. Las alteraciones las pone aparte el botón ♯/♮. */
  function mueve(nota, pasos, ton) {
    const esc = Celulas.escalera(ton);
    const i = esc.findIndex(n => Teoria.indice(n) === Teoria.indice(nota));
    const j = Math.min(esc.length - 1, Math.max(0, (i < 0 ? 0 : i) + pasos));
    return { letra: esc[j].letra, alt: esc[j].alt, octava: esc[j].octava };
  }

  // Las casillas atadas a una por ligaduras: una nota ligada es LA MISMA nota
  function atadas(k, voz) {
    const out = [{ momento: k, voz }];
    (estado.escrito.ligaduras || []).forEach(l => {
      if (l.voz !== voz) return;
      if (l.desde === k) out.push({ momento: k + 1, voz });
      if (l.desde + 1 === k) out.push({ momento: l.desde, voz });
    });
    return out;
  }

  function ponNota(k, voz, nota) {
    atadas(k, voz).forEach(c => { estado.escrito.momentos[c.momento][voz] = nota ? Object.assign({}, nota) : null; });
  }

  function mover(pasos) {
    const a = estado.activa;
    if (!a || !estado.celula) return;
    if (esDada(a.momento, a.voz)) { aviso('Esa nota viene dada: es la del enunciado y no se mueve.'); return; }
    const ton = estado.celula.tonalidad;
    const actual = estado.escrito.momentos[a.momento][a.voz];
    /* En una casilla vacía la primera flecha escribe la nota un grado por encima o por debajo
       de LA QUE SE DA. Es un punto de partida neutro —la nota dada la conoce el alumno— y no
       le adelanta nada de la solución. */
    const base = actual || Celulas.dato(estado.celula).nota;
    ponNota(a.momento, a.voz, mueve(base, pasos, ton));
    tras();
  }

  /* ♯/♮ sobre el 6.º y el 7.º grado del menor (Diego, 2.6: «lo decide el alumno, no la
     aplicación»). En el resto de los grados y en el modo mayor no hay nada que decidir. */
  function alterar() {
    const a = estado.activa;
    if (!a || !estado.celula) return;
    if (esDada(a.momento, a.voz)) { aviso('Esa nota viene dada: es la del enunciado y no se altera.'); return; }
    const n = estado.escrito.momentos[a.momento][a.voz];
    if (!n) { aviso('Escribe primero la nota con las flechas.'); return; }
    const ton = estado.celula.tonalidad;
    const g = Teoria.textoGrado(n, ton);
    if (ton.modo !== 'menor' || !['6', '7'].includes(String(g).replace(/[^0-9]/g, ''))) {
      aviso('El ♯ y el ♮ son para el 6.º y el 7.º grado del menor, que es donde la escala cambia al subir y al bajar.');
      return;
    }
    const natural = Celulas.escalera(ton).find(x => Teoria.indice(x) === Teoria.indice(n));
    ponNota(a.momento, a.voz, { letra: n.letra, octava: n.octava, alt: n.alt > natural.alt ? natural.alt : natural.alt + 1 });
    tras();
  }

  function ligar() {
    const a = estado.activa;
    if (!a || !estado.celula) return;
    if (a.momento >= estado.escrito.momentos.length - 1) {
      aviso('La última nota no se liga con nada: no hay nota detrás.'); return;
    }
    const ls = estado.escrito.ligaduras;
    const i = ls.findIndex(l => l.voz === a.voz && l.desde === a.momento);
    if (i >= 0) ls.splice(i, 1);
    else {
      ls.push({ voz: a.voz, desde: a.momento });
      // Ligadas son la misma nota: la de detrás copia a la de delante
      const n = estado.escrito.momentos[a.momento][a.voz];
      if (n) estado.escrito.momentos[a.momento + 1][a.voz] = Object.assign({}, n);
    }
    tras();
  }

  function borrar() {
    const a = estado.activa;
    if (!a || !estado.celula) return;
    if (esDada(a.momento, a.voz)) { aviso('Esa nota viene dada: no se borra.'); return; }
    ponNota(a.momento, a.voz, null);
    tras();
  }

  function barra(k) {
    estado.escrito.barra = estado.escrito.barra === k ? null : k;
    tras();
  }

  // Después de cada cambio: la corrección anterior deja de valer
  function tras() {
    estado.mal = [];
    estado.fallos = [];
    estado.acertada = false;
    pintar();
  }

  /* Moverse de casilla con ← y →: las seis en orden de lectura */
  function andar(paso) {
    const n = estado.escrito.momentos.length;
    const casillas = [];
    for (let k = 0; k < n; k++) VOCES.forEach(v => casillas.push({ momento: k, voz: v }));
    const i = estado.activa
      ? casillas.findIndex(c => c.momento === estado.activa.momento && c.voz === estado.activa.voz) : -1;
    estado.activa = casillas[((i < 0 ? 0 : i + paso) + casillas.length) % casillas.length];
    pintar();
  }

  /* ---------- Corregir (2.7) ---------- */
  function comprobar() {
    const c = estado.celula;
    if (!c) return;
    const faltan = [];
    estado.escrito.momentos.forEach((m, k) => VOCES.forEach(v => { if (!m[v]) faltan.push({ momento: k, voz: v }); }));
    if (faltan.length) {
      estado.mal = faltan;
      estado.fallos = [{ regla: 'incompleta', mensaje: 'Falta alguna nota: la célula tiene seis, tres en cada voz.' }];
      estado.acertada = false;
      pintar();
      return;
    }
    estado.intentos++;
    /* En el nivel DIFÍCIL el enunciado no dice el tipo, de modo que valen todos los retardos
       que caben sobre la nota dada: se prueba con cada uno y se queda el que mejor le salga al
       alumno. Así no se le corrige contra un modelo que él no tenía por qué adivinar. */
    const d = Celulas.dato(c);
    const modelos = Celulas.nivelDe(c) === 'dificil'
      ? Celulas.posibles({ tonalidad: c.tonalidad, dada: c.dada, nota: d.nota, voz: d.voz })
      : [c];
    let mejor = null;
    (modelos.length ? modelos : [c]).forEach(m => {
      const r = Celulas.comprobar(m, estado.escrito);
      const peso = (r.fallos ? r.fallos.length : 9) + (r.diferencias ? r.diferencias.length : 9);
      if (!mejor || r.bien || peso < mejor.peso) mejor = { r, m, peso };
      if (r.bien) mejor = { r, m, peso: -1 };
    });
    const r = mejor.r;
    estado.acertada = !!r.bien;
    estado.fallos = (r.fallos || []).slice();
    /* Si las reglas se cumplen pero no coincide con el modelo, se dice en qué se diferencia:
       es el otro lado del 2.7, donde mandan las dos cosas a la vez. */
    if (!r.bien && !estado.fallos.length && (r.diferencias || []).length) {
      estado.fallos.push({
        regla: 'modelo',
        mensaje: 'No hay ninguna regla rota, pero no es la célula que se pide: mira '
          + r.diferencias.map(x => 'el momento ' + (x.momento + 1) + ' de la voz '
            + (x.voz === 'alta' ? 'superior' : 'inferior')).join(' y ') + '.'
      });
    }
    const casillas = [];
    (r.fallos || []).forEach(f => {
      if (typeof f.momento === 'number') VOCES.forEach(v => casillas.push({ momento: f.momento, voz: v }));
      (f.notas || []).forEach(x => { if (typeof x.momento === 'number') VOCES.forEach(v => casillas.push({ momento: x.momento, voz: v })); });
    });
    (r.diferencias || []).forEach(x => casillas.push({ momento: x.momento, voz: x.voz }));
    estado.mal = estado.acertada ? [] : casillas;
    pintar();
    if (estado.acertada) oir();
  }

  /* ---------- Dibujar ---------- */
  function pintar() {
    const c = estado.celula;
    if (!c) return;
    const d = Celulas.dato(c);
    const dificil = Celulas.nivelDe(c) === 'dificil';
    $('#enunciado').textContent = Celulas.enunciado(c);
    /* EL TIPO SOLO EN EL NIVEL FÁCIL (Diego, 15/10): «en el más fácil se dice el tipo en el
       enunciado. En el más difícil … no se indica —con lo que no se le da ninguna pista al
       alumno». En el difícil, pues, no se escribe en ninguna parte de la pantalla. */
    $('#tipo-pedido').textContent =
      (dificil ? '' : 'Retardo ' + (Celulas.CIFRA_TIPO[c.tipo] || c.tipo) + ' · ')
      + Teoria.nombreTonalidad(c.tonalidad)
      + (estado.lista ? ' · célula ' + (estado.k + 1) + ' de ' + estado.lista.length : '');

    const mio = estado.escrito;
    Reja.dibujar($('#reja'), {
      tonalidad: c.tonalidad,
      modelo: c.momentos,
      momentos: estado.visto ? c.momentos : mio.momentos,
      ligaduras: estado.visto ? c.ligaduras : mio.ligaduras,
      barra: estado.visto ? c.barra : mio.barra,
      dadas: dadaDe(c),
      activa: estado.visto ? null : estado.activa,
      mal: estado.visto ? [] : estado.mal,
      intervalos: true,
      soloLectura: estado.visto,
      titulo: Celulas.enunciado(c),
      alSonar: momento => sonarMomento(momento),
      sonando: estado.sonando
    }, (k, que) => {
      if (estado.visto) return;
      if (que === 'barra') barra(k);
      else { estado.activa = { momento: k, voz: que }; pintar(); }
    });

    pintarMandos();
    pintarMensajes();

    const m = $('#momentos');
    m.hidden = !estado.visto;
    if (estado.visto) {
      const voz = v => (v === 'alta' ? 'la voz superior' : 'la voz inferior');
      m.textContent = 'Preparación ' + c.intervalos[0] + '.ª · percusión ' + c.intervalos[1]
        + '.ª · resolución ' + c.intervalos[2] + '.ª. Se liga ' + voz(c.vozRetardada)
        + ' y resuelve bajando un grado; la nota real está en ' + voz(c.vozReal) + '.'
        + (c.sensible ? ' La resolución lleva la sensible (' + Teoria.nombreEs(Teoria.nota(c.sensible), true) + ').' : '');
      if (dificil) {
        const otras = Celulas.posibles({ tonalidad: c.tonalidad, dada: c.dada, nota: d.nota, voz: d.voz });
        if (otras.length > 1) m.textContent += ' Sin decir el tipo valen ' + otras.length
          + ' retardos con esta misma nota: ' + otras.map(x => Celulas.CIFRA_TIPO[x.tipo] || x.tipo).join(', ') + '.';
      }
    }
    $('#ver').textContent = estado.visto ? 'Volver a lo mío' : 'Ver la solución';
    $('#comprobar').disabled = estado.visto;
    $('#paso').textContent = estado.lista && estado.k + 1 < estado.lista.length
      ? 'Al terminar esta, «Otra célula» pasa a la siguiente de la ficha.' : '';
  }

  function pintarMandos() {
    const a = estado.activa;
    const dice = $('#casilla-dice');
    const hay = !!a && !estado.visto;
    const dada = hay && esDada(a.momento, a.voz);
    dice.textContent = !hay ? 'Pulsa una casilla del pentagrama'
      : 'Momento ' + (a.momento + 1) + ' · voz ' + (a.voz === 'alta' ? 'superior' : 'inferior')
        + (dada ? ' (la nota dada)' : '');
    dice.classList.toggle('puesta', hay && !dada);
    ['subir', 'bajar', 'alterar', 'borrar'].forEach(id => { $('#' + id).disabled = !hay || dada; });
    const puedeLigar = hay && a.momento < estado.escrito.momentos.length - 1;
    $('#ligar').disabled = !puedeLigar;
    $('#ligar').classList.toggle('activo', !!(puedeLigar
      && estado.escrito.ligaduras.some(l => l.voz === a.voz && l.desde === a.momento)));
    $('#mandos-nota').hidden = estado.visto;
    $('#pista-barra').hidden = estado.visto;
  }

  function pintarMensajes() {
    const ul = $('#mensajes');
    ul.textContent = '';
    ul.classList.toggle('bien', estado.acertada);
    if (estado.acertada) {
      ul.hidden = false;
      const li = document.createElement('li');
      li.textContent = 'Bien: la célula cumple las reglas y coincide con la realización.'
        + (estado.intentos > 1 ? ' (en ' + estado.intentos + ' intentos)' : '');
      ul.appendChild(li);
      return;
    }
    if (!estado.fallos.length) { ul.hidden = true; return; }
    ul.hidden = false;
    const dichos = new Set();
    estado.fallos.forEach(f => {
      if (dichos.has(f.mensaje)) return;          // una regla, un mensaje
      dichos.add(f.mensaje);
      const li = document.createElement('li');
      li.textContent = f.mensaje;
      ul.appendChild(li);
    });
  }

  /* ---------- Sonido ---------- */
  function sonando(si) {
    $('#parar').hidden = !si;
    $('#oir').disabled = si;
  }
  // Lo que suena es lo que hay escrito; si falta alguna nota, suena lo que haya
  function loQueSuena() {
    const m = estado.visto ? estado.celula.momentos : estado.escrito.momentos;
    return m.map((x, k) => ({
      notas: [x.baja, x.alta].filter(Boolean),
      segundos: k === 2 ? 1.9 : 0.95, momento: k
    })).filter(x => x.notas.length);
  }
  function oir() {
    if (!estado.celula) return;
    const items = loQueSuena();
    if (!items.length) { aviso('Todavía no hay nada escrito que oír.'); return; }
    Sonido.parar();
    sonando(true);
    Sonido.secuencia(items, () => sonando(false));
  }
  function sonarMomento(k) {
    if (!estado.celula) return;
    const m = (estado.visto ? estado.celula.momentos : estado.escrito.momentos)[k];
    const notas = [m.baja, m.alta].filter(Boolean);
    if (!notas.length) { aviso('En ese momento todavía no hay ninguna nota.'); return; }
    Sonido.parar();
    sonando(true);
    Sonido.secuencia([{ notas, segundos: 1.4 }], () => sonando(false));
  }

  /* ---------- Pasar de célula ---------- */
  function empezar(c) {
    estado.celula = c;
    estado.escrito = enBlanco(c);
    estado.activa = null;
    estado.mal = []; estado.fallos = []; estado.intentos = 0;
    estado.acertada = false; estado.visto = false;
    pintar();
  }
  function otra() {
    Sonido.parar(); sonando(false);
    if (estado.lista) {
      estado.k = (estado.k + 1) % estado.lista.length;
      empezar(estado.lista[estado.k]);
      return;
    }
    const c = Celulas.elegir(opcionesLibres())[0];
    if (!c) { aviso('Con lo que has pedido no sale ninguna célula. Prueba con otro tipo o otra tonalidad.'); return; }
    empezar(c);
  }

  /* ---------- La ficha ---------- */
  function ficha() {
    const h = new URLSearchParams(location.hash.replace(/^#/, ''));
    if (!h.has('f')) return null;
    let filtro = null;
    try { filtro = Banco.decodificar(h.get('f')); } catch (e) {
      aviso('No se ha podido leer la ficha de la dirección.'); return null;
    }
    if (!filtro || filtro.modo !== 'contrapunto') {
      aviso('Esa ficha no es de contrapunto.'); return null;
    }
    const op = filtro.celulas || {};
    const tons = (op.tonalidades || []).map(t => {
      try { return typeof t === 'string' ? Teoria.tonalidadDesdeTexto(t) : t; } catch (e) { return null; }
    }).filter(Boolean);
    const lista = Celulas.elegir({
      n: filtro.n || 8,
      tipos: op.tipos && op.tipos.length ? op.tipos : null,
      tonalidades: tons.length ? tons : null,
      dada: op.dada,
      nivel: op.nivel
    });
    if (!lista.length) { aviso('La ficha no ha podido sacar ninguna célula.'); return null; }
    return { filtro, lista };
  }

  /* ---------- El teclado ---------- */
  function teclado(e) {
    if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'Escape') { Sonido.parar(); sonando(false); return; }
    if (estado.visto) return;
    const t = {
      ArrowUp: () => mover(+1), ArrowDown: () => mover(-1),
      ArrowRight: () => andar(+1), ArrowLeft: () => andar(-1),
      l: ligar, L: ligar, s: alterar, S: alterar,
      Backspace: borrar, Delete: borrar, Enter: comprobar
    }[e.key];
    if (!t) return;
    e.preventDefault();
    t();
  }

  /* ---------- Arranque ---------- */
  function arrancar() {
    montarMandos();
    const f = ficha();
    let primera;
    if (f) {
      estado.filtro = f.filtro;
      estado.lista = f.lista;
      estado.k = 0;
      primera = f.lista[0];
      $('#mandos').hidden = true;                 // en una ficha no se elige: lo elige la ficha
      const lec = f.filtro.leccion || 'Co-1';
      $('#leccion').textContent = f.filtro.titulo || Banco.rotuloLeccion(lec, Banco.LECCIONES[lec] || '');
    } else {
      $('#leccion').textContent = Banco.rotuloLeccion('Co-1', Banco.LECCIONES['Co-1'] || '') + ' · práctica libre';
      primera = Celulas.elegir(opcionesLibres())[0];
    }
    $('#subir').addEventListener('click', () => mover(+1));
    $('#bajar').addEventListener('click', () => mover(-1));
    $('#alterar').addEventListener('click', alterar);
    $('#ligar').addEventListener('click', ligar);
    $('#borrar').addEventListener('click', borrar);
    $('#comprobar').addEventListener('click', comprobar);
    $('#oir').addEventListener('click', oir);
    $('#parar').addEventListener('click', () => { Sonido.parar(); sonando(false); });
    $('#ver').addEventListener('click', () => { estado.visto = !estado.visto; Sonido.parar(); sonando(false); pintar(); });
    $('#otra').addEventListener('click', otra);
    document.addEventListener('keydown', teclado);
    /* Si cambia la ficha de la dirección sin salir de la página —el alumno pulsa otro
       enlace de Classroom estando ya aquí—, el navegador NO vuelve a cargar: solo cambia la
       almohadilla. Sin esto, la página seguía con la ficha anterior y el alumno habría hecho
       la de la semana pasada. Nada de esta pantalla toca la dirección, así que recargar es
       seguro. */
    window.addEventListener('hashchange', () => location.reload());
    empezar(primera);
  }

  /* Una ventana a las tripas PARA LAS COMPROBACIONES, como `Sonido.contextoAudio`: la prueba
     en navegador escribe la célula entera pulsando los mandos de verdad, y para saber cuándo
     ha llegado a la nota que busca necesita leer lo escrito. Solo lee. */
  window.Contrapunto = {
    celula: () => estado.celula,
    escrito: () => estado.escrito,
    activa: () => estado.activa,
    acertada: () => estado.acertada,
    intentos: () => estado.intentos
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
