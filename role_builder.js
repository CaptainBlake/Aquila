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
            // Use first construction site from room memory, or use the one stored in the creep's memory
            let target = myCreep.creep.memory.target ? Game.getObjectById(myCreep.creep.memory.target) : null; 
            // console.log(`Creep ${myCreep.creep.name} is building ${target}`);
            if (target) {
                if (!(target instanceof ConstructionSite)) {
                    console.log(`Target is not a construction site: ${target}` + target.name)
                    target = null;
                    myCreep.creep.memory.target = null;
                } else {
                    console.log(`Building ${target}`)
                    myCreep.buildStructure(target);
                }
            }else{
                console.log("get new construction site")
                let constructionSites = myCreep.creep.room.memory.constructionSites;
                if (constructionSites && constructionSites.length > 0) {
                    myCreep.creep.memory.target = constructionSites[0].id;
                    console.log(`Creep ${myCreep.creep.name} is building ${constructionSites[0].type}`);
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
                //TODO: pathfindingAPI --> use withdrawEnergy()
                let result = myCreep.creep.withdraw(source, RESOURCE_ENERGY);
                switch (result) {
                    case ERR_NOT_IN_RANGE:
                        myCreep.creep.moveTo(source); 
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