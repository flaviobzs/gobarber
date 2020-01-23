import Sequelize, {Model} from 'sequelize';

class File extends Model {
  static init(sequelize){
    //herdar metodo da classe Model
    super.init(
      {
        //inserir campos preenchiveis
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get(){
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        }
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default File;