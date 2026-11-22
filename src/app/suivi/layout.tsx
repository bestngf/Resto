import type { ReactNode } from "react";
import NgfFooter from "@/components/brand/NgfFooter";

export default function SuiviLayout({ children }: { children: ReactNode }) {
  return (<>{children}<NgfFooter /></>);
}
