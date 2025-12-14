import User from "@/models/User";
import { uploadImageToCloud } from "@/utils/cloudinary";
import dbConnect from "@/utils/dbConnet";
import { NextRequest, NextResponse } from "next/server";
import EmailTemplate from '@/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const formData = await request.formData();

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData?.get("profileImage");

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this credentials already exists",
        },
        {
          status: 400,
        }
      );
    }

    let result;
    if (profileImage) {
      result = await uploadImageToCloud(profileImage as File);

      if (!result) {
        return NextResponse.json(
          { success: false, message: "Image upload failed" },
          { status: 500 }
        );
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      profileImage: result?.secure_url
    });

    const { data, error } = await resend.emails.send({
      from: 'Bloggs <onboarding@resend.dev>',
      to: "personalusekeliye789@gmail.com",
      subject: 'Email Verfication for Bloggs',
      react: EmailTemplate({ username: user.username, url: `http://localhost:3000/verify-email?token=${user.verificationToken}` })
    })

    if(error) {
      console.log("Error:", error)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verify Email",
        userId: user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
