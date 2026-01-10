import PersistLogin from "@/components/persist-login.component";
import ProtectedRoutes from "@/components/protected-routes.component";
import { type RouteObject } from "react-router-dom";

export const baseRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            {
                element: <ProtectedRoutes />,
                children: [
                    { index: true, element: <>Home Page</> },
                    { path: 'dashboard', element: <>Dashboard Page</> }
                ]
            }
        ]
    }
]