# Mesa de ayuda: trabajo de repaso para el Previo 1

Vas a construir el tablero de la mesa de ayuda de una oficina. La gente reporta problemas (la impresora no imprime, el correo no abre en el celular) y el equipo de soporte los va atendiendo. Cada problema reportado es un **ticket**.

## Lo que trae el repositorio

- `public/index.html`: la página, todavía sin estilos.
- `public/app.js`: casi vacío. Aquí va tu código.
- `db.semilla.json`: los diez tickets con los que arranca todo.
- `db.json`: se crea solo la primera vez que corres la API. Es la base de datos de verdad: json-server lo reescribe cada vez que creas, editas o borras algo. Tenlo abierto en el editor mientras trabajas y míralo cambiar.
- `package.json`: dice qué necesita el proyecto (json-server) y define los comandos que vas a usar.
- `preparar-db.js`: crea o reinicia `db.json`. No necesitas tocarlo.

## Antes de empezar

1. Revisa que tengas Node.js con `node -v`. Si no aparece una versión, instálalo desde [nodejs.org](https://nodejs.org/es/download).
2. En la carpeta del proyecto corre `npm install`. Se hace una sola vez y descarga json-server dentro de `node_modules`.
3. Corre `npm run api` y deja esa terminal abierta. Mientras esté corriendo, la API existe.
4. Abre http://localhost:3000. Tu página se sirve desde ahí mismo. Si abres http://localhost:3000/tickets, ves la API respondiendo JSON directamente.
5. Abre las herramientas de desarrollador del navegador (F12) y ten a mano dos pestañas: **Console**, donde aparecen los errores con su número de línea, y **Network** (Red), donde ves cada petición con su método, el cuerpo que enviaste, el código de estado y lo que respondió el servidor. Buena parte de este trabajo se entiende mirando Network.

Los comandos disponibles:

| Comando | Qué hace |
|---|---|
| `npm run api` | Levanta la API y sirve la página en el puerto 3000 |
| `npm run api:lento` | Lo mismo, pero cada respuesta tarda 1,5 segundos |
| `npm run reiniciar` | Devuelve `db.json` a los diez tickets iniciales |

## La API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/tickets` | Devuelve todos los tickets |
| GET | `/tickets/:id` | Devuelve un ticket |
| POST | `/tickets` | Crea un ticket. El servidor le asigna el `id` |
| PUT | `/tickets/:id` | Reemplaza el ticket completo por lo que envíes |
| PATCH | `/tickets/:id` | Cambia solo los campos que envíes |
| DELETE | `/tickets/:id` | Elimina el ticket |

En las rutas, `:id` se reemplaza por el número del ticket: `/tickets/3`.

Un ticket se ve así:

```json
{
  "id": 1,
  "titulo": "La impresora del segundo piso no imprime",
  "descripcion": "Los documentos quedan en cola y nunca salen.",
  "solicitante": "Luz Marina Ortega",
  "categoria": "hardware",
  "prioridad": "media",
  "estado": "abierto"
}
```

Valores posibles: `categoria` puede ser `hardware`, `software`, `red` o `accesos`; `prioridad` puede ser `baja`, `media` o `alta`; `estado` puede ser `abierto`, `en_progreso` o `resuelto`.

## Una recomendación antes de escribir código

`app.js` ya trae un arreglo llamado `tickets`. Úsalo como la única fuente de verdad del navegador: al cargar la página lo llenas con lo que responde la API, cada operación posterior lo actualiza con lo que devuelve el servidor, y una sola función (llámala `pintar`, por ejemplo) borra la lista y la vuelve a dibujar a partir del arreglo. Si cada botón toca el DOM a su manera, hacia el nivel 4 ya no vas a saber por qué la pantalla muestra lo que muestra.

---

## Nivel 0 · La maqueta con Tailwind

Dale forma a `index.html` usando solo clases de Tailwind: nada de archivo CSS propio ni atributos `style`. Puedes agregar contenedores y clases, pero no cambies los `id`, porque tu JavaScript depende de ellos.

- En pantallas grandes (desde `lg`), el formulario va a la izquierda y el tablero a la derecha, ocupando más espacio. En el celular todo va en una sola columna: primero el formulario y después el tablero.
- Los campos del formulario ocupan todo el ancho, tienen su etiqueta encima y muestran un foco visible al hacer clic en ellos.
- Los botones cambian de aspecto al pasar el mouse.
- Los filtros (estado y búsqueda) van en una fila desde pantallas medianas.

**Pista:** al abrir la página por primera vez se ve incluso más plana que un HTML sin estilos. Es normal: Tailwind borra los estilos que el navegador pone por defecto, y un `h1` queda del mismo tamaño que un párrafo. Recuerda que Tailwind se piensa primero para el celular: una clase sin prefijo aplica en todos los tamaños, y una con `lg:` aplica solo desde 1024 px en adelante. Por eso `grid lg:grid-cols-3` da una columna en el celular y tres en pantalla grande.

**Documentación:** [diseño responsivo](https://tailwindcss.com/docs/responsive-design) · [hover, focus y otros estados](https://tailwindcss.com/docs/hover-focus-and-other-states)

**Quedó bien si:** al hacer más angosta la ventana (o al activar el modo dispositivo de las herramientas de desarrollador con Ctrl+Shift+M), el formulario pasa encima del tablero y nada se sale de la pantalla.

## Nivel 1 · Listar los tickets (GET)

Cuando cargue la página, pide los tickets a la API y dibuja una tarjeta por cada uno dentro de `#lista-tickets`. Cada tarjeta muestra el número (`#1`), título, descripción, solicitante, categoría, prioridad y estado. Muestra textos pensados para personas: "En progreso", no `en_progreso`.

- Las tarjetas van en una columna en el celular y en dos desde `md`.
- La prioridad y el estado se distinguen por color y también por texto. Si solo usas color, alguien que no distingue el rojo del verde se pierde la información.

Además, tu página maneja tres situaciones usando `#mensaje`:

- **Cargando:** mientras llega la respuesta, dice que está cargando. Con `npm run api:lento` alcanzas a verlo.
- **Error:** si la petición falla, explica qué pasó y qué hacer. Para probarlo, cambia por un momento `API_URL` a `http://localhost:3000/ticketz` (con z) y recarga: el servidor va a responder 404.
- **Vacío:** si no hay tickets, invita a crear el primero. Puedes probarlo cambiando en `db.json` la lista por `"tickets": []` y recargando. Después vuelve a los datos con `npm run reiniciar`.

Cuando todo sale bien, `#mensaje` no se ve.

**Pista:** usa `async`/`await` con `try`/`catch`. Ojo con esto: `fetch` solo falla por su cuenta cuando no hay conexión. Si el servidor responde 404 o 500, la promesa se resuelve normalmente y eres tú quien debe revisar `respuesta.ok` y lanzar el error. Para los textos y colores te sirve un objeto como este:

```js
const ESTADOS = {
  abierto: { etiqueta: 'Abierto', clases: 'bg-sky-100 text-sky-800' },
  en_progreso: { etiqueta: 'En progreso', clases: 'bg-amber-100 text-amber-800' },
  resuelto: { etiqueta: 'Resuelto', clases: 'bg-emerald-100 text-emerald-800' },
};

ESTADOS[ticket.estado].etiqueta; // "En progreso"
```

Escribe las clases completas, nunca armadas por pedazos como `'bg-' + color + '-100'`. Con el CDN funcionan igual, pero cuando uses Tailwind instalado en un proyecto, las clases armadas por pedazos no se generan y tu página queda sin esos estilos.

**Documentación:** [usar fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch) · [Response.ok](https://developer.mozilla.org/es/docs/Web/API/Response/ok) · [try...catch](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/try...catch)

**Quedó bien si:** ves los diez tickets; con `api:lento` alcanzas a leer el mensaje de carga; con la URL mal escrita aparece tu mensaje de error en lugar de una página en blanco.

## Nivel 2 · Crear tickets (POST)

El formulario crea un ticket nuevo. Antes de enviar, valida:

- El título tiene al menos 5 caracteres, sin contar los espacios del principio y del final.
- El solicitante no está vacío.

Los errores aparecen debajo de cada campo, en `#error-titulo` y `#error-solicitante`, y desaparecen cuando el dato se corrige. El formulario tiene el atributo `novalidate` para que el navegador no valide por ti: la validación es tuya.

Todo ticket nuevo arranca con estado `abierto`, y eres tú quien lo pone en el objeto que envías. Cuando el servidor responde, el ticket aparece en el tablero sin recargar la página y el formulario queda limpio.

**Pista:** en el evento `submit`, lo primero es `preventDefault()`. Un POST necesita tres cosas en las opciones de `fetch`: `method`, el encabezado `Content-Type: application/json` y un `body` hecho con `JSON.stringify`. La respuesta trae el ticket con el `id` que le asignó el servidor: agrega ese objeto al arreglo, no el que armaste tú, porque al tuyo le falta el `id`.

**Documentación:** [preventDefault](https://developer.mozilla.org/es/docs/Web/API/Event/preventDefault) · [POST](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods/POST) · [JSON.stringify](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

**Quedó bien si:** el ticket aparece con su número; en Network el POST tiene código 201; al recargar la página sigue ahí, y también está en `db.json`.

**Prueba adicional:** crea un ticket con el título `<b>hola</b> no carga el escáner`. Si en la tarjeta ves "hola" en negrita, estás insertando lo que escribió el usuario como HTML con `innerHTML`. Cámbialo por `textContent`: en una página real, cualquiera podría meter lo que quisiera en ese campo.

## Nivel 3 · Cambiar el estado (PATCH)

Cada tarjeta tiene un botón que hace avanzar el ticket: abierto, luego en progreso, luego resuelto. El texto del botón depende del estado: "Empezar" si está abierto, "Marcar resuelto" si está en progreso. Los tickets resueltos no tienen este botón y se ven apagados (colores más suaves, otro fondo), para que la vista se vaya a los pendientes.

Envía solo el campo que cambia, por ejemplo `{ "estado": "en_progreso" }`. Con lo que responda el servidor, actualiza el arreglo y vuelve a pintar.

**Pista:** el botón de cada tarjeta puede recibir su `addEventListener` en el momento en que creas la tarjeta; la función flecha recuerda a qué ticket pertenece. Para saber cuál es el siguiente estado, agrégale al objeto `ESTADOS` una propiedad `siguiente`.

**Documentación:** [PATCH](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods/PATCH)

**Quedó bien si:** en Network el cuerpo del PATCH tiene un solo campo y la respuesta trae el ticket completo; la tarjeta cambia sin recargar la página.

## Nivel 4 · Editar tickets (PUT)

Cada tarjeta tiene un botón "Editar". Al pulsarlo, el mismo formulario se llena con los datos del ticket y pasa a modo edición: el título del formulario dice "Editar ticket #6", el botón de envío dice "Guardar cambios" y aparece `#btn-cancelar`. Guardar envía un PUT. Cancelar vuelve al modo de creación y limpia el formulario. La validación del nivel 2 aplica igual.

**Pista:** necesitas saber si el formulario está creando o editando. Basta una variable con el `id` del ticket en edición, o `null` cuando está creando. Recuerda la tabla de la API: PUT reemplaza el ticket completo por lo que envíes.

**Documentación:** [PUT](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods/PUT)

**Quedó bien si:** editas el título de un ticket que está "En progreso", guardas, y sigue "En progreso". Si no es así, haz el experimento que viene a continuación y vas a entender por qué.

## Experimento: PUT contra PATCH

Hazlo después del nivel 4. Pega esto en la consola del navegador:

```js
await fetch('http://localhost:3000/tickets/3', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo: 'Solo mando el título' })
}).then(r => r.json())
```

Mira qué responde el servidor y busca el ticket 3 en `db.json`. Luego haz lo mismo con el ticket 7, cambiando `PUT` por `PATCH`. Compara los dos resultados: con eso respondes las preguntas 1 y 2. Al terminar, corre `npm run reiniciar` y recarga la página para volver a los datos iniciales.

## Nivel 5 · Eliminar tickets (DELETE)

Cada tarjeta tiene un botón "Eliminar" que pide confirmación con `confirm`. Si la persona acepta, envía el DELETE y, cuando el servidor responda bien, quita el ticket del arreglo y vuelve a pintar. Si el ticket eliminado era el que estaba en el formulario de edición, el formulario vuelve al modo de creación.

**Documentación:** [DELETE](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods/DELETE) · [confirm](https://developer.mozilla.org/es/docs/Web/API/Window/confirm) · [filter](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)

**Quedó bien si:** el ticket desaparece de la pantalla y de `db.json`. Si cancelas la confirmación, no sale ninguna petición: compruébalo en Network.

## Nivel 6 · Filtrar y resumir

- `#filtro-estado` muestra solo los tickets del estado elegido; "Todos" los muestra todos.
- `#busqueda` filtra por título mientras escribes, sin importar mayúsculas o minúsculas.
- Los dos filtros funcionan juntos.
- Si ningún ticket coincide, `#mensaje` lo dice.
- `#resumen` muestra cuántos tickets hay en cada estado y cuántos de prioridad alta siguen sin resolver. El resumen cuenta todos los tickets, no solo los que pasan el filtro, y se actualiza después de cada operación.

**Pista:** para filtrar no hace falta el servidor, porque ya tienes todos los tickets en el arreglo. Te sirven `filter`, `includes` y `toLowerCase`. Para contar por estado, `reduce` puede construir un objeto como `{ abierto: 5, en_progreso: 3, resuelto: 2 }`. El `select` avisa sus cambios con el evento `change` y la caja de búsqueda con `input`.

**Documentación:** [filter](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) · [reduce](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) · [includes](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/includes)

**Quedó bien si:** al buscar "impresora" queda un solo ticket; al marcar un ticket como resuelto, los números del resumen cambian en el momento.

## Si terminas y quieres más

- Ordena el tablero para que los de prioridad alta salgan primero, sin pedirle nada al servidor.
- Agrega un botón "Reabrir" en los tickets resueltos (otro PATCH).

---

## Preguntas de repaso

Respóndelas por escrito y con tus palabras. Son del tipo que puede salir en la parte teórica del previo.

1. Según lo que viste en el experimento, ¿qué diferencia hay entre PUT y PATCH? ¿Por qué el nivel 3 usa PATCH y el nivel 4 usa PUT?
2. El formulario del nivel 4 no tiene un campo de estado. ¿De dónde sale el estado que envías en el PUT, y qué le pasaría al ticket si no lo incluyeras?
3. Anota el código de estado que viste en Network al crear, al cambiar el estado, al editar, al eliminar y al pedir `/tickets/999`. ¿A qué familia pertenece cada uno y qué significa?
4. Una operación es idempotente cuando hacerla varias veces deja el servidor igual que hacerla una sola vez. Corre `npm run api:lento`, llena el formulario y haz doble clic rápido en "Crear ticket". ¿Cuántos tickets se crearon? ¿Pasaría lo mismo si enviaras dos veces el mismo PUT? ¿Cómo evitas el problema desde la interfaz?
5. Para `fetch`, ¿qué diferencia hay entre que el servidor esté apagado y que responda 404? ¿En cuál de los dos casos llega tu código al `catch` sin que tú hagas nada?
6. ¿Por qué la búsqueda del nivel 6 no necesita hacer peticiones a la API? ¿En qué situación sí convendría que el servidor hiciera el filtro?
7. En `package.json`, ¿para qué sirve la sección `scripts`? ¿Qué pasa en tu disco cuando corres `npm install`, y por qué `node_modules` está en `.gitignore`?
8. Toma una clase con prefijo de tu propio proyecto (por ejemplo `md:grid-cols-2`) y explica qué ve alguien que abre la página en un celular y qué ve alguien en un computador.

## Para que te sirva de preparación

- Haz los niveles en orden. Cada uno usa lo del anterior.
- En el previo no vas a tener asistente de IA. Si te atascas, úsalo para que te explique el error, pero escribe tú el código. Este trabajo te prepara solo si al final eres capaz de hacerlo sin ayuda.
- Cuando algo no funcione, mira Network antes de tocar el código: ¿salió la petición?, ¿con qué método y qué cuerpo?, ¿qué código volvió? Casi siempre la respuesta está ahí.
- Si ya sabes usar Git, haz un commit cada vez que termines un nivel.
- Si tus datos quedan muy revueltos, `npm run reiniciar` y listo.

Profesor
