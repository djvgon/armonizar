# Bitácora

Dónde vamos, qué queda y qué está esperando a alguien. Se actualiza **al final de
cada sesión de trabajo**, antes de entregar.

Aquí no van las decisiones: esas viven en `ESPECIFICACION.md`, numeradas (1 … 84),
y no se repiten. Aquí va lo demás: lo que está a medias, lo que has propuesto y
todavía no hemos hecho, y lo que no puedo hacer yo porque depende de ti.

---

## Estado a 25 de septiembre de 2026

- **Versión en la carpeta de Drive:** 20260927-0940. **Pendiente de subir**, además de
  `js/banco.js` y **`banco.json`** (decisión 117: la numeración del programa; «Modulación al
  V» pasa de `A3-8` a `A4-10` y la fórmula T-S-T queda desactivada hasta la lección 8):
  `css/estilo.css` (decisión 115: en el móvil la partitura va siempre a su tamaño natural)
  y `js/teoria.js`, `js/ejercicios.js`, `js/app.js`, `js/configurador.js` (decisión 116: la
  función «—», sin función tonal, para el III), más las seis páginas HTML por la marca de
  versión. El banco no cambia.
- **Publicada en GitHub: la 20260927-0515. Nada pendiente de subir.** Comprobado el
  25/9 sobre el sitio publicado, no sobre la copia de la carpeta: el pie dice
  `20260927-0515`, el banco tiene 132 fragmentos con el IV7 de A3-7 en sus cuatro
  posiciones y la nota 6 de `A3-5-12` en `["53","6"]`, el doble sostenido está en la fuente
  incrustada, y los **1 980 transportes salen todos** (0 imposibles). Es decir: lo que ven
  los alumnos es lo mismo que hay aquí, decisiones 99 a 114 incluidas.
- **El banco de la carpeta parte del tuyo**, el que subiste a GitHub el 25/9 con
  `A3-3-04`, `A3-7-04` y `A3-8-08` corregidos, más dos arreglos míos a petición tuya:
  el **contenido de A3-7 y A3-8 puesto entero** —el IV7 con sus cuatro posiciones, como el
  II7— y la nota 6 de `A3-5-12` (IV 5/3 de modelo, II 6 admitido). **0 acordes modelo fuera
  de su lección** en los 132 fragmentos, y las ocho lecciones vuelven a ser acumulativas.
- **Los enlaces de armonización de bajo repartidos antes de la 113 cambian de
  significado:** donde pedían el grado de la escala del bajo, ahora piden la fundamental.
  Si alguno está en manos de alumnos, conviene volver a generarlo desde el configurador.
- **La marca de versión va un día por delante de la fecha real** (el reloj dice
  25/9 y la marca dice 26/9): viene de una sesión anterior. Se ha mantenido para que
  el número no parezca ir hacia atrás. Decir si se prefiere volver a la fecha real.
- **Banco:** **132 fragmentos**, 8 lecciones (A3-1 … A3-8). Subió de 131 al separar
  `A3-2-02`, que eran dos fragmentos pegados (decisión 73).
- **El banco de la carpeta lleva la revisión de Diego del 25/9** (33 fragmentos
  corregidos a mano) **más el arreglo de `A3-8-03`**, hecho por mí a petición suya:

  > *«Lo más sencillo es añadir una tónica de do mayor como anacrusa y poner el cambio
  > de tono (la VI = la II) en la primera negra del siguiente compás.»*

  Es la solución elegante al problema de la modulación en la primera nota: la anacrusa
  le da al pivote una nota anterior, así que ya no hace falta que el motor sepa modular
  en la nota 0. Queda así (comprobado con el motor, 0 avisos):

  | nota | fuerza | | |
  |---|---|---|---|
  | 1 · do (anacrusa) | débil | — | I de Do M |
  | 2 · do | **fuerte** (1.ª del compás) | 6 | **pivote**: VI de Do = II de Sol |
  | 3 · do | débil | +4 | V+4 de Sol |
  | 4 · si | media | 6 | **pivote**: I6 de Sol = V6 de Do |
  | 5 · sol | débil | 7/+ o — | V de Do |
  | 6 · do | fuerte | — | I de Do |

  El motor ya sabía leer anacrusas (`fuerzasMetricas`: «el primer compás, si viene corto,
  se pega al final del compás»), y había un precedente en el banco, `A3-3-21`.
- **Comprobaciones, todas en verde:** 0 incoherencias entre armadura, tonalidad y
  cifrado · 0 síncopas armónicas · 0 acordes fuera del repertorio de su lección ·
  0 subdominantes que vuelvan a la tónica · 0 finales que no sean tónica o
  dominante · abertura soprano-tenor dentro de la octava en los 3297 acordes ·
  0 solapes de los circulitos de grado · **0 segundas aumentadas** en las voces que
  escribe la aplicación, y tampoco ninguna en las 233 partes escritas del banco ·
  el corpus de la regla de la octava se reproduce sin discrepancias nuevas.
- **Avisos que quedan:** 6 fragmentos con la tonalidad marcada con (?) y **0** con
  algún aviso (eran 2; los dos se han resuelto al corregir el tono de `A3-3-08` y
  `A3-3-16`).

## En marcha

**Las lecciones nuevas.** Con la numeración del programa (decisión 117), lo que falta por
escribir es la **8 · Otros usos del IV, IV6 y VI** —la prolongación T – S – T, que Diego
dictó el 26/9— y la **11 · Modulación al relativo mayor** (`A4-11`), cuyos fragmentos está
escribiendo ahora. El archivo de MuseScore ha de llamarse
`A4-11. Modulación al relativo mayor - Fragmentos Bajo y soprano.mscz`.

De la lección 8 hace falta motor, no solo fragmentos: la bordadura I – IV – I ya la manda
la casilla «Fórmula T S T», pero la **cadencia plagal** y la **cadencia rota** (V – VI,
V – IV6, V7 – VI) están sin comprobar, y el banco tiene **0 cadencias rotas**. El enlace
`I – IV6 – I6` y el `V – IV6` sí los admite hoy.

Lo aclarado sobre la modulación al relativo:

- El motor **ya sabe leer la modulación al relativo mayor** en cuanto se le marca el
  pivote: en su primer fragmento da `VI de Do M` en el pivote, `V` y `V7` en los dos soles
  naturales y `I de Do M` en el do. Lo que no hace es adivinarla, y por eso el sol natural
  se quedaba sin ninguna opción.
