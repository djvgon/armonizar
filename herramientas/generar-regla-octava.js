/* =====================================================================
   generar-regla-octava.js — Reconstruye REGLA-DE-LA-OCTAVA-ENTERA.md
   desde el motor, recorriendo todos los contextos posibles.

   POR QUÉ EXISTE ESTE ARCHIVO. El documento dice de sí mismo que está
   generado desde `js/reglas.js` y que, si cambia una regla, cambian los
   dos a la vez. La primera versión se generó con un guion que no se
   guardó en ninguna parte, de modo que el documento se fue quedando
   desfasado sin que nadie pudiera notarlo: el 5/10/2026 le faltaba el
   II6 sobre el 4.º grado ascendente y sobraba una fila del 4.º que baja
   al 3.º. Ahora el guion vive aquí y se vuelve a pasar cada vez que se
   toca una regla.

   CÓMO FUNCIONA. No lee el código de las reglas: lo EJECUTA. Para cada
   modo, cada grado del bajo y cada nota anterior y siguiente posibles
   —en las dos octavas que convierten un mismo par de grados en paso o
   en salto— construye un bajo de verdad y le pregunta al motor qué
   propone sobre la nota del medio. Después agrupa los contextos que dan
   la misma respuesta, que es lo que convierte miles de combinaciones en
   unas pocas docenas de filas.

   Se usa `Reglas.proponerEn`, no `Reglas.proponer`: el segundo aplica
   encima la sintaxis de la cadencia, que reescribe cifras mirando el
   fragmento entero. Lo que el documento describe son LAS REGLAS.

   USO
     node herramientas/generar-regla-octava.js > REGLA-DE-LA-OCTAVA-ENTERA.md
   Necesita Playwright y el Chromium del contenedor, porque los módulos
   de la aplicación son de navegador; se sirve la carpeta por HTTP en un
   puerto libre y se ejecuta todo dentro de la página.
   ===================================================================== */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const PUERTO = 8123;

const TIPOS = {
  'text/html': ['.html'], 'text/javascript': ['.js'], 'text/css': ['.css'],
  'application/json': ['.json'], 'font/woff2': ['.woff2']
};
const tipoDe = f => Object.keys(TIPOS).find(t => TIPOS[t].includes(path.extname(f))) || 'application/octet-stream';

function servidor() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const f = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': tipoDe(f) });
      res.end(fs.readFileSync(f));
    });
    s.listen(PUERTO, '127.0.0.1', () => resolve(s));
  });
}

const PAGINA = `<!doctype html><meta charset="utf-8">
<script src="js/teoria.js"></script>
<script src="js/reglas.js"></script>
<script src="js/ejercicios.js"></script>`;

