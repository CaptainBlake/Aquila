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
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (target.progress === target.progressTotal) {
                    // find closest construction site
                    target = myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                    if (target) {
                        myCreep.creep.memory.target = target.id;
                    } else {
                        console.log(`No new construction sites found for creep ${myCreep.creep.name}`);
                        myCreep.creep.memory.target = null;
                    }
                } else {
                    myCreep.buildStructure(target);
                }
            } else {
                console.log(`No construction sites found for creep ${myCreep.creep.name}`);
                myCreep.creep.say("🤔")
            }
        } else if (myCreep.creep.memory.state === constants.STATES.HARVESTING) {
            // harvest stuff
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (source) {
                if (source instanceof ConstructionSite) {
                    myCreep.creep.memory.target = null;
                }
                // if source is a spawn, extension, or container and has energy
                if ((source.structureType === STRUCTURE_CONTAINER || source.structureType === STRUCTURE_EXTENSION || source.structureType === STRUCTURE_SPAWN) && source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    myCreep.creep.say("🔌")
                    if(myCreep.creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        myCreep.moveToTarget(source);
                    }
                }
                // if source is a source
                else {
                    myCreep.harvestEnergy(source);
                }
            } else {
                // find closed extension, spawn, or container with energy
                source = myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                });
                if (source && source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    myCreep.creep.memory.target = source.id;
                } else {
                    // find a source
                    source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (source) {
                        myCreep.creep.memory.target = source.id;
                    }
                }
            }
        }
    }
};

module.exports = roleBuilder;