- **Las modulaciones se marcan con una etiqueta de texto de pauta** sobre la nota del
  pivote (`Do M` al ir, `la m` al volver). Comprobado sobre su archivo: el importador las
  lee y las da por seguras. Ojo: A3-8 **no** lleva etiquetas —sus modulaciones se marcaron
  a mano en la tabla—, así que es un camino que no había usado.
- **Cada fragmento se separa del siguiente con una barra doble.** Su archivo solo tiene la
  barra final del compás 10, y por eso el importador ve un solo fragmento.
- Diego va a poner etiquetas y, en algunos casos, **el acorde sin inversión** (`I`, `V`…).
  Queda por hacer que el importador lea esos rótulos de grado: la idea acordada es que
  fijen la FUNDAMENTAL de esa nota y dejen la inversión al motor.
- **Pendiente y de fondo:** con el III de pivote, la realización escribe sol♯ (decisión
  116). Falta el **v natural** en menor.


**Recogida automática de resultados** (etapa 8b). Camino elegido el 23/9/2026:
**formulario de Google relleno de antemano**, con el correo del centro como
identidad verificada. Va en tres pasos:

- **Paso 1 — medir e informar. HECHO** (versión 20260924-0130). `js/registro.js`
  mide sola la práctica: tiempo de trabajo (el reloj se para si la pestaña queda
  en segundo plano), aciertos al primer intento y tras corregir, y el detalle
  nota a nota con el acorde modelo como etiqueta de contenido. Al terminar, el
  alumno ve su **nota sobre 10**, lo que más se le ha resistido, y dos botones:
  «Copiar el informe» (para pegarlo en Classroom) y «Descargar el detalle» (CSV).
- **Paso 2 — enviar. HECHO** (versión 20260924-0930). El formulario y su hoja ya
  existen en tu Drive, dentro de la carpeta **«Práctica armónica — resultados»**.
  En el informe hay ahora un botón **«Enviar al profesor»**: abre el formulario
  con los quince campos puestos y el alumno solo pulsa Enviar. Google añade su
  correo del centro, verificado. El configurador tiene un apartado nuevo,
  «Recogida de resultados», por si algún día hay que cambiar de formulario.
- **Paso 3 — calificar. HECHO** (23/9/2026). `MontarCuadernoPractica.gs` arma
  la hoja «Cuaderno» dentro de la propia hoja de respuestas: calificaciones
  (mejor nota de primer intento por alumno y práctica), contenidos de toda la
  clase y semáforo por alumno. Se rehace sola con cada envío.
- **Paso 4 — contenidos declarados.** Secuencias y prolongaciones etiquetadas por
  ti en el banco. **Solo si la rejilla de la fase A demuestra que la usas**; si no,
  te ahorras etiquetar 130 fragmentos.

## El transporte de tonalidad: lo que queda abierto

Hecho el 25/9 (decisión 102). Tres cosas que no cierro yo:

1. ~~**Los dos glifos que faltan en la fuente**~~ **HECHO** el 25/9 (decisión 114). El
   subconjunto pasa de 57 a 59 glifos —con 𝄪 y 𝄫— y, de paso, apareció debajo un fallo de
   la decisión 102: `intervaloEntreTonicas` metía una octava de más cuando la tónica de
   partida y la de destino tenían **la misma letra** (do → do♭, la → la♭), y eso
   descartaba tonos enteros en silencio. Con las dos cosas, los cuatro topes funcionan al
   100 %: de 51 de 1 452 y 226 de 1 980 transportes imposibles, a **0 y 0**. Comprobado
   además que el transporte es correcto, no solo posible: en los 1 980 transportes del
   banco, cada nota conserva su grado en la tonalidad nueva.
2. ~~**El reparto puede repetir tonalidad**~~ **HECHO** el 25/9 (decisión 110): reparte por
   rotación y no por sorteo, así que no repite ninguna mientras queden tónicas libres
   (de 3 repeticiones de 8 a 0). El configurador enseña la vuelta entera al generar el
   enlace.
3. **Unos pocos fragmentos están escritos altos.** `A3-2-09` y `A3-2-10` llevan el «bajo»
   entre do4 y fa4, no en registro de bajo; transportados hacia arriba llegan a si4.
   No es cosa del transporte —que conserva el registro ±6 semitonos— sino de cómo están
   escritos. Son de la misma familia que el punto 1 de aquí abajo.

## Te toca a ti

Cosas que he pedido y siguen abiertas. Las pongo todas juntas porque se han ido
quedando por el camino en distintas sesiones.

1. **A3-2-10, armadura equivocada.** El fragmento `la mi | do la | mi` lleva en tu
   partitura **un sostenido**, pero está en **la menor** (lo prueba el sol♯ de la
   soprano) y acaba en semicadencia sobre la dominante. La aplicación ya lo lee
   bien, pero mientras la armadura diga otra cosa seguirá marcado con (?).
   Hay que ponerle armadura de Do M / la m en los **dos** archivos de A3-2, el de
   bajos y el de sopranos.
2. ~~**Los fragmentos sin subdominante antes de la dominante final**~~ **CERRADO** el
   25/9 por Diego: «es porque en esas lecciones aún no se ha visto la subdominante». Eran
   110 en total; 56 caían en lecciones sin ninguna subdominante en su lista y los otros 54
   estaban en A3-4 … A3-8. Queda como dato, no como tarea.
3. ~~**Los 4 avisos de conducción de voces**~~ **YA NO LOS HAY.** Vuelto a medir el
   25/9 sobre el banco entero: el modelo produce **0 avisos**. Eran A3-2-08, A3-2-09
   (octavas y quintas por movimiento directo) y A3-5-11, A3-5-12 (una séptima que pasa a
   otra voz), y se han ido cayendo por el camino con los arreglos de estas sesiones. No
   hay nada que decidir.
