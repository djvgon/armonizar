# Las reglas del motor

**Borrador para que Diego lo corrija.** 29 de septiembre de 2026.

Aquí está, escrito en lenguaje de armonía y no de programa, **todo lo que el motor decide
hoy**. No es lo que debería hacer: es lo que hace. Cada regla lleva un número; cuando esté
corregida, cada trozo de código citará el suyo, de modo que se pueda ir de una conducta de la
aplicación a la regla que la manda y de la regla a quien la formuló.

**Cómo corregirlo.** Delante de cada regla hay un hueco. Basta con poner:

- **✓** — está bien dicha y bien aplicada.
- **✗** — está mal. Debajo, en una línea, qué falla.
- **~** — casi. Debajo, el matiz que falta.
- **fuera** — esto no debería existir.

No hace falta hacerlo de una sentada ni por orden. Las secciones son independientes.

---

## 0. El mapa: cuándo actúa el motor

Esto no son reglas, es dónde se aplican. Conviene tenerlo delante, porque una misma regla
pesa distinto según el momento.

| | Momento | Qué hace | Qué toca |
|---|---|---|---|
| **M1** | **Proponer** | Ante un bajo o una melodía nuevos, sugiere los cifrados admisibles de cada nota y cuál es el modelo | Escribe en el fragmento. Solo ocurre al pulsar «Analizar», y nunca sobre un fragmento cerrado |
| **M2** | **Corregir** | Compara la respuesta del alumno con los admisibles guardados | No escribe nada |
| **M3** | **Realizar** | Escribe las cuatro voces a partir de las parejas sonido fundamental + cifrado | No toca la armonía: decide octavas, duplicaciones y conducción |
| **M4** | **Dibujar el bajo** | En la armonización de soprano, deduce la línea del bajo de los acordes asignados | No toca la armonía: decide en qué octava y con qué línea |

**Lo que hay que retener**: el criterio armónico solo se escribe en **M1**. En **M2** el motor
únicamente lee. En **M3** y **M4** el motor decide cosas que no son la armonía, pero que se
ven y se oyen, y por eso pueden parecer decisiones armónicas.

---

## 1. Qué acorde cabe sobre cada nota del bajo

Se prueban **en este orden** y gana la primera que se cumple. La que gana propone una lista
de cifrados admisibles, con el modelo delante.

□ **R‑01 · Cuarto grado elevado = dominante de la dominante.**
Si la nota del bajo es el 4.º grado alterado ascendentemente (do♯ en Sol M), el acorde es el
V/V, con la fundamental en el 2.º grado, y sobre ese bajo se cifra 6/5̸. Su función no es S ni
D, sino DD. El caso típico es el paso cromático 4 – ♯4 – 5, que es el que describen Aldwell y
Schachter. *Esta regla va la primera: una nota alterada no admite lectura diatónica.*

□ **R‑02 · La última nota de la frase.**
Sobre el 1.er grado, tónica en estado fundamental. Sobre el 5.º, dominante en estado
fundamental (semicadencia). Sobre el 3.er grado, **tónica en primera inversión** —no un III—,
porque es lo que pide el acorde anterior: la sensible sube a la tónica y la séptima baja a la
tercera. Sobre cualquier otro grado, estado fundamental.

□ **R‑03 · La penúltima sobre el 5.º grado, yendo a la tónica: cadencia auténtica.**
V, o V7 cifrado 7/+.

□ **R‑04 · Nota repetida: se mantiene el acorde.**
Si el bajo repite la nota, sigue el acorde anterior; sobre el 5.º grado se añade además la
posibilidad de la séptima (V → V7).

□ **R‑05 · Nota repetida que cae en parte más fuerte: la armonía tiene que cambiar.**
Mantener el acorde ahí sería síncopa armónica. Si la nota siguiente baja de grado, lo natural
es que la nota repetida se vuelva **séptima preparada** del acorde nuevo —4/2, o +4 si el
intervalo ya es de dominante— y baje de grado. Si no baja, se ofrecen los acordes del
repertorio que contienen esa nota con otra fundamental.

