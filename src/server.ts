import express from 'express';
import { sequelize } from './sequelize';//importing sequelize from our root source folder. 

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';

import { V0MODELS } from './controllers/v0/model.index';

//declaring our models
(async () => {
  await sequelize.addModels(V0MODELS);// we use the await tag to wait for add models to complete bc its async function, V0Models basically registers all of the models the we are importing from V0models, which is coming from model.index (line 8) 
  await sequelize.sync();// make sure that DB is in sync with Sequelize models.

  const app = express();
  const port = process.env.PORT || 8080; // default port to listen
  
  app.use(bodyParser.json());

  //CORS Should be restricted
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });



  app.use('/api/v0/', IndexRouter)// it tells that the app will use IndexRouter when we encounter the base endpoint of api v0, the IndexRouter will contain additional code to allows us to perform  all of the actions we like within this end point

  // Root URI call
  app.get( "/", async ( req, res ) => {
    res.send( "/api/v0/" );
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();