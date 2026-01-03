import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db, prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/api/auth",
  pages: {
    signIn: "/auth/signin",
    error: "/unauthorized",
  },

  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@email.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        if (user.status === "DISABLE") {
          throw new Error("DISABLED_ACCOUNT");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
          profileImage: user.profileImage,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.status = user.status;
        token.profileImage = user.profileImage;
        token.mustChangePassword = user.mustChangePassword;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      const dbUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: { username: true },
      });

      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.status = token.status;
      session.user.username = dbUser?.username || null;
      session.user.profileImage = token.profileImage ?? null;
      session.user.mustChangePassword = token.mustChangePassword ?? false;

      return session;
    },

    async signIn({ user }) {
      if (user.status === "DISABLE") return false;

      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });

      return true;
    },
  },
});
