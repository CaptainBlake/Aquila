'use strict';
function MyCreep(creep) {
    this.creep = creep;
}

/**
 * performAction is a wrapper for action(target) that also handles moving to the target
 * @param action - the action to perform
 * @param target - the target object to perform the action on
 * @returns {*} - the result of the action
 */
MyCreep.prototype.performAction = function(action, target) {
    try {
        
        const result = action(target);
        // move to target if not in range
        if (result === ERR_NOT_IN_RANGE) {
            this.moveToTarget(target);
            return OK;
        }
        // clear path if target is reached
        if(result === OK) this.creep.memory.path = null;
        // internal error handling
        if(result !== OK && result !== ERR_NOT_IN_RANGE) this.handleError(result,action, target);
        
        
        return result;
    } catch (error) {
        console.log("Error in MyCreep.performAction: " + error);
    }
};

/**
 * handleError is a wrapper for action(target) that also handles moving to the target
 * list of possible errors:
 * 
 *      - OK : 0
 *      - ERR_NOT_OWNER : -1
 *      - ERR_NO_PATH : -2
 *      - ERR_NAME_EXISTS : -3
 *      - ERR_BUSY : -4
 *      - ERR_NOT_FOUND : -5
 *      - ERR_NOT_ENOUGH_RESOURCES : -6
 *      - ERR_INVALID_TARGET : -7
 *      - ERR_FULL : -8
 *      - ERR_NOT_IN_RANGE : -9
 *      - ERR_INVALID_ARGS : -10
 *      - ERR_TIRED : -11
 *      - ERR_NO_BODYPART : -12
 *      - ERR_RCL_NOT_ENOUGH : -14
 *      - ERR_GCL_NOT_ENOUGH : -15
 *      
 * @param result - the result of the action
 * @param target - the target object to perform the action on
 */
MyCreep.prototype.handleError = function(result, target) {
    switch (result) {
        case ERR_NOT_OWNER:
            console.log(`Creep ${this.creep.name} is not owner of target ${target}`);
            this.creep.say('No own');
            break;
        case ERR_BUSY:
            console.log(`Creep ${this.creep.name} is busy`);
            this.creep.say('Busy');
            break;
        case ERR_NOT_FOUND:
            console.log(`Target ${target} not found`);
            this.creep.say('No tgt');
            this.creep.memory.target = null;
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            console.log(`Target ${target} does not have enough resources`);
            this.creep.say('No res');
            break;
        case ERR_INVALID_TARGET:
            console.log(`Target ${target} is invalid`);
            this.creep.say('Inv tgt');
            this.creep.memory.target = null;
            break;
        case ERR_FULL:
            console.log(`Target ${target} is full`);
            this.creep.say('Full');
            this.creep.memory.target = null;
            break;
        case ERR_INVALID_ARGS:
            console.log(`Invalid arguments for target ${target}`);
            this.creep.say('Inv arg');
            this.creep.memory.target = null;
            break;
        case ERR_TIRED:
            console.log(`Target ${target} is tired`);
            this.creep.say('Tired');
            break;
        case ERR_NO_BODYPART:
            console.log(`Creep ${this.creep.name} does not have the required body part`);
            this.creep.say('No part');
            break;
        case ERR_NOT_ENOUGH_EXTENSIONS:
            console.log(`Not enough extensions to spawn creep ${this.creep.name}`);
            this.creep.say('No ext');
            break;
        case ERR_RCL_NOT_ENOUGH:
            console.log(`Room controller level is not high enough to spawn creep ${this.creep.name}`);
            this.creep.say('Low RCL');
            break;
        case ERR_GCL_NOT_ENOUGH:
            console.log(`Global controller level is not high enough to spawn creep ${this.creep.name}`);
            this.creep.say('Low GCL');
            break;
        default:
            //console.log(`Unknown error for creep ${this.creep.name} and target ${target}: ${result}`);
            this.creep.memory.target = null;
            //this.creep.say({result});
    }
}

