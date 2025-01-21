import nodemailer from 'nodemailer'

const sendEmailAlert = async (message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: '"DevOps Monitor" <devops@example.com>',
    to: "admin@example.com",
    subject: "System Alert",
    text: message,
  });

  console.log("Alert email sent: %s", info.messageId);
};

export default sendEmailAlert;