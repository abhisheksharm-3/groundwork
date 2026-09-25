/** The signed-in visitor's account: what the site calls them, and the way out. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { signOutAction } from "@/modules/supabase/actions";
import { DisplayNameForm } from "@/modules/supabase/components/DisplayNameForm";

export const metadata: Metadata = { title: "Your account" };

export default function DashboardPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow="Signed in"
        title="Your account"
        lede="Your passes arrive by email with a reference to show at the desk. This is where you change how we address you."
      />
      <section aria-label="Profile" className="page grid gap-12 py-section">
        <DisplayNameForm />
        <form action={signOutAction}>
          <button type="submit" className={actionStyles("quiet")}>
            Sign out
          </button>
        </form>
      </section>
    </PageTransition>
  );
}
