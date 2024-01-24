// global_game_state_controller.js

const GameStateController = require('./game_state_controller');
const SpawnController = require('./spawn_controller');

class GlobalGameStateController {
    constructor() {
        this.rooms = {}; // Map of room names to their controllers
    }
    
    initialize() {
        // Initialize game state and spawn controllers for each controlled room
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];

            // Check if the room is controlled by you
            if (room.controller && room.controller.my) {
                // Create a new GameStateController and SpawnController for the room if they don't exist
                if (!this.rooms[roomName]) {
                    //find the spawn in the room
                    let spawn = room.find(FIND_MY_SPAWNS)[0];
                    let spawnController = new SpawnController();
                    let gameStateController = new GameStateController();
                    this.rooms[roomName] = {
                        gameStateController: gameStateController,
                        spawnController: spawnController
                    };
                }
            }
        }
    }
    
    taskLoop() {
        // Update the game state for each controlled room
        this.updateAllGameStates();
        

    }

    /**
     * Updates the game state for each controlled room.
     * This method should be called at the beginning of each tick.
     */
    updateAllGameStates() {
        // Update the game state for each controlled room
        for(let roomName in this.rooms) {
            this.rooms[roomName].gameStateController.updateGameState();
        }
    }

    /**
     * Returns the GameStateController and SpawnController for the specified room.
     * @param roomName - The name of the room.
     * @returns {*} - The GameStateController and SpawnController for the specified room.
     */
    getControllersForRoom(roomName) {
        // Return the controllers for the specified room
        return this.rooms[roomName];
    }
}

// initialize singleton controller instance and export it
const globalGameStateController = new GlobalGameStateController();
module.exports = globalGameStateController;