import { DateUtils } from '../utils/text-utils.js';
import { ImageManager } from './image-manager.js';
import { TempSaveService } from '../services/temp-save-service.js';

/**
 * Componente para el modal de agregar/editar tarea
 */
export class TaskFormModal {
    constructor() {
        this.editMode = false;
        this.currentEditTaskId = null;
        this.imageManager = new ImageManager();
        this.tempSaveService = new TempSaveService();
        
        this._initializeElements();
        this._bindEvents();
        this._setupAutoSave();
    }    /**
     * Inicializar elementos del DOM
     */
    _initializeElements() {
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.openModalBtn = document.getElementById('openModalBtn');
        this.modalTitle = document.getElementById('modalTitle');
        this.submitBtn = document.getElementById('submitBtn');
        this.clearTempBtn = document.getElementById('clearTempBtn');
        this.taskNameInput = document.getElementById('taskName');
        this.dueDateInput = document.getElementById('dueDate');
        this.descriptionInput = document.getElementById('description');
    }    /**
     * Vincular eventos
     */
    _bindEvents() {
        this.openModalBtn?.addEventListener('click', () => {
            this.open();
        });

        this.closeModalBtn?.addEventListener('click', () => {
            this.close();
        });

        this.clearTempBtn?.addEventListener('click', async () => {
            await this._handleClearTemp();
        });

        this.taskForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.taskModal) {
                this.close();
            }
        });

        // Escuchar evento de datos temporales restaurados
        window.addEventListener('tempDataRestored', (e) => {
            this._showNotification(e.detail.message, 'success');
        });
    }

    /**
     * Abrir modal
     * @param {boolean} isEdit - Indica si es modo edición
     * @param {Object} task - Datos de la tarea (solo para edición)
     */
    open(isEdit = false, task = {}) {
        if (!this.taskModal) return;

        this.editMode = isEdit;
        this.currentEditTaskId = task.id || null;

        // Resetear gestor de imágenes
        this.imageManager.reset();

        if (isEdit) {
            this._setupEditMode(task);
        } else {
            this._setupCreateMode();
        }

        this.taskModal.style.display = 'block';
    }

    /**
     * Configurar modo edición
     * @param {Object} task - Datos de la tarea
     */
    _setupEditMode(task) {
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Editar Tarea';
        }
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Actualizar Tarea';
        }

        // Llenar campos
        if (this.taskNameInput) {
            this.taskNameInput.value = task.nombre || '';
        }
        if (this.dueDateInput) {
            this.dueDateInput.value = task.fecha || '';
        }
        if (this.descriptionInput) {
            this.descriptionInput.value = task.descripcion || '';
        }

        // Cargar imágenes existentes
        if (task.urlImagenes) {
            this.imageManager.loadImages(task.urlImagenes);
        }
    }    /**
     * Configurar modo creación
     */
    _setupCreateMode() {
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Agregar Nueva Tarea';
        }
        if (this.submitBtn) {
            this.submitBtn.textContent = 'Agregar Tarea';
        }

        this.taskForm?.reset();
        
        // Cargar datos temporales si existen
        this._loadTempData();
    }    /**
     * Cerrar modal
     */
    close() {
        if (this.taskModal) {
            this.taskModal.style.display = 'none';
        }
        
        // No resetear el formulario si no estamos en modo edición
        // para preservar datos temporales
        if (this.editMode) {
            this.taskForm?.reset();
            this.tempSaveService.clearTemp();
        }
        
        this.imageManager.reset();
        this.editMode = false;
        this.currentEditTaskId = null;
    }    /**
     * Manejar envío del formulario
     */
    async _handleSubmit() {
        try {
            const formData = this._getFormData();
            this._validateFormData(formData);

            // Limpiar datos temporales al enviar exitosamente
            if (!this.editMode) {
                this.tempSaveService.clearTemp();
            }

            // Disparar evento personalizado con los datos
            const event = new CustomEvent('taskSubmit', {
                detail: {
                    data: formData,
                    isEdit: this.editMode,
                    taskId: this.currentEditTaskId,
                    images: this.imageManager.getSelectedImages()
                }
            });

            window.dispatchEvent(event);

        } catch (error) {
            // Disparar evento de error
            const errorEvent = new CustomEvent('taskSubmitError', {
                detail: { error: error.message }
            });
            window.dispatchEvent(errorEvent);
        }
    }

    /**
     * Obtener datos del formulario
     * @returns {Object} Datos del formulario
     */
    _getFormData() {
        return {
            nombre: this.taskNameInput?.value.trim() || '',
            fecha: this.dueDateInput?.value || '',
            descripcion: this.descriptionInput?.value.trim() || ''
        };
    }

    /**
     * Validar datos del formulario
     * @param {Object} data - Datos a validar
     */
    _validateFormData(data) {
        if (!data.nombre) {
            throw new Error('El nombre de la tarea es obligatorio');
        }

        if (!data.fecha) {
            throw new Error('La fecha de vencimiento es obligatoria');
        }

        if (!DateUtils.validateDate(data.fecha)) {
            throw new Error('La fecha de vencimiento no puede ser anterior a hoy');
        }
    }

    /**
     * Verificar si el modal está abierto
     * @returns {boolean} True si está abierto
     */
    isOpen() {
        return this.taskModal && this.taskModal.style.display === 'block';
    }

    /**
     * Verificar si está en modo edición
     * @returns {boolean} True si está en modo edición
     */
    isEditMode() {
        return this.editMode;
    }    /**
     * Obtener ID de la tarea actual (solo en modo edición)
     * @returns {string|null} ID de la tarea
     */
    getCurrentTaskId() {
        return this.currentEditTaskId;
    }

    /**
     * Configurar auto-guardado
     * @private
     */
    _setupAutoSave() {
        this.tempSaveService.setupAutoSave(this.taskForm, () => {
            return this._getFormData();
        });
    }

    /**
     * Cargar datos temporales
     * @private
     */
    _loadTempData() {
        const tempData = this.tempSaveService.loadTemp();
        if (tempData) {
            if (this.taskNameInput) {
                this.taskNameInput.value = tempData.nombre || '';
            }
            if (this.dueDateInput) {
                this.dueDateInput.value = tempData.fecha || '';
            }
            if (this.descriptionInput) {
                this.descriptionInput.value = tempData.descripcion || '';
            }
            
            // Mostrar notificación de datos restaurados
            setTimeout(() => {
                this.tempSaveService.showRestoredDataNotification();
            }, 500);
        }
    }

    /**
     * Manejar limpieza de datos temporales
     * @private
     */
    async _handleClearTemp() {
        if (this.tempSaveService.hasTemp()) {
            const confirmed = await this.tempSaveService.confirmClearTemp();
            if (confirmed) {
                this.tempSaveService.clearTemp();
                this.taskForm?.reset();
                this.imageManager.reset();
                this._showNotification('Formulario limpiado', 'success');
            }
        } else {
            this.taskForm?.reset();
            this.imageManager.reset();
            this._showNotification('Formulario limpiado', 'success');
        }
    }

    /**
     * Mostrar notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error)
     * @private
     */
    _showNotification(message, type = 'success') {
        const event = new CustomEvent('showNotification', {
            detail: { message, type }
        });
        window.dispatchEvent(event);
    }
}
