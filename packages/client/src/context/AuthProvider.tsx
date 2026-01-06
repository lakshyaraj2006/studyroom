import type { ServerResponse } from "@/interfaces/server-response";
import type { SignInUserCredentials } from "@/interfaces/signin-user-credentials";
import type { SignUpUserCredentials } from "@/interfaces/signup-user-credentials";
import axiosInstance from "@/lib/api";
import { createContext, useState } from "react";

export interface AuthContextType {
    authToken: string | null;
    setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;

    signup: (credentials: SignUpUserCredentials) => Promise<ServerResponse<null>>;
    signin: (credentials: SignInUserCredentials) => ServerResponse<{ accessToken: string }>;
    verifyEmail: (email: string, code: string) => ServerResponse<{ accessToken: string }>;
    resendCode: (email: string) => ServerResponse<null>;
    forgotPassword: (email: string) => ServerResponse<null>;
    forgotPasswordReset: (email: string, code: string, password: string, cpassword: string) => ServerResponse<null>;
}


const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [authToken, setAuthToken] = useState<string | null>(null);

    const signup = async (_credentials: SignUpUserCredentials): Promise<ServerResponse<null>> => {
        const response = await axiosInstance.post<ServerResponse<null>>('/users/create', _credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    };

    const signin = (_credentials: SignInUserCredentials): ServerResponse<{ accessToken: string }> => ({} as ServerResponse<{ accessToken: string }>);

    const verifyEmail = (_email: string, _code: string): ServerResponse<{ accessToken: string }> => ({} as ServerResponse<{ accessToken: string }>);

    const resendCode = (_email: string): ServerResponse<null> => ({} as ServerResponse<null>);

    const forgotPassword = (_email: string): ServerResponse<null> => ({} as ServerResponse<null>);

    const forgotPasswordReset = (_email: string, _code: string, _password: string, _cpassword: string): ServerResponse<null> => ({} as ServerResponse<null>);

    const contextData: AuthContextType = {
        authToken,
        setAuthToken,
        signup,
        signin,
        verifyEmail,
        resendCode,
        forgotPassword,
        forgotPasswordReset,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