4. ~~**Los cinco acordes fuera de su lección**~~ **CERRADO** el 25/9/2026. Con la decisión
   101 la lista de acordes de cada lección corrige, y eso destapó cinco respuestas del
   banco que no cuadraban con su lección. Los cinco están resueltos y **el banco da ahora
   0 acordes modelo fuera de su lección**. Quién hizo qué:
   - `A3-3-04` bajo n2 · IV 5/3 — **Diego**: quitada la opción. A3-3 no tiene ninguna
     subdominante en su lista, así que la nota se queda con su `+4`.
   - `A3-7-04` bajo n2 · IV 7 — **Diego**: quitada la opción; la nota se queda con el 6/5.
   - `A3-8-08` bajo n12 · V/V 6/5̸ — **Diego**: en vez de añadir el acorde a la lección,
     le ha puesto al fragmento una **modulación a Re M en la nota 12**, de modo que ese
     acorde vuelve a leerse `V|65d` en su tonalidad, que sí está en la lista.
   - `A3-7-09` bajo n2 · IV 6/5 — **Diego: «está bien, el acorde IV 6/5 está incluido en
     esa lección»**. Era la lista la que se quedaba corta, no el fragmento: A3-7 se llama
     «II7 y IV7» y tenía `II|7 II|65 II|43 II|42` pero de IV solo `IV|53` y `IV|6`.
     Añadido `IV|65` a los 13 fragmentos de A3-7.
   - `A3-5-12` bajo n6 · II 6/5 — **Diego: «no puede ser II6/5, ha de ser IV o II6. Mejor
     IV»**. La nota (fa, la 6.ª del bajo) pasa de `["65","6","53"]` a `["53","6"]`: el
     modelo es **IV 5/3** y **II 6** sigue admitido. El 6/5 no estaba en el repertorio de
     cifras de A3-5, así que de paso desaparece de sus etiquetas.

   **Y el contenido de A3-7, puesto entero** (Diego, 25/9: «si miras el contenido en
   cifrados de la lección A3-7, verás que incluye todas las inversiones tanto del II7 como
   del IV7; ¿puedes establecer tú el contenido de esa lección?»). Tenía razón: el
   repertorio de CIFRAS de A3-7 ya llevaba `7 65 43 42`, así que la lista de ACORDES es la
   que no le hacía justicia a una lección llamada «II7 y IV7». El IV7 tiene ahora las
   mismas cuatro posiciones que el II7:

   `I|53 I|6 VI|53 IV|53 IV|6 IV|7 IV|65 IV|43 IV|42 II|53 II|6 II|7 II|65 II|43 II|42 V|53 V|7+ V|6 V|65d V|+6 V|+4 VII|6 I|64`

   - **Y también en A3-8**, porque las listas son **acumulativas** —cada lección contiene
     la anterior— y el `IV|65` que le puse antes solo a A3-7 rompía esa propiedad.
     Comprobado: las ocho lecciones vuelven a acumular.
   - **Qué cambia de verdad, medido.** En el alumno, el cartel «En esta ficha entran» pasa
     de decir `IV7 (6/5)` a `IV7 (7 6/5 4/3 4/2)`, que es lo que la lección enseña. En las
     opciones que se le ofrecen, **nada**: 0 de las 1 123 notas del banco cambian, y las
     melodías de soprano de A3-7 y A3-8 siguen con sus 197 opciones en 58 notas. Es lógico:
     la lista de acordes **filtra** lo que el fragmento ya propone, no inventa opciones
     nuevas. O sea que esto es una declaración de contenido —y quedará aceptada el día que
     un fragmento use un IV 4/3—, no un cambio de comportamiento.
   - **De paso, una corrección a lo que decía aquí antes:** `leccionAcordes` no se usa
     «solo en la armonización de soprano». Desde la decisión 101 es también el filtro de
     corrección en las cuatro fichas, y desde la 92 es de donde sale el inventario de
     acordes que ve el alumno.

   El configurador señala solo estos casos: la ficha sale tachada y en rojo, el globo la
   tacha igual y bajo la tabla aparece un aviso que las nombra.

5. ~~**Las dos melodías de soprano de A3-3 que piden el VI**~~ **RESUELTO** el 25/9, y
   tenías razón tú: no era que pidieran el VI, era el tono mal puesto.
   - `A3-3-08` pasa de **Do M a la menor**: la melodía `la si do` es 1-2-3 de la menor
     (la misma de `A3-3-07`, que ya estaba en la menor), y el bajo `do re do`, que en Do M
     era I - VII6 - I, en la menor es **I6 - V4+2 - I6**, o sea una inversión del V7, que es
     justo de lo que va la lección. Encaja mejor en los dos sentidos.
   - `A3-3-16` pasa de **Si♭ M a sol menor**: `sol la si♭` es la transposición exacta de
     `A3-3-07`. No tiene bajo, así que no había nada más que tocar.
   - Con eso el banco se queda en **0 avisos**.
6. ~~Subir a GitHub~~ **HECHO** el 25/9: la versión **20260925-1240** está publicada,
   con el banco de 132 fragmentos.
7. **La carpeta `Práctica armónica — resultados` NO está vacía.** Me dijiste que la
   borrara solo si lo estaba, y no lo está: dentro siguen **la hoja de respuestas**
   («Práctica armónica — resultados») y **el formulario** («Práctica armónica — entrega
   de resultados»), que son los que usa la recogida. La carpeta que hay en la raíz de tu
   Drive con ese nombre es esta misma, dentro de `2 RESULTADOS (lo que recibo)`. No he
   borrado nada.
8. ~~**Monta el cuaderno**~~ **HECHO** el 25/9/2026, instalado por mí en tu hoja a
   petición tuya. En «Práctica armónica — resultados» hay ahora un proyecto de Apps
   Script llamado **«Cuaderno de práctica armónica»** con el código pegado, `montarCuaderno`
   ejecutado y el disparador `alEnviar` puesto (De una hoja de cálculo · Al enviarse el
   formulario). La pestaña **Cuaderno** ya existe y se rehace sola con cada envío.
   - **Un fallo del script, corregido:** `bloqueAlumnos_` llamaba a `getRange` con cero
     columnas cuando ninguna respuesta traía contenidos declarados, y reventaba entero
     («The number of columns in the range must be at least 1»). Ahora, si no hay
     contenidos, escribe una línea que lo dice y sigue. Corregido también en la copia del
     proyecto, `claude/herramientas/MontarCuadernoPractica.gs`.
   - **Lo que hoy se ve y lo que no.** El bloque de CALIFICACIONES funciona (con la
     entrega de prueba del 23/9 sale tu 9,5 en verde). Los bloques 2 y 3 —contenidos de
     la clase y semáforo por alumno— salen vacíos, y es esperable: la columna
     «Contenidos del curso: fallos por apariciones» llega **en blanco**, porque los
     fragmentos del banco todavía no llevan contenidos declarados (el paso 4 de la
     etapa 8b). Lo que **sí** llega con datos es «Acordes: fallos por apariciones».
     Pendiente de tu decisión: si quieres, el cuaderno puede usar esa columna como
     sustituta mientras no etiquetes contenidos, y el semáforo funcionaría desde ya.

   Para referencia, lo que era: cuando un alumno pulsa «Enviar al profesor»,
   su práctica cae como **una fila más** en la hoja de respuestas del formulario. Esa hoja
   es un registro en bruto —una fila por entrega, quince columnas de datos—: sirve para
   guardar, no para calificar. El **Cuaderno** es una segunda pestaña dentro de esa misma
   hoja que convierte ese registro en lo que de verdad miras: **un alumno por fila y una
   práctica por columna, con su mejor nota de primer intento**, más un resumen de qué
   contenidos falla la clase entera y un semáforo por alumno. Lo hace un pequeño programa
   que se guarda dentro de la hoja (`MontarCuadernoPractica.gs`, en el proyecto, carpeta
   `claude/herramientas/`). Se instala una sola vez:
   1. Abre la hoja «Práctica armónica — resultados».
   2. Menú **Extensiones → Apps Script**. Se abre un editor con un archivo vacío.
   3. Borra lo que haya, pega dentro el contenido de `MontarCuadernoPractica.gs` y guarda.
   4. Arriba, en el desplegable de funciones, elige **`montarCuaderno`** y pulsa Ejecutar.
      Google te pedirá permiso la primera vez: es tu propia hoja, dale a permitir.
   5. Elige ahora **`instalarDisparador`** y ejecútala también.
   A partir de ahí el Cuaderno se rehace solo cada vez que llega una entrega. Si no lo
   montas no se pierde nada: las respuestas siguen guardándose en la hoja; lo que no
   tendrás es la tabla de calificaciones hecha.
