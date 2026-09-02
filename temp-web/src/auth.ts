import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
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
        const ip = req?.headers?.get?.("x-forwarded-for") ?? "unknown";
        const { allowed, retryAfter } = await checkRateLimit(`login:${ip}`);
        if (!allowed) {
          throw new Error(`Too many attempts. Try again in ${retryAfter} seconds.`);
        }

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          console.error("[AUTH] Missing email or password");
          return null;
        }

        const { prisma } = await import("@/lib/prisma");
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

        if (!user.isActive) {
          console.error("[AUTH] User is inactive");
          return null;
        }

        await resetRateLimit(`login:${ip}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" && user?.email) {
        const { prisma } = await import("@/lib/prisma");
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const email = user.email!;
          const nameParts = user.name?.split(" ") || [];
          const firstName = nameParts[0] || null;
          const lastName = nameParts.slice(1).join(" ") || null;

          await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                email,
                name: user.name || null,
                firstName,
                lastName,
                avatar: user.image || null,
                role: "user",
              },
            });

            const workspace = await tx.workspace.create({
              data: {
                name: `${firstName || "My"}'s Workspace`,
                slug: newUser.id,
                ownerId: newUser.id,
                plan: "starter",
              },
            });

            await tx.workspaceMember.create({
              data: {
                workspaceId: workspace.id,
                userId: newUser.id,
                role: "owner",
              },
            });
          });
        } else if (!existing.isActive) {
          console.error("[AUTH] Inactive Google user attempted sign-in", user.email);
          return false;
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
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.firstName = dbUser.firstName ?? user.name?.split(" ")[0] ?? token.firstName;
          token.lastName = dbUser.lastName ?? user.name?.split(" ").slice(1).join(" ") ?? token.lastName;
          token.company = dbUser.company ?? user.company ?? token.company;
          token.phone = dbUser.phone ?? user.phone ?? token.phone;
          token.role = dbUser.role ?? "user";
          token.isActive = dbUser.isActive ?? true;
        } else {
          token.id = user.id ?? token.id ?? token.sub;
          token.email = user.email ?? token.email;
          token.firstName = user.firstName ?? user.name?.split(" ")[0] ?? token.firstName;
          token.lastName = user.lastName ?? user.name?.split(" ").slice(1).join(" ") ?? token.lastName;
          token.company = user.company ?? token.company;
          token.phone = user.phone ?? token.phone;
          token.role = user.role ?? "user";
          token.isActive = user.isActive ?? token.isActive ?? true;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.company = token.company;
        session.user.phone = token.phone;
        session.user.role = token.role;
        session.user.isActive = token.isActive ?? true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
