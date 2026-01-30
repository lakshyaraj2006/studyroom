import { transporter } from "../nodemailer.config";
import { renderMjml } from "../../mail/renderMjml";

export const sendRoomInviteEmail = async (
  username: string,
  email: string,
  room_name: string,
  link: string
): Promise<boolean> => {
  try {
    const html = renderMjml("room-invite", {
      username,
      room_name,
      link
    })

    const info = await transporter.sendMail({
      from: '"StudyRoom" <noreply@studyroom.com>',
      to: email,
      subject: "Invite to join " + room_name + " room",
      html
    })

    return !!info
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
