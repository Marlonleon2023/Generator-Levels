import { BaseMechanic } from './BaseMechanic.js';

export class LowTideMechanic extends BaseMechanic {
    constructor(generator) {
        super(generator, {
            id: 'lowtide',
            displayName: 'Marea Baja'
        });
    }

    onInit() {
        const ld = this.generator.levelData;
        if (ld.use_lowtide === undefined) ld.use_lowtide = false;
        if (!ld.lowtide_waves) ld.lowtide_waves = [];
        if (ld.lowtide_column_start === undefined) ld.lowtide_column_start = undefined;
        if (ld.lowtide_column_end === undefined) ld.lowtide_column_end = undefined;
        if (ld.lowtide_group_size === undefined) ld.lowtide_group_size = 1;
        if (ld.lowtide_time_before === undefined) ld.lowtide_time_before = "0.5";
        if (ld.lowtide_time_between === undefined) ld.lowtide_time_between = "0.25";
        if (ld.lowtide_zombie_count === undefined) ld.lowtide_zombie_count = 3;
        if (ld.lowtide_zombie_name === undefined) ld.lowtide_zombie_name = "";
        if (ld.lowtide_start_wave === undefined) ld.lowtide_start_wave = 1;
        if (ld.lowtide_event_count === undefined) ld.lowtide_event_count = 3;
        if (ld.lowtide_interval === undefined) ld.lowtide_interval = 3;
        this.syncEnabled();
    }

    updateWaveList() {
        const ld = this.generator.levelData;
        const waves = this.calculateWaves('lowtideStartWave', 'lowtideEventCount', 'lowtideInterval', 'lowtideWaveSummary');
        ld.lowtide_waves = waves;
    }