9. ~~**Ponles título a las fichas**~~ **HECHO lo que me tocaba** el 25/9 (decisión 109).
   Al mirarlo apareció un fallo que no estaba anotado: el nombre automático salía de los
   fragmentos que le habían tocado a cada alumno, así que **dos alumnos de la misma ficha
   podían acabar con nombres distintos** y sus filas no se agrupaban en el Cuaderno. Ahora
   sale del filtro, es idéntico para todos y lleva un código de cuatro caracteres que
   distingue unas fichas de otras. Y al generar un enlace sin título, el configurador te
   avisa diciéndote con qué nombre va a salir.
   Sigue siendo mejor que le pongas el tuyo («Ficha 1 · El 6/4 cadencial»): el automático
   distingue, pero no dice de qué va.
10. **Fragmentos señalados: resueltos.** `A3-5-11` arreglado (decisión 75) y los otros
   cuatro —`A3-1-29`, `A3-2-11`, `A3-3-04` y `A3-4-04`— confirmados correctos por ti
   el 26/9. Queda anotado para no volver sobre ello: **que el bajo y la soprano tengan
   distinto número de notas es deliberado**, son dos ejercicios distintos sobre el mismo
   fragmento, no dos voces que deban cuadrar.

   Para lo que venga, los fragmentos se abren ahora de un clic: pega el id en la casilla
   «Ir a un fragmento por su id», sobre la tabla del banco, o abre directamente
   `configurar.html#id=<el id>` (decisión 74).
11. ~~**Tres síncopas armónicas que hay que arreglar a mano**~~ **YA NO LAS HAY.** Vuelto
   a medir el 25/9: el banco tiene **0 síncopas armónicas**. Las tres que había se
   arreglaron en su momento y el apunte se quedó sin actualizar. Lo que decía, por si
   vuelve a aparecer alguna:
   - **`A3-3-21`** notas 6→7 — do3 I6 → la2 I: **el mismo acorde**.
     <https://djvgon.github.io/armonizar/configurar.html#id=A3-3-21>
   - **`A3-5-12`** notas 6→7 — fa3 V4/2 → sol3 V: **dos dominantes**. Ojo, este arrastra en
     esa misma nota el aviso de la séptima que no baja (el fa del bajo sube a sol): es el
     mismo problema visto dos veces y se arregla de una vez.
     <https://djvgon.github.io/armonizar/configurar.html#id=A3-5-12>
   - **`A3-8-05`** notas 3→4 — do♯3 V6/5̸ → re3 V: **dos dominantes**.
     <https://djvgon.github.io/armonizar/configurar.html#id=A3-8-05>

   Y una decisión menor que tomé yo y puedes vetar: **`V → V7` sobre el mismo bajo queda
   exento**. Con tu regla tal cual saltaban además los cuatro I–V–V7–I de A3-1
   (`A3-1-08`, `A3-1-09`, `A3-1-30`, `A3-1-32`), que son la fórmula de la primera lección.
12. ~~**Los II 5/3 en modo menor**~~ **CERRADO** el 25/9 por Diego: «probablemente los
   casos de II5/3 a los que te refieres son introducidos previamente por un II6», que es
   justo su criterio («en menor, II6 o II6 → II5/3; el II5/3 suelto, no»). No hay nada que
   cambiar. Por si vuelve a hacer falta la lista, eran: `A3-4-05` soprano n4 · `A3-4-07`
   bajo n5 · `A3-4-10` soprano n4 · `A3-5-02` soprano n3 · `A3-5-03` soprano n5 ·
   `A3-5-08` bajo n5 · `A3-5-10` soprano n4 · `A3-5-11` soprano n6 · `A3-5-15` soprano n5
   y n12 · `A3-6-12` soprano n3 · `A3-7-05` soprano n2 · `A3-7-06` soprano n2.
13. **Faltan fragmentos con cadencia rota y con cadencia frigia.** Clasificadas las
   cadencias finales del banco: 67 auténticas perfectas, 19 imperfectas con la
   soprano en 3̂, 18 auténticas sin melodía, 6 semicadencias, 3 imperfectas con la
   soprano en 5̂, **2 frigias** y **0 rotas** — ni al VI ni al IV6. Los nueve acordes
   de VI del banco están todos en medio de la frase, ninguno detrás de la dominante
   al final. Si la cadencia rota entra en el temario —y el cuadro de fórmulas por la
   soprano la da hecha desde 7̂–1̂, 2̂–1̂ y 4̂–3̂—, **hacen falta fragmentos nuevos**.
   De frigias hay dos: pocas, si quieres que se practiquen.

## Los cinco puntos en marcha

Los que Diego pidió incorporar el 25/9/2026, con su instrucción de proceder **«un punto
cada vez, compruebo que funciona y pasamos al siguiente»**.

