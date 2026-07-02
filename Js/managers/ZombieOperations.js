// ============================================
// ZombieOperations - Pure utility functions for zombie data processing
// Extracted from EnhancedLevelGenerator in main.js
// ============================================

export function calculateDefaultHP(zombieName) {
    const baseHP = 100;
    if (zombieName.includes('gargantuar') || zombieName.includes('allstar')) {
        return baseHP * 10;
    }
    if (zombieName.includes('armor')) {
        return baseHP * 2;
    }
    if (zombieName.includes('imp')) {
        return baseHP * 0.5;
    }
    if (zombieName.includes('flag')) {
        return baseHP * 1.2;
    }
    return baseHP;
}

export function calculateDefaultSpeed(zombieName) {
    let speed = 0.8;
    if (zombieName.includes('runner') || zombieName.includes('speed')) {
        speed = 1.5;
    }
    if (zombieName.includes('gargantuar')) {
        speed = 0.4;
    }
    if (zombieName.includes('armor')) {
        speed = 0.6;
    }
    return speed;
}

export function calculateDefaultDPS(zombieName) {
    let dps = 10;
    if (zombieName.includes('gargantuar')) {
        dps = 50;
    }
    if (zombieName.includes('armor')) {
        dps = 15;
    }
    if (zombieName.includes('imp')) {
        dps = 5;
    }
    return dps;
}

export function detectHomeWorld(zombieName) {
    const zombieLower = zombieName.toLowerCase();
    if (zombieLower.includes('egypt')) return 'egypt';
    if (zombieLower.includes('pirate')) return 'pirate';
    if (zombieLower.includes('wildwest') || zombieLower.includes('cowboy')) return 'wildwest';
    if (zombieLower.includes('future')) return 'future';
    if (zombieLower.includes('dino')) return 'dino';
    if (zombieLower.includes('lostcity')) return 'lostcity';
    if (zombieLower.includes('dark')) return 'dark';
    if (zombieLower.includes('iceage')) return 'iceage';
    if (zombieLower.includes('eighties')) return 'eighties';
    if (zombieLower.includes('beach') || zombieLower.includes('atlantis')) return 'beach';
    if (zombieLower.includes('modern')) return 'modern';
    if (zombieLower.includes('romana')) return 'roman';
    if (zombieLower.includes('carnival')) return 'carnival';
    if (zombieLower.includes('house')) return 'house';
    if (zombieLower.includes('kongfu')) return 'kongfu';
    if (zombieLower.includes('heian')) return 'heian';
    if (zombieLower.includes('fairy')) return 'fairy';
    if (zombieLower.includes('renai')) return 'renai';
    return 'modern';
}

export function detectHomeWorldFromCategory(category, zombieName) {
    const worldMapping = {
        'Modern': 'modern',
        'Egypt': 'egypt',
        'Pirate': 'pirate',
        'Wildwest': 'wildwest',
        'Dino': 'dino',
        'Lostcity': 'lostcity',
        'Dark': 'dark',
        'Iceage': 'iceage',
        'Eighties': 'eighties',
        'Future': 'future',
        'Beach': 'beach',
        'Atlantis': 'atlantis',
        'Renai': 'renai',
        'Canival': 'carnival'
    };
    if (worldMapping[category]) {
        return worldMapping[category];
    }
    return detectHomeWorld(zombieName);
}

export function detectZombieClass(zombieName) {
    if (zombieName.includes('gargantuar')) {
        return 'Gargantuar';
    }
    if (zombieName.includes('armor')) {
        return 'Armored';
    }
    if (zombieName.includes('flag')) {
        return 'Flag';
    }
    if (zombieName.includes('imp')) {
        return 'Imp';
    }
    if (zombieName.includes('balloon')) {
        return 'Balloon';
    }
    if (zombieName.includes('digger') || zombieName.includes('underground')) {
        return 'Digger';
    }
    return 'Normal';
}

export function isBasicZombie(zombieName) {
    const basicIndicators = [
        'tutorial', 'basic', 'normal',
        'modern_basic', 'egypt_basic', 'pirate_basic'
    ];
    return basicIndicators.some(indicator =>
        zombieName.includes(indicator) &&
        !zombieName.includes('armor') &&
        !zombieName.includes('flag')
    );
}

export function createBasicZombieInfo(zombieName) {
    return {
        alias_type: zombieName,
        hitpoints: calculateDefaultHP(zombieName),
        speed: calculateDefaultSpeed(zombieName),
        eat_dps: calculateDefaultDPS(zombieName),
        tiene_armadura: zombieName.includes('armor'),
        home_world: detectHomeWorld(zombieName),
        zombie_class: detectZombieClass(zombieName),
        flag_type: zombieName.includes('flag') ? 'flag' : 'none',
        is_basic_zombie: isBasicZombie(zombieName)
    };
}

export function calculateZombieThreatLevel(zombieAlias) {
    const zombie = createBasicZombieInfo(zombieAlias);
    const hp = zombie.hitpoints || 0;
    const speed = zombie.speed || 0;
    const dps = zombie.eat_dps || 0;
    const hasArmor = zombie.tiene_armadura || false;

    let threat = (hp / 150) + (speed * 8) + (dps / 15);
    if (hasArmor) threat *= 1.3;
    if (zombieAlias.toLowerCase().includes('gargantuar')) threat *= 2.0;
    if (zombieAlias.toLowerCase().includes('imp')) threat *= 0.8;

    return Math.max(0.3, threat);
}

export function getZombieWeight(zombieName) {
    const threat = calculateZombieThreatLevel(zombieName);
    return Math.max(1, Math.floor(8 / threat));
}
