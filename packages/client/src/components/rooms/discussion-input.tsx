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
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[44px] max-h-[120px] bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 resize-none text-sm leading-relaxed"
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
                className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shrink-0"
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
