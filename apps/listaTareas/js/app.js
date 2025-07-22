import { TaskController } from './controllers/task-controller.js';

/**
 * Punto de entrada principal de la aplicación
 */
class TaskApp {
    constructor() {
        this.controller = null;
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        try {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this._startApp();
                });
            } else {
                this._startApp();
            }
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    }

    /**
     * Iniciar la aplicación
     */
    _startApp() {
        this.controller = new TaskController();
        console.log('✅ Aplicación de tareas iniciada correctamente');
    }
}

// Crear e inicializar la aplicación
const app = new TaskApp();
app.init();

// Exportar para uso global si es necesario
window.TaskApp = app;
