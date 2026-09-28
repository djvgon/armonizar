/* =======================================================================
   tecnicas.js — Técnicas armónicas: prolongaciones y cadencias
   =======================================================================
   Lee la cadena de acordes de un fragmento y devuelve los TRAMOS que forman
   una técnica, para que la partitura los encierre en un cuadro con su nombre.

   Qué se reconoce (Diego, 28/9/2026, decisión 155):

     · PROLONGACIÓN POR ARPEGIO — el mismo acorde, cambiando de inversión:
       I – I6, V – V6, II – II6. «Arpegiar en el bajo las notas de ese acorde».
       Es la más sencilla y vale para cualquier acorde.
     · PROLONGACIÓN DE UNA FUNCIÓN — varios acordes seguidos de la misma
       función, pero distintos: V – I6/4 – V7 (el 6/4 cadencial vive dentro
       de la dominante, decisión 130). NO vale para la SUBDOMINANTE: varias
       subdominantes seguidas cuentan como una sola y, si detrás hay una
       cadencia, es ella quien se las lleva (Diego, 28/9/2026).
     · PROLONGACIÓN CON MARCO — se sale de una función y se vuelve a ella:
       T – D – T y T – S – T (la bordadura del tema 12), y también S – T – S,
       «el I dentro del II». La distinción entre prolongar y cadenciar es,
       en palabras de Diego, «un punto fundamental del aprendizaje».
     · CADENCIA — el final del fragmento, con su nombre completo: auténtica
       perfecta o imperfecta, plagal, rota, semicadencia (y la frigia).

   La entrada es una lista de acordes `{romano, cifra, funcion, ton}` (null
   donde el alumno no ha contestado), y la salida, tramos
   `{desde, hasta, nombre, porque, clase}` que NO se solapan salvo en el
   acorde que comparten dos técnicas seguidas.
   ======================================================================= */
