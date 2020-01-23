import Sequelize, {Model} from 'sequelize';
import { isBefore, subHours } from 'date-fns';


class Appointment extends Model {
  static init(sequelize){
    //herdar metodo da classe Model
    super.init(
      {
        //inserir campos preenchiveis
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: { 
          type: Sequelize.VIRTUAL,
          get(){
            return isBefore(this.date, new Date());
          }
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get(){
            return isBefore(new Date(), subHours(this.date, 2));
          }
        }
      },
      {
        sequelize,
      }
    );
    return this;
  }
  //relacionamento com mais de uma tabela é obrigatorio das o apelido 'as' ao model 
  static associate(models){
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user'});
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider'});
  }
}

export default Appointment;