/** Sign in. The form reads the return path from the URL, so it renders inside a Suspense boundary. */
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { AuthForm } from "@/modules/supabase/components/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow="Your account"
        title="Sign in"
        lede="See your passes and the details we hold for you."
      />
      <section aria-label="Sign in" className="page py-section">
        <div className="max-w-md">
          <Suspense fallback={null}>
            <AuthForm mode="sign-in" />
          </Suspense>
        </div>
      </section>
    </PageTransition>
  );
}
