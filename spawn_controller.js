//spawn_controller.js

//import constants
const constants = require('./constants');

//import roles
const Harvester = require("./role_harvester");
const Builder = require("./role_builder");
const Defender = require("./role_defender");
const Upgrader = require("./role_upgrader");
const Repairer = require("./role_repairer");
const Carrier = require("./role_carrier");
const Miner = require("./role_miner");
const Scout = require("./role_scout");
const Claimer = require("./role_claimer");


/**
 * SpawnController is responsible for spawning creeps and managing the spawn queue.
 * The spawn queue is a priority queue that determines the order in which creeps are spawned.
 * Creeps are spawned based on their priority.
 * The spawn queue is implemented using the PriorityQueue class.
 */
class SpawnController {

    constructor(spawn = null) {
        if (spawn) {
            this.name = spawn.name + "_Controller";
            this.local_spawn = spawn;
            this.local_creep_names = [];
            this.spawnQueue = [];

            // Load spawnQueue from memory
            if (this.local_spawn.memory.spawnQueue) {
                this.spawnQueue = this.local_spawn.memory.spawnQueue;
            }
            
            this.roleToBodyPartsMethod = {
                [constants.CREEP_ROLE_HARVESTER]: this.getHarvesterBodyParts.bind(this),
                [constants.CREEP_ROLE_BUILDER]: this.getBuilderBodyParts.bind(this),
                [constants.CREEP_ROLE_DEFENDER]: this.getDefenderBodyParts.bind(this),
                [constants.CREEP_ROLE_UPGRADER]: this.getUpgraderBodyParts.bind(this),
                [constants.CREEP_ROLE_REPAIRER]: this.getRepairerBodyParts.bind(this),
                [constants.CREEP_ROLE_CARRIER]: this.getCarrierBodyParts.bind(this),
                [constants.CREEP_ROLE_MINER]: this.getMinerBodyParts.bind(this),
                [constants.CREEP_ROLE_SCOUT]: this.getScoutBodyParts.bind(this),
                [constants.CREEP_ROLE_CLAIMER]: this.getClaimerBodyParts.bind(this),
            };
        }
    }
    