(async () => {
  fs.writeFileSync(path.join(RAIZ, '_ro_tmp.html'), PAGINA);
  const srv = await servidor();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  await p.goto('http://127.0.0.1:' + PUERTO + '/_ro_tmp.html', { waitUntil: 'networkidle' });

  const datos = await p.evaluate(() => {
    const RO = Ejercicios.REPERTORIO_RO;
    const MODOS = [
      { nombre: 'mayor', ton: { tonica: 'C', modo: 'mayor' } },
      { nombre: 'menor', ton: { tonica: 'A', modo: 'menor' } }
    ];
    /* La nota del grado g en la octava que toque. La escala natural da letra y
       alteración de cada grado; la octava se elige para que el bajo quede en su
       registro y para poder forzar paso o salto con el mismo par de grados. */
    const notaDe = (ton, g, oct) => {
      const e = Teoria.escalaNatural(ton)[(g - 1) % 7];
      const alt = e.alt === 1 ? '#' : e.alt === 2 ? '##' : e.alt === -1 ? 'b' : e.alt === -2 ? 'bb' : '';
      return e.letra + alt + oct;
    };
    const filas = [];
    MODOS.forEach(M => {
      for (let g = 1; g <= 7; g++) {
        const centro = notaDe(M.ton, g, 3);
        // Vecinos: nada (principio o final de frase) y los siete grados en tres octavas,
        // que es lo que convierte un mismo par en 2.ª, en salto corto o en salto largo.
        const vecinos = [null];
        for (let h = 1; h <= 7; h++) for (const o of [2, 3, 4]) vecinos.push(notaDe(M.ton, h, o));
        vecinos.forEach(ant => {
          vecinos.forEach(sig => {
            const notas = [];
            if (ant) notas.push([ant, 1]);
            notas.push([centro, 1]);
            if (sig) notas.push([sig, 1]);
            /* Una nota de relleno detrás, para que la del medio no sea la penúltima:
               la regla de la cadencia mira esa posición y falsearía el resultado. */
            if (sig) notas.push([notaDe(M.ton, 1, 3), 1]);
            if (notas.length < 2) return;
            const ej = { modo: 'armonizar', tonalidad: M.ton, compas: [4, 4],
              compases: [notas], repertorio: RO, modulaciones: [] };
            let r;
            try { r = Reglas.proponerEn(ej, M.ton, null); } catch (e) { return; }
            const i = ant ? 1 : 0;
            const x = r[i];
            if (!x || !x.admisibles.length) return;
            filas.push({ modo: M.nombre, grado: g, regla: x.regla,
              llegada: x.contexto.llegada, salida: x.contexto.salida,
              cifras: x.admisibles.join('·'),
              romanos: x.admisibles.map(id => { try { return Teoria.romano(id, Teoria.nota(centro), M.ton); } catch (e) { return '?'; } }).join('·') });
          });
        });
      }
    });
    return filas;
  });

  await b.close();
  srv.close();
  fs.unlinkSync(path.join(RAIZ, '_ro_tmp.html'));
  if (errores.length) { console.error('ERRORES EN LA PÁGINA:\n' + errores.join('\n')); process.exit(1); }

  // ---- Agrupar: misma regla y mismas cifras → una fila, con todos sus contextos ----
  const MOV = { inicio: '—', final: '—', unisono: 'repite', '2asc': '2.ª asc', '2desc': '2.ª desc', saltoAsc: 'salto asc', saltoDesc: 'salto desc' };
  const CIFRA = { '53': '—', '6': '6', '64': '6/4', '7': '7', '65': '6/5', '43': '4/3', '42': '4/2',
    '7+': '7/+', '+6': '+6', '65d': '6/5̸', '+4': '+4' };
  const etiqueta = c => c.split('·').map(x => CIFRA[x] || x).join(' · ');
  const ORDEN_MOV = ['—', 'repite', '2.ª asc', '2.ª desc', 'salto asc', 'salto desc'];
  const ORDEN_REGLA = ['R0 V/V', 'R1 final', 'R2 cadencia', 'R3 repetición', 'R4 arpegio', 'R5 funcional', 'R6 4̂ salta', 'R7 RO'];

  const grupos = new Map();
  datos.forEach(f => {
    const k = [f.modo, f.grado, f.regla, f.cifras, f.romanos].join('|');
    if (!grupos.has(k)) grupos.set(k, { ...f, llegadas: new Set(), salidas: new Set(), n: 0 });
    const gr = grupos.get(k);
    gr.llegadas.add(MOV[f.llegada]); gr.salidas.add(MOV[f.salida]); gr.n++;
  });

  const lista = n => {
    const v = ORDEN_MOV.filter(x => n.has(x));
    return v.length === ORDEN_MOV.length ? 'cualquiera' : v.join(', ');
  };
  const porRegla = (a, b) => {
    const ia = ORDEN_REGLA.findIndex(r => a.regla.startsWith(r.split(' ')[0]));
    const ib = ORDEN_REGLA.findIndex(r => b.regla.startsWith(r.split(' ')[0]));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.cifras.localeCompare(b.cifras);
  };

  const hoy = new Date().toISOString().slice(0, 10).split('-').reverse().join('/');
  const out = [];
  out.push('# La regla de la octava, entera');
  out.push('');
  out.push('Qué acordes caben sobre cada grado del bajo, y qué contexto elige cada uno.');
  out.push('');
  out.push('**No está copiada de ningún libro: está generada desde el motor de la aplicación**');
  out.push('(`js/reglas.js`) por `herramientas/generar-regla-octava.js`, que recorre **' + datos.length.toLocaleString('es-ES') + ' contextos**');
  out.push('—cada grado del bajo con cada nota anterior y cada nota siguiente posibles, en las');
  out.push('octavas que convierten un mismo par de grados en paso o en salto, y en los dos modos—');
  out.push('y agrupa los que dan la misma respuesta. Quedan **' + grupos.size + ' respuestas distintas**.');
  out.push('');
  out.push('Lo que dice aquí es, por tanto, exactamente lo que la aplicación corrige. **Si cambias');
  out.push('una regla, vuelve a pasar el guion**: es lo único que mantiene juntos los apuntes y el');
  out.push('programa.');
  out.push('');
  out.push('Generado el ' + hoy + '.');
  out.push('');
  out.push('## Cómo se lee');
  out.push('');
  out.push('Son siete reglas **en orden de precedencia**: se prueban de arriba abajo y **gana la');
  out.push('primera que encaja** dejando alguna cifra del repertorio. Por eso, dentro de cada grado,');
  out.push('las filas van en ese orden y una de abajo solo se aplica si ninguna de arriba valía.');
  out.push('');
  out.push('«Llega» y «sale» dicen cómo se mueve el bajo respecto de la nota anterior y de la');
  out.push('siguiente; **—** es el principio o el final de la frase. Las cifras van como en la paleta');
  out.push('del alumno: **—** es el 5/3 · **7/+** el V7 · **+6** el V4/3 · **6/5̸** el V6/5 · **+4** el V4/2.');
  out.push('');
  out.push('**Una advertencia**: la tabla recorre *todos* los contextos posibles, también los que no');
  out.push('se dan nunca en música de verdad —una frase que acabe sobre el 2.º grado, por ejemplo—.');
  out.push('Si te tropiezas con una fila rara, probablemente sea una de esas: no es un error, es un');
  out.push('hueco del espacio de combinaciones que nadie visita.');
  out.push('');
  ['mayor', 'menor'].forEach(modo => {
    out.push('---');
    out.push('');
    out.push('## Modo ' + modo);
    out.push('');
    for (let g = 1; g <= 7; g++) {
      const fs_ = [...grupos.values()].filter(x => x.modo === modo && x.grado === g).sort(porRegla);
      if (!fs_.length) continue;
      out.push('### Sobre el ' + g + '.º grado del bajo');
      out.push('');
      out.push('| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |');
      out.push('|---|---|---|---|---|');
      fs_.forEach(x => {
        out.push('| ' + x.regla + ' | ' + lista(x.llegadas) + ' | ' + lista(x.salidas)
          + ' | **' + etiqueta(x.cifras) + '** | ' + x.romanos.split('·').join(' ') + ' |');
      });
      out.push('');
    }
  });
  process.stdout.write(out.join('\n'));
})();
