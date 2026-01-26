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

type DeleteProfileComponentProps = {
    email: string,
    getUsrProfile: () => Promise<void>
}

export default function DeleteProfileComponent({email, getUsrProfile}: DeleteProfileComponentProps) {
    const {authToken} = useAuth();
    const [deleteCode, setDeleteCode] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [loading, setLoading]= useState<"send-code" | "enter-code" | null>(null);
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

    const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (window.confirm("This action is irreversible!!! Are you sure ?")) {
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
    }

    return (
        <>
            <Button variant="destructive" disabled={loading !== null} onClick={handleDeleteClick}>
                {loading === "send-code" && <><Spinner /> Sending Code...</>}
                {loading === "enter-code" && <><Spinner /> Deleting Account...</>}
                {!loading && <>Delete Account</>}
            </Button>
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={() => {
                    setDeleteDialogOpen(!deleteDialogOpen);
                    if (!deleteDialogOpen) setDeleteCode(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmation Code</DialogTitle>
                        <DialogDescription hidden>Confirmation Code to delete account</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCodeSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="deleteCode">Code</Label>
                            <Input type="text" name="deleteCode" id="deleteCode" placeholder="Enter code to confirm delete" value={deleteCode || ""} onChange={handleCodeInputChange}/>
                        </div>

                        <Button variant="destructive" disabled={loading !== null}>
                            {
                                loading && loading === "enter-code"
                                ? <><Spinner /> Deleting Account...</>
                                : <>Delete Account</>
                            }
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}