# 062 — Chair & Line website

Phase 1 implements Home and the shared visual foundation for the fictional Chair & Line Barbershop. It follows the approved v2 showcase in the Quick Sites workspace and uses all thirteen approved website images.

## Open the site

Open [index.html](index.html) in a local browser. Everything needed is inside this folder, including the font and image variants. There is no install or build step.

For development over HTTP, run this from the website folder and open http://127.0.0.1:8362/.

```powershell
python -m http.server 8362 --bind 127.0.0.1
```

## Deploy on Vercel

Import `Dyllan44/chair-and-line` and use the repository root. Choose the **Other** framework preset and leave the build command blank. The output is the repository root, which contains `index.html`. The site requires no environment variables. [Vercel documentation](https://vercel.com/docs/builds#skipping-the-build-step)

## Source and assets

- `index.html` contains the home sections and shared header, footer and icons.
- `styles/base.css` holds typography, colours, navigation and reusable components. `styles/home.css` sets the page layouts, and `styles/motion.css` covers motion and pointer feedback.
- `scripts/navigation.js` handles the mobile menu and anchor focus. `scripts/home.js` handles the Cut Book filters, appointment choices and local preview. `scripts/motion.js` powers the barber-pole reading indicator, scroll-linked rules and print-style entrances.
- `images/` contains 28 responsive JPEG variants and the favicon. In the Quick Sites workspace, run `pwsh -File .\tools\prepare-images.ps1` to regenerate the JPEGs from the concept folder’s `assets/website/` originals.
- The self-hosted Smokum typeface comes from [Google Fonts](https://github.com/google/fonts/tree/main/apache/smokum). The [font licence](fonts/LICENSE-Smokum.txt) ships with it.

## Verification and remaining work

Verified on 2026-11-20 in the in-app browser at 1440 px and 390 px wide, with a 320 px overflow check. Checks covered image loading, the sticky navigation, keyboard focus and Escape, filters, preselected service and look, required field validation, preview and edit, and FAQ disclosure. Browser fixtures also checked a simulated reduced-motion preference and a no-script fallback. Static checks covered JavaScript syntax and local references.

The appointment form only previews the selected service, look and preferred time. It collects no contact details and creates no appointment. Live use requires verified appointment policies and an enquiry or booking destination. Phase 2 is pending user review.
