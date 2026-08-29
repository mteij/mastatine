export default function ShopPage() {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-[#1a2332] mb-6">
        Mastatine <span className="text-[#f57f20]">Merch</span>
      </h1>

      <div className="space-y-6">
        {shopUrl ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
            <p className="text-slate-600 mb-4">
              The shop lives on our print partner&apos;s storefront — you&apos;ll
              be redirected to complete your order there.
            </p>
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange text-base px-8 py-3"
            >
              Visit the Merch Shop ↗
            </a>
          </div>
        ) : (
          <div className="bg-[#FFF3E8] rounded-xl p-6 border border-[#f57f20]/30 text-center">
            <p className="text-[#c05e00] font-semibold">
              The merch shop is coming soon. Check back shortly! 📡
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
