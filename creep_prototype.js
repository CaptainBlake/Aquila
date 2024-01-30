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
        if (result === ERR_NOT_IN_RANGE) {
            this.moveToTarget(target);
            return OK;
        }
        if(result !== OK){
            this.handleError(result,action, target);
        }
        return result;
    } catch (error) {
        console.error(`Error in performAction: ${error.message}`);
    }
};

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

//TODO: make this smart
MyCreep.prototype.moveToTarget = function(target) {
    if (!target || !target.pos) return;
    const result = this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
    if (result === ERR_NO_PATH) {
        console.log(`No path found for creep ${this.creep.name} to target at ${target.pos}`);
    }
};

MyCreep.prototype.updateMemoryAttribute = function(key, value) {
    //check if key is not null and key is not undefined in memory
    if (!key || !this.creep.memory[key]) return;
    this.creep.memory[key] = value;
};

MyCreep.prototype.harvestEnergy = function(source) {
    this.performAction(this.creep.harvest.bind(this.creep), source);
};

MyCreep.prototype.transferEnergy = function(target) {
    this.performAction(this.creep.transfer.bind(this.creep, RESOURCE_ENERGY), target);
};

MyCreep.prototype.buildStructure = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
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
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.repair.bind(this.creep), target);
};



module.exports = MyCreep;