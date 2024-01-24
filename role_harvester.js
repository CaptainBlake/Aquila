// role_harvester.js

const CreepRole = require('./role_creep');

function Harvester(creep) {
    this.creep = creep;
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
        delete this.creep.memory.sourceId; // No longer harvesting, so delete the source ID
    }
    if (!this.creep.memory.harvesting && this.creep.store.getUsedCapacity() === 0) {
        this.creep.memory.harvesting = true;
        this.creep.say('⛏️ Harvesting');
        delete this.creep.memory.targetId; // No longer delivering, so delete the target ID
    }

    if (this.creep.memory.harvesting) {
        let source;
        if (this.creep.memory.sourceId) {
            source = Game.getObjectById(this.creep.memory.sourceId);
        } else {
            const sources = this.creep.room.find(FIND_SOURCES);
            source = sources[0];
            this.creep.memory.sourceId = source.id;
        }
        this.creep.harvestEnergy(source);
    } else {
        let target;
        if (this.creep.memory.targetId) {
            target = Game.getObjectById(this.creep.memory.targetId);
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
            target = targets[0];
            this.creep.memory.targetId = target.id;
        }
        this.creep.transferEnergy(target);
    }
};

module.exports = Harvester;