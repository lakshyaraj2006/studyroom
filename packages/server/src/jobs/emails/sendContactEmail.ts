import { transporter } from "@/core/config/mail";
import { renderMjml } from "@/core/mail/renderMjml";

export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    const html = renderMjml("contact-message", {
      name,
      email,
      subject: subject || "No Subject",
      message
    });

    const info = await transporter.sendMail({
      from: '"StudyRoom Support" <noreply@studyroom.com>',
      to: process.env.NODEMAILER_USER!,
      replyTo: email,
      subject: `[Contact Form] ${subject || "New Inquiry from " + name}`,
      html
    });

    return !!info;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};
