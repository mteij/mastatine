"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SubmitForm from "./SubmitForm";

export default function SubmitModal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function openModal() {
    setDone(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function handleSuccess() {
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      // scroll to gallery after the modal closes
      const el = document.getElementById("towers");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 1500);
  }

  // ESC key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="continue-reading-link"
        style={{ backgroundColor: "var(--orange)" }}
      >
        Submit a Mast
      </button>

      {open && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 998,
            }}
          />

          {/* Dialog */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: "1em",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "#fff",
                maxWidth: 580,
                width: "100%",
                padding: "2em",
                position: "relative",
                maxHeight: "92vh",
                overflowY: "auto",
                pointerEvents: "auto",
              }}
            >
              {/* Close */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "0.6em",
                  right: "0.8em",
                  background: "none",
                  border: "none",
                  fontSize: "1.8em",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                ×
              </button>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "Lato, Arial, sans-serif",
                  fontSize: "100%",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  textAlign: "center",
                  margin: "0 0 1.5em",
                  paddingBottom: "0.75em",
                  borderBottom: "1px solid #eee",
                  letterSpacing: "0.05em",
                }}
              >
                Submit a Mast
              </h3>

              {done ? (
                <div style={{ textAlign: "center", padding: "1.5em 0" }}>
                  <div style={{ fontSize: "3em", marginBottom: "0.4em" }}>📡</div>
                  <p style={{ fontWeight: 700, fontSize: "1.1em", color: "var(--navy)" }}>
                    Mast submitted!
                  </p>
                  <p style={{ color: "var(--text-mid)", marginTop: "0.4em", fontSize: "0.9em" }}>
                    Scroll down to see it in the gallery…
                  </p>
                </div>
              ) : (
                <SubmitForm onSuccess={handleSuccess} />
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
