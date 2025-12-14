"use client"

import axios from "axios";
import { Loader2, Mail } from "lucide-react"
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
    const {data: session, status} = useSession()
    const token = useSearchParams().get("token")
    const router = useRouter()

    if(token) {
        useEffect(() => {
            try {
                const getVerificationStatus = async () => {
                    const response = (await axios.get(`/api/verify-email?token=${token}`)).data
                    if(!response.success) {
                        return toast(response.message)
                    }
                    toast.success("Success", {
                        description: response.message
                    })
                    router.replace("/posts")
                    await signIn("credentials", {
                        redirect: false,
                        username: response.user.username,
                        email: response.user.email,
                        password: response.user.password,
                        profileImage: response.user.profileImage
                    })
                }
                getVerificationStatus()
            } catch (error) {
                console.log("Error:", error)
            }
        }, [])
    }

    if(status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin w-16 h-16" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <Mail className="h-12 w-12 text-primary animate-bounce" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-semibold">Verify Your Email</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">We've sent a verification link to</p>
                    <p className="font-semibold text-sm sm:text-base break-all">{session?.user.email}</p>
                    <p className="text-muted-foreground text-sm">Please check your inbox and click the link to continue.</p>
                </div>
            </div>
        </div>
    )
}