'use strict';
//spawn_controller.js

//import constants
const constants = require('./constants');

//import roles
const roleHarvester = require('./role_harvester');
const roleBuilder = require('./role_builder');
const roleDefender = require('./role_defender');
const roleUpgrader = require('./role_upgrader');
const roleRepairer = require('./role_repairer');
const roleCarrier = require('./role_carrier');
const roleMiner = require('./role_miner');
const roleScout = require('./role_scout');
const roleClaimer = require('./role_claimer');

//import lodash
const {forEach} = require("lodash");

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
            // Load local_creeps_names from memory
            this.manageLocalCreepsNames();
            this.spawnQueue = [];
            // Load spawnQueue from memory
            if (this.local_spawn.memory.spawnQueue) {
                this.spawnQueue = this.local_spawn.memory.spawnQueue;
            }
            
            this.roleHandlers = {
                [constants.CREEP_ROLE_HARVESTER]: roleHarvester.run,
                [constants.CREEP_ROLE_BUILDER]: roleBuilder.run,
                [constants.CREEP_ROLE_UPGRADER]: roleUpgrader.run,
                [constants.CREEP_ROLE_REPAIRER]: roleRepairer.run,
                [constants.CREEP_ROLE_CARRIER]: roleCarrier.run,
                [constants.CREEP_ROLE_MINER]: roleMiner.run,
                [constants.CREEP_ROLE_SCOUT]: roleScout.run,
                [constants.CREEP_ROLE_CLAIMER]: roleClaimer.run,
                // Add new roles here
            };
            
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
     * Manages the local_creeps_names array.
     * This method should only be called by the constructor.
     * If the local_creeps_names array is not in memory, it is initialized.
     * If the local_creeps_names array is in memory, load it.
     */
    manageLocalCreepsNames() {
        if (!this.local_spawn) return;
        if (!this.local_spawn.memory.local_creeps_names) {
            this.local_spawn.memory.local_creeps_names = [];
            this.local_creep_names = [];
        } else {
            this.local_creep_names = this.local_spawn.memory.local_creeps_names;
            if(this.local_creep_names.length === 0) return;
            // check if the creep is still alive
            forEach(this.local_creep_names, creepName => {
                if (!Game.creeps[creepName]) {
                    // check if the creep is being spawned
                    if (this.local_spawn.spawning && this.local_spawn.spawning.name === creepName) return;
                    // remove the creep from the local_creeps_names array
                    this.local_creep_names.splice(this.local_creep_names.indexOf(creepName), 1);
                }
            });
        }
    }
    
    /**
     * Checks the population of the room and returns a map of the current population.
     * @returns {Map<any, any>} - a map of the current population of the room
     */
    getLocalPopulationTable() {
        let roomPopulation = new Map();
        for (let role in constants) {
            roomPopulation.set(role, this.local_creep_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === role).length);
        }
        this.local_spawn.room.memory.local_population = Array.from(roomPopulation.entries());
        this.local_spawn.memory.local_creeps_names = this.local_creep_names;
        return roomPopulation;
    }

    /**
     * Runs the creep roles for the room.
     */
    runLocalCreeps() {
        this.local_creep_names.forEach(creepName => {
            const creep = Game.creeps[creepName];
            if (creep) {
                const roleHandler = this.roleHandlers[creep.memory.role];
                if (roleHandler) {
                    //console.log(`Running ${creep.name} as ${creep.memory.role}`);
                    roleHandler(creep);
                } else {
                    console.log(`Unknown role: ${creep.memory.role}`);
                    creep.say('🤔');
                }
            } else {
                console.log(`Creep ${creepName} does not exist yet`);
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
    
    //TODO: FIX ME! This method is not working properly
    // elements are not being removed from the spawn queue
    processSpawnQueue() {
        if (!this.local_spawn || this.local_spawn.spawning) return;
        // Spawn the creep with the highest priority
        if (this.spawnQueue.length > 0) {
            // Sort spawnQueue based on priority
            this.spawnQueue.sort((a, b) => a.priority - b.priority);
            // print the spawn queue to the console
            console.log("Queued number: " + this.spawnQueue.length);
            console.log("Queued creeps: " + JSON.stringify(this.spawnQueue));
            const creepRole = this.spawnQueue[0].role;
            if (this.isSpawnable(creepRole)) {
                this.spawnNewCreep(creepRole).then(() => {
                    // Remove the creep from the spawnQueue
                    this.spawnQueue.shift();
                    // Save spawnQueue to memory
                    this.local_spawn.memory.spawnQueue = this.spawnQueue;
                    // Update local copy of spawnQueue
                    this.spawnQueue = this.local_spawn.memory.spawnQueue;
                });
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
        return new Promise((resolve, reject) => {
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
                resolve();
            }
            else{
                console.log(`Error spawning creep: ${result}`);
                reject();
            }
        });
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