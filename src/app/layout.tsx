import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/ngf.css";
import { APP_NAME } from "@/config/app";
import RegisterSW from "@/components/RegisterSW";
import NgfSplash from "@/components/brand/NgfSplash";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Les restaurants du Togo : menus, commandes, réservations. Par New Generation Form.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icons/icon-180.png" },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F5F3EE" }, { media: "(prefers-color-scheme: dark)", color: "#08080B" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap" />
      </head>
      <body>
        {children}
        <RegisterSW />
        <NgfSplash />
      </body>
    </html>
  );
}
