// ============================================
// ARCHIVO: constants/resources.js
// DESCRIPCIÓN: Recursos estáticos de la aplicación
// ============================================


// RUTAS DE IMÁGENES Y DATOS
export const PATHS = {
    IMAGES: {
        MUNDOS: "Assets/Mundos/",
        BOARD: "Assets/Board/",
        MOWERS: "Assets/Mowers/",
        DESAFIOS: "Assets/Desafios/",
        DESAFIOS: "Assets/Desafios/",
        PLANTS: "Assets/Plants/",
        ZOMBIES: "Assets/Zombies/",
        REWARDS: "Assets/Rewards/",
        GRAVESTONES: "Assets/Gravestones/",
        CONDITIONS: "Assets/Condiciones/",
        SLIDERS: 'Assets/Sliders/',
        POTIONS: 'Assets/Potions/', // Nueva ruta
        OTHERS: 'Assets/Others/',
        MOLDS: 'Assets/Molds/',
        RAILCARTS: 'Assets/Railcarts/'
    },
};


// En constants/resources.js, agrega:
export const SLIDERS = [
    'slider_up',
    'slider_down',
    'slider_up_modern', 
    'slider_down_modern'
];


export const POTIONS = [
    'zombiepotion_speed',
    'zombiepotion_toughness',
];


export const OTHERS = [
   'backpack',
'boulder_trap_falling_forward',
'crater',
'flame_spreader_trap',
'goldtile',
'potholepuddle',
'shallowpuddle',
'speaker',
'surfboard',
'tent',
'zomboss_iceage_glacier_block'

];



export const MOLDS = [
    'mold'
];


export const RAILCARTS = [
    'railcart_cowboy',
    'railcart_future', 
    'railcart_pirate',
    'railcart_egypt'
];

export const RAILCART_DISPLAY_NAMES = {
    'railcart_cowboy': 'Vagón del Oeste',
    'railcart_future': 'Vagón futurista',
    'railcart_pirate': 'Vagón pirata',
    'railcart_egypt': 'Vagón oscuro/gótico'
};

// Imágenes de mundos

export const WORLD_IMAGES = {
     "Egipto": `${PATHS.IMAGES.MUNDOS}egypt.webp`,
    "Moderno": `${PATHS.IMAGES.MUNDOS}modern.webp`,
    "Pirata": `${PATHS.IMAGES.MUNDOS}pirate.webp`,
    "Futuro": `${PATHS.IMAGES.MUNDOS}future.webp`,
    "Eighties": `${PATHS.IMAGES.MUNDOS}eighties.webp`,
    "Lostcity": `${PATHS.IMAGES.MUNDOS}lostcity.webp`,
    "Iceage": `${PATHS.IMAGES.MUNDOS}iceage.webp`,
    "Atlantis": `${PATHS.IMAGES.MUNDOS}atlantis.webp`,
    "Renai": `${PATHS.IMAGES.MUNDOS}renai.webp`,

    /* Circus / Carnival */
    "Carnival": `${PATHS.IMAGES.MUNDOS}circus.webp`
};

