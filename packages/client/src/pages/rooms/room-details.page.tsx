import { type Room } from "@/interfaces/room";
import { type ServerResponse } from "@/interfaces/server-response";
import axiosInstance from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RoomDetails() {
    const { roomId } = useParams();
    const [roomDetails, setRoomDetails] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);

    // Dummy discussions
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

    useEffect(() => {
        if (roomId) fetchRoomDetails();
    }, [roomId]);

    const fetchRoomDetails = async () => {
        try {
            const response = await axiosInstance.get<ServerResponse<Room>>(`/rooms/${roomId}`);
            setRoomDetails(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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

    return (
        <div className="container px-4 md:px-6 mx-auto my-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT PANEL */}
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

                            <Button className="w-full mt-2">
                                Join Room
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT PANEL - DISCUSSIONS */}
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Join this room to start contributing
                                    </p>
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
                            <div className="pt-4 border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a message..."
                                        className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:ring-1"
                                        disabled
                                    />
                                    <Button size="sm" disabled>
                                        Send
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}