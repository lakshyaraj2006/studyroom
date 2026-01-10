import { useState } from "react";
import type { SignInUserCredentials } from "@/interfaces/signin-user-credentials";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff, HelpCircleIcon, LogInIcon, UserPlus2Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";

export default function SignIn() {
    const { signin, setAuthToken } = useAuth();
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
            const { success, message, data: { accessToken } } = await signin(credentials);
            if (success) {
                toast.success(message, { duration: 2000 });
                setCredentials({
                    identifier: "",
                    password: ""
                });

                setTimeout(() => {
                    setAuthToken(accessToken);
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
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">SignIn to your account</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="identifier">Identifier</label>
                            <Input type="text" name="identifier" id="identifier" placeholder="Username or Email" onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full flex items-center gap-2 cursor-pointer" disabled={loading}>
                            {
                                loading ? <><Spinner /> Loading...</>
                                    : <><LogInIcon /> Sign In</>
                            }
                        </Button>
                    </form>

                    <div className="flex gap-8 w-full items-center justify-center mt-6">
                        <Link to="/auth/forgot-password" className="text-sm text-center flex gap-2 items-center hover:underline">
                            <HelpCircleIcon size={16} /> Forgot Password
                        </Link>
                        <Link to="/auth/signup" className="text-sm text-center flex gap-2 items-center hover:underline">
                            <UserPlus2Icon size={16} /> Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
