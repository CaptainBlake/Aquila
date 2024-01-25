// global_game_state_controller.js

const GameStateController = require('./game_state_controller');
const SpawnController = require('./spawn_controller');

class GlobalGameStateController {
    
        taskLoop() {
            // future implementation
        }

}

// initialize singleton controller instance and export it
const globalGameStateController = new GlobalGameStateController();
module.exports = globalGameStateController;