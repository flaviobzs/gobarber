import Appointment from '../models/Appointment';

import { startOfDay, endOfDay, setHours, setMinutes, setSeconds, format, isAfter } from 'date-fns';
import { Op } from 'sequelize';
import { isValid } from 'ipaddr.js';

class AvailableController {
  async index(req, res){
    const { date } = req.query;

    if(!date){
      return res.status(400).json({ error: 'Invalid date'});
    }

    const searchDate = Number(date);
    //2019-08-10 23:23:21

    const appointments = await Appointment.finddAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(searchDate),
            endOfDay(searchDate),
          ]
        },
      },
      //order: ['date'],
    });

    const schedule = [
      '08:00',  //2019-08-10 08:00:00 colocar nesse formato
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const available = schedule.map( time => {
      const [ hour, minute] = time.split(':');
      const value = setSeconds(setMinutes(setHours(searchDate, hour), minute), 0);

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available: isAfter(value, new Date()) && !appointments.find(a => {
          format(a.date, 'HH:mm') === time
        }),
      }
    })

    return res.json(available);
  }
}

export default new AvailableController();