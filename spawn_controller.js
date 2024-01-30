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
            // check if creep is still alive
            for (let i = 0; i < this.local_creep_names.length; i++) {
                if (this.local_spawn.memory.spawningCreep === this.local_creep_names[i]) { continue; }
                if (!Game.creeps[this.local_creep_names[i]]) {
                    console.log("Creep " + this.local_creep_names[i] + " is dead");
                    // remove creep from local_creep_names
                    this.local_creep_names.splice(i, 1);
                }
            }
            // check if there are any new creeps that are not in local_creep_names
            for (let creepName in Game.creeps) {
                if (!this.local_creep_names.includes(creepName)) {
                    // add creep to local_creep_names
                    this.local_creep_names.push(creepName);
                }
            }
            // update local_creep_names in memory
            this.local_spawn.memory.local_creeps_names = this.local_creep_names;
        }
    }
    
    /**
     * Checks the population of the room and returns a map of the current population.
     * @returns {Map<any, any>} - a map of the current population of the room
     */
    getLocalPopulationTable() {
        let roomPopulation = new Map();
        for (let role of constants.CREEP_ROLES) {
            //console.log("checking population for role: " + role);
            roomPopulation.set(role, this.local_creep_names.filter(creepName => Game.creeps[creepName] && Game.creeps[creepName].memory.role === role).length);
        }
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
                    // check if creep is being spawned
                    if (this.local_spawn.memory.spawningCreep === creepName) {
                        console.log(`Waiting for Creep ${creepName} being hatched...`);
                    }else{
                        //console.log(`Running ${creep.name} as ${creep.memory.role}`);
                        roleHandler(creep);
                    }
                } else {
                    console.log(`No role handler defined for creep ${creepName}`);
                    // kill creep
                    
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

    processSpawnQueue() {
        try {
            if (!this.local_spawn || this.local_spawn.spawning) return;
            this.local_spawn.memory.spawningCreep = null;
            if (this.spawnQueue.length > 0) {
                this.spawnQueue.sort((a, b) => a.priority - b.priority);
                const creepRole = this.spawnQueue[0].role;
                if (this.isSpawnable(creepRole)) {
                    const creepName = this.spawnNewCreep(creepRole);
                    if (creepName) {
                        this.local_spawn.memory.spawningCreep = creepName;
                    }
                }
            }
            if (this.local_spawn.memory.spawningCreep && !Game.creeps[this.local_spawn.memory.spawningCreep]) {
                this.spawnQueue.shift();
                this.local_spawn.memory.spawnQueue = this.spawnQueue;
                this.spawnQueue = this.local_spawn.memory.spawnQueue;
                delete this.local_spawn.memory.spawningCreep;
            }
        } catch (error) {
            console.error(`Error processing spawn queue: ${error}`);
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
        try {
            const body = this.getBodyPartsForRole(role);
            const creepName = `${role}_${Game.time}`;
            const result = this.local_spawn.spawnCreep(body, creepName, {
                memory: {
                    role: role,
                    state: 'initializing',
                    target: null,
                    home: this.local_spawn.room.name,
                    workParts: body.filter(part => part === WORK).length,
                    born: Game.time
                }
            });

            if (result === OK) {
                //console.log(`Spawning new creep: ${creepName}`);
                Game.creeps[creepName].memory.role = role;
                this.local_creep_names.push(creepName);
                return creepName;
            } else {
                console.log(`Error spawning creep: ${result}`);
                return null;
            }
        } catch (error) {
            console.error(`Error spawning new creep: ${error}`);
            return null;
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