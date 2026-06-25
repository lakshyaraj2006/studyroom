import axiosInstance from "@/lib/api"
import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Settings, LogOut, Camera, Trash2, Mail, Compass, Calendar, Users, UserCheck } from "lucide-react"
import type { Profile } from "@/interfaces/profile"
import NotFoundPage from "../error/NotFound"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import useLogout from "@/hooks/useLogout"
import { toast } from "sonner"

import ProfileAvatar from "@/components/profile/profile-avatar.component"
import EditProfileComponent from "@/components/profile/edit-profile.component"
import FollowUnfollowComponet from "@/components/profile/follow-unfollow.component"
import DeleteProfileComponent from "@/components/profile/delete-profile.component"
import VerificationWidget from "@/components/profile/verification-widget.component"
import ProfileOverviewComponent from "@/components/profile/profile-overview.component"

import SEO from "@/components/seo.component"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
    const { userHandle } = useParams();
    const { authToken, usrInfo } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const logout = useLogout();

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [bannerAction, setBannerAction] = useState<"upload" | "remove" | null>(null);

    // Tab state to bind with ProfileAvatar avatar editing trigger
    const [activeTab, setActiveTab] = useState<string>("profile");
    const isEditing = activeTab === "edit";
    const setIsEditing = (val: boolean | ((prev: boolean) => boolean)) => {
        const nextVal = typeof val === "function" ? val(isEditing) : val;
        setActiveTab(nextVal ? "edit" : "profile");
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        try {
            setBannerAction("upload")

            const response = await axiosInstance.post(
                "/profile/upload-banner",
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
                await getUsrProfile();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload banner failed")
        } finally {
            setBannerAction(null)
            if (bannerInputRef.current) bannerInputRef.current.value = ""
        }
    }

    const handleBannerRemove = async () => {
        try {
            setBannerAction("remove")

            const response = await axiosInstance.delete(
                "/profile/remove-banner",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            )

            const { success, message } = response.data
            success ? toast.success(message) : toast.error(message)
            if (success) {
                await getUsrProfile();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Remove banner failed")
        } finally {
            setBannerAction(null)
        }
    }

    useEffect(() => {
        if (!userHandle) return
        getUsrProfile();
    }, [userHandle])

    useEffect(() => {
        if (!userHandle) return;

        const socketUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
        const socket = io(socketUrl, {
            auth: {
                token: authToken
            },
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            socket.emit("join_profile", userHandle);
        });

        socket.on("profile:followers_updated", (data: { followers: string[]; following: string[] }) => {
            setProfile((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    followers: data.followers,
                    following: data.following,
                };
            });
        });

        return () => {
            socket.emit("leave_profile", userHandle);
            socket.disconnect();
        };
    }, [userHandle, authToken]);

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
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <SEO
                title={profile ? `${profile.name} (@${userHandle})` : "User Profile"}
                description={profile ? (profile.bio || `View ${profile.name}'s profile on StudyRoom. Joined ${profile.joined_rooms?.length || 0} rooms.`) : "View user profile on StudyRoom."}
                keywords={`profile, studyroom, ${profile?.name || ""}, ${profile?.username || ""}`}
            />

            {/* Premium Social Media Header Card with Banner & Overlapping Avatar */}
            <div className="relative rounded-2xl bg-card border overflow-hidden shadow-md bg-card/60 backdrop-blur-md">
                
                {/* Banner Gradient cover */}
                <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-muted group/banner">
                    {profile?.banner ? (
                        <img 
                            src={profile.banner} 
                            alt={`${profile.name}'s Banner`} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                        </div>
                    )}

                    {isOwnProfile && isEditing && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={bannerAction !== null}
                                className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full p-2.5 transition duration-200 cursor-pointer shadow-md disabled:cursor-not-allowed flex items-center justify-center border border-white/10"
                                title="Upload Banner"
                            >
                                {bannerAction === "upload" ? (
                                    <Spinner className="w-4 h-4 border-white" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>

                            {profile?.banner && (
                                <button
                                    type="button"
                                    onClick={handleBannerRemove}
                                    disabled={bannerAction !== null}
                                    className="bg-destructive/80 hover:bg-destructive text-white rounded-full p-2.5 transition duration-200 cursor-pointer shadow-md disabled:cursor-not-allowed flex items-center justify-center border border-white/10"
                                    title="Remove Banner"
                                >
                                    {bannerAction === "remove" ? (
                                        <Spinner className="w-4 h-4 border-white text-white" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleBannerUpload}
                            />
                        </div>
                    )}
                </div>
                
                {/* User details and avatar overlap */}
                <div className="px-6 pb-6 relative">
                    {/* Avatar and Action Button row */}
                    <div className="flex justify-between items-start gap-4">
                        {/* Avatar */}
                        <div className="-mt-16 sm:-mt-20 border-4 border-card rounded-full shadow-xl bg-card overflow-hidden z-10 shrink-0">
                            <ProfileAvatar
                                avatar={profile?.avatar}
                                isOwnProfile={isOwnProfile}
                                isEditing={isEditing}
                                onUpdated={getUsrProfile}
                                setIsEditing={setIsEditing}
                            />
                        </div>
                        
                        {/* Action buttons (Logout or Follow) */}
                        <div className="pt-4 shrink-0">
                            {isOwnProfile && authToken ? (
                                <Button 
                                    id="logout-btn" 
                                    variant="destructive" 
                                    className="flex items-center gap-2 cursor-pointer shadow-sm font-semibold" 
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            ) : (
                                authToken && !profile?.is_deleted && (
                                    <div className="min-w-[120px]">
                                        <FollowUnfollowComponet
                                            isFollowing={isFollowing}
                                            setIsFollowing={setIsFollowing}
                                            usrHandle={profile?.handle as string}
                                            getUsrProfile={getUsrProfile}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Name and Handle info */}
                    <div className="mt-3.5 space-y-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                    {profile?.name}
                                </h1>
                                {profile?.verified && (
                                    <span className="inline-flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-500/20 gap-1 select-none shrink-0">
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-label="Verified account">
                                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.28 3.422 2.28s2.825-1.015 3.422-2.28c.407.17.867.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.417L6.2 13.34l1.385-1.43 2.195 2.203 5.703-5.73 1.4 1.424-7.103 7.12z" />
                                        </svg>
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground/80 mt-0.5">@{profile?.username}</p>
                        </div>

                        {profile?.bio && (
                            <p className="text-[14px] leading-relaxed text-foreground/90 max-w-2xl whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        )}

                        {/* Metadata row like locations, rooms count, calendar */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground font-medium">
                            {profile?.email && isOwnProfile && (
                                <span className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer">
                                    <Mail className="w-3.5 h-3.5 shrink-0 text-muted-foreground/75" />
                                    {profile.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 shrink-0 text-muted-foreground/75" />
                                Joined {profile?.joined_rooms?.length || 0} rooms
                            </span>
                            {profile?.last_active && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/75" />
                                    Active {new Date(profile.last_active).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </div>

                        {/* Followers / Following counts */}
                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors duration-200 cursor-pointer border border-border/50 text-[13px] text-muted-foreground shadow-xs">
                                <Users className="w-3.5 h-3.5 text-muted-foreground/75" />
                                <span>
                                    <strong className="text-foreground font-bold">{profile?.followers?.length || 0}</strong> followers
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors duration-200 cursor-pointer border border-border/50 text-[13px] text-muted-foreground shadow-xs">
                                <UserCheck className="w-3.5 h-3.5 text-muted-foreground/75" />
                                <span>
                                    <strong className="text-foreground font-bold">{profile?.following?.length || 0}</strong> following
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Grid (2 Columns below header) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Sidebar Column - Quick About/Stats Card */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="border shadow-md bg-card/60 backdrop-blur-md">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-lg text-foreground border-b pb-2">About</h3>
                            
                            <div className="space-y-3.5">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">User Handle</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">@{userHandle}</p>
                                </div>

                                {profile?.email && isOwnProfile && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5">{profile.email}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rooms Joined</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">{profile?.joined_rooms?.length || 0} rooms</p>
                                </div>

                                {profile?.last_active && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Active</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5">
                                            {new Date(profile.last_active).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Main Column - Tabs (Owner) or Overview (Guest) */}
                <div className="lg:col-span-2">
                    {isOwnProfile && authToken ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                            
                            {/* Horizontal TabsList */}
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                                <TabsTrigger 
                                    value="profile"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 py-3 text-sm font-semibold transition-all cursor-pointer"
                                >
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="edit"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 py-3 text-sm font-semibold transition-all cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Settings
                                </TabsTrigger>
                            </TabsList>

                            <Card className="border shadow-md bg-card/60 backdrop-blur-md">
                                <CardContent className="p-6">
                                    {profile && !profile.verified && (
                                        <div className="mb-6">
                                            <VerificationWidget
                                                email={profile.email}
                                                onVerified={getUsrProfile}
                                            />
                                        </div>
                                    )}

                                    <TabsContent value="profile" className="outline-none">
                                        <ProfileOverviewComponent 
                                            profile={profile} 
                                            userHandle={userHandle || ""} 
                                            isOwnProfile={true} 
                                        />
                                    </TabsContent>

                                    <TabsContent value="edit" className="outline-none space-y-6">
                                        <EditProfileComponent
                                            setIsEditing={setIsEditing}
                                            profile={profile}
                                            getUsrProfile={getUsrProfile}
                                        />

                                        {profile && !profile.is_deleted && (
                                            <div className="pt-6 border-t mt-6">
                                                <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Deleting your account is permanent and cannot be undone.</p>
                                                <DeleteProfileComponent
                                                    email={profile.email}
                                                    getUsrProfile={getUsrProfile}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>
                                </CardContent>
                            </Card>
                        </Tabs>
                    ) : (
                        /* Guest Details Card */
                        <Card className="border shadow-md bg-card/60 backdrop-blur-md">
                            <CardContent className="p-6">
                                <ProfileOverviewComponent 
                                    profile={profile} 
                                    userHandle={userHandle || ""} 
                                    isOwnProfile={false} 
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
