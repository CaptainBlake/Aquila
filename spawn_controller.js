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
        this.local_spawns = [spawn, null, null];
        this.spawnQueue = [];
        this.local_creeps = [];
        this.current_harvesters = 0;
        this.current_builders = 0;
        this.current_defenders = 0;
        this.current_upgraders = 0;
        this.current_repairers = 0;
        this.current_carriers = 0;
        this.current_miners = 0;
        this.current_scouts = 0;
        this.current_claimers = 0;
    }

    /**
     * Initializes the spawn queue for the spawn.
     */
    initializeSpawnQueue() {
        this.local_spawns.forEach((spawn, index) => {
            if(!spawn) return;
            if (!spawn.memory.spawnQueue) {
                spawn.memory.spawnQueue = [];
            }
            this.spawnQueue[index] = new PriorityQueue(spawn.memory.spawnQueue);
        });
    }

    /**
     * Checks the population of the room.
     */
    checkLocalPopulation() {
        for (let i = 0; i < this.local_creeps.length; i++) {
            if (!Game.creeps[this.local_creeps[i].name]) {
                delete Memory.creeps[this.local_creeps[i].name];
                this.local_creeps.splice(i, 1);
                i--;
            }
        }

        if (this.local_creeps) {
            this.current_harvesters = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_HARVESTER).length;
            this.current_builders = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_BUILDER).length;
            this.current_defenders = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_DEFENDER).length;
            this.current_upgraders = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_UPGRADER).length;
            this.current_repairers = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_REPAIRER).length;
            this.current_carriers = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_CARRIER).length;
            this.current_miners = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_MINER).length;
            this.current_scouts = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_SCOUT).length;
            this.current_claimers = this.local_creeps.filter(creep => creep.memory && creep.memory.role === constants.CREEP_ROLE_CLAIMER).length;
        }
        console.log(
            "total harvesters: " + this.current_harvesters + "\n" + 
            "total builders: " + this.current_builders + "\n" +
            "total defenders: " + this.current_defenders + "\n" +
            "total upgraders: " + this.current_upgraders + "\n" +
            "total repairers: " + this.current_repairers + "\n" +
            "total carriers: " + this.current_carriers + "\n" +
            "total miners: " + this.current_miners + "\n" +
            "total scouts: " + this.current_scouts + "\n" +
            "total claimers: " + this.current_claimers + "\n" +
            "total creeps: " + this.local_creeps.length + "\n");
    }

    /**
     * Returns a map of the current population of the room.
     * @returns {Map<any, any>} - a map of the current population of the room
     */
    getLocalPopulation() {
        let roomPopulation = new Map();

        roomPopulation.set(constants.CREEP_ROLE_HARVESTER, this.current_harvesters);
        roomPopulation.set(constants.CREEP_ROLE_BUILDER, this.current_builders);
        roomPopulation.set(constants.CREEP_ROLE_DEFENDER, this.current_defenders);
        roomPopulation.set(constants.CREEP_ROLE_UPGRADER, this.current_upgraders);
        roomPopulation.set(constants.CREEP_ROLE_REPAIRER, this.current_repairers);
        roomPopulation.set(constants.CREEP_ROLE_CARRIER, this.current_carriers);
        roomPopulation.set(constants.CREEP_ROLE_MINER, this.current_miners);
        roomPopulation.set(constants.CREEP_ROLE_SCOUT, this.current_scouts);
        roomPopulation.set(constants.CREEP_ROLE_CLAIMER, this.current_claimers);

        return roomPopulation;
    }

    /**
     * Runs the creep roles for the room.
     */
    runLocalCreeps() {
        this.local_creeps.forEach(creep => {
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
        });
    }

    /**
     * Processes the spawn queue for a given spawn.
     * This method should only be called by the PopulationController.
     */
    processSpawnQueue() {
        this.local_spawns.forEach((spawn, index) => {
            if(!spawn || spawn.spawning) return;
            while (!this.spawnQueue[index].isEmpty()) {
                const highestPriorityElement = this.spawnQueue[index].dequeue();
                this.spawnCreep(highestPriorityElement.item.role, highestPriorityElement.item.priority);
            }
            spawn.memory.spawnQueue = this.spawnQueue[index].items;
        });
    }

    /**
     * Adds a creep to the spawn queue.
     * @param role - the role of the creep
     * @param priority - the priority of the creep
     */
    addToSpawnQueue(role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        for (let spawn of this.local_spawns) {
            if (spawn && !spawn.spawning) {
                spawn.memory.spawnQueue.enqueue({ role }, priority);
                return;
            }
        }
    }

    /**
     * Spawns a creep with the given role.
     * @param role - the role of the creep
     * @param priority - the priority of the creep
     */
    spawnCreep(role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        const body = this.getDynamicBodyParts(role);

        for (let spawn of this.local_spawns) {
            if (spawn && !spawn.spawning) {
                const result = spawn.spawnCreep(body, `${role}_${Game.time}`, {
                    memory: {
                        role: role,
                        state: 'initializing',
                        target: null,
                        home: spawn.room.name,
                        workParts: body.filter(part => part === WORK).length,
                        priority: priority,
                        born: Game.time
                    }
                });
                // If the spawn was successful, add the creep to the local_creeps array
                if (result === OK) {
                    console.log(`Spawning new creep: ${role}_${Game.time}`);
                    const creep = Game.creeps[`${role}_${Game.time}`];
                    creep.memory.role = role;
                    this.local_creeps.push(creep); // Add the new creep to the local_creeps array
                }
                else{
                    console.log(`Error spawning creep: ${result}`);
                }
                if (result === OK) {
                    break;
                }
            }
        }
    }

    /**
     * Returns the body parts for the given role.
     * @param role - the role of the creep
     * @returns {*} - the body parts for the given role
     */
    getDynamicBodyParts(role) {
        const roleToBodyPartsMethod = {
            [constants.CREEP_ROLE_HARVESTER]: this.getHarvesterBodyParts,
            [constants.CREEP_ROLE_BUILDER]: this.getBuilderBodyParts,
            [constants.CREEP_ROLE_DEFENDER]: this.getDefenderBodyParts,
            [constants.CREEP_ROLE_UPGRADER]: this.getUpgraderBodyParts,
            [constants.CREEP_ROLE_REPAIRER]: this.getRepairerBodyParts,
            [constants.CREEP_ROLE_CARRIER]: this.getCarrierBodyParts,
            [constants.CREEP_ROLE_MINER]: this.getMinerBodyParts,
            [constants.CREEP_ROLE_SCOUT]: this.getScoutBodyParts,
            [constants.CREEP_ROLE_CLAIMER]: this.getClaimerBodyParts,
        };
        return roleToBodyPartsMethod[role]();
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