□ **R‑06 · Salto dentro del acorde anterior: arpegio.**
Si el bajo salta a una nota que ya pertenecía al acorde anterior, es el mismo acorde en otra
inversión. Se ofrecen los cifrados que sobre este bajo reproducen ese acorde, y también los
que dan el mismo acorde sin la séptima (V7 → V6).

□ **R‑07 · 6.º que salta al 4.º camino de la dominante.**
Sobre el 6.º, VI o IV6. Sobre el 4.º que viene del 6.º y va al 5.º: II6, o IV, o II6/5.

□ **R‑08 · 2.º grado que salta a la dominante.**
II o II7 (séptima diatónica). Función subdominante.

□ **R‑09 · 4.º grado que salta a una nota del V7.**
+4: el V4/2 que se arpegia.

□ **R‑10 · Regla de la octava, grado por grado.**
Cuando no se cumple ninguna de las anteriores, manda la regla de la octava, leída según a
dónde va la nota:

- **1.º** → estado fundamental.
- **2.º** → +6 (V7 en segunda inversión); también VII6.
- **3.º** → primera inversión de la tónica.
- **4.º que sube al 5.º** → 6/5 (II6/5); si la lección no lo tiene, **II6 antes que IV**,
  porque IV → V con los dos en estado fundamental es el tropiezo clásico de las quintas
  paralelas; el IV solo si la melodía trae la tónica.
- **4.º que baja al 3.º viniendo del 5.º** → +4 (V7 en tercera inversión). Si se llegó por
  salto, +4 o IV.
- **4.º que ni sube al 5.º ni baja al 3.º** → IV en estado fundamental.
- **5.º** → dominante, sin séptima o con ella (7/+); y, si la nota se repite, también el
  **6/4 cadencial**.
- **6.º que sube al 7.º** → IV6, o VI.
- **6.º que baja al 5.º** → II4/3; o +6 (dominante secundaria del V); o 6; o VI.
- **6.º que ni sube ni baja por grado** → VI, o IV6.
- **7.º que sube al 1.º** → 6/5̸ (V7 en primera inversión), o VII6.
- **7.º en cualquier otro caso** → primera inversión (VII6 / V6).

□ **R‑11 · El repertorio de la lección manda sobre todo lo anterior.**
De los cifrados que propone cualquier regla, se descartan los que la lección no tiene. El
alumno solo ve los acordes de su lección: proponerle otro sería ponerle una trampa. Si al
filtrar no queda ninguno, el fragmento sale marcado con un aviso.

□ **R‑12 · Las dominantes secundarias, solo si la lección las trae.**
Un cifrado de dominante sobre un bajo que no es el V da una dominante secundaria. Es recurso
de más adelante: si la lección no la incluye expresamente, sobre esa nota se toma el acorde
propio de la tonalidad (el VI, el IV6…).

---

## 2. Qué acorde cabe sobre cada nota de la melodía

En la armonización de soprano el razonamiento se invierte: la nota está en una voz superior y
el bajo se deduce.

□ **R‑13 · El acorde ha de contener la nota.**
Se parte de todos los acordes de la lección que contienen la nota de la melodía, en cualquier
inversión. Los demás quedan fuera.

□ **R‑14 · De esos, solo los que forman una sucesión válida.**
El motor recorre el fragmento entero y se queda con los que encajan en una sucesión que
cumple la sintaxis (sección 3). Los que contienen la nota pero no caben en ninguna sucesión
válida se dejan **sin marcar**, a la vista, por si el profesor los quiere.

□ **R‑15 · Cuando hay empate, decide la voz compañera.**
Entre dos cifrados igual de válidos se prefiere el que mejor suena con la otra voz escrita:
el que evita paralelas con ella y el que da mejor línea.

