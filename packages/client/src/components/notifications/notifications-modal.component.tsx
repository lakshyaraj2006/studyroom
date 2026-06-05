import { useNotifications } from "@/hooks/useNotifications";
import { NotificationType } from "@/interfaces/notification";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Bell,
    Check,
    Trash2,
    Mail,
    UserCheck,
    UserX,
    UserPlus,
    Ban,
    LockOpen,
    MessageSquare,
    Clock
} from "lucide-react";

export function NotificationsModal() {
    const {
        notifications,
        unreadCount,
        isModalOpen,
        closeModal,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = async (id: string, roomId?: string, type?: NotificationType) => {
        await markAsRead(id);
        if (roomId && type !== NotificationType.ROOM_INVITE) {
            closeModal();
            setTimeout(() => {
                navigate(`/rooms/${roomId}`);
            }, 150);
        }
    };

    const getNotificationStyles = (type: NotificationType) => {
        switch (type) {
            case NotificationType.ROOM_INVITE:
                return {
                    icon: <Mail className="h-4 w-4 text-blue-500" />,
                    bg: "bg-blue-500/10 border-blue-500/20",
                };
            case NotificationType.ROOM_INVITE_ACCEPTED:
                return {
                    icon: <UserCheck className="h-4 w-4 text-emerald-500" />,
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                };
            case NotificationType.ROOM_INVITE_REJECTED:
                return {
                    icon: <UserX className="h-4 w-4 text-rose-500" />,
                    bg: "bg-rose-500/10 border-rose-500/20",
                };
            case NotificationType.USER_JOINED_ROOM:
                return {
                    icon: <UserPlus className="h-4 w-4 text-teal-500" />,
                    bg: "bg-teal-500/10 border-teal-500/20",
                };
            case NotificationType.USER_BLOCKED:
                return {
                    icon: <Ban className="h-4 w-4 text-red-500" />,
                    bg: "bg-red-500/10 border-red-500/20",
                };
            case NotificationType.USER_UNBLOCKED:
                return {
                    icon: <LockOpen className="h-4 w-4 text-orange-500" />,
                    bg: "bg-orange-500/10 border-orange-500/20",
                };
            case NotificationType.NEW_DISCUSSION:
                return {
                    icon: <MessageSquare className="h-4 w-4 text-indigo-500" />,
                    bg: "bg-indigo-500/10 border-indigo-500/20",
                };
            default:
                return {
                    icon: <Bell className="h-4 w-4 text-muted-foreground" />,
                    bg: "bg-muted/10 border-muted/20",
                };
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-md border rounded-2xl shadow-xl">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/20 flex flex-row items-center justify-between text-left sm:text-left gap-2">
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-semibold text-[11px] px-2 py-0.5">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            Your activities, invitations, and discussion feeds.
                        </DialogDescription>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllAsRead()}
                            className="h-8 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer gap-1 px-2 hover:bg-indigo-500/5 rounded-md self-center mr-8"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </DialogHeader>

                <ScrollArea className="h-[400px] w-full">
                    {notifications.length === 0 ? (
                        <div className="flex h-[350px] flex-col items-center justify-center p-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/40 mb-3">
                                <Bell className="h-7 w-7 text-muted-foreground/60" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground/80">All caught up!</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Real-time activities and room invites will show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((item) => {
                                const styles = getNotificationStyles(item.type);
                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => handleNotificationClick(item._id, item.room_id?._id, item.type)}
                                        className={`group relative flex gap-3 p-4 transition-colors hover:bg-muted/40 cursor-pointer ${
                                            !item.isRead ? "bg-indigo-500/[0.02]" : ""
                                        }`}
                                    >
                                        {!item.isRead && (
                                            <span className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                        )}

                                        <div className="relative flex-shrink-0">
                                            {item.sender?.avatar ? (
                                                <Avatar className="h-9 w-9 rounded-full overflow-hidden border shadow-sm">
                                                    <AvatarImage
                                                        src={item.sender.avatar}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <AvatarFallback>
                                                        {item.sender.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm ${styles.bg}`}>
                                                    {styles.icon}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1 pr-6">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold text-xs text-foreground/90 leading-tight">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {item.message}
                                            </p>

                                            {item.type === NotificationType.ROOM_INVITE && item.room_id?._id && item.metadata?.inviteToken && (
                                                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            markAsRead(item._id);
                                                            closeModal();
                                                            setTimeout(() => {
                                                                navigate(`/rooms/accept-invite/${item.room_id?._id}/${item.metadata?.inviteToken}`);
                                                            }, 150);
                                                        }}
                                                        className="h-7 text-[11px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer rounded-lg"
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            markAsRead(item._id);
                                                            closeModal();
                                                            setTimeout(() => {
                                                                navigate(`/rooms/reject-invite/${item.room_id?._id}/${item.metadata?.inviteToken}`);
                                                            }, 150);
                                                        }}
                                                        className="h-7 text-[11px] px-3 hover:bg-muted cursor-pointer rounded-lg"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground/80">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(item._id);
                                            }}
                                            className="absolute right-2 top-2 h-7 w-7 rounded-full opacity-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group-hover:opacity-100 cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
export default NotificationsModal;
