// creep_role.js
const constants = require('./constants');
function CreepRole(creep) {
    this.creep = creep;
}

/**
 * performAction is a wrapper for action(target) that also handles moving to the target
 * @param action - the action to perform
 * @param target - the target object to perform the action on
 * @returns {*} - the result of the action
 */
CreepRole.prototype.performAction = function(action, target) {
    try {
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
 * Moves the creep to the target.
 * If a path to the target is already stored in the creep's memory, it follows that path.
 * If not, it calculates a new path, stores it in memory, and moves to the first position on the path.
 * If a path cannot be found, it moves towards the target using the moveTo method.
 * @param {Object} target - The target object to move to.
 */
CreepRole.prototype.moveToTarget = function(target) {
    try {
        let targetPos = `${target.pos.x},${target.pos.y}`;
        if (this.creep.memory._move && this.creep.memory._move.path && this.creep.memory._move.targetPos === targetPos) {
            let path = Room.deserializePath(this.creep.memory._move.path);
            if (this.creep.moveByPath(path) === ERR_NOT_FOUND) {
                delete this.creep.memory._move;
            }
        } else {
            let path = this.creep.pos.findPathTo(target, {
                plainCost: constants.PATHFINDING_PLAIN_COST,
                swampCost: constants.PATHFINDING_SWAMP_COST,
                roomCallback: function(roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) throw new Error('Room not found');
                    let costs = new PathFinder.CostMatrix;
                    room.find(FIND_STRUCTURES).forEach(function(structure) {
                        if (structure.structureType === STRUCTURE_ROAD) {
                            costs.set(structure.pos.x, structure.pos.y, 1);
                        }
                    });
                    return costs;
                },
                ignoreCreeps: true
            });
            if (path.length > 0) {
                this.creep.memory._move = { path: Room.serializePath(path), targetPos: targetPos };
                this.creep.move(path[0].direction);
            } else {
                this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    } catch (error) {
        console.error(`Error in moveToTarget: ${error.message}`);
    }
};

/**
 * harvestEnergy is a wrapper for creep.harvest(source)
 * @param source - the source object to harvest
 */
CreepRole.prototype.harvestEnergy = function(source) {
    if (this.creep.store.getFreeCapacity() === 0) return;
    this.performAction(this.creep.harvest.bind(this.creep), source);
};

/**
 * transferEnergy is a wrapper for creep.transfer(target, RESOURCE_ENERGY)
 * @param target - the target object to transfer energy to
 */
CreepRole.prototype.transferEnergy = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.transfer.bind(this.creep, RESOURCE_ENERGY), target);
};

/**
 * buildStructure is a wrapper for creep.build(target)
 * @param target - the target object to build
 */
CreepRole.prototype.buildStructure = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.build.bind(this.creep), target);
};

/**
 * attackHostileCreeps is a wrapper for creep.attack(target)
 * looks for hostile creeps in the room and attacks the first one it finds
 */
CreepRole.prototype.attackHostileCreeps = function() {
    const hostileCreeps = this.creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostileCreeps.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileCreeps[0]);
};

/**
 * attackHostileStructures is a wrapper for creep.attack(target)
 * looks for hostile structures in the room and attacks the first one it finds
 */
CreepRole.prototype.attackHostileStructures = function() {
    const hostileStructures = this.creep.room.find(FIND_HOSTILE_STRUCTURES);
    if (hostileStructures.length > 0)
        this.performAction(this.creep.attack.bind(this.creep), hostileStructures[0]);
};

/**
 * repairStructure is a wrapper for creep.repair(target)
 * @param target - the target object to repair
 */
CreepRole.prototype.repairStructure = function(target) {
    if (this.creep.store.getUsedCapacity() === 0) return;
    this.performAction(this.creep.repair.bind(this.creep), target);
};



module.exports = CreepRole;