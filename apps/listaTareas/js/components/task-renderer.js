import { DateUtils, TextUtils } from '../utils/text-utils.js';

/**
 * Componente para renderizar tareas
 */
export class TaskRenderer {
    constructor() {
        this.tasksList = document.getElementById('tasksList');
    }

    /**
     * Renderizar lista de tareas
     * @param {Array} tasks - Array de tareas
     * @param {Object} callbacks - Callbacks para eventos
     */
    renderTasks(tasks, callbacks = {}) {
        if (!this.tasksList) return;

        this.tasksList.innerHTML = '';

        tasks.forEach((task) => {
            const taskElement = this._createTaskElement(task, callbacks);
            this.tasksList.appendChild(taskElement);
        });
    }

    /**
     * Crear elemento de tarea
     * @param {Object} task - Datos de la tarea
     * @param {Object} callbacks - Callbacks para eventos
     * @returns {HTMLElement} Elemento de tarea
     */
    _createTaskElement(task, callbacks) {
        const taskId = task.id;
        const daysLeft = DateUtils.getDaysLeft(task.fecha);
        const dueMessage = DateUtils.getDueMessage(daysLeft);

        const taskElement = document.createElement('li');

        // Asignar clase según el estado de la tarea
        if (daysLeft > 0 && daysLeft <= 5) {
            taskElement.classList.add('urgent');
        } else if (daysLeft <= 0) {
            taskElement.classList.add('expired');
        }

        // Contenedor de información de la tarea
        const taskInfo = this._createTaskInfo(task, dueMessage);
        
        // Contenedor de acciones
        const taskActions = this._createTaskActions(task, callbacks);

        // Añadir evento para abrir el modal de detalles
        taskElement.addEventListener('click', () => {
            if (callbacks.onTaskClick) {
                callbacks.onTaskClick(taskId);
            }
        });

        taskElement.appendChild(taskInfo);
        taskElement.appendChild(taskActions);

        return taskElement;
    }

    /**
     * Crear información de la tarea
     * @param {Object} task - Datos de la tarea
     * @param {string} dueMessage - Mensaje de vencimiento
     * @returns {HTMLElement} Elemento con información
     */
    _createTaskInfo(task, dueMessage) {
        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');
        taskInfo.innerHTML = `
            <strong>${TextUtils.escapeHtml(task.nombre)}</strong>
            <span>${task.fecha} (${dueMessage})</span>
        `;
        return taskInfo;
    }

    /**
     * Crear acciones de la tarea
     * @param {Object} task - Datos de la tarea
     * @param {Object} callbacks - Callbacks para eventos
     * @returns {HTMLElement} Elemento con acciones
     */
    _createTaskActions(task, callbacks) {
        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onEdit) {
                callbacks.onEdit(task);
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (callbacks.onDelete) {
                callbacks.onDelete(task.id);
            }
        });

        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        return taskActions;
    }

    /**
     * Limpiar lista de tareas
     */
    clear() {
        if (this.tasksList) {
            this.tasksList.innerHTML = '';
        }
    }
}
