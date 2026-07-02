// ============================================
// JsonLevelBuilder - JSON level data generation
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

export function generateModules() {
    if (this.levelData.enable_zomboss_battle) {
        const zbModules = [
            "RTID(ZombossIntro@LevelModules)",
            "RTID(ConveyorBelt@CurrentLevel)",
            "RTID(ZombossBattle@CurrentLevel)",
            "RTID(DefaultZombieWinCondition@LevelModules)",
            "RTID(NewWaves@CurrentLevel)"
        ];
        if (this.levelData.enable_pirate_planks) {
            zbModules.splice(2, 0, "RTID(PiratePlanks@CurrentLevel)");
        }
        return zbModules;
    }

    const modules = [
        "RTID(ZombiesDeadWinCon@LevelModules)",
        "RTID(StandardIntro@LevelModules)",
        "RTID(DefaultZombieWinCondition@LevelModules)"
    ];

    if (this.levelData.enable_sun_dropper) {
        modules.splice(2, 0, "RTID(DefaultSunDropper@LevelModules)");
    }

    if (this.levelData.seed_selection_method === 'conveyor') {
        modules.push("RTID(ConveyorBelt@CurrentLevel)");
    } else {
        modules.push("RTID(SeedBank@CurrentLevel)");
    }

    if (this.zombieResistanceManager && this.zombieResistanceManager.hasActiveFamilies()) {
        modules.push("RTID(ZombieResistances@CurrentLevel)");
    }

    if (this.levelData.enable_pirate_planks) {
        modules.push("RTID(PiratePlanks@CurrentLevel)");
    }

    if (window.boardManager) {
        const boardModules = window.boardManager.getAllModules();
        const placementOrder = [
            "MountingPlants",
            "MountingZombies",
            "MountingGravestones",
            "MountingSliders",
            "MountingPotions",
            "MountingOthers",
            "MountingMolds",
            "MountingRails"
        ];
        placementOrder.forEach(moduleName => {
            const moduleExists = boardModules.some(module =>
                module.aliases?.[0] === moduleName
            );
            if (moduleExists) {
                modules.push(`RTID(${moduleName}@CurrentLevel)`);
            }
        });
    }

    const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
    const hasProtectedPlants = window.boardManager?.boardModules?.protectedPlants?.length > 0;
    const hasRegularChallenges = this.challengesData.enabled && enabledChallenges.length > 0;

    if (hasProtectedPlants || hasRegularChallenges) {
        modules.push("RTID(ChallengeModule@CurrentLevel)");
    }

    modules.push("RTID(NewWaves@CurrentLevel)");

    if (this.levelData.use_tide) {
        modules.push("RTID(Tide@CurrentLevel)");
    }

    if (this.levelData.visual_effect) {
        modules.push(this.levelData.visual_effect);
    }

    modules.push(`RTID(${this.levelData.mower_type}@LevelModules)`);

    return modules;
}

export function generateChallengeObjects() {
    const objects = [];
    const hasProtectedPlants = window.boardManager?.boardModules?.protectedPlants?.length > 0;
    const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
    const hasRegularChallenges = this.challengesData.enabled && enabledChallenges.length > 0;
    let allChallenges = [];

    if (hasProtectedPlants) {
        allChallenges.push("RTID(ProtectThePlant@CurrentLevel)");
        objects.push({
            "aliases": ["ProtectThePlant"],
            "objclass": "ProtectThePlantChallengeProperties",
            "objdata": {
                "MustProtectCount": window.boardManager.boardModules.protectedPlants.length,
                "Plants": window.boardManager.boardModules.protectedPlants
            }
        });
    }

    if (hasRegularChallenges) {
        enabledChallenges.forEach(challenge => {
            allChallenges.push(`RTID(${challenge.id}@CurrentLevel)`);
            let objdata = {};
            switch (challenge.id) {
                case 'ZombieDistance':
                    objdata = { "TargetDistance": challenge.value };
                    break;
                case 'SunUsed':
                    objdata = { "MaximumSun": challenge.value };
                    break;
                case 'SunProduced':
                    objdata = { "TargetSun": challenge.value };
                    break;
                case 'SunHoldout':
                    objdata = { "HoldoutSeconds": challenge.value };
                    break;
                case 'KillZombies':
                    objdata = {
                        "ZombiesToKill": challenge.values.zombies,
                        "Time": challenge.values.time
                    };
                    break;
                case 'PlantsLost':
                    objdata = { "MaximumPlantsLost": challenge.value };
                    break;
                case 'SimultaneousPlants':
                    objdata = { "MaximumPlants": challenge.value };
                    break;
                case 'SaveMowers':
                    objdata = { "TargetMowers": challenge.value };
                    break;
            }
            objects.push({
                "aliases": [challenge.id],
                "objclass": challenge.type,
                "objdata": objdata
            });
        });
    }

    if (allChallenges.length > 0) {
        objects.push({
            "aliases": ["ChallengeModule"],
            "objclass": "StarChallengeModuleProperties",
            "objdata": {
                "Challenges": [allChallenges],
                "ChallengesAlwaysAvailable": true
            }
        });
    }

    return objects;
}

