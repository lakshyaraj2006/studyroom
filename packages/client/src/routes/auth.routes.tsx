import type { RouteObject } from "react-router-dom";
import SignUp from "@/pages/auth/signup.page";
import SignIn from "@/pages/auth/signin.page";
import ForgotPassword from "@/pages/auth/forgot.password";

export const authRoutes: RouteObject[] = [
    { path: 'signup', element: <SignUp /> },
    { path: 'signin', element: <SignIn /> },
    { path: 'forgot-password', element: <ForgotPassword /> }
]