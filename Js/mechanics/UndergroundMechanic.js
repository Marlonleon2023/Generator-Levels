import { BaseMechanic } from './BaseMechanic.js';

export class UndergroundMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'underground',
            displayName: 'Zombies Subterráneos'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_underground_zombies === undefined) ld.use_underground_zombies = false;
        if (!ld.underground_waves) ld.underground_waves = [];
        if (ld.underground_columns_start === undefined) ld.underground_columns_start = undefined;
        if (ld.underground_columns_end === undefined) ld.underground_columns_end = undefined;
        if (ld.underground_max_zombies === undefined) ld.underground_max_zombies = 3;
        if (ld.underground_min_zombies === undefined) ld.underground_min_zombies = 1;
        if (ld.underground_start_wave === undefined) ld.underground_start_wave = 1;
        if (ld.underground_event_count === undefined) ld.underground_event_count = 3;
        if (ld.underground_interval === undefined) ld.underground_interval = 3;

        this.syncEnabled();
        if (ld.underground_waves.length === 0) this.migrateOldConfig();
    }

    migrateOldConfig() {
        const ld = this.generator.levelData;
        if (ld.underground_wave_start && ld.underground_wave_interval) {
            const start = ld.underground_wave_start;
            const interval = ld.underground_wave_interval;
            const total = ld.wave_count || 10;
            for (let w = start; w <= total; w += interval) ld.underground_waves.push(w);
        }
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('undergroundStartWave', 'undergroundEventCount', 'undergroundInterval', 'undergroundWaveSummary');
        ld.underground_waves = waves;
    }

    setupUI() {
        const checkbox = document.getElementById('useUnderground');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_underground_zombies = e.target.checked;
            this.enabled = e.target.checked;
            if (this.generator.tabStateManager) {
                this.generator.tabStateManager.updateState('underground', e.target.checked);
            }
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        ['undergroundStartWave', 'undergroundEventCount', 'undergroundInterval', 'undergroundMin', 'undergroundMax'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });
    }

    renderColumnGrid() {
        const ld = this.generator.levelData;
        const enabled = ld.use_underground_zombies;
        const onColumnClick = (col) => {
            if (ld.underground_columns_start === undefined || ld.underground_columns_end === undefined) {
                ld.underground_columns_start = col;
                ld.underground_columns_end = col;
            } else if (col < ld.underground_columns_start) {
                ld.underground_columns_start = col;
            } else if (col > ld.underground_columns_end) {
                ld.underground_columns_end = col;
            } else if (col === ld.underground_columns_start && col < ld.underground_columns_end) {
                ld.underground_columns_start = col + 1;
            } else if (col === ld.underground_columns_end && col > ld.underground_columns_start) {
                ld.underground_columns_end = col - 1;
            } else {
                ld.underground_columns_start = col;
                ld.underground_columns_end = col;
            }
            this.renderColumnGrid();
            this.generator.markTabAsChanged('basic');
        };
        super.renderColumnGrid('undergroundColumnGrid', ld.underground_columns_start, ld.underground_columns_end, onColumnClick, !enabled);
    }

    updateControls() {
        const enabled = this.generator.levelData.use_underground_zombies;
        this.enabled = enabled;

        const checkbox = document.getElementById('useUnderground');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('undergroundConfig');
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
        data.use_underground = this.generator.levelData.use_underground_zombies;
        data.underground_col_start = this.generator.levelData.underground_columns_start;
        data.underground_col_end = this.generator.levelData.underground_columns_end;
        data.underground_start_wave = this.getInt('undergroundStartWave', 1);
        data.underground_event_count = this.getInt('undergroundEventCount', 3);
        data.underground_interval = this.getInt('undergroundInterval', 3);
        data.underground_min = this.getInt('undergroundMin', 3);
        data.underground_max = this.getInt('undergroundMax', 8);
    }

    applyData(data) {
        const useUnderground = data.use_underground ?? this.generator.levelData.use_underground_zombies;
        this.safeAssign('useUnderground', useUnderground, 'checked');
        this.generator.levelData.use_underground_zombies = useUnderground;

        if (data.underground_col_start !== undefined) this.generator.levelData.underground_columns_start = data.underground_col_start;
        if (data.underground_col_end !== undefined) this.generator.levelData.underground_columns_end = data.underground_col_end;
        if (data.underground_start_wave !== undefined) this.safeAssign('undergroundStartWave', data.underground_start_wave.toString());
        if (data.underground_event_count !== undefined) this.safeAssign('undergroundEventCount', data.underground_event_count.toString());
        if (data.underground_interval !== undefined) this.safeAssign('undergroundInterval', data.underground_interval.toString());
        if (data.underground_min !== undefined) this.safeAssign('undergroundMin', data.underground_min.toString());
        if (data.underground_max !== undefined) this.safeAssign('undergroundMax', data.underground_max.toString());

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_underground_zombies = false;
        ld.underground_waves = [];
        ld.underground_columns_start = undefined;
        ld.underground_columns_end = undefined;
        ld.underground_max_zombies = 3;
        ld.underground_min_zombies = 1;
        ld.underground_start_wave = 1;
        ld.underground_event_count = 3;
        ld.underground_interval = 3;
    }

    shouldHandleWave(waveNumber) {
        const ld = this.generator.levelData;
        return ld.use_underground_zombies && ld.underground_waves && ld.underground_waves.includes(waveNumber);
    }

    generateWave(waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        const minZombies = ld.underground_min_zombies;
        const maxZombies = ld.underground_max_zombies;
        const progress = waveNumber / totalWaves;
        let zombieCount = minZombies + Math.floor((maxZombies - minZombies) * progress);
        zombieCount = Math.max(minZombies, Math.min(zombieCount, maxZombies));

        const waveData = {
            wave_number: waveNumber,
            plant_food: pfWaves.includes(waveNumber) ? 1 : 0,
            objclass: "SpawnZombiesFromGroundSpawnerProps",
            column_start: ld.underground_columns_start,
            column_end: ld.underground_columns_end,
            zombies: []
        };

        const prohibitedZombies = ['carnie_cannon', '_flag', '_cannon'];
        let availableZombies = ld.zombies.filter(zombie => {
            return !prohibitedZombies.some(prohibited =>
                zombie.includes(prohibited) || zombie.toLowerCase().includes(prohibited.toLowerCase())
            );
        });
        if (availableZombies.length === 0) availableZombies = [...ld.zombies];

        const gen = this.generator;
        const weights = availableZombies.map(z => gen.getZombieWeight(z));

        for (let i = 0; i < zombieCount; i++) {
            let zombieType;
            if (Math.random() < 0.6 && availableZombies.length > 0) {
                const strongZombies = availableZombies.filter(z => zombieThreats[z] > 1.2);
                if (strongZombies.length > 0) {
                    const adjustedWeights = strongZombies.map(z => weights[availableZombies.indexOf(z)]);
                    zombieType = gen.weightedRandomChoice(strongZombies, adjustedWeights);
                } else {
                    zombieType = gen.weightedRandomChoice(availableZombies, weights);
                }
            } else if (availableZombies.length > 0) {
                zombieType = gen.weightedRandomChoice(availableZombies, weights);
            } else {
                zombieType = ld.zombies[Math.floor(Math.random() * ld.zombies.length)];
            }
            waveData.zombies.push({
                row: Math.floor(Math.random() * 5).toString(),
                Type: `RTID(${zombieType}@ZombieTypes)`
            });
        }
        return waveData;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_underground_zombies;
    }
}
