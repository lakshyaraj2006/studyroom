import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import type { Room } from "@/interfaces/room";
import type { ServerResponse } from "@/interfaces/server-response";

import RoomCard from "@/components/rooms/room-card.component";
import { buttonVariants } from "@/components/ui/button";
import SEO from "@/components/seo.component";

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
  const [roomsCache, setRoomsCache] = useState<Record<RoomFilter, Room[] | null>>({
    all: null,
    created: null,
    joined: null
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoomFilter>("all");

  const rooms = roomsCache[activeFilter] || [];

  const fetchAllRooms = useCallback(async () => {
    setLoading(true);

    try {
      if (authToken) {
        const [allRes, createdRes, joinedRes] = await Promise.all([
          axiosInstance.get<ServerResponse<Room[]>>("/rooms", {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { filter: "all" }
          }),
          axiosInstance.get<ServerResponse<Room[]>>("/rooms", {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { filter: "created" }
          }),
          axiosInstance.get<ServerResponse<Room[]>>("/rooms", {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { filter: "joined" }
          })
        ]);

        setRoomsCache({
          all: allRes.data.data,
          created: createdRes.data.data,
          joined: joinedRes.data.data
        });
      } else {
        const allRes = await axiosInstance.get<ServerResponse<Room[]>>("/rooms", {
          params: { filter: "all" }
        });

        setRoomsCache({
          all: allRes.data.data,
          created: [],
          joined: []
        });
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms]);

  useEffect(() => {
    if (!authToken && activeFilter !== "all") {
      setActiveFilter("all");
    }
  }, [activeFilter, authToken]);

  const changeFilter = (filter: RoomFilter) => {
    if (!authToken && filter !== "all") return;
    setActiveFilter(filter);
  };

  if (loading || roomsCache[activeFilter] === null) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <p className="text-sm text-muted-foreground">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <SEO
        title="Browse Study Rooms"
        description="Browse active public study rooms or join/create study groups to collaborate with your colleagues and friends."
        keywords="study rooms, study spaces, public study rooms, group learning, collaborative study"
      />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-border/40 pb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Study Rooms
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore active spaces for focused learning
          </p>
        </div>

        {authToken && (
          <Link 
            id="create-room-link"
            to="/rooms/add" 
            className={cn(
              buttonVariants({ size: "default" }),
              "shadow-md shadow-primary/10 hover:shadow-primary/25 cursor-pointer active:scale-95 transition-all"
            )}
          >
            Create Room
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {authToken && (
          <div className="flex flex-wrap gap-2">
            {filters.map(({ value, label }) => {
              const isSelected = activeFilter === value;
              return (
                <button
                  id={`filter-${value}-btn`}
                  key={value}
                  onClick={() => changeFilter(value)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-card text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border/60 rounded-2xl bg-card">
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            No study rooms available yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <RoomCard key={room._id} {...room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;