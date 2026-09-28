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
       función, pero distintos: IV – II6 (dos subdominantes), V – I6/4 – V7
       (el 6/4 cadencial vive dentro de la dominante, decisión 130).
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
     La cadencia: los últimos acordes del fragmento
     ===================================================================== */
  /* `soprano` es la nota de la voz superior del último acorde, cuando se conoce: es lo
     único que distingue la auténtica PERFECTA de la IMPERFECTA, junto con que los dos
     acordes vayan en estado fundamental. */
  function cadencia(acs, opciones) {
    const o = opciones || {};
    const n = acs.length;
    if (n < 2) return null;
    const u = acs[n - 1], p = acs[n - 2];
    if (!u || !p || !u.romano || !p.romano) return null;
    const par = texto(p) + ' – ' + texto(u);
    const raiz = ac => ac.cifra === '53' || (ac.romano === 'V' && ac.cifra === '7+');
    const enMenor = !!o.menor;

    /* ¿La soprano llega a la tónica? Se compara la CLASE de la nota, no la octava. */
    let sopranoTonica = null;
    if (o.soprano && o.ton) {
      try { sopranoTonica = Teoria.clase(Teoria.nota(o.soprano)) === Teoria.clase(Teoria.nota(o.ton.tonica + '4')); }
      catch (e) { sopranoTonica = null; }
    }

    const desde = () => {
      /* La cadencia empieza en la subdominante cuando la hay pegada a la dominante: es el
         S – D – T que Diego opone a la prolongación T – D – T. Si no, son dos acordes. */
      const a = acs[n - 3];
      return (a && a.funcion === 'S' && p.funcion === 'D') ? n - 3 : n - 2;
    };

    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'D') {
      if (raiz(p) && p.romano === 'V') {
        if (sopranoTonica === false) {
          return { desde: desde(), hasta: n - 1, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
            porque: par + ': los dos acordes van en estado fundamental, pero la soprano no acaba en la tónica, así que la conclusión no es del todo rotunda.' };
        }
        return { desde: desde(), hasta: n - 1, clase: 'cadencia',
          nombre: 'Cadencia auténtica' + (sopranoTonica ? ' perfecta' : ''),
          porque: par + ': la dominante resuelve en la tónica, las dos en estado fundamental'
            + (sopranoTonica ? ' y con la tónica en la soprano. Es la conclusión más rotunda que hay.' : '.') };
      }
      return { desde: desde(), hasta: n - 1, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
        porque: par + ': la dominante resuelve en la tónica, pero ' + (p.romano === 'VII' ? 'con el VII6 en lugar del V' : 'la dominante no va en estado fundamental') + ', y eso le quita rotundidad.' };
    }
    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'S') {
      return { desde: n - 2, hasta: n - 1, clase: 'cadencia',
        nombre: 'Cadencia plagal' + (raiz(p) && sopranoTonica ? ' perfecta' : raiz(p) && sopranoTonica === false ? ' imperfecta' : ''),
        porque: par + ': la subdominante va directamente a la tónica, sin pasar por la dominante. Es la cadencia «de amén».' };
    }
    if (u.romano === 'I' && u.cifra === '6') {
      return { desde: desde(), hasta: n - 1, clase: 'cadencia', nombre: 'Cadencia imperfecta',
        porque: par + ': acaba en la tónica, pero en primera inversión, así que no cierra del todo.' };
    }
    if (u.romano === 'V') {
      if (enMenor && p.romano === 'IV' && p.cifra === '6') {
        return { desde: n - 2, hasta: n - 1, clase: 'cadencia', nombre: 'Semicadencia frigia',
          porque: par + ': en el modo menor, el bajo baja del 6.º grado al 5.º por semitono. Queda abierta, esperando.' };
      }
      return { desde: n - 2, hasta: n - 1, clase: 'cadencia', nombre: 'Semicadencia',
        porque: par + ': acaba en la dominante, no en la tónica. Queda abierta: la frase pide continuación.' };
    }
    if (p.funcion === 'D' && (u.romano === 'VI' || (u.romano === 'IV' && u.cifra === '6'))) {
      return { desde: n - 2, hasta: n - 1, clase: 'cadencia', nombre: 'Cadencia rota',
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
  /* `acordes`: [{romano, cifra, funcion, ton} | null]. `opciones`: {soprano, ton, menor}.
     Devuelve los tramos de izquierda a derecha. La CADENCIA se reserva antes que nada:
     manda sobre cualquier prolongación que quisiera ocupar los últimos acordes. */
  function detectar(acordes, opciones) {
    const acs = Array.isArray(acordes) ? acordes : [];
    const n = acs.length;
    if (n < 2) return [];
    const salida = [];
    let tope = n - 1;                      // último acorde que pueden ocupar las prolongaciones

    let cad = null;
    try { cad = cadencia(acs, opciones); } catch (e) { cad = null; }
    if (cad) tope = cad.desde;             // la cadencia puede compartir su primer acorde

    /* Las prolongaciones se buscan dentro de cada TRAMO continuo: una nota sin contestar o
       un cambio de tonalidad cortan, porque las funciones de un lado y del otro no se leen
       en el mismo tono y el cuadro engañaría. */
    let i = 0;
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
      salida.push({ desde: i, hasta: mejor, nombre: d.nombre, porque: d.porque, clase: d.clase });
      i = mejor;                           // el acorde de cierre puede abrir la siguiente
    }
    if (cad) salida.push(cad);
    return salida;
  }

  return { detectar, cadencia, mismoAcorde, nombreFuncion };
})();
