interface MeetingFieldsProps {
  defaults?: { title?: string; location?: string; starts_at?: string };
}

/** Title, time and place, shared by the new-meeting and edit-meeting forms. */
export default function MeetingFields({ defaults = {} }: MeetingFieldsProps) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required maxLength={120} defaultValue={defaults.title} />
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input id="location" name="location" className="input" maxLength={200} defaultValue={defaults.location} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="starts_at">Date and time</label>
        <input id="starts_at" name="starts_at" type="datetime-local" className="input sm:max-w-xs" required defaultValue={defaults.starts_at} />
      </div>
    </>
  );
}
