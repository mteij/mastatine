import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1a2332] mb-2">
          📡 Submit a Mast
        </h1>
        <p className="text-slate-500">
          Found an impressive transmission tower, antenna mast, or other
          electromagnetic structure? Share it with the Mastatine community!
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SubmitForm />
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h2 className="font-bold text-yellow-800 text-sm mb-1">
          📋 Submission Guidelines
        </h2>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Must be a real transmission tower, mast, or antenna structure</li>
          <li>• Photo must clearly show the mast</li>
          <li>• Add a fun or descriptive title</li>
          <li>• No duplicates — check if it&apos;s already been submitted</li>
        </ul>
      </div>
    </div>
  );
}
