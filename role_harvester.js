// harvester.js
const CreepRole = require('role_creep');
const constants = require('./constants');

function Harvester(creep) {
    console.log(`Creating new Harvester for ${creep.name}`);
    CreepRole.call(this, creep);
}

Harvester.prototype = Object.create(CreepRole.prototype);
Harvester.prototype.constructor = Harvester;

Harvester.prototype.run = function() {
    this.creep.say('Harvester running! 🚀');
    if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.INITIALIZING) {
        this.creep.memory[constants.ATTRIBUTES.STATE] = constants.STATES.HARVESTING;
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.HARVESTING) {
        let source = Game.getObjectById(this.creep.memory[constants.ATTRIBUTES.SOURCE_ID]);
        if (!source) {
            source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                this.updateMemoryAttribute(constants.ATTRIBUTES.SOURCE_ID, source.id);
            } else {
                console.log('No sources found');
                return;
            }
        }
        this.harvestEnergy(source);
    } else if (this.creep.memory[constants.ATTRIBUTES.STATE] === constants.STATES.WORKING) {
        let target = Game.getObjectById(this.creep.memory[constants.ATTRIBUTES.TARGET]);
        if (!target) {
            target = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (target) {
                this.updateMemoryAttribute(constants.ATTRIBUTES.TARGET, target.id);
            } else {
                console.log('No targets found');
                return;
            }
        }
        this.transferEnergy(target);
    }
};

Harvester.prototype.harvestEnergy = function(source) {
    if (this.creep.store.getFreeCapacity() > 0) {
        if (this.creep.memory[constants.ATTRIBUTES.STATE] !== constants.STATES.HARVESTING) {
            this.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.HARVESTING);
        }
        if (this.creep.memory[constants.ATTRIBUTES.SOURCE_ID] !== source.id) {
            this.updateMemoryAttribute(constants.ATTRIBUTES.SOURCE_ID, source.id);
        }
        this.performAction(this.creep.harvest.bind(this.creep), source);
    }
};

Harvester.prototype.transferEnergy = function(target) {
    if (this.creep.store.getUsedCapacity() > 0) {
        if (this.creep.memory[constants.ATTRIBUTES.STATE] !== constants.STATES.WORKING) {
            this.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.WORKING);
        }
        if (this.creep.memory[constants.ATTRIBUTES.TARGET] !== target.id) {
            this.updateMemoryAttribute(constants.ATTRIBUTES.TARGET, target.id);
        }
        this.performAction(this.creep.transfer.bind(this.creep, RESOURCE_ENERGY), target);
    }
};

module.exports = Harvester;