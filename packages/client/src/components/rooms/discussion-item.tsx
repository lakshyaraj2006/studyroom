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
        <div className={`flex w-full ${isAuthor ? "justify-end" : "justify-start"}`}>
            <div
                className={`flex gap-3 max-w-[80%] items-start ${
                    isAuthor ? "flex-row-reverse" : ""
                }`}
            >
                {/* Avatar */}
                <Avatar className="h-9 w-9 shrink-0 border border-slate-100 shadow-xs">
                    <AvatarImage src={item.user.avatar || "/user.png"} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-xs">
                        {item.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Content Area (Bubble) */}
                <div
                    className={`flex-1 p-3 rounded-2xl border transition-all duration-200 min-w-0 ${
                        isAuthor
                            ? "bg-indigo-50/70 border-indigo-100/80 rounded-tr-none shadow-2xs"
                            : "bg-white border-slate-100 rounded-tl-none shadow-2xs"
                    }`}
                >
                    <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-dashed border-slate-100/50">
                        <div className={`flex items-baseline gap-1.5 min-w-0 ${isAuthor ? "flex-row-reverse" : ""}`}>
                            <span className="text-xs font-bold text-slate-800 truncate">
                                {item.user.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate font-mono">
                                @{item.user.handle}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] text-slate-400">
                                {formatRelativeTime(item.createdAt)}
                            </span>
                            {item.isEdited && (
                                <span className="text-[8px] text-indigo-500 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded-full font-medium">
                                    edited
                                </span>
                            )}

                            {/* Actions Dropdown */}
                            {currentUserId && (isAuthor || canDelete) && !isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <MoreVerticalIcon className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isAuthor ? "start" : "end"} className="w-32 bg-white border border-slate-100 shadow-md rounded-xl">
                                        {isAuthor && (
                                            <DropdownMenuItem
                                                onClick={handleStartEdit}
                                                className="gap-2 text-xs text-slate-600 cursor-pointer hover:bg-slate-50 rounded-lg m-1"
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
                                className="w-full text-xs min-h-[50px] bg-slate-50/50 border-slate-200 focus:border-indigo-500 rounded-lg p-2 resize-none text-slate-700 leading-relaxed"
                                disabled={loading}
                            />
                            <div className="flex gap-1.5 justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-7 px-2.5 text-[11px] cursor-pointer rounded-lg border-slate-200"
                                    disabled={loading}
                                >
                                    <XIcon className="h-3 w-3 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="h-7 px-2.5 text-[11px] cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
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
                        <p className="text-sm text-slate-700 leading-relaxed break-words font-normal whitespace-pre-wrap">
                            {item.content}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
