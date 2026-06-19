import PersistLogin from "@/components/persist-login.component";
import Home from "@/pages/base/home.page";
import ContactPage from "@/pages/base/contact.page";
import AboutPage from "@/pages/base/about.page";
import { type RouteObject } from "react-router-dom";

export const baseRoutes: RouteObject[] = [
    {
        element: <PersistLogin />,
        children: [
            { index: true, element: <Home /> },
            { path: "contact", element: <ContactPage /> },
            { path: "about", element: <AboutPage /> }
        ]
    }
]