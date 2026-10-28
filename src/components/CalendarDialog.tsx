"use client";

import { useId, useRef } from "react";

interface CalendarDialogProps {
  webcal: string;
  google: string;
  className?: string;
}

/** Button that opens a modal with the ways to add the Mastatine calendar. */
export default function CalendarDialog({ webcal, google, className = "" }: CalendarDialogProps) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className={`cal-btn ${className}`} onClick={() => dialog.current?.showModal()}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        Add to your calendar
      </button>

      {/* A click on the backdrop lands on the <dialog> itself (it has no padding), which closes it. */}
      <dialog
        ref={dialog}
        className="cal-dialog"
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="cal-dialog__body">
          <button type="button" className="cal-dialog__close" onClick={close} aria-label="Close">&times;</button>
          <h2 id={titleId} className="cal-dialog__title">Add the Mastatine calendar</h2>
          <p className="cal-dialog__text">Subscribe once and every new activity shows up in your own calendar, always up to date.</p>
          <ul className="cal-dialog__list">
            <li><a href={webcal} onClick={close}>Apple, Outlook or another app</a></li>
            <li><a href={google} target="_blank" rel="noopener noreferrer" onClick={close}>Google Calendar<span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><a href="/calendar.ics" download onClick={close}>Download .ics file</a></li>
          </ul>
        </div>
      </dialog>
    </>
  );
}
