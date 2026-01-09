import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import { useAuth } from "@/hooks/useAuth";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { authToken } = useAuth();

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
    }, [])

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet />}
        </>
    )
}

export default PersistLogin;