import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import { agendaToText, getItems } from "@/lib/meetings";
import { saveAgenda } from "../../../actions";
import { loadMeeting } from "../access";

export const metadata: Metadata = { title: "Edit agenda", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditAgendaPage(props: { params: Promise<{ id: string }> }) {
  const { meeting } = await loadMeeting(props.params);
  const items = await getItems(meeting.id);

  return (
    <AppFrame title="Edit agenda" tagline={meeting.title}>
      <form action={saveAgenda} className="card space-y-5 p-6 sm:p-8">
        <input type="hidden" name="id" value={meeting.id} />
        <div>
          <label className="label" htmlFor="agenda">Agenda</label>
          <textarea id="agenda" name="agenda" className="input min-h-72 font-mono" defaultValue={agendaToText(items)} />
          <p className="hint mt-1 text-muted">
            One item per line. Start a line with “-” to make it a sub-item. Notes stay with an item as long as you keep its title.
          </p>
        </div>
        <button type="submit" className="btn btn-primary">Save agenda</button>
      </form>
    </AppFrame>
  );
}
