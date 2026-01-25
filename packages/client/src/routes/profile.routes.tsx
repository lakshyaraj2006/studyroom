import PersistLogin from "@/components/persist-login.component";
import ProfilePage from "@/pages/profile/index.page";
import { type RouteObject } from "react-router-dom";

export const profileRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { path: ':userHandle', element: <ProfilePage /> }
        ]
    }
]
