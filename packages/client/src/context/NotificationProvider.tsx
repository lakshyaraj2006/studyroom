import React, { createContext, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { type INotification } from "@/interfaces/notification";
import { toast } from "sonner";

export interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    fetchNotifications: (page?: number, limit?: number) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider = ({ children }: React.PropsWithChildren) => {
    const { authToken } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const previousPathRef = useRef<string>("");
    const socketRef = useRef<Socket | null>(null);

    const openModal = () => {
        previousPathRef.current = window.location.pathname + window.location.search;
        setIsModalOpen(true);
        window.history.pushState({ isNotificationsModal: true }, "", "/notifications");
    };

    const closeModal = () => {
        if (isModalOpen) {
            setIsModalOpen(false);
            if (window.history.state?.isNotificationsModal) {
                window.history.back();
            } else if (previousPathRef.current && previousPathRef.current !== "/notifications") {
                window.history.pushState(null, "", previousPathRef.current);
            } else {
                window.history.pushState(null, "", "/");
            }
        }
    };

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (isModalOpen) {
                setIsModalOpen(false);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isModalOpen]);

    const fetchNotifications = async (page = 1, limit = 20) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const response = await axiosPrivate.get(`/notifications?page=${page}&limit=${limit}`);
            if (response.data?.success) {
                const fetched = response.data.data.notifications;
                setNotifications(fetched);
                // Count unread
                const unread = fetched.filter((n: INotification) => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axiosPrivate.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosPrivate.patch("/notifications/read-all");
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const item = notifications.find(n => n._id === id);
            await axiosPrivate.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (item && !item.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    // Socket Connection Management
    useEffect(() => {
        if (!authToken) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Fetch notifications first
        fetchNotifications();

        const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
        const socket = io(socketUrl, {
            transports: ["websocket"],
            auth: {
                token: authToken
            }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to notification namespace");
        });

        // Real-time events
        socket.on("notification:new", (newNotification: INotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show a visual toast notification using Sonner
            toast(newNotification.title, {
                description: newNotification.message,
                action: {
                    label: "View",
                    onClick: () => {
                        // Mark as read and optionally navigate
                        markAsRead(newNotification._id);
                        if (newNotification.room_id) {
                            window.location.href = `/rooms/${newNotification.room_id._id}`;
                        }
                    }
                }
            });
        });

        socket.on("notification:read", ({ notificationId }: { notificationId: string }) => {
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        });

        socket.on("notification:read_all", () => {
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        });

        socket.on("notification:delete", ({ notificationId }: { notificationId: string }) => {
            setNotifications(prev => {
                const item = prev.find(n => n._id === notificationId);
                const updated = prev.filter(n => n._id !== notificationId);
                if (item && !item.isRead) {
                    setUnreadCount(count => Math.max(0, count - 1));
                }
                return updated;
            });
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from notification namespace");
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [authToken]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            isModalOpen,
            openModal,
            closeModal,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