// Imágenes de escenarios (stages)
export const STAGE_IMAGES = {
    "NoneStage": `${PATHS.IMAGES.BOARD}NoneStage.webp`,
    "ModernStage": `${PATHS.IMAGES.BOARD}ModernStage.webp`,
    "EgyptStage": `${PATHS.IMAGES.BOARD}EgyptStage.webp`,
    "PirateStage": `${PATHS.IMAGES.BOARD}PirateStage.webp`,
    "DinoStage": `${PATHS.IMAGES.BOARD}DinoStage.webp`,
    "LostcityStage": `${PATHS.IMAGES.BOARD}LostcityStage.webp`,
    "DarkStage": `${PATHS.IMAGES.BOARD}DarkStage.webp`,
    "IceageStage": `${PATHS.IMAGES.BOARD}IceageStage.webp`,
    "EightiesStage": `${PATHS.IMAGES.BOARD}EightiesStage.webp`,
    "FutureStage": `${PATHS.IMAGES.BOARD}FutureStage.webp`,
    "BeachStage": `${PATHS.IMAGES.BOARD}BeachStage.webp`,

    "HeianStage": `${PATHS.IMAGES.BOARD}HeianStage.webp`,
    "HeianNightStage": `${PATHS.IMAGES.BOARD}HeianNightStage.webp`,
    "KongfuStage": `${PATHS.IMAGES.BOARD}KongfuStage.webp`,
    "FairyStage": `${PATHS.IMAGES.BOARD}FairyStage.webp`,
    "FairyNightStage": `${PATHS.IMAGES.BOARD}FairyNightStage.webp`,

    /* Extra stages */
    "RiftStage": `${PATHS.IMAGES.BOARD}RiftStage.webp`,
    "FoodfightStage": `${PATHS.IMAGES.BOARD}FoodfightStage.webp`,
    "ZCorpStage": `${PATHS.IMAGES.BOARD}ZCorpStage.webp`,
    "SportzballStage": `${PATHS.IMAGES.BOARD}SportzballStage.webp`,
    "JoustStage": `${PATHS.IMAGES.BOARD}JoustStage.webp`,
    "RomanStage": `${PATHS.IMAGES.BOARD}RomanStage.webp`,
    "CarnivalStage": `${PATHS.IMAGES.BOARD}CarnivalStage.webp`,
    "LunarStage": `${PATHS.IMAGES.BOARD}LunarStage.webp`,
    "LunarDaylightStage": `${PATHS.IMAGES.BOARD}LunarDaylightStage.webp`,
    "FeastivusStage": `${PATHS.IMAGES.BOARD}FeastivusStage.webp`,


    "HouseStage": `${PATHS.IMAGES.BOARD}HouseStage.webp`,
    "HouseNightsStage": `${PATHS.IMAGES.BOARD}HouseNightsStage.webp`,
    "RoofStage": `${PATHS.IMAGES.BOARD}RoofStage.webp`,
    "PoolDayLightStage": `${PATHS.IMAGES.BOARD}PoolDayLightStage.webp`,
    "SteamStage": `${PATHS.IMAGES.BOARD}SteamStage.webp`,
    "RoofNightStage": `${PATHS.IMAGES.BOARD}RoofNightStage.webp`,
    "AtlantisStage": `${PATHS.IMAGES.BOARD}AtlantisStage.webp`,
    "DeepseaStage": `${PATHS.IMAGES.BOARD}DeepseaStage.webp`,
    "MarteStage": `${PATHS.IMAGES.BOARD}MarteStage.webp`,
    "LunaStage": `${PATHS.IMAGES.BOARD}LunaStage.webp`,



    "SummerNightsStage": `${PATHS.IMAGES.BOARD}SummerNightsStage.webp`,
    "SpringStage": `${PATHS.IMAGES.BOARD}SpringStage.webp`,
    "ValenbrainzStage": `${PATHS.IMAGES.BOARD}ValenbrainzStage.webp`,
    "RiftStageLawnOfDoom": `${PATHS.IMAGES.BOARD}RiftStageLawnOfDoom.webp`
};

// Imágenes de las podadoras
export const MOWER_IMAGES = {
    "ModernMowers": `${PATHS.IMAGES.MOWERS}ModernMowers.webp`,
    "EgyptMowers": `${PATHS.IMAGES.MOWERS}EgyptMowers.webp`,
    "PirateMowers": `${PATHS.IMAGES.MOWERS}PirateMowers.webp`,
    "WestMowers": `${PATHS.IMAGES.MOWERS}WestMowers.webp`,
    "DinoMowers": `${PATHS.IMAGES.MOWERS}DinoMowers.webp`,
    "LostCityMowers": `${PATHS.IMAGES.MOWERS}LostCityMowers.webp`,
    "DarkMowers": `${PATHS.IMAGES.MOWERS}DarkMowers.webp`,
    "IceageMowers": `${PATHS.IMAGES.MOWERS}IceageMowers.webp`,
    "EightiesMowers": `${PATHS.IMAGES.MOWERS}EightiesMowers.webp`,
    "FutureMowers": `${PATHS.IMAGES.MOWERS}FutureMowers.webp`,
    "BeachMowers": `${PATHS.IMAGES.MOWERS}BeachMowers.webp`,
    "RomanMowers": `${PATHS.IMAGES.MOWERS}RomanMowers.webp`,
    "RenaiMowers": `${PATHS.IMAGES.MOWERS}RenaiMowers.webp`,
    "HeianMowers": `${PATHS.IMAGES.MOWERS}HeianMowers.webp`,
    "KongfuMowers": `${PATHS.IMAGES.MOWERS}KongfuMowers.webp`,
    "FairyMowers": `${PATHS.IMAGES.MOWERS}FairyMowers.webp`,

    /* Carnival */
    "CarnivalMowers": `${PATHS.IMAGES.MOWERS}CarnivalMowers.webp`
};

