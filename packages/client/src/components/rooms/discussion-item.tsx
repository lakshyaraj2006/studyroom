import { useState } from "react";
import { type IDiscussion } from "@/interfaces/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    MoreVerticalIcon,
    Edit2Icon,
    Trash2Icon,
    XIcon,
    CheckIcon,
    Loader2Icon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiscussionItemProps {
    item: IDiscussion;
    currentUserId?: string;
    isRoomCreator: boolean;
    onSave: (discussionId: string, newContent: string) => Promise<void>;
    onDelete: (discussionId: string) => Promise<void>;
}

const formatRelativeTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    } catch {
        return "";
    }
};

export default function DiscussionItem({
    item,
    currentUserId,
    isRoomCreator,
    onSave,
    onDelete
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

    return (
        <div className={`flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${isAuthor ? "justify-end" : "justify-start"}`}>
            <div
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] items-end ${isAuthor ? "flex-row-reverse" : ""
                    }`}
            >
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0 border border-border/40 shadow-xs mb-1">
                    <AvatarImage src={item.user.avatar || "/user.png"} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-[10px]">
                        {item.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Content Area (Bubble) */}
                <div
                    className={`flex-1 p-3.5 rounded-2xl border transition-all duration-200 min-w-0 shadow-xs hover:shadow-md hover:shadow-primary/5 ${isAuthor
                            ? "bg-linear-to-br from-primary/12 to-primary/5 border-primary/20 rounded-br-xs text-foreground"
                            : "bg-card border-border/50 rounded-bl-xs text-foreground"
                        }`}
                >
                    <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-dashed border-border/30">
                        <div className={`flex items-baseline gap-1.5 min-w-0 ${isAuthor ? "flex-row-reverse" : ""}`}>
                            <span className="text-xs font-semibold text-foreground truncate">
                                {item.user.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground/75 truncate font-mono">
                                @{item.user.handle}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-muted-foreground/60">
                                {formatRelativeTime(item.createdAt)}
                            </span>
                            {item.isEdited && (
                                <span className="text-[8px] text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.2 rounded-full font-medium shrink-0">
                                    edited
                                </span>
                            )}

                            {/* Actions Dropdown (Only visible on hover to clean up layout) */}
                            {currentUserId && (isAuthor || canDelete) && !isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            <MoreVerticalIcon className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isAuthor ? "start" : "end"} className="w-32 bg-popover border border-border/40 shadow-md rounded-xl text-popover-foreground">
                                        {isAuthor && (
                                            <DropdownMenuItem
                                                onClick={handleStartEdit}
                                                className="gap-2 text-xs text-foreground cursor-pointer hover:bg-muted rounded-lg m-1"
                                            >
                                                <Edit2Icon className="h-3.5 w-3.5" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {canDelete && (
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item._id)}
                                                className="gap-2 text-xs text-rose-600 focus:text-rose-600 cursor-pointer hover:bg-rose-50 rounded-lg m-1"
                                            >
                                                <Trash2Icon className="h-3.5 w-3.5" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>

                    {/* Message Body */}
                    {isEditing ? (
                        <div className="space-y-2 pt-1">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full text-xs min-h-[50px] bg-muted/30 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg p-2 resize-none text-foreground leading-relaxed"
                                disabled={loading}
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
                                    className="h-7 px-2.5 text-[11px] cursor-pointer rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
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
                        <p className="text-sm text-foreground leading-relaxed break-words font-normal whitespace-pre-wrap">
                            {item.content}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
