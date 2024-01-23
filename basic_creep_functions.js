// creep_template.js

const constants = require('constants');

const basic_creep_functions = {
    
    
    // DEFAULT: moves creep to target
    //TODO: add pathfinding (creeps should move around obstacles)
    //TODO: add path caching (creeps should remember paths)
    //TODO: add path clearing (creeps should clear paths if they are blocked)
    moveToTarget: function (creep, target) {
        if (creep.pos.isNearTo(target)) {
            return creep.move(creep.pos.getDirectionTo(target));
        } else {
            return creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    },

    // harvests energy from source, moves to source if not in range
    // only if creep is harvester role or builder role
    //TODO: add harvest priority (harvesters should harvest first)
    harvestEnergy: function (creep, source) {
        
        if (creep.memory.role === constants.CREEP_ROLE_HARVESTER || creep.memory.role === constants.CREEP_ROLE_BUILDER){
            if (creep.store.getFreeCapacity() === 0) {
                // If the creep is already full, no need to harvest
                return;
            }

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                this.moveToTarget(creep, source);
            }
        }
    },

    // DEFAULT: transfers energy to target, moves to target if not in range
    //TODO: add transfer priority (harvesters should transfer last)
    transferEnergy: function (creep, target) {
        if (creep.store.getUsedCapacity() === 0) {
            // If the creep is out of energy, no need to transfer
            return;
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveToTarget(creep, target);
        }
    },

    // DEFAULT: builds structure, moves to structure if not in range
    // only if creep is builder role
    //TODO: add build priority (builders should build first)
    buildStructure: function (creep, target) {
        if (creep.memory.role === constants.CREEP_ROLE_BUILDER) {
            if (creep.store.getUsedCapacity() === 0) {
                // If the creep is out of energy, no need to build
                return;
            }

            if (creep.build(target) === ERR_NOT_IN_RANGE) {
                this.moveToTarget(creep, target);
            }
        }
    },

    // DEFAULT: attacks hostile creeps, moves to hostile creep if not in range
    // only if creep is defender role
    // TODO: add ranged attack capability (defenders should attack from a distance)
    attackHostileCreeps: function (creep) {
        if (creep.memory.role === constants.CREEP_ROLE_DEFENDER) {
            const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps.length > 0) {
                this.moveToTarget(creep, hostileCreeps[0]);
                creep.attack(hostileCreeps[0]);
            }
        }
    },

    // DEFAULT: repairs structure, moves to structure if not in range
    // only if creep has repair capability (builder or defender)
    //TODO: add repair priority (builders should repair first)
    repairStructure: function (creep, target) {
        if (creep.memory.role === constants.CREEP_ROLE_BUILDER || creep.memory.role === constants.CREEP_ROLE_DEFENDER) {
            if (creep.store.getUsedCapacity() === 0) {
                // If the creep is out of energy, no need to repair
                return;
            }
            if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                this.moveToTarget(creep, target);
            }
        }
    },
};

module.exports = basic_creep_functions;