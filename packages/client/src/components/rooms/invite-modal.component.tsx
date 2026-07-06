import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Profile } from "@/interfaces/profile"
import { useDebounce } from "@/hooks/use-debounce"
import { AxiosError } from "axios"
import { toast } from "sonner"
import axiosInstance from "@/lib/api"
import { type ServerResponse } from "@/interfaces/server-response"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../ui/avatar"
import {
    Loader2Icon,
    UserPlus2Icon,
} from "lucide-react"
import RoomInvitationsComponent from "./invitations.component"

type User = Pick<
    Profile,
    "_id" | "name" | "email" | "avatar"
>

type InviteModalProps = {
    roomId: string
    authToken: string
    ownerEmail: string
    trigger?: React.ReactNode
}

export default function InviteModal({
    roomId,
    authToken,
    ownerEmail,
    trigger,
}: InviteModalProps) {
    const [queryString, setQueryString] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [invitingEmail, setInvitingEmail] = useState<string | null>(null)
    const [refreshInvitations, setRefreshInvitations,] = useState(0)

    const debouncedQuery = useDebounce(queryString)

    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setUsers([])
            return
        }

        const controller = new AbortController()

        const searchUsers = async () => {
            setIsSearching(true)

            try {
                const res = await axiosInstance.get<
                    ServerResponse<User[]>
                >(`/rooms/search-room-users/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    params: {
                        q: debouncedQuery,
                    },
                    signal: controller.signal,
                })

                setUsers(res.data.data)
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    if (error instanceof AxiosError) {
                        toast.error(
                            error?.response?.data?.message
                        )
                    } else {
                        toast.error(error.message)
                    }
                }
            } finally {
                setIsSearching(false)
            }
        }

        searchUsers()

        return () => controller.abort()
    }, [debouncedQuery])

    const sendInvite = async (userEmail: string) => {
        if (
            userEmail === ownerEmail ||
            invitingEmail
        )
            return

        setInvitingEmail(userEmail)

        try {
            const res = await axiosInstance.post<
                ServerResponse<null>
            >(
                `/rooms/send-invite/${roomId}`,
                { email: userEmail },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )

            const { success, message } = res.data;

            if (success) {
                toast.success(message)

                setUsers((prev) => prev.filter((user) => user.email !== userEmail))

                setRefreshInvitations((prev) => prev + 1)
            } else {
                toast.error(message)
            }
        } catch (error: any) {
            if (error instanceof AxiosError) toast.error(error?.response?.data?.message);
            else toast.error(error.message || "Something went wrong")

        } finally {
            setInvitingEmail(null)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="flex items-center gap-2">
                        <UserPlus2Icon className="h-4 w-4" />
                        <span>Invite Users</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-md md:max-w-xl rounded-2xl p-0 overflow-hidden">
                <div className="border-b px-6 py-5">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl font-semibold">
                            Invite Users
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Search users by name or email and invite them.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <Field className="space-y-2">
                        <Label>Search Users</Label>
                        <Input
                            placeholder="Search by name or email..."
                            value={queryString}
                            onChange={(e) =>
                                setQueryString(e.target.value)
                            }
                            className="h-11 rounded-xl"
                        />
                    </Field>

                    {isSearching && (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                            Searching
                            users...
                        </div>
                    )}

                    {debouncedQuery.length >= 2 && !isSearching && users.length === 0 &&
                        (
                            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No users
                                found
                            </div>
                        )}

                    {users.length > 0 && (
                        <div className="max-h-87.5 space-y-2 overflow-y-auto pr-1">
                            {users.map((user) => {
                                const isOwner =
                                    user.email === ownerEmail

                                const isInviting =
                                    invitingEmail === user.email

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
                                            type="button"
                                            size="sm"
                                            className="rounded-xl"
                                            variant={
                                                isOwner
                                                    ? "secondary"
                                                    : "default"
                                            }
                                            disabled={
                                                isOwner ||
                                                isInviting
                                            }
                                            onClick={() =>
                                                sendInvite(
                                                    user.email
                                                )
                                            }
                                        >
                                            {isOwner ? (
                                                "Owner"
                                            ) : isInviting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                                    Inviting
                                                </div>
                                            ) : (
                                                "Invite"
                                            )}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <RoomInvitationsComponent roomId={roomId} authToken={authToken} refreshKey={refreshInvitations} />
                </div>
            </DialogContent>
        </Dialog>
    )
}