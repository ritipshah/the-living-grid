# Riti Shah — The Living Grid

Personal portfolio of **Riti Shah**, B.Tech (Integrated) Data Science student at SVKM's NMIMS
Mukesh Patel School of Technology Management & Engineering, Mumbai.

The site is built around one idea, **The Living Grid**: an architectural contact sheet of
black-and-white frames separated by thick black gutters. The grid is the interface itself:

- **Hero:** a 12 × 6 sheet. On desktop, the hovered frame's columns and rows widen and the
  other frames recede. Photo frames change on a slow cycle with a shutter wipe, and an
  orange marker shows the newest one. The cycle pauses on hover, off-screen, in a hidden
  tab, or when `prefers-reduced-motion` is set.
- **Selected work:** four project frames in an asymmetric layout with architectural frames
  between them. Category filters rearrange the sheet with FLIP transitions, and each frame
  opens an internal case study through a view transition.
- **Case studies** (`/work/:slug`): each has its own visual and an interactive piece based
  on the real implementation:
  - **Cyber Threat Intelligence:** a re-creation of the repository's risk-scoring rule.
  - **Nexus:** a step-by-step version of its recursive network query, on a synthetic graph.
  - **Firesense:** a chart of a real 10-minute sensor capture from the project repository.
  - **Legal Summarization:** an extractive → abstractive illustration, clearly labelled as
    an illustration.

## Stack

- React 19 + React Router 7 (data router, view transitions)
- Vite 8
- Hand-written CSS (custom properties, CSS grid, container queries); no UI framework, no
  animation library
- Original SVG for all project visuals
- `sharp` (optional, scripts only) for image processing and the Open Graph image
- ESLint 10 with the React Hooks rules

## Deploy (GitHub → Vercel, no local Node.js needed)

Vercel installs dependencies and builds the site on its own servers, so you don't need
Node.js on your computer to deploy.

1. **GitHub:** the code lives in a public repository named `the-living-grid`.
2. **Vercel:** sign in at <https://vercel.com> with GitHub, choose **Add New… → Project**,
   then **Import** `the-living-grid`. If it isn't listed, choose **Adjust GitHub App
   Permissions** and give Vercel access to that repository.
3. Leave the detected settings as they are. `vercel.json` already sets them:

   | Setting | Value |
   |---|---|
   | Framework Preset | Vite |
   | Root Directory | `./` (repository root) |
   | Install Command | `npm ci` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Node.js Version | 22.x (from `engines` in `package.json`) |
   | Environment Variables | none |

4. Click **Deploy**. The site goes live at `https://the-living-grid-<…>.vercel.app`. The
   exact domain is shown on the project page. Every later push to `main` redeploys
   automatically.

**Routing:** this is a single-page app. `vercel.json` rewrites every path that isn't a real
file to `index.html`, so opening or refreshing `/work/firesense`,
`/work/cyber-threat-intelligence`, `/colophon`, etc. works. Static files (`/assets`,
`/images`, `og-image.jpg`) are served before the rewrite applies.

## Run it locally (optional)

Requires Node.js 22.

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
npm run lint
```

Asset scripts, only needed when changing images. They use `sharp`, which isn't a project
dependency:

```bash
npm i --no-save sharp
npm run images -- <folder-with-source-jpgs>   # grayscale + resize → public/images/arch
npm run og                                    # rebuild public/og-image.jpg
```

## Structure

```
public/
  images/arch/        processed CC0 photographs (640w + 1280w WebP)
  images/CREDITS.md   photographer, title, licence and source for every image
  og-image.jpg        social preview
  favicon.svg
scripts/              image + OG generation (sharp)
src/
  data/               all copy: profile, projects, credits, Firesense session data
  components/         Nav, Hero, WorkGrid, About, Toolkit, Record, Contact, Footer
  pages/              Home, CaseStudy, Colophon, NotFound
  visuals/            per-project SVG tiles and case-study interactives
  hooks/              reduced motion, media queries, active section, document meta
  styles/             tokens/base, chrome, hero, work, sections, case, visuals
```

## Content sources

All project text was checked against source material, and nothing was invented.

| Project | Source checked | Links shown |
|---|---|---|
| Cyber Threat Intelligence System | `github.com/ritipshah/cyber-threat-intelligence-system`: server, schema, dashboard | Repository |
| Nexus Criminal Intelligence | `github.com/ritipshah/nexus-criminal-intelligence`: Express + FastAPI servers, SQL exports, generator, UI | Repository |
| Firesense | Public team repository `github.com/Rohan-Dedhia/firesense`: README, config, tests, captured data | Team repository |
| Hybrid Legal Document Summarization | Riti's project record (no public code) | None, by design |

- No live demos are linked, because no verified public deployment exists for any project.
- The GitHub username is **ritipshah**. The spelling `ritpshah` on the résumé does not exist on
  GitHub.
- Where a README described features that are not in the committed code (Nexus: triggers,
  scheduled events, some procedures), the case study leaves them out and says so.
- No accuracy figures, user counts or benchmark results appear anywhere.
- No phone number, home address or portrait photograph is published.

## Credits

**Photographs:** 11 CC0 1.0 images by Samuel Zeller, Mihail Ribkin, Osman Rana,
chuttersnap, Verne Ho, Kyaw Tun, Joel Filipe, Echo Grid and Dmitri Popov. They were first
published on Unsplash and are archived on Wikimedia Commons. CC0 does not require
attribution, but full per-image details are in
[`public/images/CREDITS.md`](public/images/CREDITS.md) and on the site's `/colophon` page.

**Typefaces:** Archivo, Instrument Serif and IBM Plex Mono, served by Google Fonts under the
SIL Open Font License 1.1.

**Data:** the Firesense chart plots `data/real_session_20260905.csv` from the Firesense
team repository.

**Tools:** written with help from an AI coding assistant (Claude), under Riti's art direction
and content decisions.
