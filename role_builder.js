// role_builder.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleBuilder = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to building
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.BUILDING;
        }
        // check if creep is working and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.BUILDING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.IDLE;
            myCreep.creep.say('🔄 Idle');
        }
        // check if creep is idle and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.IDLE && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.BUILDING;
            myCreep.creep.say('🚧 Building');
        }

        // == perform actions == //

        // if creep is supposed to be building
        if (myCreep.creep.memory.state === constants.STATES.BUILDING) {
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!target || target.progress === target.progressTotal) {
                // find closest construction site
                target = myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                myCreep.creep.memory.target = target.id;
            }
            myCreep.buildStructure(target);
        }

        // if creep is supposed to be idle
        if (myCreep.creep.memory.state === constants.STATES.IDLE) {
            // find closest source
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!source || source.energy === 0) {
                // find closest source
                source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                myCreep.creep.memory.target = source.id;
            }
            myCreep.harvestEnergy(source);
        }
    }
};

module.exports = roleBuilder;