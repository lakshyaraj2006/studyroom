import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
    const [showTop, setShowTop] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setShowTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative border-t border-border/40 bg-background transition-colors duration-300">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">

                {/* Brand */}
                <div>
                    <h3 className="text-xl font-bold bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                        StudyRoom
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Find the perfect study environment to stay focused and productive. Explore quiet spaces near you.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-16 justify-start md:justify-center">
                    <div>
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">Company</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/about")}>About</li>
                            <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/rooms")}>Rooms</li>
                            <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/contact")}>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-4">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/privacy")}>Privacy</li>
                            <li className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/terms")}>Terms</li>
                        </ul>
                    </div>
                </div>

                {/* Map */}
                <div className="w-full h-[180px] rounded-xl overflow-hidden border border-border/50 shadow-inner">
                    <iframe
                        title="map"
                        src="https://www.google.com/maps?q=Bhubaneswar&output=embed"
                        className="w-full h-full border-0 filter grayscale dark:invert dark:opacity-85"
                        loading="lazy"
                    />
                </div>

            </div>

            {/* Bottom */}
            <div className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} StudyRoom. All rights reserved.
            </div>

            {/* Back to Top */}
            {showTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer z-50"
                    aria-label="Back to top"
                >
                    <ArrowUp size={18} />
                </button>
            )}

        </footer>
    );
}