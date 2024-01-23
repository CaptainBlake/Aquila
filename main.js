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

const spawnController = require('spawn_controller');
const constants = require('./constants');
const Harvester = require('role_harvester');
const Builder = require('role_builder');
const Defender = require('role_defender');
const Upgrader = require('role_upgrader');
const Repairer = require('role_repairer');
const Carrier = require('role_carrier');
const Miner = require('role_miner');
const Scout = require('role_scout');
const Claimer = require('role_claimer');

module.exports.loop = function () {

    // iterate through all spawns
    for (const spawnName in Game.spawns) {
        const spawn = Game.spawns[spawnName];

        // Check if the spawn queue is full before adding more creeps
        if (!spawnController.isSpawnQueueFull(spawn)) {
            // Dynamically determine the priority of each role
            const priorities = determinePriorities(spawn);

            // Add creeps to the spawn queue with appropriate priorities
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_HARVESTER, priorities.harvester);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_BUILDER, priorities.builder);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_DEFENDER, priorities.defender);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_UPGRADER, priorities.upgrader);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_REPAIRER, priorities.repairer);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_CARRIER, priorities.carrier);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_MINER, priorities.miner);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_SCOUT, priorities.scout);
            spawnController.addToSpawnQueue(spawn, constants.CREEP_ROLE_CLAIMER, priorities.claimer);
        }
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
        if (creep.memory.role === constants.CREEP_ROLE_HARVESTER) {
            const harvester = new Harvester(creep);
            harvester.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_BUILDER) {
            const builder = new Builder(creep);
            builder.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_DEFENDER) {
            const defender = new Defender(creep);
            defender.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_UPGRADER) {
            const upgrader = new Upgrader(creep);
            upgrader.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_REPAIRER) {
            const repairer = new Repairer(creep);
            repairer.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_CARRIER) {
            const carrier = new Carrier(creep);
            carrier.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_MINER) {
            const miner = new Miner(creep);
            miner.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_SCOUT) {
            const scout = new Scout(creep);
            scout.run();
        }
        if (creep.memory.role === constants.CREEP_ROLE_CLAIMER) {
            const claimer = new Claimer(creep);
            claimer.run();
        }
    }
};