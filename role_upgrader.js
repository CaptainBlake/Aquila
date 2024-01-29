// role_upgrader.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleUpgrader = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to collecting
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.COLLECTING;
        }
        // if creep is out of energy, set state to collecting
        if (myCreep.creep.memory.state === constants.STATES.UPGRADING && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.COLLECTING;
        }
        // if creep is full of energy, set state to upgrading
        if (myCreep.creep.memory.state === constants.STATES.COLLECTING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.UPGRADING;
        }
        
        // == perform actions == //
        
        // if creep is supposed to transfer energy to the controller
        if (myCreep.creep.memory.state === constants.STATES.UPGRADING) {
            // try to upgrade the controller
            myCreep.upgradeController(myCreep.creep.room.controller);
        }
        // if creep is supposed to collect energy from a source
        else if (myCreep.creep.memory.state === constants.STATES.COLLECTING) {
            // check if memory has a target as a source
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if(!source) {
                // if not, find closed extension, spawn, or container with energy
                source = myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                });
                if(source && source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    myCreep.creep.memory.target = source.id;
                }else{
                    // if there is no source, find a source
                    source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if(source) {
                        myCreep.creep.memory.target = source.id;
                    }
                }
            }else{
                // if source is a spawn, extension, or container
                if(source.structureType) {
                    myCreep.creep.say("🔌")
                    let result = myCreep.creep.withdraw(source, RESOURCE_ENERGY);
                    if (result === ERR_NOT_IN_RANGE) {
                        myCreep.creep.moveTo(source);
                    } else if (result < 0) {
                        myCreep.handleError(result, source);
                        console.log(`Error ${result} for creep ${myCreep.creep.name} and target ${source}: ${result}`);
                    }
                }else if(source instanceof Source) {
                    // if source is a source
                    myCreep.creep.say("🔄")
                    myCreep.creep.harvestEnergy(source);
                }
            }
        }
    }
};

module.exports = roleUpgrader;