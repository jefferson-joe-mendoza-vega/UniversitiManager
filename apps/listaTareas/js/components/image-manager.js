import { ImageService } from '../services/image-service.js';

/**
 * Componente para manejo de imágenes en el modal
 */
export class ImageManager {
    constructor() {
        this.imageService = new ImageService();
        this.selectedImages = [];
        this.maxImages = 3;
        
        this._initializeElements();
        this._bindEvents();
    }

    /**
     * Inicializar elementos del DOM
     */
    _initializeElements() {
        this.taskImageInput = document.getElementById('taskImage');
        this.imagePreviewContainer = document.getElementById('imagePreviewContainer');
        this.addImagesBtn = document.getElementById('addImagesBtn');
        this.imagesCounter = document.getElementById('imagesCounter');
    }

    /**
     * Vincular eventos
     */
    _bindEvents() {
        if (this.addImagesBtn) {
            this.addImagesBtn.addEventListener('click', () => {
                this.taskImageInput?.click();
            });
        }

        if (this.taskImageInput) {
            this.taskImageInput.addEventListener('change', (e) => {
                this._handleFileSelection(e.target.files);
            });
        }
    }

    /**
     * Manejar selección de archivos
     * @param {FileList} files - Archivos seleccionados
     */
    _handleFileSelection(files) {
        if (!files.length) return;

        // Verificar límite
        if (files.length + this.selectedImages.length > this.maxImages) {
            throw new Error(`Puedes seleccionar máximo ${this.maxImages} imágenes. Ya tienes ${this.selectedImages.length}.`);
        }

        Array.from(files).forEach(file => {
            if (this.selectedImages.length < this.maxImages) {
                try {
                    this.imageService.validateImageFile(file);
                    this._addImagePreview(file);
                } catch (error) {
                    throw error;
                }
            }
        });
    }

    /**
     * Agregar vista previa de imagen
     * @param {File|string} imageSource - Archivo o URL de imagen
     */
    _addImagePreview(imageSource) {
        if (this.selectedImages.length >= this.maxImages) {
            throw new Error(`Solo puedes seleccionar hasta ${this.maxImages} imágenes`);
        }

        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';

        const img = document.createElement('img');
        
        if (imageSource instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageSource);
            this.selectedImages.push(imageSource);
        } else {
            img.src = imageSource;
            if (!this.selectedImages.includes(imageSource)) {
                this.selectedImages.push(imageSource);
            }
        }

        const removeBtn = this._createRemoveButton(previewItem, imageSource);

        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        this.imagePreviewContainer?.appendChild(previewItem);

        this._updateCounter();
    }

    /**
     * Crear botón de eliminar imagen
     * @param {HTMLElement} previewItem - Elemento de vista previa
     * @param {File|string} imageSource - Fuente de la imagen
     * @returns {HTMLElement} Botón de eliminar
     */
    _createRemoveButton(previewItem, imageSource) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            this._removeImage(previewItem, imageSource);
        });
        return removeBtn;
    }

    /**
     * Eliminar imagen
     * @param {HTMLElement} previewItem - Elemento de vista previa
     * @param {File|string} imageSource - Fuente de la imagen
     */
    _removeImage(previewItem, imageSource) {
        if (imageSource instanceof File) {
            const index = this.selectedImages.findIndex(item => 
                item instanceof File && item.name === imageSource.name
            );
            if (index !== -1) {
                this.selectedImages.splice(index, 1);
            }
        } else {
            const index = this.selectedImages.indexOf(imageSource);
            if (index !== -1) {
                this.selectedImages.splice(index, 1);
            }
        }

        previewItem.remove();
        this._updateCounter();
    }

    /**
     * Actualizar contador de imágenes
     */
    _updateCounter() {
        if (this.imagesCounter) {
            this.imagesCounter.textContent = `${this.selectedImages.length}/${this.maxImages} imágenes seleccionadas`;
        }

        // Habilitar/deshabilitar botón
        if (this.addImagesBtn) {
            if (this.selectedImages.length >= this.maxImages) {
                this.addImagesBtn.disabled = true;
                this.addImagesBtn.style.opacity = '0.5';
            } else {
                this.addImagesBtn.disabled = false;
                this.addImagesBtn.style.opacity = '1';
            }
        }
    }

    /**
     * Cargar imágenes existentes
     * @param {Array} images - Array de URLs de imágenes
     */
    loadImages(images) {
        this.reset();
        if (images && images.length > 0) {
            images.forEach(url => {
                this._addImagePreview(url);
            });
        }
    }

    /**
     * Obtener imágenes seleccionadas
     * @returns {Array} Array de archivos y URLs
     */
    getSelectedImages() {
        return [...this.selectedImages];
    }

    /**
     * Resetear el componente
     */
    reset() {
        this.selectedImages = [];
        if (this.imagePreviewContainer) {
            this.imagePreviewContainer.innerHTML = '';
        }
        if (this.taskImageInput) {
            this.taskImageInput.value = '';
        }
        this._updateCounter();
    }
}
