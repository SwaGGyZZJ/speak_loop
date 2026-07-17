import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakLoop Workplace Speaking Coach",
    short_name: "SpeakLoop",
    description: "Mobile-first AI role-play practice for workplace English.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6e3",
    theme_color: "#e8765c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
