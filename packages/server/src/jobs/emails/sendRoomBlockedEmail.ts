import { transporter } from "@/core/config/mail";
import { renderMjml } from "@/core/mail/renderMjml";

export const sendRoomBlockedEmail = async (
  username: string,
  email: string,
  roomName: string,
  reason: string
): Promise<boolean> => {
  try {
    const html = renderMjml("room-block-email", {
      username,
      roomName,
      reason
    })

    const info = await transporter.sendMail({
      from: '"StudyRoom" <noreply@studyroom.com>',
      to: email,
      subject: "You have been blocked from a room",
      html
    })

    return !!info
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