1. **Función tonal por contexto (VI y IV6).** **HECHO Y CERRADO** el 25/9
   (decisiones 86 y 88). El IV6 no necesitaba regla: sus 9 apariciones son todas
   `I → IV6 → V`. El VI sí, y con el criterio de Diego —subdominante son «las sonoridades
   sobre movimientos del bajo que preparan la dominante»— es **S** siempre que vaya hacia
   la dominante, directamente o pasando por otra subdominante; solo es **T** cuando
   resuelve una dominante (la cadencia rota). En el banco, 15 de los 16 VI son ahora
   subdominante; el único que sigue siendo tónica es `A3-8-01`. De propina, el **6/4 cadencial solo cabe en parte
   fuerte** (decisión 87), y «fuerte» se mide respecto del ritmo armónico: si el tiempo
   está dividido, la cabeza de cualquier tiempo vale (decisión 89).
2. ~~**Cifrado distinto según el tipo de ficha**~~ (decisión 90, **derogada**). Se hizo el
   25/9 y Diego la revocó ese mismo día: en la armonización de bajo el alumno respondía el
   grado del bajo en arábigo y en los otros tres tipos la fundamental en romano. Ahora, por
   la **decisión 113**, los cuatro tipos piden lo mismo —tonalidad · función · fundamental ·
   inversión— y el grado de la escala del bajo vuelve a ser el circulito sobre la nota.
3. **Los circulitos de grado.** **HECHO Y CERRADO** el 25/9 (decisiones 91 y 113): un solo
   interruptor con dado · oculto —el estado «pedido» se fue con la 113—, más la casilla
   «dar los grados solo en el primer fragmento», que en una ficha los pone en el 1.º y los
   quita en los demás, en los cuatro tipos. Lo de pedirlos solo cuando el bajo se ajuste a la regla de la octava queda
   **descartado por Diego**: darlos en unas notas y no en otras señalaría dónde se aplica
   la regla, que es lo que el alumno tiene que reconocer. Todos o ninguno, por fragmento,
   que es lo que ya hacía el dibujo.
4. **La cabecera «En esta ficha entran» · el inventario sin posiciones · la doble fila de
   funciones en el pivote.** Las dos primeras, **HECHAS** el 25/9 (decisión 92): la fila
   lista los acordes de toda la ficha sin inversiones y no cambia de un fragmento a otro.
   **Falta la tercera**: la fila de funciones ha de partirse en el acorde pivote, con la
   función en la tonalidad anterior y en la nueva, como ya hace la fila de grados.
5. **La regla del modo menor frente al relativo mayor.** **HECHA** el 25/9
   (decisión 97): si aparece la sensible de la relativa menor, el pasaje está en menor, y
   se decide así **antes** de cualquier otra prueba, con bajo o sin él. En el banco no
   cambia nada —ninguno de los 132 fragmentos en mayor lleva esa sensible—: es una
   barandilla para lo que se importe a partir de ahora. Y con su subregla del **relieve**
   (decisión 98) queda resuelto el único hueco que le quedaba: el do♯ que fuera un V/vi de
   paso en Fa mayor. **Los cinco puntos, cerrados.**

## Pendiente, por orden

**1 · Recogida de resultados** (etapa 8b). En marcha, arriba.

**2 · La interfaz en el móvil.** **El horizontal, hecho** el 25/9 (decisión 99): corte
por altura y preámbulo recortado. El preámbulo pasa de 504 a 210 px, las paletas quedan
fijas abajo y la casilla activa está siempre a la vista sobre ellas; antes, al abrir un
ejercicio en el móvil en horizontal **no se veía ni una nota**. Escritorio y tableta, sin
tocar. Los otros dos arreglos baratos —paletas fijas y vista que sigue a la nota activa—
ya estaban.

Las **paletas**, apretadas en dos vueltas: la 111 (rótulo a la izquierda) y la 112
(renglones pegados y sin paleta de tonos donde no hay modulación). De 37 a **25 %** de la
pantalla en vertical y de 69 a **43 %** en apaisado; y en el fragmento que no modula —que
es el caso corriente— a **20 %** y **33 %**. Queda una palanca más, sin hacer porque Diego
prefiere los tres renglones a la vista: **enseñar solo la paleta que toca**, que dejaría la
barra en un 12 %.

Y el **tamaño**, arreglado el 25/9 (decisión 115): el fragmento de pocas notas se
estiraba hasta 560 px de ancho y, como el SVG escala entero, crecía un 77 % —734 px de
alto en una pantalla de 844—. Ahora todos van a escala 1, corto o largo.

Queda el **vertical**, y solo lo arregla lo caro: el **reflujo en varios sistemas**
(1109 px de música en una caja de 374), que es reescribir la disposición de
`partitura.js` —casillas, circulitos, filas de función y tonalidad y globo pasan a
calcularse por sistema—. Las medidas y las opciones, en `ESPECIFICACION.md`, sección
«Pendiente: la interfaz en el móvil».

**3 · Los contenidos del curso, fase B** (decisión 65). Diego prepara las listas de
los tres cuadros de sintaxis —verde (cadencias, prolongaciones, secuencias), azul
(préstamos modales, dominantes y subdominantes secundarias, modulación diatónica y
más adelante enarmónica) y uno nuevo de armonía alterada—. Lo acordado sobre cómo
se identifican:
- **La etiqueta es del modelo, no de la respuesta**: el tipo de cadencia sale de los
  dos últimos acordes del banco (V→I auténtica, V→VI rota, →V semicadencia, IV→I
  plagal), no de lo que ponga el alumno.
- **Secuencias y prolongaciones son rangos**, no notas: hay que marcar «de la nota 3
  a la 8» y etiquetarlo. Eso es un selector de rango en la tabla de revisión, dentro
  de «El fragmento en curso».
- La idea de Diego para las prolongaciones —que el bajo siga la regla de la octava
  fuera de las cadencias— **se puede calcular**, no hace falta declararla: el motor ya
  sabe qué cifra corresponde a cada grado del bajo en la RO.
- **La ortografía armónica queda fuera** (decisión 65): el alumno no escribe las voces.

**4 · El resto del cuadro azul** (decisión 49). Préstamos modales del homónimo
menor con apóstrofo (`II'`); las demás dominantes secundarias (V/IV, V/VI…), que
hoy solo contemplan el V/V; la sexta aumentada en menor. El informe sobre cómo se
representan los préstamos en los conservatorios está en
`PRESTAMOS-MODALES-NOTACION.md`.

**4 · Etapa 4b.** Las normas de enlace de tu pauta de corrección, incorporadas a
la conducción automática de voces (decisión 22).

**5 · Etapa 5b.** Generador de bajos por combinación de fragmentos válidos de la
regla de la octava, con modulación por acorde pivote.

