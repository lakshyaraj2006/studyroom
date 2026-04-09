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
        <footer className="relative border-t bg-background">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">

                {/* Brand */}
                <div>
                    <h3 className="text-lg font-semibold">
                        Study<span className="text-indigo-500">Room</span>
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                        Find the perfect study environment to stay focused and productive.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-12">
                    <div>
                        <h4 className="text-sm font-medium mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/about")}>About</li>
                            <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/rooms")}>Rooms</li>
                            <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/contact")}>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/privacy")}>Privacy</li>
                            <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/terms")}>Terms</li>
                        </ul>
                    </div>
                </div>

                {/* Map */}
                <div className="w-full h-[200px] rounded-xl overflow-hidden border">
                    <iframe
                        title="map"
                        src="https://www.google.com/maps?q=Bhubaneswar&output=embed"
                        className="w-full h-full border-0"
                        loading="lazy"
                    />
                </div>

            </div>

            {/* Bottom */}
            <div className="border-t py-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} StudyRoom. All rights reserved.
            </div>

            {/* Back to Top */}
            {showTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:scale-105 transition"
                >
                    <ArrowUp size={18} />
                </button>
            )}

        </footer>
    );
}