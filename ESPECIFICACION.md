# App de armonización con cifrado barroco — especificación y estado

Documento de referencia del proyecto. Se lee al empezar cada sesión de trabajo
sobre la aplicación y se actualiza al cerrarla.

Última actualización: 20 de septiembre de 2026 (Etapas 0–4, 5a y 7 entregadas: prototipo, configurador, importación, realización a cuatro voces con conducción de voces y sonido, cuatro tipos de ejercicio —Análisis, Armonización, Audición y Armonización de soprano— con lo que ve el alumno fijado por tipo, fila de funciones tonales, atajos de teclado, compases ternarios y negras, modulación en ejercicios propios).

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
- **La aplicación vive en la raíz de esa carpeta**: `index.html`,
  `configurar.html`, `pruebas.html`, `banco.json` y las carpetas `css/`, `js/`,
  `fuentes/`, `sonidos/` y `ejemplos/`. Cada entrega sustituye esos archivos en
  su sitio; **nunca en una subcarpeta**. El 21-09-2026 se entregó por error a una
  subcarpeta `armonizar/`, que quedó como una copia a medias —sin `css/`, sin
  `fuentes/` ni `sonidos/`— mientras la aplicación buena se quedaba sin
  actualizar: se corrigió y se borró la subcarpeta.
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
