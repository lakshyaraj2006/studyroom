import type { RouteObject } from "react-router-dom"
import SignUp from "@/pages/auth/signup.page"
import SignIn from "@/pages/auth/signin.page"
import ForgotPassword from "@/pages/auth/forgot-password.page"
import PersistLogin from "@/components/persist-login.component"
import GuestRoutes from "@/components/guest-routes.component"
import OAuthSuccess from "@/pages/auth/oauth-success.page"

export const authRoutes: RouteObject[] = [
  {
    element: <PersistLogin />,
    children: [
      {
        element: <GuestRoutes />,
        children: [
          { path: "signup", element: <SignUp /> },
          { path: "signin", element: <SignIn /> },
          { path: "oauth-success", element: <OAuthSuccess /> },
        ]
      }
    ],
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
]
