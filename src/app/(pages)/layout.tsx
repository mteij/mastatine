"use client";

import { usePathname } from "next/navigation";
import { isFullScreenAppPath } from "@/lib/paths";

/** Site pages sit in a white panel on the orange background, like the homepage intro box. MastApps bring their own full-screen shell. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isFullScreenAppPath(pathname)) return <>{children}</>;
  return <div className="page-panel">{children}</div>;
}
