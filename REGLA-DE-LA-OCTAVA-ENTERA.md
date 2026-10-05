# La regla de la octava, entera

Qué acordes caben sobre cada grado del bajo, y qué contexto elige cada uno.

**No está copiada de ningún libro: está generada desde el motor de la aplicación**
(`js/reglas.js`) por `herramientas/generar-regla-octava.js`, que recorre **6279 contextos**
—cada grado del bajo con cada nota anterior y cada nota siguiente posibles, en las
octavas que convierten un mismo par de grados en paso o en salto, y en los dos modos—
y agrupa los que dan la misma respuesta. Quedan **73 respuestas distintas**.

Lo que dice aquí es, por tanto, exactamente lo que la aplicación corrige. **Si cambias
una regla, vuelve a pasar el guion**: es lo único que mantiene juntos los apuntes y el
programa.

Generado el 05/10/2026.

## Cómo se lee

Son siete reglas **en orden de precedencia**: se prueban de arriba abajo y **gana la
primera que encaja** dejando alguna cifra del repertorio. Por eso, dentro de cada grado,
las filas van en ese orden y una de abajo solo se aplica si ninguna de arriba valía.

«Llega» y «sale» dicen cómo se mueve el bajo respecto de la nota anterior y de la
siguiente; **—** es el principio o el final de la frase. Las cifras van como en la paleta
del alumno: **—** es el 5/3 · **7/+** el V7 · **+6** el V4/3 · **6/5̸** el V6/5 · **+4** el V4/2.

**Una advertencia**: la tabla recorre *todos* los contextos posibles, también los que no
se dan nunca en música de verdad —una frase que acabe sobre el 2.º grado, por ejemplo—.
Si te tropiezas con una fila rara, probablemente sea una de esas: no es un error, es un
hueco del espacio de combinaciones que nadie visita.

---

## Modo mayor

### Sobre el 1.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | I |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | VI |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |

### Sobre el 2.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | II |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6 · 6** | V VII |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6** | V |
| R5 funcional | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto asc, salto desc | **— · 7** | II II |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6 · 6** | V VII |

### Sobre el 3.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **6** | I |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |

### Sobre el 4.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | IV |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | IV |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+4** | V |
| R5 funcional | salto desc | 2.ª asc, salto asc, salto desc | **6/5 · 6 · —** | II II IV |
| R6 4̂ salta | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto asc, salto desc | **+4** | V |
| R7 RO | 2.ª desc | 2.ª desc | **+4** | V |
| R7 RO | —, 2.ª asc, salto asc, salto desc | 2.ª desc | **+4 · —** | V IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, salto asc, salto desc | **—** | IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª asc | **6/5 · 6 · —** | II II IV |

### Sobre el 5.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | V |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 7/+** | V V |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | V |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 7/+** | V V |

### Sobre el 6.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | VI |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 6** | VI IV |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | IV |
| R5 funcional | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto desc | **— · 6** | VI IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª desc | **4/3 · 6 · —** | II IV VI |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, salto asc, salto desc | **— · 6** | VI IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª asc | **6 · —** | IV VI |

### Sobre el 7.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | VII |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | V |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | V |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6/5̸ · 6** | V V |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª desc, salto asc, salto desc | **6** | V |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª asc | **6/5̸ · 6** | V V |

---

## Modo menor

### Sobre el 1.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | I |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | VI |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | I |

### Sobre el 2.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | II |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6 · 6** | V VII |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6** | V |
| R5 funcional | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto asc, salto desc | **— · 7** | II II |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+6 · 6** | V VII |

### Sobre el 3.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **6** | I |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | I |

### Sobre el 4.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | IV |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **—** | IV |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **+4** | V |
| R5 funcional | salto desc | 2.ª asc, salto asc, salto desc | **6/5 · 6 · —** | II II IV |
| R6 4̂ salta | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto asc, salto desc | **+4** | V |
| R7 RO | 2.ª desc | 2.ª desc | **+4** | V |
| R7 RO | —, 2.ª asc, salto asc, salto desc | 2.ª desc | **+4 · —** | V IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, salto asc, salto desc | **—** | IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª asc | **6/5 · 6 · —** | II II IV |

### Sobre el 5.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | V |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 7/+** | V V |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 7/+** | V V |

### Sobre el 6.º grado del bajo

| Regla | Llega | Sale | Cifras (la 1.ª es la modelo) | Acordes |
|---|---|---|---|---|
| R1 final | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | — | **—** | VI |
| R3 repetición | repite | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **— · 6** | VI IV |
| R4 arpegio | salto asc, salto desc | repite, 2.ª asc, 2.ª desc, salto asc, salto desc | **6** | IV |
| R5 funcional | —, 2.ª asc, 2.ª desc, salto asc, salto desc | salto desc | **— · 6** | VI IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª desc | **4/3 · 6 · —** | II IV VI |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | repite, salto asc, salto desc | **— · 6** | VI IV |
| R7 RO | —, 2.ª asc, 2.ª desc, salto asc, salto desc | 2.ª asc | **6 · —** | IV VI |
