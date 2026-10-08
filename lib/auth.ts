import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 86400,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "admin",
      },
      noHP: {
        type: "string",
        defaultValue: "",
      },
    },
  },

  plugins: [
    admin({
      defaultRole: "admin",
    }),
  ],
});
