export class MechanicManager {
    constructor(generator) {
        this.generator = generator;
        this.mechanics = [];
    }

    register(mechanic) {
        this.mechanics.push(mechanic);
        return this;
    }

    get(id) {
        return this.mechanics.find(m => m.id === id);
    }

    getAll() {
        return [...this.mechanics];
    }

    getEnabled() {
        return this.mechanics.filter(m => m.enabled);
    }

    forEach(method, ...args) {
        const results = [];
        for (const m of this.mechanics) {
            if (typeof m[method] === 'function') {
                results.push(m[method](...args));
            }
        }
        return results;
    }

    initAll() {
        return this.forEach('onInit');
    }

    setupAllUI() {
        return this.forEach('setupUI');
    }

    updateAllControls() {
        return this.forEach('updateControls');
    }

    collectAllData(data) {
        return this.forEach('collectData', data);
    }

    applyAllData(data) {
        return this.forEach('applyData', data);
    }

    resetAll() {
        return this.forEach('resetData');
    }

    getWaveGenerator(waveNumber) {
        for (const m of this.getEnabled()) {
            if (m.shouldHandleWave && m.shouldHandleWave(waveNumber)) {
                return m;
            }
        }
        return null;
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        let result = waveData;
        for (const m of this.getEnabled()) {
            if (m.modifyWave) {
                const modified = m.modifyWave(result, waveNumber, pfWaves, zombieThreats, totalWaves);
                if (modified) result = modified;
            }
        }
        return result;
    }
}
