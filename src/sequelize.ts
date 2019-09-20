import {Sequelize} from 'sequelize-typescript';// this is the actual imported lib from (MPM or NPM ?)
import { config } from './config/config';


const c = config.dev;// in the video it's const c = config.postgress; ??


// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,

  dialect: 'postgres',
  storage: ':memory:',
});


/*
const postgresql= 'postgres:'+c.username+':'+c.password+'@'+c.host+':5432/'+c.database;
const DATABASE_URI=postgresql;//username:password@amazonhost:5432/database_name

export const sequelize = new Sequelize(DATABASE_URI);*/

