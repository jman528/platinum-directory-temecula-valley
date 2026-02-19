import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="premium-bg flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <Link href="/">
          <Image src="/logo.png" alt="Platinum Directory" width={56} height={56} className="logo-glow mx-auto mb-6" />
        </Link>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Email Verified!</h1>
        <p className="text-gray-400">
          Your email has been verified successfully. You can now sign in to your account.
        </p>
        <Link
          href="/sign-in"
          className="btn-glow mt-6 inline-block rounded-xl bg-gradient-to-r from-pd-purple to-pd-blue px-8 py-3 font-semibold text-white transition-all hover:from-pd-gold hover:to-pd-gold-light hover:text-pd-dark"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