export function generateWaveObjects() {
    const objects = [];

    if (this.levelData.enable_zomboss_battle) {
        if (this.conveyorManager && typeof this.conveyorManager.getConveyorModule === 'function') {
            const conveyorModule = this.conveyorManager.getConveyorModule();
            if (conveyorModule) {
                objects.push(conveyorModule);
            }
        }
        objects.push({
            "aliases": ["ZombossBattle"],
            "objclass": "ZombossBattleModuleProperties",
            "objdata": {
                "ReservedColumnCount": 2,
                "ZombossDeathColumn": 5,
                "ZombossDeathRow": 3,
                "ZombossMechType": this.levelData.zomboss_mech_type || "zombossmech_pirate2",
                "ZombossSpawnGridPosition": {
                    "mX": 6,
                    "mY": 3
                }
            }
        });
    } else if (this.levelData.seed_selection_method === 'conveyor') {
        if (this.conveyorManager && typeof this.conveyorManager.getConveyorModule === 'function') {
            const conveyorModule = this.conveyorManager.getConveyorModule();
            if (conveyorModule) {
                objects.push(conveyorModule);
            }
        }
    } else {
        objects.push({
            "aliases": ["SeedBank"],
            "objclass": "SeedBankProperties",
            "objdata": {
                "SelectionMethod": this.levelData.seed_selection_method || "chooser",
                ...(this.levelData.enable_seed_slots && {
                    "OverrideSeedSlotsCount": this.levelData.seed_slots_count
                }),
                ...(this.plantManager &&
                    this.plantManager.selectedPlants.length > 0 && {
                    "PresetPlantList": this.plantManager.getSelectedPlantsForJson()
                }),
                ...(this.plantManager &&
                    this.plantManager.excludedPlants.length > 0 && {
                    "PlantExcludeList": this.plantManager.getExcludedPlantsForJson()
                })
            }
        });
    }

    if (this.levelData.enable_pirate_planks) {
        objects.push({
            "aliases": ["PiratePlanks"],
            "objclass": "PiratePlankProperties",
            "objdata": {
                "PlankRows": this.levelData.pirate_plank_rows || [0, 1, 2, 3, 4]
            }
        });
    }

    if (this.levelData.use_tide) {
        objects.push({
            "aliases": ["Tide"],
            "objclass": "TideProperties",
            "objdata": {
                "StartingWaveLocation": this.levelData.tide_starting_wave_location || 7
            }
        });
    }

    const dynamicZombies = this.generateDynamicZombies();
    const isZomboss = this.levelData.enable_zomboss_battle;

    objects.push({
        "aliases": ["NewWaves"],
        "objclass": "WaveManagerModuleProperties",
        "objdata": isZomboss ? {
            "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)"
        } : {
            "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)",
            ...(dynamicZombies.length > 0 && { "DynamicZombies": dynamicZombies })
        }
    });

    objects.push({
        "aliases": ["WaveManagerProps"],
        "objclass": "WaveManagerProperties",
        "objdata": isZomboss ? {
            "Waves": []
        } : {
            "MaxNextWaveHealthPercentage": 0.28,
            "FlagWaveInterval": this.levelData.flag_wave_interval.toString(),
            ...(this.levelData.use_underground_zombies && { "SpawnColEnd": this.levelData.spawn_col_end }),
            ...(this.levelData.use_underground_zombies && { "SpawnColStart": this.levelData.spawn_col_start }),
            "WaveCount": this.levelData.wave_count.toString(),
            "WaveSpendingPointIncrement": this.levelData.wave_spending_point_increment,
            "WaveSpendingPoints": this.levelData.wave_spending_points,
            "Waves": Array.from({ length: this.levelData.wave_count }, (_, i) => {
                const refs = [`RTID(Wave${i + 1}@CurrentLevel)`];
                const wave = this.levelData.waves[i];
                if (wave && wave.events) {
                    wave.events.forEach((ev, ei) => {
                        refs.push(`RTID(${ev.alias}@CurrentLevel)`);
                    });
                }
                return refs;
            })
        }
    });

    if (!isZomboss) {
        this.levelData.waves.forEach((wave, i) => {
            if (i < this.levelData.wave_count) {
                let waveObj;
                if (wave.objclass === "SpawnZombiesFromGroundSpawnerProps") {
                    waveObj = {
                        "aliases": [`Wave${i + 1}`],
                        "objclass": "SpawnZombiesFromGroundSpawnerProps",
                        "objdata": {
                            "AdditionalPlantfood": wave.plant_food || 0,
                            "ColumnStart": wave.column_start || 2,
                            "ColumnEnd": wave.column_end || 4,
                            "Zombies": wave.zombies || []
                        }
                    };
                } else {
                    waveObj = {
                        "aliases": [`Wave${i + 1}`],
                        "objclass": "SpawnZombiesJitteredWaveActionProps",
                        "objdata": {
                            "AdditionalPlantfood": wave.plant_food || 0,
                            "Zombies": wave.zombies || []
                        }
                    };
                }
                objects.push(waveObj);
                if (wave.events && wave.events.length > 0) {
                    wave.events.forEach(ev => {
                        if (ev.objclass === "FrostWindWaveActionProps") {
                            objects.push({
                                "aliases": [ev.alias],
                                "objclass": "FrostWindWaveActionProps",
                                "objdata": {
                                    "Winds": ev.Winds || []
                                }
                            });
                        } else if (ev.objclass === "StormZombieSpawnerProps") {
                            objects.push({
                                "aliases": [ev.alias],
                                "objclass": "StormZombieSpawnerProps",
                                "objdata": {
                                    "ColumnEnd": ev.column_end,
                                    "ColumnStart": ev.column_start,
                                    "GroupSize": ev.group_size,
                                    "TimeBetweenGroups": ev.time_between_groups,
                                    "Type": ev.type,
                                    "Zombies": ev.zombies || []
                                }
                            });
                        } else {
                            objects.push({
                                "aliases": [ev.alias],
                                "objclass": ev.objclass,
                                "objdata": ev.objdata || ev
                            });
                        }
                    });
                }
            }
        });
    }

    return objects;
}

