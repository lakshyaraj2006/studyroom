import { transporter } from "@/core/config/mail";
import { renderMjml } from "@/core/mail/renderMjml";

export const sendVerificationEmail = async (
  username: string,
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const html = renderMjml("verify-email", {
      username,
      code
    })

    const info = await transporter.sendMail({
      from: '"StudyRoom" <noreply@studyroom.com>',
      to: email,
      subject: "Code for Email Verification",
      html
    })

    return !!info
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
