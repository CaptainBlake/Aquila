// spawn_controller.js
const constants = require('constants');
const basic_creep_functions = require('basic_creep_functions');

const SpawnController = {

    // Initialize spawnQueue in memory if not present
    initializeSpawnQueue: function (spawn) {
        if (!spawn.memory.spawnQueue) {
            spawn.memory.spawnQueue = [];
        }
    },
    
    
    spawnCreep: function (spawn, role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        // Logic to determine body parts based on role
        const body = this.getBodyParts(role);

        // Check if spawn is busy
        if (!spawn.spawning) {
            // Spawn the creep
            const result = spawn.spawnCreep(body, `${role}_${Game.time}`, {
                memory: { role, priority },
            });

            if (result === OK) {
                // Remove the spawned creep from the spawn queue
                this.removeFromSpawnQueue(spawn);
            }
        }
    },

    // Logic to determine body parts based on role
    //TODO: add body part configuration for each role
    //TODO: add body part configuration for each room level
    //TODO: add body part configuration for each spawn level
    /*
    getBodyParts: function (role) {
        // Define body parts based on role
        switch (role) {
            case constants.CREEP_ROLE_HARVESTER:
                return basic_creep_functions.harvesterBody();
            case constants.CREEP_ROLE_BUILDER:
                return basic_creep_functions.builderBody();
            case constants.CREEP_ROLE_DEFENDER:
                return basic_creep_functions.defenderBody();
            // Add more cases for other roles as needed
            default:
                return [];
        }
    },
    */
    
    //hardcoded body parts for each role (for now)
    getBodyParts(role) {
        // Hardcoded body parts based on role
        switch (role) {
            case constants.CREEP_ROLE_HARVESTER:
                return [WORK, CARRY, MOVE];
            case constants.CREEP_ROLE_BUILDER:
                return [WORK, CARRY, MOVE];
            case constants.CREEP_ROLE_DEFENDER:
                return [ATTACK, MOVE];
            // Add more cases for other roles as needed
            default:
                return [];
        }
    },

    addToSpawnQueue: function (spawn, role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        // Add creep request to the spawn queue
        // Ensure spawnQueue is initialized
        this.initializeSpawnQueue(spawn);
        spawn.memory.spawnQueue.push({ role, priority });
    },

    removeFromSpawnQueue: function (spawn) {
        // Remove the first element from the spawn queue
        spawn.memory.spawnQueue.shift();
    },

    processSpawnQueue: function (spawn) {
        const queue = spawn.memory.spawnQueue;

        if (queue.length > 0) {
            const { role, priority } = queue[0];
            this.spawnCreep(spawn, role, priority);
        }
    },
};

module.exports = SpawnController;
