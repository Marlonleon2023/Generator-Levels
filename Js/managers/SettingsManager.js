// ============================================
// SettingsManager - Configuration import/export/reset
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

export function generateLevel() {
    this.levelGenerated = true;
    this.updatePreview();
    this.updateStats();
    this.showMessage('Nivel Generado', 'El nivel ha sido generado correctamente.', 'success');
}

export async function saveLevel() {
    if (!this.levelData.stage || this.levelData.stage === "NoneStage" || this.levelData.stage === "None") {
        this.showMessage('Error', 'Selecciona un escenario antes de descargar.', 'error');
        return;
    }

    if (!this.levelGenerated) {
        this.showMessage('Error', 'Debes generar el nivel antes de descargar (botón "Generar Nivel" en la pestaña Vista Previa).', 'error');
        return;
    }

    this.updatePreview();

    const defaultName = "MODERN1";
    const format = document.getElementById('formatSelect').value || 'json';

    const fileName = defaultName || 'MODERN1';

    if (!fileName) return;

    const cleanFileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
    let finalFileName, blob, mimeType;

    const json = this.generateJson();

    if (format === 'rton') {
        const converter = new JSONARTON();
        converter.set(JSON.stringify(json));
        const rtonBinary = converter.get('binary');

        finalFileName = cleanFileName.endsWith('.rton') ? cleanFileName : `${cleanFileName}.rton`;
        blob = rtonBinary;
        mimeType = 'application/octet-stream';
    } else {
        const jsonString = JSON.stringify(json, null, 2);
        finalFileName = cleanFileName.endsWith('.json') ? cleanFileName : `${cleanFileName}.json`;
        blob = new Blob([jsonString], { type: 'application/json' });
        mimeType = 'application/json';
    }

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function loadConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const config = JSON.parse(text);

            const levelDef = config.objects?.find(obj => obj.objclass === "LevelDefinition");
            if (levelDef) {
                const objdata = levelDef.objdata || {};

                document.getElementById('levelName').value = objdata.Name || "";
                document.getElementById('levelNumber').value = objdata.LevelNumber || 1;
                document.getElementById('startingSun').value = objdata.StartingSun || 50;
                document.getElementById('zombieLevel').value = objdata.ZombieLevel || 1;
                document.getElementById('gridLevel').value = objdata.GridItemLevel || 1;

                if (objdata.FixedPlantLevel !== undefined) {
                    this.levelData.enable_fixed_plant_level = true;
                    this.levelData.fixed_plant_level = objdata.FixedPlantLevel;
                } else {
                    this.levelData.enable_fixed_plant_level = false;
                    this.levelData.fixed_plant_level = 0;
                }
                document.getElementById('enableFixedPlantLevel').checked = this.levelData.enable_fixed_plant_level;
                document.getElementById('fixedPlantLevel').value = this.levelData.fixed_plant_level;
                this.updateFixedPlantLevelControl();

                const stage = objdata.StageModule || "";
                if (stage.includes("Egypt")) {
                    this.selectWorld("Egipto");
                } else if (stage.includes("Pirate")) {
                    this.selectWorld("Pirata");
                } else if (stage.includes("Modern")) {
                    this.selectWorld("Moderno");
                }

                this.updateStages();

                const modules = objdata.Modules || [];
                const hasSunDropper = modules.some(module =>
                    typeof module === 'string' && module.includes("DefaultSunDropper")
                );

                this.levelData.enable_sun_dropper = hasSunDropper;
                document.getElementById('enableSunDropper').checked = this.levelData.enable_sun_dropper;

                const seedBank = config.objects?.find(obj =>
                    obj.aliases?.[0] === "SeedBank"
                );

                if (seedBank && seedBank.objdata?.OverrideSeedSlotsCount !== undefined) {
                    this.levelData.enable_seed_slots = true;
                    this.levelData.seed_slots_count = seedBank.objdata.OverrideSeedSlotsCount;
                } else {
                    this.levelData.enable_seed_slots = false;
                    this.levelData.seed_slots_count = 8;
                }

                document.getElementById('enableSeedSlots').checked = this.levelData.enable_seed_slots;
                document.getElementById('seedSlotsCount').value = this.levelData.seed_slots_count;
                this.updateSeedSlotsControl();

                const challengeModule = config.objects?.find(obj =>
                    obj.objclass === "StarChallengeModuleProperties"
                );

                if (challengeModule) {
                    this.challengesData.enabled = true;

                    config.objects?.forEach(obj => {
                        if (obj.objclass.includes("StarChallenge") && obj.aliases?.[0]) {
                            const challengeId = obj.aliases[0];
                            const challenge = this.challengesData.challenges.find(c => c.id === challengeId);

                            if (challenge) {
                                challenge.enabled = true;

                                const objdata = obj.objdata || {};
                                if (challengeId === 'KillZombies') {
                                    challenge.values.zombies = objdata.ZombiesToKill || 15;
                                    challenge.values.time = objdata.Time || 10;
                                } else if (objdata.TargetDistance !== undefined) {
                                    challenge.value = objdata.TargetDistance;
                                } else if (objdata.MaximumSun !== undefined) {
                                    challenge.value = objdata.MaximumSun;
                                } else if (objdata.TargetSun !== undefined) {
                                    challenge.value = objdata.TargetSun;
                                } else if (objdata.HoldoutSeconds !== undefined) {
                                    challenge.value = objdata.HoldoutSeconds;
                                } else if (objdata.MaximumPlantsLost !== undefined) {
                                    challenge.value = objdata.MaximumPlantsLost;
                                } else if (objdata.MaximumPlants !== undefined) {
                                    challenge.value = objdata.MaximumPlants;
                                } else if (objdata.TargetMowers !== undefined) {
                                    challenge.value = objdata.TargetMowers;
                                }
                            }
                        }
                    });
                }

                this.updateChallengesUI();
                this.showMessage('Configuración Cargada', 'Configuración cargada correctamente', 'success');
                this.updatePreview();

                ['basic', 'waves', 'challenges'].forEach(tabId => {
                    this.markTabAsChanged(tabId);
                    this.saveCurrentTab();
                });
            } else {
                this.showMessage('Error', 'No se encontró la configuración del nivel en el archivo', 'error');
            }
        } catch (error) {
            this.showMessage('Error', `No se pudo cargar el archivo: ${error.message}`, 'error');
        }
    };

    input.click();
}