export function generateDynamicZombies() {
    const zombies = this.levelData.zombies || [];
    if (zombies.length === 0) return [];

    const threats = zombies.map(z => ({
        name: z,
        threat: this.calculateZombieThreatLevel ? this.calculateZombieThreatLevel(z) : 1
    }));

    threats.sort((a, b) => a.threat - b.threat);

    const tiers = [
        { minThreat: 0, maxThreat: 0.8, label: 'basic' },
        { minThreat: 0.8, maxThreat: 1.5, label: 'medium' },
        { minThreat: 1.5, maxThreat: 3, label: 'hard' },
        { minThreat: 3, maxThreat: Infinity, label: 'extreme' }
    ];

    const tieredZombies = tiers.map(tier => ({
        ...tier,
        zombies: threats.filter(z => z.threat > tier.minThreat && z.threat <= tier.maxThreat).map(z => z.name)
    })).filter(t => t.zombies.length > 0);

    if (tieredZombies.length === 0) return [];

    const dynamicZombies = [];
    const totalWaves = this.levelData.wave_count || 10;

    let startingWave = 1;
    let startingPoints = -100;
    let pointIncrement = -30;

    tieredZombies.forEach((tier, index) => {
        if (index === 0) {
            startingWave = 1;
            startingPoints = -100;
            pointIncrement = -30;
        } else if (index === 1) {
            startingWave = Math.max(1, Math.floor(totalWaves * 0.25));
            startingPoints = -50;
            pointIncrement = -10;
        } else if (index === 2) {
            startingWave = Math.max(1, Math.floor(totalWaves * 0.5));
            startingPoints = 100;
            pointIncrement = 30;
        } else {
            startingWave = Math.max(1, Math.floor(totalWaves * 0.7));
            startingPoints = 250;
            pointIncrement = 50;
        }

        dynamicZombies.push({
            "PointIncrementPerWave": pointIncrement,
            "StartingPoints": startingPoints,
            "StartingWave": startingWave,
            "ZombiePool": tier.zombies.map(z => `RTID(${z}@ZombieTypes)`)
        });
    });

    return dynamicZombies;
}

