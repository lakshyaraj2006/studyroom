import axios from "@/lib/api";
import { useAuth } from "./useAuth";

const useLogout = () => {
    const { authToken, setAuthToken, setUsrInfo } = useAuth();

    const logout = async () => {
        try {
            await axios.post('/users/logout', null, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                withCredentials: true
            });

            setAuthToken(null);
            setUsrInfo(null);
        } catch (error) {
            console.log(error);
        }
    }

    return logout;
}

export default useLogout;