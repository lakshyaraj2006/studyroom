import type { ServerResponse } from "@/interfaces/server-response";
import type { SignInUserCredentials } from "@/interfaces/signin-user-credentials";
import type { SignUpUserCredentials } from "@/interfaces/signup-user-credentials";
import axiosInstance from "@/lib/api";
import { createContext, useState } from "react";

export interface AuthContextType {
    authToken: string | null;
    setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;

    signup: (credentials: SignUpUserCredentials) => Promise<ServerResponse<null>>;
    signin: (credentials: SignInUserCredentials) => Promise<ServerResponse<{ accessToken: string }>>;
    verifyEmail: (email: string, code: string) => Promise<ServerResponse<{ accessToken: string }>>;
    resendCode: (email: string) => Promise<ServerResponse<null>>;
    forgotPassword: (email: string) => Promise<ServerResponse<null>>;
    forgotPasswordReset: (email: string, code: string, password: string, cpassword: string) => Promise<ServerResponse<null>>;
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

    const signin = async (_credentials: SignInUserCredentials): Promise<ServerResponse<{ accessToken: string }>> => {
        const response = await axiosInstance.post<ServerResponse<{ accessToken: string }>>('/users/login', _credentials, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        return response.data;
    };

    const verifyEmail = async (_email: string, _code: string): Promise<ServerResponse<{ accessToken: string }>> => {
        const response = await axiosInstance.post<ServerResponse<{ accessToken: string }>>('/users/verify-email', { email: _email, code: _code }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        return response.data;
    };

    const resendCode = async (_email: string): Promise<ServerResponse<null>> => {
        const response = await axiosInstance.post<ServerResponse<null>>('/users/resend-code', {email: _email}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    };

    const forgotPassword = async (_email: string): Promise<ServerResponse<null>> => {
        const response = await axiosInstance.post<ServerResponse<null>>('/users/forgot-password', {email: _email}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    };

    const forgotPasswordReset = async (_email: string, _code: string, _password: string, _cpassword: string): Promise<ServerResponse<null>> => {
        const response = await axiosInstance.post<ServerResponse<null>>('/users/forgot-password-reset', {email: _email, code: _code, password: _password, cpassword: _cpassword}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    };

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