□ **R‑16 · Si la ficha da las funciones, las funciones limitan.**
Con las funciones tonales dadas al alumno, los acordes admisibles de cada nota se reducen a
los de la función que él ve. Con las funciones pedidas, no se limitan.

---

## 3. Sintaxis: qué puede seguir a qué

La regla de la octava mira cada nota con su contexto inmediato, así que puede acertar en cada
acorde y equivocarse en la frase. Estas reglas enderezan la frase.

□ **R‑17 · Delante de la tónica solo va la dominante.**
La subdominante no vuelve a la tónica mientras no se haya dado la fórmula T – S – T (que se
activa a partir de la lección 8). Si el modelo pone una subdominante antes de una tónica, se
cambia por la dominante que cabe sobre ese mismo bajo: casi siempre el V4/2, con la séptima
preparada por el acorde anterior, que baja de grado a la tercera de la tónica (fa – mi sobre
IV – V4/2 – I6).

□ **R‑18 · En la cadencia final, la subdominante antes de la dominante.**
Si el final es una fila de acordes de dominante —el V arpegiado durante dos compases—, los
primeros se cambian por subdominante (IV, II, II6…) y se deja la dominante pegada a la
tónica: el esquema es S – D – T. Cuando sobre ese bajo no cabe lo que la regla pide, se deja
lo que había y se marca para que el profesor lo confirme.

□ **R‑19 · El VI que prepara la dominante ya es subdominante.**
Su función la decide a dónde va, no su grado.

□ **R‑20 · El III no es tónica.**
En estas lecciones la tónica es I en estado fundamental o en primera inversión. El III lleva
función «—», sin función tonal.

□ **R‑21 · La función de un acorde se mira con su cifrado, no solo con su grado.**
El mismo romano con otro cifrado puede tener otra función.

---

## 4. Ritmo armónico: la síncopa armónica

□ **R‑22 · En la parte fuerte, la armonía ha de cambiar.**
Si un acorde entra en parte débil y se prolonga sobre la parte fuerte siguiente, eso es
síncopa armónica y no vale. «Parte fuerte» es relativo al ritmo armónico del fragmento: con
el tiempo dividido, el 6/4 cabe en la cabeza de cualquier tiempo.

□ **R‑23 · El mismo acorde en otra inversión sigue siendo el mismo acorde.**
La síncopa se mide por el acorde, no por el movimiento del bajo: si el bajo se mueve pero el
acorde es el mismo, hay síncopa igual.

□ **R‑24 · El 6/4 cadencial no cuenta como repetición.**
I6/4 – V sobre el mismo bajo es otra armonía, no la misma prolongada.

□ **R‑25 · El V que gana su séptima no es un acorde nuevo, pero no vale en la cabeza del
compás.** La fórmula I – V – V7 – I dentro del compás está bien. Cruzando la barra, no: el
tiempo fuerte del compás es donde la armonía tiene que cambiar.

□ **R‑26 · Dos dominantes seguidas sincopan solo si son del mismo tono.**
La secundaria y luego la de la tonalidad son dos armonías de verdad distintas.

□ **R‑27 · La respuesta modelo no sinCopa nunca.**
Donde la habría, se busca otro cifrado admisible de esa nota o de la anterior que cambie la
armonía. Los cifrados siguen siendo admisibles —el fallo es de la pareja, no del cifrado—:
solo cambia cuál es el modelo.

□ **R‑28 · El 6/4 cadencial, solo en parte fuerte.**

---

## 5. Conducción de voces (lo que el motor escribe y lo que corrige al alumno)

□ **R‑29 · Ni octavas ni quintas seguidas**, por movimiento paralelo o contrario, entre
cualquier par de voces. Es el único defecto con veto absoluto: el motor prefiere cualquier
otra cosa antes que dejar unas paralelas.

