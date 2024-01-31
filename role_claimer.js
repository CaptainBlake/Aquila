// role_claimer.js
const constants = require('./constants');
const MyCreep = require("./creep_prototype");

let roleClaimer = {

    /** @param {Creep} _creep **/

    run: function(_creep) {
        // == check state == //
        let myCreep = new MyCreep(_creep);
        // if creep is spawning, return
        if (myCreep.creep.spawning){
            console.log(`Creep ${myCreep.creep.name} is spawning...`);
            return;
        }
        // after spawning, set state to idle
        if (myCreep.creep.memory.state === constants.STATES.INITIALIZING) {
            console.log("...done spawning");
            myCreep.creep.memory.state = constants.STATES.IDLE;
        }
        // check if creep is working and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.CLAIMING && myCreep.creep.store.getFreeCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.IDLE;
            //myCreep.creep.say('🔄 Idle');
        }
        // check if creep is idle and needs to switch state
        if (myCreep.creep.memory.state === constants.STATES.IDLE && myCreep.creep.store.getUsedCapacity() === 0) {
            myCreep.creep.memory.state = constants.STATES.CLAIMING;
            //myCreep.creep.say('🚩 Claiming');
        }

        // == perform actions == //

        // if creep is supposed to be claiming
        if (myCreep.creep.memory.state === constants.STATES.CLAIMING) {
            let controller = myCreep.creep.room.controller;
            this.claimController(controller);
        }

        // if creep is supposed to be idle
        if (myCreep.creep.memory.state === constants.STATES.IDLE) {
            // wait for energy to be available
            //myCreep.creep.say('⏳ Waiting for energy');
        }
    },

    claimController: function(_controller) {
        let myController = new MyController(_controller);
        let claimResult = this.checkControllerStatus(myController);
        if (claimResult !== OK) {
            return;
        }

        claimResult = myController.controller.claimController();
        this.handleClaimResult(claimResult, myController);
    },

    // == helper functions == //
    checkControllerStatus: function(myController) {
        if (myController.controller.my) {
            console.log(`Controller ${myController.controller.id} is already claimed.`);
            return ERR_INVALID_TARGET;
        }
        if (myController.controller.owner) {
            console.log(`Controller ${myController.controller.id} is already reserved.`);
            return ERR_INVALID_TARGET;
        }
        if (myController.controller.reservation && myController.controller.reservation.ticksToEnd > 0) {
            console.log(`Controller ${myController.controller.id} is already reserved.`);
            return ERR_INVALID_TARGET;
        }
        if (myController.controller.reservation && myController.controller.reservation.ticksToEnd === 0) {
            console.log(`Controller ${myController.controller.id} is already reserved, but reservation has expired.`);
            return ERR_INVALID_TARGET;
        }
        if (myController.controller.sign && myController.controller.sign.username === constants.USERNAME) {
            console.log(`Controller ${myController.controller.id} is already signed.`);
            return ERR_INVALID_TARGET;
        }
        if (myController.controller.sign && myController.controller.sign.username !== constants.USERNAME) {
            console.log(`Controller ${myController.controller.id} is already signed by ${myController.controller.sign.username}.`);
            return ERR_INVALID_TARGET;
        }
        return OK;
    },

    handleClaimResult: function(claimResult, myController) {
        switch (claimResult) {
            case OK:
                console.log(`Controller ${myController.controller.id} claimed!.`);
                break;
            case ERR_NOT_IN_RANGE:
                myController.moveTo(myController.controller);
                break;
            case ERR_GCL_NOT_ENOUGH:
                console.log(`Controller ${myController.controller.id} cannot be claimed because GCL is not enough.`);
                break;
            case ERR_INVALID_TARGET:
                console.log(`Controller ${myController.controller.id} cannot be claimed because it is not a valid target.`);
                break;
            case ERR_FULL:
                console.log(`Controller ${myController.controller.id} cannot be claimed because it is already claimed.`);
                break;
            case ERR_TIRED:
                console.log(`Controller ${myController.controller.id} cannot be claimed because it is still cooling down.`);
                break;
            case ERR_NO_BODYPART:
                console.log(`Controller ${myController.controller.id} cannot be claimed because creep has no CLAIM body parts.`);
                break;
            case ERR_NOT_OWNER:
                console.log(`Controller ${myController.controller.id} cannot be claimed because creep is not the owner.`);
                break;
            case ERR_BUSY:
                console.log(`Controller ${myController.controller.id} cannot be claimed because creep is still spawning.`);
                break;
            case ERR_NOT_FOUND:
                console.log(`Controller ${myController.controller.id} cannot be claimed because it does not exist.`);
                break;
            case ERR_INVALID_ARGS:
                console.log(`Controller ${myController.controller.id} cannot be claimed because the target is not a controller.`);
                break;
            case ERR_RCL_NOT_ENOUGH:
                console.log(`Controller ${myController.controller.id} cannot be claimed because the target is not in the room.`);
                break;
            default:
                console.log(`Controller ${myController.controller.id} cannot be claimed due to an unknown error.`);
                break;
        }
    }
};

module.exports = roleClaimer;