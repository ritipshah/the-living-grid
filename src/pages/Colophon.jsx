import { Link } from 'react-router-dom';
import { FRAMES, TechFrame } from '../visuals/Frames.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';

export default function Colophon() {
  useDocumentMeta('Colophon & credits — Riti Shah', 'How this site was made, and credits for the photographs used.');
  return (
    <article className="colo shell">
      <header className="colo__head">
        <nav className="cs__crumbs label" aria-label="Breadcrumb">
          <Link to="/">← Index</Link>
        </nav>
        <h1 className="display colo__title">Colophon</h1>
        <p className="colo__lede">
          The Living Grid is a hand-built React and Vite site. Its layout borrows from photographic contact sheets:
          thick black gutters, frames of unequal size and one orange mark at a time. Every frame shows the work itself.
        </p>
      </header>

      <div className="colo__grid">
        <section className="colo__block" aria-labelledby="colo-type">
          <h2 id="colo-type" className="label label--accent">Type</h2>
          <ul>
            <li><b>Archivo</b>, variable width and weight, for display and text</li>
            <li><b>Instrument Serif</b> italic, for editorial accents</li>
            <li><b>IBM Plex Mono</b>, for labels and data</li>
          </ul>
          <p className="colo__small">All three via Google Fonts, under the SIL Open Font License.</p>
        </section>
        <section className="colo__block" aria-labelledby="colo-build">
          <h2 id="colo-build" className="label label--accent">Build</h2>
          <ul>
            <li>React, React Router, Vite</li>
            <li>Custom CSS grid, no UI framework</li>
            <li>Project visuals are original SVG; the Firesense chart plots a real captured session from that project&rsquo;s repository</li>
          </ul>
        </section>
        <section className="colo__block colo__block--wide" aria-labelledby="colo-img">
          <h2 id="colo-img" className="label label--accent">Frames &amp; images</h2>
          <p className="colo__small">
            All frames are original SVG drawn in the browser. The source of each one is stated in its caption: captured
            sensor data from the Firesense repository, the scoring rule from the Cyber Threat Intelligence repository, an
            illustrative synthetic-ID graph for Nexus, and illustrations for the legal-summarization project. None of them
            is a screenshot. The portrait in the About section is a photograph supplied by Riti, cropped but not
            retouched.
          </p>
          <ul className="colo__frames">
            {Object.entries(FRAMES).map(([key, f]) => (
              <li key={key}>
                <div className="colo__thumb" aria-hidden="true">
                  <TechFrame name={key} w={200} h={140} />
                </div>
                <p className="label">
                  Fr. {f.no} · {f.title}
                </p>
                <p className="colo__small">{f.source}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
