import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import MastBuilder from "./MastBuilder";

export const metadata: Metadata = {
  title: "Mast Builder",
  description: "Build a mast one segment at a time. Watch out for storms.",
};

export default function MastBuilderPage() {
  return (
    <AppFrame title="Mast Builder" tagline="Build your mast one segment at a time. Watch out for storms.">
      <MastBuilder />
    </AppFrame>
  );
}
