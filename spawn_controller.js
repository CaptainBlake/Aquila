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
    constructor() {
        this.local_spawn = null;
        this.spawnQueue = null;
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

    initializeSpawnController(spawn) {
        this.local_spawn = spawn;
        if (!this.local_spawn.memory.spawnQueue) {
            this.local_spawn.memory.spawnQueue = [];
        }
        this.spawnQueue = new PriorityQueue(this.local_spawn.memory.spawnQueue);
    }

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
    }

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
        while (!this.spawnQueue.isEmpty()) {
            if (this.local_spawn.spawning) return;
            if (!this.local_spawn.memory.spawnQueue.isEmpty()) {
                const highestPriorityElement = this.local_spawn.memory.spawnQueue.dequeue();
                this.spawnCreep(highestPriorityElement.item.role, highestPriorityElement.item.priority);
            }
        }
        this.local_spawn.memory.spawnQueue = this.spawnQueue.items;
    }

    addToSpawnQueue(role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        this.local_spawn.memory.spawnQueue.enqueue({ role }, priority);
    }

    spawnCreep(role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        const body = this.getDynamicBodyParts(role);

        if (!this.local_spawn.spawning) {
            const result = this.local_spawn.spawnCreep(body, `${role}_${Game.time}`, {
                memory: { role, priority },
            });

            if (result === OK) {
                console.log(`Spawning new creep: ${role}_${Game.time}`);
                const creep = Game.creeps[`${role}_${Game.time}`];
                creep.memory.role = role;
                this.local_creeps.push(creep); // Add the new creep to the local_creeps array
                // Increment the current count for the given role
                switch (role) {
                    case constants.CREEP_ROLE_HARVESTER:
                        this.current_harvesters++;
                        break;
                    case constants.CREEP_ROLE_BUILDER:
                        this.current_builders++;
                        break;
                    case constants.CREEP_ROLE_DEFENDER:
                        this.current_defenders++;
                        break;
                    case constants.CREEP_ROLE_UPGRADER:
                        this.current_upgraders++;
                        break;
                    case constants.CREEP_ROLE_REPAIRER:
                        this.current_repairers++;
                        break;
                    case constants.CREEP_ROLE_CARRIER:
                        this.current_carriers++;
                        break;
                    case constants.CREEP_ROLE_MINER:
                        this.current_miners++;
                        break;
                    case constants.CREEP_ROLE_SCOUT:
                        this.current_scouts++;
                        break;
                    case constants.CREEP_ROLE_CLAIMER:
                        this.current_claimers++;
                        break;
                }
            }
            else{
                console.log(`Error spawning creep: ${result}`);
            }
        }
    }

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
        let energyAvailable = this.local_spawn.room.energyAvailable;
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
        let energyAvailable = this.local_spawn.room.energyAvailable;
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
        let energyAvailable = this.local_spawn.room.energyAvailable;
        let body = [];
        while (energyAvailable >= 130) {
            body.push(ATTACK);
            body.push(MOVE);
            energyAvailable -= 130;
        }
        return body;
    }

    getUpgraderBodyParts() {
        let energyAvailable = this.local_spawn.room.energyAvailable;
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
        let energyAvailable = this.local_spawn.room.energyAvailable;
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
        let energyAvailable = this.local_spawn.room.energyAvailable;
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
        let energyAvailable = this.local_spawn.room.energyAvailable;
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