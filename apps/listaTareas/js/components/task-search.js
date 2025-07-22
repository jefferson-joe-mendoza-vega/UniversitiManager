/**
 * Componente para búsqueda de tareas
 */
export class TaskSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.allTasks = [];
        this._bindEvents();
    }

    /**
     * Vincular eventos
     */
    _bindEvents() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this._performSearch(query);
            });
        }
    }

    /**
     * Actualizar lista de todas las tareas
     * @param {Array} tasks - Array de todas las tareas
     */
    updateTasks(tasks) {
        this.allTasks = [...tasks];
    }

    /**
     * Realizar búsqueda
     * @param {string} query - Término de búsqueda
     */
    _performSearch(query) {
        let filteredTasks;

        if (!query) {
            filteredTasks = this.allTasks;
        } else {
            filteredTasks = this.allTasks.filter(task => 
                this._matchesSearch(task, query)
            );
        }

        // Disparar evento con los resultados filtrados
        const event = new CustomEvent('searchResults', {
            detail: { tasks: filteredTasks, query }
        });
        window.dispatchEvent(event);
    }

    /**
     * Verificar si una tarea coincide con la búsqueda
     * @param {Object} task - Tarea a verificar
     * @param {string} query - Término de búsqueda
     * @returns {boolean} True si coincide
     */
    _matchesSearch(task, query) {
        const searchTerm = query.toLowerCase();
        
        // Buscar en nombre
        if (task.nombre && task.nombre.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Buscar en descripción
        if (task.descripcion && task.descripcion.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Buscar en fecha
        if (task.fecha && task.fecha.includes(searchTerm)) {
            return true;
        }

        return false;
    }

    /**
     * Limpiar búsqueda
     */
    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this._performSearch('');
        }
    }

    /**
     * Obtener término de búsqueda actual
     * @returns {string} Término de búsqueda
     */
    getCurrentQuery() {
        return this.searchInput?.value.trim() || '';
    }
}
