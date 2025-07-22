// Módulo para gestionar la sincronización offline de Firestore
export default class OfflineManager {
    constructor(db) {
      this.db = db;
      this.pendingOperations = [];
      this.localStorageKey = 'pending_operations';
      this.isOnline = navigator.onLine;
      
      // Cargar operaciones pendientes desde localStorage
      this.loadPendingOperations();
      
      // Escuchar eventos de conexión
      window.addEventListener('online', this.handleOnlineStatus.bind(this));
      window.addEventListener('offline', this.handleOnlineStatus.bind(this));
    }
    
    // Maneja cambios en el estado de conexión
    handleOnlineStatus() {
      const wasOffline = !this.isOnline;
      this.isOnline = navigator.onLine;
      
      // Si acabamos de recuperar la conexión, intentamos sincronizar
      if (this.isOnline && wasOffline) {
        this.syncPendingOperations();
      }
      
      // Notificar el cambio de estado
      document.dispatchEvent(new CustomEvent('connectionChange', {
        detail: { isOnline: this.isOnline }
      }));
    }
    
    // Guardar operaciones pendientes en localStorage
    savePendingOperations() {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.pendingOperations));
    }
    
    // Cargar operaciones pendientes desde localStorage
    loadPendingOperations() {
      try {
        const stored = localStorage.getItem(this.localStorageKey);
        this.pendingOperations = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error al cargar operaciones pendientes:', e);
        this.pendingOperations = [];
      }
    }
    
    // Añadir una operación a la cola
    addOperation(operation) {
      operation.id = Date.now().toString(); // ID único para la operación
      this.pendingOperations.push(operation);
      this.savePendingOperations();
      
      // Si estamos online, intentamos sincronizar inmediatamente
      if (this.isOnline) {
        this.syncPendingOperations();
      }
      return operation.id;
    }
    
    // Sincronizar operaciones pendientes con el servidor
    async syncPendingOperations() {
      if (!this.isOnline || this.pendingOperations.length === 0) return;
      
      const operationsToProcess = [...this.pendingOperations];
      this.pendingOperations = [];
      
      for (const operation of operationsToProcess) {
        try {
          await this.executeOperation(operation);
          // Eliminamos la operación de la lista de pendientes
          this.savePendingOperations();
        } catch (error) {
          console.error('Error al sincronizar operación:', error);
          // Volvemos a añadir a pendientes si falló
          this.pendingOperations.push(operation);
          this.savePendingOperations();
        }
      }
    }
    
    // Ejecutar una operación en Firestore
    async executeOperation(operation) {
      const { type, collection, docId, data } = operation;
      
      switch (type) {
        case 'add':
          // Si tenemos un ID temporal lo usamos, si no Firestore genera uno nuevo
          if (docId) {
            return await this.db.collection(collection).doc(docId).set(data);
          } else {
            return await this.db.collection(collection).add(data);
          }
        case 'update':
          return await this.db.collection(collection).doc(docId).update(data);
        case 'delete':
          return await this.db.collection(collection).doc(docId).delete();
        default:
          throw new Error(`Tipo de operación no soportado: ${type}`);
      }
    }
    
    // Obtener el número de operaciones pendientes
    getPendingCount() {
      return this.pendingOperations.length;
    }
    
    // Verificar si hay una operación pendiente para un documento específico
    hasPendingOperation(docId) {
      return this.pendingOperations.some(op => op.docId === docId);
    }
  }