import passport from "passport";
import JwtStrategy from "passport-jwt";
import { JWT_SECRET } from "../../config/index.ts";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "../../utils/index.ts";
import { User } from "../../db/postgresql/models/User.ts";
import type { User as UserType } from "../../types/index.ts";
import redis from "../../db/redis/index.ts";

export const usePassport = function (): void {
  const jwtOptions: JwtStrategy.StrategyOptions = {
    jwtFromRequest: function (req) {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies["jwt-token"];
      }
      return token;
    },
    secretOrKey: JWT_SECRET || "default-secret",
  };

  const jwt = new JwtStrategy.Strategy(
    jwtOptions,
    async (payload: JwtPayload, done) => {
      try {
        if (payload) {
          const user = await getUserFromCache(payload.data.id);
          if (user) {
            return done(null, user);
          } else {
            const user = await getUserFromDB(payload.data.id);
            if (user) return done(null, user);
            return done(null, false);
          }
        }
        return done(null, false);
      } catch (error) {
        if (error instanceof Error) Logger.error(error);
        return done(error, false);
      }
    },
  );

  passport.use(jwt);
};

async function getUserFromCache(id: string): Promise<UserType | null> {
  const result = await redis.get(id);
  return result ? (JSON.parse(result) as UserType) : null;
}

async function getUserFromDB(id: string): Promise<UserType | null> {
  const user = await User.getById(id);
  if (user && user.id) {
    redis.set(user.id, JSON.stringify(user));
    return user;
  } else {
    return null;
  }
}