    /**
     * Checks the population of the room and returns a map of the current population.
     * @returns {Map<any, any>} - a map of the current population of the room
     */
    getLocalPopulationTable() {
        let roomPopulation = new Map();
        // Retrieve all creeps in the room
        let creepsInRoom = _.filter(Game.creeps, (creep) => creep.room.name === this.local_spawn.room.name);
        // Initialize local_creeps_names as an empty array
        this.local_creeps_names = [];
        // Load local_creeps_names from memory
        if (this.local_spawn.memory.local_creeps_names) {
            this.local_creeps_names = this.local_spawn.memory.local_creeps_names;
        }
        // Iterate through the creeps and add them to local_creeps_names if their home is the current room
        for (let creepName in creepsInRoom) {
            let creep = creepsInRoom[creepName];
            if (creep.memory.home === this.local_spawn.room.name && !this.local_creeps_names.includes(creep.name)) {
                console.log(`Adding ${creep.name} to local_creeps_names`);
                this.local_creeps_names.push(creep.name);
            }
        }
        // Save local_creeps_names to memory
        this.local_spawn.memory.local_creeps_names = this.local_creeps_names;
        // Create a map of the current population of the room
        for (let role in constants) {
            roomPopulation.set(role, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === role).length);
        }
        // Convert the Map to an array of key-value pairs
        // Save room population to room memory
        this.local_spawn.room.memory.local_population = Array.from(roomPopulation.entries());
        // Update the local_creeps array in memory
        this.local_spawn.memory.local_creeps_names = this.local_creeps_names;
        return roomPopulation;
    }

    /**
     * Runs the creep roles for the room.
     */
    runLocalCreeps() {
        const ROLE_TO_CLASS = {
            [constants.CREEP_ROLE_HARVESTER]: Harvester,
            [constants.CREEP_ROLE_BUILDER]: Builder,
            [constants.CREEP_ROLE_DEFENDER]: Defender,
            [constants.CREEP_ROLE_UPGRADER]: Upgrader,
            [constants.CREEP_ROLE_REPAIRER]: Repairer,
            [constants.CREEP_ROLE_CARRIER]: Carrier,
            [constants.CREEP_ROLE_MINER]: Miner,
            [constants.CREEP_ROLE_SCOUT]: Scout,
            [constants.CREEP_ROLE_CLAIMER]: Claimer,
        };

        this.local_creep_names.forEach(creepName => {
            const creep = Game.creeps[creepName];
            if (creep) {
                const RoleClass = ROLE_TO_CLASS[creep.memory.role];
                if (RoleClass) {
                    const roleInstance = new RoleClass(creep);
                    console.log(`Running ${creep.name} as ${creep.memory.role}`);
                    roleInstance.run();
                } else {
                    console.log(`Unknown role: ${creep.memory.role}`);
                    creep.say('🤔');
                }
            }
        });
    }

    /**
     * Updates the spawn queue for a given spawn.
     * @param SpawnQueue
     */
    updateSpawnQueue(SpawnQueue) {
        if (!Array.isArray(SpawnQueue)) {
            console.log('newSpawnQueue is not an array');
            return;
        }
        this.spawnQueue = SpawnQueue;
        // Save spawnQueue to memory
        this.local_spawn.memory.spawnQueue = this.spawnQueue;
    }
    
    /**
     * Processes the spawn queue for a given spawn.
     * This method should only be called by the PopulationController.
     */
    processSpawnQueue() {
        if (!this.local_spawn || this.local_spawn.spawning) return;
        // Sort spawnQueue based on priority
        this.spawnQueue.sort((a, b) => a.priority - b.priority);
        // Spawn the creep with the highest priority
        if (this.spawnQueue.length > 0) {
            const creepRole = this.spawnQueue[0].role;
            if (this.isSpawnable(creepRole)) {
                this.spawnNewCreep(creepRole);
            }else{
                //console.log(`Cannot spawn ${creepRole} due to insufficient resources or spawn is busy.` + ` \nAvailable energy: ${this.local_spawn.room.energyAvailable}` + ` \nSpawn busy: ${this.local_spawn.spawning}` + ` \nCreep cost: ${this.getBodyPartsForRole(creepRole).length * 50}`);
            }
        }
    }
    
    isSpawnable(role) {
        if(!this.local_spawn || this.local_spawn.spawning){
            return false;
        }
        const body = this.getBodyPartsForRole(role);
        // Use dryRun function to check if the creep can be built
        const result = this.local_spawn.spawnCreep(body, `${role}_${Game.time}`, {dryRun: true});
        return result === OK;
    }
    
    /**
     * Spawns a creep with the given role.
     * @param role - the role of the creep
     */
    spawnNewCreep(role) {
        
        const body = this.getBodyPartsForRole(role);
        const result = this.local_spawn.spawnCreep(body, `${role}_${Game.time}`, {
            memory: {
                role: role,
                state: 'initializing',
                target: null,
                home: this.local_spawn.room.name,
                workParts: body.filter(part => part === WORK).length,
                born: Game.time
            }
        });

        // If the spawn was successful, add the creep to the local_creeps array
        if (result === OK) {
            console.log(`Spawning new creep: ${role}_${Game.time}`);
            const creepName = `${role}_${Game.time}`;
            Game.creeps[creepName].memory.role = role;
            this.local_creep_names.push(creepName);
        }
        else{
            console.log(`Error spawning creep: ${result}`);
        }
    }
    // BODY PARTS
    // TODO: outsource body parts to a separate prototype class for each role (e.g. HarvesterBodyParts)

    // Body part costs
    // * move: 50
    // * work: 100
    // * attack: 80
    // * carry: 50
    // * heal: 250
    // * ranged_attack: 150
    // * tough: 10
    // * claim: 600
    
    // link: https://docs.screeps.com/api/#Constants
    
    getBodyPartsForRole(role) {
        if (this.roleToBodyPartsMethod[role]) {
            return this.roleToBodyPartsMethod[role]();
        } else {
            console.log(`No body parts method defined for role: ${role}`);
            return [];
        }
    }

    getHarvesterBodyParts() {
        return [WORK, CARRY, MOVE];
    }

    getBuilderBodyParts() {
        return [WORK, CARRY, MOVE];
    }

    getDefenderBodyParts() {
        return [ATTACK, MOVE];
    }

    getUpgraderBodyParts() {
        return [WORK, CARRY, MOVE];
    }

    getRepairerBodyParts() {
        return [WORK, CARRY, MOVE];
    }

    getCarrierBodyParts() {
        return [CARRY, CARRY, MOVE];
    }

    getMinerBodyParts() {
        return [WORK, WORK, WORK, WORK, WORK, MOVE];
    }
    
    getScoutBodyParts() {
        return [MOVE];
    }
    
    getClaimerBodyParts() {
        return [CLAIM, MOVE];
    }
    
}

module.exports = SpawnController;