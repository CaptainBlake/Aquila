// game_state_controller.js

// import constants
const constants = require('./constants');

const roomController = require('./room_controller');

class GameStateController {
    // initialize a room-controller for each room
    constructor() {
        
        this.roomController = [];
    }
    
    taskLoop() {
        // create build controllers
        this.initialize();
        if(this.roomController.length === 0){return;}
        // run room controllers
        this.runRoomControllers();
        
    }
    
    
    
    
    // jede source [] -> {worker2} <--- populationController [lebende creeps]


    initialize() {
        // get all rooms in the game, create a RoomController for each one, and add it to the roomControllers array
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            // Check if a RoomController already exists for this room
            if (!this.getRoomController(roomName)) {
                //console.log("creating room controller for: " + roomName);
                this.roomController.push(new roomController(room));
            }
        }
        
    }

    getRoomController(roomName) {
        return this.roomController.find(roomController => roomController.room.name === roomName) || null;
    }

    runRoomControllers() {
        for (let roomController of this.roomController) {
            roomController.taskLoop();
        }
    }
}

const gameStateController = new GameStateController();
module.exports = gameStateController;