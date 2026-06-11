import MastatineLogo from "./MastatineLogo";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-slate-400">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MastatineLogo size={36} />
              <span className="font-black text-white text-base">S.A. Mastatine</span>
            </div>
            <p className="text-sm max-w-xs">
              The premier study association for the appreciation of transmission
              towers and all things electromagnetic.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#home" className="hover:text-[#e8b800] transition-colors">Home</a></li>
              <li><a href="#towers" className="hover:text-[#e8b800] transition-colors">Mast Gallery</a></li>
              <li><a href="#submit" className="hover:text-[#e8b800] transition-colors">Submit a Mast</a></li>
              <li><a href="#about" className="hover:text-[#e8b800] transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">
              The Real One
            </h3>
            <a
              href="https://astatine.utwente.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#e8b800] transition-colors"
            >
              S.A. Astatine ↗
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 text-xs text-center">
          © {new Date().getFullYear()} S.A. Mastatine — Not affiliated with S.A. Astatine or the University of Twente.
        </div>
      </div>
    </footer>
  );
}
