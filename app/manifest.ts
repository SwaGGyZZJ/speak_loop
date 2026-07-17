import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakLoop Workplace Speaking Coach",
    short_name: "SpeakLoop",
    description: "Mobile-first AI role-play practice for workplace English.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#5b9a8e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
