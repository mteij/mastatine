export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-[#1a2332] mb-6">
        About S.A. <span className="text-yellow-400">Mastatine</span>
      </h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-[#1a2332] mb-3">
            What is Mastatine?
          </h2>
          <p className="text-slate-600">
            Mastatine is a joke study association name — a play on{" "}
            <strong>Mast</strong> (the Dutch word for a transmission tower) and{" "}
            <strong>Astatine</strong>, the real study association for Advanced
            Technology at the University of Twente.
          </p>
          <p className="text-slate-600 mt-3">
            Replace &ldquo;At&rdquo; in <em>At</em>statine with{" "}
            <em>Mast</em> and you get <strong>Mastatine</strong>. Elementary,
            really.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-[#1a2332] mb-3">
            📡 The Mission
          </h2>
          <p className="text-slate-600">
            To document, celebrate, and rank every transmission tower, antenna
            mast, communication pylon, and electromagnetic structure that our
            members care to photograph and submit.
          </p>
          <p className="text-slate-600 mt-3">
            Science demands rigor. We demand masts.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-[#1a2332] mb-3">
            The Real Astatine
          </h2>
          <p className="text-slate-600">
            S.A. Astatine is the legitimate study association for the Advanced
            Technology programme at the University of Twente in Enschede, the
            Netherlands. They do actual academic things. We post pictures of
            towers. Check them out:{" "}
            <a
              href="https://astatine.utwente.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 font-semibold hover:underline"
            >
              astatine.utwente.nl ↗
            </a>
          </p>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Disclaimer:</strong> This website is a joke. S.A. Mastatine
            is not a real study association and is not affiliated with the
            University of Twente or S.A. Astatine. No academic credit is awarded
            for submitting towers. 📡
          </p>
        </div>
      </div>
    </div>
  );
}
