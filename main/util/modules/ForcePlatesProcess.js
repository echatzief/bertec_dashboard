"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');
const chalk = require('chalk');
/**
 * Start the force plate setup to connect to the force plate
 * before the application boot
 */
(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    try {
        yield spawn(process.env.NODE_ENV == "development"
            ? path.resolve(__dirname, '../../connection/ForcePlatesConnector.exe')
            : app.getPath("downloads") + "/.meta/connection/ForcePlatesConnector.exe", ["10"]);
        console.log(chalk.bold.white('[LOG] Force Plate Connector ') + chalk.bold.green('✓'));
    }
    catch (e) {
        console.log(chalk.bold.red('[ERROR] Force Plate Connector ') + chalk.bold.red('❌'));
    }
}))();
