// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_URL = 'http://localhost:3000/tickets';
let tickets = [];
let editando = null; // null cuando crea, o el id cuando edita

const ESTADOS = {
  abierto: { 
    etiqueta: 'Abierto',
    etiquetaBoton: 'Empezar',
    clases: 'bg-sky-100 text-sky-800',
    siguiente: 'en_progreso'
  },
  en_progreso: { 
    etiqueta: 'En progreso',
    etiquetaBoton: 'Marcar resuelto',
    clases: 'bg-amber-100 text-amber-800',
    siguiente: 'resuelto'
  },
  resuelto: { 
    etiqueta: 'Resuelto',
    clases: 'bg-emerald-100 text-emerald-800',
    siguiente: null
  }
};

const PRIORIDADES = {
  baja: { etiqueta: 'Baja', clases: 'bg-green-100 text-green-800' },
  media: { etiqueta: 'Media', clases: 'bg-yellow-100 text-yellow-800' },
  alta: { etiqueta: 'Alta', clases: 'bg-red-100 text-red-800' }
};

const CATEGORIAS = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red',
  accesos: 'Accesos'
};

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const formulario = document.getElementById('form-ticket');
const inputTitulo = document.getElementById('titulo');
const inputDescripcion = document.getElementById('descripcion');
const inputSolicitante = document.getElementById('solicitante');
const selectCategoria = document.getElementById('categoria');
const selectPrioridad = document.getElementById('prioridad');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloFormulario = document.getElementById('titulo-formulario');
const errorTitulo = document.getElementById('error-titulo');
const errorSolicitante = document.getElementById('error-solicitante');
const listaTickets = document.getElementById('lista-tickets');
const mensaje = document.getElementById('mensaje');
const resumen = document.getElementById('resumen');
const filtroEstado = document.getElementById('filtro-estado');
const busqueda = document.getElementById('busqueda');

// ============================================================================
// CARGAR TICKETS AL ABRIR LA PÁGINA
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  cargarTickets();
  formulario.addEventListener('submit', manejarEnvio);
  btnCancelar.addEventListener('click', cancelarEdicion);
  filtroEstado.addEventListener('change', pintar);
  busqueda.addEventListener('input', pintar);
});

// ============================================================================
// NIVEL 1: LISTAR TICKETS (GET)
// ============================================================================

async function cargarTickets() {
  mostrarMensaje('Cargando...', 'cargando');
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: No se pudieron cargar los tickets`);
    }
    tickets = await respuesta.json();
    pintar();
  } catch (error) {
    mostrarMensaje(
      `No se pudieron cargar los tickets. ${error.message}. Intenta recargar la página.`,
      'error'
    );
  }
}

// ============================================================================
// NIVEL 2: CREAR TICKETS (POST)
// ============================================================================

async function manejarEnvio(evento) {
  evento.preventDefault();

  // Validar
  const titulo = inputTitulo.value.trim();
  const solicitante = inputSolicitante.value.trim();

  let valido = true;

  if (titulo.length < 5) {
    errorTitulo.textContent = 'El título debe tener al menos 5 caracteres';
    valido = false;
  } else {
    errorTitulo.textContent = '';
  }

  if (solicitante === '') {
    errorSolicitante.textContent = 'El solicitante no puede estar vacío';
    valido = false;
  } else {
    errorSolicitante.textContent = '';
  }

  if (!valido) return;

  // Preparar datos
  const nuevoTicket = {
    titulo,
    descripcion: inputDescripcion.value.trim(),
    solicitante,
    categoria: selectCategoria.value,
    prioridad: selectPrioridad.value,
    estado: 'abierto'
  };

  try {
    if (editando === null) {
      // POST: crear nuevo
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTicket)
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al crear el ticket`);
      }

      const ticketCreado = await respuesta.json();
      tickets.push(ticketCreado);
    } else {
      // PUT: editar existente
      const respuesta = await fetch(`${API_URL}/${editando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTicket)
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al editar el ticket`);
      }

      const ticketEditado = await respuesta.json();
      const indice = tickets.findIndex(t => t.id === editando);
      if (indice !== -1) {
        tickets[indice] = ticketEditado;
      }

      cancelarEdicion();
    }

    // Limpiar formulario y redibujar
    formulario.reset();
    selectPrioridad.value = 'media';
    pintar();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// ============================================================================
