import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import * as Yup from 'yup';
//lib para trabalhar com horas
import {startOfHour, parseISO, isBefore, format, subHours} from 'date-fns';
import pt from 'date-fns/locale/pt';
//esquema de model mongodb
import Notification from '../schemas/Notification';
//import { subHours } from 'date-fns/esm';

//import Mail from '../../lib/Mail';
//importar a fila ao inves do Mail
import Queue from '../../lib/Queue';

//importar job de cancelamento
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res){

    //selecionar o parametro da paginação na url
    const {page = 1} = req.query;

    const appointments = await Appointment.findAll({
      where:{ user_id: req.userId, canceled_at: null},
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      //indicar a quantidade de dados a ser exibido
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res){
    // validação
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });
    
    //se não estiver ok na validação
    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Validation fails'});
    }

    const { provider_id, date} = req.body;

    //verificar se é provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true},
    });

    //!!!!!!!!!!!!!  req.userId != provider_id
    //priver nao pode fazer agendamento com ele mesmo!!!!!
    //!!!!!!!!!!!!!!

    if(!isProvider){
      return res.status(401).json({error: 'You can only create appointments with providers'});
    }

    //verificar se a data não passou
    const hourStart = startOfHour(parseISO(date));

    if(isBefore(hourStart, new Date())){
      return res.status(400).json({error: 'Past dates are not permitted'});
    }

    //verificar se a data está disponivel
    const checkAvailability = await Appointment.findOne({
      where:{
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    })

    if(checkAvailability){
      return res.status(400).json({error: 'Appointment date is not avalible'});
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    //notificar o provider

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res){

    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        }
      ]
    });


    //busca de provedor de serviço para enviar o email
    //const provider = await Provider.findByPk(req.params.id);


    //console.log(appointment);
    if(appointment.user_id !== req.userId){
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment."
      });
    }

    //verificar se o cancelamento é um horario que não passou

    const dateWithSub = subHours(appointment.date, 2);
    console.log(dateWithSub);
    //13:00
    //dateWithSub 11:00
    //now() 11:25 - não é permitido apagar

    if(isBefore(dateWithSub, new Date())){
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance.',
      })
    };

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    //retirar o await para a requisição ficar mais rapida
    // await Mail.sendMail({
    //   to: `${appointment.provider.name} <${appointment.provider.email}>`,
    //   subject: 'Agendamento cancelado',
    //   //text: 'Voce tem um novo cancelamento',
    //   template: 'cancellation',
    //   context: {
    //     provider: appointment.provider.name,
    //     user: appointment.user.name,
    //     date: format(
    //       appointment.date,
    //       "dd 'de' MMMM', às' H:mm'h'",
    //       { locale: pt }
    //     ),
    //   },
    // });

    return res.json(appointment);

  }

}

export default new AppointmentController();