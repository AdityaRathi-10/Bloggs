import User from "@/models/User";
import { uploadImageToCloud } from "@/utils/cloudinary";
import dbConnect from "@/utils/dbConnet";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { signOut } from "next-auth/react";
import { generateFromEmail } from "unique-username-generator";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter username",
        },
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          await dbConnect();
          const existingUser = await User.findOne({
            email: credentials?.email,
          });
          if (!existingUser) {
            throw new Error("User not found");
          }
          const isPasswordValid = await bcrypt.compare(
            credentials?.password!,
            existingUser.password
          );

          if (isPasswordValid) {
            return existingUser;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if(token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.profileImage = token.profileImage
      }
      return session;
    },
    async jwt({ token, user }) {
      if(user) {
        await dbConnect()
        let existingUser = await User.findOne({ email: user.email });
        if(existingUser) {
          token._id = existingUser?.id?.toString() as string
          token.username = existingUser?.username;
          token.profileImage = existingUser?.profileImage
        }
        else {
          await signOut({ redirect: true, callbackUrl: "/" })
        }
      }
      return token;
    },
    async signIn({ user }) {
      await dbConnect();
      try {
        const existingUser = await User.findOne({
          email: user.email,
        });
        if (existingUser) return true;
        const username = generateFromEmail(user.email!)

        let uploadedImageUrl
        if(user.image) {
          const res = await fetch(user.image)
          const blob = await res.blob()
          uploadedImageUrl  = await uploadImageToCloud(blob)
        }
        
        const newUser = await User.create({
          username,
          email: user.email,
          password: 123,
          profileImage: uploadedImageUrl,
        });
        
        if (newUser) return true;
        return false;
      } catch (error) {
        return false;
      }
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/posts`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};