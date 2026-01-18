// zombieDataLoader.js
export class ZombieDataLoader {
    constructor() {
        this.zombiesData = null;
        this.categoriesData = {}; // Almacenará categorías dinámicamente
        this.loaded = false;
    }

    async loadZombieData() {
        try {
            const response = await fetch('data/zombies_combinados.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.json();
            this.processZombieData(rawData);
            this.loaded = true;
            console.log(`✓ Datos de zombies cargados: ${this.zombiesData.size} zombies`);
            console.log(`✓ Categorías generadas: ${Object.keys(this.categoriesData).length}`);
            return this.zombiesData;
        } catch (error) {
            console.error('❌ Error cargando datos de zombies:', error);
            return new Map();
        }
    }

    processZombieData(rawData) {
        this.zombiesData = new Map();
        this.categoriesData = {}; // Reiniciar categorías
        
        if (Array.isArray(rawData)) {
            rawData.forEach(zombie => {
                if (zombie.alias_type) {
                    const zombieKey = zombie.alias_type.toLowerCase();
                    
                    // Procesar datos del zombie
                    const processedZombie = {
                        alias_type: zombie.alias_type,
                        type_name: zombie.type_name,
                        zombie_class: zombie.zombie_class,
                        home_world: zombie.home_world,
                        is_basic_zombie: zombie.is_basic_zombie || false,
                        hitpoints: zombie.hitpoints || 100,
                        speed: zombie.speed || 0.8,
                        eat_dps: zombie.eat_dps || 100,
                        tiene_armadura: zombie.tiene_armadura || false,
                        tipo_armadura: zombie.tipo_armadura || "Sin armadura",
                        flag_type: this.detectFlagType(zombie),
                        tipo_mod: zombie.tipo_mod || "Normal",
                        // NUEVO: Guardar la categoría del JSON
                        category: zombie.categorie || this.detectDefaultCategory(zombie)
                    };
                    
                    this.zombiesData.set(zombieKey, processedZombie);
                    
                    // AGREGAR ZOMBIE A LA CATEGORÍA CORRESPONDIENTE
                    this.addZombieToCategory(processedZombie.category, zombie.alias_type);
                    
                    // También agregar alias alternativos
                    if (zombie.alias_properties) {
                        const aliasKey = zombie.alias_properties.toLowerCase();
                        if (aliasKey !== zombieKey) {
                            this.zombiesData.set(aliasKey, processedZombie);
                        }
                    }
                }
            });
        }
    }

    // Método para agregar zombie a una categoría
    addZombieToCategory(category, zombieName) {
        if (!category) return;
        
        if (!this.categoriesData[category]) {
            this.categoriesData[category] = [];
        }
        
        if (!this.categoriesData[category].includes(zombieName)) {
            this.categoriesData[category].push(zombieName);
        }
    }

    // Detectar categoría por defecto si no viene en el JSON
    detectDefaultCategory(zombie) {
        if (zombie.tipo_mod === 'Hex') return 'Hex';
        if (zombie.flag_type === 'flag') return 'Flag';
        if (zombie.tiene_armadura) return 'Armored';
        if (zombie.zombie_class?.includes('Gargantuar')) return 'Gargantuars';
        
        // Usar el mundo como categoría por defecto
        const worldMap = {
            'modern': 'Moderno',
            'egypt': 'Egipto',
            'pirate': 'Pirata',
            'west': 'Oeste',
            'future': 'Futuro',
            'roman': 'Antiguo',
            'iceage': 'Edad de Hielo',
            'atlantis': 'Atlantis',
            'renai': 'Renai',
            'carnival': 'Canival'
        };
        
        return worldMap[zombie.home_world] || zombie.home_world || 'Otros';
    }

    detectFlagType(zombie) {
        if (zombie.alias_type && zombie.alias_type.includes('flag')) {
            return 'flag';
        }
        if (zombie.zombie_class && zombie.zombie_class.includes('Flag')) {
            return 'flag';
        }
        return 'none';
    }

    // Método para obtener todas las categorías disponibles
    getCategories() {
        return this.categoriesData;
    }

    // Método para obtener zombies por categoría
    getZombiesByCategory(category) {
        return this.categoriesData[category] || [];
    }

    // Obtener información de zombie (sin cambios)
    getZombieInfo(zombieName) {
        if (!this.loaded || !this.zombiesData) {
            return null;
        }
        
        const key = zombieName.toLowerCase();
        
        // Buscar coincidencia exacta
        if (this.zombiesData.has(key)) {
            return this.zombiesData.get(key);
        }
        
        // Buscar coincidencia parcial
        for (const [zombieKey, zombieData] of this.zombiesData) {
            if (key.includes(zombieKey) || zombieKey.includes(key)) {
                return zombieData;
            }
        }
        
        return null;
    }

    getAllZombies() {
        if (!this.loaded || !this.zombiesData) {
            return [];
        }
        
        return Array.from(this.zombiesData.values())
            .filter((zombie, index, self) => 
                index === self.findIndex(z => z.alias_type === zombie.alias_type)
            );
    }


    getZombiesByType(type) {
        if (!this.loaded || !this.zombiesData) {
            return [];
        }
        
        const zombies = this.getAllZombies();
        
        switch(type.toLowerCase()) {
            case 'flag':
                return zombies.filter(z => z.flag_type === 'flag');
            case 'gargantuar':
                return zombies.filter(z => 
                    z.alias_type.includes('gargantuar') || 
                    z.zombie_class.includes('Gargantuar')
                );
            case 'armored':
                return zombies.filter(z => z.tiene_armadura);
            case 'flying':
                return zombies.filter(z => 
                    z.alias_type.includes('balloon') ||
                    z.zombie_class.includes('Balloon')
                );
            case 'aquatic':
                return zombies.filter(z => 
                    z.alias_type.includes('dolphin') ||
                    z.alias_type.includes('snorkel')
                );
            case 'hex':
                return zombies.filter(z => z.tipo_mod === 'Hex');
            default:
                return zombies;
        }
    }
}