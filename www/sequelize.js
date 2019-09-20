"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript"); // this is the actual imported lib from (MPM or NPM ?)
const config_1 = require("./config/config");
const c = config_1.config.dev; // in the video it's const c = config.postgress; ??
// Instantiate new Sequelize instance!
exports.sequelize = new sequelize_typescript_1.Sequelize({
    "username": c.username,
    "password": c.password,
    "database": c.database,
    "host": c.host,
    dialect: 'postgres',
    storage: ':memory:',
});
/*
const postgresql= 'postgres:'+c.username+':'+c.password+'@'+c.host+':5432/'+c.database;
const DATABASE_URI=postgresql;//username:password@amazonhost:5432/database_name

export const sequelize = new Sequelize(DATABASE_URI);*/
//# sourceMappingURL=sequelize.js.map