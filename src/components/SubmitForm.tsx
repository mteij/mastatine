"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type FormState = "idle" | "compressing" | "uploading" | "submitting" | "success" | "error";

interface SubmitFormProps {
  onSuccess?: () => void;
}

const MAX_DIM = 1920;
const JPEG_QUALITY = 0.82;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Image compression failed"));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export default function SubmitForm({ onSuccess }: SubmitFormProps = {}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Image must be smaller than 20 MB.");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const title = (data.get("title") as string).trim();
    const description = (data.get("description") as string).trim();
    const submitter_name = (data.get("submitter_name") as string).trim();
    const file = fileRef.current?.files?.[0];

    if (!title || !submitter_name || !file) {
      setErrorMsg("Please fill in all required fields and select a photo.");
      return;
    }

    try {
      setState("compressing");
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], "photo.jpg", { type: "image/jpeg" });

      setState("uploading");
      const uploadForm = new FormData();
      uploadForm.append("file", compressedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error ?? "Image upload failed");
      }

      const { url } = await uploadRes.json();

      setState("submitting");
      const submitRes = await fetch("/api/towers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, submitter_name, image_url: url }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json();
        throw new Error(err.error ?? "Submission failed");
      }

      setState("success");
      if (onSuccess) {
        setTimeout(onSuccess, 1400);
      } else {
        setTimeout(() => router.push("/towers"), 2000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">📡</div>
        <h2 className="text-xl font-black text-[#1a2332] mb-2">Mast submitted!</h2>
        <p className="text-slate-500">
          {onSuccess ? "Closing…" : "Redirecting to the gallery…"}
        </p>
      </div>
    );
  }

  const isLoading =
    state === "compressing" || state === "uploading" || state === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="submitter_name"
          required
          placeholder="e.g. Jan de Vries"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f57f20] focus:border-transparent"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Mast title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. The Gerbrandy Tower, IJsselstein"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f57f20] focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Description{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Tell us something interesting about this mast — height, purpose, location, why it's spectacular…"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f57f20] focus:border-transparent resize-none"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Photo <span className="text-red-500">*</span>
        </label>
        <div
          className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#f57f20] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <p className="text-xs text-slate-400 mt-2">Click to change</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📷</div>
              <p className="text-slate-600 font-medium text-sm">Click to select a photo</p>
              <p className="text-slate-400 text-xs mt-1">JPG, PNG, WebP — up to 20 MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-orange py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "compressing"
          ? "Optimising image…"
          : state === "uploading"
          ? "Uploading photo…"
          : state === "submitting"
          ? "Submitting mast…"
          : "Submit Mast 📡"}
      </button>
    </form>
  );
}
