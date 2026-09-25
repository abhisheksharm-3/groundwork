/**
 * The share card, generated from the site's facts so every project gets one
 * without opening a design tool: the hero photograph with the name, dates and
 * city set over a scrim.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site-config";

export const alt = `${SITE.name} ${SITE.edition}, ${SITE.dates.label}, ${SITE.venue.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Read once at module load, not per request, so the card prerenders at build. */
const PHOTO = `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "src/assets/images/loom.jpg"))).toString("base64")}`;

export default function OpenGraphImage(): ImageResponse {
  const { ground, ink, accent, quiet } = SITE.chrome;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: ground,
      }}
    >
      <img
        src={PHOTO}
        alt=""
        width={520}
        height={630}
        style={{ objectFit: "cover" }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          color: ink,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {SITE.dates.label}
        </div>
        <div style={{ fontSize: 150, lineHeight: 1, marginTop: 24 }}>
          {SITE.name}
        </div>
        <div style={{ fontSize: 34, marginTop: 28, color: quiet }}>
          {SITE.tagline}
        </div>
      </div>
    </div>,
    size,
  );
}
