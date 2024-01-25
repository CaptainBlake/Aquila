// role_builder.js
const CreepRole = require('./role_creep');
const constants = require('./constants');

function Builder(creep) {
    CreepRole.call(this, creep);
}

Builder.prototype = Object.create(CreepRole.prototype);
Builder.prototype.constructor = Builder;

Builder.prototype.run = function() {
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.BUILDING;
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.BUILDING && this.creep.store[RESOURCE_ENERGY] === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.IDLE;
        this.creep.say('🔄 Idle');
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.IDLE && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.BUILDING;
        this.creep.say('🚧 Building');
    }

    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.BUILDING) {
        const targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            this.buildStructure(targets[0]);
        }
    } else {
        // Builder is idle, waiting for energy to be available
        this.creep.say('⏳ Waiting for energy');
    }
};

module.exports = Builder;