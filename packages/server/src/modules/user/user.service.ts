import { Request, Response } from "express";
import { IUser, User } from "./user.model";
import { ApiError } from "@/core/errors/ApiError";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { RefreshTokenPayloadType } from "@/shared/types/jwtPayloadCustom";
import { generateVerificationCode } from "@/shared/lib/generateVerificationCode";
import { sendForgotPasswordEmail } from "@/jobs/emails/sendForgotPasswordEmail";
import { sendVerificationEmail } from "@/jobs/emails/sendVerificationEmail";

const createUser = async (name: string, username: string, email: string, password: string, cpassword: string) => {
    // check for empty fields
    if (!name || !username || !email || !password || !cpassword) {
        throw new ApiError(400, "All fields are required!");
    } else {
        // validate username & email
        const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

        // check if username contains alphanumeric characters or not
        if (!usernameRegex.test(username)) {
            throw new ApiError(400, "Username must contain alphanumeric characters!");
        }
        // check if entered email is valid or not
        else if (!emailRegex.test(email)) {
            throw new ApiError(400, "Please enter a valid email!");
        }
        else {
            // check if the user exists with the username or email
            let user = await User.findOne({
                $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
            });

            // throw error if the user exists
            if (user) {
                throw new ApiError(409, "Username or email already in use!");
            }
            // check if password & confirm passwords match
            else if (password !== cpassword) {

                throw new ApiError(400, "Passwords do not match!");
            }
            else {
                // generate the verification code
                const verifyCode = generateVerificationCode();

                // set expiry to 8 hours after generating the code
                const verifyCodeExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);

                // create the new user
                user = new User({ name, username, email, password, verifyCode, verifyCodeExpiry });

                // save the user
                await user.save();

                // send the verification code to the user's email
                const result = await sendVerificationEmail(username, email, verifyCode);

                if (result) {
                    // save the user
                    await user.save();

                    return true;
                }
                else {
                    throw new ApiError(500, "Failed to send verification email. Please try again later.");
                }
            }
        }
    }
}

const resendVerificationCode = async (email: string) => {
    // throw error if email is not provided
    if (!email) {
        throw new ApiError(400, "Email is required!");
    } else {

        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
        // check for a valid email format
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format!");
        }

        // find the user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return true;
        }

        if (user.verified) {
            return true;
        }

        // generate a new verification code
        const verifyCode = generateVerificationCode();

        // set expiry to 8 hours after generating the code
        const verifyCodeExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);

        // update user verification data
        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = verifyCodeExpiry;

        // save the user
        await user.save();

        // send the verification code to the user's email
        await sendVerificationEmail(user.username, email, verifyCode);

        return true;
    }
};

const verifyEmail = async (email: string, code: string) => {
    // check for empty fields
    if (!email || !code) {
        throw new ApiError(400, "All fields are required!");
    } else {
        // validate email
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

        // check if entered email is valid or not
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid credentials!");
        }
        else {
            // check if the user exists with the username or email
            let user = await User.findOne({ email: email.toLowerCase() }).select('+verifyCode +verifyCodeExpiry');

            // throw error if the user exists
            if (!user) {
                throw new ApiError(404, "User not found!");
            }
            else {
                if (user.verified) {
                    throw new ApiError(409, "Email is already verified!")
                } else if (code != user.verifyCode) {
                    throw new ApiError(400, "Invalid verification code!");
                } else if (new Date() > (user.verifyCodeExpiry as Date)) {
                    throw new ApiError(400, "Code has expired!");
                } else {
                    // verify the user
                    user.verified = true;
                    user.verifyCode = undefined;
                    user.verifyCodeExpiry = undefined;

                    // save the user
                    await user.save();

                    // generate the access & refresh tokens
                    const accessToken = user.generateAccessToken();
                    const refreshToken = user.generateRefreshToken();

                    // return the access & refresh tokens
                    return { accessToken, refreshToken, id: user._id.toString(), username: user.username, avatar: user.avatar, handle: user.handle };
                }
            }
        }
    }
}

const loginUser = async (identifier: string, password: string) => {
    // check for empty fields
    if (!identifier || !password) {
        throw new ApiError(400, "All fields are required!");
    } else {
        let user;

        // check if whether the identifier matches the email or username
        const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

        if (usernameRegex.test(identifier)) {
            user = await User.findOne({ username: identifier.toLowerCase() }).select("+password");
        } else if (emailRegex.test(identifier)) {
            user = await User.findOne({ email: identifier.toLowerCase() }).select("+password");
        }

        // check if the match for the user was found or not
        if (!user) {
            throw new ApiError(401, "Invalid credentials!");
        } else {
            if (!user.providers.includes("local")) {
                throw new ApiError(409, "Password sign in is not enabled for this account.");
            }

            // if the user was found, check for the password
            const isCorrectPassword = await user.verifyPassword(password);

            if (isCorrectPassword) {
                // generate the access & refresh tokens
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();

                // return the access & refresh tokens
                return { accessToken, refreshToken, id: user._id.toString(), username: user.username, avatar: user.avatar, handle: user.handle };
            } else {
                throw new ApiError(401, "Invalid credentials!")
            }
        }
    }
}

