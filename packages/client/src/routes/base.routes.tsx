import PersistLogin from "@/components/persist-login.component";
import ProtectedRoutes from "@/components/protected-routes.component";
import Home from "@/pages/base/home.page";
import NotificationsPage from "@/pages/notifications.page";
import { type RouteObject } from "react-router-dom";

export const baseRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Home /> },
            {
                element: <ProtectedRoutes />,
                children: [
                    { path: "notifications", element: <NotificationsPage /> }
                ]
            }
        ]
    }
]