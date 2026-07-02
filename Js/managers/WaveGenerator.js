// ============================================
// WaveGenerator - Wave generation and management
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

export function generateSmartWaves() {
    if (this.levelData.zombies.length === 0) {
        this.showMessage('Error', 'No hay zombies seleccionados. Selecciona zombies primero.', 'error');
        return;
    }

    this.levelData.wave_count = parseInt(document.getElementById('waveCount').value) || 10;

    const pfInput = document.getElementById('plantFoodWaves').value;
    const pfWaves = pfInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));

    this.levelData.waves = [];

    const zombieThreats = {};
    this.levelData.zombies.forEach(z => {
        zombieThreats[z] = this.calculateZombieThreatLevel(z);
    });

    let mechanicWavesCount = 0;

    for (let wave = 1; wave <= this.levelData.wave_count; wave++) {
        const mechanic = this.mechanicManager ? this.mechanicManager.getWaveGenerator(wave) : null;
        let waveData;
        if (mechanic) {
            waveData = mechanic.generateWave(wave, pfWaves, zombieThreats, this.levelData.wave_count);
            mechanicWavesCount++;
        } else {
            waveData = this.generateNormalWave(wave, pfWaves, zombieThreats, this.levelData.wave_count);
        }

        if (this.mechanicManager) {
            waveData = this.mechanicManager.modifyWave(waveData, wave, pfWaves, zombieThreats, this.levelData.wave_count);
        }

        this.levelData.waves.push(waveData);
    }

    const totalZombies = this.levelData.waves.reduce((sum, wave) => sum + wave.zombies.length, 0);
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    this.showMessage('Oleadas Generadas',
        `Se generaron ${this.levelData.wave_count} oleadas con ${totalZombies} zombies totales\n` +
        `Oleadas con mecánicas especiales: ${mechanicWavesCount}\n` +
        `Dificultad: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
        'success'
    );

    this.updatePreview();
}

export function generateNormalWave(waveNumber, pfWaves, zombieThreats, totalWaves) {
    const baseZombies = this.calculateZombiesPerWave(waveNumber, totalWaves);

    const waveData = {
        wave_number: waveNumber,
        plant_food: pfWaves.includes(waveNumber) ? 1 : 0,
        objclass: "SpawnZombiesJitteredWaveActionProps",
        zombies: []
    };

    const zombieCategories = this.categorizeZombies(this.levelData.zombies);

    const flagZombies = zombieCategories.flag || [];
    let flagZombieAdded = false;
    let flagZombieType = null;

    if (flagZombies.length > 0 && waveNumber % this.levelData.flag_wave_interval === 0) {
        flagZombieType = flagZombies[Math.floor(Math.random() * flagZombies.length)];
        flagZombieAdded = true;
    }

    const gargantuars = zombieCategories.gargantuar || [];
    let gargantuarAdded = false;
    let gargantuarType = null;

    if (gargantuars.length > 0 && waveNumber > totalWaves * 0.7 && Math.random() < 0.3) {
        gargantuarType = gargantuars[Math.floor(Math.random() * gargantuars.length)];
        gargantuarAdded = true;
    }

    const powerfulZombies = this.getPowerfulZombies(zombieThreats, 4);

    const basicZombies = zombieCategories.basic || [];
    const armoredZombies = zombieCategories.armored || [];
    const specialZombies = zombieCategories.special || [];

    let availableZombies = [];
    let availableWeights = [];

    if (waveNumber <= 2) {
        basicZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie));
        });
    } else if (waveNumber <= 5) {
        basicZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie) * 1.5);
        });
        const lightArmored = armoredZombies.filter(zombie =>
            zombie.includes('armor1') ||
            zombie.includes('_armor1') ||
            (armoredZombies.length > 0 && !zombie.includes('armor2') && !zombie.includes('armor3'))
        );
        if (lightArmored.length > 0) {
            lightArmored.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 0.8);
            });
        }
    } else if (waveNumber <= 8) {
        basicZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie));
        });
        armoredZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie) * 1.0);
        });
        if (specialZombies.length > 0 && Math.random() < 0.3) {
            const selectedSpecial = specialZombies[Math.floor(Math.random() * specialZombies.length)];
            availableZombies.push(selectedSpecial);
            availableWeights.push(this.getZombieWeight(selectedSpecial) * 0.5);
        }
    } else {
        basicZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie) * 1.2);
        });
        armoredZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie) * 1.0);
        });
        specialZombies.forEach(zombie => {
            availableZombies.push(zombie);
            availableWeights.push(this.getZombieWeight(zombie) * 0.7);
        });
        if (waveNumber > totalWaves * 0.6 && Math.random() < 0.4) {
            const selectedPowerful = powerfulZombies[Math.floor(Math.random() * powerfulZombies.length)];
            availableZombies.push(selectedPowerful);
            availableWeights.push(this.getZombieWeight(selectedPowerful) * 0.3);
        }
    }

    let zombiesToAdd = baseZombies;
    if (gargantuarAdded) {
        zombiesToAdd = Math.max(1, Math.floor(baseZombies * 0.5));
    }

    const zombieCounts = {};
    const maxSameType = 2;
    const maxDifferentTypes = Math.min(4, Math.max(2, Math.floor(waveNumber / 3)));
    const usedTypes = new Set();

    for (let i = 0; i < zombiesToAdd; i++) {
        let zombieType;
        if (flagZombieAdded && i === zombiesToAdd - 1) {
            zombieType = flagZombieType;
        } else if (gargantuarAdded && i === 0 && availableZombies.length > 0) {
            zombieType = gargantuarType;
        } else if (availableZombies.length > 0) {
            const candidateTypes = [];
            const candidateWeights = [];
            availableZombies.forEach((zombie, index) => {
                const currentCount = zombieCounts[zombie] || 0;
                const typeCount = usedTypes.size;
                let isPreferred = false;
                if (!usedTypes.has(zombie) && typeCount < maxDifferentTypes) {
                    isPreferred = true;
                    candidateWeights.push(availableWeights[index] * 1.5);
                } else if (currentCount < maxSameType &&
                    (typeCount < maxDifferentTypes || usedTypes.has(zombie))) {
                    isPreferred = true;
                    candidateWeights.push(availableWeights[index]);
                }
                if (isPreferred) {
                    candidateTypes.push(zombie);
                }
            });
            if (candidateTypes.length > 0) {
                zombieType = this.weightedRandomChoice(candidateTypes, candidateWeights);
            } else {
                zombieType = availableZombies[Math.floor(Math.random() * availableZombies.length)];
            }
        } else {
            zombieType = this.levelData.zombies[Math.floor(Math.random() * this.levelData.zombies.length)];
        }
        zombieCounts[zombieType] = (zombieCounts[zombieType] || 0) + 1;
        usedTypes.add(zombieType);
        waveData.zombies.push({
            row: Math.floor(Math.random() * 5).toString(),
            Type: `RTID(${zombieType}@ZombieTypes)`
        });
    }

    if (flagZombieAdded) {
        const flagZombieIndex = waveData.zombies.findIndex(z =>
            z.Type.includes(flagZombieType)
        );
        if (flagZombieIndex !== -1 && flagZombieIndex !== waveData.zombies.length - 1) {
            const flagZombie = waveData.zombies.splice(flagZombieIndex, 1)[0];
            waveData.zombies.push(flagZombie);
        }
    }

    return waveData;
}

export function categorizeZombies(zombieList) {
    const categories = {
        basic: [],
        armored: [],
        flag: [],
        gargantuar: [],
        special: []
    };

    zombieList.forEach(zombie => {
        const info = this.getZombieInfo(zombie);
        if (zombie.includes('flag') ||
            (info && info.flag_type && info.flag_type !== 'none')) {
            categories.flag.push(zombie);
        } else if (zombie.includes('gargantuar') ||
            (info && info.zombie_class && info.zombie_class.includes('Gargantuar'))) {
            categories.gargantuar.push(zombie);
        } else if (zombie.includes('armor') ||
            (info && info.tiene_armadura)) {
            categories.armored.push(zombie);
        } else if (zombie.includes('basic') ||
            (info && info.is_basic_zombie)) {
            categories.basic.push(zombie);
        } else {
            categories.special.push(zombie);
        }
    });

    return categories;
}

export function getPowerfulZombies(zombieThreats, count = 4) {
    const sortedZombies = Object.entries(zombieThreats)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    return sortedZombies.slice(0, Math.min(count, sortedZombies.length));
}

export function selectZombieType(waveNumber, totalWaves, availableZombies, weights, zombieThreats) {
    if (waveNumber > totalWaves * 0.6 && Math.random() < 0.4) {
        const strongZombies = availableZombies.filter(z => zombieThreats[z] > 1.5);
        if (strongZombies.length > 0) {
            const adjustedWeights = strongZombies.map(z => weights[availableZombies.indexOf(z)]);
            return this.weightedRandomChoice(strongZombies, adjustedWeights);
        }
    }
    return this.weightedRandomChoice(availableZombies, weights);
}

export function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random < 0) {
            return items[i];
        }
    }
    return items[items.length - 1];
}

export function calculateZombiesPerWave(currentWave, totalWaves) {
    if (currentWave === 1) return 1;
    if (currentWave === 2) return 2;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const difficultyFactors = {
        "facil": 0.8,
        "media": 1.0,
        "dificil": 1.3,
        "extrema": 1.6
    };
    const difficultyFactor = difficultyFactors[difficulty] || 1.0;
    const progress = currentWave / totalWaves;
    let baseCount;
    if (progress <= 0.3) {
        baseCount = Math.floor(Math.random() * 2) + 1;
    } else if (progress <= 0.6) {
        baseCount = Math.floor(Math.random() * 3) + 2;
    } else if (progress <= 0.8) {
        baseCount = Math.floor(Math.random() * 4) + 3;
    } else {
        baseCount = Math.floor(Math.random() * 5) + 4;
    }
    return Math.max(1, Math.floor(baseCount * difficultyFactor));
}

export function generateThematicLevel() {
    const world = this.levelData.world;
    this.levelData.zombies = [];
    if (this.zombieCategories[world]) {
        const thematicZombies = this.zombieCategories[world];
        const numZombies = Math.min(6, Math.max(4, thematicZombies.length));
        const shuffled = [...thematicZombies].sort(() => 0.5 - Math.random());
        this.levelData.zombies = shuffled.slice(0, numZombies);
    }
    this.updateSelectedZombiesDisplay();
    if (this.autoDetectOnZombieSelection) {
        this.autoDetectSettings();
    }
    this.generateSmartWaves();
    this.markTabAsChanged('waves');
    this.showMessage('Nivel Temático Generado', `Se ha generado un nivel temático de ${world}`, 'success');
}
