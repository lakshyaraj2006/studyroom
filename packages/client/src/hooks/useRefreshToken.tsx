import axios from "@/lib/api";
import { useAuth } from "./useAuth";
import type { ServerResponse } from "@/interfaces/server-response";

const useRefreshToken = () => {
  const { setAuthToken, setUsrInfo } = useAuth();

  const refresh = async () => {
    const response = await axios.post<
      ServerResponse<{ accessToken: string, id: string, username: string, avatar: string | undefined }>
    >("/users/rotate", null, {
      withCredentials: true,
    });

    if (!response.data?.data?.accessToken) {
      throw new Error("No access token returned");
    }

    const accessToken = response.data.data.accessToken;
    setAuthToken(accessToken);
    setUsrInfo({ id: response.data.data.id, username: response.data.data.username, avatar: response.data.data.avatar });

    return accessToken;
  };

  return refresh;
};

export default useRefreshToken;
