"use client";

import { useForm } from "react-hook-form";
import { signUpSchema } from "@/schemas/signUpSchema";
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
import axios, { AxiosError } from "axios";
import { APIResponse } from "@/utils/ApiResponse";

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

  const handleFileUpload = (e: any) => {
    console.log(e);
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    console.log(selectedFile);

    const formData = new FormData()
    formData.append("username", data.username)
    formData.append("email", data.email)
    formData.append("password", data.password)
    if (selectedFile) formData.append("profileImage", selectedFile)
    try {
      const response = await axios.post<APIResponse>("/api/sign-up", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (!response.data.success) {
        toast.error("Signup failed", { description: response.data.message });
      }
      if (response.data.success) {
        toast(response.data.message);
        router.replace(`/verify-email`)
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error("Error", { description: axiosError.response?.data.message });
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md border-2 dark:bg-slate-900 my-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Bloggs
          </h1>
          <p className="mb-4">Sign up to get in the amazing world of Bloggs.</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        className="border dark:border-gray-600"
                        placeholder="username" {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="border dark:border-gray-600"
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
                        type="password"
                        placeholder="password"
                        className="border dark:border-gray-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="profileImage"
                control={form.control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>
                      Avatar<span className="text-xs">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        className="bg-gray-300 dark:bg-gray-600"
                        onChange={(e) => {
                          if (e.target.files!.length > 0) {
                            const file = e.target.files![0];
                            if (!file) return;
                            setSelectedFile(file);
                          }
                        }}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-700 w-full dark:bg-gray-500 cursor-pointer dark:hover:bg-white text-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Existing member?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Sign In
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <Button
              onClick={() => signIn("google")}
              className="shadow-sm py-5 text-md rounded-md w-full bg-white text-gray-800 cursor-pointer border-2 hover:text-white hover:bg-gray-700"
            >
              Sign up with Google{" "}
              <Image
                src={"/google-icon.webp"}
                alt="Google"
                width={30}
                height={0}
              />
            </Button>
            <Button
              onClick={() => signIn("github")}
              className="shadow-sm py-5 text-md rounded-md w-full bg-white text-gray-800 cursor-pointer border-2 hover:text-white hover:bg-gray-700"
            >
              Sign up with Github{" "}
              <Image
                src={"/github-icon.png"}
                alt="Github"
                width={20}
                height={0}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
