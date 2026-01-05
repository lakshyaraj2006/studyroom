import { AuthProvider } from "@/context/AuthProvider";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    )
}