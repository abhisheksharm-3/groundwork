/** Create an account. The form reads the return path from the URL, so it renders inside a Suspense boundary. */
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { AuthForm } from "@/modules/supabase/components/AuthForm";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow="Your account"
        title="Create an account"
        lede="Keep your passes in one place, and hear first when next year's programme is out."
      />
      <section aria-label="Create an account" className="page py-section">
        <div className="max-w-md">
          <Suspense fallback={null}>
            <AuthForm mode="sign-up" />
          </Suspense>
        </div>
      </section>
    </PageTransition>
  );
}
