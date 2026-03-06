import User from "@/models/User";
import { uploadImageToCloud } from "@/utils/cloudinary";
import dbConnect from "@/utils/dbConnet";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { generateFromEmail } from "unique-username-generator";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

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

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        const existingUser = await User.findOne({ email: credentials.email });

        if (!existingUser || !existingUser.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          existingUser.password
        );

        if (!isPasswordValid) return null;

        // Return a plain object (not the Mongoose document)
        return {
          id: existingUser._id!.toString(),
          email: existingUser.email,
          name: existingUser.username,
          image: existingUser.profileImage,
        };
      }
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      await dbConnect();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const username = generateFromEmail(user.email);

        let uploadedImageUrl;

        if (user.image) {
          const res = await fetch(user.image);
          const blob = await res.blob();

          const result = await uploadImageToCloud(blob);
          uploadedImageUrl = result?.secure_url;
        }

        await User.create({
          email: user.email,
          username,
          profileImage: uploadedImageUrl || user.image,
          password: null,
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      return token;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      await dbConnect();

      const dbUser = await User.findOne({ email: session.user.email });

      if (dbUser) {
        session.user._id = dbUser?._id!.toString();
        session.user.username = dbUser.username;
        session.user.profileImage = dbUser.profileImage;
      }

      return session;
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
