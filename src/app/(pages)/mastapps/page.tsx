import type { Metadata } from "next";
import AdminAppTile from "@/components/AdminAppTile";
import AppTile from "@/components/AppTile";
import PageHeader from "@/components/ui/PageHeader";
import { getApps } from "@/content/apps";
import { getShopUrl } from "@/lib/shop";

export const metadata: Metadata = {
  title: "MastApps",
  description: "Small apps for mast enthusiasts.",
};

export default function MastAppsPage() {
  const apps = getApps(getShopUrl());

  return (
    <>
      <PageHeader title="MastApps" />
      <div className="container-page">
        <ul className="grid gap-4 sm:grid-cols-2">
          {apps.map((app) => (
            <li key={app.slug}>
              <AppTile app={app} />
            </li>
          ))}
          <AdminAppTile />
        </ul>
      </div>
    </>
  );
}