export function generateJson() {
    let boardModules = [];
    if (this.boardManager && typeof this.boardManager.getAllModules === 'function') {
        boardModules = this.boardManager.getAllModules();
    } else if (window.boardManager && typeof window.boardManager.getAllModules === 'function') {
        boardModules = window.boardManager.getAllModules();
    }

    const levelJson = {
        "#comment": this.levelData.level_name,
        "objects": [],
        "version": 1
    };

    levelJson.objects.push({
        "objclass": "LevelDefinition",
        "objdata": {
            "Description": this.levelData.level_name,
            "FirstRewardType": this.rewardManager.rewardsData.firstReward?.type || "",
            "FirstRewardParam": this.rewardManager.rewardsData.firstReward?.param || "",
            "ReplayRewardType": this.rewardManager.rewardsData.replayReward?.type || "",
            "ReplayRewardParam": this.rewardManager.rewardsData.replayReward?.param || "",
            "LevelNumber": this.levelData.level_number,
            "ForceToWorldMap": true,
            "Loot": "RTID(DefaultLoot@LevelModules)",
            "Modules": this.generateModules(),
            "ZombieLevel": this.levelData.zombie_level,
            ...(this.levelData.enable_fixed_plant_level && { "FixedPlantLevel": this.levelData.fixed_plant_level }),
            "GridItemLevel": this.levelData.grid_level,
            "Name": this.levelData.level_name,
            "NormalPresentTable": "modern_normal_03",
            "RepeatPlayForceToWorldMap": this.levelData.enable_zomboss_battle,
            "ShinyPresentTable": "egypt_shiny_01",
            "StageModule": `RTID(${this.levelData.stage}@LevelModules)`,
            "StartingSun": this.levelData.starting_sun,
            ...(this.levelData.enable_zomboss_battle && { "VictoryModule": "RTID(ZombossVictoryOutro@LevelModules)" })
        }
    });

    const waveObjects = this.generateWaveObjects();
    let firstModuleObject = null;
    let otherWaveObjects = [];

    waveObjects.forEach(obj => {
        if (obj.aliases && (obj.aliases[0] === "SeedBank" || obj.aliases[0] === "ConveyorBelt")) {
            if (!firstModuleObject) {
                firstModuleObject = obj;
            } else {
                otherWaveObjects.push(obj);
            }
        } else if (obj.aliases && obj.aliases[0] === "ZombossBattle") {
            otherWaveObjects.push(obj);
        } else {
            otherWaveObjects.push(obj);
        }
    });

    if (firstModuleObject) {
        levelJson.objects.push(firstModuleObject);
    }

    if (this.zombieResistanceManager && this.zombieResistanceManager.hasActiveFamilies()) {
        const moduleData = this.zombieResistanceManager.getModuleData();
        if (moduleData) {
            levelJson.objects.push(moduleData);
        }
    }

    if (boardModules.length > 0) {
        const placementModules = [];
        const mountingMoldsModule = boardModules.find(m => m.aliases?.[0] === "MountingMolds");
        if (mountingMoldsModule) {
            placementModules.push(mountingMoldsModule);
        }
        const moldLocationsModule = boardModules.find(m => m.aliases?.[0] === "MoldLocationsCustom");
        if (moldLocationsModule) {
            placementModules.push(moldLocationsModule);
        }
        const moduleAliases = placementModules.map(m => m.aliases?.[0]);
        boardModules.forEach(module => {
            const alias = module.aliases?.[0];
            const placementModulesList = [
                "MountingPlants",
                "MountingZombies",
                "MountingGravestones",
                "MountingSliders",
                "MountingPotions",
                "MountingOthers",
                "MountingRails"
            ];
            if (placementModulesList.includes(alias) && !moduleAliases.includes(alias)) {
                placementModules.push(module);
                moduleAliases.push(alias);
            }
        });
        if (placementModules.length > 0) {
            levelJson.objects.push(...placementModules);
        }
    }

    const challengeObjects = this.generateChallengeObjects();
    const challengeModuleObject = challengeObjects.find(obj =>
        obj.aliases?.[0] === "ChallengeModule"
    );
    if (challengeModuleObject) {
        levelJson.objects.push(challengeModuleObject);
    }
    const protectPlantObject = challengeObjects.find(obj =>
        obj.aliases?.[0] === "ProtectThePlant"
    );
    if (protectPlantObject) {
        levelJson.objects.push(protectPlantObject);
    }
    const otherChallenges = challengeObjects.filter(obj => {
        const alias = obj.aliases?.[0];
        return alias !== "ChallengeModule" && alias !== "ProtectThePlant";
    });
    if (otherChallenges.length > 0) {
        levelJson.objects.push(...otherChallenges);
    }

    levelJson.objects.push(...otherWaveObjects);

    return levelJson;
}

