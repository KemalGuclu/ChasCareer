import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      image?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google OAuth - alla Google-konton (lägg till hd: "chasacademy.se" för att begränsa)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Demo credentials provider - kan tas bort i produktion
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // För demo: hitta användare baserat på email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user) {
          // Skapa demo-användare om den inte finns
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: (credentials.email as string).split("@")[0],
              role: (credentials.email as string).includes("admin") 
                ? "ADMIN" 
                : (credentials.email as string).includes("teacher") 
                  ? "TEACHER" 
                  : "STUDENT",
            },
          });
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // För Google OAuth: hämta roll från databasen om den inte finns
      if (account?.provider === "google" && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else {
          // Nya Google-användare får STUDENT som default
          token.role = "STUDENT";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
