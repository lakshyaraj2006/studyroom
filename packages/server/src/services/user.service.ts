import e from "express";
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

export const userService = { createUser };