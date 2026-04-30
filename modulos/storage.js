// storage.js — Módulo de persistencia con localStorage

const STORAGE_KEY = 'dom_todo_tasks';

/**
 * Carga las tareas guardadas desde localStorage.
 * @returns {Array} Array de objetos { id, texto, done }
 */
export function cargarTareas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('No se pudo leer localStorage, iniciando vacío.');
    return [];
  }
}

/**
 * Guarda el array completo de tareas en localStorage.
 * @param {Array} tareas - Array de objetos { id, texto, done }
 */
export function guardarTareas(tareas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch {
    console.warn('No se pudo escribir en localStorage.');
  }
}

/**
 * Limpia todas las tareas del localStorage.
 */
export function limpiarStorage() {
  localStorage.removeItem(STORAGE_KEY);
}