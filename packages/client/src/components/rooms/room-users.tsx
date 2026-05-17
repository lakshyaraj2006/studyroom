import type { Room, RoomUser } from "@/interfaces/room"
import type React from "react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    ExternalLink,
    Loader2,
    RotateCcw,
    UserMinus,
    Users,
    ShieldBan
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
}

export default function RoomUsersComponent({
    roomId,
    room_users = [],
    blocked_users = [],
    setRoomDetails,
    authToken,
    isOwner = false
}: RoomUsersComponentProps) {
    const navigate = useNavigate()

    const [reason, setReason] = useState("")
    const [target, setTarget] = useState<RoomUser | null>(null)

    const [removingUserId, setRemovingUserId] = useState<string | null>(null)
    const [blockingUserId, setBlockingUserId] = useState<string | null>(null)
    const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null)

    const visibleUsers = room_users.slice(0, 4)

    const authHeaders = authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined

    const updateRoom = (update: Partial<Room>) => {
        setRoomDetails(prev => (prev ? { ...prev, ...update } : null))
    }

    const removeUser = async (userId: string) => {
        if (!authToken) return
        setRemovingUserId(userId)

        try {
            await axiosInstance.delete(`/rooms/remove-user/${roomId}`, {
                headers: authHeaders,
                data: { userId }
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

    const unblockUser = async (user: RoomUser) => {
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
        <>
            <Dialog>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <div className="flex -space-x-2">
                            {visibleUsers.map(u => (
                                <Tooltip key={u._id}>
                                    <TooltipTrigger asChild>
                                        <Avatar
                                            className="h-8 w-8 border cursor-pointer hover:scale-105 transition"
                                            onClick={() => navigate(`/profile/${u.handle}`)}
                                        >
                                            <AvatarImage src={u.avatar || "/user.png"} />
                                            <AvatarFallback>
                                                {u.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>{u.username}</TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>

                    <DialogTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-full border bg-muted hover:bg-muted/70 transition">
                            <Users className="h-4 w-4" />
                        </button>
                    </DialogTrigger>
                </div>

                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Room Members ({room_users.length})</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 max-h-112.5 overflow-y-auto pr-2">

                        {room_users.map(user => (
                            <div key={user._id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar || "/user.png"} />
                                        <AvatarFallback>
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/profile/${user.handle}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Visit
                                    </Button>

                                    {isOwner && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={removingUserId === user._id}
                                                onClick={() => removeUser(user._id)}
                                            >
                                                {removingUserId === user._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <UserMinus className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setTarget(user)}
                                            >
                                                <ShieldBan className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isOwner && blocked_users.length > 0 && (
                            <>
                                <div className="pt-2 text-sm font-medium text-muted-foreground">
                                    Blocked Users
                                </div>

                                {blocked_users.map(user => (
                                    <div key={user._id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar || "/user.png"} />
                                                <AvatarFallback>
                                                    {user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={unblockingUserId === user._id}
                                            onClick={() => unblockUser(user)}
                                        >
                                            {unblockingUserId === user._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                            )}
                                            Unblock
                                        </Button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!target} onOpenChange={() => { setTarget(null); setReason("") }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Block {target?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason"
                            />
                        </div>

                        <Button
                            className="w-full"
                            disabled={!reason.trim() || blockingUserId === target?._id}
                            onClick={blockUser}
                        >
                            {blockingUserId === target?._id && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Confirm Block
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}