import { transporter } from "@/core/config/mail";
import { renderMjml } from "@/core/mail/renderMjml";

export const sendRoomInviteEmail = async (
  username: string,
  email: string,
  room_name: string,
  accept_link: string,
  reject_link: string
): Promise<boolean> => {
  try {
    const html = renderMjml("room-invite", {
      username,
      room_name,
      accept_link,
      reject_link
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
