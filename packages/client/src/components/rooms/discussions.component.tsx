import { useState, useEffect, useRef } from "react";
import { type Room } from "@/interfaces/room";
import { type IDiscussion } from "@/interfaces/discussion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { type ServerResponse } from "@/interfaces/server-response";
import { AxiosError } from "axios";
import { Loader2Icon, UserPlus2Icon } from "lucide-react";
import { io } from "socket.io-client";
import DiscussionItem from "./discussion-item";
import DiscussionInput from "./discussion-input";

type DiscussionsProps = {
    roomDetails: Room;
    isMember: boolean;
    setIsMember: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Discussions({ roomDetails, isMember, setIsMember }: DiscussionsProps) {
    const { authToken, usrInfo } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const [discussions, setDiscussions] = useState<IDiscussion[]>([]);
    const [fetching, setFetching] = useState(false);
    const [joining, setJoining] = useState(false);

    const [isBlockedLocal, setIsBlockedLocal] = useState(() =>
        roomDetails.blocked_users?.some((user) => user._id === usrInfo?.id) || false
    );

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchDiscussions = async () => {
        setFetching(true);
        try {
            const response = await axiosPrivate.get<ServerResponse<IDiscussion[]>>(
                `/discussions/room/${roomDetails._id}`
            );
            if (response.data.success) {
                setDiscussions(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch discussions", error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to load discussions");
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        setIsBlockedLocal(
            roomDetails.blocked_users?.some((user) => user._id === usrInfo?.id) || false
        );
    }, [roomDetails, usrInfo]);

    useEffect(() => {
        if (roomDetails._id && (isMember || roomDetails.access_type === "public")) {
            fetchDiscussions();
        } else {
            setDiscussions([]);
        }
    }, [roomDetails._id, isMember]);

    useEffect(() => {
        if (!roomDetails._id) return;
        if (!isMember && roomDetails.access_type === "private") return;

        const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
        const socket = io(socketUrl, {
            auth: {
                token: authToken
            },
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            socket.emit("join_room", roomDetails._id, (res: { success: boolean; message?: string }) => {
                if (!res.success) {
                    console.error("Socket room subscription error:", res.message);
                }
            });
        });

        socket.on("discussion:created", (discussion: IDiscussion) => {
            setDiscussions((prev) => {
                if (prev.some((d) => d._id === discussion._id)) return prev;
                return [...prev, discussion];
            });
        });

        socket.on("discussion:updated", (updated: IDiscussion) => {
            setDiscussions((prev) =>
                prev.map((d) => (d._id === updated._id ? updated : d))
            );
        });

        socket.on("discussion:deleted", (deletedId: string) => {
            setDiscussions((prev) => prev.filter((d) => d._id !== deletedId));
        });

        socket.on("room:blocked", ({ roomId }: { roomId: string }) => {
            if (roomId === roomDetails._id) {
                setIsBlockedLocal(true);
                setIsMember(false);
            }
        });

        return () => {
            socket.emit("leave_room", roomDetails._id);
            socket.disconnect();
        };
    }, [roomDetails._id, authToken, isMember]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [discussions]);

    const handleSendMessage = async (content: string) => {
        try {
            await axiosPrivate.post<ServerResponse<IDiscussion>>(
                "/discussions",
                { roomId: roomDetails._id, content }
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to send message");
            } else {
                toast.error("Failed to send message");
            }
            throw error;
        }
    };

    const handleSaveEdit = async (discussionId: string, content: string) => {
        try {
            await axiosPrivate.patch<ServerResponse<IDiscussion>>(
                `/discussions/${discussionId}`,
                { content }
            );
            toast.success("Message updated");
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to update message");
            } else {
                toast.error("Failed to update message");
            }
            throw error;
        }
    };

    const handleDeleteMessage = async (discussionId: string) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const response = await axiosPrivate.delete<ServerResponse<null>>(
                `/discussions/${discussionId}`
            );
            if (response.data.success) {
                toast.success("Message deleted");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to delete message");
            } else {
                toast.error("Failed to delete message");
            }
        }
    };

    const handleJoinRoom = async () => {
        setJoining(true);
        try {
            const response = await axiosPrivate.patch<ServerResponse<null>>(
                `/rooms/join-room/${roomDetails._id}`,
                null
            );
            if (response.data.success) {
                toast.success(response.data.message || "Joined room successfully");
                setIsMember(true);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to join room");
            } else {
                toast.error("Failed to join room");
            }
        } finally {
            setJoining(false);
        }
    };

    const isRoomCreator = usrInfo?.id === roomDetails.room_creator._id;

    return (
        <Card className="rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 py-4">
                <CardTitle className="text-lg font-semibold text-slate-800">
                    Discussions
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between p-4 overflow-hidden bg-slate-50/30">
                {/* Scrollable message container */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-slate-200"
                >
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2Icon className="animate-spin h-8 w-8 mb-2" />
                            <p className="text-sm">Fetching discussions...</p>
                        </div>
                    ) : discussions.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
                            <p className="text-sm text-slate-500 font-medium">No discussions yet</p>
                            {!isMember && !isBlockedLocal && (
                                <p className="text-xs text-slate-400 mt-2">
                                    Join this room to start participating.
                                </p>
                            )}
                        </div>
                    ) : (
                        discussions.map((item) => (
                            <DiscussionItem
                                key={item._id}
                                item={item}
                                currentUserId={usrInfo?.id}
                                isRoomCreator={isRoomCreator}
                                onSave={handleSaveEdit}
                                onDelete={handleDeleteMessage}
                            />
                        ))
                    )}
                </div>

                {/* Input area or Join action */}
                <div className="border-t border-slate-100 pt-4 bg-white -mx-4 -mb-4 p-4 shadow-inner">
                    {isBlockedLocal ? (
                        <div className="bg-red-50 border border-red-200/60 rounded-xl p-3.5 text-center flex flex-col items-center gap-1 shadow-2xs">
                            <p className="text-xs font-bold text-red-800">
                                You have been blocked from this room
                            </p>
                            <p className="text-[11px] text-red-600/90 font-medium">
                                You can view conversations but are not permitted to participate.
                            </p>
                        </div>
                    ) : isMember ? (
                        <DiscussionInput onSend={handleSendMessage} />
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <p className="text-xs text-slate-500 text-center font-medium">
                                You are viewing this room as a guest. Join to send messages.
                            </p>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer rounded-xl h-11"
                                onClick={handleJoinRoom}
                                disabled={joining}
                            >
                                {joining ? (
                                    <>
                                        <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                                        Joining Room...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus2Icon className="h-4 w-4 mr-2" />
                                        Join Room
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}