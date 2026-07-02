// ============================================
// Store.js - Observable global state store
// Deep Proxy-based reactivity with path subscriptions
// ============================================

const STORAGE_KEY = 'pvz_store';

let _instance = null;
let _idCounter = 0;

export class Store {
    constructor(initialState = {}) {
        if (_instance) return _instance;

        this._listeners = new Map();
        this._pendingNotifications = new Set();
        this._notifying = false;
        this._persistConfigs = [];
        this._state = this._makeObservable(initialState, '');

        _instance = this;
    }

    static getInstance() {
        if (!_instance) new Store();
        return _instance;
    }

    get state() {
        return this._state;
    }

    // ─── Subscriptions ─────────────────────────────────────

    subscribe(pathPattern, callback, options = {}) {
        const id = ++_idCounter;
        this._listeners.set(id, { pathPattern, callback, once: options.once || false });
        return () => this._listeners.delete(id);
    }

    subscribeOnce(pathPattern, callback) {
        return this.subscribe(pathPattern, callback, { once: true });
    }

    // ─── Persistence ───────────────────────────────────────

    persist(paths, storageKey = STORAGE_KEY) {
        const configs = Array.isArray(paths) ? paths : [paths];
        configs.forEach(pattern => {
            this._persistConfigs.push({ pattern, storageKey });
            this.subscribe(pattern, () => {
                this._saveToStorage(storageKey);
            });
        });
    }

    hydrate(initialState, storageKey = STORAGE_KEY) {
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return initialState;
            const parsed = JSON.parse(saved);
            return this._mergeDeep(initialState, parsed);
        } catch {
            return initialState;
        }
    }

    _saveToStorage(storageKey) {
        try {
            const data = {};
            this._persistConfigs
                .filter(c => c.storageKey === storageKey)
                .forEach(({ pattern }) => {
                    const value = this._getByPath(this._state, pattern);
                    if (value !== undefined) {
                        data[pattern] = value;
                    }
                });
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('[Store] Error saving to localStorage:', e);
        }
    }

    _getByPath(obj, path) {
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let current = obj;
        for (const part of parts) {
            if (current == null) return undefined;
            current = current[part];
        }
        return current;
    }

    _mergeDeep(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._mergeDeep(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    // ─── Batch updates ─────────────────────────────────────

    batch(updateFn) {
        const prevNotifying = this._notifying;
        this._notifying = true;
        try {
            updateFn(this._state);
        } finally {
            this._notifying = prevNotifying;
            if (!prevNotifying) {
                this._flush();
            }
        }
    }

    // ─── Snapshot for debugging ────────────────────────────

    snapshot() {
        return JSON.parse(JSON.stringify(this._state));
    }

    // ─── Internals ─────────────────────────────────────────

    _makeObservable(obj, basePath) {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (obj instanceof Date || obj instanceof RegExp) return obj;
        if (Array.isArray(obj)) return this._makeObservableArray(obj, basePath);
        if (obj._isProxy) return obj;

        const store = this;

        return new Proxy(obj, {
            get(target, key) {
                if (key === '_isProxy') return true;
                return Reflect.get(target, key);
            },

            set(target, key, value) {
                const fullPath = basePath ? `${basePath}.${String(key)}` : String(key);
                const oldValue = target[key];

                if (oldValue === value) return true;

                const newValue = store._makeObservable(value, fullPath);

                target[key] = newValue;

                store._enqueueNotification(fullPath, oldValue, newValue, target);
                return true;
            },

            deleteProperty(target, key) {
                const fullPath = basePath ? `${basePath}.${String(key)}` : String(key);
                const oldValue = target[key];
                delete target[key];
                store._enqueueNotification(fullPath, oldValue, undefined, target);
                return true;
            }
        });
    }

    _makeObservableArray(arr, basePath) {
        const store = this;
        const handlers = ['push', 'pop', 'splice', 'shift', 'unshift', 'sort', 'reverse'];
        const arrayMethods = {};

        handlers.forEach(method => {
            arrayMethods[method] = function (...args) {
                const result = Array.prototype[method].apply(this, args);
                store._enqueueNotification(basePath || 'array', null, [...this], this);
                return result;
            };
        });

        for (let i = 0; i < arr.length; i++) {
            arr[i] = store._makeObservable(arr[i], `${basePath}[${i}]`);
        }

        return new Proxy(arr, {
            get(target, key) {
                if (key === '_isProxy') return true;
                if (arrayMethods[key]) return arrayMethods[key];
                return Reflect.get(target, key);
            },
            set(target, key, value) {
                const fullPath = basePath ? `${basePath}[${key}]` : `[${key}]`;
                const oldValue = target[key];
                const newValue = store._makeObservable(value, fullPath);
                target[key] = newValue;
                store._enqueueNotification(fullPath, oldValue, newValue, target);
                return true;
            }
        });
    }

    _enqueueNotification(path, oldValue, newValue, target) {
        this._pendingNotifications.add({ path, oldValue, newValue, target });

        if (!this._notifying) {
            if (this._notifyScheduled) return;
            this._notifyScheduled = true;
            queueMicrotask(() => {
                this._notifyScheduled = false;
                this._flush();
            });
        }
    }

    _flush() {
        if (this._pendingNotifications.size === 0) return;

        const notifications = [...this._pendingNotifications];
        this._pendingNotifications.clear();

        this._notifying = true;
        try {
            for (const { path, oldValue, newValue } of notifications) {
                for (const [id, listener] of this._listeners) {
                    if (this._matchesPattern(path, listener.pathPattern)) {
                        try {
                            listener.callback({
                                path,
                                oldValue,
                                newValue,
                                state: this._state
                            });
                        } catch (e) {
                            console.warn(`[Store] Error in subscriber #${id}:`, e);
                        }
                        if (listener.once) {
                            this._listeners.delete(id);
                        }
                    }
                }
            }
        } finally {
            this._notifying = false;
        }
    }

    _matchesPattern(path, pattern) {
        if (pattern === '*') return true;
        if (pattern === path) return true;
        if (pattern.endsWith('.*')) {
            const prefix = pattern.slice(0, -2);
            return path === prefix || path.startsWith(prefix + '.');
        }
        if (pattern.endsWith('**')) {
            const prefix = pattern.slice(0, -2);
            return path.startsWith(prefix);
        }
        return false;
    }
}
