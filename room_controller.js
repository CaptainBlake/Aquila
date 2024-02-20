'use strict';

// import constants
const constants = require('./constants');

class RoomController {
    
    constructor(room) {
        
        this.room = room;
        this.controller = room.controller;
        this.rcl = room.controller.level;
        this.roomName = room.name;
        this.spawn = room.find(FIND_MY_SPAWNS)[0];
        if(!this.room.memory.buildQueue)
            this.room.memory.buildQueue = [];
        this.buildQueue = this.room.memory.buildQueue;
        if(!this.room.memory.constructionSites)
            this.room.memory.constructionSites = [];
        this.constructionSites = this.room.memory.constructionSites;
        
    }
    
    //TODO: implement
    // + road planing and construction
    // + checking map plan and place buildings if possible GameStateController
    // + build queue management
    // + having influence into counts of repairers and builders  (PopulationController or GameStateController?)
    taskLoop() {
        const cpuStart = Game.cpu.getUsed();
        // console log the current buildQueue and constructionSites of the room
        // console.log(`Build queue for room: ${this.roomName}:` + this.buildQueue);
        console.log(`current construction sites in room: ${this.roomName}: ` + this.constructionSites.length);
        // ---
        
        // update buildQueue and constructionSites 
        this.updateQueues();
        // process buildQueue
        this.processBuildQueue();
        // if rcl >= 2, set harvesting routes for static mining
        if(this.rcl >= 2) this.setHarvestingRoutes(this.spawn);



        // ---
        const cpuEnd = Game.cpu.getUsed();
        console.log(`- CPU used for room_controller: ${this.roomName}: ${cpuEnd - cpuStart}`);
    }



    updateQueues() {
        //console.log("updating build queue and construction sites")
        // remove completed construction sites from memory
        this.constructionSites = this.constructionSites.filter((site) => {
            // Check if the construction site still exists in the room
            const constructionSite = Game.getObjectById(site.id);
            if (!constructionSite && site instanceof ConstructionSite) {
                console.log("removing construction site from memory: " + site.type + " at pos: " + site.pos.x + ", " + site.pos.y + ", " + site.pos.roomName);
                return false;
            }
            return true;
        });

        // remove buildQueue tasks that are already in constructionSites
        this.buildQueue = this.buildQueue.filter((task) => {
            // Check if the id of the construction site created by the task is in the construction sites
            const constructionSite = this.constructionSites.find(site => site.id === task.id);
            if (constructionSite && constructionSite instanceof ConstructionSite) {
                console.log("removing task from build queue: " + task.type + " at pos: " + task.pos.x + ", " + task.pos.y + ", " + task.pos.roomName);
                return false;
            }
            return true;
        });

        // update construction memory
        this.room.memory.constructionSites = this.constructionSites;
        // update construction memory
        this.room.memory.buildQueue = this.buildQueue;
    }

