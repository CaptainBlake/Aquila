'use strict';

// import constants
const constants = require('./constants');
// import lodash
const __ = require("lodash");

/**
 * controlls build-queue and building placement for a room
 */
class BuildController {
    
    //TODO: implement
    taskLoop() {
        
        // + init build queue
        
        // + check RCL and build queue
        
        // + map sources and containers once and store their position in memory (if not already done)
        this.setHarvestingRoutes(Game.spawns['Spawn1']); //TODO: hardcoded spawn name
        // + road planing and construction
        
        // + checking map plan and place buildings if possible TODO:GameStateController
        
        // + build queue management
        
        //* having influence into counts of repairers and builders TODO: PopulationController (or GameStateController?)
        
        
        
    }

    /**
     * Determines the position of containers for each source in the room
     * and places construction sites if RCL >= 2
     * uses the spawn as center point, finds the fastest path to each source
     * and places a container at the (path.length - 3) position
     * 
     *      [spawn] -> [path[0]] -> [path[1]] -> ... -> [path[path.length-4]] -> [container] -> [path[path.length-2] -> [source]
     * 
     * @param spawn
     */
    setHarvestingRoutes(spawn) {
        // Check if the Room Controller Level (RCL) is less than 2
        if (spawn.room.controller && spawn.room.controller.level < 2) {
            // If it is, return immediately
            return;
        }
        
        // Check if the harvesting routes have already been set
        if (spawn.room.memory.harvestingRoutesSet) { 
            // If they have, return immediately
            return;
        }

        console.log("*** Setting harvesting routes...");
        // Get all sources in the room
        const sources = spawn.room.find(FIND_SOURCES);

        // Iterate over each source
        sources.forEach(source => {
            // Find the shortest path from the spawn to the source
            const path = spawn.pos.findPathTo(source.pos); //TODO: Extend path algorithm with pathfindingAPI

            // Determine the position for the container
            const containerPos = path[path.length - 3];

            // Place a construction site for a container at the determined position
            spawn.room.createConstructionSite(containerPos.x, containerPos.y, STRUCTURE_CONTAINER);

            // Iterate over each position in the path
            path.forEach((pos, index) => {
                // Do not place a road on the last three positions (the source and the two positions before it)
                if (index < path.length - 3) {
                    // Place a construction site for a road at the current position
                    spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                }
            });
        });

        // Set the flag in the room's memory to indicate that the harvesting routes have been set
        spawn.room.memory.harvestingRoutesSet = true;
    }
    
}

const buildController = new BuildController();
module.exports = buildController;