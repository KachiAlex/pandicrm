import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const ip = (req as any)?.headers?.get?.("x-forwarded-for") || "unknown";
        const { allowed, retryAfter } = checkRateLimit(`login:${ip}`);
        if (!allowed) {
          throw new Error(`Too many attempts. Try again in ${retryAfter} seconds.`);
        }

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          console.error("[AUTH] Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error("[AUTH] User not found");
          return null;
        }
        if (!user.password) {
          console.error("[AUTH] User has no password set");
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          console.error("[AUTH] Invalid credentials");
          return null;
        }

        resetRateLimit(`login:${ip}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" && user?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const nameParts = user.name?.split(" ") || [];
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              firstName: nameParts[0] || null,
              lastName: nameParts.slice(1).join(" ") || null,
              avatar: user.image || null,
              role: "user",
            },
          });
        } else if (!existing.avatar && user.image) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { avatar: user.image },
          });
        }
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.company = user.company;
        token.phone = user.phone;
        token.role = user.role;
      }

      if (token.email && (!token.id || token.role == null)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.company = dbUser.company;
          token.phone = dbUser.phone;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.firstName = (token as any).firstName;
        session.user.lastName = (token as any).lastName;
        session.user.company = (token as any).company;
        session.user.phone = (token as any).phone;
        session.user.role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
