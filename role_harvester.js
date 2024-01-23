// role_harvester.js

const basic_creep_functions = require('basic_creep_functions');

const Harvester = Object.assign({}, basic_creep_functions, {
    run: function (creep) {
        if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
            creep.memory.harvesting = false;
            creep.say('🔄 Delivering');
        }
        if (!creep.memory.harvesting && creep.store.getUsedCapacity() === 0) {
            creep.memory.harvesting = true;
            creep.say('⛏️ Harvesting');
        }

        if (creep.memory.harvesting) {
            const sources = creep.room.find(FIND_SOURCES);
            this.harvestEnergy(creep, sources[0]);
        } else {
            const targets = creep.room.find(FIND_STRUCTURES, {
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
                this.transferEnergy(creep, targets[0]);
            }
        }
    },
    
});

module.exports = Harvester;