// NIVEL 3: CAMBIAR ESTADO (PATCH)
// ============================================================================

async function cambiarEstado(id) {
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  const nuevoEstado = ESTADOS[ticket.estado].siguiente;
  if (!nuevoEstado) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al cambiar el estado`);
    }

    const ticketActualizado = await respuesta.json();
    const indice = tickets.findIndex(t => t.id === id);
    if (indice !== -1) {
      tickets[indice] = ticketActualizado;
    }

    pintar();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// ============================================================================
// NIVEL 4: EDITAR TICKETS (PUT)
// ============================================================================

function modo_edicion(id) {
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  editando = id;

  // Llenar formulario
  inputTitulo.value = ticket.titulo;
  inputDescripcion.value = ticket.descripcion;
  inputSolicitante.value = ticket.solicitante;
  selectCategoria.value = ticket.categoria;
  selectPrioridad.value = ticket.prioridad;

  // Cambiar interfaz
  tituloFormulario.textContent = `Editar ticket #${id}`;
  btnGuardar.textContent = 'Guardar cambios';
  btnCancelar.hidden = false;

  // Scroll al formulario
  document.querySelector('section').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
  editando = null;
  formulario.reset();
  selectPrioridad.value = 'media';
  tituloFormulario.textContent = 'Nuevo ticket';
  btnGuardar.textContent = 'Crear ticket';
  btnCancelar.hidden = true;
  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';
}

// ============================================================================
// NIVEL 5: ELIMINAR TICKETS (DELETE)
// ============================================================================

