export class TabStateManager {
    constructor(levelGenerator = null) {
        this.states = {};
        this.levelGenerator = levelGenerator;
        this.toggleHandlers = new Map();
        this.init();
    }

    init() {
        this.setupTabSync();
    }

    registerToggle(key, checkboxId, onToggle = null) {
        const checkbox = document.getElementById(checkboxId);
        if (!checkbox) {
            console.warn(`Checkbox ${checkboxId} no encontrado para estado ${key}`);
            return;
        }

        this.states[key] = this.states[key] || false;

        checkbox.addEventListener('change', (e) => {
            this.states[key] = e.target.checked;
            localStorage.setItem(`${key}State`, this.states[key]);

            if (onToggle) onToggle(e.target.checked);

            const event = new CustomEvent('tabStateChanged', {
                detail: { key, value: this.states[key] }
            });
            document.dispatchEvent(event);
        });
    }

    setupTabSync() {
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                setTimeout(() => this.syncStateWithUI(), 50);
            });
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.syncStateWithUI(), 100);
            });
        });
    }

    syncStateWithUI() {
        for (const [key, value] of Object.entries(this.states)) {
            const checkbox = document.querySelector(`[data-state-key="${key}"]`);
            if (checkbox && checkbox.type === 'checkbox') {
                if (checkbox.checked !== value) {
                    checkbox.checked = value;
                }
            }
        }
    }

    syncWithElement(elementId, stateKey) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = this.states[stateKey] || false;
        } else {
            element.value = this.states[stateKey] || '';
        }
    }

    registerState(key, defaultValue = false) {
        if (!(key in this.states)) {
            this.states[key] = defaultValue;
        }
        return this.states[key];
    }

    updateState(key, value) {
        this.states[key] = value;
        localStorage.setItem(`${key}State`, value);

        const event = new CustomEvent('tabStateChanged', {
            detail: { key, value }
        });
        document.dispatchEvent(event);
    }

    getState(key) {
        return this.states[key] || false;
    }

    resetState(key) {
        this.states[key] = false;
        localStorage.removeItem(`${key}State`);

        const checkbox = document.querySelector(`[data-state-key="${key}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
    }

    resetAllStates() {
        Object.keys(this.states).forEach(key => {
            localStorage.removeItem(`${key}State`);
        });
        localStorage.removeItem('tabStates');
        this.states = {};
        this.init();
    }

    saveState() {
        localStorage.setItem('tabStates', JSON.stringify(this.states));
        Object.keys(this.states).forEach(key => {
            localStorage.setItem(`${key}State`, this.states[key]);
        });
    }

    loadState() {
        const savedStates = localStorage.getItem('tabStates');
        if (savedStates) {
            try {
                this.states = JSON.parse(savedStates);
            } catch (e) {
                console.error('Error cargando estados:', e);
            }
        }
        return this.states;
    }
}
