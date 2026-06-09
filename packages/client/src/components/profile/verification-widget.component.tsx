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
        <Card className="border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] overflow-hidden rounded-xl shadow-xs mb-6">
            <CardContent className="p-6">
                <div className="flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-400">
                            Email Verification Required
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your account is unverified. Please verify your email <strong className="text-foreground">{email}</strong> to unlock full functionality.
                        </p>

                        {!isChangingEmail ? (
                            <div className="mt-4">
                                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <Input
                                        placeholder="Enter 6-digit code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="h-9 text-xs sm:w-48 bg-background border-amber-500/10 focus-visible:ring-amber-500/25"
                                        maxLength={6}
                                        disabled={loading}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={loading}
                                            className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-4"
                                        >
                                            Verify Code
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResend}
                                            disabled={resending}
                                            className="h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 cursor-pointer px-3"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${resending ? "animate-spin" : ""}`} />
                                            Resend
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsChangingEmail(true)}
                                            className="h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-amber-500/10 cursor-pointer px-3"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                                            Change Email
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <form onSubmit={handleChangeEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <Input
                                        type="email"
                                        placeholder="Enter new email address"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="h-9 text-xs sm:w-64 bg-background border-amber-500/10 focus-visible:ring-amber-500/25"
                                        disabled={loading}
                                        required
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={loading}
                                            className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-4"
                                        >
                                            Update Email
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsChangingEmail(false)}
                                            className="h-9 text-xs text-muted-foreground hover:bg-amber-500/10 cursor-pointer px-3"
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
