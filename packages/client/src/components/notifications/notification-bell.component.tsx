import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export function NotificationBell() {
    const { unreadCount, openModal } = useNotifications();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => openModal()}
            className="relative rounded-full hover:bg-muted/50 cursor-pointer"
            title="Notifications"
        >
            <Bell className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
                <Badge
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 p-0 text-[10px] text-white animate-pulse border-2 border-background"
                >
                    {unreadCount}
                </Badge>
            )}
        </Button>
    );
}
