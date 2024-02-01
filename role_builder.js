// role_builder.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleBuilder = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        let myCreep = new MyCreep(_creep);
        // If creep is initializing, set state to harvesting
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            myCreep.creep.memory.state = constants.STATES.HARVESTING;
        }

        // If creep's energy carry is full or (state is HARVESTING and no more energy to harvest), go building
        if (myCreep.creep.store.getFreeCapacity() === 0 ||
            (myCreep.creep.memory.state === constants.STATES.HARVESTING && myCreep.creep.room.find(FIND_SOURCES_ACTIVE).length === 0)) {
            myCreep.creep.memory.state = constants.STATES.BUILDING;
            myCreep.creep.memory.target = null;
        }

        // If creep's energy carry is empty or (state is BUILDING and no more construction sites), go harvesting
        else if (myCreep.creep.store.getUsedCapacity() === 0 ||
            (myCreep.creep.memory.state === constants.STATES.BUILDING && myCreep.creep.room.find(FIND_CONSTRUCTION_SITES).length === 0)) {
            myCreep.creep.memory.state = constants.STATES.HARVESTING;
            myCreep.creep.memory.target = null;
        }

        // Perform actions based on state
        if (myCreep.creep.memory.state === constants.STATES.BUILDING) {
            // build stuff
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            //console.log(`Creep ${myCreep.creep.name} is building ${target}`);
            if (target) {
                if (target.progress === target.progressTotal) {
                    // find closest construction site
                    //console.log(`Construction site ${target} is complete`);
                    target = myCreep.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                    if (target) {
                        myCreep.creep.memory.target = target.id;
                    } else {
                        console.log(`No new construction sites found for creep ${myCreep.creep.name}`);
                        myCreep.creep.memory.target = null;

                    }
                } else {
                    console.log(`Building ${target}`)
                    myCreep.buildStructure(target);
                }
            } else {
                console.log(`No construction sites found for creep ${myCreep.creep.name}`);
                // find the closest spawn, extension or tower which is not full and transfer energy to it
                target = myCreep.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN
                            || s.structureType === STRUCTURE_EXTENSION
                            || s.structureType === STRUCTURE_TOWER)
                        && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                });
                if (target) {
                    myCreep.creep.memory.target = target.id;
                    const result = myCreep.creep.transfer(target);
                    switch (result) {
                        case ERR_NOT_IN_RANGE:
                            myCreep.moveToTarget(target);
                            break;
                        case ERR_FULL:
                            myCreep.creep.memory.target = null;
                            break;
                        case OK:
                            break;
                        default:
                            console.log(`Unknown error for creep ${myCreep.creep.name} and target ${target}: ${result}`);
                            myCreep.creep.memory.target = null;
                            break;
                    }
                } else {
                    console.log(`No valid target found for creep ${myCreep.creep.name}`);
                    myCreep.creep.memory.target = null;
                    target = null;
                }
                
            }
        } else if (myCreep.creep.memory.state === constants.STATES.HARVESTING) {
            // get energy from source
            let source = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : myCreep.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.store.getUsedCapacity(RESOURCE_ENERGY) > constants.ENERGY_MINIMUM_IN_SPAWN
            });
            if (!source)
                source = myCreep.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // if source is a spawn, extension, or container
            if(source && source.structureType) {
                myCreep.creep.say("🔌")
                let result = myCreep.creep.withdraw(source, RESOURCE_ENERGY);
                switch (result) {
                    case ERR_NOT_IN_RANGE:
                        myCreep.moveToTarget(source);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        myCreep.creep.memory.target = null;
                        myCreep.creep.memory.path = null;
                        break;
                    case OK:
                        break;
                    default:
                        console.log(`Unknown error for creep ${myCreep.creep.name} and target ${target}: ${result}`);
                        myCreep.creep.memory.target = null;
                        break;
                }
            }
            else{
                myCreep.harvestEnergy(source);
            }
        }
    }
};

module.exports = roleBuilder;