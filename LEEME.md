# Aplicación web para armonizar melodías — prototipo (Etapa 1)

Cuestionarios en línea para practicar el cifrado barroco de bajos sencillos
según la Regla de la octava (Furno). Todo funciona **abriendo `index.html` con
doble clic**: no necesita servidor, conexión ni instalación.

## Cómo se usa

- `index.html` — la página del alumno. Abierta sin más (práctica libre) muestra
  el desplegable con los 35 ejercicios del corpus; abierta desde un enlace a un
  ejercicio concreto (`#ej=` o `#e=`) muestra solo ese ejercicio, sin
  desplegable. Para cada nota, primero el grado sobre el que se construye la
  fundamental (paleta «Grado de la fundamental») y después el cifrado (paleta
  «Cifrados»). Cada tecla de las paletas lleva
  un número pequeño: pulsarlo en el teclado elige esa opción en la casilla
  activa (← → cambian de nota, ↑ ↓ de línea). La casilla activa avanza sola;
  se puede pulsar cualquier casilla para volver a ella. «Corregir» marca en
  verde y rojo; las verdes quedan fijas y con «Corregir los errores» se
  arreglan solo las rojas (sin ver la solución hasta pulsar «Ver la
  solución»). Sobre el bajo, un pentagrama de sol muestra la realización a
  cuatro voces (posición inicial de Furno a elegir). Sonido, siempre con el
  bajo doblado a la octava grave y con el instrumento elegido en el desplegable
  (piano, clave, órgano o sintético): «▶ Tono inicial» sitúa la tonalidad,
  «▶ Escuchar propuesta» reproduce lo que propone el ejercicio (la
  armonización en Análisis y Audición; solo el bajo en Armonización),
  «▶ Mi cifrado» la realización de lo cifrado hasta el momento, el ▶ encima
  de cada acorde ese acorde de la propuesta, y «■ Parar» (o Esc) detiene.
  «Copiar enlace» copia una dirección que abre ese mismo ejercicio. Hay tres
  tipos de ejercicio: **Análisis** (se ven bajo y realización; se cifra),
  **Armonización** (solo el bajo; la realización aparece al cifrar) y
  **Audición** (solo el bajo; se escucha la realización y se cifra lo que
  suena). Un ejercicio puede **modular** (tonalidades vecinas): la fila
  «Tonalidad» bajo los grados muestra desde qué nota rige cada tonalidad, o
  la rellena el alumno si el ejercicio solo avisa de que hay modulación; en
  la nota del cambio (acorde pivote) se dan los dos grados (II = V).
- `configurar.html` — la página del profesor. Escribe el bajo (`do3 re3 | mi3
  do3 | sol3r`; `n` negra, `c` corchea, `.` puntillo; cualquier compás) o
  arrastra un `.musicxml` de MuseScore (cada barra final es un
  ejercicio), elige el tipo de ejercicio, el repertorio y las opciones, pulsa
  «Analizar», revisa las cifras admisibles y la modelo de cada nota, y genera
  la dirección para los alumnos (o las de todos los fragmentos del archivo).
  También guarda y carga ejercicios como `.json`.
- `pruebas.html` — comprobación del motor de reglas frente a las respuestas del
  corpus. Si al cambiar reglas o respuestas aparece una discrepancia, aquí se ve.
- `ejemplos/` — los MusicXML originales, para probar la importación.

Direcciones:

- `index.html#ej=RO-asc-DoM-3` abre el ejercicio 3 de la RO ascendente en Do mayor.
- `index.html#e=…` abre un ejercicio codificado dentro de la propia dirección
  (así viajarán los ejercicios que el profesor configure en la Etapa 2).

## Archivos

| Archivo | Qué contiene |
|---|---|
| `js/teoria.js` | Notas, tonalidades, grados, catálogo de cifrados y cálculo de las voces de cada acorde. |
| `js/reglas.js` | Motor de reglas: propone los cifrados admisibles de cada nota (RO de Furno + saltos, arpegios y cadencias). |
| `js/ejercicios.js` | El corpus (35 ejercicios) con sus respuestas fijadas a mano, y la codificación de ejercicios en la URL. |
| `js/partitura.js` | Dibuja el pentagrama en SVG con la fuente Bravura y las casillas pulsables. |
| `js/app.js` | La interfaz del alumno: paletas, estado del ejercicio, corrección, barra de realización. |
| `js/realizacion.js` | Realización a cuatro voces: tres posiciones de Furno, conducción automática (séptimas que bajan, sensible sin doblar, tónica en la soprano final), detector de paralelas, cadencia de referencia. |
| `js/sonido.js` | Reproducción de acordes y secuencias (Web Audio) con instrumentos reales (muestras) o sintético, parada y avisos de progreso. |
| `sonidos/piano.js`, `clave.js`, `organo.js` | Muestras mp3 en base64 (FluidR3_GM, CC BY 3.0; licencia en `sonidos/LICENCIA-muestras.txt`); se cargan solo cuando se usan. |
| `js/configurador.js` | La interfaz del profesor: entrada del bajo, opciones, revisión, generación de direcciones, borrador. |
| `js/musicxml.js` | Importador de MusicXML: pentagrama del bajo, fragmentos, tonalidad. |
| `css/estilo.css` | Aspecto (colores en variables al principio del archivo). |
| `css/bravura.css` | Subconjunto de la fuente musical Bravura incrustado en base64 (licencia OFL, véase `fuentes/`). |

## Cómo cambiar una respuesta del corpus

En `js/ejercicios.js`, cada ejercicio tiene una lista `respuestas` con una
sublista por nota. La primera cifra de cada sublista es la **modelo** (la que
se muestra al corregir); las demás también se aceptan como correctas.
Identificadores de cifra: `53` (sin cifra), `6`, `65`, `43`, `7`, `7+` (7/+), `+6`, `65d`
(6/5 con el 5 tachado), `+4`, `64`, `9`. Con `preferir: ['+6']` un ejercicio
pasa a modelo de cuarto (dominante secundaria sobre el grado 6). El grado de la fundamental no se escribe: se
deriva de cada cifra (`pruebas.html` lo muestra junto a cada respuesta). Para
no pedir el grado en un ejercicio, añádele `pedirRomano: false`. El tipo de
ejercicio se guarda como `modo: 'cifrar'` (Análisis) o `modo: 'audicion'`;
sin `modo`, es Armonización. Una modulación se guarda como
`modulaciones: [{nota: 2, tonalidad: {tonica: 'G', modo: 'mayor'}}]` (índice de la
nota pivote desde 0) y `aviso: 'completo'` o `'existe'`.

## Estado y siguientes etapas

Véase el documento «App armonización — especificación» en el proyecto
«Mis clases» de Claude (copia en `ESPECIFICACION.md`). Esta carpeta vive en
Drive murciaeduca.es › 3. RECURSOS - DOCENTE › Recursos de Claude.
