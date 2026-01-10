import axios from "@/lib/api";
import {useAuth} from "./useAuth";

const useLogout = () => {
    const {authToken, setAuthToken} = useAuth();

    const logout = async () => {
        try {
            await axios.post('/users/logout', null, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                withCredentials: true
            });

            setAuthToken(null);
        } catch (error) {
            console.log(error);
        }
    }

    return logout;
}

export default useLogout;