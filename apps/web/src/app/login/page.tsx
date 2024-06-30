import { Logo } from "../../components/logo";
import { SignInButton } from "../../components/sign-in-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 bg-center">
      <div className="mx-4 flex flex-col items-center justify-center gap-10 rounded-lg bg-card p-8 text-center shadow-lg">
        <Logo />
        <p className="text-lg text-muted-foreground">
          <strong>Welcome to Utter Todo!</strong>
          <br />
          To manage your tasks, you need to sign in.
        </p>
        <SignInButton />
      </div>
    </main>
  );
}
