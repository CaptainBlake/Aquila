// role_upgrader.js
const CreepRole = require('./role_creep');
const constants = require('./constants');

function Upgrader(creep) {
    CreepRole.call(this, creep);
}

Upgrader.prototype = Object.create(CreepRole.prototype);
Upgrader.prototype.constructor = Upgrader;

Upgrader.prototype.run = function() {
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.UPGRADING;
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.UPGRADING && this.creep.store[RESOURCE_ENERGY] === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.IDLE;
        this.creep.say('🔄 Idle');
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.IDLE && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.UPGRADING;
        this.creep.say('⚡ Upgrading');
    }

    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.UPGRADING) {
        if(this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller);
        }
    } else {
        // Upgrader is idle, waiting for energy to be available
        this.creep.say('⏳ Waiting for energy');
    }
};

module.exports = Upgrader;