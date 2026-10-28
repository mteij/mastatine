import CopyButton from "@/components/CopyButton";
import { MINECRAFT_HOST, MINECRAFT_MAP_URL, getMinecraftStatus } from "@/lib/minecraft";

/** A pixel grass block, drawn inline so the card needs no image. */
function BlockIcon() {
  return (
    <svg viewBox="0 0 8 8" className="mc__icon" shapeRendering="crispEdges" aria-hidden>
      <rect width="8" height="8" fill="#7a5230" />
      <rect width="8" height="3" fill="#4fae3d" />
      <rect x="0" y="3" width="1" height="1" fill="#4fae3d" />
      <rect x="3" y="3" width="2" height="1" fill="#4fae3d" />
      <rect x="6" y="3" width="2" height="1" fill="#4fae3d" />
      <rect x="1" y="5" width="1" height="1" fill="#654126" />
      <rect x="4" y="6" width="2" height="1" fill="#654126" />
      <rect x="6" y="4" width="1" height="1" fill="#8d6139" />
      <rect x="2" y="1" width="1" height="1" fill="#3e8f2f" />
      <rect x="5" y="0" width="1" height="1" fill="#3e8f2f" />
    </svg>
  );
}

/** Server address, live player count and map link, shown at the top of the homepage. */
export default async function MinecraftBar() {
  const status = await getMinecraftStatus();
  const online = status?.online === true;
  const label = status === null ? "Status unknown" : online ? `${status.players} online${status.max ? ` of ${status.max}` : ""}` : "Offline";

  return (
    <section className="mc" aria-labelledby="mc-title">
      <div className="mc__card">
        <BlockIcon />
        <div className="mc__info">
          <div className="mc__head">
            <h2 id="mc-title" className="mc__title">Join our Minecraft server</h2>
            <span className={`mc__pill${online ? " is-online" : ""}`}>
              <span className="mc__dot" aria-hidden />
              {label}
            </span>
          </div>
          <div className="mc__field">
            <code className="mc__ip">{MINECRAFT_HOST}</code>
            <CopyButton value={MINECRAFT_HOST} label="Copy" />
          </div>
        </div>
        <a href={MINECRAFT_MAP_URL} className="mc__map" target="_blank" rel="noopener noreferrer">
          Open the live map &rarr;
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
