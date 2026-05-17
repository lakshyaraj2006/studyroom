import { type Room } from "@/interfaces/room"
import { type ServerResponse } from "@/interfaces/server-response"
import axiosInstance from "@/lib/api"
import { useEffect, useState, useCallback } from "react"
import { useParams, Navigate, Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import Discussions from "@/components/rooms/discussions.component"
import { Button, buttonVariants } from "@/components/ui/button"
import { AxiosError } from "axios"
import { toast } from "sonner"
import InviteModal from "@/components/rooms/invite-modal.component"
import DeleteRoomButton from "@/components/rooms/delete-room-button"
import RoomUsersComponent from "@/components/rooms/room-users"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

type LoadingState =
    | "idle"
    | "fetchingRoom"
    | "checkingMember"
    | "leavingRoom"

export default function RoomDetails() {
    const { roomId } = useParams()
    const { authToken, usrInfo } = useAuth()
    const navigate = useNavigate();

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
            console.log(res.data.data);

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
                        authToken && usrInfo?.id === roomDetails.room_creator._id &&
                        <div className="flex items-center gap-2">
                            <Link to={`/rooms/edit/${roomDetails._id}`} className={buttonVariants({ variant: "outline" })}>Edit</Link>
                            <DeleteRoomButton
                                authToken={authToken}
                                roomId={roomDetails._id}
                            />
                            <InviteModal roomId={roomDetails._id} authToken={authToken} ownerEmail={roomDetails.room_creator.email} />
                        </div>
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

                            <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs opacity-80">
                                <div className="flex items-center gap-2 min-w-0" onClick={() =>
                                    navigate(`/profile/${roomDetails.room_creator.handle}`)
                                }>
                                    <Avatar className="h-6 w-6 shrink-0 cursor-pointer">
                                        <AvatarImage
                                            src={roomDetails.room_creator.avatar || "/user.png"}
                                        />
                                        <AvatarFallback>
                                            {roomDetails.room_creator.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <span className="truncate">
                                        By {roomDetails.room_creator.name}
                                    </span>
                                </div>

                                <div className="shrink-0">
                                    <RoomUsersComponent
                                        roomId={roomDetails._id}
                                        room_users={roomDetails.room_users}
                                        blocked_users={roomDetails.blocked_users}
                                        setRoomDetails={setRoomDetails}
                                        authToken={authToken}
                                        isOwner={
                                            authToken ? usrInfo?.id === roomDetails.room_creator._id : false
                                        }
                                    />
                                </div>
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