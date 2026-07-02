import { BaseMechanic } from './BaseMechanic.js';

export class FrostWindMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'frostwind',
            displayName: 'Viento de Hielo'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_frostwind === undefined) ld.use_frostwind = false;
        if (!ld.frostwind_waves) ld.frostwind_waves = [];
        if (ld.frostwind_start_wave === undefined) ld.frostwind_start_wave = 1;
        if (ld.frostwind_event_count === undefined) ld.frostwind_event_count = 3;
        if (ld.frostwind_interval === undefined) ld.frostwind_interval = 3;
        if (!ld.frostwind_rows) ld.frostwind_rows = [];
        if (!ld.frostwind_direction) ld.frostwind_direction = 'right';

        this.syncEnabled();
        if (ld.frostwind_waves.length === 0) this.migrateOldConfig();
    }

    migrateOldConfig() {
        const ld = this.generator.levelData;
        if (ld.frostwind_start_wave && ld.frostwind_interval) {
            const start = ld.frostwind_start_wave;
            const interval = ld.frostwind_interval;
            const total = ld.wave_count || 10;
            for (let w = start; w <= total; w += interval) ld.frostwind_waves.push(w);
        }
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('frostwindStartWave', 'frostwindEventCount', 'frostwindInterval', 'frostwindWaveSummary');
        ld.frostwind_waves = waves;
    }

    setupUI() {
        const checkbox = document.getElementById('useFrostwind');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_frostwind = e.target.checked;
            this.enabled = e.target.checked;
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        ['frostwindStartWave', 'frostwindEventCount', 'frostwindInterval'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });

        const dirSelect = document.getElementById('frostwindDirection');
        if (dirSelect) dirSelect.addEventListener('change', (e) => {
            this.generator.levelData.frostwind_direction = e.target.value;
            this.generator.markTabAsChanged('basic');
        });
    }

    updateControls() {
        const enabled = this.generator.levelData.use_frostwind;
        this.enabled = enabled;

        const checkbox = document.getElementById('useFrostwind');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('frostwindConfig');
        if (!config) return;

        this.renderRowCheckboxes();

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

    renderRowCheckboxes() {
        const container = document.getElementById('frostwindRows');
        if (!container) return;

        const ld = this.generator.levelData;
        if (!ld.frostwind_rows) ld.frostwind_rows = [];
        container.innerHTML = '';

        for (let row = 0; row < 5; row++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-check form-check-inline';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input frostwind-row-cb';
            checkbox.id = `frostwind_row_${row}`;
            checkbox.checked = ld.frostwind_rows.includes(row);

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (!ld.frostwind_rows.includes(row)) ld.frostwind_rows.push(row);
                } else {
                    ld.frostwind_rows = ld.frostwind_rows.filter(r => r !== row);
                }
                this.generator.markTabAsChanged('basic');
            });

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `frostwind_row_${row}`;
            label.textContent = `${__('rowLabel')} ${row + 1}`;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        }
    }

    collectData(data) {
        data.use_frostwind = this.generator.levelData.use_frostwind;
        data.frostwind_start_wave = this.getInt('frostwindStartWave', 1);
        data.frostwind_event_count = this.getInt('frostwindEventCount', 3);
        data.frostwind_interval = this.getInt('frostwindInterval', 3);
        data.frostwind_direction = this.generator.levelData.frostwind_direction;
        data.frostwind_rows = [...(this.generator.levelData.frostwind_rows || [])];
    }

    applyData(data) {
        const useIt = data.use_frostwind ?? this.generator.levelData.use_frostwind;
        this.safeAssign('useFrostwind', useIt, 'checked');
        this.generator.levelData.use_frostwind = useIt;

        if (data.frostwind_start_wave !== undefined) this.safeAssign('frostwindStartWave', data.frostwind_start_wave.toString());
        if (data.frostwind_event_count !== undefined) this.safeAssign('frostwindEventCount', data.frostwind_event_count.toString());
        if (data.frostwind_interval !== undefined) this.safeAssign('frostwindInterval', data.frostwind_interval.toString());
        if (data.frostwind_direction !== undefined) {
            this.generator.levelData.frostwind_direction = data.frostwind_direction;
            this.safeAssign('frostwindDirection', data.frostwind_direction);
        }
        if (data.frostwind_rows) {
            this.generator.levelData.frostwind_rows = [...data.frostwind_rows];
        }

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_frostwind = false;
        ld.frostwind_waves = [];
        ld.frostwind_start_wave = 1;
        ld.frostwind_event_count = 3;
        ld.frostwind_interval = 3;
        ld.frostwind_rows = [];
        ld.frostwind_direction = 'right';
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        if (!ld.use_frostwind) return waveData;
        if (!ld.frostwind_waves || !ld.frostwind_waves.includes(waveNumber)) return waveData;

        const eventIndex = this.countFrostwindEventsOnWave(waveData);
        const rows = ld.frostwind_rows || [0, 1, 2, 3, 4];
        const direction = ld.frostwind_direction || 'right';

        const winds = rows.map(row => ({
            Direction: direction,
            Row: row
        }));

        if (!waveData.events) waveData.events = [];
        waveData.events.push({
            alias: `Wave${waveNumber}FrostWindEvent${eventIndex}`,
            objclass: "FrostWindWaveActionProps",
            Winds: winds
        });

        return waveData;
    }

    countFrostwindEventsOnWave(waveData) {
        if (!waveData.events) return 0;
        return waveData.events.filter(e => e.objclass === "FrostWindWaveActionProps").length;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_frostwind;
    }
}
