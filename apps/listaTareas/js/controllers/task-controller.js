import { FirebaseService } from '../services/firebase-service.js';
import { ImageService } from '../services/image-service.js';
import { NotificationService, LoadingService } from '../services/ui-service.js';
import { TaskRenderer } from '../components/task-renderer.js';
import { TaskFormModal } from '../components/task-form-modal.js';
import { TaskDetailModal } from '../components/task-detail-modal.js';
import { TaskSearch } from '../components/task-search.js';

/**
 * Controlador principal de la aplicación de tareas
 */
export class TaskController {
    constructor() {
        // Servicios
        this.firebaseService = new FirebaseService();
        this.imageService = new ImageService();
        this.notificationService = new NotificationService();
        this.loadingService = new LoadingService();

        // Componentes
        this.taskRenderer = new TaskRenderer();
        this.taskFormModal = new TaskFormModal();
        this.taskDetailModal = new TaskDetailModal();
        this.taskSearch = new TaskSearch();

        // Estado
        this.tasks = [];

        this._bindEvents();
        this._initialize();
    }    /**
     * Vincular eventos globales
     */
    _bindEvents() {
        // Evento de envío de formulario
        window.addEventListener('taskSubmit', (e) => {
            this._handleTaskSubmit(e.detail);
        });

        // Evento de error en formulario
        window.addEventListener('taskSubmitError', (e) => {
            this.notificationService.error(e.detail.error);
        });

        // Evento de resultados de búsqueda
        window.addEventListener('searchResults', (e) => {
            this._handleSearchResults(e.detail);
        });

        // Evento de notificación personalizada
        window.addEventListener('showNotification', (e) => {
            const { message, type } = e.detail;
            if (type === 'success') {
                this.notificationService.success(message);
            } else if (type === 'error') {
                this.notificationService.error(message);
            }
        });

        // Evento de datos temporales restaurados
        window.addEventListener('tempDataRestored', (e) => {
            this.notificationService.success(e.detail.message);
        });
    }

    /**
     * Inicializar aplicación
     */
    async _initialize() {
        try {
            await this.loadTasks();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.notificationService.error('Error al cargar la aplicación');
        }
    }

    /**
     * Cargar todas las tareas
     */
    async loadTasks() {
        this.loadingService.show();

        try {
            const tasks = await this.firebaseService.getAllTasks();
            
            // Ordenar por fecha de vencimiento
            this.tasks = tasks.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            
            // Actualizar componentes
            this.taskSearch.updateTasks(this.tasks);
            this._renderTasks(this.tasks);

        } catch (error) {
            console.error('Error al cargar tareas:', error);
            this.notificationService.error('Error al cargar las tareas');
        } finally {
            this.loadingService.hide();
        }
    }

    /**
     * Renderizar tareas con callbacks
     * @param {Array} tasks - Tareas a renderizar
     */
    _renderTasks(tasks) {
        const callbacks = {
            onEdit: (task) => this._editTask(task),
            onDelete: (taskId) => this._deleteTask(taskId),
            onTaskClick: (taskId) => this._showTaskDetails(taskId)
        };

        this.taskRenderer.renderTasks(tasks, callbacks);
    }

    /**
     * Manejar envío de formulario
     * @param {Object} detail - Detalles del evento
     */
    async _handleTaskSubmit(detail) {
        this.loadingService.show();

        try {
            // Procesar imágenes
            const imageUrls = await this.imageService.uploadMultipleImages(detail.images);

            const taskData = {
                ...detail.data,
                urlImagenes: imageUrls
            };

            if (detail.isEdit) {
                await this.firebaseService.updateTask(detail.taskId, taskData);
                this.notificationService.success('Tarea actualizada correctamente');
            } else {
                await this.firebaseService.addTask(taskData);
                this.notificationService.success('Tarea agregada correctamente');
            }

            this.taskFormModal.close();
            await this.loadTasks();

        } catch (error) {
            console.error('Error al procesar tarea:', error);
            this.notificationService.error(`Error: ${error.message}`);
        } finally {
            this.loadingService.hide();
        }
    }

    /**
     * Manejar resultados de búsqueda
     * @param {Object} detail - Detalles de la búsqueda
     */
    _handleSearchResults(detail) {
        this._renderTasks(detail.tasks);
    }

    /**
     * Editar tarea
     * @param {Object} task - Tarea a editar
     */
    _editTask(task) {
        this.taskFormModal.open(true, task);
    }

    /**
     * Eliminar tarea
     * @param {string} taskId - ID de la tarea
     */
    async _deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            return;
        }

        this.loadingService.show();

        try {
            await this.firebaseService.deleteTask(taskId);
            this.notificationService.success('Tarea eliminada correctamente');
            await this.loadTasks();
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            this.notificationService.error('Error al eliminar la tarea');
        } finally {
            this.loadingService.hide();
        }
    }

    /**
     * Mostrar detalles de tarea
     * @param {string} taskId - ID de la tarea
     */
    async _showTaskDetails(taskId) {
        this.loadingService.show();

        try {
            const task = await this.firebaseService.getTaskById(taskId);
            this.taskDetailModal.show(task);
        } catch (error) {
            console.error('Error al obtener detalles:', error);
            this.notificationService.error('Error al cargar los detalles de la tarea');
        } finally {
            this.loadingService.hide();
        }
    }
}
