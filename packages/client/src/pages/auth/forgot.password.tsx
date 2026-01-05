import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
    const [mode, setMode] = useState<"enter-email" | "reset-password">("enter-email");
    const [email, setEmail] = useState("");
    const [resetData, setResetData] = useState({
        code: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setMode("reset-password");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, ...resetData });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-center">
                        Forgot Password
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {mode === "enter-email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email">Email</label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Submit Email
                            </Button>
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
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        placeholder="Enter new password"
                                        value={resetData.password}
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

                            <Button type="submit" className="w-full">
                                Reset Password
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
