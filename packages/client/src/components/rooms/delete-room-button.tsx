import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2Icon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/api";
import { Button } from "@/components/ui/button";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

type DeleteRoomButtonProps = {
    roomId: string;
    authToken: string;
};

export default function DeleteRoomButton({
    roomId,
    authToken
}: DeleteRoomButtonProps) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            await axiosInstance.delete(`/rooms/delete/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            toast.success("Room deleted successfully");
            navigate("/rooms");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to delete room"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                >
                    <Trash2Icon className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    Delete Room
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="sm:max-w-md rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold text-red-600">
                        Delete this room?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        This action cannot be undone. All room data,
                        discussions, and associated content will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 rounded-xl"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2Icon className="w-4 h-4 mr-2" />
                                Delete Room
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}