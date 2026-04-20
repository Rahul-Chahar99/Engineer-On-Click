import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { User } from "../models/user.models.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/v1/users/auth/google/callback` : "/api/v1/users/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          //if user exist but registered locally , you can optionally link the Google Id
          if (!user.providerId) {
            user.providerId = profile.id;
            user.authProvider = "google";
            await user.save({ validateBeforeSave: false });
          }
          return done(null, user);
        }
        const newUser = await User.create({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          username:
            profile.emails[0].value.split("@")[0] +
            Math.floor(Math.random() * 1000), //Generate a fallback username
          avatar: profile.photos[0]?.value || "",
          authProvider: "google",
          providerId: profile.id,
          role: "engineer",
        });
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
