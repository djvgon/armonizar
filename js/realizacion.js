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
   ===================================================================== */

const Realizacion = (() => {

  const SOP_MIN = 67, SOP_MAX = 81;        // sol4 … la5, registro preferido de la voz superior
  const SOP_MIN_DURO = 62, SOP_MAX_DURO = 86;
  const ABERTURA_MAX = 14;                 // mano derecha: de la voz más grave a la más aguda, como mucho una novena

  const octavaArriba = (n, k = 1) => ({ letra: n.letra, alt: n.alt, octava: n.octava + k });
  const midi = n => Teoria.midi(n);
  // Clase de altura (0–11) de una nota con o sin octava
  const clase = n => ((Teoria.midi({ letra: n.letra, alt: n.alt, octava: 4 }) % 12) + 12) % 12;
  const claseTonica = ton => clase(Teoria.nota(ton.tonica + '4'));
  const claseSensible = ton => (claseTonica(ton) + 11) % 12;

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
    return {
      id, bajo, fund: pc(fund), tonos: todos, superiores: sup,
      septima: septima ? clase(septima) : null,
      quinta: quinta ? clase(quinta) : null,
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
        const t0 = desde(v[0], mb, true);
        (sopranoFija !== null ? [t0, octavaArriba(t0), octavaArriba(t0, 2)] : [t0, octavaArriba(t0)]).forEach(t => {
          if (midi(t) - mb > (sopranoFija !== null ? 36 : 24)) return;
          const a0 = desde(v[1], midi(t), false);
          [a0, octavaArriba(a0)].forEach(a => {
            if (midi(a) - midi(t) > 12) return;
            const s0 = desde(v[2], midi(a), false);
            [s0, octavaArriba(s0)].forEach(s => {
              if (midi(s) - midi(a) > 12) return;
              if (midi(s) - midi(t) > ABERTURA_MAX) return;        // las tres voces caben en la mano derecha
              if (sopranoFija !== null) { if (midi(s) !== sopranoFija) return; }
              else if (midi(s) < SOP_MIN_DURO || midi(s) > SOP_MAX_DURO) return;
              const clave = [midi(t), midi(a), midi(s)].join(',');
              if (vistas.has(clave)) return;
              vistas.add(clave);
              out.push({ voces: [t, a, s], incompleta: cj.incompleta, doblaBajo: cj.doblaBajo, unisono: midi(a) === midi(t) || midi(s) === midi(a) });
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
    if (c.unisono) coste += 5;
    if (d.superiores.length < 3 && !c.doblaBajo) coste += 3;         // tríada sin doblar el bajo
    if (esFinal && d.id === '53' && clase(d.bajo) === claseTonica(ton)) {
      const cs = clase(s);
      if (cs === claseTonica(ton)) coste += 0;
      else if (d.quinta !== null && cs === d.quinta) coste += 25;   // la quinta en la soprano final: lo último
      else coste += 12;                                              // la tercera
    }
    return coste;
  }

  // Coste del paso de la disposición p (acorde dp) a la c (acorde dc).
  function costeTransicion(p, dp, c, dc) {
    const antes = [dp.bajo, ...p.voces], ahora = [dc.bajo, ...c.voces];
    let coste = 0;
    for (let q = 1; q < 4; q++) coste += Math.abs(midi(ahora[q]) - midi(antes[q]));
    coste += 60 * paralelasEntre(antes, ahora).length;
    const contiene = pc => dc.tonos.some(t => clase(t) === pc);
    // Mismo acorde en otra inversión (arpegio del bajo): las voces se reparten libremente
    const mismoAcorde = clase(dp.fund) === clase(dc.fund) && dp.tonos.every(t => contiene(clase(t)));
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
    // Solapamiento de voces con el acorde anterior
    for (let q = 1; q < 3; q++) if (midi(ahora[q]) > midi(antes[q + 1])) coste += 6;
    for (let q = 2; q < 4; q++) if (midi(ahora[q]) < midi(antes[q - 1])) coste += 6;
    // Quintas y octavas directas entre las voces extremas con salto en la soprano
    const dirB = Math.sign(midi(ahora[0]) - midi(antes[0])), dirS = Math.sign(midi(ahora[3]) - midi(antes[3]));
    if (dirB && dirB === dirS && Math.abs(midi(ahora[3]) - midi(antes[3])) > 2) {
      const iv = ((midi(ahora[3]) - midi(ahora[0])) % 12 + 12) % 12;
      if (iv === 7 || iv === 0) coste += 20;
    }
    return coste;
  }

  // Mejor disposición de un acorde suelto con la nota dada en la soprano (o la de Furno si no cabe)
  function acordeConSoprano(id, bajo, ton, soprano) {
    const d = describir(id, bajo, ton);
    const sm = midi(Teoria.nota(soprano));
    const cands = candidatas(d, sm);
    if (!cands.length) return posicion(trio(id, bajo, ton), 0);
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
    else ej.compases.forEach(c => c.forEach(([n]) => notas.push(Teoria.nota(n))));
    const sopranos = Array.isArray(opciones.sopranos) ? opciones.sopranos.map(s => (s ? midi(Teoria.nota(s)) : null)) : null;
    const fija = k => (sopranos && sopranos[k] !== null ? sopranos[k] : null);
    const n = notas.length;
    const acordes = new Array(n).fill(null);
    const cifrada = k => !!(cifras[k] && Teoria.CIFRADOS[cifras[k]] && notas[k]);

    if (modo !== 'auto') {
      notas.forEach((bajo, i) => {
        const id = cifras[i];
        if (cifrada(i)) acordes[i] = fija(i) !== null ? acordeConSoprano(id, bajo, tons[i], opciones.sopranos[i]) : posicion(trio(id, bajo, tons[i]), rot);
      });
    } else {
      // Tramos de notas cifradas consecutivas; cada tramo empieza en la posición elegida
      // (o, con la soprano fija, en la mejor disposición que la tenga arriba)
      let i = 0;
      while (i < n) {
        if (!cifrada(i)) { i++; continue; }
        let j = i;
        while (j < n && cifrada(j)) j++;
        const tramo = [];
        for (let k = i; k < j; k++) tramo.push(describir(cifras[k], notas[k], tons[k]));
        // Programación dinámica: mejor serie de disposiciones del tramo
        let capa;
        if (fija(i) !== null) {
          const cands0 = candidatas(tramo[0], fija(i));
          capa = (cands0.length ? cands0 : candidatas(tramo[0])).map(c => ({ c, coste: costeLocal(c, tramo[0], i === n - 1, tons[i]), ant: null }));
        } else {
          const primera = posicion(trio(cifras[i], notas[i], tons[i]), rot);
          capa = [{ c: { voces: primera, incompleta: false, doblaBajo: true, unisono: false }, coste: 0, ant: null }];
        }
        const capas = [capa];
        for (let k = 1; k < tramo.length; k++) {
          const dc = tramo[k], dp = tramo[k - 1];
          let cands = candidatas(dc, fija(i + k));
          if (!cands.length) cands = candidatas(dc);
          const esFinal = i + k === n - 1;
          const nueva = cands.map(c => {
            const local = costeLocal(c, dc, esFinal, tons[i + k]);
            let mejor = null;
            capa.forEach((prev, idx) => {
              const total = prev.coste + costeTransicion(prev.c, dp, c, dc) + local;
              if (mejor === null || total < mejor.coste) mejor = { coste: total, ant: idx };
            });
            return { c, coste: mejor.coste, ant: mejor.ant };
          });
          capa = nueva.length ? nueva : [{ c: { voces: posicion(trio(cifras[i + k], notas[i + k], tons[i + k]), rot) }, coste: 0, ant: 0 }];
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

  return { trio, rotar, colocar, posicion, realizar, acordeConSoprano, paralelasEntre, cadencia, describir, candidatas, costeLocal, costeTransicion, NOMBRES_VOZ };
})();
