// role_defender.js
const CreepRole = require('./role_creep');
const constants = require('./constants');

function Defender(creep) {
    CreepRole.call(this, creep);
}

Defender.prototype = Object.create(CreepRole.prototype);
Defender.prototype.constructor = Defender;

Defender.prototype.run = function() {
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.DEFENDING;
    }

    const hostileCreeps = this.creep.room.find(FIND_HOSTILE_CREEPS);

    if (hostileCreeps.length > 0) {
        this.attackHostileCreeps(hostileCreeps[0]);
    } else {
        this.defensiveAction();
    }
};

Defender.prototype.attackHostileCreeps = function(target) {
    if (this.creep.attack(target) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
    }
};

Defender.prototype.defensiveAction = function () {
    const damagedStructures = this.creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.hits < structure.hitsMax;
        },
    });

    if (damagedStructures.length > 0) {
        this.repairStructure(damagedStructures[0]);
    } else {
        // Move to a strategic position or other defensive actions
        // ...
    }
};

Defender.prototype.repairStructure = function(target) {
    if (this.creep.repair(target) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
    }
};

module.exports = Defender;