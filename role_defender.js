// role_defender.js

const basic_creep_functions = require('basic_creep_functions');

const Defender = Object.assign({}, basic_creep_functions, {
    run: function (creep) {
        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);

        if (hostileCreeps.length > 0) {
            this.attackHostileCreeps(creep, hostileCreeps[0]);
        } else {
            // If no hostile creeps, move to a strategic position or perform other defensive actions
            this.defensiveAction(creep);
        }
    },

    defensiveAction: function (creep) {
        // Implement your custom defensive logic here
        // For example, move to a strategic position or repair damaged structures
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax;
            },
        });

        if (damagedStructures.length > 0) {
            this.repairStructure(creep, damagedStructures[0]);
        } else {
            // Move to a strategic position or other defensive actions
            // ...
        }
    },
});

module.exports = Defender;
