const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,      // Gmail
        pass: process.env.EMAIL_PASS       // App Password
    }
});

const sendEmailOTP = async (to, otp) => {
    const mailOptions = {
        from: `"Hệ thống SOS" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Mã xác thực SOS",
        text: `Mã xác thực SOS của bạn là: ${otp}. Hiệu lực 2 phút.`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmailOTP };
