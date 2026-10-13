
const formulario = document.querySelector("#formulario");
const nombreTarea = document.querySelector("#nombreTarea");
const nombreCurso = document.querySelector("#nombreCurso");
const fechaTarea = document.querySelector("#fechaTarea");
const listaTareas = document.querySelector("#listaTareas");
const filtroTareas = document.querySelector("#filtroTareas");
const mensaje = document.querySelector("#mensaje");

let misTareas = [];

try {
    const guardadas = JSON.parse(localStorage.getItem("misTareas"));
    misTareas = Array.isArray(guardadas) ? guardadas : [];
} catch {
    misTareas = [];
}

function fechaDeHoy() {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    return hoy.toISOString().split("T")[0];
}

fechaTarea.min = fechaDeHoy();

function guardarTareas() {
    const datos = misTareas.map(tarea => ({
        id: tarea.id,
        titulo: tarea.titulo,
        curso: tarea.curso,
        fecha: tarea.fecha,
        completada: tarea.completada
    }));

    localStorage.setItem("misTareas", JSON.stringify(datos));
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

function actualizarNumeros() {
    const total = misTareas.reduce(contar => contar + 1, 0);
    const terminadas = misTareas.filter(tarea => tarea.completada).length;
    const pendientes = total - terminadas;

    document.querySelector("#totalTareas").textContent = total;
    document.querySelector("#totalPendientes").textContent = pendientes;
    document.querySelector("#totalCompletadas").textContent = terminadas;
}

function crearTexto(etiqueta, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    return elemento;
}

function mostrarTareas() {
    listaTareas.replaceChildren();

    const filtro = filtroTareas.value;

    const tareasVisibles = misTareas.filter(tarea => {
        if (filtro === "pendientes") {
            return !tarea.completada;
        }

        if (filtro === "completadas") {
            return tarea.completada;
        }

        return true;
    });

    tareasVisibles.forEach(tarea => {
        const elemento = document.createElement("li");
        elemento.className = "tarea";

        if (tarea.completada) {
            elemento.classList.add("terminada");
        }

        const info = document.createElement("div");
        info.className = "infoTarea";

        const titulo = crearTexto("h3", tarea.titulo);
        const curso = crearTexto("p", "Curso: " + tarea.curso);
        const fecha = crearTexto("p", "Entrega: " + tarea.fecha);
        const estado = crearTexto(
            "p",
            tarea.completada ? "Completada" : "Pendiente"
        );

        info.append(titulo, curso, fecha, estado);

        const botones = document.createElement("div");
        botones.className = "botones";

        const botonEstado = crearTexto(
            "button",
            tarea.completada ? "Reabrir" : "Completar"
        );

        botonEstado.type = "button";
        botonEstado.className = "completar";
        botonEstado.dataset.accion = "completar";
        botonEstado.dataset.id = tarea.id;

        const botonEliminar = crearTexto("button", "Eliminar");
        botonEliminar.type = "button";
        botonEliminar.className = "eliminar";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.dataset.id = tarea.id;

        botones.append(botonEstado, botonEliminar);
        elemento.append(info, botones);
        listaTareas.appendChild(elemento);
    });

    const aviso = document.querySelector("#avisoVacio");

    if (misTareas.length === 0) {
        aviso.textContent = "Todavía no agregaste ninguna tarea.";
        aviso.hidden = false;
    } else if (tareasVisibles.length === 0) {
        aviso.textContent = "No hay tareas en esta categoría.";
        aviso.hidden = false;
    } else {
        aviso.hidden = true;
    }

    actualizarNumeros();
}

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const titulo = nombreTarea.value.trim();
    const curso = nombreCurso.value.trim();
    const fecha = fechaTarea.value;

    if (titulo === "" || curso === "" || fecha === "") {
        mostrarMensaje("Completa todos los campos.", "alerta");
        return;
    }

    if (fecha <= fechaDeHoy()) {
        mostrarMensaje(
            "La fecha debe ser posterior al día de hoy.",
            "alerta"
        );
        return;
    }

    const nuevaTarea = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        titulo: titulo,
        curso: curso,
        fecha: fecha,
        completada: false
    };

    misTareas.push(nuevaTarea);

    guardarTareas();
    formulario.reset();
    fechaTarea.min = fechaDeHoy();
    filtroTareas.value = "todas";
    mostrarTareas();

    mostrarMensaje("¡Tarea agregada correctamente!", "exito");
});

listaTareas.addEventListener("click", function(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !listaTareas.contains(boton)) {
        return;
    }

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    const tareaEncontrada = misTareas.find(tarea => tarea.id === id);

    if (!tareaEncontrada) {
        return;
    }

    if (accion === "completar") {
        tareaEncontrada.completada = !tareaEncontrada.completada;
    } else if (accion === "eliminar") {
        misTareas = misTareas.filter(tarea => tarea.id !== id);
    }

    guardarTareas();
    mostrarTareas();
});

filtroTareas.addEventListener("change", mostrarTareas);

document.addEventListener("DOMContentLoaded", mostrarTareas);

mostrarTareas();
