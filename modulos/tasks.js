// tasks.js — Módulo de lógica y estado de tareas

import { cargarTareas, guardarTareas } from './storage.js';

/** @type {Array<{id: string, texto: string, done: boolean}>} */
let tareas = [];

/**
 * Genera un ID único simple.
 */
function generarId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Inicializa el estado cargando desde localStorage.
 * @returns {Array} las tareas cargadas
 */
export function inicializar() {
  tareas = cargarTareas();
  return [...tareas];
}

/**
 * Agrega una nueva tarea.
 * @param {string} texto
 * @returns {object} la tarea creada
 */
export function agregarTarea(texto) {
  const tarea = { id: generarId(), texto, done: false };
  tareas.push(tarea);
  guardarTareas(tareas);
  return tarea;
}

/**
 * Alterna el estado done de una tarea por su ID.
 * @param {string} id
 * @returns {object|null} la tarea actualizada
 */
export function toggleTarea(id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return null;
  tarea.done = !tarea.done;
  guardarTareas(tareas);
  return { ...tarea };
}

/**
 * Elimina una tarea por su ID.
 * @param {string} id
 * @returns {boolean} true si fue eliminada
 */
export function eliminarTarea(id) {
  const idx = tareas.findIndex(t => t.id === id);
  if (idx === -1) return false;
  tareas.splice(idx, 1);
  guardarTareas(tareas);
  return true;
}

/**
 * Elimina todas las tareas completadas.
 * @returns {string[]} IDs de las tareas eliminadas
 */
export function eliminarCompletadas() {
  const eliminadas = tareas.filter(t => t.done).map(t => t.id);
  tareas = tareas.filter(t => !t.done);
  guardarTareas(tareas);
  return eliminadas;
}

/**
 * Retorna un snapshot del estado actual.
 * @returns {{ total: number, pendientes: number, completadas: number }}
 */
export function obtenerContadores() {
  const completadas = tareas.filter(t => t.done).length;
  return {
    total: tareas.length,
    completadas,
    pendientes: tareas.length - completadas,
  };
}