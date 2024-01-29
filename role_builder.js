// role_builder.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleBuilder = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        let myCreep = new MyCreep(_creep);

        // If creep's energy carry is full, go building
        if (myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.BUILDING;
        }

        // If creep's energy carry is empty, go harvesting
        else if (myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.HARVESTING;
        }

        // Perform actions based on state
        if (myCreep.creep.memory.state === constants.STATES.BUILDING) {
            // build stuff
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!target || target.progress === target.progressTotal) {
                // find closest construction site
                target = myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                myCreep.creep.memory.target = target.id;
            }
            if (target) {
                myCreep.buildStructure(target);
            }
        } else if (myCreep.creep.memory.state === constants.STATES.HARVESTING) {
            // harvest stuff
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            // check if target is not a source
            if (source instanceof ConstructionSite) {
                // find closest source or structure with energy
                source = myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                });
                if (!source || source.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                    source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                }
                myCreep.creep.memory.target = source.id;
            }
            if (source.structureType) {
                myCreep.creep.say("🔌")
                let result = myCreep.creep.withdraw(source, RESOURCE_ENERGY);
                if (result === ERR_NOT_IN_RANGE) {
                    myCreep.creep.moveTo(source);
                } else if (result < 0) {
                    myCreep.handleError(result, source);
                }
            } else {
                myCreep.creep.say("🔄")
                myCreep.harvestEnergy(source);
            }
        }
    }
};

module.exports = roleBuilder;