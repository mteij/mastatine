import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import KlokConverter from "./KlokConverter";

export const metadata: Metadata = {
  title: "KLOK Converter",
  description: "Convert metres to KLOK, the unit of height of S.A. Mastatine.",
};

export default function KlokPage() {
  return (
    <AppFrame title="KLOK Converter" tagline="Metres are for people who do not care about drama. 1 KLOK = 0.168 m.">
      <KlokConverter />
    </AppFrame>
  );
}
