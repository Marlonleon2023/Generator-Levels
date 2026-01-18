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
        GRAVESTONES: "Assets/Gravestones/",
        CONDITIONS: "Assets/Condiciones/"
    },
};

// Imágenes de mundos
export const WORLD_IMAGES = {
    "Moderno": `${PATHS.IMAGES.MUNDOS}modern.webp`,
    "Egipto": `${PATHS.IMAGES.MUNDOS}egypt.webp`,
    "Pirata": `${PATHS.IMAGES.MUNDOS}pirate.webp`,
    "Oeste": `${PATHS.IMAGES.MUNDOS}cowboy.webp`,
    "Futuro": `${PATHS.IMAGES.MUNDOS}future.webp`,
    "Antiguo": `${PATHS.IMAGES.MUNDOS}eighties.webp`,
    "Journey": `${PATHS.IMAGES.MUNDOS}lostcity.webp`,
    "Canival": `${PATHS.IMAGES.MUNDOS}circus.webp`,
    "Edad de Hielo": `${PATHS.IMAGES.MUNDOS}iceage.webp`,
    "Atlantis": `${PATHS.IMAGES.MUNDOS}atlantis.webp`,
    "Renai": `${PATHS.IMAGES.MUNDOS}renai.webp`
};

// Imágenes de escenarios (stages)
export const STAGE_IMAGES = {
    "ModernStage": `${PATHS.IMAGES.BOARD}ModernStage.webp`,
    "EgyptStage": `${PATHS.IMAGES.BOARD}EgyptStage.webp`,
    "PirateStage": `${PATHS.IMAGES.BOARD}PirateStage.webp`,
    "WestStage": `${PATHS.IMAGES.BOARD}WestStage.webp`,   
    "FutureStage": `${PATHS.IMAGES.BOARD}FutureStage.webp`,
    "IceageStage": `${PATHS.IMAGES.BOARD}IceageStage.webp`,
    "BeachStage": `${PATHS.IMAGES.BOARD}BeachStage.webp`,
    "DarkStage": `${PATHS.IMAGES.BOARD}DarkStage.webp`,
    "DinoStage": `${PATHS.IMAGES.BOARD}DinoStage.webp`,
    "EightiesStage": `${PATHS.IMAGES.BOARD}EightiesStage.webp`,
    "RiftStage": `${PATHS.IMAGES.BOARD}RiftStage.webp`,
    "FoodfightStage": `${PATHS.IMAGES.BOARD}FoodfightStage.webp`,
    "ZCorpStage": `${PATHS.IMAGES.BOARD}ZCorpStage.webp`,
    "SportzballStage": `${PATHS.IMAGES.BOARD}SportzballStage.webp`,
    "JoustStage": `${PATHS.IMAGES.BOARD}JoustStage.webp`,
    "RomanStage": `${PATHS.IMAGES.BOARD}RomanStage.webp`,
    "CarnivalStage": `${PATHS.IMAGES.BOARD}CarnivalStage.webp`,
    "LunarStage": `${PATHS.IMAGES.BOARD}LunarStage.webp`,
     "FeastivusStage": `${PATHS.IMAGES.BOARD}FeastivusStage.webp`,
      "RiftStageLawnOfDoom": `${PATHS.IMAGES.BOARD}RiftStageLawnOfDoom.webp`,

  //  "BajoCeroStage": `${PATHS.IMAGES.BOARD}BajoCeroStage.webp`,
   // "AtlantisStage": `${PATHS.IMAGES.BOARD}AtlantisStage.webp`,
   // "DeepseaStage": `${PATHS.IMAGES.BOARD}DeepseaStage.webp`,
   // "RenaiDayStage": `${PATHS.IMAGES.BOARD}RenaiDayStage.webp`,
   // "RenaiNightStage": `${PATHS.IMAGES.BOARD}RenaiNightStage.webp`,
   // "FairyStage": `${PATHS.IMAGES.BOARD}FairyStage.webp`,
   // "JourneyStage": `${PATHS.IMAGES.BOARD}JourneyStage.webp`,
   
   // "VolcanoStage": `${PATHS.IMAGES.BOARD}VolcanoStage.webp`,
    //"FutureNightStage": `${PATHS.IMAS.BOARD}FutureNightStage.webp`,
    //"WestNightStage": `${PATHS.IMAGES.BOARD}WestNightStage.webp`,
    // "PirateNightStage": `${PATHS.IMAGES.BOARD}PirateNightStage.webp`,
    "default": `${PATHS.IMAGES.BOARD}default.webp`
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

// Tipos de podadoras disponibles
export const MOWER_TYPES = [
    "ModernMowers", "EgyptMowers", "PirateMowers", "WestMowers", "CarnivalMowers",
    "FutureMowers", "RomanMowers", "IceageMowers", "BeachMowers", "RenaiMowers"
];

// Nombres amigables para las podadoras
export const MOWER_DISPLAY_NAMES = {
    "ModernMowers": "Podadoras Modernas",
    "EgyptMowers": "Podadoras Egipcias",
    "PirateMowers": "Podadoras Piratas",
    "WestMowers": "Podadoras del Oeste",
    "CarnivalMowers": "Podadoras de Carnaval",
    "FutureMowers": "Podadoras Futuristas",
    "RomanMowers": "Podadoras Romanas",
    "IceageMowers": "Podadoras de Edad de Hielo",
    "BeachMowers": "Podadoras de Playa",
    "RenaiMowers": "Podadoras Renai"
};

// Imágenes de las podadoras
export const MOWER_IMAGES = {
    "ModernMowers": `${PATHS.IMAGES.MOWERS}ModernMowers.webp`,
    "EgyptMowers": `${PATHS.IMAGES.MOWERS}EgyptMowers.webp`,
    "PirateMowers": `${PATHS.IMAGES.MOWERS}PirateMowers.webp`,
    "WestMowers": `${PATHS.IMAGES.MOWERS}WestMowers.webp`,
    "CarnivalMowers": `${PATHS.IMAGES.MOWERS}CarnivalMowers.webp`,
    "FutureMowers": `${PATHS.IMAGES.MOWERS}FutureMowers.webp`,
    "RomanMowers": `${PATHS.IMAGES.MOWERS}RomanMowers.webp`,
    "IceageMowers": `${PATHS.IMAGES.MOWERS}IceageMowers.webp`,
    "BeachMowers": `${PATHS.IMAGES.MOWERS}BeachMowers.webp`,
    "RenaiMowers": `${PATHS.IMAGES.MOWERS}RenaiMowers.webp`,
    "default": `${PATHS.IMAGES.MOWERS}default.webp`
};

// Mapeo de mundos a sus escenarios disponibles
export const WORLDS = {
    "Moderno": ["ModernStage"],
    "Egipto": ["EgyptStage"],
    "Pirata": ["PirateStage"],
    "Oeste": ["WestStage"],
    "Futuro": ["FutureStage"],
    "Antiguo": ["RomanStage"],
    "Journey": ["JourneyStage"],
    "Canival": ["CarnivalStage"],
    "Edad de Hielo": ["IceageStage"],
    "Iceage": ["IceageStage"],
    "Atlantis": ["AtlantisStage", "DeepseaStage"],
    "Renai": ["RenaiDayStage", "RenaiNightStage"],
    "Otros": ["FairyStage", "LunarStage", "VolcanoStage", "RiftStageLawnOfDoom"]
};

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

// Categorías de zombies (mantén tus categorías existentes aquí)
export const ZOMBIE_CATEGORIES = {
        "modern": [
            "tutorial", "tutorial_armor1", "tutorial_armor2", "tutorial_flag", "tutorial_gargantuar", "tutorial_imp", "modern_newspaper", "modern_balloon",
            "beghouled", "beghouled_armor1", "beghouled_armor2", "modern_allstar", "beghouled_newspaper", "modern_superfanimp", "newspaper_veteran", "tutorial_flag_veteran",
            "tutorial_armor4", "tutorial_balloon", "zomboni", "zombie_bobsled_team", "zombie_bobsled_crew"
        ],
    "egypt": [
            "mummy", "mummy_armor1", "mummy_armor2", "mummy_flag", "camel_almanac", "camel_onehump", "camel_twohump", "camel_manyhump",
            "camel_segment", "camel_onehump_touch", "camel_twohump_touch", "camel_manyhump_touch", "camel_segment_touch", "pharaoh", "ra", "tomb_raiser",
            "explorer", "cleopatra", "egypt_gargantuar", "egypt_imp", "vase_gargantuar", "birthday_pharaoh", "beghouled_mummy", "beghouled_mummy_armor1",
            "beghouled_mummy_armor2", "explorer_veteran", "mummy_flag_veteran", "mummy_armor4", "solarsage_enlightened"
        ],
    "pirate": [
            "pirate", "pirate_armor1", "pirate_armor2", "pirate_flag", "barrelroller", "cannon", "pirate_imp", "seagull",
            "pirate_captain", "pirate_captain_parrot", "swashbuckler", "pirate_barrel", "pirate_gargantuar", "birthday_barrel", "beghouled_pirate", "beghouled_pirate_armor1",
            "beghouled_pirate_armor2", "hero_barrelroller", "bighead_barrelroller", "hero_barrel", "bighead_barrel", "pirate_flag_veteran", "pirate_armor4", "pelican"
        ],
    "wildwest": [
            "cowboy", "cowboy_armor1", "cowboy_armor2", "cowboy_flag", "prospector", "west_bullrider", "west_bull", "poncho",
            "poncho_no_plate", "poncho_plate", "piano", "chicken_farmer", "chicken", "cowboy_gargantuar", "feastivus_poncho", "spring_poncho",
            "beghouled_cowboy", "beghouled_cowboy_armor1", "beghouled_cowboy_armor2", "cowboy_armor4", "cowboy_flag_veteran", "west_bull_veteran", "chicken_battlez"
        ],
    "dino": [
            "dino", "dino_armor1", "dino_armor2", "dino_armor3", "dino_flag", "dino_imp", "dino_gargantuar", "dino_bully",
            "dino_armor4", "dino_flag_veteran", "dino_bully_veteran"
        ],
    "lostcity": [
            "lostcity_impporter", "lostcity", "lostcity_armor1", "lostcity_armor2", "lostcity_flag", "lostcity_excavator", "lostcity_jane", "lostcity_gargantuar",
            "lostcity_imp", "lostcity_lostpilot", "lostcity_bug", "lostcity_bug_armor1", "lostcity_bug_armor2", "lostcity_relichunter", "lostcity_crystalskull", "beghouled_lostcity",
            "beghouled_lostcity_armor1", "beghouled_lostcity_armor2"
        ],
    "dark": [
            "dark", "dark_armor1", "dark_armor2", "dark_flag", "dark_armor3", "dark_imp", "dark_wizard", "dark_imp_dragon",
            "dark_gargantuar", "dark_juggler", "dark_king", "spring_wizard", "beghouled_dark", "beghouled_dark_armor1", "beghouled_dark_armor2", "dark_armor4",
            "dark_wizard_veteran", "dark_flag_veteran", "sportzball_wizard"
        ],
    "future": [
            "mech_cone", "disco_mech", "future", "future_armor1", "future_armor2", "future_flag", "future_jetpack", "future_gargantuar",
            "future_imp", "future_protector", "future_jetpack_disco", "birthday_jetpack", "beghouled_future", "beghouled_future_armor1", "beghouled_future_armor2", "future_flag_veteran",
            "future_armor4", "future_jetpack_veteran", "future_protector_veteran", "mech_cone_veteran"
        ],
    "beach": [
            "beach_snorkel", "beach_fastswimmer", "beach_armor1", "beach_armor2", "beach_flag", "beach_imp", "beach_gargantuar", "beach_fem",
            "beach_fem_armor1", "beach_fem_armor2", "beach_fisherman", "beach_surfer", "beach_octopus", "beghouled_beach_armor1", "beghouled_beach_armor2", "beghouled_beach_fem",
            "beghouled_beach_fem_armor1", "beghouled_beach_fem_armor2", "duckytube", "duckytube_armor1", "duckytube_armor2", "raincoat"
        ],
    "iceage": [
            "iceage_troglobite_2block", "iceage_troglobite_1block", "iceage", "iceage_armor1", "iceage_armor2", "iceage_armor3", "iceage_flag", "iceage_hunter",
            "iceage_imp", "iceage_dodo", "iceage_gargantuar", "iceage_weaselhoarder", "iceage_weasel", "iceage_troglobite", "beghouled_iceage", "beghouled_iceage_armor1",
            "beghouled_iceage_armor2"
        ],
    "eighties": [
            "eighties", "eighties_armor1", "eighties_armor2", "eighties_flag", "eighties_gargantuar", "eighties_imp", "eighties_punk", "eighties_mc",
            "eighties_glitter", "eighties_boombox", "eighties_breakdancer", "eighties_arcade", "eighties_8bit", "eighties_8bit_armor1", "eighties_8bit_armor2"
        ],
    "roman": [
            "roman_segment", "roman_shield_top", "roman_armor1", "roman_armor2", "roman_flag", "roman_healer", "roman_shield_almanac", "roman_shield_triad",
            "roman_shield_pair", "roman_gargantuar", "roman_imp", "roman_armor3", "roman_armor4", "roman_ballista", "roman_medusa", "catapult"
        ],
    "halloween": [
            "halloween_camel_twohump", "halloween", "halloween_armor1", "halloween_armor2", "halloween_flag", "halloween_imp", "halloween_gargantuar"
        ],
    "foodfight": [
            "foodfight", "foodfight_armor1", "foodfight_armor2", "foodfight_flag", "foodfight_chefster", "foodfight_gobbler_king", "foodfight_turkey", "foodfight_turkey_battlez",
            "turkeypult_basic", "turkeypult_turkzilla", "foodfight_turkey_boss"
        ],
    "feastivus": [
            "holiday_imp", "holiday_gargantuar", "feastivus", "feastivus_armor1", "feastivus_armor2", "feastivus_flag", "feastivus_imp", "feastivus_gargantuar",
            "feastivus_camel_onehump", "feastivus_camel_twohump", "feastivus_camel_manyhump", "feastivus_camel_segment", "feastivus_swashbuckler", "feastivus_piano", "feastivus_troglobite", "feastivus_troglobite_1block",
            "feastivus_troglobite_2block", "caketank", "caketankfeastivus"
        ],
    "valentines": [
            "valentines", "valentines_armor1", "valentines_armor2", "valentines_flag", "valentines_gargantuar", "valentines_imp"
        ],
    "stpatrick": [
            "leprachaun_imp", "leprachaun_dodo", "stpatrick", "stpatrick_armor1", "stpatrick_armor2"
        ],
    "spring": [
            "spring_imp", "spring_gargantuar", "spring", "spring_armor1", "spring_armor2", "spring_flag", "spring_camel_onehump", "spring_camel_twohump",
            "spring_camel_manyhump", "spring_camel_segment", "spring_gargantuar_af", "spring_imp_af", "easter_troglobite", "easter_troglobite_1block", "easter_troglobite_2block"
        ],
    "birthday": [
            "birthday", "birthday_flag", "birthday_gargantuar", "birthday_juggler", "birthday_troglobite", "birthday_troglobite_2block", "birthday_troglobite_1block"
        ],
    "summer": [
            "beach", "summer_bug", "summer_bug_armor1", "summer_bug_armor2", "summer_basic", "summer_armor1", "summer_armor2", "summer_imp",
            "summer_gargantuar", "summer_flag", "beghouled_beach"
        ],
    "lunar": [
            "lunar", "lunar_armor1", "lunar_armor2", "lunar_flag", "lunar_superfanimp", "lunar_camel_onehump", "lunar_camel_twohump", "lunar_camel_manyhump",
            "lunar_camel_segment"
        ],
    "heroes": [
            "hero_electricboogaloo", "hero_impfinity", "hero_rustbolt", "hero_smash", "hero_superbrainz"
        ],
    "sportzball": [
            "football_mech", "bighead_balloon", "hamster_ball", "sportzball_buckethead", "sportzball_balloon", "sportzball_imp", "sportzball_gargantuar"
        ],
    "nutcracker": [
            "nutcracker"
        ],
    "general": [
            "general_treadmill_phase1", "general_treadmill_phase2", "general_treadmill_phase3", "general_zmech_phase1", "general_zmech_phase2", "general_zmech_phase3", "general_caesar_phase1", "general_caesar_phase2",
            "general_caesar_phase3"
        ],
    "zoybean": [
            "zoybeanpod_basic", "zoybeanpod_armor1", "zoybeanpod_armor2", "zoybeanpod_gargantuar"
        ],
    "bighead": [
            "bighead", "bighead_armor1", "bighead_armor2", "bighead_flag", "bighead_gargantuar", "bighead_imp", "bighead_allstar", "bighead_newspaper",
            "bighead_superfan"
        ],
 
"special": [
    "pet",
    "treasureyeti",
    "joustyeti",
    "riftyeti",
    "tigergrass_tiger",
    "imppear_imp",
    "gum"
],

    "zomboss": [
            "zombossmech_egypt_rift", "zombossmech_future", "zombossmech_egypt", "zombossmech_pirate", "zombossmech_cowboy", "zombossmech_dark", "zombossmech_beach", "zombossmech_iceage",
            "zombossmech_lostcity", "zombossmech_eighties", "zombossmech_dino", "zombossmech_modern_egypt", "zombossmech_modern_pirate", "zombossmech_modern_cowboy", "zombossmech_modern_future", "zombossmech_modern_dark",
            "zombossmech_modern_beach", "zombossmech_modern_iceage", "zombossmech_modern_lostcity", "zombossmech_modern_eighties", "zombossmech_modern_dino", "zombossmech_egypt2", "zombossmech_pirate2", "zombossmech_cowboy2",
            "zombossmech_future2", "zombossmech_dark2", "zombossmech_beach2", "zombossmech_iceage2", "zombossmech_lostcity2", "zombossmech_eighties2", "zombossmech_dino2", "zombossmech_modern1",
            "zombossmech_egypt_battlez", "zombossmech_dino_battlez", "zombossmech_lostcity_battlez", "zombossmech_cowboy_battlez", "zombossmech_pirate_battlez", "zombossmech_future_battlez", "zombossmech_iceage_battlez", "zombossmech_dark_battlez",
            "zombossmech_dark_rift", "zombossmech_pirate_rift", "zombossmech_cowboy_rift", "zombossmech_future_rift", "zombossmech_dino_rift", "zombossmech_iceage_rift", "zombossmech_beach_rift", "zombossmech_lostcity_rift",
            "zombossmech_iceage_battlez2", "zombossmech_eighties_rift", "zombossmech_eighties_battlez", "zombossmech_iceage_battlez3", "zombossmech_circus", "zombossmech_circus_battlez", "zombossmech_circus_rift", "zombossmech_roman",
            "zombossmech_roman_rift", "zombossmech_roman_battlez"
        ],
    "Todos": [] // Se llenará dinámicamente
};




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
    "marigold",
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
    "popcornpult"
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
    "Moderno": {
        display: "Moderno",
        internal: "modern",
        stages: ["ModernStage"],
        mowers: "ModernMowers"
    },
    "Egipto": {
        display: "Egipto", 
        internal: "egypt",
        stages: ["EgyptStage"],
        mowers: "EgyptMowers"
    },
    "Pirata": {
        display: "Pirata",
        internal: "pirate",
        stages: ["PirateStage"],
        mowers: "PirateMowers"
    },
    "Oeste": {
        display: "Oeste",
        internal: "west",
        stages: ["WestStage"],
        mowers: "WestMowers"
    },
    "Futuro": {
        display: "Futuro",
        internal: "future",
        stages: ["FutureStage"],
        mowers: "FutureMowers"
    },
    "Antiguo": {
        display: "Antiguo",
        internal: "roman",
        stages: ["RomanStage"],
        mowers: "RomanMowers"
    },
    "Edad de Hielo": {
        display: "Edad de Hielo",
        internal: "iceage",
        stages: ["IceageStage"],
        mowers: "IceageMowers"
    },
    "Atlantis": {
        display: "Atlantis",
        internal: "atlantis",
        stages: ["AtlantisStage", "AtlantisStageNight"],
        mowers: "BeachMowers"
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