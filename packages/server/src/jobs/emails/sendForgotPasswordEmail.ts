import { transporter } from "@/core/config/mail";
import { renderMjml } from "@/core/mail/renderMjml";

export const sendForgotPasswordEmail = async (
  username: string,
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const html = renderMjml("forgot-password", {
      username,
      code
    })

    const info = await transporter.sendMail({
      from: '"StudyRoom" <noreply@studyroom.com>',
      to: email,
      subject: "Code for Reset Password",
      html
    })

    return !!info
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
