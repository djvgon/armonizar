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
    return ej;
  }

  function estadoDe(p) {
    const n = p.bajos.length;
    const vacio = v => new Array(n).fill(v);
    return {
      respuestas: p.cifras.slice(),        // la cifra de cada acorde, ya puesta
      romanos: (p.romanos || vacio(null)).slice(), romanos2: vacio(null), dobles: vacio(false),
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
      filaFunciones: Array.isArray(p.funciones) ? {
        visible: true, editable: false,
        celdas: p.funciones.map(t => ({ texto: t || '', clase: 'dada', fija: true })),
        celdas2: vacio(null), dobles: vacio(false)
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
    /* Los fragmentos cortos se encogen para que quepan dos por renglón; los largos se
       quedan con su ancho y ocupan el renglón entero, que si no se vuelven ilegibles. */
    if ((p.compases || []).length > 4) caja.classList.add('larga');
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
    Partitura.dibujar(pent, ejercicioDe(p), estadoDe(p), () => {});

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
    try { localStorage.setItem(CLAVE_TEMA, String(tema)); } catch (e) { /* sin almacenamiento */ }
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
    pintar(inicial);
    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });
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
