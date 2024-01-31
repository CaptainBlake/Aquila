// role_carrier.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleCarrier = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to idle
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.IDLE;
        }
        // check if creep is working and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.WORKING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.IDLE;
            //myCreep.creep.say('🔄 Idle');
        }
        // check if creep is idle and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.IDLE && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.WORKING;
            //myCreep.creep.say('🚚 Carrying');
        }

        // == perform actions == //

        // if creep is supposed to be working
        if (myCreep.creep.memory.state === constants.STATES.WORKING) {
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                // find closest structure that needs energy
                target = myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                myCreep.creep.memory.target = target.id;
            }
            myCreep.transferEnergy(target);
        }

        // if creep is supposed to be idle
        if (myCreep.creep.memory.state === constants.STATES.IDLE) {
            // wait for energy to be available
            //myCreep.creep.say('⏳ Waiting for energy');
        }
    }
};

module.exports = roleCarrier;