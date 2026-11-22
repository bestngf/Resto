import type { ReactNode } from "react";
import NgfBar from "@/components/brand/NgfBar";

export default function LivreurLayout({ children }: { children: ReactNode }) {
  return (<><NgfBar />{children}</>);
}
