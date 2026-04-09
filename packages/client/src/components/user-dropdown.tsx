import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import useLogout from "@/hooks/useLogout";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { User, LogOut, ChevronDown } from "lucide-react";

export function UserDropdown() {
    const { usrInfo } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    if (!usrInfo) return null;

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Signed out successfully");
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error("Error signing out");
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-2 py-1 border shadow-md">

                    <Avatar className="inline-flex w-10 h-10 rounded-full overflow-hidden">
                        <AvatarImage
                            src={usrInfo?.avatar || "/user.png"}
                            className="w-full h-full object-cover"
                        />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>

                    <span className="text-sm font-medium max-w-30 truncate">
                        {usrInfo?.username || "User"}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-48 p-2 rounded-xl shadow-lg border"
                align="end"
            >
                <DropdownMenuItem
                    onClick={() => navigate(`/profile/${usrInfo?.handle}`)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer"
                >
                    <User size={16} />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer"
                >
                    <LogOut size={16} />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}