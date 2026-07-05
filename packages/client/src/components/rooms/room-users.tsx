import type { Room, RoomUser } from "@/interfaces/room"
import type React from "react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Loader2,
    RotateCcw,
    UserMinus,
    Users,
    ShieldBan,
    Sparkles
} from "lucide-react"

import { useNavigate } from "react-router-dom"
import axiosInstance from "@/lib/api"

type RoomUsersComponentProps = {
    roomId: string
    room_users?: RoomUser[]
    blocked_users?: RoomUser[]
    setRoomDetails: React.Dispatch<React.SetStateAction<Room | null>>
    authToken: string | null
    isOwner?: boolean
    creatorId?: string
}

export default function RoomUsersComponent({
    roomId,
    room_users = [],
    blocked_users = [],
    setRoomDetails,
    authToken,
    isOwner = false,
    creatorId
}: RoomUsersComponentProps) {
    const navigate = useNavigate()

    const [reason, setReason] = useState("")
    const [target, setTarget] = useState<RoomUser | null>(null)

    const [removingUserId, setRemovingUserId] = useState<string | null>(null)
    const [blockingUserId, setBlockingUserId] = useState<string | null>(null)
    const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null)

    const authHeaders = authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined

    const updateRoom = (update: Partial<Room>) => {
        setRoomDetails(prev => (prev ? { ...prev, ...update } : null))
    }

    const removeUser = async (userId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!authToken) return
        setRemovingUserId(userId)

        try {
            await axiosInstance.delete(`/rooms/remove-user/${roomId}`, {
                headers: authHeaders,
                data: { userToRemoveId: userId }
            })

            updateRoom({
                room_users: room_users.filter(u => u._id !== userId)
            })
        } finally {
            setRemovingUserId(null)
        }
    }

    const blockUser = async () => {
        if (!authToken || !target || !reason.trim()) return
        setBlockingUserId(target._id)

        try {
            await axiosInstance.patch(
                `/rooms/block-user/${roomId}`,
                {
                    userToBlockId: target._id,
                    reason
                },
                { headers: authHeaders }
            )

            updateRoom({
                room_users: room_users.filter(u => u._id !== target._id),
                blocked_users: [...blocked_users, target]
            })

            setTarget(null)
            setReason("")
        } finally {
            setBlockingUserId(null)
        }
    }

    const unblockUser = async (user: RoomUser, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!authToken) return
        setUnblockingUserId(user._id)

        try {
            await axiosInstance.patch(
                `/rooms/unblock-user/${roomId}`,
                { blockedUserId: user._id },
                { headers: authHeaders }
            )

            updateRoom({
                blocked_users: blocked_users.filter(u => u._id !== user._id),
                room_users: [...room_users, user]
            })
        } finally {
            setUnblockingUserId(null)
        }
    }

    return (
        <div className="flex flex-col h-full w-full bg-slate-50/95 dark:bg-slate-900/60 backdrop-blur-xs">
            {/* Header */}
            <div className="h-12 border-b border-border/40 px-4 flex items-center gap-2 text-sm font-semibold text-foreground select-none shrink-0 bg-slate-100/20 dark:bg-slate-950/20">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Student Roster</span>
                <span className="ml-auto bg-slate-200/60 dark:bg-slate-800/60 text-xs font-semibold px-2.5 py-0.5 rounded-full text-muted-foreground select-none">
                    {room_users.length}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-border">
                <div>
                    <h3 className="px-2 pb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase select-none">
                        Active Members — {room_users.length}
                    </h3>
                    <div className="space-y-0.5">
                        {room_users.map(user => {
                            const isUserCreator = user._id === creatorId
                            return (
                                <div
                                    key={user._id}
                                    className="group/item flex items-center justify-between rounded-xl p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition duration-150 cursor-pointer border border-transparent"
                                    onClick={() => navigate(`/profile/${user.handle}`)}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="relative shrink-0">
                                            <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                                <AvatarImage src={user.avatar || "/user.png"} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border border-background dark:border-slate-900 ${
                                                user.active ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                                            }`} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-medium text-foreground truncate flex items-center gap-1">
                                                {user.name}
                                                {isUserCreator && (
                                                    <span title="Room Mentor / Host">
                                                        <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                                                @{user.username}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons on Hover */}
                                    {isOwner && !isUserCreator && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shrink-0">
                                            <button
                                                className="h-6 w-6 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition border border-transparent"
                                                onClick={(e) => removeUser(user._id, e)}
                                                disabled={removingUserId === user._id}
                                                title="Remove student"
                                            >
                                                {removingUserId === user._id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                                                ) : (
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                )}
                                            </button>

                                            <button
                                                className="h-6 w-6 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition border border-transparent"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setTarget(user)
                                                }}
                                                title="Block student"
                                            >
                                                <ShieldBan className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Blocked Users */}
                {isOwner && blocked_users.length > 0 && (
                    <div>
                        <h3 className="px-2 pb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase select-none">
                            Suspended — {blocked_users.length}
                        </h3>
                        <div className="space-y-0.5">
                            {blocked_users.map(user => (
                                <div
                                    key={user._id}
                                    className="group/item flex items-center justify-between rounded-xl p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition duration-150 cursor-pointer border border-transparent"
                                    onClick={() => navigate(`/profile/${user.handle}`)}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar className="h-8 w-8 shrink-0 opacity-60">
                                            <AvatarImage src={user.avatar || "/user.png"} />
                                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0 opacity-60">
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                                                @{user.username}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center cursor-pointer transition shrink-0 border border-transparent"
                                        onClick={(e) => unblockUser(user, e)}
                                        disabled={unblockingUserId === user._id}
                                        title="Restore student access"
                                    >
                                        {unblockingUserId === user._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                        ) : (
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Block Reason Dialog */}
            <Dialog open={!!target} onOpenChange={() => { setTarget(null); setReason("") }}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Suspend {target?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Suspension Reason</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason (e.g. spamming, inappropriate behavior)"
                                className="h-10 rounded-xl"
                            />
                        </div>

                        <Button
                            className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            disabled={!reason.trim() || blockingUserId === target?._id}
                            onClick={blockUser}
                        >
                            {blockingUserId === target?._id && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Confirm Suspension
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}