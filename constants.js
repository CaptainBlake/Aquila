// constants.js

// Creep roles
const CREEP_ROLE_HARVESTER = 'harvester';  // Creeps that harvest energy and deliver it to structures
const CREEP_ROLE_BUILDER = 'builder';  // Creeps that build structures
const CREEP_ROLE_DEFENDER = 'defender';  // Creeps that defend the colony
const CREEP_ROLE_UPGRADER = 'upgrader';  // Creeps that upgrade the controller
const CREEP_ROLE_REPAIRER = 'repairer';  // Creeps that repair structures
const CREEP_ROLE_CARRIER = 'carrier';  // Creeps that carry energy from containers to structures
const CREEP_ROLE_MINER = 'miner';  // Creeps that mine energy from a source
const CREEP_ROLE_SCOUT = 'scout';  // Creeps that scout out new rooms
const CREEP_ROLE_CLAIMER = 'claimer';  // Creeps that claim new rooms

// Creep roles as an array
const CREEP_ROLES = [
    CREEP_ROLE_HARVESTER,
    CREEP_ROLE_BUILDER,
    CREEP_ROLE_DEFENDER,
    CREEP_ROLE_UPGRADER,
    CREEP_ROLE_REPAIRER,
    CREEP_ROLE_CARRIER,
    CREEP_ROLE_MINER,
    CREEP_ROLE_SCOUT,
    CREEP_ROLE_CLAIMER
];

// Minimum number of creeps per role per room 
const MINIMUM_HARVESTERS = 2;
const MINIMUM_BUILDERS = 1;
const MINIMUM_DEFENDERS = 0;
const MINIMUM_UPGRADERS = 1;
const MINIMUM_REPAIRERS = 0;
const MINIMUM_CARRIERS = 0;
const MINIMUM_MINERS = 0;
const MINIMUM_SCOUTS = 0;
const MINIMUM_CLAIMERS = 0;

// Creep dead threshold
const FRESH_SPAWN_THRESHOLD = 12; // Number of ticks after spawning before creep is considered fresh

// Spawn queue priorities (lower number = higher priority)
const SPAWN_QUEUE_EMERGENCY_PRIORITY = 0;   // Player-defined emergency creeps
const SPAWN_QUEUE_CRITICAL_PRIORITY = 1;   // Creeps that are critical to colony survival
const SPAWN_QUEUE_HIGH_PRIORITY = 2;   // Creeps that are critical to colony survival
const SPAWN_QUEUE_MEDIUM_PRIORITY = 3   // Creeps that are important but not critical   
const SPAWN_QUEUE_LOW_PRIORITY = 4;   // Creeps that are not critical or important
const SPAWN_QUEUE_NO_PRIORITY = 5;   // Creeps that are not critical or important

// Energy thresholds
const ENERGY_THRESHOLD_TIER_1 = 300;
const ENERGY_THRESHOLD_TIER_2 = 500;
const ENERGY_THRESHOLD_TIER_3 = 800;

const ENERGY_MINIMUM_IN_SPAWN = 200; // Minimum energy in a room before creeps can withdraw energy

// Pathfinding constants
const PATHFINDING_IGNORE_CREEPS = true;
const PATHFINDING_PLAIN_COST = 2;
const PATHFINDING_SWAMP_COST = 10;


// Maps

// Map of creep roles to minimum number of creeps per role per room
const MINIMUM_ROLES_MAP = {
    [CREEP_ROLE_HARVESTER]: MINIMUM_HARVESTERS,
    [CREEP_ROLE_BUILDER]: MINIMUM_BUILDERS,
    [CREEP_ROLE_DEFENDER]: MINIMUM_DEFENDERS,
    [CREEP_ROLE_UPGRADER]: MINIMUM_UPGRADERS,
    [CREEP_ROLE_REPAIRER]: MINIMUM_REPAIRERS,
    [CREEP_ROLE_CARRIER]: MINIMUM_CARRIERS,
    [CREEP_ROLE_MINER]: MINIMUM_MINERS,
    [CREEP_ROLE_SCOUT]: MINIMUM_SCOUTS,
    [CREEP_ROLE_CLAIMER]: MINIMUM_CLAIMERS,
};


const STATES = {
    INITIALIZING: 'initializing',
    IDLE: 'idle',
    HARVESTING: 'harvesting',
    WORKING: 'working',
    RUNNING: 'running',
    DEFENDING: 'defending',
    ATTACKING: 'attacking',
    FLEEING: 'fleeing',
    HEALING: 'healing',
    REPAIRING: 'repairing',
    BUILDING: 'building',
    UPGRADING: 'upgrading',
    MINING: 'mining',
    SCOUTING: 'scouting',
    CLAIMING: 'claiming',
    COLLECTING: 'collecting',
};

const ATTRIBUTES = {
    ROLE: 'role',
    STATE: 'state',
    TARGET: 'target',
    HOME: 'home',
    WORK_PARTS: 'workParts',
    BORN: 'born',
    PATH: 'path',
    LAST_TARGET_POS: 'lastTargetPos',
    LAST_POSITION: 'lastPosition',
};

// Exported constants object
const constants = {
    CREEP_ROLE_HARVESTER,
    CREEP_ROLE_BUILDER,
    CREEP_ROLE_DEFENDER,
    CREEP_ROLE_UPGRADER,
    CREEP_ROLE_REPAIRER,
    CREEP_ROLE_CARRIER,
    CREEP_ROLE_MINER,
    CREEP_ROLE_SCOUT,
    CREEP_ROLE_CLAIMER,
    
    CREEP_ROLES,
    
    MINIMUM_HARVESTERS,
    MINIMUM_BUILDERS,
    MINIMUM_DEFENDERS,
    MINIMUM_UPGRADERS,
    MINIMUM_REPAIRERS,
    MINIMUM_CARRIERS,
    MINIMUM_MINERS,
    MINIMUM_SCOUTS,
    MINIMUM_CLAIMERS,
    
    FRESH_SPAWN_THRESHOLD,
    
    SPAWN_QUEUE_EMERGENCY_PRIORITY,
    SPAWN_QUEUE_CRITICAL_PRIORITY,
    SPAWN_QUEUE_HIGH_PRIORITY,
    SPAWN_QUEUE_MEDIUM_PRIORITY,
    SPAWN_QUEUE_LOW_PRIORITY,
    SPAWN_QUEUE_NO_PRIORITY,
    
    ENERGY_THRESHOLD_TIER_1,
    ENERGY_THRESHOLD_TIER_2,
    ENERGY_THRESHOLD_TIER_3,
    
    ENERGY_MINIMUM_IN_SPAWN,
    
    PATHFINDING_PLAIN_COST,
    PATHFINDING_SWAMP_COST,
    
    MINIMUM_ROLES_MAP,
    STATES,
    ATTRIBUTES
};

module.exports = constants;