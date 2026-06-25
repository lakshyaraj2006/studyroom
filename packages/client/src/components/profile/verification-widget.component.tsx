import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Edit } from "lucide-react";

interface VerificationWidgetProps {
    email: string;
    onVerified: () => void;
}

export default function VerificationWidget({ email, onVerified }: VerificationWidgetProps) {
    const { setAuthToken, setUsrInfo } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    
    const [code, setCode] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            toast.error("Please enter the verification code");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosPrivate.post("/users/verify-email", {
                email,
                code: code.trim()
            });

            if (response.data?.success) {
                const { accessToken, id, username, avatar, handle } = response.data.data;
                
                // Update global auth state
                setAuthToken(accessToken);
                setUsrInfo({ id, username, avatar, handle });
                
                toast.success("Account successfully verified!");
                onVerified();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await axiosPrivate.post("/users/resend-code", { email });
            toast.success("Verification code has been resent to your email.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend verification code.");
        } finally {
            setResending(false);
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            toast.error("Please enter a new email address");
            return;
        }
        if (newEmail.trim() === email) {
            toast.error("New email must be different from current email");
            return;
        }

        setLoading(true);
        try {
            await axiosPrivate.post("/users/change-email", {
                email: newEmail.trim()
            });
            
            toast.success("Email address updated. Check your new inbox for the code.");
            setNewEmail("");
            setIsChangingEmail(false);
            onVerified(); // Refresh profile data to show new email
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update email address.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-amber-600/[0.02] dark:from-amber-500/[0.04] dark:to-transparent backdrop-blur-md overflow-hidden rounded-2xl shadow-lg shadow-amber-500/[0.01] mb-6">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        <AlertCircle className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">
                            Email Verification Required
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                            Your account is currently unverified. Please verify your email <span className="font-semibold text-foreground underline decoration-amber-500/30 decoration-2 underline-offset-2">{email}</span> to unlock all platform features.
                        </p>

                        {!isChangingEmail ? (
                            <div className="mt-5">
                                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative flex-1 sm:max-w-[200px]">
                                        <Input
                                            placeholder="Verification Code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="h-10 text-center font-mono tracking-[0.4em] uppercase text-sm bg-background/50 border-amber-500/20 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/40"
                                            maxLength={6}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={loading}
                                            className="h-10 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-4 font-semibold shadow-sm transition-all duration-200 shrink-0"
                                        >
                                            Verify Code
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResend}
                                            disabled={resending}
                                            className="h-10 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 cursor-pointer px-3 transition-all duration-200 shrink-0"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${resending ? "animate-spin" : ""}`} />
                                            Resend
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsChangingEmail(true)}
                                            className="h-10 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 cursor-pointer px-3 transition-all duration-200 shrink-0"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                                            Change Email
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="mt-5">
                                <form onSubmit={handleChangeEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative flex-1 sm:max-w-[260px]">
                                        <Input
                                            type="email"
                                            placeholder="Enter new email address"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="h-10 text-xs bg-background/50 border-amber-500/20 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/40"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={loading}
                                            className="h-10 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-4 font-semibold shadow-sm transition-all duration-200"
                                        >
                                            Update Email
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsChangingEmail(false)}
                                            className="h-10 text-xs text-muted-foreground hover:bg-amber-500/10 cursor-pointer px-3 transition-all duration-200"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
