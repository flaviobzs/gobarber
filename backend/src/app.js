import 'dotenv/config';
//carreca todas as variaveis ficam salvas e para usar é só colocar process.env.NOME

// const express = require("express");
// const routes = require("./routes");
import express from 'express';
import 'express-async-errors';
import routes from './routes';
import path from 'path';
import Youch from 'youch';

import * as Sentry from '@sentry/node';

import sentryConfig from './config/sentry';

//importar conexão com o banco
import './database';

class App {
  // toda vez que a classe é chamada o método inicia com esses atributos
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }
  
  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use( '/files', express.static(path.resolve(__dirname, '..', 'tmp', 'upload')));
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());

  }

  exceptionHandler(){
    this.server.use(async (err, req, res, next) => {
      if(process.env.NODE_ENV === 'development'){
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error'});
    });
  }
}

// module.exports = new App().server;
export default new App().server;
