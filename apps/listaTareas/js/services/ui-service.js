/**
 * Servicio para mostrar notificaciones
 */
export class NotificationService {
    constructor() {
        this.notification = document.getElementById('notification');
        this.defaultDuration = 3000;
    }

    /**
     * Mostrar notificación
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duración en milisegundos
     */
    show(message, type = 'success', duration = this.defaultDuration) {
        if (!this.notification) {
            console.warn('Elemento de notificación no encontrado');
            return;
        }

        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, duration);
    }

    /**
     * Mostrar notificación de éxito
     * @param {string} message - Mensaje
     */
    success(message) {
        this.show(message, 'success');
    }

    /**
     * Mostrar notificación de error
     * @param {string} message - Mensaje
     */
    error(message) {
        this.show(message, 'error');
    }

    /**
     * Mostrar notificación de advertencia
     * @param {string} message - Mensaje
     */
    warning(message) {
        this.show(message, 'warning');
    }

    /**
     * Mostrar notificación informativa
     * @param {string} message - Mensaje
     */
    info(message) {
        this.show(message, 'info');
    }
}

/**
 * Servicio para el spinner de carga
 */
export class LoadingService {
    constructor() {
        this.spinnerOverlay = document.getElementById('spinnerOverlay');
        this.isLoading = false;
    }

    /**
     * Mostrar spinner de carga
     */
    show() {
        if (this.spinnerOverlay) {
            this.spinnerOverlay.style.display = 'flex';
            document.body.classList.add('loading');
            this.isLoading = true;
            this._disableInteractions(true);
        }
    }

    /**
     * Ocultar spinner de carga
     */
    hide() {
        if (this.spinnerOverlay) {
            this.spinnerOverlay.style.display = 'none';
            document.body.classList.remove('loading');
            this.isLoading = false;
            this._disableInteractions(false);
        }
    }

    /**
     * Deshabilitar interacciones durante la carga
     * @param {boolean} disable - Estado para deshabilitar o habilitar
     */
    _disableInteractions(disable) {
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input, textarea');
        
        buttons.forEach(btn => {
            btn.disabled = disable;
        });
        
        inputs.forEach(input => {
            input.disabled = disable;
        });
    }
}
