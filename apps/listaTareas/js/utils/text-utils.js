/**
 * Utilidades para manejo de fechas
 */
export class DateUtils {
    /**
     * Obtiene la fecha actual en la zona horaria de Perú (UTC-5).
     * @returns {Date} - Fecha actual en Perú sin tiempo.
     */
    static getCurrentPeruDate() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        // Perú está en UTC-5
        const peruTime = new Date(utc - (5 * 60 * 60 * 1000));
        return new Date(peruTime.getFullYear(), peruTime.getMonth(), peruTime.getDate());
    }

    /**
     * Calcular los días restantes hasta una fecha
     * @param {string} dueDate - Fecha de vencimiento en formato 'YYYY-MM-DD'
     * @returns {number} - Días restantes
     */
    static getDaysLeft(dueDate) {
        const currentPeruDate = this.getCurrentPeruDate();
        const [year, month, day] = dueDate.split('-').map(Number);
        const due = new Date(year, month - 1, day);
        // Calcular diferencia en milisegundos
        const timeDiff = due - currentPeruDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    }

    /**
     * Obtener mensaje de días restantes
     * @param {number} daysLeft - Días restantes
     * @returns {string} - Mensaje correspondiente
     */
    static getDueMessage(daysLeft) {
        if (daysLeft === 1) {
            return 'Vence mañana';
        } else if (daysLeft > 1 && daysLeft <= 5) {
            return `Vence en ${daysLeft} días`;
        } else if (daysLeft <= 0) {
            return 'Ya venció';
        } else {
            return `Vence en más de 5 días`;
        }
    }

    /**
     * Validar si una fecha es válida y no es anterior a hoy
     * @param {string} dateString - Fecha en formato YYYY-MM-DD
     * @returns {boolean} - True si es válida
     */
    static validateDate(dateString) {
        if (!dateString) return false;

        const currentPeruDate = this.getCurrentPeruDate();
        const [year, month, day] = dateString.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        
        return selectedDate >= currentPeruDate;
    }
}

/**
 * Utilidades para texto
 */
export class TextUtils {
    /**
     * Parsear descripción y convertir guiones/puntos en listas HTML
     * @param {string} text - Texto de la descripción
     * @returns {string} - HTML formateado
     */
    static parseDescription(text) {
        if (!text) return '';

        const lines = text.split('\n');
        let html = '';
        let inList = false;
        let listType = '';

        lines.forEach(line => {
            if (/^-\s+/.test(line)) {
                if (!inList) {
                    inList = true;
                    listType = 'ul';
                    html += '<ul>';
                }
                const item = line.replace(/^-+\s+/, '');
                html += `<li>${item}</li>`;
            } else if (/^\.\s+/.test(line)) {
                if (!inList) {
                    inList = true;
                    listType = 'ol';
                    html += '<ol>';
                }
                const item = line.replace(/^\.\s+/, '');
                html += `<li>${item}</li>`;
            } else {
                if (inList) {
                    html += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                if (line.trim() !== '') {
                    html += `<p>${line}</p>`;
                }
            }
        });

        if (inList) {
            html += listType === 'ul' ? '</ul>' : '</ol>';
        }

        return html;
    }

    /**
     * Escapar HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
