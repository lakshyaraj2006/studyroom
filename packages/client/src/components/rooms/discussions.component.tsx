import { useState } from "react";
import { type Room } from "@/interfaces/room";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import axiosInstance from "@/lib/api";
import { type ServerResponse } from "@/interfaces/server-response";
import { AxiosError } from "axios";
import { Loader2Icon, SendIcon, UserPlus2Icon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type DiscussionsProps = {
    roomDetails: Room,
    isMember: boolean,
    setIsMember: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Discussions({ roomDetails, isMember, setIsMember }: DiscussionsProps) {
    const { authToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const [discussions] = useState([
        {
            id: 1,
            user: {
                name: "Ankit",
                avatar: "",
            },
            message: "Completed 2 chapters of DBMS today.",
            time: "2h ago",
        },
        {
            id: 2,
            user: {
                name: "Riya",
                avatar: "",
            },
            message: "Starting OS revision. Anyone else?",
            time: "3h ago",
        },
        {
            id: 3,
            user: {
                name: "Rahul",
                avatar: "",
            },
            message: "Finished today's session. Feeling productive.",
            time: "5h ago",
        },
    ]);

    const handleJoinRoom = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.patch<ServerResponse<null>>(`/rooms/join-room/${roomDetails._id}`, null, {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            
            const { success, message } = response.data;
            
            success ? toast.success(message) : toast.error(message);
            setIsMember(true);
        } catch (error) {
            setIsMember(false);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to join room")
            } else {
                toast.error("Failed to join room")
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="md:col-span-2">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Discussions
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    {discussions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-muted-foreground">
                                No discussions yet
                            </p>
                            {!isMember && <p className="text-xs text-muted-foreground mt-1">
                                Join this room to start contributing
                            </p>}
                        </div>
                    ) : (
                        discussions.map((item) => (
                            <div key={item.id} className="flex gap-4">

                                {/* Avatar */}
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={item.user.avatar} />
                                    <AvatarFallback>
                                        {item.user.name[0]}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">
                                            {item.user.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {item.time}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Input placeholder (non-functional for now) */}
                    {
                        isMember
                            ? <div className="pt-4 border-t">
                                <div className="flex gap-2 items-end">
                                    <Textarea
                                        placeholder="Write a message..."
                                        className="flex-1 min-h-15 max-h-37.5 resize-none"
                                        disabled={loading}
                                    />
                                    <Button size="sm" className="cursor-pointer" disabled={loading}>
                                        {
                                            loading
                                                ? <p className="flex items-center gap-2"><Loader2Icon className="animate-spin" /> Sending...</p>
                                                : <p className="flex items-center gap-2"><SendIcon /> Send</p>
                                        }
                                    </Button>
                                </div>
                            </div>
                            : <Button className="cursor-pointer" onClick={handleJoinRoom} disabled={loading}>
                                {
                                    loading
                                        ? <p className="flex items-center gap-2"><Loader2Icon className="animate-spin" /> Joining...</p>
                                        : <p className="flex items-center gap-2"><UserPlus2Icon /> Join Room</p>
                                }
                            </Button>
                    }

                </CardContent>
            </Card>
        </div>
    );
}