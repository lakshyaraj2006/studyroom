import { Mail, MapPin, Clock } from "lucide-react";
import SEO from "@/components/seo.component";
import ContactForm from "@/components/contact-form.component";

export default function ContactPage() {
    return (
        <div className="min-h-screen relative py-12 px-4 md:px-6 bg-background transition-colors duration-300 overflow-hidden flex flex-col items-center justify-center">
            <SEO
                title="Contact Us"
                description="Get in touch with the StudyRoom support team for general inquiries, feedback, or technical assistance."
                keywords="contact us, support, feedback, studyroom support, contact form"
            />

            {/* Background Glow Decors */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-[180px] md:w-[300px] h-[180px] bg-indigo-500/5 rounded-full blur-[70px] pointer-events-none" />

            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Contact Information Sidebar */}
                <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide w-fit">
                            <span>Customer Support</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent leading-tight font-semibold">
                            Get in Touch
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                            Have questions about booking rooms, hosting discussions, or need help with your account? Fill out the form or write to us directly.
                        </p>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-border/40">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Email Us</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">We respond within 24 hours.</p>
                                <a href="mailto:admin.studyroom@gmail.com" className="text-sm font-medium text-primary hover:underline mt-1 block">
                                    admin.studyroom@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Location</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Bhubaneswar, India</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Support Hours</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Monday - Friday: 9:00 AM - 6:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form Card Component */}
                <div className="lg:col-span-2">
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
