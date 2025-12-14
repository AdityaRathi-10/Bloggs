"use client";

import { useForm } from "react-hook-form";
import { signInSchema } from "@/schemas/signInSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (response?.error) {
        toast.error("Login failed", { description: response.error });
      }
      if (response?.ok) {
        toast.error("Login, successful", {
          description: "User logged in successfully",
        });
        router.replace(`/posts`);
      }
    } catch (error) {
      console.error("Error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md border-2 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Login
          </h1>
          <p className="mb-4">Hi there. Welcome back!</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="border border-gray-600" 
                        placeholder="email" {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        className="border border-gray-600"
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="bg-gray-700 dark:bg-gray-500 dark:hover:bg-white 00 w-full text-md cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Are you a new member?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
      <div className="flex flex-col gap-2 mt-3">
			<Button
				onClick={() => signIn("google")}
				className="shadow-sm py-5 text-md rounded-md w-full bg-white text-gray-800 cursor-pointer border-2 hover:text-white hover:bg-gray-700"
			>
				Sign in with Google <Image src={"/google-icon.webp"} alt="Google" width={30} height={0} />
			</Button>

			<Button
				onClick={() => signIn("github")}
				className="shadow-sm py-5 text-md rounded-md w-full bg-white text-gray-800 cursor-pointer border-2 hover:text-white hover:bg-gray-700"
			>
				Sign in with Github <Image src={"/github-icon.png"} alt="Github" width={20} height={0} />
			</Button>
        </div>
        </div>
      </div>
    </div>
  );
}
