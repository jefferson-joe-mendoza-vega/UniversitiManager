import { imgbbAPIKey } from '../config/firebase-config.js';

/**
 * Servicio para manejo de imágenes
 */
export class ImageService {
    constructor() {
        this.apiKey = imgbbAPIKey;
        this.maxImages = 3;
    }

    /**
     * Subir imagen a ImgBB
     * @param {File} file - Archivo de imagen
     * @returns {Promise<string>} URL de la imagen subida
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${this.apiKey}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                return data.data.url;
            } else {
                throw new Error('Error al subir la imagen a ImgBB');
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }

    /**
     * Subir múltiples imágenes
     * @param {Array} images - Array de archivos o URLs
     * @returns {Promise<Array>} Array de URLs
     */
    async uploadMultipleImages(images) {
        const imageUrls = [];

        for (const item of images) {
            if (item instanceof File) {
                // Si es un nuevo archivo, subirlo a ImgBB
                const url = await this.uploadImage(item);
                imageUrls.push(url);
            } else {
                // Si es una URL existente, añadirla directamente
                imageUrls.push(item);
            }
        }

        return imageUrls;
    }

    /**
     * Validar archivo de imagen
     * @param {File} file - Archivo a validar
     * @returns {boolean} True si es válido
     */
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Tipo de archivo no válido. Solo se permiten imágenes.');
        }

        if (file.size > maxSize) {
            throw new Error('El archivo es demasiado grande. Máximo 5MB.');
        }

        return true;
    }

    /**
     * Crear elemento de imagen para vista previa
     * @param {string} src - URL de la imagen
     * @param {string} alt - Texto alternativo
     * @returns {HTMLElement} Elemento de imagen
     */
    createImageElement(src, alt = '') {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        
        imgContainer.appendChild(img);
        return imgContainer;
    }
}
