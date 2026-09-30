# App de armonización con cifrado barroco — especificación y estado

Documento de referencia del proyecto. Se lee al empezar cada sesión de trabajo
sobre la aplicación y se actualiza al cerrarla.

Última actualización: 21 de septiembre de 2026 (Etapas 0–4, 5a y 7 entregadas: prototipo, configurador, importación, realización a cuatro voces con conducción de voces y sonido, cuatro tipos de ejercicio —Análisis, Armonización, Audición y Armonización de soprano— con lo que ve el alumno fijado por tipo, fila de funciones tonales, atajos de teclado, compases ternarios y negras, modulación en ejercicios propios).

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
- **Tres subcarpetas** (decisión 62, 23/9/2026). La carpeta del proyecto se
  reparte según qué se hace con cada cosa, y **cada entrega va a la subcarpeta
  que le toca**:

  | Subcarpeta | Qué lleva | Entrega |
  |---|---|---|
  | `1 WEB (subir a GitHub)` | Los siete `.html`, `banco.json`, `envio.json` y las carpetas `css/`, `js/`, `fuentes/`, `sonidos/` | **Aquí va la aplicación.** Es exactamente lo que Diego arrastra a GitHub: todo su contenido, sin elegir |
  | `2 RESULTADOS (lo que recibo)` | El formulario de Google y su hoja de respuestas; mañana, las exportaciones | No se entrega nada aquí: lo llena el uso |
  | `3 PROYECTO (documentación y fuentes)` | `ESPECIFICACION.md`, `BITACORA.md`, `LEEME.md`, `PUBLICAR-EN-GITHUB.md`, las revisiones y `ejemplos/` con los `.mscz` y MusicXML de Diego | Aquí van los dos documentos que se actualizan al cerrar sesión |

  **Nunca a la raíz del proyecto ni a otra subcarpeta.** El 21-09-2026 se entregó
  por error a una subcarpeta `armonizar/`, que quedó como una copia a medias —sin
  `css/`, sin `fuentes/` ni `sonidos/`— mientras la aplicación buena se quedaba
  sin actualizar: se corrigió y se borró la subcarpeta.
- `ejemplos/` ya **no se publica**: son partituras fuente de Diego, no las
  necesita la web. `LEEME.md` tampoco.
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
  GitHub el contenido de `1 WEB (subir a GitHub)`.

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
     disposición en todos los acordes» y el contador de paralelas se
     quitaron de la página del alumno el 20/9/2026 a petición de Diego
     (confundían); siguen en `pruebas.html` y en el motor (`modo:
     'rigida'`) por si se quieren mostrar en clase.
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
   - **Instrumentos reales** (20/9/2026): piano, clave y órgano con
     muestras del banco FluidR3_GM (renderizadas a mp3 por midi-js-soundfonts,
     licencia CC BY 3.0; `sonidos/LICENCIA-muestras.txt`), una muestra cada
     tercera menor entre do1 y do6 incrustada en base64 en
     `sonidos/piano.js`, `clave.js` y `organo.js` (≈ 0,6–0,7 MB cada uno);
     las notas intermedias se transportan desde la muestra más cercana. El
     archivo del instrumento se carga solo cuando hace falta (se precarga
     en el primer clic o tecla) y funciona también desde `file://`. Un
     desplegable «Instrumento» en la barra de sonido (Piano por defecto,
     Clave, Órgano, Sintético) recuerda la elección en el navegador. Un
     compresor suave evita la saturación de los acordes de cinco notas; el
     órgano repite su tramo estable si la nota es más larga que la muestra.
   - Sonido (`js/sonido.js`, Web Audio). Tres botones, con
     **el bajo doblado a la octava grave** en toda reproducción (para que
     destaque y ayude a reconocer las inversiones); nombres y comportamiento
     fijados por Diego el 20/9/2026:
     - «▶ Escuchar tono»: cadencia I–IV–V7–I en la tonalidad inicial, para
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
     - Lo que se dibuja mientras el ejercicio está abierto (decisión 14,
       20/9/2026): en Análisis, bajo y armonización modelo en el pentagrama
       de sol; en Armonización, solo el bajo; en Audición, **nada** (ni
       bajo ni realización: solo las casillas y los botones ▶), o solo el
       bajo si el profesor lo pide (`mostrarBajo`). Al cerrarse
       el ejercicio (todo correcto o «Ver la solución») se ven bajo y
       realización en los tres tipos —en Armonización y Audición, la
       realización de lo que el alumno ha cifrado, con los acordes erróneos
       en rojo—, y una casilla permite ocultar la realización.
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
    - **Armonización de bajo** (`'armonizar'`, por defecto): **solo el bajo**; el
      alumno lo cifra y puede oír lo que escribe («Mi cifrado»). La
      realización de su cifrado se ve al terminar.
    - **Audición** (`'audicion'`): **no se ve nada**, ni el bajo ni la
      realización; el alumno escucha la armonización modelo («Escuchar
      propuesta», o acorde a acorde con el ▶ de encima de cada casilla, con
      botones destacados) y cifra lo que suena; puede oír su cifrado con
      «Mi cifrado». Bajo y realización aparecen al terminar. Opción por
      ejercicio (`mostrarBajo: true`, elegida en el configurador): que se
      vea el bajo mientras escucha (la realización sigue oculta).
    - **Armonización de soprano** (`'soprano'`, Etapa 7, 20/9/2026): las notas
      del ejercicio son la melodía, en el pentagrama de sol; el alumno da
      en cada nota la fundamental y la cifra **igual que en los otros
      tipos** (decisión de Diego: así responde de la misma forma en los
      cuatro tipos) y el bajo que resulta aparece escrito en el pentagrama
      de fa (la cifra dice qué nota del acorde va en el bajo:
      `Teoria.bajoDe`). **El acorde completo se ve en cuanto se responde**
      (21/9/2026), con la melodía fija en la voz superior, y es exactamente
      lo que el alumno ha escrito: una combinación incoherente (I con 6/5̸) o
      un acorde que no contiene la nota se dibujan tal cual, sin arreglos
      (`bajoDe` en modo no estricto; `Realizacion.disposicionForzada` cuando
      ninguna disposición correcta lleva la melodía arriba). Véase la
      decisión 21.
    Nombres de los cuatro tipos (Diego, 20/9/2026): Análisis, Armonización
    de bajo, Audición y Armonización de soprano; las claves internas
    (`cifrar`, `armonizar`, `audicion`, `soprano`) no cambian, para que los
    enlaces ya repartidos sigan valiendo.
    Lo que se ve en cada tipo lo fijó Diego el 20/9/2026 (antes Audición
    mostraba el bajo y Armonización tenía la opción `realizacion` para
    elegir cuándo ver la realización; esa opción ha desaparecido).
13. **Ayuda con los grados** (`ayudaGrados`, por ejercicio): `ninguna`
    (paleta I–VII sin lista), `lista` (por defecto: paleta completa y la
    fila «Grados en este ejercicio», deducida de las respuestas admisibles o
    fijada con `grados: [...]`) o `paleta` (la paleta de grados solo ofrece
    los del ejercicio: andamio para un primer contacto; combinada con los
    reintentos, permite acertar probando, así que conviene reservarla a la
    práctica inicial). Decidido tras valorar que limitar la paleta facilita
    demasiado si es la única forma de trabajar.
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
16 bis. **Silencios y frases** (21/9/2026). Un acontecimiento del bajo o de la
    melodía es `[nombre, duración]`; con `null` en el nombre es un **silencio**
    (en el texto del configurador, un guion bajo: `_`, `_n`, `_c`, `_r`). Los
    silencios se importan de MuseScore, se dibujan en los pentagramas visibles y
    ocupan su tiempo al reproducir, pero no llevan casilla ni respuesta. Además
    **cortan la frase**: la nota anterior se analiza como final (semicadencia o
    cadencia) y la siguiente como comienzo; no se conduce ni se juzga el enlace a
    través de un silencio, y en la armonización de soprano cada frase tiene su
    propio comienzo (tónica) y su propia cadencia S – D – T. Las respuestas siguen
    yendo por nota: `Teoria.eventos`, `notasDeCompases` y `cortes` traducen entre
    unas y otras.
16 ter. **Menor melódica** (Diego, 21/9/2026): «los grados 6 y 7 de la escala menor
    no tienen afinación fija: ascendiendo se toman del modo mayor (elevados medio
    tono) y descendiendo, de la escala natural». La función del acorde no cambia,
    solo su cualidad: en la menor, con el 6 elevado, el II es si–re–fa♯ y el IV,
    re–fa♯–la. En los bajos dados sale solo, porque cada nota lleva su alteración
    escrita; en la armonización de soprano, el acorde se construye con la
    inflexión que contenga la nota de la melodía (`Teoria.tonParaAcorde` y
    `tonParaBajo`, con la marca `{melodica: true}` en la tonalidad). Pendiente: una
    7.ª descendente natural en la melodía (sol♮ en la menor) no tiene acorde en el
    repertorio diatónico actual —pediría el III o el v menor—; falta decidirlo.
17. **Compases y figuras.** Cualquier compás (4/4, 3/4, 2/4, 2/2, 3/2) y
    figuras de redonda, blanca, negra y corchea, con puntillo. En el texto
    del bajo: sin sufijo = blanca, `r` redonda, `n` negra, `c` corchea, y un
    punto para el puntillo (`do3.` = blanca con puntillo). En MusicXML se
    leen `<type>` y `<dot>`. El configurador avisa (sin impedirlo) de los
    compases cuyas duraciones no cuadran con el compás, para permitir
    anacrusas y compases finales incompletos. Las duraciones se guardan en
    negras (3 = blanca con puntillo, 0.5 = corchea).

18. **Orden de respuesta** (20/9/2026): primero el grado de la fundamental
    y después el cifrado. La paleta «Grado de la fundamental» va encima de la
    de «Cifrados» (antes «Cifra»), la casilla activa inicial es la del grado
    y, al responder, se pasa del grado al cifrado de la misma nota (en un
    pivote: grado anterior, grado nuevo, cifrado). Las flechas ↑ ↓ siguen el
    orden visual de las casillas (cifrado arriba, grado debajo).
19. **Tamaños y móvil** (20/9/2026). Las cifras de las casillas y las de
    la paleta tienen el mismo tamaño (numerales de unos 11 px). En
    pantallas de menos de 720 px de ancho (móvil): las paletas de grado y
    cifrado se fijan en la parte baja de la pantalla como un teclado (sin
    los números de atajo), la partitura no se encoge sino que se desplaza
    en horizontal y la casilla activa se mantiene a la vista al avanzar; el
    enunciado va recortado a dos líneas (se despliega al pulsarlo) y la
    cabecera, las listas de grados y cifrados y la barra de sonido son más
    compactas.
20. **Funciones tonales** (20/9/2026). En cualquier tipo de ejercicio puede
    haber una fila «Función» (T · S · D) debajo de la de las fundamentales
    —orden de arriba abajo: cifrado, fundamental, función, todo bajo el
    pentagrama de la propuesta—, según el cuadro verde de Diego: **T = I y
    VI; S = II, IV y VI; D = V, VII y V7** (el VI es S si va a la
    dominante y T en los demás casos). Opción por ejercicio (`funciones`):
    `dadas` (el alumno la ve rellena y fija; en la melodía de soprano solo
    se admiten acordes de esa función) o `pedir` (la rellena él, antes que
    la fundamental y la cifra; se acepta la función del acorde modelo, la
    de cualquier acorde admisible o la del acorde dado si es correcto). La
    función de cada nota la fija el profesor en la revisión
    (`funcionesNotas`); si no, se deduce del acorde modelo.
21. **Armonización de una melodía de soprano** (Etapa 7, 20/9/2026). La RO
    no se aplica igual desde la soprano (para cada nota hay varios bajos
    posibles), así que el ejercicio impone el orden de decisiones de clase:
    la función de cada acorde (fila «Función», dada o pedida), y después
    el acorde por la RO leída al revés («quiero un si en el bajo bajo el
    fa: si con 6/5̸ es el V»). El motor (`Reglas.proponerSoprano`) calcula
    en cada nota **todos** los acordes del repertorio que contienen la
    nota (candidatos; para mi–fa–mi, todos los I–V7–I con sus
    inversiones, como pidió Diego), descarta los que doblan en el bajo la
    sensible o la séptima, y de entre ellos deja como admisibles los que
    caben en alguna **sucesión válida**: sin volver de la dominante a la
    subdominante, con la sensible del bajo subiendo a la tónica y la
    séptima del bajo bajando, sin octavas ni quintas seguidas entre bajo y
    melodía, 6/4 solo cadencial y final en I o V en estado fundamental. La
    sucesión modelo se elige por programación dinámica con preferencias:
    bajo por grados, las cifras de la RO en cada grado del bajo, S → D
    mejor que T → D, y el V en estado fundamental en la cadencia. Además,
    **reglas fijas de comienzo y cadencia** (Diego, 20/9/2026: «todo el
    tiempo ha de sonar D–T o S–D–T, y en la cadencia final S–D–T»):
    la primera nota lleva la tónica (I; si la nota no está en I, la
    dominante, como anacrusa; nunca el VI); la penúltima, una dominante
    (si la nota lo permite; si no, cadencia plagal: subdominante); la
    antepenúltima, **solo subdominantes** (II, II6, II7, II6/5, II4/3, IV,
    IV6, VI) siempre que la nota admita alguna; y, si el 6/4 está en el
    repertorio, la nota anterior a la dominante es de la tónica y la
    dominante va en estado fundamental, el **6/4 cadencial** es el modelo
    (con las subdominantes también admitidas) y la subdominante pasa a la
    nota anterior (S – 6/4 – V – I). El 6/4 solo existe en ese sitio y se
    trata como función D (adorno de la dominante). En una semicadencia, la
    penúltima lleva subdominante si puede. Otras exclusiones: VI solo en
    estado fundamental, VII solo como VII6, y ninguna primera inversión de
    I, IV o V con la tercera doblada en las voces extremas. **La
    subdominante (II, IV o VI) no vuelve a la tónica**: va a la dominante
    (regla de Diego, 20/9/2026). Única excepción: la bordadura **I – IV – I**
    (fórmula T S T, un esquema en sí), que se admite salvo que el ejercicio
    la prohíba (`formulaTST: false`), y la cadencia plagal final.
    **Repertorio por funciones** (Diego, 20/9/2026): en la armonización de
    soprano el configurador no ofrece cifras sueltas sino acordes agrupados
    por función —T: I, I6, VI; S: IV, IV6, II, II6, II7, II6/5, II4/3, V/V
    (+6 sobre el 6.º); D: V, V7, V6, V6/5̸, V4/3, V4/2, VII6, 6/4
    cadencial—, más la casilla de la fórmula T S T; por defecto, el
    repertorio de tercero (sin VI, sin V/V, sin 6/4). Solo los acordes
    marcados entran en el análisis (`ej.acordes`), y la paleta de cifrados
    del alumno se forma con sus cifras. El profesor
    revisa y fija el modelo como en los demás tipos; las respuestas se
    guardan como parejas `'V|65d'`. Al corregir, además de las parejas se
    comprueba el **enlace** entre dos respuestas admisibles seguidas
    (sensible o séptima sin resolver, octavas con la melodía, D → S) y se
    explica el fallo. El III queda fuera (no está en el cuadro verde); las
    séptimas diatónicas (7, 6/5, 4/3) solo se admiten sobre el II. El
    bajo deducido se escribe en la octava más cercana al anterior, dejando
    sitio a las voces intermedias, y la realización lleva la melodía fija
    en la soprano (sin posición inicial). **La voz dada —bajo o melodía— no
    se modifica bajo ningún concepto** (Diego, 21/9/2026): si un acorde no
    admite ninguna disposición correcta con la melodía arriba, se fuerza
    (melodía intacta, dos notas del acorde escrito debajo). Decisión
    pendiente: las tablas
    de la «RO para la soprano» de Diego, si las aporta, pasarían a ser las
    preferencias del modelo.
22. **Normas de enlace en la conducción automática** (pendiente, pedido el
    20/9/2026). Las normas de la pauta de corrección de Diego (XS1–XS4,
    XN1–XN6, Y1, Y4, Y5) se incorporarán a los costes de la realización
    automática para que esos errores no aparezcan, sin mostrar códigos en
    los cuestionarios. Y2 e Y3 (tesituras y distancias corales) no se
    aplican a la disposición de teclado de Furno. **Parcialmente hecho el
    21/9/2026**: los movimientos directos a la octava o a la quinta (XN2 con el
    bajo, XN3 entre las voces agudas, con sus excepciones de grado conjunto) pesan
    ya en la conducción automática, y las paralelas pesan más que cualquier otro
    defecto. Auditadas las 105 realizaciones del corpus (35 ejercicios × 3
    posiciones): 0 paralelas y 3 quintas directas entre voces interiores en 2 de
    ellas.
23. **Aviso de conducción de voces** (21/9/2026, `Realizacion.auditar`).
    Cuando la realización que se ve tiene un error de enlace, **las notas
    implicadas se dibujan en rojo** (las cuatro, en unas octavas o quintas
    seguidas) y, al pulsar cualquiera de ellas, se abre un **globo** con la
    explicación en lenguaje llano —sin los códigos de la pauta— y con los
    nombres de las voces y de las notas; el globo se dibuja en una banda
    reservada al pie de la partitura, unido a la nota por una línea fina,
    para no tapar nunca la música. Se comprueban: octavas y quintas
    seguidas entre dos mismas voces, por movimiento paralelo o contrario e
    incluidas las compuestas (XN1, XNc); octavas y quintas por movimiento
    directo con el bajo (XN2) y entre las tres voces superiores (XN3), con
    sus excepciones de grado conjunto y sin contar los cambios de
    disposición del mismo acorde (XN4); la séptima que no baja y la
    sensible de las voces extremas que no sube (XS4c); y las voces
    cruzadas (Y4a). Sirve sobre todo en la armonización de soprano: un
    acorde puede ser correcto en sí (II6) y no poder usarse ahí porque
    produce octavas con el bajo. El número de avisos se resume al corregir
    («Conducción de voces: 2 avisos»), pero no resta aciertos: la
    calificación sigue siendo la de las parejas grado + cifra.
24. **Alteraciones accidentales en la cifra** (21/9/2026, `Teoria.filasCifra`).
    Toda voz superior alterada **respecto de la armadura** lleva su alteración
    escrita junto al número de su intervalo; si la alterada es la **tercera**,
    la alteración va sola, sin número. El caso de todos los días es el **V del
    modo menor**, cuya tercera es la sensible: donde antes se veía la raya del
    5/3 ahora se ve **♯** en la menor (sol♯), **♮** en do menor (si♮, porque la
    armadura lleva si♭) y el signo que corresponda en cualquier otra tonalidad
    —el mismo que lleva la nota en el pentagrama—. Con la menor melódica, el
    6.º grado elevado se marca igual. Los cifrados que ya señalan la sensible
    con el `+` de Furno (`7/+`, `+6`, `+4`) no se tocan, y tampoco se añaden
    filas a los que tienen equivalente marcado (`6/5`, `4/3`, `7`): ahí la
    alteración la lleva ese otro cifrado, que es el que ofrece el repertorio.
    **La paleta no cambia y no hay respuestas nuevas**: el alumno sigue
    pulsando «—» y la aplicación escribe el signo al dibujar la cifra. Se ve en
    la casilla del alumno, en la respuesta modelo y en los chips de la revisión
    del profesor; los botones de la paleta y la lista «Cifrados en este
    ejercicio» siguen mostrando la cifra escueta, porque no corresponden a una
    nota concreta.

25. **Modo de un fragmento importado** (21/9/2026, `MusicXML.cerrar`). Una
    armadura sirve para dos tonalidades, y muchos fragmentos acaban en
    semicadencia, así que la última nota no basta. Ahora se suman indicios:
    acabar en la tónica (2), empezar en ella (1) y —el más claro— **que la
    sensible del relativo menor aparezca como alteración accidental** (sol♯
    con la armadura de Do, si♮ con la de Mi♭) (2). Para dar el menor por
    seguro se exige una prueba de verdad —la sensible escrita o el final en
    la tónica—, porque empezar en la tónica menor es también empezar en el VI
    del relativo mayor. Si los indicios empatan se toma el mayor y el
    fragmento se marca con «(?)» en la lista. Sobre los 196 fragmentos del
    banco de Diego, los dudosos bajaron de 22 a 7 y se corrigieron cuatro que
    se leían en el relativo mayor (semicadencias en la menor, mi menor, sol
    menor y re menor).

26. **Banco de fragmentos y fichas** (Etapa 10, 21/9/2026, `js/banco.js`).
    - **El banco se llena solo.** Al importar un archivo de MuseScore, el
      configurador analiza todos sus fragmentos con las opciones del momento y
      guarda cada uno con sus **etiquetas**, que salen del propio análisis:
      lección (del nombre del archivo), tonalidad y modo, alteraciones de la
      armadura, compás, número de notas y de compases, qué voces trae escritas,
      qué cifras y qué grados usa la respuesta modelo, si modula y un **nivel
      del 1 al 5**. Lo único que se escribe a mano es la lección, y viene
      propuesta. Cada entrada guarda las respuestas admisibles de las dos
      voces, de modo que sirve para los cuatro tipos de ejercicio.
    - **Nivel**: se calcula con el número de notas, cuántas cifras distintas usa
      el modelo, las alteraciones de la armadura, si es menor y si modula; al
      tipo de ejercicio se le suma su ajuste (Análisis −1, Armonización de bajo
      0, Audición +1, Armonización de soprano +1: armonizar una melodía cuesta
      más que armonizar un bajo). Se puede corregir a mano y se guarda.
    - **Sin duplicados.** Dos fragmentos son el mismo ejercicio cuando, en la
      misma tonalidad, coincide toda voz que los dos tengan escrita. Así los
      archivos «… - Bajo», «… - Soprano» y «… - Bajo y soprano» de una lección
      se funden en una sola entrada con las dos voces, pero dos melodías
      distintas sobre el mismo bajo siguen siendo dos ejercicios.
    - **Dónde vive**: el banco se guarda en el navegador del profesor y se
      descarga como `banco.json`, que se sube al repositorio junto a la
      aplicación. La página del alumno lo lee con `fetch`.
    - **Ficha**: un enlace `index.html#f=<filtro>` con el filtro y el tipo de
      ejercicio, no con los ejercicios. Al abrirlo, la página baraja los
      fragmentos que cumplen el filtro, toma N y los encadena con un contador
      («ejercicio 3 de 8») y un resumen final con el resultado de cada uno y un
      botón «Otra ficha como esta». Cada vez que se abre salen otros: sirve para
      practicar, no para calificar. El enlace es corto (unos 200 caracteres) y
      **no caduca al ampliar el banco**.

27. **Los avisos de conducción de voces se corrigen** (21/9/2026, pedido por
    Diego: «son errores similares a los de sintaxis»). Antes se señalaban en
    rojo y se explicaban, pero no había forma de arreglarlos: si los cifrados
    estaban bien, el ejercicio se cerraba con el choque dentro. Ahora:
    - **No restan aciertos** —el resultado sigue siendo función, grado y
      cifrado—, pero **hay que limpiarlos**: mientras queden, el ejercicio no
      se da por terminado y en vez de «Todas las respuestas son correctas»
      aparece «Corregir los errores».
    - Al pulsarlo, **las notas implicadas quedan editables** junto a las
      equivocadas, para probar otra de las cifras admisibles. El marcador los
      cuenta aparte: «Conducción de voces: 2 avisos (1 por arreglar)».
    - **Solo cuenta lo que ha causado el alumno**: se audita su armonización y
      la de la respuesta modelo, y se le pide arreglar únicamente los avisos
      que no estén también en el modelo. Si ese bajo no admite nada mejor, no
      se le exige lo imposible (en el corpus, 2 de las 105 realizaciones
      modelo tienen una quinta directa).
    - **En Armonización de bajo y en Armonización de soprano**, que es donde la
      armonización sale de lo que escribe el alumno. En Análisis la realización
      que se ve es la del modelo —no depende de su respuesta— y en Audición no
      puede enseñarse sin descubrirle el ejercicio; ahí los avisos se siguen
      viendo y explicando, pero no impiden terminar.
    - En Armonización de bajo la realización no se ve hasta el final; en cuanto
      sale un aviso **se queda a la vista** para que pueda ver lo que arregla,
      y las notas rojas se actualizan solas mientras cambia las cifras.

28. **Nada de síncopas armónicas** (21/9/2026, regla de Diego). Un acorde no
    puede entrar en parte débil y prolongarse sobre la fuerte: **al pasar a una
    parte más fuerte la armonía ha de cambiar**.
    - **Fuerza métrica** (`Teoria.fuerzasMetricas`): 3 el primer tiempo del
      compás; 2 la mitad del compás, solo en los compases binarios (el 3.º de
      4/4, el 2.º de 2/4); 1 los demás tiempos; 0 a contratiempo. En los
      compases ternarios no hay mitad, de modo que el 2.º y el 3.er tiempo
      pesan igual: un acorde que entre en el 2.º de 3/4 y siga en el 3.º **no**
      es síncopa (lo pidió Diego expresamente).
    - **No cuenta el arpegio**: el mismo acorde con el bajo en otra nota
      (V4/3 → V6/5 cruzando la barra) es la marcha normal de la regla de la
      octava y está en el corpus. La síncopa es repetir el acorde **sobre la
      misma nota del bajo y con la misma cifra**; añadir la séptima al mismo
      acorde (V → V7 sobre el mismo bajo) sí es un cambio de armonía y se
      admite.
    - **En el bajo dado**, cuando la nota se repite sobre el tiempo fuerte la
      regla R3 ya no mantiene el acorde: si la nota siguiente baja de grado,
      esa nota se vuelve **séptima preparada** y se cifra **4/2** (o +4 si el
      intervalo ya es el de dominante); si no, se proponen los acordes del
      repertorio con otra fundamental. Además `Reglas.proponer` repasa el
      modelo entero y, donde queda una síncopa, adelanta otra cifra admisible
      de esa nota o de la anterior.
    - **En la melodía de soprano** la exigencia entra en `enlaceValido`, de
      modo que el modelo que elige la programación dinámica nunca sincopa.
    - **Para el alumno es un error de enlace**, como las octavas seguidas o
      «la subdominante no vuelve a la tónica»: la casilla sale en rojo, se
      explica («síncopa armónica: el acorde entra en parte débil y se prolonga
      sobre la fuerte») y queda editable al pulsar «Corregir los errores». En
      Armonización de bajo y en Armonización de soprano.
    - Sobre el banco de Diego, las síncopas del modelo bajaron de 11 a 1 (la
      que queda está en el fragmento de A3-1 al que aún le falta la barra doble
      del compás 17), y **el corpus sigue reproduciéndose entero**: 273 de 273.
29. **Cifrado 4/2** (21/9/2026). Séptima diatónica en tercera inversión (2ª, 4ª
    y 6ª): la séptima en el bajo, preparada, que baja de grado. Completa la
    serie 7 – 6/5 – 4/3 – 4/2 y es el cifrado del **II4/2** sobre la tónica que
    resuelve la nota repetida. Entra en el repertorio por defecto y, en la
    armonización de soprano, en el catálogo de acordes como subdominante. Con
    el intervalo de dominante vale el marcado `+4` (`MARCADOS`).

30. **Cada fragmento lleva el repertorio de su lección** (21/9/2026, pedido por
    Diego: «cuando se mezclan los fragmentos de A3-3 y A3-7 es imposible acertar
    con la armonización esperada»). Al añadir un fragmento al banco se guarda con
    él el repertorio marcado en el paso 3 —las cifras y, en la armonización de
    soprano, los acordes—, que es **el de su lección**. Una ficha ya no impone el
    repertorio del filtro: cada fragmento se juega con el de la lección a la que
    pertenece. En la página del alumno aparece, encima del ejercicio, una fila
    **«Lección»** con su nombre («A3-5 · El 6/4 cadencial») y otra con **los
    acordes de esa lección** (grado y cifra, no solo las cifras). El panel del
    banco enseña el repertorio de la lección elegida y tiene un botón para
    rehacerlo con el del paso 3, sin volver a importar el archivo.
    Un fragmento con avisos (alguna nota sin cifra posible) se marca con ⚠ en la
    tabla y **no entra en las fichas**.

31. **La sensible se eleva solo en los acordes de dominante** (21/9/2026).
    Hasta ahora las voces superiores se construían SIEMPRE sobre la escala
    armónica, de modo que cualquier acorde que contuviera el 7.º grado lo
    llevaba elevado. Eso hacía que el **III saliera aumentado** por defecto
    (do–mi–sol♯ en la menor) y que, al cifrarlo, la aplicación escribiera un
    `♯5` que el alumno no había puesto: pulsaba «—» y veía «♯5».
    Ahora la escala armónica se usa en los acordes cuya fundamental es el **5.º
    o el 7.º grado** (V y VII, y los cifrados de séptima de dominante, que se
    construyen aparte); en los demás la 7.ª se queda natural. Así el III es
    mayor —como dice Diego que suele ser—, el I con séptima es menor, y el
    cifrado del alumno se dibuja tal como lo escribió.
    **Pendiente** (va con «el III como acorde propio», A4-2): que la 5.ª del III
    pueda elevarse cuando el sol asciende al sol♯ de la dominante, como el 6.º y
    el 7.º grados de la menor melódica, que no tienen afinación fija. Hoy el III
    es siempre mayor.

32. **Un cambio de armadura cierra el fragmento** (21/9/2026). En un archivo de
    lecciones cada ejercicio va en su tonalidad, así que un cambio de armadura
    es un ejercicio nuevo aunque se haya olvidado la barra doble: el importador
    cierra ahí el fragmento y avisa («conviene poner también la barra doble»).
    La excepción es que el fragmento ya lleve una **etiqueta de tonalidad**: eso
    significa que la modulación está escrita a conciencia, y entonces el cambio
    de armadura se sigue leyendo como modulación (decisión 6). Con esto, los dos
    ejercicios de A3-1 que estaban pegados por las barras que faltan en los
    compases 17 y 22 entran ya como cuatro fragmentos independientes, y el banco
    pasa a **130 fragmentos sin ninguna síncopa armónica en el modelo**.

33. **La armadura, la tonalidad y el cifrado han de decir lo mismo** (21/9/2026).
    El fragmento A3-8-03 (`do do si sol | do`, armadura de Do M) se leía en Sol M
    y se cifraba con acordes de Do M. Tres arreglos en el importador:
    - **El rótulo va donde está escrito.** MuseScore coloca los textos con
      `<location><fractions>`, que mueve el cursor dentro del compás; el lector
      no lo miraba y todos los rótulos caían al final del compás (o al principio
      del siguiente). Ahora `js/musescore.js` calcula el tiempo exacto de cada
      rótulo y lo pasa en el `<offset>` del `<direction>` de MusicXML. Con esto
      los acordes pivote caen donde Diego los escribió: el **do** del fragmento 1,
      el **la** del 6 y el **mi** anterior al fa♯ del 7 —las tres correcciones que
      pidió—, sin tocar nada en la partitura.
    - **Un rótulo al principio ya no manda sobre la armadura.** El «Sol M» que
      abría A3-8-03 era el final del ejercicio anterior. Ahora un rótulo inicial
      fija la tonalidad solo si nombra una de las dos tonalidades de la armadura,
      o si la música NO cabe en ninguna de ellas (entonces la armadura es la
      equivocada). Si no, manda la armadura y se avisa.
    - **Coherencia general.** Si un fragmento no modula y alguna nota no cabe en
      su tonalidad (natural, armónica o melódica), se busca la tonalidad vecina
      —hasta dos alteraciones— encabezada por la nota final o la inicial en la
      que sí quepa, y se marca con (?). Así el ejercicio de A3-2 escrito con la
      armadura del anterior se lee en **la menor** y no en mi menor.

34. **La cifra ha de cuadrar con el bajo escrito** (21/9/2026). El motor descarta
    toda cifra cuyo bajo teórico (`Teoria.bajoDe`) no sea la nota escrita: un
    `V6` sobre un sol♮ en la menor pide sol♯, así que no se propone. Lo que antes
    salía como un «V6 sin sensible» ahora queda sin cifra y el fragmento se marca
    para revisar: es la señal de que falta un rótulo de modulación.

35. **Las dominantes secundarias son opcionales** (21/9/2026). El `+6` sobre el
    6.º grado da el `II+6` (V/V, decisión 9). Es recurso de A4, así que en el
    bajo dado solo se propone si la lección lo trae expresamente en su lista de
    acordes (`II|+6` está en el catálogo con la casilla sin marcar). Antes se
    colaba en tres fragmentos de A3-6, donde el alumno no podía acertarlo porque
    no figuraba en el repertorio que se le muestra.

36. **Modulación cromática** (21/9/2026). Si la nota rotulada lleva una
    alteración ajena a la tonalidad de partida (el do♯ al pasar de Sol M a Re M),
    no hay ningún acorde común: no existe pivote. En vez de dejar la nota sin
    cifra, la tonalidad nueva empieza ahí con sus propios acordes y se explica:
    «Modulación cromática: la alteración de esta nota es ajena a Sol M, así que
    no hay acorde pivote; aquí empieza ya Re M».

37. **El 3.er grado como nota final es el I6** (21/9/2026). La regla del final
    daba estado fundamental a cualquier nota, y un fragmento que acaba en el 3.er
    grado salía cifrado **III** —que deja sin resolver la sensible y la séptima
    del acorde anterior—. Ahora propone `I6` (el `53` sigue siendo admisible).
    Con esto desaparecen los diez «III finales» del banco.
    Además, si el último acorde no es ni I ni V (ni cadencia ni semicadencia), el
    fragmento se marca con un aviso: es señal de que falta el rótulo de vuelta a
    la tonalidad de partida.

38. **Cada fragmento del banco, un identificador propio** (21/9/2026). El número
    se contaba por archivo, de modo que una lección repartida en varios archivos
    (bajos, sopranos, melodías) repetía identificadores: 131 fragmentos con solo
    114 identificadores distintos. Ahora se toma el primero libre de esa lección.

39. **Delante de la tónica solo va la dominante** (21/9/2026). La subdominante no
    vuelve a la tónica mientras no se haya dado la fórmula T S T, que todavía no
    tiene fragmentos. Donde el motor ponía `IV – I6` ahora pone la dominante que
    cabe sobre ese mismo bajo: casi siempre el **V4/2**, con la séptima preparada
    por el acorde anterior, que baja de grado a la tercera de la tónica. Así, el
    fragmento `do mi | fa fa | mi` pasa de `I | I6 | IV | IV | I6` a
    **`I | I6 | IV | V+4 | I6`** (T T S D T).

40. **En la cadencia final, la subdominante antes de la dominante** (21/9/2026),
    siempre que se pueda. Si el final era una fila de acordes de dominante —el V
    arpegiado durante dos compases—, los primeros se cambian por subdominante y se
    deja la dominante pegada a la tónica: el esquema es **S – D – T**. El fragmento
    `do re mi | fa re | sol | do` pasa de `I | V+6 | I6 | V+4 | V+6 | V | I` a
    **`I | V+6 | I6 | IV | II | V | I`**.
    Quedan 13 fragmentos sin subdominante en la cadencia: en todos ellos las notas
    que preceden a la tónica son el 5.º o el 7.º grado, donde no hay ningún acorde
    de subdominante posible (y en A3-1 el repertorio son solo I, V y V7). El motor
    los marca (`sinSubdominante`) en vez de forzar nada.

41. **El modelo se limita a los acordes de la lección** (21/9/2026). Hasta ahora la
    lista de acordes del paso 3 solo gobernaba la armonización de melodías; en el
    bajo dado mandaba únicamente la lista de cifras, de modo que salían acordes que
    el alumno no tenía a mano. Ahora, si el ejercicio trae la lista de acordes de su
    lección, el modelo y las admisibles se limitan a ella: es lo que deja fuera el
    **III** (en estas lecciones la tónica es solo I, en estado fundamental o en
    primera inversión) y el VII en estado fundamental. Como consecuencia, **las
    reglas se prueban hasta que una deje alguna cifra del repertorio**: que una regla
    se cumpla ya no basta si lo que propone no está disponible —el arpegio del VII
    sobre la sensible, cuando la lección solo tiene I, V y VII6, deja paso al V6—.

42. **Un fragmento, un identificador; y la misma música, una sola entrada**
    (21/9/2026). Dos entradas con la misma música en tonalidades distintas son el
    mismo ejercicio cuando al juntarlas aparece la voz que a una le faltaba: es lo
    normal entre el archivo de bajos y el de melodías, y solo la melodía —con su
    sensible escrita— dice de verdad en qué tonalidad está. Manda entonces la
    lectura de las dos voces. Con esto, el ejercicio de A3-2 que entraba dos veces
    —una en mi menor, sin melodía, y otra en la menor— queda en una sola entrada en
    **la menor**.

43. **Correcciones de Diego en las partituras** (22/9/2026). En *A3-8. Modulación al V*
    ha puesto el rótulo «Do M» sobre el sol del fragmento 6, que modulaba al V y volvía:
    ahora sale `I | II | V 6/5̸ | V | I`, y con eso no queda ningún fragmento que acabe
    en un acorde que no sea tónica ni dominante. En *A3-2 – Fragmentos Sopranos* ha
    partido con una barra doble el ejercicio cuyo final cadenciaba en el relativo mayor:
    salen dos fragmentos independientes, uno en la menor y otro en Do mayor, los dos
    limpios. El banco queda en **131 fragmentos**. Falta la misma barra doble en el
    archivo de bajos de A3-2, donde ese ejercicio sigue entero y sin cifrar del todo.

44. **Sintaxis de la cadencia, segunda vuelta** (22/9/2026). Cuatro arreglos que van
    juntos, todos nacidos de la misma observación de Diego —el análisis de un ejercicio
    de A3-8— y de la ortografía armónica (la nota tendencial no se dobla y ha de
    resolver):
    - **El 6/4 es el CADENCIAL.** Solo se propone sobre el 5.º grado y solo cuando la
      nota siguiente repite esa misma nota, para que resuelva en el V sobre ese bajo.
      Desaparece así el 6/4 como arpegio de la tónica (do → sol), que ni resolvía ni era
      dominante aunque la fila de funciones lo diera por tal. Y, en cambio, **se ofrece
      ahora sobre el 5.º grado repetido**, que es justamente la fórmula de A3-5: donde la
      melodía trae la tónica o la tercera, el modelo es I6/4 – V – I.
    - **La voz compañera entra en el motor.** Cuando el archivo trae las dos voces, la
      melodía escrita elegía entre las admisibles DESPUÉS de haber corrido el motor
      (`Banco.preferir`), de modo que las reglas de las notas siguientes —el arpegio, la
      nota repetida— habían partido de un acorde que luego cambiaba. Ahora la nota que
      suena a la vez entra como `ej.companera` y elige dentro del propio motor; el bajo ya
      no pasa por `preferir`, y así hay una sola fuente de verdad.
    - **El motor se pasa dos veces.** La sintaxis de la cadencia corrige acordes, y esas
      correcciones cambian lo que las reglas deben ver en las notas siguientes. Se vuelve
      a leer todo con las cifras corregidas ya impuestas.
    - Con esto, los avisos de conducción de voces en la realización modelo de todo el
      banco bajan de 11 a 4 (dos octavas o quintas por movimiento directo en fragmentos
      de tres y cinco notas, y dos séptimas de A3-5 que el arpegio del mismo acorde deja
      en otra voz).

45. **Visor y editor de los fragmentos del banco** (22/9/2026). «Cargar», en la tabla del
    paso 6, ya no solo traía la música: ahora trae **el análisis que hay guardado** —la
    tonalidad, las modulaciones y las cifras admisibles de cada nota, con la modelo
    delante—, de modo que el paso 4 sirve de visor de lo que el alumno va a recibir. Y lo
    que se corrija allí **se guarda de vuelta en el fragmento** con «Guardar los cambios en
    el banco»:
    - se escriben la tonalidad (que queda marcada como segura, la ha fijado el profesor),
      las modulaciones y las respuestas de esa voz;
    - si han cambiado la tonalidad o las modulaciones, **la otra voz se vuelve a analizar
      sola** en la tonalidad nueva, que sus respuestas estaban hechas en la de antes;
    - las **etiquetas** (cifras, grados, si modula, nivel) y los avisos se recalculan con
      `Banco.etiquetar`, que se ha separado de `Banco.entrada` justamente para esto;
    - no se guarda si alguna nota se ha quedado sin ninguna cifra marcada.
    El fragmento que se está revisando se recuerda en el borrador (por identificador y
    voz), así que recargar la página no pierde el enlace. Y el banco sigue viviendo en el
    navegador: al terminar hay que **descargar `banco.json` y subirlo a GitHub**.

46. **La dominante de la dominante (V/V)** (22/9/2026). Entra en A3-8, que es donde están
    los fragmentos con el giro `do do♯ re` —los grados IV, ♯IV, V—.
    - **Cómo se escribe.** Se escribe **V/V** (corregido el 22/9/2026: véase la decisión
      48; por dentro el acorde sigue siendo el II con cifra marcada). La cifra es la misma familia marcada del V7,
      porque la sonoridad es la misma —séptima de dominante— y solo cambia sobre qué grado
      se construye: `7/+` en estado fundamental, **`6/5̸` sobre el ♯IV** (que es donde cae
      casi siempre), `+6` sobre el 6.º grado y `+4` sobre la tónica. El `+` y la 5.ª
      tachada ya dicen «esto es una dominante»; la alteración la lleva el propio bajo
      escrito, así que la cifra no necesita ningún signo más.
    - **Cómo se construye.** `Teoria.bajoDe` levanta ahora el acorde de séptima de
      dominante ENTERO sobre su fundamental (3.ª mayor, 5.ª justa y 7.ª menor) y deduce el
      bajo del miembro que la cifra pone debajo, en vez de sacarlo de la escala. Así el
      6/5̸ del V/V cae sobre el 4.º grado **elevado** y no sobre el diatónico. Las cuatro
      cifras de dominante se admiten ya sobre el II (antes solo el `+6`).
    - **Cuándo lo propone el motor.** Regla nueva **R0**, la primera que se prueba después
      de la nota final: *4.º grado elevado → V/V en primera inversión (6/5̸)*, con su
      explicación en lenguaje llano. Las demás inversiones quedan para la melodía dada y
      para cuando el profesor las marque a mano.
    - **Función tonal: DD.** Corregido el 22/9/2026 (decisión 48): el V/V **no** es
      subdominante, porque es un acorde de dominante. Su función es **DD**, y el giro sale
      **S – DD – D – T** (`IV · V/V 6/5̸ · V · I`).
    - **Repertorio.** `II|65d`, `II|7+`, `II|+6` y `II|+4` están en el catálogo del paso 3,
      sin marcar por defecto, y forman parte del repertorio de A3-8.

47. **Ida y vuelta = tonicización, no modulación** (22/9/2026). Un rótulo que abre una
    tonalidad y otro que devuelve a la de partida una o dos notas después no son una
    modulación: el importador no anota ahí ningún cambio de tonalidad y el pasaje se sigue
    leyendo en la tonalidad de partida, con ese acorde como dominante secundaria. Los
    rótulos de la partitura no sobran —siguen marcando dónde está el acorde alterado—, así
    que no hay que tocar los archivos de MuseScore. Con esto, tres fragmentos de A3-8 que
    modulaban y volvían en un solo acorde pasan a leerse enteros en su tonalidad:
    `I · IV · II6/5̸ · V · I` en vez de `I · IV · V6/5̸ (de Re M) · V (de Sol M) · I`.
    El 4.º grado elevado cuenta además como nota propia de la tonalidad en la comprobación
    de coherencia entre armadura, tonalidad y música.

48. **Funciones diatónicas y funciones cromáticas: el V/V se escribe V/V y su función es
    DD** (22/9/2026, corrección de Diego). Es la decisión que ordena los dos cuadros —el
    verde (sintaxis diatónica) y el azul (sintaxis cromática)—, y reemplaza lo que decía la
    decisión 46.
    - **El razonamiento.** T, S y D son las funciones tonales **diatónicas**: en ellas no
      hay alteraciones, salvo la del intercambio modal por el que en el modo menor se
      emplea la dominante mayor del homónimo (para reforzar el efecto conclusivo). Un
      acorde alterado no puede llevar una de esas tres letras sin inducir a confusión: `II
      6/5̸` **no** es una subdominante, porque es un acorde de dominante. De ahí que las
      funciones **secundarias** lleven signo propio.
    - **Cómo se escribe el grado.** **`V/V`**: la barra dice «dominante secundaria de», lo
      mismo que `/IV` en `IV/IV` diría «subdominante secundaria de». Es la forma más fácil
      de teclear. La alternativa de Diether de la Motte —dos **DD** superpuestas— queda
      anotada por si algún día se dibuja el cifrado funcional.
    - **Cómo se llama la función.** **`DD`**, «dominante de la dominante», la doble
      dominante. Aparece en la fila «Función», en la paleta del alumno (tecla 8) y en el
      desplegable del configurador, y **solo** cuando el ejercicio la usa: los ejercicios
      sin dominantes secundarias siguen viendo T, S y D a secas.
    - **Sintaxis.** El V/V resuelve en la dominante —es su tónica momentánea—: `DD → D` es
      el único enlace admitido, y no se vuelve de D a DD. El VI que precede a un V/V hace
      de subdominante, igual que cuando precede a un V. Así el giro completo es
      **T – S – DD – D – T**.
    - **Por dentro no cambia nada.** El acorde sigue siendo la séptima de dominante
      levantada sobre el 2.º grado (`II|65d`, `II|7+`, `II|+6`, `II|+4`). `Teoria.gradoEscrito`
      traduce al escribir y `Teoria.gradoInterno` al leer; `Teoria.romanoEscrito` hace lo
      propio con el grado deducido del bajo. Lo que se guarda en el banco, en el corpus y
      en las direcciones no cambia: solo cambia lo que se ve y lo que se corrige.

49. **El plan del cuadro azul** (22/9/2026). Lo que queda de sintaxis cromática, para
    cuando toque:
    - **Dominantes secundarias**: hechas (decisión 48), de momento solo el V/V.
    - **Préstamos modales del homónimo menor en el mayor**: grado diatónico más
      **apóstrofo** (`II'`). Es una convención propia de la asignatura; véase el informe
      `PRESTAMOS-MODALES-NOTACION.md` con lo que se usa en los conservatorios.
    - **Modulación diatónica**: como hasta ahora, superponiendo las dos lecturas del
      acorde pivote —tono antiguo y tono nuevo— unidas por una doble línea vertical. Ya
      está implementado (casilla partida en la fila de grados).

50. **Soprano y tenor, dentro de la octava** (22/9/2026, Diego). En la realización a cuatro
    voces, la distancia entre la soprano y el tenor no puede pasar de la **8ª**, para que las
    tres voces superiores se toquen de una vez con la mano derecha en el piano. Es la regla
    clásica de disposición (las tres voces agudas dentro de la octava; solo el salto del bajo
    al tenor queda libre), y aquí tiene además esa razón práctica.
    - `Realizacion.ABERTURA_MAX` pasa de 14 semitonos (novena) a **12**. Antes era un tope
      blando heredado; ahora es la regla.
    - **Red de seguridad.** Si con la octava no queda ninguna disposición posible —puede
      pasar con una melodía dada muy aguda sobre un bajo muy grave—, se admite hasta la
      novena, pero la disposición queda marcada `abierta` y paga 30 de coste, así que solo
      sale cuando no hay otra. Nunca se queda un acorde sin realizar.
    - La disposición **forzada** (melodía obligada que ningún acorde correcto admite arriba)
      sube también el tenor hasta entrar en la octava, siempre que quede por encima del bajo.
    - **Efecto medido.** En el corpus, 4 acordes de 819 pasaban de la octava; en el banco, 1
      de 3297; en una batería de 1100 combinaciones extremas de cifra, bajo y soprano, 98.
      Ahora: **0** en los tres casos, con la abertura máxima en 12 semitonos exactos. Las
      paralelas, las séptimas, las sensibles dobladas y los avisos de realización no cambian
      (32 antes y 32 después en el banco entero, los mismos). La realización **rígida** (las
      tres posiciones de Furno) ya cumplía la regla: 0 casos antes y después.

51. **La realización se ve mientras se cifra, también en la armonización de bajo**
    (22/9/2026, Diego). Hasta ahora, en la Armonización de bajo el alumno veía la
    realización de su cifrado **al terminar**. Ahora se escribe en el pentagrama a la vez
    que señala el grado y la cifra, nota a nota, como ya ocurría en la Armonización de
    soprano. Lo que se dibuja es **su** cifrado, no el modelo, así que no descubre nada:
    es ver escrito lo que uno acaba de decidir. Los avisos de conducción de voces
    (octavas, quintas, sensibles y séptimas sin resolver) salen desde el primer momento, en
    rojo y con su explicación al pulsarlos. La **Audición** sigue esperando al final: allí
    dibujar el acorde enseñaría el bajo que hay que reconocer de oído
    (`Ejercicios.realizacion` → `'alCerrar'` solo en `audicion`).

52. **Grados de la escala sobre el bajo, al modo de Gjerdingen** (22/9/2026, Diego). Encima
    de cada nota del bajo, dentro de un **circulito negro sin relleno**, la cifra arábiga
    del grado que esa nota ocupa en la escala del tono. Sirve para que la relación entre el
    bajo dado y la **regla de la octava** se vea de un golpe, sobre todo al principio del
    curso.
    - **Alteraciones.** Si el grado va alterado, la alteración se escribe dentro con la
      cifra (**♯4**) y el óvalo se ensancha. Es justo lo que hace falta en las dominantes
      secundarias —el ♯4 del V/V— y en la monte cromática.
    - **Modulación.** El grado se mide en la tonalidad que rige en esa nota, así que cada
      tramo cuenta desde su propia tónica; en el pivote se usa ya la nueva, que es la
      lectura que se le pide al alumno.
    - **Dónde y cuándo.** Van puestos por defecto. El profesor puede quitarlos en el paso 3
      del configurador (*Grados de la escala sobre el bajo*, que escribe `gradosBajo: false`
      en el ejercicio) y el alumno puede ocultarlos con el interruptor **Grados del bajo**.
      En la Audición no aparecen, porque allí el bajo no se ve.
    - En la armonización de soprano el circulito va sobre el **bajo deducido**, que es el
      que se dibuja en el pentagrama de fa.
    - **Dónde se colocan** (corregido el 23/9/2026, Diego). Los circulitos van en una FILA,
      a una altura que sale de la música: por encima de la nota más aguda del bajo y, si su
      plica va hacia arriba, de la punta de la plica. A una altura fija se le montaban
      encima a los bajos agudos —un re4 sale tres posiciones por encima del pentagrama—.
      El hueco entre los dos pentagramas crece solo lo que haga falta, de modo que en un
      bajo normal la partitura queda igual de compacta que antes. Comprobado sobre los 1662
      circulitos del banco (las dos voces, con la realización a la vista): **0 solapes**,
      con un hueco mínimo de 0,85 espacios.

53. **La tonalidad que de verdad cuadra** (22/9/2026, a raíz de una corrección de Diego).
    Una armadura sirve para dos tonalidades, y el importador elegía entre ellas por cómo
    empieza y cómo acaba el fragmento, porque acabar en la tónica es el indicio más fuerte.
    Eso falla en las **semicadencias**: un fragmento en la menor que acaba en mi se leía
    como mi menor. La prueba definitiva la da el repertorio de la lección: **si con la
    tonalidad deducida hay notas del bajo que no admiten ningún acorde, esa tonalidad es la
    equivocada**.
    - `Banco.entrada` prueba primero la tonalidad que trae el fragmento; si el bajo sale
      incompleto, recorre las candidatas de `Teoria.tonalidadesCandidatas` —la relativa, la
      última nota como tónica y **la última nota como 5.º grado (la semicadencia)**, siempre
      que admitan todas las notas— y se queda con la primera en la que **todas** las notas
      del bajo tienen cifra.
    - Solo se aplica cuando hay bajo y el fragmento no modula: en el bajo dado cada nota ha
      de llevar acorde, de modo que quedarse sin cifra es prueba de verdad; en una melodía
      de soprano no lo es.
    - **Cuándo se avisa.** Si la tonalidad corregida lleva las mismas alteraciones, solo se
      había equivocado el modo y no hay nada que arreglar en la partitura: se corrige en
      silencio. Si lleva otras, la armadura está mal escrita y la entrada queda marcada con
      (?) y con un aviso que nombra las dos tonalidades.
    - `Teoria.cabeEnTonalidad` (antes `cabeEn`, privada de `musicxml.js`) pasa a `teoria.js`,
      que es de donde la usan los dos.

54. **En Análisis y Audición, la respuesta ha de ser el acorde que se muestra**
    (22/9/2026, Diego). Los dos tipos de ejercicio en que el alumno **no elige** la
    armonización —la tiene delante, escrita a cuatro voces o sonando— pedían hasta ahora
    «una cifra admisible sobre ese bajo», y eso es demasiado: en un `si – fa♯ – si` de si
    menor se daba por bueno `I · V7 · I` aunque la realización enseñe la tríada de
    dominante, sin séptima, porque sobre ese fa♯ el V7 también cabe.
    - **La regla.** En `cifrar` y `audicion`, `Ejercicios.admisibles` deja solo las cifras
      que producen **las mismas notas** que la modelo, que es la que se dibuja y la que
      suena. Quedan dos cuando dos cifras distintas dan el mismo acorde; si no, queda una.
    - En las dos **armonizaciones** no cambia nada: ahí el alumno decide, y toda
      armonización correcta del bajo (o de la melodía) sigue valiendo. Es la diferencia
      entre reconocer y componer.
    - **Efecto medido.** En el banco, 223 alternativas retiradas sobre 555 notas de bajo.
      Ninguna nota se queda sin respuesta posible: la modelo siempre sobrevive.
    - El cifrado ya escribía la alteración que hace falta: sobre el 5.º grado del modo
      menor, el `5/3` se dibuja como un **♯** solo (`Teoria.filasCifra`), que es lo que
      Diego llama «V♯».

55. **La ficha tiene sus propias opciones** (22/9/2026, Diego). Una ficha se prepara para un
    grupo y un momento del curso, así que tres opciones se eligen **en el paso 6**, junto al
    filtro, y no se heredan del paso 3: la **ayuda con los grados**, la **respuesta modelo
    sobre el 6.º grado descendente** (II4/3 o +6) y la **fila de funciones tonales**. Viajan
    dentro del `#f=` de la ficha, de modo que los enlaces repartidos las conservan.
    Las demás opciones del paso 3 —pedir el grado, permitir corregir los errores, los grados
    del bajo y, en la Audición, qué se ve— se siguen aplicando tal como estén arriba, y la
    ayuda del panel lo dice. De paso, `Banco.ejercicio` pasa a leer `filtro.preferir` y
    `filtro.gradosBajo`, que antes se guardaban en el filtro y no llegaban al ejercicio.

56. **Las tonalidades, opción aparte de las funciones** (23/9/2026, Diego). La fila
    «Tonalidad» estaba atada a la modulación: aparecía solo si el fragmento modulaba, y su
    única opción (`aviso`) decía cuánto se le contaba al alumno. Ahora es una opción como la
    de las funciones tonales, de modo que se pueden combinar las dos como se quiera: ver las
    funciones y no las tonalidades, verlas todas, pedir unas y dar las otras.
    - **`ej.tonalidades`**, con los mismos valores que `ej.funciones` más uno:
      - **`dadas`** — la fila se muestra rellena: la tonalidad inicial y, en cada pivote, la
        nueva. Es lo que hacía `aviso: 'completo'`.
      - **`pedir`** — la rellena el alumno: marca desde qué nota rige la tonalidad nueva y
        cuál es. Es lo que hacía `aviso: 'existe'`, pero ahora **también en los fragmentos
        que no modulan**: decidir que el fragmento NO cambia de tono pasa a ser parte del
        ejercicio, y marcar algo donde no lo hay se corrige («este fragmento no cambia de
        tono»).
      - **`no`** — no hay fila. Si el fragmento modula, se cifra igualmente en sus
        tonalidades verdaderas, pero no se le dicen: es la **modulación sin anunciar** que
        estaba anotada como mejora pendiente. El pivote lleva entonces una sola casilla de
        grado y se admite leerlo en cualquiera de las dos tonalidades, porque el alumno no
        sabe que hay un cambio; la modulación se descubre al ver la solución.
      - **ausente** — como siempre: dada si el fragmento modula, nada si no modula. Los
        enlaces antiguos, que llevan `aviso`, siguen valiendo tal cual.
    - **Los circulitos de grado** (decisión 52) cuentan desde la tonalidad que el alumno
      tiene por buena —la dada, la que él ha marcado o, sin fila, la inicial—, no desde las
      verdaderas. Si contaran desde estas, la numeración se reiniciaría en el pivote y
      descubriría la modulación que se le está preguntando. Al ver la solución pasan a las
      verdaderas. `app.js` pasa esa lectura a la partitura en `estado.tonalidadesNota`; el
      configurador no la manda, porque al profesor se le enseña todo.
    - Está en el **paso 3** (module o no el fragmento; el campo ya no se esconde) y también
      en las **opciones de la ficha**, junto a las otras tres de la decisión 55.

57. **El enunciado, más corto** (23/9/2026, Diego). El enunciado de la página del alumno
    había ido creciendo hasta volverse ilegible: explicaba los tres botones de sonido, la
    tonalidad, la fila de funciones, la de tonalidades y lo que hace la realización, todo
    en un párrafo apretado. Ahora dice **solo lo que el alumno no puede adivinar mirando**,
    en dos líneas:
    - **La tarea**, en una frase: qué tipo de ejercicio es y qué hay que señalar en cada
      nota —la función tonal si se pide, el grado de la fundamental y el cifrado (la
      inversión)—. Si las tonalidades están por pedir, esa marca también es tarea suya y va
      en esta línea.
    - **Lo que hace la aplicación**, en letra algo más suave: que la realización a cuatro
      voces se escribe a medida que cifra y que las notas en rojo son errores de conducción
      de voces que se explican al pulsarlas. Aquí van también las ayudas que la aplicación
      le DA y que no son tarea: la fila «Función» rellena y la modulación anunciada.
    - **Lo que se quita**: los botones de sonido (están a la vista y se entienden
      pulsándolos) y la repetición de la tonalidad.
    - **La tonalidad pasa al recuadro de abajo**, junto a la lección. No podía perderse: es
      lo único que distingue Fa M de re m con la misma armadura, y hasta ahora solo estaba
      escrita en el enunciado. Se muestra siempre, incluso con la modulación sin anunciar
      (es la de partida, que no descubre nada).

58. **Una portada por tipo de ejercicio, para la etiqueta del enlace** (23/9/2026, Diego).
    Al pegar un enlace en una tarea de Classroom, la etiqueta salía siempre igual
    —«Armonizar el bajo · Regla de la octava»— aunque el ejercicio fuera de Análisis.
    - **Por qué.** Classroom pide la página al servidor y pone como etiqueta el `<title>`
      que encuentra. El ejercicio va en la parte del enlace posterior a la almohadilla
      (`#e=…`, `#f=…`), y **esa parte no viaja al servidor**: el servidor solo ve
      `…/index.html`, y devuelve siempre el mismo título. Tampoco sirve una cadena de
      consulta (`?tipo=…`): GitHub Pages devuelve el mismo archivo. La única salida es una
      **dirección distinta por tipo**.
    - **Cómo.** Cuatro portadas diminutas —`analisis.html`, `armonizacion-bajo.html`,
      `audicion.html`, `armonizacion-soprano.html`— que no duplican la aplicación: solo
      llevan el `<title>` (y las etiquetas `og:` para los demás sitios donde se pegue un
      enlace) y una línea que pasa a `index.html` conservando el ejercicio. Como
      `location.replace` no deja rastro en el historial, el botón «atrás» del alumno sigue
      funcionando igual.
    - **Las etiquetas**: *Práctica armónica · Análisis armónico*, *· Armonización de melodía
      de bajo*, *· Reconocimiento auditivo*, *· Armonización de melodía de soprano*. Viven
      en `Banco.MODOS`, junto al nombre y la página de cada tipo, y el configurador elige la
      portada al generar la dirección, tanto de un ejercicio suelto como de una ficha.
    - El título de la pestaña del alumno también lo dice, porque `app.js` pone
      `document.title` al cargar el ejercicio. `index.html` pasa a llamarse **Práctica
      armónica** a secas, y el configurador, *Práctica armónica · Configurador*.
    - Los enlaces repartidos antes de este cambio siguen valiendo: apuntan a `index.html`,
      que funciona igual; lo único que no cambia es su etiqueta.

59. **El pie del alumno, solo instrucciones de uso** (23/9/2026, Diego). El pie llevaba la
    versión, «Regla de la octava (Furno)», una nota sobre abrirlo desde el disco, el enlace
    al configurador del profesor y el crédito de las muestras de sonido; nada de eso le
    sirve a un alumno, y el **enlace al configurador** no debería estar a su alcance.
    Ahora queda la línea de teclas y poco más:
    - **Teclas**, retocada: «↑ ↓ entre las casillas de una misma nota», que ya no son solo
      el cifrado y el grado (también la función y la tonalidad).
    - **Créditos y versión** en una línea diminuta y tenue debajo: el crédito de FluidR3_GM
      se queda porque su licencia **CC BY obliga a atribuir**, y enlaza al archivo de
      licencia; la marca de versión va pegada a él, que sirve para comprobar de un vistazo
      qué versión está publicada.
    - El configurador conserva su pie tal cual: allí sí hace falta.

60. **Recogida de resultados: qué se mide y qué cuenta para la nota** (23/9/2026, Diego).
    La aplicación mide sola la práctica del alumno y, al terminar, le enseña su informe
    y le permite llevárselo. Lo decidido:
    - **La nota es el porcentaje de aciertos AL PRIMER INTENTO**, convertido a diez
      (67 % → 6,7). Es la medida limpia: dice lo que el alumno sabía *antes* de ver dónde
      fallaba. El porcentaje **tras corregir** se guarda aparte, no como nota, sino como
      prueba de que revisó y arregló sus errores.
    - **El detalle se registra solo del primer intento**, por la misma razón.
    - **Una práctica = una entrega.** No hay promedios automáticos: si un alumno repite,
      llega una entrega nueva, con su propia nota, junto a la anterior. Promediar, quedarse
      con la mejor o con la última es una decisión del profesor, que se toma con una fórmula
      en la hoja de calificaciones, no dentro de la aplicación. La recomendación es
      **quedarse con la mejor de las notas de primer intento**, porque cada ficha del banco
      saca fragmentos distintos al azar: repetir es practicar de verdad, no memorizar. Para
      un ejercicio fijo (`#e=`) sí conviene quedarse con el primero, porque el segundo
      intento ya sabe la respuesta.
    - **Los contenidos no se clasifican a mano.** La etiqueta de cada nota es el acorde
      modelo tal como se escribe —`V/V 6/5̸`, `I 6/4`—, más el grado de la escala del bajo
      (`♯4`) y el papel de esa nota (`pivote`, `inicio`, `final`). Los contenidos de las
      lecciones **son** los acordes, así que una tabla dinámica responde sola a «¿en qué
      falla?»: cuántas veces salió el V/V y cuántas se falló. Contar fallos sin contar
      apariciones no diría nada.
    - **El reloj mide tiempo de trabajo**: se para cuando la pestaña queda en segundo
      plano, para no contar el rato que el móvil estuvo en el bolsillo.
    - **Nada sale del navegador por su cuenta.** El módulo solo mide y arma el informe;
      enviarlo es un acto del alumno, al terminar. Mientras tanto queda una copia en el
      propio navegador (`localStorage`), para que cerrar la pestaña no pierda la práctica.
    - **La identidad no la maneja la aplicación.** En Classroom la pone Classroom; en el
      formulario la pone Google, con el correo del centro verificado. El campo de nombre
      del informe es solo un rótulo legible.

61. **El envío: un formulario relleno, abierto por el alumno** (23/9/2026). La aplicación
    es un sitio estático y no puede —ni debe— mandar nada a escondidas. Lo que hace es
    **preparar la dirección de un formulario de Google con todos los campos puestos** y
    abrirla en otra pestaña: el alumno ve sus datos, comprueba su nombre y pulsa Enviar.
    - **Quince preguntas de texto corto**, una por dato. De texto corto a propósito: las de
      opción múltiple no se dejan rellenar de antemano de forma fiable.
    - **La plantilla.** El script pide a Apps Script la dirección «rellenada de antemano»
      de una respuesta falsa con marcas `ZZCLAVEZZ`; eso revela el `entry.NNN` de cada
      pregunta. La plantilla vive en **`envio.json`**, junto a `banco.json`, y `envio.js`
      sustituye cada marca por su valor. **Si el archivo no está, no pasa nada**: el botón
      de enviar no aparece y quedan los de copiar y descargar.
    - **Un botón principal, no dos.** Con formulario configurado, «Enviar al profesor» es
      el principal y «Copiar el informe» pasa a secundario; sin él, al revés.
    - **El script es idempotente.** `CrearFormularioPractica.gs` se puede ejecutar las
      veces que haga falta: reutiliza el formulario de la carpeta, añade solo las
      preguntas que falten y conserva la hoja de respuestas. Una ejecución a medias no
      deja nada roto ni duplicado.

62. **La carpeta del proyecto, repartida en tres** (23/9/2026, Diego). Todo estaba
    junto en la raíz: lo que se publica, los papeles de trabajo, las partituras fuente
    y —desde hoy— lo que llega de los estudiantes. El criterio del reparto **no es el
    tipo de archivo, sino qué se hace con él**:
    - `1 WEB (subir a GitHub)` — lo que se publica. Que la carpeta contenga
      *exactamente* lo publicable convierte la subida en «abre, Cmd+A y arrastra»: ya no
      hay que acordarse de qué no subir, que era justo donde se colaban los errores.
    - `2 RESULTADOS (lo que recibo)` — el formulario y la hoja de respuestas, dentro del
      proyecto y no sueltos en la raíz de Drive. Lo que llega de los estudiantes, aparte.
    - `3 PROYECTO (documentación y fuentes)` — la especificación, la bitácora, las guías,
      las revisiones y `ejemplos/` con los `.mscz`. Lo que permanece y no se publica.

    Esto encaja con el criterio general de Diego para `Recursos de Claude`: ahí va lo
    hecho con Claude, separado de sus propios materiales, de lo que ofrece a los
    estudiantes y de las carpetas con las realizaciones de estos.

63. **Lo que llega a la hoja: denominadores y un nombre de ficha** (23/9/2026, al mirar
    la primera fila de verdad). Dos defectos que solo se ven con datos reales:
    - **La práctica se llamaba «Ficha».** Si no se le pone título en el configurador,
      todas las filas de la hoja se llaman igual y no se distingue una práctica de otra.
      Ahora, sin título, el nombre se construye con lo que la distingue: lección, tipo de
      ejercicio y cuántos —«A3-2 · Armonización de bajo · 3 ejercicios»—. El título a mano
      sigue mandando.
    - **Los contenidos iban sin denominador.** Se enviaban solo los ocho acordes más
      fallados. Un fallo sin su número de apariciones no se puede sumar entre alumnos:
      «el V/V se falló 12 veces» no dice nada si no se sabe si salió 15 veces o 200. Ahora
      va **todo** lo que salió, en `acorde=fallos/veces` separado por ` | `, que ocupa unos
      cientos de caracteres y se parte con una fórmula. Lo que ve el alumno no cambia: sus
      cuatro acordes peores.
    - **Lo que sigue sin llegar** es el detalle nota a nota (grado del bajo, papel de la
      nota): existe en el CSV que se descarga el alumno, pero no en el formulario. Haría
      falta otro campo; se decide cuando haya datos suficientes para saber si hace falta.

64. **Enviar exige terminar, y por eso se puede reanudar** (23/9/2026, Diego). El botón
    «Enviar al profesor» solo aparece con la práctica completa: así **todas las filas que
    le llegan al profesor miden lo mismo** y se pueden comparar sin filtrar. Dos
    consecuencias que van con ello, y sin las cuales la condición sería injusta:
    - **Se avisa desde el principio.** La línea de progreso dice «Ejercicio 3 de 8 ·
      podrás enviar el resultado al terminar los 8». Descubrirlo al final, cuando ya no
      queda tiempo de clase, sería una encerrona.
    - **Se reanuda.** Si se cierra la pestaña, al volver a abrir el mismo enlace se sigue
      donde se dejó: se guardan **qué fragmentos le tocaron** —no basta el filtro, porque
      los saca al azar— y por cuál iba. Se retoma al principio del ejercicio que quedó a
      medias y su detalle se descarta, para no contarlo dos veces. El reloj se consolida
      al guardar: mientras corre, el tiempo vivido está en una marca de hora de esa
      sesión, que en otra no vale nada.
    - **Se quitan los otros botones.** Con formulario disponible y práctica completa, solo
      se ve «Enviar al profesor»: toda la información llega por ahí. Copiar el informe y
      descargar el detalle quedan como red para cuando no hay formulario o la práctica
      está a medias; en uso normal no se ven.
    - Lo que ya era así y conviene no olvidar: el informe de una ficha **solo aparece al
      terminarla**, nunca a mitad, porque se arma en el resumen final.

65. **Contenidos del curso por nota** (23/9/2026, etapa 8b·4, fase A). Cada nota se
    etiqueta además con un **contenido del curso**, deducido solo de lo que se sabe con
    certeza del acorde modelo y del papel de la nota: `Modulación` (la nota es pivote),
    `Dominante secundaria` (el grado lleva `/`), `Cadencial 6/4`, `Cadencia` (última nota),
    `Séptima disminuida`, `Séptima de dominante`, `Inversión de tríada` y `Tríada en estado
    fundamental`. Viaja al formulario en un campo propio, `contenido=fallos/veces`.
    - **Las secuencias y las prolongaciones no están, a propósito.** Son patrones sobre
      varios acordes, no propiedades de uno: ninguna heurística las acierta. Cuando entren,
      habrá que **declararlas en el banco**, fragmento a fragmento, desde el configurador.
    - **La lista es corta a propósito.** Una rejilla de cuarenta contenidos ni se lee de un
      vistazo ni le llegan observaciones suficientes a ninguna casilla.
    - **La ortografía armónica no se mide aquí.** El alumno no escribe las cuatro voces
      —las escribe la aplicación—, así que los seis defectos que `Realizacion.auditar`
      detecta con los códigos de la pauta (XN1/XNc, XN2, XN3, XS4c, Y4a) son de la
      realización automática, no trabajo suyo. Solo en armonización de soprano son
      atribuibles a su elección de acorde. Medir la pauta de verdad exige un tipo de
      ejercicio que no existe: escribir las voces.
    - **El semáforo por alumno solo se colorea desde 5 observaciones** (`MontarCuadernoPractica.gs`,
      `MIN_N`). Por debajo, la casilla queda gris con el número a la vista: un rojo sobre
      tres observaciones no distingue una laguna de una tarde mala, y un semáforo que miente
      es peor que no tenerlo. La fila de clase, que suma a todos, sí tiene datos desde la
      primera semana, y es la que responde a «¿en qué gasto la clase del martes?».

66. **El configurador, en dos zonas** (23/9/2026, Diego). Diego propuso quitar los pasos
    1, 2 y 3 por obsoletos. **No lo estaban**, y comprobarlo antes de tocar nada evitó
    romper el banco:
    - El **paso 1** es la zona donde se sueltan los `.mscz`: `anadirAlBanco()` lee
      `estado.fragmentos`, que solo existe si se ha importado ahí. Y es donde aterriza un
      fragmento al pulsar «Cargar».
    - El **paso 2** decide bajo o soprano, y eso cambia el análisis entero al importar.
    - El **paso 3** guarda el repertorio **con cada fragmento** (`leccionRepertorio`), que
      es la paleta que ve el alumno. Quitarlo dejaría sin paleta a todo lo nuevo.

    Lo que sí estaba mal era **el orden y un reparto a medias**: el configurador hace dos
    trabajos —mantener el banco (ocasional) y preparar una ficha (semanal)— y los
    presentaba como una escalera numerada que describía el ocasional. Y cuatro opciones del
    alumno (`pedir el grado`, `reintentos`, `grados del bajo`, `bajo en audición`) vivían
    en el paso 3 y se aplicaban a la ficha sin que se viera. Ahora:
    - **A · Preparar una ficha**, arriba: el filtro, **todas** las opciones del alumno, la
      cuenta y el enlace. `opciones()` lee de aquí, así que el juego de opciones es uno
      solo; los cuatro desplegables duplicados del paso 3 se han borrado.
    - **B · El banco**: la tabla, y plegados **«Añadir fragmentos de un archivo»**
      (importación, tipo de voz, repertorio, lección) y **«El fragmento en curso»**
      (el bajo, el análisis, la revisión, guardar en el banco y el enlace suelto). El
      segundo se abre solo al pulsar «Cargar» o al importar.
    - **C · Recogida de resultados**, igual que estaba.
    - El **filtro de la ficha entra en el borrador**: ya no se pierde al recargar.
    - **Las dos mitades de la zona A van sombreadas** —«Qué fragmentos entran» y «Cómo se
      le presenta al alumno»—, con un fondo tenue y un borde apenas visible: separan a la
      vista sin ocupar más sitio.
    - **«Cargar» aterriza en la partitura**, no en el título del plegable: se abre el
      plegable, se pinta la revisión y la vista se centra en `#vista-previa`. Lo que se va
      a hacer al pulsar «Cargar» es mirar el fragmento.
    - Los identificadores no han cambiado: la reorganización es de la plantilla, no de la
      lógica. Comprobado con una prueba que verifica los 70 identificadores, el orden de
      las zonas, que el banco se lee, que la ficha se genera, que «Cargar» abre el plegable
      y pinta la revisión, y que el borrador sobrevive a una recarga.

67. **Recorrido por los fragmentos del filtro** (23/9/2026, Diego). Repasar el banco
    fragmento a fragmento volviendo a la tabla entre uno y otro es inviable con 116
    fragmentos. En «El fragmento en curso», encima de la partitura, hay ahora una barra
    con **◀ Anterior · Fragmento 3 de 8 · A3-8 · Do M · Siguiente ▶**.
    - **Recorre lo mismo que la tabla y en el mismo orden**: los que cumplen el filtro,
      incluidos los que tienen avisos (que se marcan con ⚠ y su motivo). Si no, «siguiente»
      no llevaría a donde el ojo espera. Se guardan los propios objetos del banco, no
      copias, para saber por cuál se va.
    - **Avisa si hay cambios sin guardar.** Se compara lo que hay en pantalla con lo
      guardado —respuestas, tonalidad y modulaciones— y, si difiere, se pregunta antes de
      pasar. Sin eso, un «siguiente» distraído se llevaría por delante una corrección a
      medias sin decir nada.
    - **Alt + ← / Alt + →** hacen lo mismo. Con Alt para no estorbar al escribir, y nunca
      cuando el foco está en un campo de texto o en un desplegable. **El atajo va escrito
      bajo el rótulo del botón**, en pequeño, para que se aprenda solo; y con la tecla de
      cada sistema: **⌥** en el Mac, **Alt** en lo demás. Es la misma tecla para el
      navegador, pero no en el teclado, y poner «Alt» en un Mac sería decirle al usuario
      que busque una tecla que no tiene ese nombre.
    - La barra solo aparece cuando se está revisando un fragmento que está en la lista; si
      se cambia el filtro y deja de cumplirlo, desaparece.

68. **La séptima ha de venir preparada** (23/9/2026, Diego, a la vista de una realización
    incorrecta). Una nota tendencial se prepara, no se duplica y se resuelve. La resolución
    ya pesaba en la conducción automática y se avisaba de ella (decisión 23); **faltaba la
    preparación**, y por eso el motor escribía un IV6/5 en Do M metiendo el mi de golpe.
    - **Preparada** = la misma nota, en la misma voz, ya sonando en el acorde anterior. Se
      mira en las cuatro voces: si la trae el bajo, también vale.
    - **La séptima menor puede entrar sin preparar** en el lenguaje tonal del barroco
      tardío en adelante —el V7 lo hace constantemente—, no en el renacimiento ni en el
      primer barroco. Como el repertorio de la aplicación es el de Furno, se admite; pero,
      como recordó Diego, **lo natural es que también vaya preparada**, así que se le pone
      un coste apreciable (20) para que el motor la prepare siempre que pueda. Medido: con
      coste 6 se preparan 32 de las 81 del banco y con coste 60, 33. La diferencia es
      mínima porque **las otras 48 no se pueden preparar**: la nota sencillamente no está
      en el acorde anterior (el caso de I → V7, donde el fa no está en el I).
    - **La séptima mayor no admite esa excepción**: es la del IV en el modo mayor
      (fa–la–do–**mi**, cifrada 7, 6/5 o 4/3) y siempre va preparada. Coste 110, justo por
      debajo de las paralelas (120), y **aviso al alumno** de tipo `preparacion` con la
      explicación en lenguaje llano, como los demás avisos de conducción: se dibujan las
      notas en rojo y no restan aciertos (decisión 23).
    - **Duplicada no puede estar**: un acorde de séptima ocupa las cuatro voces con sus
      cuatro notas, y cuando se prescinde de la quinta (séptima en estado fundamental,
      novena) lo que se dobla es la fundamental. No hace falta regla nueva.
    - **Medido sobre el banco de verdad (131 fragmentos).** La primera medición se hizo
      sobre una copia vieja de `banco.json` (130 fragmentos, la mitad de tamaño) y concluyó
      que no había ninguna séptima mayor: era falso, y lo corrigió Diego. En el banco bueno
      hay **una séptima mayor como respuesta modelo** —`A3-7-09`, nota 2: `6/5` sobre la en
      Do M, que es IV6/5— y otra más entre las cifras admisibles (`7` sobre el 4.º grado en
      mayor, IV7 en estado fundamental). En la voz de soprano no hay ninguna. Con la regla,
      A3-7-09 se realiza **con el mi preparado desde el I anterior**, que era justamente el
      fallo que Diego encontró.
    - **Nada se ha estropeado**: el corpus sigue en 11 discrepancias de 273 notas y 0
      paralelas en las tres posiciones automáticas; el banco, en 0 incoherencias; la
      abertura soprano-tenor, dentro de la octava en los 3297 acordes; 0 solapes de los
      circulitos de grado en 1684.
    - **Lección aprendida sobre el método**: antes de medir nada contra el banco, **traer
      `banco.json` de la carpeta de Diego**. Él lo actualiza por su cuenta y la copia de
      trabajo se queda atrás sin avisar.

69. **El identificador del fragmento, a la vista** (25/9/2026, Diego). Cada fragmento del
    banco tiene ya un identificador único —`A3-7-09`— y son 131 distintos, sin repetidos ni
    huecos; lo que faltaba es que **se viera**: al revisar uno aparecía en el cartel, pero la
    tabla del banco no lo mostraba y no había manera de localizar el que se mencionaba en una
    conversación. Ahora es la **primera columna** de la tabla, en monoespaciado y sin partir
    (se busca con Cmd+F), y sale también en la barra de recorrido: «Fragmento 1 de 13 ·
    `A3-7-01` · Do M».

70. **Dos listas por lección, y no dicen lo mismo** (25/9/2026, hallazgo al revisar A3-7).
    Cada lección guarda **dos** listas distintas, y conviene no confundirlas:
    - `leccionRepertorio` — las **cifras**. Es la paleta de Análisis, Armonización de bajo y
      Audición. La de A3-7 es `53 6 64 65 43 42 7 7+ +6 65d +4`: incluye la séptima en
      estado fundamental y en sus inversiones, como debe.
    - `leccionAcordes` — los **acordes** (`romano|cifra`). Solo se usa en la **armonización
      de soprano**, donde el alumno elige acorde, no cifra.

    En A3-7 la segunda tiene `II|7 II|65 II|43 II|42` pero de IV solo `IV|53 IV|6`: **faltan
    `IV|7` y `IV|65`**, y los 13 fragmentos de A3-7 tienen melodía de soprano escrita. En
    A3-3 falta `IV|53` (esa lección no tiene ningún IV en la lista y 20 de sus 24 fragmentos
    tienen soprano). No afecta a los ejercicios de bajo —ahí la paleta son las cifras y está
    completa—, solo a la armonización de soprano de esas dos lecciones.

71. **Ninguna voz canta una segunda aumentada** (25/9/2026, Diego, a la vista de `A3-4-07`).
    En si menor, la realización llevaba la soprano de **sol4 a la♯4**: el 6.º grado sin
    alterar seguido de la sensible, que es exactamente la segunda aumentada que la escala
    menor melódica existe para evitar. Es el tropiezo clásico del modo menor y no lo cubría
    ninguna de las reglas anteriores, que miraban intervalos **entre** voces (paralelas,
    directas) o la resolución de las notas tendenciales, pero no el intervalo **melódico** que
    canta una sola voz.
    - **Qué se prohíbe**: dos notas seguidas en la misma voz a distancia de segunda *por
      nombre* (una sola letra de diferencia) y **tres semitonos**, subiendo o bajando —sol →
      la♯ y la♯ → sol por igual—. La comparación con 3 es exacta, para que la novena aumentada
      (13 semitonos), que es un salto y no un paso, no cuente.
    - **Solo en las tres voces superiores.** El bajo lo da el fragmento y no lo escribe ni el
      motor ni el alumno. Comprobado además que **no hay ni una sola segunda aumentada en las
      233 partes escritas del banco** (bajos y melodías de soprano), así que la regla nunca va
      a señalar una línea de Furno: gobierna solo lo que escribe la aplicación o el alumno.
    - **Coste 100** en la conducción automática: por encima de las directas (30) y de la
      séptima menor sin preparar (20), por debajo de las paralelas (120) y de la séptima mayor
      sin preparar (110). Se aplica **también dentro del mismo acorde**: un cambio de
      disposición no salva el intervalo, porque la voz lo canta igual.
    - **Aviso al alumno** de tipo `segunda-aumentada`, con las dos notas en rojo y la
      explicación al pulsar, como los demás avisos de conducción: no resta aciertos
      (decisión 23). El texto nombra la salida doble que dio Diego: *o el 6.º grado sube
      alterado —la escala menor melódica— o esa voz va a otra nota del acorde*.
    - **Medido sobre el banco (131 fragmentos).** Antes de la regla había **una** segunda
      aumentada en todo el banco, la de `A3-4-07`, en los tres modos que usan el bajo
      (Análisis, Armonización de bajo y Audición). Con la regla, **cero**, y **solo cambia la
      realización de ese fragmento**: los otros 115 salen nota por nota igual que antes.
      `A3-4-07` pasa ahora el sol a la contralto, donde baja a fa♯ —el 6.º grado resolviendo
      hacia abajo, que es lo natural—, y sube la soprano a do♯5.
    - **El 6.º grado alterado queda descartado** (Diego, 25/9/2026, al ver la realización
      corregida: «creo que sí, que bajar el sol al fa♯ es mejor»). La otra salida era escribir
      **sol♯** —la menor melódica—, pero eso no es una regla de enlace sino un cambio en las
      **notas del acorde**: el II de si menor pasaría de do♯–mi–sol a do♯–mi–sol♯, habría que
      cifrarlo (`5♯`), decidir en qué contextos procede y si el alumno debe escribir esa
      alteración. **No se hace.** La regla que faltaba era la prohibición del intervalo, y con
      ella el motor elige solo la salida buena: el 6.º grado se queda donde suena mejor y
      resuelve hacia abajo. Si algún día entra el 6.º alterado, será por otra razón —la regla
      de la octava ascendente en menor—, no por esta.
    - **Nada se ha estropeado**: corpus en 11 discrepancias de 273 notas y 0 paralelas en las
      tres posiciones automáticas; banco en 0 incoherencias; abertura soprano-tenor dentro de
      la octava en los 3297 acordes; 0 solapes de los circulitos en 1684; los avisos de
      realización del banco siguen en `{directa: 4, septima: 2}`.

72. **La regla de la octava son las siete reglas, no solo la séptima** (26/9/2026, Diego).
    Decisión de vocabulario, no de motor. «Regla de la octava» es **qué acorde va sobre cada
    nota de la escala, sabiendo que no es unívoco y que lo desempata el contexto**: eso
    abarca R1 a R7, no solo la tabla por grados conjuntos. La versión de IJzerman se queda en
    los grados conjuntos; **lo que añade Furno son las armonizaciones típicas cuando el bajo
    salta** (do–la–fa–sol), y eso ya estaba implementado —es R5— pero con otro nombre.
    - **Medido**: de las 565 notas de bajo del banco, **537 (95 %) llevan la cifra de R7**, y
      la proporción es la misma salte el bajo (96 %) o toque un grado conjunto (94 %). De las
      28 que se salen de R7, **26 las explica otra regla** (R5 dieciocho, R3 tres, el pivote
      tres, R1 una, R4 una) y las 2 restantes son los dos huecos conocidos de `leccionAcordes`
      en A3-7. No hay nada suelto.
    - **Cuándo un arpegio está dentro de la RO**: cuando la RO da **el mismo acorde en los dos
      grados**. En mayor: 1↔3 (I, I6), 4↔6 (IV, IV6), 5↔7 (V, V6, V7) y 7↔2 (V6, V4/3).
      **No** 2↔4 (II/II6, que la RO no produce), ni 3↔5, ni 6↔1. La cadencia final 5→1 está
      **dentro** (grado 5: 122 de 122 del banco; grado 1: 226 de 229).
    - **El documento `REGLA-DE-LA-OCTAVA-ENTERA.md`** recoge la tabla completa, generada
      recorriendo los 1272 contextos del motor y agrupándolos en 52 respuestas distintas, más
      las fórmulas idiomáticas por la soprano y la tabla de cadencias. No está copiado de
      ningún libro: se regenera del motor, así que los apuntes y el programa no se separan.

73. **`A3-2-02` eran dos fragmentos pegados** (26/9/2026, Diego). Lo destapó la tabla
    anterior: era el único fragmento del banco con una nota de bajo **sin cifra posible**, y
    la nota era un **sol♮** —el 7.º grado sin elevar de la menor, que no está en la tabla de
    la RO—. No era una tonicalización: eran **dos fragmentos en dos tonalidades distintas
    pegados por error** en la partitura de origen (`04.mscz`).
    - El corte cae limpio en el límite de compás. **`A3-2-02`** se queda con los compases 1–4
      en **la menor** (`la sol♯ la do mi la`, 6 notas, acaba en la tónica) y sus seis cifras
      son idénticas a las seis primeras de antes. El nuevo **`A3-2-13`** toma los compases 5–7
      en **Do mayor** (`mi do si sol do`, 5 notas) y se reanalizó en su tonalidad, con el
      repertorio y los acordes de A3-2.
    - El banco pasa de **131 a 132 fragmentos** y los avisos de **3 a 2**. Ningún otro
      fragmento cambia. Comprobaciones: 0 incoherencias · 3330 acordes dentro de la octava ·
      0 solapes de circulitos · los 3 huecos de repertorio conocidos.

74. **Ir a un fragmento por su identificador** (26/9/2026, Diego: «¿no puedes darme un enlace
    para que pulsando me aparezcan y los pueda modificar?»). Los identificadores ya eran
    únicos y visibles (decisión 69), pero seguían siendo solo un nombre: para llegar al
    fragmento había que buscarlo con Cmd+F. Ahora el id es **una dirección**.
    - **`configurar.html#id=A3-4-04`** abre la página con ese fragmento **ya cargado** en «El
      fragmento en curso». Se puede pegar en un mensaje, en un correo o en una lista de cosas
      por arreglar. Funciona también al cambiar el hash con la página abierta, así que una
      lista de enlaces se recorre uno detrás de otro sin recargar; el hash se limpia después
      para que recargar no vuelva a saltar.
    - **Casilla «Ir a un fragmento por su id»** sobre la tabla del banco, con Enter o botón.
      No distingue mayúsculas de minúsculas.
    - El fragmento se abre **aunque no cumpla el filtro** de la ficha —es lo que uno quiere
      cuando le mandan un enlace—, y entonces se avisa, porque las flechas de recorrido sí
      van por el filtro.

75. **`A3-5-11`, las dos cadencias arregladas** (26/9/2026, Diego, revisando con los enlaces
    por id). El fragmento tiene dos mitades separadas por un silencio, y las dos acababan mal.
    - **Primera mitad**: acababa sobre **si3 con 5/3 = II** (la tríada disminuida del 2.º
      grado en estado fundamental), que no es final de nada. Ahora acaba en **mi3 blanca con
      5/3 = V**, que la aplicación dibuja con el ♯ de la sensible (decisión 24): una
      **semicadencia** en regla.
    - **La penúltima de esa mitad, a II6** (Diego, mismo día): el reanálisis había dejado el
      si3 con `5/3` = **II en estado fundamental**, y esa no es la forma usual del II en el
      modo menor. La regla de Diego: *en menor lo corriente es **II6**, o **II6 → II5/3** como
      arpegio; el II5/3 suelto, no*. Como el II6 lleva el **4.º grado en el bajo**, el cambio
      es de nota, no de cifra: el si3 pasa a **re3**, que llega por **salto descendente**
      desde el la3 y enlaza por **2.ª ascendente** con el mi3. La mitad cierra ahora con
      **II6 → V**.
    - El motor proponía ahí **IV** (`5/3` sobre el 4.º grado que sube al 5.º), no II6: la RO
      da `6/5` y `5/3` en ese contexto, y el `6/5` se cae porque A3-5 todavía no tiene
      `II|65`. El modelo se fija a mano a `6` con `5/3` detrás como admisible —las dos son
      subdominantes correctas ahí y las dos están en `leccionAcordes` de A3-5—. **Queda
      abierto** si esa preferencia es general: hay **5 notas más** en el banco en la misma
      situación (menor, 4.º grado que sube al 5.º, modelo IV, con `II|6` en la lección):
      `A3-4-10` n4, `A3-5-02` n3, `A3-5-10` n4, `A3-5-14` n4 y `A3-6-13` n3. Si lo es, es un
      cambio de R7, no seis retoques.
    - **Otros tres II 5/3 en modo menor** quedan pendientes del mismo criterio: `A3-4-07` n5,
      `A3-5-08` n5 y `A3-5-14` n12. Los doce II 5/3 del banco están todos sobre el **2.º
      grado** y salen de R5 («2.º que salta al 5.º»); los cuatro en menor son los que la regla
      de Diego señala. Arreglarlos es cambiar la nota del bajo, como aquí, así que lo decide él.
    - La realización del nuevo **II6 → V** no escribe la segunda aumentada fa → sol♯: la
      decisión 71 la impide sola, y es su primer caso real en el banco.
    - **Segunda mitad**: acababa **sol♯ → la**, es decir V6/5̸ → I, que no es auténtica
      perfecta (la dominante iba invertida). Ahora es **mi3 con 7/+ → la3**: **V7 → I**,
      auténtica perfecta. El `7/+` se guarda como modelo con el `5/3` detrás como admisible;
      en Análisis el filtro de la decisión 54 deja solo el que suena.
    - **El final, rehecho para que quepa el 6/4 cadencial** (Diego, mismo día): la lección es
      A3-5, «el 6/4 cadencial», pero **el bajo no repetía la dominante**, y sin nota repetida
      sobre el 5.º grado el 6/4 no cabe — el enunciado pedía algo imposible en ese fragmento.
      Los tres últimos compases (si redonda · la blanca + mi blanca · la blanca) pasan a
      **dos**: `la · re · mi · mi` en **negras** y `la` redonda. Así la dominante se repite y
      la cadencia queda **I · II6 · I6/4 · V7 · I**.
    - Ojo a la etiqueta: el 6/4 cadencial se cifra sobre el 5.º grado pero su **grado es I**
      (I6/4, la tónica en segunda inversión) y su **función es D** —adorno de la dominante—,
      que es como lo trata la aplicación desde el principio. En la partitura sale `6/4 I`.
    - **Y una síncopa armónica que quedaba escondida** (Diego, mismo día). Con ese final, el
      do4 (I6) caía en la segunda mitad del compás y el tiempo fuerte siguiente volvía a ser
      **I** (la3): la armonía no cambiaba donde debía. La blanca do se parte en **dos negras,
      do4 y si3**, con **I6** y **V4/3** (`+6`): ahora la dominante pega con la tónica del
      tiempo fuerte.
    - **El motor no lo detectaba, y por qué.** `Reglas.sincopaBajo` exime el caso cuando el
      bajo **cambia de nota** —«es la marcha de la RO»—, y aquí el bajo iba do4 → la3. Es
      decir, su definición de síncopa es más estrecha que la de Diego: él la ve en cuanto la
      armonía no cambia sobre el tiempo fuerte, mueva el bajo o no. **Medido sobre el banco**:
      con la misma nota en el bajo hay **0** (la bitácora decía la verdad); con el bajo
      moviéndose había **2**, y las dos son `I6 → I`: la de `A3-5-11`, ya arreglada, y
      **`A3-3-21` notas 6→7** (do3 I6 → la2 I), que sigue ahí. Queda por decidir si la regla
      se ensancha —quitarle la exención del bajo que se mueve— o si ese caso se acepta.
    - El bajo queda: do4 si3 · la3 sol♯3 · la3 **re3** · **mi3** ‖ si3 **do4 si3** · **la3 re3
      mi3 mi3** · **la3**: 7 compases y 15 notas, con el nivel en 4 y el `64` ya entre sus cifras.
      **El bajo tiene ahora 7 compases y la soprano sigue con 8**; son dos ejercicios
      independientes y el de soprano ya tenía su `I|64`, así que no hace falta tocarlo. Los avisos de
      conducción del banco siguen en 6 —los mismos cuatro directos de A3-2-08 y A3-2-09 y las
      dos séptimas de A3-5-11 y A3-5-12—: el de A3-5-11 está en la nota 9, que no se ha
      tocado. Banco: 132 fragmentos, 0 incoherencias, 2 avisos, 3330 acordes dentro de la
      octava, 0 solapes de circulitos.
    - Diego dio por **correctos** los otros cuatro fragmentos señalados: `A3-1-29`,
      `A3-2-11`, `A3-3-04` y `A3-4-04`. Que el bajo y la soprano tengan distinto número de
      notas es deliberado: son **dos ejercicios distintos** sobre el mismo fragmento, no dos
      voces que deban cuadrar.

76. **Sobre el 4.º grado que sube al 5.º: II6 antes que IV** (26/9/2026, Diego). La regla
    completa, en sus palabras: *«tanto en el mayor como en el menor, el II6 es mejor que el
    IV, porque IV → V es fácil que genere quintas paralelas. Se usa IV en vez de II6 cuando
    la melodía incluye la tónica; si no, suele ser más frecuente el II6»*.
    - **Un solo cambio en el motor**: en R7, el 4.º grado que asciende al 5.º pasa de
      `['65','53']` a **`['65','6','53']`**. Primero el 6/5 (II6/5, la respuesta clásica de la
      RO, que además contiene la tónica); si la lección todavía no lo tiene, **II6**; y el IV
      el último.
    - **La excepción no ha hecho falta programarla.** El desempate por **voz compañera** ya
      existente —que pone delante la cifra cuyo acorde contiene la nota que suena a la vez en
      la otra voz— la produce solo: el II6 (re-fa-la en Do M) **no contiene la tónica** y el IV
      (fa-la-do) **sí**, de modo que cuando la melodía trae la tónica el IV sale elegido sin
      que nadie lo mande. Comprobado sobre el banco: de las 18 notas del 4.º grado que suben
      al 5.º, **se quedan en IV exactamente tres**, y en las dos que tienen melodía alineada
      esa melodía es **la tónica** (`A3-6-01` n3, sol en Sol M; `A3-6-13` n3, re en re menor);
      la tercera (`A3-8-01` n4) es el acorde pivote y no tiene melodía ahí. Las otras 15 pasan
      a II6, con la melodía en los grados 2, 4 o 6, nunca en la tónica.
    - **R5 ya decía lo mismo**: para el 4.º grado entre el 6.º y el 5.º proponía `6` (II6)
      antes que `—`. La incoherencia estaba en R7; ahora las dos reglas dicen lo mismo.
    - **Efecto en el banco**: **6 notas** cambian de modelo, de IV a II6 —`A3-4-09` n4,
      `A3-4-10` n4, `A3-5-01` n3, `A3-5-02` n3, `A3-5-10` n4 y `A3-5-14` n4—, dos de ellas en
      **modo mayor**, que es lo que confirma el alcance de la regla. Se reordenan las
      admisibles guardadas (el IV se queda detrás, sigue siendo correcto), no se reescribe el
      banco entero.
    - **El corpus**, al día: las 10 notas del 4.º grado ascendente de `ejercicios.js` pasan de
      `['65','53']` a `['65','6','53']`. **Ningún modelo cambia** —sigue siendo el 6/5—: solo
      se añade el II6 como respuesta admisible, que es lo que el motor ahora acepta. Con eso
      el corpus vuelve a sus **11 discrepancias de 273 notas** (habían subido a 21, y las 10
      nuevas eran todas esta misma, con el modelo intacto).
    - Sin daños: 0 paralelas en las tres posiciones automáticas · banco con 0 incoherencias,
      2 avisos y 3330 acordes dentro de la octava · 0 solapes de circulitos · los 6 avisos de
      conducción de siempre.

77. **El configurador no se enteraba de que el banco publicado había cambiado**
    (26/9/2026, Diego: «he subido la carpeta a GitHub pero no aparece actualizado A3-5-11»).
    **No era un fallo de la publicación**: comprobado sobre el servidor, `banco.json` tenía
    los 132 fragmentos, el `A3-5-11` nuevo y la fecha del día. El fallo estaba en el
    configurador.
    - **La causa**: `bancoPublicado()` llevaba la guarda `if (!lista.length || banco.length)
      return;`. Es decir, **si este navegador ya tenía un banco en `localStorage`, el
      publicado ni se miraba**. Se subía una versión nueva y el configurador seguía enseñando
      la vieja **sin decir nada**. Es el mismo error que me costó una medición falsa en la
      decisión 68, ahora del lado del navegador.
    - **El arreglo**: se compara siempre. Si el navegador no tiene banco, se carga el
      publicado (como antes). Si lo tiene y **la firma coincide** —los ids, el número de
      notas, las respuestas y la tonalidad de cada fragmento—, no se dice nada. Si no
      coincide, sale un **cartel ámbar** en el apartado del banco, con las dos cifras y la
      fecha del publicado, y dos botones: *Cargar el banco publicado* y *Quedarme con el de
      este navegador*. Como el cartel queda por debajo del pliegue, sale además el aviso
      flotante, que se ve sin bajar.
    - **No se sustituye solo, y es deliberado**: lo que hay en el navegador puede llevar
      correcciones todavía sin descargar ni subir, y machacarlas sería perderlas. La
      aplicación avisa; la decisión es del profesor.

78. **Aviso de cambios sin subir** (26/9/2026, Diego: «¿puedes programar un avisador que me
    recuerde si el navegador tiene fragmentos modificados que no están en mi banco todavía?»).
    Es el reverso de la decisión 77 y se resuelve con el mismo cartel, que ahora mira en las
    **dos direcciones** —eran dos avisos distintos para una sola diferencia, y se solapaban—.
    - Al arrancar se guarda la **firma de cada fragmento publicado** (sus notas, sus cifras,
      su tonalidad y las dos listas de la lección). Después de cada cambio en el banco se
      compara con lo que hay en este navegador y el cartel dice, fragmento a fragmento y con
      sus identificadores: **cuáles has cambiado aquí**, **cuáles son nuevos aquí** y
      **cuáles hay en el publicado que aquí no están**.
    - Tres botones, porque la aplicación **no puede saber cuál de los dos bancos es el
      bueno** —puede que hayas corregido aquí sin subir, o que hayas subido desde otro
      sitio—: *Descargar banco.json*, *Cargar el banco publicado* y *Ahora no* (que lo
      esconde hasta la siguiente recarga: es un recordatorio, no una notificación que se
      descarta para siempre).
    - **Descargar no es publicar**: el botón de descarga avisa ahora de que falta subirlo a
      GitHub, y el cartel **no se apaga al descargar**; se apaga solo cuando, al recargar, el
      publicado ya coincide. Es la única prueba de que los alumnos ven lo mismo.
    - Y un último recordatorio al **cerrar la pestaña** con cambios sin subir.
    - Solo funciona con la aplicación publicada: desde el disco no hay con qué comparar.

79. **El cartel de desfase empujaba a destruir el banco** (26/9/2026, Diego: «descargo del
    explorador, subo a GitHub y actualizo y sigue apareciendo el avisador… el problema es que
    el configurador no está actualizado, porque el fragmento sí que está actualizado»).
    Estaba en lo cierto, y el cartel de la decisión 78 tenía dos fallos que se sumaban.
    - **Decía lo que no sabía.** A cualquier fragmento con contenido distinto lo etiquetaba
      *«Aquí has cambiado…»*. En su caso era al revés: su navegador guardaba una copia de
      **130 fragmentos** y el publicado tenía **132** —le faltaban `A3-2-11` y `A3-2-13`—, así que
      lo distinto no era obra suya, era que su copia era la vieja. Ahora se dice lo que se ve
      y nada más: *«Dicen cosas distintas aquí y en el publicado»*.
    - **Y ofrecía primero el botón peligroso.** *Descargar banco.json* salía como acción
      principal. Si la hubiera seguido —descargar esos 130 y subirlos—, **habría borrado dos
      fragmentos para los alumnos** sin que nada lo avisara. Comprobado que no llegó a pasar:
      el publicado seguía con los 132 correctos.
    - **La dirección, ahora deducida**: si al publicado le sobran fragmentos respecto de esta
      copia, es que **esta va por detrás** (uno no borra fragmentos por accidente, pero sí
      abre el configurador en un navegador que lleva semanas sin mirar) → cartel **rojo**,
      título «La copia de este navegador se ha quedado atrás» y *Cargar el banco publicado*
      como acción principal. Si los de más están aquí, **va por delante** → «Tienes cambios
      sin subir» y *Descargar* como principal. Si solo cambia el contenido y el número
      cuadra, **no se puede saber**: se dice así y no se destaca ningún botón.
    - **Red de seguridad al descargar**: si el publicado tiene fragmentos que aquí no están,
      el botón pregunta antes, nombrándolos y diciendo que desaparecerán para los alumnos.
    - **Y el aviso al cerrar la pestaña solo salta cuando hay algo que perder aquí**: si esta
      copia es la atrasada, no hay nada que salvar y preguntar en cada salida sería una lata.

80. **Qué es síncopa armónica, en cuatro reglas** (26/9/2026, Diego). Sobre un tiempo que
    pide cambio de armonía, la armonía ha de cambiar de verdad. Hasta ahora el motor solo lo
    miraba cuando **el bajo repetía la nota** —el resto lo eximía como «arpegio de la marcha
    de la RO»—, y por ahí se colaban casos evidentes. Las reglas, en sus palabras:
    - **El mismo acorde siempre sincopa, aunque cambie la nota del bajo.** Un I6 en parte
      débil seguido de I en el tiempo fuerte lo es, vaya el bajo do → la.
    - **Dos acordes de DOMINANTE siempre, aunque sean distintos y el bajo se mueva.** VII6 al
      final de un compás y V6/5̸ al principio del siguiente: la dominante no se renueva por
      cambiar de inversión.
    - **Dos SUBDOMINANTES distintas, no.** En Do M, IV al final de un compás y VI al principio
      del siguiente es un cambio legítimo.
    - **Dos TÓNICAS distintas, tampoco** —y no hace falta escribirlo: el VI detrás de una
      tónica ya cuenta como subdominante y cae en la regla anterior.

    **Una excepción que hubo que añadir, medida.** Con la regla tal cual, saltaban 7 casos, y
    **4 eran `V → V7` sobre el mismo bajo en A3-1** (`A3-1-08`, `A3-1-09`, `A3-1-30`,
    `A3-1-32`): la fórmula **I–V–V7–I** de la primera lección del método. Eso no es una
    dominante nueva, es la misma completándose, igual que el 6/4 cadencial. Así que el mismo
    acorde sobre el mismo bajo que **gana o suelta su séptima** queda exento. Diego puede
    vetarlo: es el único punto donde me he apartado de lo que dijo.

    **Lo que queda: 3 casos en el banco**, y son exactamente sus tres supuestos.
    | | | |
    |---|---|---|
    | `A3-3-21` notas 6→7 | do3 I6 → la2 I | el mismo acorde |
    | `A3-5-12` notas 6→7 | fa3 V4/2 → sol3 V | dos dominantes |
    | `A3-8-05` notas 3→4 | do♯3 V6/5̸ → re3 V | dos dominantes |

    **El motor los detecta pero no los repara**, y se ha comprobado por qué: en los tres,
    **todas** las cifras admisibles de las dos notas sincopan —el repertorio de la lección no
    ofrece ninguna salida—, así que la pasada de «el modelo no sincopa nunca» no tiene por
    dónde. Hace falta **cambiar una nota del bajo**, como en `A3-5-11`. Es cosa de Diego.
    Detalle a tener presente: `A3-5-12` arrastra **en esa misma nota** el aviso de conducción
    de la séptima que no baja (el fa del bajo sube a sol). Son el mismo problema visto dos
    veces, y se arreglan juntos.

81. **La anacrusa desplazaba toda la métrica** (26/9/2026, Diego: «en A3-3-21 no veo ninguna
    síncopa armónica. No la hay»). Tenía razón, y el fallo era mío: `Teoria.fuerzasMetricas`
    contaba la posición de cada nota sobre un **reloj corrido** desde el principio del
    fragmento, dando por hecho que todos los compases venían llenos. En `A3-3-21` el primer
    compás es una **anacrusa de una negra en 3/4**, de modo que todo lo que venía detrás
    quedaba desplazado un tiempo: el motor tomaba por primer tiempo notas que eran el
    tercero, y de ahí salía la síncopa fantasma.
    - Ahora la posición se cuenta **dentro de cada compás**. Un compás corto al **final** no
      desplaza nada —no hay nada detrás—; el de una **anacrusa** sí, así que sus notas se
      alinean por la **derecha**: una anacrusa de negra en 3/4 cae en el tercer tiempo, que es
      débil, como debe ser.
    - **Medido**: en todo el banco hay **una sola anacrusa**, la de `A3-3-21` —y es justo el
      fragmento del falso positivo—, más 5 compases finales cortos, que no desplazan. Con el
      arreglo, las síncopas del banco pasan de 3 a **2**, y las dos que quedan son las buenas:
      `A3-5-12` y `A3-8-05`. Nada más se mueve.

82. **Al revisar un fragmento del banco, su repertorio** (26/9/2026, a raíz de que Diego no
    encontrara el 6/4 cadencial entre los acordes de dominante). El hallazgo de fondo: al
    cargar un fragmento del banco, el configurador **no aplicaba el repertorio de su
    lección** —dejaba marcado el de por defecto, el de tercero—. Dos consecuencias:
    - En `A3-5-12`, de la lección **del 6/4 cadencial**, la casilla `I|64` quedaba sin marcar
      y el 6/4 no aparecía entre las opciones de dominante, exactamente como decía Diego. A
      cambio salían marcadas cifras que esa lección no tiene (`6/5`, `4/3`, `4/2`, `7`).
    - Y peor: **si se volvía a analizar, se analizaba con la paleta equivocada**.
    Ahora `cargarDelBanco` marca las casillas desde `leccionRepertorio` y `leccionAcordes`
    del propio fragmento.

    **Cambiar la función vuelve a marcar los acordes.** Pedido por Diego: «estaba asignada
    Dominante, lo he cambiado a Subdominante; sería bueno que se marcaran las casillas que
    podrían funcionar sabiendo que la función es subdominante, en vez de ir cambiando yo a
    mano». En la melodía ya se reanalizaba; en el **bajo** solo se repintaba la vista previa.
    Ahora se marcan solas las cifras del repertorio de la lección que sobre ese bajo dan un
    acorde de la función elegida (`Reglas.candidatosFuncion`, que se exporta para esto), con
    un aviso que las nombra; si no hay ninguna, **no se toca nada** y se dice —más vale
    dejarlo como estaba que vaciar la nota—. Comprobado en `A3-5-12`: sobre fa, poner **S**
    marca IV, II6 y II4/3; sobre sol, poner **D** marca V, V7 y **el 6/4 cadencial**.

    **Y el enlace `#id=` funcionaba solo con el banco ya cargado**: en un navegador sin banco,
    el hash se resolvía antes de que llegara el `banco.json` y no abría nada. Ahora se
    reintenta en cuanto el banco publicado termina de cargarse.

83. **Un renglón por tonalidad, no uno por cada cambio** (26/9/2026, Diego, sobre
    `A3-8-05`). Cada acorde pivote abría un renglón nuevo para los grados, de modo que un
    fragmento que sale de Sol M, toma prestado un acorde de Re M y **vuelve a Sol M** gastaba
    **tres** renglones, y el tercero repetía el primero. Ahora cada tonalidad tiene el suyo y,
    al volver a una ya usada, se vuelve a **su** renglón: lo normal pasa a **dos** —el de
    partida y el de la modulación—, que es como se escribe a mano, donde el sitio entre
    sistemas es el que es. Un tercero solo si de verdad aparece un tercer tono.
    - En el pivote, cada grado va al renglón de **su** tonalidad, y al volver la nueva puede
      quedar **por encima** de la anterior: la casilla que queda arriba es la que se estira
      hasta la de abajo, sea cuál sea, y las dos barras verticales van del renglón más alto
      al más bajo. El nombre de la tonalidad se escribe **una vez por renglón**.
    - Comprobado en `A3-8-05` (Sol M → Re M → Sol M): de tres renglones a **dos**. Y en
      `A3-8-01` (Do M → Sol M), que no vuelve, sigue en dos, igual que antes.

84. **Dos dominantes solo sincopan si son del mismo tono** (26/9/2026, Diego, sobre
    `A3-8-05`). La regla de la decisión 80 decía «dos acordes de dominante, siempre», y era
    demasiado ancha. Su razón: **VII6, V y V7 se oyen todos como subconjuntos del acorde
    total, el V7**, de modo que pasar de uno a otro no renueva la armonía. Pero eso vale
    dentro de **un** tono: si cada dominante es de un tono distinto —una secundaria y después
    la de la tonalidad— son dos armonías de verdad diferentes y sí renuevan.
    - En `A3-8-05`, do♯3 es **V6/5̸ de Re M** (dominante secundaria) y re3 es **V de Sol M**:
      tonos distintos, no hay síncopa. Diego lo vio y tenía razón.
    - Con la corrección, las síncopas del banco pasan de 1 a **0**. Nada más se mueve.

85. **Semáforo del banco, siempre visible, con botón para igualar** (25/9/2026, Diego:
    «asigna un indicador de colores y un botón para igualarlos»). El aviso de desfase
    (decisiones 77-79) solo aparece cuando hay desfase, y callar era ambiguo: podía
    significar «todo en orden» o «no se ha mirado». Ahora hay una franja fija encima del
    banco que **siempre dice algo**, en color y en palabras (el color nunca va solo):
    - **verde** — este navegador y lo publicado son idénticos;
    - **ámbar** — o hay fragmentos aquí sin subir, o dicen cosas distintas los dos;
    - **rojo** — esta copia va por detrás: subirla borraría fragmentos publicados;
    - **gris** — no hay con qué comparar (abierto desde el disco, o sin banco publicado).
    - El botón **Igualar** no hace siempre lo mismo: en rojo trae el banco publicado, en
      ámbar-adelantado descarga `banco.json` para subirlo, y en el caso ambiguo no aparece
      —ahí no se puede saber cuál es el bueno y decidirlo por Diego sería el error de la
      decisión 79 otra vez—.
    - **`Volver a comprobar`** vuelve a leer `banco.json` sin recargar la página, con
      `?t=` para saltarse la caché. Esto es lo que faltaba: la foto de lo publicado se
      tomaba una sola vez al arrancar, así que Diego subía a GitHub y el aviso seguía ahí
      (y recargar tampoco bastaba hasta pasado un rato, por la caché de GitHub Pages).

86. **La función del acorde siguiente se mira con su cifra, no solo con su grado**
    (25/9/2026, al revisar la función tonal por contexto). `funcionDe` decide si el VI
    hace de subdominante mirando si lo que viene detrás es una dominante, y para eso
    miraba **solo el grado romano**. El **6/4 cadencial se escribe I6/4**: por el grado es
    una tónica, aunque el propio motor ya lo trate como dominante en todo lo demás. Un VI
    que va a parar a él se etiquetaba T cuando ya está haciendo de S.
    - `funcionDe(romano, romanoSiguiente, cifra, cifraSiguiente)`: el cuarto argumento es
      nuevo, y la comprobación pasa de `funcionesDe(romanoSiguiente)` a
      `funcionesDeAcorde(romanoSiguiente, cifraSiguiente)`. Actualizados los tres que la
      llaman (`Ejercicios.funcionModelo` y dos sitios de `reglas.js`).
    - En el banco cambian dos casos, los dos `I → VI → I6/4`: `A3-6-14` y `A3-7-07`, en
      melodía de soprano. Los VI con función de subdominante pasan de 1 a **3** de 16.
    - Sin tocar: 11 discrepancias de 273 en el corpus, 0 paralelas en las tres posiciones
      automáticas, 0 incoherencias, 0 avisos y 0 síncopas en el banco.
    - **Queda una decisión de Diego**, no del motor: los **13 VI restantes** son todos de
      la forma `I → VI → IV` o `I → VI → II6`. Hoy salen **T**, entendiendo que el VI
      prolonga la tónica y que la subdominante empieza en el IV/II6 que viene detrás. La
      otra lectura —que el VI ya abre la zona de subdominante— daría **S**. La regla que
      hay (VI = S solo si lo siguiente es dominante) da las otras tres bien: `V → VI → IV`
      de `A3-8-01` sale **T**, que es la rota, y `IV → VI → V` de `A3-6-13` sale **S**.
    - **El IV6 no necesita regla**: sus 9 apariciones son todas `I → IV6 → V`, subdominante
      sin discusión. La lectura del IV6 como resolución de una cadencia rota (`V → IV6`)
      no se da nunca en el banco, porque **no hay ninguna cadencia rota**.

87. **El 6/4 cadencial, solo en parte fuerte** (25/9/2026, Diego). El 6/4 cadencial
    retrasa la dominante, y para que se oiga como retraso y no como un tropiezo tiene que
    caer en parte fuerte. Su criterio, literal: «en compás binario ha de ir en tiempo
    fuerte; en compás ternario puede ir, adicionalmente, en el 2.º o el 3.º; en binario
    solo en los tiempos fuertes (en 4/4, el 1.º y el 3.º)».
    - `Teoria.cabeSeisCuatro(compas, fuerza)`, sobre las fuerzas de `fuerzasMetricas`
      (3 primer tiempo · 2 mitad del compás · 1 otro tiempo · 0 a contratiempo):
      en **ternario** (3/4, 3/8, 9/8) vale de 1 para arriba; en **2/4** solo el primer
      tiempo, porque ahí la mitad del compás ES el segundo y es débil; en **4/4 y los
      compuestos** (6/8, 12/8) el primero y la mitad; **a contratiempo, nunca**.
    - Se aplica en los dos motores: en `seiscuatroCadencial` (armonización de bajo,
      regla R7) y en la inserción del 6/4 de la cadencia final (armonización de soprano).
    - **El banco ya lo cumplía**: sus 40 acordes de 6/4 están 35 en primer tiempo y 5 en
      la mitad del compás, ninguno en parte débil. La regla es una barandilla para lo que
      venga, no una corrección de lo que hay. Compases del banco: 125 en 4/4, 6 en 3/4,
      1 en 2/4.

88. **El VI que va hacia la dominante ya es subdominante** (25/9/2026, Diego: «interpreto
    VI – IV – V como VI que es ya subdominante, entendiendo como tal las sonoridades sobre
    movimientos del bajo que preparan la dominante»). La regla anterior pedía que la
    dominante viniera **inmediatamente** detrás; con su definición basta con que el VI esté
    ya dentro del movimiento que la prepara, aunque entre medias haya otra subdominante.
    - El VI es **S** cuando lo que sigue es dominante (D o DD) **o subdominante**; es **T**
      cuando lo que sigue es tónica o cuando no hay nada detrás.
    - **Una excepción, la cadencia rota**: el VI que *resuelve* una dominante sustituye a
      la tónica, y ahí es **T**. Sin ella, `V → VI` se leería D → S, que es justo lo que
      las reglas de enlace prohíben.
    - Para saberlo hace falta el acorde anterior: `funcionDe` recibe ahora un quinto
      argumento, `anterior` = `{romano, cifra}`.
    - En el banco: los VI con función de subdominante pasan de 3 a **15** de 16. El único
      que sigue siendo T es `A3-8-01`, `V → VI → IV`, que es precisamente la rota.
    - El cambio afecta **solo a la fila de funciones** que se enseña (y al texto de la
      explicación): las reglas de enlace del motor usan `funcionesDeAcorde`, no `funcionDe`,
      así que las sucesiones admitidas no se mueven. Comprobado: 11 discrepancias de 273
      en el corpus, 0 paralelas en las tres posiciones automáticas, y el banco en 0
      incoherencias, 0 avisos y 0 síncopas.

89. **«Parte fuerte» es relativo al ritmo armónico** (25/9/2026, Diego, corrigiendo la
    decisión 87: «en 2/4 también puede ir 6/4 en el segundo tiempo si el ritmo armónico es
    de corchea, porque entonces la primera corchea del segundo tiempo es fuerte. Esto se
    aplica a la división de tiempos y figuras y no a la figura en sí»).
    - `Teoria.divideElTiempo(compases, compas)` devuelve, nota a nota, si en **su compás**
      el tiempo está dividido. Lo mide con la **figura más corta del compás**, no con la
      de la nota: como aquí cada nota del bajo lleva un acorde, la figura más corta del
      compás *es* el ritmo armónico de ese compás. Así se cumple lo de «la división de
      tiempos y figuras y no la figura en sí»: un 6/4 de negra rodeado de corcheas cae en
      un compás dividido, y una corchea suelta en un compás de blancas, no.
    - Con el tiempo dividido, `cabeSeisCuatro` sube **un nivel**: vale la cabeza de
      cualquier tiempo (fuerza ≥ 1). El **contratiempo sigue sin valer nunca**, en ningún
      compás: lo que se promueve es el tiempo, no la subdivisión.
    - **Extensión más allá de lo que Diego dijo, que puede vetar:** su enunciado habla del
      2/4, pero el principio es general, así que se aplica igual a los demás compases. En
      un 4/4 con ritmo armónico de corchea, el 2.º y el 4.º tiempo pasan también a admitir
      el 6/4.
    - Probado con casos sintéticos: en 2/4 con negras el 6/4 en el 2.º tiempo se rechaza;
      con corcheas se admite; a contratiempo se rechaza en los dos. **El banco no cambia**:
      ninguno de sus 1123 tiempos está en un compás con el tiempo dividido —todo son
      negras, blancas y redondas—, así que la regla es, otra vez, una barandilla para lo
      que venga.

90. **El grado que responde el alumno, según el tipo de ficha** (25/9/2026, Diego). Hasta
    ahora, en los cuatro tipos el alumno daba lo mismo: una cifra y el grado de la
    **fundamental** en romano. Ahora depende de para qué sirve la ficha:
    - **Armonización de bajo** → el **grado de la escala que ocupa la nota del bajo**, en
      arábigo (1 … 7, con ♯/♭ si va alterado). Es la única ficha con el bajo delante y el
      trabajo de leerlo con la regla de la octava, que es lo que Diego quiere que memoricen.
    - **Análisis** → el grado de la **fundamental**, en romano. Analizar es nombrar el acorde.
    - **Audición** → la **fundamental** también (corregido por Diego el 25/9, después de
      una primera versión que la puso con la armonización de bajo). Allí el bajo **no se
      ve**, así que pedir el grado que ocupa en la escala no tendría sentido: lo que hace
      el alumno es identificar el acorde que suena, que es análisis de oído.
    - **Armonización de soprano** → la fundamental, por fuerza: de ella y de la cifra sale
      el bajo que se dibuja.
    - `Ejercicios.campoGrado(ej)` da `'bajo' | 'fundamental'`, y se puede fijar por
      ejercicio con `campoGrado`. `Ejercicios.gradoDe(ej, pareja)` devuelve el que toque;
      toda la corrección, la paleta, la lista «Grados en este ejercicio» y el texto del
      enunciado pasan por ahí.
    - **Cómo se corrige.** El grado del bajo **no depende de la cifra** —la nota es la que
      es—, así que todas las parejas de una nota llevan el mismo `gradoBajo` y el camino de
      corrección es el mismo que el del romano, sin excepciones. En el **pivote** de una
      modulación sigue habiendo dos lecturas, una por tonalidad: en `A3-8-01`, el do del
      bajo es **1 = 4** (grado 1 de Do M y grado 4 de Sol M).
    - **Los circulitos se apagan solos** cuando el grado del bajo es justo lo que se pide:
      si no, la respuesta estaría escrita encima de la nota. El profesor puede reponerlos
      con `gradosBajo: true`. En Análisis siguen puestos, porque allí lo que se pide es
      otra cosa; en Audición nunca se dibujan, porque el bajo no se ve.
    - **La tecla sigue siendo el grado**, no el sitio en la paleta: 1 … 7 para el bajo,
      I = 1 … VII = 7 para el romano. Los grados alterados (♯4) comparten cifra con el
      natural, así que se quedan sin tecla y se pulsan con el ratón.
    - **La vista previa del configurador enseña lo mismo que vería el alumno** con el tipo
      elegido, para que el profesor no vea I – V – I donde el alumno ve 1 – 5 – 1.
    - **El banco no cambia.** Lo que guarda son las cifras y los acordes admisibles; el
      grado del bajo se calcula de la nota y la tonalidad, así que los enlaces repartidos
      siguen valiendo y el `banco.json` es el mismo.
    - Probado de punta a punta en la página del alumno: en armonización de bajo la paleta
      sale 1 … 7, la lista dice «1 4 5 6», no hay circulitos, y la corrección da 4 de 4
      con el modelo y 3 de 4 cambiando un grado; en Análisis, lo mismo con I … VII.

91. **Los grados del bajo, en tres estados y con rampa dentro de la ficha** (25/9/2026,
    Diego). El circulito de grado (decisión 52) y el grado que responde el alumno
    (decisión 90) son **el mismo dato**, así que los manda un solo interruptor:
    - **dado** — el circulito va encima de la nota y el alumno no lo escribe;
    - **pedido** — lo escribe él, y entonces no se dibuja: sería la respuesta a la vista;
    - **oculto** — ni se dibuja ni se pide.
    Vive en `ej.gradosBajo` y lo lee `Ejercicios.estadoGrados(ej)`. Sin decir nada, en
    armonización de bajo se **piden** —es de lo que va la ficha— y en los demás tipos van
    **dados**. Pedirlos solo cabe en armonización de bajo, que es donde el bajo está
    delante; en los otros tipos un «pedido» se comporta como «oculto».
    - **La rampa** (`gradosPrimero`, casilla «dar los grados solo en el primer fragmento»):
      es lo que pidió Diego —«se presenta la información en el fragmento 1 pero no en los
      siguientes»—. Marcada, el fragmento 1 de la ficha los lleva **dados** y en los demás
      se **piden**: se le enseña una vez y luego los hace él. Se aplica en
      `Banco.ejercicio(e, filtro, k)`, que ya sabe qué número hace el fragmento.
    - **Los enlaces repartidos antes siguen valiendo**: llevan un booleano en `gradosBajo`
      y se leen como `true` = dado, `false` = oculto, que es exactamente lo que hacían.
    - La vista previa del configurador enseña el estado elegido, y con la rampa marcada
      enseña el fragmento 1, o sea los grados dados.
    - **El estado es del FRAGMENTO, nunca de una nota suelta** (cerrado el 25/9/2026 por
      Diego, recordando el argumento que se había dado antes). La idea de dar los grados
      solo donde el bajo se ajusta a la regla de la octava se descarta por una razón de
      fondo: un circulito puesto en unas notas y no en otras estaría **señalando dónde se
      aplica la regla**, que es justo lo que el alumno tiene que reconocer por su cuenta.
      Todos o ninguno. Es lo que ya hacía el dibujo —`partitura.js` los pinta sobre todas
      las notas del bajo o sobre ninguna—, así que no hubo nada que cambiar.
    - Para el archivo, la medida que se había hecho para decidirlo: de los **118** bajos
      del banco, **64** se explican solo con la RO por grados conjuntos (R7) más el final
      y la cadencia, y los otros **54** usan además alguna regla de salto —arpegio, 4̂ que
      salta, fórmulas funcionales, repetición—. No se usa para nada: queda como dato.

92. **«En esta ficha entran»: el inventario de acordes, sin posiciones** (25/9/2026,
    Diego). La cabecera del alumno decía «Cifrados de esta lección» y listaba los siete u
    ocho iconos de cifra del fragmento en curso. En una ficha que mezcla lecciones eso
    cambia de un fragmento a otro, y decir «de esta lección» confunde. Ahora esa fila es
    **el inventario de acordes de toda la ficha, sin inversiones**, y es **la misma en los
    N fragmentos**: `I II II7 IV V V7 VI VII`.
    - Es lo que Diego hace en clase: «escribir los acordes que han de emplear en la
      pizarra, todos los acordes que hemos visto hasta ese momento».
    - **Por qué la unión vale**: las listas de acordes de las lecciones son
      **acumulativas** —comprobado en el banco, A3-1 ⊂ A3-2 ⊂ … ⊂ A3-8—, así que la unión
      de los fragmentos de una ficha es exactamente «todo lo visto hasta la lección más
      avanzada que entra». No hace falta más maquinaria.
    - **Sin posiciones** (`Teoria.acordeSinPosicion`): «V 6/5̸» y «V +4» son el mismo
      acorde, V7. El número de notas del acorde se cuenta llamando a `vocesSuperiores`
      sobre un bajo cualquiera —el número de voces superiores no depende del bajo— y se
      memoriza por cifrado; contar la aridad de `CIFRADOS[id].voces` **no** vale, porque
      `voces` es una función `(bajo, ton) => [...]`, y por ahí se coló el primer intento,
      que fundía V y V7 en uno.
    - En una dominante secundaria la cifra va antes de la barra: **V7/V**, no V/V7.
    - **El detalle no se pierde**: las inversiones que de verdad se usan van en el título
      de cada etiqueta («I — en este repertorio, en 3 posiciones: — · 6 · 6/4»), y los
      cifrados siguen en la paleta, que es donde se pulsan.
    - En un **ejercicio suelto** (sin ficha) la fila dice «En este ejercicio entran» con el
      inventario de su lección. En un ejercicio propio del configurador, sin lista de
      acordes, se queda como estaba: los cifrados del repertorio.

93. **El orden de las filas bajo el pentagrama** (25/9/2026, Diego). De arriba abajo:
    **FUNCIÓN · CIFRADO · GRADO · TONALIDAD**. Antes la función iba entre el grado y la
    tonalidad.
    - **Por qué.** Leído de abajo arriba es la cadena de la que cuelga cada dato: la
      tonalidad manda sobre el grado —el mismo do es 1 en Do M y 4 en Sol M—, el grado
      manda sobre el cifrado, y del cifrado sale la función. Con la función en medio, esa
      cadena quedaba partida por la mitad.
    - Se aplica en los cuatro tipos, no solo en armonización de bajo: tener dos
      disposiciones distintas confundiría al alumno que hace fichas de varios tipos, y la
      cadena se lee igual de bien cuando la casilla del grado es el romano.
    - En `partitura.js` es un cambio de las constantes de altura: `Y_FUN` pasa a ser la
      primera fila bajo el pentagrama y `Y_CASILLA` cuelga de ella. El dibujo de cada fila
      no cambia.
    - **Los circulitos no se mueven**: solo aparecen donde el grado del bajo NO se pide
      —Análisis, Audición y melodía de soprano—, y ahí son una anotación sobre la música,
      no una fila que el alumno rellene. En armonización de bajo el grado del bajo vive en
      su fila, que es donde lo escribe.

94. **En armonización de bajo, la fila del grado es siempre el grado del bajo**
    (25/9/2026, Diego, a partir de su lista de cuatro filas). La decisión 91 hacía que con
    los grados **«dados»** el alumno viera los circulitos sobre el pentagrama y además se
    le pidiera el **romano de la fundamental**. Pero en esa ficha no hay fila de romano: la
    fila del grado es la del grado del bajo, y lo único que cambia es quién la escribe.
    - **dado** — la fila está, viene **escrita** y no se responde: ni se navega, ni hay
      paleta de grados, ni cuenta en la corrección. Se pinta como las otras casillas dadas
      —la de función y la de tonalidad—, para que se distinga de las que él rellena. El
      alumno pone **solo el cifrado**. En el **pivote** van las dos lecturas, una por
      tonalidad, con sus barras: en `A3-8-01`, `1` sobre `4`.
    - **pedido** — la escribe él (decisión 90).
    - **oculto** — **no hay fila de grado**: se cifra y nada más.
    - `Ejercicios.campoGrado` devuelve ahora `'bajo'` en armonización de bajo sea cual sea
      el estado, y se añaden `gradoDado(ej)` y `sinFilaGrado(ej)`. En `app.js`, un solo
      predicado —`pideGrado()`— separa «hay fila» de «se responde», y por él pasan la
      navegación, la paleta, el enunciado, la corrección y el desglose del resultado.
    - **Los circulitos sobre el pentagrama quedan solo para los otros tres tipos**, donde
      la fila del grado es el romano y el grado del bajo es una anotación sobre la música.
      En armonización de bajo no se dibujan nunca: estaría el mismo dato dos veces.
    - La **rampa** de la decisión 91 sigue igual y ahora significa lo que parecía:
      en el fragmento 1 los grados vienen escritos y en los demás los escribe él.

95. **La fila de funciones, partida en el acorde pivote** (25/9/2026, Diego: «si
    modulamos a través de Sol Mayor, la función de este último será distinta en cada tono
    —Dominante en Do Mayor y Tónica en Sol Mayor—; por esto cada tonalidad ha de tener su
    propia línea de función»). En el pivote la casilla se parte en dos, arriba la función
    en el tono de partida y abajo en el de llegada, unidas por las mismas barras
    verticales que ya llevaba la casilla del grado.
    - **Las dos son verdad**, y las dos se corrigen, **cada una en SU tonalidad**: se
      añade `Ejercicios.funcionModeloEn(ej, i, ton)` y `funcionesAdmisiblesEn`, y la nota
      solo cuenta como correcta si acierta las dos. En `A3-8-01`, el do del bajo es **T**
      en Do M (es su I) y **S** en Sol M (es su IV) — y debajo, en la fila del grado, **1**
      y **4**.
    - `estado.funciones2` guarda la segunda, con su campo de navegación `funcion2`, su
      casilla bloqueable y su `okFuncion2`. En el desglose de errores el pivote sale como
      `T = S`, igual que el grado sale `1 = 4`.
    - La fila **crece al doble de alto solo cuando hay pivote**: en un fragmento que no
      modula la partitura queda exactamente igual que antes.
    - Se parte en cuanto hay fila de tonalidad y una marca en esa nota, tanto si las
      funciones vienen **dadas** como si se **piden**. La vista previa del configurador
      la enseña igual.
    - Probado de punta a punta: con el modelo, 7 de 7; cambiando la función de la casilla
      de arriba del pivote, 6 de 7.

96. **«Sonar al elegir», marcada por defecto** (25/9/2026, Diego). El interruptor que hace
    sonar el acorde en cuanto la nota queda completa venía apagado. Oír lo que se escribe
    es la mitad del ejercicio, y esperar a que el alumno descubra la casilla era perder esa
    mitad en la mayoría de los casos. Ahora viene encendida y se puede apagar igual que
    antes.

97. **La sensible manda sobre el modo** (25/9/2026, regla de Diego: «si el pasaje emplea
    la armadura de bemol en si y do sostenido, entonces está en re menor y no en Fa mayor;
    aplicable a todos los tonos menores»). Una armadura vale para dos tonalidades, y hasta
    ahora el modo solo se corregía **a posteriori**, cuando la lectura mayor dejaba alguna
    nota del bajo sin cifra (decisión 53). La prueba de Diego es más directa y llega antes:
    **si aparece la sensible de la relativa menor, el pasaje está en menor**.
    - `Banco.modoPorLaSensible(ton, notas)`: toma la relativa menor de la misma armadura y
      mira si alguna nota es su 7.º grado **elevado**. Se aplica al principio de
      `tonalidadQueCuadra`, antes que nada.
    - **Dos cosas que la regla vieja no hacía**: vale aunque la lectura mayor sea completa
      —que es justo el caso que se colaba, y el de `A3-2-10`— y vale **sin bajo**, solo con
      la melodía, donde la prueba de «una nota sin cifra» no dice nada.
    - La corrección es **silenciosa**, como debe ser: la armadura está bien escrita, solo
      se había equivocado el modo, así que no se marca con (?) ni se avisa al profesor.
    - El límite de esta regla sola —que ese do♯ podría ser la tercera de un V/vi en Fa
      mayor— lo resuelve la subregla del relieve, decisión 98.
    - **En el banco no cambia nada**: ninguno de los 132 fragmentos escritos en mayor
      contiene la sensible de su relativa menor (`A3-2-10` ya estaba corregido a re menor).
      La regla es una barandilla para lo que se importe a partir de ahora.
    - Probado con nueve casos: `A3-2-10` escrito en Fa M se corrige a re menor; lo mismo en
      Do M → la m, Sol M → mi m y Mi♭ M → do m; funciona con melodía sola; y no toca ni un
      fragmento que esté de verdad en mayor ni uno ya escrito en menor.

98. **El relieve: la tónica es la nota en la que se insiste, no una nota de la escala**
    (25/9/2026, Diego, refinando la decisión 97). Qué notas usa un pasaje se resume en una
    escala, y una escala no distingue **Do mayor de re dórico**: las notas son las mismas y
    lo que cambia es cuál manda. Lo que decide es en cuáles **insiste** la melodía. Sus tres
    señales, y el peso que se les ha dado:
    - **acabar** en ella (4) y **empezar** en ella (3) — el final pesa más que el principio;
    - llegar a ella **por salto**, de 3.ª o más (2) — el do–sol de «Campanitas del lugar»;
    - destacarla con un **cambio de dirección** melódica, un pico o un valle (1).
    `Teoria.relievePorNota(notas)` devuelve los puntos de cada nota y
    `Teoria.relieveDeTonica(ton, notas)` los de una tónica concreta. Los pesos son un orden
    de importancia, no una medida. **No se cuentan la duración ni la parte métrica**: Diego
    nombró estas tres señales, y añadir más por mi cuenta sería cambiarle la regla.
    - **Dónde se usa.** Primero, para cerrar el hueco de la decisión 97: cuando aparece la
      sensible de la relativa menor, la lectura mayor **solo se conserva si su tónica tiene
      más relieve que la menor**. Así, `fa do fa re do♯ re do fa` se lee Fa mayor con un
      V/vi de paso (fa=12, re=3), mientras que `re la do♯ re` se lee re menor (fa=0, re=7).
      En el empate manda la sensible, que es la prueba más fuerte de las dos.
    - Y segundo, para **ordenar las candidatas** cuando la armadura no basta: si varias
      admiten todas las notas, gana aquella en cuya tónica insiste el pasaje. El desempate
      es estable, así que el orden anterior se conserva cuando el relieve empata.
    - Comprobado con las dos melodías que puso Diego de ejemplo: **«Campanitas del lugar»**
      da `do:7 sol:2` —la tónica primero y, detrás, la nota a la que salta—, y un giro
      **dórico** sobre re con las notas de Do mayor da `re:10 la:2`.
    - En el banco no cambia nada: 132 fragmentos, 0 incoherencias, 0 avisos, 6 con (?).

99. **El corte del móvil es por anchura O por altura** (25/9/2026). Los dos puntos de
    corte del CSS eran solo de anchura (600 y 719 px). Un móvil en HORIZONTAL mide
    844×390: pasaba de largo por los dos y recibía la disposición de escritorio dentro
    de una ventana de 390 px de alto. Medido antes y después, sobre A3-8-08 (14 notas,
    armonización de bajo, con la realización a la vista):

    | | preámbulo | paletas | ¿ve el alumno la partitura al abrir? |
    |---|---|---|---|
    | Antes | 504 px | sueltas, a 984 px de distancia | no, ni una nota |
    | Ahora | 210 px | fijas abajo, 144 px | sí |

    - La `@media` pasa a ser `(max-width: 719px), (max-height: 559px)`, y
      `ajustarCompacto` en `app.js` usa los **mismos dos umbrales**: si se cambia uno hay
      que cambiar el otro. 559 deja fuera cualquier portátil (600 px de alto para arriba)
      y coge todos los móviles en horizontal (320–430).
    - En ventana **baja** se recorta además el preámbulo, porque con las paletas fijas
      quedan ~245 px de banda útil y cada píxel de preámbulo se come una línea de música:
      fuera el sobretítulo, el enunciado a una línea y el pie; y las dos filas de
      referencia —grados y cifrados— se **pliegan** detrás de un botón (no se borran:
      un toque las devuelve), que además están repetidas en las paletas de abajo.
    - Lo que esto NO arregla: la partitura sigue midiendo 546 px de alto y 1109 de ancho,
      así que en la banda de 245 px se ve menos de la mitad y hay que desplazarse. El
      `enfocarActiva` que ya existía se encarga de que la casilla activa esté siempre a la
      vista sobre las paletas —comprobado: con la nota 9 activa, la casilla queda en
      y=195 y las paletas empiezan en y=246—. El **vertical** sigue pidiendo el reflujo en
      varios sistemas, que es lo caro y sigue pendiente.
    - Escritorio y tableta, sin tocar: las medidas son idénticas a las de antes.

100. **El globo de repaso: las cifras admisibles al pasar el ratón por un acorde**
    (25/9/2026, Diego: «al pasar el ratón por un acorde se muestren las opciones
    seleccionadas como válidas para cifrar/armonizar ese acorde… me permitiría revisar
    muy rápida y fiablemente»). En la vista previa del paso de revisión, pasar el ratón
    por un acorde abre un globo con lo que se ha marcado para esa nota.
    - **Qué enseña**: «Acorde n · nota · grado g de la tonalidad · función», las cifras
      marcadas con su icono y su grado romano —la modelo la primera y en verde— y, al
      pie, cuántas son. Si no hay ninguna, lo dice en rojo.
    - **De dónde sale**: del mismo sitio que las fichas de la tabla. `pintarRevision`
      guarda en `estado.resumen[i]` lo que acaba de pintar, y el globo lee de ahí; así el
      globo y la tabla no pueden decir cosas distintas.
    - **Dónde se pone**: ENCIMA del circulito, no debajo. Los números van en la banda de
      arriba, fuera del pentagrama, de modo que el globo cae sobre el margen y **no tapa
      la música**, que es justo lo que hay que mirar al mismo tiempo. Solo baja cuando
      arriba no cabe, y nunca se sale de la ventana.
    - **Dónde se pasa el ratón**: por toda la COLUMNA del acorde, no solo por el
      circulito, que es un blanco de 27 px y obliga a apuntar. La zona es un rectángulo
      transparente pegado **al final** del dibujo —si se pone donde se dibujan los
      números queda debajo de las notas y de las casillas, y el ratón solo la encuentra
      en los huecos—. Pulsar la columna hace lo mismo que pulsar el circulito: llevar a
      la fila de la tabla.
    - El globo es **solo lectura** y no recibe el ratón (`pointer-events: none`), así que
      no puede robárselo al acorde ni parpadear al aparecer bajo el cursor. Para cambiar
      algo se sigue pulsando.
    - Solo existe en el configurador: la zona y el globo los crea quien define
      `alPasarNumero`, y en la página del alumno nadie lo define.

101. **La lista de acordes de la lección también corrige** (25/9/2026, Diego: «¿o el
    configurador filtra y los acordes asignados a un acorde en un fragmento determinan qué
    está bien y qué no? En ese caso, IV en el segundo acorde podría estar bien o mal
    dependiendo de la lección»). Hasta ahora mandaban solo las fichas marcadas a mano en la
    tabla de revisión, que se guardan **en el fragmento**: una opción marcada valía en
    todas las lecciones que usaran ese fragmento, aunque la lección todavía no hubiera
    visto ese acorde. Ahora `Ejercicios.admisibles` mira además `ej.acordes`, la lista de
    acordes de la lección.
    - **No es una regla nueva, es aplicar la que ya había.** El motor ya se limitaba a esa
      lista al proponer (`acordePermitido`, en `reglas.js`: «el alumno solo tiene esos
      acordes a mano, así que proponerle cualquier otro es ponerle una trampa»). Lo que se
      saltaba la comprobación eran las opciones marcadas a mano, y al corregir nadie
      volvía a mirarla. La corrección y el motor dicen ahora lo mismo.
    - **Dos cautelas, las dos a favor del alumno.** El **modelo nunca se quita** —si el
      modelo queda fuera de la lista de su lección eso es un error de datos, no motivo para
      dejar la nota sin respuesta correcta—, y en el **acorde pivote** basta con que la
      opción valga en una de las dos tonalidades (al proponer se exige en las dos).
      Comprobado: **0 notas** del banco se quedan sin respuesta correcta.
    - **Lo que cambia en el banco: 4 opciones de 2167.**

      | | qué pasa |
      |---|---|
      | `A3-3-04` bajo n2 · IV 5/3 | deja de darse por buena. A3-3 **no tiene ninguna subdominante** en su lista |
      | `A3-7-04` bajo n2 · IV 7 | deja de darse por buena. A A3-7 le falta `IV\|7` |
      | `A3-7-09` bajo n2 · IV 6/5 | es la única opción, así que se respeta; a A3-7 le falta `IV\|65` |
      | `A3-5-12` bajo n6 · II 6/5 | ya se caía **antes**, por el repertorio de cifras: A3-5 no tiene `65` |

      Tres de las cuatro son exactamente los tres acordes que el punto 4 de la bitácora
      daba por ausentes de `leccionAcordes`. Deja de ser una omisión cosmética de la paleta
      de la melodía: es la causa de que cuatro respuestas del bajo no cuadren con su
      lección.
    - **Cómo se ve.** En la tabla de revisión, una ficha marcada que la lección no admita
      sale tachada y en rojo; el globo (decisión 100) la tacha igual y lo dice al pie; y
      bajo la tabla aparece un aviso que las nombra, distinguiendo el caso grave —que la
      que sobre sea la modelo—. El corpus de la regla de la octava sigue en 11
      discrepancias y el banco en 132 fragmentos · 0 incoherencias · 0 avisos.

102. **Transportar sobre la marcha, sin guardar copias** (25/9/2026, Diego: «¿sería posible
    que replicaras ese fragmento en do mayor en cada una de las tonalidades que propone el
    configurador?»). El banco está escrito mayormente en Do M y la menor —48 y 26 de 132
    fragmentos, el 56 %—. Ahora la ficha puede repartirlo por las tonalidades que el
    profesor elija, **sin añadir ni un fragmento al banco**.
    - **Por qué sale tan barato.** Las respuestas del banco están escritas en un lenguaje
      que no depende del tono: cifras (`53`, `+4`) en el bajo y `romano|cifra` (`V|7+`) en
      la melodía; `leccionRepertorio` son cifras y `leccionAcordes`, grados romanos.
      **Lo único que lleva altura son los compases y la tonalidad.** Transportar es mover
      las notas, la tonalidad y el destino de sus modulaciones; todo lo demás queda igual,
      literalmente. Comprobado: en 1 980 transportes del banco entero, **0 respuestas
      alteradas**.
    - **Se descartó poblar el banco con copias** (la otra opción que planteó Diego). El
      mantenimiento es el argumento: los 33 fragmentos que él corrigió el 25/9 habrían sido
      165 ediciones. Y hay dos daños menos visibles: su barra de revisión pasaría de «92 de
      118» a «92 de 590», y el semáforo y la auditoría empezarían a contar copias. La
      ventaja que se le veía —poder imprimir— es falsa: para imprimir hace falta dibujar,
      no guardar.
    - **Determinista, no al azar.** La tónica de cada fragmento sale de un revoltijo de su
      `id` y de una **semilla que viaja en el enlace**. Así el mismo enlace da siempre los
      mismos tonos —se puede repetir, comparar entre alumnos, imprimir y reanudar a
      medias— sin guardar nada. La semilla se renueva al cambiar cualquier opción de la
      ficha; pulsar «Generar» dos veces seguidas da el mismo enlace.
    - **Una tonalidad por fragmento**, no el mismo fragmento repetido en varias (elección
      de Diego). Así el alumno percibe variedad, no transporte. Encaja con lo anterior: el
      acorde es invariante y el tono no, de modo que lo que se repasa es el **acorde**, en
      fragmentos y tonos distintos, no el fragmento, que es lo que acabaría memorizando.
    - **El intervalo se reduce entero, no por partes.** `intervaloEntreTonicas` normaliza
      los pasos de letra y los semitonos **a la vez**. Hacerlo por separado —el error que
      tuve primero— da pares imposibles (bajar una cuarta de letra y subir un tritono de
      semitonos) y de ahí salían 51 fragmentos con dobles alteraciones que no debían tener.
    - **La octava.** Tras transportar se corren las dos voces a la vez —si no, se
      cruzarían— por la octava que menos saque al fragmento del registro que tenía.
    - **El techo real son las dobles alteraciones.** La fuente incrustada es un subconjunto
      de Bravura con ♯, ♭ y ♮; **no tiene 𝄪 ni 𝄫** (comprobado leyendo el cmap: 57 glifos,
      sin E263 ni E264). `Teoria` sabe nombrarlas pero la partitura no sabe dibujarlas.
      Medido sobre el banco:

      | tope | casos | no dibujables |
      |---|---|---|
      | 2 alteraciones | 660 | 0 |
      | 3 alteraciones | 924 | 1 |
      | 5 alteraciones | 1 452 | 51 |
      | 7 alteraciones | 1 980 | 226 |

      Y se concentran donde la teoría manda: **sol♯, re♯ y la♯ menor** (la sensible pide
      𝄪) y las tonalidades de 6 y 7 bemoles. Cuando un fragmento no se puede dibujar en la
      tónica que le tocaba, se le da **la siguiente marcada**: nunca se rompe nada, esas
      tonalidades salen menos. Añadir los dos glifos al subconjunto de la fuente lo
      arreglaría del todo y queda pendiente.
    - **En el configurador**, bloque «En qué tonalidades», con los cuatro cursos que fijó
      Diego como atajo —1.º de Armonía hasta 2 alteraciones · 2.º de Armonía hasta 3 ·
      1.º de Análisis/Fundamentos hasta 5 · 2.º de Análisis/Fundamentos hasta 7— y las
      tónicas marcables una a una: tocar cualquiera pasa el desplegable a «a medida». Al
      generar el enlace se enseña **el reparto**, que es determinista y por tanto se puede
      anticipar. No confundir con «Alteraciones de la armadura» del bloque de arriba, que
      es un filtro de qué fragmentos entran, no de a qué tono salen.
    - En el enlace viaja `maxAlt` (el tope, que se adapta al modo de cada fragmento) o
      `tonos` (la lista a mano), más `semilla`. Sin ninguno de los dos **no se transporta
      nada**: las fichas de antes siguen dando exactamente lo que daban.

103. **Una dominante secundaria no es una modulación, y la tríada también cuenta**
    (25/9/2026, Diego: «si hay una dominante secundaria, no es necesario poner un nuevo
    renglón, porque ese acorde es un préstamo en la tonalidad que ya estábamos, y se cifra
    consecuentemente como V/V»). Dos cosas, una de datos y otra de motor.
    - **`A3-8-08` tenía una modulación de una sola nota.** El banco decía «→ Re M» en la
      nota 12 y «→ Sol M» en la 13. Quitándolas, el do♯ se lee solo:

      | | con la modulación | sin ella |
      |---|---|---|
      | n12 do♯ | V de Re M (pivote) | **V/V** de Sol M · función **DD** |
      | n13 re | V de Sol M (pivote de vuelta) | V de Sol M |

    - **El motor no reconocía la tríada.** `esSecundaria` solo mira la cifra, así que veía
      la dominante secundaria cuando llevaba séptima (`7+`, `+6`, `65d`, `+4`) y se le
      escapaba la **tríada mayor sobre el 2.º grado** —la-do♯-mi en Sol M, la V/V sin
      séptima—, que salía rotulada «II». Ahora hay `esSecundariaEn(id, bajo, ton)`, que con
      el bajo y el tono delante puede comprobar lo que de verdad importa: **si la 3.ª sobre
      la fundamental es mayor**. En el II diatónico —tercera menor en mayor, disminuido en
      menor— da falso, así que el II de siempre se sigue llamando II.
    - De la **función tonal** no hubo que hacer nada: `funcionesDe` ya lee `V/V` como `DD`,
      de modo que el renglón de funciones sigue solo al rótulo.
    - **Medido sobre el banco entero: de 798 acordes, cambia de rótulo exactamente uno**,
      el que señaló Diego. Controles: `re 5/3` en Do M sigue siendo II, `fa 6` en Do M
      sigue siendo II, `si 5/3` en la menor sigue siendo II, y `do♯ 6` en Sol M pasa a ser
      V/V.
    - **Efecto colateral útil:** al dejar la nota 12 en Sol M, la decisión 101 destapa que
      la lista de acordes de A3-8 **no tiene `II|65d`** —la V/V en primera inversión, que es
      justo el modelo de ese fragmento—. Antes quedaba tapado porque la nota vivía en Re M,
      donde se leía `V|65d`, que sí está. El modelo se respeta igual; queda para decidir si
      se añade a la lección.

104. **Los renglones, por bloques de tonalidad** (25/9/2026, Diego: «esto es un galimatías
    tal y como está; por ejemplo, las dos funciones tonales juntas no se terminan de
    entender»). **Sustituye a la decisión 93.** De arriba abajo:

    | renglón | qué | |
    |---|---|---|
    | 1 | **Cifrado** | común a todas las tonalidades |
    | 2 · 3 · 4 | **Función · Fundamental · Tonalidad** | tono de partida |
    | 5 · 6 · 7 | **Función · Fundamental · Tonalidad** | tono de llegada |

    - **El principio es de Diego**: arriba, una sola vez, lo que no cambia con el tono —la
      cifra—; debajo, un bloque cerrado por tonalidad. Antes la función iba sola arriba del
      todo y en el pivote se partía en dos casillas apiladas, y los grados se partían otra
      vez más abajo: dos funciones apiladas arriba y dos grados apilados abajo, sin manera
      de saber qué iba con qué.
    - El mecanismo de **un renglón por tonalidad** (decisión 83) ya existía para los grados;
      ahora gobierna también la función y la tonalidad. Un bloque por renglón, y los tres
      renglones de dentro son opcionales: el bloque se encoge en las fichas sin funciones,
      sin grado o sin fila de tonalidad.
    - **La casilla del grado ya no se estira** hasta la de abajo: cada lectura vive dentro
      de su bloque. Las **dos barras verticales** del pivote pasan a abarcar los bloques
      enteros —de la función del de arriba a la tonalidad del de abajo—, que es lo que se
      lee dos veces.
    - **Las casillas de tonalidad vacías que no se responden ya no se dibujan.** Repartidas
      por los bloques llenaban la página de recuadros huecos; cuando la tonalidad viene
      dada, solo se dibujan las notas donde se declara una.
    - **El orden de las flechas ↑ ↓ sigue al de la vista**: cifra · función · grado ·
      función₂ · grado₂.
    - **Un fallo viejo, de paso:** la casilla de cifra decidía si la casilla activa era otra
      de la misma nota con una lista —`romano`, `romano2`, `funcion`, `tonalidad`— en la que
      faltaba `funcion2`, que llegó con la decisión 95. Al bajar a la función del segundo
      bloque se encendían dos casillas a la vez. Ahora la pregunta es al revés
      (`estado.campo !== 'cifra'`), que no se queda corta cuando aparezca un campo nuevo.
    - **Y una fuga que esto destapó.** El reparto en renglones salía de las tonalidades
      VERDADERAS del ejercicio, no de la lectura del alumno. Mientras era un renglón más de
      grados apenas se notaba; convertido en un bloque entero, abrir un bloque nuevo en la
      nota 2 le estaba diciendo al alumno que ahí hay una modulación —que es justo lo que
      se le pregunta cuando la tonalidad va en modo «pedir»—. Ahora el reparto usa
      `estado.tonalidadesNota`, que es la lectura del alumno, igual que hacen los
      circulitos de grado desde la decisión 56. Comprobado: con la tonalidad pedida se
      dibuja **un solo bloque**; con la tonalidad dada, los dos con sus rótulos.

105. **El rótulo de cada paleta, a la izquierda de las teclas** (25/9/2026, Diego: «para no
    ocupar tanto espacio vertical… de manera que título y botones de selección queden en el
    mismo renglón, aunque Función tonal ocupe dos renglones»). Cada paleta se ahorra así un
    renglón entero, y son tres o cuatro. El rótulo va en una columna de 7,2 rem, alineado a
    la derecha contra las teclas y centrado sobre ellas; puede ocupar dos líneas —«Grado de
    la fundamental» las ocupa, «Tonalidad nueva desde la nota activa», tres— sin dejar de
    compartir renglón. **Medido: las cuatro paletas pasan de 431 a 292 px, 139 px menos.**
    En pantalla estrecha el rótulo vuelve arriba: allí lo escaso es el ancho, y 7 rem de
    rótulo a la izquierda se comerían dos teclas de cada fila.

106. **Las filas vuelven a ser bandas, con otro orden** (25/9/2026, Diego, tras verlo en
    pantalla). **Deja sin efecto la decisión 104 y sustituye a la 93.** De arriba abajo:

    | | |
    |---|---|
    | **Cifrado** | una banda |
    | **Fundamental** | una banda, con un renglón por tonalidad (decisión 83) |
    | **Función** | una banda, que se dobla si algún pivote lleva sus dos lecturas |
    | **Tonalidad** | una banda |

    - El reparto en bloques por tonalidad (104) resolvía la confusión de las casillas
      apiladas, pero repetía el renglón de función y el de tonalidad una vez por tonalidad
      y crecía demasiado a lo alto. Diego lo probó y prefiere las bandas.
    - Lo que sí queda de aquella revisión es **el orden**: la cifra arriba, pegada a la
      música, y debajo lo que se deduce de ella —la fundamental, su función y el tono—.
      Antes la función iba arriba del todo.
    - En el pivote, cada casilla se parte en dos dentro de su propia banda, unidas por las
      dos barras verticales.
    - Las flechas ↑ ↓ recorren cifra · fundamental (y su segunda lectura) · función (y la
      suya).
    - **Se conservan las dos correcciones que salieron con la 104:** la casilla de cifra ya
      no se enciende a la vez que `funcion2`, y el reparto en renglones sale de la lectura
      del alumno, no de las tonalidades verdaderas, para no delatar la modulación.

107. **Los números de las paletas, y el orden de las cifras** (25/9/2026, Diego).
    - **Función tonal:** el número de cada tecla es el GRADO que da nombre a la función —
      **tónica 1, subdominante 4, dominante 5**— en vez del sitio que ocupa el botón. Así
      la tecla se aprende sola. La dominante de la dominante lleva el **2**, que es el
      grado sobre el que se construye.
    - **Grado de la fundamental:** el número es el del grado (I = 1 … VII = 7), que ya era
      así desde la decisión 90; el V/V, que no es grado de la escala, se queda con el 8.
    - **Cifrados:** se ordenan por familias y, dentro de cada una, por inversiones:
      `— · 6 · 6/4` (tríadas) · `7/+ · 6/5̸ · +6 · +4` (dominante) · `7 · 6/5 · 4/3 · 4/2`
      (séptima diatónica), y el `9` cierra. El orden lo pone `Ejercicios.ordenarCifras` al
      PINTAR la paleta, no el orden en que esté guardado el repertorio de cada lección: así
      las fichas ya repartidas y los bancos viejos también salen ordenados. Con once cifras
      a la vista la última se queda sin tecla, porque los atajos son 1…9 y 0.

108. **El pivote se rellena entero antes de pasar al acorde siguiente** (25/9/2026, Diego).
    Con la tonalidad **dada** ya era así: el salto automático recorre `funcion · funcion2 ·
    romano · romano2 · cifra` y solo entonces cambia de acorde (comprobado en armonización
    de bajo con y sin funciones, y en análisis).
    - Lo que fallaba era con la tonalidad **pedida**. Ahí el acorde no es pivote hasta que
      el alumno declara la modulación, así que hasta ese momento tiene una sola lectura.
      Al marcarla, `marcarTonalidad` movía el foco mirando **solo el grado** —«si ya está
      el romano, al romano2»—, de modo que con las funciones pedidas la **segunda función
      se quedaba sin visitar** y el salto se iba al acorde siguiente con el pivote a
      medias.
    - Ahora, al marcar la tonalidad, el foco va a la primera casilla de ESA nota que quede
      por rellenar, en el mismo orden en que se rellenan. Comprobado: rellenar del tirón
      hasta la nota 2, marcar allí la tonalidad nueva y seguir da
      `funcion2 → romano2 → cifra` antes de cambiar de acorde.

109. **El nombre de la ficha en la hoja de calificaciones** (25/9/2026, punto 9 de la
    bitácora). Al mirarlo apareció un fallo que no estaba anotado: el nombre automático se
    construía con los fragmentos **que le habían tocado a ese alumno**, y el sorteo es
    distinto para cada uno. En una ficha de varias lecciones, a un alumno le salía
    «2 lecciones · Armonización de bajo · 6 ejercicios» y a otro «3 lecciones · …»: **dos
    filas distintas para la misma práctica**, que es justo lo que rompe la agrupación del
    Cuaderno.
    - Ahora el nombre automático sale del **filtro**, que es el mismo para todos, y lleva
      pegado un **código de cuatro caracteres** sacado de ese filtro, para que dos fichas
      de la misma lección, tipo y tamaño —la de esta semana y la de la siguiente— no se
      confundan. Comprobado: tres aperturas de la misma ficha dan
      `A3-5 · Armonización de bajo · 6 ejercicios · y0e9`, idéntico; cambiar el tipo, el
      tamaño o la lección cambia el código.
    - El título del profesor sigue mandando sobre todo lo anterior, y al generar el enlace
      **sin título** el configurador lo avisa, diciendo con qué nombre va a salir.

110. **El reparto de tonalidades, por rotación y no por sorteo** (25/9/2026, Diego). La
    tónica sale ahora de la **posición** del fragmento en la ficha y no de un revoltijo de
    su identificador: se recorre la lista de tónicas en orden, empezando por donde diga la
    semilla, de modo que **no se repite ninguna mientras queden libres**. Antes, con 7
    tónicas y 8 ejercicios, repetía más de la cuenta (en una prueba, 3 de 8 en Mi♭ M);
    ahora, 0 repeticiones.
    - Lo que se puede anticipar deja de ser «qué tono le toca a cada fragmento» y pasa a
      ser **la vuelta entera**: el 1.º en este tono, el 2.º en este otro… El configurador
      la enseña así, con los dos modos en cada sitio, porque el fragmento que caiga ahí
      decide con cuál de las dos listas se cuenta.
    - Sigue siendo determinista: el mismo enlace da siempre lo mismo, y una ficha a medias
      se reanuda en los mismos tonos.

111. **En el móvil, la leyenda de cada paleta también a la izquierda** (25/9/2026, Diego:
    «ocupa muchísimo espacio… media pantalla en vertical y prácticamente toda en
    apaisado»). Las paletas fijas abajo llevaban todavía la disposición vieja, con el
    rótulo en su propia línea encima de las teclas. Ahora van como en la pantalla grande
    —rótulo a la izquierda, en el mismo renglón que las teclas— y con el **texto corto**:
    FUNCIÓN · GRADO · CIFRADO · TONO, en versalitas de .58 rem y una columna de 3,4 rem.
    Medido sobre un ejercicio con las cuatro paletas a la vista:

    | | antes | ahora |
    |---|---|---|
    | Móvil vertical (390×844) | 315 px · **37 %** de la pantalla | 243 px · **29 %** |
    | Móvil apaisado (844×390) | 271 px · **69 %** | 199 px · **51 %** |

    - El rótulo corto no es cosmética: con «Grado de la fundamental» la columna se comía
      el ancho y las siete teclas de grado se partían en dos filas. Con «Grado» caben en
      una, y eso vale un renglón entero.
    - El texto largo y el corto conviven en el HTML (`.etq-larga` / `.etq-corta`) y los
      reparte la media query; no hay JavaScript de por medio.
    - **Un fallo de paso:** la paleta que se destaca salía de una lista de campos en la que
      faltaba `funcion2`, así que en la segunda función del acorde pivote se destacaba la
      de cifrados. Importa más que antes, porque es la misma comprobación que decidiría
      qué paleta enseñar si algún día se enseña una sola.
    - Queda en pie que en apaisado las cuatro paletas siguen siendo la mitad de la
      pantalla. La palanca que falta es **enseñar solo la paleta que toca** —las otras tres
      no sirven en ese momento, porque la casilla activa solo admite lo suyo—, que dejaría
      la barra en unos 47 px, el 12 %. Está sin hacer a propósito: Diego pidió los tres
      renglones a la vista.

112. **El teclado del móvil, a renglón seguido; y la paleta de tonos solo donde hay tono
    que marcar** (25/9/2026, Diego: «los encabezados están bien… reduce el espacio entre
    los renglones de los botones lo máximo que se pueda, quizá ubicándolos adyacentes un
    renglón al siguiente. Y, si el fragmento no modula, no es necesario mostrar los
    botones de tonalidades»). Dos cosas distintas que tiran del mismo hilo:

    - **Renglones pegados.** Cada caja de paleta tenía 1 px de margen y 5 px de relleno
      arriba y abajo, y la barra 10 px de los suyos: 30 px repartidos en hueco. Ahora
      `margin-top: 0` y `padding: 0 3px` en `.paleta-caja`, y `1px 8px 3px` en `.paletas`.
      Lo que separa un renglón del de abajo es el hueco propio de las teclas, y el recuadro
      de la paleta activa queda ceñido a ellas. **No se tocan las teclas**: siguen con sus
      36–40 px de alto, que es lo que las hace pulsables con el dedo.
    - **La paleta de tonos, solo cuando hay modulación.** `tonalidades: 'pedir'` es una
      opción de la **ficha entera**, y en una ficha la mayoría de los fragmentos no modulan:
      en ellos la fila «Tonalidad» no recogía nada y la paleta de tonos ocupaba un renglón
      entero del teclado para nada. Ahora `Ejercicios.tonalidades` devuelve `null` cuando
      la ficha dice `'pedir'` y el fragmento no modula: no hay fila, no hay paleta y el
      enunciado no pide marcar lo que no hay. **No se descubre nada con ello**, porque el
      enunciado ya decía «este fragmento modula» cuando modula, y la tonalidad de partida
      sigue a la vista en la cabecera («Tonalidad: Do mayor»). Donde sí modula, todo
      queda igual: fila, paleta, orden de relleno del pivote (decisión 108) y corrección.

    | | antes (111) | ahora |
    |---|---|---|
    | Vertical (390×844), fragmento que modula | 243 px · **29 %** | 213 px · **25 %** |
    | Vertical, fragmento que no modula | 243 px · **29 %** | 171 px · **20 %** |
    | Apaisado (844×390), fragmento que modula | 199 px · **51 %** | 169 px · **43 %** |
    | Apaisado, fragmento que no modula | 199 px · **51 %** | 127 px · **33 %** |

    - El caso que más gana es el más frecuente: el fragmento que no modula en apaisado, que
      pasa de media pantalla a un tercio y deja ver el pentagrama entero con sus tres filas
      de casillas.
    - Sigue en pie la palanca del punto anterior —enseñar solo la paleta que toca—, sin
      hacer por lo mismo: Diego quiere los tres renglones a la vista.

113. **Lo mismo en los cuatro tipos: el grado que se responde es siempre el de la
    FUNDAMENTAL** (25/9/2026, Diego: «no me convence que en la armonización de bajos se
    indique solo el grado del bajo. Me resulta confuso a mí, que espero poder indicar la
    fundamental del acorde, más les resultará a los estudiantes. Mejor indicar en todos
    los ejercicios lo mismo: tonalidad · función tonal · fundamental del acorde ·
    inversión»). **Deroga las decisiones 90 y 94.**

    Las cuatro filas que pide Diego son las cuatro que ya había; lo que cambia es la
    tercera. De arriba abajo (el orden es el de la decisión 106):

    | fila | qué recoge | quién la pone |
    |---|---|---|
    | Cifrado | la inversión **y la especie**: `6` tríada en primera, `6/5` séptima diatónica en primera, `6/5̸` la de dominante | el alumno, siempre |
    | Fundamental | el grado en **romano**, I … VII, V/V | el alumno, si se pide |
    | Función | T · S · D · DD | dada, pedida o sin fila |
    | Tonalidad | la que rige y dónde cambia | dada, pedida o sin fila (decisión 112) |

    - **Por qué la 90 se cae.** Aquella decisión cambió el análisis armónico por el
      entrenamiento de la regla de la octava: en la armonización de bajo la fila recogía el
      grado de la ESCALA que ocupa la nota del bajo (1 … 7). El precio es el que vio Diego:
      un alumno puede poner *6* sobre el 7.º grado por reflejo, sin saber que ha escrito un
      V6. Pedir la fundamental le obliga a leer la armonía, que es de lo que va la
      asignatura.
    - **Y se podía hacer porque ya se hacía.** La **armonización de soprano** pide la
      fundamental desde siempre, y allí el acorde también lo elige el alumno: la corrección
      juzga el grado **contra la cifra que él mismo ha puesto**, no contra un modelo
      (`cand(pares) = okCifra ? pares.filter(p => p.cifra === cifra) : pares`). La
      armonización de bajo era la única de las cuatro que no lo aprovechaba.
    - **El grado de la escala del bajo no desaparece: deja de ser una respuesta.** Vuelve a
      ser lo que es en los otros tres tipos, el circulito de la decisión 52 sobre la nota,
      con dos estados —`dado` · `oculto`— y la rampa de la decisión 91, que ahora significa
      «puestos en el fragmento 1, quitados en los demás» y vale en los cuatro tipos. Se
      descarta la quinta fila (Diego, preguntado: «solo el circulito»): habría sido un
      renglón más bajo el pentagrama y una paleta más en el móvil, justo después de la 112.
    - **Los dos sistemas de numeración se reparten el trabajo**, como en la escritura
      corriente: **arábigo en circulito** = grado de la escala que ocupa el bajo; **romano
      en la casilla** = fundamental del acorde. Pueden estar los dos a la vez sin
      confundirse.
    - **En el pivote**, la casilla se parte en dos romanos, uno por tonalidad, con la
      maquinaria que ya existía (decisiones 83, 95 y 106): en `A3-8-01` armonizando el
      bajo, `VI` de Do M sobre `II` de Sol M. Comprobado de punta a punta: 7 de 7.
    - **Lo que se simplifica.** Desaparecen `campoGrado`, `gradoDado` y `sinFilaGrado`;
      `gradoDe(ej, p)` devuelve `p.romano` y nada más; `estadoGrados` pasa de tres estados
      a dos; `pideGrado()` en `app.js` es ya solo `estado.pedirRomano`; y se va de
      `partitura.js` el pintado de la «casilla de grado escrita» de la decisión 94. El
      desplegable del configurador queda en dos opciones, sin «auto» ni «pedidos».
    - **Ojo con los enlaces ya repartidos.** Los de armonización de bajo cambian de
      significado: donde pedían el grado del bajo ahora piden la fundamental. `'pedido'` se
      lee como `'oculto'` —que es lo que aquellos enlaces dibujaban sobre el pentagrama,
      nada— y, si lo que se quiere es que no haya fila de grado, ahora se consigue
      desmarcando «pedir el grado», igual que en los otros tres tipos.
    - Comprobado en los cuatro tipos: paleta I … VII, enunciado «el grado de su
      fundamental», lista «Grados en este ejercicio» en romano, circulitos en armonización
      de bajo y análisis, ninguno en audición (el bajo no se ve) ni con `oculto`. Regresión
      en verde: 11 discrepancias de 273 notas, corrección 4 de 4 y 3 de 4, pivote 7 de 7.

114. **El doble sostenido y el doble bemol, y el fallo que escondían** (25/9/2026, Diego,
    eligiendo el punto 1 de «El transporte de tonalidad: lo que queda abierto»). El
    subconjunto de Bravura incrustado tenía **57 glifos** y no incluía 𝄪 (U+E263) ni 𝄫
    (U+E264). Sin esos dos dibujos, `transportarEntrada` descartaba cualquier tónica cuyas
    notas los pidieran, de modo que los topes que Diego había configurado para sus cursos
    —5 alteraciones en 1.º de Análisis / Fundamentos, 7 en 2.º— no llegaban hasta donde
    decían. Ahora el subconjunto tiene **59 glifos** (12 016 bytes en vez de 10 580) y el
    filtro deja pasar todo lo que sea **doble o menos**; el tope real pasa a ser el triple,
    que ninguna tonalidad del configurador produce.

    - **Debajo había un fallo de verdad**, y era mío, de la decisión 102.
      `intervaloEntreTonicas` calculaba los pasos de letra descendentes como `pasos - 7`.
      Está bien mientras las letras sean distintas, pero con **la misma letra** —do → do♭,
      la → la♭, mi → mi♭— `pasos` vale 0 y `0 - 7` metía una octava entera de más: la nota
      salía con **once alteraciones** y el tono entero se descartaba en silencio. Lo
      correcto son los pasos que FALTAN para la octava, en negativo: `-((7 - pasos) % 7)`,
      que para la misma letra da 0. Do♭ M era el caso más ruidoso, 48 de los 101 que
      quedaban.
    - **En el pentagrama** van los signos de verdad, que dibuja Bravura. `glifoAlt` y
      `anchoAlt` pasan de tres alteraciones a cinco, y el doble bemol necesita su medida
      propia: **1,65 espacios** —son dos bemoles pegados— frente a 0,9 del bemol simple.
      Sin ella la nota se le montaba encima.
    - **En el texto**, no. Los caracteres Unicode 𝄪 (U+1D12A) y 𝄫 (U+1D12B) no los tiene
      ninguna fuente de sistema y salían como un cuadradito; incrustarlos en Bravura para
      el texto tampoco valía, porque el 𝄪 ocupa 0,25 del cuadratín y el 𝄫 0,61, así que no
      hay un tamaño que les vaya bien a los dos. `ALT_TEXTO` escribe ahora **♯♯ y ♭♭**, dos
      signos sencillos que tiene cualquier fuente: «fa♯♯3», «si♭♭2».

    | tope de alteraciones | antes | ahora |
    |---|---|---|
    | 2 · 1.º de Armonía | 0 de 660 imposibles | 0 de 660 |
    | 3 · 2.º de Armonía | 1 de 924 | **0 de 924** |
    | 5 · 1.º de Análisis / Fundamentos | 51 de 1 452 (3,5 %) | **0 de 1 452** |
    | 7 · 2.º de Análisis / Fundamentos | 226 de 1 980 (11,4 %) | **0 de 1 980** |

    - Comprobado que el transporte sigue siendo correcto, no solo posible: en los **1 980**
      transportes del banco entero, **cada nota conserva su grado** en la tonalidad nueva
      (0 discrepancias), la alteración más alta que aparece es **doble** y salen las quince
      armaduras, de −7 a +7. En 125 de esos transportes hace falta una doble alteración.
    - Visto en pantalla: `A3-1-15` en **sol♯ menor** dibuja su fa𝄪 con los cinco sostenidos
      de la armadura.

115. **En el móvil, la partitura siempre a su tamaño natural** (25/9/2026, Diego: «si el
    fragmento tiene pocas notas, aparece muy grande y no puede verse bien; sería mejor
    mantener un tamaño algo más homogéneo independientemente del número de acordes, y
    mejor un tamaño que resulte adecuado para fragmentos largos»). El CSS del móvil tenía
    `svg.partitura { min-width: 560px }`, puesto con la decisión 99 pensando en que la
    partitura no se encogiera. Pero un SVG con `viewBox` y `height: auto` **se escala
    entero** al estirarlo: el fragmento corto no ocupaba más sitio, es que crecía.

    | fragmento | ancho natural | en pantalla (antes) | escala | ahora |
    |---|---|---|---|---|
    | `A3-1-01`, 3 notas | 317 px | **560 × 734 px** | **1,77** | 317 × 416 px · 1,00 |
    | `A3-7-03`, 4 notas | 553 px | 560 × 421 px | 1,01 | 553 × 416 px · 1,00 |
    | `A3-3-24`, 17 notas | 666 px | 666 × 416 px | 1,00 | 666 × 416 px · 1,00 |

    - 734 px de alto en una pantalla de 844: el fragmento de tres notas se comía la
      pantalla entera y había que desplazarse para ver las casillas. Ahora **una negra mide
      lo mismo tenga el fragmento 3 notas o 17**, y el alto es idéntico, 416 px.
    - El tamaño que queda es el de escala 1 —un espacio de pentagrama, 10 px—, que es
      justo «el adecuado para fragmentos largos» que pedía Diego: es el que ya tenían y el
      que la decisión 99 eligió para que las casillas siguieran siendo pulsables con el
      dedo. `max-width: none` se queda: el fragmento largo se desplaza en horizontal.
    - `margin: 0 auto` para que el corto quede centrado en su caja y no arrinconado a la
      izquierda, que en apaisado son 828 px de caja para 317 de música.
    - **El escritorio no se toca**: la regla vive dentro de la media query del móvil, y
      allí la partitura ya iba a escala 1.

116. **Una función que no es función: «—»** (26/9/2026, Diego: «hemos de incorporar la
    posibilidad de que un acorde pivote no tenga función tonal —por ejemplo, viniendo de
    Do Mayor, el III como acorde pivote con la menor»; preguntado si eso es propiedad del
    pivote o del grado, responde **«del grado»**). Hasta ahora todo grado tenía función:
    `I, III → T`, `II, IV → S`, `V, VII → D`, `VI → T o S`. El **III** pasa a no tener
    ninguna, y se ve con toda claridad donde Diego lo pone: viniendo de Do M, el acorde de
    mi es el III de Do y el **v natural** de la menor, y ninguna de las dos lecturas es
    una función tonal.

    - Por dentro es `'N'`; escrito, **—**. No vale `null`, que ya significa «sin
      responder», y hacían falta dos cosas distintas.
    - Se ofrece **solo cuando el ejercicio la pide**, como la DD: `FUNCIONES_EXTRA`.
      La tecla lleva el **0** (decisión 107: T = 1, S = 4, D = 5, DD = 2; «ninguna», 0).
    - **Un fallo de paso, y de los que se notan:** `funcionesDelEjercicio` armaba la paleta
      mirando cada nota en la tonalidad que rige, pero en el **pivote** la casilla está
      partida y la de arriba se lee en la tonalidad de PARTIDA (decisión 95). Con el III de
      pivote, la casilla pedía «—» y en la paleta no había ninguna tecla con la que ponerlo.
      Ahora, en los pivotes, también se miran las funciones de la tonalidad anterior.
    - **No mueve nada de lo que ya hay:** medido sobre el banco entero, el III **no aparece
      ni una vez**, ni como respuesta modelo ni como alternativa, en las dos voces de los
      132 fragmentos. El cambio solo afecta a lo que se escriba de A3-9 en adelante.
    - El **VI** se queda como está —T o S según prepare o resuelva—, que es la decisión 88
      y es de Diego. Aquí no se toca.
    - Probado de punta a punta: en `do3 mi3 | la2 mi2 | la2` con modulación a la menor
      desde la nota 2, la paleta sale `T S D —`, el pivote pide **— = D** y la corrección
      da funciones 5 de 5.

    **Queda abierto, y es lo de fondo:** en ese pivote la realización a cuatro voces
    escribe **sol♯**, porque en menor el V lleva sensible y el acorde se lee en la
    tonalidad de llegada. El acorde que suena es mi–sol♮–si, el **v natural**, que la
    aplicación todavía no sabe escribir: `vocesSuperiores` en menor da siempre la forma
    armónica. Mientras no exista ese v, un fragmento con el III de pivote sonará con sol♯
    ahí. La función ya se puede decir; la nota, no.

117. **La numeración del programa: 1 a 19 seguido, y el curso en el prefijo** (26/9/2026,
    Diego, dictando el programa entero). Las lecciones se numeran **del 1 al 19 de
    corrido** —no 1…9 en un curso y 1…10 en el otro—, y el prefijo dice de qué curso son:
    **`A3-1` … `A3-9`** para 1.º de Armonía y **`A4-10` … `A4-19`** para 2.º.

    - **Lo que estaba mal colocado.** «Modulación al V» es la **lección 10**, la primera de
      2.º, y en el banco estaba como `A3-8`, que es el sitio de «Otros usos del IV, IV6 y
      VI». Renumerada: `A3-8` → **`A4-10`**, y con ella los ocho identificadores
      (`A3-8-01` → `A4-10-01`). Quedan libres `A3-8` para la prolongación T – S – T y
      `A3-9` para la serie de sextas.
    - **Ordenar los códigos como texto ya no vale** en cuanto hay dos cifras: `A3-10` caía
      entre `A3-1` y `A3-2`. `Banco.lecciones` ordena ahora por **curso y número, como
      números** (`comparaLecciones`). Se arregla en el código y no rellenando los códigos
      con ceros: el dato se queda legible y el apaño vive en un solo sitio.
    - **La fórmula T – S – T, desactivada hasta la lección 8.** El programa lo dice desde el
      21/9 —«esquema S – D – T» en las lecciones 1 a 7, «esquema T – S – T» a partir de la
      8— pero en el banco **ninguno** de los 132 fragmentos llevaba el campo `formulaTST`, y
      al faltar vale *activada*: un alumno de A3-1 podía contestar I – IV – I y se le daba
      por bueno. Ahora las lecciones 1 a 7 lo llevan en `false` (124 fragmentos) y de la 8
      en adelante queda activada (8).
    - **No invalida nada de lo que hay:** comprobados los **889 enlaces** de las respuestas
      modelo del banco, en las dos voces, **ninguno** usa una subdominante que vuelva a la
      tónica. El cambio cierra una puerta que estaba abierta, no corrige ningún fragmento.

    El programa completo, tal como lo dictó Diego, está en
    `claude/Armonia-programa-de-lecciones.md`.

118. **La lección A4-11, «Modulación al relativo mayor»: el banco pasa a 140 fragmentos**
    (26/9/2026). Diego importó ocho fragmentos nuevos —bajo y soprano, todos en la menor
    con inflexión a Do mayor— y esa copia, la de su navegador, era la **única** que los
    tenía. Fundido: sus ocho `A3-9` pasan a **`A4-11-01` … `A4-11-08`**, que es el sitio que
    les da el programa (lección 11, «La modulación al relativo, uso de los acordes III y
    VI»). Los otros 132 de su archivo eran idénticos a los de aquí, así que la fusión no
    tuvo que decidir nada: se conservan los míos —ya renumerados y con `formulaTST`— y se
    le añaden sus ocho, recalculados.

    - **La lista de acordes de la lección venía mal.** Los ocho llevaban
      `leccionAcordes` de A3-2 —seis acordes: `I|53 I|6 V|53 V|7+ V|6 VII|6`—, no la de la
      lección. Con seis acordes, **seis de los ocho** tenían notas sin cifra posible. Con
      los **23 acumulados** que hereda de A4-10, cinco de ellos quedan limpios de golpe: lo
      que faltaba eran el IV, el II, el VI y el 6/4, no música rara.
    - **Tres necesitaban la etiqueta de modulación.** El sol♮ del modo menor solo tiene
      acorde como dominante del relativo: donde aparece, hay que rotular. Puestas donde el
      pivote es de verdad común a las dos tonalidades (la última nota que todavía admite un
      acorde de las dos): `A4-11-02` nota 1 → Do M y nota 3 → la m; `A4-11-05` igual;
      `A4-11-06`, notas 3 y 12 → Do M y notas 7 y 16 → la m (dos inflexiones, y el pivote
      de vuelta es el la = VI de Do M = i de la menor). Con eso, **cero avisos** en los
      ocho. En el banco ya están; conviene ponerlas también en el `.mscz`, como texto de
      pauta sobre esa nota, para que una reimportación no las pierda.
    - **El III todavía NO entra en la lista de la lección, y no por descuido.** Probado:
      al añadir `III|53` el motor lo construye con la **menor melódica** y sale
      **do–mi–sol♯**, el III aumentado. No es una rareza de laboratorio: en `A4-11-01`,
      melodía, nota 3 (sol♯4) el III aumentado se comió las respuestas del V y dejó el
      compás leído como III – II. La decisión 116 ya dio al III su función «—»; falta que
      `bajoDe`/`vocesSuperiores` lo obliguen a la forma natural —do–mi–sol♮— como ya hacen
      con el bajo del 7.º grado. Hasta entonces, el III se queda fuera del vocabulario y
      **ningún fragmento de A4-11 lo necesita**.
    - **Comprobado:** 140 fragmentos, 0 etiquetas desfasadas, **0 acordes modelo fuera de
      su lección**, **1 053 enlaces** de las respuestas modelo aceptados por el motor, 0
      incoherencias. Sigue habiendo un solo aviso en todo el banco, y es de antes:
      `A3-4-04`, cuya melodía acaba en el 6.º grado (re en Fa mayor) y pediría el VI, que en
      la lección 4 aún no existe.

119. **Por qué falla, y no solo qué falla: la sintaxis explicada también en los bajos**
    (26/9/2026, Diego: «tiene que ser algo útil al alumno, relacionado con la sintaxis y el
    uso de esquemas de acordes, y no tanto que has puesto el II y aquí tocaba el V»). La
    aplicación nunca dice «tocaba el V» —admite cualquier armonización correcta y el modelo
    solo se enseña como referencia—, pero en la armonización de bajo lo único que decía
    cuando el alumno se equivocaba era **«(falla la cifra)»**, que no enseña nada. Ahora da
    el motivo, y el motivo es de sintaxis.

    - **La comprobación del enlace, también en el bajo.** `Reglas.enlaceAlumno` ya sabía
      decir «la subdominante (II) no vuelve a la tónica: va a la dominante», «la sensible
      en el bajo ha de subir a la tónica», «la séptima en el bajo ha de bajar de grado»,
      «el 6/4 cadencial resuelve en V sobre el mismo bajo», «no se vuelve de la dominante a
      la subdominante», «la dominante de la dominante resuelve en la dominante»… pero solo
      se llamaba en la armonización de melodía. Ahora se llama en las dos.
    - **Dos fallos que lo impedían**, los dos por dar por sentado que la nota del ejercicio
      es la de la melodía:
      · `enlaceValido` comparaba esa nota con el bajo del acorde para buscar octavas y
        quintas seguidas. En un bajo dado, esa nota **es** el bajo, así que daba octavas en
        todos los enlaces: **280 de los 531** del modelo salían rechazados. Ahora, si no se
        conoce la melodía, esa comprobación no se hace (la conducción de voces ya la audita
        la realización a cuatro voces).
      · `candidatosSoprano` descartaba por doblado —la séptima, la sensible, la tercera de
        una tríada mayor— cuando la nota dada coincide con el bajo del acorde. Con un bajo
        dado coinciden siempre, de modo que el **I6, el VII6 y el V4/2 no se encontraban** y
        el enlace se saltaba en silencio. Ahora, con la nota en el bajo, esas reglas no se
        aplican; y además el acorde ha de tener **esa** nota en el bajo, no solo contenerla.
    - **El pivote tiene dos lecturas, también para el enlace.** El acorde que estrena el
      tono nuevo suena también en el anterior. El do que abre Sol mayor es su IV, y llegar
      ahí desde la dominante de Do no es volver de la dominante a la subdominante: es
      resolverla. El enlace vale si es correcto en cualquiera de las dos lecturas, igual
      que la función en la decisión 116. Con esto quedó bien `A4-10-08`.
    - **Y por qué no vale la cifra** (`porQueCifra`, `js/app.js`), que es el caso
      frecuente, porque el alumno suele escribir algo que ni siquiera está entre las
      admisibles. Tres respuestas posibles, en este orden, y si ninguna encaja no se
      inventa nada: la cifra **no da ningún acorde** sobre esa nota en esa tonalidad; el
      acorde existe pero **no entra en esta lección**; o es de la lección y la que no anda
      es la **sucesión**, con el acorde de antes o con el de después —y entonces se dice
      con las palabras de la regla—. El final tiene la suya: «el fragmento acaba en
      cadencia o en semicadencia: el último acorde ha de ser la tónica o la dominante, en
      estado fundamental».
    - **No hace falta pedir el grado.** En un bajo dado, la cifra y la nota ya determinan
      el acorde, así que el grado con el que se juzga la sintaxis (`romanoReal`) sale solo.
    - **Comprobado:** simulada la corrección de la respuesta modelo en los **502
      ejercicios** que salen de los 140 fragmentos por los cuatro tipos, **un solo fallo**,
      y es el de siempre: `A3-4-04`, cuya melodía acaba en el 6.º grado. De todas las
      parejas de admisibles del banco, solo **23 combinaciones** rompen la sintaxis: el
      cambio casi nunca convierte en error algo que antes se daba por bueno; lo que hace es
      explicar.
    - Dos respuestas modelo corregidas de paso: `A4-11-07` y `A4-11-08`, nota 3. El motor
      prefería el II4/3 sobre el la del pivote, viniendo de la dominante de la menor; lo
      natural es el **la–do–mi** (I de la menor = VI de Do mayor), que ahora va primero.

120. **La soprano de la realización acaba en la tónica siempre que se puede** (26/9/2026,
    Diego). El último acorde de un bajo que cierra en cadencia es la **posición de
    octava**: la tónica arriba. La tercera deja la cadencia abierta y la quinta, más aún.
    La preferencia ya existía pero era floja —12 puntos frente a la tercera, 25 frente a la
    quinta, cuando mover una voz cuesta un punto por semitono—, así que la comodidad de
    conducción se la llevaba por delante en **7 de los 107** fragmentos de bajo del banco.
    Ahora son 45 y 90: la tónica gana a cualquier ahorro de movimiento y sigue muy por
    debajo de las paralelas (120), que no se admiten nunca por acabar mejor.

    - **Con una excepción, que es la que hacía falta:** el **unísono** en el acorde final
      pasa a costar 60. Sin eso, `A3-7-03` y `A3-7-12` cerraban `la2 · do4 la4 la4`, con
      el contralto y la soprano en la misma nota, solo para poner la tónica arriba. Ahora
      cierran `la2 · do4 mi4 la4`, el acorde completo y con la tónica en la soprano.
    - El acorde **incompleto** sí se admite: `A3-7-09` acaba `do3 · do4 mi4 do5`, sin la
      quinta, que es la resolución de manual del V6/5 y no un defecto.
    - **Comprobado:** los **107** fragmentos de bajo que acaban en el I en estado
      fundamental acaban ahora con la tónica en la soprano (antes, 100). Cero paralelas en
      todo el banco; en el corpus, cero paralelas en las tres posiciones iniciales, cero
      séptimas mal resueltas y cero sensibles dobladas. El salto de la soprano al acorde
      final sube de 1,16 a 1,21 semitonos de media: la línea sigue andando por grados.
    - Los 19 fragmentos que acaban en **semicadencia** no se tocan: ahí no hay tónica que
      poner.

121. **La explicación hablada de los errores** (26/9/2026, Diego). Al corregir, el
    ordenador puede **leer en voz alta** por qué falla cada nota. Lo hace el sintetizador
    del propio navegador (`js/voz.js`, Web Speech API): gratis, sin conexión, sin clave y
    sin servidor, con las voces en español que el alumno ya tiene en su Mac, su iPad, su
    móvil o su PC. Funciona igual en GitHub Pages que abriendo el archivo.

    - **No hay ningún modelo de lenguaje detrás, y es a propósito.** El motor ya sabe por
      qué falla cada nota —qué función sigue a cuál, cómo resuelven la sensible, la
      séptima y el 6/4 cadencial (decisión 119)—, y eso es más exacto que cualquier
      redacción improvisada. Además, un modelo exigiría una clave de API y un servidor, y
      en una página estática la clave quedaría a la vista de cualquier alumno.
    - **Qué lee:** cuántas notas están bien; si el cambio de tonalidad está mal marcado;
      nota por nota, el motivo —el de la sintaxis, no «tocaba el V»—; y los avisos de
      conducción de voces. Hasta cinco notas y tres avisos, y luego «y N más», para que no
      se haga interminable. **No lee la respuesta modelo**: cantarle la solución mientras
      todavía puede reintentarlo sería contraproducente; el modelo lo tiene en pantalla
      cuando pulsa «Ver la solución».
    - **Lo que se dice no es lo que se escribe.** `Voz.comoSuena` traduce: «sol♯3» → «sol
      sostenido» (la octava se calla), «II» → «segundo grado», «V/V» → «dominante de la
      dominante», «6/5̸» → «seis cinco tachado», «6/4» → «seis cuatro», «+6» → «más seis»,
      «—» → «en estado fundamental». Los nombres de las cifras habladas están en una tabla
      al principio de `js/voz.js` y se cambian ahí en una línea.
    - **Cuidados:** la voz se elige en español (es-ES primero, y de preferencia una
      instalada en el aparato; si no se elige, el sistema lee el español con acento
      inglés); la lista de voces llega tarde, así que se escucha `voiceschanged`; Chrome
      corta las frases largas a los ~15 segundos, así que el texto se parte en frases y se
      encolan varias; y el instrumento se para antes de hablar, para que no se pisen (Esc
      y «■ Parar» detienen las dos cosas).
    - **La casilla «leer los errores»** aparece solo si el navegador tiene sintetizador, se
      recuerda entre sesiones y **no se enciende sola**: en el iPhone y en el iPad la voz
      solo arranca después de que el alumno toque algo, y empezar a hablar sin que nadie lo
      haya pedido asusta más que ayuda. Con la casilla apagada sigue estando el botón
      **«▶ Leer los errores»** en el recuadro de la corrección, que además detiene la
      lectura si se vuelve a pulsar.

122. **El esquema de lo que ha escrito el alumno, y el nombre de su cadencia**
    (26/9/2026, Diego). Al corregir, dos datos más: la **cadena de funciones** de SU
    armonización —`T – S – D – T`, que es como se ve de un vistazo si la sintaxis anda— y
    el **nombre de la cadencia** con la que cierra. Es un espejo, no la solución: el
    esquema del modelo no se enseña, porque eso sería cantársela.

    - **Los acordes de dos funciones se leen por el contexto.** El VI es tónica o
      subdominante (decisión 88): en la cadena sale **S** si va a una dominante y **T** si
      viene de ella. El 6/4 cadencial sale **D**, que es lo que es.
    - **Una barra donde cambia el tono.** En un fragmento que modula, las funciones de
      después no son del mismo tono que las de antes, y sin la marca el esquema engaña:
      `T – D – T | D – T – D – T | S – D – T…`
    - **Los nombres de cadencia** salen de los dos últimos acordes: *cadencia auténtica*
      (V o V7 en estado fundamental → I), *auténtica con VII6*, *cadencia plagal*,
      *semicadencia*, *semicadencia frigia* (IV6 → V en menor), *cadencia rota* (dominante
      → VI o IV6), y, cuando no es ninguna cosa de esas, una descripción sin nombre:
      «acaba en la tónica, con la dominante invertida» o «acaba en la tónica en primera
      inversión».
    - **Medido sobre los 126 fragmentos de bajo del banco**, con su respuesta modelo: 89
      cadencias auténticas, 18 que acaban en la tónica con la dominante invertida y 10 en
      el I6 —las dos cosas son de A3-2 y A3-3, donde las inversiones del V y del V7 son
      justamente la lección—, 8 semicadencias y **una semicadencia frigia**, `A3-6-11`
      (IV6 – V en sol menor), que ya estaba en el banco sin saberlo. Ninguno se queda sin
      nombre.
    - La voz (decisión 121) lo lee también, con las funciones dichas enteras.

123. **La tónica final puede ir en primera inversión** (26/9/2026, Diego). En la
    armonización de soprano, la última nota admitía solo el estado fundamental, y eso
    dejaba fuera un final perfectamente escribible: el **I6**. Ahora la nota final admite
    **I 5/3 y I 6** —la cadencia auténtica imperfecta por inversión, que es lo que quiere
    un fragmento que no cierra del todo—, y la dominante de una semicadencia sigue
    admitiendo solo el estado fundamental. La **respuesta modelo no cambia**: el estado
    fundamental lleva un pequeño recargo a favor, de modo que el I6 queda admitido pero
    nunca es el modelo. El acorde inicial ya admitía las dos cosas.

124. **Los acordes de la lección, siempre a mano y plegados** (26/9/2026, Diego). La
    rejilla de acordes por función tonal —la que decide qué acordes autoriza una
    lección— solo se veía en la armonización de soprano, y sin embargo gobierna los dos
    tipos de ejercicio: es el inventario que el alumno ve («En este ejercicio entran») y
    lo que la corrección admite. Ahora está **siempre**, dentro de un plegable
    «Acordes de la lección» que muestra en el rótulo cuántos hay marcados, y se abre solo
    cuando el ejercicio es de soprano.

    - **Faltaban las cuatro inversiones del IV7.** El catálogo tenía las del II7
      (`II|7`, `II|65`, `II|43`, `II|42`) pero del IV solo el 5/3 y el 6. Al revisar un
      fragmento de A3-7, los cuatro acordes de IV7 que el banco sí guarda no tenían
      casilla donde marcarse — y «Dar a esta lección el repertorio de arriba» los habría
      borrado sin avisar. Añadidos `IV|7`, `IV|65`, `IV|43` y `IV|42`, desmarcados por
      defecto, con su nota sobre qué grado del bajo lleva cada inversión.

125. **El esquema de funciones lo firma el mismo juez que la partitura** (26/9/2026,
    Diego). La cadena de funciones que se muestra al corregir (decisión 122) se calculaba
    con una regla propia, escrita en `js/app.js`: subdominante solo si el acorde siguiente
    era dominante. Con eso, el **VI que va a otra subdominante** —I – VI – II – V, que es
    el caso corriente— salía como **tónica**, en contra del criterio de Diego (decisión
    88: subdominante es toda sonoridad que prepara la dominante, aunque entre medias haya
    otra), y además **el esquema podía contradecir a las etiquetas escritas bajo las notas
    del propio fragmento**, que sí salen de `Teoria.funcionDe`. Ahora la cadena llama a
    `Teoria.funcionDe` con el acorde que el alumno ha escrito y sus dos vecinos: un solo
    juez para la partitura, el motor y el esquema. Comprobado: I – VI – II – V – I da
    `T – S – S – D – T`, y la cadencia rota V7 – VI sigue dando `T – D – T`.

126. **En un reintento se puede tocar todo, también lo acertado** (26/9/2026, Diego).
    Al pulsar «Corregir los errores», las casillas acertadas quedaban **fijas** y solo se
    podían editar las erróneas. Eso dejaba callejones sin salida: una nota tiene dos
    casillas —fundamental y cifrado— y a veces el error de una **solo se arregla tocando
    la otra**. Con la fundamental acertada y el cifrado mal, no había manera de escribir
    un cifrado que pertenece a otra fundamental. Ahora **nada se bloquea**: el verde dice
    «esto ya estaba bien», no «esto no se toca», y el alumno puede cambiar cualquier
    casilla, la tonalidad del pivote incluida, antes de volver a corregir.

    - En el estado interno, `bloqueadas` pasa a llamarse `acertadas`, que es lo que
      siempre fue; las casillas acertadas se pintan en verde pero sin la clase `fija`,
      de modo que conservan el cursor y el foco.
    - La navegación automática no cambia de criterio: al avanzar sigue saltando a lo que
      **no** está acertado, para que el camino corto lleve a los errores.
    - El aviso pasa a decirlo: «En verde, lo que ya estaba bien; en rojo, lo que hay que
      cambiar. Puedes tocar cualquier casilla —también las verdes».

127. **La ficha se mide en compases, no en número de ejercicios** (26/9/2026, Diego).
    Pedir «ocho fragmentos» reparte mal el trabajo: uno de ocho compases da la faena de
    tres de tres. Ahora el filtro puede llevar `compases: [min, max]` —un presupuesto de
    compases para toda la ficha— y `Banco.elegir` va tomando fragmentos barajados hasta
    llegar al mínimo sin pasarse del máximo; el que no quepa se salta y prueba con el
    siguiente. Así entran más fragmentos si son cortos y menos si son largos, y la ficha
    dura lo mismo.

    - `n` deja de mandar y queda como **tope** de ejercicios, por si el presupuesto diera
      para una lista interminable de fragmentos de dos compases.
    - Sin `compases` en el filtro, todo sigue como antes: los `n` primeros.
    - El configurador pide el rango en dos casillas, «Compases por ficha, de … a …».
      Con el mínimo en 0 se desactiva y vuelve a mandar el número de ejercicios.
    - Los compases de un fragmento los da su etiqueta; si faltara, se cuentan las voces
      escritas (`Banco.compasesDe`).
    - Tamaños de las hojas de tema: análisis 20–26 compases; audición, armonización de
      bajo y de soprano, 14–18. En las lecciones de cuatro compases eso son seis
      fragmentos de análisis y cuatro o cinco de los demás.

128. **Lo impreso no lleva la dirección del ejercicio, sino un código** (26/9/2026,
    Diego). Los códigos QR del cuadernillo apuntan todos a `f.html#<código>` —por
    ejemplo `f.html#a34-cifrar`—, y es esa página la que traduce el código y manda al
    alumno a donde toque. Nace de dos preguntas suyas seguidas: si los QR se leerán bien
    en papel, y si las direcciones seguirán valiendo cuando cambie la aplicación.

    - **El papel no se corrige.** Con la dirección larga metida en el QR, cualquier
      cambio en el filtro, en el código de una lección o en la dirección de un ejercicio
      de fuera dejaba muertas las hojas repartidas. Ahora lo que cambia es `f.html`.
    - **Y se lee mejor.** La dirección pasa de 233 caracteres a 52: el símbolo baja de la
      versión 16 —81 módulos— a la 6 —41—, de modo que a 22 mm el módulo mide 0,49 mm en
      vez de 0,235. Simulando la impresión con 0,25 mm de ganancia de tinta, el QR viejo
      deja de leerse y el nuevo se lee sin problema.
    - `f.html` lleva tres tablas: las lecciones por su código corto (`a34` → `A3-4`), los
      cuatro tipos de ejercicio con su página y su presupuesto de compases, y las
      direcciones de los ejercicios de musictheory.net. **Un código ya impreso no se
      borra nunca**; si algo cambia de sitio, se cambia su destino.
    - Un código desconocido no deja una pantalla en blanco: la página lo dice y ofrece la
      portada.
    - El tamaño de la ficha en compases (decisión 127) pasa a vivir en `f.html` para las
      fichas impresas; el configurador lo sigue teniendo para las que genera Diego.

129. **Tres reglas más de conducción, y el cierre conclusivo del todo** (27/9/2026,
    Diego). Nacen de un fragmento que le salió mal al motor y que él describió como
    «desastrosa»: la soprano llegaba a la séptima por salto, saltaba una quinta sin
    compensarla y remataba con una séptima ascendente. Las tres primeras reglas viven en
    `costeTransicion` y en `Realizacion.auditar`; la cuarta amplía la decisión 120.

    - **La séptima se prepara, o se alcanza por grado conjunto; nunca por salto directo.**
      Lo ideal es que la nota venga ya sonando en el acorde anterior —se oye entonces como
      un retardo—; en su defecto, que se llegue a ella por segunda. *Excepción, la que
      hacen los tratados:* la séptima menor de la dominante, que el oído da por conocida.
      Sin esa excepción, `II6/5 – V7` no tiene solución a cuatro voces.
    - **La novena va por encima de la sensible.** En el acorde de novena la tercera —la
      sensible— ha de sonar **debajo** de la novena; al revés chocan en segunda con la
      sensible arriba y esa nota pierde su tendencia. La excepción es que la novena venga
      preparada del acorde anterior, y eso se mira en el enlace, no en la disposición.
    - **El salto grande se compensa.** Una voz que salta una quinta o más ha de volver
      después por grado conjunto —o por tercera— **en sentido contrario**. La séptima
      melódica no se admite en ningún caso. El coste del salto crece de prisa a partir de
      la cuarta, y la pauta avisa del salto sin compensar nombrando la voz y las dos notas.
      Solo se miran las tres voces superiores: el bajo lo da el fragmento.
    - **El cierre conclusivo, ampliado (decisión 120).** «Se ha de tender, si es posible, a
      terminar la melodía de la soprano sobre la tónica y, en su defecto, sobre la 3.ª del
      acorde de tónica.» Así que la quinta arriba deja de ser una opción cómoda: pasa de 90
      a **110** puntos, y la tercera baja de 45 a **30**, que es lo que significa «en su
      defecto». Y la regla vale ahora para **cualquier inversión** del acorde de tónica, no
      solo la fundamental: lo conclusivo es la nota con que acaba la melodía, no el bajo.
      Los tres números siguen por debajo de las paralelas (120), que no se admiten nunca
      por acabar mejor.

    - **Comprobado**, banco entero (126 fragmentos × 3 posiciones iniciales = 378
      realizaciones del propio motor, que es lo que el alumno ve en el modo Análisis):
      las que incumplen algo de la pauta bajan de **47 a 28**; los cierres sobre la quinta,
      de **11 a 0** (319 sobre la tónica, 32 sobre la tercera). En el corpus, cero séptimas
      mal resueltas, cero sensibles dobladas, ninguna abertura mayor de octava y los 105
      finales sobre la tónica. Los 59 prototipos de los cuadros impresos siguen pasando la
      pauta.

130. **Las tres tintas de las funciones tonales** (27/9/2026, Diego). Tres funciones, tres
    tintas, **y la tónica lleva la suya**:

        T  azul pizarra  #33588C      S  ciruela  #7A4E7D      D  oro  #8F6A0E

    - **Por qué la tónica va marcada.** Se probó dejarla sin marca —el reposo como
      ausencia— y se cae por dos sitios. Musicalmente, en un lenguaje de tensión y
      relajación la relajación es un estado, no la falta de uno. Y técnicamente, «sin
      marca» ya estaba ocupado: el III **no tiene función tonal** (decisión 116) y se
      escribe «—». Con la tónica sin tinta, tónica y «ninguna función» se dirían igual.
      **El III es el que no lleva banda**, y esa ausencia ahora significa una sola cosa.
    - **Por qué estas tres.** El verde del acierto (145°) y el carmín del error (3°) son de
      la CORRECCIÓN y no se tocan. Antes la dominante era una terracota a **12°** del
      carmín —una dominante se leía como un fallo— y la subdominante un verde oliva a
      3,52:1 de contraste, por debajo del mínimo de 4,5. Ahora la más cercana a la
      corrección es el oro, a 40° del carmín, y los contrastes son 6,89 · 6,26 · 4,75:1.
      Entre sí, la pareja más próxima queda a 81°.
    - **La dosis: el color es una anotación, no un relleno.** La casilla se queda neutra y
      el color vive en la LETRA y en una BANDA FINA debajo (`.banda-fun` en la partitura,
      `border-bottom` de 3 px en las teclas). Teñir la casilla entera era lo que daba el
      aire de pegatina, y le quitaba a la corrección el único sitio donde puede hablar sin
      competir. La casilla **dada** también pasa a ser neutra: que venga resuelta lo dice
      el borde entero, no un relleno ámbar encima de la tinta que hay que leer.
    - **Cómo crece con el cromatismo, que es lo que había que dejar resuelto antes de que
      llegue: no se añaden tintas, se añade TRAZO.** Una V/V es una dominante y una
      napolitana una subdominante, pero **de otro tono**, no del tono en que se está; así
      que llevan la tinta de su familia con la **banda partida**. El alumno ve de qué
      familia es antes de saber cómo se llama, y dar de alta un grado en
      `Teoria.SECUNDARIAS` no estrena color. Se descartó distinguirlas bajando la
      intensidad de la misma tinta: una tecla más pálida ya significa otra cosa aquí
      —`.tecla:disabled` va al 45 % de opacidad— y se leería como «no disponible» en vez
      de «prestada de otro tono».
    - El **VI** conserva las dos funciones: media banda de tónica y media de subdominante.
    - **Comprobado** con los estilos ya calculados en el navegador: I azul, II y IV
      ciruela, V y VII oro, III sin banda y con la letra en tinta, VI con la banda partida
      en dos mitades, y la DD con la banda discontinua en oro. Ningún error de consola.

131. **La cabecera de la aplicación, y dos colores con dos oficios** (27/9/2026, Diego).
    La pantalla pasa a tener **carrocería**: una barra en negro ciruela `#241630` con el
    nombre y los tres destinos, y debajo una banda a sangre en **morado eléctrico
    `#B026FF`** que dice en qué estás y por dónde vas. El contenido se centra dentro de
    `.envoltorio`; las dos franjas van de borde a borde. Es lo que separa una aplicación de
    un documento: el documento empieza en su título, la aplicación tiene cabecera.

    - **De dónde sale.** De mirar Auralia, que es adonde apunta la hoja de ruta. Su color
      fuerte **no está repartido**: hay una barra casi negra, UNA banda saturada que
      identifica la sección y, debajo, todo neutro. La sensación de eficiencia viene de que
      el color es escaso, saturado y está en un solo sitio.
    - **Por qué un color CLARO y con el texto según toque.** El verde de Auralia es
      `#89E334`: 76 % de saturación y **55 % de luminosidad**. Los primeros candidatos que
      se probaron rondaban el 40 % de luminosidad —colores oscuros— y por eso sonaban
      apagados. Sobre su verde el blanco da 1,60:1 y la tinta 11,80:1: por eso su rótulo va
      en oscuro. El `#B026FF` cae del otro lado (blanco 4,60:1) y lleva el texto en blanco.
    - **Por qué la barra es negro CIRUELA y no un grafito neutro.** Con la barra `#111419`
      el salto de luminancia con la banda era de **2,78:1** —dos bloques oscuros pegados,
      sin jerarquía— cuando en Auralia ese salto es de 10,15:1. El problema no era solo la
      luminancia: un gris azulado neutro y un magenta saturado no se conocen de nada. El
      `#241630` está a 272° de tono, la familia del morado, así que la banda parece **salir
      de** la barra en vez de aterrizar encima. Por lo mismo, el fondo general se tiñe a
      `#faf8fc`: si la cabecera es de la familia y el fondo no, el problema cambia de sitio.
    - **Dos colores, dos oficios.** `--marca` (el morado) es identidad y llamada a la
      acción: la banda, la pestaña en la que estás y el botón «Corregir». Nada más.
      `--acento` (el negro ciruela) son los estados de TRABAJO: la casilla que se está
      rellenando, la posición elegida, las casillas de verificación, el foco del teclado.
      Hay un motivo medido además del de jerarquía: sobre papel blanco el morado da 4,60:1
      y el ciruela 17,04:1, y el contorno de la casilla activa —que se mueve con cada
      nota— en morado quedaría flojo. El verde del acierto y el carmín del error no los
      toca ninguno de los dos.
    - **Qué transmite, dicho sin adornos.** Un magenta violeta saturado es el color del
      neón y del directo —el morado de Twitch es `#9146FF`—, así que el alumnado de 14 a 18
      lo lee como territorio propio, que es exactamente el encargo: que la puerta de
      entrada atraiga en vez de aburrir. A cambio, lee más a producto personal que a
      herramienta institucional y envejecerá antes que un neutro. Se asume, y **vive en una
      sola variable**: cambiarlo es una línea. Más adelante se podrá elegir entre varios.
    - **El sepia que quedaba escondido.** Cambiar `--acento` no bastó: había marrones
      ESCRITOS A MANO que no salían de ninguna variable y por eso sobrevivieron. Eran tres
      focos: el viejo `rgba(122, 74, 31, …)` —entre otros sitios, en el recuadro de la
      paleta activa, que en el móvil es lo más visible de la pantalla—; un ocre
      `rgba(160, 120, 60, …)` repartido por los plegables del configurador; y unos beiges
      que estaban puestos **de reserva** de variables que no existen (`var(--borde,
      #d8d0c4)`, `var(--fondo-suave, #faf7f2)`), de modo que la reserva era justo lo que se
      veía. Todos pasan a la familia ciruela o a `var(--linea)`. El semáforo del
      configurador conserva sus luces —verde, ámbar y rojo son ahí el significado— pero
      pierde los fondos crema.
    - **Comprobado** en las cuatro pantallas reales —alumno, estructuras, cifrados y
      configurador— y en el móvil apaisado: ningún error de consola, la corrección sigue
      marcando bien y mal, los atajos responden y la anchura de la partitura no varía.

132. **Las tres funciones, en color plano; la corrección, por forma** (28/9/2026, Diego).
    Sustituye a la decisión 130.

        T  azul #0B5CD5        S  rojo #D62828        D  amarillo #F2C200

    - **De dónde salen.** De Kandinsky, en *De lo espiritual en el arte*: el azul es un
      movimiento hacia dentro, profundo y quieto —lo emparenta con los instrumentos
      graves—; el amarillo, uno hacia fuera, agudo y punzante, próximo a una trompeta
      estridente; el rojo, una fuerza firme que se sostiene sin dispersarse. Llevado a la
      armonía: azul el reposo (tónica), amarillo lo que empuja y necesita resolver
      (dominante) y rojo la fuerza intermedia que prepara (subdominante). Nótese que
      invierte la atribución intuitiva: el amarillo va a la dominante, no a la subdominante.
    - **Por qué en BLOQUE y no en anotación fina.** El amarillo saturado da **1,85:1** sobre
      blanco: como letra es ilegible. Con colores vibrantes la dosis se invierte —se pinta
      el bloque y la letra va en el contraste que le toque, blanco sobre azul y rojo, tinta
      sobre amarillo—, que es además el color plano que se buscaba.
    - **La rueda estaba llena, y por eso cede la corrección.** Reservando ±30° alrededor de
      cada color con significado, el carmín del error ocupaba 333°–33°, el verde del
      acierto 115°–175° y el morado de la banda 248°–308°: quedaban tres tramos sueltos y
      **no caben tres colores vibrantes bien separados**. No es cuestión de gusto, es
      aritmética. Así que la **corrección deja de usar relleno**: pasa a contorno de 3 px
      más un símbolo ✓ / ✗ en la esquina (`marcaCorreccion`, en `partitura.js`). Con eso se
      liberan el verde y el rojo, y además la corrección deja de depender del color: se lee
      en escala de grises y con cualquier daltonismo.
    - **Cómo crece: no se añaden tonos, se añade TRATAMIENTO**, y el tratamiento significa
      lo mismo en las tres familias. **Pleno** = la función diatónica del tono. **Hueco**
      (contorno grueso, sin relleno) = la función **de otro tono**: la DD y las V/x que
      vengan. **Rayado** = la función **alterada**: préstamos modales, napolitana, sexta
      aumentada. **Sin nada** = sin función tonal (el III). Se descartó distinguirlas por
      intensidad: una superficie más pálida ya significa «no disponible» en esta interfaz.
    - El **VI** sigue partido, mitad tónica y mitad subdominante.

133. **Sobre el color, la letra va en blanco; y la cabecera es la misma en las cuatro
    ventanas** (28/9/2026, Diego).
    - **La avería que lo destapó.** Un `:root` de más al final de `css/estilo.css` —resto
      de las pruebas de escala tonal— redefinía `--marca-texto` con el morado oscuro
      `#7B00C2`. Esa variable es *la tinta de lo que va sobre el morado*: el título de la
      banda, su selector, «Cerrar» y el botón «Comprobar» salían en morado oscuro sobre
      morado eléctrico, en las cuatro ventanas. Se elimina esa redefinición: sobre el
      morado, la letra es **siempre blanca**.
    - **La misma banda en las cuatro ventanas.** Barra en negro ciruela con el logotipo en
      la esquina y la banda en morado eléctrico debajo, con idéntico comportamiento en la
      pantalla del alumno, las dos de ayuda y el configurador. Lo que se salía eran los
      mandos que cada ventana de ayuda se había estilado por su cuenta —rótulos en gris de
      documento sobre el morado, segmentos blancos— y el paso del ratón, que devolvía letra
      oscura. Regla única: **sobre el morado, todo blanco**; lo que se enciende o está
      elegido se va al **negro ciruela**, que es el otro color de la casa.
    - **Los botones, rellenos.** Un botón de contorno claro con letra oscura no se lee como
      botón: parece un rótulo. Todo lo que sea pulsar va relleno en negro ciruela con la
      letra en blanco, y al pasar por encima se enciende en el morado. El morado queda para
      la **acción principal** («Comprobar», «Igualar») y para lo **elegido** (en su versión
      apagada). Quedan fuera, a propósito: las **teclas** de las paletas y del cuadro de
      cifrados —no son acciones, son símbolos musicales, y las de función llevan el color de
      su función (decisión 132)— y los **▶ dibujados dentro de la partitura**, que
      pertenecen al pentagrama. Desaparece la clase `boton-lleno`: ya no hace falta pedir
      lo que es la norma.

134. **Ajustes de la pantalla del alumno** (28/9/2026, Diego).
    - **Fuera el renglón «Tonalidad»** del recuadro de referencia: la tonalidad la dice el
      cifrado del ejercicio o la pone el alumno en la fila de tonalidades, según se marque
      en el configurador; tenerla además escrita ahí la regalaba.
    - **«▶ Tono inicial» pasa a «▶ Escuchar tono»**, en la misma forma que sus dos vecinos.
    - **El aviso del envío sube al enunciado**: «Podrás enviar el resultado al terminar los
      N ejercicios de la ficha» es una condición de la tarea, y debajo de la partitura
      llegaba tarde. El renglón de progreso se queda solo con el número de intento.
    - **«Sonar al elegir» baja con las paletas**: no es una herramienta de audio como
      «Escuchar tono», es lo que hacen esas teclas al pulsarlas.
    - **El informe cuenta ACORDES, no notas**: «4 de 4 acordes correctos». Lo que se juzga
      en cada casilla es el acorde, no la nota del bajo.
    - **Fuera el recuento por casillas** («Funciones: x de n · Grados: y de n · Cifrados: z
      de n»): cada casilla ya lleva su contorno y su ✓ o ✗ en la partitura, así que contarlas
      otra vez era decir dos veces lo mismo. Queda lo que no se ve de un vistazo: enlaces,
      avisos de conducción de voces y cómo fue el primer intento.

135. **La subdominante, amarilla; la dominante, roja** (28/9/2026, Diego).
    Corrige el reparto de la decisión 132, que daba el rojo a la subdominante y el amarillo
    a la dominante. Los tres colores y su papel siguen siendo los mismos; cambia a qué
    función va cada uno:

        T  azul #0B5CD5        S  amarillo #F2C200        D  rojo #D62828

    - La tinta de cada bloque sigue al color: blanco sobre el azul y el rojo, oscuro sobre
      el amarillo. La función **hueca** —la de otro tono, la DD y las V/x— pasa a contorno
      rojo con la letra en rojo oscuro `#9B1C1C`.
    - **El VI, que es mitad tónica y mitad subdominante**, ya no puede llevar la letra
      blanca en sus dos mitades: sobre el amarillo desaparecía. Se dibuja **dos veces**, la
      segunda recortada a la mitad derecha y en tinta oscura, de modo que la «V» sale blanca
      sobre el azul y la «I» oscura sobre el amarillo.

136. **El techo de la soprano: el la5 (el la4 del índice español)** (28/9/2026, Diego).
    La voz superior no se escribe por encima de esa nota, que es el tope clásico de la
    soprano en la escritura a cuatro voces. No es un coste sino un **filtro**: las
    disposiciones que lo pasan ni siquiera se consideran. Solo se cede si con el techo no
    hay **ninguna** disposición posible para el acorde, y aun entonces se prueba antes a
    abrir el trío hasta la novena (que el coste relega) que a subir la soprano.
    - **Medido sobre el banco** (378 combinaciones fragmento × posición, 1 971 acordes): sin
      techo, 15 acordes pasaban del la5 en 8 fragmentos, y el más agudo llegaba al do6. Con
      el techo, **0 acordes por encima** y ninguno se queda sin realizar. El precio son tres
      combinaciones más con aviso de la pauta (de 28 a 31, todas por movimiento directo).
    - En la armonización de **soprano** el techo no interviene: allí la voz superior es la
      melodía que da el ejercicio.

137. **Oscuro solo lo que es una acción; y el reparto de los dos renglones**
    (28/9/2026, Diego). Corrige la decisión 133, que había rellenado de negro ciruela todos
    los botones: en la pantalla del alumno había demasiado negro y pesaba.
    - **Rellenos y con la letra en blanco**, solo las **acciones con consecuencias**:
      «Comprobar» (en el morado), «Otro ejercicio», «Reiniciar», «Ver la solución»,
      «Escuchar el comentario» y los del configurador.
    - **Claras las HERRAMIENTAS**: los ▶ de escuchar —también los de las dos ventanas de
      ayuda—, «Cuadro de cifrados», «Estructuras armónicas» y los segmentos de la posición
      melódica, que vuelven al botón de contorno con lo elegido en el morado apagado.
      «Parar» se queda en contorno rojo y se rellena al pasar por encima.
    - **Los dos renglones de la barra**, a ras del recuadro de la partitura y cada uno a su
      lado: arriba la **escucha, a la izquierda**; abajo, a la **derecha**, «Grados del
      bajo» y a continuación la **posición melódica inicial**.
    - **El pie de las paletas**: «sonar al elegir» a la izquierda, en la misma columna que
      los rótulos de las paletas, y el **«Cuadro de cifrados» centrado** debajo, junto a las
      teclas de cifrado que es lo que explica.
    - **Los grados del ejercicio, con el color de su función** (las mismas tintas que sus
      teclas, VI incluido a dos tintas): el alumno ve de un vistazo qué funciones entran.

138. **Los rótulos del configurador, en morado y por encima del valor** (28/9/2026, Diego).
    «Tipo de ejercicio», «Lección», «Modo»… iban en 13,6 px y en gris, **más pequeños que el
    texto del propio desplegable** (16 px): el rótulo, que dice qué se está eligiendo, pesaba
    menos que el valor elegido y el bloque costaba de leer. Pasan a la sans, en negrita, a
    14,7 px y en un morado de la familia de la marca, `#8B3FB0` —más hondo que el
    `--marca-apagada`, que sobre el gris del panel se quedaba en 4,2:1; este da 5,9:1—, con
    el valor en tinta normal debajo. Dos niveles claros: rótulo morado, valor negro.

139. **La dominante, en naranja** (28/9/2026, Diego). Corrige otra vez el reparto de la
    decisión 135:

        T  azul #0B5CD5        S  amarillo #F2C200        D  naranja #FF7A00

    La dominante pasa a llevar **tinta oscura** (`#1F0E00`), porque el naranja con letra
    blanca da 2,6:1 y es ilegible; la función hueca —la DD y las V/x— queda en contorno
    naranja con la letra en `#8A3B00`.
    **A tener en cuenta**: el naranja está a **19° de tono** del amarillo de la
    subdominante (28,7° frente a 48,1°), donde el rojo estaba a 137°, y ahora las dos
    funciones comparten familia cálida y tinta oscura. Se leen distintas, pero ya no saltan
    a la vista como opuestas. Si al verlo en clase se confunden, hay dos salidas sin tocar
    el amarillo: llevar el naranja al rojo-naranja `#FF5A00` (27° de separación) o apagar el
    amarillo hacia un oro más verdoso.

140. **«Sonar al elegir», en el primer renglón de paletas y a la derecha**
    (28/9/2026, Diego). Deja el pie —que se queda solo con el «Cuadro de cifrados»,
    centrado— y pasa a vivir **dentro** del primer renglón de paletas que esté a la vista
    —el de la **función tonal** cuando se piden—, **centrado verticalmente** en él y
    **alineado con el borde derecho** del recuadro de la partitura, mientras el rótulo de
    ese renglón ocupa el borde izquierdo. Como el renglón de función tonal solo aparece
    cuando la ficha pide las funciones, `colocarSonar()` (en `app.js`) mueve el nodo —no lo
    vuelve a crear, así conserva su estado— al primer renglón visible en cada pintado.
    (En la versión 20260929-0345 estuvo un rato en un renglón propio encima de las paletas;
    duró lo que tardó Diego en verlo.)

141. **La banda dice la LECCIÓN; por dónde va la ficha baja junto a «Comprobar»**
    (28/9/2026, Diego). La banda empieza por la palabra **«Lección»** y sigue con el nombre
    de la lección tal como lo guarda el banco (por ejemplo «Lección A3-5 · El 6/4
    cadencial»). Se probó antes con «Tema», que duró una versión. Sale de
    ahí el «(Ejercicio 1 de 4)», que pasa a un rótulo en tinta suave **al lado del botón
    «Comprobar»**: por dónde va la ficha es lo que el alumno mira al terminar un ejercicio,
    no al empezarlo.
    - De paso se corrige una repetición que venía de antes: cuando un fragmento no tiene
      título propio hereda el nombre de su lección, y la banda escribía «A3-5 · El 6/4
      cadencial · El 6/4 cadencial». Ahora el título del fragmento solo se añade si dice
      algo que el nombre de la lección no diga ya.
    - En los ejercicios del corpus de demostración, que no pertenecen a ninguna lección, la
      banda sigue diciendo la colección, sin la palabra «Lección»: no hay lección que
      nombrar.

142. **Las paralelas dejan de ser un coste y pasan a ser un veto** (28/9/2026, Diego, que
    las vio escritas en un ejercicio de armonización de soprano).
    - **Por qué salían.** El motor elige la serie de disposiciones más barata, y una octava
      o una quinta seguidas costaban **120 puntos**. Pero un final conclusivo cuesta 110 y un
      salto grande 90 por voz: sumando dos o tres defectos, al motor le salía a cuenta
      **pagar una paralela**. Ahora pesan `PESO_PARALELA = 100000`, más de lo que puede
      sumar cualquier serie de defectos de un fragmento entero, de modo que el motor solo
      escribe una paralela cuando **no existe ninguna disposición que la evite**.
    - **El movimiento directo, encarecido de 30/20 a 75/55.** Con las paralelas vetadas el
      motor se refugiaba en la directa (de 21 a 29 avisos). Encarecida, las combinaciones del
      banco con algún aviso bajan de 31 a **20** y las directas a 17.
    - **El bajo deducido deja sitio a las voces de en medio.** En la armonización de soprano
      el bajo lo deduce la respuesta del alumno (`Ejercicios.bajosDe`), y solo se le pedía
      estar una **quinta** por debajo de la melodía. En ese hueco no caben el tenor y la
      contralto sin unísonos, y de los unísonos salían octavas paralelas que ninguna
      disposición podía evitar. Ahora se le pide una **octava**.
    - **Medido sobre el banco entero.** Como armonización de bajo (378 combinaciones
      fragmento × posición): de 4 combinaciones con paralelas a **0**, y de 31 con algún
      aviso a 20. Como armonización de soprano con las respuestas del modelo (110
      fragmentos): de 6 con paralelas a **1**. En el corpus de demostración, 0 paralelas en
      las tres posiciones. El bajo medio apenas se mueve (51,0 → 50,8 en cifra MIDI) y
      ninguno baja del mi2.
    - **El caso que queda**, `A3-7-12`: quintas entre el **bajo y la soprano**, las dos voces
      dadas. No es cosa del motor —no puede cambiar ninguna de las dos—, sino de la propia
      sucesión de acordes del modelo (un VI en estado fundamental ahí). Queda anotado para
      revisar ese fragmento.

143. **El informe, más corto** (28/9/2026, Diego).
    - **Fuera «Tu armonización: T – D – T · cadencia auténtica»** (decisión 122): con las
      funciones pintadas en la partitura, la cadena se lee en ella. El **comentario hablado**
      la sigue diciendo, que ahí no hay nada que mirar.
    - La casilla que pone el comentario automático pasa a decir **«escuchar el comentario»**,
      las mismas palabras que su botón.

144. **El trío puede quedarse arriba: tres octavas de tenor y hasta dos octavas y una
    quinta sobre el bajo** (28/9/2026, Diego, que vio «saltos injustificados y un unísono
    innecesario»).
    - **Lo que pasaba.** Al generar disposiciones, el tenor solo se probaba en **dos**
      octavas por encima del bajo y nunca a más de 24 semitonos de él. Con un bajo grave
      —`A3-6-06` acaba en fa2— las disposiciones altas no existían, así que el trío tenía
      que **desplomarse** al final de la frase, y la programación dinámica lo anticipaba
      desbaratando el enlace anterior: de ahí el salto de sexta de la soprano y el unísono.
    - **Lo que se hace.** Se prueban **tres** octavas de tenor y el tope sube a **31**
      semitonos (dos octavas y una quinta), que es la distancia normal entre el bajo y el
      trío en la escritura de teclado cuando el bajo está grave.
    - **El caso de Diego**, `A3-6-06` con I · VI · V · I y posición inicial Fund., pasa a ser
      el enlace de manual, sin un solo aviso:
      `fa3: la4 do5 fa5 | re3: la4 re5 fa5 | do3: do5 mi5 sol5 | fa2: do5 fa5 la5`
      —notas comunes mantenidas, movimiento contrario al bajo en el V y soprano cerrando en
      la tercera—.
    - **Medido sobre el banco**: de 20 combinaciones con aviso a **17** de 378, con las
      directas de 17 a **7** y los saltos de 22 a **15**. Sigue habiendo 0 paralelas, y en el
      corpus 0 en las tres posiciones.

145. **«Ver la solución» enseña el ejercicio BIEN RESUELTO** (28/9/2026, Diego). Hasta ahora
    mostraba la lista de errores y las respuestas modelo en las casillas, pero el pentagrama
    seguía con la armonización del alumno —la fallida—. Ahora la realización que se dibuja es
    la del **modelo**: en la armonización de soprano se rededuce también el **bajo** del
    modelo, y las notas dejan de marcarse en rojo, porque lo que se está viendo ya está bien.
    Las casillas siguen diciendo, en verde y en rojo, lo que respondió cada uno.

146. **Rótulos** (28/9/2026, Diego). La casilla del comentario automático dice **«Lectura
    automática del comentario al comprobar»**; «Sonar al elegir» va con mayúscula inicial; y
    el selector de posición se llama **«Posición melódica»** con las opciones **Fund. · 3.ª ·
    5.ª** en todas las ventanas —en el cuadro de cifrados decía «Posición» y numeraba 1.ª,
    2.ª, 3.ª—.

147. **Al ver la solución se enseña la armonización del ALUMNO con lo fallado arreglado, y
    en naranja lo que cambia** (28/9/2026, Diego). Con la
    Corrige la decisión 145: lo que se dibuja **no es la armonización del modelo entera**,
    sino la del alumno con los acordes fallados sustituidos por los del modelo. Donde acertó
    se queda **su** acorde, aunque el modelo prefiera otro de los admitidos —si no, alguien
    que lo tiene todo bien veía cambiada media armonización, y marcada en naranja, que es lo
    contrario de lo que el naranja quiere decir (Diego, 28/9/2026)—. Los acordes sustituidos
    se pintan enteros en naranja `#D95F00`, para que vea de un vistazo qué le cambia. El acorde lo fija el **cifrado** sobre el bajo dado; en la melodía de
    soprano, también el grado, porque de él se deduce el bajo. Un acorde con el cifrado bien
    y el grado mal —el mismo acorde con otro nombre— no se marca: lo que suena es idéntico.
    Ojo: NO vale mirar si la respuesta estaba «bien». Una cifra puede ser **admisible** —y
    salir en verde— sin ser la del modelo; entonces el pentagrama enseña un acorde que el
    alumno no escribió, y hay que señalarlo igual.
    Se probó antes a comparar nota a nota con la realización del alumno, pero entonces un
    acorde bien respondido salía marcado solo porque su disposición cambiaba —la conducción
    se decide para la frase entera y un error posterior mueve lo anterior—, y eso confunde
    más de lo que enseña.

148. **El recorrido de las casillas, siempre en el mismo orden** (28/9/2026, Diego).
    **Función → fundamental → cifrado**, y a la nota siguiente, **aunque la casilla ya tenga
    respuesta**: antes se saltaban las rellenas y el recorrido daba brincos imprevisibles en
    cuanto se corregía algo. En el acorde **pivote** de una modulación diatónica, primero los
    datos del acorde en la tonalidad de partida —función, fundamental y cifrado— y después
    los de la tonalidad nueva —su función y su fundamental—; el cifrado no se repite, que es
    el mismo acorde.
    - De paso se arregla un error que esto dejó a la vista: la segunda función del pivote
      (`funcion2`) faltaba en la lista de paletas del **teclado**, así que con el foco ahí el
      número iba a parar a la paleta de cifrados y el recorrido se quedaba dando vueltas
      entre el cifrado y la función.

149. **Vuelven los acordes del ejercicio, y el botón de las estructuras deja de depender de
    los grados** (28/9/2026, Diego). El renglón «En este ejercicio entran» (o «En esta ficha
    entran») se había retirado por repetir lo que hay en la paleta; en el aula se echaba en
    falta y vuelve. Con él se lleva el acceso al **cuadro de estructuras de la lección**, que
    vivía en el renglón de los grados: ese renglón se oculta en los ejercicios que no piden
    el grado, y el botón se iba con él sin que nadie lo hubiera pedido.

150. **La nota de la melodía tiene que caber en el acorde** (28/9/2026, Diego). En la
    armonización de soprano, el acorde que escribe el alumno puede no contener la nota que
    tiene encima —un 6/4 de tónica bajo una melodía que en ese punto lleva la quinta de la
    dominante, por ejemplo—. La realización respeta **siempre** la melodía, porque el alumno
    ha de ver lo que ha escrito y no una versión arreglada; así que el acorde salía con una
    nota de más y aparecían segundas que no venían de la conducción de voces sino del acorde
    elegido, y nada lo decía. Ahora esa nota de la melodía **sale en rojo** y, al pulsarla,
    explica qué pasa: «El acorde que has escrito no contiene la nota de la melodía (si):
    sobre ese bajo no cabe ahí. Elige otro acorde, u otra inversión».

151. **La escala de tamaños de la interfaz** (28/9/2026, Diego). Medido lo que había: las
    teclas de función y grado, **46 px**; las de cifrado, **62** —y, peor aún, eran
    rectángulos VERTICALES, porque el número del atajo de teclado ocupaba un renglón propio
    debajo del símbolo—; las fichas de «Grados en este ejercicio», rectángulos **apaisados**
    de 38 × 34 y del mismo color que las teclas; los botones de herramienta, 33; los
    segmentos, 29; «Comprobar», 45; las casillas, 13. Y las dos franjas de arriba quedaban
    fuera de cualquier escala, de modo que se veían menguadas al lado del resto.
    Se ordena todo en **una sola escala, múltiplos de 8**, que incluye las franjas —cada una
    lleva botones o información de la página— y que da a teclas y fichas **la misma forma, el
    cuadrado**:

    | alto | qué |
    |---|---|
    | **48 px** | la **banda** morada (título a 1,12 rem). Nunca por debajo de las teclas: es lo que identifica la página. Se probó a 64 —a esa altura el morado pesa como un cartel—, a 56 y a 52, y se eligió 48 comparando las alturas una encima de otra |
    | **40 px** | las **teclas** de las paletas, cuadradas de 40 × 40, y las **acciones** de la botonera: la tecla no debe asomar por encima del botón que se pulsa al final |
    | **32 px** | la **barra** ciruela y las **herramientas**: navegación y utillaje, no contenido |
    | **32 px** | las **fichas** de referencia, cuadradas, y las herramientas: escuchar, cuadros, estructuras, segmentos, mandos de la banda |
    | **≈24 px** | los **▶ de cada acorde**, que van dentro de la partitura y miden en unidades del pentagrama, no en píxeles de la interfaz |
    | **16 px** | las **casillas** de verificación |

    En el móvil la escala se comprime manteniendo el orden: 46 · 40 · 36 · 28 · 15.
    - El **número del atajo** de teclado pasa a la **esquina inferior izquierda** de la tecla,
      en posición absoluta y sin recuadro, heredando la tinta de la tecla al 72 % de
      opacidad. **Sin negrita**: es intendencia, no parte del ejercicio musical, y en negrita
      se daba una importancia que no le toca (se probó y se retiró el mismo día).
      Eso es lo que permite que la tecla sea cuadrada sin encoger el símbolo (el icono de la
      cifra mide 32 px dentro de los 48).
    - «Borrar» y las teclas de **tonalidad** crecen a lo ancho, no a lo alto: llevan palabra.
    - Los **rótulos de las paletas** se meten 10 px hacia dentro, para que la línea del
      recuadro que marca la paleta activa no corte la primera palabra.
    - **Dónde está el selector de posición melódica**: en la armonización de SOPRANO no se
      muestra, y es a propósito —la disposición la fija la melodía, que ya viene dada—. Lo
      mismo pasa con «Grados del bajo» cuando la ficha no los permite; por eso en ese
      ejercicio faltaba el renglón entero.

152. **El renglón de la solución: una tinta, un sitio** (28/9/2026, Diego). Al ver la
    solución había **tres tintas contando tres historias** del mismo acorde. Las notas del
    pentagrama salían en **naranja** donde la solución cambiaba lo del alumno (decisión
    147). La **función** del modelo se escribía dentro de la casilla vacía y, como la
    casilla estaba corregida, salía **roja**: parecía una respuesta suya, y equivocada. Y el
    **grado y la cifra** ni se rellenaban en su casilla ni iban con los demás: se dibujaban
    en un renglón aparte bajo las notas, el grado en **verde** —el color que en esta
    aplicación significa «lo acertaste», justo lo contrario de la verdad— y la cifra en
    negro, porque su regla de estilo apuntaba a `.casilla .modelo` y aquel grupo nunca
    colgó de una casilla. Diego: «¿y el cifrado????».

    Queda un solo reparto, y se dice en un sitio:

    > **naranja = lo que pone la solución · verde = lo que acertaste · rojo = lo que fallaste**

    - Bajo cada nota que falló, **una sola línea naranja** con **función · grado · cifra**, en
      ese orden —el mismo de la lista de comentarios y el mismo del recorrido de casillas
      (decisión 148)—, centrada en la nota. En el **pivote**, las dos lecturas del acorde
      separadas por barra, la vieja sobre la nueva: `T/S`.
    - Es el **mismo naranja** (`--cambio`) que marca las notas que la solución cambia, que era
      justo lo que faltaba por explicar en el pentagrama.
    - Las **casillas** se quedan diciendo **solo lo del alumno**: verde, rojo o vacía. La
      función del modelo sale de dentro de la casilla.
    - La **función** va un punto por encima del **grado**: **18 px contra 16**
      (Diego, 28/9/2026). Ligeramente, no más: en este renglón la función es la lectura que
      manda —es lo que se pregunta primero y lo que ordena la frase— y el grado viene detrás.
      La cifra se dibuja a escala 0,7 de la de las casillas.
    - Si la línea no cabe entre nota y nota —el caso malo es un `VII` con una `DD`— se
      **encoge** en vez de pisar a la vecina. Medido en el banco entero: el más ancho llega a
      53 px sobre 54 disponibles, así que en la práctica no llega a encogerse nunca.

    **Lo que de verdad se arregla** (Diego: «el cifrado ha de coincidir con los acordes
    escritos»). El renglón imprimía siempre `parejas[0].cifra` —la primera admitida— mientras
    el pentagrama se dibujaba con `cifrasSolucion()`, que **conserva el acorde del alumno
    donde acertó** (decisión 147, corregida). Bastaba escribir `I 6` donde el modelo pone
    `I —` —las dos admitidas— y fallar la función para que abajo se leyera un acorde y arriba
    sonara otro. Ahora las dos cosas salen de **la misma lista**: `paresSolucion()` en
    `app.js`, que es la que realiza el pentagrama. En Análisis devuelve el par del modelo,
    porque allí la realización es siempre la del modelo; en los demás modos, la armonización
    del alumno con lo que falló arreglado. La **función** se deduce de ese par: la del
    ejercicio cuando el acorde es el del modelo —sabe de tonalidades, de préstamos y de la
    cadencia rota, y respeta la que fije la ficha— y `Teoria.funcionDe` sobre el grado y la
    cifra del alumno cuando es el suyo el que se conserva.

    **Fallo aparte, destapado por la auditoría** (28/9/2026). `Ejercicios.primeraAjena` le
    pasaba a `Teoria.acordeAjeno` el id admisible **entero**, que en los fragmentos de
    melodía de soprano viene como pareja `«grado|cifra»`, y además le daba como bajo la nota
    **escrita**, que en esos fragmentos es la soprano. Saltaba un `Cifrado desconocido:
    I|53` **en mitad de `corregirMarcas`**: en la lección `A4-11` en melodía de soprano el
    alumno pulsaba Comprobar y no pasaba nada. Ahora la pareja se separa y el bajo se deduce
    del grado y la cifra, como en `bajosDe`.

153. **Al ver la solución, una frase y no una lista** (28/9/2026, Diego). Debajo del informe
    se desplegaba la **lista numerada de errores** —«Nota 3 (la): has puesto ¿función? ·
    ¿grado? · ¿cifra?; la respuesta modelo es T · I —»— nota por nota. Era decir por segunda
    vez lo que la partitura ya dice mejor: cada casilla lleva su ✓ o su ✗, y desde la
    decisión 152 bajo cada nota fallada está en naranja lo que pone la solución. Y hacía
    daño: la lista tira la mirada **hacia abajo**, que es justo donde NO está la corrección.

    En su lugar, **una frase que manda mirar el pentagrama y hace de leyenda**, con el
    nombre de cada color pintado de su color. Se adapta a lo que pasó:

    - **Nada acertado**: «Lo que pone la solución va en *naranja*: bajo **cada nota**, su
      función, su grado y su cifra…».
    - **Algo acertado**: «…bajo **las notas 1 y 2**…», y añade: «Donde acertaste se queda tu
      acorde, aunque el modelo prefiriese otro de los admitidos» —que es la decisión 147
      corregida, dicha en voz alta.
    - Las **lecturas** que nombra son las que ese ejercicio pide: si no hay fila de función,
      no la nombra; si no se pide el grado, tampoco.
    - En **Análisis** el pentagrama no cambia —la realización es la del ejercicio—, así que
      dice «los acordes que no analizaste bien» en vez de «las notas que por eso cambian».
    - **Todo bien salvo la conducción de voces**: no hay nada en naranja, y prometerlo sería
      mandar al alumno a buscar lo que no está; dice que los grados y los cifrados están bien
      y que lo que se arregla es la armonización que producen.
    - Cierra siempre con el reparto de colores: «Las casillas siguen diciendo lo tuyo: en
      *verde* lo que acertaste, en *rojo* lo que no».

    El **detalle nota a nota** —qué falla exactamente en cada una— sigue estando en
    «Escuchar el comentario», que no se toca. La **explicación de la regla** del motor, que
    iba bajo cada renglón de la lista, vuelve en la decisión 154, en un globo.

154. **El porqué, en un globo sobre el cifrado naranja** (28/9/2026, Diego). La explicación
    de la regla —lo único que la lista tenía de suyo— vuelve, pero **a petición**: con el
    ratón encima del cifrado naranja, o tocándolo con el dedo. Reaprovecha el globo que ya
    existía para los avisos de conducción de voces; cambia el borde, que aquí es naranja, y
    comparten la banda reservada al pie, de modo que el globo nunca tapa la música.

    - **Ratón**: abre al entrar y cierra al salir. **Dedo**: un toque abre, el siguiente
      cierra. **Teclado**: la zona entra en el recorrido del tabulador y el foco lo abre.
    - Ratón y dedo **no se pueden tratar igual**, y costó dos intentos. El móvil sintetiza
      un `mouseenter` antes del toque, así que con `mouseenter` + `click` el dedo abría el
      globo y lo cerraba en el mismo gesto. Y al arreglarlo apareció el mismo parpadeo por
      otra puerta: el `pointerdown` del toque también da el **foco**, y el `focus` volvía a
      abrirlo. Se mira `ev.pointerType` para el puntero y `:focus-visible` para el foco, que
      es justo la distinción entre «me han tabulado hasta aquí» y «me han tocado».
    - La zona sensible es un **rectángulo transparente aparte**: el renglón lleva
      `pointer-events: none`, y sin él el ratón tropezaría con cada glifo y el globo
      parpadearía al pasar de la función al grado.
    - El globo solo se ofrece donde el acorde que se enseña **es el del modelo**, que es el
      que el motor razonó. Donde se conserva el del alumno —acertó con otra admisible— la
      regla no habla de ese acorde, y colgarle la explicación sería mentir. La frase de la
      decisión 153 solo lo anuncia si de verdad hay alguno.

    **Al grano** (Diego: «no repitas lo que ya está en el cifrado naranja»). Las
    explicaciones del motor tienen la forma «*por qué*: *qué acorde*», y ese acorde es justo
    lo que se lee debajo de la nota. Así que `alGrano()` en `app.js`:

    - **corta por los dos puntos** cuando lo que sigue es corto —un acorde y poco más, 45
      caracteres— y deja el texto entero cuando lo que sigue trae razonamiento («la armonía
      ha de cambiar…»);
    - **no corta** si la cabeza es un jirón de menos de 14 caracteres: «Grado 1» a secas no
      es una frase;
    - **quita el paréntesis final** del modo soprano —«(bajo do; función T, tónica)»—, que
      repite el bajo y la función una por una.

    Medido sobre el banco entero: 174 textos distintos, 152 recortados, el más largo queda en
    152 caracteres. Quedan sin tocar los de la **regla de la octava** («Grado 1: estado
    fundamental»), porque la cabeza es demasiado corta para cortar por ahí; son los únicos
    que siguen repitiendo lo que dice la cifra, y reescribirlos es cosa de la redacción de
    las reglas, no del recorte.

155. **Las técnicas armónicas, en un cuadro sobre los acordes que las forman**
    (28/9/2026, Diego). Módulo nuevo, `js/tecnicas.js`. Lee la cadena de acordes y devuelve
    los tramos que forman una técnica; la partitura los encierra en un cuadro que abarca
    **de arriba abajo lo que la forma** —los acordes en el pentagrama y sus casillas—, con
    el nombre en el centro y la explicación en un globo al pasar el ratón o tocar.

    **Qué se reconoce.** Un tramo válido de *i* a *j* empieza y acaba en la misma función y,
    por dentro, **o es todo esa función o no la toca ninguna vez**. Lo que no vale es
    mezclar las dos cosas —T D T D T—, porque entonces no es una técnica sino dos.

    | | Forma | Ejemplo | Cómo se rotula |
    |---|---|---|---|
    | **Arpegio** | el mismo acorde, cambiando de inversión | `I – I6`, `V – V6`, `II – II6` | «I arpegiado», caja de trazo discontinuo |
    | **Prolongación de una función** | acordes distintos, todos de la misma función | `IV – II6`, `I6/4 – V7` | «Prolongación de la subdominante» |
    | **Prolongación con marco** | se sale de la función y se vuelve a ella | `T – D – T`, `T – S – T`, `S – T – S` | «Prolongación de la tónica» |
    | **Cadencia** | el final del fragmento | `V – I` | «Cadencia auténtica perfecta», caja más gruesa |

    - La **tríada que gana o suelta su séptima** cuenta como el mismo acorde —`V – V7` es la
      dominante completándose, no una nueva—, que es la excepción ya medida en la decisión 80.
    - La **cadencia manda**: se reserva antes que nada, y las prolongaciones no pueden
      ocupar sus acordes. Empieza en la **subdominante** cuando la hay pegada a la dominante,
      que es el `S – D – T` que Diego opone a la prolongación `T – D – T`.
    - **Perfecta o imperfecta**: perfecta si los dos acordes van en estado fundamental y la
      soprano llega a la tónica; si falta cualquiera de las dos cosas, imperfecta. La soprano
      sale de la realización dibujada.
    - Una nota sin contestar o un **cambio de tonalidad cortan** el tramo: las funciones de
      un lado y del otro no se leen en el mismo tono, y el cuadro engañaría.

    **Cuándo y sobre qué.** Al **comprobar**, y sobre lo que escribió el **alumno**, acertado
    o no: lo que enseña es ver qué ha construido él. Con la solución a la vista se redibujan
    sobre la buena. En Análisis y en la armonización de bajo las respuestas del banco son
    cifras a secas, sin grado, así que el grado se toma de la corrección —`modeloRomano` o
    `gradoReal`—; sin eso, en esos dos modos no salía ni un solo cuadro.

    **El dibujo, en dos pasadas.** Primero se mide todo y después se dibuja, porque el
    carril no lo decide el cuadro sino **lo que de verdad ocupa la técnica: el cuadro o su
    rótulo, lo que sobresalga más**. Se probó a decidirlo solo por el cuadro y dos pastillas
    vecinas se tocaban aunque los cuadros no llegaran a rozarse.
    - Dos técnicas seguidas **comparten el acorde de cierre**, así que sus cuadros se pisan:
      la segunda baja de carril y se mete medio espacio hacia dentro.
    - El **rótulo no va al centro geométrico** del cuadro: ahí caía sobre el pentagrama del
      bajo y tapaba las notas. Va al **hueco entre el sistema y las casillas**, que es el
      único sitio del cuadro donde no hay nada dibujado, y cada carril baja un escalón.
    - El rótulo se encoge para caber, pero **no por debajo de 0,8**: ajustarlo a un cuadro de
      dos acordes lo dejaba en letra de mosca. Por debajo de ahí la pastilla asoma por los
      lados —es opaca, se lee igual— y del solape se encarga la medida.
    - La **caja no recoge el puntero** (`pointer-events: none`): si lo hiciera, no se podrían
      pulsar las casillas. Quien abre el globo es la **pastilla del rótulo**, con el mismo
      reparto ratón / dedo / teclado de la decisión 154.
    - Color: el **ciruela de la marca**, que en esta aplicación es el color de lo que se
      anota *sobre* la música —rótulos de tonalidad, barras del pivote—, y no compite con el
      verde, el rojo ni el naranja de la corrección.

    **Pendiente, de la misma conversación**: las marcas de Berklee (decisión 141, de prueba)
    han de aparecer en cuanto el alumno tenga acordes suficientes para usarlas —`V – I`,
    `II – V – I`—. Queda para el paso siguiente.

156. **El bajo deducido es una línea, no una sucesión de elecciones** (28/9/2026, Diego,
    revisando el banco). En la armonización de soprano el bajo lo deduce la respuesta: el
    grado y la cifra dicen **qué nota** va abajo, y lo único que queda por elegir es **en qué
    octava**. Eso se hacía nota a nota, cogiendo la más cercana a la anterior (decisión 143).
    Es una mirada miope: cada paso parecía razonable y la línea entera salía mal. Diego
    señaló tres cosas, cada una en un fragmento distinto, y la auditoría las encontró todas:

    | Lo que dijo | Dónde | Medido en el banco |
    |---|---|---|
    | «se va más allá del extremo grave del bajo» | `A3-3-23` | **5 notas** por debajo del mi2, la más grave un **do♯2** (MIDI 37) |
    | «salto de séptima sin justificar» | `A3-3-24` (sol–la), `A3-5-15` (si2–do2) | **4 séptimas** |
    | «salto de sexta sin compensar, sin movimiento en sentido contrario a continuación» | `A3-3-23` | **6 sextas** sin compensar |

    El comentario del código decía «dentro de mi2 … mi4», pero la condición dejaba pasar
    hasta el **do2**: el límite estaba escrito en la prosa y no en el código.

    Ahora la octava se elige para la **línea entera**, con programación dinámica. Y como lo
    que hace admisible un salto de sexta es **lo que viene después**, el estado guarda las dos
    últimas octavas: el coste del salto *i−1 → i* se cobra cuando ya se sabe hacia dónde va
    *i → i+1*. Los costes: hasta la quinta, en proporción al salto; la **octava** es
    idiomática en el bajo y se cobra poco; la **sexta** es cara; la **séptima**, prohibitiva;
    y una sexta o séptima que no se sigue de movimiento contrario paga aparte.

    **El nudo que había que deshacer.** La prescripción de Diego para `A3-3-23` —«subir una
    octava a partir de la cuarta nota, el fa negra»— pone el bajo en **fa3**, que queda a
    **menos de una octava** de la melodía; y el hueco de una octava bajo la melodía era un
    **filtro duro** (decisión 143, puesto para que el tenor y la contralto quepan sin
    unísonos). En un fragmento de melodía grave las dos cosas no pueden ser absolutas a la
    vez: exigir la octava es lo que empujaba el bajo al fa2. Así que el hueco pasa a ser una
    **preferencia cara** —18 por debajo de la octava, 60 por debajo de la quinta— y la decide
    la línea entera junto con la tesitura y los saltos. **Y no ha costado nada**: los
    unísonos entre voces contiguas incluso bajan.

    **Medido sobre los 124 fragmentos de soprano (647 notas de bajo):**

    | | antes | después |
    |---|---|---|
    | notas por debajo del mi2 | 5 (la más grave, 37) | **0** (la más grave, 41) |
    | saltos de séptima | 4 | **0** |
    | sextas sin compensar | 6 | **0** |
    | paralelas | 1 | **1** (la misma, `A3-7-12`) |
    | unísonos entre voces contiguas | 51 | **49** |
    | bajo medio (MIDI) | 50,3 | 49,7 |

    En `A3-3-23` la línea sale ya exactamente como él la pidió: sube en la nota 4 y baja en la
    antepenúltima.

    **Pendiente, del mismo mensaje**: en `A3-3-24`, la **nota 9 —una redonda, reposo de
    frase— lleva `V +6`**, o sea la en el bajo, cuando la semicadencia debería reposar en un
    acorde en estado fundamental y consonante (`V`, con **re** en el bajo). Eso no es la
    línea del bajo sino el acorde que elige el modelo, y hace falta decidir si es una regla
    —estado fundamental en los reposos de frase— o una corrección del fragmento.

157. **Las cadencias son de cada FRASE, no solo del fragmento** (28/9/2026, Diego,
    corrigiendo la decisión 155). Tres cosas, las tres suyas:

    - **«Los compases 2 y 3 no son prolongación de tónica, sino semicadencia (S S D)».** La
      cadencia se buscaba solo al final del fragmento, así que los reposos interiores se
      quedaban sin nombre y una prolongación se los comía. Ahora el fragmento se parte en
      **frases** —las cortan los silencios, que es como ya las parte el motor con
      `cortesDe`— y **cada frase resuelve primero su cadencia**, que manda sobre cualquier
      prolongación que quisiera ocupar esos acordes, y después las prolongaciones de lo que
      queda por delante.
    - **«No solo hay prolongación de dominante, sino también cadencia auténtica: S D con
      cuarta y sexta cadencial y T».** El cuadro de la cadencia se extiende hacia atrás por
      **toda la dominante** —el 6/4 cadencial es dominante en esta aplicación (decisión
      130), así que `II6 – I6/4 – V – I` es S + D + T y no una prolongación suelta más una
      cadencia— y, delante de ella, por la **subdominante** que la prepara.
    - **Perfecta o imperfecta**, con sus palabras: es **imperfecta** cuando acaba en V – I
      pero «o bien el bajo no hace salto de quinta —porque use una inversión, bien en la
      dominante o bien en la tónica—, o bien la melodía de soprano no acaba en la tónica».
      Es lo que ya hacía la decisión 155; ahora está dicho así en el código y en el globo,
      que además explica **cuál de las dos cosas** falla en cada caso.

    Y dos cosas del dibujo:

    - El cuadro **baja hasta el cifrado naranja** de la solución, «pues es precisamente este
      el que cumple la técnica que describe el cuadro» (Diego). Solo cuando lo hay: si el
      alumno acertó esos acordes no hay renglón naranja debajo y el cuadro no baja a
      encerrar un hueco vacío.
    - Los **topes se alternan**: uno un poco más alto, el siguiente a la altura de siempre, y
      así. Con todos a la misma altura, dos cuadros seguidos se leían como uno solo.

    Medido en los tres modos por las nueve lecciones: de 67 cuadros a **49**, ninguno fuera
    del dibujo, ningún rótulo pisado, sin errores. Bajan porque la cadencia absorbe ahora lo
    que antes se contaba aparte, que era justo la confusión.

    **La subdominante, afinada** (28/9/2026, Diego, el mismo día): «varias subdominantes
    seguidas **no** lo vamos a llamar prolongación de la subdominante. Cuentan como una sola
    si luego hay una cadencia». Así que:

    - la cadencia se lleva hacia atrás **todas** las subdominantes seguidas, no solo la
      última: en `T S S S D T` la cadencia auténtica abarca `S S S D T`, y en `S S D` la
      semicadencia empieza también en la **primera** S;
    - una tirada de subdominantes que **no** desemboca en una cadencia no se marca: no toda
      sucesión tiene nombre. El **marco** `S – T – S` —«el I dentro del II»— sí sigue siendo
      prolongación de la subdominante, porque ahí la subdominante se abandona y se recupera.

    Comprobado primero contra las sucesiones que él escribió, sin navegador y sin banco
    —`T S S S D T`, `T S S D`, `T S C6/4 D7 T`, `T T6 S D T`—, y después sobre las 27
    pantallas del banco: de 49 cuadros a **43**, y «Prolongación de la subdominante»
    desaparece del todo, absorbida por las cadencias.

158. **La excepción de la síncopa no vale en la cabeza del compás** (28/9/2026, Diego: «esto
    genera síncopa armónica y no es posible, ¿recuerdas?»). La decisión 80 eximió de la
    regla de la síncopa al **mismo acorde sobre el mismo bajo que gana o suelta su séptima**
    —el `V → V7` de la fórmula I–V–V7–I de A3-1— y quedó anotada como el único punto en que
    me aparté de lo que él dijo, para que pudiera vetarla. La veta, y con razón: el tiempo
    fuerte del compás es donde la armonía **tiene** que cambiar.

    Medido antes de tocar nada, los casos que la excepción salvaba partían en dos sin
    solaparse:

    | | casos | fuerza métrica | |
    |---|---|---|---|
    | **dentro del compás** | 4 (`A3-1-08`, `-09`, `-30`, `-32`) | 1→2 | los cuatro para los que se hizo |
    | **cruzando la barra** | 2 (`A3-2-10`, `A3-7-04`) | 2→3 | los que él señala |

    Así que basta pedir que la excepción **no caiga en la cabeza del compás** (fuerza 3). Con
    eso, `A3-7-04` se arregla solo —el modelo pasa a `I – II7 – V7 – I`— y `A3-2-10` queda al
    descubierto.

    **Y al descubrirlo apareció algo mayor: la regla estaba CIEGA en la armonización de
    soprano.** `sincopaBajo` tomaba la nota escrita como bajo, y en soprano la nota escrita
    es la **melodía**: construía los acordes sobre ella —otro acorde, otra clave—, y el 6/4
    cadencial tampoco quedaba exento, porque el identificador allí es `I|64` y no `64`. Por
    debajo había además un error mudo: al deducir el bajo con `Teoria.bajoDe` la nota venía
    **sin octava**, `claveAcorde` reventaba con un «Cannot read properties of undefined», el
    `try/catch` se tragaba el error y la regla contestaba «aquí no hay síncopa» **para todo
    el modo soprano**. Ahora el acorde se deduce de la pareja `grado|cifra` y el bajo lleva
    octava.

    **Rectifico una cifra que di mal.** Con la regla ciega llegué a contar «8 fragmentos que
    sincopan en soprano»: esa medición no valía —le pasaba cifras sueltas a una regla que
    tomaba la melodía por bajo—. Con la regla arreglada son **5**, y son estos:

    | | | |
    |---|---|---|
    | `A3-2-01` nota 3 | `I6 → I` | el mismo acorde sobre el tiempo fuerte |
    | `A3-2-03` nota 3 | `I6 → I` | ídem |
    | `A3-2-10` nota 3 | `V → V7` | el que vio Diego, cruzando la barra |
    | `A3-3-22` nota 4 | `I → I6` | |
    | `A3-3-23` nota 5 | `I6 → I` | |

    Y `evitarSincopas` —«la respuesta modelo no sincopa nunca»— corría solo en `proponer`;
    ahora corre también en `proponerSoprano`. **Al reanalizar, 4 de los 5 se reparan solos**;
    el que no es `A3-3-22`, donde ninguna cifra admisible de esa nota evita la síncopa: hace
    falta mano de Diego, como en su día con `A3-5-11`.

    **Medido sobre los 124 fragmentos de soprano**, reanalizándolos todos: el motor no falla
    en ninguno, **ninguna nota se queda sin acordes admisibles** y la media por nota no se
    mueve (3,37 antes y después), así que el alumno no pierde ni una opción. Los fragmentos
    cuyo modelo cambiaría al reanalizar pasan de 11 a 15 —los 4 reparados—, y las síncopas
    que quedarían, de 0 (que era mentira: no las veía) a 1 (`A3-3-22`, la real).

    **Pendiente, para decidir**: la corrección del alumno sigue sin mirar la síncopa en
    soprano (`app.js` lo excluye con `!esSop`, puesto cuando la regla no servía allí). Ahora
    ya sirve. Activarlo sería coherente con los otros modos, pero cambia lo que se le cuenta
    como error, así que lo decide Diego.

159. **Lo que separa la prolongación de la cadencia es el BAJO** (28/9/2026, Diego). Un
    fragmento de tres acordes, `I – V6/5 – I`, salía rotulado «Cadencia auténtica
    imperfecta»: «en este caso, breve y que no llega a más, se trata de una prolongación del
    I». Y la regla, con sus palabras: «prolongación es T D T y el bajo haciendo un
    movimiento de **bordadura** o de **bordadura incompleta**».

    Eso es lo que faltaba, y resuelve un problema que la sola distinción de funciones no
    podía resolver: `T – D – T` aparece en los dos sitios.

    | | bajo | qué es |
    |---|---|---|
    | `I – V6/5 – I` | do – **si** – do | bordadura: **prolongación** |
    | `I – V4/3 – I6` | do – **re** – mi | bordadura incompleta: **prolongación** |
    | `I – V – I` | do – **sol** – do | salto: sigue siendo **cadencia** |

    Así que la cadencia se devuelve sin nombre —y el detector de prolongaciones la recoge
    como el marco que es— cuando se dan las tres cosas: acaba en el I, **no** hay
    subdominante delante de la dominante, y el bajo va **por grado conjunto** de punta a
    punta del marco. Si el bajo salta, está cadenciando, no adornando. El bajo se lo pasa
    `app.js`: en la melodía de soprano, el que deduce la respuesta; en los demás modos, la
    nota escrita.

    Comprobado primero contra los tres patrones de arriba, sin banco de por medio, y después
    sobre las 27 pantallas: 44 cuadros, ninguno fuera del dibujo, sin errores.

    **Y los cuadros pasan a ser NARANJAS**, como el cifrado que encierran: «los cuadros que
    señalan las técnicas creo que se verían mejor si se mostraran en naranja también». Es
    coherente —el cuadro describe precisamente ese cifrado naranja— y en el ciruela de la
    marca se leían como una anotación ajena a la corrección.

    Pero **no el mismo naranja**: el de la corrección, un punto más claro; el de las técnicas,
    «naranja oscuro —no marrón— todavía vivo pero un poco más condensado» (Diego). Dos
    tonos, `--cambio: #D95F00` y `--tecnica: #B84A00`. Lo que separa el naranja oscuro del
    marrón es la **saturación**, no el tono: el marrón es justo un naranja oscuro y apagado,
    así que el segundo baja de claridad manteniéndola arriba. Y así los dos oranges se
    distinguen entre sí: el cifrado de la solución y el cuadro que lo describe no son lo
    mismo.

160. **La síncopa se comprueba también en la armonización de soprano** (28/9/2026, Diego).
    La corrección del alumno la excluía con un `!esSop`, puesto cuando la regla no servía
    allí (decisión 158). Arreglada aquella, se le pide lo mismo que en los demás modos.
    - Lo que cambia es **qué hay que darle**: en la armonización de bajo basta la cifra sobre
      el bajo escrito; aquí hace falta el acorde entero, `grado|cifra`, para que pueda
      deducir el bajo.
    - Si el alumno **aún no ha puesto el grado**, no hay acorde que juzgar y se deja pasar:
      no se le señala una síncopa que todavía no ha escrito.

    **Aviso sobre el banco tal como está guardado.** El modelo de **5 fragmentos** sincopa
    —`A3-2-01`, `A3-2-03`, `A3-2-10`, `A3-3-22` y `A3-3-23`—, así que un alumno que responda
    exactamente ese modelo recibirá ahora el aviso. Es verdad —la síncopa está ahí—, pero es
    incómodo. Reanalizar esos fragmentos en el configurador repara 4; el quinto,
    `A3-3-22`, necesita cambiar una nota de la melodía (decisión 158).

161. **La semicadencia frigia, en sus dos versiones** (28/9/2026, Diego). Estaba reconocida
    a medias —solo el par final— y ahora entra entera en el repertorio de técnicas:

    - **corta**: `IV6 – V` en modo menor;
    - **larga**: `I – V6 – IV6 – V`, también en menor, y el cuadro la abarca **entera**,
      porque la fórmula se aprende como una sola cosa: la tónica y el V6 del principio
      llevan el bajo por grados hasta ese 6.º grado.

    Lo que la hace frigia es el **bajo**, que baja del 6.º grado al 5.º por **semitono** —el
    paso característico del modo—. En modo mayor la misma sucesión sale como semicadencia a
    secas, y así se ha comprobado.

    De paso, **el modo lo manda ahora la tonalidad que rige EN LA CADENCIA**, no la del final
    del fragmento: en una frase interior de una pieza que modula no tienen por qué ser la
    misma, y con la decisión 157 las frases interiores ya cadencian por su cuenta.

162. **El acorde pivote rompía el nombre de la cadencia** (28/9/2026, Diego: «la cadencia de
    la imagen es auténtica perfecta… corrígelo»). El fragmento era `A4-10-05`, en
    armonización de bajo: `I – IV – V6/5̸ – V – I` en Sol M, con la soprano acabando en la
    **tónica** y la dominante en **estado fundamental** —perfecta de manual—, y salía
    rotulada **imperfecta**.

    El motivo no estaba en la regla sino en lo que le llegaba. Cuando el alumno falla la
    cifra, el detector toma el grado del modelo de `r.modeloRomano`; y en un acorde **pivote**
    ese campo viene como **cadena compuesta con las dos lecturas**, `«I = V»`. Con eso, la
    comprobación «¿es el V?» no casaba con nada y la cadencia se degradaba a imperfecta. La
    nota 4 de ese fragmento es justamente el pivote de la vuelta a Sol M.

    - Ahora el grado se pide a la **pareja modelo** de esa nota —`Ejercicios.gradoDe` sobre
      `Ejercicios.parejas`—, que lo da limpio y en la tonalidad que rige.
    - Y `tecnicas.js` pone una **barandilla**: si le llega el compuesto, se queda con la
      lectura de después del `=`, que es la de la tonalidad vigente. Quien llama debe mandar
      un romano limpio, pero más vale leer el que toca que no reconocer ninguno.

    **Medido**: en el banco, las cadencias auténticas perfectas pasan de 20 a **21** y las
    imperfectas de 5 a **3**; las que cambian son exactamente las que tocaban un pivote. Y se
    comprobó aparte, sin la aplicación de por medio, que `A4-10-05` da «perfecta» con la
    soprano en sol y la tónica en Sol.

163. **Nada reanaliza un fragmento del banco por su cuenta** (28/9/2026, Diego: «si yo
    asigno algo a un fragmento no puedes modificarlo, porque mi criterio es experto y el
    tuyo es ciego aplicando reglas que aún no están bien formuladas»). Tiene razón, y había
    **dos caminos silenciosos** por los que el motor le borraba el trabajo:

    - Cambiar los **acordes de la lección**, la casilla **«Fórmula T S T»** o el selector de
      **funciones de la ficha** con un fragmento abierto disparaba `analizar(true, true)`:
      un reanálisis completo que sustituía las cifras asignadas a mano, sin avisar. Ahora,
      **si el fragmento viene del banco** (`estado.banco`), no se reanaliza: se avisa y queda
      el botón «Analizar la melodía» para quien de verdad lo quiera.
    - `fundir()`, al reimportar un fragmento **ya presente** con las dos voces y **otra
      tonalidad**, reemplaza la entrada entera —respuestas incluidas—. Tiene motivo: las
      viejas estaban leídas en una tonalidad equivocada. Pero pasaba callando. Ahora se
      anotan los identificadores y se dicen aparte, en un aviso propio: «OJO: N fragmentos
      venían en otra tonalidad y se han reemplazado enteros… Si los tenías revisados,
      vuelve a revisarlos».

    **Lo que ya estaba bien y conviene dejar escrito**: la pantalla del alumno **nunca**
    reanaliza. `Banco.ejercicio` sirve las respuestas guardadas tal cual; el motor se llama
    solo para la explicación del globo y para «Escuchar propuesta», y esa explicación se
    muestra **únicamente cuando el motor coincide con el modelo guardado**.

    **Comprobado sobre el archivo**, para poder afirmarlo y no suponerlo: de las 1304 notas
    guardadas en `banco.json`, **85 se apartan de lo que el motor propondría hoy** —65 en el
    bajo (39 fragmentos) y 20 en la soprano (15 fragmentos)—. Esas discrepancias son la mano
    de Diego: si algo hubiera reescrito sus asignaciones, el archivo coincidiría con el motor
    al cien por cien.

164. **Botón a la hoja de respuestas** (28/9/2026, Diego). En la cabecera del configurador,
    junto a «Ir a la página del alumno», aparece **«Ver los resultados →»** cuando su
    dirección está puesta, abajo en «Recogida de resultados».
    - La dirección se guarda **solo en el navegador** (`armonizar.respuestas`) y **no entra
      en `envio.json`**, a propósito: ese archivo se sube a GitHub y la hoja es del profesor.
    - Se aceptan direcciones de Hojas de cálculo, Documentos y Drive; cualquier otra cosa no
      enciende el botón.

165. **«Sonido fundamental» y «cifrado interválico»** (29/9/2026, Diego: «no digas *grado +
    cifra* sino sonido fundamental, en vez de grado, y cifrado armónico, en vez de cifra»;
    y, al verlo puesto, «cifrado armónico, mejor cifrado interválico o cifrado barroco» →
    elige **interválico**, y **sonido fundamental** se queda a secas).
    Cambia el vocabulario de todo lo que se lee, en la pantalla del alumno y en el
    configurador: la paleta de romanos pasa a **«Sonido fundamental»** (en el móvil,
    «Fundamental»), la de cifras a **«Cifrado interválico»**, el renglón de referencia a
    «Sonidos fundamentales en este ejercicio», el plegable del móvil a «Fundamentales y
    cifrados», y las frases del enunciado, de la corrección y de la solución se rehacen en
    consecuencia; en el informe que se envía, las columnas de fallo son ahora `fundamental`
    y `cifrado`.
    - **No cambia** el *grado de la escala del bajo* —los circulitos de Gjerdingen—, que ahí
      sí es un grado: se sigue llamando así en la pantalla y en el configurador.
    - Tampoco cambian los identificadores internos (`romano`, `cifra`): el vocabulario es de
      lo que se lee, no del código.

166. **EL SELLO: un fragmento cerrado es criterio del profesor** (29/9/2026, Diego: «prefiero
    empezar por establecer el procedimiento técnico para poder señalar un fragmento como
    *cerrado* y revisarlos todos a partir de ahí»). La decisión 163 tapó los dos caminos
    conocidos; esta cambia la regla de fondo: **el banco deja de ser algo en lo que hay que
    confiar y pasa a ser algo que se comprueba**.

    - Un fragmento cerrado guarda dos campos nuevos: **`cerrado`**, la fecha en que el
      profesor lo firmó, y **`huella`**, 16 dígitos hexadecimales sacados de su contenido
      armónico —tonalidad, compás y, de cada voz, su música, sus modulaciones y sus cifrados
      admisibles con el modelo delante—. **No** entra el repertorio de la lección, que se
      cambia a propósito desde otro sitio y haría saltar avisos falsos.
    - **Nada del programa reescribe un fragmento cerrado.** «Analizar» se niega y lo dice;
      «Guardar los cambios en el banco» se desactiva; `fundir()` lo deja intacto al importar
      —incluso el reemplazo por cambio de tonalidad— y lo cuenta al terminar. Para tocarlo
      hay que pulsar **«Reabrir para cambiarlo»**, que es un gesto del profesor.
    - **La huella se comprueba sola**: al abrir el configurador y al cargar un `banco.json`
      se recalculan todas las de los cerrados y, si alguna no cuadra, salta un aviso con los
      identificadores delante y la fila sale marcada en la tabla. Si ese aviso no aparece, lo
      que hay es exactamente lo que se firmó.
    - **La cola de repaso**: sobre la tabla del banco, «Repaso» con «Ver todos · Solo los que
      están sin cerrar · Solo los cerrados», y el contador «N de 140 fragmentos cerrados».
      Filtra **la tabla y las flechas de recorrido, no la ficha**. Al cerrar el fragmento en
      revisión con la cola puesta en «sin cerrar», se pasa solo al siguiente: repasar ciento
      y pico fragmentos es mirar, firmar, siguiente.
    - Cerrar exige no tener cambios sin guardar: primero «Guardar los cambios en el banco».

167. **El configurador enseña LAS DOS VOCES del fragmento** (29/9/2026, Diego: «al revisar
    el fragmento quiero conocer qué dos voces suministré, a la vez que los acordes que han
    sido asignados»). Hasta aquí la vista previa enseñaba **una sola**: la del tipo de
    ejercicio elegido en el filtro. En armonización de bajo se veía su bajo y las tres voces
    superiores las ponía el motor a su gusto —su soprano no se dibujaba—; en armonización de
    soprano se veía su melodía y **un bajo deducido**, no el suyo, que ni se dibujaba ni se
    usaba. Su soprano intervenía solo en un sitio discreto: `preferir()`, que pone delante
    como modelo el cifrado que contiene la nota que suena a la vez en la otra voz.

    - Ahora, cuando el fragmento tiene las dos voces y **comparten ritmo**, se fuerzan como
      **voces extremas** de la realización: su bajo abajo (`opciones.bajos`), su soprano
      arriba (`opciones.sopranos`), y el motor escribe solo tenor y contralto.
    - **Las voces del profesor van en morado** (`--voz-dada: #9412DC`, hermano hondo de
      `--marca`); las del motor, en negro; el rojo del error manda sobre los dos.
    - La vista previa deja de ser un dibujo y pasa a ser **una comprobación**: se pasa
      `Realizacion.auditar` sobre la realización con las dos voces dadas y los acordes que
      chocan salen en rojo, con la lista de problemas bajo la partitura.
    - **Medido antes de hacerlo**: de los 140 fragmentos, 110 tienen las dos voces y **104
      de esos comparten ritmo** —mismo número de ataques y en los mismos tiempos—, así que
      una sola rejilla de acordes vale. Los seis que no (`A3-1-29`, `A3-2-11`, `A3-3-04`,
      `A3-5-11`, `A4-11-01`, `A4-11-07`) se dicen bajo la partitura y se dejan como estaban.
    - **Solo el configurador**, por ahora. La pantalla del alumno no cambia: queda anotado
      que en análisis y audición la realización podría llevar también sus voces extremas, y
      que la solución de un ejercicio de soprano podría escribir su bajo en vez del deducido.
    - De paso, un fallo de orden: `cargarDelBanco` apuntaba `estado.banco` **al final**, de
      modo que la vista previa se dibujaba sin saber de qué fragmento venía y la otra voz
      llegaba un paso tarde. Ahora se apunta antes de pintar.

169. **Lo que da el ejercicio, en color; lo que sale de lo que escribe el alumno, en negro**
    (29/9/2026, Diego: «destacar en morado las notas propuestas por el ejercicio —y los
    circulitos del mismo color—, de manera que se distinga fácilmente lo propuesto de lo
    escrito por el estudiante»). Sale de un desajuste que había creado la 167: en el
    configurador el bajo pasaba a morado y **sus circulitos de grado seguían en negro**, que
    es justo al revés.
    - **El circulito del grado toma el color de la voz que anota.** Con el bajo dado, en
      color como él; con el bajo deducido de los acordes del alumno, en negro.
    - **Armonización de bajo**: el bajo y sus grados, en color; la realización que sale de
      su cifrado, en negro. **Armonización de soprano**: la melodía, en color; el bajo
      deducido y las voces de en medio, en negro.
    - **Análisis y audición, en negro entero.** El color solo dice algo cuando en la misma
      partitura hay también algo del alumno; ahí no escribe ninguna nota —se le dan el bajo
      y la realización y solo los nombra—, así que todo iría en color y el color dejaría de
      distinguir nada.
    - En el configurador, las dos voces del profesor en color y el tenor y la contralto del
      motor en negro, como en la 167.

170. **El candado, solo cuando está cerrado** (29/9/2026, Diego). La chapa junto a la
    partitura llevaba un candado abierto cuando el fragmento no estaba firmado, y confundía:
    un candado dibujado se lee como «aquí hay cerradura», esté o no echada. Ahora, sin
    cerrar, no hay candado; cerrado, 🔒 con su fecha.

171. **La sensible sube a la tónica salvo que el acorde se quede sin quinta** (29/9/2026,
    Diego, sobre `A3-1-22`: «aquí no resuelves la sensible pero podrías hacerlo»). En ese
    fragmento, en Fa M y con su melodía en la tercera (la), la séptima si♭ del V7 baja a la
    y la sensible mi se va al do en vez de subir al fa. Reconstruido el caso, resolverla
    dejaría la tónica en fa – la – fa – la: **sin quinta y con la tercera doblada**, una
    disposición que el motor no genera nunca.
    - **La regla queda así**: la sensible sube siempre en la soprano; en las voces
      interiores sube también, salvo cuando es la única voz que sostiene la quinta del
      acorde, y entonces puede bajar a ella para que la tríada quede completa (la excepción
      clásica que admiten Aldwell y Schachter). En el bajo no se mira: la Regla de la octava
      lo hace descender del 7.º al 6.º en la escala descendente, que ahí es lo correcto.
    - **El auditor pasa a avisar también en el tenor y la contralto**, pero solo cuando
      subir era posible. Antes callaba siempre fuera de la soprano, y por eso la línea de la
      vista previa decía «sin problemas de conducción» en el caso que Diego señaló.
    - **El motor NO cambia**, y está medido: subir el peso de la sensible en las voces
      interiores de 6 a 30 quita **un** aviso de sensible y añade **dos** de quinta u octava
      por movimiento directo (aparece `A4-10-07`). Cambiar una falta por dos peores no es un
      arreglo, así que se deja como está y se escribe la regla.
    - **Lo que el cambio destapa**, con las dos voces forzadas: cuatro sensibles sin
      resolver en las realizaciones modelo —`A3-2-01` (acorde 6), `A4-11-01` (13) y
      `A4-11-06` (7 y 16)—, de las que dos se ven también en la pantalla del alumno. No son
      faltas nuevas: son faltas que hasta ahora nadie decía.

172. **El unísono entre el bajo y el tenor** (29/9/2026, Diego, sobre `A3-2-01`: «podrías
    hacer en la mano derecha, penúltimo acorde, sol2 si2 re3; el unísono está justificado y
    sería correcto»). El tenor tenía que estar **estrictamente por encima del bajo**
    (`desde(v[0], mb, true)`), así que la disposición que él propone —el tenor doblando el
    bajo en la misma nota— no se generaba nunca. Sin ella, en el V de `A3-2-01` el motor no
    tenía más salida que juntar contralto y soprano en re4, y de ahí salían **octavas
    seguidas** al resolver en el I.
    - Ahora el tenor puede ir al unísono con el bajo. Lleva coste propio (20; 60 en el acorde
      final, donde cerrar juntando dos voces no vale), de modo que aparece solo cuando evita
      algo peor.
    - `A3-2-01` pasa a ser exactamente lo que él escribió: sol3 (bajo) · sol3 · si3 · re4, y
      el fragmento se queda **sin ningún aviso**: desaparecen a la vez las octavas seguidas y
      la sensible sin resolver, porque ahora el si está en la contralto y sube al do.
    - **Medido sobre los 140 fragmentos** antes de aplicarlo, con las dos voces forzadas: los
      avisos bajan de 38 a 33 y los fragmentos con algún aviso de 24 a 20. **Ninguno empeora**
      —8as 2→1, sensible 4→3, directa 9→8, séptima 10→8, el resto igual—. Es el primer cambio
      del motor de esta tanda que mejora sin contrapartida.
    - No hace falta tocar el banco: la realización no es dato guardado, se recalcula. Las
      cifras que Diego tenía asignadas en `A3-2-01` eran correctas; lo que estaba mal era la
      realización.

173. **El cambio de posición del mismo acorde, reconocido de verdad** (29/9/2026, Diego,
    sobre `A3-4-11` y `A3-4-12`: «señalas error por movimiento directo, pero es la excepción
    por cambio de posición del acorde»). La excepción estaba escrita en el auditor —los
    directos no se señalan cuando el acorde no cambia— pero **no llegaba a aplicarse casi
    nunca**: comparaba las cuatro voces CON SUS DUPLICACIONES. En `A3-4-11`, el II6 da
    `2,5,5,9` y el II en estado fundamental `2,5,9,9`; mismo acorde, distinto multiconjunto,
    así que el programa los tomaba por acordes distintos y señalaba la quinta directa.
    - Ahora se compara el **conjunto** de notas, sin duplicaciones: `2,5,9` contra `2,5,9`.
    - Vale para todo lo que colgaba de esa condición, no solo para los directos: tampoco se
      le pide a la séptima que resuelva ni a la sensible que suba mientras la armonía no
      cambie, que es lo correcto.
    - **Medido**: `A3-4-11` y `A3-4-12` se quedan **sin ningún aviso**, los directos bajan de
      8 a 6 y **no aparece ninguno nuevo**. Con el banco en 139 fragmentos, el total queda en
      30 avisos repartidos por 17 fragmentos.

174. **Cada voz tiene su propia lista de admisibles, y ahora se ve** (29/9/2026, Diego,
    sobre `A3-5-02`: «si se armoniza la soprano sola solo se podrá armonizar ese acorde con
    II6, pero si se armoniza el bajo solo también se podría usar el IV… ¿qué se puede
    hacer?»).
    - **No había nada que arreglar en el modelo de datos**: el banco guarda `bajo.respuestas`
      y `soprano.respuestas` por separado desde siempre, y en ese mismo fragmento ya decían
      lo que él quiere. Nota 3: el bajo admite **II6 y IV**, la melodía solo **II 5/3 y II6**.
      Nota 4: el bajo admite **I6/4, V y V7**, la melodía solo **I6/4 y IV**. En análisis y
      audición, donde se ven las dos voces y suena un solo acorde, la corrección exige el
      acorde modelo exacto (`exigeAcordeExacto`), así que tampoco hay ambigüedad.
    - Lo que faltaba era **verlo**: el configurador enseña solo la lista de la voz que se
      revisa —la del tipo de ejercicio elegido arriba— y por eso parecía haber una sola.
    - Nueva columna en la tabla de revisión, **«El bajo admite» / «La melodía admite»**: los
      admisibles de la otra voz en esa misma nota, con su cifrado, el modelo destacado, en
      gris y solo de lectura. Aparece únicamente cuando el fragmento tiene las dos voces y
      comparten ritmo; si no, las notas no se corresponden una a una y comparar no
      significaría nada.
    - **Medido de paso**, sobre los 103 fragmentos con las dos voces alineadas (461 notas):
      **303** tienen el mismo modelo en las dos voces; **116** difieren solo en el cifrado con
      el mismo fundamental —casi todas V contra V7, el mismo acorde con la séptima o sin
      ella—; y **42** tienen **acordes distintos**, es decir, el fragmento dice una cosa al
      armonizar el bajo y otra al armonizar la melodía. No es necesariamente un error —son
      dos ejercicios distintos y en cada uno falta la otra voz—, pero conviene saber si es a
      propósito. Ejemplos: `A3-4-03` nota 4 (bajo II6 · soprano IV), `A3-6-01` nota 3 (bajo IV
      · soprano I6/4), `A4-11-06` nota 15 (bajo V · soprano II).

175. **«Revisando: el bajo · la melodía», junto al editor de fragmentos** (29/9/2026,
    Diego: «¿dónde está ese desplegable que permite cambiar de lista?… no quiero que decida
    el de A, está muy lejos del editor del banco»). No existía tal desplegable: la voz la
    decidía el de «A · Preparar una ficha» y **solo en el instante de pulsar «Cargar»**,
    porque `cargarDelBanco(e, modo)` recibe el modo una vez. Con el fragmento ya abierto,
    cambiar aquel desplegable no hacía nada, y además metía dos tareas distintas —preparar
    una ficha y revisar el banco— en el mismo control.
    - Mando propio bajo el título «El fragmento en curso», encima del cuadro de texto:
      dos botones que recargan **el mismo fragmento en la otra voz**, sin tocar el filtro de
      arriba. El botón de la voz que el fragmento no tiene escrita sale desactivado.
    - Conserva el tipo de ejercicio elegido si ya corresponde a esa voz —análisis, audición
      y armonización de bajo van todos con el bajo—, para no cambiar las opciones del paso 3
      sin motivo.
    - Avisa antes de cambiar si hay cambios sin guardar, como las flechas de recorrido.

199. **Un rótulo de modulación escrito a mano no se descarta nunca** (30/9/2026, al importar
    el primer fragmento de repertorio real: el tema de *La lista de Schindler*).
    - **El fallo.** `sinTonicizaciones` borra una modulación que va y vuelve en dos notas o
      menos: nació para las modulaciones DEDUCIDAS de un cambio de armadura, donde una ida y
      vuelta tan corta suele ser una tonicización de paso. Pero se aplicaba también a los
      **rótulos que Diego escribe en la partitura**, y entonces hacía justo lo que él prohibió
      el 28/9 —«si yo asigno una modulación en un punto no puedes modificarlo, mi criterio es
      experto»—. En el fragmento de Schindler sus dos rótulos, «Si♭ M» en la nota 2 y «sol m»
      en la 4, desaparecían **sin decir nada** y el fragmento entraba en el banco sin
      modulación: justo lo contrario de lo que ilustra.
    - **La regla ahora**: lo escrito a mano manda siempre; lo deducido de la armadura se sigue
      filtrando. Los rótulos viajan marcados con `mano: true` desde `porTexto`.
    - **Medido** sobre los 16 archivos de lecciones, las dos voces, 270 fragmentos: **11
      cambian**, y los once ganan modulaciones que Diego había escrito y se estaban tirando
      (A3-8, A4-10 5 y 6, A4-11 2 y 9). En el banco esas modulaciones ya están —las había
      vuelto a poner a mano, una por una, en el configurador—, así que el banco no se mueve:
      lo que se ahorra es tener que repetir ese trabajo con cada fragmento nuevo.
    - **Enlace a la partitura de verdad** (Diego: «¿podría poner un enlace a la partitura de
      la web de MuseScore?»). Un campo `enlace` junto a `autor` y `obra`. Se escribe dentro de
      la misma marca `@…` —una dirección `https://…` en cualquier punto se saca sola del
      título y se guarda aparte— o en su casilla del configurador, que exige `http(s)://`
      para no guardar direcciones a medias. Bajo la partitura, tras el crédito, sale **«Ver la
      partitura»**, que abre otra pestaña con `rel="noopener noreferrer"` y dice en el globo a
      qué dominio lleva. Tampoco entra en la huella: los 26 sellos siguen intactos.
    - **Lo que el enlace NO resuelve**: apunta a una página de fuera, que puede cambiar,
      desaparecer o pedir suscripción, y cuyo arreglo es de un tercero. Es un enlace, no una
      copia, que es justamente lo que lo hace admisible con una obra de derechos vivos.

198. **De qué obra viene cada fragmento** (29/9/2026, Diego: «quiero tomarlos de partituras
    de música… ¿cómo podría hacer para introducir estos fragmentos y que luego pudiera
    identificar de dónde provienen?»). Un fragmento del banco podía venir del tema de *La
    lista de Schindler* o de la *Kreisleriana* y el banco no guardaba de eso ni rastro:
    `fuente` es el nombre del ARCHIVO del que se importó, no la música.
    - **Cómo se escribe, en la partitura de MuseScore.** Un texto de pauta o de sistema que
      empieza por **`@`**, dentro del fragmento (lo más claro, sobre su primera nota):

          @W. A. Mozart: Sonata K. 283, III, cc. 1-8

      Lo que separa el autor de la obra son los **primeros** dos puntos; los siguientes se
      quedan dentro del título. Si la obra va entera entre comillas se le quitan —las dos
      formas que probó Diego, con comillas y sin ellas, dan lo mismo—, pero unas comillas de
      apodo dentro del título («Patética», los corales de Bach) se respetan. Sin dos puntos,
      todo es obra y no hay autor.
    - **Por qué la `@`.** El texto de procedencia se lee ANTES que los rótulos de tonalidad,
      así que un título con un tono dentro no puede marcar una modulación falsa. Medido: sin
      la `@`, «Re menor de Mozart» se lee como re menor; con ella, nada de lo que va detrás
      se lee nunca como tonalidad. Y al revés: «Sol M» sigue marcando su modulación como
      siempre, en el mismo fragmento que lleva la marca de obra.
    - **Dónde se guarda.** Dos campos nuevos en la entrada, `autor` y `obra`, junto a
      `fuente`, que sigue siendo el archivo. Si un archivo trae el bajo y otro la melodía, la
      obra se hereda al fundirse las dos voces y nunca pisa la que ya hubiera.
    - **NO entra en la huella del sello.** `contenidoArmonico` solo mira la música y las
      respuestas, así que se le puede poner la procedencia a un fragmento ya firmado sin
      reabrirlo. Comprobado sobre los 26 cerrados con su huella guardada: **0 sellos rotos**,
      antes y después.
    - **A mano, sin volver a importar.** En el revisor, bajo la partitura, una casilla **«De
      qué obra viene»** que sale rellena y se escribe o se corrige ahí mismo —también en un
      fragmento cerrado—. Se escribe igual que en la partitura pero sin la `@`, que allí solo
      sirve para distinguir el texto de los rótulos de tonalidad. En la tabla del banco, una
      **♪** junto al identificador marca los fragmentos que ya tienen obra, con ella en el
      globo: de un vistazo se ve lo que falta por documentar.
    - **Qué ve el alumno** (Diego, 29/9, eligiendo entre cuatro opciones: «desde el
      principio»): bajo la partitura, en cursiva y pequeño como el pie de una ilustración,
      *De W. A. Mozart, Sonata K. 283, III, cc. 1-8*. Saber de quién es sitúa el pasaje. Es
      distinto de la banda de arriba, que dice de qué LECCIÓN viene el ejercicio.
    - **Pendiente, para el nivel B** (la textura real, no solo el esquema): dónde vive la
      partitura completa. Diego lo deja para cuando llegue; el campo `obra` vale igual para
      las dos salidas que se barajaron —un archivo aparte por obra, o más pentagramas en el
      de la lección—, así que nada de lo que se escriba ahora se pierde.
    - **Derechos.** El esquema armónico que extrae Diego es trabajo suyo y la sucesión de
      acordes no es de nadie; citar la fuente es lo deseable. Publicar en una web abierta la
      **textura real** de una obra con derechos vivos —*La lista de Schindler* es de 1993— no
      es lo mismo que usarla en clase. La *Kreisleriana* (1838), Bach, Mozart o Schubert no
      tienen ese problema. Queda anotado aquí para cuando se decida el nivel B.

197. **El recorrido del cursor en un fragmento que modula** (29/9/2026, Diego: «resulta
    confuso al llegar al punto del acorde pivote… hemos de clarificar los movimientos
    automáticos del cursor en este momento y facilitar la entrada al estudiante»).
    - **Cómo estaba.** El recorrido era *función → fundamental → cifrado* y a la nota
      siguiente, y la fila **«Tonalidad» no entraba en él nunca**: en un fragmento de quince
      notas el cursor pasaba por las quince sin detenerse ni una vez en ella. Solo se llegaba
      pulsando la casilla, o con la flecha ↓, y únicamente de la nota 2 en adelante.
    - **Un fallo que venía de la 194: el tono de PARTIDA no se podía marcar.** La casilla 0
      se dibujaba pulsable, pero `seleccionar()` conservaba un candado `i === 0` anterior a
      aquella decisión y el clic no hacía nada; las flechas tampoco llegaban. La corrección,
      en cambio, sí lo exigía: **«Tonalidad de partida: sin marcar»**, medido. El alumno
      perdía ese punto sin manera de contestarlo.
    - **Ahora, en la NOTA 0 lo primero que se pide es el tono de partida**, cuando las
      tonalidades se piden: *tonalidad → función → fundamental → cifrado*. En las demás notas
      la fila «Tonalidad» sigue **fuera** del recorrido automático (Diego, 29/9, eligiendo
      entre cuatro opciones): el cambio de tono se marca cuando se oye, no acorde por acorde,
      que sería una pulsación de más en cada nota de un fragmento que casi nunca modula.
    - **En el acorde PIVOTE, las dos lecturas van seguidas y el cifrado cierra la nota**:
      *función y fundamental en el tono de partida → función y fundamental en el tono nuevo →
      cifrado*. Antes el cifrado se colaba entre las dos lecturas y partía en dos el mismo
      razonamiento. El cifrado es uno solo porque el acorde es el mismo. Matiza el orden de
      la 95, que ponía el cifrado en medio.
    - Funciona igual **se marque el tono antes o después** de cifrar el acorde: marcándolo
      antes, el recorrido sale seguido; marcándolo después —que es lo natural, porque el
      cambio se reconoce al oírlo— el cursor va a la primera casilla de ESA nota que quede
      por rellenar, que es ya la función del tono nuevo. Comprobados los dos caminos.
    - Detalles del arreglo: `camposDe(j)` incluye `tonalidad` en la nota 0 y pone `cifra` al
      final; `campoInicial(j)` es sencillamente la primera casilla del orden de esa nota;
      `valorDe` sabía leer todas las casillas menos la de tonalidad; y el tono de partida
      bien marcado se da por acertado al reabrir, o el cursor volvería a él en cada intento.
    - Comprobado que **no cambia nada** donde no debe: con las tonalidades dadas, sin fila de
      tonalidad, sin funciones y en un ejercicio suelto del corpus, el recorrido es el de
      siempre.

196. **En el móvil, el teclado flotante es solo para las teclas** (29/9/2026, Diego: «en la
    interfaz de móvil, reduce el tamaño de la partitura en un 10 % para que quepa mejor en
    la pantalla más pequeña… saca del espacio flotante de los selectores de cifrado la
    casilla de sonar cuando se selecciona y el botón sobre cifrados. Muévelos a la parte
    baja del encabezado, de manera que se aproveche más espacio en el espacio flotante.
    Incorpora en estos controles flotantes los botones sobre funciones tonales»).
    - **La partitura, un 10 % más pequeña** en pantalla estrecha o baja (los dos mismos
      umbrales de siempre: 719 px de ancho o 559 de alto). Se multiplica la **anchura** del
      `svg` por 0,9 y el alto va en `auto`, así que la proporción se mantiene: medido, 666 →
      599 px (0,899). Matiza la 115 —«siempre a su tamaño natural»—, que era contra el
      estirón del fragmento corto, no contra el tamaño en sí: una negra sigue midiendo lo
      mismo tenga el fragmento 3 notas o 17, solo que un 10 % menos en el móvil.
    - **«Sonar al elegir» y «Cuadro de cifrados» salen del teclado flotante** y se van al
      **segundo renglón de la barra**, bajo el encabezado, junto a «Grados del bajo» y
      «Posición melódica». Abajo quedan **solo teclas**. En pantalla grande siguen donde
      estaban (128 y 132): la casilla en el primer renglón de paletas a la vista y el
      acceso al cuadro al pie, centrado bajo las teclas que explica.
    - Con eso, **el renglón de la función tonal recupera el ancho entero**: T, S y D iban
      estrujados en poco más de media pantalla porque compartían línea con «Sonar al
      elegir». El teclado flotante pasa de 222 a 192 px de alto en el móvil en vertical
      (390 × 844) y de 178 a 148 en horizontal (844 × 390).
    - Lo hace `colocarMandos()` en `app.js`, que **mueve el nodo** —no lo vuelve a crear—,
      así que la casilla conserva su estado y su escuchador, y el botón sigue abriendo el
      cuadro. Se recoloca en cada repintado de paletas y en cada `resize`, y antes de medir
      el hueco que el teclado deja al cuerpo. Comprobado el vaivén escritorio → móvil →
      escritorio → horizontal: los dos mandos van y vuelven, la casilla desmarcada sigue
      desmarcada y no salta ningún error.

195. **El porcentaje de armadura ajena lo pone el profesor** (29/9/2026, Diego: «quiero
    poder especificar el porcentaje de fragmentos que cumplirán la condición… entre 0 y 100 %
    y cualquier porcentaje sin decimales»). La 190 sorteaba el cupo dentro de una banda fija
    del 25 al 75 %; ahora el número lo dice él.
    - Casilla de cifra con flechas de subir y bajar **«… en qué % de la ficha»**, al lado
      del desplegable de la tolerancia y hecha como las de los compases (Diego, 29/9: un
      desplegable de 101 opciones era incómodo). De 0 a 100, sin decimales. Con 0 % no le
      toca a ninguno; con 100 %, a todos.
    - El cupo es **exacto**: `redondeo(n · %)` de los `n` ejercicios de la ficha, y **cuáles**
      sale de la semilla, así que el mismo enlace da siempre los mismos. Comprobado con
      cuatro semillas y nueve porcentajes: clavado en todos, y también en fichas de 1, 2, 3,
      5, 7 y 20 ejercicios.
    - Los **enlaces repartidos antes**, que no llevan el porcentaje, conservan la banda del
      25 al 75 % de la 190: comprobado.
    - La tolerancia (±1, ±2, ±3) y el porcentaje son dos interruptores distintos y cualquiera
      de los dos en «No» / 0 % apaga la opción.

194. **Con las tonalidades por pedir, el tono de partida también lo marca el alumno**
    (29/9/2026, Diego: «si se selecciona "Pedirlas"… no se debe mostrar, debajo del
    fragmento, la tonalidad al comienzo de las fundamentales hasta que no la marque el
    estudiante. Y, al mismo tiempo, no le debe aparecer la tonalidad inicial mostrada por
    defecto, sino que ha de marcarla él»). La casilla 0 de la fila «Tonalidad» se rellenaba
    siempre con el tono del fragmento y venía fija, también cuando las tonalidades se piden:
    con eso se regalaba la mitad del ejercicio y el rótulo del renglón lo cantaba encima.
    - Con `pedir`, la casilla 0 sale **vacía y editable**, el rótulo del renglón no se
      escribe hasta que él marca, y el tono de partida del pivote de la primera nota (188)
      tampoco. Con `dadas` no cambia nada.
    - La **paleta de la primera nota** ofrece ahora, delante de las vecinas, **el tono del
      propio fragmento**: es lo que se pregunta ahí. Marcarlo no parte el acorde en dos
      lecturas —solo lo hace si el tono marcado es otro, que es el pivote de la 188—.
    - La **corrección** pide esa casilla: acierto si coincide con el tono que rige en la
      nota 1, y deja de contarse como marca sobrante. El comentario lo dice por separado
      —«Tonalidad de partida: bien marcada (Fa M)» · «sin marcar» · «has marcado Si♭ M (no
      es esa)»—, por escrito y en voz alta, y al reintentar se borra si estaba mal.
    - Comprobado en los tres casos, y con `dadas` intacto.

193. **Las alteraciones llevan memoria de compás** (29/9/2026, Diego: «es necesario
    emplear un bemol mostrado explícitamente sobre el si del penúltimo acorde, pues como
    están dentro del mismo compás, el si becuadro de dos compases antes sigue vigente para
    ese si»). Cada nota se comparaba **solo con la armadura**, sin memoria de lo escrito
    antes en el compás, y eso escribía mal en los dos sentidos: el si♭ que viene detrás de un
    si♮ se quedaba sin bemol y se leía becuadro —el caso que él señala, que cambia la nota
    que suena—, y una alterada repetida en el compás repetía la alteración sin necesidad.
    - Ahora se lleva la cuenta **compás a compás, por letra y octava**, como manda la
      notación: se escribe la alteración cuando la nota difiere de lo vigente en ese momento,
      y a partir de ahí lo vigente es ella. Dentro de un mismo acorde, dos voces con la misma
      nota no la repiten.
    - Se decide **de una vez para toda la partitura, en orden**, y el dibujo solo consulta:
      las notas se pintan en varias pasadas —el bajo por un lado, los acordes por otro— y con
      una comprobación suelta no había manera de llevar la cuenta.
    - Cierra de paso la cuestión que quedaba abierta en la 185: la alteración ya no se repite
      en la segunda nota del compás.
    - Comprobado: en Fa M, `fa – si♮ – si♮ – si♭` en un compás sale con ♮ en el primer si,
      nada en el segundo y **♭ escrito en el tercero**.

192. **La cadencia disimulada es prolongación de la tónica** (29/9/2026, Diego, sobre
    `A4-10-07`: «la técnica intermedia no es prolongación de la subdominante, sino cadencia
    imperfecta a la tónica —fa sol la♭, 6 7 1 según la regla de la octava—: hace una cadencia
    hacia la tónica pero disimula el salto en el bajo de quinta entre V y I para no
    interrumpir el fluir de la música hasta la cadencia final… Varios acordes que hacen
    S – D – T o D – T en inversión evitando el salto V – I en el bajo»).
    - El detector de prolongaciones pedía la **misma función en los dos extremos**, así que
      este tramo solo encajaba estirándolo hasta la subdominante siguiente —`S – D – T – S`—
      y salía con el nombre de la función equivocada.
    - Se reconoce ahora por lo que es: acaba en la tónica, la dominante va justo antes y el
      bajo se mueve por grados, sin el salto de quinta. La tónica de partida puede no sonar.
    - Hacen falta **al menos tres acordes**: con dos (`D – T`) la pareja se colaba dentro de
      cualquier sucesión y despedazaba las prolongaciones largas en trocitos.
    - **Medido sobre el banco: cambian 2 fragmentos de 125, y son los dos suyos.** `A4-10-07`
      pasa de «Prolongación de la subdominante» a «Prolongación de la tónica»; `A4-10-08`,
      igual, y además se parte en los dos tramos que de verdad tiene. Queda como **R‑53b**.

191. **La ficha se llena hasta el máximo de compases** (29/9/2026, Diego: «se muestran muy
    pocos fragmentos por ficha, solo 1 ó 2… los dos controles que filtran por número de
    compases total están pensados para los fragmentos que se imprimen en papel; me interesa
    que se practique una determinada cantidad de compases, me da igual si están organizados
    de dos en dos o en uno solo»). El fallo era **una línea** en `Banco.elegir`: en cuanto la
    suma llegaba al MÍNIMO se cortaba (`if (total >= min) break`). Con «de 20 a 26 compases»
    y fragmentos de diez, dos llenaban la ficha y ahí se quedaba. El mínimo no es donde se
    para: es el suelo.
    - Ahora se van tomando fragmentos mientras quepan sin pasarse del máximo. El primero
      entra siempre, aunque él solo pase del máximo: más vale una ficha larga que una vacía.
    - **Fuera el tope «Como mucho, ejercicios»** (`#ficha-n`), como él pidió: la ficha se mide
      en compases, no en número de fragmentos, y el tope solo servía para recortarla. Los
      enlaces antiguos que lo llevan siguen funcionando —`elegir` lo respeta cuando no hay
      presupuesto de compases—, pero los nuevos ya no lo escriben.
    - Medido sobre las lecciones largas, dándolas todas por cerradas y con 20–26 compases:
      `A4-10` pasa de 5 ejercicios (21–23 compases) a 6–7 (25–26); `A4-11`, de 4–5 (20–24) a
      6 (23–25); `A3-7`, de 6–7 (20–22) a 8 (24–26).
    - El cartel del configurador dice ahora en qué se mide la ficha: «tomará al azar los que
      quepan en 20 a 26 compases (unos 8 ejercicios)».

190. **La armadura ajena es un cupo de la ficha, no una moneda por fragmento**
    (29/9/2026, Diego: «la opción Armadura distinta de la tonalidad afecta a entre un 25 % y
    un 75 % de los fragmentos presentados al estudiante. Como mínimo un 25 %, como máximo un
    75 %»). Como estaba (185) era un 25 % de media, decidido fragmento a fragmento e
    independiente, de modo que una ficha corta podía salir sin ninguno o con todos.
    - Ahora es un **cupo sobre la ficha entera**: con `n` ejercicios se sortea con la semilla
      cuántos llevan armadura ajena, entre **⌈n/4⌉ y ⌊3n/4⌋**, y qué sitios son —los `n`
      sitios se ordenan por un dado sacado de la semilla y se toman los primeros—. Todo sale
      de la semilla y del número de ejercicios, así que el mismo enlace da siempre lo mismo y
      una ficha a medias se reanuda igual.
    - La ficha le dice su tamaño al banco (`filtro.nFicha`, puesto donde se conoce la lista).
      Sin él —la vista previa del configurador, un ejercicio suelto— se vuelve a la moneda de
      antes, que para un fragmento aislado es lo único que cabe.
    - **Comprobado** con ocho semillas y once tamaños de ficha (1 a 20 ejercicios): ninguno
      fuera del cupo, determinista, y ninguno con la opción apagada. Con 1 o 2 ejercicios no
      cabe estar dentro de la banda —25 % de 2 es medio ejercicio—: ahí toma el mínimo, uno.

189. **La resolución de la sensible puede ser indirecta** (29/9/2026, Diego, sobre un
    `A4-11` transportado a fa menor: «aquí señala un error —sensible que no va a la tónica—
    que no es tal. La sensible (sol) hace resolución indirecta hacia el la♭ que hace sonar la
    voz superior; suena sol3 – la♭3, sensible – tónica, aunque cada sonido lo haga sonar una
    voz diferente. Es correcto. Incorpóralo al repertorio»). Es una excepción de la XS4c: la
    norma pide que la sensible resuelva, **no que la resuelva esa voz**. Si otra voz hace
    sonar la tónica **en la altura esperada** —el semitono justo por encima, no en otra
    octava—, no hay falta.
    - Va en el **auditor**, que es donde estaba la falta. El motor sigue prefiriendo la
      resolución directa al escribir las voces: la indirecta la da por buena, no la busca.
    - **Medido sobre el banco: quita exactamente un aviso y no cambia ningún otro** —el del
      acorde 13 de `A4-11-01`, donde el si de la contralto baja al la mientras la soprano
      canta el do—. Es el mismo caso que él vio, transportado.
    - Queda como **R‑35b** en `REGLAS-DEL-MOTOR.md`. El texto del aviso, cuando sí procede,
      nombra ahora las dos excepciones.

188. **El pivote de la primera nota, también en la pantalla del alumno** (29/9/2026,
    Diego: «si el primer acorde es pivote y pertenece a dos tonalidades, ha de mostrarse al
    comienzo; las tonalidades mostradas no tienen sentido: no se puede modular de la menor a
    la menor»). Tenía razón: la pantalla decía `la m → la m`. Cuatro cosas, y una de ellas
    grave.
    - **Grave: un fragmento con el pivote en la primera nota no llegaba al alumno.** La
      validación de `Ejercicios.decodificar` daba «Modulación fuera del ejercicio (nota 1)»
      con `m.nota <= 0` y el ejercicio se descartaba entero, así que la ficha caía al corpus
      de ejemplo. Corregido a `m.nota < 0`.
    - Los topes `i > 0` que quedaban de cuando no se podía modular ahí: en `esDoble`,
      `esDobleFun`, `lecturaCon`, `marcarTonalidad` y en la casilla editable de la fila
      «Tonalidad». Quitados: el primer acorde se parte ya en sus dos lecturas.
    - La casilla de tonalidad de la nota 0 escribía siempre el tono del fragmento; si esa
      nota es el pivote, escribe **el que empieza ahí**, y el de partida va como rótulo del
      renglón que se deja. De ahí salía el `la m → la m`.
    - **Y el fondo del asunto, en `Ejercicios.parejasEn`**: en la melodía el acorde se guarda
      como pareja «grado|cifra» ya escrita en el tono que rige, y al pedir la lectura en el
      otro tono del pivote se construía el acorde con ese mismo grado **sobre la escala del
      tono pedido** —o sea un acorde distinto: el `VI` de Do M, la–do–mi, salía fa–la–do al
      leerlo en la menor— y se devolvía el grado sin traducir. Por eso el acorde común salía
      con la misma función en los dos renglones. Ahora el acorde se construye siempre en SU
      tono y solo se **relee** en el que se pide.
    - Comprobado sobre `A4-11-02` con el pivote en la nota 1: rótulo `la m → Do M`, renglones
      `la m` y `Do M`, y el primer acorde con función **T** en el renglón de la menor y **S**
      en el de Do mayor —I de la menor y VI de Do mayor, que es exactamente lo que dijo.

187. **Volver al tono del fragmento siempre es posible** (29/9/2026, Diego: «no permite
    modular a Do Mayor; esta tonalidad no es ofrecida en el desplegable»). Dos cosas, las dos
    arregladas.
    - El desplegable de tonalidad ofrecía **solo las cinco vecinas** del tono que rige. Con
      una modulación de por medio eso deja tonos sin retorno: desde Re M, el Do M del
      fragmento está a dos alteraciones y no aparecía, así que una vez ida la música no había
      manera de traerla de vuelta. Ahora, además de las vecinas, se ofrecen **el tono del
      fragmento y los que el pasaje ya ha visitado**, marcados «(vuelta)». Los filtros que
      limpian modulaciones al cambiar otra cosa respetan esa misma regla.
    - En la fila de un pivote, la primera opción decía **«(quitar)»** a secas y no decía a qué
      tono se volvía. Ahora dice «(quitar) · sigue en Do M».

186. **El acorde común, leído en los dos tonos, también en la melodía** (29/9/2026, Diego,
    sobre `A4-11-02`: «en el primer acorde ha de aparecer ya que el primer acorde es el acorde
    común entre la menor (I) y Do Mayor (VI); ya han de aparecer los tonos por los que
    transita el pasaje, a los que se refieren esos dos renglones»). Tres piezas que faltaban:
    - **La doble lectura del pivote no funcionaba en la melodía.** En la armonización de bajo
      el grado se deduce de la nota del bajo y de la cifra, y basta leerlo con otra tonalidad;
      en la melodía el acorde se guarda como pareja «grado|cifra», ya escrita en el tono que
      rige, y el dibujo devolvía ese mismo grado para las dos lecturas —de ahí que en el
      pivote saliera `IV` encima de `IV`—. Ahora se deduce el bajo del acorde en su propio
      tono y se vuelve a leer en el que se pide.
    - **La partitura descartaba el pivote en la nota 0** (`dobles[i] && i > 0`), resto de
      cuando no se podía modular ahí. Quitado ese tope, y el tono de partida de esa primera
      nota pasa a ser el del fragmento, de modo que el acorde común **abre los dos renglones**
      en vez de quedarse en uno.
    - **Los renglones ya dicen a qué tono pertenecen.** El nombre del tono a la izquierda de
      cada renglón necesita la fila «Tonalidad», que la vista previa del configurador no
      construía; ahora la construye **cuando el fragmento modula**. Y en la nota 0 hecha
      pivote, el renglón que se deja lleva el tono del fragmento, que es el suyo.
    - El rótulo de encima del sistema dice los **dos** tonos cuando el pivote es la primera
      nota: `la m → Do M`, en el configurador y en la pantalla del alumno.
    - Comprobado sobre `A4-11-02` con el pivote en la nota 1: renglones `la m` y `Do M`, el
      primer acorde `I` sobre `VI`, y el cuarto `IV` sobre `II`.

185. **La armadura puede no ser la del fragmento** (29/9/2026, Diego: «que la tonalidad del
    fragmento no coincida con la armadura. Esto se da cuando, en medio de una composición, la
    música ha modulado a un tono distinto del que aparece en la armadura de la composición»).
    Es lo que le pasa a cualquier fragmento sacado del centro de una obra: el pasaje está en
    un tono y la armadura escrita es la de la obra. El fragmento **no cambia** —sigue en su
    tonalidad y puede modular dentro—; lo que cambia es la armadura con la que se presenta y,
    con ella, las alteraciones que hay que escribir: un fragmento en Do M con armadura de Sol
    M lleva **becuadro en cada fa**.
    - **Opción de la ficha, no del fragmento** (como él pidió), porque depende del curso, y
      **en el mismo grupo que «Curso»**, dentro de «En qué tonalidades» (Diego, 29/9): las
      dos cosas ajustan lo mismo —en qué tono se ve el fragmento y con qué armadura se
      escribe—, así que se eligen juntas.
      Tope de diferencia, en más o en menos, en el desplegable «Armadura distinta de la
      tonalidad»: **±1** (2.º de Armonía) · **±2** (1.º de Análisis/Fundamentos) · **±3**
      (2.º de Análisis/Fundamentos).
    - Le toca a **uno de cada cuatro como mucho**, y la elección es **determinista**: sale de
      la semilla de la ficha, del id del fragmento y de su posición, así que el mismo enlace
      da siempre lo mismo y una ficha a medias se reanuda igual. Medido sobre el banco con
      cinco semillas: 21,8 % de los servidos, ninguno fuera del tope ni con diferencia 0.
    - Se decide **después de transportar**, sobre el tono en el que el fragmento se presenta
      de verdad, y se descarta la armadura que pasaría de siete alteraciones.
    - Implementación: `ej.armadura = {tonica, modo}`, que solo usa `partitura.js` para elegir
      qué armadura dibuja y contra qué escala compara cada nota. Todo lo demás —grados,
      fundamentales, cifrados, corrección, sonido— sigue con `ej.tonalidad`. Al alumno no se
      le avisa: deducir el tono de verdad es el ejercicio.
    - Queda una cuestión de grafía por decidir: hoy la alteración se escribe en **todas** las
      notas que difieren de la armadura, también en la segunda de un mismo compás, donde en
      rigor ya no hace falta. No es incorrecto —es una alteración de cortesía— pero se puede
      hacer memoria de compás si Diego lo prefiere.

184. **La tonalidad de partida se puede cambiar aunque haya modulación** (29/9/2026,
    Diego: «en el editor de fragmentos, si incluye modulación, se ha de poder especificar la
    tonalidad en la que comienza el fragmento, aunque ese primer acorde sirva de pivote para
    comenzar modulación a otro tono —así, el primer acorde puede ser I de la menor y, al
    mismo tiempo, VI de Do Mayor—»). Es el complemento de la 183, y lo que lo impedía era un
    atajo viejo: tocar «Tónica» o «Modo» con una modulación puesta **las borraba todas** y
    además volvía a analizar el fragmento entero, con lo que se perdía también lo asignado a
    mano. Con eso, el caso que pide era imposible: al poner la tónica correcta desaparecía el
    pivote.
    - Ahora se **conservan** las modulaciones que siguen partiendo de un tono vecino desde la
      tonalidad nueva, se descartan solo las que dejan de serlo —y se dice cuántas— y **no se
      vuelve a analizar nada**: lo marcado es suyo. Lo que sí cambia es la lectura —las mismas
      cifras dan otros grados—, y eso se avisa.
    - En la primera nota hecha pivote, el tono de **partida** no aparecía en ninguna parte de
      la tabla, porque no hay fila anterior de donde leerlo. Ahora se escribe en la propia
      celda, delante del desplegable (`la m →` · `→ Do M`), con el recordatorio de que se
      cambia arriba, en «Tónica» y «Modo».
    - Comprobado con su ejemplo: fragmento en **la m**, primer acorde pivote a **Do M**; la
      casilla de grado lee `1 = 6` y la chapa del acorde, `I = VI`.

183. **El primer acorde también puede ser pivote** (29/9/2026, Diego: «el primer acorde del
    fragmento ya ha de servir para modular; se ha de poder emplear como acorde pivote para
    modular ese mismo primer acorde»). La columna «Tonalidad» del revisor solo daba
    desplegable de la nota 2 en adelante, y `modulaciones()` descartaba cualquiera puesta en
    la nota 0. Ahora la primera nota tiene su desplegable como todas.
    - **La tonalidad de partida no se pierde**: es la del fragmento —la de la armadura—, y
      es el «antes» del pivote. `Ejercicios.tonalidadAntes(ej, 0)` devuelve ya `ej.tonalidad`
      en vez de la tonalidad que rige en la nota 0, de modo que la casilla partida enseña las
      dos lecturas (`3 = 6`, `I = IV`) igual que en cualquier otro pivote.
    - **Y con ello queda dicha la doctrina del primer acorde** (Diego, misma conversación,
      corrigiendo lo que me había dicho antes): «el primer acorde **usualmente** es la tónica
      —en estado fundamental o en inversión— aunque no siempre; puede ser un acorde pivote
      para una inflexión tonal a otro tono o incluso un acorde cromático tomado prestado de
      otra tonalidad; esto lo comenzaré a introducir más adelante». El motor no exigía tónica
      en la primera nota, así que no hubo nada que aflojar; queda escrito en
      `REGLAS-DEL-MOTOR.md` como **R‑16b**.
    - De paso: las opciones de la 176 se ofrecen **también cuando el análisis deja una nota
      sin ninguna**, para que ninguna fila se quede sin una casilla que pulsar.

182. **Al alumno, solo fragmentos cerrados** (29/9/2026, Diego: «los fragmentos que se
    muestren a los alumnos para la práctica han de ser solo de los que están cerrados, para
    tener la tranquilidad de que los alumnos no se encontrarán con fragmentos problemáticos
    o, directamente, con problemas»). El sello (166) decía que un fragmento cerrado es
    criterio del profesor y que nada del programa lo reescribe; ahora además **estar cerrado
    es la condición para servirlo**.
    - Se fuerza en `Banco.elegir`, que es por donde pasa toda ficha, y no en el filtro que
      se codifica en el enlace: así **vale para los enlaces ya repartidos**, sin volver a
      generarlos, y ninguno puede saltárselo. El configurador sigue viéndolo todo, porque
      allí se filtra con `filtrar`.
    - Una ficha empezada que se reanuda se comprueba otra vez: si alguno de sus fragmentos
      se ha reabierto entretanto, se empieza de nuevo en vez de servirlo.
    - Al generar el enlace, el configurador dice cuántos de los que cumplen el filtro están
      cerrados y, si no hay ninguno, **se niega a generarlo**. Al alumno, si la ficha se
      queda vacía, se le dice que esos ejercicios aún no están revisados.
    - Estado al implementarlo: **26 de 139 cerrados**. Una ficha de toda la armonización de
      bajo sirve 8 de 8; una de la lección A3-6, 0, porque ninguno de sus 14 está cerrado
      todavía.

181. **La lección, junto al título del revisor** (29/9/2026, Diego: «añade encima del
    fragmento que se revisa el nombre de la lección, para que sepa qué acordes se espera que
    use el estudiante»). En el renglón «Revisión de las respuestas» va ahora, en morado, el
    código y el nombre de la lección —`A3-7 · II7 y IV7`— y detrás, como hasta ahora, la
    chapa del candado con el identificador del fragmento y su estado. El globo de la
    etiqueta lleva **la lista de acordes de esa lección** escrita en cifrado, que es la
    respuesta a la pregunta de fondo: qué se espera que use el alumno.

180. **Las reglas de duplicación avisan, no esconden** (29/9/2026, Diego, sobre
    `A3-7-11`: «no puedo poner I6 en el tercer acorde de este fragmento»). La nota 3 de esa
    melodía es un mi, y `candidatosSoprano` descartaba el `I 6` —cuyo bajo es mi— porque
    doblaría **la tercera de una tríada mayor en las voces extremas**. La regla es buena
    para ESCRIBIR las cuatro voces y mala para decidir QUÉ ACORDE CABE: habla del reparto,
    no de la armonía, y usada para descartar le escondía al profesor un acorde que él quiere
    admitir. Lo mismo ocurría con la séptima y la sensible dobladas.
    - `Reglas.candidatosSoprano` acepta un modo **permisivo**: esas tres reglas dejan de
      descartar y pasan a **avisar**, con el texto en el globo del acorde («dobla la tercera
      de una tríada mayor en las voces extremas», etc.) y la chapa marcada como «con aviso».
    - El modo permisivo se usa **solo en la lista que se le ofrece a Diego** (la de la 176).
      El motor sigue **proponiendo** con las reglas duras, así que ningún modelo del banco
      cambia: comprobado, el `I 6` sigue fuera de la propuesta automática y dentro de la
      lista que él puede marcar.
    - Es el mismo principio de la 179 y de la 177: lo que es de realización no decide lo que
      es de armonía, y donde hay criterio, decide él.

179. **El 6.º grado elevado, marcado nota a nota** (29/9/2026, Diego, sobre `A3-6-09`:
    «cómo introduzco el si becuadro del IV mayor, porque quiero que el si suba al do♯ y de
    ahí al re»). En el modo menor, la octava ascendente eleva el 6.º y el 7.º grados, y eso
    convierte el **IV en mayor** y el **II en menor**. El motor sabía construirlo —la
    tonalidad con `{melodica: true}`—, pero solo lo elegía cuando la nota de la melodía
    obligaba a ello; con la melodía en sol, que está en las dos formas, se quedaba con el
    si♭. En el ejercicio de **bajo** el problema no existía: el si♮ está escrito y el 6 sobre
    él ya da el IV mayor —así lo tiene el propio `A3-6-09`, cuyo bajo es re · si♮ · do♯ · re—.
    El agujero estaba en el de **melodía**, donde el bajo lo deduce el motor.
    - **No es un acorde nuevo, y es a propósito**: `IV 6` con si♭ y `IV 6` con si♮ son la
      **misma respuesta** para el alumno —fundamental IV, cifrado 6—. No es, pues, una opción
      de la lista sino una propiedad del pasaje, y va en la columna «Tonalidad», que es donde
      se dice qué escala rige en cada nota.
    - Interruptor **6.º ♮** por nota, que sale **solo donde de verdad cambia algo**: tono
      menor y algún acorde marcado que toque el 6.º grado. Lo marca el profesor; el motor no
      lo decide.
    - Dato: `melodica: [i…]` dentro de la voz. `Teoria.tonalidadesPorNota` devuelve en esas
      notas la menor melódica, así que el bajo deducido, las opciones de acorde, la
      realización y la auditoría lo ven todos sin tocar nada más, y viaja igual en el enlace
      de ficha y en el de ejercicio fijo.
    - **La huella solo lo incluye cuando lo hay**, de modo que los fragmentos firmados antes
      de existir esta marca conservan su huella intacta: comprobado sobre el banco, 26
      cerrados y **0 huellas rotas**.
    - Comprobado en el navegador sobre `A3-6-09`: al marcarlo en la nota 2, el `IV 6` pasa de
      bajo si♭ a bajo si♮ y el bajo deducido del fragmento pasa a ser re · si♮ · la · re. Las
      demás notas no cambian.

178. **Cambiar la función toca solo esa nota** (29/9/2026, Diego: «si cambio la función de
    un acorde, después de haber introducido varios acordes o modificado las asignaciones, no
    quiero que elimines las que he introducido… me haces perder todo el trabajo hecho»). En la
    melodía de soprano, el desplegable de función llamaba a `analizar(true)`, que rehace el
    fragmento **entero** con el motor: cada cambio de función borraba todo lo asignado a mano
    en las demás notas. Era el tercer camino silencioso de los que cerró la 163 y se había
    quedado abierto —el bajo no lo tenía, porque desde la 82 allí el cambio ya era local—.
    - Las dos voces se comportan ahora igual: se marcan los acordes del repertorio de la
      lección con esa función que caben en **esa** nota (`Reglas.candidatosFuncion` en el
      bajo, `Reglas.candidatosSoprano` filtrado por función en la melodía) y **no se toca
      ninguna otra**.
    - **Lo ya marcado de esa función se conserva, y se conserva delante**, así que el modelo
      elegido por Diego sigue siendo el modelo.
    - Si ningún acorde de esa función cabe en la nota, no se toca nada y se avisa: más vale
      dejarla como estaba que vaciarla.
    - Comprobado en el navegador, en las dos voces: al cambiar una función, de las 5 y 4
      notas del fragmento solo cambia la que se tocó.

177. **Cada ejercicio enseña su voz; la otra es otro ejercicio** (29/9/2026, Diego: «si
    estoy introduciendo los acordes de la soprano, entonces no debería aparecer la melodía
    del bajo, ¿no? Y viceversa cuando introduzco los del bajo»). **Deroga la 167**, que era
    propuesta mía. El bajo y la soprano de un fragmento son **dos ejercicios distintos sobre
    la misma música** —ya estaba dicho y anotado el 26/9, a propósito de los fragmentos cuyas
    dos voces no tienen el mismo número de notas—, no dos voces de una misma armonización.
    Dibujarlas juntas las obligaba a casar, y no tienen por qué.
    - **Medido sobre el banco**: de las 461 notas de los 103 fragmentos con las dos voces
      alineadas, **110 no casaban**, y **78 de esas 110 son el mismo acorde en otra
      inversión** —la lista del bajo dice `I 6` donde la de la melodía dice `I 5/3`, porque en
      el ejercicio de melodía el bajo lo deduce el motor—; solo 32 son otro acorde. De ahí
      salían **92 de los 103** avisos de conducción de la vista previa: ninguno era un error
      del banco. En `A3-3-08`, los tres avisos que salían eran los tres de esta clase.
    - La vista previa vuelve a enseñar **la voz del ejercicio** y el motor deduce las demás.
      Lo que aporta la otra voz se queda donde sí sirve: la columna «El bajo admite / La
      melodía admite» (174), con el aviso de que **no tienen por qué coincidir**.
    - Queda anotado, por si alguna vez hace falta: forzar las dos voces a la vez solo tiene
      sentido si antes se decide qué hacer con esas 110 notas, y eso es criterio de Diego.

176. **En la melodía, los acordes que contienen la nota salen siempre, marcados o no**
    (29/9/2026, Diego: «¿cómo hago para que aparezcan como opciones para el acorde 4 el
    V7?», y «NO puedo introducir ningún acorde aquí» en una nota sin nada marcado). En la
    armonización de bajo, la columna «Acordes admisibles» pinta **todas** las cifras del
    repertorio de la lección; en la de soprano pintaba solo los acordes que ya estaban
    marcados más los que hubiera propuesto el último análisis. Al traer un fragmento del
    banco no hay análisis —se cargan sus respuestas tal cual, que es lo que se quiere—, y
    entonces solo se veía lo marcado: se podía **quitar**, pero no **añadir** nada. Si la
    nota se había quedado sin ningún acorde marcado, no había ni una casilla que pulsar, y
    en un fragmento cerrado tampoco valía volver a analizar, porque el cierre lo impide.
    - Sin análisis reciente, se añaden **sin marcar** todos los acordes de la lista de la
      lección que contienen esa nota (`Reglas.candidatosSoprano`), detrás de los marcados.
      En la última nota se piden como final, para no ofrecer lo que no cierra.
    - No cambia nada de lo guardado: solo los deja a la vista para poder marcarlos con un
      clic. La modelo sigue siendo la primera marcada.

168. **El candado, junto a la partitura** (29/9/2026, Diego: «a veces voy repasando
    fragmento por fragmento y no quiero perder tiempo teniendo que subir a ver en la tabla si
    está cerrado o no»). Una chapa pegada al título «Revisión de las respuestas» que dice el
    estado —sin cerrar, cerrado con su fecha, o cerrado con la huella rota— y que **cierra y
    reabre con un clic**, sin volver a la tabla.

## 4. Vocabulario de cifrado (catálogo en `js/teoria.js`)

| id | Se ve | Significado | Voces superiores |
|---|---|---|---|
| `53` | — (♯ o ♮ si la 3ª va alterada: el V en menor) | tríada en estado fundamental | 3ª y 5ª diatónicas |
| `6` | 6 | tríada en primera inversión | 3ª y 6ª diatónicas |
| `64` | 6/4 | tríada en segunda inversión | 4ª y 6ª diatónicas |
| `+6` | +6 | V7 en segunda inversión (3ª, 4ª, 6ª sensible) | fundamental a la 4ª sobre el bajo; acorde de séptima de dominante |
| `65` | 6/5 | séptima en primera inversión | 3ª, 5ª y 6ª diatónicas |
| `43` | 4/3 | séptima en segunda inversión (II4/3 sobre el grado 6) | 3ª, 4ª y 6ª diatónicas |
| `42` | 4/2 | séptima en tercera inversión (II4/2: la 7ª preparada en el bajo) | 2ª, 4ª y 6ª diatónicas |
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
  modo: 'armonizar',                               // opcional: 'armonizar' | 'cifrar' (Análisis) | 'audicion' | 'soprano' (melodía dada)
  mostrarBajo: true,                               // opcional, solo en 'audicion': se ve el bajo mientras se escucha (por defecto, nada)
  acordes: ['I|53', 'I|6', 'IV|53', 'II|6', 'V|53', 'V|7+', 'V|65d'],   // solo en 'soprano': acordes disponibles (fundamental|cifra), por función
  formulaTST: false,                               // solo en 'soprano', opcional: false prohíbe la bordadura I – IV – I (por defecto se admite)
  funciones: 'dadas',                              // opcional: 'dadas' | 'pedir' (fila «Función» T · S · D)
  funcionesNotas: ['T', 'D', 'T', 'T', 'D', 'T'],  // opcional, con funciones: la función de cada nota (si falta, la del acorde modelo)
  modulaciones: [{ nota: 2, tonalidad: { tonica: 'G', modo: 'mayor' } }],   // opcional: desde la nota (pivote) rige la tonalidad nueva
  aviso: 'completo'                                // opcional, con modulaciones: 'completo' | 'existe'
}
```

Notas en notación anglosajona con octava científica (`C3` = do de la clave de
fa, segundo espacio; `F#2`, `Bb3`). Duración en negras (2 = blanca, 4 =
redonda). En una armonización de soprano (`modo: 'soprano'`) `compases` es la
melodía (`E4`, `F4`…) y cada respuesta es una pareja fundamental|cifra
(`respuestas: [['I|53', 'VI|53'], ['V|65d', 'V|+6'], …]`, la primera es la
modelo). Un ejercicio viaja en la URL como `#e=` + base64url del JSON
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

1. **El bajo** (o **la melodía**, en el tipo Armonización de soprano). Por texto (`do3 re3 | mi3 do3 | sol3r | do3.`: nombres en
   español, `|` entre compases, sin sufijo = blanca, `r` redonda, `n` negra,
   `c` corchea, `.` puntillo, octava 3 por defecto —4 en una melodía—) o arrastrando un archivo: **un `.mscz` de MuseScore tal cual,
   sin exportarlo a nada** (`js/musescore.js` abre el ZIP en el propio navegador, lee el `.mscx` de dentro
   y lo traduce al importador de siempre; también vale un `.mscx` suelto), un `.musicxml` exportado
   (`js/musicxml.js` toma el pentagrama inferior —el superior y la nota más aguda de cada acorde, en una melodía—, importa los silencios, suma
   las ligaduras de unión aunque crucen la barra de compás, quita los silencios que sobran al final del fragmento,
   y cierra un fragmento en cada barra doble; la tonalidad se
   deduce de la armadura y de la última nota, y se avisa si hay dudas) o un
   `.json` guardado desde el propio configurador. Tonalidad, compás, título y
   colección. El ejercicio puede escribirse en **pentagrama de piano** (para
   repartirlo también en papel): el bajo en el pentagrama inferior y la melodía en
   el superior, con el otro vacío. **Un archivo puede traer las dos voces a la
   vez** (melodía arriba, bajo abajo): se leen las dos y se carga la que pide el
   tipo de ejercicio, de modo que el mismo archivo sirve para un bajo dado y para
   una armonización de soprano sin volver a importarlo; al cambiar de tipo, la voz
   se cambia sola. Además, la voz que no se usa **fija la respuesta modelo**: en
   una melodía, el acorde que pone en el bajo la nota escrita; en un bajo dado, el
   que contiene la nota de la melodía (solo reordena los admisibles; no añade ni
   quita ninguno). Cada fragmento se cierra con una **barra doble**: la final
   (fina y gruesa) o la **doble fina**, que es la que conviene cuando el fragmento
   es corto. Un **texto de pauta con el nombre de una tonalidad** («Sol M», «mi m»)
   sobre una nota marca ahí una modulación —es la forma precisa de señalar el
   acorde pivote— y, sobre la primera nota, fija la tonalidad del fragmento.
2. **Tipo de ejercicio.** Cuatro tarjetas grandes: Análisis, Armonización
   (por defecto), Audición y Armonización de soprano (decisión 14).
3. **Repertorio y opciones.** Casillas para las diez cifras del catálogo
   (por defecto las nueve de la RO); pedir o no el grado; permitir o no
   corregir solo los errores; ayuda con los grados (ninguna / lista /
   paleta limitada); en Audición, qué ve el alumno mientras escucha (nada,
   por defecto, o solo el bajo); funciones tonales (sin fila, dadas o
   pedidas: decisión 20; al elegir la armonización de soprano se activa
   sola como «dadas», porque ese ejercicio parte del plan de funciones);
   en la armonización de soprano, en lugar de las
   cifras sueltas, los acordes disponibles por función tonal y la fórmula
   T S T (decisión 21);
   modelo sobre el grado 6 descendente (tercero: II4/3; cuarto: `+6`, que se
   guarda como `preferir: ['+6']`).
4. **Revisión.** «Analizar el bajo» ejecuta el motor y vuelca una tabla:
   nota, grado del bajo, una ficha por cifra del repertorio con casilla
   (admisible), grado que se derivaría y botón de modelo, más la regla y la
   explicación del motor. Las notas sin propuesta quedan en rojo. Columna
   «Función» (si hay fila de funciones): desplegable T · S · D por nota,
   rellenado con la función del acorde modelo; en una melodía de soprano,
   cambiarlo vuelve a analizar con esa función fijada. En una melodía de
   soprano las fichas son acordes (fundamental, cifra y, entre paréntesis,
   el bajo que resulta): primero los admisibles con el modelo delante y
   después el resto de acordes que contienen la nota, sin marcar. Columna
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
| 3b | Lectura directa de los archivos de MuseScore (`.mscz` y `.mscx`), sin exportar a MusicXML (`js/musescore.js`) | Hecha (21/9/2026) |
| 4 | Realización a cuatro voces (tres posiciones de Furno + conducción automática), contador de paralelas, sonido con el bajo doblado a la octava grave e instrumentos reales (piano, clave, órgano); tres tipos de ejercicio (Análisis, Armonización, Audición) | Hecha (20/9/2026) |
| 5a | Modulación en ejercicios propios: tramos, pivote común, dos avisos, corrección, configurador y MusicXML (decisión 6) | Hecha (20/9/2026) |
| 5b | Generador de bajos por combinación de fragmentos válidos de la RO, con modulación por acorde pivote | Pendiente |
| 6 | *Schemata* de IJzerman (marchas progresivas, Romanesca, Quiescenza); respuestas por combinación | Pendiente |
| 7 | Armonización de soprano: cuarto tipo de ejercicio (fundamental + cifra, bajo deducido, funciones tonales, motor de sucesiones válidas, enlace comprobado) y fila «Función» en todos los tipos (decisiones 20 y 21) | Hecha (20/9/2026) |
| 4b | Normas de enlace de la pauta de corrección incorporadas a la conducción automática (decisión 22) | Pendiente (siguiente) |
| 10 | Banco de fragmentos con etiquetas (se llena solo al importar) y fichas: un enlace da N ejercicios al azar de los que cumplan un filtro, encadenados y con resumen (decisión 26) | Hecha (21/9/2026) |
| 8a | Publicación en GitHub Pages (guía `PUBLICAR-EN-GITHUB.md`) | Hecha (20/9/2026): <https://djvgon.github.io/armonizar/> |
| 8b·1 | **Medida e informe** (`js/registro.js`): la aplicación mide sola la práctica —tiempo de trabajo, aciertos al primer intento y finales, detalle nota a nota con el acorde modelo como etiqueta de contenido— y, al terminar, enseña el informe con la nota sobre 10, deja copiarlo para pegarlo en Classroom y descargar el detalle en CSV (decisión 60) | Hecha (23/9/2026) |
| 8b·2 | **Envío al formulario** (`js/envio.js`): botón «Enviar al profesor» que abre un formulario de Google **ya relleno** con el resultado; el alumno solo pulsa Enviar. Identidad: el correo del centro, verificado por Google. La dirección plantilla la produce `CrearFormularioPractica.gs`; se pega en el configurador («Recogida de resultados»), que descarga `envio.json` para subir junto a `banco.json` | Hecha (23/9/2026) |
| 8b·4 | **Contenidos y cuaderno** (fase A): cada nota se etiqueta con un contenido del curso deducido con certeza (decisión 65) y viaja al formulario; `MontarCuadernoPractica.gs` arma la hoja «Cuaderno» con calificaciones, contenidos de la clase y semáforo por alumno, y se rehace sola en cada envío | Hecha (23/9/2026) |
| 8b·5 | **Contenidos declarados**: secuencias y prolongaciones etiquetadas por Diego en el banco, desde el configurador. Solo si la fase A demuestra que la rejilla se usa | Pendiente |
| 8b·3 | Calificación en Classroom vía API (solo en tareas creadas por el propio script; el alumno sigue pulsando «Entregar»). Opcional: corrección en el servidor para los ejercicios evaluables, de modo que las respuestas no viajen en el enlace | Pendiente |
| 9 | Análisis sobre partitura real, al estilo de NEO: imagen con puntos marcados por el profesor (en cada punto, cifra y grado) o vídeo con partitura y audio que se detiene en los puntos de cifrado. Misma corrección (parejas admisibles por punto, fijadas a mano en el configurador, con tonalidad por tramo). La imagen puede viajar dentro de un `.json` sin alojamiento; el vídeo (YouTube o archivo) necesita la publicación de la Etapa 8 | Propuesta (20/9/2026), pendiente de decidir |

Decisiones pendientes: el resto del cuadro azul (decisión 49) —préstamos
modales con apóstrofo (`II'`) y las demás dominantes secundarias (V/IV,
V/VI…), que hoy solo contemplan el V/V—; la sexta aumentada en menor.

### Pendiente: la interfaz en el móvil (anotado el 23/9/2026, a petición de Diego)

En pantalla grande se trabaja bien; en el móvil no. Medido sobre un fragmento de
14 notas (A3-8-08, armonización de bajo, con la realización a la vista):

| | ventana | página | partitura | paletas |
|---|---|---|---|---|
| Móvil vertical (390×844) | 844 | 1275 | 1109 px de ancho en una caja de 374 → **scroll horizontal** | y=839 |
| Móvil horizontal (844×390) | 390 | 1337 | y=483, alto 383 | y=880 |
| Escritorio (1400×900) | 900 | 1414 | y=459 | y=976 |

Los dos problemas, con sus causas:

1. **En horizontal no se ven a la vez la partitura y las paletas.** La partitura
   empieza en y=483 y las paletas en y=880: entre las dos suman 606 px en una
   ventana de 390. Encima, los 483 px de preámbulo (cabecera + recuadro +
   barra de sonido) son más altos que la pantalla entera, así que al abrir el
   ejercicio **no se ve una sola nota**.
2. **En vertical la partitura no cabe**: 1109 px de música en 374 de caja.

Y una causa que conviene arreglar primero, porque es barata y lo empeora todo:
los dos puntos de corte del CSS son **solo de anchura** (600 y 719 px). Un móvil
en horizontal mide 844×390: pasa de largo por los dos y recibe la disposición de
escritorio dentro de una ventana de 390 px de alto. Hace falta un corte por
ALTURA (u `orientation: landscape`).

Opciones, de menor a mayor coste:

- **Punto de corte por altura** (barato). Que el móvil en horizontal reciba la
  disposición compacta que ya existe.
- **Paletas fijas abajo** (barato-medio), al modo del teclado de una aplicación de
  ejercicios: la música se desplaza, los controles no se mueven nunca. Es el
  patrón habitual y ataca directamente el «ir y venir».
- **Plegar el preámbulo en el móvil** (barato): título y un botón ⓘ; el recuadro
  de lección, tonalidad y repertorio, detrás de un toque.
- **La vista sigue a la nota activa** (barato): al cambiar de nota, llevarla a la
  vista dentro de la caja de la partitura. Con scroll horizontal, quita todo el
  arrastre manual.
- **Tamaño de la partitura ajustable** (barato): `ESCALA_PX` ya existe.
- **Reflujo en varios sistemas** (caro): repartir la música en sistemas que quepan
  en el ancho, como hace cualquier editor de partituras. Es lo único que arregla
  de verdad el móvil en VERTICAL, y es reescribir la disposición de
  `partitura.js` (las casillas, los circulitos, las filas de función y tonalidad
  y el globo pasan a calcularse por sistema). Sustituye a la mejora pequeña
  «partir en dos sistemas los ejercicios largos».
- **Modo foco (una nota cada vez)**: desaconsejado. El alumno ha de pensar sobre
  la sucesión —la cadencia, el enlace—, y ocultar el contexto va contra eso.

Orden propuesto: los cuatro baratos primero (dejan el horizontal utilizable) y el
reflujo después (deja el vertical utilizable).

**Al día 25/9/2026.** Hechos los cuatro baratos: las paletas fijas abajo y la vista que
sigue a la nota activa venían de antes; el **corte por altura** y el **preámbulo
recortado** son la decisión 99. El horizontal queda utilizable (preámbulo de 504 → 210 px,
paletas fijas, casilla activa siempre a la vista). Queda **el reflujo en varios
sistemas**, que es lo caro y lo único que arregla el vertical: 1109 px de música en una
caja de 374.

Mejoras pequeñas anotadas: dibujar el bajo pinchando en un pentagrama como
alternativa al texto;
constructor de cifras al estilo teoria.com como alternativa a la paleta;
corrección inmediata nota a nota como opción.

## 9. Procedimiento de trabajo

- Diego conecta la carpeta del proyecto (la de Drive murciaeduca.es indicada
  en §2) desde la aplicación de escritorio; los archivos se escriben
  directamente allí, **cada uno en su subcarpeta**: la aplicación en
  `1 WEB (subir a GitHub)`, los dos documentos en
  `3 PROYECTO (documentación y fuentes)`. No se pide acceso a ninguna otra
  carpeta sin preguntar antes.
- Prueba de humo tras cada cambio: abrir `index.html` (un ejercicio del
  corpus), `pruebas.html` (sin discrepancias) y `configurar.html` (importar
  un MusicXML de `ejemplos/`, analizar, generar dirección, abrir como alumno).
- Una función por sesión; al terminar, la aplicación debe seguir abriéndose
  con doble clic y `pruebas.html` sin discrepancias.
- Al cerrar la sesión se actualizan **dos** documentos: este (decisiones nuevas,
  numeradas, y estado de las etapas) y **`BITACORA.md`**, que es el cuaderno de a
  bordo: en qué punto estamos, qué queda por hacer y por qué orden, qué espera una
  respuesta de Diego y qué ha propuesto él que todavía no se ha llevado a cabo.
  Lo que se decide va aquí; lo que está a medias o pendiente, allí. Nada de lo que
  Diego proponga puede quedarse solo en la conversación.
- Las respuestas del corpus son la fuente de verdad; el motor se ajusta a
  ellas, no al revés.
- Cuando la aplicación esté publicada, cada entrega a la carpeta de Drive va
  seguida de la subida a GitHub por parte de Diego (paso 6 de la guía); las
  direcciones para alumnos se generan siempre desde el configurador publicado.
- **Versión visible y caché.** Los HTML llevan la marca AAAAMMDD-HHMM en el pie
  —en el del alumno, junto al crédito de los sonidos, en letra pequeña— y
  cargan sus `.js` y `.css` con `?v=` esa misma marca. En
  cada entrega se actualiza la marca en `index.html`, `configurar.html` y las
  cuatro portadas de tipo de ejercicio (las siete páginas de `1 WEB`)
  (así el navegador vuelve a pedir los archivos cambiados y Diego puede
  comprobar qué versión tiene delante). Si tras subir a GitHub sigue viéndose
  la anterior, es la caché del navegador: recargar sin caché (Chrome
  Cmd+Shift+R; Safari Opción+Cmd+R) o esperar hasta diez minutos.
