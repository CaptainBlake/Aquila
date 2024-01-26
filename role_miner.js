// role_miner.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleMiner = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to mining
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.MINING;
        }
        // check if creep is working and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.MINING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.IDLE;
            myCreep.creep.say('🔄 Idle');
        }
        // check if creep is idle and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.IDLE && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.MINING;
            myCreep.creep.say('⛏️ Mining');
        }

        // == perform actions == //

        // if creep is supposed to be mining
        if (myCreep.creep.memory.state === constants.STATES.MINING) {
            const sources = myCreep.creep.room.find(FIND_SOURCES);
            if(myCreep.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                myCreep.creep.moveTo(sources[0]);
            }
        }

        // if creep is supposed to be idle
        if (myCreep.creep.memory.state === constants.STATES.IDLE) {
            // wait for energy to be available
            myCreep.creep.say('⏳ Waiting for energy');
        }
    }
};

module.exports = roleMiner;