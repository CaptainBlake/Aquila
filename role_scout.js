// role_scout.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleScout = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to scouting
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.SCOUTING;
        }

        // == perform actions == //

        // if creep is supposed to be scouting
        if (myCreep.creep.memory.state === constants.STATES.SCOUTING) {
            // Implement the logic for the scout role here
            // ...
        }
    }
};

module.exports = roleScout;