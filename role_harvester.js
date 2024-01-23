// role_harvester.js

const CreepRole = require('./role_creep');

function Harvester(creep) {
    CreepRole.call(this, creep);
}

// Inherit from CreepRole
Harvester.prototype = Object.create(CreepRole.prototype);

/**
 * run is the main function for the creep
 * harvests energy from a source and delivers it to a target
 */
Harvester.prototype.run = function() {
    if (this.creep.memory.harvesting && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory.harvesting = false;
        this.creep.say('🔄 Delivering');
    }
    if (!this.creep.memory.harvesting && this.creep.store.getUsedCapacity() === 0) {
        this.creep.memory.harvesting = true;
        this.creep.say('⛏️ Harvesting');
    }

    if (this.creep.memory.harvesting) {
        const sources = this.creep.room.find(FIND_SOURCES);
        this.harvestEnergy(sources[0]);
    } else {
        const targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            },
        });

        if (targets.length > 0) {
            this.transferEnergy(targets[0]);
        }
    }
};

module.exports = Harvester;