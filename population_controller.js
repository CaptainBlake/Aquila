//population_controller.js

//import controllers
const SpawnController = require('./spawn_controller');
//import constants
const constants = require('./constants');

class PopulationController {
    constructor() {
        this.spawnControllers = [];
    }

    /**
     * Task loop for the population controller.
     * This method is used to manage the population of creeps in the game.
     */
    taskLoop() {
        // check if array is empty
        if (this.spawnControllers.length === 0) {return;}
        // check spawn status 
        this.checkSpawn();
        // check global population
        this.checkGlobalPopulation();
        // manage population 
        this.managePopulation();
        // process spawn queues
        this.processSpawnQueues();
        // run creeps
        this.executeCreepRoles();
    }

    /**
     * Check if the spawn is still alive.
     */
    checkSpawn() {
        for (let spawnName in this.spawnControllers) {
            if (!Game.spawns[spawnName]) {
                delete this.spawnControllers[spawnName];
            }
        }
    }
    
    /**
     * Checks the population of all spawns in the game.
     * This method should be called at the beginning of each tick.
     */
    checkGlobalPopulation() {
        for (let spawnName in this.spawnControllers) {
            this.spawnControllers[spawnName].checkLocalPopulation();
        }
    }

    /**
     * this is a big one!
     * Manages the population of creeps in the game.
     * This method should be called after the population has been checked.
     * it adds creeps to the spawn queue if the population is below the desired amount.
     * Currently, the desired population is hard-coded in the constants file.
     * TODO: make the desired population dynamic based on the game state.
     */
    managePopulation() {
        const roleCounts = {
            [constants.CREEP_ROLE_HARVESTER]: constants.MINIMUM_HARVESTERS,
            [constants.CREEP_ROLE_BUILDER]: constants.MINIMUM_BUILDERS,
            [constants.CREEP_ROLE_DEFENDER]: constants.MINIMUM_DEFENDERS,
            [constants.CREEP_ROLE_UPGRADER]: constants.MINIMUM_UPGRADERS,
            [constants.CREEP_ROLE_REPAIRER]: constants.MINIMUM_REPAIRERS,
            [constants.CREEP_ROLE_CARRIER]: constants.MINIMUM_CARRIERS,
            [constants.CREEP_ROLE_MINER]: constants.MINIMUM_MINERS,
            [constants.CREEP_ROLE_SCOUT]: constants.MINIMUM_SCOUTS,
            [constants.CREEP_ROLE_CLAIMER]: constants.MINIMUM_CLAIMERS,
        };

        for (let spawnController of this.spawnControllers) {
            const currentPopulation = spawnController.getLocalPopulation();

            for (let role in roleCounts) {
                const desiredCount = roleCounts[role];
                const currentCount = currentPopulation[role] || 0;

                if (currentCount < desiredCount) {
                    spawnController.addToSpawnQueue(role);
                }
            }
        }
    }
    
    /**
     * Processes the spawn queue for all spawns in the game.
     */
    processSpawnQueues() {
        for (let spawnController of this.spawnControllers) {
            spawnController.processSpawnQueue();
        }
    }
    
    /**
     * Executes the creep roles for all spawns in the game.
     * This method should be called after the spawn queues have been processed.
     */
    executeCreepRoles() {
        for (let spawnName in this.spawnControllers) {
            this.spawnControllers[spawnName].runLocalCreeps();
        }
    }

    /**
     * Returns the total number of creeps with the given role
     * @param role - the role to count
     * @returns {number} - the number of creeps with the given role in the game
     */
    getNumberOfCreeps(role) {
        // get all creeps in the game
        let creeps = Game.creeps;
        // initialize counter
        let count = 0;
        // loop through creeps
        for (let creepName in creeps) {
            // check if creep has the given role
            if (creeps[creepName].memory.role === role) {
                // increment counter
                count++;
            }
        }
    }

    /**
     * Adds a spawn controller to the population controller.
     * @param spawnController - the spawn controller to add
     */
    addSpawnController(spawnController) {
        this.spawnControllers[spawnController.local_spawn.name] = spawnController;
    }
    
}

// initialize singleton controller instance and export it
const GlobalPopulationController = new PopulationController();
module.exports = GlobalPopulationController;