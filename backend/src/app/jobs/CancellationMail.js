import pt from 'date-fns/locale/pt';
import { format, parseISO } from 'date-fns';

import Mail from '../../lib/Mail';

class CancellationMail {
  get key(){
    return 'CancellationMail';
  }

  //tarefa que será executada
  async handle({ data }){

    const { appointment } = data;

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
        ),
      },
    });
  }
}

export default new CancellationMail();

//import CancelationMail from '..'
//vai ser possivel usa a propriedade CancelationMail.key de forma direta