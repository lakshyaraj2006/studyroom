import PersistLogin from "@/components/persist-login.component";
import Rooms from "@/pages/rooms/rooms.page";
import type { RouteObject } from "react-router-dom";

export const roomRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Rooms /> }
        ]
    }
]