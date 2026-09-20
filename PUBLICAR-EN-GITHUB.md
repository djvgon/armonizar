# Publicar la aplicación en GitHub Pages — guía paso a paso

Al terminar tendrás una dirección del tipo `https://TUUSUARIO.github.io/armonizar/`
que funciona en cualquier ordenador, tablet o móvil, y desde la que el
configurador generará enlaces válidos para los alumnos. Todo es gratuito.
Cuenta con unos 20 minutos la primera vez. Conviene hacerlo con Chrome (el paso
de subir carpetas arrastrando funciona mejor que en Safari).

Lo que se publica es exactamente el contenido de esta carpeta. Todo lo que
subas será visible públicamente (es una web), así que si prefieres no publicar
`ESPECIFICACION.md` (documento de trabajo) o `PUBLICAR-EN-GITHUB.md`, no los
arrastres; la aplicación no los necesita.

## 1. Crear la cuenta (una sola vez)

1. Entra en <https://github.com> y pulsa **Sign up**.
2. Escribe tu correo, una contraseña y un **nombre de usuario**. Ese nombre
   formará parte de la dirección de la aplicación
   (`https://NOMBRE.github.io/armonizar/`), así que elige uno corto y sin
   espacios ni acentos, por ejemplo `diegovigueras`.
3. Resuelve la comprobación («verify») e introduce el código que llega por
   correo. Si pregunta por el plan, elige el gratuito (**Free**).

## 2. Crear el repositorio (la «carpeta» pública)

1. Arriba a la derecha, pulsa **+** y después **New repository**.
2. En **Repository name** escribe `armonizar` (en minúsculas, sin espacios).
3. Deja marcado **Public**.
4. Marca la casilla **Add a README file** (así el repositorio no queda vacío y
   aparecen los botones para subir archivos).
5. Pulsa **Create repository**.

## 3. Subir los archivos de la aplicación

1. En la página del repositorio, pulsa **Add file** → **Upload files**.
2. Abre en el Finder la carpeta de la aplicación (en Drive murciaeduca.es:
   `3. RECURSOS - DOCENTE › Recursos de Claude › APLICACIÓN WEB PARA ARMONIZAR MELODÍAS`).
3. Selecciona **todo el contenido de la carpeta** (no la carpeta en sí):
   `index.html`, `configurar.html`, `pruebas.html`, `LEEME.md` y las carpetas
   `css`, `js`, `fuentes` y `ejemplos`. Arrástralo a la zona punteada del
   navegador que dice *Drag files here*. Las carpetas se suben con su
   estructura; espera a que aparezcan todos los archivos en la lista (unos 20).
4. Baja hasta **Commit changes**, deja el texto que propone y pulsa el botón
   verde **Commit changes**.

## 4. Activar la web (GitHub Pages)

1. En la página del repositorio, pulsa la pestaña **Settings** (rueda dentada).
2. En el menú de la izquierda, pulsa **Pages**.
3. En **Build and deployment** → **Source**, elige **Deploy from a branch**.
4. En **Branch**, elige `main` y, a su derecha, `/ (root)`. Pulsa **Save**.
5. Espera uno o dos minutos y recarga la página: arriba aparecerá *Your site
   is live at* `https://TUUSUARIO.github.io/armonizar/`. (Si tarda, en la
   pestaña **Actions** se ve el proceso «pages build and deployment».)

## 5. Comprobar

- Abre `https://TUUSUARIO.github.io/armonizar/` → página del alumno con los
  ejercicios del corpus.
- Abre `https://TUUSUARIO.github.io/armonizar/configurar.html` → configurador.
  **A partir de ahora, genera las direcciones de los alumnos desde este
  configurador publicado**, no desde el de tu Mac: el enlace toma como base la
  dirección de la página en la que estás, y solo así empezará por `https://`.
- Prueba un ejercicio de Audición con el sonido en Safari y en Chrome, y si
  puedes, en una tablet.

## 6. Actualizar la aplicación

Cada vez que haya una versión nueva en la carpeta de Drive, repite el paso 3
arrastrando otra vez todo el contenido: los archivos con el mismo nombre se
sustituyen. Un archivo que se borre en Drive no desaparece de GitHub solo; para
quitarlo, ábrelo en GitHub y usa el icono de la papelera (**Delete file**). En
el primer «commit» de cada actualización conviene escribir en una línea qué
cambia (por ejemplo, «Sonido de clave y órgano»), para tener historial.

Si más adelante quieres ahorrarte el arrastre, hay dos opciones: la aplicación
**GitHub Desktop** (sincroniza una carpeta de tu Mac con el repositorio con un
botón) o darle a Claude un permiso limitado para subir los cambios
directamente; lo vemos cuando haga falta.

## Dominio propio (opcional, más adelante)

Si compras un dominio, en **Settings → Pages → Custom domain** se asocia sin
coste. Hasta entonces, la dirección `github.io` es perfectamente válida para
los alumnos.
