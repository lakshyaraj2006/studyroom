import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RoomForm from "@/components/rooms/room-form.component";
import { useAuth } from "@/hooks/useAuth";
import type { Room } from "@/interfaces/room";
import axiosInstance from "@/lib/api";
import type { ServerResponse } from "@/interfaces/server-response";
import {
    Loader2Icon,
    FileQuestionIcon,
    SparklesIcon,
    ShieldAlertIcon
} from "lucide-react";

type LoadingState =
    | "idle"
    | "fetchingRoom"
    | "updatingRoom";

export default function EditRoom() {
    const { roomId } = useParams();
    const { authToken, usrInfo } = useAuth();

    const [roomDetails, setRoomDetails] = useState<Room | null>(null);
    const [loading, setLoading] = useState<LoadingState>("idle");

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails();
        }
    }, [roomId, authToken]);

    const fetchRoomDetails = async () => {
        setLoading("fetchingRoom");

        try {
            const headers = authToken
                ? { Authorization: `Bearer ${authToken}` }
                : {};

            const res = await axiosInstance.get<ServerResponse<Room>>(
                `/rooms/${roomId}`,
                { headers }
            );

            setRoomDetails(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading("idle");
        }
    };

    if (loading === "fetchingRoom") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card border border-border/40 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Loader2Icon className="animate-spin text-primary w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">
                            Fetching Room Details
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Preparing everything for editing...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!roomDetails) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card border border-border/40 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-muted">
                        <FileQuestionIcon className="text-muted-foreground w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">
                            Room Not Found
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            This room may have been removed or the link is invalid.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (usrInfo?.id !== roomDetails.room_creator._id) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card border border-destructive/20 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-destructive/10">
                        <ShieldAlertIcon className="text-destructive w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-destructive">
                            Access Restricted
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Only the room creator can modify these details.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-10 items-center">

                    {/* Left Hero Section */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-primary/10 text-primary font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Refine your learning space
                        </div>

                        <div className="space-y-5">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
                                Shape your{" "}
                               <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                                    room experience
                                </span>
                            </h1>

                            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                                Keep your study room fresh, focused, and aligned
                                with your learning goals. Update details, refine
                                topics, and make collaboration effortless.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <p className="text-muted-foreground">
                                    Adjust topics to reflect your current focus
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <p className="text-muted-foreground">
                                    Refresh the room identity with a new tagline
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <p className="text-muted-foreground">
                                    Control privacy and collaboration settings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border/40 rounded-2xl shadow-xl shadow-primary/5 p-6 md:p-8">
                        <div className="mb-6 space-y-2">
                            <h2 className="text-2xl font-semibold text-foreground">
                                Edit Room Details
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Fine-tune your room in just a few moments
                            </p>
                        </div>

                        <RoomForm
                             initialData={roomDetails}
                             roomId={roomId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}