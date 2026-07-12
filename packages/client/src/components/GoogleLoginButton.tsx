import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type GoogleLoginButtonProps = {
    className?: string;
    disabled?: boolean;
};

export default function GoogleLoginButton({
    className,
    disabled = false,
}: GoogleLoginButtonProps) {
    const { signInWithGoogle } = useAuth();

    return (
        <Button
            type="button"
            variant="outline"
            className={`w-full rounded-xl ${className ?? ""}`}
            disabled={disabled}
            onClick={signInWithGoogle}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="mr-2 h-5 w-5"
                aria-hidden="true"
            >
                <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.72 1.22 9.23 3.61l6.9-6.9C35.91 2.43 30.38 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.03 6.24C12.52 13.48 17.79 9.5 24 9.5z"
                />
                <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.57-.14-3.08-.41-4.5H24v9h12.67c-.55 2.96-2.22 5.47-4.73 7.16l7.27 5.64C43.75 37.59 46.5 31.6 46.5 24.5z"
                />
                <path
                    fill="#FBBC05"
                    d="M10.59 28.54A14.47 14.47 0 0 1 9.5 24c0-1.58.39-3.07 1.09-4.54l-8.03-6.24A23.93 23.93 0 0 0 0 24c0 3.88 0.93 7.55 2.56 10.78l8.03-6.24z"
                />
                <path
                    fill="#34A853"
                    d="M24 48c6.38 0 11.74-2.1 15.65-5.7l-7.27-5.64c-2.02 1.36-4.62 2.16-8.38 2.16-6.21 0-11.48-3.98-13.41-9.96l-8.03 6.24C6.51 42.62 14.62 48 24 48z"
                />
            </svg>

            Continue with Google
        </Button>
    );
}