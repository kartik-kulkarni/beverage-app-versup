import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mb-2 text-4xl">🥃</div>
        <CardTitle className="font-[family-name:var(--font-playfair)] text-2xl">
          Create Account
        </CardTitle>
        <CardDescription>
          Sign up to start hosting tasting sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