**6 · Etapa 6.** *Schemata* de IJzerman: marchas progresivas, Romanesca,
Quiescenza; respuestas por combinación.

**7 · Etapa 9.** Análisis sobre partitura real, al estilo de NEO: imagen con
puntos marcados por el profesor, o vídeo que se detiene en los puntos de cifrado.
Propuesta del 20/9/2026, pendiente de decidir si entra.

**Mejoras pequeñas anotadas.** Dibujar el bajo pinchando en un pentagrama como
alternativa al texto; constructor de cifras al estilo de teoria.com como
alternativa a la paleta; corrección inmediata nota a nota como opción.

## Cosas que conviene tener presentes

- **Las respuestas viajan con el ejercicio.** El banco es un archivo público y las
  fichas se resuelven en el navegador: un alumno curioso puede leer las
  soluciones. Para practicar no importa; si alguna vez quieres que una ficha
  cuente como examen, hace falta corregir en el servidor (está previsto dentro de
  la etapa 8b).
- **`preferir` no cambia nada todavía.** La opción «sobre el grado 6 descendente,
  la respuesta modelo es +6» funciona, pero en el banco actual no hay ningún
  fragmento donde el 6.º descendente admita a la vez el II4/3 y el +6. Se notará
  cuando entren fragmentos de A3-6 y A3-7 con esa doble lectura.
- **Datos de menores.** Decidido el 23/9/2026: todo se queda dentro del Workspace
  murciaeduca.es. La aplicación no guarda ni envía nada por su cuenta; la
  identidad la pone Google (correo del centro verificado) o Classroom. Queda por
  hacer lo de siempre: no recoger más de lo que vayas a usar y que los alumnos
  sepan qué se registra.
- **Repetir una ficha no es repetir el mismo ejercicio.** Cada ficha del banco
  saca sus fragmentos al azar, así que la segunda vuelta mide de verdad. Un
  ejercicio fijo (`#e=`) sí es el mismo: ahí el segundo intento ya sabe la
  respuesta.

## Dónde está cada cosa

| | |
|---|---|
| Carpeta de trabajo | Drive murciaeduca.es › `3. RECURSOS - DOCENTE` › `Recursos de Claude` › `APLICACIÓN WEB PARA ARMONIZAR MELODÍAS`, repartida en tres (decisión 62) |
| · lo que se publica | `1 WEB (subir a GitHub)` — arrastra **todo** su contenido a GitHub, sin elegir |
| · lo que recibes | `2 RESULTADOS (lo que recibo)` — el formulario y la hoja de respuestas |
| · lo que permanece | `3 PROYECTO (documentación y fuentes)` — documentos, guías y `ejemplos/` con tus `.mscz` |
| Publicada en | <https://djvgon.github.io/armonizar/> (repositorio `armonizar`, cuenta `djvgon`) |
| Partituras de las lecciones | `3 PROYECTO …/ejemplos/Fragmentos por lecciones/` (archivos `.mscz` de MuseScore) |
| Decisiones, numeradas | `3 PROYECTO …/ESPECIFICACION.md` |
| Esta bitácora | `3 PROYECTO …/BITACORA.md` |
| Cómo publicar | `3 PROYECTO …/PUBLICAR-EN-GITHUB.md` |
| Revisiones del banco | `3 PROYECTO …/REVISION-DE-FRAGMENTOS.md`, `REVISION-A3-8.md` |
| Notación de préstamos modales | `3 PROYECTO …/PRESTAMOS-MODALES-NOTACION.md` |
| Scripts de Apps Script | proyecto «Mis clases» de Claude, `claude/herramientas/` · el de la recogida está también en tu cuenta, como proyecto «Practica armonica - crear formulario de resultados» |
| Formulario y hoja de resultados | `2 RESULTADOS (lo que recibo)`, dentro de la carpeta del proyecto |

Todo esto se copia además al proyecto «Mis clases» de Claude, para que cualquier
sesión nueva lo lea antes de empezar.

## Historial de entregas

