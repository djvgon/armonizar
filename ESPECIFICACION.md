# App de armonización con cifrado barroco — especificación y estado

Documento de referencia del proyecto. Se lee al empezar cada sesión de trabajo
sobre la aplicación y se actualiza al cerrarla.

Última actualización: 20 de septiembre de 2026 (Etapas 0–4 y 5a entregadas y publicadas: prototipo, configurador, importación, realización a cuatro voces con conducción de voces y sonido, tres tipos de ejercicio —Análisis, Armonización y Audición—, atajos de teclado, compases ternarios y negras, modulación en ejercicios propios).

## 1. Objetivo

Cuestionarios en línea, al estilo de musictheory.net (ejercicios) y teoria.com
(introducción del cifrado), para que el alumnado practique la armonización de
bajos sencillos en redondas y blancas con acordes diatónicos, primero según la
Regla de la octava (RO) de Furno y más adelante con los *schemata* de
IJzerman (marchas progresivas, Romanesca, Quiescenza…). Después, melodías de
soprano; después, modulación.

El profesor configura un ejercicio, obtiene una dirección única y la
distribuye (Google Classroom). El alumno abre la dirección, elige el cifrado
de cada nota del bajo pulsando botones y recibe la corrección al terminar.

## 2. Dónde está

- Carpeta: Drive murciaeduca.es › `Mi unidad / 3. RECURSOS - DOCENTE / Recursos de Claude / APLICACIÓN WEB PARA ARMONIZAR MELODÍAS`.
  **Nunca en `Usuarios/Diego/Claude`**: Diego no quiere nada ahí (se creó allí por
  error el 20-09-2026 y se borró). Es la única carpeta a la que quiere dar acceso.
- Se abre con doble clic en `index.html` (alumno) o `configurar.html`
  (profesor). Sin servidor, sin conexión, sin instalación (JavaScript plano,
  sin dependencias; la fuente musical va incrustada).
- `LEEME.md` en la carpeta describe cada archivo. `ejemplos/` guarda los tres
  MusicXML válidos de Diego para probar la importación.
- **Publicada (20/9/2026)** en GitHub Pages, repositorio público
  `armonizar` de la cuenta `djvgon` de Diego:
  - Alumno: <https://djvgon.github.io/armonizar/>
  - Profesor: <https://djvgon.github.io/armonizar/configurar.html>
  Guía en `PUBLICAR-EN-GITHUB.md` (cuenta, repositorio, subida arrastrando la
  carpeta, activar Pages, actualizaciones). Las direcciones para los alumnos
  se generan desde el configurador publicado, no desde el local. La
  dirección sin ejercicio (`…/armonizar/`) es la práctica libre, con el
  desplegable del corpus; cualquier enlace a un ejercicio (`#ej=` o `#e=`)
  muestra solo ese ejercicio (decidido 20/9/2026). Comprobado
  desde fuera el mismo día: fuente, tres tipos de ejercicio, enlace generado
  con `https://`, ejercicio de Audición resuelto por teclado y corregido, sin
  errores de consola. Tras cada entrega a Drive, Diego vuelve a subir a
  GitHub los archivos cambiados.

## 3. Decisiones acordadas (Diego, 20/9/2026)

1. **Notación del cifrado.** `VII6` se cifra `6`; el V7 en segunda inversión
   se cifra `+6`; el V7 en tercera inversión, `+4`; el V7 en primera
   inversión sobre el grado 7, `6/5` con el 5 tachado (quinta falsa de Furno).
   `6` y `6/3` son lo mismo. Una alteración suelta bajo la nota afecta a la
   tercera; si afecta a otro numeral, se adosa a él (`♯6`). El numeral
   tachado (barra diagonal) indica **solo** intervalo disminuido (`6/5̸`);
   el `+` indica el intervalo aumentado o la sensible (`+4`, `+6`, `7/+`), y
   los acordes aumentados no se marcan en el cifrado. Por tanto `+4` se
   escribe sin tachar (corregido el 20-09-2026).
2. **Repertorio configurable.** El profesor elige, al configurar el ejercicio,
   el repertorio de cifras; ese repertorio es la paleta que ve el alumno y se
   le muestra antes de empezar. La tolerancia se declara eligiendo vocabulario.
3. **Respuestas por nota.** Cada nota lleva un conjunto de cifras admisibles;
   la primera es la modelo. Cuando entren los *schemata* habrá que valorar
   respuestas por combinación (véase §8).
