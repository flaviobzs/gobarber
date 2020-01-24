import 'dotenv/config';
//carreca todas as variaveis ficam salvas e para usar é só colocar process.env.NOME

// const express = require("express");
// const routes = require("./routes");
import express from 'express';
import 'express-async-errors';
import routes from './routes';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';

import io from 'socket.io'; //usar protocolo de websocket
import http from 'http';

import * as Sentry from '@sentry/node';

import sentryConfig from './config/sentry';

//importar conexão com o banco
import './database';

class App {
  // toda vez que a classe é chamada o método inicia com esses atributos
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);

    Sentry.init(sentryConfig);

    this.socket();

    this.middlewares();
    this.routes();
    this.exceptionHandler();

    this.connectedUsers = {}; //verificar usuarios conectados no protocolo(socket) 
  }

  socket() {
    this.io = io(this.server);

    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;

      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }
  
  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.app.use(cors()); // permissão para uso de clientes externo dessa API 
    this.server.use(express.json());
    this.server.use( '/files', express.static(path.resolve(__dirname, '..', 'tmp', 'upload')));

    // colocar em arquivo separado 
    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;

      next();
    });
    
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
