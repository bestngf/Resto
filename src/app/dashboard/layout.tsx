import type { ReactNode } from "react";
import { RestaurantProvider } from "@/components/dashboard/RestaurantProvider";
import { Shell } from "@/components/dashboard/Shell";
import "./dashboard.css";

export const metadata = { title: "Mon restaurant · resto" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RestaurantProvider>
      <Shell>{children}</Shell>
    </RestaurantProvider>
  );
}
