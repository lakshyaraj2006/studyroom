import type { Profile } from "@/interfaces/profile"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import axiosInstance from "@/lib/api"
import { type ServerResponse } from "@/interfaces/server-response"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { Spinner } from "../ui/spinner"
import { useNavigate } from "react-router-dom"

type EditProfileComponentProps = {
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    profile: Profile | null,
    getUsrProfile: () => Promise<void>
}

export default function EditProfileComponent({ setIsEditing, profile, getUsrProfile }: EditProfileComponentProps) {
    const {authToken} = useAuth();
    const [updatedProfileData, setUpdatedProfileData] = useState<Pick<Profile, "name" | "handle" | "bio">>({ name: profile?.name || "", handle: profile?.handle || "", bio: profile?.bio || "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUpdatedProfileData(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.patch<ServerResponse<null>>('/profile/update', updatedProfileData, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const {success, message} = response.data;

            success ? toast.success(message) : toast.error(message);
            
            if (success) {
                if (profile?.handle != updatedProfileData.handle) {
                    navigate(`/profile/${updatedProfileData.handle}`);
                } else {
                    await getUsrProfile();
                }
                setIsEditing(false);
            }
        } catch (error: any) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input type="text" name="name" id="name" placeholder="Enter your name" value={updatedProfileData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="handle">Handle <span className="text-red-500">*</span></Label>
                <Input type="text" name="handle" id="handle" placeholder="Choose your handle" value={updatedProfileData.handle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea name="bio" id="bio" placeholder="Enter your bio" value={updatedProfileData.bio} onChange={handleChange} />
            </div>

            <Button disabled={loading}>
                {
                    loading
                    ? <span className="flex items-center gap-2"><Spinner /> Updating...</span>
                    : <>Update Profile</>
                }
            </Button>
        </form>
    )
}