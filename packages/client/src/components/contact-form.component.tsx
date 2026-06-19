import { useState } from "react";
import axiosInstance from "@/lib/api";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Mail, Send, User, MessageSquare, Tag } from "lucide-react";

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields!");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post("/contact", formData);
            if (response.data?.success) {
                toast.success(response.data.message || "Message sent successfully!");
                setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: ""
                });
            } else {
                toast.error(response.data?.message || "Failed to send message.");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Something went wrong.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-border/40 bg-card/70 backdrop-blur-md shadow-xl rounded-2xl p-2 md:p-6 transition-colors duration-300">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-primary w-6 h-6" /> Send Message
                </CardTitle>
                <CardDescription className="text-xs">
                    Send us a message and our support team will get back to you shortly.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <User size={13} /> Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Mail size={13} /> Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={13} /> Subject
                        </Label>
                        <Input
                            type="text"
                            id="subject"
                            name="subject"
                            placeholder="What is this inquiry about?"
                            value={formData.subject}
                            onChange={handleChange}
                            className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare size={13} /> Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Write your message here..."
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className="rounded-xl border-border/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 resize-none"
                            required
                        />
                    </div>

                    <Button
                        id="contact-submit-btn"
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 cursor-pointer rounded-xl font-semibold shadow-md shadow-primary/10 hover:shadow-primary/25 active:scale-95 transition-all duration-300 mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner /> Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={16} /> Send Message
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
