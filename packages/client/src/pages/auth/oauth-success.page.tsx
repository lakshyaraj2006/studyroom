import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { setAuthToken, setUsrInfo } = useAuth();

    useEffect(() => {
        const success = searchParams.get("success");
        const accessToken = searchParams.get("accessToken");
        const id = searchParams.get("id");
        const username = searchParams.get("username");
        const handle = searchParams.get("handle");
        const avatar = searchParams.get("avatar") || undefined;

        if (
            success !== "true" ||
            !accessToken ||
            !id ||
            !username ||
            !handle
        ) {
            toast.error("Google sign in failed.");
            navigate("/auth/signin", { replace: true });
            return;
        }

        setAuthToken(accessToken);

        setUsrInfo({
            id,
            username,
            handle,
            avatar,
        });

        toast.success("Successfully signed in with Google!");

        navigate("/", { replace: true });
    }, [navigate, searchParams, setAuthToken, setUsrInfo]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p className="text-sm text-muted-foreground">
                    Completing sign in...
                </p>
            </div>
        </div>
    );
}