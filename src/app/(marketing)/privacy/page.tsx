/** What the site collects, why, who else handles it, and how to have it removed. Its list of processors follows the modules the project kept. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { Prose } from "@/components/site/Prose";
import { formatDayMonth } from "@/lib/format";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage(): ReactNode {
  const { organiser, contact } = SITE;
  return (
    <PageTransition>
      <PageMast
        eyebrow={`Updated ${formatDayMonth(SITE.policiesUpdated)}`}
        title="Privacy"
        lede={`What ${organiser.legalName} collects through this site, and what it does with it.`}
      />
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>
            The name, email address and message you send through the contact
            form.
          </li>
          <li>
            When you buy a pass: your name, email address and mobile number.
          </li>
          <li>
            When you create an account: your email address and the name you ask
            us to use.
          </li>
        </ul>
        <p>
          We do not use advertising cookies or tracking pixels, and we do not
          sell or share your details for marketing.
        </p>
        <h2>Why</h2>
        <p>
          To answer your message, to issue and check your pass, and to tell you
          about changes to the event you are coming to.
        </p>
        {SITE.processors.length > 0 ? (
          <>
            <h2>Who else handles it</h2>
            <ul>
              {SITE.processors.map((processor) => (
                <li key={processor.name}>
                  {processor.name}, which {processor.purpose}, in{" "}
                  {processor.location}.
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <h2>How long we keep it</h2>
        <p>
          Pass records for as long as tax law requires, and contact messages for
          a year. Anything else, until you ask us to delete it.
        </p>
        <h2>Your rights</h2>
        <p>
          Under India's Digital Personal Data Protection Act you can ask what we
          hold about you, correct it, or have it erased. Write to{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> and we will
          answer within 30 days.
        </p>
        <p>
          {organiser.legalName}, {organiser.address}.
        </p>
      </Prose>
    </PageTransition>
  );
}
