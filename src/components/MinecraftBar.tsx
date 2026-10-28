import CopyButton from "@/components/CopyButton";
import { MINECRAFT_HOST, MINECRAFT_MAP_URL, getMinecraftStatus } from "@/lib/minecraft";

/** Compact server chip (live player count, address, map link) meant to float over the hero image. */
export default async function MinecraftBar() {
  const status = await getMinecraftStatus();
  const online = status?.online === true;
  const label = status === null ? "Minecraft" : online ? `${status.players} online` : "Offline";

  return (
    <div className="mc" role="group" aria-label="Minecraft server">
      <span className="mc__status">
        <span className={`mc__dot${online ? " is-online" : ""}`} aria-hidden />
        {label}
      </span>
      <code className="mc__ip">{MINECRAFT_HOST}</code>
      <CopyButton value={MINECRAFT_HOST} label="Copy" />
      <a href={MINECRAFT_MAP_URL} className="mc__map" target="_blank" rel="noopener noreferrer">
        Map<span aria-hidden> &#8599;</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
