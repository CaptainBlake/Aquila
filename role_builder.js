// role_builder.js

const basic_creep_functions = require('basic_creep_functions');

const Builder = Object.assign({}, basic_creep_functions, {
    run: function (creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say('🔄 Harvesting');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say('🚧 Building');
        }

        if (creep.memory.building) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                this.buildStructure(creep, targets[0]);
            }
        } else {
            const sources = creep.room.find(FIND_SOURCES);
            this.harvestEnergy(creep, sources[0]);
        }
    },
});

module.exports = Builder;
