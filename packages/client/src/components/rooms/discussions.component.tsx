import { useState, useEffect, useRef } from "react";
import { type Room } from "@/interfaces/room";
import { type IDiscussion } from "@/interfaces/discussion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { type ServerResponse } from "@/interfaces/server-response";
import { AxiosError } from "axios";
import { Loader2Icon, UserPlus2Icon, MessageSquare, Menu, Users, BookOpen } from "lucide-react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import DiscussionItem from "./discussion-item";
import DiscussionInput from "./discussion-input";

type DiscussionsProps = {
    roomDetails: Room;
    isMember: boolean;
    setIsMember: React.Dispatch<React.SetStateAction<boolean>>;
    onToggleLeftSidebar?: () => void;
    onToggleRightSidebar?: () => void;
    membersList?: any[];
};

export default function Discussions({
    roomDetails,
    isMember,
    setIsMember,
    onToggleLeftSidebar,
    onToggleRightSidebar,
    membersList = []
}: DiscussionsProps) {
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

    // Check if consecutive messages should be grouped
    const checkIsGrouped = (currentItem: IDiscussion, prevItem?: IDiscussion) => {
        if (!prevItem) return false;
        if (currentItem.user._id !== prevItem.user._id) return false;

        const currentMs = new Date(currentItem.createdAt).getTime();
        const prevMs = new Date(prevItem.createdAt).getTime();
        const diffMins = (currentMs - prevMs) / 60000;
        return diffMins < 5; // Group if within 5 minutes
    };

    return (
        <div className="flex flex-col h-full flex-1 overflow-hidden bg-white dark:bg-slate-950/20">
            
            {/* Cozy styled Header Bar */}
            <div className="h-12 border-b border-border/40 px-4 flex items-center justify-between shrink-0 select-none bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xs">
                <div className="flex items-center min-w-0">
                    <button
                        onClick={onToggleLeftSidebar}
                        className="md:hidden mr-2 p-1 rounded-md text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground transition cursor-pointer"
                        title="Toggle navigation"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    
                    <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                    <span className="ml-1.5 text-sm font-semibold text-foreground truncate">study-hall-chat</span>
                    
                    <div className="h-4 w-px bg-border/40 mx-3 hidden sm:inline shrink-0" />
                    
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                        {roomDetails.room_tagline || "Grind together, shine together!"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleRightSidebar}
                        className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-foreground transition cursor-pointer"
                        title="Toggle student roster"
                    >
                        <Users className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area Scroll Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin scrollbar-thumb-border"
            >
                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2Icon className="animate-spin h-8 w-8 mb-2" />
                        <p className="text-sm">Retrieving blackboard discussions...</p>
                    </div>
                ) : discussions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
                        <div className="bg-primary/5 p-4 rounded-full mb-3 select-none border border-primary/10">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Welcome to {roomDetails.room_name}!</h2>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            This is the start of the student bulletin board in this room.
                            {!isMember && !isBlockedLocal && " Join our study room to start sharing!"}
                        </p>
                    </div>
                ) : (
                    discussions.map((item, idx) => {
                        const isGrouped = checkIsGrouped(item, discussions[idx - 1]);
                        const senderActive = membersList.find(m => m._id === item.user._id)?.active || false;
                        return (
                            <DiscussionItem
                                key={item._id}
                                item={item}
                                currentUserId={usrInfo?.id}
                                isRoomCreator={isRoomCreator}
                                onSave={handleSaveEdit}
                                onDelete={handleDeleteMessage}
                                isGrouped={isGrouped}
                                senderActive={senderActive}
                            />
                        );
                    })
                )}
            </div>

            {/* Bottom Input Area or Join Room CTA */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-border/40 shrink-0">
                {isBlockedLocal ? (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 text-center flex flex-col items-center gap-1">
                        <p className="text-xs font-bold text-destructive">
                            You have been blocked from participating in this room
                        </p>
                        <p className="text-[11px] text-destructive/80 font-medium">
                            You can view the bulletin board but cannot post messages.
                        </p>
                    </div>
                ) : isMember ? (
                    <DiscussionInput onSend={handleSendMessage} />
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-border/40">
                        <div className="text-center sm:text-left">
                            <p className="text-xs font-semibold text-foreground">
                                Visiting as Guest
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Join this study room to write on the board and collaborate with students.
                            </p>
                        </div>
                        <Button
                            className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer rounded-xl h-9 px-4 text-xs font-medium"
                            onClick={handleJoinRoom}
                            disabled={joining}
                        >
                            {joining ? (
                                <>
                                    <Loader2Icon className="animate-spin h-3.5 w-3.5 mr-1.5" />
                                    Joining Room...
                                </>
                            ) : (
                                <>
                                    <UserPlus2Icon className="h-3.5 w-3.5 mr-1.5" />
                                    Join Study Room
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}