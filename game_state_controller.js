// game_state_controller.js

// import constants
const constants = require('./constants');


class GameStateController {
    constructor(room = null) {
        this.room = room;                       // Room object
        this.energy = 0;                        // Amount of energy available in the room
        this.energyCapacity = 0;                // Amount of energy capacity available in the room
        this.sources = [];                      // Array of sources in the room
        this.creeps = [];                       // Array of creeps in the room
        this.structures = [];                   // Array of structures in the room
        this.constructionSites = [];            // Array of construction sites in the room
        this.hostiles = [];                     // Array of hostiles in the room
        this.minerals = [];                     // Array of minerals in the room
        this.roomController = null;             // Room controller object
        this.storage = null;                    // Storage object
        this.towers = [];                       // Array of towers in the room
        this.extensions = [];                   // Array of extensions in the room
        
    }
    
    initialize(room, spawnController) {
        this.room = room;
        this.spawnController = spawnController;   
    }

    updateGameState() {
        // Update each field with the current state of the room
        if (this.room) {
            this.energy = this.room.energyAvailable;
            this.energyCapacity = this.room.energyCapacityAvailable;
            this.sources = this.room.find(FIND_SOURCES);
            this.creeps = this.room.find(FIND_MY_CREEPS);
            this.structures = this.room.find(FIND_STRUCTURES);
            this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
            this.hostiles = this.room.find(FIND_HOSTILE_CREEPS);
            this.minerals = this.room.find(FIND_MINERALS);
            this.roomController = this.room.controller;
            this.storage = this.room.storage;
            this.towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            this.extensions = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}});
        }
    }
}

module.exports = GameStateController;