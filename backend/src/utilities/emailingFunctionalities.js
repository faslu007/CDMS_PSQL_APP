const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'luciano.jakubowski29@ethereal.email',
        pass: 'yRmZTPQxZBW92x9EWg'
    }
});

// let transporter = nodemailer.createTransport({
//     service: 'hotmail',
//     auth: {
//         user: 'credential-pro@hotmail.com',
//         pass: 'Welcome@123',
//     },
// });

// async function to send the OTP verification - this is called from the ..controller/userController.js - registerSuperAmdin()
const sendOTP = async (email, otp) => {
    try {
        // Email Template
        const options = {
            from: "luciano.jakubowski29@ethereal.email",
            to: email,
            subject: "Credential Pro App - Email Verification",
            text: `Your OTP for email verification is ${otp}.`,
            html: `<p>Hello,</p>
              <p>Thank you for signing up for Credential Pro App.</p>
              <p>Your OTP for email verification is <strong>${otp}</strong>.</p>`
        };

        const response = await transporter.sendMail(options);
        return { status: 'success' };

    } catch (error) {
        throw new Error("An error occurred while sending email. `${error.response");
    }
};


module.exports = {
    sendOTP,
}