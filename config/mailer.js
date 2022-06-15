const nodemailer = require('nodemailer');

// Email function
// const transporter = nodemailer.createTransport({
//     service: "appsstaging",
//     host: "server.appsstaging.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: "noreply@server.appsstaging.com",
//         pass: "Technado@12345",
//     },
// });

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a85b8f2c615115",
      pass: "fffb562bd01c84"
    }
  });

const sendEmail = (email, verificationCode, subject) => {
    const mailOptions = {
        from: "noreply@server.appsstaging.com",
        to: email,
        subject: subject,
        html: `<p>Your verification code is ${verificationCode} </p>`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
};

module.exports = { sendEmail };
