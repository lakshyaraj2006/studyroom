import axiosInstance from "@/lib/api"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import type { Profile } from "@/interfaces/profile"
import NotFoundPage from "../error/NotFound"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import { Edit2, LogOut } from "lucide-react";
import useLogout from "@/hooks/useLogout";
import { toast } from "sonner"
import ProfileAvatar from "@/components/profile/profile-avatar.component"
import EditProfileComponent from "@/components/profile/edit-profile.component"
import FollowUnfollowComponet from "@/components/profile/follow-unfollow.component"
import DeleteProfileComponent from "@/components/profile/delete-profile.component"

export default function ProfilePage() {
    const { userHandle } = useParams();
    const { authToken, usrInfo } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const logout = useLogout();

    useEffect(() => {
        if (!userHandle) return
        getUsrProfile();

    }, [userHandle])

    useEffect(() => {
        if (!profile?.followers || !usrInfo?.id) {
            setIsFollowing(false);
            return;
        }

        setIsFollowing(profile.followers.includes(usrInfo.id));
    }, [profile, usrInfo]);

    const getUsrProfile = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/profile/get/${userHandle}`, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = response.data.data as Profile;

            setStatusCode(response.status);
            setProfile(data);
            
            if (usrInfo) {
                setIsOwnProfile(data._id === usrInfo.id);
            } else {
                setIsOwnProfile(false);
            }
        } catch (error: any) {
            setStatusCode(error.response?.status || 500);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully!");
        } catch (error) {
            console.log(error);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">
        <p className="flex items-center gap-4">
            <Spinner />
            <span>Loading ...</span>
        </p>
    </div>
    if (statusCode == 404) return <NotFoundPage />

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left section */}
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center pt-8">
                        <ProfileAvatar
                            avatar={profile?.avatar}
                            isOwnProfile={isOwnProfile}
                            isEditing={isEditing}
                            onUpdated={getUsrProfile}
                            setIsEditing={setIsEditing}
                        />

                        <h2 className="mt-4 text-xl font-semibold">{profile?.name}</h2>

                        <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                            <span>
                                <strong className="text-foreground">{profile?.followers?.length}</strong> Followers
                            </span>
                            <span>
                                <strong className="text-foreground">{profile?.following?.length}</strong> Following
                            </span>
                        </div>

                        {!isOwnProfile && authToken && !profile?.is_deleted && <div className="mt-3">
                            <FollowUnfollowComponet
                                isFollowing={isFollowing}
                                setIsFollowing={setIsFollowing}
                                usrHandle={profile?.handle as string}
                                getUsrProfile={getUsrProfile}
                            />
                        </div>}

                        {authToken && isOwnProfile && !profile?.is_deleted && (
                            <div className="flex flex-col md:flex-row items-center gap-2 w-full mt-6">
                                <Button variant={isEditing ? "destructive" : "default"} className="w-full md:w-1/2 flex items-center justify-center gap-2 cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
                                    {
                                        isEditing
                                            ? <><XIcon className="w-4 h-4" /> Cancel</>
                                            : <><Edit2 className="w-4 h-4" /> Edit Profile</>
                                    }
                                </Button>
                                <Button variant="secondary" className="w-full md:flex-1 flex items-center justify-center gap-2 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right section */}
                <Card className="md:col-span-2">
                    <CardContent className="p-6 space-y-5">
                        {
                            isEditing
                                ? <EditProfileComponent
                                    setIsEditing={setIsEditing}
                                    profile={profile}
                                    getUsrProfile={getUsrProfile}
                                />
                                : <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Username</p>
                                        <p className="font-medium">{profile?.username}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">User Handle</p>
                                        <p className="font-medium">@{userHandle}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Bio</p>
                                        <p>
                                            {profile?.bio || "No bio"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rooms Joined</p>
                                            <p className="font-medium">{profile?.joined_rooms?.length}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Login</p>
                                            <p className="font-medium">—</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Active</p>
                                            <p className="font-medium">—</p>
                                        </div>
                                    </div>

                                    {
                                        isOwnProfile && !profile?.is_deleted &&
                                        <DeleteProfileComponent
                                            email={profile?.email as string}
                                            getUsrProfile={getUsrProfile}
                                        />
                                    }
                                </>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
