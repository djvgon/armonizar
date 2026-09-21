# La lección de modulación (A3-8), repasada

22 de septiembre de 2026 · versión 20260922-0620 · 131 fragmentos

## 1. Los dos acordes que señalabas ya estaban corregidos

La ficha de la captura viene de la versión publicada en GitHub, que todavía es la
anterior. En la que te entregué ayer (20260922-0450) ese ejercicio —A3-8-08,
`do fa | fa mi re | do do | si la sol | do do♯ re | sol`— ya sale así:

```
I — | IV — | V +4 | I 6 | V +6 | IV — | V +4 | I 6 | V +6 | I — | IV — | V 6/5̸ | V — | I —
 T     S      D      T      D      S      D      T      D      T      S      D       D     T
```

- **Sobre el segundo do del tercer compás**: `V +4` — el V4/2 de Sol M, con la séptima
  (el propio do del bajo) preparada por el IV anterior y bajando de grado al si, que es
  el I6 del cuarto compás. Delante de tónica, dominante.
- **Sobre el do♯**: `V 6/5̸` de Re mayor, como pedías. La otra lectura que dabas por
  buena, el V6, también está admitida (`[65d, 6]`).

Sube el `banco.json` nuevo al repositorio y la ficha saldrá ya con este análisis.

## 2. Lo que sí he tenido que corregir en la lección

**A3-8-01** (`do sol | la do | re re | sol`) llevaba un **6/4 que no resolvía**: el motor
lo ponía sobre el sol del primer compás como arpegio de la tónica (do → sol), y de ahí
saltaba al la. Un 6/4 así ni resuelve en el V ni es dominante, aunque la fila de funciones
lo diera por tal. Ahora el 6/4 solo se propone cuando es **cadencial** —sobre el 5.º grado
y con la nota repetida, para que resuelva en el V sobre ese mismo bajo—, y el fragmento
sale `I | V | VI | IV | V | V | I`.

Y al revés: ahora el 6/4 **sí se ofrece sobre el 5.º grado repetido**, que es la fórmula
de A3-5. Cinco fragmentos de esa lección (`sol sol | do`, `re re | sol`, `mi mi | la`…)
llevaban `V7 | V | I` —la séptima puesta y quitada, que es justo lo que la ortografía no
admite— y ahora llevan **`I 6/4 | V | I`**, que es lo que la melodía que tú escribiste
pedía.

## 3. El resto de la lección, comprobado uno a uno

| | Bajo | Modelo | Funciones |
|---|---|---|---|
| A3-8-01 | `do sol \| la do \| re re \| sol` | I · V · VI · IV · V · V · I | T D T S D D T |
| A3-8-02 | `do la fa \| sol mi \| do re \| sol` | I · VI · II6 · V · I6 · II6 · V · I | T T S D T S D T |
| A3-8-03 | `do do si sol \| do` | I · I · V6 · V · I | T T D D T |
| A3-8-04 | `do la fa sol \| mi do re re \| sol` | I · VI · II6 · V · I6 · II6 · V · V · I | T T S D T S D D T |
| A3-8-05 | `_ sol \| do do♯ re \| sol` | I · IV · **V 6/5̸** · V · I | T S D D T |
| A3-8-06 | `do la \| fa♯ sol \| do` | I · II · V 6/5̸ · V · I | T S D D T |
| A3-8-07 | `_ do \| do si \| do mi \| fa♯ sol \| do re \| sol` | I · II4/2 · V6/5̸ · I · IV6 · V6/5̸ · I · II6/5 · V · I | T S D T S D T S D T |
| A3-8-08 | (arriba) | | T S D T D S D T D T S D D T |

En los ocho: **delante de cada tónica hay una dominante**, la cadencia final lleva
subdominante antes de la dominante siempre que el bajo lo permite, y ningún acorde queda
fuera del repertorio de la lección.

## 4. Ortografía armónica: cómo está la realización a cuatro voces

He pasado la auditoría de conducción de voces por la realización modelo de los 131
fragmentos del banco. En **A3-8 no queda ni un aviso**. En todo el banco quedan cuatro,
ninguno de esta lección:

- **A3-2-08** (`sol si | re`) y **A3-2-09** (`la mi | do la | mi`): una octava y una quinta
  por movimiento directo con la soprano, en fragmentos de tres y cinco notas donde apenas
  hay margen de disposición.
- **A3-5-11** y **A3-5-12**: una séptima que, al arpegiarse el mismo acorde, pasa a otra
  voz en vez de bajar de grado en la suya.

Dime si quieres que me meta con esos cuatro o los dejamos.

## 5. Sigue pendiente, de la revisión anterior

La barra doble en el archivo de **bajos** de A3-2, al final del compás 8 —la que ya
pusiste en el de sopranos—. Mientras no esté, ese ejercicio entra una tercera vez sin
partir y su `sol` natural del final se queda sin cifra.
