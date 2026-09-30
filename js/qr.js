/* Códigos QR, hechos aquí mismo (decisión 217).

   Diego, 30/9/2026: «¿Es posible obtener un enlace QR que pueda proyectar para que mis
   alumnos practiquen con un ejercicio que acabo de configurar?». Sí, y sin pedirle nada a
   nadie: un código QR es un dibujo que se calcula, no un servicio que se consulta.

   POR QUÉ NO SE USA UNA LIBRERÍA DE FUERA. La aplicación entera son archivos sueltos que
   se sirven tal cual desde GitHub Pages: no hay compilación, no hay dependencias y
   funciona sin conexión una vez cargada. Llamar a un generador ajeno —por CDN o, peor, por
   una dirección tipo `chart.googleapis.com/chart?...`— metería un tercero en medio, dejaría
   de funcionar el día que ese tercero cambie o desaparezca, y mandaría fuera la dirección
   de las fichas de sus alumnos. Son doscientas líneas de aritmética: se escriben y ya está.

   QUÉ HACE. Texto → matriz de módulos (`true` = negro). Solo modo BYTE (UTF-8), que es lo
   que hacen falta para direcciones web con base64url —mayúsculas y minúsculas mezcladas,
   que el modo alfanumérico no admite—. Versiones 1 a 40 y los cuatro niveles de corrección.

   Norma: ISO/IEC 18004. Los nombres de los pasos son los de la norma para que se pueda
   seguir con ella al lado.
*/
const QR = (function () {
  'use strict';

  /* ---------- Tablas de la norma ----------
     Por versión (1..40) y nivel de corrección: cuántos códigos de corrección lleva cada
     bloque y en cuántos bloques se parte el mensaje. */
  const NIVELES = { L: 0, M: 1, Q: 2, H: 3 };
  const EC_POR_BLOQUE = [
    // L
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // M
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    // Q
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // H
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  const BLOQUES = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  /* ---------- Cuántos módulos de datos caben en una versión ----------
     Se cuenta el cuadrado entero y se le restan los patrones fijos: los tres ojos con su
     separación, las dos líneas de sincronismo, los cuadraditos de alineación (que se
     solapan con el sincronismo) y, a partir de la versión 7, los dos bloques que dicen la
     versión. Sale de la norma y se calcula en vez de ponerlo en otra tabla: una tabla
     menos que se puede copiar mal. */
  function modulosDeDatos(v) {
    let n = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const alin = Math.floor(v / 7) + 2;
      n -= (25 * alin - 10) * alin - 55;
      if (v >= 7) n -= 36;
    }
    return n;
  }
  const codigosTotales = v => Math.floor(modulosDeDatos(v) / 8);
  const codigosDeDatos = (v, nivel) =>
    codigosTotales(v) - EC_POR_BLOQUE[nivel][v] * BLOQUES[nivel][v];

  /* ---------- Aritmética del cuerpo de Galois GF(256) ----------
     La corrección de errores (Reed-Solomon) se hace en el cuerpo de 256 elementos con el
     polinomio 0x11D. Multiplicar es la operación cara; se hace a mano, bit a bit. */
  function mul(a, b) {
    let r = 0;
    for (let i = 7; i >= 0; i--) {
      r = (r << 1) ^ ((r >>> 7) * 0x11D);
      r ^= ((b >>> i) & 1) * a;
    }
    return r & 0xFF;
  }
  // El polinomio divisor de grado `grado`: (x - 2^0)(x - 2^1)…
  function divisor(grado) {
    const d = new Uint8Array(grado);
    d[grado - 1] = 1;
    let raiz = 1;
    for (let i = 0; i < grado; i++) {
      for (let j = 0; j < grado; j++) {
        d[j] = mul(d[j], raiz);
        if (j + 1 < grado) d[j] ^= d[j + 1];
      }
      raiz = mul(raiz, 0x02);
    }
    return d;
  }
  // El resto de dividir los datos por el divisor: son los códigos de corrección
  function corregir(datos, grado) {
    const div = divisor(grado);
    const resto = new Uint8Array(grado);
    for (const b of datos) {
      const factor = b ^ resto[0];
      resto.copyWithin(0, 1);
      resto[grado - 1] = 0;
      for (let i = 0; i < grado; i++) resto[i] ^= mul(div[i], factor);
    }
    return resto;
  }

  /* ---------- Del texto a los códigos de datos ---------- */
  function bytesDe(texto) {
    return Array.from(new TextEncoder().encode(String(texto)));
  }
  // Cuántos bits ocupa la cuenta de caracteres en modo byte, según la versión
  const bitsDeCuenta = v => (v <= 9 ? 8 : 16);

  function codigosDesde(bytes, v, nivel) {
    const bits = [];
    const mete = (valor, n) => { for (let i = n - 1; i >= 0; i--) bits.push((valor >>> i) & 1); };
    mete(0b0100, 4);                       // modo byte
    mete(bytes.length, bitsDeCuenta(v));
    bytes.forEach(b => mete(b, 8));
    const tope = codigosDeDatos(v, nivel) * 8;
    if (bits.length > tope) return null;    // no cabe en esta versión
    // Terminador, relleno hasta el byte y relleno alterno 0xEC / 0x11
    mete(0, Math.min(4, tope - bits.length));
    mete(0, (8 - bits.length % 8) % 8);
    for (let relleno = 0xEC; bits.length < tope; relleno ^= 0xEC ^ 0x11) mete(relleno, 8);
    const out = new Uint8Array(bits.length / 8);
    bits.forEach((bit, i) => { out[i >>> 3] |= bit << (7 - (i & 7)); });
    return out;
  }

  /* ---------- Bloques y entrelazado ----------
     El mensaje se parte en bloques, cada uno con sus códigos de corrección, y después se
     entrelazan: primero el primer código de cada bloque, luego el segundo… Así una mancha
     en el papel se reparte entre todos los bloques en vez de destrozar uno. */
  function entrelazar(datos, v, nivel) {
    const nBloques = BLOQUES[nivel][v];
    const ecPorBloque = EC_POR_BLOQUE[nivel][v];
    const total = codigosTotales(v);
    const cortos = nBloques - total % nBloques;          // bloques con un código menos
    const largoCorto = Math.floor(total / nBloques) - ecPorBloque;
    const bloques = [];
    for (let i = 0, k = 0; i < nBloques; i++) {
      const largo = largoCorto + (i < cortos ? 0 : 1);
      const dat = datos.slice(k, k + largo); k += largo;
      bloques.push({ dat, ec: corregir(dat, ecPorBloque) });
    }
    const out = [];
    for (let i = 0; i <= largoCorto; i++) {
      bloques.forEach((b, j) => { if (i < b.dat.length) out.push(b.dat[i]); });
    }
    for (let i = 0; i < ecPorBloque; i++) bloques.forEach(b => out.push(b.ec[i]));
    return Uint8Array.from(out);
  }

  /* ---------- La matriz ---------- */
  function centrosDeAlineacion(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2;
    const paso = (v === 32) ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    /* Quedan en orden creciente: el 6 delante y los demás detrás, de menor a mayor. Por eso
       cada uno se mete en la POSICIÓN 1 y no al principio. */
    const pos = [6];
    for (let p = v * 4 + 10; pos.length < n; p -= paso) pos.splice(1, 0, p);
    return pos;
  }

  function nuevaMatriz(v) {
    const n = v * 4 + 17;
    const m = [], fijo = [];
    for (let i = 0; i < n; i++) { m.push(new Array(n).fill(false)); fijo.push(new Array(n).fill(false)); }
    const pon = (x, y, val) => {
      if (x < 0 || y < 0 || x >= n || y >= n) return;
      m[y][x] = val; fijo[y][x] = true;
    };
    /* PRIMERO EL SINCRONISMO Y DESPUÉS LOS OJOS, y no al revés: la fila y la columna 6
       recorren el cuadrado entero, así que si se pintan después se comen los ojos y el
       código no lo reconoce ningún lector. Pintando antes, los ojos las tapan en los
       extremos, que es justo lo que pide la norma. */
    for (let i = 0; i < n; i++) { pon(6, i, i % 2 === 0); pon(i, 6, i % 2 === 0); }
    // Los tres ojos, con su marco blanco
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([ox, oy]) => {
      for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
        const d = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        pon(ox + dx, oy + dy, d !== 2 && d <= 3);
      }
    });
    // Cuadraditos de alineación, salvo donde chocarían con los ojos
    const cen = centrosDeAlineacion(v);
    cen.forEach((cy, i) => cen.forEach((cx, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === cen.length - 1) || (i === cen.length - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        pon(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }));
    // El módulo negro que siempre está
    pon(8, n - 8, true);
    /* Sitio reservado para el formato: se marca como fijo para que los datos no lo pisen;
       lo que va dentro se escribe después, cuando se sepa qué máscara ha ganado. */
    for (let i = 0; i < 9; i++) { fijo[8][i] = true; fijo[i][8] = true; }
    for (let i = 0; i < 8; i++) { fijo[8][n - 1 - i] = true; fijo[n - 1 - i][8] = true; }
    // A partir de la versión 7, los dos bloques que dicen la versión
    if (v >= 7) {
      let resto = v;
      for (let i = 0; i < 12; i++) resto = (resto << 1) ^ ((resto >>> 11) * 0x1F25);
      const datos = v << 12 | resto;
      for (let i = 0; i < 18; i++) {
        const bit = ((datos >>> i) & 1) === 1;
        const a = n - 11 + i % 3, b = Math.floor(i / 3);
        pon(a, b, bit); pon(b, a, bit);
      }
    }
    return { m, fijo, n };
  }

  // Los códigos, serpenteando de abajo arriba en columnas de dos, saltando lo fijo
  function ponerDatos(est, codigos) {
    const { m, fijo, n } = est;
    let i = 0;
    for (let der = n - 1; der >= 1; der -= 2) {
      if (der === 6) der = 5;                       // la columna de sincronismo no cuenta
      for (let paso = 0; paso < n; paso++) {
        for (let k = 0; k < 2; k++) {
          const x = der - k;
          const arriba = ((der + 1) & 2) === 0;
          const y = arriba ? n - 1 - paso : paso;
          if (fijo[y][x] || i >= codigos.length * 8) continue;
          m[y][x] = ((codigos[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
    }
  }

  const MASCARAS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => x * y % 2 + x * y % 3 === 0,
    (x, y) => (x * y % 2 + x * y % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
  ];

  function aplicarMascara(est, k) {
    const { m, fijo, n } = est;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!fijo[y][x] && MASCARAS[k](x, y)) m[y][x] = !m[y][x];
    }
  }

  function ponerFormato(est, nivel, mascara) {
    const { m, n } = est;
    const NIV = [0b01, 0b00, 0b11, 0b10];            // L, M, Q, H en la norma
    const datos = NIV[nivel] << 3 | mascara;
    let resto = datos;
    for (let i = 0; i < 10; i++) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
    const bits = ((datos << 10 | resto) ^ 0x5412) & 0x7FFF;
    const b = i => ((bits >>> i) & 1) === 1;
    /* Las quince casillas del formato van DOS VECES: una repartida alrededor del ojo de
       arriba a la izquierda y otra partida entre los otros dos, para que se pueda leer
       aunque una esquina esté tapada. `m[fila][columna]`: cuidado con no cambiarlos de
       orden, que es lo que tenía roto el código entero. */
    for (let i = 0; i <= 5; i++) m[i][8] = b(i);          // columna 8, filas 0..5
    m[7][8] = b(6); m[8][8] = b(7); m[8][7] = b(8);
    for (let i = 9; i < 15; i++) m[8][14 - i] = b(i);     // fila 8, columnas 5..0
    for (let i = 0; i < 8; i++) m[8][n - 1 - i] = b(i);   // fila 8, por la derecha
    for (let i = 8; i < 15; i++) m[n - 15 + i][8] = b(i); // columna 8, por abajo
    m[n - 8][8] = true;                                   // el módulo negro de siempre
  }

  /* La penalización de la norma: se prueban las ocho máscaras y gana la que deja el dibujo
     menos molesto para el lector —menos rachas largas, menos cuadrados de un color, menos
     falsos ojos y un reparto de negro y blanco cercano a la mitad—. */
  function penalizacion(est) {
    const { m, n } = est;
    let p = 0;
    const racha = fila => {
      let color = fila[0], largo = 1;
      for (let i = 1; i < fila.length; i++) {
        if (fila[i] === color) { largo++; if (largo === 5) p += 3; else if (largo > 5) p += 1; }
        else { color = fila[i]; largo = 1; }
      }
    };
    for (let y = 0; y < n; y++) racha(m[y]);
    for (let x = 0; x < n; x++) racha(m.map(f => f[x]));
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3;
    }
    const PATRON = [true, false, true, true, true, false, true];
    const busca = fila => {
      for (let i = 0; i + 7 <= fila.length; i++) {
        if (!PATRON.every((v, k) => fila[i + k] === v)) continue;
        const antes = fila.slice(Math.max(0, i - 4), i);
        const despues = fila.slice(i + 7, i + 11);
        if (antes.length === 4 && antes.every(v => !v)) p += 40;
        if (despues.length === 4 && despues.every(v => !v)) p += 40;
      }
    };
    for (let y = 0; y < n; y++) busca(m[y]);
    for (let x = 0; x < n; x++) busca(m.map(f => f[x]));
    let negros = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) negros++;
    const k = Math.floor(Math.abs(negros * 20 - n * n * 10) / (n * n)) ;
    p += k * 10;
    return p;
  }

  /* ---------- La función que se usa ----------
     `hacer(texto, opciones)` devuelve { modulos, n, version, nivel } o lanza si no cabe.
     `nivel` por defecto 'M': aguanta manchas y sombras de proyector sin crecer demasiado. */
  function hacer(texto, opciones) {
    const op = opciones || {};
    const nivel = NIVELES[op.nivel || 'M'];
    const bytes = bytesDe(texto);
    for (let v = (op.minima || 1); v <= 40; v++) {
      const datos = codigosDesde(bytes, v, nivel);
      if (!datos) continue;
      const codigos = entrelazar(datos, v, nivel);
      const est = nuevaMatriz(v);
      ponerDatos(est, codigos);
      // La máscara: se prueban las ocho y se queda la menos molesta
      let mejor = -1, mejorP = Infinity;
      for (let k = 0; k < 8; k++) {
        aplicarMascara(est, k); ponerFormato(est, nivel, k);
        const p = penalizacion(est);
        if (p < mejorP) { mejorP = p; mejor = k; }
        aplicarMascara(est, k);                      // deshacer: la máscara es su propia inversa
      }
      aplicarMascara(est, mejor); ponerFormato(est, nivel, mejor);
      return { modulos: est.m, n: est.n, version: v, nivel: op.nivel || 'M', mascara: mejor };
    }
    throw new Error('El texto es demasiado largo para un código QR (' + bytes.length + ' bytes).');
  }

  /* El dibujo, en SVG: un solo <path> con un cuadradito por módulo negro. Sale ligero y se
     amplía sin pixelarse, que es lo que hace falta para proyectarlo. El borde blanco de
     cuatro módulos («zona tranquila») lo pide la norma: sin él, muchos lectores no lo ven. */
  function svg(codigo, op) {
    const borde = (op && op.borde !== undefined) ? op.borde : 4;
    const lado = codigo.n + borde * 2;
    let d = '';
    for (let y = 0; y < codigo.n; y++) for (let x = 0; x < codigo.n; x++) {
      if (codigo.modulos[y][x]) d += 'M' + (x + borde) + ' ' + (y + borde) + 'h1v1h-1z';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lado + ' ' + lado + '" '
      + 'shape-rendering="crispEdges" role="img" aria-label="Código QR del enlace">'
      + '<rect width="' + lado + '" height="' + lado + '" fill="#fff"/>'
      + '<path d="' + d + '" fill="#000"/></svg>';
  }

  /* El mismo dibujo en un <canvas>, para poder descargarlo como PNG: hay proyectores y
     pizarras que van por imagen y no por navegador. */
  function canvas(codigo, op) {
    const borde = (op && op.borde !== undefined) ? op.borde : 4;
    const escala = (op && op.escala) || 12;
    const lado = (codigo.n + borde * 2) * escala;
    const c = document.createElement('canvas');
    c.width = lado; c.height = lado;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, lado, lado);
    g.fillStyle = '#000';
    for (let y = 0; y < codigo.n; y++) for (let x = 0; x < codigo.n; x++) {
      if (codigo.modulos[y][x]) g.fillRect((x + borde) * escala, (y + borde) * escala, escala, escala);
    }
    return c;
  }

  return { hacer, svg, canvas, codigosDeDatos, codigosTotales };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = QR;
