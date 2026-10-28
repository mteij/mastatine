import CopyButton from "@/components/CopyButton";
import { MINECRAFT_HOST, MINECRAFT_MAP_URL, getMinecraftStatus } from "@/lib/minecraft";

/** Server address, live player count and map link, shown at the top of the homepage. */
export default async function MinecraftBar() {
  const status = await getMinecraftStatus();
  const players =
    status === null ? "Minecraft server" : status.online ? `${status.players} online${status.max ? ` / ${status.max}` : ""}` : "Server offline";

  return (
    <section className="mc-bar" aria-label="Minecraft server">
      <div className="mc-bar__inside">
        <div className="mc-bar__status">
          <span className={`mc-bar__dot${status?.online ? " is-online" : ""}`} aria-hidden />
          <span className="mc-bar__players">{players}</span>
        </div>
        <div className="mc-bar__address">
          <span className="mc-bar__label">Join</span>
          <code className="mc-bar__ip">{MINECRAFT_HOST}</code>
          <CopyButton value={MINECRAFT_HOST} label="Copy IP" />
        </div>
        <a href={MINECRAFT_MAP_URL} className="mc-bar__map" target="_blank" rel="noopener noreferrer">
          View the map
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