export function copyJsonToClipboard() {
    const jsonText = document.getElementById('jsonPreview').textContent;
    navigator.clipboard.writeText(jsonText).then(() => {
        this.showMessage('Copiado', 'JSON copiado al portapapeles', 'success');
    }).catch(err => {
        this.showMessage('Error', 'No se pudo copiar al portapapeles: ' + err, 'error');
    });
}

export function resetAllSettings() {
    if (confirm('¿Estás seguro de que quieres restablecer todos los ajustes a los valores predeterminados?\n\nSe perderán todos los cambios no guardados.')) {
        this.levelData = {
            level_name: "Mi Nivel Personalizado",
            level_number: 1,
            world: "Egipto",
            stage: "None",
            visual_effect: "",
            enable_sun_dropper: true,
            enable_seed_slots: false,
            seed_slots_count: 8,
            enable_fixed_plant_level: false,
            fixed_plant_level: 0,
            mower_type: "ModernMowers",
            starting_sun: 50,
            zombie_level: 1,
            grid_level: 1,
            wave_count: 10,
            flag_wave_interval: 4,
            plant_food_waves: [3, 6, 9],
            zombies: [],
            waves: [],
            use_underground_zombies: false,
            underground_waves: [],
            underground_columns_start: 2,
            underground_columns_end: 4,
            spawn_col_start: 6,
            spawn_col_end: 9,
            wave_spending_points: 150,
            wave_spending_point_increment: 75,
            underground_max_zombies: 3,
            underground_min_zombies: 1,
            use_storm_zombies: false,
            storm_waves: [],
            storm_column_start: 2,
            storm_column_end: 5,
            storm_group_size: 3,
            storm_time_between_groups: 3,
            storm_min_zombies: 3,
            storm_max_zombies: 10,
            storm_type: "sandstorm"
        };

        this.challengesData = {
            enabled: false,
            challenges: [
                {
                    id: "ZombieDistance",
                    enabled: false,
                    type: "StarChallengeZombieDistanceProps",
                    value: 5.5
                },
                {
                    id: "SunUsed",
                    enabled: false,
                    type: "StarChallengeSunUsedProps",
                    value: 500
                },
                {
                    id: "SunProduced",
                    enabled: false,
                    type: "StarChallengeSunProducedProps",
                    value: 500
                },
                {
                    id: "SunHoldout",
                    enabled: false,
                    type: "StarChallengeSpendSunHoldoutProps",
                    value: 60
                },
                {
                    id: "KillZombies",
                    enabled: false,
                    type: "StarChallengeKillZombiesInTimeProps",
                    values: { zombies: 15, time: 10 }
                },
                {
                    id: "PlantsLost",
                    enabled: false,
                    type: "StarChallengePlantsLostProps",
                    value: 5
                },
                {
                    id: "SimultaneousPlants",
                    enabled: false,
                    type: "StarChallengeSimultaneousPlantsProps",
                    value: 15
                },
                {
                    id: "SaveMowers",
                    enabled: false,
                    type: "StarChallengeSaveMowersProps",
                    value: 3
                }
            ]
        };

        this.autoDetectOnZombieSelection = false;

        this.updateAllControls();
        if (this.mechanicManager) this.mechanicManager.resetAll();
        this.updateChallengesUI();
        this.updateSelectedZombiesDisplay();
        this.updatePreview();

        const tabIds = ['basic', 'waves', 'challenges', 'preview', 'stats'];
        tabIds.forEach(tabId => {
            localStorage.removeItem(`pvz_tab_${tabId}`);
            this.updateTabIndicator(tabId, false);
        });

        localStorage.removeItem('pvz_level_generator_config');

        this.levelGenerated = false;

        this.showMessage('Restablecido', 'Todos los ajustes han sido restablecidos a los valores predeterminados.', 'success');
    }
}

