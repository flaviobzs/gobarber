export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Flávio BS <noreply@gobraber.com>',
  },
};


//Amazon SES
//Mailgun
//Sparkpost
//Mandril (Mailchip)
//GMAIL

//Mailtrap(DEV)