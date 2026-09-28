/* =====================================================================
   realizacion.js — Realización a cuatro voces (bajo + tres voces
   superiores) de un bajo cifrado, según las tres «posizioni» de Furno.

   Uso:
     Realizacion.trio(id, bajo, ton)            → [n1, n2, n3] voces superiores en
                                                  posición cerrada, de grave a agudo,
                                                  justo encima del bajo (rotación 0)
     Realizacion.posicion(trio, r)              → rotación r (0, 1, 2) llevada al
                                                  registro de la clave de sol
     Realizacion.realizar(ej, cifras, opciones) → { acordes:[[n1,n2,n3]|null…],
                                                    paralelas:[{i, tipo, voces}] }
        cifras   : id de cifra por nota (o null si aún no hay)
        opciones : { modo:'auto'|'rigida', rotacion:0|1|2 }
                   'auto'   : la rotación elegida se aplica al PRIMER acorde
                              (la «posizione» de Furno) y los siguientes se
                              conducen buscando, entre todas las disposiciones
                              correctas de cada acorde, la serie de menor coste
                              (programación dinámica sobre toda la frase).
                   'rigida' : la misma rotación en todos los acordes; sirve
                              para mostrar por qué aparecen paralelas.
     Realizacion.cadencia(ton, bajoRef)         → acordes de I–IV–V7–I para situar
                                                  la tonalidad: [{bajo, voces}]
     Con ej.modulaciones, cada acorde se realiza en la tonalidad que rige en su
     nota (sensible, séptima y tónica final son las de cada tramo).
     Melodía de soprano: opciones.bajos = [nota|null…] (el bajo deducido de cada
     respuesta) y opciones.sopranos = [nota…] (la melodía): la voz superior de cada
     acorde es la nota de la melodía y el bajo, el deducido; la posición inicial
     no interviene (la fija la melodía).
     Realizacion.acordeConSoprano(id, bajo, ton, soprano) → voces de un acorde suelto
     con esa nota en la soprano (para hacerlo sonar al elegir).

   Reglas de realización:
     · Las voces superiores son los intervalos de la cifra sobre el bajo;
       cuando la cifra solo da dos (5/3, 6, 6/4) se dobla una nota: la del
       bajo, como indica Furno («l'8ª si può dare a tutte le corde»), salvo
       que el bajo sea la sensible, que nunca se dobla; entonces se dobla la
       fundamental.
     · La sensible (de la tonalidad, o la tercera de cualquier acorde de
       dominante, también las secundarias) no se duplica en ningún acorde.
     · Posición 1 = octava arriba (para 5/3: 3–5–8), posición 2 = décima
       arriba (5–8–3), posición 3 = quinta arriba (8–3–5). Para los acordes
       de séptima son las tres rotaciones del mismo trío.
     · La voz superior se coloca entre sol4 y la5, y las tres voces
       superiores nunca abarcan más de una novena, para que la mano derecha
       pueda tocarlas.
     · Conducción automática (modo 'auto'): cada acorde puede disponerse de
       muchas maneras (qué nota va en cada voz, en qué octava, con el bajo
       doblado o, en los acordes de séptima en estado fundamental, sin la
       quinta). Se elige la serie de disposiciones de menor coste, donde
       cuesta: el movimiento de las voces, las quintas y octavas paralelas
       (mucho), la séptima que no baja de grado (mucho: nunca sube a la
       quinta), la sensible en la soprano que no sube a la tónica, los
       acordes incompletos, los unísonos, la soprano fuera de registro y,
       en el acorde final, la soprano que no acaba en la tónica (si no
       puede, en la tercera; la quinta es lo último).
     · Las paralelas se detectan entre cualquier par de las cuatro voces:
       misma quinta justa u octava en dos acordes seguidos con ambas voces
       en movimiento.
     · Ninguna de las tres voces superiores canta una SEGUNDA AUMENTADA (dos
       notas seguidas a una letra de distancia y tres semitonos): es el paso
       del 6.º grado a la sensible del modo menor, que la escala menor
       melódica existe para evitar. El bajo queda fuera: lo da el fragmento.
   ===================================================================== */