| Versión | Qué llevaba |
|---|---|
| 20260929-2000 | La síncopa armónica se comprueba también en la corrección de la armonización de soprano, dándole el acorde entero para que deduzca el bajo (160) |
| 20260929-1930 | Lo que separa la prolongación de la cadencia es el bajo: `T D T` con bordadura o bordadura incompleta es prolongación; si el bajo salta, es cadencia. Y los cuadros de las técnicas pasan a naranja (159) |
| 20260929-1900 | Varias subdominantes seguidas ya no son «prolongación de la subdominante»: cuentan como una sola y la cadencia se las lleva todas, desde la primera (157, afinada) |
| 20260929-1830 | La regla de la síncopa estaba ciega en armonización de soprano —tomaba la melodía por bajo y un error mudo se tragaba el resto—; arreglada, y la pasada de «el modelo no sincopa nunca» corre ya también allí: 4 de los 5 fragmentos afectados se reparan solos (158) |
| 20260929-1800 | Las cadencias, de cada frase y no solo del fragmento; el cuadro abarca toda la dominante —6/4 cadencial incluido— y la subdominante que la prepara, baja hasta el cifrado naranja y alterna los topes (157). La excepción de la síncopa deja de valer en la cabeza del compás (158) |
| 20260929-1730 | El bajo deducido se elige para la línea entera, no nota a nota: ni una por debajo del mi2 (eran 5), ni una séptima (eran 4), ni una sexta sin compensar (eran 6); el hueco de octava bajo la melodía pasa de filtro duro a preferencia (156) |
| 20260929-1700 | Las técnicas armónicas, en un cuadro sobre los acordes que las forman: arpegio, prolongación de cada función, prolongación con marco (T–D–T, T–S–T) y cadencia con su nombre completo, con la explicación en un globo (155); `js/tecnicas.js` |
| 20260929-1630 | El porqué de cada acorde vuelve, en un globo sobre el cifrado naranja: con el ratón encima o tocándolo con el dedo, y recortado para no repetir la cifra (154) |
| 20260929-1620 | Al ver la solución, la lista numerada de errores se sustituye por una frase que manda mirar el pentagrama y hace de leyenda de los colores, adaptada a lo que se acertó (153) |
| 20260929-1610 | En el renglón de la solución, la letra de la función sube a 18 y el grado baja a 16: la función manda y el grado viene detrás (152, afinada) |
| 20260929-1600 | La solución se dice en una sola tinta y en un solo sitio: bajo cada nota fallada, una línea naranja con función · grado · cifra, sacada de los mismos pares que realizan el pentagrama; la función del modelo sale de dentro de la casilla (152). Arreglado el `Cifrado desconocido: I\|53` que dejaba sin efecto Comprobar en `A4-11` en melodía de soprano |
| 20260929-1500 | Las teclas bajan a 40, igual que las acciones y por debajo de la banda; la escala queda 48 banda · 40 teclas y acciones · 32 barra, herramientas y fichas (151) |
| 20260929-1400 | Al ver la solución se respeta el acorde del alumno donde acertó, aunque el modelo prefiera otro admitido: con todo bien ya no sale nada en naranja (147, corregida). Banda a 48 y barra a 32, las alturas elegidas (151) |
| 20260929-1330 | Banda a 52 y barra a 36; los atajos de las teclas, sin negrita (151, afinada) |
| 20260929-1300 | La banda baja de 64 a 56 y la barra de 48 a 40; los atajos de las teclas, en negrita (151, afinada) |
| 20260929-1220 | Escala única en múltiplos de 8 con las dos franjas dentro —64 banda · 48 barra y teclas cuadradas · 40 acciones · 32 herramientas y fichas cuadradas—, con el atajo en la esquina de la tecla (151) |
| 20260929-1050 | En la melodía de soprano, aviso cuando el acorde escrito no contiene la nota de la melodía (150) |
| 20260929-1010 | El naranja de la solución se decide comparando el acorde dibujado con el que escribió el alumno, no con si acertó (147, corregida) |
| 20260929-0940 | Vuelve el renglón de acordes del ejercicio y el botón de las estructuras sale del renglón de los grados (149) |
| 20260929-0900 | En naranja, en la solución, los acordes que el alumno falló (147); el recorrido de casillas siempre en el orden función · fundamental · cifrado, con el pivote detrás, y arreglada la segunda función en el teclado (148) |
| 20260929-0715 | El trío ya no se desploma con el bajo grave: tres octavas de tenor y tope de 31 semitonos (144); «Ver la solución» dibuja la realización del modelo (145); rótulos de comentario, «Sonar al elegir» y «Posición melódica» (146). Banco: 17 de 378 combinaciones con aviso |
| 20260929-0605 | La banda dice «Lección» (141); fuera el renglón del esquema en el informe y la casilla del comentario con las palabras de su botón (143) |
| 20260929-0530 | Las paralelas, vetadas y no solo penalizadas; el movimiento directo encarecido a 75/55; el bajo deducido deja una octava bajo la melodía (142). Banco: 0 combinaciones con paralelas y 20 de 378 con algún aviso |
| 20260929-0450 | «Sonar al elegir», dentro del primer renglón de paletas y pegado al borde derecho de la partitura (140, corregida) |
| 20260929-0420 | La banda empieza por «Tema» y el «Ejercicio k de n» baja junto a «Comprobar»; el título del fragmento deja de repetir el nombre del tema (141) |
| 20260929-0345 | La dominante en naranja, con tinta oscura (139); «sonar al elegir» al frente de las paletas (140) |
| 20260929-0300 | Oscuro solo lo que es una acción: las herramientas vuelven al botón claro; la escucha a la izquierda y la vista a la derecha, a ras de la partitura; «sonar al elegir» y «Cuadro de cifrados» al pie de las paletas; los grados del ejercicio con el color de su función (137); rótulos del configurador en morado y por encima del valor (138) |
| 20260929-0215 | La subdominante en amarillo y la dominante en roja, con el VI a dos tintas (135); techo de la soprano en el la5 —el la4 del índice español— como filtro, no como coste (136); el informe deja de contar funciones, grados y cifrados por separado (134) |
| 20260929-0130 | Sobre el morado, la letra en blanco —se elimina el `--marca-texto` morado que teñía de oscuro la banda y «Comprobar»—; la misma cabecera y los mismos mandos en las cuatro ventanas; todos los botones rellenos con la letra en blanco (133). Ajustes del alumno (134): fuera el renglón «Tonalidad», «Escuchar tono», el aviso del envío al enunciado, «sonar al elegir» con las paletas y el informe contando acordes |
| 20260928-0030 | `f.html`, el redirector de los códigos QR: lo impreso lleva una dirección corta y fija (128) |
| 20260928-0940 | Funciones en color plano según Kandinsky —azul la tónica, rojo la subdominante, amarillo la dominante— y la corrección por contorno y símbolo, no por relleno (132); rótulos de la barra unificados y la posición melódica dicha por la nota de la soprano |
| 20260928-0210 | Cabecera de aplicación: barra en negro ciruela y banda en morado eléctrico #B026FF; el morado para identidad y llamada a la acción, el ciruela para los estados de trabajo (131) |
| 20260928-0130 | Repaso visual, punto 1: dos tipografías, dos radios y fuera el triple marco. Punto 2: las tres tintas de las funciones —T azul pizarra, S ciruela, D oro— como anotación y no como relleno, y el cromatismo por trazo y no por color nuevo (130) |
| 20260927-2350 | Tres reglas más de conducción —la séptima preparada, la novena sobre la sensible, el salto compensado— y el cierre conclusivo ampliado a cualquier inversión de la tónica (129) |
| 20260927-2330 | La ficha se mide en compases, no en número de ejercicios (127); `A3-4-04` con la soprano corregida |
| 20260927-2230 | En un reintento se puede modificar cualquier casilla, también las acertadas (126) |
| 20260927-2100 | El VI que va a otra subdominante ya no sale como tónica en el esquema: la cadena la firma `Teoria.funcionDe` (125) |
| 20260927-1920 | El I6 como tónica final admisible en la armonización de soprano (123); los acordes de la lección, siempre a mano y plegados, con las cuatro inversiones del IV7 (124) |
| 20260927-1740 | El esquema de la armonización del alumno (cadena de funciones) y el nombre de su cadencia (122) |
| 20260927-1600 | La explicación hablada de los errores, con el sintetizador del navegador (121); `js/voz.js` |
| 20260927-1420 | La soprano de la realización acaba en la tónica siempre que se puede (120) |
| 20260927-1240 | Por qué falla, y no solo qué falla: la sintaxis del enlace y la explicación de la cifra, también en la armonización de bajo (119) |
| 20260927-1120 | Solo `banco.json`: la lección A4-11 «Modulación al relativo mayor», el banco a 140 fragmentos (118). El código no cambia |
| 20260927-0940 | La numeración del programa (1 a 19, el curso en el prefijo): Modulación al V pasa a A4-10 y la fórmula T-S-T se desactiva hasta la lección 8 (117) |
| 20260927-0815 | La función «—» (sin función tonal) y el III, que deja de ser tónica (116) |
| 20260927-0640 | En el móvil, la partitura siempre a su tamaño natural: el fragmento corto dejaba de estirarse un 77 % (115) |
| 20260927-0515 | El doble sostenido y el doble bemol en la fuente, y el fallo de los pasos de letra que escondían (114) |
| 20260927-0340 | El grado que se responde es el de la fundamental en los cuatro tipos; el grado del bajo vuelve a ser el circulito (113, deroga la 90 y la 94) |
| 20260927-0215 | El teclado del móvil a renglón seguido y la paleta de tonos solo en los fragmentos que modulan (112) |
| 20260927-0140 | La leyenda de cada paleta a la izquierda también en el móvil (111) |
| 20260926-1800 … 20260927-0115 | La sesión del 25/9, sin desglosar por versiones: el corte del móvil por altura (99), el globo de repaso del configurador (100), la lista de acordes de la lección también corrige (101), el transporte de tonalidad (102), la dominante secundaria no es una modulación (103), los renglones por bloques de tonalidad (104, **revertida** por la 106), el rótulo de cada paleta a la izquierda (105), las bandas en otro orden (106), los números de las paletas y el orden de las cifras (107), el pivote se rellena entero antes de pasar (108), el nombre de la ficha en la hoja de calificaciones (109), el reparto de tonalidades por rotación (110) |
| 20260926-1520 | El relieve: la tónica es la nota en la que insiste el pasaje, no una nota de la escala (98) |
| 20260926-1405 | La sensible de la relativa menor decide el modo en la importación (97) |
| 20260926-1250 | «Sonar al elegir», marcada por defecto (96) |
| 20260926-1215 | La fila de funciones, partida en el acorde pivote: una función por tonalidad, las dos corregidas (95) |
| 20260926-1055 | En armonización de bajo, la fila del grado es siempre el grado del bajo: dado, pedido u oculto (94) |
| 20260926-0935 | Las filas bajo el pentagrama, en el orden función · cifrado · grado · tonalidad (93) |
| 20260926-0820 | «En esta ficha entran»: el inventario de acordes de toda la ficha, sin inversiones (92) |
| 20260926-0645 | Los grados del bajo, en tres estados —dado · pedido · oculto— y dados solo en el primer fragmento de la ficha (91) |
| 20260926-0510 | En armonización de bajo el alumno responde el grado del BAJO; en análisis, audición y soprano, el de la fundamental (90) |
| 20260926-0240 | «Parte fuerte» es relativo al ritmo armónico: con el tiempo dividido, el 6/4 cabe en la cabeza de cualquier tiempo (89) |
| 20260926-0115 | El VI que prepara la dominante ya es subdominante (88); el 6/4 cadencial solo en parte fuerte (87); la función del acorde siguiente se mira con su cifra (86) |
| 20260925-2110 | Semáforo del banco, siempre visible, con botón para igualar y «Volver a comprobar» (85); `A3-3-08` a la menor y `A3-3-16` a sol menor |
| 20260925-1820 | Dos dominantes solo sincopan si son del mismo tono (84) |
| 20260925-1640 | Un renglón por tonalidad, no uno por cada cambio (83); `A3-5-14` con su 6/4 cadencial |
| 20260925-1420 | La anacrusa ya no desplaza la métrica (81); al revisar un fragmento se aplica el repertorio de su lección y cambiar la función vuelve a marcar los acordes (82) |
| 20260925-1240 | La síncopa armónica, en cuatro reglas (80) |
| 20260925-1105 | El cartel de desfase deduce quién va por delante y protege el banco (79) |
| 20260925-0950 | El final de `A3-5-11` rehecho con el 6/4 cadencial (75); aviso de cambios sin subir, en las dos direcciones (78) |
| 20260925-0835 | El configurador avisa cuando el banco publicado no es el suyo (77) |
| 20260925-0710 | Sobre el 4.º grado que sube al 5.º, II6 antes que IV (76) |
| 20260925-0545 | `A3-2-02` separado en dos fragmentos (73); enlace directo a un fragmento por su id (74); las dos cadencias de `A3-5-11` (75) |
| 20260925-0420 | Ninguna voz canta una segunda aumentada (71) |
| 20260925-0340 | El identificador del fragmento, a la vista en la tabla y en el recorrido (69) |
| 20260925-0215 | La séptima ha de venir preparada; la mayor, siempre (68) |
| 20260924-2020 | El atajo de teclado, escrito bajo el rótulo de las flechas (67) |
| 20260924-1910 | Flechas para recorrer los fragmentos del filtro, con aviso de cambios sin guardar (67) |
| 20260924-1750 | Las dos mitades de la ficha, sombreadas; «Cargar» aterriza en la partitura (66) |
| 20260924-1600 | El configurador en dos zonas: la ficha arriba, el banco plegado abajo (66) |
| 20260924-1315 | Envío condicionado a terminar la ficha y reanudación (64); contenidos del curso por nota y hoja «Cuaderno» (65) |
| 20260924-1145 | Nombre automático de la ficha y contenidos con denominador (63) |
| 20260924-0930 | Envío al formulario de Google relleno (61); `js/envio.js`, `envio.json`, apartado «Recogida de resultados» del configurador |
| 20260924-0130 | Medida de la práctica e informe del alumno con nota sobre 10 (60); `js/registro.js` |
| 20260923-2230 | El pie del alumno, solo instrucciones de uso (59) |
| 20260923-1955 | Una portada por tipo de ejercicio, para la etiqueta de Classroom (58) |
| 20260923-1610 | El enunciado, más corto; la tonalidad baja al recuadro (57) |
| 20260923-1240 | Los circulitos de grado, por encima del bajo agudo (52, corregida) |
| 20260923-0940 | Las tonalidades, opción aparte de las funciones (56) |
| 20260923-0110 | En Análisis y Audición, la respuesta ha de ser el acorde que se muestra (54); cuatro opciones propias de la ficha (55) |
| 20260922-2115 | La realización se ve mientras se cifra (51); circulitos de grado al modo de Gjerdingen (52); la tonalidad que de verdad cuadra (53); banco rehecho a 130 fragmentos con la barra doble de A3-2 corregida |
| 20260922-1815 | Soprano y tenor, dentro de la octava (50) |
| 20260922-1520 | El V/V se escribe V/V y su función es DD (48, 49); informe sobre los préstamos modales |
