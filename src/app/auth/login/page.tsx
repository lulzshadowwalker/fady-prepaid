"use client";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authCover from "@assets/auth-cover.jpg";
import { FormEvent } from "react";
import { login } from "@/actions/auth";
import { SubmitButton } from "./components/submit-button";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);

    const response = await login(
      form.get("username") as string,
      form.get("password") as string
    );

    if (response?.errorMessage) {
      toast({
        title: "Authentication failed", 
        description: response?.errorMessage,
      })
    }
  }

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2 content-center lg:content-stretch">
      <div className="flex items-center justify-center py-12 my-auto">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                name="username"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" placeholder="●●●●●●●●" name="password" required />
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={authCover}
          alt="Abstract"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
