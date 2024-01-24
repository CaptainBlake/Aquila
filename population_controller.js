//population_controller.js

//import controllers
const SpawnController = require('./spawn_controller');
//import constants

// local variables
let spawnControllers = {};

class PopulationController {
    constructor() {
        this.spawnControllers = [];
    }

    initializeSpawnControllers() {
        for (let spawnName in Game.spawns) {
            let spawnController = new SpawnController();
            spawnController.initializeSpawnController(Game.spawns[spawnName]);
            this.spawnControllers.push(spawnController);
        }
    }
    
    loop() {
        this.initializeSpawnControllers();
        this.processSpawnQueues();
        this.checkSpawn();
        // check global population
        this.checkGlobalPopulation();
        // process spawn queues
        this.processSpawnQueues();
        // run creeps
        this.executeCreepRoles();
       
    }

    /**
     * Checks the population of all spawns in the game.
     * This method should be called at the beginning of each tick.
     */
    checkGlobalPopulation() {
        for (let spawnName in spawnControllers) {
            spawnControllers[spawnName].checkLocalPopulation();
        }
    }

  

    /**
     * Check if the spawn is still alive.
     */
    checkSpawn() {
        for (let spawnName in spawnControllers) {
            if (!Game.spawns[spawnName]) {
                delete spawnControllers[spawnName];
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
        for (let spawnName in spawnControllers) {
            spawnControllers[spawnName].runLocalCreeps();
        }
    }

    /**
     * Returns the total number of creeps with the given role
     * @param role - the role to count
     * @returns {number} - the number of creeps with the given role in the game
     */
    getNumberOfCreeps(role) {
        return 0;
    }

    /**
     * Adds a spawn controller to the population controller.
     * @param spawnController - the spawn controller to add
     */
    addSpawnController(spawnController) {
        spawnControllers[spawnController.local_spawn.name] = spawnController;
    }
    


}

module.exports = PopulationController;