'use strict';
//role_harvester.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleHarvester = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to harvesting
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.HARVESTING);
        }
        // check if creep is working and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.HARVESTING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.WORKING);
            //myCreep.creep.say('🚧 Working');
        }
        // check if creep is harvesting and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.WORKING && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.HARVESTING);
            //myCreep.creep.say('🔄 Harvesting');
        }

        // == perform actions == //

        // if creep is supposed to be harvesting
        if (myCreep.creep.memory.state === constants.STATES.HARVESTING) {
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!source || source.energy === 0) {
                // find closest source
                source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                myCreep.creep.memory.target = source.id;
            }
            myCreep.harvestEnergy(source);
        }

        // if creep is supposed to be working
        if (myCreep.creep.memory.state === constants.STATES.WORKING) {
            // find closest spawn, extension or tower which is not full
            let target = myCreep.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_SPAWN
                        || s.structureType === STRUCTURE_EXTENSION
                        || s.structureType === STRUCTURE_TOWER)
                    && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            // If no target is found, return early
            if (!target) {
                console.log("No suitable target found for creep " + myCreep.creep.name);
                return;
            }
            // transfer energy to the target
            if (myCreep.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                myCreep.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    }
};

module.exports = roleHarvester;