4. **RO solo por grados conjuntos.** Cuando el bajo salta, el cifrado viene de
   la función (subdominante → dominante) o del arpegio del acorde anterior.
   Durante la frase se evita el enlace V–I por salto (quinta descendente /
   cuarta ascendente), que se reserva para la cadencia final; en su lugar se
   usan las inversiones del V o del V7.
5. **Cadencia.** V (o V7) sobre el grado 5 seguido del grado 1 cierra la
   cadencia auténtica perfecta. Un ejercicio puede acabar en semicadencia.
6. **Modulación.** Hecha en los ejercicios configurados (20/9/2026,
   Etapa 5a); el generador automático (5b) queda pendiente. Decisiones de
   Diego:
   - El ejercicio lleva tramos (`modulaciones: [{nota, tonalidad}]`): desde
     la nota indicada —el acorde pivote, común a las dos tonalidades— rige la
     tonalidad nueva. El motor de reglas se ejecuta en cada tonalidad y en el
     pivote propone solo acordes comunes (si la RO no da ninguno, cualquiera
     del catálogo que lo sea; si tampoco, avisa para cambiar de pivote).
   - **Tras el cambio, la tonalidad nueva es la referencia**: el V de Sol
     sobre re se cifra «—», igual que en la menor el V sobre mi. No se
     marcan en la cifra las alteraciones respecto a la armadura inicial.
   - **El pivote se cifra en las dos tonalidades** (II = V). Como en el
     análisis tradicional, cada tonalidad escribe sus grados en un renglón
     propio, con su nombre al principio («Do M:», «Sol M:»); en el pivote,
     los dos grados van apilados —el de la tonalidad anterior en su renglón
     y el de la nueva en el siguiente— y unidos por dos líneas verticales
     continuas (| VI | sobre | II |). Diego pidió esta disposición el
     20/9/2026 en lugar de la casilla partida en horizontal.
   - **Tonalidades permitidas**: las cinco vecinas (misma armadura o una
     alteración de diferencia): desde mayor, V, IV, relativo menor, II y
     III; desde menor, relativo mayor, v, VII, iv y VI.
   - **Aviso al alumno**, a elegir en el configurador: `completo` (se
     muestra la tonalidad de llegada y desde qué nota; la fila «Tonalidad»
     viene rellena) o `existe` (solo se dice que hay una modulación; el
     alumno marca en la fila «Tonalidad» desde qué nota rige la nueva y
     cuál, con una paleta de las cinco vecinas). **Vale marcar el pivote o
     cualquier nota hasta la primera con alguna nota ajena a la tonalidad
     anterior**; en la nota marcada se piden los dos grados.
   - Corrección: si las marcas son correctas, los grados se leen según la
     lectura del alumno; si no, según la del ejercicio, aceptando en el
     pivote cualquiera de las dos lecturas; la modulación cuenta como un
     elemento más del resultado. Con reintentos, las marcas acertadas se
     fijan y las equivocadas se quitan.
   - La realización, el sonido y las tendencias de las voces (sensible,
     séptima) usan la tonalidad de cada tramo; la armadura dibujada es la
     inicial y las notas ajenas llevan su alteración; «Cadencia» suena en
     la tonalidad inicial.
   - Configurador: columna «Tonalidad» en la revisión (desplegable con las
     vecinas en cada nota) y opción de aviso; un cambio de armadura en un
     MusicXML se importa como modulación desde la primera nota de ese
     compás (el profesor ajusta el pivote y el modo).
   - Generador (5b, pendiente): fragmentos válidos de la RO enlazados por
     un pivote y confirmados con una nota ajena en las dos o tres notas
     siguientes.
