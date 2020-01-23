import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';


//importar configurações do BD
import databaseConfig from '../config/database';
//todos os models no array
const models = [User, File, Appointment];

class Database{
  constructor(){
    this.init();
    this.mongo();
  }
  //faz conexao com o BD e carregar os Models
  init(){
    this.connection = new Sequelize(databaseConfig);
    models
    .map(model => model.init(this.connection))
    .map(model => model.associate && model.associate(this.connection.models));

  }

  mongo(){
    this.mongoConnection = mongoose.connect(
      //verificar formar de conexao com um usuario
      process.env.MONGO_URL,
      { useNewUrlParser: true, useFindAndModify: true}
    );
  }
}

export default new Database();

