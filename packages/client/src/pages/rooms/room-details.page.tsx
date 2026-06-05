import { type Room } from "@/interfaces/room"
import { type ServerResponse } from "@/interfaces/server-response"
import axiosInstance from "@/lib/api"
import { useEffect, useState, useCallback } from "react"
import { useParams, Navigate, Link, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

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

    useEffect(() => {
        if (!roomId) return;
        if (!isMember && roomDetails?.access_type === "private") return;

        const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
        const socket = io(socketUrl, {
            auth: {
                token: authToken
            },
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            socket.emit("join_room", roomId);
        });

        socket.on("room:user_joined", (user: any) => {
            if (user._id === usrInfo?.id) {
                setIsMember(true);
            }
            setRoomDetails((prev) => {
                if (!prev) return null;
                if (prev.room_users.some((u) => u._id === user._id)) return prev;
                return {
                    ...prev,
                    room_users: [...prev.room_users, user]
                };
            });
        });

        socket.on("room:user_left", (userId: string) => {
            if (userId === usrInfo?.id) {
                setIsMember(false);
            }
            setRoomDetails((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    room_users: prev.room_users.filter((u) => u._id !== userId)
                };
            });
        });

        socket.on("room:user_blocked", (user: any) => {
            if (user._id === usrInfo?.id) {
                setIsMember(false);
            }
            setRoomDetails((prev) => {
                if (!prev) return null;
                const isAlreadyBlocked = prev.blocked_users?.some((u) => u._id === user._id);
                return {
                    ...prev,
                    room_users: prev.room_users.filter((u) => u._id !== user._id),
                    blocked_users: isAlreadyBlocked
                        ? prev.blocked_users
                        : [...(prev.blocked_users || []), user]
                };
            });
        });

        socket.on("room:user_unblocked", (user: any) => {
            if (user._id === usrInfo?.id) {
                setIsMember(true);
            }
            setRoomDetails((prev) => {
                if (!prev) return null;
                const isAlreadyMember = prev.room_users.some((u) => u._id === user._id);
                return {
                    ...prev,
                    blocked_users: prev.blocked_users?.filter((u) => u._id !== user._id) || [],
                    room_users: isAlreadyMember
                        ? prev.room_users
                        : [...prev.room_users, user]
                };
            });
        });

        return () => {
            socket.emit("leave_room", roomId);
            socket.disconnect();
        };
    }, [roomId, authToken, isMember, roomDetails?.access_type]);

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
        <div className="min-h-screen bg-background transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-end">
                    {
                        authToken && usrInfo?.id === roomDetails.room_creator._id &&
                        <div className="flex items-center gap-2">
                            <Link to={`/rooms/edit/${roomDetails._id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Edit</Link>
                            <DeleteRoomButton
                                authToken={authToken}
                                roomId={roomDetails._id}
                            />
                            <InviteModal roomId={roomDetails._id} authToken={authToken} ownerEmail={roomDetails.room_creator.email} />
                        </div>
                    }
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-xl shadow-primary/5">
                    <img
                        src={roomDetails.room_image || "/images/room-default.jpg"}
                        className="h-44 sm:h-56 md:h-72 w-full object-cover"
                        alt={roomDetails.room_name}
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full p-6 sm:p-8 text-white space-y-2.5">

                            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight wrap-break-word">
                                {roomDetails.room_name}
                            </h1>

                            <p className="text-xs sm:text-sm md:text-base opacity-90 line-clamp-2 max-w-3xl leading-relaxed wrap-break-word">
                                {roomDetails.room_tagline}
                            </p>

                            <div className="flex items-center justify-between gap-4 pt-2 text-xs opacity-90 border-t border-white/10">
                                <div className="flex items-center gap-2 min-w-0 cursor-pointer hover:text-primary transition-colors" onClick={() =>
                                    navigate(`/profile/${roomDetails.room_creator.handle}`)
                                }>
                                    <Avatar className="h-7 w-7 shrink-0 ring-2 ring-white/20">
                                        <AvatarImage
                                            src={roomDetails.room_creator.avatar || "/user.png"}
                                        />
                                        <AvatarFallback className="bg-white/20 text-white text-[10px] font-bold">
                                            {roomDetails.room_creator.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <span className="truncate font-medium">
                                        By {roomDetails.room_creator.name}
                                    </span>
                                </div>

                                <div className="shrink-0 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs transition-colors">
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
                                className="cursor-pointer active:scale-95"
                            >
                                {loading === "leavingRoom"
                                    ? "Leaving..."
                                    : "Leave Room"}
                            </Button>
                        </div>
                    )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card className="border-border/40 shadow-sm rounded-2xl bg-card/60 backdrop-blur-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold tracking-tight">Topics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {roomDetails.room_topics.map((topic, i) => (
                                        <Badge key={i} variant="secondary" className="px-2.5 py-0.5 rounded-full font-medium">
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card className="border-border/40 shadow-sm rounded-2xl p-0 overflow-hidden">
                            <Discussions
                                roomDetails={roomDetails}
                                isMember={isMember}
                                setIsMember={setIsMember}
                            />
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}