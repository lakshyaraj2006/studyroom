import type { Profile } from "@/interfaces/profile";
import { Mail, User, Tag, Calendar, Activity, Compass } from "lucide-react";

interface ProfileOverviewComponentProps {
    profile: Profile | null;
    userHandle: string;
    isOwnProfile: boolean;
}

export default function ProfileOverviewComponent({ profile, userHandle, isOwnProfile }: ProfileOverviewComponentProps) {
    if (!isOwnProfile) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                        <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</p>
                            <p className="text-base font-semibold text-foreground mt-0.5">{profile?.username}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                        <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                            <Tag className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Handle</p>
                            <p className="text-base font-semibold text-foreground mt-0.5">@{userHandle}</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-xl border bg-card/25 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio Description</p>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {profile?.bio || "This user hasn't written a bio yet."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                        <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                            <Compass className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rooms Joined</p>
                            <p className="text-base font-semibold text-foreground mt-0.5">{profile?.joined_rooms?.length || 0} rooms</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                        <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</p>
                            <p className="text-base font-semibold text-foreground mt-0.5">
                                {profile?.last_active 
                                    ? new Date(profile.last_active).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Account Overview</h2>
                <p className="text-sm text-muted-foreground">General information about your StudyRoom profile.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                    <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</p>
                        <p className="text-base font-semibold text-foreground mt-0.5">{profile?.username}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                    <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Handle</p>
                        <p className="text-base font-semibold text-foreground mt-0.5">@{userHandle}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                    <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-base font-semibold text-foreground mt-0.5">{profile?.email}</p>
                </div>
            </div>

            <div className="p-5 rounded-xl border bg-card/25 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio Description</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {profile?.bio || "No bio written yet. Click on Edit Settings to add one!"}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                    <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                        <Compass className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rooms Joined</p>
                        <p className="text-base font-semibold text-foreground mt-0.5">{profile?.joined_rooms?.length || 0} rooms</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                    <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Login</p>
                        <p className="text-base font-semibold text-foreground mt-0.5">
                            {profile?.last_login 
                                ? new Date(profile.last_login).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                                : "—"}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/25">
                    <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</p>
                        <p className="text-base font-semibold text-foreground mt-0.5">
                            {profile?.last_active 
                                ? new Date(profile.last_active).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                                : "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
