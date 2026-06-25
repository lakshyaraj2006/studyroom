import { useAuth } from "@/hooks/useAuth";
import { type ServerResponse } from "@/interfaces/server-response";
import axiosInstance from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { AxiosError } from "axios";
import { Spinner } from "../ui/spinner";
import useLogout from "@/hooks/useLogout";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type DeleteProfileComponentProps = {
    email: string,
    getUsrProfile: () => Promise<void>
}

export default function DeleteProfileComponent({email, getUsrProfile}: DeleteProfileComponentProps) {
    const {authToken} = useAuth();
    const [deleteCode, setDeleteCode] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<"send-code" | "enter-code" | null>(null);
    const logout = useLogout();

    const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteCode(e.target.value);
    }

    const handleDeleteClick = async () => {
        setLoading("send-code");
        try {
            const response = await axiosInstance.post<ServerResponse<null>>('/profile/delete-code', {email}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const {success, message} = response.data;

            success ? toast.success(message) : toast.error(message);
            
            if (success) {
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to send code")
            } else {
                toast.error("Failed to send code")
            }
        } finally {
            setLoading(null);
        }
    }

    const handleConfirmDelete = async () => {
        setLoading("enter-code");
        try {
            const response = await axiosInstance.post<ServerResponse<null>>('/profile/delete-confirm', {code: deleteCode}, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const {success, message} = response.data;

            success ? toast.success(message) : toast.error(message);
            
            if (success) {
                await logout();

                setDeleteDialogOpen(false);
                setDeleteCode(null);
                await getUsrProfile();
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Failed to verify code")
            } else {
                toast.error("Failed to verify code")
            }
        } finally {
            setLoading(null);
        }
    }

    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2 cursor-pointer shadow-sm" disabled={loading !== null}>
                        <AlertTriangle className="w-4 h-4" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="w-5 h-5" />
                            Irreversible Action
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure you want to delete your profile? This will permanently erase your data and cannot be undone. We will send a confirmation code to <span className="font-semibold text-foreground">{email}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteClick}
                            className="!bg-destructive !text-white hover:!bg-destructive/90 cursor-pointer"
                        >
                            {loading === "send-code" ? <><Spinner className="mr-2" /> Sending Code...</> : "Send Verification Code"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDeleteCode(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verification Code Sent</DialogTitle>
                        <DialogDescription>
                            Please enter the 8-character verification code sent to your email to finalize account deletion.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleConfirmDelete(); }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="deleteCode" className="text-sm font-semibold">Verification Code</Label>
                            <Input 
                                type="text" 
                                name="deleteCode" 
                                id="deleteCode" 
                                placeholder="Enter code" 
                                value={deleteCode || ""} 
                                onChange={handleCodeInputChange}
                                className="font-mono tracking-widest text-center text-lg h-11"
                                maxLength={8}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={loading !== null}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="destructive" 
                                disabled={loading !== null || !deleteCode}
                                className="!bg-destructive !text-white hover:!bg-destructive/90 cursor-pointer"
                            >
                                {
                                    loading && loading === "enter-code"
                                    ? <><Spinner className="mr-2" /> Deleting...</>
                                    : <>Permanently Delete Account</>
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}