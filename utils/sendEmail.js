const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {

    const transporter = nodeMailer.createTransport({
        // host: process.env.SMPT_HOST,
        // port: 465,
        service: "gmail",
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        }
    });

    let mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    transporter.sendMail(mailOptions)
        .then((info) => {
            console.log(info)
        })
        .catch((err) => {
            console.log(err)
        })
}

module.exports = sendEmail;