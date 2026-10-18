# Riti Shah — The Living Grid

Personal portfolio of **Riti Shah**, B.Tech (Integrated) Data Science student at SVKM's NMIMS
Mukesh Patel School of Technology Management & Engineering, Mumbai.

The site is built around one idea, **The Living Grid**: a contact sheet of monochrome
technical frames separated by thick black gutters. Every frame is original SVG drawn from
the projects themselves: captured sensor data, scoring rules, graph structures and document
flows. The grid is the interface itself:

- **Hero, The Knight's Journey:** an 8 × 8 board where a knight moves by the real chess
  rules. Legal moves are highlighted. Five marked squares lead to the four projects and to
  About. Visitors can move square by square, or choose a destination, and the knight then
  takes the shortest legal route (breadth-first search) with an animated trail. An
  **Explore all projects** button skips the board entirely. Legal moves are real buttons, so
  the board works by keyboard, and moves jump instantly when `prefers-reduced-motion` is set.
- **Selected work:** four project frames in an asymmetric layout with technical frames
  between them. Category filters rearrange the sheet with FLIP transitions, and each frame
  opens an internal case study through a view transition.
- **Case studies** (`/work/:slug`): each has its own visual and an interactive piece based
  on the real implementation:
  - **Cyber Threat Intelligence:** a re-creation of the repository's risk-scoring rule.
  - **Nexus:** a step-by-step version of its recursive network query, on a synthetic graph.
  - **Firesense:** a chart of a real 10-minute sensor capture from the project repository.
  - **Legal Summarization:** an extractive → abstractive illustration, clearly labelled as
    an illustration.
- **About:** Riti's photograph is shown in grayscale inside a contact-sheet frame, with the
  original colour on hover. It sits beside her introduction, education and interests.

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
npm run images   # crop assets-src/riti-shah-portrait.png → public/images/portrait/riti-shah.webp
npm run og       # rebuild public/og-image.jpg from the technical frames
```

## Structure

```
public/
  images/portrait/    Riti's portrait (cropped, not retouched)
  og-image.jpg        social preview, generated from the frames
  favicon.svg
scripts/              portrait + OG generation (sharp, run on demand)
src/
  data/               all copy, plus Firesense session data and the illustrative Nexus graph
  components/         Nav, Hero (knight board), WorkGrid, About, Record, Contact, Footer
  pages/              Home, CaseStudy, Colophon, NotFound
  visuals/            per-project SVG tiles, case-study interactives, Frames.jsx (grid frames)
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
- No phone number or home address is published.
- The only photograph on the site is Riti's own portrait, which she supplied.
- No frame is presented as an application screenshot. Synthetic and illustrative frames
  are labelled as such.

## Credits

**Images:** every frame is an original SVG made for this site. The portrait is a
photograph supplied by Riti Shah. The `/colophon` page lists every frame and its source.

**Typefaces:** Archivo, Instrument Serif and IBM Plex Mono, served by Google Fonts under the
SIL Open Font License 1.1.

**Data:** the Firesense chart and frames plot `data/real_session_20260905.csv` from the Firesense
team repository.

**Tools:** written with help from an AI coding assistant (Claude), under Riti's art direction
and content decisions.
