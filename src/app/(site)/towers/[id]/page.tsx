import sql from "@/lib/db";
import { notFound } from "next/navigation";
import { Tower } from "@/lib/types";
import TowerDetail from "@/components/TowerDetail";

export const revalidate = 30;

export default async function TowerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let tower: Tower | null = null;
  try {
    const results = await sql<Tower[]>`SELECT * FROM towers WHERE id = ${params.id}`;
    if (results.length > 0) {
      tower = results[0];
    }
  } catch (err) {
    console.error(err);
  }

  if (!tower) {
    notFound();
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <TowerDetail tower={tower} />
    </div>
  );
}
