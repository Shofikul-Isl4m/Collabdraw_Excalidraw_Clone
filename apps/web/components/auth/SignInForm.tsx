"use client";

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AuthHeader } from "./AuthHeader";
import { useActionState } from "react";
import { signinAction } from "@/actions/authActions";
import { Input } from "@repo/ui/components/ui/input";
import { BiInfoCircle } from "react-icons/bi";
import { Button } from "@repo/ui/components/ui/button";
import { useFormStatus } from "react-dom";
import Link from "next/link";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full hover:ring-2 hover:ring-gray-200 bg-black text-white hover:bg-black/70 ${pending ? "cursor-not-allowed border border-gray-300 text-gray-400 outline-none" : ""}`}
    >
      {pending ? "Signin in..." : "Sign In"}
    </Button>
  );
};

export default function SignInForm({
  jwtCookie,
}: {
  jwtCookie: RequestCookie | null;
}) {
  const initialState = {
    message: "",
    error: {},
  };
  const [state, formAction] = useActionState(signinAction, initialState);

  return (
    <div className="w-full max-w-[400px] p-8 rounded-2xl border border-gray-200 flex flex-col justify-between">
      <AuthHeader
        title="Welcome Back"
        description="Please enter your details to sign in"
      />
      <div className="mt-5 flex grow flex-col justify-center space-y-4">
        <div className="flex relative items-center ">
          <div className="border-t grow border-gray-200"></div>
          <div className="rounded-full text-gray-400 border text-[9px] p-1 border-gray-200">
            OR
          </div>
          <div className="border-t grow border-gray-200"></div>
        </div>
        <form action={formAction} className="space-y-2">
          {" "}
          <Input
            type="text"
            name="usename"
            placeholder="Username"
            className="w-full px-4 py-2 rounded-md"
            required
          ></Input>
          <Input
            type="text"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md"
            required
          ></Input>
          {state.message && (
            <p className="text-sm font-light text-red-500 flex items-center gap-2">
              <BiInfoCircle />
              {state.message}
            </p>
          )}
          <SubmitButton />
        </form>
      </div>
      <p className="mt-6  text-gray-500  text-center  ">
        Don't have an Account?
        <Link
          href="/signup"
          className="transition-ease underline underline-offset-2"
        >
          {" "}
          sign in
        </Link>
      </p>
    </div>
  );
}
