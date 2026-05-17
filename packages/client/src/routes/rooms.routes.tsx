import PersistLogin from "@/components/persist-login.component";
import ProtectedRoutes from "@/components/protected-routes.component";
import AcceptRoomInvite from "@/pages/rooms/accept-invite";
import AddRoomPage from "@/pages/rooms/add-room.page";
import EditRoom from "@/pages/rooms/edit-room";
import RejectRoomInvite from "@/pages/rooms/reject-invite";
import RoomDetails from "@/pages/rooms/room-details.page";
import Rooms from "@/pages/rooms/rooms.page";
import type { RouteObject } from "react-router-dom";

export const roomRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Rooms /> },
            { path: ":roomId", element: <RoomDetails /> },
            {
                element: <ProtectedRoutes />,

                children: [
                    { path: "edit/:roomId", element: <EditRoom /> },
                    { path: "accept-invite/:roomId/:inviteToken", element: <AcceptRoomInvite /> },
                    { path: "reject-invite/:roomId/:inviteToken", element: <RejectRoomInvite /> },
                    { path: "add", element: <AddRoomPage /> },
                ]
            }
        ]
    }
]