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
  function cadencia(acs, opciones, fin) {
    const o = opciones || {};
    const F = (fin === undefined || fin === null) ? acs.length - 1 : fin;
    if (F < 1) return null;
    const u = acs[F], p = acs[F - 1];
    if (!u || !p || !u.romano || !p.romano) return null;
    const par = texto(p) + ' – ' + texto(u);
    const raiz = ac => ac.cifra === '53' || (ac.romano === 'V' && ac.cifra === '7+');
    const enMenor = !!o.menor;

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
      if (f !== 'S' && k > 0 && acs[k - 1] && acs[k - 1].funcion === 'S') k--;
      return k;
    };

    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'D') {
      const saltoDeQuinta = raiz(p) && p.romano === 'V';       // el bajo salta de la fundamental a la fundamental
      if (saltoDeQuinta && sopranoTonica !== false) {
        return { desde: desde(), hasta: F, clase: 'cadencia',
          nombre: 'Cadencia auténtica' + (sopranoTonica ? ' perfecta' : ''),
          porque: par + ': la dominante resuelve en la tónica, las dos en estado fundamental'
            + (sopranoTonica ? ' y con la tónica en la soprano. Es la conclusión más rotunda que hay.' : '.') };
      }
      const porQue = !saltoDeQuinta
        ? (p.romano === 'VII' ? 'con el VII6 en lugar del V, así que el bajo no salta de quinta'
                              : 'pero el bajo no salta de quinta, porque la dominante va invertida')
        : 'pero la soprano no acaba en la tónica';
      return { desde: desde(), hasta: F, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
        porque: par + ': la dominante resuelve en la tónica, ' + porQue + ', y eso le quita rotundidad.' };
    }
    if (u.romano === 'I' && u.cifra === '53' && p.funcion === 'S') {
      return { desde: desde(), hasta: F, clase: 'cadencia',
        nombre: 'Cadencia plagal' + (raiz(p) && sopranoTonica ? ' perfecta' : raiz(p) && sopranoTonica === false ? ' imperfecta' : ''),
        porque: par + ': la subdominante va directamente a la tónica, sin pasar por la dominante. Es la cadencia «de amén».' };
    }
    if (u.romano === 'I' && u.cifra === '6') {
      return { desde: desde(), hasta: F, clase: 'cadencia', nombre: 'Cadencia auténtica imperfecta',
        porque: par + ': acaba en la tónica, pero en primera inversión, así que el bajo no salta de quinta y no cierra del todo.' };
    }
    if (u.romano === 'V') {
      if (enMenor && p.romano === 'IV' && p.cifra === '6') {
        return { desde: desde(), hasta: F, clase: 'cadencia', nombre: 'Semicadencia frigia',
          porque: par + ': en el modo menor, el bajo baja del 6.º grado al 5.º por semitono. Queda abierta, esperando.' };
      }
      return { desde: desde(), hasta: F, clase: 'cadencia', nombre: 'Semicadencia',
        porque: par + ': la frase acaba en la dominante, no en la tónica. Queda abierta: pide continuación.' };
    }
    if (p.funcion === 'D' && (u.romano === 'VI' || (u.romano === 'IV' && u.cifra === '6'))) {
      return { desde: desde(), hasta: F, clase: 'cadencia', nombre: 'Cadencia rota',
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
        salida.push({ desde: i, hasta: mejor, nombre: d.nombre, porque: d.porque, clase: d.clase });
        i = mejor;                           // el acorde de cierre puede abrir la siguiente
      }
      if (cad) salida.push(cad);
    });
    salida.sort((a, b) => a.desde - b.desde || a.hasta - b.hasta);
    return salida;
  }

  return { detectar, cadencia, mismoAcorde, nombreFuncion };
})();