window.Tecnicas = (function () {
  'use strict';

  /* ---------- ¿Es el mismo acorde en otra inversión? ---------- */
  const TRIADA = ['53', '6', '64'];
  const SEPTIMA_DOM = ['7+', '65d', '+6', '+4'];
  const SEPTIMA_DIA = ['7', '65', '43', '42'];
  const familia = c => (TRIADA.includes(c) ? 'triada'
    : SEPTIMA_DOM.includes(c) ? 'dom7'
    : SEPTIMA_DIA.includes(c) ? 'sep7' : c);

  function mismoAcorde(a, b) {
    if (!a || !b || a.romano !== b.romano) return false;
    const fa = familia(a.cifra), fb = familia(b.cifra);
    if (fa === fb) return true;
    /* La tríada que GANA O SUELTA su séptima no es un acorde nuevo, es el mismo
       completándose: es la excepción ya medida para I–V–V7–I, la fórmula de la primera
       lección del método (decisión 80). Vale igual para el II y su séptima diatónica. */
    const par = [fa, fb].sort().join('+');
    return par === 'dom7+triada' || par === 'sep7+triada';
  }

  /* Un acorde PIVOTE se escribe en la aplicación con sus dos lecturas, «I = V»: la de la
     tonalidad de partida y la de la nueva. Aquí manda la que RIGE, que es la segunda. Esto
     es una barandilla: quien llama ha de mandar un romano limpio, pero si se le cuela el
     compuesto, más vale leer el que toca que no reconocer ninguno. */
  const soloUnGrado = r => String(r == null ? '' : r).split(' = ').pop().trim();

  const NOMBRE = { T: 'tónica', S: 'subdominante', D: 'dominante', DD: 'dominante de la dominante', N: 'sin función' };
  const nombreFuncion = f => NOMBRE[f] || f;

  /* ---------- Cómo se escribe un acorde en las explicaciones ---------- */
  function texto(ac) {
    if (!ac || !ac.romano) return '?';
    if (ac.cifra === '53') return ac.romano;
    if (ac.romano === 'V' && ac.cifra === '7+') return 'V7';
    const c = Teoria.CIFRADOS[ac.cifra];
    return ac.romano + ' ' + (c ? c.etiqueta : ac.cifra);
  }
  const cadena = (acs, d, h) => acs.slice(d, h + 1).map(texto).join(' – ');
  const funciones = (acs, d, h) => acs.slice(d, h + 1).map(a => (a ? a.funcion : '·')).join(' – ');

  /* =====================================================================
     La cadencia: los últimos acordes de una FRASE
     ===================================================================== */
  /* No solo del fragmento (Diego, 28/9/2026): las frases interiores también cadencian, y
     mientras se miraba solo el final, una `S – S – D` de reposo se la comía una
     prolongación. Las frases las cortan los silencios, que es como ya las parte el motor.
     `fin` es el índice del último acorde de la frase; `o.sopranos[fin]`, la voz superior de
     ese acorde, que es lo que separa la auténtica PERFECTA de la IMPERFECTA.

     Perfecta o imperfecta (Diego, 28/9/2026, con sus palabras): es IMPERFECTA cuando acaba
     en V – I pero «o bien el bajo no hace salto de quinta —porque use una inversión, bien en
     la dominante o bien en la tónica—, o bien la melodía de soprano no acaba en la tónica,
     sino, por ejemplo, en la tercera o, menos frecuente, en la quinta». */
  /* ¿El bajo hace BORDADURA entre dos acordes? Es lo que distingue de verdad la
     prolongación de la cadencia (Diego, 28/9/2026): «prolongación es T D T y el bajo
     haciendo un movimiento de bordadura o de bordadura incompleta». El bajo se mueve por
     GRADO CONJUNTO y vuelve a la nota de partida (bordadura) o sigue por grado hasta otra
     nota del mismo acorde (incompleta: do – re – mi del `I – V4/3 – I6`). Si en vez de eso
     SALTA —do – sol – do del `I – V – I`—, no está adornando la tónica: está cadenciando,
     y el cuadro sigue diciendo cadencia. */
  function bordaduraEnElBajo(o, ini, fin) {
    const b = o && o.bajos;
    if (!b || ini < 0 || fin <= ini) return false;
    const midi = k => { try { return b[k] ? Teoria.midi(Teoria.nota(b[k])) : null; } catch (e) { return null; } };
    let algunMovimiento = false;
    for (let k = ini; k < fin; k++) {
      const a = midi(k), c = midi(k + 1);
      if (a === null || c === null) return false;
      const d = Math.abs(c - a);
      if (d > 2) return false;                 // un salto no es bordadura
      if (d > 0) algunMovimiento = true;
    }
    return algunMovimiento;
  }

  function cadencia(acs, opciones, fin) {
    const o = opciones || {};
    const F = (fin === undefined || fin === null) ? acs.length - 1 : fin;
    if (F < 1) return null;
    const crudoU = acs[F], crudoP = acs[F - 1];
    if (!crudoU || !crudoP || !crudoU.romano || !crudoP.romano) return null;
    const u = Object.assign({}, crudoU, { romano: soloUnGrado(crudoU.romano) });
    const p = Object.assign({}, crudoP, { romano: soloUnGrado(crudoP.romano) });
    const par = texto(p) + ' – ' + texto(u);
    const raiz = ac => ac.cifra === '53' || (ac.romano === 'V' && ac.cifra === '7+');
    /* El modo lo manda la tonalidad que rige EN LA CADENCIA, no la del final del fragmento:
       en una frase interior de una pieza que modula, no tienen por qué ser la misma. */
    const enMenor = (u.ton && u.ton.modo) ? u.ton.modo === 'menor' : !!o.menor;

    /* ¿La soprano llega a la tónica? Se compara la CLASE de la nota, no la octava. */
    let sopranoTonica = null;
    const sop = (o.sopranos && o.sopranos[F]) || (F === acs.length - 1 ? o.soprano : null);
    const ton = (u.ton || o.ton);
    if (sop && ton) {
      try { sopranoTonica = Teoria.clase(Teoria.nota(sop)) === Teoria.clase(Teoria.nota(ton.tonica + '4')); }
      catch (e) { sopranoTonica = null; }
    }

    /* Hasta dónde llega el cuadro hacia atrás. La DOMINANTE de la cadencia puede ocupar
       varios acordes —el 6/4 cadencial es dominante en esta aplicación (decisión 130), así
       que `II6 – I6/4 – V – I` es S + D + T y no una prolongación suelta más una cadencia—,
       y delante de ella entra la subdominante que la prepara: el `S – D – T` que Diego opone
       a la prolongación `T – D – T`. */
    const desde = () => {
      let k = F - 1;
      const f = p.funcion;
      while (k > 0 && acs[k - 1] && acs[k - 1].funcion === f) k--;
      /* TODAS las subdominantes que preparan la dominante, no solo la última (Diego,
         28/9/2026): «varias subdominantes seguidas cuentan como una sola si luego hay una
         cadencia». En `T S S S D T`, la cadencia auténtica empieza en la PRIMERA S; en
         `S S D`, la semicadencia también. */
      if (f !== 'S') while (k > 0 && acs[k - 1] && acs[k - 1].funcion === 'S') k--;
      return k;
    };

    /* T – D – T NO es cadencia, es PROLONGACIÓN de la tónica: la cadencia pide una
       subdominante delante de la dominante. Es la distinción que Diego llama «un punto
       fundamental del aprendizaje» —prolongación T – D – T contra cadencia S – D – T— y la
       que echó en falta en un fragmento de tres acordes, `I – V6/5 – I`: «en este caso,
       breve y que no llega a más, se trata de una prolongación del I». Si la dominante
       viene de la tónica y vuelve a ella, esto se devuelve sin nombre y el detector de
       prolongaciones lo recoge como el marco que es. */
    const empieza = desde();
    const conSubdominante = acs[empieza] && acs[empieza].funcion === 'S';
    const vieneDeLaTonica = empieza > 0 && acs[empieza - 1] && acs[empieza - 1].funcion === 'T';
    if (u.romano === 'I' && !conSubdominante && vieneDeLaTonica && bordaduraEnElBajo(o, empieza - 1, F)) return null;

    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'D') {
      const saltoDeQuinta = raiz(p) && p.romano === 'V';       // el bajo salta de la fundamental a la fundamental
      if (saltoDeQuinta && sopranoTonica !== false) {
        return { desde: empieza, hasta: F, clase: 'cadencia',
          nombre: 'Cadencia auténtica' + (sopranoTonica ? ' perfecta' : ''),
          porque: par + ': la dominante resuelve en la tónica, las dos en estado fundamental'
            + (sopranoTonica ? ' y con la tónica en la soprano. Es la conclusión más rotunda que hay.' : '.') };
      }
      const porQue = !saltoDeQuinta
        ? (p.romano === 'VII' ? 'con el VII6 en lugar del V, así que el bajo no salta de quinta'
                              : 'pero el bajo no salta de quinta, porque la dominante va invertida')
        : 'pero la soprano no acaba en la tónica';
      return { desde: empieza, hasta: F, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
        porque: par + ': la dominante resuelve en la tónica, ' + porQue + ', y eso le quita rotundidad.' };
    }
    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'S') {
      return { desde: empieza, hasta: F, clase: 'cadencia',
        nombre: 'Cadencia plagal' + (raiz(p) && sopranoTonica ? ' perfecta' : raiz(p) && sopranoTonica === false ? ' imperfecta' : ''),
        porque: par + ': la subdominante va directamente a la tónica, sin pasar por la dominante. Es la cadencia «de amén».' };
    }
    if (u.romano === 'I' && u.cifra === '6') {
      return { desde: empieza, hasta: F, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
        porque: par + ': acaba en la tónica, pero en primera inversión, así que el bajo no salta de quinta y no cierra del todo.' };
    }
    if (u.romano === 'V') {
      /* LA SEMICADENCIA FRIGIA, en sus dos versiones (Diego, 28/9/2026):
           · corta : `IV6 – V` en modo menor;
           · larga : `I – V6 – IV6 – V`, también en menor.
         Lo que la hace frigia es el bajo, que baja del 6.º grado al 5.º por SEMITONO —el
         paso característico del modo frigio—. La versión larga es la misma con su arranque:
         la tónica y el V6 que llevan el bajo por grados hasta ese 6.º. El cuadro la abarca
         entera, porque la fórmula se aprende como una sola cosa. */
      if (enMenor && p.romano === 'IV' && p.cifra === '6') {
        const largaV6 = acs[F - 2], largaI = acs[F - 3];
        const larga = !!(largaV6 && largaI && largaV6.romano === 'V' && largaV6.cifra === '6'
          && largaI.romano === 'I' && largaI.funcion === 'T');
        return { desde: larga ? F - 3 : empieza, hasta: F, clase: 'cadencia', nombre: 'Semicadencia frigia',
          porque: (larga ? 'I – V6 – ' : '') + par
            + ': en el modo menor, el bajo baja del 6.º grado al 5.º por semitono — el paso del modo frigio.'
            + (larga ? ' La tónica y el V6 del principio son el arranque de la fórmula: llevan el bajo por grados hasta ese 6.º.' : '')
            + ' Queda abierta, esperando.' };
      }
      return { desde: empieza, hasta: F, clase: 'cadencia', nombre: 'Semicadencia',
        porque: par + ': la frase acaba en la dominante, no en la tónica. Queda abierta: pide continuación.' };
    }
    if (p.funcion === 'D' && (u.romano === 'VI' || (u.romano === 'IV' && u.cifra === '6'))) {
      return { desde: empieza, hasta: F, clase: 'cadencia', nombre: 'Cadencia rota',
        porque: par + ': la dominante no resuelve en la tónica, sino en el acorde que la sustituye. Pide una cadencia auténtica detrás.' };
    }
    return null;
  }

  /* =====================================================================
     Las prolongaciones
     ===================================================================== */
  /* Un TRAMO válido de i a j (j > i) empieza y acaba en la misma función y, por dentro,
     o es todo esa función (una racha) o no la toca ninguna vez (un marco). Lo que no vale
     es mezclar las dos cosas —T D T D T—, porque entonces no es una técnica sino dos. */
  function valido(acs, i, j) {
    const f = acs[i].funcion;
    if (!f || !acs[j] || acs[j].funcion !== f) return false;
    let dentroSi = 0, dentroNo = 0;
    for (let k = i + 1; k < j; k++) {
      if (!acs[k] || !acs[k].funcion) return false;
      if (acs[k].funcion === f) dentroSi++; else dentroNo++;
    }
    return dentroSi === 0 || dentroNo === 0;
  }

  function describir(acs, i, j) {
    const f = acs[i].funcion;
    const hay = cadena(acs, i, j);
    // ¿Es todo el mismo acorde cambiando de inversión?
    let arpegio = true;
    for (let k = i + 1; k <= j && arpegio; k++) if (!mismoAcorde(acs[i], acs[k])) arpegio = false;
    if (arpegio) {
      return { clase: 'arpegio', nombre: acs[i].romano + ' arpegiado',
        porque: hay + ': el bajo arpegia las notas del mismo acorde. La armonía no cambia — se prolonga.' };
    }
    const dentroEsF = acs.slice(i + 1, j).every(a => a.funcion === f);
    if (dentroEsF) {
      /* Una tirada de SUBDOMINANTES seguidas no es una prolongación (Diego, 28/9/2026):
         «varias subdominantes seguidas no lo vamos a llamar prolongación de la
         subdominante». Cuentan como una sola, y cuando detrás viene una cadencia es ella
         quien se las lleva —el `desde()` de arriba—. Si no hay cadencia detrás, no se marca
         nada: no toda sucesión tiene nombre. El marco `S – T – S` sí lo es, y sigue abajo. */
      if (f === 'S') return null;
      return { clase: 'prolongacion', nombre: 'Prolongación de la ' + nombreFuncion(f),
        porque: hay + ': acordes distintos, pero todos de ' + nombreFuncion(f) + ' (' + funciones(acs, i, j) + '). La armonía no avanza: se sostiene.' };
    }
    const dentro = acs[i + 1].funcion;
    return { clase: 'prolongacion', nombre: 'Prolongación de la ' + nombreFuncion(f),
      porque: funciones(acs, i, j) + ' (' + hay + '): se sale de la ' + nombreFuncion(f) + ' y se vuelve a ella. '
        + 'La ' + nombreFuncion(dentro) + ' de en medio no cadencia — adorna.' };
  }

  /* =====================================================================
     Todo junto
     ===================================================================== */
  /* `acordes`: [{romano, cifra, funcion, ton} | null].
     `opciones`: {cortes:[bool], sopranos:[nota], ton, menor}.

     El fragmento se parte en FRASES —un silencio corta, que es como ya las parte el motor—,
     y cada frase se resuelve entera: primero su CADENCIA, que manda sobre cualquier
     prolongación que quisiera ocupar esos acordes, y después las prolongaciones de lo que
     queda por delante. Mientras la cadencia se buscaba solo al final del fragmento, los
     reposos interiores quedaban sin nombre y una `S – S – D` se la comía una prolongación
     de la tónica (Diego, 28/9/2026). */
  function detectar(acordes, opciones) {
    const o = opciones || {};
    const acs = Array.isArray(acordes) ? acordes : [];
    const n = acs.length;
    if (n < 2) return [];
    const cortes = Array.isArray(o.cortes) ? o.cortes : [];

    const frases = [];
    for (let i = 0; i < n; i++) {
      if (i === 0 || cortes[i] || !frases.length) frases.push({ ini: i, fin: i });
      else frases[frases.length - 1].fin = i;
    }

    const salida = [];
    frases.forEach(f => {
      if (f.fin <= f.ini) return;
      let cad = null;
      try { cad = cadencia(acs, o, f.fin); } catch (e) { cad = null; }
      const tope = cad ? cad.desde : f.fin;

      /* Las prolongaciones se buscan dentro de cada TRAMO continuo: una nota sin contestar o
         un cambio de tonalidad cortan, porque las funciones de un lado y del otro no se leen
         en el mismo tono y el cuadro engañaría. */
      let i = f.ini;
      while (i < tope) {
        if (!acs[i] || !acs[i].funcion) { i++; continue; }
        let mejor = -1;
        for (let j = tope; j > i; j--) {
          if (!acs[j]) continue;
          let corta = false;                 // ¿hay un hueco o un cambio de tono entre medias?
          for (let k = i + 1; k <= j && !corta; k++) {
            if (!acs[k]) corta = true;
            else if (acs[i].ton && acs[k].ton && !Teoria.mismaTonalidad(acs[i].ton, acs[k].ton)) corta = true;
          }
          if (corta) continue;
          if (valido(acs, i, j)) { mejor = j; break; }
        }
        if (mejor < 0) { i++; continue; }
        const d = describir(acs, i, mejor);
        if (!d) { i++; continue; }           // hay sucesiones que no tienen nombre
        salida.push({ desde: i, hasta: mejor, nombre: d.nombre, porque: d.porque, clase: d.clase });
        i = mejor;                           // el acorde de cierre puede abrir la siguiente
      }
      if (cad) salida.push(cad);
    });
    salida.sort((a, b) => a.desde - b.desde || a.hasta - b.hasta);
    return salida;
  }

  return { detectar, cadencia, mismoAcorde, nombreFuncion, bordaduraEnElBajo };
})();
