import { useState } from "react";
import { Input } from "../../components/ui/input";
import { ArrowLeftIcon, Eye, EyeOff, LockIcon, LogInIcon, MailIcon, RotateCwIcon, UserPlus2Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Spinner } from "@/components/ui/spinner";
import PasswordStrength from "@/components/password-strength.component";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const { forgotPassword, forgotPasswordReset } = useAuth();
    const [mode, setMode] = useState<"enter-email" | "reset-password">("enter-email");
    const [loadingAction, setLoadingAction] = useState<"enter-email" | "reset-password" | "resend" | null>(null);

    const [resetData, setResetData] = useState({
        email: "",
        code: "",
        password: "",
        confirmPassword: ""
    });

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const sendCode = async (action: "enter-email" | "resend") => {
        if (loadingAction) return;
        setLoadingAction(action);

        try {
            const { success, message } = await forgotPassword(resetData.email);
            if (success) {
                toast.success(message, { duration: 2000 });
                setMode("reset-password");
            } else {
                toast.error(message, { duration: 2000 });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Something went wrong", { duration: 2000 });
            } else {
                toast.error((error as any).message);
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendCode("enter-email");
    };

    const handleResendCode = () => {
        sendCode("resend");
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loadingAction) return;
        setLoadingAction("reset-password");

        try {
            const { success, message } = await forgotPasswordReset(
                resetData.email,
                resetData.code,
                resetData.password,
                resetData.confirmPassword
            );

            if (success) {
                toast.success(message, { duration: 2000 });
                setTimeout(() => navigate("/auth/signin"), 300);
            } else {
                toast.error(message, { duration: 2000 });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Something went wrong", { duration: 2000 });
            } else {
                toast.error((error as any).message, { duration: 2000 });
            }
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">Forgot Password</CardTitle>
                </CardHeader>

                <CardContent>
                    {mode === "enter-email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email">Email</label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={resetData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={loadingAction === "enter-email"}
                            >
                                {loadingAction === "enter-email"
                                    ? <><Spinner /> Loading...</>
                                    : <><MailIcon /> Send Code</>
                                }
                            </Button>

                            {(resetData.email || loadingAction === "enter-email") && (
                                <p className="text-sm text-center underline mt-1 cursor-pointer" onClick={() => setMode("reset-password")}>
                                    Already have a code?
                                </p>
                            )}
                        </form>
                    )}

                    {mode === "reset-password" && (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="code">Verification Code</label>
                                <Input
                                    type="text"
                                    id="code"
                                    name="code"
                                    placeholder="Enter code"
                                    value={resetData.code}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">New Password</label>
                                <PasswordStrength
                                    value={resetData.password}
                                    onChange={(value) => setResetData(prev => ({ ...prev, password: value }))}
                                    showStrength
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={resetData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex w-full items-center gap-2">
                                <Button
                                    type="button"
                                    className="w-1/2 flex items-center gap-2 cursor-pointer"
                                    onClick={handleResendCode}
                                    disabled={loadingAction === "resend"}
                                >
                                    {loadingAction === "resend"
                                        ? <><Spinner /> Loading...</>
                                        : <><RotateCwIcon /> Resend Code</>
                                    }
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 cursor-pointer"
                                    disabled={loadingAction === "reset-password"}
                                >
                                    {loadingAction === "reset-password"
                                        ? <><Spinner /> Loading...</>
                                        : <><LockIcon /> Reset Password</>
                                    }
                                </Button>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer mt-2"
                                onClick={() => setMode("enter-email")}
                                disabled={loadingAction === "reset-password"}
                            >
                                <ArrowLeftIcon /> Back
                            </Button>
                        </form>
                    )}

                    <div className="flex gap-8 w-full items-center justify-center mt-6">
                        <Link to="/auth/signin" className="text-sm text-center flex gap-2 items-center hover:underline">
                            <LogInIcon size={16} /> Sign In
                        </Link>
                        <Link to="/auth/signup" className="text-sm text-center flex gap-2 items-center hover:underline">
                            <UserPlus2Icon size={16} /> Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
