import { useNotifications } from "@/hooks/useNotifications";
import { NotificationType } from "@/interfaces/notification";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = async (id: string, roomId?: string, type?: NotificationType) => {
        await markAsRead(id);
        if (roomId && type !== NotificationType.ROOM_INVITE) {
            navigate(`/rooms/${roomId}`);
        }
    };

    const getNotificationStyles = (type: NotificationType) => {
        switch (type) {
            case NotificationType.ROOM_INVITE:
                return {
                    icon: <Mail className="h-5 w-5 text-blue-500" />,
                    bg: "bg-blue-500/10 border-blue-500/20",
                };
            case NotificationType.ROOM_INVITE_ACCEPTED:
                return {
                    icon: <UserCheck className="h-5 w-5 text-emerald-500" />,
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                };
            case NotificationType.ROOM_INVITE_REJECTED:
                return {
                    icon: <UserX className="h-5 w-5 text-rose-500" />,
                    bg: "bg-rose-500/10 border-rose-500/20",
                };
            case NotificationType.USER_JOINED_ROOM:
                return {
                    icon: <UserPlus className="h-5 w-5 text-teal-500" />,
                    bg: "bg-teal-500/10 border-teal-500/20",
                };
            case NotificationType.USER_BLOCKED:
                return {
                    icon: <Ban className="h-5 w-5 text-red-500" />,
                    bg: "bg-red-500/10 border-red-500/20",
                };
            case NotificationType.USER_UNBLOCKED:
                return {
                    icon: <LockOpen className="h-5 w-5 text-orange-500" />,
                    bg: "bg-orange-500/10 border-orange-500/20",
                };
            case NotificationType.NEW_DISCUSSION:
                return {
                    icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
                    bg: "bg-indigo-500/10 border-indigo-500/20",
                };
            default:
                return {
                    icon: <Bell className="h-5 w-5 text-muted-foreground" />,
                    bg: "bg-muted/10 border-muted/20",
                };
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                <span className="text-sm text-muted-foreground mt-4">Loading notifications...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                {unreadCount} new
                            </Badge>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your room invitations, discussion alerts, and activities.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={() => markAllAsRead()}
                        variant="outline"
                        className="self-start sm:self-center gap-2 hover:bg-indigo-500/5 text-indigo-600 border-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-700 cursor-pointer rounded-lg h-9 text-xs px-3"
                    >
                        <Check className="h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl min-h-[350px] bg-muted/10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
                        <Bell className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground/80">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                        When other users invite you to rooms or start discussions, they'll show up here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((item) => {
                        const styles = getNotificationStyles(item.type);
                        return (
                            <Card
                                key={item._id}
                                onClick={() => handleNotificationClick(item._id, item.room_id?._id, item.type)}
                                className={`relative transition-all duration-200 border hover:border-indigo-500/30 hover:shadow-md cursor-pointer overflow-hidden ${
                                    !item.isRead ? "bg-indigo-500/[0.01] border-indigo-500/10 shadow-sm" : ""
                                }`}
                            >
                                <CardContent className="p-5 flex gap-4">
                                    {/* Unread indicator bar */}
                                    {!item.isRead && (
                                        <span className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500" />
                                    )}

                                    {/* Avatar / Icon */}
                                    <div className="flex-shrink-0">
                                        {item.sender?.avatar ? (
                                            <Avatar className="h-10 w-10 border shadow-sm">
                                                <AvatarImage
                                                    src={item.sender.avatar}
                                                    className="object-cover h-full w-full"
                                                />
                                                <AvatarFallback>
                                                    {item.sender.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm ${styles.bg}`}>
                                                {styles.icon}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-1 pr-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                            <h3 className="font-semibold text-sm text-foreground/90 leading-tight">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            {item.message}
                                        </p>

                                        {/* Invitation actions */}
                                        {item.type === NotificationType.ROOM_INVITE && item.room_id?._id && item.metadata?.inviteToken && (
                                            <div className="flex items-center gap-3 mt-3.5" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        markAsRead(item._id);
                                                        navigate(`/rooms/accept-invite/${item.room_id?._id}/${item.metadata?.inviteToken}`);
                                                    }}
                                                    className="h-8 text-xs px-4 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm rounded-lg"
                                                >
                                                    Accept Invitation
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        markAsRead(item._id);
                                                        navigate(`/rooms/reject-invite/${item.room_id?._id}/${item.metadata?.inviteToken}`);
                                                    }}
                                                    className="h-8 text-xs px-4 hover:bg-muted cursor-pointer rounded-lg"
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(item._id);
                                        }}
                                        className="absolute right-3 top-3 h-8 w-8 rounded-full opacity-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 flex items-center justify-center cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
