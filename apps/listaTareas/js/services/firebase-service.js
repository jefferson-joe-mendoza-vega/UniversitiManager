import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { firebaseConfig } from '../config/firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Servicio para operaciones con Firebase Firestore
 */
export class FirebaseService {
    constructor() {
        this.db = db;
        this.collection = 'tareas';
    }

    /**
     * Obtener todas las tareas
     * @returns {Promise<Array>} Array de tareas
     */
    async getAllTasks() {
        try {
            const snapshot = await getDocs(collection(this.db, this.collection));
            const tasks = [];
            
            snapshot.forEach((docSnap) => {
                const task = docSnap.data();
                const taskId = docSnap.id;
                tasks.push({ ...task, id: taskId });
            });
            
            return tasks;
        } catch (error) {
            console.error('Error al obtener tareas:', error);
            throw new Error('Error al cargar las tareas');
        }
    }

    /**
     * Obtener una tarea por ID
     * @param {string} taskId - ID de la tarea
     * @returns {Promise<Object>} Datos de la tarea
     */
    async getTaskById(taskId) {
        try {
            const taskRef = doc(this.db, this.collection, taskId);
            const taskSnap = await getDoc(taskRef);
            
            if (taskSnap.exists()) {
                return { id: taskId, ...taskSnap.data() };
            } else {
                throw new Error('La tarea no existe');
            }
        } catch (error) {
            console.error('Error al obtener tarea:', error);
            throw error;
        }
    }

    /**
     * Agregar una nueva tarea
     * @param {Object} taskData - Datos de la tarea
     * @returns {Promise<string>} ID de la tarea creada
     */
    async addTask(taskData) {
        try {
            const docRef = await addDoc(collection(this.db, this.collection), taskData);
            return docRef.id;
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            throw new Error('Error al agregar la tarea');
        }
    }

    /**
     * Actualizar una tarea existente
     * @param {string} taskId - ID de la tarea
     * @param {Object} taskData - Nuevos datos de la tarea
     * @returns {Promise<void>}
     */
    async updateTask(taskId, taskData) {
        try {
            const taskRef = doc(this.db, this.collection, taskId);
            await updateDoc(taskRef, taskData);
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            throw new Error('Error al actualizar la tarea');
        }
    }

    /**
     * Eliminar una tarea
     * @param {string} taskId - ID de la tarea
     * @returns {Promise<void>}
     */
    async deleteTask(taskId) {
        try {
            const taskRef = doc(this.db, this.collection, taskId);
            await deleteDoc(taskRef);
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            throw new Error('Error al eliminar la tarea');
        }
    }
}
