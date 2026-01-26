import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import { useAuth } from "@/hooks/useAuth";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { authToken } = useAuth();
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        !authToken ? verifyRefreshToken() : setIsLoading(false);
    }, []);

    // Fix: Auto-rotate after 14 minutes
    useEffect(() => {
        if (!authToken) return;

        intervalRef.current = window.setInterval(async () => {
        try {
            await refresh();
        } catch (error) {
            console.log("Auto refresh failed", error);
        }
        }, 14 * 60 * 1000); // 14 minutes

        return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        };
    }, [authToken, refresh]);

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet />}
        </>
    )
}

export default PersistLogin;