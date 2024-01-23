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

// Spawn queue priorities (lower number = higher priority)
const SPAWN_QUEUE_EMERGENCY_PRIORITY = 0;   // Player-defined emergency creeps
const SPAWN_QUEUE_CRITICAL_PRIORITY = 1;   // Creeps that are critical to colony survival
const SPAWN_QUEUE_HIGH_PRIORITY = 2;   // Creeps that are critical to colony survival
const SPAWN_QUEUE_MEDIUM_PRIORITY = 3   // Creeps that are important but not critical   
const SPAWN_QUEUE_LOW_PRIORITY = 4;   // Creeps that are not critical or important
const SPAWN_QUEUE_NO_PRIORITY = 5;   // Creeps that are not critical or important

// Pathfinding constants
const PATHFINDING_PLAIN_COST = 2;
const PATHFINDING_SWAMP_COST = 10;

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
    SPAWN_QUEUE_EMERGENCY_PRIORITY,
    SPAWN_QUEUE_CRITICAL_PRIORITY,
    SPAWN_QUEUE_HIGH_PRIORITY,
    SPAWN_QUEUE_MEDIUM_PRIORITY,
    SPAWN_QUEUE_LOW_PRIORITY,
    SPAWN_QUEUE_NO_PRIORITY,
    PATHFINDING_PLAIN_COST,
    PATHFINDING_SWAMP_COST,
};

module.exports = constants;