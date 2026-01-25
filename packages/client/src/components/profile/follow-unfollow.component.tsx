import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import axiosInstance from "@/lib/api";
import { type ServerResponse } from "@/interfaces/server-response";
import { toast } from "sonner";
import { AxiosError } from "axios";

type FollowUnfollowComponentProps = {
    isFollowing: boolean,
    setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>,
    usrHandle: string,
    getUsrProfile: () => Promise<void>
}

export default function FollowUnfollowComponent({ isFollowing, setIsFollowing, usrHandle, getUsrProfile }: FollowUnfollowComponentProps) {
    const { authToken } = useAuth();

    const handleFollow = async () => {
        setIsFollowing(true);
        try {
            const response = await axiosInstance.post<ServerResponse<null>>(`/profile/follow/${usrHandle}`, null, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const { success, message } = response.data;

            success ? toast.success(message) : toast.error(message);

            if (success) {
                await getUsrProfile();
            } else {
                setIsFollowing(false);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Follow failed")
            } else {
                toast.error("Follow failed")
            }
            setIsFollowing(false);
            console.log(error);
            
        }
    }

    const handleUnfollow = async () => {
        setIsFollowing(false);
        try {
            const response = await axiosInstance.delete<ServerResponse<null>>(`/profile/unfollow/${usrHandle}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            const { success, message } = response.data;

            success ? toast.success(message) : toast.error(message);

            if (success) {
                await getUsrProfile();
            } else {
                setIsFollowing(true);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Unollow failed")
            } else {
                toast.error("Follow failed")
            }
            setIsFollowing(true);
            console.log(error);
            
        }
    }

    return (
        <div>
            {
                !isFollowing
                    ? <Button className="cursor-pointer" onClick={handleFollow}>Follow</Button>
                    : <Button className="cursor-pointer" onClick={handleUnfollow}>Unfollow</Button>
            }
        </div>
    )
}