async function eliminarTicket(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al eliminar el ticket`);
    }

    // Si estaba siendo editado, volver a crear
    if (editando === id) {
      cancelarEdicion();
    }

    tickets = tickets.filter(t => t.id !== id);
    pintar();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// ============================================================================
// NIVEL 6: FILTRAR Y RESUMIR
// ============================================================================

function obtenerTicketsFiltrados() {
  let filtrados = tickets;

  // Filtro por estado
  const estado = filtroEstado.value;
  if (estado !== 'todos') {
    filtrados = filtrados.filter(t => t.estado === estado);
  }

  // Filtro por búsqueda
  const texto = busqueda.value.toLowerCase();
  if (texto) {
    filtrados = filtrados.filter(t =>
      t.titulo.toLowerCase().includes(texto)
    );
  }

  return filtrados;
}

function actualizarResumen() {
  // Contar por estado (todos los tickets, no filtrados)
  const conteos = tickets.reduce(
    (acc, ticket) => {
      acc[ticket.estado]++;
      return acc;
    },
    { abierto: 0, en_progreso: 0, resuelto: 0 }
  );

  // Contar alta prioridad sin resolver
  const altaSinResolver = tickets.filter(
    t => t.prioridad === 'alta' && t.estado !== 'resuelto'
  ).length;

  resumen.innerHTML = `
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-2xl font-bold text-sky-600">${conteos.abierto}</p>
        <p class="text-xs text-slate-600">Abiertos</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-amber-600">${conteos.en_progreso}</p>
        <p class="text-xs text-slate-600">En progreso</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-emerald-600">${conteos.resuelto}</p>
        <p class="text-xs text-slate-600">Resueltos</p>
      </div>
    </div>
    ${
      altaSinResolver > 0
        ? `<p class="mt-3 text-center text-sm text-red-600 font-semibold">
             ⚠ ${altaSinResolver} ticket${altaSinResolver > 1 ? 's' : ''} de prioridad alta sin resolver
           </p>`
        : ''
    }
  `;
}

// ============================================================================
// RENDERIZAR
// ============================================================================

function pintar() {
  const filtrados = obtenerTicketsFiltrados();
  actualizarResumen();

  // Crear sección lista si no existe
  let seccionLista = document.getElementById('lista-tickets');
  if (!seccionLista) {
    seccionLista = document.createElement('div');
    seccionLista.id = 'lista-tickets';
    document.querySelector('main').appendChild(seccionLista);
  }

  // Vaciar y redibujar
  seccionLista.innerHTML = '';

  if (tickets.length === 0) {
    mostrarMensaje(
      'No hay tickets. ¡Crea el primero para empezar!',
      'vacio'
    );
    return;
  }

  if (filtrados.length === 0) {
    mostrarMensaje('No hay tickets que coincidan con tu búsqueda.', 'vacio');
    return;
  }

  mostrarMensaje('', 'ok');

  // Dibujar tarjetas
  seccionLista.className = 'grid grid-cols-1 gap-4 md:grid-cols-2';

  filtrados.forEach(ticket => {
    const tarjeta = document.createElement('div');
    tarjeta.className = `rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 ${
      ticket.estado === 'resuelto' ? 'opacity-60' : ''
    }`;

    tarjeta.innerHTML = `
      <div class="mb-3 flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500">Ticket #${ticket.id}</p>
          <h3 class="mt-0.5 text-lg font-semibold text-slate-900">
            ${ticket.titulo}
          </h3>
        </div>
      </div>

      ${ticket.descripcion ? `<p class="mb-3 text-sm text-slate-600">${ticket.descripcion}</p>` : ''}

      <div class="mb-3 space-y-1 text-sm">
        <p><span class="font-medium text-slate-700">Solicitante:</span> ${ticket.solicitante}</p>
        <p><span class="font-medium text-slate-700">Categoría:</span> ${CATEGORIAS[ticket.categoria]}</p>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <span class="inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PRIORIDADES[ticket.prioridad].clases}">
          ${PRIORIDADES[ticket.prioridad].etiqueta}
        </span>
        <span class="inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ESTADOS[ticket.estado].clases}">
          ${ESTADOS[ticket.estado].etiqueta}
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        ${
          ticket.estado !== 'resuelto'
            ? `<button
                 class="flex-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
               >
                 ${ESTADOS[ticket.estado].etiquetaBoton}
               </button>`
            : ''
        }
        <button class="flex-1 rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-300">
          Editar
        </button>
        <button class="flex-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200">
          Eliminar
        </button>
      </div>
    `;

    // Event listeners de los botones
    const botones = tarjeta.querySelectorAll('button');

    if (ticket.estado !== 'resuelto') {
      botones[0].addEventListener('click', () => cambiarEstado(ticket.id));
    }

    const indiceEditar = ticket.estado !== 'resuelto' ? 1 : 0;
    botones[indiceEditar].addEventListener('click', () => modo_edicion(ticket.id));

    const indiceEliminar = ticket.estado !== 'resuelto' ? 2 : 1;
    botones[indiceEliminar].addEventListener('click', () => eliminarTicket(ticket.id));

    seccionLista.appendChild(tarjeta);
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

function mostrarMensaje(texto, tipo) {
  let elementoMensaje = document.getElementById('mensaje');
  if (!elementoMensaje) {
    elementoMensaje = document.createElement('div');
    elementoMensaje.id = 'mensaje';
    document.querySelector('main').insertBefore(
      elementoMensaje,
      document.querySelector('section:last-of-type')
    );
  }

  if (!texto) {
    elementoMensaje.innerHTML = '';
    return;
  }

  let clases = '';
  if (tipo === 'cargando') {
    clases = 'rounded-lg bg-blue-50 p-4 text-blue-800 text-sm';
    texto = '⏳ ' + texto;
  } else if (tipo === 'error') {
    clases = 'rounded-lg bg-red-50 p-4 text-red-800 text-sm';
    texto = '❌ ' + texto;
  } else if (tipo === 'vacio') {
    clases = 'rounded-lg bg-amber-50 p-4 text-amber-800 text-sm';
    texto = '📋 ' + texto;
  }

  elementoMensaje.className = clases;
  elementoMensaje.textContent = texto;
}