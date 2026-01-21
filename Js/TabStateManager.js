// Js/classes/TabStateManager.js
// Gestión de estado entre pestañas
export class TabStateManager {
    constructor(levelGenerator = null) {
        this.states = {};
        this.levelGenerator = levelGenerator; // Referencia opcional al generador principal
        this.init();
    }
    
    init() {
        console.log('🔄 Inicializando TabStateManager...');
        
        // **CORREGIDO: Inicializar estado siempre como false**
        // NO cargar de localStorage para que se reinicie al refrescar
        this.states.underground = false;
        
        // Configurar checkbox si existe
        this.setupUndergroundCheckbox();
        
        // Sincronizar entre pestañas
        this.setupTabSync();
        
        // **CORREGIDO: No guardar antes de cerrar para evitar persistencia no deseada**
        // this.setupBeforeUnload(); // COMENTADO
        
        console.log('✅ TabStateManager inicializado (siempre false al inicio)');
    }
    
    setupUndergroundCheckbox() {
        const checkbox = document.getElementById('useUnderground');
        if (!checkbox) {
            console.warn('⚠️ Checkbox useUnderground no encontrado');
            return;
        }
        
        // **CORREGIDO: Establecer siempre false al inicio**
        checkbox.checked = this.states.underground; // Esto será false
        
        // Aplicar estilo inicial
        this.toggleUndergroundConfig(this.states.underground);
        
        // Configurar listener para cambios
        checkbox.addEventListener('change', (e) => {
            this.states.underground = e.target.checked;
            
            // **CORREGIDO: Guardar en localStorage SOLO si el usuario cambia manualmente**
            // Esto permite persistencia DURANTE la sesión, pero no entre recargas
            localStorage.setItem('undergroundEnabled', this.states.underground);
            
            // Actualizar UI
            this.toggleUndergroundConfig(this.states.underground);
            
            // Sincronizar con el levelGenerator si existe
            if (this.levelGenerator) {
                this.levelGenerator.levelData.use_underground_zombies = this.states.underground;
                
                // Si hay controles de underground, actualizarlos
                if (this.levelGenerator.updateUndergroundControls) {
                    this.levelGenerator.updateUndergroundControls();
                }
                
                // Marcar como cambiado
                this.levelGenerator.markTabAsChanged('basic');
            }
            
            console.log(`🔄 Estado underground actualizado: ${this.states.underground}`);
        });
    }
    
    toggleUndergroundConfig(enabled) {
        const config = document.getElementById('undergroundConfig');
        if (!config) return;
        
        const inputs = config.querySelectorAll('input');
        const selects = config.querySelectorAll('select');
        const allControls = [...inputs, ...selects];
        
        // Habilitar/deshabilitar controles
        allControls.forEach(control => {
            control.disabled = !enabled;
        });
        
        // Estilo visual
        config.style.opacity = enabled ? '1' : '0.6';
        config.style.pointerEvents = enabled ? 'auto' : 'none';
        
        // Agregar clase CSS para estilos adicionales
        if (enabled) {
            config.classList.remove('disabled-state');
        } else {
            config.classList.add('disabled-state');
        }
    }
    
    setupTabSync() {
        // Sincronizar cuando se muestra cualquier pestaña
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                setTimeout(() => {
                    this.syncStateWithUI();
                }, 50);
            });
        });
        
        // También sincronizar al hacer clic en cualquier pestaña (fallback)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    this.syncStateWithUI();
                }, 100);
            });
        });
    }
    
    syncStateWithUI() {
        // **CORREGIDO: Sincronizar solo con el estado actual, NO con localStorage**
        const checkbox = document.getElementById('useUnderground');
        if (checkbox) {
            // Si el checkbox no coincide con el estado actual, corregirlo
            if (checkbox.checked !== this.states.underground) {
                checkbox.checked = this.states.underground;
                this.toggleUndergroundConfig(this.states.underground);
            }
        }
    }
    
    // **CORREGIDO: Este método se mantiene pero es opcional**
    // Puedes descomentarlo si quieres persistencia temporal
    /*
    setupBeforeUnload() {
        // Guardar estado antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        // También guardar cuando cambia la visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveState();
            }
        });
    }
    */
    
    saveState() {
        // Guardar todos los estados en localStorage
        localStorage.setItem('tabStates', JSON.stringify(this.states));
        
        // Guardar individualmente para fácil acceso
        Object.keys(this.states).forEach(key => {
            localStorage.setItem(`${key}State`, this.states[key]);
        });
    }
    
    loadState() {
        // Cargar estados desde localStorage
        const savedStates = localStorage.getItem('tabStates');
        if (savedStates) {
            try {
                this.states = JSON.parse(savedStates);
            } catch (e) {
                console.error('Error cargando estados:', e);
            }
        }
        
        // Cargar estado individual de underground
        const undergroundState = localStorage.getItem('undergroundEnabled');
        if (undergroundState !== null) {
            this.states.underground = undergroundState === 'true';
        }
        
        return this.states;
    }
    
    // Método para sincronizar con un elemento específico
    syncWithElement(elementId, stateKey) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = this.states[stateKey] || false;
        } else {
            element.value = this.states[stateKey] || '';
        }
    }
    
    // Método para registrar un nuevo estado
    registerState(key, defaultValue = false) {
        if (!this.states[key]) {
            // **CORREGIDO: Siempre usar el valor por defecto, no cargar de localStorage**
            this.states[key] = defaultValue;
            
            // **OPCIONAL: Solo guardar si el usuario cambia manualmente**
            // localStorage.setItem(`${key}State`, defaultValue);
        }
        
        return this.states[key];
    }
    
    // Método para actualizar un estado
    updateState(key, value) {
        this.states[key] = value;
        
        // **CORREGIDO: Guardar en localStorage SOLO para persistencia DURANTE la sesión**
        localStorage.setItem(`${key}State`, value);
        
        // Disparar evento personalizado para notificar cambios
        const event = new CustomEvent('tabStateChanged', {
            detail: { key, value }
        });
        document.dispatchEvent(event);
    }
    
    // Método para obtener el estado actual
    getState(key) {
        return this.states[key] || false;
    }
    
    // Método para restablecer todos los estados
    resetAllStates() {
        Object.keys(this.states).forEach(key => {
            localStorage.removeItem(`${key}State`);
        });
        localStorage.removeItem('tabStates');
        
        // **CORREGIDO: Limpiar también el estado específico de underground**
        localStorage.removeItem('undergroundEnabled');
        
        this.states = {};
        this.init();
        
        console.log('🔄 Todos los estados restablecidos');
    }
    
    // **NUEVO: Método para limpiar solo el estado de underground**
    resetUndergroundState() {
        this.states.underground = false;
        localStorage.removeItem('undergroundEnabled');
        
        const checkbox = document.getElementById('useUnderground');
        if (checkbox) {
            checkbox.checked = false;
            this.toggleUndergroundConfig(false);
        }
        
        console.log('🔄 Estado underground restablecido a false');
    }
}