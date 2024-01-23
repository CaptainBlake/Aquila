/*
===============================================================================
Aquila Bot for Screeps - Roman-inspired AI for Colony Management

Author: Captain Blake
GitHub Repository: https://github.com/CaptainBlake/Aquila

Description:
The Aquila bot is an intelligent colony management system inspired by Roman history.
It leverages strategic algorithms to optimize resource gathering, defense, and expansion.

Features:
- Automated resource harvesting and distribution.
- Defensive strategies against enemy units.
- Dynamic colony expansion based on available resources.

Origin:
The name "Aquila" is derived from the Latin word for "eagle," a symbol of strength and victory
used by ancient Romans. The bot's design draws inspiration from Roman military tactics.

License:
This code is distributed under the terms of the GNU General Public License (GPL) version 3.0.
See the LICENSE file or visit https://www.gnu.org/licenses/gpl-3.0.html for details.

Feel free to customize this code to suit your specific implementation and strategy.
Happy coding and conquering the Screeps world with Aquila!
===============================================================================
*/

// controllers
const spawnController = require('spawn_controller');
// modules
const constants = require('constants');
// roles
const roleHarvester = require('role_harvester');
const roleBuilder = require('role_builder');
const roleDefender = require('role_defender');

module.exports.loop = function () {

    // iterate through all spawns
    for (const spawnName in Game.spawns) {
        const spawn = Game.spawns[spawnName];
        //Add a harvester to the spawn queue with high priority (harvesters are critical to colony survival)
        spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_HARVESTER, constants.SPAWN_QUEUE_HIGH_PRIORITY);
        //Add a builder to the spawn queue with medium priority (builders are important but not critical to colony survival)
        spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_BUILDER, constants.SPAWN_QUEUE_MEDIUM_PRIORITY);
        //Add a defender to the spawn queue with low priority (defenders are not critical to colony survival)
        spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_DEFENDER, constants.SPAWN_QUEUE_LOW_PRIORITY);
    }
    
    
    // process spawn queue for a given spawn
    spawnController.processSpawnQueue(Game.spawns['Spawn1']);
    
    //remove dead creeps from memory
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    
    // iterate through all creeps and execute their roles
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === constants.CREEP_ROLE_BUILDER) {
            roleBuilder.run(creep);
        }
        if (creep.memory.role === constants.CREEP_ROLE_HARVESTER) {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === constants.CREEP_ROLE_DEFENDER) {
            roleDefender.run(creep);
        }
        // Add logic for other creep roles as needed
    }
};
