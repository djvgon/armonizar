/* =====================================================================
   contrapunto.js — La pantalla del tipo de ejercicio «Contrapunto»:
   el retardo a dos voces (lección Co-1).

   Hoy ENSEÑA la célula: el enunciado que escribió Diego, la nota que se
   da, la realización modelo y el sonido. Lo que todavía no hace es
   dejar ESCRIBIR: eso es la reja de escritura, el paso siguiente del
   piloto (2.5 y 2.6 del documento de contrapunto). `reja.js` ya tiene
   las casillas pulsables y las recibe por `alPulsar`; aquí se dibuja
   con `soloLectura`.

   Dos maneras de abrirla:

     · con una ficha en la dirección (`#f=…`): las células que pide el
       filtro, una detrás de otra. El filtro del contrapunto no mira el
       banco —las células se GENERAN— y lleva, además de la lección y el
       tipo de ejercicio:
           celulas: { tipos:[…], tonalidades:['Do M', 'la m', …],
                      dada: 'retardada' | 'real' | 'ambas' }
           n      : cuántas
     · sin ficha: práctica libre, con los mandos a la vista.

   El envío al cuaderno de resultados no está puesto todavía: va con la
   corrección, que es lo que da una nota que enviar.
   ===================================================================== */

(() => {
  'use strict';
  const $ = s => document.querySelector(s);

  const estado = {
    celula: null,
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

  /* ---------- Dibujar ---------- */
  function pintar() {
    const c = estado.celula;
    if (!c) return;
    const d = Celulas.dato(c);
    $('#enunciado').textContent = Celulas.enunciado(c);
    /* EL TIPO SOLO EN EL NIVEL FÁCIL (Diego, 15/10): «en el más fácil se dice el tipo en el
       enunciado. En el más difícil … no se indica —con lo que no se le da ninguna pista al
       alumno». En el difícil, pues, no se escribe en ninguna parte de la pantalla: decirlo
       aquí debajo sería la pista que él quiere quitar. */
    const pedido = $('#tipo-pedido');
    const dificil = Celulas.nivelDe(c) === 'dificil';
    pedido.textContent = (dificil ? '' : 'Retardo ' + (Celulas.CIFRA_TIPO[c.tipo] || c.tipo) + ' · ')
      + Teoria.nombreTonalidad(c.tonalidad)
      + (estado.lista ? ' · célula ' + (estado.k + 1) + ' de ' + estado.lista.length : '');

    Reja.dibujar($('#reja'), {
      tonalidad: c.tonalidad,
      modelo: c.momentos,
      momentos: estado.visto ? c.momentos : soloLaDada(c, d),
      ligaduras: estado.visto ? c.ligaduras : [],
      barra: estado.visto ? c.barra : null,
      dadas: [{ momento: d.momento, voz: d.voz }],
      intervalos: estado.visto,
      soloLectura: true,
      titulo: Celulas.enunciado(c) + ' ' + Celulas.comoTexto(c),
      alSonar: estado.visto ? momento => sonarMomento(momento) : null
    });

    const m = $('#momentos');
    m.hidden = !estado.visto;
    if (estado.visto) {
      const voz = v => (v === 'alta' ? 'la voz superior' : 'la voz inferior');
      m.innerHTML = '';
      const frase = document.createElement('span');
      frase.textContent = 'Preparación ' + c.intervalos[0] + '.ª · percusión ' + c.intervalos[1]
        + '.ª · resolución ' + c.intervalos[2] + '.ª. Se liga ' + voz(c.vozRetardada)
        + ' y resuelve bajando un grado; la nota real está en ' + voz(c.vozReal) + '.';
      m.appendChild(frase);
      if (c.sensible) {
        const s = document.createElement('span');
        s.textContent = ' La resolución lleva la sensible (' + Teoria.nombreEs(Teoria.nota(c.sensible), true) + ').';
        m.appendChild(s);
      }
      /* Sin decir el tipo, la misma nota admite varios retardos: se dice cuántos, para que no
         parezca que la solución que se enseña es la única. */
      if (dificil) {
        const otras = Celulas.posibles({ tonalidad: c.tonalidad, dada: c.dada, nota: d.nota });
        if (otras.length > 1) {
          const s = document.createElement('span');
          s.textContent = ' Sin decir el tipo valen ' + otras.length + ' retardos con esta misma nota: '
            + otras.map(x => Celulas.CIFRA_TIPO[x.tipo] || x.tipo).join(', ') + '.';
          m.appendChild(s);
        }
      }
    }
    $('#ver').textContent = estado.visto ? 'Ocultar la solución' : 'Ver la solución';
    $('#paso').textContent = estado.lista && estado.k + 1 < estado.lista.length
      ? 'Al terminar esta, «Otra célula» pasa a la siguiente de la ficha.' : '';
  }

  /* Solo la casilla que viene escrita; las otras cinco, vacías */
  function soloLaDada(c, d) {
    return c.momentos.map((m, k) => ({
      alta: k === d.momento && d.voz === 'alta' ? m.alta : null,
      baja: k === d.momento && d.voz === 'baja' ? m.baja : null
    }));
  }

  /* ---------- Sonido ---------- */
  function sonando(si) {
    $('#parar').hidden = !si;
    $('#oir').disabled = si;
  }
  function oir() {
    const c = estado.celula;
    if (!c) return;
    Sonido.parar();
    sonando(true);
    Sonido.secuencia(Celulas.aSonido(c, 0.95), () => sonando(false));
  }
  function sonarMomento(k) {
    const c = estado.celula;
    if (!c) return;
    Sonido.parar();
    sonando(true);
    Sonido.secuencia([{ notas: [c.momentos[k].baja, c.momentos[k].alta], segundos: 1.4 }], () => sonando(false));
  }

  /* ---------- Pasar de célula ---------- */
  function otra() {
    Sonido.parar(); sonando(false);
    estado.visto = false;
    if (estado.lista) {
      estado.k = (estado.k + 1) % estado.lista.length;
      estado.celula = estado.lista[estado.k];
    } else {
      const c = Celulas.elegir(opcionesLibres())[0];
      if (!c) { aviso('Con lo que has pedido no sale ninguna célula. Prueba con otro tipo o otra tonalidad.'); return; }
      estado.celula = c;
    }
    pintar();
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

  /* ---------- Arranque ---------- */
  function arrancar() {
    montarMandos();
    const f = ficha();
    if (f) {
      estado.filtro = f.filtro;
      estado.lista = f.lista;
      estado.k = 0;
      estado.celula = f.lista[0];
      $('#mandos').hidden = true;                 // en una ficha no se elige: lo elige la ficha
      const lec = f.filtro.leccion || 'Co-1';
      $('#leccion').textContent = f.filtro.titulo || Banco.rotuloLeccion(lec, Banco.LECCIONES[lec] || '');
    } else {
      $('#leccion').textContent = Banco.rotuloLeccion('Co-1', Banco.LECCIONES['Co-1'] || '') + ' · práctica libre';
      estado.celula = Celulas.elegir(opcionesLibres())[0];
    }
    $('#oir').addEventListener('click', oir);
    $('#parar').addEventListener('click', () => { Sonido.parar(); sonando(false); });
    $('#ver').addEventListener('click', () => { estado.visto = !estado.visto; pintar(); });
    $('#otra').addEventListener('click', otra);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { Sonido.parar(); sonando(false); } });
    /* Si cambia la ficha de la dirección sin salir de la página —el alumno pulsa otro
       enlace de Classroom estando ya aquí—, el navegador NO vuelve a cargar: solo cambia la
       almohadilla. Sin esto, la página seguía con la ficha anterior y el alumno habría hecho
       la de la semana pasada. Nada de esta pantalla toca la dirección, así que recargar es
       seguro. */
    window.addEventListener('hashchange', () => location.reload());
    pintar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