    setupUI() {
        const checkbox = document.getElementById('useLowtide');
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.generator.levelData.use_lowtide = e.target.checked;
            this.enabled = e.target.checked;
            this.updateControls();
            this.generator.markTabAsChanged('basic');
        });

        ['lowtideStartWave', 'lowtideEventCount', 'lowtideInterval', 'lowtideGroupSize',
          'lowtideTimeBefore', 'lowtideTimeBetween', 'lowtideZombieCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateWaveList(); this.generator.markTabAsChanged('basic'); });
        });

        const selectBtn = document.getElementById('selectLowtideZombieBtn');
        if (selectBtn) selectBtn.addEventListener('click', () => this.openZombieSelectorModal());

        const clearBtn = document.getElementById('clearLowtideZombieBtn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearZombieSelection());

        const searchInput = document.getElementById('lowtideZombieSearch');
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterLowtideZombies(e.target.value));

        const acceptBtn = document.getElementById('lowtideZombieModalAccept');
        if (acceptBtn) acceptBtn.addEventListener('click', () => this.confirmZombieSelection());

        const closeBtns = ['lowtideZombieModalClose', 'lowtideZombieModalCancel'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => this.closeZombieModal());
        });

        const overlay = document.getElementById('lowtideZombieModalOverlay');
        if (overlay) overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeZombieModal();
        });
    }

    openZombieSelectorModal() {
        const overlay = document.getElementById('lowtideZombieModalOverlay');
        if (!overlay) return;

        this.selectedLowtideZombie = this.generator.levelData.lowtide_zombie_name || null;
        this.renderLowtideZombieGrid();

        const searchInput = document.getElementById('lowtideZombieSearch');
        if (searchInput) searchInput.value = '';

        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeZombieModal() {
        const overlay = document.getElementById('lowtideZombieModalOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    renderLowtideZombieGrid() {
        const grid = document.getElementById('lowtideZombieGrid');
        if (!grid) return;

        const searchTerm = (document.getElementById('lowtideZombieSearch')?.value || '').toLowerCase();

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

        zombies.sort();

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
            const isSelected = this.selectedLowtideZombie === zombieId;

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
                this.selectedLowtideZombie = zombieId;
                document.querySelectorAll('#lowtideZombieGrid .zombie-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            col.appendChild(card);
            row.appendChild(col);
        });

        grid.appendChild(row);
    }

    filterLowtideZombies() {
        this.renderLowtideZombieGrid();
    }

    confirmZombieSelection() {
        if (this.selectedLowtideZombie) {
            this.generator.levelData.lowtide_zombie_name = this.selectedLowtideZombie;
            const input = document.getElementById('lowtideZombieName');
            if (input) {
                const displayName = this.selectedLowtideZombie.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                input.value = displayName;
                input.dataset.zombieId = this.selectedLowtideZombie;
            }
            this.generator.markTabAsChanged('basic');
        }
        this.closeZombieModal();
    }

    clearZombieSelection() {
        this.generator.levelData.lowtide_zombie_name = '';
        const input = document.getElementById('lowtideZombieName');
        if (input) {
            input.value = '';
            delete input.dataset.zombieId;
        }
        this.generator.markTabAsChanged('basic');
    }

    renderColumnGrid() {
        const ld = this.generator.levelData;
        const enabled = ld.use_lowtide;
        const onColumnClick = (col) => {
            if (ld.lowtide_column_start === undefined || ld.lowtide_column_end === undefined) {
                ld.lowtide_column_start = col;
                ld.lowtide_column_end = col;
            } else if (col < ld.lowtide_column_start) {
                ld.lowtide_column_start = col;
            } else if (col > ld.lowtide_column_end) {
                ld.lowtide_column_end = col;
            } else if (col === ld.lowtide_column_start && col < ld.lowtide_column_end) {
                ld.lowtide_column_start = col + 1;
            } else if (col === ld.lowtide_column_end && col > ld.lowtide_column_start) {
                ld.lowtide_column_end = col - 1;
            } else {
                ld.lowtide_column_start = col;
                ld.lowtide_column_end = col;
            }
            this.renderColumnGrid();
            this.generator.markTabAsChanged('basic');
        };
        super.renderColumnGrid('lowtideColumnGrid', ld.lowtide_column_start, ld.lowtide_column_end, onColumnClick, !enabled);
    }

    updateControls() {
        const enabled = this.generator.levelData.use_lowtide;
        this.enabled = enabled;

        const checkbox = document.getElementById('useLowtide');
        if (checkbox) checkbox.checked = enabled;

        const config = document.getElementById('lowtideConfig');
        if (!config) return;

        const inputs = config.querySelectorAll('input, select');
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
        data.use_lowtide = this.generator.levelData.use_lowtide;
        data.lowtide_col_start = this.generator.levelData.lowtide_column_start;
        data.lowtide_col_end = this.generator.levelData.lowtide_column_end;
        data.lowtide_start_wave = this.getInt('lowtideStartWave', 1);
        data.lowtide_event_count = this.getInt('lowtideEventCount', 3);
        data.lowtide_interval = this.getInt('lowtideInterval', 3);
        data.lowtide_group_size = this.getInt('lowtideGroupSize', 1);
        data.lowtide_time_before = this.generator.levelData.lowtide_time_before;
        data.lowtide_time_between = this.generator.levelData.lowtide_time_between;
        data.lowtide_zombie_count = this.getInt('lowtideZombieCount', 3);
        data.lowtide_zombie_name = this.generator.levelData.lowtide_zombie_name;
    }

    applyData(data) {
        const useLowtide = data.use_lowtide ?? this.generator.levelData.use_lowtide;
        this.safeAssign('useLowtide', useLowtide, 'checked');
        this.generator.levelData.use_lowtide = useLowtide;

        if (data.lowtide_col_start !== undefined) this.generator.levelData.lowtide_column_start = data.lowtide_col_start;
        if (data.lowtide_col_end !== undefined) this.generator.levelData.lowtide_column_end = data.lowtide_col_end;
        if (data.lowtide_start_wave !== undefined) this.safeAssign('lowtideStartWave', data.lowtide_start_wave.toString());
        if (data.lowtide_event_count !== undefined) this.safeAssign('lowtideEventCount', data.lowtide_event_count.toString());
        if (data.lowtide_interval !== undefined) this.safeAssign('lowtideInterval', data.lowtide_interval.toString());
        if (data.lowtide_group_size !== undefined) this.safeAssign('lowtideGroupSize', data.lowtide_group_size.toString());
        if (data.lowtide_time_before !== undefined) {
            this.generator.levelData.lowtide_time_before = data.lowtide_time_before;
            this.safeAssign('lowtideTimeBefore', data.lowtide_time_before);
        }
        if (data.lowtide_time_between !== undefined) {
            this.generator.levelData.lowtide_time_between = data.lowtide_time_between;
            this.safeAssign('lowtideTimeBetween', data.lowtide_time_between);
        }
        if (data.lowtide_zombie_count !== undefined) this.safeAssign('lowtideZombieCount', data.lowtide_zombie_count.toString());
        if (data.lowtide_zombie_name !== undefined) {
            this.generator.levelData.lowtide_zombie_name = data.lowtide_zombie_name;
            const zombieInput = document.getElementById('lowtideZombieName');
            if (zombieInput && data.lowtide_zombie_name) {
                const displayName = data.lowtide_zombie_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                zombieInput.value = displayName;
                zombieInput.dataset.zombieId = data.lowtide_zombie_name;
            } else if (zombieInput) {
                zombieInput.value = '';
                delete zombieInput.dataset.zombieId;
            }
        }

        this.updateControls();
    }

    resetData() {
        const ld = this.generator.levelData;
        ld.use_lowtide = false;
        ld.lowtide_waves = [];
        ld.lowtide_column_start = undefined;
        ld.lowtide_column_end = undefined;
        ld.lowtide_group_size = 1;
        ld.lowtide_time_before = "0.5";
        ld.lowtide_time_between = "0.25";
        ld.lowtide_zombie_count = 3;
        ld.lowtide_zombie_name = "";
        ld.lowtide_start_wave = 1;
        ld.lowtide_event_count = 3;
        ld.lowtide_interval = 3;
    }

    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) {
        const ld = this.generator.levelData;
        if (!ld.use_lowtide) return waveData;
        if (!ld.lowtide_waves || !ld.lowtide_waves.includes(waveNumber)) return waveData;

        const eventIndex = this.countLowtideEventsOnWave(waveData);

        const colStart = ld.lowtide_column_start !== undefined ? ld.lowtide_column_start : 4;
        const colEnd = ld.lowtide_column_end !== undefined ? ld.lowtide_column_end : 7;

        if (!waveData.events) waveData.events = [];
        waveData.events.push({
            alias: `Wave${waveNumber}LowTideEvent${eventIndex}`,
            objclass: "BeachStageEventZombieSpawnerProps",
            objdata: {
                "ColumnEnd": colEnd,
                "ColumnStart": colStart,
                "GroupSize": ld.lowtide_group_size,
                "TimeBeforeFullSpawn": ld.lowtide_time_before,
                "TimeBetweenGroups": ld.lowtide_time_between,
                "WaveStartMessage": "[WARNING_LOW_TIDE]",
                "ZombieCount": ld.lowtide_zombie_count,
                "ZombieName": ld.lowtide_zombie_name
            }
        });

        return waveData;
    }

    countLowtideEventsOnWave(waveData) {
        if (!waveData.events) return 0;
        return waveData.events.filter(e => e.objclass === "BeachStageEventZombieSpawnerProps").length;
    }

    syncEnabled() {
        this.enabled = !!this.generator.levelData.use_lowtide;
    }
}
