import type { RoomInvitation } from "@/interfaces/room-invitation"
import { type ServerResponse } from "@/interfaces/server-response"
import axiosInstance from "@/lib/api"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Loader2Icon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { toast } from "sonner"
import { AxiosError } from "axios"

type RoomInvitationsComponentProps = {
    roomId: string
    authToken: string | undefined
    refreshKey: number
}

export default function RoomInvitationsComponent({
    roomId,
    authToken,
    refreshKey,
}: RoomInvitationsComponentProps) {
    const [invitations, setInvitations] = useState<RoomInvitation[]>([])
    const [cancellingUserId, setCancellingUserId] =
        useState<string | null>(null)

    useEffect(() => {
        fetchInvitations()
    }, [roomId, refreshKey])

    const handleError = (error: any) => {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data?.message)
        } else {
            toast.error(error.message || "Something went wrong")
        }
    }

    const fetchInvitations = async () => {
        try {
            const response =
                await axiosInstance.get<
                    ServerResponse<RoomInvitation[]>
                >(`/rooms/get-invitations/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                })

            setInvitations(response.data.data)
        } catch (error) {
            handleError(error)
        }
    }

    const handleCancelInvite = async (
        sentToUserId: string
    ) => {
        if (cancellingUserId) return

        setCancellingUserId(sentToUserId)

        try {
            const response =
                await axiosInstance.delete<
                    ServerResponse<null>
                >(`/rooms/revoke-invitation/${roomId}`, {
                    data: {
                        sent_to_user: sentToUserId,
                    },
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                })

            const { success, message } = response.data

            success
                ? toast.success(message)
                : toast.error(message)

            fetchInvitations()
        } catch (error) {
            handleError(error)
        } finally {
            setCancellingUserId(null)
        }
    }

    if (!invitations.length) return null

    return (
        <div className="max-h-87.5 space-y-2 overflow-y-auto pr-1">
            {invitations.map((invitation) => {
                const { sent_to_user: user } = invitation
                const isCancelling =
                    cancellingUserId === user._id

                return (
                    <div
                        key={user._id}
                        className="flex items-center justify-between rounded-2xl border bg-background p-3 transition-all hover:border-primary/30 hover:bg-muted/40"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11">
                                <AvatarImage
                                    src={
                                        user.avatar ||
                                        "/user.png"
                                    }
                                />
                                <AvatarFallback>
                                    {user.name
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl"
                            disabled={isCancelling}
                            onClick={() =>
                                handleCancelInvite(
                                    user._id
                                )
                            }
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                "Cancel"
                            )}
                        </Button>
                    </div>
                )
            })}
        </div>
    )
}