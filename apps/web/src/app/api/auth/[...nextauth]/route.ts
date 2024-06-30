import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { setCookie } from "cookies-next";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("JWT callback called");
      // account appears only on first login
      if (account) {
        // store provider account id (github id) on the token
        (token as any).client_id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called");
      // copy client_id from token to session.user
      if (token && session.user) {
        (session.user as any).client_id = (token as any).client_id as string;
      }
      return session;
    },
  },
} as const;

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
