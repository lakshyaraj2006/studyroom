import { useRef, useState } from "react"
import axiosInstance from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Trash2Icon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { AxiosError } from "axios"
import type { ServerResponse } from "@/interfaces/server-response"
import { useAuth } from "@/hooks/useAuth"

type AvatarAction = "upload" | "remove" | null

interface ProfileAvatarProps {
    avatar?: string | null
    isOwnProfile: boolean
    isEditing: boolean
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    onUpdated: () => void
}

export default function ProfileAvatar({
    avatar,
    isOwnProfile,
    isEditing,
    setIsEditing,
    onUpdated,
}: ProfileAvatarProps) {
    const { authToken, setUsrInfo } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatarAction, setAvatarAction] = useState<AvatarAction>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        try {
            setAvatarAction("upload")

            const response = await axiosInstance.post<ServerResponse<{avatar: string | undefined}>>(
                "/profile/upload-avatar",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )

            const { success, message } = response.data
            success ? toast.success(message) : toast.error(message)
            if (success) {
                setUsrInfo(prev => prev ? {
                    ...prev,
                    avatar: response.data.data.avatar + `?t=${Date.now()}`
                } : prev);
                onUpdated();
                setIsEditing(false);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Upload failed")
            } else {
                toast.error("Upload failed")
            }
        } finally {
            setAvatarAction(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleRemove = async () => {
        try {
            setAvatarAction("remove")

            const response = await axiosInstance.delete<ServerResponse<null>>(
                "/profile/remove-avatar",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )

            const { success, message } = response.data
            success ? toast.success(message) : toast.error(message)
            if (success) {
                setUsrInfo(prev => prev ? {
                    ...prev,
                    avatar: undefined
                } : prev);
                onUpdated();
                setIsEditing(false);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Remove failed")
            } else {
                toast.error("Remove failed")
            }
        } finally {
            setAvatarAction(null)
        }
    }

    return (
        <div className="relative">
            <Avatar className="w-32 h-32">
                <AvatarImage src={avatar || "/user.png"} />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>

            {isOwnProfile && isEditing && (
                <>
                    {avatar && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={avatarAction !== null}
                            className="absolute bottom-1 left-1 bg-background border rounded-full p-2 shadow hover:bg-red-50 text-red-600 transition disabled:cursor-not-allowed"
                        >
                            {avatarAction === "remove" ? (
                                <Spinner className="w-4 h-4" />
                            ) : (
                                <Trash2Icon className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarAction !== null}
                        className="absolute bottom-1 right-1 bg-background border rounded-full p-2 shadow hover:bg-muted transition disabled:cursor-not-allowed"
                    >
                        {avatarAction === "upload" ? (
                            <Spinner className="w-4 h-4" />
                        ) : (
                            <Camera className="w-4 h-4" />
                        )}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                    />
                </>
            )}
        </div>
    )
}
