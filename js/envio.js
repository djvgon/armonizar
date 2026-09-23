/* =====================================================================
   envio.js — Llevar el informe al formulario del profesor.

   La aplicación es un sitio estático: no puede guardar nada en ningún sitio
   por su cuenta ni enviar nada a escondidas. Lo que hace es preparar la
   dirección de un formulario de Google **ya relleno** con el resultado y
   abrirla: el alumno ve sus datos, comprueba su nombre y pulsa «Enviar». La
   identidad no la pone la aplicación, la pone Google con el correo del centro.

   La dirección plantilla sale de `CrearFormularioPractica.gs` y vive en
   `envio.json`, junto a `banco.json`:

       { "plantilla": "https://docs.google.com/forms/d/e/…/viewform?usp=pp_url
                       &entry.111=ZZALUMNOZZ&entry.222=ZZPRACTICAZZ&…" }

   Cada ZZ…ZZ es una marca que este módulo sustituye por el valor de verdad.
   Si el archivo no está (o no se puede leer), no pasa nada: el botón de enviar
   sencillamente no aparece y quedan el de copiar y el de descargar.
   ===================================================================== */

const Envio = (() => {

  let cfg = null;          // { plantilla } o null
  let intentado = false;

  /* Lee envio.json una sola vez. Nunca lanza: la ausencia del archivo es un
     estado normal, no un error. */
  async function preparar() {
    if (intentado) return cfg;
    intentado = true;
    try {
      const base = location.href.split('#')[0].replace(/[^/]*$/, '');
      const r = await fetch(base + 'envio.json', { cache: 'no-cache' });
      if (!r.ok) return (cfg = null);
      const d = await r.json();
      cfg = (d && typeof d.plantilla === 'string' && d.plantilla.indexOf('ZZ') >= 0) ? d : null;
    } catch (e) { cfg = null; }
    return cfg;
  }

  const disponible = () => !!cfg;

  /* Los valores que van a cada marca. El orden no importa: se sustituye por
     nombre. Lo que no exista se queda en blanco, nunca con la marca a la vista. */
  function valores(r, contenidos) {
    const coma = x => String(x).replace('.', ',');
    return {
      ALUMNO: r.alumno || '',
      PRACTICA: r.titulo || '',
      FECHA: Registro.fechaLocal(r.fecha),
      NOTA: coma(r.nota10),
      NOTAFIN: coma(r.nota10Final),
      HECHOS: r.hechos,
      PREVISTOS: r.previstos,
      COMPLETA: r.completa ? 'sí' : 'no',
      TOTAL: r.notas,
      ACPRI: r.aciertosPrimero,
      ACFIN: r.aciertosFinal,
      REINT: r.reintentos,
      SEGUNDOS: r.segundos,
      CONTENIDOS: contenidos || '',
      CODIGO: Registro.codigo(r)
    };
  }

  function direccion(r, contenidos) {
    if (!cfg) return '';
    const v = valores(r, contenidos);
    return cfg.plantilla.replace(/ZZ([A-Z]+)ZZ/g, (m, clave) =>
      Object.prototype.hasOwnProperty.call(v, clave) ? encodeURIComponent(v[clave]) : '');
  }

  return { preparar, disponible, direccion };
})();
