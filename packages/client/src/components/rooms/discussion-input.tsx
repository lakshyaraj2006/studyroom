import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, SendIcon } from "lucide-react";

interface DiscussionInputProps {
    onSend: (content: string) => Promise<void>;
}

export default function DiscussionInput({ onSend }: DiscussionInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSend(message);
            setMessage("");
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex gap-2 items-end">
            <Textarea
                placeholder="Write a message in the study hall..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[44px] max-h-[120px] bg-[#f8fafc] dark:bg-[#0f172a]/40 border border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary text-foreground placeholder-muted-foreground/60 rounded-xl py-3 px-4 resize-none text-sm leading-relaxed"
                disabled={sending}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <Button
                size="icon"
                onClick={handleSend}
                className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shrink-0 transition duration-150 active:scale-95 shadow-sm shadow-primary/10"
                disabled={sending || !message.trim()}
            >
                {sending ? (
                    <Loader2Icon className="animate-spin h-4 w-4" />
                ) : (
                    <SendIcon className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
