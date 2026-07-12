import { useState } from "react";
import type { SignInUserCredentials } from "@/interfaces/signin-user-credentials";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff, HelpCircleIcon, LogInIcon, UserPlus2Icon } from "lucide-react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import SEO from "@/components/seo.component";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function SignIn() {
    const { signin, setAuthToken, setUsrInfo } = useAuth();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<SignInUserCredentials>({
        identifier: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(credentials => ({ ...credentials, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { success, message, data: { accessToken, id, username, avatar, handle } } = await signin(credentials);
            if (success) {
                toast.success(message, { duration: 2000 });
                setCredentials({
                    identifier: "",
                    password: ""
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
                const { message } = error.response?.data;
                toast.error(message, { duration: 2000 });
            } else {
                toast.error((error as any).message, { duration: 2000 });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center px-4 bg-background transition-colors duration-300 overflow-hidden">
            <SEO
                title="Sign In"
                description="Sign in to your StudyRoom account to collaborate with peers, book focused study rooms, and manage your active learning spaces."
                keywords="sign in, login, studyroom, user login"
            />

            {/* Background Glow Decors */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-[150px] h-[150px] bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

            <Card className="w-full max-w-sm sm:max-w-md border border-border/40 bg-card/70 backdrop-blur-md shadow-xl rounded-2xl p-2 z-10 transition-colors duration-300">
                <CardHeader className="space-y-1 pb-4">
                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent leading-none font-semibold">
                        Welcome Back
                    </h1>
                    <p className="text-xs text-muted-foreground text-center">
                        Sign in to your StudyRoom account to continue
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="identifier" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Identifier
                            </label>
                            <Input
                                type="text"
                                name="identifier"
                                id="identifier"
                                placeholder="Username or Email"
                                onChange={handleChange}
                                className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    onChange={handleChange}
                                    className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 pr-10"
                                />
                                <button
                                    id="password-toggle-btn"
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            id="signin-submit-btn"
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl font-semibold shadow-md shadow-primary/10 hover:shadow-primary/25 active:scale-95 transition-all duration-300"
                            disabled={loading}
                        >
                            {
                                loading ? <><Spinner /> Loading...</>
                                    : <><LogInIcon size={16} /> Sign In</>
                            }
                        </Button>
                    </form>

                    <GoogleLoginButton />

                    <div className="flex gap-6 w-full items-center justify-between mt-6 pt-4 border-t border-border/40 text-xs">
                        <Link id="forgot-password-link" to="/auth/forgot-password" className="text-muted-foreground hover:text-primary transition-colors flex gap-1.5 items-center">
                            <HelpCircleIcon size={14} /> Forgot Password?
                        </Link>
                        <Link id="signup-link" to="/auth/signup" className="text-muted-foreground hover:text-primary transition-colors flex gap-1.5 items-center font-medium">
                            <UserPlus2Icon size={14} /> Create Account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
