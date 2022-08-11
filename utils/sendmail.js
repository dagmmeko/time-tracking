import nodemailer from "nodemailer"

async function sendMail(email) {

    console.log(email)

    let transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    let info = transport.sendMail({
        from: "",
        to: "bar@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html bod
    })
}

export default sendMail

