import { BaseMechanic } from './BaseMechanic.js';

export class StormMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'storm',
            displayName: 'Tormenta de Arena'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_storm_zombies === undefined) ld.use_storm_zombies = false;
        if (!ld.storm_waves) ld.storm_waves = [];
        if (ld.storm_column_start === undefined) ld.storm_column_start = undefined;
        if (ld.storm_column_end === undefined) ld.storm_column_end = undefined;
        if (ld.storm_group_size === undefined) ld.storm_group_size = 3;
        if (ld.storm_time_between_groups === undefined) ld.storm_time_between_groups = 3;
        if (ld.storm_min_zombies === undefined) ld.storm_min_zombies = 3;
        if (ld.storm_max_zombies === undefined) ld.storm_max_zombies = 10;
        if (ld.storm_start_wave === undefined) ld.storm_start_wave = 1;
        if (ld.storm_event_count === undefined) ld.storm_event_count = 3;
        if (ld.storm_interval === undefined) ld.storm_interval = 3;
        if (ld.storm_type === undefined) ld.storm_type = "sandstorm";

        this.syncEnabled();
        if (ld.storm_waves.length === 0) this.migrateOldConfig();
    }

    migrateOldConfig() {
        const ld = this.generator.levelData;
        if (ld.storm_wave_start && ld.storm_wave_interval) {
            const start = ld.storm_wave_start;
            const interval = ld.storm_wave_interval;
            const total = ld.wave_count || 10;
            for (let w = start; w <= total; w += interval) ld.storm_waves.push(w);
        }
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('stormStartWave', 'stormEventCount', 'stormInterval', 'stormWaveSummary');
        ld.storm_waves = waves;
    }

    setupUI() {
        const checkbox = document.getElementById('useStorm');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_storm_zombies = e.target.checked;
            this.enabled = e.target.checked;
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        const stormType = document.getElementById('stormType');
        if (stormType) stormType.addEventListener('change', (e) => {
            this.generator.levelData.storm_type = e.target.value;
            this.generator.markTabAsChanged('basic');
        });

        ['stormStartWave', 'stormEventCount', 'stormInterval', 'stormGroupSize', 'stormTimeBetweenGroups', 'stormMin', 'stormMax'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });
    }

    renderColumnGrid() {
        const ld = this.generator.levelData;
        const enabled = ld.use_storm_zombies;
        const onColumnClick = (col) => {
            if (ld.storm_column_start === undefined || ld.storm_column_end === undefined) {
                ld.storm_column_start = col;
                ld.storm_column_end = col;
            } else if (col < ld.storm_column_start) {
                ld.storm_column_start = col;
            } else if (col > ld.storm_column_end) {
                ld.storm_column_end = col;
            } else if (col === ld.storm_column_start && col < ld.storm_column_end) {
                ld.storm_column_start = col + 1;
            } else if (col === ld.storm_column_end && col > ld.storm_column_start) {
                ld.storm_column_end = col - 1;
            } else {
                ld.storm_column_start = col;
                ld.storm_column_end = col;
            }
            this.renderColumnGrid();
            this.generator.markTabAsChanged('basic');
        };
        super.renderColumnGrid('stormColumnGrid', ld.storm_column_start, ld.storm_column_end, onColumnClick, !enabled);
    }

    updateControls() {
        const enabled = this.generator.levelData.use_storm_zombies;
        this.enabled = enabled;

        const checkbox = document.getElementById('useStorm');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('stormConfig');
        if (!config) return;

        const inputs = config.querySelectorAll('input');
        inputs.forEach(input => { input.disabled = !enabled; });
        config.style.opacity = enabled ? '1' : '0.6';
        config.style.pointerEvents = enabled ? 'auto' : 'none';

        if (enabled) {
            config.classList.remove('disabled-state');
            this.updateWaveList();
            this.renderColumnGrid();
        } else {
            config.classList.add('disabled-state');
            this.renderColumnGrid();
        }
    }

    collectData(data) {
        data.use_storm = this.generator.levelData.use_storm_zombies;
        data.storm_col_start = this.generator.levelData.storm_column_start;
        data.storm_col_end = this.generator.levelData.storm_column_end;
        data.storm_start_wave = this.getInt('stormStartWave', 1);
        data.storm_event_count = this.getInt('stormEventCount', 3);
        data.storm_interval = this.getInt('stormInterval', 3);
        data.storm_group_size = this.getInt('stormGroupSize', 3);
        data.storm_time_between = this.getInt('stormTimeBetweenGroups', 3);
        data.storm_min = this.getInt('stormMin', 3);
        data.storm_max = this.getInt('stormMax', 10);
        data.storm_type = this.generator.levelData.storm_type || "sandstorm";
    }

    applyData(data) {
        const useStorm = data.use_storm ?? this.generator.levelData.use_storm_zombies;
        this.safeAssign('useStorm', useStorm, 'checked');
        this.generator.levelData.use_storm_zombies = useStorm;

        if (data.storm_col_start !== undefined) this.generator.levelData.storm_column_start = data.storm_col_start;
        if (data.storm_col_end !== undefined) this.generator.levelData.storm_column_end = data.storm_col_end;
        if (data.storm_start_wave !== undefined) this.safeAssign('stormStartWave', data.storm_start_wave.toString());
        if (data.storm_event_count !== undefined) this.safeAssign('stormEventCount', data.storm_event_count.toString());
        if (data.storm_interval !== undefined) this.safeAssign('stormInterval', data.storm_interval.toString());
        if (data.storm_group_size !== undefined) this.safeAssign('stormGroupSize', data.storm_group_size.toString());
        if (data.storm_time_between !== undefined) this.safeAssign('stormTimeBetweenGroups', data.storm_time_between.toString());
        if (data.storm_min !== undefined) this.safeAssign('stormMin', data.storm_min.toString());
        if (data.storm_max !== undefined) this.safeAssign('stormMax', data.storm_max.toString());
        if (data.storm_type !== undefined) {
            this.generator.levelData.storm_type = data.storm_type;
            this.safeAssign('stormType', data.storm_type);
        }

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_storm_zombies = false;
        ld.storm_waves = [];
        ld.storm_column_start = undefined;
        ld.storm_column_end = undefined;
        ld.storm_group_size = 3;
        ld.storm_time_between_groups = 3;
        ld.storm_min_zombies = 3;
        ld.storm_max_zombies = 10;
        ld.storm_start_wave = 1;
        ld.storm_event_count = 3;
        ld.storm_interval = 3;
        ld.storm_type = "sandstorm";
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        if (!ld.use_storm_zombies) return waveData;
        if (!ld.storm_waves || !ld.storm_waves.includes(waveNumber)) return waveData;

        const eventIndex = this.countStormEventsOnWave(waveData);

        const minZombies = ld.storm_min_zombies;
        const maxZombies = ld.storm_max_zombies;
        const progress = waveNumber / totalWaves;
        let zombieCount = minZombies + Math.floor((maxZombies - minZombies) * progress);
        zombieCount = Math.max(minZombies, Math.min(zombieCount, maxZombies));

        const gen = this.generator;
        const zombies = [];
        const availableZombies = [...ld.zombies];
        const weights = availableZombies.map(z => gen.getZombieWeight(z));

        for (let i = 0; i < zombieCount; i++) {
            const zombieType = gen.weightedRandomChoice(availableZombies, weights);
            zombies.push({ Type: `RTID(${zombieType}@ZombieTypes)` });
        }

        if (!waveData.events) waveData.events = [];
        waveData.events.push({
            alias: `Wave${waveNumber}StormEvent${eventIndex}`,
            objclass: "StormZombieSpawnerProps",
            column_start: ld.storm_column_start,
            column_end: ld.storm_column_end,
            group_size: ld.storm_group_size,
            time_between_groups: ld.storm_time_between_groups,
            type: ld.storm_type || "sandstorm",
            zombies: zombies
        });

        return waveData;
    }

    countStormEventsOnWave(waveData) {
        if (!waveData.events) return 0;
        return waveData.events.filter(e => e.objclass === "StormZombieSpawnerProps").length;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_storm_zombies;
    }
}