□ **R‑30 · Ni octava ni quinta por movimiento directo.**
Dos voces que van en la misma dirección y llegan a la octava o a la quinta. Con el bajo se
admite si la voz superior llega por grado conjunto; entre las voces agudas, si cualquiera de
las dos llega por grado conjunto. Un cambio de disposición del mismo acorde queda exento.

□ **R‑31 · Ninguna voz canta una segunda aumentada.**
Dos notas seguidas en la misma voz a distancia de segunda por nombre y tres semitonos. Es el
tropiezo del modo menor: del 6.º grado a la sensible. Solo se mira en las tres voces
superiores, porque el bajo viene dado.

□ **R‑32 · La séptima mayor ha de venir preparada.**
Sonando ya en la misma voz en el acorde anterior. La séptima menor puede entrar libremente.

□ **R‑33 · A la séptima no se entra por salto.**
Lo ortodoxo es que venga preparada; si no puede ser, se llega por grado conjunto. Nunca por
salto. **Excepción**: la séptima menor de la dominante entra libre, porque en II6/5 – V7 las
voces superiores del II6/5 son la, do y re, de modo que al fa del V7 se llega por fuerza
saltando una tercera, y esa fórmula es de las centrales del lenguaje.

□ **R‑34 · La séptima baja de grado.**

□ **R‑35 · La sensible sube a la tónica**, salvo que con eso el acorde se quede sin
quinta. La excepción vale solo en las voces interiores: si la sensible es la única voz
que sostiene la quinta, puede bajar a ella para que la tríada quede completa —es lo que
admiten Aldwell y Schachter—. En la soprano sube siempre. (Decidida por Diego el
29/9/2026 a partir de `A3-1-22`: allí, con la melodía en la tercera y la séptima
bajando a ella, resolver la sensible dejaría la tónica sin quinta.)

□ **R‑36 · En el acorde de novena, la sensible no va por encima de la novena.**
Chocarían en segunda con la sensible arriba. Salvo que la novena venga preparada del acorde
anterior.

□ **R‑37 · Ni saltos de séptima ni mayores que la octava** en ninguna voz.

□ **R‑38 · Todo salto se compensa.**
Después de un salto, la voz vuelve en dirección contraria.

□ **R‑39 · Las voces no se cruzan.**

□ **R‑40 · Las tres voces superiores, dentro de la octava.**
De la soprano al tenor, como mucho una octava, para que la mano derecha las toque de una vez.
Solo el salto del bajo al tenor queda libre. Si con la octava no hay ninguna disposición
posible, se admite hasta la novena y se marca como abierta.

□ **R‑41 · El techo de la soprano es el la5** (el la4 del índice español, 880 Hz). Solo se
pasa de ahí si con el techo no hay ninguna disposición posible para el acorde.

□ **R‑42b · El bajo y el tenor pueden ir al unísono.**
No es un defecto: es un recurso de manual, y a veces el único que evita unas octavas
seguidas entre las voces de arriba. Lleva un coste para que no salga gratis, y no se
admite en el acorde final. (Decidida por Diego el 29/9/2026 sobre `A3-2-01`: «el
unísono está justificado y sería correcto».)

□ **R‑42 · La soprano de la realización acaba en la tónica siempre que se puede.**

---

## 6. La línea del bajo en la armonización de soprano

Aquí el motor no elige acordes: elige en qué octava y con qué línea se escribe el bajo que
esos acordes piden. Se decide **la línea entera de una vez**, no nota a nota.

□ **R‑43 · La tesitura del bajo es mi2 – mi4**, con el centro cómodo en re3.

□ **R‑44 · Cuanto más pequeño el salto, mejor.**

□ **R‑45 · Todo salto grande se compensa** con un movimiento en dirección contraria.

□ **R‑46 · Ni séptimas ni saltos mayores que la octava.**