export const WORLDS = {
    
    "Moderno": ["ModernStage"],
    "Egipto": ["EgyptStage"],
    "Pirata": ["PirateStage"],
    "Oeste": ["WestStage"],
    "Dino": ["DinoStage"],
    "Lostcity": ["LostcityStage"],
    "Dark": ["DarkStage"],
    "Iceage": ["IceageStage"],
    "Eighties": ["EightiesStage"],
    "Futuro": ["FutureStage"],
    "Playa": ["BeachStage"],

    /* Carnival */
    "Carnival": ["CarnivalStage"]
};

// Tipos de podadoras disponibles
export const MOWER_TYPES = [
    "ModernMowers", "EgyptMowers","DarkMowers","LostCityMowers","EightiesMowers", "DinoMowers", "PirateMowers", "CarnivalMowers",
    "FutureMowers", "RomanMowers", "IceageMowers", "BeachMowers", "RenaiMowers" ,"FairyMowers","KongfuMowers","HeianMowers"
];

// Nombres amigables para las podadoras
export const MOWER_DISPLAY_NAMES = {
    "ModernMowers": "Podadoras Modernas",
    "EgyptMowers": "Podadoras Egipcias",
    "PirateMowers": "Podadoras Piratas",
    "LostCityMowers": "Podadoras del Oeste",
    "CarnivalMowers": "Podadoras de Carnaval",
    "FutureMowers": "Podadoras Futuristas",
    "RomanMowers": "Podadoras Romanas",
    "IceageMowers": "Podadoras de Edad de Hielo",
    "BeachMowers": "Podadoras de Playa",
    "RenaiMowers": "Podadoras Renai"
};



// Efectos visuales
export const VISUAL_EFFECTS = {
    "Volcán": "RTID(VolcanoPattern1@LevelModules)",
    "Nieve": "RTID(SnowRain@LevelModules)",
    "Agua Movimiento Día": "RTID(PoolDay@LevelModules)",
    "Agua Movimiento Noche": "RTID(PoolNight@LevelModules)",
    "Tormenta + Lluvia": "RTID(TormPattern1@LevelModules)",
    "Solo Lluvia": "RTID(RainPattern2@LevelModules)",
    "Atlantis": "RTID(AtlantisPattern1@LevelModules)",
    "Fog West": "RTID(WestNight@LevelModules)",
    "Torm Egypt": "RTID(EgyptSandStormT@LevelModules)",
    "Ninguno": ""
};




// CONFIGURACIÓN DE MODS DETECTABLES
// CONFIGURACIÓN DE MODS DETECTABLES
export const MOD_CONFIG = {
    enabled: true,
    autoDetect: true,
    knownMods: {
        'hex': { 
            name: 'hex', 
            displayName: 'Hex Mod', 
            color: '#764ba2', 
            icon: '', // Emoji hex
            description: 'Mod oficial Hexius'
        },
        'international': { 
            name: 'international', 
            displayName: 'Mod Internacional', 
            color: '#4CAF50', 
            icon: '🌍', // Emoji globo
            description: 'Zombies de diferentes culturas'
        },
        'custom': { 
            name: 'custom', 
            displayName: 'Personalizado', 
            color: '#FF9800', 
            icon: '🔧', // Emoji herramientas
            description: 'Mod creado por el usuario'
        },
        'beta': { 
            name: 'beta', 
            displayName: 'Contenido Beta', 
            color: '#9C27B0', 
            icon: '🧪', // Emoji probeta
            description: 'Zombies de versiones beta'
        },
        'retexture': { 
            name: 'retexture', 
            displayName: 'Retexturizado', 
            color: '#2196F3', 
            icon: '🎨', // Emoji paleta
            description: 'Texturas alternativas'
        },
        'unofficial': { 
            name: 'unofficial', 
            displayName: 'No Oficial', 
            color: '#607D8B', 
            icon: '⚠️', // Emoji advertencia
            description: 'Contenido no oficial'
        },
        'reflourished': { 
            name: 'reflourished', 
            displayName: 'Reflourished', 
            color: '#FF6B6B', 
            icon: '🌸', // Emoji flor
            description: 'Mod Reflourished'
        }
    },
    modIndicators: [
        'hex', "reflourished"
    ],
    colorPalette: [
        '#667eea', '#764ba2', '#4CAF50', '#FF9800', 
        '#F44336', '#9C27B0', '#2196F3', '#00BCD4',
        '#009688', '#8BC34A', '#FFC107', '#FF5722',
        '#795548', '#607D8B', '#E91E63', '#3F51B5'
    ]
};

