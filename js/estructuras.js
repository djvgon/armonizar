/* ------------------------------------------------------------------------------------
   Estructuras armónicas del tema · la ventana de ayuda

   El mismo cuadro que encabeza la hoja de ejercicios en papel, pero aquí dentro: las
   estructuras con las que se resuelven los ejercicios de la lección, y un botón para
   escucharlas. Se abre desde el ejercicio y se puede dejar abierta al lado mientras se
   trabaja (decisión de Diego, 27/9/2026).

   No calcula nada: `prototipos.json` trae las cuatro voces ya realizadas por el mismo
   motor de la aplicación y ya pasadas por su pauta de corrección. Aquí solo se dibujan,
   con la misma partitura que ve el alumno en el ejercicio.
   ------------------------------------------------------------------------------------ */
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const SEG_POR_NEGRA = 0.6;
  const CLAVE_TEMA = 'armonizar.estructuras.tema';

  let datos = null;
  let sonando = null;          // el fragmento que suena ahora, para poder pararlo

  /* ---------- Datos ---------- */

  async function cargar() {
    const base = location.href.replace(/[^/]*$/, '');
    const r = await fetch(base + 'prototipos.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('el archivo prototipos.json no está en el servidor');
    datos = await r.json();
  }

  const temas = () => [...new Set(datos.prototipos.map(p => p.tema))].sort((a, b) => a - b);

  /* Por esquema funcional y, dentro, un renglón por estructura: el mismo orden que en
     el papel, y el mismo que tiene el archivo. */
  function renglones(tema) {
    const fuera = [], porEsquema = new Map(), porGrupo = new Map();
    datos.prototipos.filter(p => p.tema === tema).forEach(p => {
      const e = p.esquema || '';
      if (!porEsquema.has(e)) { porEsquema.set(e, []); fuera.push([e, porEsquema.get(e)]); }
      const clave = e + '\u0000' + p.grupo;
      if (!porGrupo.has(clave)) { porGrupo.set(clave, []); porEsquema.get(e).push([p.grupo, porGrupo.get(clave)]); }
      porGrupo.get(clave).push(p);
    });
    return fuera;
  }

  /* ---------- De un prototipo a lo que la partitura sabe dibujar ---------- */

  function ejercicioDe(p) {
    const ej = { tonalidad: p.ton, compas: p.compas, compases: p.compases };
    if (p.modulaciones) {
      ej.modulaciones = p.modulaciones.map(m => ({
        nota: m.nota, tonalidad: { tonica: m.tonica, modo: m.modo } }));
    }
    /* La cifra de cada acorde, en la forma en que la espera `Ejercicios`: hace falta para
       poder leer el ACORDE COMÚN en las dos tonalidades (véase `comunes`). */
    ej.respuestas = p.cifras.map(c => [c]);
    return ej;
  }

  /* ---------- El acorde común (Diego, 27/9/2026) ----------
     En una modulación diatónica la bisagra es un acorde que pertenece a las DOS
     tonalidades: el VI de Do que en Sol es el II. Eso es lo que hay que ver, y es tan de la
     música clásica como del jazz. Se dibuja con sus dos lecturas apiladas —grado y función
     en el tono de partida arriba, en el de llegada abajo— unidas por las dos barras
     verticales que ya sabe trazar la partitura (decisión 83 y 95).

     Aquí no se calcula nada nuevo: se le preguntan al propio motor de la aplicación, que es
     quien sabe leer un acorde en una tonalidad dada. Si el acorde no fuera común a las dos
     —una modulación cromática—, no se dobla y se queda con su lectura única. */
  function comunes(p, ej) {
    const fuera = [];
    (p.modulaciones || []).forEach(m => {
      const i = m.nota;
      if (!(i > 0 && i < p.bajos.length)) return;
      try {
        const tonAntes = Ejercicios.tonalidadAntes(ej, i);
        const par = (Ejercicios.parejasEn(ej, i, tonAntes) || [])[0];
        if (!par || !par.romano) return;
        fuera[i] = { romano: par.romano, funcion: Ejercicios.funcionModeloEn(ej, i, tonAntes) || '' };
      } catch (e) { /* si no se deja leer en el tono anterior, no es común */ }
    });
    return fuera;
  }

  function estadoDe(p, ej) {
    const n = p.bajos.length;
    const vacio = v => new Array(n).fill(v);
    const comun = comunes(p, ej || ejercicioDe(p));
    const romanos = (p.romanos || vacio(null)).slice();
    const romanos2 = vacio(null);
    const dobles = vacio(false);
    const funciones = Array.isArray(p.funciones) ? p.funciones.slice() : null;
    const funciones2 = vacio(null);
    comun.forEach((c, i) => {
      if (!c) return;
      dobles[i] = true;
      romanos2[i] = romanos[i];            // abajo, el grado en la tonalidad NUEVA
      romanos[i] = c.romano;               // arriba, el de la tonalidad de partida
      if (funciones) { funciones2[i] = funciones[i]; funciones[i] = c.funcion; }
    });
    return {
      respuestas: p.cifras.slice(),        // la cifra de cada acorde, ya puesta
      romanos, romanos2, dobles,
      /* La tonalidad va DEBAJO, en su propia banda —la última, bajo la función—, no
         encima del pentagrama: ahí arriba va el análisis motívico, melódico y formal
         (Diego, 27/9/2026). La aplicación ya tiene esa fila hecha (decisión 106). */
      etiquetas: [],
      /* Debajo de la cifra, el grado de la fundamental y la función tonal: las tres
         lecturas del mismo acorde, como en el ejercicio (Diego, 27/9/2026). */
      pedirRomano: Array.isArray(p.romanos),
      activa: -1, campo: 'cifra', corregido: false, resultados: null,
      soloLectura: true,
      realizacion: p.voces.map(v => v.map(x => Teoria.nota(x))),
      gradosBajo: true,                    // el circulito del grado sobre el bajo
      /* Prueba de los símbolos de Berklee: flecha de la dominante que baja una quinta y
         corchete del II emparentado con ella (Diego, 27/9/2026). */
      marcasBerklee: true,
      filaTonalidad: {
        visible: true, editable: false,
        celdas: (() => {
          const c = vacio(null).map(() => ({}));
          c[0] = { texto: Teoria.nombreCorto(p.ton), clase: 'dada', fija: true };
          (p.modulaciones || []).forEach(m => {
            if (m.nota >= 0 && m.nota < n) {
              c[m.nota] = { texto: Teoria.nombreCorto({ tonica: m.tonica, modo: m.modo }),
                            clase: 'dada', fija: true };
            }
          });
          return c;
        })()
      },
      filaFunciones: funciones ? {
        visible: true, editable: false,
        celdas: funciones.map(t => ({ texto: t || '', clase: 'dada', fija: true })),
        celdas2: funciones2.map(t => (t ? { texto: t, clase: 'dada', fija: true } : null)),
        dobles: dobles.slice()
      } : null
    };
  }

  /* ---------- Sonar ---------- */

  const conBajoDoblado = (bajo, voces) =>
    [{ letra: bajo.letra, alt: bajo.alt, octava: bajo.octava - 1 }, bajo, ...voces];

  function parar() {
    Sonido.parar();
    if (sonando) { sonando.classList.remove('sonando'); sonando = null; }
  }

  function tocar(p, boton) {
    if (sonando === boton) { parar(); return; }
    parar();
    const items = p.bajos.map((b, i) => ({
      notas: conBajoDoblado(Teoria.nota(b), p.voces[i].map(x => Teoria.nota(x))),
      segundos: SEG_POR_NEGRA * p.dur[i]
    }));
    try {
      Sonido.secuencia(items, () => { if (sonando === boton) { boton.classList.remove('sonando'); sonando = null; } });
      boton.classList.add('sonando');
      sonando = boton;
    } catch (e) {
      aviso('No se ha podido reproducir el sonido en este navegador: ' + e.message);
    }
  }

  /* ---------- Pintar ---------- */

  function el(etiqueta, clase, texto) {
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function pieza(p) {
    const caja = el('div', 'pieza');
    caja.dataset.compases = String((p.compases || []).length);   // decide cuántos caben por renglón
    /* El botón va ENCIMA y a la izquierda, donde empieza el fragmento: así se pulsa
       mirando el primer acorde y no hay que bajar la vista (Diego, 27/9/2026). */
    const cabeza = el('div', 'cabeza-pieza');
    const btn = el('button', 'btn-sonar');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Escuchar esta estructura');
    btn.innerHTML = '<span aria-hidden="true">▶</span> Escuchar';
    btn.addEventListener('click', () => tocar(p, btn));
    cabeza.appendChild(btn);
    caja.appendChild(cabeza);

    const pent = el('div', 'pent');
    caja.appendChild(pent);
    const ej = ejercicioDe(p);
    Partitura.dibujar(pent, ej, estadoDe(p, ej), () => {});

    if (p.variante) {
      const pie = el('div', 'pie-pieza');
      pie.appendChild(el('span', 'var', p.variante));
      caja.appendChild(pie);
    }
    return caja;
  }

  function pintar(tema) {
    parar();
    const titulo = datos.temas && datos.temas[tema];
    $('#titulo').textContent = 'Tema ' + tema + (titulo ? ' \u00b7 ' + titulo : '');
    const cont = $('#cuadro');
    cont.textContent = '';
    renglones(tema).forEach(([esquema, grupos]) => {
      if (esquema) {
        const banda = el('div', 'esquema');
        banda.innerHTML = 'Esquema <b></b>';
        banda.querySelector('b').textContent = esquema;
        cont.appendChild(banda);
      }
      grupos.forEach(([estructura, piezas]) => {
        const r = el('div', 'renglon');
        r.appendChild(el('div', 'estructura', estructura));
        const caja = el('div', 'piezas');
        piezas.forEach(p => caja.appendChild(pieza(p)));
        r.appendChild(caja);
        cont.appendChild(r);
      });
    });
    igualarTamano();
    try { localStorage.setItem(CLAVE_TEMA, String(tema)); } catch (e) { /* sin almacenamiento */ }
  }

  /* ---------- Todos los fragmentos, del mismo tamaño (Diego, 27/9/2026) ----------
     Antes cada fragmento se dibujaba a su tamaño natural y el navegador encogía solo los
     que no cabían: uno de dos compases salía con la música y las casillas más grandes que
     uno de cuatro, lo que es inadmisible en un cuadro que se mira de un golpe.

     Ahora manda UNA escala para TODO —no solo dentro de un tema, sino entre temas: un
     fragmento no es más música que otro, y cambiar de lección no puede cambiar el tamaño de
     la música (Diego, 27/9/2026)—. Se calcula una vez, midiendo los cincuenta y nueve
     prototipos, y es la mayor con la que cabe en el renglón el MÁS ANCHO de todos (el de
     ocho compases del tema 13), nunca mayor que el tamaño natural.

     Y hay una segunda condición: los fragmentos BREVES de una misma estructura tienen que
     caber en el MISMO renglón, porque son variantes de lo mismo y separarlos rompe la
     comparación (Diego, 27/9/2026). Así que la escala se baja, si hace falta, hasta que
     cualquier grupo de hasta tres fragmentos cortos quepa entero de una tirada. Los grupos
     de cuatro o cinco, y los que llevan un fragmento largo, no caben de ninguna manera a un
     tamaño legible: esos piden la otra solución —un solo sistema con dobles barras, como en
     el papel—, que aún está por hacer. */
  const HUECO = 20;                                   // el mismo que el gap de .piezas
  const CORTO = 4;                                    // «breve» = hasta cuatro compases
  let medidos = null;                                 // ancho en unidades de CADA prototipo

  /* Los anchos se miden una sola vez, dibujando cada prototipo en un cajón suelto que no
     llega a la página: solo hace falta el viewBox, no el trazado en pantalla. */
  function medirTodos() {
    if (medidos) return medidos;
    const cajon = document.createElement('div');
    medidos = datos.prototipos.map(p => {
      let u = 0;
      try {
        const ej = ejercicioDe(p);
        Partitura.dibujar(cajon, ej, estadoDe(p, ej), () => {});
        const s = cajon.querySelector('svg');
        u = s ? Number((s.getAttribute('viewBox') || '0 0 0 0').split(/\s+/)[2]) || 0 : 0;
      } catch (e) { u = 0; }
      return { u, c: (p.compases || []).length || 1,
               grupo: p.tema + '\u0000' + (p.esquema || '') + '\u0000' + p.grupo };
    }).filter(m => m.u > 0);
    return medidos;
  }

  /* La escala común: la mayor (y nunca más que el tamaño natural) con la que cabe el
     fragmento más ancho y con la que cada grupo de hasta tres fragmentos breves cabe
     entero en su renglón. */
  function escalaComun(W) {
    const m = medirTodos();
    if (!m.length || W <= 0) return 1;
    let e = W / Math.max(...m.map(x => x.u));
    const grupos = new Map();
    m.forEach(x => { if (!grupos.has(x.grupo)) grupos.set(x.grupo, []); grupos.get(x.grupo).push(x); });
    grupos.forEach(g => {
      if (g.length < 2 || g.length > 3 || g.some(x => x.c > CORTO)) return;
      const suma = g.reduce((s, x) => s + x.u, 0);
      e = Math.min(e, (W - (g.length - 1) * HUECO) / suma);
    });
    return Math.min(1, e);
  }

  function igualarTamano() {
    const cont = $('#cuadro');
    const fila = cont.querySelector('.piezas');
    // El ancho útil es el de la fila de fragmentos, no el del cuadro (que incluye su margen)
    const W = (fila ? fila.clientWidth : cont.clientWidth) - 4;   // un pelo de holgura
    const escala = escalaComun(W);
    if (!escala) return;
    cont.querySelectorAll('.pieza').forEach(caja => {
      const s = caja.querySelector('.pent svg');
      if (!s) return;
      const u = Number((s.getAttribute('viewBox') || '0 0 0 0').split(/\s+/)[2]) || 0;
      if (!u) return;
      const ancho = Math.round(u * escala);
      s.setAttribute('width', ancho);
      caja.style.width = ancho + 'px';
    });
  }

  function aviso(texto) {
    const a = $('#aviso');
    a.textContent = texto;
    a.hidden = false;
  }

  /* ---------- Arranque ----------
     El tema puede venir en la dirección (`?tema=9`, que es como lo abre el ejercicio),
     y si no, se recuerda el último que se miró. */

  function temaPedido() {
    const enLaUrl = parseInt(new URLSearchParams(location.search).get('tema'), 10);
    if (!isNaN(enLaUrl)) return enLaUrl;
    try { const g = parseInt(localStorage.getItem(CLAVE_TEMA), 10); if (!isNaN(g)) return g; } catch (e) { /* sin almacenamiento */ }
    return null;
  }

  async function arrancar() {
    try {
      await cargar();
    } catch (e) {
      aviso('No se han podido leer las estructuras (prototipos.json): ' + e.message);
      return;
    }
    const lista = temas();
    const sel = $('#tema');
    lista.forEach(t => {
      const o = document.createElement('option');
      o.value = String(t);
      o.textContent = 'Tema ' + t + (datos.temas && datos.temas[t] ? ' \u00b7 ' + datos.temas[t] : '');
      sel.appendChild(o);
    });
    const pedido = temaPedido();
    const inicial = lista.includes(pedido) ? pedido : lista[0];
    sel.value = String(inicial);
    sel.addEventListener('change', () => pintar(parseInt(sel.value, 10)));
    volver();
    pintar(inicial);
    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });
    // Al cambiar el ancho de la ventana, la escala común se recalcula
    let esperando = null;
    window.addEventListener('resize', () => { clearTimeout(esperando); esperando = setTimeout(igualarTamano, 120); });
    vigilarActividad();
  }

  /* ---------- La señal de actividad (Diego, 27/9/2026) ----------
     El tiempo de trabajo del alumno tiene que seguir corriendo mientras lee aquí, pero
     no mientras esta ventana está abierta y olvidada. Así que se avisa a la ventana del
     ejercicio —por el almacenamiento del navegador, que las dos comparten— solo cuando
     esta tiene el foco y se ha tocado algo en el último minuto. Esta ventana es de
     LEER, por eso el margen es mayor que los treinta segundos del ejercicio.

     La señal es un sello de tiempo que caduca en un par de segundos: si esta ventana se
     cierra, pierde el foco o se queda quieta, el reloj del ejercicio se para solo. */
  /* ---- Volver a la práctica (Diego, 27/9/2026) ----
     Esta ventana la abre el ejercicio, así que lo natural es devolverle el foco y cerrarse:
     el alumno vuelve a donde estaba, con su ejercicio a medio hacer. Si se ha llegado aquí
     por la dirección —sin ventana que la abriera—, se va a la aplicación por las buenas. */
  function volver() {
    const btn = $('#btn-volver');
    if (!btn) return;
    btn.addEventListener('click', () => {
      parar();
      let abierta = false;
      try { abierta = !!window.opener && !window.opener.closed; } catch (e) { abierta = false; }
      if (!abierta) { location.href = 'index.html'; return; }
      try { window.opener.focus(); } catch (e) { /* el navegador puede negarse */ }
      window.close();
      // Si el navegador no deja cerrarla (pestaña abierta a mano), que no se quede colgada
      setTimeout(() => { if (!window.closed) location.href = 'index.html'; }, 300);
    });
  }

  const MARGEN_MS = 60000;
  const CLAVE_ACTIVA = 'armonizar.ayuda.activa';
  let ultimaAqui = Date.now();

  function vigilarActividad() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev =>
      document.addEventListener(ev, () => { ultimaAqui = Date.now(); }, { passive: true }));
    setInterval(() => {
      const conFoco = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
      if (document.hidden || !conFoco || (Date.now() - ultimaAqui) >= MARGEN_MS) return;
      try { localStorage.setItem(CLAVE_ACTIVA, String(Date.now())); } catch (e) { /* sin almacenamiento */ }
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', arrancar);
})();
