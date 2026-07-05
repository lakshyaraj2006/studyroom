import { useState } from "react";
import { type IDiscussion } from "@/interfaces/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Edit2Icon,
    Trash2Icon,
    XIcon,
    CheckIcon,
    Loader2Icon
} from "lucide-react";

interface DiscussionItemProps {
    item: IDiscussion;
    currentUserId?: string;
    isRoomCreator: boolean;
    onSave: (discussionId: string, newContent: string) => Promise<void>;
    onDelete: (discussionId: string) => Promise<void>;
    isGrouped?: boolean;
    senderActive?: boolean;
}

const formatAbsoluteTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return "";
    }
};

const formatFullDateTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Today at ${timeStr}`;
        if (isYesterday) return `Yesterday at ${timeStr}`;
        
        return `${date.toLocaleDateString()} ${timeStr}`;
    } catch {
        return "";
    }
};

export default function DiscussionItem({
    item,
    currentUserId,
    isRoomCreator,
    onSave,
    onDelete,
    isGrouped = false,
    senderActive = false
}: DiscussionItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);
    const [loading, setLoading] = useState(false);

    const isAuthor = currentUserId === item.user._id;
    const canDelete = isAuthor || isRoomCreator;

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditContent(item.content);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(item.content);
    };

    const handleSave = async () => {
        if (!editContent.trim()) return;
        setLoading(true);
        try {
            await onSave(item._id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save edit", error);
        } finally {
            setLoading(false);
        }
    };

    if (isGrouped && !isEditing) {
        // Grouped (compact) cozy study layout
        return (
            <div className="group relative flex items-start py-0.5 hover:bg-slate-100/40 dark:hover:bg-slate-900/30 px-4 transition-colors duration-100 min-w-0">
                {/* Left side: Time hover display (aligned with avatar position) */}
                <div className="w-9 shrink-0 select-none text-[9px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center font-mono h-5 mt-0.5">
                    {formatAbsoluteTime(item.createdAt)}
                </div>

                {/* Right side: message content */}
                <div className="flex-1 min-w-0 pl-3">
                    <p className="text-sm text-foreground/90 leading-relaxed break-words font-normal whitespace-pre-wrap">
                        {item.content}
                        {item.isEdited && (
                            <span className="text-[9px] text-muted-foreground/60 ml-1.5 font-medium select-none" title="Edited message">
                                (edited)
                            </span>
                        )}
                    </p>
                </div>

                {/* Hover actions toolbar */}
                {currentUserId && (isAuthor || canDelete) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-0.5 bg-card border border-border/40 rounded-lg shadow-xs p-0.5 z-10 shrink-0">
                        {isAuthor && (
                            <button
                                onClick={handleStartEdit}
                                className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition"
                                title="Edit message"
                            >
                                <Edit2Icon className="h-3 w-3" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => onDelete(item._id)}
                                className="h-6 w-6 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 flex items-center justify-center cursor-pointer transition"
                                title="Delete message"
                            >
                                <Trash2Icon className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }



    // Standard (full) cozy study layout
    return (
        <div className="group relative flex items-start pt-3 pb-0.5 hover:bg-slate-100/40 dark:hover:bg-slate-900/30 px-4 transition-colors duration-100 min-w-0">
            {/* Left side: Avatar */}
            <div className="w-9 shrink-0 flex items-start justify-center pt-0.5">
                <div className="relative">
                    <Avatar className="h-8 w-8 cursor-pointer select-none ring-2 ring-primary/10">
                        <AvatarImage src={item.user.avatar || "/user.png"} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {item.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border border-white dark:border-slate-950 ${
                        senderActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    }`} />
                </div>
            </div>

            {/* Right side: Header & Body */}
            <div className="flex-1 min-w-0 pl-3 flex flex-col">
                {/* Header Info */}
                <div className="flex items-baseline gap-2 mb-0.5 select-none">
                    <span className="text-xs font-semibold text-foreground hover:underline cursor-pointer">
                        {item.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate font-mono">
                        @{item.user.handle}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-medium ml-1">
                        {formatFullDateTime(item.createdAt)}
                    </span>
                </div>

                {/* Body or Edit Field */}
                {isEditing ? (
                    <div className="space-y-1.5 pt-1.5 max-w-2xl">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full text-sm min-h-[50px] bg-slate-50 dark:bg-slate-900/30 border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-2 resize-none text-foreground leading-relaxed"
                            disabled={loading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                }
                            }}
                        />
                        <div className="flex gap-1.5 justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-7 px-2.5 text-[11px] cursor-pointer rounded-lg border-border"
                                disabled={loading}
                            >
                                <XIcon className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className="h-7 px-2.5 text-[11px] cursor-pointer rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-medium"
                                disabled={loading || !editContent.trim()}
                            >
                                {loading ? (
                                    <Loader2Icon className="animate-spin h-3 w-3 mr-1" />
                                ) : (
                                    <CheckIcon className="h-3 w-3 mr-1" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground/90 leading-relaxed break-words font-normal whitespace-pre-wrap">
                        {item.content}
                        {item.isEdited && (
                            <span className="text-[9px] text-muted-foreground/60 ml-1.5 font-medium select-none" title="Edited message">
                                (edited)
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* Hover actions toolbar */}
            {currentUserId && (isAuthor || canDelete) && !isEditing && (
                <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-0.5 bg-card border border-border/40 rounded-lg shadow-xs p-0.5 z-10 shrink-0">
                    {isAuthor && (
                        <button
                            onClick={handleStartEdit}
                            className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition"
                            title="Edit message"
                        >
                            <Edit2Icon className="h-3 w-3" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(item._id)}
                            className="h-6 w-6 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 flex items-center justify-center cursor-pointer transition"
                            title="Delete message"
                        >
                            <Trash2Icon className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
