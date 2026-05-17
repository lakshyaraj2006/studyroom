import { NavLink, useNavigate } from "react-router-dom";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { LogInIcon, Building2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
        <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md">
            <div className="flex h-18 items-center justify-between px-6">

                {/* Left */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>

                    <NavLink
                        to="/"
                        className="flex items-center gap-2 text-lg font-semibold"
                    >
                        <Building2 size={20} className="text-indigo-500" />
                        <div>
                            <span>Study</span>
                            <span className="text-indigo-500">Room</span>
                        </div>
                    </NavLink>
                </div>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-7">
                    {navLinks.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.href}
                            className={({ isActive }) =>
                                [
                                    "text-sm font-medium transition relative",
                                    isActive
                                        ? "text-foreground"
                                        : "text-foreground/60 hover:text-foreground"
                                ].join(" ")
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-3">
                    {authToken ? (
                        <UserDropdown />
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => navigate("/auth/signin")}
                            className="flex items-center gap-2"
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