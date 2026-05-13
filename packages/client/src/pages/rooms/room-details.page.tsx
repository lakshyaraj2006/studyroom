import { type Room } from "@/interfaces/room"
import { type ServerResponse } from "@/interfaces/server-response"
import axiosInstance from "@/lib/api"
import { useEffect, useState, useCallback } from "react"
import { useParams, Navigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import Discussions from "@/components/rooms/discussions.component"
import { Button } from "@/components/ui/button"
import { AxiosError } from "axios"
import { toast } from "sonner"
import InviteModal from "@/components/rooms/invite-modal.component"

type LoadingState =
    | "idle"
    | "fetchingRoom"
    | "checkingMember"
    | "leavingRoom"

export default function RoomDetails() {
    const { roomId } = useParams()
    const { authToken, usrInfo } = useAuth()

    const [roomDetails, setRoomDetails] = useState<Room | null>(null)
    const [loading, setLoading] = useState<LoadingState>("idle")
    const [isMember, setIsMember] = useState(false)

    const checkMember = useCallback(async () => {
        if (!authToken) return

        setLoading("checkingMember")
        try {
            const res = await axiosInstance.get<
                ServerResponse<{ isMember: boolean }>
            >(`/rooms/check-member/${roomId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            setIsMember(res.data.data.isMember)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading("idle")
        }
    }, [roomId, authToken])

    const fetchRoomDetails = useCallback(async () => {
        setLoading("fetchingRoom")
        try {
            const headers = authToken ? { "Authorization": `Bearer ${authToken}` } : {}

            const res = await axiosInstance.get<ServerResponse<Room>>(
                `/rooms/${roomId}`,
                { headers }
            )
            setRoomDetails(res.data.data);

            // Fixed: Added 'await' so finally() doesn't fire prematurely
            await checkMember();
        } catch (err) {
            console.error(err)
        } finally {
            setLoading("idle")
        }
    }, [roomId, authToken, checkMember])

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails()
        }
    }, [fetchRoomDetails, roomId, authToken])

    const handleLeaveRoom = async () => {
        if (!authToken) return

        setLoading("leavingRoom")

        try {
            const res = await axiosInstance.patch<ServerResponse<null>>(
                `/rooms/leave-room/${roomId}`,
                null,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            )

            const { success, message } = res.data
            success ? toast.success(message) : toast.error(message)

            setIsMember(false)
        } catch (error) {
            setIsMember(true)

            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message)
            } else {
                toast.error("Failed to leave room")
            }
        } finally {
            setLoading("idle")
        }
    }

    if (loading === "fetchingRoom" || loading === "checkingMember") {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <p className="text-sm text-muted-foreground">Loading room...</p>
            </div>
        )
    }

    if (!roomDetails) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <p className="text-sm text-muted-foreground">Room not found</p>
            </div>
        )
    }

    if (!isMember && roomDetails.access_type === "private") {
        return <Navigate to="/rooms" replace />
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-end">
                    {
                        authToken && usrInfo?.id === roomDetails.room_creator._id && <InviteModal roomId={roomDetails._id} authToken={authToken} ownerEmail={roomDetails.room_creator.email} />
                    }
                </div>
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border">
                    <img
                        src={roomDetails.room_image || "/images/room-default.jpg"}
                        className="h-40 sm:h-52 md:h-64 w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full p-4 sm:p-6 text-white space-y-1 sm:space-y-2">

                            <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold leading-tight wrap-break-word">
                                {roomDetails.room_name}
                            </h1>

                            <p className="text-xs sm:text-sm opacity-90 line-clamp-2 wrap-break-word">
                                {roomDetails.room_tagline}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs opacity-80">
                                <span className="truncate max-w-full">
                                    By {roomDetails.room_creator.name}
                                </span>
                                <span>
                                    {roomDetails.room_users.length} members
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {authToken &&
                    isMember &&
                    usrInfo &&
                    roomDetails.room_creator._id !== usrInfo.id && (
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                onClick={handleLeaveRoom}
                                disabled={loading === "leavingRoom"}
                            >
                                {loading === "leavingRoom"
                                    ? "Leaving..."
                                    : "Leave Room"}
                            </Button>
                        </div>
                    )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Topics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {roomDetails.room_topics.map((topic, i) => (
                                        <Badge key={i} variant="secondary">
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Discussions
                            roomDetails={roomDetails}
                            isMember={isMember}
                            setIsMember={setIsMember}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}