export function exportSettings() {
    this.saveCurrentTab();

    const settings = {
        levelData: this.levelData,
        challengesData: this.challengesData,
        autoDetectOnZombieSelection: this.autoDetectOnZombieSelection,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `pvz_generator_settings_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('Exportado', 'Configuración exportada correctamente', 'success');
}

export function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const settings = JSON.parse(text);

            if (settings.levelData) {
                this.levelData = { ...this.levelData, ...settings.levelData };
                this.updateAllControls();
                this.updateSelectedZombiesDisplay();

                if (settings.challengesData) {
                    this.challengesData = settings.challengesData;
                    this.updateChallengesUI();
                }

                if (settings.autoDetectOnZombieSelection !== undefined) {
                    this.autoDetectOnZombieSelection = settings.autoDetectOnZombieSelection;
                }

                this.updatePreview();

                localStorage.setItem('pvz_level_generator_config', JSON.stringify({
                    levelData: this.levelData,
                    challengesData: this.challengesData,
                    autoDetectOnZombieSelection: this.autoDetectOnZombieSelection,
                    timestamp: new Date().toISOString()
                }));

                ['basic', 'waves', 'challenges'].forEach(tabId => {
                    this.markTabAsChanged(tabId);
                    this.saveCurrentTab();
                });

                this.showMessage('Importado', 'Configuración importada correctamente', 'success');
            } else {
                this.showMessage('Error', 'El archivo no contiene configuración válida', 'error');
            }
        } catch (error) {
            this.showMessage('Error', `No se pudo importar el archivo: ${error.message}`, 'error');
        }
    };

    input.click();
}
