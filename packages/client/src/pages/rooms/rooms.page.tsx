import { useEffect, useState } from "react";
import { type Room } from "@/interfaces/room";
import type { ServerResponse } from "@/interfaces/server-response";
import axiosInstance from "@/lib/api";
import RoomCard from "@/components/rooms/room-card.component";
import { useAuth } from "@/hooks/useAuth";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Rooms = () => {
  const { authToken } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRooms();
  }, []);

  const getRooms = async () => {
    try {
      const response = await axiosInstance.get<ServerResponse<Room[]>>("/rooms");
      setRooms(response.data.data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <p className="text-sm text-muted-foreground">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      {authToken && <div className="flex items-cend justify-end">
        <Link to="/rooms/add" className={cn(buttonVariants())}>
          Create Room
        </Link>
      </div>}
      {rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rooms found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room._id} {...room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;