7. **Realización de las voces.** Solo visualización: a cada cifra se le
   muestra el acorde realizado a cuatro voces en un pentagrama de sol sobre
   el bajo. Se sigue calificando únicamente la cifra y el grado. Hecha
   (20-09-2026, `js/realizacion.js`), con estas reglas:
   - Voces superiores = intervalos de la cifra; si solo hay dos (5/3, 6,
     6/4) se dobla el bajo (Furno: «l'8ª si può dare a tutte le corde»),
     salvo que el bajo sea la sensible: **la sensible no se dobla nunca**
     (ni la de la tonalidad ni la tercera de una dominante secundaria, en
     ninguna inversión, con séptima o novena); entonces se dobla la
     fundamental. La soprano se sitúa entre sol4 y la5 y **las tres voces
     superiores nunca abarcan más de una novena**, para que la mano derecha
     pueda tocarlas (en el corpus, de hecho, nunca pasan de la octava).
   - **La «posizione» de Furno es la disposición del primer acorde** (1.ª:
     octava en la soprano, 3–5–8; 2.ª: décima, 5–8–3; 3.ª: quinta, 8–3–5).
     Los acordes siguientes se conducen automáticamente: para cada acorde
     se generan todas las disposiciones correctas (qué nota en cada voz, en
     qué octava; en los acordes de séptima y en el I final también sin
     quinta, con la fundamental doblada) y se elige, por programación
     dinámica sobre toda la frase, la serie de menor coste. Cuestan: el
     movimiento de las voces; las quintas y octavas paralelas (mucho);
     **la séptima que no baja de grado** (mucho: nunca sube a la quinta;
     en V7 → I baja siempre a la tercera de I); la sensible en la soprano
     que no sube a la tónica; los acordes incompletos; los unísonos; la
     soprano fuera de registro; y, **en el acorde final, la soprano que no
     acaba en la tónica** (si no puede, en la tercera; la quinta es lo
     último). Cuando el bajo arpegia el mismo acorde (+6 → +4), las voces
     se reparten libremente. Así lo hace Furno en sus ejemplos, y así la
     RO no produce paralelas.
   - Comprobado en `pruebas.html` y en la auditoría del corpus: con
     conducción automática, 0 paralelas en los 35 ejercicios desde
     cualquier posición inicial, ninguna sensible doblada, ninguna séptima
     mal resuelta y 104 de los 105 finales (35 × 3 posiciones) con la
     tónica en la soprano (el restante, en 3.ª posición, acaba en la
     quinta porque la tónica solo se alcanzaba con quintas paralelas);
     con la misma disposición mantenida rígidamente en todos
     los acordes, 166 / 168 / 226 paralelas en total (en los saltos del
     bajo, sobre todo en la cadencia V–I). El interruptor «misma
     disposición en todos los acordes» existe precisamente para mostrarlo
     en clase; el contador de paralelas lo acompaña.
   - Grabado: las dos notas de una segunda van pegadas a la plica, la
     inferior a la izquierda y la superior a la derecha (con plica arriba se
     desplaza la superior; con plica abajo, la inferior; en un racimo de tres
     se alterna).
   - **Un acorde solo se dibuja (y suena) cuando la nota tiene cifra y
     grado**; con la cifra sola no aparece nada. Si no se pide el grado,
     basta la cifra. El acorde se calcula a partir de la cifra (el grado no
     interviene en las notas): si el alumno pone un grado incoherente con
     la cifra, verá el acorde de la cifra.
   - Tras corregir, los acordes de las cifras erróneas se dibujan en rojo.
   - Sonido (`js/sonido.js`, Web Audio, osciladores). Tres botones, con
     **el bajo doblado a la octava grave** en toda reproducción (para que
     destaque y ayude a reconocer las inversiones); nombres y comportamiento
     fijados por Diego el 20/9/2026:
     - «▶ Tono inicial»: cadencia I–IV–V7–I en la tonalidad inicial, para
       situar el oído.
     - «▶ Escuchar propuesta»: lo que propone el ejercicio. En Análisis, la
       armonización que se ve; en Audición, la armonización que hay que
       reconocer (no se ve); en Armonización, **solo el bajo**.
     - «▶ Mi cifrado»: la realización de lo que el alumno ha cifrado hasta
       el momento (las notas sin grado y cifrado suenan solo con el bajo).
     - Un botón ▶ **encima de cada acorde** (sobre la clave de sol) hace
       sonar ese acorde de la propuesta (en Armonización, esa nota del
       bajo): reproduce el acorde, no el cifrado introducido; el botón de
       lo que suena se resalta. «■ Parar» (o Esc) detiene; «sonar al
       elegir» suena el acorde propio al completar grado y cifrado.
     - Lo que se dibuja en el pentagrama de sol: en Análisis la
       armonización modelo; en Armonización y en Audición la realización de
       lo que el alumno va cifrando (en Audición, si cifra bien coincidirá
       con lo que oye); tras corregir, los acordes erróneos en rojo.
8. **Dos respuestas por nota.** El alumno indica, además de la cifra, el
   grado de la escala sobre el que se construye la fundamental del acorde
   (I … VII, siempre en mayúsculas). El grado correcto se **deriva** de cada
   cifra admisible (`Teoria.romano`): `+6` sobre re en Do mayor → V; `6`
   sobre re → VII; `+6` sobre la (grado 6 descendente) → II, es decir, el
   grado literal de la fundamental, sin notación de dominante secundaria
   (V/V), que queda como decisión pendiente. Una nota cuenta como correcta
   solo si aciertan cifra y grado; la corrección muestra qué mitad falla y
   el desglose. Si la cifra dada no es admisible, el grado se da por bueno
   cuando coincide con el de alguna cifra admisible. Cada ejercicio puede
   desactivarlo con `pedirRomano: false`.
9. **Grado 6 descendente por cursos.** En tercero se armoniza con II4/3
   (cifra `4/3`, diatónica: la–do–re–fa); en cuarto, con la dominante
   secundaria del V (`+6`: la–do–re–fa♯). Ambas son admisibles siempre; cuál
   es la modelo lo decide la opción `preferir` del ejercicio (`preferir:
   ['+6']` para cuarto). Sobre el grado 2, `4/3` **no** se admite: la sexta
   es la sensible y se escribe `+6`.
10. **Números romanos siempre en mayúsculas.** No se distingue ii de II al
    estilo anglosajón: en el contexto diatónico la calidad del acorde ya está
    determinada por el grado, y la distinción duplicaría la paleta sin
    aportar al objetivo del ejercicio. Cuando entren los acordes cromáticos
    (cuarto), la distinción pertinente (II frente a V/V) se expresará con la
    notación de dominante secundaria, no con la caja. La calidad puede
    mostrarse en la corrección como información si se desea.
11. **`7` frente a `7/+`.** `7` es la séptima diatónica en estado fundamental
    (II7 antes de la cadencia); `7/+` (7 sobre +) es el V7 en estado
    fundamental, con la sensible como tercera. Sobre el grado 5 vale `7/+`,
    no `7` (mismo principio que 6/5̸ y +6: cuando el intervalo es el de
    dominante, se escribe el cifrado marcado).
12. **Corregir solo los errores.** Tras «Corregir», las casillas acertadas
    quedan fijas en verde y solo las erróneas siguen editables; la solución y
    las explicaciones no se enseñan hasta que el alumno pulsa «Ver la
    solución» o acierta todo. Se cuenta el número de intentos y se conserva
    el resultado del primero («al primer intento: 4 de 6»). Opción por
    ejercicio `reintentos` (por defecto activada); desactivada, un solo
    intento con la solución inmediata.
14. **Tres tipos de ejercicio** (`modo`), elegidos de forma destacada en el
    configurador; en los tres se responde igual (cifra y grado por nota) y
    la corrección es la misma:
    - **Análisis** (`'cifrar'`): se muestran desde el principio el bajo y la
      realización modelo a cuatro voces (conducción automática desde la 1.ª
      posición) y el alumno cifra cada acorde.
    - **Armonización** (`'armonizar'`, por defecto): solo el bajo; la
      realización de lo que va cifrando aparece según la opción
      `realizacion` (`siempre` / `alCorregir` / `nunca`), que solo existe en
      este tipo.
    - **Audición** (`'audicion'`): solo el bajo escrito; el alumno escucha
      la armonización modelo («Escuchar propuesta», o acorde a acorde con el
      ▶ de encima de cada acorde, con botones destacados) y cifra lo que
      suena; a medida que cifra ve su propia realización y puede oírla con
      «Mi cifrado».
13. **Ayuda con los grados** (`ayudaGrados`, por ejercicio): `ninguna`
    (paleta I–VII sin lista), `lista` (por defecto: paleta completa y la
    fila «Grados en este ejercicio», deducida de las respuestas admisibles o
    fijada con `grados: [...]`) o `paleta` (la paleta de grados solo ofrece
    los del ejercicio: andamio para un primer contacto; combinada con los
    reintentos, permite acertar probando, así que conviene reservarla a la
    práctica inicial). Decidido tras valorar que limitar la paleta facilita
    demasiado si es la única forma de trabajar.
18. **Orden de respuesta** (20/9/2026): primero el grado de la fundamental
    y después el cifrado. La paleta «Grado de la fundamental» va encima de la
    de «Cifrados» (antes «Cifra»), la casilla activa inicial es la del grado
    y, al responder, se pasa del grado al cifrado de la misma nota (en un
    pivote: grado anterior, grado nuevo, cifrado). Las flechas ↑ ↓ siguen el
    orden visual de las casillas (cifrado arriba, grado debajo).
15. **Atajos de teclado.** Cada tecla de las paletas lleva un número
    pequeño: en los grados, el del grado (I = 1 … VII = 7); en las cifras,
    su posición en la paleta (1 … 9, 0 para la décima). Pulsar ese número en
    el teclado elige la opción en la casilla activa de la línea activa (la
    de cifras o la de grados, que se cambia con ↑ ↓; ← → mueven de nota).
    Sustituye a los nombres pequeños que había bajo cada cifra.
16. **Tamaño en pantalla** (20/9/2026): la partitura (bajo, realización y
    casillas de cifra y grado) va un 40 % más pequeña que en la primera
    versión: un espacio de pentagrama mide 10 px (`ESCALA_PX` en
    `partitura.js`) y, si no cabe, la partitura se reduce proporcionalmente.
    Las teclas de las paletas de cifra y grado se redujeron un 40 % y
    después se ampliaron un 10 % (≈ 66 % del tamaño original).
17. **Compases y figuras.** Cualquier compás (4/4, 3/4, 2/4, 2/2, 3/2) y
    figuras de redonda, blanca, negra y corchea, con puntillo. En el texto
    del bajo: sin sufijo = blanca, `r` redonda, `n` negra, `c` corchea, y un
    punto para el puntillo (`do3.` = blanca con puntillo). En MusicXML se
    leen `<type>` y `<dot>`. El configurador avisa (sin impedirlo) de los
    compases cuyas duraciones no cuadran con el compás, para permitir
    anacrusas y compases finales incompletos. Las duraciones se guardan en
    negras (3 = blanca con puntillo, 0.5 = corchea).

## 4. Vocabulario de cifrado (catálogo en `js/teoria.js`)

| id | Se ve | Significado | Voces superiores |
|---|---|---|---|
| `53` | — | tríada en estado fundamental | 3ª y 5ª diatónicas |
| `6` | 6 | tríada en primera inversión | 3ª y 6ª diatónicas |
| `64` | 6/4 | tríada en segunda inversión | 4ª y 6ª diatónicas |
| `+6` | +6 | V7 en segunda inversión (3ª, 4ª, 6ª sensible) | fundamental a la 4ª sobre el bajo; acorde de séptima de dominante |
| `65` | 6/5 | séptima en primera inversión | 3ª, 5ª y 6ª diatónicas |
| `43` | 4/3 | séptima en segunda inversión (II4/3 sobre el grado 6) | 3ª, 4ª y 6ª diatónicas |
| `65d` | 6/5̸ | V7 en primera inversión (quinta falsa) | fundamental a la 3ª bajo el bajo; séptima de dominante |
| `+4` | +4 | V7 en tercera inversión (2ª, 4ª aumentada, 6ª) | fundamental a la 2ª sobre el bajo; séptima de dominante |
| `7` | 7 | séptima diatónica en estado fundamental (II7) | 3ª, 5ª y 7ª diatónicas |
| `7+` | 7/+ | V7 en estado fundamental (sensible como tercera) | séptima de dominante sobre el bajo |
| `9` | 9 | novena (reservado) | |

Las voces «diatónicas» se toman de la escala mayor o de la menor armónica.
Los cifrados de dominante (`7+`, `+6`, `+4`, `65d`) se construyen como séptima de
dominante sobre su fundamental, manteniendo el bajo tal cual: así, sobre el
grado ♭6 del modo menor descendente, `+6` produce la sexta aumentada francesa
(en la menor: fa–la–si–re♯), como en la RO descendente en menor.

Equivalencias de escritura (para el futuro constructor de cifras):
`6/3`→`6`, `5/3`→`53`, `6/5/3`→`65`, `6/4/3`→`43`, `+6/4/3`→`+6`, `+4/2`→`+4`, `7/5/3`→`7`, `7/+`→`7+`.

## 5. Modelo de datos del ejercicio (`js/ejercicios.js`)

```
{
  id: 'RO-asc-DoM-1',
  coleccion: 'RO ascendente en Do mayor',
  titulo: 'Ejercicio 1',
  tonalidad: { tonica: 'C', modo: 'mayor' },      // o { tonica: 'A', modo: 'menor' }
  compas: [4, 4],
  repertorio: ['53', '6', '65', '43', '7', '7+', '+6', '65d', '+4'],
  compases: [ [['C3', 2], ['D3', 2]], [['E3', 2], ['C3', 2]], [['G3', 4]], [['C3', 4]] ],   // duraciones en negras: 4, 2, 1, 0.5; ×1.5 con puntillo
  respuestas: [ ['53'], ['+6', '6'], ['6'], ['53'], ['53', '7+'], ['53'] ],
  preferir: ['+6'],                                // opcional: cifras que pasan a ser la modelo si son admisibles
  pedirRomano: true,                               // opcional; por defecto true
  reintentos: true,                                // opcional; por defecto true (corregir solo los errores)
  ayudaGrados: 'lista',                            // opcional: 'ninguna' | 'lista' | 'paleta'
  grados: ['I', 'V', 'VII'],                       // opcional: lista fija de grados en juego
  modo: 'armonizar',                               // opcional: 'armonizar' | 'cifrar' (Análisis) | 'audicion'
  realizacion: 'siempre',                          // opcional, solo en 'armonizar': 'siempre' | 'alCorregir' | 'nunca'
  modulaciones: [{ nota: 2, tonalidad: { tonica: 'G', modo: 'mayor' } }],   // opcional: desde la nota (pivote) rige la tonalidad nueva
  aviso: 'completo'                                // opcional, con modulaciones: 'completo' | 'existe'
}
```

Notas en notación anglosajona con octava científica (`C3` = do de la clave de
fa, segundo espacio; `F#2`, `Bb3`). Duración en negras (2 = blanca, 4 =
redonda). Un ejercicio viaja en la URL como `#e=` + base64url del JSON
(`Ejercicios.codificar`); los del corpus, como `#ej=` + id.

## 6. Motor de reglas (`js/reglas.js`)

Cada nota se analiza con una ventana de contexto: grado, cómo llega (inicio,
unísono/octava, 2ª ascendente, 2ª descendente, salto) y cómo sale (final,
unísono, 2ª asc., 2ª desc., salto), más los grados anterior y siguiente. Las
reglas se prueban en orden y gana la primera:

| Orden | Regla | Cifras (la primera es la modelo) |
|---|---|---|
| R1 | Nota final | `—` (tónica; o dominante en semicadencia) |
| R2 | Penúltima sobre el grado 5 con final en el grado 1 | `—`, `7/+` |
| R3 | Nota repetida u octava | las de la nota anterior (+ `7/+` sobre el grado 5) |
| R4 | Llega por salto y es nota del acorde anterior (arpegio) | el mismo acorde en la nueva inversión (los cifrados de dominante primero; si el diatónico y el marcado coinciden —6/5 y 6/5̸, 4/3 y +6, 7 y 7/+— vale el marcado; también el mismo acorde sin séptima: V7 → V6) |
| R5 | Fórmulas funcionales por salto | grado 6 que salta al 4 hacia el 5: `—`, `6` · grado 4 entre 6 y 5: `6`, `—`, `6/5` · grado 2 que salta al 5: `—`, `7` |
| R6 | Grado 4 que salta a una nota del V7 (7 o 2) | `+4` (V4/2 que se arpegia) |
| R7 | Regla de la octava por grados conjuntos, según la nota **siguiente** | véase tabla |

Tabla R7 (RO de Furno con las guardas acordadas):

| Grado | Condición | Cifras |
|---|---|---|
| 1 | — | `—` |
| 2 | — | `+6`, `6` |
| 3 | — | `6` |
| 4 | asciende al 5 | `6/5`, `—` |
| 4 | desciende al 3 viniendo del 5 | `+4` |
| 4 | desciende al 3 llegando por salto | `+4`, `—` |
| 4 | ni asciende al 5 ni desciende al 3 | `—` |
| 5 | — | `—`, `7/+` |
| 6 | asciende al 7 | `6`, `—` |
| 6 | desciende al 5 | `4/3`, `+6`, `6`, `—` |
| 6 | otro caso | `—`, `6` |
| 7 | asciende al 1 | `6/5̸`, `6` |
| 7 | otro caso | `6` |

Después se descartan las cifras que no estén en el repertorio del ejercicio.
En la corrección se aplica el mismo filtro a las respuestas del corpus
(`Ejercicios.admisibles`), y `preferir` reordena la modelo.

**Estado de validación:** el motor reproduce exactamente las 273 respuestas del
corpus fijadas a mano (`pruebas.html`: sin discrepancias). Los grados 6 y 7
elevados del menor melódico se tratan como 6 y 7.

Limitaciones conocidas: R4 admitiría `6/4` en un salto del 1 al 5 (I → I6/4)
si `64` estuviera en el repertorio; la fórmula «2̂ que salta al 5̂» no
distingue todavía II de II7 por contexto; las reglas de modulación no existen
aún.

## 7. Corpus (35 ejercicios)

- RO ascendente en Do mayor (7), RO descendente en Do mayor (7) y RO
  descendente en la menor (7): transcritos de los MusicXML de Diego.
- RO ascendente en la menor (7): **reconstruida** por transposición de la
  ascendente en Do mayor, con fa♯ y sol♯ ascendentes. El archivo original
  `RO ascendente en la menor.musicxml` era una copia sin transportar del de Do
  mayor (con créditos «RO descendente · solo en la menor»); conviene rehacerlo
  en MuseScore.
- RO descendente en Do mayor · cuarto (7): los mismos bajos con
  `preferir: ['+6']`, para ver la diferencia de modelo sobre el grado 6.
- Repertorio de todos: `—`, `6`, `6/5`, `4/3`, `7`, `7/+`, `+6`, `6/5̸`, `+4` (sin tachar).
- Respuestas fijadas a mano en `js/ejercicios.js`; el motor se comprueba
  contra ellas. Para cambiar una respuesta se edita la lista.

Decisiones tomadas al fijar el corpus, revisables:
- Grado 2 ascendente o descendente: modelo `+6`, se admite `6` (VII6).
- Grado 4 que asciende al 5: modelo `6/5`, se admite `—` (IV).
- Grado 4 que desciende al 3 llegando por salto (do–fa–mi): `+4`, se admite `—`.
- Grado 6 que desciende al 5: modelo `4/3` (II4/3, tercero), se admiten `+6`
  (cuarto, modelo con `preferir`), `6` y `—`.
- Grado 7 que asciende al 1: modelo `6/5̸`, se admite `6`; **no** se admite
  `6/5` sin tachar.
- do–re–si–do: `—`, `+6`, `6/5̸`, `—` (arpegio del V7); mi–fa–si–do: `6`,
  `+4`, `6/5̸`, `—`.
- En RO descendente en Do mayor, ejercicio 4, el bajo hace sol–do a mitad de
  frase (V–I por salto); se ha aceptado tal cual.

## 7 bis. Configurador del profesor (`configurar.html`, `js/configurador.js`)

Cinco pasos en una página:

1. **El bajo.** Por texto (`do3 re3 | mi3 do3 | sol3r | do3.`: nombres en
   español, `|` entre compases, sin sufijo = blanca, `r` redonda, `n` negra,
   `c` corchea, `.` puntillo, octava 3 por defecto) o arrastrando un archivo: un `.musicxml` de MuseScore
   (`js/musicxml.js` toma el pentagrama inferior, omite silencios, suma
   ligaduras, y cierra un fragmento en cada barra final; la tonalidad se
   deduce de la armadura y de la última nota, y se avisa si hay dudas) o un
   `.json` guardado desde el propio configurador. Tonalidad, compás, título y
   colección.
2. **Tipo de ejercicio.** Tres tarjetas grandes: Análisis, Armonización
   (por defecto) y Audición (decisión 14).
3. **Repertorio y opciones.** Casillas para las diez cifras del catálogo
   (por defecto las nueve de la RO); pedir o no el grado; permitir o no
   corregir solo los errores; cuándo se ve la realización (solo en
   Armonización); ayuda con los grados (ninguna / lista / paleta limitada);
   modelo sobre el grado 6 descendente (tercero: II4/3; cuarto: `+6`, que se
   guarda como `preferir: ['+6']`).
4. **Revisión.** «Analizar el bajo» ejecuta el motor y vuelca una tabla:
   nota, grado del bajo, una ficha por cifra del repertorio con casilla
   (admisible), grado que se derivaría y botón de modelo, más la regla y la
   explicación del motor. Las notas sin propuesta quedan en rojo. Columna
   «Tonalidad»: en cada nota, un desplegable con las cinco tonalidades
   vecinas para empezar ahí una modulación (la fila del pivote se resalta,
   muestra los dos grados y atenúa las cifras que no dan acorde común); al
   fijarla aparece en el paso 3 la opción de aviso al alumno. Vista previa
   de la partitura con la solución modelo (con la realización en Análisis y
   Audición, el rótulo de la tonalidad nueva y la casilla doble del pivote);
   cada acorde lleva encima su número, el mismo que la columna # de la
   tabla, y pulsarlo resalta la fila correspondiente.
5. **Dirección.** «Generar dirección» valida y codifica el ejercicio en la URL
   de `index.html` (unos 450–600 caracteres); botones Copiar, Abrir como
   alumno y Descargar `.json`. Con un MusicXML de varios fragmentos, «Generar
   direcciones de todos los fragmentos» produce la lista completa con las
   cifras del motor sin revisión manual, señalando fragmentos con notas sin
   propuesta o tonalidad dudosa.

El borrador se guarda en `localStorage` del navegador (funciona también desde
`file://`). Cualquier cambio en el bajo, las opciones o la revisión invalida
la dirección generada, para que no se distribuya una versión desfasada.

## 8. Etapas

| Etapa | Contenido | Estado |
|---|---|---|
| 0 | Especificación: modelo de datos, vocabulario, reglas | Hecha |
| 1 | Prototipo del alumno: partitura, paletas de cifra y de grado, corrección, URL | Hecha (20/9/2026) |
| 2 | Configurador del profesor: escribir o importar el bajo, elegir repertorio, revisar las cifras propuestas por el motor, generar la dirección | Hecha (20/9/2026) |
| 3 | Importación de MusicXML (arrastrar el archivo de MuseScore), con partición en fragmentos y deducción de tonalidad | Hecha (20/9/2026) |
| 4 | Realización a cuatro voces (tres posiciones de Furno + conducción automática), contador de paralelas, sonido con el bajo doblado a la octava grave; tres tipos de ejercicio (Análisis, Armonización, Audición) | Hecha (20/9/2026) |
| 5a | Modulación en ejercicios propios: tramos, pivote común, dos avisos, corrección, configurador y MusicXML (decisión 6) | Hecha (20/9/2026) |
| 5b | Generador de bajos por combinación de fragmentos válidos de la RO, con modulación por acorde pivote | Pendiente |
| 6 | *Schemata* de IJzerman (marchas progresivas, Romanesca, Quiescenza); respuestas por combinación | Pendiente |
| 7 | RO por la soprano (el alumno elige bajo y cifra; varias soluciones) | Pendiente |
| 8a | Publicación en GitHub Pages (guía `PUBLICAR-EN-GITHUB.md`) | Hecha (20/9/2026): <https://djvgon.github.io/armonizar/> |
| 8b | Recogida de resultados: Apps Script (mismo dominio murciaeduca.es identifica al alumno) → hoja de cálculo, y calificación en Classroom vía API (solo en tareas creadas por el propio script; el alumno sigue pulsando «Entregar»). Opcional: corrección en el servidor para los ejercicios evaluables, de modo que las respuestas no viajen en el enlace. Decidido 20/9/2026: dejarlo para esta etapa | Pendiente |
| 9 | Análisis sobre partitura real, al estilo de NEO: imagen con puntos marcados por el profesor (en cada punto, cifra y grado) o vídeo con partitura y audio que se detiene en los puntos de cifrado. Misma corrección (parejas admisibles por punto, fijadas a mano en el configurador, con tonalidad por tramo). La imagen puede viajar dentro de un `.json` sin alojamiento; el vídeo (YouTube o archivo) necesita la publicación de la Etapa 8 | Propuesta (20/9/2026), pendiente de decidir |

Decisiones pendientes: notación de las dominantes secundarias en el grado
(II frente a V/V para `+6` sobre el grado 6; la sexta aumentada en menor).
Con el modelo `+6` en cuarto, la respuesta V/V se vuelve más pertinente:
bastaría un botón «V/V» y una tabla de excepciones en `Teoria.romano`.

Mejoras pequeñas anotadas: dibujar el bajo pinchando en un pentagrama como
alternativa al texto; partir en dos sistemas los ejercicios largos;
constructor de cifras al estilo teoria.com como alternativa a la paleta;
corrección inmediata nota a nota como opción; modo con la modulación sin
anunciar.

## 9. Procedimiento de trabajo

- Diego conecta la carpeta del proyecto (la de Drive murciaeduca.es indicada
  en §2) desde la aplicación de escritorio; los archivos se escriben
  directamente allí. No se pide acceso a ninguna otra carpeta sin preguntar
  antes.
- Prueba de humo tras cada cambio: abrir `index.html` (un ejercicio del
  corpus), `pruebas.html` (sin discrepancias) y `configurar.html` (importar
  un MusicXML de `ejemplos/`, analizar, generar dirección, abrir como alumno).
- Una función por sesión; al terminar, la aplicación debe seguir abriéndose
  con doble clic y `pruebas.html` sin discrepancias.
- Al cerrar la sesión se actualiza este documento (estado de las etapas y
  decisiones nuevas).
- Las respuestas del corpus son la fuente de verdad; el motor se ajusta a
  ellas, no al revés.
- Cuando la aplicación esté publicada, cada entrega a la carpeta de Drive va
  seguida de la subida a GitHub por parte de Diego (paso 6 de la guía); las
  direcciones para alumnos se generan siempre desde el configurador publicado.
- **Versión visible y caché.** Los dos HTML llevan en el pie «Versión
  AAAAMMDD-HHMM» y cargan sus `.js` y `.css` con `?v=` esa misma marca. En
  cada entrega se actualiza la marca en `index.html` y `configurar.html`
  (así el navegador vuelve a pedir los archivos cambiados y Diego puede
  comprobar qué versión tiene delante). Si tras subir a GitHub sigue viéndose
  la anterior, es la caché del navegador: recargar sin caché (Chrome
  Cmd+Shift+R; Safari Opción+Cmd+R) o esperar hasta diez minutos.
