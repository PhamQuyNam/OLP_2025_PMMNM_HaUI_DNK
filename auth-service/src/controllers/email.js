/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */
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
        from: `"Hệ thống xác thực" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Mã xác thực OTP",
        text: `Mã xác thực OTP của bạn là: ${otp}. Hiệu lực 2 phút.`,
        html: `<h3>Mã xác thực đăng ký</h3>
               <p>Mã OTP của bạn là: <b style="font-size: 24px; color: blue;">${otp}</b></p>
               <p>Mã này có hiệu lực trong <b>2 phút</b>.</p>`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmailOTP };
