"use client";

/**
 * The root layout itself failed, so there is no header, no stylesheet and no
 * fonts to lean on: this renders its own document with the system face.
 */
import type { ReactNode } from "react";

type GlobalErrorPropsType = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({
  error,
  retry,
}: GlobalErrorPropsType): ReactNode {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: "4rem 1.5rem",
        }}
      >
        <h1>The site did not load</h1>
        <p>
          {error.digest ? `Reference ${error.digest}.` : "Please try again."}
        </p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </body>
    </html>
  );
}
