import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy  } from "passport-jwt";
import bcrypt from "bcrypt";
import User from "../models/User.js";

passport.use("local", new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password_hash"
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!user || !isMatch) {
                return done(null, false, { message: "Incorrect email or password." });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use("jwt", new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    async(payload, done) => {
        try {
            const user = await User.findByPk(payload.user_id); // User may need includes for Stakeholder and Role if you want to access those details in the request
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }
))

export default passport;