// role_carrier.js
const CreepRole = require('./role_creep');
const constants = require('./constants');

function Carrier(creep) {
    CreepRole.call(this, creep);
}

Carrier.prototype = Object.create(CreepRole.prototype);
Carrier.prototype.constructor = Carrier;

Carrier.prototype.run = function() {
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.IDLE;
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.IDLE && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.WORKING;
        this.creep.say('🚚 Carrying');
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.WORKING && this.creep.store[RESOURCE_ENERGY] === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.IDLE;
        this.creep.say('🔄 Idle');
    }

    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.WORKING) {
        const targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (targets.length > 0) {
            this.transferEnergy(targets[0]);
        }
    } else {
        // Carrier is idle, waiting for energy to be available
        this.creep.say('⏳ Waiting for energy');
    }
};

module.exports = Carrier;