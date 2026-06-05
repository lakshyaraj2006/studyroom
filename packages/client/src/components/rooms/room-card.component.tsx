import type { Room } from "@/interfaces/room";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { buttonVariants } from "../ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoomCard({
    _id,
    room_name,
    room_tagline,
    room_creator,
    room_users,
    room_topics,
    room_image,
}: Room) {
    return (
        <Card className="group relative overflow-hidden flex flex-col justify-between border border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 -translate-y-0.5 hover:-translate-y-1.5 transition-all duration-300 bg-card rounded-2xl pt-0 pb-0 gap-0">
            <div>
                <div className="relative overflow-hidden aspect-video bg-muted">
                    <img
                        src={room_image || "/images/room-default.jpg"}
                        alt={room_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Soft gradient mask overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                        {room_name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground leading-relaxed mt-1.5">
                        {room_tagline}
                    </CardDescription>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {room_topics.slice(0, 4).map((topic) => (
                            <span
                                key={topic}
                                className="text-xs bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full font-medium"
                            >
                                {topic}
                            </span>
                        ))}
                        {room_topics.length > 4 && (
                            <span className="text-xs text-muted-foreground font-semibold px-1 py-0.5">
                                +{room_topics.length - 4}
                            </span>
                        )}
                    </div>
                </CardHeader>
            </div>

            <CardContent className="p-5 pt-3 border-t border-border/40 flex items-center justify-between mt-4 bg-muted/10 dark:bg-card/50">
                <Link to={`/profile/${room_creator.handle}`} className="flex items-center gap-2.5 hover:text-primary transition-colors group/owner">
                    <Avatar className="h-8 w-8 ring-2 ring-background shadow-xs">
                        <AvatarImage src={room_creator.avatar || "/user.png"} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {room_creator.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground group-hover/owner:text-primary transition-colors leading-tight">{room_creator.name}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                            {room_users.length} {room_users.length === 1 ? "member" : "members"}
                        </span>
                    </div>
                </Link>

                <Link
                    to={`/rooms/${_id}`}
                    className={cn(
                        buttonVariants({ size: "sm" }),
                        "shadow-sm shadow-primary/15 hover:shadow-primary/30 transition-all duration-300 active:scale-95 cursor-pointer"
                    )}
                >
                    View <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </CardContent>
        </Card>
    );
}