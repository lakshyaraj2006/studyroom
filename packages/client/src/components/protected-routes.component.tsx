import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoutes() {
    const { authToken } = useAuth();

    return (
        <>
            {authToken ? <Outlet /> : <Navigate to="/auth/signin" />}
        </>
    )
}