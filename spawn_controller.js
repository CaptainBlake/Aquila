//spawn_controller.js

//import constants
const constants = require('./constants');
//import priority queue
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
const SpawnController = {
    
    /**
     * Initializes the spawn queue for a given spawn.
     * @param spawn - the spawn to initialize the spawn queue for
     */
    initializeSpawnQueue: function (spawn) {
        if (!spawn.memory.spawnQueue) {
            spawn.memory.spawnQueue = new PriorityQueue();
        }
    },

    /**
     * Processes the spawn queue for a given spawn.
     * @param spawn - the spawn to process the spawn queue for
     */
    processSpawnQueue: function (spawn) {
        this.initializeSpawnQueue(spawn);

        if (spawn.spawning) return;

        if (!spawn.memory.spawnQueue.isEmpty()) {
            const highestPriorityElement = spawn.memory.spawnQueue.dequeue();
            if(highestPriorityElement === 'Underflow') return;
            this.spawnCreep(spawn, highestPriorityElement.item.role, highestPriorityElement.item.priority);
        }
    },

    /**
     * Adds a creep to the spawn queue for a given spawn.
     * this method should be called when a creep dies or when a new creep is needed.
     * @param spawn - the spawn to add the creep to the queue of
     * @param role - the role of the creep to be spawned
     * @param priority - the priority of the creep to be spawned
     */
    addToSpawnQueue: function (spawn, role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        this.initializeSpawnQueue(spawn);
        spawn.memory.spawnQueue.enqueue({ role }, priority);
    },

    /**
     * Spawns a creep with the given role.
     * this method should be called when a creep is spawned.
     * @param spawn - the spawn to spawn the creep from
     * @param role - the role of the creep to be spawned
     * @param priority - the priority of the creep to be spawned
     */
    spawnCreep: function (spawn, role, priority = constants.SPAWN_QUEUE_LOW_PRIORITY) {
        const body = this.getDynamicBodyParts(role);

        if (!spawn.spawning) {
            const result = spawn.spawnCreep(body, `${role}_${Game.time}`, {
                memory: { role, priority },
            });

            if (result === OK) {
                console.log(`Spawning new creep: ${role}_${Game.time}`);
                //outsource
                spawn.memory.spawnQueue.dequeue();
                const creep = Game.creeps[`${role}_${Game.time}`];
                //switch case for roles
                switch (role) {
                    case constants.CREEP_ROLE_HARVESTER:
                        const harvester = new Harvester(creep);
                        harvester.run();
                        break;
                    case constants.CREEP_ROLE_BUILDER:
                        const builder = new Builder(creep);
                        builder.run();
                        break;
                    case constants.CREEP_ROLE_DEFENDER:
                        const defender = new Defender(creep);
                        defender.run();
                        break;
                    case constants.CREEP_ROLE_UPGRADER:
                        const upgrader = new Upgrader(creep);
                        upgrader.run();
                        break;
                    case constants.CREEP_ROLE_REPAIRER:
                        const repairer = new Repairer(creep);
                        repairer.run();
                        break;
                    case constants.CREEP_ROLE_CARRIER:
                        const carrier = new Carrier(creep);
                        carrier.run();
                        break;
                    case constants.CREEP_ROLE_MINER:
                        const miner = new Miner(creep);
                        miner.run();
                        break;
                    case constants.CREEP_ROLE_SCOUT:
                        const scout = new Scout(creep);
                        scout.run();
                        break;
                    case constants.CREEP_ROLE_CLAIMER:
                        const claimer = new Claimer(creep);
                        claimer.run();
                        break;
                }
                // Add similar blocks for other roles
            }
        }
    },

    /**
     * Gets the body parts for a creep with the given role.
     * Dynamic body parts are body parts that are determined at runtime.
     * @param role - the role of the creep to get the body parts for
     * @returns {*[]} - the body parts for the creep
     */
    getDynamicBodyParts: function (role) {
        // TODO: implement dynamic body parts
        return [WORK, WORK, CARRY, MOVE];
    },
};

module.exports = SpawnController;