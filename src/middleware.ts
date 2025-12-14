import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl.pathname

  if(!token && 
    url.startsWith("/create-post") ||
    url.startsWith("/dashboard") || 
    url.startsWith("/wishlist")
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if(token && url.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/posts", request.url))
  }

  if(token && url.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/posts", request.url))
  }

  if(token && url.startsWith("/verify-email")) {
    return NextResponse.redirect(new URL("/posts", request.url))
  }

  if(token && url.startsWith("/accounts")) {
    return NextResponse.redirect(new URL("/posts", request.url))
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/create-post",
    "/wishlist",
    "/sign-in",
    "/sign-up",
  ]
}