const Realizacion = (() => {

  const SOP_MIN = 67, SOP_MAX = 81;        // sol4 … la5, registro preferido de la voz superior
  const SOP_MIN_DURO = 62, SOP_MAX_DURO = 86;
  /* EL TECHO DE LA SOPRANO (Diego, 28/9/2026): la nota más alta que se le escribe es el
     la5 —el la4 del índice español, 880 Hz—, que es el tope clásico de la soprano en la
     escritura a cuatro voces. No es un coste: es un filtro. Solo se pasa de ahí si con el
     techo no hay NINGUNA disposición posible para el acorde, y entonces el coste de
     registro que ya existía lo relega igualmente al último lugar. */
  const SOP_TECHO = 81;
  /* Abertura de las tres voces superiores: de la soprano al tenor, como mucho una OCTAVA,
     para que la mano derecha las toque de una vez en el piano (decisión 50). Es la regla
     clásica de disposición —las tres voces agudas dentro de la octava— y solo el salto del
     bajo al tenor queda libre. Si con la octava no hay ninguna disposición posible, se
     admite hasta la novena (ABERTURA_TOPE) marcándola como «abierta», para no dejar el
     acorde sin realizar; el coste la relega al último lugar. */
  const ABERTURA_MAX = 12;
  const ABERTURA_TOPE = 14;
  /* El veto de las paralelas: más de lo que puede sumar cualquier serie de defectos
     (un paso caro ronda los 500 puntos y un fragmento largo no llega a 20 000). */
  const PESO_PARALELA = 100000;

  const octavaArriba = (n, k = 1) => ({ letra: n.letra, alt: n.alt, octava: n.octava + k });
  const midi = n => Teoria.midi(n);
  // Clase de altura (0–11) de una nota con o sin octava
  const clase = n => ((Teoria.midi({ letra: n.letra, alt: n.alt, octava: 4 }) % 12) + 12) % 12;
  const claseTonica = ton => clase(Teoria.nota(ton.tonica + '4'));
  const claseSensible = ton => (claseTonica(ton) + 11) % 12;

  /* ---- Segunda aumentada melódica (decisión 71) ----
     Dos notas seguidas EN LA MISMA VOZ a distancia de segunda por nombre (una sola letra
     de diferencia) y tres semitonos: sol → la♯, mi♭ → fa♯… Es el tropiezo clásico del modo
     menor, donde el 6.º grado sin alterar y la sensible quedan a esa distancia (en si menor,
     sol y la♯). La escala menor melódica existe precisamente para evitarlo: cuando la voz va
     del 6.º a la sensible, o el 6.º sube alterado, o la voz se va a otra nota del acorde.
     Vale en los dos sentidos (subiendo y bajando) y no es una «segunda aumentada» la novena
     aumentada (13 semitonos), de ahí la comparación exacta con 3. */
  const letraDe = n => Teoria.LETRAS.indexOf(n.letra);
  function segundaAumentada(a, b) {
    if (!a || !b) return false;
    const paso = ((letraDe(b) - letraDe(a)) % 7 + 7) % 7;
    return (paso === 1 || paso === 6) && Math.abs(midi(b) - midi(a)) === 3;
  }

  /* ---- Descripción de un acorde ----
     tonos      : clases de altura del acorde, como {letra, alt}, con el bajo primero
     superiores : las que aporta la cifra (sin el bajo), sin repetir
     fund       : fundamental
     septima    : clase de la séptima (letra a distancia de 7ª de la fundamental) o null
     sensibles  : clases que no se doblan y tienden a subir de semitono: la sensible de
                  la tonalidad y la tercera de los acordes de dominante (+6, +4, 6/5̸, 7/+) */
  function describir(id, bajo, ton) {
    bajo = Teoria.nota(bajo);
    const pc = n => ({ letra: n.letra, alt: n.alt });
    const sup = [];
    Teoria.vocesSuperiores(id, bajo, ton).forEach(v => { if (!sup.some(s => clase(s) === clase(v))) sup.push(pc(v)); });
    const fund = Teoria.fundamental(id, bajo, ton);
    const letra = n => Teoria.LETRAS.indexOf(n.letra);
    const miembro = (n, k) => ((letra(n) - letra(fund)) % 7 + 7) % 7 === k;    // k = 0 fund, 2 tercera, 4 quinta, 6 séptima
    const todos = [pc(bajo), ...sup.filter(s => clase(s) !== clase(bajo))];
    const septima = todos.find(t => miembro(t, 6));
    const quinta = todos.find(t => miembro(t, 4));
    const tercera = todos.find(t => miembro(t, 2));
    const sensibles = new Set([claseSensible(ton)]);
    if (Teoria.DOMINANTES.includes(id) && tercera) sensibles.add(clase(tercera));
    const novena = todos.find(t => miembro(t, 1));
    return {
      id, bajo, fund: pc(fund), tonos: todos, superiores: sup,
      septima: septima ? clase(septima) : null,
      quinta: quinta ? clase(quinta) : null,
      tercera: tercera ? clase(tercera) : null,
      novena: novena ? clase(novena) : null,
      sensibles,
      enFundamental: clase(fund) === clase(bajo)
    };
  }

  // Trío base: voces superiores en posición cerrada encima del bajo, ordenadas de grave a agudo.
  // Con dos voces se añade la octava del bajo; si el bajo es la sensible, la fundamental.
  function trio(id, bajo, ton) {
    bajo = Teoria.nota(bajo);
    const d = describir(id, bajo, ton);
    let voces = d.superiores.map(v => ({ letra: v.letra, alt: v.alt, octava: bajo.octava }));
    if (voces.length > 3 && d.quinta !== null) voces = voces.filter(v => clase(v) !== d.quinta);   // novena: sin la quinta
    if (voces.length < 3) {
      const doblada = d.sensibles.has(clase(bajo)) ? (voces.find(v => clase(v) === clase(d.fund)) || voces.find(v => !d.sensibles.has(clase(v))) || voces[0]) : bajo;
      voces.push({ letra: doblada.letra, alt: doblada.alt, octava: bajo.octava });
    }
    // Todas por encima del bajo y dentro de la octava siguiente
    voces = voces.map(v => { while (midi(v) <= midi(bajo)) v = octavaArriba(v); while (midi(v) > midi(bajo) + 14) v = octavaArriba(v, -1); return v; });
    voces.sort((a, b) => midi(a) - midi(b));
    return voces.slice(0, 3);
  }

  // Rotación r del trío [a,b,c]: 1 → [b,c,a'], 2 → [c,a',b']
  function rotar(t, r) {
    let v = t.slice();
    for (let k = 0; k < r; k++) v = [v[1], v[2], octavaArriba(v[0])];
    return v;
  }

  // Lleva el trío al registro: voz superior entre SOP_MIN y SOP_MAX.
  function colocar(v) {
    let out = v.slice();
    while (midi(out[2]) < SOP_MIN) out = out.map(n => octavaArriba(n));
    while (midi(out[2]) > SOP_MAX) out = out.map(n => octavaArriba(n, -1));
    return out;
  }

  function posicion(t, r) { return colocar(rotar(t, r)); }

  // Paralelas entre dos acordes completos [bajo, v1, v2, v3].
  function paralelasEntre(a, b) {
    const out = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const ia = ((midi(a[j]) - midi(a[i])) % 12 + 12) % 12;
      const ib = ((midi(b[j]) - midi(b[i])) % 12 + 12) % 12;
      const mueven = midi(a[i]) !== midi(b[i]) && midi(a[j]) !== midi(b[j]);
      if (!mueven || ia !== ib) continue;
      if (ia === 7) out.push({ tipo: '5', voces: [i, j] });
      else if (ia === 0) out.push({ tipo: '8', voces: [i, j] });
    }
    return out;
  }

  const NOMBRES_VOZ = ['bajo', 'tenor', 'contralto', 'soprano'];

  /* ---- Disposiciones candidatas de un acorde ----
     Devuelve [{voces:[t,a,s], incompleta, doblaBajo, unisono}] con las voces de grave a agudo. */
  function candidatas(d, sopranoFija = null) {
    /* Se prueba en cuatro escalones, y se para en el primero que dé algo:
         1 · octava de abertura y la soprano bajo el techo  → lo normal;
         2 · novena de abertura y la soprano bajo el techo  → antes ceder en la abertura…
         3 · octava de abertura, la soprano por encima      → …que en el techo;
         4 · novena de abertura, la soprano por encima      → último recurso.
       Las de abertura de novena van marcadas `abierta`, que el coste relega. */
    const conTecho = candidatasCon(d, sopranoFija, ABERTURA_MAX, SOP_TECHO);
    if (conTecho.length) return conTecho;
    const anchasConTecho = candidatasCon(d, sopranoFija, ABERTURA_TOPE, SOP_TECHO);
    if (anchasConTecho.length) return anchasConTecho.map(c => Object.assign(c, { abierta: true }));
    const estrictas = candidatasCon(d, sopranoFija, ABERTURA_MAX, SOP_MAX_DURO);
    if (estrictas.length) return estrictas;
    return candidatasCon(d, sopranoFija, ABERTURA_TOPE, SOP_MAX_DURO).map(c => Object.assign(c, { abierta: true }));
  }

  function candidatasCon(d, sopranoFija, aberturaMax, techo = SOP_MAX_DURO) {
    const bajo = d.bajo;
    const conjuntos = [];                  // multiconjuntos de tres clases (como {letra, alt})
    let sup = d.superiores.slice();
    if (sup.length > 3 && d.quinta !== null) sup = sup.filter(s => clase(s) !== d.quinta);
    if (sup.length >= 3) {
      conjuntos.push({ tonos: sup.slice(0, 3), incompleta: false, doblaBajo: false });
      // Séptima en estado fundamental: puede omitirse la quinta y doblarse la fundamental
      if (d.enFundamental && d.quinta !== null && !d.sensibles.has(clase(d.fund)))
        conjuntos.push({ tonos: sup.filter(s => clase(s) !== d.quinta).concat([d.fund]), incompleta: true, doblaBajo: true });
    } else {
      // Tríada: se dobla una nota que no sea sensible (preferentemente el bajo)
      d.tonos.forEach(t => {
        if (d.sensibles.has(clase(t))) return;
        conjuntos.push({ tonos: sup.concat([t]), incompleta: false, doblaBajo: clase(t) === clase(bajo) });
      });
      // Tríada en estado fundamental: sin quinta, con la fundamental triplicada
      if (d.enFundamental && d.quinta !== null && !d.sensibles.has(clase(d.fund)))
        conjuntos.push({ tonos: sup.filter(s => clase(s) !== d.quinta).concat([d.fund, d.fund]), incompleta: true, doblaBajo: true });
    }
    const out = [];
    const vistas = new Set();
    const mb = midi(bajo);
    // Octava mínima con la que la nota queda por encima (o a la altura) de 'ref'
    const desde = (t, ref, estricto) => { let n = { letra: t.letra, alt: t.alt, octava: 0 }; while (estricto ? midi(n) <= ref : midi(n) < ref) n = octavaArriba(n); return n; };
    conjuntos.forEach(cj => {
      const tonos = cj.tonos;
      // Permutaciones distintas de los tres tonos
      const perms = [];
      [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].forEach(p => {
        const k = p.map(i => clase(tonos[i])).join(',');
        if (!perms.some(q => q.k === k)) perms.push({ k, v: p.map(i => tonos[i]) });
      });
      perms.forEach(({ v }) => {
        /* EL UNÍSONO ENTRE EL BAJO Y EL TENOR (decisión 172, Diego 29/9/2026, sobre
           `A3-2-01`: «podrías hacer en la mano derecha sol2 si2 re3; el unísono está
           justificado y sería correcto»). El tenor tenía que estar ESTRICTAMENTE por encima
           del bajo, así que la disposición que él propone —el tenor doblando el bajo en la
           misma nota— ni siquiera se generaba, y el motor terminaba cayendo en octavas
           seguidas entre la contralto y la soprano. El unísono con el bajo es de manual y
           resuelve justo estos apuros; lleva su coste para que salga solo cuando evita algo
           peor. */
        const t0 = desde(v[0], mb, false);
        /* TRES octavas de tenor, no dos, y hasta dos octavas y una quinta por encima del
           bajo (Diego, 28/9/2026). Con un bajo grave —un fa2 al final de la frase— las dos
           octavas de antes dejaban fuera las disposiciones altas, y el motor tenía que
           desplomar el trío: de ahí salían los saltos injustificados y los unísonos. */
        [t0, octavaArriba(t0), octavaArriba(t0, 2)].forEach(t => {
          if (midi(t) - mb > (sopranoFija !== null ? 36 : 31)) return;
          const a0 = desde(v[1], midi(t), false);
          [a0, octavaArriba(a0)].forEach(a => {
            if (midi(a) - midi(t) > 12) return;
            const s0 = desde(v[2], midi(a), false);
            [s0, octavaArriba(s0)].forEach(s => {
              if (midi(s) - midi(a) > 12) return;
              if (midi(s) - midi(t) > aberturaMax) return;         // soprano y tenor, dentro de la octava
              if (sopranoFija !== null) { if (midi(s) !== sopranoFija) return; }
              else if (midi(s) < SOP_MIN_DURO || midi(s) > techo) return;
              const clave = [midi(t), midi(a), midi(s)].join(',');
              if (vistas.has(clave)) return;
              vistas.add(clave);
              out.push({ voces: [t, a, s], incompleta: cj.incompleta, doblaBajo: cj.doblaBajo,
                unisono: midi(a) === midi(t) || midi(s) === midi(a), unisonoBajo: midi(t) === mb });
            });
          });
        });
      });
    });
    return out;
  }

  // Coste propio de una disposición (sin mirar el acorde anterior).
  function costeLocal(c, d, esFinal, ton) {
    const [t, , s] = c.voces;
    let coste = 0;
    if (midi(s) < SOP_MIN) coste += 2 * (SOP_MIN - midi(s));
    if (midi(s) > SOP_MAX) coste += 2 * (midi(s) - SOP_MAX);
    if (midi(t) - midi(d.bajo) < 3) coste += 10;                     // tenor pegado al bajo
    if (c.incompleta) coste += 8;
    /* El unísono, en el acorde final, pesa más que la tónica en la soprano: no vale
       cerrar en la octava a base de juntar dos voces en la misma nota. */
    if (c.unisono) coste += esFinal ? 60 : 5;
    // El unísono con el bajo (decisión 172): correcto, pero no gratis
    if (c.unisonoBajo) coste += esFinal ? 60 : 20;
    if (c.abierta) coste += 30;        // soprano y tenor a más de una octava: solo si no hay otra
    /* LA NOVENA, POR ENCIMA DE LA SENSIBLE (Diego, 27/9/2026). En el acorde de novena la
       tercera del acorde —la sensible— ha de sonar POR DEBAJO de la novena. Puestas al
       revés chocan en segunda con la sensible arriba, y esa nota pierde su tendencia. La
       única excepción es que la novena venga preparada del acorde anterior, que se oye
       entonces como retardo; eso se mira en el enlace, no aquí. */
    if (d.novena !== null && d.tercera !== null) {
      const todas = [d.bajo, ...c.voces];
      const nov = todas.filter(n => clase(n) === d.novena).map(midi);
      const ter = todas.filter(n => clase(n) === d.tercera).map(midi);
      if (nov.length && ter.length && Math.max(...ter) > Math.min(...nov)) coste += 90;
    }
    if (d.superiores.length < 3 && !c.doblaBajo) coste += 3;         // tríada sin doblar el bajo
    /* EL CIERRE CONCLUSIVO (decisión 120, ampliada por Diego el 27/9/2026). Si el fragmento
       acaba en el acorde de tónica, la melodía de la soprano ha de TENDER A LA TÓNICA —la
       posición de octava, la que cierra de verdad— y, en su defecto, a la TERCERA del acorde,
       que cierra también. La quinta arriba deja la cadencia en el aire y se admite solo
       cuando no hay otra salida.
       Vale para cualquier inversión del acorde de tónica, no solo la fundamental: lo
       conclusivo es la nota con que acaba la melodía, no el bajo.
       Los números son grandes a propósito —el movimiento de una voz cuesta un punto por
       semitono— para que el cierre gane a cualquier comodidad de conducción; y todos quedan
       por debajo del veto de las paralelas, que nunca se admiten por acabar mejor. */
    if (esFinal && d.septima === null && clase(d.fund) === claseTonica(ton)) {
      const cs = clase(s);
      if (cs === claseTonica(ton)) coste += 0;                        // la tónica: cierre pleno
      else if (d.tercera !== null && cs === d.tercera) coste += 30;   // la tercera: cierra también
      else coste += 110;                                              // la quinta arriba: lo último
    }
    return coste;
  }

  // Coste del paso de la disposición p (acorde dp) a la c (acorde dc).
  function costeTransicion(p, dp, c, dc) {
    const antes = [dp.bajo, ...p.voces], ahora = [dc.bajo, ...c.voces];
    let coste = 0;
    /* El movimiento de cada voz cuesta un punto por semitono (XS2: la voz que menos se
       mueve). Y a partir de la cuarta el salto se encarece de prisa, porque un salto grande
       hay que COMPENSARLO después y no siempre se puede: la séptima melódica no se canta
       (Diego, 27/9/2026). */
    for (let q = 1; q < 4; q++) {
      const salto = Math.abs(midi(ahora[q]) - midi(antes[q]));
      coste += salto;
      if (salto > 5) coste += (salto - 5) * 8;
      if (salto >= 10) coste += 90;                 // séptima o más: prácticamente prohibido
    }
    /* LAS PARALELAS NO SON UN COSTE ALTO: SON UN VETO (Diego, 28/9/2026). Con 120 puntos
       un final conclusivo (110) o un par de saltos grandes (90 cada uno) podían pagarse una
       octava o una quinta seguidas, y en la armonización de soprano —donde el bajo lo fija
       la respuesta del alumno y la melodía está dada— salían escritas. Con un peso que
       ninguna suma de los demás defectos puede alcanzar, el motor solo escribe paralelas
       cuando NO hay ninguna disposición que las evite. */
    const contiene = pc => dc.tonos.some(t => clase(t) === pc);
    // Mismo acorde en otra inversión (arpegio del bajo): las voces se reparten libremente
    const mismoAcorde = clase(dp.fund) === clase(dc.fund) && dp.tonos.every(t => contiene(clase(t)));
    /* El veto rige SIEMPRE, también entre dos disposiciones del mismo acorde: se probó a
       exentarlas —bajar el trío una octava sobre el mismo acorde no hace dos armonías— y la
       pauta las siguió contando como octavas seguidas, así que el motor escribía lo que el
       alumno vería marcado en rojo. Mejor que motor y pauta digan lo mismo. */
    coste += PESO_PARALELA * paralelasEntre(antes, ahora).length;
    for (let q = 1; q < 4 && !mismoAcorde; q++) {
      const de = antes[q], a = ahora[q];
      const delta = midi(a) - midi(de);
      const pc = clase(de);
      // La séptima baja de grado (o se mantiene si sigue siendo nota del acorde): nunca sube
      if (dp.septima !== null && pc === dp.septima) {
        if (delta === 0 && contiene(pc)) { /* se mantiene */ }
        else if (delta === -1 || delta === -2) { /* resuelve */ }
        else coste += 80;
      }
      // La sensible sube de semitono: obligatoria en la soprano, preferible en las demás
      if (dp.sensibles.has(pc)) {
        const resuelve = delta === 1 && contiene((pc + 1) % 12);
        const mantiene = delta === 0 && contiene(pc);
        if (!resuelve && !mantiene && contiene((pc + 1) % 12)) coste += (q === 3 ? 40 : (delta === -3 || delta === -4 ? 2 : 6));
      }
    }
    /* PREPARACIÓN DE LA SÉPTIMA (decisión 68). Una nota tendencial ha de entrar preparada:
       la misma nota, en la misma voz, ya sonando en el acorde anterior. La séptima MENOR
       puede entrar sin preparar en el lenguaje tonal del barroco tardío en adelante —el V7
       lo hace constantemente—, así que solo se penaliza un poco; la séptima MAYOR (la del
       IV en el modo mayor, por ejemplo) no admite esa excepción y ha de ir siempre
       preparada. Se mira en las cuatro voces: si la trae el bajo, también está preparada. */
    if (!mismoAcorde && dc.septima !== null && dc.fund) {
      const calidad = (dc.septima - clase(dc.fund) + 12) % 12;   // 11 mayor · 10 menor · 9 disminuida
      let preparada = false;
      for (let q = 0; q < 4; q++) {
        if (clase(ahora[q]) === dc.septima && midi(ahora[q]) === midi(antes[q])) { preparada = true; break; }
      }
      if (!preparada) coste += calidad === 11 ? 110 : 20;
      /* Y si no viene preparada, al menos que se LLEGUE A ELLA POR GRADO CONJUNTO: a la
         séptima no se entra por salto (Diego, 27/9/2026). Lo ideal es la preparación —la
         nota ya sonando en la misma voz—; el grado conjunto es la salida aceptable; el
         salto directo, no, y menos aún en dos voces a la vez. Se mira en las tres voces
         superiores: el bajo viene dado por el fragmento.

         EXCEPCIÓN: la séptima menor de la DOMINANTE, como en los tratados. En II6/5 – V7
         no hay manera de cumplirlo a cuatro voces —el II6/5 no tiene ni sol ni mi en las
         voces superiores—, y esa fórmula es de las centrales del lenguaje. Se sigue
         prefiriendo el grado conjunto, pero muy poco: no vale romper otra cosa por esto. */
      const domMenor = Teoria.DOMINANTES.includes(dc.id) && calidad === 10;
      for (let q = 1; q < 4; q++) {
        if (clase(ahora[q]) !== dc.septima) continue;
        const salto = Math.abs(midi(ahora[q]) - midi(antes[q]));
        if (salto > 2) coste += domMenor ? 4 : 70;
      }
    }
    /* LA NOVENA, POR ENCIMA DE LA SENSIBLE (Diego, 27/9/2026). En el acorde de novena, la
       tercera del acorde —la sensible— ha de sonar POR DEBAJO de la novena: si se pone
       encima, las dos chocan en segunda con la sensible arriba y esta pierde su tendencia.
       La excepción es que la novena venga PREPARADA del acorde anterior: entonces se oye
       como retardo y puede colocarse donde la lleve su voz. */
    if (dc.novena !== null && dc.tercera !== null) {
      const enNovena = [0, 1, 2, 3].filter(q => clase(ahora[q]) === dc.novena);
      const enTercera = [0, 1, 2, 3].filter(q => clase(ahora[q]) === dc.tercera);
      const preparada9 = enNovena.some(q => midi(ahora[q]) === midi(antes[q]));
      if (!preparada9 && enNovena.length && enTercera.length
          && Math.max(...enTercera.map(q => midi(ahora[q]))) > Math.min(...enNovena.map(q => midi(ahora[q])))) {
        coste += 90;
      }
    }
    /* SEGUNDA AUMENTADA MELÓDICA (decisión 71). Prohibición dura en este lenguaje: pesa casi
       tanto como las paralelas. Solo se mira en las tres voces superiores: el bajo viene dado
       por el fragmento y no lo escribe el motor. Se aplica también dentro del mismo acorde
       (un cambio de disposición no salva el intervalo: la voz lo canta igual). */
    for (let q = 1; q < 4; q++) if (segundaAumentada(antes[q], ahora[q])) coste += 100;
    // Solapamiento de voces con el acorde anterior
    for (let q = 1; q < 3; q++) if (midi(ahora[q]) > midi(antes[q + 1])) coste += 6;
    for (let q = 2; q < 4; q++) if (midi(ahora[q]) < midi(antes[q - 1])) coste += 6;
    /* Movimientos directos a la octava o a la quinta (normas XN2 y XN3 de la pauta de
       corrección): con el bajo solo se admiten si la voz superior va por grados conjuntos;
       entre las tres voces agudas, si lo hace una cualquiera de las dos. En un cambio de
       disposición del mismo acorde se admiten (XN4). */
    if (!mismoAcorde) {
      const dir = q => Math.sign(midi(ahora[q]) - midi(antes[q]));
      const conjunto = q => Math.abs(midi(ahora[q]) - midi(antes[q])) <= 2;
      for (let q = 0; q < 4; q++) for (let r = q + 1; r < 4; r++) {
        if (!dir(q) || dir(q) !== dir(r)) continue;
        const iv = ((midi(ahora[r]) - midi(ahora[q])) % 12 + 12) % 12;
        if (iv !== 0 && iv !== 7) continue;
        const salvada = q === 0 ? conjunto(r) : (conjunto(q) || conjunto(r));
        /* El movimiento DIRECTO a octava o quinta con el bajo, encarecido (Diego,
           28/9/2026): con las paralelas vetadas, el motor tendía a refugiarse en la
           directa. Medido sobre el banco, pasar de 30/20 a 75/55 baja las combinaciones
           con aviso de 31 a 20 y las directas de 29 a 17, sin recuperar ninguna paralela. */
        if (!salvada) coste += q === 0 ? 75 : 55;
      }
    }
    return coste;
  }

  /* Disposición con la melodía obligada en la soprano cuando ninguna disposición correcta la
     tiene arriba (el acorde no contiene la nota, o no cabe): la melodía se respeta siempre y
     debajo van dos notas del acorde escrito (las que no son la melodía), en posición cerrada
     bajo ella. Así el alumno ve exactamente lo que ha escrito, sin arreglos. */
  function disposicionForzada(d, soprano) {
    const s = Teoria.nota(soprano);
    const sm = midi(s);
    let tonos = d.superiores.filter(t => clase(t) !== clase(s));
    if (tonos.length < 2) tonos = tonos.concat(d.tonos.filter(t => clase(t) !== clase(s) && !tonos.some(x => clase(x) === clase(t))));
    if (tonos.length < 2) tonos = tonos.concat([d.fund, d.bajo].filter(t => !tonos.some(x => clase(x) === clase(t))));
    tonos = tonos.slice(0, 2);
    // La más alta por debajo de 'techo'
    const bajoDe = (t, techo) => { let n = { letra: t.letra, alt: t.alt, octava: 6 }; while (midi(n) >= techo) n = octavaArriba(n, -1); return n; };
    let a = bajoDe(tonos[1] || tonos[0], sm);
    let t = bajoDe(tonos[0], midi(a));
    if (midi(t) <= midi(d.bajo)) {                 // el tenor no baja del bajo: sube una octava (y, si pasa al contralto, se cambian)
      t = octavaArriba(t);
      if (midi(t) > midi(a)) { const x = t; t = a; a = x; }
      if (midi(a) >= sm) a = octavaArriba(a, -1);
    }
    // Soprano y tenor dentro de la octava (decisión 50), siempre que el tenor quede sobre el bajo
    while (sm - midi(t) > ABERTURA_MAX && midi(octavaArriba(t)) < sm) {
      t = octavaArriba(t);
      if (midi(t) > midi(a)) { const x = t; t = a; a = x; }
    }
    return { voces: [t, a, s], incompleta: false, doblaBajo: false, unisono: midi(t) === midi(a), forzada: true };
  }

  // Mejor disposición de un acorde suelto con la nota dada en la soprano (si no cabe, forzada)
  function acordeConSoprano(id, bajo, ton, soprano) {
    const d = describir(id, bajo, ton);
    const sm = midi(Teoria.nota(soprano));
    const cands = candidatas(d, sm);
    if (!cands.length) return disposicionForzada(d, soprano).voces;
    let mejor = null;
    cands.forEach(c => { const k = costeLocal(c, d, false, ton); if (!mejor || k < mejor.k) mejor = { k, c }; });
    return mejor.c.voces;
  }

  function realizar(ej, cifras, opciones = {}) {
    const modo = opciones.modo || 'auto';
    const rot = opciones.rotacion || 0;
    const tons = Teoria.tonalidadesPorNota(ej);          // tonalidad que rige en cada nota (modulaciones)
    const notas = [];
    if (Array.isArray(opciones.bajos)) opciones.bajos.forEach(b => notas.push(b ? Teoria.nota(b) : null));
    else Teoria.notasDeCompases(ej.compases).forEach(n => notas.push(Teoria.nota(n)));
    const cortes = Teoria.cortes(ej.compases);          // un silencio rompe la frase: no se conduce a través de él
    const sopranos = Array.isArray(opciones.sopranos) ? opciones.sopranos.map(s => (s ? midi(Teoria.nota(s)) : null)) : null;
    const fija = k => (sopranos && sopranos[k] !== null ? sopranos[k] : null);
    const n = notas.length;
    const acordes = new Array(n).fill(null);
    const cifrada = k => !!(cifras[k] && Teoria.CIFRADOS[cifras[k]] && notas[k]);
    // Tonalidad de cada acorde: con la melodía dada, la inflexión (menor melódica) que la contiene
    const tonDe = k => (sopranos && opciones.sopranos && opciones.sopranos[k] && cifrada(k)
      ? Teoria.tonParaBajo(cifras[k], notas[k], tons[k], opciones.sopranos[k]) : tons[k]);

    if (modo !== 'auto') {
      notas.forEach((bajo, i) => {
        const id = cifras[i];
        if (cifrada(i)) acordes[i] = fija(i) !== null ? acordeConSoprano(id, bajo, tonDe(i), opciones.sopranos[i]) : posicion(trio(id, bajo, tons[i]), rot);
      });
    } else {
      // Tramos de notas cifradas consecutivas; cada tramo empieza en la posición elegida
      // (o, con la soprano fija, en la mejor disposición que la tenga arriba)
      let i = 0;
      while (i < n) {
        if (!cifrada(i)) { i++; continue; }
        let j = i + 1;
        while (j < n && cifrada(j) && !cortes[j]) j++;       // el tramo se corta en un silencio
        const tramo = [];
        for (let k = i; k < j; k++) tramo.push(describir(cifras[k], notas[k], tonDe(k)));
        // Programación dinámica: mejor serie de disposiciones del tramo
        let capa;
        if (fija(i) !== null) {
          const cands0 = candidatas(tramo[0], fija(i));
          capa = (cands0.length ? cands0 : [disposicionForzada(tramo[0], opciones.sopranos[i])]).map(c => ({ c, coste: costeLocal(c, tramo[0], i === n - 1, tons[i]), ant: null }));
        } else {
          const primera = posicion(trio(cifras[i], notas[i], tonDe(i)), rot);
          capa = [{ c: { voces: primera, incompleta: false, doblaBajo: true, unisono: false }, coste: 0, ant: null }];
        }
        const capas = [capa];
        for (let k = 1; k < tramo.length; k++) {
          const dc = tramo[k], dp = tramo[k - 1];
          let cands = candidatas(dc, fija(i + k));
          if (!cands.length) cands = fija(i + k) !== null ? [disposicionForzada(dc, opciones.sopranos[i + k])] : candidatas(dc);   // la melodía nunca se cambia
          const esFinal = i + k === n - 1;
          const nueva = cands.map(c => {
            const local = costeLocal(c, dc, esFinal, tonDe(i + k));
            let mejor = null;
            capa.forEach((prev, idx) => {
              const total = prev.coste + costeTransicion(prev.c, dp, c, dc) + local;
              if (mejor === null || total < mejor.coste) mejor = { coste: total, ant: idx };
            });
            return { c, coste: mejor.coste, ant: mejor.ant };
          });
          capa = nueva.length ? nueva : [{ c: { voces: posicion(trio(cifras[i + k], notas[i + k], tonDe(i + k)), rot) }, coste: 0, ant: 0 }];
          capas.push(capa);
        }
        // Recorrido hacia atrás desde la mejor disposición final
        let idx = 0;
        capas[capas.length - 1].forEach((x, q) => { if (x.coste < capas[capas.length - 1][idx].coste) idx = q; });
        for (let k = capas.length - 1; k >= 0; k--) {
          acordes[i + k] = capas[k][idx].c.voces;
          idx = capas[k][idx].ant;
        }
        i = j;
      }
    }
    // Paralelas del resultado
    const paralelas = [];
    for (let i = 1; i < acordes.length; i++) {
      if (!acordes[i] || !acordes[i - 1] || !notas[i] || !notas[i - 1]) continue;
      paralelasEntre([notas[i - 1], ...acordes[i - 1]], [notas[i], ...acordes[i]]).forEach(p => paralelas.push({ i, tipo: p.tipo, voces: p.voces, texto: (p.tipo === '5' ? 'quintas' : 'octavas') + ' entre ' + NOMBRES_VOZ[p.voces[0]] + ' y ' + NOMBRES_VOZ[p.voces[1]] + ' (' + i + '→' + (i + 1) + ')' }));
    }
    return { acordes, paralelas };
  }

  // Cadencia I–IV–V7–I en la tonalidad, para situar el oído. El bajo se toma
  // alrededor de la nota de referencia (por defecto, do3).
  function cadencia(ton, bajoRef) {
    const ref = midi(Teoria.nota(bajoRef || 'C3'));
    let tonica = Teoria.nota(ton.tonica + '3');
    while (midi(tonica) > ref + 6) tonica = octavaArriba(tonica, -1);
    while (midi(tonica) < ref - 6) tonica = octavaArriba(tonica);
    const sub = Teoria.transportar(tonica, 3, 5);            // cuarta justa arriba
    const dom = Teoria.transportar(tonica, 4, 7);            // quinta justa arriba
    const ej = { tonalidad: ton, compases: [[[Teoria.texto(tonica), 2], [Teoria.texto(sub), 2], [Teoria.texto(dom), 2], [Teoria.texto(tonica), 4]]] };
    const r = realizar(ej, ['53', '53', '7+', '53'], { modo: 'auto', rotacion: 0 });
    return [tonica, sub, dom, tonica].map((b, i) => ({ bajo: b, voces: r.acordes[i] || [], duracion: i === 3 ? 4 : 2 }));
  }

  /* =====================================================================
     Auditoría de la conducción de voces (pauta de corrección de Diego)

       Realizacion.auditar(ej, bajos, acordes) → [{ i, texto, notas:[{i, voz}] }]

       bajos   : nota del bajo de cada acorde (o null si la nota no está respondida)
       acordes : [[tenor, contralto, soprano]|null…]
       voces   : 0 bajo · 1 tenor · 2 contralto · 3 soprano

     Se comprueban las normas que dependen del enlace entre dos acordes seguidos:
       · octavas y quintas SEGUIDAS entre dos mismas voces, por movimiento paralelo
         o contrario (XN1), incluidas las compuestas (XNc); excepción: la segunda
         quinta disminuida sin el bajo (XN1e);
       · octavas y quintas por movimiento DIRECTO con el bajo (XN2; excepción: la
         voz superior va por grados conjuntos) y entre las tres voces superiores
         (XN3; excepción: una cualquiera de las dos va por grados conjuntos);
       · notas tendenciales sin resolver (XS4c): la séptima ha de bajar de grado y
         la sensible subir a la tónica;
       · voces cruzadas (Y4a).
     En un cambio de disposición del mismo acorde (XN4) los movimientos directos se
     admiten; los paralelos, no.
     Los textos van en lenguaje llano (sin los códigos de la pauta), para el globo
     que se abre al pulsar una nota señalada. */

  const NOMBRE_VOZ = ['el bajo', 'el tenor', 'la contralto', 'la soprano'];
  const NOMBRE_VOZ_N = ['bajo', 'tenor', 'contralto', 'soprano'];

  function auditar(ej, bajos, acordes) {
    const tons = Teoria.tonalidadesPorNota(ej);
    const cortes = Teoria.cortes(ej.compases);
    const avisos = [];
    const voces = i => (acordes[i] && bajos[i] ? [Teoria.nota(bajos[i]), ...acordes[i]] : null);
    const nombre = n => Teoria.nombreEs(n);
    const conjunto = (a, b) => Math.abs(midi(a) - midi(b)) <= 2;
    for (let i = 1; i < acordes.length; i++) {
      if (cortes[i]) continue;                            // hay un silencio en medio: no hay enlace que juzgar
      const antes = voces(i - 1), ahora = voces(i);
      if (!antes || !ahora) continue;
      const mismaNota = q => midi(antes[q]) === midi(ahora[q]);
      /* ¿Es un CAMBIO DE POSICIÓN del mismo acorde? Entonces la quinta y la octava por
         movimiento directo no se señalan, ni se le pide todavía a la séptima que resuelva
         ni a la sensible que suba: no ha habido cambio de armonía.

         Se compara el CONJUNTO de notas, no el multiconjunto (decisión 173, Diego
         29/9/2026: «es la excepción posible por cambio de posición del acorde»). Antes se
         comparaban las cuatro voces con sus duplicaciones —`2,5,5,9` contra `2,5,9,9`—, y
         como al cambiar de inversión cambia casi siempre la duplicación, el mismo acorde
         casi nunca se reconocía como el mismo y la excepción no llegaba a aplicarse nunca.
         Es lo que pasaba en `A3-4-11` (II6 → II) y en `A3-4-12` (I → I6). */
      const clasesDe = v => [...new Set(v.map(clase))].sort((a, b) => a - b).join(',');
      const mismoAcorde = clasesDe(antes) === clasesDe(ahora);
      for (let q = 0; q < 4; q++) for (let r = q + 1; r < 4; r++) {
        const ia = ((midi(antes[r]) - midi(antes[q])) % 12 + 12) % 12;
        const ib = ((midi(ahora[r]) - midi(ahora[q])) % 12 + 12) % 12;
        const mueven = !mismaNota(q) && !mismaNota(r);
        const notas = [{ i: i - 1, voz: q }, { i: i - 1, voz: r }, { i, voz: q }, { i, voz: r }];
        // Seguidas (paralelas o por movimiento contrario)
        if (mueven && ia === ib && (ia === 7 || ia === 0)) {
          const tipo = ia === 7 ? 'Quintas' : 'Octavas';
          const paralelo = Math.sign(midi(ahora[q]) - midi(antes[q])) === Math.sign(midi(ahora[r]) - midi(antes[r]));
          avisos.push({ i, tipo: ia === 7 ? '5as' : '8as', notas,
            texto: tipo + ' seguidas entre ' + NOMBRE_VOZ[q] + ' y ' + NOMBRE_VOZ[r] + ': '
              + nombre(antes[q]) + '–' + nombre(antes[r]) + ' pasa a ' + nombre(ahora[q]) + '–' + nombre(ahora[r])
              + ' (por movimiento ' + (paralelo ? 'paralelo' : 'contrario') + '). Cambia el acorde o su disposición.' });
          continue;
        }
        // Directas: las dos voces en la misma dirección y llegada a 8ª o 5ª
        if (mismoAcorde || !mueven) continue;
        const dq = Math.sign(midi(ahora[q]) - midi(antes[q])), dr = Math.sign(midi(ahora[r]) - midi(antes[r]));
        if (dq !== dr || (ib !== 0 && ib !== 7)) continue;
        const conBajo = q === 0;
        // Excepción: con el bajo, la voz superior por grados conjuntos; entre las agudas, una cualquiera
        const salvada = conBajo ? conjunto(antes[r], ahora[r]) : (conjunto(antes[q], ahora[q]) || conjunto(antes[r], ahora[r]));
        if (salvada) continue;
        avisos.push({ i, tipo: 'directa', notas,
          texto: (ib === 0 ? 'Octava' : 'Quinta') + ' por movimiento directo entre ' + NOMBRE_VOZ[q] + ' y ' + NOMBRE_VOZ[r]
            + ': las dos voces van en la misma dirección y llegan a ' + (ib === 0 ? 'la octava' : 'la quinta') + ' '
            + nombre(ahora[q]) + '–' + nombre(ahora[r]) + (conBajo ? ' (con el bajo solo se admite si la voz superior va por grados conjuntos).' : ' (se admite si una de las dos va por grados conjuntos).') });
      }
      /* Segunda aumentada melódica (decisión 71). En el modo menor aparece sola en cuanto una
         voz pasa del 6.º grado a la sensible (en si menor, sol → la♯): la escala menor melódica
         está para evitarlo. Solo se mira en las tres voces superiores: el bajo lo da el
         fragmento y el alumno no lo escribe. */
      for (let q = 1; q < 4; q++) {
        if (!segundaAumentada(antes[q], ahora[q])) continue;
        const sube = midi(ahora[q]) > midi(antes[q]);
        avisos.push({ i, tipo: 'segunda-aumentada', notas: [{ i: i - 1, voz: q }, { i, voz: q }],
          texto: 'Segunda aumentada en ' + NOMBRE_VOZ[q] + ': ' + nombre(antes[q]) + ' pasa a ' + nombre(ahora[q])
            + '. Ninguna voz canta una segunda aumentada. En el modo menor sale sola al ir del 6.º grado a la sensible'
            + (sube ? '' : ' (o al revés)')
            + ': o el 6.º grado sube alterado —la escala menor melódica— o esa voz va a otra nota del acorde.' });
      }
      /* Preparación de la séptima mayor (decisión 68): ha de venir de la misma voz. Solo se
         avisa de la MAYOR: la menor sin preparar es corriente en este lenguaje (el V7). */
      const dAhora = describirDesde(ej, i, bajos, acordes, tons);
      if (dAhora && dAhora.septima !== null && dAhora.fund && !mismoAcorde) {
        const calidad = (dAhora.septima - clase(dAhora.fund) + 12) % 12;
        // ¿La trae alguna voz preparada —la misma nota, ya sonando en el acorde anterior—?
        let preparada = false;
        for (let q = 0; q < 4; q++) {
          if (clase(ahora[q]) === dAhora.septima && midi(ahora[q]) === midi(antes[q])) { preparada = true; break; }
        }
        if (calidad === 11 && !preparada) {
          const voz = [0, 1, 2, 3].find(q => clase(ahora[q]) === dAhora.septima);
          if (voz !== undefined) avisos.push({ i, tipo: 'preparacion', notas: [{ i: i - 1, voz }, { i, voz }],
            texto: 'La séptima mayor del acorde (' + nombre(ahora[voz]) + ', en ' + NOMBRE_VOZ_N[voz]
              + ') entra sin preparar: una séptima mayor ha de venir sonando ya en la misma voz en el acorde anterior. '
              + '(La séptima menor sí puede entrar libremente; la mayor, no.)' });
        }
        /* A LA SÉPTIMA NO SE ENTRA POR SALTO (Diego, 27/9/2026). Lo ortodoxo es que venga
           preparada, sonando ya en la misma voz en el acorde anterior; si no puede ser, que
           se llegue a ella por grado conjunto. Por salto directo, nunca —y menos en dos
           voces a la vez—. Solo se mira en las voces superiores: el bajo viene dado.

           EXCEPCIÓN, como en los tratados: la séptima MENOR DE LA DOMINANTE entra libre.
           No es una concesión, es que no puede ser de otro modo: en II6/5 – V7 las voces
           superiores del II6/5 son la, do y re, de modo que al fa del V7 se llega por
           fuerza saltando una tercera, y esa fórmula es de las centrales del lenguaje
           (Diego, 27/9/2026). */
        if (!preparada && !dAhora.dominante) {
          for (let q = 1; q < 4; q++) {
            if (clase(ahora[q]) !== dAhora.septima) continue;
            const salto = Math.abs(midi(ahora[q]) - midi(antes[q]));
            if (salto <= 2) continue;
            avisos.push({ i, tipo: 'septima-por-salto', notas: [{ i: i - 1, voz: q }, { i, voz: q }],
              texto: 'A la séptima del acorde (' + nombre(ahora[q]) + ', en ' + NOMBRE_VOZ_N[q]
                + ') se llega por salto, desde ' + nombre(antes[q]) + '. La séptima ha de venir PREPARADA —sonando ya '
                + 'en la misma voz en el acorde anterior— y, si no puede ser, se llega a ella por grado conjunto; '
                + 'nunca por salto.' });
          }
        }
      }
      /* La novena por encima de la sensible (Diego, 27/9/2026): si la sensible se pone
         encima de la novena, las dos chocan en segunda con la sensible arriba, que es lo que
         no puede ser. Salvo que la novena venga preparada del acorde anterior. */
      if (dAhora && dAhora.novena !== null && dAhora.tercera !== null && !mismoAcorde) {
        const enNovena = [0, 1, 2, 3].filter(q => clase(ahora[q]) === dAhora.novena);
        const enTercera = [0, 1, 2, 3].filter(q => clase(ahora[q]) === dAhora.tercera);
        const preparada9 = enNovena.some(q => midi(ahora[q]) === midi(antes[q]));
        if (!preparada9 && enNovena.length && enTercera.length) {
          const vNov = enNovena.reduce((a, q) => (midi(ahora[q]) < midi(ahora[a]) ? q : a), enNovena[0]);
          const vTer = enTercera.reduce((a, q) => (midi(ahora[q]) > midi(ahora[a]) ? q : a), enTercera[0]);
          if (midi(ahora[vTer]) > midi(ahora[vNov])) {
            avisos.push({ i, tipo: 'novena', notas: [{ i, voz: vTer }, { i, voz: vNov }],
              texto: 'En el acorde de novena la sensible (' + nombre(ahora[vTer]) + ', en ' + NOMBRE_VOZ_N[vTer]
                + ') ha de ir POR DEBAJO de la novena (' + nombre(ahora[vNov]) + ', en ' + NOMBRE_VOZ_N[vNov]
                + '). Solo se admite al revés si la novena viene preparada del acorde anterior.' });
          }
        }
      }
      // Notas tendenciales: la séptima baja, la sensible sube (XS4c)
      const d = describirDesde(ej, i - 1, bajos, acordes, tons);
      if (d) for (let q = 0; q < 4; q++) {
        const de = antes[q], a = ahora[q], pc = clase(de);
        const delta = midi(a) - midi(de);
        const contiene = x => ahora.some(n => clase(n) === x);
        if (d.septima !== null && pc === d.septima && !mismoAcorde) {
          if (delta === 0 && contiene(pc)) continue;
          if (delta === -1 || delta === -2) continue;
          avisos.push({ i, tipo: 'septima', notas: [{ i: i - 1, voz: q }, { i, voz: q }],
            texto: 'La séptima del acorde (' + nombre(de) + ', en ' + NOMBRE_VOZ_N[q] + ') ha de bajar de grado; aquí va a ' + nombre(a) + '.' });
        }
        /* LA SENSIBLE SUBE A LA TÓNICA, salvo que con eso el acorde se quede sin quinta
           (norma XN6 de la pauta; decisión 171, Diego 29/9/2026: «que suba salvo si la
           tónica se queda sin quinta»).

           Hasta aquí solo se avisaba cuando la sensible estaba en la SOPRANO, y en las
           voces interiores se callaba siempre. Diego señaló un caso —`A3-1-22`, V7 → I con
           la melodía en la tercera— en el que la sensible de la contralto se iba a la quinta
           pudiendo no hacerlo, y no se decía nada. Ahora se avisa también en el tenor y en
           la contralto, pero SOLO cuando subir era posible: si esa voz es la única que lleva
           la quinta del acorde, resolverla dejaría la tríada sin quinta, y ahí la excepción
           clásica —la que admiten Aldwell y Schachter— manda y no se señala.

           En el BAJO no se mira: la Regla de la octava lo hace descender en la escala
           descendente (7 → 6), que es lo correcto ahí. */
        if (d.sensibles.has(pc) && !mismoAcorde && contiene((pc + 1) % 12) && q > 0) {
          if (delta === 1 || (delta === 0 && contiene(pc))) continue;
          let calla = false;
          if (q !== 3) {
            const dc = describirDesde(ej, i, bajos, acordes, tons);
            const quinta = dc ? dc.quinta : null;
            const otras = ahora.filter((_, k) => k !== q).map(clase);
            // ¿Es esta voz la única que sostiene la quinta? Entonces subir la dejaría fuera.
            calla = quinta !== null && clase(a) === quinta && !otras.includes(quinta);
          }
          if (calla) continue;
          avisos.push({ i, tipo: 'sensible', notas: [{ i: i - 1, voz: q }, { i, voz: q }],
            texto: 'La sensible (' + nombre(de) + ', en ' + NOMBRE_VOZ_N[q] + ') ha de subir a la tónica; aquí va a ' + nombre(a) + '.'
              + (q === 3 ? '' : ' Solo se le perdona cuando es la única voz que sostiene la quinta del acorde, y aquí no es el caso.') });
        }
      }
    }
    /* ---- El salto melódico, compensado (Diego, 27/9/2026) ----
       Una voz que salta una quinta o más ha de volver después por grado conjunto —o por
       tercera— EN SENTIDO CONTRARIO. Un salto grande seguido de otro salto, y más aún en la
       misma dirección, deja la voz descoyuntada y no se canta. Y la séptima melódica no se
       admite en ningún caso. Solo se miran las tres voces superiores: el bajo viene dado por
       el fragmento y su dibujo es el que es. */
    const SALTO_GRANDE = 7;          // una quinta justa
    for (let q = 1; q < 4; q++) {
      for (let i = 1; i < acordes.length; i++) {
        const a = voces(i - 1), b = voces(i);
        if (!a || !b) continue;
        const salto = midi(b[q]) - midi(a[q]);
        const tam = Math.abs(salto);
        if (tam >= 10 && tam !== 12) {
          avisos.push({ i, tipo: 'salto', notas: [{ i: i - 1, voz: q }, { i, voz: q }],
            texto: 'Salto de ' + (tam >= 13 ? 'más de una octava' : 'séptima') + ' en ' + NOMBRE_VOZ[q]
              + ': ' + nombre(a[q]) + ' a ' + nombre(b[q]) + '. Una voz no canta ese intervalo; '
              + 'búscale otra disposición al acorde.' });
          continue;
        }
        if (tam < SALTO_GRANDE) continue;
        const c = i + 1 < acordes.length ? voces(i + 1) : null;
        if (!c) continue;                       // el salto que cae en el último acorde no se juzga
        const vuelta = midi(c[q]) - midi(b[q]);
        const contrario = (salto > 0 && vuelta < 0) || (salto < 0 && vuelta > 0);
        if (contrario && Math.abs(vuelta) <= 4) continue;       // compensado: segunda o tercera al revés
        avisos.push({ i, tipo: 'salto', notas: [{ i: i - 1, voz: q }, { i, voz: q }, { i: i + 1, voz: q }],
          texto: 'Salto sin compensar en ' + NOMBRE_VOZ[q] + ': de ' + nombre(a[q]) + ' a ' + nombre(b[q])
            + (vuelta === 0 ? ' y ahí se queda' : ' y sigue a ' + nombre(c[q]))
            + '. Después de un salto de quinta o mayor, la voz ha de volver por grado conjunto —o por '
            + 'tercera— en sentido contrario.' });
      }
    }
    // Voces cruzadas dentro de un acorde (Y4a)
    for (let i = 0; i < acordes.length; i++) {
      const v = voces(i);
      if (!v) continue;
      for (let q = 0; q < 3; q++) if (midi(v[q]) > midi(v[q + 1]))
        avisos.push({ i, tipo: 'cruce', notas: [{ i, voz: q }, { i, voz: q + 1 }],
          texto: 'Voces cruzadas: ' + NOMBRE_VOZ[q] + ' (' + nombre(v[q]) + ') está por encima de ' + NOMBRE_VOZ[q + 1] + ' (' + nombre(v[q + 1]) + ').' });
    }
    return avisos;
  }

  // Descripción del acorde i (para conocer su séptima y sus sensibles) a partir de lo escrito
  function describirDesde(ej, i, bajos, acordes, tons) {
    if (!bajos[i] || !acordes[i]) return null;
    const bajo = Teoria.nota(bajos[i]);
    const ton = tons[i] || ej.tonalidad;
    const todas = [bajo, ...acordes[i]];
    // Fundamental: la nota del acorde de la que las demás son 3ª, 5ª o 7ª (por letras)
    const letra = n => Teoria.LETRAS.indexOf(n.letra);
    let fund = bajo, mejor = -1;
    todas.forEach(cand => {
      const pasos = todas.map(n => ((letra(n) - letra(cand)) % 7 + 7) % 7);
      const ok = pasos.every(p => p === 0 || p === 2 || p === 4 || p === 6);
      const puntos = ok ? 10 - Math.max(...pasos) : -1;
      if (puntos > mejor) { mejor = puntos; fund = cand; }
    });
    const miembro = (n, k) => ((letra(n) - letra(fund)) % 7 + 7) % 7 === k;
    const septima = todas.find(n => miembro(n, 6));
    const tercera = todas.find(n => miembro(n, 2));
    const sensibles = new Set([claseSensible(ton)]);
    // Tercera mayor de un acorde con séptima menor: sensible (dominante, también secundaria)
    /* Acorde de DOMINANTE por su hechura: tercera mayor y séptima menor. Vale para el V7
       y para las dominantes secundarias, y es lo que distingue su séptima —que entra libre,
       como en los tratados— de las demás séptimas (Diego, 27/9/2026). */
    const dominante = !!(septima && tercera
      && ((clase(septima) - clase(fund) + 12) % 12) === 10
      && ((clase(tercera) - clase(fund) + 12) % 12) === 4);
    if (dominante) sensibles.add(clase(tercera));
    const novena = todas.find(n => miembro(n, 1));
    const quinta = todas.find(n => miembro(n, 4));      // hace falta para la excepción de la sensible
    return { septima: septima ? clase(septima) : null, fund: fund || null, sensibles, dominante,
             tercera: tercera ? clase(tercera) : null,
             quinta: quinta ? clase(quinta) : null,
             novena: novena ? clase(novena) : null };
  }

  return { trio, rotar, colocar, posicion, realizar, acordeConSoprano, disposicionForzada, paralelasEntre, auditar, cadencia, describir, candidatas, costeLocal, costeTransicion, NOMBRES_VOZ };
})();
