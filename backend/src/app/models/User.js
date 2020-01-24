import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize){
    //herdar metodo da classe Model
    super.init(
      {
        //inserir campos preenchiveis
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        //nunca ira existir no BD, só no lado do código
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    //trecho de codigo que acontece baseado em ações (tipo tigger)
    this.addHook('beforeSave', async user =>{
      if(user.password){
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  //relacionamento com outra tabela 
  static associate(models){
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar'});
  }

  //verificação de senha normal e com hash
  checkPassword(password){
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;