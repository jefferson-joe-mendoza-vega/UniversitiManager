/**
 * Servicio para manejo de guardado temporal de formularios
 */
export class TempSaveService {
    constructor() {
        this.STORAGE_KEY = 'taskForm_tempSave';
        this.AUTO_SAVE_DELAY = 1000; // 1 segundo después de dejar de escribir
        this.autoSaveTimer = null;
    }

    /**
     * Guardar datos temporalmente en localStorage
     * @param {Object} formData - Datos del formulario
     */
    saveTemp(formData) {
        try {
            const tempData = {
                ...formData,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tempData));
            this._showTempSaveIndicator();
        } catch (error) {
            console.warn('No se pudo guardar temporalmente:', error);
        }
    }

    /**
     * Cargar datos temporales desde localStorage
     * @returns {Object|null} Datos temporales o null si no existen
     */
    loadTemp() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved) return null;

            const tempData = JSON.parse(saved);
            
            // Verificar que los datos no sean muy antiguos (más de 24 horas)
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
            if (Date.now() - tempData.timestamp > maxAge) {
                this.clearTemp();
                return null;
            }

            return tempData;
        } catch (error) {
            console.warn('Error al cargar datos temporales:', error);
            this.clearTemp();
            return null;
        }
    }

    /**
     * Limpiar datos temporales
     */
    clearTemp() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this._hideTempSaveIndicator();
        } catch (error) {
            console.warn('Error al limpiar datos temporales:', error);
        }
    }

    /**
     * Verificar si existen datos temporales
     * @returns {boolean} True si existen datos temporales
     */
    hasTemp() {
        return this.loadTemp() !== null;
    }

    /**
     * Configurar auto-guardado para un formulario
     * @param {HTMLFormElement} form - Formulario a monitorear
     * @param {Function} getDataCallback - Función para obtener datos del formulario
     */
    setupAutoSave(form, getDataCallback) {
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Eventos para detectar cambios
            const events = ['input', 'change', 'paste'];
            
            events.forEach(eventType => {
                input.addEventListener(eventType, () => {
                    this._scheduleAutoSave(getDataCallback);
                });
            });
        });
    }

    /**
     * Programar auto-guardado con debounce
     * @param {Function} getDataCallback - Función para obtener datos
     * @private
     */
    _scheduleAutoSave(getDataCallback) {
        // Cancelar el timer anterior si existe
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Programar nuevo guardado
        this.autoSaveTimer = setTimeout(() => {
            try {
                const formData = getDataCallback();
                // Solo guardar si hay algo de contenido
                if (this._hasContent(formData)) {
                    this.saveTemp(formData);
                }
            } catch (error) {
                console.warn('Error en auto-guardado:', error);
            }
        }, this.AUTO_SAVE_DELAY);
    }

    /**
     * Verificar si el formulario tiene contenido
     * @param {Object} formData - Datos del formulario
     * @returns {boolean} True si tiene contenido
     * @private
     */
    _hasContent(formData) {
        return formData.nombre.trim() || 
               formData.fecha || 
               formData.descripcion.trim();
    }

    /**
     * Mostrar indicador de guardado temporal
     * @private
     */
    _showTempSaveIndicator() {
        const indicator = document.getElementById('tempSaveIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.classList.add('temp-save-active');
            
            // Efecto de "guardado"
            const icon = indicator.querySelector('.indicator-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    /**
     * Ocultar indicador de guardado temporal
     * @private
     */
    _hideTempSaveIndicator() {
        const indicator = document.getElementById('tempSaveIndicator');
        if (indicator) {
            indicator.style.display = 'none';
            indicator.classList.remove('temp-save-active');
        }
    }

    /**
     * Mostrar notificación de datos restaurados
     */
    showRestoredDataNotification() {
        const event = new CustomEvent('tempDataRestored', {
            detail: {
                message: '📝 Se han restaurado los datos que tenías guardados'
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Mostrar confirmación antes de limpiar datos temporales
     * @returns {Promise<boolean>} True si el usuario confirma limpiar
     */
    async confirmClearTemp() {
        return new Promise((resolve) => {
            const modal = this._createConfirmModal();
            document.body.appendChild(modal);
            
            const confirmBtn = modal.querySelector('.confirm-clear');
            const cancelBtn = modal.querySelector('.cancel-clear');
            
            const cleanup = () => {
                document.body.removeChild(modal);
            };
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
        });
    }

    /**
     * Crear modal de confirmación
     * @returns {HTMLElement} Modal de confirmación
     * @private
     */
    _createConfirmModal() {
        const modal = document.createElement('div');
        modal.className = 'temp-save-confirm-modal';
        modal.innerHTML = `
            <div class="temp-save-confirm-content">
                <h3>¿Limpiar formulario?</h3>
                <p>Tienes datos guardados temporalmente. ¿Estás seguro de que quieres limpiar el formulario?</p>
                <div class="temp-save-confirm-actions">
                    <button class="cancel-clear btn-secondary">Cancelar</button>
                    <button class="confirm-clear btn-primary">Sí, limpiar</button>
                </div>
            </div>
        `;
        
        // Estilos inline para el modal de confirmación
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = modal.querySelector('.temp-save-confirm-content');
        content.style.cssText = `
            background: var(--bg-tertiary);
            padding: 30px;
            border-radius: 12px;
            max-width: 400px;
            text-align: center;
            color: var(--text-primary);
        `;
        
        const actions = modal.querySelector('.temp-save-confirm-actions');
        actions.style.cssText = `
            display: flex;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
        `;
        
        return modal;
    }
}