/**
 * -- moving version 1.0 --
 * 
 * Moves the creep to a specified target.
 *
 * This function is a wrapper for creep.moveTo(target) that also handles moving to the target.
 * It stores a path in memory to avoid recalculating the path every tick.
 * The path is recalculated when the creep moves to a new room or the position of the target changes.
 * The path is cleared once the creep reaches the target.
 * If the creep is stuck (hasn't moved for a certain number of ticks), it forces an update of the path.
 *
 * TODO: still dumb as sh*t.
 * - not multi-room compatible
 * 
 * @param {Object} target - The target object to move to.
 * @returns {number} - The result of the move action.
 */ 

MyCreep.prototype.moveToTarget = function(target) {
    // check if target is valid
    if (!target) {
        console.log('Target is undefined');
        return ERR_NOT_FOUND;
    }
    let path = this.creep.memory.path;
    // check if path is valid
    if (!path) {
        this.creep.say('New path')
        let costs = this.createCostMatrix(this.creep.room.name);
        path = this.creep.pos.findPathTo(target, { costCallback: function() { return costs; } });
        this.creep.memory.path = path;
    }
    let result = this.creep.moveByPath(path);
    // check if path is movable
    if (result === ERR_NOT_FOUND || result === ERR_NO_PATH) {
        this.creep.say('No path')
        this.creep.memory.path = null;
    }
    // check if creep is stuck
    if(this.compareCurrentPosition(this.creep.memory.lastPosition)){
        this.creep.say('Stuck')
        this.creep.memory.path = null;
    }
    
    // Store the current position and tick count
    this.creep.memory.lastMoveTime = Game.time;
    this.creep.memory.lastPosition = this.creep.pos;
    
    // Return the result of the move action
    return result;
};

MyCreep.prototype.compareCurrentPosition = function(position) {
    // manually compare last position to current position
    return position.x === this.creep.pos.x && position.y === this.creep.pos.y && position.roomName === this.creep.pos.roomName;
}

MyCreep.prototype.createCostMatrix = function(roomName) {
    let room = Game.rooms[roomName];
    let costs = new PathFinder.CostMatrix;

    room.find(FIND_STRUCTURES).forEach(function(struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });

    // Avoid creeps in the room
    room.find(FIND_CREEPS).forEach(function(creep) {
        costs.set(creep.pos.x, creep.pos.y, 0xff);
    });

    return costs;
};

MyCreep.prototype.updateMemoryAttribute = function(key, value) {
    //check if key is not null and key is not undefined in memory
    if (!key || !this.creep.memory[key]) return;
    this.creep.memory[key] = value;
};

MyCreep.prototype.harvestEnergy = function(source) {
    return this.performAction(this.creep.harvest.bind(this.creep), source);
};

MyCreep.prototype.transferEnergy = function(target) {
    this.performAction(this.creep.transfer.bind(this.creep, RESOURCE_ENERGY), target);
};

MyCreep.prototype.withdrawEnergy = function(target) {
    this.performAction(this.creep.withdraw.bind(this.creep, RESOURCE_ENERGY), target);
}

MyCreep.prototype.buildStructure = function(target) {
    this.performAction(this.creep.build.bind(this.creep), target);
};

MyCreep.prototype.upgradeController = function(target) {
    this.performAction(this.creep.upgradeController.bind(this.creep), target);
}

MyCreep.prototype.attackHostileCreeps = function() {
    const hostileCreeps = this.creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostileCreeps.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileCreeps[0]);
};

MyCreep.prototype.attackHostileStructures = function() {
    const hostileStructures = this.creep.room.find(FIND_HOSTILE_STRUCTURES);
    if (hostileStructures.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileStructures[0]);
};

MyCreep.prototype.repairStructure = function(target) {
    this.performAction(this.creep.repair.bind(this.creep), target);
};

module.exports = MyCreep;