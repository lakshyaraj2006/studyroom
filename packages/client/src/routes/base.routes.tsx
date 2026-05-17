import PersistLogin from "@/components/persist-login.component";
import Home from "@/pages/base/home.page";
import { type RouteObject } from "react-router-dom";

export const baseRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Home /> }
        ]
    }
]