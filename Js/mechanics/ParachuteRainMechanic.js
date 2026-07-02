import { BaseMechanic } from './BaseMechanic.js';

export class ParachuteRainMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'parachuterain',
            displayName: 'Lluvia de Paracaidistas'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_parachute_rain === undefined) ld.use_parachute_rain = false;
        if (!ld.parachute_waves) ld.parachute_waves = [];
        if (ld.parachute_column_start === undefined) ld.parachute_column_start = undefined;
        if (ld.parachute_column_end === undefined) ld.parachute_column_end = undefined;
        if (ld.parachute_group_size === undefined) ld.parachute_group_size = 2;
        if (ld.parachute_spider_count === undefined) ld.parachute_spider_count = 4;
        if (ld.parachute_zombie_name === undefined) ld.parachute_zombie_name = '';
        if (ld.parachute_time_before_spawn === undefined) ld.parachute_time_before_spawn = 1;
        if (ld.parachute_time_between_groups === undefined) ld.parachute_time_between_groups = 0.2;
        if (ld.parachute_zombie_fall_time === undefined) ld.parachute_zombie_fall_time = 1.5;
        if (ld.parachute_wave_message === undefined) ld.parachute_wave_message = '[WARNING_PARACHUTERAIN]';

        this.syncEnabled();
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('parachuteStartWave', 'parachuteEventCount', 'parachuteInterval', 'parachuteWaveSummary');
        ld.parachute_waves = waves;
    }

    setupUI() {
        const checkbox = document.getElementById('useParachuteRain');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_parachute_rain = e.target.checked;
            this.enabled = e.target.checked;
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        ['parachuteStartWave', 'parachuteEventCount', 'parachuteInterval', 'parachuteGroupSize', 'parachuteSpiderCount', 'parachuteTimeBeforeSpawn', 'parachuteTimeBetweenGroups', 'parachuteZombieFallTime'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });

        const messageEl = document.getElementById('parachuteWaveMessage');
        if (messageEl) messageEl.addEventListener('input', () => this.generator.markTabAsChanged('basic'));

        const selectBtn = document.getElementById('selectParachuteZombieBtn');
        if (selectBtn) selectBtn.addEventListener('click', () => this.openZombieSelectorModal());

        const clearBtn = document.getElementById('clearParachuteZombieBtn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearZombieSelection());

        const searchInput = document.getElementById('parachuteZombieSearch');
        if (searchInput) searchInput.addEventListener('input', (e) => this.renderZombieGrid(e.target.value));

        const acceptBtn = document.getElementById('parachuteZombieModalAccept');
        if (acceptBtn) acceptBtn.addEventListener('click', () => this.confirmZombieSelection());

        const closeBtns = ['parachuteZombieModalClose', 'parachuteZombieModalCancel'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => this.closeZombieModal());
        });

        const overlay = document.getElementById('parachuteZombieModalOverlay');
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeZombieModal();
        });
    }

    openZombieSelectorModal() {
        const overlay = document.getElementById('parachuteZombieModalOverlay');
        if (!overlay) return;

        this.selectedParachuteZombie = this.generator.levelData.parachute_zombie_name || null;
        this.renderZombieGrid();

        const searchInput = document.getElementById('parachuteZombieSearch');
        if (searchInput) searchInput.value = '';

        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeZombieModal() {
        const overlay = document.getElementById('parachuteZombieModalOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    renderZombieGrid(searchTerm) {
        const grid = document.getElementById('parachuteZombieGrid');
        if (!grid) return;

        searchTerm = (searchTerm || document.getElementById('parachuteZombieSearch')?.value || '').toLowerCase();

        let zombies = [];
        if (this.generator.zombieData && this.generator.zombieData.length > 0) {
            zombies = [...new Set(this.generator.zombieData.map(z => z.alias_type))];
        } else if (this.generator.zombieDataLoader && this.generator.zombieDataLoader.getAllZombies) {
            const allZombies = this.generator.zombieDataLoader.getAllZombies();
            zombies = [...new Set(allZombies.map(z => z.alias_type))];
        } else if (this.generator.levelData.zombies && this.generator.levelData.zombies.length > 0) {
            zombies = [...this.generator.levelData.zombies];
        }

        if (searchTerm) {
            zombies = zombies.filter(name => name.toLowerCase().includes(searchTerm));
        }

        const pilotZombie = 'lostcity_lostpilot';
        zombies.sort((a, b) => {
            if (a === pilotZombie) return -1;
            if (b === pilotZombie) return 1;
            const aPilot = a.includes('pilot');
            const bPilot = b.includes('pilot');
            if (aPilot && !bPilot) return -1;
            if (!aPilot && bPilot) return 1;
            return a.localeCompare(b);
        });

        grid.innerHTML = '';

        if (zombies.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted py-4"><i class="bi bi-emoji-dizzy display-4"></i><p class="mt-2">No zombies encontrados</p></div>';
            return;
        }

        const row = document.createElement('div');
        row.className = 'row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2';

        zombies.forEach(zombieId => {
            const col = document.createElement('div');
            col.className = 'col';

            const displayName = zombieId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const isSelected = this.selectedParachuteZombie === zombieId;

            const card = document.createElement('div');
            card.className = `zombie-card ${isSelected ? 'selected' : ''}`;
            card.dataset.zombie = zombieId;

            card.innerHTML = `
                <div class="selection-indicator">
                    <i class="bi bi-check"></i>
                </div>
                <div class="zombie-image-container" style="width:100%;max-width:100%;height:100px;">
                    <img src="Assets/Zombies/${zombieId}.webp"
                         alt="${displayName}"
                         class="zombie-image"
                         onerror="this.src='Assets/Zombies/error.webp';this.style.filter='grayscale(20%) opacity(90%)'">
                </div>
                <div class="zombie-name">${displayName}</div>
            `;

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedParachuteZombie = zombieId;
                document.querySelectorAll('#parachuteZombieGrid .zombie-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            col.appendChild(card);
            row.appendChild(col);
        });

        grid.appendChild(row);
    }

    confirmZombieSelection() {
        if (this.selectedParachuteZombie) {
            this.generator.levelData.parachute_zombie_name = this.selectedParachuteZombie;
            const input = document.getElementById('parachuteZombieName');
            if (input) {
                const displayName = this.selectedParachuteZombie.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                input.value = displayName;
                input.dataset.zombieId = this.selectedParachuteZombie;
            }
            this.generator.markTabAsChanged('basic');
        }
        this.closeZombieModal();
    }

    clearZombieSelection() {
        this.generator.levelData.parachute_zombie_name = '';
        const input = document.getElementById('parachuteZombieName');
        if (input) {
            input.value = '';
            delete input.dataset.zombieId;
        }
        this.generator.markTabAsChanged('basic');
    }

    renderColumnGrid() {
        const ld = this.generator.levelData;
        const enabled = ld.use_parachute_rain;
        const onColumnClick = (col) => {
            if (ld.parachute_column_start === undefined || ld.parachute_column_end === undefined) {
                ld.parachute_column_start = col;
                ld.parachute_column_end = col;
            } else if (col < ld.parachute_column_start) {
                ld.parachute_column_start = col;
            } else if (col > ld.parachute_column_end) {
                ld.parachute_column_end = col;
            } else if (col === ld.parachute_column_start && col < ld.parachute_column_end) {
                ld.parachute_column_start = col + 1;
            } else if (col === ld.parachute_column_end && col > ld.parachute_column_start) {
                ld.parachute_column_end = col - 1;
            } else {
                ld.parachute_column_start = col;
                ld.parachute_column_end = col;
            }
            this.renderColumnGrid();
            this.generator.markTabAsChanged('basic');
        };
        super.renderColumnGrid('parachuteColumnGrid', ld.parachute_column_start, ld.parachute_column_end, onColumnClick, !enabled);
    }

    updateControls() {
        const enabled = this.generator.levelData.use_parachute_rain;
        this.enabled = enabled;

        const checkbox = document.getElementById('useParachuteRain');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('parachuteConfig');
        if (!config) return;

        const inputs = config.querySelectorAll('input, select, textarea');
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
        data.use_parachute_rain = this.generator.levelData.use_parachute_rain;
        data.parachute_col_start = this.generator.levelData.parachute_column_start;
        data.parachute_col_end = this.generator.levelData.parachute_column_end;
        data.parachute_start_wave = this.getInt('parachuteStartWave', 1);
        data.parachute_event_count = this.getInt('parachuteEventCount', 3);
        data.parachute_interval = this.getInt('parachuteInterval', 3);
        data.parachute_group_size = this.getInt('parachuteGroupSize', 2);
        data.parachute_spider_count = this.getInt('parachuteSpiderCount', 4);
        data.parachute_zombie_name = this.generator.levelData.parachute_zombie_name;
        data.parachute_time_before_spawn = this.getFloat('parachuteTimeBeforeSpawn', 1);
        data.parachute_time_between_groups = this.getFloat('parachuteTimeBetweenGroups', 0.2);
        data.parachute_zombie_fall_time = this.getFloat('parachuteZombieFallTime', 1.5);
        data.parachute_wave_message = this.getStr('parachuteWaveMessage', '');
    }

    getFloat(id, fallback = 0) {
        const el = document.getElementById(id);
        return el ? (parseFloat(el.value) || fallback) : fallback;
    }

    getStr(id, fallback = '') {
        const el = document.getElementById(id);
        return el ? (el.value || fallback) : fallback;
    }

    applyData(data) {
        const useIt = data.use_parachute_rain ?? this.generator.levelData.use_parachute_rain;
        this.safeAssign('useParachuteRain', useIt, 'checked');
        this.generator.levelData.use_parachute_rain = useIt;

        if (data.parachute_col_start !== undefined) this.generator.levelData.parachute_column_start = data.parachute_col_start;
        if (data.parachute_col_end !== undefined) this.generator.levelData.parachute_column_end = data.parachute_col_end;
        if (data.parachute_start_wave !== undefined) this.safeAssign('parachuteStartWave', data.parachute_start_wave.toString());
        if (data.parachute_event_count !== undefined) this.safeAssign('parachuteEventCount', data.parachute_event_count.toString());
        if (data.parachute_interval !== undefined) this.safeAssign('parachuteInterval', data.parachute_interval.toString());
        if (data.parachute_group_size !== undefined) this.safeAssign('parachuteGroupSize', data.parachute_group_size.toString());
        if (data.parachute_spider_count !== undefined) this.safeAssign('parachuteSpiderCount', data.parachute_spider_count.toString());
        if (data.parachute_zombie_name !== undefined) {
            this.generator.levelData.parachute_zombie_name = data.parachute_zombie_name;
            const zombieInput = document.getElementById('parachuteZombieName');
            if (zombieInput && data.parachute_zombie_name) {
                const displayName = data.parachute_zombie_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                zombieInput.value = displayName;
                zombieInput.dataset.zombieId = data.parachute_zombie_name;
            } else if (zombieInput) {
                zombieInput.value = '';
                delete zombieInput.dataset.zombieId;
            }
        }
        if (data.parachute_time_before_spawn !== undefined) this.safeAssign('parachuteTimeBeforeSpawn', data.parachute_time_before_spawn.toString());
        if (data.parachute_time_between_groups !== undefined) this.safeAssign('parachuteTimeBetweenGroups', data.parachute_time_between_groups.toString());
        if (data.parachute_zombie_fall_time !== undefined) this.safeAssign('parachuteZombieFallTime', data.parachute_zombie_fall_time.toString());
        if (data.parachute_wave_message !== undefined) {
            this.generator.levelData.parachute_wave_message = data.parachute_wave_message;
            this.safeAssign('parachuteWaveMessage', data.parachute_wave_message);
        }

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_parachute_rain = false;
        ld.parachute_waves = [];
        ld.parachute_column_start = undefined;
        ld.parachute_column_end = undefined;
        ld.parachute_group_size = 2;
        ld.parachute_spider_count = 4;
        ld.parachute_zombie_name = '';
        ld.parachute_time_before_spawn = 1;
        ld.parachute_time_between_groups = 0.2;
        ld.parachute_zombie_fall_time = 1.5;
        ld.parachute_wave_message = '[WARNING_PARACHUTERAIN]';
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        if (!ld.use_parachute_rain) return waveData;
        if (!ld.parachute_waves || !ld.parachute_waves.includes(waveNumber)) return waveData;

        const eventIndex = this.countParachuteEventsOnWave(waveData);

        const colStart = ld.parachute_column_start !== undefined ? ld.parachute_column_start : 4;
        const colEnd = ld.parachute_column_end !== undefined ? ld.parachute_column_end : 7;

        if (!waveData.events) waveData.events = [];
        const objdata = {
            "ColumnEnd": colEnd,
            "ColumnStart": colStart,
            "GroupSize": (ld.parachute_group_size || 2).toString(),
            "SpiderCount": (ld.parachute_spider_count || 4).toString(),
            "SpiderZombieName": ld.parachute_zombie_name || "",
            "TimeBeforeFullSpawn": (ld.parachute_time_before_spawn || 1).toString(),
            "TimeBetweenGroups": (ld.parachute_time_between_groups || 0.2).toString(),
            "ZombieFallTime": (ld.parachute_zombie_fall_time || 1.5).toString(),
            "WaveStartMessage": ld.parachute_wave_message || '[WARNING_PARACHUTERAIN]'
        };

        waveData.events.push({
            alias: `Wave${waveNumber}ParachuteRainEvent${eventIndex}`,
            objclass: "ParachuteRainZombieSpawnerProps",
            objdata: objdata
        });

        return waveData;
    }

    countParachuteEventsOnWave(waveData) {
        if (!waveData.events) return 0;
        return waveData.events.filter(e => e.objclass === "ParachuteRainZombieSpawnerProps").length;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_parachute_rain;
    }
}
