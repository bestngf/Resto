import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME } from "@/config/app";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Les restaurants du Togo : menus, commandes, réservations.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#e8590c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
