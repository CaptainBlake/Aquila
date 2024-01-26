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
        if (!target) {
            console.log('Target is null or undefined');
            return;
        }
        const result = action(target);
        if (result === ERR_NOT_IN_RANGE) {
            this.moveToTarget(target);
        }
        return result;
    } catch (error) {
        console.error(`Error in performAction: ${error.message}`);
    }
};

/**
 * updateMemoryAttribute updates a single attribute in the creep's memory
 * @param key - the key of the attribute to update
 * @param value - the new value for the attribute
 */
MyCreep.prototype.updateMemoryAttribute = function(key, value) {
    //check if key is not null and key is not undefined in memory
    if (!key || !this.creep.memory[key]) return;
    this.creep.memory[key] = value;
};

/**
 * Moves the creep to the target.
 * If a path to the target is already stored in the creep's memory, it follows that path.
 * If not, it calculates a new path, stores it in memory, and moves to the first position on the path.
 * If a path cannot be found, it moves towards the target using the moveTo method.
 * @param {Object} target - The target object to move to.
 */
MyCreep.prototype.moveToTarget = function(target) {
    if (!target || !target.pos) return;
    const result = this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
    if (result === ERR_NO_PATH) {
        console.log(`No path found for creep ${this.creep.name} to target at ${target.pos}`);
    }
};

MyCreep.prototype.harvestEnergy = function(source) {
    this.performAction(this.creep.harvest.bind(this.creep), source);
};

MyCreep.prototype.transferEnergy = function(target) {
    this.performAction(this.creep.transfer.bind(this.creep, RESOURCE_ENERGY), target);
};

/**
 * buildStructure is a wrapper for creep.build(target)
 * @param target - the target object to build
 */
MyCreep.prototype.buildStructure = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.build.bind(this.creep), target);
};

/**
 * attackHostileCreeps is a wrapper for creep.attack(target)
 * looks for hostile creeps in the room and attacks the first one it finds
 */
MyCreep.prototype.attackHostileCreeps = function() {
    const hostileCreeps = this.creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostileCreeps.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileCreeps[0]);
};

/**
 * attackHostileStructures is a wrapper for creep.attack(target)
 * looks for hostile structures in the room and attacks the first one it finds
 */
MyCreep.prototype.attackHostileStructures = function() {
    const hostileStructures = this.creep.room.find(FIND_HOSTILE_STRUCTURES);
    if (hostileStructures.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileStructures[0]);
};

/**
 * repairStructure is a wrapper for creep.repair(target)
 * @param target - the target object to repair
 */
MyCreep.prototype.repairStructure = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.repair.bind(this.creep), target);
};



module.exports = MyCreep;