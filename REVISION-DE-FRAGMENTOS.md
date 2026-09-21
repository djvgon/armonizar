# Revisión de los fragmentos: tonalidad, cifrado y sintaxis de la cadencia

22 de septiembre de 2026 · versión 20260922-0450 · 131 fragmentos

## 1. El III ya no hace de tónica

Tenías razón: en las lecciones incorporadas la tónica es **solo el I**, en estado
fundamental o en primera inversión. Salía el III por dos motivos, los dos
corregidos:

- La regla del final daba estado fundamental a cualquier nota, así que un fragmento
  que acaba en el 3.er grado se cifraba **III**. Ahora es **I6**.
- La lista de acordes del paso 3 solo gobernaba la armonización de melodías; en el
  bajo dado mandaba únicamente la lista de cifras, de modo que el motor proponía
  acordes que el alumno **no tiene a mano**. Ahora el modelo y las admisibles se
  limitan a los acordes de la lección, y con ellos desaparecen el III y el VII en
  estado fundamental.

## 2. Delante de la tónica solo va la dominante

La subdominante no vuelve a la tónica mientras la fórmula T S T no tenga fragmentos.
Donde el motor ponía `IV – I6` ahora pone la dominante que cabe sobre ese mismo bajo:
el **V4/2**, con la séptima preparada por el acorde anterior, que baja de grado a la
tercera de la tónica. Tu fragmento:

```
do mi | fa fa | mi          antes:  I | I6 | IV | IV  | I6      (T T S S T)
                            ahora:  I | I6 | IV | V+4 | I6      (T T S D T)
```

Con la misma corrección quedan arreglados los otros tres de esa forma
(`fa la | si♭ si♭ | la` en Fa M, `re fa | sol sol | fa` en re m y
`sol | do do | si` en Sol M), y los dos sitios donde pasaba lo mismo en medio de un
fragmento de A3-7 y de A3-8.

## 3. En la cadencia final, la subdominante antes de la dominante

Si el final era una fila de acordes de dominante —el V arpegiado durante dos
compases—, los primeros pasan a subdominante y se deja la dominante pegada a la
tónica: **S – D – T**. El otro fragmento que me señalaste:

```
do re mi | fa re | sol | do   antes:  I | V+6 | I6 | V+4 | V+6 | V | I   (T D T D D D T)
                              ahora:  I | V+6 | I6 | IV  | II  | V | I   (T D T S S D T)
```

Subdominante sobre el **fa** y sobre el **re**, dominante sobre el **sol**, tónica en
el **do**, como pedías. Lo mismo en sus gemelos de Re M y si m, y en seis fragmentos
de A3-5 donde la dominante ocupaba tres y cuatro acordes seguidos.

## 4. Los 14 fragmentos donde la subdominante no cabe

Me pediste que te avisara. En todos ellos las notas que preceden a la tónica son el
**5.º o el 7.º grado**, sobre los que no hay ningún acorde de subdominante posible.
Confírmame si te parecen bien tal como están.

| Lección | Bajo | Cadencia | Por qué |
|---|---|---|---|
| A3-1-08, A3-1-09 | `do sol sol do` | I · V · V7 · I | el repertorio de A3-1 son solo I, V y V7 |
| A3-1-30 | `si fa♯ fa♯ si` (si m) | I · V · V7 · I | ídem |
| A3-1-32 | `sol re re sol` (sol m) | I · V · V7 · I | ídem |
| A3-2-03 | `do mi \| sol si \| do` | I · I6 · V · V6 · I | sol y si son 5.º y 7.º grado |
| A3-2-12 | `mi do \| si sol \| do` | I6 · I · V6 · V · I | ídem |
| A3-2-04 | `la do \| si sol♯ \| la` (la m) | I · I6 · VII6 · V6 · I | si y sol♯ son 2.º y 7.º; el II del menor sería una tríada disminuida en estado fundamental |
| A3-2-10 | `re fa \| mi do♯ \| re` (re m) | I · I6 · VII6 · V6 · I | ídem |
| A3-3-04 | `do fa mi \| sol si do` | I · V+4 · I6 · V · V6 · I | sol y si son 5.º y 7.º |
| A3-3-20 | `… sol sol \| do` | … · V · V · I | la dominante con salto de octava en el bajo |
| A3-5-03 | `… mi mi \| la` (la m) | … · I6/4 · V · I | es la fórmula de A3-5: 6/4 cadencial + V |
| A3-5-06 | `… do do \| fa` (Fa M) | … · I6/4 · V · I | ídem |
| A3-5-07 | `… sol sol \| do` | … · I6/4 · V · I | ídem |
| A3-8-03 | `do do si sol \| do` | I · I · V6 · V · I | si y sol son 7.º y 5.º grado |

(Los tres de A3-5 llevan el 6/4 cadencial sobre el 5.º grado repetido, que es justamente la fórmula de esa lección.)

## 5. Cómo queda el banco

- **131 fragmentos**: 129 tras fundir las dos entradas duplicadas (entraban dos veces,
  una de ellas en la tonalidad equivocada por venir del archivo de bajos, sin la melodía
  que lo prueba), más los 2 que salen de partir el ejercicio de A3-2 en sus dos mitades.
- **0** subdominantes que resuelvan en tónica.
- **0** acordes fuera del repertorio de su lección.
- **0** síncopas armónicas en el modelo.
- **0** incoherencias entre armadura, tonalidad y cifrado.
- **0** fragmentos que acaben en un acorde que no sea tónica ni dominante.
- Las 218 respuestas del corpus se siguen reproduciendo sin una sola discrepancia.

## 6. Tus correcciones, ya incorporadas

**A3-8-06** (`do la | fa♯ sol | do`). Con el rótulo «Do M» sobre el sol sale
**`I | II | V 6/5̸ | V | I`** (T S D D T): la dominante de la dominante y vuelta a casa,
tal como decías. Con esto ya no queda ningún fragmento que acabe en un acorde que no sea
tónica ni dominante.

**A3-2** (`la sol♯ | la do | mi | la | mi do | si sol | do`). En el archivo de **sopranos**
has partido el ejercicio con una barra doble al final del compás 8, y sale mejor que con
el rótulo: son dos fragmentos independientes, los dos limpios —

```
la sol♯ | la do | mi | la     la menor   I | V6 | I | I6 | V | I
mi do | si sol | do           Do mayor   I6 | I | V6 | V | I
```

## 7. Lo único que queda por tocar

**La misma barra doble, en el archivo de BAJOS de A3-2.** Ese archivo
(«A3-2. I6, V6 y VII6 - Fragmentos Bajos.mscz») sigue teniendo el ejercicio entero, así
que entra en el banco una tercera vez, sin partir, y su `sol` natural del final se queda
sin cifra: queda fuera de las fichas. Pon la barra doble al final del compás 8 —después
del `la`—, igual que en el de sopranos, y esa entrada desaparecerá sola; las dos mitades
recogerán entonces también su bajo.

**Y, si quieres**, las dos melodías de soprano de A3-3 (`la si do` en Do M y
`sol la si♭` en Si♭ M): su primera nota, el 6.º grado, no está en ningún acorde del
repertorio de A3-3 (solo I, V y VII6), porque pide el **VI**, que en tu programa entra en
A3-6. O las pasas a A3-6, o marcas el VI en el repertorio de A3-3.
