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
                   'audicion' (Audición): el alumno no ve ni el bajo ni la
                       realización; escucha la armonización modelo («Escuchar
                       propuesta», o acorde a acorde con el ▶ de cada acorde) y
                       cifra lo que suena; puede oír lo que lleva cifrado («Mi
                       cifrado»). Al cerrar el ejercicio se muestran bajo y
                       realización.
                   En 'armonizar' la realización de lo que el alumno va
                       cifrando se escribe en el pentagrama nota a nota
                       (decisión 51); solo la Audición espera al final.
     pedirRomano : (opcional, por defecto true) si el alumno debe indicar también
                   el grado sobre el que se construye la fundamental (I … VII).
                   El grado correcto se deriva de cada cifra admisible
                   (Teoria.romano), así que no hay que escribirlo aquí.
     modulaciones: (opcional) [{nota: i, tonalidad}, …]: desde la nota i (índice
                   desde 0; es el acorde pivote, común a las dos tonalidades)
                   rige la tonalidad nueva. Los grados se leen en la tonalidad
                   que rige en cada nota; en el pivote, en las dos (II = V).
     tonalidades : (opcional) la fila «Tonalidad»: 'dadas' (se muestra el tono y
                   dónde cambia), 'pedir' (el alumno marca dónde cambia el tono y
                   cuál es; vale el pivote o la primera nota ajena a la anterior,
                   y si el fragmento no modula, no marcar nada) o 'no' (sin fila:
                   si modula, sin anunciar). Si falta, se da cuando el fragmento
                   modula y no hay fila cuando no modula.
     aviso       : (heredado, con modulaciones) 'completo' | 'existe'. Equivale a
                   tonalidades: 'dadas' | 'pedir'; los enlaces antiguos lo llevan.

   Las respuestas de este corpus están fijadas a mano según las reglas
   acordadas (Regla de la octava de Furno + fórmulas de salto, arpegio y
   cadencia). El motor de reglas (reglas.js) se comprueba contra ellas en
   pruebas.html. Para cambiar una respuesta basta editar aquí la lista.

   Un ejercicio puede viajar dentro de la URL (#e=…) codificado con
   Ejercicios.codificar(ejercicio); Ejercicios.decodificar(texto) lo recupera.
   ===================================================================== */

const Ejercicios = (() => {

  // Repertorio de la Regla de la octava (9 botones): tríadas, séptimas diatónicas y V7 marcado (7/+ e inversiones).
  const REPERTORIO_RO = ['53', '6', '65', '43', '42', '7', '7+', '+6', '65d', '+4'];

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
    respuestas: [['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['65d', '6'], ['53'], ['65', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['6', '53'], ['65d', '6'], ['53'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['+6', '6'], ['65d', '6'], ['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['65d', '6'], ['53'], ['65', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['6', '53'], ['65d', '6'], ['53'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['53', '7+'], ['6', '53'], ['65d', '6'], ['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53']]
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
    respuestas: [['53'], ['+6', '6'], ['65d', '6'], ['53'], ['6'], ['65', '6', '53'], ['53', '7+'], ['53', '7+'], ['53']]
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

  // Número total de NOTAS del ejercicio (los silencios no llevan respuesta).
  function numNotas(ej) { return Teoria.numeroDeNotas(ej.compases); }

  // ¿Se pide también el grado de la fundamental? (por defecto, sí)
  function pideRomano(ej) { return ej.pedirRomano !== false; }

  // Nombres de los tipos, fijados por Diego el 20/9/2026 (las claves no cambian por compatibilidad con los enlaces ya repartidos)
  const MODOS = { cifrar: 'Análisis', armonizar: 'Armonización de bajo', audicion: 'Audición', soprano: 'Armonización de soprano' };
  function modo(ej) { return MODOS[ej.modo] ? ej.modo : 'armonizar'; }
  // Melodía de soprano: las notas de ej.compases son la melodía; el alumno da fundamental y
  // cifra y el bajo se deduce. Las respuestas se guardan como parejas 'V|65d'.
  const esSoprano = ej => modo(ej) === 'soprano';
  function par(x) { const k = String(x).indexOf('|'); return k < 0 ? { romano: null, cifra: x } : { romano: x.slice(0, k), cifra: x.slice(k + 1) }; }
  const cifraDe = x => par(x).cifra;

  /* ---- Funciones tonales ----
     ej.funciones: 'dadas' (el alumno ve la fila T · S · D rellena) | 'pedir' (la rellena él) |
     ausente (sin fila). ej.funcionesNotas: la función de cada nota fijada por el profesor
     (si falta, se deduce del acorde modelo). */
  function funciones(ej) { return ej.funciones === 'dadas' || ej.funciones === 'pedir' ? ej.funciones : null; }
  function funcionModelo(ej, i) { return funcionModeloEn(ej, i, tonalidadEn(ej, i)); }
  /* La misma, leída en una tonalidad concreta (decisión 95). En el acorde pivote hace
     falta dos veces: el mismo acorde es tónica en el tono de partida y subdominante en el
     de llegada, y las dos lecturas son verdad. Los vecinos se miran en la tonalidad que
     rige en ellos, que es lo que oye el alumno. */
  function funcionModeloEn(ej, i, ton) {
    if (Array.isArray(ej.funcionesNotas) && Teoria.TODAS_FUNCIONES.includes(ej.funcionesNotas[i])) return ej.funcionesNotas[i];
    const p = parejasEn(ej, i, ton)[0];
    if (!p) return 'T';
    const pSig = i + 1 < numNotas(ej) ? (parejas(ej, i + 1)[0] || {}) : {};
    const pAnt = i > 0 ? (parejas(ej, i - 1)[0] || null) : null;
    return Teoria.funcionDe(p.romano, pSig.romano || null, p.cifra, pSig.cifra || null, pAnt);
  }
  // Funciones admisibles leídas en una tonalidad concreta (para el pivote)
  function funcionesAdmisiblesEn(ej, i, ton) {
    const out = new Set([funcionModeloEn(ej, i, ton)]);
    parejasEn(ej, i, ton).forEach(p => Teoria.funcionesDeAcorde(p.romano, p.cifra).forEach(f => out.add(f)));
    return Teoria.TODAS_FUNCIONES.filter(f => out.has(f));
  }
  // Funciones que se dan por buenas en la nota i: la modelo y las de cualquier acorde admisible
  function funcionesAdmisibles(ej, i) {
    const out = new Set([funcionModelo(ej, i)]);
    parejas(ej, i).forEach(p => Teoria.funcionesDeAcorde(p.romano, p.cifra).forEach(f => out.add(f)));
    return Teoria.TODAS_FUNCIONES.filter(f => out.has(f));
  }
  /* Funciones que hacen falta en este ejercicio: siempre las tres diatónicas y, además,
     las cromáticas (DD) si algún acorde admisible las pide. Es lo que se ofrece en la
     paleta del alumno y en el desplegable del configurador. */
  function funcionesDelEjercicio(ej) {
    const usadas = new Set();
    for (let i = 0; i < ej.respuestas.length; i++) funcionesAdmisibles(ej, i).forEach(f => usadas.add(f));
    return Teoria.FUNCIONES.concat(Teoria.FUNCIONES_CROMATICAS.filter(f => usadas.has(f)));
  }

  /* ---- Bajo deducido (melodía de soprano) ----
     Para cada nota con fundamental y cifra, la nota del bajo: {letra, alt, octava}, en la
     octava más cercana al bajo anterior (o a do3), dentro de mi2 … mi4. */
  function bajosDe(ej, romanos, cifras) {
    const tons = Teoria.tonalidadesPorNota(ej);
    const notas = Teoria.notasDeCompases(ej.compases);
    const melodia = notas.map(n => Teoria.midi(Teoria.nota(n)));
    let ref = Teoria.midi(Teoria.nota('C3'));
    return romanos.map((rEscrito, i) => {
      const id = cifras[i];
      if (!rEscrito || !id) return null;
      const r = Teoria.gradoInterno(rEscrito);          // V/V → II (el grado real de la fundamental)
      // Menor melódica: la inflexión que hace que el acorde contenga la nota de la melodía
      const ton = Teoria.tonParaAcorde(r, id, tons[i], notas[i]);
      const b = Teoria.bajoDe(r, id, ton, false);              // lo que el alumno ha escrito, sin arreglarlo
      if (!b) return null;
      // La octava más cercana al bajo anterior, con una ligera preferencia por el centro del
      // registro (do3) y dejando sitio a las dos voces intermedias bajo la melodía (al menos una 5ª)
      const coste = x => Math.abs(x - ref) + 0.5 * Math.abs(x - 52) + (x > melodia[i] - 7 ? 50 : 0);
      let mejor = null;
      for (let o = 1; o <= 4; o++) {
        const n = { letra: b.letra, alt: b.alt, octava: o };
        const m = Teoria.midi(n);
        if (m < 36 || m > 64) continue;
        if (!mejor || coste(m) < coste(Teoria.midi(mejor))) mejor = n;
      }
      if (mejor) ref = Teoria.midi(mejor);
      return mejor;
    });
  }
  // Qué ve el alumno mientras trabaja (decidido por Diego el 20/9/2026):
  //   Análisis: bajo y realización modelo. Armonización: solo el bajo. Audición: nada
  //   (o solo el bajo, si el profesor marca mostrarBajo: true).
  // Cuando el ejercicio se cierra (solución a la vista) se muestran bajo y realización en los tres.
  // (El campo ej.realizacion de versiones anteriores ya no se usa.)
  // En la armonización de soprano el acorde completo se ve en cuanto se responde (Diego, 21/9/2026).
  /* Y en la armonización de BAJO, lo mismo (Diego, 22/9/2026, decisión 51): a la vez que el
     alumno señala la fundamental y la inversión, las notas del acorde se escriben en el
     pentagrama. Lo que se dibuja es SU cifrado, no el modelo, así que no descubre nada: es
     ver lo que uno acaba de escribir. Solo la Audición sigue esperando al final, porque allí
     dibujar el acorde enseñaría el bajo que hay que reconocer de oído. */
  function realizacion(ej) { return modo(ej) === 'audicion' ? 'alCerrar' : 'siempre'; }
  function verBajo(ej) { return modo(ej) !== 'audicion' || ej.mostrarBajo === true; }
  /* ¿Qué grado responde el alumno? (decisión 90)
       'bajo'         → el grado de la escala que ocupa la NOTA DEL BAJO (1 … 7, con ♯/♭),
                        que es lo que lo ata a la regla de la octava;
       'fundamental'  → el grado de la FUNDAMENTAL en romano (I … VII, V/V), el análisis.
     Va por tipo de ficha. Solo la **armonización de bajo** pide el grado del bajo: es la
     única en que el bajo está delante y el trabajo consiste en leerlo con la regla de la
     octava. En **Audición** el bajo no se ve, así que pedir el grado que ocupa en la
     escala no tendría sentido: lo que hace el alumno es identificar el acorde que suena,
     que es análisis de oído (criterio de Diego, 25/9/2026). El **Análisis** nombra el
     acorde, y la **melodía de soprano** necesita la fundamental por fuerza, porque de ella
     y de la cifra sale el bajo. El profesor puede cambiarlo con `campoGrado`. */
  function campoGrado(ej) {
    if (ej && (ej.campoGrado === 'bajo' || ej.campoGrado === 'fundamental')) return ej.campoGrado;
    /* En la armonización de bajo la fila del grado es SIEMPRE el grado del bajo
       (decisión 94): lo único que cambia con el estado es si lo escribe el alumno
       ('pedido'), si viene ya escrito ('dado') o si no hay fila ('oculto'). En los demás
       tipos esa fila es el romano de la fundamental y el grado del bajo, cuando se ve, va
       en circulitos sobre el pentagrama. */
    return modo(ej) === 'armonizar' ? 'bajo' : 'fundamental';
  }
  // ¿La fila del grado del bajo viene ya escrita? (solo en armonización de bajo)
  function gradoDado(ej) { return campoGrado(ej) === 'bajo' && estadoGrados(ej) === 'dado'; }
  // ¿No hay fila de grado? (armonización de bajo con los grados ocultos)
  function sinFilaGrado(ej) { return campoGrado(ej) === 'bajo' && estadoGrados(ej) === 'oculto'; }

  /* El grado del bajo en este ejercicio (decisión 91). Tres estados, un solo mando:
       'dado'    → el circulito va puesto encima de la nota y el alumno no lo escribe;
       'pedido'  → lo escribe él (y entonces no se dibuja: sería la respuesta a la vista);
       'oculto'  → ni se dibuja ni se pide.
     Sin decir nada, en armonización de bajo se pide —es de lo que va la ficha— y en los
     demás tipos va dado. Los enlaces repartidos antes llevan un booleano en `gradosBajo`
     (true = dado, false = oculto) y se leen igual, así que siguen valiendo. */
  function estadoGrados(ej) {
    const v = ej && ej.gradosBajo;
    /* Pedirlos solo se puede donde el bajo está delante: en los demás tipos la casilla del
       grado es la fundamental, así que un 'pedido' de más se comporta como 'oculto'. */
    if (v === 'pedido') return modo(ej) === 'armonizar' ? 'pedido' : 'oculto';
    if (v === 'dado' || v === 'oculto') return v;
    if (v === true) return 'dado';
    if (v === false) return 'oculto';
    return modo(ej) === 'armonizar' ? 'pedido' : 'dado';
  }
  // El grado de una pareja, en la forma que pida el ejercicio
  function gradoDe(ej, p) { return p ? (campoGrado(ej) === 'bajo' ? p.gradoBajo : p.romano) : null; }

  /* ¿Se dibujan los grados de la escala en circulito sobre el bajo? (decisión 52). Solo
     en el estado 'dado' y solo donde el grado del bajo NO tiene fila propia: en la
     armonización de bajo, cuando viene dado, va escrito en su fila y no hace falta
     repetirlo encima del pentagrama (decisión 94). */
  function gradosBajo(ej) { return estadoGrados(ej) === 'dado' && campoGrado(ej) !== 'bajo'; }

  // Nivel de ayuda con los grados: 'ninguna' | 'lista' | 'paleta'
  function ayudaGrados(ej) { return ['ninguna', 'lista', 'paleta'].includes(ej.ayudaGrados) ? ej.ayudaGrados : 'lista'; }

  /* ---------- La lista de acordes de la lección también corrige (decisión 101) ----------
     Cada lección trae su lista de acordes (`ej.acordes` = ['I|53', 'V|7+', …]), que es lo
     que Diego escribe en la pizarra: los acordes con los que se trabaja hasta ahí. El
     motor YA se limita a ella al proponer —lo dice `acordePermitido` en reglas.js: «el
     alumno solo tiene esos acordes a mano, así que proponerle cualquier otro es ponerle
     una trampa»—, pero las opciones marcadas A MANO en la tabla de revisión se saltaban
     esa comprobación, y al corregir nadie volvía a mirarla. Resultado: una opción marcada
     valía en TODAS las lecciones que usaran ese fragmento, aunque la lección todavía no
     hubiera visto ese acorde. Ahora la corrección mira lo mismo que el motor.

     Dos cautelas, las dos a favor del alumno:
     - **El modelo nunca se quita.** Si el modelo de un fragmento no está en la lista de su
       lección, eso es un error de datos (lo señala el configurador), no algo que deba
       dejar la nota sin respuesta correcta.
     - **En el acorde pivote basta con que valga en UNA de las dos tonalidades.** Al
       proponer se exige en las dos; al corregir, no: equivocarse por ser indulgente en un
       pivote es mucho menos dañino que dar por mala una respuesta correcta. */
  function soloDeLaLeccion(ej, i, ids) {
    if (!Array.isArray(ej.acordes) || !ej.acordes.length || ids.length < 2) return ids;
    if (typeof Reglas === 'undefined' || typeof Reglas.acordePermitido !== 'function') return ids;
    let nota, tonA, tonB;
    try {
      nota = Teoria.notasDeCompases(ej.compases)[i];
      tonB = tonalidadEn(ej, i);
      tonA = tonalidadAntes(ej, i);
    } catch (e) { return ids; }
    const vale = id => {
      // En la melodía de soprano la respuesta YA es el par «romano|cifra»: se compara tal cual
      if (String(id).indexOf('|') >= 0) return ej.acordes.indexOf(id) >= 0;
      return Reglas.acordePermitido(id, nota, tonB, ej.acordes)
        || Reglas.acordePermitido(id, nota, tonA, ej.acordes);
    };
    const f = ids.filter((id, k) => k === 0 || vale(id));
    return f.length ? f : ids;
  }

  // Cifras admisibles de la nota i tal como se corrigen: las del corpus que estén en
  // el repertorio del ejercicio (si ninguna lo está, se dejan todas), después las que
  // admita la lista de acordes de su lección (decisión 101), y con la
  // preferida (ej.preferir) en primer lugar como modelo.
  function admisibles(ej, i) {
    let ids = ej.respuestas[i];
    if (ej.repertorio) {
      const f = ids.filter(id => ej.repertorio.includes(cifraDe(id)));
      if (f.length) ids = f;
    }
    ids = soloDeLaLeccion(ej, i, ids);
    if (ej.preferir) {
      const pref = ids.find(id => ej.preferir.includes(cifraDe(id)));
      if (pref) ids = [pref, ...ids.filter(id => id !== pref)];
    }
    /* En Análisis y Audición el alumno NO elige la armonización: tiene el acorde delante
       —escrito a cuatro voces o sonando— y ha de decir qué es. Su respuesta ha de
       corresponderse exactamente con él, así que sobre un bajo donde suena la tríada de
       dominante no vale V7, aunque el V7 sea también posible ahí. Se dejan solo las cifras
       que producen las MISMAS notas que la modelo, que es la que se muestra: quedan más de
       una cuando dos cifras distintas dan el mismo acorde (7 y 7/+ sobre el mismo bajo,
       cuando la 7ª diatónica ya es la de dominante). En las dos armonizaciones es al
       revés: ahí el alumno decide, y toda armonización correcta vale (decisión 54). */
    if (ids.length > 1 && exigeAcordeExacto(ej)) {
      const f = ids.filter(id => mismoAcorde(id, ids[0], ej, i));
      if (f.length) ids = f;
    }
    return ids;
  }
  const exigeAcordeExacto = ej => { const m = modo(ej); return m === 'cifrar' || m === 'audicion'; };
  // ¿Estas dos cifras dan el mismo acorde sobre el bajo de la nota i? (mismas clases de altura)
  function mismoAcorde(a, b, ej, i) {
    if (a === b) return true;
    try {
      const nota = Teoria.notasDeCompases(ej.compases)[i];
      const ton = tonalidadEn(ej, i);
      const clases = id => {
        const s = new Set([Teoria.clase(Teoria.nota(nota))]);
        Teoria.vocesSuperiores(id, nota, ton).forEach(v => s.add(Teoria.clase(v)));
        return s;
      };
      const ca = clases(a), cb = clases(b);
      if (ca.size !== cb.size) return false;
      let igual = true;
      ca.forEach(x => { if (!cb.has(x)) igual = false; });
      return igual;
    } catch (e) { return false; }
  }

  // Grados de la fundamental que intervienen en el ejercicio (para informar al alumno):
  // los que fije el ejercicio en 'grados' o, si no, los que se derivan de todas las
  // respuestas admisibles, en orden I … VII.
  function grados(ej) {
    if (Array.isArray(ej.grados) && ej.grados.length) return ej.grados.slice();
    const bajo = campoGrado(ej) === 'bajo';
    const usados = new Set();
    for (let i = 0; i < ej.respuestas.length; i++) {
      parejas(ej, i).forEach(p => usados.add(gradoDe(ej, p)));
      if (esPivote(ej, i)) parejasEn(ej, i, tonalidadAntes(ej, i)).forEach(p => usados.add(gradoDe(ej, p)));
    }
    usados.delete(null); usados.delete(undefined);
    // Grados del bajo: por número, con las alteraciones junto al suyo. Romanos: I … VII y, detrás, los cromáticos (V/V)
    if (bajo) return [...usados].sort((a, b) => Teoria.ordenGrado(a) - Teoria.ordenGrado(b));
    return Teoria.ROMANOS.concat(Teoria.GRADOS_CROMATICOS).filter(r => usados.has(r));
  }

  /* ---------- El inventario de acordes (decisión 92) ----------
     Lo que Diego escribe en la pizarra al empezar: los acordes con los que se trabaja,
     **sin inversiones**. Las listas de acordes de las lecciones son acumulativas —cada
     una contiene la anterior, comprobado en el banco—, así que la unión de los fragmentos
     de una ficha es justo «todo lo visto hasta la lección más avanzada que entra».
     Devuelve [{nombre, posiciones}]: el nombre para el alumno y las inversiones que de
     verdad se usan, que van en el título de la etiqueta por si quiere el detalle. */
  const ORDEN_INVENTARIO = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  function inventario(acordes) {
    const m = new Map();
    (acordes || []).forEach(id => {
      const p = par(id);
      if (!p.cifra || !Teoria.CIFRADOS[p.cifra]) return;
      const nombre = Teoria.acordeSinPosicion(p.romano, p.cifra);
      if (!m.has(nombre)) m.set(nombre, []);
      const etq = Teoria.CIFRADOS[p.cifra].etiqueta;
      if (!m.get(nombre).includes(etq)) m.get(nombre).push(etq);
    });
    const raiz = n => n.replace(/[79]/g, '').split('/')[0];
    const peso = n => {
      const i = ORDEN_INVENTARIO.indexOf(raiz(n));
      return (i < 0 ? 90 : i) * 10 + (n.indexOf('/') >= 0 ? 5 : 0) + (/[79]/.test(n) ? 1 : 0);
    };
    return [...m.keys()].sort((a, b) => peso(a) - peso(b) || a.localeCompare(b))
      .map(nombre => ({ nombre, posiciones: m.get(nombre) }));
  }

  /* La paleta de grados: lo que se le ofrece al alumno para elegir. Con ayuda 'paleta',
     solo los que de verdad hacen falta; si no, la escala entera —los siete grados del
     bajo, o los siete romanos— más los alterados o cromáticos que use el ejercicio. */
  function paletaGrados(ej) {
    const usados = grados(ej);
    if (ayudaGrados(ej) === 'paleta') return usados;
    if (campoGrado(ej) === 'bajo') {
      const base = ['1', '2', '3', '4', '5', '6', '7'];
      return base.concat(usados.filter(g => !base.includes(g)))
        .sort((a, b) => Teoria.ordenGrado(a) - Teoria.ordenGrado(b));
    }
    return Teoria.ROMANOS.concat(Teoria.GRADOS_CROMATICOS.filter(g => usados.includes(g)));
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

  /* ---- La fila «Tonalidad» ----
     ej.tonalidades dice si el alumno ve las tonalidades del fragmento —y, por tanto, los
     puntos de cambio de tono— y si las pone él. Es una opción aparte de las funciones
     tonales, para poder combinarlas como se quiera (decisión 56):
       'dadas' → la fila se muestra rellena: la tonalidad inicial y, en cada pivote, la nueva
       'pedir' → la rellena el alumno: marca desde qué nota rige la tonalidad nueva y cuál es
       'no'    → no hay fila. Si el fragmento modula, se cifra igualmente en las tonalidades
                 verdaderas, pero no se le dicen: es la modulación SIN ANUNCIAR
       ausente → como siempre: fila dada si el fragmento modula, nada si no modula. Los
                 enlaces antiguos, que llevan `aviso`, siguen valiendo. */
  function tonalidades(ej) {
    if (ej.tonalidades === 'dadas' || ej.tonalidades === 'pedir') return ej.tonalidades;
    if (ej.tonalidades === 'no') return null;
    if (!modula(ej)) return null;
    return aviso(ej) === 'existe' ? 'pedir' : 'dadas';
  }
  function tonalidadEn(ej, i) { return Teoria.tonalidadesPorNota(ej)[i] || ej.tonalidad; }
  // Tonalidad que regía ANTES de la nota i (la anterior al pivote, si i es pivote)
  function tonalidadAntes(ej, i) { return i > 0 ? tonalidadEn(ej, i - 1) : tonalidadEn(ej, 0); }
  const esPivote = (ej, i) => modulaciones(ej).some(m => m.nota === i);

  // Primera nota, después del pivote de la modulación m, cuyo acorde modelo tiene
  // alguna nota ajena a la tonalidad anterior (donde la modulación se hace audible).
  function primeraAjena(ej, m) {
    const notas = Teoria.notasDeCompases(ej.compases);
    const antes = tonalidadAntes(ej, m.nota);
    for (let i = m.nota + 1; i < notas.length; i++) {
      const id = admisibles(ej, i)[0];
      if (id && Teoria.acordeAjeno(id, notas[i], tonalidadEn(ej, i), antes)) return i;
    }
    return null;
  }

  // Parejas admisibles (cifra + grado) de la nota i leída en la tonalidad ton.
  function parejasEn(ej, i, ton) {
    const notas = Teoria.notasDeCompases(ej.compases);
    /* El grado que se devuelve es el ESCRITO: la dominante secundaria se escribe V/V, no II
       (decisión 48). Por dentro, para deducir el bajo, se sigue usando el grado real. */
    if (esSoprano(ej)) return admisibles(ej, i).map(id => {
      const p = par(id); const t = Teoria.tonParaAcorde(p.romano, p.cifra, ton, notas[i]);
      const bajo = Teoria.bajoDe(p.romano, p.cifra, t);
      return { id, cifra: p.cifra, romano: Teoria.gradoEscrito(p.romano, p.cifra), bajo, gradoBajo: bajo ? Teoria.textoGrado(bajo, ton) : null };
    });
    /* `gradoBajo` es el grado de la escala de la nota del bajo (decisión 90). No depende
       de la cifra —la nota es la que es—, así que sale igual en todas las parejas; se
       guarda en cada una para que el alumno se corrija con el mismo camino que el romano. */
    const gb = Teoria.textoGrado(notas[i], ton);
    /* `romanoEscrito` y no `gradoEscrito(romano(…))`: hace falta el bajo y el tono para
       reconocer la tríada mayor sobre el 2.º grado como V/V (decisión 103). De la función
       tonal se encarga sola `funcionesDe`, que lee V/V como DD. */
    return admisibles(ej, i).map(id => ({ id, cifra: id, romano: Teoria.romanoEscrito(id, notas[i], ton), gradoBajo: gb }));
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
    if (ej.acordes !== undefined) {
      if (!Array.isArray(ej.acordes)) errores.push('La lista de acordes no es una lista.');
      else ej.acordes.forEach(x => { const p = par(x); if (!p.romano || !Teoria.ROMANOS.includes(Teoria.gradoInterno(p.romano)) || !Teoria.CIFRADOS[p.cifra]) errores.push('Acorde desconocido: ' + x); });
    }
    if (Array.isArray(ej.respuestas) && esSoprano(ej)) ej.respuestas.forEach((a, i) => {
      if (!Array.isArray(a)) errores.push('Respuestas mal formadas en la nota ' + (i + 1) + '.');
      else a.forEach(x => { const p = par(x); if (!p.romano || !Teoria.ROMANOS.includes(Teoria.gradoInterno(p.romano)) || !Teoria.CIFRADOS[p.cifra]) errores.push('Respuesta desconocida en la nota ' + (i + 1) + ': ' + x); });
    });
    if (ej.modulaciones !== undefined) {
      if (!Array.isArray(ej.modulaciones)) errores.push('Las modulaciones no son una lista.');
      else ej.modulaciones.forEach(m => {
        if (!m || !m.tonalidad || !m.tonalidad.tonica || !m.tonalidad.modo || !Number.isInteger(m.nota)) errores.push('Modulación mal formada.');
        else if (ej.compases && (m.nota <= 0 || m.nota >= numNotas(ej))) errores.push('Modulación fuera del ejercicio (nota ' + (m.nota + 1) + ').');
      });
    }
    return errores;
  }

  return { CORPUS, REPERTORIO_RO, MODOS, porId, colecciones, numNotas, pideRomano, ayudaGrados, campoGrado, estadoGrados, gradoDado, sinFilaGrado, gradoDe, paletaGrados, inventario, modo, esSoprano, par, cifraDe, realizacion, verBajo, admisibles, parejas, parejasEn, grados,
    funciones, funcionModelo, funcionModeloEn, funcionesAdmisibles, funcionesAdmisiblesEn, funcionesDelEjercicio, gradosBajo, bajosDe,
    modulaciones, modula, aviso, tonalidades, tonalidadEn, tonalidadAntes, esPivote, primeraAjena, codificar, decodificar, validar };
})();
