import { BaseMechanic } from './BaseMechanic.js';

export class TideMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'tide',
            displayName: 'Marea'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_tide === undefined) ld.use_tide = false;
        if (!ld.tide_waves) ld.tide_waves = [];
        if (!ld.tide_wave_amounts) ld.tide_wave_amounts = {};
        if (ld.tide_default_amount === undefined) ld.tide_default_amount = 3;
        if (ld.tide_change_type === undefined) ld.tide_change_type = "absolute";
        if (ld.tide_start_wave === undefined) ld.tide_start_wave = 1;
        if (ld.tide_event_count === undefined) ld.tide_event_count = 3;
        if (ld.tide_interval === undefined) ld.tide_interval = 3;
        if (ld.tide_starting_wave_location === undefined) ld.tide_starting_wave_location = 7;
        this.syncEnabled();
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('tideStartWave', 'tideEventCount', 'tideInterval', 'tideWaveSummary');
        ld.tide_waves = waves;

        if (!ld.tide_wave_amounts) ld.tide_wave_amounts = {};
        waves.forEach(w => {
            if (ld.tide_wave_amounts[w] === undefined) {
                ld.tide_wave_amounts[w] = ld.tide_default_amount || 3;
            }
        });
        Object.keys(ld.tide_wave_amounts).forEach(k => {
            const num = parseInt(k);
            if (!waves.includes(num)) {
                delete ld.tide_wave_amounts[k];
            }
        });

        this.renderWaveAmounts();
    }

    renderWaveAmounts() {
        const container = document.getElementById('tideWaveAmountsContainer');
        if (!container) return;

        const ld = this.generator.levelData;
        const waves = ld.tide_waves || [];

        container.innerHTML = '';

        if (waves.length === 0) {
            container.innerHTML = '<small class="text-muted">No hay oleadas configuradas</small>';
            return;
        }

        waves.forEach(wave => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tide-wave-amount-item';
            wrapper.style.cssText = 'display:flex;align-items:center;gap:4px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;padding:4px 8px;';

            const label = document.createElement('span');
            label.className = 'fw-bold';
            label.style.cssText = 'font-size:0.8rem;min-width:24px;';
            label.textContent = `#${wave}`;

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control form-control-sm';
            input.style.cssText = 'width:65px;';
            input.value = ld.tide_wave_amounts[wave] !== undefined ? ld.tide_wave_amounts[wave] : (ld.tide_default_amount || 3);
            input.min = 1;
            input.max = 10;
            input.dataset.wave = wave;

            input.addEventListener('input', (e) => {
                const w = parseInt(e.target.dataset.wave);
                ld.tide_wave_amounts[w] = parseInt(e.target.value) || 1;
                this.generator.markTabAsChanged('basic');
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            container.appendChild(wrapper);
        });
    }

    setupUI() {
        const checkbox = document.getElementById('useTide');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_tide = e.target.checked;
            this.enabled = e.target.checked;
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        const changeType = document.getElementById('tideChangeType');
        if (changeType) changeType.addEventListener('change', (e) => {
            this.generator.levelData.tide_change_type = e.target.value;
            this.generator.markTabAsChanged('basic');
        });

        const startingLocation = document.getElementById('tideStartingLocation');
        if (startingLocation) startingLocation.addEventListener('input', (e) => {
            this.generator.levelData.tide_starting_wave_location = parseInt(e.target.value) || 7;
            this.generator.markTabAsChanged('basic');
        });

        ['tideStartWave', 'tideEventCount', 'tideInterval'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });
    }

    updateControls() {
        const enabled = this.generator.levelData.use_tide;
        this.enabled = enabled;

        const checkbox = document.getElementById('useTide');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('tideConfig');
        if (!config) return;

        const inputs = config.querySelectorAll('input, select');
        inputs.forEach(input => { input.disabled = !enabled; });
        config.style.opacity = enabled ? '1' : '0.6';
        config.style.pointerEvents = enabled ? 'auto' : 'none';

        if (enabled) {
            config.classList.remove('disabled-state');
            this.updateWaveList();
        } else {
            config.classList.add('disabled-state');
        }
    }

    collectData(data) {
        data.use_tide = this.generator.levelData.use_tide;
        data.tide_start_wave = this.getInt('tideStartWave', 1);
        data.tide_event_count = this.getInt('tideEventCount', 3);
        data.tide_interval = this.getInt('tideInterval', 3);
        data.tide_wave_amounts = { ...this.generator.levelData.tide_wave_amounts };
        data.tide_default_amount = this.generator.levelData.tide_default_amount;
        data.tide_change_type = this.generator.levelData.tide_change_type || "absolute";
        data.tide_starting_wave_location = this.getInt('tideStartingLocation', 7);
    }

    applyData(data) {
        const useTide = data.use_tide ?? this.generator.levelData.use_tide;
        this.safeAssign('useTide', useTide, 'checked');
        this.generator.levelData.use_tide = useTide;

        if (data.tide_start_wave !== undefined) this.safeAssign('tideStartWave', data.tide_start_wave.toString());
        if (data.tide_event_count !== undefined) this.safeAssign('tideEventCount', data.tide_event_count.toString());
        if (data.tide_interval !== undefined) this.safeAssign('tideInterval', data.tide_interval.toString());
        if (data.tide_wave_amounts !== undefined) {
            this.generator.levelData.tide_wave_amounts = { ...data.tide_wave_amounts };
        }
        if (data.tide_default_amount !== undefined) {
            this.generator.levelData.tide_default_amount = data.tide_default_amount;
        }
        if (data.tide_change_type !== undefined) {
            this.generator.levelData.tide_change_type = data.tide_change_type;
            this.safeAssign('tideChangeType', data.tide_change_type);
        }
        if (data.tide_starting_wave_location !== undefined) {
            this.generator.levelData.tide_starting_wave_location = data.tide_starting_wave_location;
            this.safeAssign('tideStartingLocation', data.tide_starting_wave_location.toString());
        }

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_tide = false;
        ld.tide_waves = [];
        ld.tide_wave_amounts = {};
        ld.tide_default_amount = 3;
        ld.tide_change_type = "absolute";
        ld.tide_start_wave = 1;
        ld.tide_event_count = 3;
        ld.tide_interval = 3;
        ld.tide_starting_wave_location = 7;
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        if (!ld.use_tide) return waveData;
        if (!ld.tide_waves || !ld.tide_waves.includes(waveNumber)) return waveData;

        const eventIndex = this.countTideEventsOnWave(waveData);
        const amount = ld.tide_wave_amounts && ld.tide_wave_amounts[waveNumber] !== undefined
            ? ld.tide_wave_amounts[waveNumber]
            : (ld.tide_default_amount || 3);

        if (!waveData.events) waveData.events = [];
        waveData.events.push({
            alias: `Wave${waveNumber}TidalChangeEvent${eventIndex}`,
            objclass: "TidalChangeWaveActionProps",
            objdata: {
                "TidalChange": {
                    "ChangeAmount": amount,
                    "ChangeType": ld.tide_change_type
                }
            }
        });

        return waveData;
    }

    countTideEventsOnWave(waveData) {
        if (!waveData.events) return 0;
        return waveData.events.filter(e => e.objclass === "TidalChangeWaveActionProps").length;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_tide;
    }
}
