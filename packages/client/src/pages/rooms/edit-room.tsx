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
            <div className="min-h-screen bg-linear-to-br from-white to-indigo-50 flex items-center justify-center px-4">
                <div className="bg-white border rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-indigo-100">
                        <Loader2Icon className="animate-spin text-indigo-600 w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">
                            Fetching Room Details
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Preparing everything for editing...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!roomDetails) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white to-gray-50 flex items-center justify-center px-4">
                <div className="bg-white border rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-gray-100">
                        <FileQuestionIcon className="text-gray-500 w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">
                            Room Not Found
                        </h2>
                        <p className="text-gray-500 text-sm">
                            This room may have been removed or the link is invalid.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (usrInfo?.id !== roomDetails.room_creator._id) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white to-red-50 flex items-center justify-center px-4">
                <div className="bg-white border border-red-100 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 max-w-md w-full">
                    <div className="p-4 rounded-full bg-red-100">
                        <ShieldAlertIcon className="text-red-500 w-8 h-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-red-600">
                            Access Restricted
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Only the room creator can modify these details.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-10 items-center">

                    {/* Left Hero Section */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-indigo-100 text-indigo-600 font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Refine your learning space
                        </div>

                        <div className="space-y-5">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                                Shape your{" "}
                                <span className="text-indigo-600">
                                    room experience
                                </span>
                            </h1>

                            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                                Keep your study room fresh, focused, and aligned
                                with your learning goals. Update details, refine
                                topics, and make collaboration effortless.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                                <p className="text-gray-600">
                                    Adjust topics to reflect your current focus
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                                <p className="text-gray-600">
                                    Refresh the room identity with a new tagline
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                                <p className="text-gray-600">
                                    Control privacy and collaboration settings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">
                        <div className="mb-6 space-y-2">
                            <h2 className="text-2xl font-semibold">
                                Edit Room Details
                            </h2>
                            <p className="text-sm text-gray-500">
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