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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { APIResponse } from "@/utils/ApiResponse";
import { useDebounceValue } from "usehooks-ts";

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [debouncedUsername] = useDebounceValue(usernameInput, 500); // 500ms
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }
    const checkUsername = async () => {
      setCheckingUsername(true);
      try {
        const response = (
          await axios.get(`/api/sign-up/check-unique?username=${debouncedUsername}`)
        ).data;
        setUsernameAvailable(response.success)
      } catch (error) {
        console.log("Error", error)
      } finally {
        setCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

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
                        placeholder="username"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(e);
                          setUsernameInput(value);

                          if (value.length >= 3) {
                            setCheckingUsername(true);
                            setUsernameAvailable(null);
                          } else {
                            setCheckingUsername(false);
                            setUsernameAvailable(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value.length >= 3 && (
                      <div className="text-sm">
                        {checkingUsername
                          ? <div className="flex gap-1 items-center">
                              <p>Checking</p>
                              <Loader2 className="animate-spin h-4 w-4" />
                            </div>
                          : usernameAvailable === null
                            ? ""
                            : usernameAvailable
                              ? <p className="text-green-600 flex items-center gap-1">
                                  <span>Username is available</span>
                                  <CircleCheck size={18} />
                                </p>
                              : <p className="text-red-600 flex items-center gap-1">
                                  <span>Username is already taken</span>
                                  <CircleX size={18} />
                                </p>
                        }
                      </div>
                    )}
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
                render={({ field: { onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>
                      Avatar<span className="text-xs">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        className="bg-gray-300 dark:bg-gray-600"
                        onChange={(e) => {
                          onChange(e);
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
              Sign in with Google{" "}
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
              Sign in with Github{" "}
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
