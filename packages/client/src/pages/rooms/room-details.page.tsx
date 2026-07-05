import { type Room } from "@/interfaces/room"
import { type ServerResponse } from "@/interfaces/server-response"
import axiosInstance from "@/lib/api"
import { useEffect, useState, useCallback } from "react"
import { useParams, Navigate, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import SEO from "@/components/seo.component"

import { useAuth } from "@/hooks/useAuth"
import Discussions from "@/components/rooms/discussions.component"
import { AxiosError } from "axios"
import { toast } from "sonner"
import InviteModal from "@/components/rooms/invite-modal.component"
import DeleteRoomButton from "@/components/rooms/delete-room-button"
import RoomUsersComponent from "@/components/rooms/room-users"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    ChevronDown,
    Settings,
    UserPlus2,
    Trash2,
    LogOut,
    Home,
    BookOpen,
    Lock,
    Globe,
    GraduationCap,
    Bookmark
} from "lucide-react"

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

    // Active status members list
    const [membersList, setMembersList] = useState<any[]>([])

    // Mobile sidebar toggle states
    const [showLeftSidebar, setShowLeftSidebar] = useState(false)
    const [showRightSidebar, setShowRightSidebar] = useState(false)

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

    const fetchRoomMembers = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axiosInstance.get<ServerResponse<any[]>>(
                `/rooms/${roomId}/members`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setMembersList(res.data.data);
            return res.data.data;
        } catch (err) {
            console.error("Failed to fetch room members", err);
        }
    }, [roomId, authToken]);

    const fetchRoomDetails = useCallback(async () => {
        setLoading("fetchingRoom")
        try {
            const headers = authToken ? { "Authorization": `Bearer ${authToken}` } : {}

            const res = await axiosInstance.get<ServerResponse<Room>>(
                `/rooms/${roomId}`,
                { headers }
            )
            setRoomDetails(res.data.data);

            await checkMember();
            await fetchRoomMembers();
        } catch (err) {
            console.error(err)
        } finally {
            setLoading("idle")
        }
    }, [roomId, authToken, checkMember, fetchRoomMembers])

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
            socket.emit("join_room", roomId, async (res: any) => {
                if (res && res.success) {
                    const currentMembers = await fetchRoomMembers();
                    if (currentMembers) {
                        // Notify other active members of current active states
                        socket.emit("room:update_active_status", {
                            roomId,
                            members: currentMembers
                        });
                    }
                }
            });
        });

        socket.on("room:active_status_broadcast", ({ members }: { members: any[] }) => {
            setMembersList(members);
        });

        socket.on("room:member_active_status_change", ({ userId, active }: { userId: string, active: boolean }) => {
            setMembersList((prev) =>
                prev.map((m) =>
                    m._id === userId ? { ...m, active } : m
                )
            );
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
            setMembersList((prev) => {
                if (prev.some((u) => u._id === user._id)) return prev;
                return [...prev, { ...user, active: true }];
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
            setMembersList((prev) => prev.filter((u) => u._id !== userId));
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
            setMembersList((prev) => prev.filter((u) => u._id !== user._id));
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
            setMembersList((prev) => {
                if (prev.some((u) => u._id === user._id)) return prev;
                return [...prev, { ...user, active: false }];
            });
        });

        return () => {
            socket.emit("leave_room", roomId);
            socket.disconnect();
        };
    }, [roomId, authToken, isMember, roomDetails?.access_type, fetchRoomMembers, usrInfo?.id]);

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
                <p className="text-sm text-muted-foreground animate-pulse">Entering study room...</p>
            </div>
        )
    }

    if (!roomDetails) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <p className="text-sm text-muted-foreground">Study room not found</p>
            </div>
        )
    }

    if (!isMember && roomDetails.access_type === "private") {
        return <Navigate to="/rooms" replace />
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 py-6 px-4">
            <SEO
                title={roomDetails ? roomDetails.room_name : "Room Details"}
                description={roomDetails ? (roomDetails.room_tagline || `Join the study group ${roomDetails.room_name} on StudyRoom to collaborate and focus.`) : "View study room details on StudyRoom."}
                keywords={roomDetails ? `study room, ${roomDetails.room_name}, ${roomDetails.room_topics.join(", ")}` : "study room, study group"}
            />

            <div className="relative flex h-[700px] max-w-6xl mx-auto rounded-2xl border border-border/60 overflow-hidden bg-card shadow-xl shadow-primary/5 transition-all duration-300">
                
                {/* Left Sidebar Mobile Backdrop */}
                {showLeftSidebar && (
                    <div
                        className="fixed inset-0 z-30 bg-black/30 md:hidden backdrop-blur-xs"
                        onClick={() => setShowLeftSidebar(false)}
                    />
                )}

                {/* Left Sidebar: Cozy Workspace List */}
                <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex flex-col h-full bg-slate-50/95 dark:bg-slate-900/60 border-r border-border/40 backdrop-blur-xs transform transition-transform duration-300 md:translate-x-0 ${
                    showLeftSidebar ? "translate-x-0" : "-translate-x-full"
                }`}>
                    {/* Header: Room Name Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full h-12 border-b border-border/40 flex items-center justify-between px-4 font-semibold text-foreground cursor-pointer hover:bg-slate-200/30 dark:hover:bg-slate-800/40 transition duration-200 select-none text-left min-w-0">
                                <span className="truncate pr-2 flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                                    {roomDetails.room_name}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-popover border border-border/40 shadow-lg rounded-xl text-popover-foreground p-1">
                            {authToken && usrInfo?.id === roomDetails.room_creator._id ? (
                                <>
                                    <DropdownMenuItem onClick={() => navigate(`/rooms/edit/${roomDetails._id}`)} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted rounded-lg select-none">
                                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>Edit Room Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                                        <InviteModal
                                            roomId={roomDetails._id}
                                            authToken={authToken}
                                            ownerEmail={roomDetails.room_creator.email}
                                            trigger={
                                                <div className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-foreground cursor-pointer hover:bg-muted rounded-lg select-none">
                                                    <UserPlus2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>Invite Students</span>
                                                </div>
                                            }
                                        />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                                        <DeleteRoomButton
                                            authToken={authToken}
                                            roomId={roomDetails._id}
                                            trigger={
                                                <div className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:text-rose-600 cursor-pointer hover:bg-rose-500/10 rounded-lg select-none font-semibold">
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                                    <span>Delete Room</span>
                                                </div>
                                            }
                                        />
                                    </DropdownMenuItem>
                                </>
                            ) : authToken && isMember ? (
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                                    <button
                                        id="leave-room-btn"
                                        onClick={handleLeaveRoom}
                                        disabled={loading === "leavingRoom"}
                                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:text-rose-600 cursor-pointer hover:bg-rose-500/10 rounded-lg select-none font-semibold text-left"
                                    >
                                        <LogOut className="h-3.5 w-3.5 text-rose-600" />
                                        <span>{loading === "leavingRoom" ? "Leaving..." : "Leave Study Room"}</span>
                                    </button>
                                </DropdownMenuItem>
                            ) : (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic select-none">
                                    No options available
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Room Info: Cover Banner & Access Badge */}
                    <div className="relative h-20 w-full overflow-hidden shrink-0 bg-muted select-none">
                        <img
                            src={roomDetails.room_image || "/images/room-default.jpg"}
                            className="h-full w-full object-cover opacity-75 dark:opacity-60"
                            alt={roomDetails.room_name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 dark:from-slate-900/60 via-transparent to-black/10" />
                        <div className="absolute top-2 left-3 flex gap-1.5">
                            <span className="text-[10px] bg-slate-900/60 text-white font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                                {roomDetails.access_type === "private" ? (
                                    <>
                                        <Lock className="h-2.5 w-2.5" />
                                        Private Group
                                    </>
                                ) : (
                                    <>
                                        <Globe className="h-2.5 w-2.5" />
                                        Public Hall
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Tagline Description Box */}
                    <div className="px-4 py-3 text-xs text-muted-foreground border-b border-border/40 select-none leading-relaxed break-words shrink-0 bg-slate-100/30 dark:bg-slate-950/20 italic">
                        {roomDetails.room_tagline || "Welcome to our focused study hub."}
                    </div>

                    {/* Topic Channels (Study List) */}
                    <div className="flex-1 overflow-y-auto px-2 py-3 select-none">
                        <h3 className="px-3 pb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                            Study Topics
                        </h3>
                        <div className="space-y-1">
                            {/* Main Discussion Slot */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary cursor-pointer border border-primary/20">
                                <BookOpen className="h-4 w-4 shrink-0" />
                                <span className="truncate">study-hall-chat</span>
                            </div>

                            {/* Topics List as styled bookmarks */}
                            {roomDetails.room_topics.map((topic, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-foreground transition duration-150 cursor-help border border-transparent"
                                    title={`Curriculum topic: ${topic}`}
                                >
                                    <Bookmark className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                                    <span className="truncate">{topic.toLowerCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Status Block: User Card */}
                    {usrInfo && (
                        <div className="h-14 bg-slate-100/60 dark:bg-[#1a202c]/50 border-t border-border/40 px-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20">
                                    <AvatarImage src={usrInfo.avatar || "/user.png"} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                        {usrInfo.username?.slice(0, 2).toUpperCase() || "ST"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-foreground truncate leading-tight">
                                        {usrInfo.username}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                                        @{usrInfo.handle}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate("/rooms")}
                                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/40 flex items-center justify-center cursor-pointer transition shrink-0"
                                title="Exit to Study Rooms"
                            >
                                <Home className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Middle Panel: Active Study discussions Board */}
                <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950/20">
                    <Discussions
                        roomDetails={roomDetails}
                        isMember={isMember}
                        setIsMember={setIsMember}
                        onToggleLeftSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
                        onToggleRightSidebar={() => setShowRightSidebar(!showRightSidebar)}
                        membersList={membersList}
                    />
                </div>

                {/* Right Sidebar Mobile Backdrop */}
                {showRightSidebar && (
                    <div
                        className="fixed inset-0 z-30 bg-black/30 md:hidden backdrop-blur-xs"
                        onClick={() => setShowRightSidebar(false)}
                    />
                )}

                {/* Right Sidebar: Members List */}
                <div className={`fixed md:static inset-y-0 right-0 z-40 w-60 flex flex-col h-full bg-slate-50/95 dark:bg-slate-900/60 border-l border-border/40 backdrop-blur-xs transform transition-transform duration-300 md:translate-x-0 ${
                    showRightSidebar ? "translate-x-0" : "-translate-x-full"
                }`}>
                    <RoomUsersComponent
                        roomId={roomDetails._id}
                        room_users={membersList}
                        blocked_users={roomDetails.blocked_users}
                        setRoomDetails={setRoomDetails}
                        authToken={authToken}
                        isOwner={authToken ? usrInfo?.id === roomDetails.room_creator._id : false}
                        creatorId={roomDetails.room_creator._id}
                    />
                </div>

            </div>
        </div>
    )
}