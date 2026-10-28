import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import CalendarSubscribe from "@/components/CalendarSubscribe";
import { formatParticipants, getActivities, subscribeState, type Activity } from "@/lib/activities";
import { formatDateTime, formatDayMonth, formatDayNumber, formatMonthShort, formatTime } from "@/lib/datetime";
import { getSession } from "@/lib/session";
import { parseSignupGroups, priceLabel } from "@/lib/signup-options";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Activities", description: "Everything the committees organise." };
export const dynamic = "force-dynamic";

/** Show "n left" once the activity is nearly full. */
const FEW_SPOTS = 5;

interface JoinCue {
  text: string;
  /** go: an invitation to join. going: already subscribed. quiet: nothing to do right now. */
  tone: "go" | "going" | "quiet";
}

/** The one-line call to action on a card: invites people to join when they still can. */
function joinCue(a: Activity): JoinCue {
  if (a.subscribed) return { text: "You're going", tone: "going" };
  const state = subscribeState(a);
  if (state === "full") return { text: "Full", tone: "quiet" };
  if (state === "closed") return { text: "Closed", tone: "quiet" };
  if (state === "not-yet" && a.subscription_opens_at) return { text: `Opens ${formatDayMonth(a.subscription_opens_at)}`, tone: "quiet" };
  const left = a.subscription_limit === null ? null : a.subscription_limit - a.participants;
  return { text: left !== null && left <= FEW_SPOTS ? `Join · ${left} left` : "Join", tone: "go" };
}

const CUE_CLASS: Record<JoinCue["tone"], string> = {
  go: "bg-accent text-accent-fg",
  going: "bg-success/10 text-success",
  quiet: "bg-soft text-muted",
};

function CueBadge({ cue }: { cue: JoinCue }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-extrabold ${CUE_CLASS[cue.tone]}`}>
      {cue.tone === "going" && <CheckIcon />}
      {cue.text}
    </span>
  );
}

export default async function ActivitiesPage() {
  const session = await getSession();
  const activities = await getActivities(session?.user.id ?? null);

  return (
    <AppFrame title="Activities" actions={<CalendarSubscribe className="cal-btn--inline" />} tagline={session ? "Everything the committees organise. Join in!" : "Everything the committees organise. Sign in to join."}>
      {activities.length === 0 ? (
        <p className="py-10 text-center text-muted">No activities yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {activities.map((a) => {
            const cue = joinCue(a);
            const price = priceLabel(a.cost_cents, parseSignupGroups(a.signup_options));
            return (
              <li key={a.id}>
                <Link href={`/mastapps/activities/${a.id}`} className={`card block h-full overflow-hidden text-ink hover:text-ink ${a.subscribed ? "!border-success" : ""}`}>
                  {/* Phones: a compact row with a thumbnail, the essentials and a clear call to action. */}
                  <div className="flex gap-3 p-3 sm:hidden">
                    {a.poster_url ? (
                      <Image src={a.poster_url} alt="" width={176} height={224} sizes="88px" className="h-28 w-[5.5rem] shrink-0 rounded-lg object-cover" />
                    ) : (
                      <time dateTime={a.starts_at.toISOString()} className="agenda__date !h-28 !w-[5.5rem] shrink-0 justify-center">
                        <span className="agenda__day !text-3xl">{formatDayNumber(a.starts_at)}</span>
                        <span className="agenda__month !text-sm">{formatMonthShort(a.starts_at)}</span>
                      </time>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h2 className="text-lg font-extrabold leading-tight">{a.name}</h2>
                      <p className="mt-0.5 text-sm font-bold text-accent-text">{formatDayMonth(a.starts_at)} · {formatTime(a.starts_at)}</p>
                      <p className="text-sm text-muted">{price}{a.location ? ` · ${a.location}` : ""}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <CueBadge cue={cue} />
                        <span className="text-xs text-muted">{formatParticipants(a)} going</span>
                      </div>
                    </div>
                  </div>

                  {/* Larger screens: the poster card. */}
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-center gap-2 border-b border-line bg-soft px-4 py-3 text-center text-lg font-bold text-accent-text">
                      {a.name}
                      {a.subscribed && <span className="text-ink" title="You are subscribed"><CheckIcon /><span className="sr-only">You are subscribed</span></span>}
                    </div>
                    <dl className="divide-y divide-line text-center text-sm">
                      <div className="px-4 py-2 text-muted">{formatDateTime(a.starts_at)}</div>
                      <div className="px-4 py-2">{price}</div>
                      <div className="px-4 py-2">Participants: {formatParticipants(a)}</div>
                      <div className="px-4 py-3"><CueBadge cue={cue} /></div>
                    </dl>
                    {a.poster_url && (
                      <Image
                        src={a.poster_url}
                        alt={`Poster for ${a.name}`}
                        width={800}
                        height={1000}
                        sizes="(max-width: 1280px) 50vw, 400px"
                        className="h-auto w-full"
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppFrame>
  );
}
