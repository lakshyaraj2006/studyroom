import { transporter } from "../nodemailer.config";
import { renderMjml } from "../../mail/renderMjml";

export const sendDeleteAccountEmail = async (
  username: string,
  email: string,
): Promise<boolean> => {
  try {
    const html = renderMjml("account-deleted", {
      username
    })

    const info = await transporter.sendMail({
      from: '"StudyRoom" <noreply@studyroom.com>',
      to: email,
      subject: "Your account has been deleted",
      html
    })

    return !!info
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