const logoutUser = (req: Request, res: Response) => {
    // Extract cookies
    const cookies = req.cookies;

    // check if the cookie named "refreshtoken" is present or not
    if (cookies['refreshtoken']) {
        // if present, clear & return true
        res.clearCookie('refreshtoken');
        return true;
    } else {
        // throw 401 unauthorized error
        throw new ApiError(401, "Unauthorized access!")
    }
}

const rotateAccessAndRefreshTokens = async (cookies: Record<any, any>) => {
    // check if the cookie named "refreshtoken" is present or not
    if (cookies['refreshtoken']) {
        // try decoding
        try {
            // decode the token
            const decodedRefresh = jwt.verify(cookies['refreshtoken'], process.env.REFRESH_TOKEN_SECRET!) as RefreshTokenPayloadType;

            // find the user based on id in the token
            const user = await User.findById(decodedRefresh?.id);

            if (user) {
                // generate the access & refresh tokens
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();

                // return the access & refresh tokens
                return { accessToken, refreshToken, id: user._id.toString(), username: user.username, avatar: user.avatar, handle: user.handle };
            } else {
                // throw 404 not found
                throw new ApiError(404, "User does not exist!")
            }
        }
        // throw errors if any
        catch (error) {
            if (error instanceof JsonWebTokenError) {
                // throw 500 internal server error
                throw new ApiError(500, error.message)
            } else {
                // throw 500 internal server error
                throw new ApiError(500, (error as any).message)
            }
        }
    } else {
        // throw 401 unauthorized error
        throw new ApiError(401, "Unauthorized access!")
    }
}

const forgotPassword = async (email: string) => {
    if (!email) {
        // throw error if email is not provided
        throw new ApiError(400, "Email is required!");
    } else {
        // check for a valid email format
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

        if (!emailRegex.test(email)) {
            // throw error if email failes regex test
            throw new ApiError(400, "Invalid email format!");
        } else {
            // find the user
            let user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                // throw error if user is not found
                throw new ApiError(404, "User not found!");
            } else {
                if (!user.providers.includes("local")) {
                    throw new ApiError(
                        400,
                        "This account doesn't use a password. Please continue with Google."
                    );
                }

                // generate the verification code
                const code = generateVerificationCode();
                user.verifyCode = code;

                // set expiry to 8 hours after generating the code
                user.verifyCodeExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);

                // send the verification code to the user's email
                const result = await sendForgotPasswordEmail(user.username, email, code);

                if (result) {
                    // save the user
                    await user.save();

                    // return code & email for testing purposes only
                    return true;
                }
                else {
                    throw new ApiError(400, "Some error occurred!");
                }
            }
        }
    }
}

const forgotPasswordReset = async (email: string, code: string, password: string, cpassword: string) => {
    if (!email) {
        // throw error if email is not provided
        throw new ApiError(400, "Email is required!");
    } else {
        // check for a valid email format
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

        if (!emailRegex.test(email)) {
            // throw error if email failes regex test
            throw new ApiError(400, "Invalid email format!");
        } else {
            // find the user
            let user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                // throw error if user is not found
                throw new ApiError(404, "User not found!");
            } else {
                // check if code is correct & has not expired
                const isCodeCorrect = user.verifyCode === code;
                const codeHasExpired = new Date() > (user.verifyCodeExpiry as Date);

                // throw error if code is not correct
                if (!isCodeCorrect) {
                    throw new ApiError(400, "Invalid code");
                } else {
                    // throw error if code is correct & has expired
                    if (codeHasExpired) {
                        throw new ApiError(400, "Code has expired");
                    } else {
                        // return true if password matches
                        if (password === cpassword) {
                            user.password = password;
                            user.verifyCode = undefined;
                            user.verifyCodeExpiry = undefined;
                            await user.save();

                            return true;
                        } else {
                            // throw error is passwords do not match
                            throw new ApiError(400, "Passwords do not match!");
                        }
                    }
                }
            }
        }
    }
}

const changeEmail = async (userId: string, newEmail: string) => {
    if (!newEmail) {
        throw new ApiError(400, "New email is required!");
    }

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
    if (!emailRegex.test(newEmail)) {
        throw new ApiError(400, "Invalid email format!");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    // Check if new email is already taken
    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) {
        throw new ApiError(409, "Email is already in use!");
    }

    // Generate new verification code
    const verifyCode = generateVerificationCode();
    const verifyCodeExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);

    user.email = newEmail;
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = verifyCodeExpiry;
    user.verified = false;

    await user.save();

    // Send the new verification code
    await sendVerificationEmail(user.username, newEmail, verifyCode);

    return true;
};

const googleLogin = async (user: IUser) => {
    user.last_login = new Date();
    await user.save();

    return {
        accessToken: user.generateAccessToken(),
        refreshToken: user.generateRefreshToken(),
        id: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
        handle: user.handle,
    };
};

export const userService = { createUser, loginUser, logoutUser, rotateAccessAndRefreshTokens, forgotPassword, forgotPasswordReset, verifyEmail, resendVerificationCode, changeEmail, googleLogin };