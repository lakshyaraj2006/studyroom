import { Request, Response } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError"

const createUser = async (name: string, username: string, email: string, password: string, cpassword: string) => {
    // check for empty fields
    if (!name || !username || !email || !password || !cpassword) {
        throw new ApiError(400, "All fields are required!");
    } else {
        // validate username & email
        const usernameRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

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
                $or: [{ username }, { email }]
            });

            // throw error if the user exists
            if (user) {
                throw new ApiError(400, "Username or email already in use!");
            }
            // check if password & confirm passwords match
            else if (password !== cpassword) {

                throw new ApiError(400, "Passwords do not match!");
            }
            else {
                // create the new user
                user = new User({ name, username, email, password });

                // save the user
                await user.save();

                // generate the access & refresh tokens
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();

                // return the access & refresh tokens
                return { accessToken, refreshToken };
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
        const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

        if (usernameRegex.test(identifier)) {
            user = await User.findOne({ username: identifier }).select("+password");
        } else if (emailRegex.test(identifier)) {
            user = await User.findOne({ email: identifier }).select("+password");
        }

        // check if the match for the user was found or not
        if (!user) {
            throw new ApiError(404, "User does not exist!");
        } else {
            // if the user was found, check for the password
            const isCorrectPassword = await user.verifyPassword(password);

            if (isCorrectPassword) {
                // generate the access & refresh tokens
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();

                // return the access & refresh tokens
                return { accessToken, refreshToken };
            } else {
                throw new ApiError(400, "Invalid password!")
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

export const userService = { createUser, loginUser, logoutUser };