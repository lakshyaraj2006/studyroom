import { AuthProvider } from "@/context/AuthProvider";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Toaster />
            <Outlet />
        </AuthProvider>
    )
}