export function updatePreview() {
    const getElementValue = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        return element && element.value !== undefined ? element.value : defaultValue;
    };
    const getElementIntValue = (id, defaultValue = 0) => {
        const element = document.getElementById(id);
        return element && element.value !== undefined ? parseInt(element.value) || defaultValue : defaultValue;
    };
    const getElementBoolValue = (id, defaultValue = true) => {
        const element = document.getElementById(id);
        return element ? element.checked : defaultValue;
    };

    this.levelData.level_name = getElementValue('levelName', 'Mi Nivel Personalizado');
    this.levelData.level_number = getElementIntValue('levelNumber', 1);
    this.levelData.visual_effect = getElementValue('effectSelect', '');
    this.levelData.starting_sun = getElementIntValue('startingSun', 50);
    this.levelData.zombie_level = getElementIntValue('zombieLevel', 1);
    this.levelData.grid_level = getElementIntValue('gridLevel', 1);
    this.levelData.wave_count = getElementIntValue('waveCount', 10);
    this.levelData.flag_wave_interval = getElementIntValue('flagInterval', 4);
    this.levelData.spawn_col_start = getElementIntValue('spawnColStart', 6);
    this.levelData.spawn_col_end = getElementIntValue('spawnColEnd', 9);
    this.levelData.wave_spending_points = getElementIntValue('wavePoints', 150);
    this.levelData.wave_spending_point_increment = getElementIntValue('waveIncrement', 75);
    this.levelData.enable_sun_dropper = getElementBoolValue('enableSunDropper', true);
    this.levelData.enable_fixed_plant_level = getElementBoolValue('enableFixedPlantLevel', false);
    this.levelData.fixed_plant_level = getElementIntValue('fixedPlantLevel', 0);

    const seedMethodElement = document.getElementById('seedSelectionMethod');
    if (seedMethodElement) {
        this.levelData.seed_selection_method = seedMethodElement.value || 'chooser';
    }

    this.levelData.enable_zomboss_battle = getElementBoolValue('enableZombossBattle', false);
    this.levelData.zomboss_mech_type = getElementValue('zombossMechType', '');

    this.levelData.enable_pirate_planks = getElementBoolValue('enablePiratePlanks', false);
    const plankRows = [];
    for (let i = 0; i <= 4; i++) {
        const cb = document.getElementById('plankRow' + i);
        if (cb && cb.checked) plankRows.push(i);
    }
    this.levelData.pirate_plank_rows = plankRows;

    if (this.levelData.enable_zomboss_battle) {
        this.levelData.seed_selection_method = 'conveyor';
    }

    if (this.levelData.seed_selection_method === 'conveyor' && this.conveyorManager) {
        this.conveyorManager.updateLevelData();
        console.log('Conveyor debug:', {
            method: this.levelData.seed_selection_method,
            conveyorConfig: this.levelData.conveyor_config,
            conveyorModule: this.conveyorManager.getConveyorModule()
        });
    }

    if (this.boardManager) {
        this.boardManager.updateBoardModules();
    } else if (window.boardManager) {
        window.boardManager.updateBoardModules();
    }

    const json = this.generateJson();
    const preview = document.getElementById('jsonPreview');

    if (preview) {
        const jsonString = JSON.stringify(json, null, 2);
        preview.textContent = jsonString;
        this.highlightJson(preview);
        console.log('Módulos generados:', this.generateModules());
        console.log('Objetos de wave generados:', this.generateWaveObjects());
        localStorage.setItem('pvz_tab_preview', JSON.stringify({
            json_content: jsonString,
            timestamp: new Date().toISOString()
        }));
    } else {
        console.warn('Elemento jsonPreview no encontrado');
    }

    this.updateStats();
}

export function highlightJson(element) {
    const text = element.textContent;
    element.textContent = text;
    const highlighted = syntaxHighlight(text);
    element.innerHTML = highlighted;
}

export function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b(\d+)\b)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
                match = match.replace(/:$/, '') + '<span class="json-colon">:</span>';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}
