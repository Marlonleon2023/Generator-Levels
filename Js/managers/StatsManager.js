// ============================================
// StatsManager - Statistics generation
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

export function updateStats() {
    const container = document.getElementById('statsContent');

    if (this.levelData.zombies.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-robot display-1 mb-3"></i>
                <h4>No hay zombies seleccionados</h4>
                <p>Selecciona zombies para calcular estadísticas</p>
            </div>`;

        localStorage.setItem('pvz_tab_stats', JSON.stringify({
            stats_content: container.innerHTML,
            timestamp: new Date().toISOString()
        }));

        return;
    }

    let totalThreat = 0;
    let totalHp = 0;
    let armoredCount = 0;
    let specialCount = 0;
    const zombieDetails = [];

    this.levelData.zombies.forEach(zombieAlias => {
        const info = this.getZombieInfo(zombieAlias);
        if (info) {
            const threat = this.calculateZombieThreatLevel(zombieAlias);
            const hp = info.hitpoints || 0;
            const hasArmor = info.tiene_armadura || false;
            const zombieClass = info.zombie_class || '';

            totalThreat += threat;
            totalHp += hp;
            if (hasArmor) armoredCount++;

            if (zombieAlias.toLowerCase().includes('gargantuar') || zombieClass.includes('Gargantuar')) {
                specialCount++;
            }

            zombieDetails.push(`${zombieAlias}: ${hp} HP, Amenaza: ${threat.toFixed(1)}`);
        }
    });

    const avgHp = totalHp / this.levelData.zombies.length;
    const avgThreat = totalThreat / this.levelData.zombies.length;

    let waveStats = "";
    let undergroundStats = "";
    const undergroundWaveList = [];

    if (this.levelData.waves.length > 0) {
        const totalWaveZombies = this.levelData.waves.reduce((sum, wave) => sum + wave.zombies.length, 0);
        const avgZombiesPerWave = totalWaveZombies / this.levelData.waves.length;

        const undergroundWaves = this.levelData.waves.filter(w => w.objclass === "SpawnZombiesFromGroundSpawnerProps");
        const undergroundCount = undergroundWaves.length;

        undergroundWaves.forEach(wave => {
            undergroundWaveList.push(wave.wave_number || "?");
        });

        waveStats = `<p>- Zombies totales en oleadas: ${totalWaveZombies}</p>
                     <p>- Promedio por oleada: ${avgZombiesPerWave.toFixed(1)}</p>`;

        if (undergroundWaveList.length > 0) {
            undergroundStats = `<p>- Oleadas subterráneas: ${undergroundCount}/${this.levelData.waves.length}</p>
                               <p>  Oleadas: ${undergroundWaveList.join(', ')}</p>`;
        } else {
            undergroundStats = `<p>- Oleadas subterráneas: 0/${this.levelData.waves.length}</p>`;
        }
    } else {
        waveStats = "<p>- Oleadas no generadas aún</p>";
        undergroundStats = "";
    }

    const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
    const challengeStats = `
        <h6>DESAFÍOS ACTIVADOS (${enabledChallenges.length}):</h6>
        <p>- Desafíos activados: ${enabledChallenges.length}/8</p>
        ${enabledChallenges.map(challenge =>
        `<p>  • ${this.getChallengeDescription(challenge)}</p>`
    ).join('')}
    `;

    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    let statsText = `
        <h5>ESTADÍSTICAS DEL NIVEL</h5>
        <hr>
        <h6>ZOMBIES SELECCIONADOS (${this.levelData.zombies.length}):</h6>
        <pre>${zombieDetails.join('\n')}</pre>
        
        <h6>ESTADÍSTICAS GENERALES:</h6>
        <p>- Amenaza Total: ${totalThreat.toFixed(1)}</p>
        <p>- Vida Promedio: ${avgHp.toFixed(0)} HP</p>
        <p>- Amenaza Promedio: ${avgThreat.toFixed(1)}</p>
        <p>- Zombies con Armadura: ${armoredCount}</p>
        <p>- Zombies Especiales: ${specialCount}</p>
        
        ${challengeStats}
        
        <h6>CONFIGURACIÓN SUBTERRÁNEA:</h6>
        <p>- Activado: ${this.levelData.use_underground_zombies ? 'Sí' : 'No'}</p>
        <p>- Oleadas: ${this.levelData.underground_waves?.length ? this.levelData.underground_waves.join(', ') : 'Ninguna'}</p>
        <p>- Columnas: ${this.levelData.underground_columns_start}-${this.levelData.underground_columns_end}</p>
        <p>- Zombies por oleada: ${this.levelData.underground_min_zombies}-${this.levelData.underground_max_zombies}</p>
        
        <h6>OLEADAS:</h6>
        <p>- Total de Oleadas: ${this.levelData.wave_count}</p>
        ${waveStats}
        ${undergroundStats}
        <p>- Dificultad: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        <p>- Sol Inicial: ${this.levelData.starting_sun}</p>
        <p>- Caída de soles periódica: ${this.levelData.enable_sun_dropper ? 'Activada' : 'Desactivada'}</p>
        
        <h6>RECOMENDACIONES:</h6>
    `;

    if (avgThreat > 2.0) {
        statsText += "<p>- Nivel MUY difícil, considera reducir zombies especiales</p>";
    } else if (avgThreat > 1.2) {
        statsText += "<p>- Nivel desafiante, bien balanceado</p>";
    } else {
        statsText += "<p>- Nivel accesible, buen para jugadores nuevos</p>";
    }

    if (armoredCount > this.levelData.zombies.length * 0.5) {
        statsText += "<p>- Muchos zombies con armadura, necesitas plantas penetrantes</p>";
    }

    if (specialCount > 2) {
        statsText += "<p>- Múltiples zombies especiales, prepara defensas fuertes</p>";
    }

    if (enabledChallenges.length > 0) {
        statsText += "<p>- ¡Desafíos activados! Completa objetivos para estrellas adicionales</p>";
    }

    if (this.levelData.use_underground_zombies && this.levelData.underground_waves?.length) {
        statsText += `<p>- ¡Zombies subterráneos activados! Oleadas: ${this.levelData.underground_waves.join(', ')}</p>
                     <p>- Prepara plantas que ataquen bajo tierra</p>`;
    }

    if (!this.levelData.enable_sun_dropper) {
        statsText += `<p>- ¡Caída de soles desactivada! Solo tendrás el sol inicial y plantas productoras</p>
                     <p>- Asegúrate de incluir suficientes plantas productoras de sol</p>`;
    }

    container.innerHTML = statsText;

    localStorage.setItem('pvz_tab_stats', JSON.stringify({
        stats_content: statsText,
        timestamp: new Date().toISOString()
    }));
}

export function getChallengeDescription(challenge) {
    switch (challenge.id) {
        case 'ZombieDistance':
            return `No permitir que zombies se acerquen más de ${challenge.value} casillas`;
        case 'SunUsed':
            return `Usar máximo ${challenge.value} sol`;
        case 'SunProduced':
            return `Producir al menos ${challenge.value} sol`;
        case 'SunHoldout':
            return `Retener 50+ sol por ${challenge.value} segundos`;
        case 'KillZombies':
            return `Matar ${challenge.values.zombies} zombies en ${challenge.values.time} segundos`;
        case 'PlantsLost':
            return `Perder máximo ${challenge.value} plantas`;
        case 'SimultaneousPlants':
            return `Máximo ${challenge.value} plantas simultáneas`;
        case 'SaveMowers':
            return `Salvar al menos ${challenge.value} podadoras`;
        default:
            return challenge.id;
    }
}