    /**
     * Processes the build queue and places construction sites for each task in the queue
     * if the construction site length is smaller than the minimum amount of construction sites (constants.MINIMUM_CONSTRUCTION_SITES)
     * place construction sites for the first n tasks in the queue until the amount of construction sites is equal to the minimum amount
     * use the target.pos for the construction site position
     * just remove the task from the queue if the construction site is placed
     * add the construction site to the constructionSites array in the room's memory
     * if something goes wrong, dont remove the task from the queue nor add the construction site to the constructionSites array
     * 
     * task object: (e.g for a container)
     * 
     *      type: STRUCTURE_CONTAINER,
     *       pos: containerPos,
     *  priority: constants.BUILDING_PRIORITIES[STRUCTURE_CONTAINER]
     *  TODO: FIX ME
     */ 
    processBuildQueue() {
        //console.log("processing build queue")
        if(!this.constructionSites || !this.buildQueue){
            console.log("nothing to build")
            return;
        }
        // Calculate the difference between the minimum number of construction sites and the current number of construction sites
        let difference = constants.MINIMUM_CONSTRUCTION_SITES - this.constructionSites.length;

        // If the difference is greater than 0, there are fewer construction sites than the minimum
        if (difference > 0) {
            // Iterate over the buildQueue array
            for (let i = 0; i < this.buildQueue.length && difference > 0; i++) {
                const task = this.buildQueue[i];
                
                const roomPos = new RoomPosition(task.pos.x, task.pos.y, task.pos.roomName);
                //console.log("processing task: " + task.type + " at pos: " + task.pos.x + ", " + task.pos.y + ", " + task.pos.roomName + " with prio: " + task.priority);
                // Create a new construction site at the task's position with the structure type specified in the task
                const result = this.room.createConstructionSite(roomPos, task.type);
                // If the construction site was created successfully, remove the task from the buildQueue and add the construction site to the constructionSites array
                if (result === OK) {
                    this.buildQueue.splice(i, 1);
                    i--; // Adjust the index to account for the removed task
                    const id = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, task.pos)[0].id;
                    console.log("construction site created: " + task.type + " at pos: " + task.pos.x + ", " + task.pos.y + ", " + task.pos.roomName + " with id: " + id)
                    this.constructionSites.push({ pos: task.pos, type: task.type, priority: task.priority, id: id});
                    difference--; // Decrease the difference as a construction site has been added
                }
            }
            // sort construction sites by priority
            this.constructionSites.sort((a, b) => a.priority - b.priority);
            this.room.memory.constructionSites = this.constructionSites;
        }
        //console.log("build queue processed")
    }
    
    
    
    /**
     * Determines the position of containers for each source in the room
     * and places construction sites if RCL >= 2
     * uses the spawn as center point, finds the fastest path to each source
     * and places a container at the (path.length - 3) position
     * 
     *      [spawn] -> [path[0]] -> [path[1]] -> ... -> [path[path.length-4]] -> [container] -> [path[path.length-2] -> [source]
     * 
     * TODO: Extend path algorithm with pathfindingAPI
     * @param spawn {StructureSpawn} - the spawn to use as the center point for the harvesting routes
     */
    setHarvestingRoutes(spawn) {
        if(this.room.memory.harvestingRoutesSet) return;
        console.log("*** Setting harvesting routes...");
        // Get all sources in the room
        const sources = spawn.room.find(FIND_SOURCES);

        // Iterate over each source
        sources.forEach(source => {
            // Find the shortest path from the spawn to the source
            const path = spawn.pos.findPathTo(source.pos); 

            // Determine the position for the container
            const containerPos = path[path.length - 3];
            containerPos.roomName = spawn.room.name;
            console.log()

            // Add a construction task for a container at the determined position to the build queue
            this.addBuildQueueTask(STRUCTURE_CONTAINER, containerPos)

            // Iterate over each position in the path
            path.forEach((pos, index) => {
                // Do not place a road on the last three positions (the source and the two positions before it)
                if (index < path.length - 3) {
                    pos.roomName = spawn.room.name;
                    // Add a construction task for a road at the current position to the build queue
                    this.addBuildQueueTask(STRUCTURE_ROAD, pos)
                }
            });
        });
        // sort build queue by priority
        this.buildQueue.sort((a, b) => a.priority - b.priority);
        this.room.memory.buildQueue = this.buildQueue;
        // Set the flag in the room's memory to indicate that the harvesting routes have been set
        spawn.room.memory.harvestingRoutesSet = true;
    }
    
    
    

    /**
     * Adds a task to the build queue with the specified structure type, position, and priority.
     * @param structureType {string} - The type of structure to build.
     * @param pos {RoomPosition} - The position at which to build the structure.
     * @param priority {number} - The priority of the build task.
     */
    addBuildQueueTask(structureType, pos, priority = -1) {
        if(priority === -1) priority = constants.BUILDING_PRIORITIES[structureType];
        this.buildQueue.push({
            type: structureType,
            pos: pos,
            priority: priority
        });
    }
}

module.exports = RoomController;