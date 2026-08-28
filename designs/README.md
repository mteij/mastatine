# Merch designs

Source files for print-on-demand products (Printify/Spreadshop). Brand colors
(`#f57f20` orange, `#0f2254` navy, `#1a1a1a` ink), Lato typeface. Each design has both
an `.svg` (vector source) and a `.png` (2400×2400, pre-rasterized, ready to upload).

- `logo/` — the brand mark, in three forms:
  - `accent-block-orange.svg` / `.png` — reversed white lockup on a solid orange block.
  - `footer-band-navy.svg` / `.png` — same, on solid navy.
  - `lockup-transparent.svg` / `.png` — full-color mark, no background block, so it can
    sit on top of anything (photos, colored merch, the site itself) without a colored
    box trailing it.
- `quotes/` — four quote/joke designs, transparent background so the garment color
  shows through.

## Regenerating PNGs

If an `.svg` changes, re-export its `.png` with any SVG rasterizer at 300 DPI (aim for
~2400px+ on a side). This repo has `sharp` available as a dependency, so from the
project root:

```js
require("sharp")("designs/quotes/example.svg", { density: 300 })
  .resize(2400, 2400)
  .png()
  .toFile("designs/quotes/example.png");
```

Transparency is preserved automatically for files with no background rect.