// Función para generar color aleatorio
export function generateRandomColor() {
    const colors = MOD_CONFIG.colorPalette;
    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para detectar mod desde nombre de zombie
export function detectModFromZombie(zombieName) {
    const zombieLower = zombieName.toLowerCase();
    
    // SOLO buscar en mods conocidos (NO crear nuevos automáticamente)
    for (const [modId, modInfo] of Object.entries(MOD_CONFIG.knownMods)) {
        if (zombieLower.includes(modId) || 
            zombieLower.startsWith(modId + '_') ||
            zombieLower.endsWith('_' + modId)) {
            return modInfo;
        }
    }
    
    return null;
}

// Función para verificar si un zombie es de mod
export function isModZombie(zombieName) {
    return detectModFromZombie(zombieName) !== null;
}

// Función para verificar si una categoría es de mod
export function isModCategory(categoryName, zombieList = []) {
    const categoryLower = categoryName.toLowerCase();
    
    // Verificar si el nombre de la categoría contiene indicadores de mods predefinidos
    const hasKnownMod = Object.keys(MOD_CONFIG.knownMods).some(modId => 
        categoryLower.includes(modId)
    );
    
    if (hasKnownMod) return true;
    
    return false;
}



// Colores para categorías y temas
export const COLORS = {
    PRIMARY: "#4a6baf",
    SECONDARY: "#6c757d",
    SUCCESS: "#28a745",
    DANGER: "#dc3545",
    WARNING: "#ffc107",
    INFO: "#17a2b8",
    DARK: "#343a40",
    LIGHT: "#f8f9fa"
};









export const REWARDS = [
   'moneybag','big_moneybag', 'coin_gold', 'coin_gold_fake', 'coin_silver', 'coin_treasure_chest',
    'dangerroom_beach', 'dangerroom_cowboy', 'dangerroom_dark', 'dangerroom_dino',
     'dangerroom_egypt', 'dangerroom_eighties', 'dangerroom_future', 'dangerroom_iceage',
      'dangerroom_lostcity', 'dangerroom_modern', 'dangerroom_pirate', 'gem_diamond', 
      'mapgadget',  'note_beach', 'note_cowboy', 'note_dark', 'note_dino',
       'note_egypt', 'note_eighties', 'note_future', 'note_iceage', 'note_lostcity', 
       'note_modern', 'note_pirate', 'pinata_beach', 'pinata_cowboy', 'pinata_dark',
        'pinata_dino', 'pinata_egypt', 'pinata_eighties', 'pinata_future', 'pinata_iceage', 
        'pinata_lostcity', 'pinata_modern', 'pinata_pirate', 'plantfood', 'powerupflamethrower', 
        'powerupflickzombie', 'powerupgadget', 'powerupsnowball', 'powerupvasebreakerbutter', 
        'powerupvasebreakermove', 'powerupvasebreakerreveal', 'powerupwizardfinger', 'present',
         'present_shiny', 'sprout', 'sun', 'sun_large', 'sun_medium', 'sun_small', 'taco', 
         'worldkey_beach', 'worldkey_cowboy', 'worldkey_dark', 'worldkey_dino', 'worldkey_eighties', 'worldkey_future', 'worldkey_iceage', 'worldkey_lostcity', 'worldkey_modern', 'worldkey_pirate', 'worldtrophy_beach', 'worldtrophy_cowboy', 'worldtrophy_dark', 'worldtrophy_dino', 'worldtrophy_egypt', 'worldtrophy_eighties', 'worldtrophy_future', 'worldtrophy_iceage', 'worldtrophy_lostcity', 'worldtrophy_modern', 'worldtrophy_pirate'
  
];

// ============================================
// CONSTANTES DE PLANTAS Y LÁPIDAS
// ============================================

// Lista de plantas disponibles
export const PLANTS = [
    "sunflower",
    "peashooter",
    "wallnut",
    "potatomine",
    "bloomerang",
    "cabbagepult",
    "iceburg",
    "twinsunflower",
    "bonkchoy",
    "repeater",
    "snowpea",
    "kernelpult",
    "snapdragon",
    "powerlily",
    "spikeweed",
    "coconutcannon",
    "cherry_bomb",
    "springbean",
    "spikerock",
    "threepeater",
    "squash",
    "splitpea",
    "chilibean",
    "torchwood",
    "lightningreed",
    "tallnut",
    "jalapeno",
    "melonpult",
    "wintermelon",
    "imitater",
    "laser_bean",
    "blover",
    "citron",
    "empea",
    "starfruit",
    "holonut",
    "magnifyinggrass",
    "hypnoshroom",
    "sunshroom",
    "puffshroom",
    "fumeshroom",
    "sunbean",
    "peanut",
    "magnetshroom",
    "chomper",
    "bowlingbulb",
    "homingthistle",
    "guacodile",
    "banana",
    "ghostpepper",
    "sweetpotato",
    "sapfling",
    "hurrikale",
    "pepperpult",
    "firepeashooter",
    "stunion",
    "xshot",
    "dandelion",
    "lavaguava",
    "redstinger",
    "akee",
    "endurian",
    "toadstool",
    "stallia",
    "strawburst",
    "cactus",
    "phatbeet",
    "thymewarp",
    "electricblueberry",
    "garlic",
    "sporeshroom",
    "jackolantern",
    "grapeshot",
    "primalpeashooter",
    "primalwallnut",
    "perfumeshroom",
    "coldsnapdragon",
    "primalsunflower",
    "primalpotatomine",
    "shrinkingviolet",
    "moonflower",
    "nightshade",
    "shadowshroom",
    "bloominghearts",
    "dusklobber",
    "escaperoot",
    "grimrose",
    "goldbloom",
    "electriccurrant",
    "wasabiwhip",
    "explodeonut",
    "kiwibeast",
    "aloe",
    "applemortar",
    "bombegranate",
    "witchhazel",
    "parsnip",
    "missiletoe",
    "hotdate",
    "caulipower",
    "solartomato",
    "electricpeashooter",
    "filamint",
    "peppermint",
    "wintermint",
    "enlightenmint",
    "reinforcemint",
    "bombardmint",
    "ailmint",
    "containmint",
    "enforcemint",
    "armamint",
    "concealmint",
    "spearmint",
    "chardguard",
    "shadowpeashooter",
    "poisonpeashooter",
    "slingpea",
    "minipeashooter",
    "snappea",
    "burnade",
    "zoybeanpod",
    "dazeychain",
    "electricitea",
    "blastberry",
    "pokra",
    "imppear",
    "pumpkin",
    "pyrevine",
    "icebloom",
    "dartichoke",
    "gumnut",
    "shinevine",
    "tumbleweed",
    "olivepit",
    "puffball",
    "explodeovine",
    "murkadamia",
    "turkeypult",
    "headbutter",
    "boingsetta",
    "stickybombrice",
    "hocus",
    "gloomvine",
    "draftodil",
    "boomflower",
    "pvine",
    "inferno",
    "solarsage",
    "powervine",
    "noctarine",
    "heathseeker",
    "iceweed",
    "tigergrass",
    "teleportatomine",
    "blockoli",
    "buttercup",
    "bramblebush",
    "rhubarbarian",
    "megagatling",
    "levitater",
    "vamporcini",
    "meteorflower",
    "chillypepper",
    "waterrabbit",
    "sprout",
    "sunpod",
    "sungun",
    "hollybarrierleaf",
    "hollybarrierleafplantfood",
    "noctarinecloud",
    "buzzbutton",
    "boomberry",
    "maybee",
    "scaredyshroom",
    "bamboospartan",
    "sundewtangler",
    "nightcap",
    "cranjelly",
    "buduhboom",
    "iceshroom",
    "dragonbruit",
    "dragonbabybruit",
    "seashroom",
    "mangofier",
    "blastspinner",
    "blastspinnercocoon",
    "doomshroom",
    "blazeleaf",
    "frostbonnet",
    "znakelily",
    "hammeruit",
    "cornfetti",
    "sourshot",
    "brainstem",
    "rose",
    "blazingknight",

    "----CONTENIDO AGREGADO----",

    "lotusshooter",
    "lawpea",
    "lemon",
    "cottonyeti",
    "acorn",
    "winterrambutan",
    "birthsunflower",
    "twinsunflowerdark",
    "umbrellaleaf",
    "starfruitpink",
    "magicshroom",
    "bonkchoyparallex",
    "oxygenalgae",
    "gatlingpea",
    "projecttox-4",
    "solarpea",
    "plasmapea",
    "nekotail",
    "darkflame_bean",
    "mangosteen",
    "gardenergrass",
    "barrel",
    "rheumnobile",
    "lotusshower",
    "springprincess",
    "pamegranate",
    "stephania",
    "coffeebean",
    "seaderris",
    "hoyacordata",
    "mandrake",
    "asparagus",
    "kiwifruit",
    "kiwifruitsayan",
    "ents",
    "cobcannon",
    "charcoalpeashooter",
    "hatmushroom",
    "hexapple",
    "pomegranatejeweler",
    "waxgourd",
    "bearberry",
    "olive",
    "wizardthorns",
    "dragonfruit",
    "thorntrident",
    "popcornpult",
    "gravebuster",
    "peapod",
    "margarita",
    "powerplant",
    "lilypad",
    "tanglekelp",
    "duckPear",
    "hotpotato",
    "celerystalker",
    "goldleaf",
    "intensivecarrot",
    "lemonaid",
    "ultomato",
    "seaflora",
    "tombtangler",
    "sweetheartsnare",
    "seashooter",
    "devourbloom",
    "bubblecoral",
    "sakura",
    "aquaWeed",
    "icelotus",
    "gloomshroom",
    "carrotLauncher",
    "chainsawburmanni",
    "cryoshroom",
    "eggplantninja",
    "doublesamara",
    "cypripedium",
    "tupistrastalker",
    "mapleblade",
    "poisonvine",
    "armorflame",
    "animnuts",
    "firegourd",
    "flowerpot",
    "bamboo",
    "riflebamboo",
    "eagleclaw",
    "dragoncane",
    "orchidmage",
    "frozenpod",
    "dendrobiumguard",
    "boophonegeisha",
    "flamelady",
    "bromelblade",
    "hollyknight",
    "guardshroom",
    "minishroom",
    "aquavine",
    "electricpeel",
  
];

// Lista de lápidas disponibles
export const GRAVESTONES = [
    "gravestone_egypt",
    "gravestone_battlez_sun",
    "gravestone_dark",
    "gravestone_battlez",
    "gravestonePlantfoodOnDestruction",
    "gravestoneSunOnDestruction"
];

// Mapeo de nombres amigables para lápidas
export const GRAVESTONE_DISPLAY_NAMES = {
    'gravestone_egypt': 'Lápida Egipcia',
    'gravestone_battlez_sun': 'Lápida Battlez (Sol)',
    'gravestone_dark': 'Lápida Oscura',
    'gravestone_battlez': 'Lápida Battlez',
    'gravestonePlantfoodOnDestruction': 'Lápida (Comida Planta)',
    'gravestoneSunOnDestruction': 'Lápida (Sol)'
};


// En constants/resources.js - AGREGAR esto:
export const STANDARD_WORLDS = {
   
    "Atlantis": {
        display: "Atlantis",
        internal: "atlantis",
        stages: ["AtlantisStage", "AtlantisStageNight"],
        mowers: "BeachMowers"
    },
     "Roof": {
        display: "Roof",
        internal: "roof",
        stages: ["RoofStage"],
        mowers: "KongfuMowers"
    },
    "Renai": {
        display: "Renai",
        internal: "renai",
        stages: ["RenaiStage", "RenaiStageNight"],
        mowers: "RenaiMowers"
    },
    "Canival": {
        display: "Canival",
        internal: "carnival",
        stages: ["CarnivalStage", "CarnivalStageNight"],
        mowers: "CarnivalMowers"
    },
    "Tutorial": {
        display: "Tutorial",
        internal: "tutorial",
        stages: ["TutorialStage"],
        mowers: "ModernMowers"
    }
};

// También exporta la lista de nombres de mundos para fácil acceso
export const WORLD_NAMES = Object.keys(STANDARD_WORLDS);



// Imágenes de fallback para diferentes tipos de elementos
export const FALLBACK_IMAGES = {
    plants: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNTAgMjVMMzUgNTBINjVMNTAgMjVaIiBmaWxsPSIjMjhhNzQ1Ii8+PHRleHQgeD0iNTAiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlBMPC90ZXh0Pjwvc3ZnPg==',
    zombies: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iI2RjMzU0NSIvPjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGMzNTQ1Ii8+PHRleHQgeD0iNTAiIHk9Ijg1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlpNPC90ZXh0Pjwvc3ZnPg==',
    gravestones: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48cmVjdCB4PSIyNSIgeT0iMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzZjNzU3ZCIvPjx0ZXh0IHg9IjUwIiB5PSI4NSIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+R1A8L3RleHQ+PC9zdmc+'
};