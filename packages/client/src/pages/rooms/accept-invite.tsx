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
import SEO from "@/components/seo.component";

export default function AcceptRoomInvite() {
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
            const response = await axiosInstance.post<ServerResponse<null>>(
                `/rooms/accept-invite/${roomId}/${inviteToken}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const { success, message } = response.data;

            setRes({ success, message });

            if (success) {
                setTimeout(() => navigate(`/rooms/${roomId}`), 1200);
            }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                setRes({
                    success: false,
                    message:
                        error.response?.data.message ||
                        "Failed to accept invite",
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
        <div className="min-h-screen bg-background flex items-center justify-center px-6 transition-colors duration-300">
            <SEO
                title="Accept Invitation"
                description="Accept invitation to join a study room on StudyRoom to start active learning and collaboration."
                keywords="accept invitation, study room invite, join study group, studyroom"
            />
            <div className="w-full max-w-md rounded-3xl border border-border/40 bg-card shadow-xl p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div
                        className={cn(
                            "rounded-2xl p-4",
                            loading && "bg-primary/10",
                            res.success && "bg-green-500/10",
                            !loading && !res.success && "bg-destructive/10"
                        )}
                    >
                        <StatusIcon
                            className={cn(
                                "h-8 w-8",
                                loading && "animate-spin text-primary",
                                res.success && "text-green-500",
                                !loading &&
                                !res.success &&
                                "text-destructive"
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {loading
                                ? "Joining room"
                                : res.success
                                    ? "Welcome aboard"
                                    : "Unable to join"}
                        </h1>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {loading
                                ? "We're verifying your invitation and preparing your workspace."
                                : res.message}
                        </p>
                    </div>

                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <Sparkles className="h-4 w-4" />
                            Almost there...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}