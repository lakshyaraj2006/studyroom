import { type Room } from "@/interfaces/room";
import { type ServerResponse } from "@/interfaces/server-response";
import axiosInstance from "@/lib/api";
import { useEffect, useState } from "react";
import { redirect, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import Discussions from "@/components/rooms/discussions.component";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { toast } from "sonner";

type LoadingState = "idle" | "fetchingRoom" | "checkingMember" | "leavingRoom";

export default function RoomDetails() {
    const { roomId } = useParams();
    const { authToken, usrInfo } = useAuth();

    const [roomDetails, setRoomDetails] = useState<Room | null>(null);
    const [loading, setLoading] = useState<LoadingState>("idle");
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails();
            checkMember();
        }
    }, [roomId]);

    const fetchRoomDetails = async () => {
        setLoading("fetchingRoom");
        try {
            const response = await axiosInstance.get<ServerResponse<Room>>(`/rooms/${roomId}`);
            setRoomDetails(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading("idle");
        }
    };

    const checkMember = async () => {
        if (!authToken) return;

        setLoading("checkingMember");
        try {
            const response = await axiosInstance.get<ServerResponse<{ isMember: boolean }>>(
                `/rooms/check-member/${roomId}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            setIsMember(response.data.data.isMember);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading("idle");
        }
    };

    const handleLeaveRoom = async () => {
        if (!authToken) return;

        setLoading("leavingRoom");

        try {
            const response = await axiosInstance.patch<ServerResponse<null>>(
                `/rooms/leave-room/${roomId}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const { success, message } = response.data;

            success ? toast.success(message) : toast.error(message);
            setIsMember(false);
        } catch (error) {
            setIsMember(true);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to leave room");
            } else {
                toast.error("Failed to leave room");
            }
        } finally {
            setLoading("idle");
        }
    };

    if (loading === "fetchingRoom" || loading === "checkingMember") {
        return (
            <div className="container px-6 mx-auto my-10">
                <p className="text-sm text-muted-foreground">Loading room...</p>
            </div>
        );
    }

    if (!roomDetails) {
        return (
            <div className="container px-6 mx-auto my-10">
                <p className="text-sm text-muted-foreground">Room not found</p>
            </div>
        );
    }

    if (!isMember && roomDetails.access_type === "private") redirect("/rooms");

    return (
        <div className="container px-4 md:px-6 mx-auto my-6">
            {authToken && isMember && usrInfo && roomDetails.room_creator._id !== usrInfo?.id && (
                <div className="flex items-end justify-end mb-4">
                    <Button
                        variant="destructive"
                        onClick={handleLeaveRoom}
                        disabled={loading === "leavingRoom"}
                    >
                        {loading === "leavingRoom" ? "Leaving..." : "Leave Room"}
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="rounded-2xl shadow-sm md:sticky md:top-6">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl md:text-2xl font-semibold">
                                {roomDetails.room_name}
                            </CardTitle>

                            <CardDescription>
                                Created by {roomDetails.room_creator.name}
                            </CardDescription>

                            <p className="text-xs text-muted-foreground">
                                {roomDetails.room_users.length} members
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {roomDetails.room_tagline && (
                                <p className="text-sm text-muted-foreground">
                                    {roomDetails.room_tagline}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {roomDetails.room_topics.map((topic, index) => (
                                    <Badge key={index} variant="secondary">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Discussions
                    roomDetails={roomDetails}
                    isMember={isMember}
                    setIsMember={setIsMember}
                />
            </div>
        </div>
    );
}