import { useAuth } from "@/hooks/useAuth";
import { type ServerResponse } from "@/interfaces/server-response";
import axiosInstance from "@/lib/api";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import {
    Loader2Icon,
    CheckCircle2,
    XCircle,
    Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function RejectRoomInvite() {
    const { roomId, inviteToken } = useParams();
    const [res, setRes] = useState({
        success: false,
        message: "",
    });
    const [loading, setLoading] = useState(true);

    const { authToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        acceptInvite();
    }, []);

    const acceptInvite = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.delete<ServerResponse<null>>(
                `/rooms/reject-invite/${roomId}/${inviteToken}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const { success, message } = response.data;

            setRes({ success, message });

            if (success) {
                setTimeout(() => navigate(`/rooms`), 1200);
            }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                setRes({
                    success: false,
                    message:
                        error.response?.data.message ||
                        "Failed to reject invite",
                });
            } else {
                toast.error(error.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const StatusIcon = loading
        ? Loader2Icon
        : res.success
            ? CheckCircle2
            : XCircle;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div
                        className={cn(
                            "rounded-2xl p-4",
                            loading && "bg-indigo-50",
                            res.success && "bg-green-50",
                            !loading && !res.success && "bg-red-50"
                        )}
                    >
                        <StatusIcon
                            className={cn(
                                "h-8 w-8",
                                loading && "animate-spin text-indigo-600",
                                res.success && "text-green-600",
                                !loading &&
                                !res.success &&
                                "text-red-600"
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {loading
                                ? "Rejecting invite"
                                : res.success
                                    ? "Invite rejected"
                                    : "Unable to reject invite"}
                        </h1>

                        <p className="text-sm text-slate-500 leading-relaxed">
                            {loading
                                ? "We're verifying your invitation and rejecting it."
                                : res.message}
                        </p>
                    </div>

                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                            <Sparkles className="h-4 w-4" />
                            Almost there...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}