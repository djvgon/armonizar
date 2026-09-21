# Banco de fragmentos · inventario y revisión (21/9/2026)

Revisión automática de los quince archivos de MuseScore de
`ejemplos/Fragmentos por lecciones/`. Se han importado todos con la aplicación
(lectura directa del `.mscz`) y se ha pasado cada fragmento por el motor de
reglas, como bajo dado o como melodía según en qué pentagrama esté escrito.

**Resultado: 196 fragmentos, de los cuales 187 los resuelve el motor sin tocar
nada.** Los nueve restantes se arreglan con dos retoques en MuseScore, que se
detallan al final.

## Inventario por archivo

| # | Archivo | Frag. | Dos voces | Solo bajo | Solo melodía | Tonalidades |
|---|---|---|---|---|---|---|
| 01 | A3-1. I, V y V7 - Fragmentos Bajo y soprano | 27 | 27 | 0 | 0 | Do M, Re M, Sol M, Fa M, re m, si m, sol m, mi m, Mi♭ M, la m, La M, do m |
| 02 | A3-1. I, V y V7 - Fragmentos Bajo | 27 | 0 | 27 | 0 | Do M, Re M, Sol M, Fa M, re m, si m, sol m, mi m, Mi♭ M, la m, La M, do m |
| 03 | A3-1. I, V y V7 - Fragmentos Soprano | 27 | 27 | 0 | 0 | Do M, Re M, Sol M, Fa M, re m, si m, sol m, mi m, Mi♭ M, la m, La M, do m |
| 04 | A3-2. I6, V6 y VII6 - Fragmentos Bajos | 10 | 0 | 10 | 0 | Do M, la m, mi m, Sol M, re m |
| 05 | A3-2. I6, V6 y VII6 - Fragmentos Sopranos | 10 | 10 | 0 | 0 | Do M, la m, mi m, Sol M, re m |
| 06 | A3-3. V7 en inversión - Fragmentos (bajo y soprano) | 14 | 12 | 2 | 0 | Do M, la m, Fa M |
| 07 | A3-3. V7 en inversión - Fragmentos Soprano | — | — | — | — | *un solo pentagrama, con la melodía* |
| 08 | A3-3. V7 en inversión - Melodías | 5 | 0 | 2 | 3 | Do M, la m, sol m, re m, Sol M |
| 09 | A3-4.IV, II y II6 - Fragmentos Bajo | 13 | 0 | 9 | 4 | Do M, Re M, Fa M, la m, si m |
| 10 | A3-4.IV, II y II6 - Fragmentos Soprano | 13 | 9 | 0 | 4 | Do M, Re M, Fa M, la m, si m, re m |
| 11 | A3-5. El 64 cadencial - Fragmentos Bajos y Sopranos | 10 | 10 | 0 | 0 | Do M, la m, Sol M, Fa M, mi m |
| 12 | A3-5. El 64 cadencial - Melodías | 5 | 1 | 2 | 2 | la m, Do M |
| 13 | A3-6. VI y IV6 - Fragmentos Bajos y Sopranos | 14 | 14 | 0 | 0 | Sol M, mi m, la m, Do M, Fa M, re m, sol m |
| 14 | A3-7. II7 y IV7 - Fragmentos Sopranos | 13 | 13 | 0 | 0 | Do M, la m, Sol M, re m, mi m, sol m |
| 15 | A3-8. Modulación al V - Fragmentos Bajos | 8 | 0 | 8 | 0 | Do M, Sol M |

«Dos voces» son los fragmentos que traen melodía y bajo a la vez: sirven para los
dos tipos de ejercicio sin volver a importar el archivo, y la voz que no se usa
fija la respuesta modelo (sin recortar las demás armonizaciones admisibles).

## Lo que hay que retocar en MuseScore

### 1. A3-1 · faltan seis barras dobles (afecta a los tres archivos de A3-1)

En los compases **17, 22, 29, 30, 31 y 32** hay un cambio de armadura pero no
hay barra doble al final del compás anterior. Como el fragmento se cierra en la
barra doble, esos ejercicios se pegan al siguiente y se leen como uno solo con
una modulación interna:

- fragmento 17 = mi menor + la menor pegados
- fragmento 21 = Fa mayor + Mi♭ mayor pegados
- fragmento 27 = mi menor + si menor + re menor + sol mayor pegados

Poniendo la barra doble al final de esos seis compases, los 27 fragmentos pasan
a ser **33** y desaparecen los dos únicos casos en que el motor se queda sin
opciones (notas 4 y 8 de los fragmentos pegados). Regla general: **un cambio de
armadura cierra el ejercicio, así que ahí va también la barra doble.**

### 2. A3-8 · tres etiquetas de tonalidad puestas sobre la nota equivocada

La etiqueta va sobre el **acorde pivote**: la última nota que todavía admite un
acorde común a las dos tonalidades. Si se pone sobre la primera nota ajena a la
tonalidad anterior (el fa♯ de una modulación de Do a Sol, por ejemplo), no hay
ningún acorde común posible y la aplicación avisa de que hay que elegir otra
nota como pivote.

| Fragmento | Bajo | Etiqueta ahora | Debería ir en |
|---|---|---|---|
| 1 | do sol **la** do `re` re sol | sobre el 1.er *re* (nota 4) | sobre **la** (nota 2), VI de Do = II de Sol |
| 6 | do **la** `fa♯` sol do | sobre el *fa♯* (nota 2) | sobre **la** (nota 1), VI de Do = II de Sol |
| 7 | do do si do **mi** `fa♯` sol do re sol | sobre el *fa♯* (nota 5) | sobre **mi** (nota 4), III de Do = VI de Sol |

En los fragmentos 5 y 8 hay dos etiquetas («Re M» y «Sol M») que caen sobre la
misma nota, la última; conviene comprobar dónde están puestas. El motor los
resuelve igualmente.

## Detalles menores, sin consecuencias

- **A3-3 «Fragmentos Soprano»** (archivo 07) tiene un solo pentagrama, con la
  melodía: hay que importarlo con el tipo «Armonización de soprano» elegido.
- Algunos archivos mezclan voces: en **A3-4 «Fragmentos Bajo»** los fragmentos
  1, 2, 5 y 6 están escritos en el pentagrama de arriba (son melodías), y en
  **A3-3 «Melodías»** los fragmentos 1 y 2 son bajos. No estorba —la aplicación
  toma el pentagrama que corresponde y la lista de fragmentos dice cuál trae
  cada uno—, pero conviene saberlo al repartirlos.
- **A3-5 «Melodías»** trae el mismo ejercicio dos veces, una como bajo y otra
  como melodía (fragmentos 2/3 y 4/5).
- Siete fragmentos salen marcados con **(?)** en la tonalidad: son bajos solos
  que acaban en semicadencia y no llevan escrita la sensible, así que la
  armadura no basta para decidir el modo. La tonalidad propuesta es la correcta
  en los siete; basta con confirmarla en el desplegable.
