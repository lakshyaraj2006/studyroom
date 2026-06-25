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
        <div className="relative group rounded-full overflow-hidden">
            <Avatar className="w-32 h-32 sm:w-36 sm:h-36 transition-all duration-300 ring-2 ring-transparent group-hover:ring-indigo-500/25">
                <AvatarImage src={avatar || "/user.png"} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-bold text-3xl select-none">
                    U
                </AvatarFallback>
            </Avatar>

            {isOwnProfile && isEditing && (
                <div 
                    onClick={() => avatarAction === null && fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/55 backdrop-blur-[1px] rounded-full flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    title="Change Photo"
                >
                    {avatarAction === "upload" ? (
                        <Spinner className="w-5 h-5 border-white" />
                    ) : (
                        <>
                            <Camera className="w-6 h-6 mb-1 text-white" />
                            <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">Edit</span>
                        </>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                    />
                </div>
            )}
        </div>
    )
}
