import { NavLink, useNavigate } from "react-router-dom";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { LogInIcon, Building2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

export const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Rooms", href: "/rooms" },
    { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
    const { authToken } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-300">
            <div className="flex h-16 items-center justify-between px-6">

                {/* Left */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>

                    <NavLink
                        to="/"
                        className="flex items-center gap-2 text-lg font-bold tracking-tight transition-transform active:scale-95"
                    >
                        <Building2 size={20} className="text-primary animate-pulse" />
                        <div className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                            StudyRoom
                        </div>
                    </NavLink>
                </div>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.href}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors relative py-1.5 ${
                                    isActive
                                        ? "text-primary"
                                        : "text-foreground/70 hover:text-foreground"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {authToken ? (
                        <UserDropdown />
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => navigate("/auth/signin")}
                            className="flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all"
                        >
                            <LogInIcon size={16} />
                            <span>Sign In</span>
                        </Button>
                    )}
                </div>

            </div>
        </header>
    );
}