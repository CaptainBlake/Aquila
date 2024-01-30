'use strict';
//population_controller.js

//import controllers
const SpawnController = require('./spawn_controller');
//import constants
const constants = require('./constants');



class PopulationController {
    
    constructor() {
        this.spawnControllers = [];
        this.globalPopulationMap = new Map();
    }

    
    /**
     * Task loop for the population controller.
     * This method is used to manage the population of creeps in the game.
     */
    taskLoop() {
        // create spawn controllers
        this.initialize()
        if(this.spawnControllers.length === 0){return;}
        // check global population
        this.getGlobalPopulationMap();
        // manage population
        this.setRecruitingPlans();
        // process spawn queues
        this.processSpawnQueues();
        // run creeps
        this.executeCreepRoles();
    }

    /**
     * Initializes the population controller.
     *  - Creates a SpawnController for each spawn in the game.
     */
    initialize() {
        // get all spawns in the game, create a SpawnController for each one, and add it to the spawnControllers array
        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            //console.log("creating spawn controller for: " + spawnName);
            this.spawnControllers.push(new SpawnController(spawn));
        }
    }

    /**
     * Checks the global population of creeps in the game.
     * @returns {Map<any, any>} - A map of the global population of creeps in the game by role.
     */
    getGlobalPopulationMap() {
        for (let spawnController of this.spawnControllers) {
            if (spawnController) {
                // Retrieve the local population table from the spawn controller
                let localPopulationTable = spawnController.getLocalPopulationTable();
                // Check if localPopulationTable is an instance of Map
                if (localPopulationTable instanceof Map) {
                    if (localPopulationTable.size === 0) {
                        //console.log('localPopulationTable is empty');
                    } else {
                        // Add the local population table to the roomPopulationMap
                        this.globalPopulationMap.set(spawnController.name, Array.from(localPopulationTable.entries()));
                    }
                } else {
                    console.log('localPopulationTable is not a Map object');
                }
            }
        }
        // serialize the global population map and store it in memory
        Memory.global_population = Array.from(this.globalPopulationMap.entries());
    }

    /**
     * Sets the recruiting plan for each spawn in the game.
     * Uses the global population map to determine the recruiting plan for each spawn in the game.
     * Uses constants to determine the minimum number of creeps per role per room.
     */
    setRecruitingPlans() {
        console.log("==================="+ Game.time +"========================");
        for (let spawnController of this.spawnControllers) {
            let localPopulationTable = new Map(this.globalPopulationMap.get(spawnController.name));
            let spawnQueue = spawnController.spawnQueue;
            for (let role in constants.MINIMUM_ROLES_MAP) {
                const desiredCount = constants.MINIMUM_ROLES_MAP[role];
                const currentCount = localPopulationTable.get(role) || 0;
                let queueCount = spawnQueue.filter(queuedRole => queuedRole.role === role).length;
                //console.log(`role: ${role}, currentCount: ${currentCount}, desiredCount: ${desiredCount}, queueCount: ${queueCount}`);
                if (currentCount + queueCount > desiredCount) {
                    while (currentCount + queueCount > desiredCount) {
                        // Find the index of the first element in the queue with the current role
                        const index = spawnQueue.findIndex(queuedRole => queuedRole.role === role);
                        // Remove the element from the queue
                        if (index !== -1) {
                            spawnQueue.splice(index, 1);
                        }
                        // Update the queue count
                        queueCount = spawnQueue.filter(queuedRole => queuedRole.role === role).length;
                    }
                    console.log(`removed ${role} from spawn queue to match desired count`);
                } else if (currentCount + queueCount < desiredCount) {
                    let priority = desiredCount - currentCount;
                    priority = 5 - Math.max(1, Math.min(priority, 5));
                    spawnQueue.push({role, priority});
                    console.log(`adding ${role} to spawn queue with priority ${priority}`);
                }
            }
            spawnController.updateSpawnQueue(spawnQueue);
            //console.log(`spawnQueue length: ${spawnQueue.length}\n spawnQueue: ${JSON.stringify(spawnQueue)}`);
        }
    }

    /**
     * Processes the spawn queue for all spawns in the game.
     * Iterates over the spawnControllers array and calls the processSpawnQueue method for each spawnController.
     * Checks if the spawnController is not null before calling the processSpawnQueue method to prevent a null pointer exception.
     */

    processSpawnQueues() {
        for (let spawnController of this.spawnControllers) {
            if(spawnController){
                spawnController.processSpawnQueue();
            }
        }
    }

    /**
     * Executes the creep roles for all spawns in the game.
     * This method should be called after the spawn queues have been processed.
     */
    executeCreepRoles() {
        // Iterate over the spawnControllers array
        for (let spawnController of this.spawnControllers) {
            // Call the runLocalCreeps method for the spawnController
            spawnController.runLocalCreeps();
        }
    }
}

// initialize singleton controller instance and export it
const GlobalPopulationController = new PopulationController();
module.exports = GlobalPopulationController;