// Este archivo contiene las categorías de zombies
const ZOMBIE_CATEGORIES = {
    "Moderno": [
            "tutorial", "tutorial_armor1", "tutorial_armor2", "tutorial_armor4", "tutorial_balloon", 
            "tutorial_flag", "tutorial_flag_veteran", "modern_newspaper", "modern_balloon", 
            "modern_allstar", "modern_superfanimp", "zombossmech_modern1", "modern_screendoor",
            "modern_screendoor_bucket", "modern_screendoor_brick", "modern_ladder", "modern_miner",
            "modern_polevaulter", "home_allstardark"
        ],

        "journey":[
            "journey_west", "journeywest_armor1", "journeywest_armor2",
            "journeywest_flag", "journeywest_balloo", "journeywest_allstar", "journeywest_superfan"
        ],
        
        "Egipto": [
            "mummy", "mummy_armor1", "mummy_armor2", "mummy_armor4", "mummy_flag", "mummy_flag_veteran",
            "camel_almanac", "camel_onehump", "camel_twohump", "camel_manyhump", "camel_segment",
            "camel_onehump_touch", "camel_twohump_touch", "camel_manyhump_touch", "camel_segment_touch",
            "pharaoh", "ra", "tomb_raiser", "explorer", "explorer_veteran", "egypt_gargantuar", 
            "egypt_imp", "zombossmech_egypt", "zombossmech_egypt2", "zombossmech_egypt_battlez",
            "zombossmech_egypt_rift", "solarsage_enlightened", "cleopatra", "tomb_raiser_veteran",
            "konfu_explorer"
        ],
        
        "Pirata": [
            "pirate", "pirate_armor1", "pirate_armor2", "pirate_armor4", "pirate_flag", "pirate_flag_veteran",
            "barrelroller", "cannon", "pirate_imp", "seagull", "pelican", "pirate_captain", 
            "pirate_captain_parrot", "swashbuckler", "pirate_barrel", "pirate_gargantuar",
            "zombossmech_pirate", "zombossmech_pirate_battlez", "zombossmech_pirate_rift",
            "zombossmech_pirate2", "hero_barrelroller", "hero_barrel", "pirate_buccaneer_swashbuckler",
            "pirate_buccaneer", "pirate_anchor", "lunar_cannon"
        ],
        
        "Oeste": [
            "cowboy", "cowboy_armor1", "cowboy_armor2", "cowboy_armor4", "cowboy_flag", "cowboy_flag_veteran",
            "prospector", "west_bullrider", "west_bull", "west_bull_veteran", "poncho", "poncho_no_plate",
            "poncho_plate", "piano", "chicken_farmer", "chicken", "chicken_battlez", "cowboy_gargantuar",
            "zombossmech_cowboy", "zombossmech_cowboy2", "zombossmech_cowboy_battlez", "zombossmech_cowboy_rift",
            "fairy_knight", "journeywest_miner"
        ],
        
        "Futuro": [
            "mech_cone", "mech_cone_veteran", "football_mech", "disco_mech", "future", "future_armor1",
            "future_armor2", "future_armor4", "future_flag", "future_flag_veteran", "future_jetpack",
            "future_jetpack_veteran", "future_jetpack_disco", "future_gargantuar", "future_imp",
            "future_protector", "future_protector_veteran", "zombossmech_future", "zombossmech_future2",
            "zombossmech_future_battlez", "zombossmech_future_rift", "children_toycar"
        ],
        
        "Dark Ages": [
            "dark", "dark_armor1", "dark_armor2", "dark_flag", "dark_flag_veteran", "dark_armor3",
            "dark_armor4", "dark_imp", "dark_imp_dragon", "dark_gargantuar", "dark_wizard", 
            "dark_wizard_veteran", "dark_juggler", "dark_king", "zombossmech_dark", "zombossmech_dark2",
            "zombossmech_dark_battlez", "zombossmech_dark_rift", "kongfu_juggler"
        ],
        
        "Playa": [
            "beach", "beach_armor1", "beach_armor2", "beach_flag", "beach_fem", "beach_fem_armor1",
            "beach_fem_armor2", "beach_snorkel", "beach_surfer", "beach_fastswimmer", "beach_imp",
            "beach_gargantuar", "beach_fisherman", "beach_octopus", "zombossmech_beach", 
            "zombossmech_beach_rift", "zombossmech_beach2", "duckytube", "duckytube_armor1",
            "duckytube_armor2", "beach_shell"
        ],

        "Iceage": [
        "iceage_ski","iceage_walrus", "iceagearmor3_elite","iceagehunter_elite","nether_dodo",
        "joustyeti","iceage","iceage_armor1","iceage_armor2","iceage_armor3","iceage_flag",
        "iceage_hunter","iceage_imp","iceage_dodo","iceage_troglobite_1block","iceage_troglobite_2block",
        "iceage_troglobite","iceage_weaselhoarder","iceage_gargantuar","caketankfeastivus","feastivus_swashbuckler",
        "feastivus_piano","feastivus","feastivus_armor1","feastivus_armor2","feastivus_flag",
        "holiday_imp","holiday_gargantuar","birthday_troglobite_1block","birthday_troglobite_2block",
        "birthday_troglobite","feastivus_camel_onehump","feastivus_camel_twohump","feastivus_camel_manyhump",
        "newspaper_veteran","birthday_juggler","nutcracker","zombie_bobsled_team","zomboni","raincoat"
    ],
        
        "Lost City": [
            "lostcity_impporter", "lostcity_excavator", "lostcity", "lostcity_armor1", "lostcity_armor2",
            "lostcity_flag", "lostcity_jane", "lostcity_lostpilot", "lostcity_bug", "lostcity_bug_armor1",
            "lostcity_bug_armor2", "lostcity_crystalskull", "lostcity_imp", "lostcity_gargantuar",
            "lostcity_relichunter", "zombossmech_lostcity", "zombossmech_lostcity2",
            "zombossmech_lostcity_battlez", "zombossmech_lostcity_rift", "lostcity_mumbahlord",
            "bungee_housepilot"
        ],
        
        "Años 80": [
            "eighties", "eighties_armor1", "eighties_armor2", "eighties_8bit", "eighties_8bit_armor1",
            "eighties_8bit_armor2", "eighties_flag", "eighties_imp", "eighties_gargantuar", "eighties_punk",
            "eighties_mc", "eighties_breakdancer", "eighties_glitter", "eighties_boombox", "eighties_arcade",
            "zombossmech_eighties", "zombossmech_eighties2", "zombossmech_eighties_rift",
            "zombossmech_eighties_battlez"
        ],
        
        "Dino": [
            "dino", "dino_armor1", "dino_armor2", "dino_armor3", "dino_armor4", "dino_bully",
            "dino_bully_veteran", "dino_flag", "dino_flag_veteran", "dino_imp", "dino_gargantuar",
            "zombossmech_dino", "zombossmech_dino2", "zombossmech_dino_battlez", "zombossmech_dino_rift"
        ],
        
        "Romano": [
            "roman", "roman_armor1", "roman_armor2", "roman_armor3", "roman_armor4", "roman_flag",
            "roman_healer", "roman_shield_almanac", "roman_shield_triad", "roman_shield_pair",
            "roman_segment", "roman_shield_top", "roman_gargantuar", "roman_imp", "roman_ballista",
            "zombossmech_roman", "zombossmech_roman_rift", "zombossmech_roman_battlez",
            "general_caesar_phase1", "general_caesar_phase2", "general_caesar_phase3", "roman_medusa",
            "zombie_statue", "poseidon_assistant"
        ],
        
        "ZCorp": [
            "zcorp_gargantuar", "zcorp_imp", "zcorp", "zcorp_armor1", "zcorp_armor2", "zcorp_fem",
            "zcorp_fem_armor1", "zcorp_fem_armor2", "zcorp_flag", "zcorp_consultant", "zcorp_helpdesk",
            "zcorp_racer_chair", "zcorp_racer"
        ],
        
        "Carnival": [
            "carnie", "carnie_armor1", "carnie_armor2", "carnie_flag", "carnie_cannon", "carnie_imp",
            "carnie_imp_twins", "carnie_imp_split", "carnie_gargantuar", "carnie_armor4", "carnie_monkey",
            "carnie_magician", "carnie_firebreather", "carnie_dove", "carnie_stiltwalker",
            "zombossmech_circus", "zombossmech_circus_battlez", "zombossmech_circus_rift", "carnie_fog",
            "carnie_fogcero"
        ],

        "Haloween":[
           "skeletoon" ,"skeletoon_armor1","skeletoon_armor2","halloween_anchor","halloween","halloween_flag",
           "halloween_imp","pumkin_captain","zombie_pumkim_ghosh","halloween_armor1","sportzball_wizard","summer_bug_armor1",
           "summer_imp"
        ],
        
        "Fairy":[
            "fairytale","fairytale_armor1","fairytale_armor2","fairytale_flag","fairytale_gargantuar",
            "fairytale_imp_run","fairy_witch"
        ],
        
        "Suburbios": [
            "parkour_gargantuar", "parkour_imp", "needforspeed_speed", "needforspeed_armor1",
            "needforspeed_armor2", "needforspeed_flag", "needforspeed_gargantuar", "needforspeed_imp"
        ],

        "Renai": [
            "renai_worker", "renai_armor1", "renai_armor2", "renai_flag",
            "renai_gargantuar", "renai_imp", "renai_ballet", "ballet_imp","renai_roller","renai_gliding","renai_perfumer","renai_shylock"
        ]
};