import { TextUtils } from '../utils/text-utils.js';
import { ImageService } from '../services/image-service.js';

/**
 * Componente para el modal de detalles de tarea
 */
export class TaskDetailModal {
    constructor() {
        this.imageService = new ImageService();
        this._initializeElements();
        this._bindEvents();
    }

    /**
     * Inicializar elementos del DOM
     */
    _initializeElements() {
        this.detailModal = document.getElementById('detailModal');
        this.closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
        this.closeDetailButton = document.getElementById('closeDetailButton');
        this.detailTaskName = document.getElementById('detailTaskName');
        this.detailDueDate = document.getElementById('detailDueDate');
        this.detailDescription = document.getElementById('detailDescription');
        this.detailImagesContainer = document.getElementById('detailImagesContainer');
        this.detailDescriptionContainer = document.getElementById('detailDescriptionContainer');
    }

    /**
     * Vincular eventos
     */
    _bindEvents() {
        this.closeDetailModalBtn?.addEventListener('click', () => {
            this.close();
        });

        this.closeDetailButton?.addEventListener('click', () => {
            this.close();
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.detailModal) {
                this.close();
            }
        });
    }

    /**
     * Mostrar detalles de la tarea
     * @param {Object} task - Datos de la tarea
     */
    show(task) {
        if (!this.detailModal) return;

        // Actualizar contenido
        this._updateTaskName(task.nombre);
        this._updateDueDate(task.fecha);
        this._updateDescription(task.descripcion);
        this._updateImages(task.urlImagenes, task.nombre);

        // Mostrar modal
        this.detailModal.style.display = 'block';
    }

    /**
     * Cerrar modal
     */
    close() {
        if (this.detailModal) {
            this.detailModal.style.display = 'none';
        }
    }

    /**
     * Actualizar nombre de la tarea
     * @param {string} name - Nombre de la tarea
     */
    _updateTaskName(name) {
        if (this.detailTaskName) {
            this.detailTaskName.textContent = name || '';
        }
    }

    /**
     * Actualizar fecha de vencimiento
     * @param {string} date - Fecha de vencimiento
     */
    _updateDueDate(date) {
        if (this.detailDueDate) {
            this.detailDueDate.textContent = date || '';
        }
    }

    /**
     * Actualizar descripción
     * @param {string} description - Descripción de la tarea
     */
    _updateDescription(description) {
        if (!this.detailDescription || !this.detailDescriptionContainer) return;

        if (description && description.trim()) {
            this.detailDescription.innerHTML = TextUtils.parseDescription(description);
            this.detailDescriptionContainer.style.display = 'block';
        } else {
            this.detailDescriptionContainer.style.display = 'none';
        }
    }

    /**
     * Actualizar imágenes
     * @param {Array} images - Array de URLs de imágenes
     * @param {string} taskName - Nombre de la tarea para alt text
     */
    _updateImages(images, taskName) {
        if (!this.detailImagesContainer) return;

        this.detailImagesContainer.innerHTML = '';

        if (images && images.length > 0) {
            images.forEach(url => {
                const imgElement = this.imageService.createImageElement(
                    url, 
                    `Imagen de ${taskName}`
                );
                this.detailImagesContainer.appendChild(imgElement);
            });
            this.detailImagesContainer.style.display = 'flex';
        } else {
            this.detailImagesContainer.style.display = 'none';
        }
    }

    /**
     * Verificar si el modal está abierto
     * @returns {boolean} True si está abierto
     */
    isOpen() {
        return this.detailModal && this.detailModal.style.display === 'block';
    }
}
