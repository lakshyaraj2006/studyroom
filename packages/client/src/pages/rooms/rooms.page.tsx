import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import axiosInstance from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import type { Room } from "@/interfaces/room";
import type { ServerResponse } from "@/interfaces/server-response";

import RoomCard from "@/components/rooms/room-card.component";
import { buttonVariants } from "@/components/ui/button";

type RoomFilter = "all" | "created" | "joined";

const filters: {
  value: RoomFilter;
  label: string
}[] = [
    { value: "all", label: "Public Rooms" },
    { value: "created", label: "Created by You" },
    { value: "joined", label: "Joined Rooms" }
  ];

const Rooms = () => {
  const { authToken } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = (searchParams.get("filter") as RoomFilter) || "all";

  useEffect(() => {
    if (!authToken && activeFilter !== "all") {
      setSearchParams({ filter: "all" }, { replace: true });
      return;
    }

    getRooms();
  }, [activeFilter, authToken]);

  const getRooms = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get<ServerResponse<Room[]>>("/rooms", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        params: { filter: activeFilter }
      });

      setRooms(response.data.data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const changeFilter = (filter: RoomFilter) => {
    if (!authToken && filter !== "all") return;
    setSearchParams({ filter }, { replace: true });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <p className="text-sm text-muted-foreground">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {authToken && <div className="flex flex-wrap gap-2">
          {filters.map(({ value, label }) => {
            return (
              <button
                key={value}
                onClick={() => changeFilter(value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeFilter === value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 hover:border-indigo-300",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>}

        {authToken && (
          <Link to="/rooms/add" className={cn(buttonVariants())}>
            Create Room
          </Link>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No study rooms available yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => <RoomCard key={room._id} {...room} />)}
        </div>
      )}
    </div>
  );
};

export default Rooms;