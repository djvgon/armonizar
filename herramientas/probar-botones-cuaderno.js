/* Comprueba los dos botones de la cabecera del configurador —«Ver el cuaderno →» y
   «Ver los resultados →»— y sus gemelos de la zona C: que aparecen solo con una
   dirección válida, que cada uno valida LO SUYO, que no se pisan, y que la dirección
   se queda guardada en este navegador.

   node herramientas/probar-botones-cuaderno.js      (con el servidor en el 8098) */

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8098';
const CUADERNO = 'https://script.google.com/a/macros/murciaeduca.es/s/AKfycbxAAA-BBB_CCC/exec';
const HOJA = 'https://docs.google.com/spreadsheets/d/1yHGzGOOovaF5VqcSc0xl85ArLmFSHiecAvYfbTXIT6A/edit';

let fallos = 0;
const comprobar = (que, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) fallos++;
  console.log('  ' + (bien ? '✓' : '✗') + ' ' + que
    + (bien ? '' : '\n      esperaba ' + JSON.stringify(esperado) + '\n      y da    ' + JSON.stringify(real)));
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pag = await nav.newPage({ viewport: { width: 1280, height: 900 } });
  const errores = [];
  pag.on('pageerror', e => errores.push('pageerror: ' + e.message));
  pag.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });

  await pag.goto(BASE + '/configurar.html');
  await pag.waitForTimeout(900);

  const estado = () => pag.evaluate(() => {
    const d = s => {
      const e = document.querySelector(s);
      if (!e) return null;
      return {
        oculto: e.hidden === true,
        apagado: e.getAttribute('aria-disabled') === 'true',
        href: (e.getAttribute('href') || '').slice(0, 70),
        texto: e.textContent.trim()
      };
    };
    return {
      cuaderno: d('#btn-cuaderno'), resultados: d('#btn-resultados'),
      cuadernoC: d('#btn-cuaderno-c'), resultadosC: d('#btn-resultados-c'),
      orden: [...document.querySelectorAll('.accesos-cabecera a')].map(a => a.textContent.trim()),
      ordenC: [...document.querySelectorAll('#paso-envio .botonera a')].map(a => a.textContent.trim()),
      guardado: { c: localStorage.getItem('armonizar.cuaderno'), r: localStorage.getItem('armonizar.respuestas') }
    };
  });

  console.log('\n1) Al abrir, con las dos casillas vacías');
  let e = await estado();
  comprobar('el botón del cuaderno existe', !!e.cuaderno, true);
  comprobar('el del cuaderno está escondido', e.cuaderno.oculto, true);
  comprobar('el de resultados está escondido', e.resultados.oculto, true);
  comprobar('el del cuaderno en la zona C está apagado', e.cuadernoC.apagado, true);
  comprobar('orden en la cabecera: cuaderno antes que resultados',
    e.orden, ['Ver el cuaderno →', 'Ver los resultados →', 'Ir a la página del alumno →']);
  comprobar('orden en la zona C: cuaderno antes que la hoja',
    e.ordenC, ['Abrir el cuaderno →', 'Abrir la hoja de resultados →']);

  console.log('\n2) Una dirección que NO es una aplicación web');
  await pag.fill('#envio-cuaderno', 'https://docs.google.com/spreadsheets/d/abc/edit');
  await pag.waitForTimeout(150);
  e = await estado();
  comprobar('sigue escondido', e.cuaderno.oculto, true);
  comprobar('la casilla se marca inválida', await pag.getAttribute('#envio-cuaderno', 'aria-invalid'), 'true');
  comprobar('no se guarda nada', e.guardado.c, '');

  console.log('\n3) La dirección de pruebas /dev, que no vale');
  await pag.fill('#envio-cuaderno', CUADERNO.replace('/exec', '/dev'));
  await pag.waitForTimeout(150);
  e = await estado();
  comprobar('sigue escondido', e.cuaderno.oculto, true);

  console.log('\n4) La dirección buena');
  await pag.fill('#envio-cuaderno', CUADERNO);
  await pag.waitForTimeout(150);
  e = await estado();
  comprobar('aparece en la cabecera', e.cuaderno.oculto, false);
  comprobar('apunta al cuaderno', e.cuaderno.href, CUADERNO.slice(0, 70));
  comprobar('el de la zona C se enciende', e.cuadernoC.apagado, false);
  comprobar('queda guardado', e.guardado.c, CUADERNO);
  comprobar('el de resultados NO se ha encendido', e.resultados.oculto, true);

  console.log('\n5) Y la hoja de respuestas, en su casilla, sin pisarse');
  await pag.fill('#envio-respuestas', HOJA);
  await pag.waitForTimeout(150);
  e = await estado();
  comprobar('aparece el de resultados', e.resultados.oculto, false);
  comprobar('apunta a la hoja', e.resultados.href, HOJA.slice(0, 70));
  comprobar('el del cuaderno sigue apuntando al cuaderno', e.cuaderno.href, CUADERNO.slice(0, 70));
  comprobar('las dos direcciones guardadas, cada una en su clave',
    e.guardado, { c: CUADERNO, r: HOJA });

  console.log('\n6) Al recargar, las dos siguen puestas');
  await pag.reload();
  await pag.waitForTimeout(900);
  e = await estado();
  comprobar('el del cuaderno sigue visible', e.cuaderno.oculto, false);
  comprobar('el de resultados sigue visible', e.resultados.oculto, false);
  comprobar('la casilla del cuaderno se rellena sola',
    await pag.inputValue('#envio-cuaderno'), CUADERNO);

  console.log('\n7) Y la dirección del cuaderno NO entra en envio.json');
  const json = await pag.evaluate(() => {
    const campo = document.querySelector('#envio-plantilla');
    campo.value = 'https://docs.google.com/forms/d/e/XYZ/viewform?usp=pp_url&entry.1=ZZALUMNOZZ&entry.2=ZZCODIGOZZ';
    campo.dispatchEvent(new Event('input'));
    return JSON.stringify({ plantilla: campo.value.trim() });
  });
  comprobar('envio.json solo lleva la plantilla', json.indexOf('script.google.com') < 0, true);

  console.log('\nerrores de la página: ' + (errores.length ? '\n  ' + errores.join('\n  ') : 'ninguno'));
  console.log(fallos ? '\n>>> ' + fallos + ' COMPROBACIONES FALLIDAS' : '\n>>> todo correcto');
  await nav.close();
  if (fallos || errores.length) process.exitCode = 1;
})();
