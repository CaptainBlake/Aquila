// role_repairer.js
const CreepRole = require('./role_creep');
const constants = require('./constants');

function Repairer(creep) {
    CreepRole.call(this, creep);
}

Repairer.prototype = Object.create(CreepRole.prototype);
Repairer.prototype.constructor = Repairer;

Repairer.prototype.run = function() {
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.REPAIRING;
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.REPAIRING && this.creep.store[RESOURCE_ENERGY] === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.IDLE;
        this.creep.say('🔄 Idle');
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.IDLE && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.REPAIRING;
        this.creep.say('🔧 Repairing');
    }

    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.REPAIRING) {
        const targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });
        targets.sort((a,b) => a.hits - b.hits);
        if(targets.length > 0) {
            if(this.creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(targets[0]);
            }
        }
    } else {
        // Repairer is idle, waiting for energy to be available
        this.creep.say('⏳ Waiting for energy');
    }
};

module.exports = Repairer;