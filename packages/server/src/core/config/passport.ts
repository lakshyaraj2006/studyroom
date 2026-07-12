import { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { nanoid } from "nanoid";

import { User } from "@/modules/user/user.model";

export function passportConfig(passport: PassportStatic) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: "/api/v1/users/google/callback",
            },
            async (req, _accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error("Google account did not provide an email."));
                    }

                    let user = await User.findOne({
                        email: email.toLowerCase(),
                    });

                    if (!user) {
                        user = await User.create({
                            name: profile.displayName,
                            username:
                                profile.displayName
                                    .toLowerCase()
                                    .replace(/\s+/g, ""),

                            email: email.toLowerCase(),
                            avatar: profile.photos?.[0]?.value,

                            verified: true,
                            providers: ["google"],
                        });
                    } else {
                        if (!user.providers.includes("google")) {
                            user.providers.push("google");
                        }

                        user.verified = true;

                        if (!user.avatar && profile.photos?.[0]?.value) {
                            user.avatar = profile.photos[0].value;
                        }

                        await user.save();
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err as Error);
                }
            }
        )
    );
}