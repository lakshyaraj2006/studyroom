import { useState } from "react";
import type { SignUpUserCredentials } from "@/interfaces/signup-user-credentials";
import { Input } from "../../components/ui/input";
import PasswordStrength from "../../components/password-strength.component";
import { Eye, EyeOff, LockIcon, LogInIcon, RotateCwIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";

type LoadingAction = "signup" | "verify" | "resend" | null;

export default function SignUp() {
    const { signup, verifyEmail, setAuthToken, resendCode } = useAuth();
    const [mode, setMode] = useState<"signup" | "code">("signup");
    const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
    const [credentials, setCredentials] = useState<SignUpUserCredentials>({
        name: "",
        username: "",
        email: "",
        password: "",
        cpassword: "",
        code: ""
    });
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\s/g, "");
        setCredentials(prev => ({ ...prev, code: val.slice(0, 6) }));
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction("signup");

        try {
            const { success, message } = await signup(credentials);
            if (success) {
                toast.success(message);
                setMode("code");
            } else {
                toast.error(message);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message);
            } else {
                toast.error((error as any).message);
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction("verify");

        try {
            const { success, message, data: { accessToken } } =
                await verifyEmail(credentials.email, credentials.code);

            if (success) {
                toast.success(message);
                setTimeout(() => {
                    setAuthToken(accessToken);
                    navigate("/");
                }, 2000);
            } else {
                toast.error(message);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message);
            } else {
                toast.error((error as any).message);
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const handleResendCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction("resend");

        try {
            const { success, message } = await resendCode(credentials.email);
            success ? toast.success(message) : toast.error(message);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message);
            } else {
                toast.error((error as any).message);
            }
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">
                        {mode === "signup" ? "Sign Up for an account" : "Verify your account"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {mode === "signup" && (
                        <form onSubmit={handleSignupSubmit} className="w-full space-y-4">
                            <div>
                                <label htmlFor="name">Name</label>
                                <Input name="name" id="name" placeholder="Name" onChange={handleChange} />
                            </div>

                            <div>
                                <label htmlFor="username">Username</label>
                                <Input name="username" id="username" placeholder="Username" onChange={handleChange} />
                            </div>

                            <div>
                                <label htmlFor="email">Email Address</label>
                                <Input name="email" id="email" type="email" placeholder="Email" onChange={handleChange} />
                            </div>

                            <div>
                                <label htmlFor="password">Password</label>
                                <PasswordStrength credentials={credentials} setCredentials={setCredentials} />
                            </div>

                            <div>
                                <label htmlFor="cpassword">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="cpassword"
                                        id="cpassword"
                                        placeholder="Confirm Password"
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

                            <Button
                                type="submit"
                                className="w-full flex items-center gap-2 cusror-pointer"
                                disabled={loadingAction === "signup"}
                            >
                                {loadingAction === "signup"
                                    ? <><Spinner /> Loading...</>
                                    : <><LogInIcon /> Sign Up</>
                                }
                            </Button>
                        </form>
                    )}

                    {mode === "code" && (
                        <form onSubmit={handleCodeSubmit} className="w-full space-y-4">
                            <div>
                                <label htmlFor="code">Verification Code</label>
                                <Input
                                    name="code"
                                    id="code"
                                    placeholder="Enter 6-character code"
                                    value={credentials.code}
                                    onChange={handleCodeChange}
                                    maxLength={6}
                                />
                            </div>

                            <div className="flex w-full gap-2">
                                <Button
                                    type="button"
                                    className="w-1/2 flex items-center gap-2 cusror-pointer"
                                    onClick={handleResendCodeSubmit}
                                    disabled={loadingAction === "resend"}
                                >
                                    {loadingAction === "resend"
                                        ? <><Spinner /> Loading...</>
                                        : <><RotateCwIcon /> Resend Code</>
                                    }
                                </Button>

                                <Button
                                    type="submit"
                                    className="flex-1 flex items-center gap-2 cusror-pointer"
                                    disabled={loadingAction === "verify"}
                                >
                                    {loadingAction === "verify"
                                        ? <><Spinner /> Loading...</>
                                        : <><LockIcon /> Verify Code</>
                                    }
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
