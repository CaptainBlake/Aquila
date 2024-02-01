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
'use strict';
// Controller
const globalGameStateController = require('global_game_state_controller');
const populationController = require('./population_controller');
const buildController = require('./build_controller');

// initialize singleton controllers

const main = function() {
    
    // run population controller
    populationController.taskLoop();
    // run global game state controller
    globalGameStateController.taskLoop();
    // run build controller
    buildController.taskLoop();
    
}


module.exports.loop = function () {
    console.log("==================="+ Game.time +"========================");
    main();
    console.log("==== TOTAL AMOUNT OF CPU USED THIS TICK: " + Game.cpu.getUsed());
};