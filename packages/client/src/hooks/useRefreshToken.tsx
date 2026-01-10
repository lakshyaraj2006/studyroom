import axios from "@/lib/api";
import { useAuth } from "./useAuth";
import type { ServerResponse } from "@/interfaces/server-response";

const useRefreshToken = () => {
  const { setAuthToken } = useAuth();

  const refresh = async () => {
    const response = await axios.post<
      ServerResponse<{ accessToken: string }>
    >("/users/rotate", null, {
      withCredentials: true,
    });

    const accessToken = response.data.data.accessToken;
    setAuthToken(accessToken);

    return accessToken;
  };

  return refresh;
};

export default useRefreshToken;
