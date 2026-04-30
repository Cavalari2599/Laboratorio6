// dom.js — Módulo de manipulación del DOM

import {
  inicializar,
  agregarTarea,
  toggleTarea,
  eliminarTarea,
  eliminarCompletadas,
  obtenerContadores,
} from './tasks.js';

// ── Selectores ──────────────────────────────────────────────
const taskInput    = document.querySelector('#task-input');
const btnAdd       = document.querySelector('#btn-add');
const taskList     = document.querySelector('#task-list');
const emptyState   = document.querySelector('#empty-state');
const errorMsg     = document.querySelector('#error-msg');
const inputWrapper = document.querySelector('#input-wrapper');
const btnClearDone = document.querySelector('#btn-clear-done');
const filterBtns   = document.querySelectorAll('.filter-btn');
const countPending = document.querySelector('#count-pending');
const countDone    = document.querySelector('#count-done');
const countTotal   = document.querySelector('#count-total');
const template     = document.querySelector('#task-template');

let activeFilter = 'all';

// ── Render de una tarea ──────────────────────────────────────
/**
 * Crea y agrega un <li> al DOM para la tarea dada.
 * NO registra listeners individuales en cada tarea —
 * usa delegación de eventos en el <ul>.
 * @param {{ id: string, texto: string, done: boolean }} tarea
 */
function renderizarTarea(tarea) {
  const clone = template.content.cloneNode(true);
  const li = clone.querySelector('.task-item');

  li.dataset.id   = tarea.id;
  li.dataset.done = String(tarea.done);

  li.querySelector('.task-text').textContent = tarea.texto;

  if (tarea.done) {
    li.classList.add('done-item');
    li.querySelector('.task-check .check-box').style.background = 'var(--green)';
    li.querySelector('.task-check .check-box').style.borderColor = 'var(--green)';
    li.querySelector('.task-method').textContent = '.classList.add()';
  }

  taskList.append(li);
  aplicarFiltroAItem(li);
}

// ── Handlers de acción ───────────────────────────────────────
function handleAgregarTarea() {
  const texto = taskInput.value.trim();
  if (!texto) {
    mostrarError('⚠ No se puede agregar una tarea vacía');
    return;
  }
  const tarea = agregarTarea(texto);
  renderizarTarea(tarea);
  taskInput.value = '';
  limpiarError();
  actualizarContadores();
  actualizarEstadoVacio();
}

/**
 * Delegación de eventos en el <ul>:
 * Detecta clics en .task-check y .task-delete
 * usando Element.closest() para evitar propagación indeseada.
 */
function handleListClick(e) {
  // — Checkbox: marcar/desmarcar —
  const btnCheck = e.target.closest('.task-check');
  if (btnCheck) {
    e.stopPropagation();
    const li = btnCheck.closest('.task-item');
    const id = li.dataset.id;
    const tarea = toggleTarea(id);
    if (!tarea) return;

    li.dataset.done = String(tarea.done);
    li.classList.toggle('done-item', tarea.done);
    li.querySelector('.task-method').textContent = tarea.done
      ? '.classList.add()'
      : '.textContent';

    const box = li.querySelector('.check-box');
    box.style.background  = tarea.done ? 'var(--green)' : '';
    box.style.borderColor = tarea.done ? 'var(--green)' : '';

    aplicarFiltroAItem(li);
    actualizarContadores();
    return;
  }

  // — Botón eliminar —
  const btnDelete = e.target.closest('.task-delete');
  if (btnDelete) {
    e.stopPropagation();
    const li = btnDelete.closest('.task-item');
    const id = li.dataset.id;
    eliminarTarea(id);
    animarEliminacion(li);
    return;
  }

  // Clic en el resto del <li>: no hace nada (sin propagación)
}

function handleLimpiarCompletadas() {
  const eliminadas = eliminarCompletadas();
  eliminadas.forEach(id => {
    const li = taskList.querySelector(`[data-id="${id}"]`);
    if (li) animarEliminacion(li);
  });
}

// ── Helpers visuales ─────────────────────────────────────────
function animarEliminacion(li) {
  li.classList.add('removing');
  setTimeout(() => {
    li.remove();
    actualizarContadores();
    actualizarEstadoVacio();
  }, 250);
}

function actualizarContadores() {
  const { pendientes, completadas, total } = obtenerContadores();
  animarNumero(countPending, pendientes);
  animarNumero(countDone,    completadas);
  animarNumero(countTotal,   total);
}

function animarNumero(el, nuevoValor) {
  if (parseInt(el.textContent, 10) === nuevoValor) return;
  el.textContent = nuevoValor;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  el.addEventListener('animationend', () => el.classList.remove('bump'), { once: true });
}

function actualizarEstadoVacio() {
  const hayTareas = taskList.querySelector('.task-item') !== null;
  emptyState.classList.toggle('visible', !hayTareas);
}

function aplicarFiltro(filtro) {
  activeFilter = filtro;
  taskList.querySelectorAll('.task-item').forEach(li => aplicarFiltroAItem(li));
}

function aplicarFiltroAItem(li) {
  const isDone = li.dataset.done === 'true';
  let visible = true;
  if (activeFilter === 'pending') visible = !isDone;
  if (activeFilter === 'done')    visible = isDone;
  li.style.display = visible ? '' : 'none';
}

function mostrarError(mensaje) {
  errorMsg.textContent = mensaje;
  errorMsg.classList.add('visible');
  inputWrapper.classList.add('error');
  inputWrapper.addEventListener('animationend', () => {
    inputWrapper.classList.remove('error');
  }, { once: true });
  taskInput.focus();
}

function limpiarError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
}

// ── Inicialización ───────────────────────────────────────────
export function init() {
  // Cargar tareas persistidas y renderizarlas
  const tareasPersistidas = inicializar();
  tareasPersistidas.forEach(tarea => renderizarTarea(tarea));

  // Delegación de eventos en la lista (un solo listener)
  taskList.addEventListener('click', handleListClick);

  // Input
  btnAdd.addEventListener('click', handleAgregarTarea);
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAgregarTarea();
  });
  taskInput.addEventListener('input', () => {
    if (taskInput.value.trim()) limpiarError();
  });

  // Filtros
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltro(btn.dataset.filter);
    });
  });

  // Limpiar completadas
  btnClearDone.addEventListener('click', handleLimpiarCompletadas);

  // Estado inicial
  actualizarEstadoVacio();
  actualizarContadores();
  taskInput.focus();
}