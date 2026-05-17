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

export default function RoomCard({
    _id,
    room_name,
    room_tagline,
    room_creator,
    room_users,
    room_topics,
    room_image,
}: Room) {
    const firstName = room_creator.name.split(/\s+/)[0];
    const formattedName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1);

    return (
        <Card className="overflow-hidden flex flex-col justify-between">
            <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
                <img
                    src={room_image || "/images/room-default.jpg"}
                    alt={room_name}
                    className="h-40 w-full object-cover object-top"
                />
            </div>
            <CardHeader>
                <CardTitle>{room_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {room_tagline}
                </CardDescription>

                <div className="flex flex-wrap gap-1 mt-2">
                    {room_topics.map((topic) => (
                        <span
                            key={topic}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                        >
                            {topic}
                        </span>
                    ))}
                    {room_topics.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                            +{room_topics.length - 4}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={room_creator.avatar || "/user.png"} />
                        <AvatarFallback>
                            {room_creator.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{formattedName}</span>
                        <span className="text-xs text-muted-foreground">
                            {room_users.length} members
                        </span>
                    </div>
                </div>

                <Link
                    to={`/rooms/${_id}`}
                    className={buttonVariants({ size: "sm" })}
                >
                    View <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    );
}