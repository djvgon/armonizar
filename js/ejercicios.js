/* =====================================================================
   ejercicios.js — Corpus de ejercicios y utilidades de URL.

   Cada ejercicio es un objeto:
     id          : identificador único (se usa en la URL: #ej=RO-asc-DoM-1)
     coleccion   : nombre del grupo al que pertenece (para el selector)
     titulo      : título corto
     fuente      : de dónde procede (archivo MusicXML, etc.)
     tonalidad   : {tonica:'C', modo:'mayor'} | {tonica:'A', modo:'menor'}
     compas      : [numerador, denominador]
     repertorio  : cifras que verá el alumno en la paleta (ids de Teoria.CIFRADOS)
     compases    : lista de compases; cada compás es una lista de notas [nombre, duración]
                   con la duración en negras (2 = blanca, 4 = redonda)
     respuestas  : una lista por nota con las cifras ADMISIBLES; la PRIMERA es la
                   respuesta modelo que se muestra en la corrección
     preferir    : (opcional) lista de cifras que, si son admisibles en una nota,
                   pasan a ser la respuesta modelo. Sirve para adaptar un mismo
                   ejercicio al curso: con preferir: ['+6'], sobre el grado 6
                   descendente el modelo es la dominante secundaria (+6) en vez
                   de II4/3.
     reintentos  : (opcional, por defecto true) tras corregir, el alumno puede
                   arreglar solo las casillas erróneas (las acertadas quedan
                   fijas) sin ver la solución hasta que la pida. Con false, la
                   corrección muestra la solución de inmediato (un solo intento).
     grados      : (opcional) lista de grados (['I','V','VII']) que se muestra al
                   alumno como «grados en este ejercicio»; si falta, se deducen
                   de las respuestas admisibles.
     ayudaGrados : (opcional) cuánta ayuda recibe el alumno con los grados:
                   'ninguna' (paleta completa, sin lista), 'lista' (paleta
                   completa y lista de grados en juego; valor por defecto) o
                   'paleta' (la paleta solo ofrece los grados en juego).
     modo        : (opcional) tipo de ejercicio:
                   'armonizar' (por defecto): el alumno cifra el bajo y ve la
                       realización de lo que va escribiendo.
                   'cifrar' (Análisis): se muestran bajo y realización modelo a
                       cuatro voces desde el principio y el alumno debe cifrarla.
                   'audicion' (Audición): el alumno ve solo el bajo, escucha la
                       realización modelo (botón «Escuchar», o acorde a acorde) y
                       cifra lo que suena; la realización se ve al corregir.
     realizacion : (opcional, solo en 'armonizar') cuándo puede verse el pentagrama
                   de sol: 'siempre' (por defecto), 'alCorregir' o 'nunca'.
     pedirRomano : (opcional, por defecto true) si el alumno debe indicar también
                   el grado sobre el que se construye la fundamental (I … VII).
                   El grado correcto se deriva de cada cifra admisible
                   (Teoria.romano), así que no hay que escribirlo aquí.
     modulaciones: (opcional) [{nota: i, tonalidad}, …]: desde la nota i (índice
                   desde 0; es el acorde pivote, común a las dos tonalidades)
                   rige la tonalidad nueva. Los grados se leen en la tonalidad
                   que rige en cada nota; en el pivote, en las dos (II = V).
     aviso       : (opcional, con modulaciones) 'completo' (por defecto: se
                   muestra dónde empieza la tonalidad nueva y cuál es) o 'existe'
                   (solo se avisa de que hay una modulación; el alumno marca dónde
                   y cuál; vale el pivote o la primera nota ajena a la anterior).

   Las respuestas de este corpus están fijadas a mano según las reglas
   acordadas (Regla de la octava de Furno + fórmulas de salto, arpegio y
   cadencia). El motor de reglas (reglas.js) se comprueba contra ellas en
   pruebas.html. Para cambiar una respuesta basta editar aquí la lista.

   Un ejercicio puede viajar dentro de la URL (#e=…) codificado con
   Ejercicios.codificar(ejercicio); Ejercicios.decodificar(texto) lo recupera.
   ===================================================================== */

