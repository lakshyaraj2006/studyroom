import { useState } from "react";
import type { SignUpUserCredentials } from "@/interfaces/signup-user-credentials";
import { Input } from "../../components/ui/input";
import PasswordStrength from "../../components/password-strength.component";
import { Eye, EyeOff, LockIcon, LogInIcon, RotateCwIcon } from "lucide-react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import SEO from "@/components/seo.component";

type LoadingAction = "signup" | "verify" | "resend" | null;

export default function SignUp() {
    const { signup, verifyEmail, setAuthToken, resendCode, setUsrInfo } = useAuth();
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
                toast.success(message, { duration: 2000 });
                setMode("code");
            } else {
                toast.error(message, { duration: 2000 });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message, { duration: 2000 });
            } else {
                toast.error((error as any).message, { duration: 2000 });
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction("verify");

        try {
            const { success, message, data: { accessToken, id, username, avatar, handle } } =
                await verifyEmail(credentials.email, credentials.code);

            if (success) {
                toast.success(message, { duration: 2000 });
                setCredentials({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
                    cpassword: "",
                    code: ""
                });

                setTimeout(() => {
                    setAuthToken(accessToken);
                    setUsrInfo({ id, username, avatar, handle });
                }, 2000);
            } else {
                toast.error(message, { duration: 2000 });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message, { duration: 2000 });
            } else {
                toast.error((error as any).message, { duration: 2000 });
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
            success ? toast.success(message, { duration: 2000 }) : toast.error(message, { duration: 2000 });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message, { duration: 2000 });
            } else {
                toast.error((error as any).message, { duration: 2000 });
            }
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center px-4 bg-background transition-colors duration-300 overflow-hidden">
            <SEO
                title={mode === "signup" ? "Create Account" : "Verify Account"}
                description="Sign up for a StudyRoom account to discover, book, and enjoy collaborative quiet study rooms."
                keywords="sign up, register, create account, studyroom, student registration"
            />

            {/* Background Glow Decors */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-[150px] h-[150px] bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

            <Card className="w-full max-w-sm sm:max-w-md border border-border/40 bg-card/70 backdrop-blur-md shadow-xl rounded-2xl p-2 z-10 transition-colors duration-300">
                <CardHeader className="space-y-1 pb-4">
                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent leading-none font-semibold">
                        {mode === "signup" ? "Create Account" : "Verify Account"}
                    </h1>
                    <p className="text-xs text-muted-foreground text-center">
                        {mode === "signup" ? "Join StudyRoom to start collaborative studying" : "Enter the verification code sent to your email"}
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {mode === "signup" && (
                        <form onSubmit={handleSignupSubmit} className="w-full space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                                <Input name="name" id="name" placeholder="Name" onChange={handleChange} className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all" />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
                                <Input name="username" id="username" placeholder="Username" onChange={handleChange} className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all" />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                                <Input name="email" id="email" type="email" placeholder="Email" onChange={handleChange} className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all" />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                                <PasswordStrength
                                    value={credentials.password}
                                    onChange={(value) => {
                                        setCredentials(prev => ({ ...prev, password: value }))
                                    }}
                                    showStrength
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="cpassword" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="cpassword"
                                        id="cpassword"
                                        placeholder="Confirm Password"
                                        onChange={handleChange}
                                        className="rounded-xl border-border/50 pr-10 focus-visible:ring-primary focus-visible:border-primary transition-all"
                                    />
                                    <button
                                        id="password-confirm-toggle-btn"
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                id="signup-submit-btn"
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl font-semibold shadow-md shadow-primary/10 hover:shadow-primary/25 active:scale-95 transition-all duration-300"
                                disabled={loadingAction === "signup"}
                            >
                                {loadingAction === "signup"
                                    ? <><Spinner /> Loading...</>
                                    : <><LogInIcon size={16} /> Sign Up</>
                                }
                            </Button>
                        </form>
                    )}

                    {mode === "code" && (
                        <form onSubmit={handleCodeSubmit} className="w-full space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="code" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verification Code</label>
                                <Input
                                    name="code"
                                    id="code"
                                    placeholder="Enter 6-character code"
                                    value={credentials.code}
                                    onChange={handleCodeChange}
                                    maxLength={6}
                                    className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary text-center tracking-widest font-mono text-lg"
                                />
                            </div>

                            <div className="flex w-full gap-3 pt-2">
                                <Button
                                    id="resend-code-btn"
                                    type="button"
                                    variant="outline"
                                    className="w-1/2 flex items-center justify-center gap-2 cursor-pointer rounded-xl border-border/50 hover:bg-muted"
                                    onClick={handleResendCodeSubmit}
                                    disabled={loadingAction === "resend"}
                                >
                                    {loadingAction === "resend"
                                        ? <><Spinner /> Loading...</>
                                        : <><RotateCwIcon size={14} /> Resend</>
                                    }
                                </Button>

                                <Button
                                    id="verify-submit-btn"
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl font-semibold shadow-md"
                                    disabled={loadingAction === "verify"}
                                >
                                    {loadingAction === "verify"
                                        ? <><Spinner /> Loading...</>
                                        : <><LockIcon size={14} /> Verify</>
                                    }
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="flex w-full items-center justify-center mt-6 pt-4 border-t border-border/40 text-xs">
                        <Link id="signin-link" to="/auth/signin" className="text-muted-foreground hover:text-primary transition-colors flex gap-1.5 items-center font-medium">
                            <LogInIcon size={14} /> Already have an account? Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
