import nodemailer from "nodemailer";

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("⚠️ WARNING: SMTP_USER or SMTP_PASS is missing in the .env file. Email functionality will fail.");
}

const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail as a default. Remove if using custom SMTP.
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (user) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER || "rahulchahar020@gmail.com",
            to: user.email,
            subject: "Welcome to Engineer on Click!",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #2563eb; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Engineer on Click</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <h2 style="color: #333333; margin-top: 0;">Welcome, ${user.fullName || user.username}! 👋</h2>
                    <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                        Thank you for registering with <strong>Engineer on Click</strong>. We are absolutely thrilled to have you on board!
                    </p>
                    <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                        Our platform is designed to make booking and managing professional field engineers as seamless and efficient as possible.
                    </p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${'https://engineer-on-click-6eln.vercel.app'}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Explore the Dashboard</a>
                    </div>
                    <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                        If you have any questions or need assistance, simply reply to this email. We're always here to help.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
                    <p style="color: #888888; font-size: 14px; margin: 0;">
                        Best Regards,<br/>
                        <strong style="color: #333;">Rahul Chahar</strong><br/>
                        Founder, Engineer on Click
                    </p>
                </div>
            </div>`
        })
        console.log(`Email successfully sent to ${user.email} | MessageID: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Nodemailer failed to send email:", error);
        // We throw the error so the Emitter or Queue knows it failed and can retry
        throw error;
    }
}