// role_builder.js

function Builder(creep) {
    this.creep = creep;
}

Builder.prototype.run = function() {
    if (this.creep.memory.building && this.creep.store[RESOURCE_ENERGY] === 0) {
        this.creep.memory.building = false;
        this.creep.say('🔄 Harvesting');
    }
    if (!this.creep.memory.building && this.creep.store.getFreeCapacity() === 0) {
        this.creep.memory.building = true;
        this.creep.say('🚧 Building');
    }

    if (this.creep.memory.building) {
        const targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            this.buildStructure(this.creep, targets[0]);
        }
    } else {
        const sources = this.creep.room.find(FIND_SOURCES);
        this.harvestEnergy(this.creep, sources[0]);
    }
};

module.exports = Builder;