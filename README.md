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
- `scripts/navigation.js` handles the mobile menu and anchor focus. `scripts/home.js` handles the Cut Book filters, appointment choices and local preview. `scripts/motion.js` powers the scroll reveals, spinning barber pole, service ticker, process track, parallax, card tilt and floating appointment button.
- `images/` contains 28 responsive JPEG variants and the favicon. In the Quick Sites workspace, run `pwsh -File .\tools\prepare-images.ps1` to regenerate the JPEGs from the concept folder’s `assets/website/` originals.
- The self-hosted Smokum typeface comes from [Google Fonts](https://github.com/google/fonts/tree/main/apache/smokum). The [font licence](fonts/LICENSE-Smokum.txt) ships with it.

## Motion upgrade (2026-11-26)

The motion pass replaces the original subtle entrances with a barber-pole system modelled on Copperline (031).

- **Barber pole:** a pole beside the hero headline spins continuously and speeds up as you scroll. The same stripes run through the header reading rule, fill the chair-to-finish track (vertical on phones), light each step and draw along the top of the closing band.
- **Service ticker:** a decorative ink band of service names between the barbers and the process. It speeds up on scroll and pauses on hover. It is hidden from assistive technology.
- **Photo reveals:** photos wipe open and warm from sepia like developing prints. The two story prints drop in at a steep angle, drift on scroll and straighten on hover.
- **Interaction:** a razor line and nudge on service rows, button shine, Cut Book card tilt and spotlight on fine pointers, and bolder filter transitions. Picking a service or look flashes the matching form field.
- **Floating appointment button:** on phones it appears after the hero and hides before the closing band.

The pole and ticker loops pause offscreen and in background tabs. Reveals use the `.motion` head-script opt-in with a 3-second failsafe, show focused content immediately and reveal anything skipped by a fast scroll. With reduced motion, everything is static.

Verified on 2026-11-26 in the in-app browser at 1024 px and 375 px. Checks covered reveals in every section, pole and ticker movement, process track and step lighting, service/look pre-selection with flash, filters, floating-button visibility, no horizontal overflow, a static no-`.motion` fallback with nothing left hidden, and no console errors. The browser pane was hidden during the check, which throttles animation timing, so check pacing on a real device before publishing.

## Verification and remaining work

Verified on 2026-11-20 in the in-app browser at 1440 px and 390 px wide, with a 320 px overflow check. Checks covered image loading, the sticky navigation, keyboard focus and Escape, filters, preselected service and look, required field validation, preview and edit, and FAQ disclosure. Browser fixtures also checked a simulated reduced-motion preference and a no-script fallback. Static checks covered JavaScript syntax and local references.

The appointment form only previews the selected service, look and preferred time. It collects no contact details and creates no appointment. Live use requires verified appointment policies and an enquiry or booking destination. Phase 2 is pending user review.
