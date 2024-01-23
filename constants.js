// constants.js

// Creep roles
const CREEP_ROLE_HARVESTER = 'harvester';  // Creeps that harvest energy and deliver it to structures
const CREEP_ROLE_BUILDER = 'builder';  // Creeps that build structures
const CREEP_ROLE_DEFENDER = 'defender';  // Creeps that defend the colony

// Spawn queue priorities
const SPAWN_QUEUE_HIGH_PRIORITY = 'highPriority';   // Creeps that are critical to colony survival
const SPAWN_QUEUE_MEDIUM_PRIORITY = 'mediumPriority';   // Creeps that are important but not critical   
const SPAWN_QUEUE_LOW_PRIORITY = 'lowPriority';   // Creeps that are not critical or important

// Room plan memory keys
const ROOM_PLAN_KEY = 'roomPlan';   // Key for storing room plan in memory
const ROOM_PLAN_VALUE = 'roomPlanValue';   // Key for storing room plan value in memory
const ROOM_PLAN_PRIORITY = 'roomPlanPriority';   // Key for storing room plan priority in memory

// Exported constants object
const constants = {
    CREEP_ROLE_HARVESTER,
    CREEP_ROLE_BUILDER,
    CREEP_ROLE_DEFENDER,
    SPAWN_QUEUE_HIGH_PRIORITY,
    SPAWN_QUEUE_MEDIUM_PRIORITY,
    SPAWN_QUEUE_LOW_PRIORITY,
    ROOM_PLAN_KEY,
    ROOM_PLAN_VALUE,
    ROOM_PLAN_PRIORITY,
    // ... add more constants as needed
};

module.exports = constants;