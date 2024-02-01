'use strict';
//role_harvester.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleHarvester = {

    /** @param {Creep} _creep **/


    run: function(_creep) {
        let myCreep = new MyCreep(_creep);

        // State machine
        
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }

        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.HARVESTING);
        }

        if (myCreep.creep.memory.state === constants.STATES.HARVESTING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.WORKING);
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.TARGET, null);
            myCreep.creep.say('🚧 Working');
        }

        if (myCreep.creep.memory.state === constants.STATES.WORKING && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.STATE, constants.STATES.HARVESTING);
            myCreep.updateMemoryAttribute(constants.ATTRIBUTES.TARGET, null);
            myCreep.creep.say('🔄 Harvesting');
        }

        // Perform actions based on state
        
        if (myCreep.creep.memory.state === constants.STATES.HARVESTING) {
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            if (!source || source.energy === 0) {
                source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                myCreep.creep.memory.target = source.id;
            }
            myCreep.harvestEnergy(source);
        }

        if (myCreep.creep.memory.state === constants.STATES.WORKING) {
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null;
            // if target is null, find a target
            if(!target){
                // find closest container, spawn, or extension
                target = myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
            }
            const result = myCreep.creep.transfer(target, RESOURCE_ENERGY);
            if(result === ERR_NOT_IN_RANGE) {
                myCreep.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleHarvester;