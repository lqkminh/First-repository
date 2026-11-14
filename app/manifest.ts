import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Thánh Lễ Missa",
    short_name: "Missa",
    description: "Lịch phụng vụ và thư viện Công giáo.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f2",
    theme_color: "#5f192d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