□ **R‑47 · El bajo no se pega a la melodía.**
Se penaliza el hueco demasiado estrecho entre el bajo y la nota de la soprano.

---

## 7. Cadencias y técnicas armónicas

Son lo que el programa **reconoce y nombra** en la armonización del alumno.

□ **R‑48 · Cadencia auténtica perfecta.**
V – I con los dos en estado fundamental (el bajo salta de quinta) y la soprano acabando en la
tónica.

□ **R‑49 · Cadencia auténtica imperfecta.**
Acaba en V – I, pero o bien el bajo no salta de quinta —porque hay una inversión, en la
dominante o en la tónica—, o bien la soprano no acaba en la tónica, sino en la tercera o, más
raramente, en la quinta.

□ **R‑50 · Cadencia plagal.**
La subdominante va directamente a la tónica, sin pasar por la dominante.

□ **R‑51 · Cadencia rota.**
La dominante no resuelve en la tónica, sino en el acorde que la sustituye (VI, o IV6). Pide
una cadencia auténtica detrás.

□ **R‑52 · Semicadencia.**
La frase se detiene en la dominante.

□ **R‑53 · Semicadencia frigia.**
En modo menor: IV6 – V (versión corta) o I – V6 – IV6 – V (versión larga). El bajo baja del
6.º grado al 5.º por semitono. El modo lo decide la tonalidad de la cadencia, no la del final
del fragmento.

□ **R‑54 · La cadencia empieza en la primera subdominante.**
Varias subdominantes seguidas cuentan como una sola. En T – S – S – S – D – T la cadencia
auténtica empieza en la primera S; en S – S – D, la semicadencia también.

□ **R‑55 · T – D – T no es cadencia: es prolongación de la tónica.**
Y solo lo es si el bajo hace un movimiento de bordadura o de bordadura incompleta. La
cadencia pide una subdominante delante.

□ **R‑56 · Varias subdominantes seguidas no son «prolongación de la subdominante».**

□ **R‑57 · Prolongación por arpegio.**
El mismo acorde arpegiado en el bajo: I – I6, V – V6, II – II6.

---

## 8. Lo que el motor no sabe

Dicho aquí para que nadie —yo el primero— le pida lo que no puede dar.

- **No conoce las notas extrañas.** No hay retardos, ni apoyaturas, ni notas de paso, ni
  bordaduras melódicas: toda nota del bajo o de la melodía pertenece al acorde. Esto es lo
  que más estrecha el repertorio de armonizaciones que admite.
- **No lee la frase más allá del silencio.** Lo único que corta una frase es un silencio
  escrito. No hay períodos, ni antecedente y consecuente, ni repeticiones reconocidas.
- **No deduce las modulaciones.** Las marca el profesor en el configurador; el motor solo
  recalcula el tramo con la tonalidad nueva y propone en el pivote los acordes comunes.
- **No juzga el estilo.** Comprueba sintaxis y conducción. Que un enlace sea correcto no
  quiere decir que sea bueno, ni al revés.
- **No sabe nada de textura, de instrumentación ni de tempo.**
- **No distingue un fragmento de Bach de uno de ejercicio.** Todo lo lee con el mismo
  repertorio de reglas.
- **Un fragmento a dos voces tiene hoy una sola lectura.** Que el mismo bajo y la misma
  melodía admitan sol menor o si♭ mayor, o T – D – T y T – S – T, es cierto y está por
  resolver: pendiente de implementar las **lecturas**.

---

## 9. Qué hacer con este documento

1. Márcalo. No hace falta de una vez ni por orden.
2. Donde pongas ✗ o ~, lo corrijo en el código y anoto aquí la regla como tuya.
3. A partir de ahí, cada regla del código cita su número, y cuando el motor y tus fragmentos
   discrepen sabremos qué regla mirar.

Mientras tanto, **tu criterio sobre un fragmento cerrado manda siempre sobre cualquier regla
de este documento**: por eso el sello va delante.
