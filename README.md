# Mesa de ayuda

Tablero de tickets de soporte hecho con HTML, Tailwind y JavaScript sin frameworks, conectado a una API REST que corre en tu propio computador con json-server.

El enunciado completo está en [ENUNCIADO.md](ENUNCIADO.md).

## Cómo correrlo

Necesitas Node.js. Para saber si lo tienes, escribe `node -v` en una terminal: si aparece un número de versión, estás listo. Si no, instálalo desde [nodejs.org](https://nodejs.org/es/download).

En la carpeta del proyecto:

```bash
npm install     # solo la primera vez: descarga json-server en node_modules
npm run api     # levanta la API y la página
```

Abre http://localhost:3000 en el navegador. Deja la terminal abierta: si la cierras, la API se apaga.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run api` | Levanta la API y sirve la página en http://localhost:3000 |
| `npm run api:lento` | Lo mismo, pero cada respuesta tarda 1,5 segundos. Sirve para ver el estado de carga |
| `npm run reiniciar` | Devuelve `db.json` a los diez tickets iniciales |

## Estructura

```
public/index.html    la página
public/app.js        tu código
db.semilla.json      datos iniciales (no cambia)
db.json              la base de datos viva (se crea sola la primera vez)
preparar-db.js       crea o reinicia db.json
package.json         dependencias y scripts
```

## Si npm muestra avisos de vulnerabilidades

Al instalar, npm puede avisar que algunas dependencias de json-server tienen vulnerabilidades. Es esperado: json-server es una herramienta para practicar que solo corre en tu computador, no algo que se publica en internet. Puedes seguir sin problema.
