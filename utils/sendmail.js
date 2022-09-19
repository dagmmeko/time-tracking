import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

async function sendMail(email, resetToken) {


    let transport = nodemailer.createTransport({
        service: "gmail",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    console.log({email: transport})

    const info = await new Promise((resolve, reject) => {
        transport.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email, // list of receivers
            subject: "Password reset link for Time Tracker", // Subject line
            text: `${process.env.SMTP_HOST}/setPassword/accessToken?accessToken=${encodeURI(resetToken)}`, // plain text body
        }, (err, info) => {
            if (err) {
                reject(err)
                console.log({err:err})
            } else {
                resolve(info)
                console.log({info: info})
            }
        })
    })
    return info
}

export default sendMail

