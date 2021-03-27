import Email from 'email-templates';
import nodemailer from 'nodemailer';
import { EmailLocals, EmailType } from './types';

const transporter = nodemailer.createTransport({
  //@ts-ignore
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_POST,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = (
  to: string,
  subject: string,
  type: EmailType,
  locals: EmailLocals,
) =>
  new Promise(async (resolve, reject) => {
    const email = new Email();
    const path: string = EmailType[type];

    let html;
    try {
      html = await email.render(`${path}/html`, locals);
    } catch (err) {
      reject(err);
    }

    if (!html) {
      reject('Could not render html.');
    }

    const mailOptions = {
      from: 'Eaty - your connection with favourite food',
      to: to,
      subject: `Eaty - ${subject}`,
      html: html,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(`Could not send message. ${err}`);
        reject(err);
      } else {
        console.log(`Message has been sent. ${info}`);

        resolve(info);
      }
    });
  });

export default sendEmail;
