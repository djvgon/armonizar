/* =====================================================================
   voz.js — Explicación HABLADA de los errores (decisión 121).

   Lee en voz alta lo que la corrección ya dice por escrito. Usa el
   sintetizador del propio navegador (Web Speech API): gratis, sin
   conexión, sin clave y sin servidor, con las voces en español que el
   alumno ya tiene instaladas en su Mac, su iPad, su móvil o su PC.

   No hay ningún modelo de lenguaje detrás, y es a propósito: el motor ya
   sabe por qué falla cada nota —qué función sigue a cuál, cómo resuelven
   la sensible, la séptima y el 6/4 cadencial—, y eso es más exacto que
   cualquier redacción improvisada. Lo único que hace este archivo es
   pronunciarlo bien.

     Voz.hay()          → ¿este navegador tiene voz?
     Voz.decir(texto)   → lo lee (corta lo que estuviera diciendo)
     Voz.parar()
     Voz.hablando()
     Voz.comoSuena(txt) → el texto tal como se va a pronunciar (para probar)

   Cuidados que da esta capa:
     · La voz se elige en español (es-ES primero, luego cualquier es-*, y
       de preferencia una instalada en el aparato). Si no se elige, el
       sistema lee el español con acento inglés.
     · Las voces tardan en cargarse: la lista puede venir vacía la primera
       vez y llega después con `voiceschanged`.
     · Chrome corta las frases largas a los ~15 segundos: el texto se
       parte en frases y se encolan varias.
     · Lo que se pronuncia no es lo que se escribe. «sol♯3» se dice «sol
       sostenido»; «II» se dice «segundo grado»; «6/5» se dice «seis
       cinco»; «—» se dice «en estado fundamental».
   ===================================================================== */
const Voz = (() => {
  'use strict';
  const api = (typeof window !== 'undefined' && window.speechSynthesis) || null;

  let voces = [];
  function cargarVoces() { try { voces = api ? (api.getVoices() || []) : []; } catch (e) { voces = []; } }
  if (api) {
    cargarVoces();
    if (typeof api.addEventListener === 'function') api.addEventListener('voiceschanged', cargarVoces);
    else api.onvoiceschanged = cargarVoces;
  }

  /* La mejor voz española que haya: es-ES antes que es-MX o es-AR, y una
     instalada en el aparato antes que una de servidor (suena sin esperar). */
  function elegida() {
    if (!voces.length) cargarVoces();
    const es = voces.filter(v => /^es/i.test(v.lang || ''));
    if (!es.length) return null;
    const punto = v => (/^es[-_]ES/i.test(v.lang) ? 2 : 0) + (v.localService ? 1 : 0);
    return es.slice().sort((a, b) => punto(b) - punto(a))[0];
  }

  const hay = () => !!api;

  /* ---------- De lo escrito a lo dicho ---------- */

  const ALT = { '♯': ' sostenido', '♭': ' bemol', '♮': ' becuadro', '♯♯': ' doble sostenido', '♭♭': ' doble bemol' };
  // Las cifras, de la más larga a la más corta: «6/5̸» antes que «6/5»
  const CIFRAS = [
    ['6/5̸', 'seis cinco tachado'],
    ['7/+', 'séptima de dominante'],
    ['6/4', 'seis cuatro'],
    ['6/5', 'seis cinco'],
    ['4/3', 'cuatro tres'],
    ['4/2', 'cuatro dos'],
    ['5/3', 'estado fundamental'],
    ['+6', 'más seis'],
    ['+4', 'más cuatro'],
    ['—', 'en estado fundamental']
  ];
  const GRADOS = [
    ['V/V', 'dominante de la dominante'],
    ['VII', 'séptimo grado'], ['VI', 'sexto grado'], ['IV', 'cuarto grado'],
    ['III', 'tercer grado'], ['II', 'segundo grado'], ['V', 'quinto grado'], ['I', 'primer grado']
  ];
  const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function comoSuena(txt) {
    let s = String(txt == null ? '' : txt);
    s = s.replace(/\s*·\s*/g, '. ');
    s = s.replace(/[«»"]/g, '');
    s = s.replace(/→/g, ' a ');
    // Nombres de nota: se dicen las alteraciones y se calla la octava
    s = s.replace(/\b(do|re|mi|fa|sol|la|si)(♯♯|♭♭|♯|♭|♮)?(-?\d)\b/gi, (m, n, alt) => n + (alt ? ALT[alt] : ''));
    s = s.replace(/\b(do|re|mi|fa|sol|la|si)(♯♯|♭♭|♯|♭|♮)/gi, (m, n, alt) => n + ALT[alt]);
    CIFRAS.forEach(([de, a]) => { s = s.split(de).join(a); });
    // Los grados, en mayúsculas y como palabra suelta
    GRADOS.forEach(([de, a]) => { s = s.replace(new RegExp('(^|[^A-Za-z/])' + escapar(de) + '(?![A-Za-z/])', 'g'), '$1' + a); });
    return s.replace(/\s+/g, ' ').trim();
  }

  /* ---------- Decir ---------- */

  function parar() { try { if (api) api.cancel(); } catch (e) { /* nada */ } }
  const hablando = () => !!api && (api.speaking || api.pending);

  // En trozos: Chrome corta las frases largas
  function trozos(s) {
    // Sin «lookbehind»: hay iPads que todavía no lo entienden
    const frases = s.match(/[^.:;?!]+[.:;?!]*/g) || [s];
    const out = []; let act = '';
    frases.forEach(f => {
      if ((act + ' ' + f).trim().length > 180) { if (act) out.push(act.trim()); act = f; }
      else act = (act + ' ' + f).trim();
    });
    if (act) out.push(act.trim());
    return out.filter(x => x);
  }

  function decir(texto) {
    if (!api) return false;
    const s = comoSuena(texto);
    if (!s) return false;
    parar();
    const v = elegida();
    trozos(s).forEach(t => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = (v && v.lang) || 'es-ES';
      if (v) u.voice = v;
      u.rate = 0.95;
      api.speak(u);
    });
    return true;
  }

  return { hay, decir, parar, hablando, comoSuena, vocesEs: () => voces.filter(v => /^es/i.test(v.lang || '')).map(v => v.name + ' (' + v.lang + ')') };
})();
