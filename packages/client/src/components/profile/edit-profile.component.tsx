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
    const { authToken } = useAuth();
    const [updatedProfileData, setUpdatedProfileData] = useState<Pick<Profile, "name" | "handle" | "bio">>({
        name: profile?.name || "",
        handle: profile?.handle || "",
        bio: profile?.bio || ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        // Restrict bio to 160 chars
        if (e.target.name === "bio" && val.length > 160) return;
        setUpdatedProfileData(prev => ({ ...prev, [e.target.name]: val }));
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

            const { success, message } = response.data;

            success ? toast.success(message) : toast.error(message);
            
            if (success) {
                if (profile?.handle !== updatedProfileData.handle) {
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
                <Label htmlFor="name" className="text-sm font-semibold">Name <span className="text-red-500">*</span></Label>
                <Input 
                    type="text" 
                    name="name" 
                    id="name" 
                    placeholder="Enter your name" 
                    value={updatedProfileData.name} 
                    onChange={handleChange} 
                    className="focus-visible:ring-primary/20 h-10"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="handle" className="text-sm font-semibold">User Handle <span className="text-red-500">*</span></Label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground font-semibold text-sm">@</span>
                    <Input 
                        type="text" 
                        name="handle" 
                        id="handle" 
                        placeholder="choose_handle" 
                        value={updatedProfileData.handle} 
                        onChange={handleChange} 
                        className="pl-8 focus-visible:ring-primary/20 h-10"
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">Your handle is your unique identifier across StudyRoom.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
                <Textarea 
                    name="bio" 
                    id="bio" 
                    placeholder="Tell other students about yourself..." 
                    value={updatedProfileData.bio} 
                    onChange={handleChange} 
                    className="focus-visible:ring-primary/20 min-h-[100px] resize-none"
                    maxLength={160}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>A short description for your profile.</span>
                    <span>{updatedProfileData.bio?.length || 0}/160 characters</span>
                </div>
            </div>

            <div className="pt-2">
                <Button disabled={loading} className="px-6 h-10 font-medium cursor-pointer shadow-sm">
                    {
                        loading
                        ? <span className="flex items-center gap-2"><Spinner /> Updating...</span>
                        : <>Save Changes</>
                    }
                </Button>
            </div>
        </form>
    )
}