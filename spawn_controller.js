//spawn_controller.js

//import constants
const constants = require('./constants');

//import classes
const PriorityQueue = require('./spawn_priorityQueue');

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
            this.spawnQueue = new PriorityQueue();
            this.spawnQueue.loadFromMemory(this.local_spawn.memory.spawnQueue);
            this.local_population = new Map();

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
        // Retrieve the local_creeps from the memory of the given spawn
        this.local_creeps_names = this.local_spawn.memory.local_creeps_names;

        // If there are no creeps in the room, return an empty Map
        if (!this.local_creeps_names || this.local_creeps_names.length === 0) {
            return new Map();
        }
        // clean up the local_creeps array
        for (let i = 0; i < this.local_creeps_names.length; i++) {
            if (!Game.creeps[this.local_creeps_names[i]]) {
                delete Memory.creeps[this.local_creeps_names[i]];
                this.local_creeps_names.splice(i, 1);
                i--;
            }
        }
        // Update the local_creeps array in memory
        this.local_spawn.memory.local_creeps_names = this.local_creeps_names;
        // Create a map of the current population of the room
        let roomPopulation = new Map();
        if (this.local_creeps_names) {
            roomPopulation.set(constants.CREEP_ROLE_HARVESTER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_HARVESTER).length);
            roomPopulation.set(constants.CREEP_ROLE_BUILDER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_BUILDER).length);
            roomPopulation.set(constants.CREEP_ROLE_DEFENDER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_DEFENDER).length);
            roomPopulation.set(constants.CREEP_ROLE_UPGRADER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_UPGRADER).length);
            roomPopulation.set(constants.CREEP_ROLE_REPAIRER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_REPAIRER).length);
            roomPopulation.set(constants.CREEP_ROLE_CARRIER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_CARRIER).length);
            roomPopulation.set(constants.CREEP_ROLE_MINER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_MINER).length);
            roomPopulation.set(constants.CREEP_ROLE_SCOUT, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_SCOUT).length);
            roomPopulation.set(constants.CREEP_ROLE_CLAIMER, this.local_creeps_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === constants.CREEP_ROLE_CLAIMER).length);
        }
        // Convert the Map to an array of key-value pairs
        // Save room population to room memory
        this.local_population = roomPopulation;
        this.local_spawn.room.memory.local_population = Array.from(roomPopulation.entries());
        return roomPopulation;
    }

    /**
     * Runs the creep roles for the room.
     */
    runLocalCreeps() {
        this.local_creep_names.forEach(creepName => {
            const creep = Game.creeps[creepName];
            if (creep) {
                let roleInstance;
                switch (creep.memory.role) {
                    case constants.CREEP_ROLE_HARVESTER:
                        roleInstance = new Harvester(creep);
                        break;
                    case constants.CREEP_ROLE_BUILDER:
                        roleInstance = new Builder(creep);
                        break;
                    case constants.CREEP_ROLE_DEFENDER:
                        roleInstance = new Defender(creep);
                        break;
                    case constants.CREEP_ROLE_UPGRADER:
                        roleInstance = new Upgrader(creep);
                        break;
                    case constants.CREEP_ROLE_REPAIRER:
                        roleInstance = new Repairer(creep);
                        break;
                    case constants.CREEP_ROLE_CARRIER:
                        roleInstance = new Carrier(creep);
                        break;
                    case constants.CREEP_ROLE_MINER:
                        roleInstance = new Miner(creep);
                        break;
                    case constants.CREEP_ROLE_SCOUT:
                        roleInstance = new Scout(creep);
                        break;
                    case constants.CREEP_ROLE_CLAIMER:
                        roleInstance = new Claimer(creep);
                        break;
                    default:
                        console.log(`Unknown role: ${creep.memory.role}`);
                        creep.say('🤔');
                        break;
                }
                if (roleInstance) {
                    roleInstance.run();
                }
            }
        });
    }

    /**
     * Updates the spawn queue for a given spawn.
     * @param spawnQueue - the spawn queue for the spawn
     */
    updateSpawnQueue(spawnQueue) {
        //check if spawnQueue is an instance of PriorityQueue
        if (!(spawnQueue instanceof PriorityQueue)) {
            console.log('spawnQueue is not an instance of PriorityQueue');
            return;
        }
        // Update the local spawnQueue and the spawnQueue in memory
        this.spawnQueue = spawnQueue;
        this.spawnQueue.saveToMemory(this.local_spawn.memory.spawnQueue);
    }
    
    /**
     * Processes the spawn queue for a given spawn.
     * This method should only be called by the PopulationController.
     */
    processSpawnQueue() {
        // print the spawn queue for debugging purposes
        //console.log(`Spawn Queue for ${this.local_spawn.name}:`);
        
        if(!this.local_spawn || this.local_spawn.spawning) return;
        while (!this.spawnQueue.isEmpty()) {
            const highestPriorityElement = this.spawnQueue.dequeue()
            this.spawnNewCreep(highestPriorityElement.item.role, highestPriorityElement.item.priority);
            console.log(`initialize spawn of: ${highestPriorityElement.item.role} with priority ${highestPriorityElement.priority}...`);
        }
    }
    
    /**
     * Spawns a creep with the given role.
     * @param role - the role of the creep
     * @returns {number} - the result of the spawn attempt
     */
    spawnNewCreep(role) {
        if(!this.local_spawn || this.local_spawn.spawning) return;

        const body = this.getDynamicBodyParts(role);
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
    
    /**
     * Returns the body parts for the given role.
     * @param role - the role of the creep
     * @returns {*} - the body parts for the given role
     */
    getDynamicBodyParts(role) {
        if (this.roleToBodyPartsMethod[role]) {
            return this.roleToBodyPartsMethod[role]();
        } else {
            console.log(`No body parts method defined for role: ${role}`);
            return [];
        }
    }
    
    getHarvesterBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 200) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            energyAvailable -= 200;
        }
        return body;
    }

    getBuilderBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 200) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            energyAvailable -= 200;
        }
        return body;
    }

    getDefenderBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 130) {
            body.push(ATTACK);
            body.push(MOVE);
            energyAvailable -= 130;
        }
        return body;
    }

    getUpgraderBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 200) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            energyAvailable -= 200;
        }
        return body;
    }

    getRepairerBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 200) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            energyAvailable -= 200;
        }
        return body;
    }

    getCarrierBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 150) {
            body.push(CARRY);
            body.push(CARRY);
            body.push(MOVE);
            energyAvailable -= 150;
        }
        return body;
    }

    getMinerBodyParts() {
        let energyAvailable = this.local_spawn_1.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 250) {
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
            energyAvailable -= 250;
        }
        return body;
    }

    getScoutBodyParts() {
        return [MOVE]; // Scouts only need to move
    }

    getClaimerBodyParts() {
        return [CLAIM, MOVE]; // Claimers need to claim and move
    }
    
}

module.exports = SpawnController;