const Ejercicios = (() => {

  // Repertorio de la Regla de la octava (9 botones): tríadas, séptimas diatónicas y V7 marcado (7/+ e inversiones).
  const REPERTORIO_RO = ['53', '6', '65', '43', '7', '7+', '+6', '65d', '+4'];

  const CORPUS = [
  {
    id: 'RO-asc-DoM-1',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 1',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['D3', 2]], [['E3', 2], ['C3', 2]], [['G3', 4]], [['C3', 4]]],
    respuestas: [['53'], ['+6', '6'], ['6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-2',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 2',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['E3', 2]], [['F3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['6'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-3',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 3',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['B2', 2]], [['C3', 2], ['F3', 2]], [['G3', 2], ['G2', 2]], [['C3', 4]]],
    respuestas: [['53'], ['65d', '6'], ['53'], ['65', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-4',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 4',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['A2', 2]], [['B2', 2], ['C3', 2]], [['F2', 2], ['G2', 2]], [['C3', 4]]],
    respuestas: [['53'], ['6', '53'], ['65d', '6'], ['53'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-5',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 5',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['G2', 2]], [['A2', 2], ['B2', 2]], [['C3', 2], ['E3', 2]], [['F3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['6'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-6',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 6',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['D3', 2]], [['B2', 2], ['C3', 2]], [['E3', 2], ['F3', 2]], [['G3', 2], ['G2', 2]], [['C3', 4]]],
    respuestas: [['53'], ['+6', '6'], ['65d', '6'], ['53'], ['6'], ['65', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-DoM-7',
    coleccion: 'RO ascendente en Do mayor',
    titulo: 'Ejercicio 7',
    fuente: 'RO ascendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['E3', 2]], [['F3', 2], ['B2', 2]], [['C3', 2], ['G2', 2]], [['A2', 2], ['B2', 2]], [['C3', 2], ['G2', 2]], [['C3', 4]]],
    respuestas: [['53'], ['6'], ['+4'], ['65d', '6'], ['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-1',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 1',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['F3', 2]], [['E3', 2], ['D3', 2]], [['C3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['+4', '53'], ['6'], ['+6', '6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-2',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 2',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['E3', 2]], [['D3', 2], ['C3', 2]], [['G3', 2], ['C3', 2]]],
    respuestas: [['53'], ['6'], ['+6', '6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-3',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 3',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['D3', 2]], [['C3', 2], ['F3', 2]], [['E3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['+4', '53'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-4',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 4',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C4', 2], ['B3', 2]], [['A3', 2], ['G3', 2]], [['C4', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['6'], ['43', '+6', '6', '53'], ['53', '7+'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-5',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 5',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C4', 4]], [['D4', 2], ['C4', 2]], [['B3', 2], ['A3', 2]], [['G3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['6'], ['43', '+6', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-6',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 6',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C4', 2], ['D4', 2]], [['C4', 2], ['A3', 2]], [['G3', 2], ['F3', 2]], [['E3', 2], ['G3', 2]], [['C3', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['43', '+6', '6', '53'], ['53', '7+'], ['+4'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-DoM-7',
    coleccion: 'RO descendente en Do mayor',
    titulo: 'Ejercicio 7',
    fuente: 'RO DEScendente en Do Mayor.musicxml',
    tonalidad: { tonica: 'C', modo: 'mayor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['C3', 2], ['E3', 2]], [['D3', 2], ['F3', 2]], [['E3', 2], ['C3', 2]], [['G3', 2], ['F3', 2]], [['E3', 2], ['G2', 2]], [['C3', 4]]],
    respuestas: [['53'], ['6'], ['+6', '6'], ['+4'], ['6'], ['53'], ['53', '7+'], ['+4'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-1',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 1',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['D3', 2]], [['C3', 2], ['B2', 2]], [['A2', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['+4', '53'], ['6'], ['+6', '6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-2',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 2',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['C3', 2]], [['B2', 2], ['A2', 2]], [['E3', 2], ['A2', 2]]],
    respuestas: [['53'], ['6'], ['+6', '6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-3',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 3',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['B2', 2]], [['A2', 2], ['D3', 2]], [['C3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['+4', '53'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-4',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 4',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A3', 2], ['G3', 2]], [['F3', 2], ['E3', 2]], [['A3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['6'], ['43', '+6', '6', '53'], ['53', '7+'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-5',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 5',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A3', 4]], [['B3', 2], ['A3', 2]], [['G3', 2], ['F3', 2]], [['E3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['6'], ['43', '+6', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-6',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 6',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A3', 2], ['B3', 2]], [['A3', 2], ['F3', 2]], [['E3', 2], ['D3', 2]], [['C3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['+6', '6'], ['53'], ['43', '+6', '6', '53'], ['53', '7+'], ['+4'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-desc-lam-7',
    coleccion: 'RO descendente en la menor',
    titulo: 'Ejercicio 7',
    fuente: 'RO DEScendente en la menor.musicxml',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['C3', 2]], [['B2', 2], ['D3', 2]], [['C3', 2], ['A2', 2]], [['E3', 2], ['D3', 2]], [['C3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['6'], ['+6', '6'], ['+4'], ['6'], ['53'], ['53', '7+'], ['+4'], ['6'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-1',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 1',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['B2', 2]], [['C3', 2], ['A2', 2]], [['E3', 4]], [['A2', 4]]],
    respuestas: [['53'], ['+6', '6'], ['6'], ['53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-2',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 2',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['C3', 2]], [['D3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['6'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-3',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 3',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['G#2', 2]], [['A2', 2], ['D3', 2]], [['E3', 2], ['E2', 2]], [['A2', 4]]],
    respuestas: [['53'], ['65d', '6'], ['53'], ['65', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-4',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 4',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['F#2', 2]], [['G#2', 2], ['A2', 2]], [['D2', 2], ['E2', 2]], [['A2', 4]]],
    respuestas: [['53'], ['6', '53'], ['65d', '6'], ['53'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-5',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 5',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['E2', 2]], [['F#2', 2], ['G#2', 2]], [['A2', 2], ['C3', 2]], [['D3', 2], ['E3', 2]], [['A2', 4]]],
    respuestas: [['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['6'], ['65', '53'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-6',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 6',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['B2', 2]], [['G#2', 2], ['A2', 2]], [['C3', 2], ['D3', 2]], [['E3', 2], ['E2', 2]], [['A2', 4]]],
    respuestas: [['53'], ['+6', '6'], ['65d', '6'], ['53'], ['6'], ['65', '53'], ['53', '7+'], ['53', '7+'], ['53']]
  },
  {
    id: 'RO-asc-lam-7',
    coleccion: 'RO ascendente en la menor (reconstruida)',
    titulo: 'Ejercicio 7',
    fuente: 'Transposición de RO ascendente en Do Mayor.musicxml (el archivo original era una copia sin transportar)',
    tonalidad: { tonica: 'A', modo: 'menor' },
    compas: [4, 4],
    repertorio: REPERTORIO_RO,
    compases: [[['A2', 2], ['C3', 2]], [['D3', 2], ['G#2', 2]], [['A2', 2], ['E2', 2]], [['F#2', 2], ['G#2', 2]], [['A2', 2], ['E2', 2]], [['A2', 4]]],
    respuestas: [['53'], ['6'], ['+4'], ['65d', '6'], ['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['53', '7+'], ['53']]
  }
  ];

  // Colección de demostración para cuarto: los mismos bajos de la RO descendente
  // en Do mayor, pero con la dominante secundaria (+6) como modelo sobre el grado 6.
  CORPUS.filter(e => e.id.startsWith('RO-desc-DoM-')).slice().forEach(e => {
    CORPUS.push(Object.assign({}, e, {
      id: e.id.replace('RO-desc-DoM-', 'RO-desc-DoM-4-'),
      coleccion: 'RO descendente en Do mayor · cuarto (+6 sobre el grado 6)',
      preferir: ['+6']
    }));
  });

  function porId(id) { return CORPUS.find(e => e.id === id) || null; }

  function colecciones() {
    const out = [];
    CORPUS.forEach(e => { if (!out.includes(e.coleccion)) out.push(e.coleccion); });
    return out;
  }

  // Número total de notas del ejercicio.
  function numNotas(ej) { return ej.compases.reduce((s, c) => s + c.length, 0); }

  // ¿Se pide también el grado de la fundamental? (por defecto, sí)
  function pideRomano(ej) { return ej.pedirRomano !== false; }

  const MODOS = { armonizar: 'Armonización', cifrar: 'Análisis', audicion: 'Audición' };
  function modo(ej) { return MODOS[ej.modo] ? ej.modo : 'armonizar'; }
  function realizacion(ej) {
    if (modo(ej) === 'cifrar') return 'siempre';
    if (modo(ej) === 'audicion') return 'alCorregir';
    return ['siempre', 'alCorregir', 'nunca'].includes(ej.realizacion) ? ej.realizacion : 'siempre';
  }

  // Nivel de ayuda con los grados: 'ninguna' | 'lista' | 'paleta'
  function ayudaGrados(ej) { return ['ninguna', 'lista', 'paleta'].includes(ej.ayudaGrados) ? ej.ayudaGrados : 'lista'; }

  // Cifras admisibles de la nota i tal como se corrigen: las del corpus que estén en
  // el repertorio del ejercicio (si ninguna lo está, se dejan todas), y con la
  // preferida (ej.preferir) en primer lugar como modelo.
  function admisibles(ej, i) {
    let ids = ej.respuestas[i];
    if (ej.repertorio) {
      const f = ids.filter(id => ej.repertorio.includes(id));
      if (f.length) ids = f;
    }
    if (ej.preferir) {
      const pref = ej.preferir.find(id => ids.includes(id));
      if (pref) ids = [pref, ...ids.filter(id => id !== pref)];
    }
    return ids;
  }

  // Grados de la fundamental que intervienen en el ejercicio (para informar al alumno):
  // los que fije el ejercicio en 'grados' o, si no, los que se derivan de todas las
  // respuestas admisibles, en orden I … VII.
  function grados(ej) {
    if (Array.isArray(ej.grados) && ej.grados.length) return ej.grados.slice();
    const usados = new Set();
    for (let i = 0; i < ej.respuestas.length; i++) {
      parejas(ej, i).forEach(p => usados.add(p.romano));
      if (esPivote(ej, i)) parejasEn(ej, i, tonalidadAntes(ej, i)).forEach(p => usados.add(p.romano));
    }
    return Teoria.ROMANOS.filter(r => usados.has(r));
  }

  /* ---- Modulación ----
     ej.modulaciones = [{nota: i, tonalidad}, …]: desde la nota i (acorde pivote) rige la
     tonalidad nueva. ej.aviso: 'completo' (se muestra la tonalidad de llegada y dónde
     empieza) o 'existe' (solo se dice que hay una modulación). */
  function modulaciones(ej) {
    const n = numNotas(ej);
    return (ej.modulaciones || [])
      .filter(m => m && m.tonalidad && m.tonalidad.tonica && Number.isInteger(m.nota) && m.nota > 0 && m.nota < n)
      .slice().sort((a, b) => a.nota - b.nota);
  }
  const modula = ej => modulaciones(ej).length > 0;
  function aviso(ej) { return ej.aviso === 'existe' ? 'existe' : 'completo'; }
  function tonalidadEn(ej, i) { return Teoria.tonalidadesPorNota(ej)[i] || ej.tonalidad; }
  // Tonalidad que regía ANTES de la nota i (la anterior al pivote, si i es pivote)
  function tonalidadAntes(ej, i) { return i > 0 ? tonalidadEn(ej, i - 1) : tonalidadEn(ej, 0); }
  const esPivote = (ej, i) => modulaciones(ej).some(m => m.nota === i);

  // Primera nota, después del pivote de la modulación m, cuyo acorde modelo tiene
  // alguna nota ajena a la tonalidad anterior (donde la modulación se hace audible).
  function primeraAjena(ej, m) {
    const notas = [];
    ej.compases.forEach(c => c.forEach(([n]) => notas.push(n)));
    const antes = tonalidadAntes(ej, m.nota);
    for (let i = m.nota + 1; i < notas.length; i++) {
      const id = admisibles(ej, i)[0];
      if (id && Teoria.acordeAjeno(id, notas[i], tonalidadEn(ej, i), antes)) return i;
    }
    return null;
  }

  // Parejas admisibles (cifra + grado) de la nota i leída en la tonalidad ton.
  function parejasEn(ej, i, ton) {
    const notas = [];
    ej.compases.forEach(c => c.forEach(([n]) => notas.push(n)));
    return admisibles(ej, i).map(id => ({ cifra: id, romano: Teoria.romano(id, notas[i], ton) }));
  }
  // Parejas en la tonalidad que rige en la nota (en el pivote, la nueva); la primera es la modelo.
  function parejas(ej, i) { return parejasEn(ej, i, tonalidadEn(ej, i)); }

  /* ---- Codificación en la URL (base64url de JSON en UTF-8) ---- */
  function codificar(ej) {
    const json = JSON.stringify(ej);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodificar(txt) {
    let b64 = txt.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // Comprobación mínima de que un objeto tiene forma de ejercicio.
  function validar(ej) {
    const errores = [];
    if (!ej || typeof ej !== 'object') return ['No es un objeto.'];
    if (!ej.tonalidad || !ej.tonalidad.tonica || !ej.tonalidad.modo) errores.push('Falta la tonalidad.');
    if (!Array.isArray(ej.compases) || !ej.compases.length) errores.push('Faltan los compases.');
    if (!Array.isArray(ej.respuestas)) errores.push('Faltan las respuestas.');
    else if (ej.compases && numNotas(ej) !== ej.respuestas.length) errores.push('El número de respuestas no coincide con el de notas.');
    if (ej.repertorio) ej.repertorio.forEach(id => { if (!Teoria.CIFRADOS[id]) errores.push('Cifra desconocida en el repertorio: ' + id); });
    if (ej.modulaciones !== undefined) {
      if (!Array.isArray(ej.modulaciones)) errores.push('Las modulaciones no son una lista.');
      else ej.modulaciones.forEach(m => {
        if (!m || !m.tonalidad || !m.tonalidad.tonica || !m.tonalidad.modo || !Number.isInteger(m.nota)) errores.push('Modulación mal formada.');
        else if (ej.compases && (m.nota <= 0 || m.nota >= numNotas(ej))) errores.push('Modulación fuera del ejercicio (nota ' + (m.nota + 1) + ').');
      });
    }
    return errores;
  }

  return { CORPUS, REPERTORIO_RO, MODOS, porId, colecciones, numNotas, pideRomano, ayudaGrados, modo, realizacion, admisibles, parejas, parejasEn, grados,
    modulaciones, modula, aviso, tonalidadEn, tonalidadAntes, esPivote, primeraAjena, codificar, decodificar, validar };
})();
