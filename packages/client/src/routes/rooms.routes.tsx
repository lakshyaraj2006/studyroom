import PersistLogin from "@/components/persist-login.component";
import RoomDetails from "@/pages/rooms/room-details.page";
import Rooms from "@/pages/rooms/rooms.page";
import type { RouteObject } from "react-router-dom";

export const roomRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Rooms /> },
            { path: ":roomId", element: <RoomDetails /> }
        ]
    }
]