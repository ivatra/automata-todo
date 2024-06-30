"use client";
import Image from "next/image";
import githublogo from "../assets/github-logo.svg";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session } = useSession()

  const handleSignIn = () => {
    // after successful authentication, redirect the user to /tasks
    // if there's an existing session, sign out first so the provider prompts for account choice
    const doSignIn = async () => {
      if (session) {
        // sign out client-side but don't redirect the user — we'll immediately start sign-in
        await signOut({ redirect: false })
      }
      signIn("github", { callbackUrl: '/tasks' })
    }

    void doSignIn()
  };
  return (
    <Button variant="outline" className="flex gap-2" size="lg" onClick={handleSignIn}>
      <Image
        className="dark:invert"
        src={githublogo}
        alt="GitHub logo"
        width={24}
        height={24}
      />
      Sign-in with GitHub
    </Button>
  );
}
