// role_defender.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleDefender = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to defending
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.DEFENDING;
        }

        // == perform actions == //

        // if creep is supposed to be defending
        if (myCreep.creep.memory.state === constants.STATES.DEFENDING) {
            const hostileCreeps = myCreep.creep.room.find(FIND_HOSTILE_CREEPS);

            if (hostileCreeps.length > 0) {
                myCreep.attackHostileCreeps(hostileCreeps[0]);
            } else {
                
                this.defensiveAction();
            }
        }
    },

    attackHostileCreeps: function(target) {
        if (this.creep.attack(target) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    },

    defensiveAction: function () {
        const damagedStructures = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax;
            },
        });

        if (damagedStructures.length > 0) {
            this.repairStructure(damagedStructures[0]);
        } else {
            // Move to a strategic position or other defensive actions
            // ...
        }
    },

    repairStructure: function(target) {
        if (this.creep.repair(target) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    }
};

module.exports = roleDefender;