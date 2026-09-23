# Bitácora

Dónde vamos, qué queda y qué está esperando a alguien. Se actualiza **al final de
cada sesión de trabajo**, antes de entregar.

Aquí no van las decisiones: esas viven en `ESPECIFICACION.md`, numeradas (1 … 60),
y no se repiten. Aquí va lo demás: lo que está a medias, lo que has propuesto y
todavía no hemos hecho, y lo que no puedo hacer yo porque depende de ti.

---

## Estado a 23 de septiembre de 2026

- **Versión en la carpeta de Drive:** 20260924-0130.
- **Publicada en GitHub:** pendiente de que subas esta versión (véase «Te toca a
  ti», punto 5). La anterior sigue funcionando.
- **Banco:** 130 fragmentos, 8 lecciones (A3-1 … A3-8).
- **Comprobaciones, todas en verde:** 0 incoherencias entre armadura, tonalidad y
  cifrado · 0 síncopas armónicas · 0 acordes fuera del repertorio de su lección ·
  0 subdominantes que vuelvan a la tónica · 0 finales que no sean tónica o
  dominante · abertura soprano-tenor dentro de la octava en los 3297 acordes ·
  0 solapes de los circulitos de grado · el corpus de la regla de la octava se
  reproduce sin discrepancias nuevas.
- **Avisos que quedan:** 6 fragmentos con la tonalidad marcada con (?) y 3 con
  algún aviso (uno de ellos, A3-2-10, espera una corrección tuya).

## En marcha

**Recogida automática de resultados** (etapa 8b). Camino elegido el 23/9/2026:
**formulario de Google relleno de antemano**, con el correo del centro como
identidad verificada. Va en tres pasos:

- **Paso 1 — medir e informar. HECHO** (versión 20260924-0130). `js/registro.js`
  mide sola la práctica: tiempo de trabajo (el reloj se para si la pestaña queda
  en segundo plano), aciertos al primer intento y tras corregir, y el detalle
  nota a nota con el acorde modelo como etiqueta de contenido. Al terminar, el
  alumno ve su **nota sobre 10**, lo que más se le ha resistido, y dos botones:
  «Copiar el informe» (para pegarlo en Classroom) y «Descargar el detalle» (CSV).
- **Paso 2 — enviar. TE TOCA A TI EMPEZARLO.** Ejecuta
  `CrearFormularioPractica.gs` (está en el proyecto «Mis clases», carpeta
  `claude/herramientas/`): crea el formulario y su hoja de cálculo y te imprime
  una **dirección plantilla**. Mándamela y añado el botón «Enviar al profesor»,
  que abre el formulario con todo puesto: el alumno solo pulsa Enviar.
- **Paso 3 — calificar.** Volcado a tu cuaderno y, si interesa, calificación
  automática en Classroom por API.

## Te toca a ti

Cosas que he pedido y siguen abiertas. Las pongo todas juntas porque se han ido
quedando por el camino en distintas sesiones.

1. **A3-2-10, armadura equivocada.** El fragmento `la mi | do la | mi` lleva en tu
   partitura **un sostenido**, pero está en **la menor** (lo prueba el sol♯ de la
   soprano) y acaba en semicadencia sobre la dominante. La aplicación ya lo lee
   bien, pero mientras la armadura diga otra cosa seguirá marcado con (?).
   Hay que ponerle armadura de Do M / la m en los **dos** archivos de A3-2, el de
   bajos y el de sopranos.
2. **Los 14 fragmentos sin subdominante antes de la dominante final.** Te los
   listé en `REVISION-DE-FRAGMENTOS.md`, §4: en todos ellos la nota anterior a la
   tónica es el 5.º o el 7.º grado y no hay ninguna subdominante posible. Pedías
   que te avisara para confirmarlos. Siguen sin confirmar.
3. **Los 4 avisos de conducción de voces.** A3-2-08 y A3-2-09 (octavas y quintas
   por movimiento directo) y A3-5-11 y A3-5-12 (una séptima que pasa a otra voz).
   ¿Los arreglo o se quedan como están?
4. **Las dos melodías de soprano de A3-3 que piden el VI** (`la si do` en Do M y
   `sol la si♭` en Si♭ M). Su primera nota no entra en ningún acorde del
   repertorio de A3-3. O las pasas a A3-6, o marcas el VI en el repertorio de
   A3-3.
5. **Subir a GitHub la versión 20260923-2230.** Lleva **cuatro archivos nuevos**
   que no estaban antes: `analisis.html`, `armonizacion-bajo.html`,
   `audicion.html` y `armonizacion-soprano.html`. Sin ellos, los enlaces que
   genere el configurador no abrirán.
6. **Crear el formulario de recogida.** Ejecuta `CrearFormularioPractica.gs` en
   script.google.com y mándame la «dirección plantilla» que imprime. Es lo único
   que me falta para cerrar el envío automático (paso 2 de «En marcha»).

## Pendiente, por orden

**1 · Recogida de resultados** (etapa 8b). En marcha, arriba.

**2 · La interfaz en el móvil.** Anotado el 23/9/2026 con las medidas y las
opciones en `ESPECIFICACION.md`, sección «Pendiente: la interfaz en el móvil».
En resumen: en horizontal no se ven a la vez la partitura y las paletas, y en
vertical la partitura no cabe a lo ancho. Cuatro arreglos baratos (punto de corte
por altura, paletas fijas abajo, plegar el preámbulo, que la vista siga a la nota
activa) dejan utilizable el horizontal; el **reflujo en varios sistemas** —caro,
es reescribir la disposición de `partitura.js`— es lo único que arregla el
vertical.

**3 · El resto del cuadro azul** (decisión 49). Préstamos modales del homónimo
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
| Carpeta de trabajo | Drive murciaeduca.es › `3. RECURSOS - DOCENTE` › `Recursos de Claude` › `APLICACIÓN WEB PARA ARMONIZAR MELODÍAS` |
| Publicada en | <https://djvgon.github.io/armonizar/> (repositorio `armonizar`, cuenta `djvgon`) |
| Partituras de las lecciones | `ejemplos/Fragmentos por lecciones/` (archivos `.mscz` de MuseScore) |
| Decisiones, numeradas | `ESPECIFICACION.md` |
| Esta bitácora | `BITACORA.md` |
| Cómo publicar | `PUBLICAR-EN-GITHUB.md` |
| Revisiones del banco | `REVISION-DE-FRAGMENTOS.md`, `REVISION-A3-8.md` |
| Notación de préstamos modales | `PRESTAMOS-MODALES-NOTACION.md` |
| Scripts de Apps Script | proyecto «Mis clases» de Claude, `claude/herramientas/` |

Todo esto se copia además al proyecto «Mis clases» de Claude, para que cualquier
sesión nueva lo lea antes de empezar.

## Historial de entregas

| Versión | Qué llevaba |
|---|---|
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
