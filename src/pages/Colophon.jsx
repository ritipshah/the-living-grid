import { Link } from 'react-router-dom';
import { IMAGE_CREDITS } from '../data/credits.js';
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
          The Living Grid is a hand-built React and Vite site. Its layout borrows from architectural contact sheets:
          thick black gutters, frames of unequal size, and one orange mark at a time.
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
          <h2 id="colo-img" className="label label--accent">Photographs</h2>
          <p className="colo__small">
            All architectural photographs are CC0 1.0 (public-domain dedication) images originally published on Unsplash
            and archived on Wikimedia Commons. They were resized and converted to grayscale for this site. No portrait
            photographs are used.
          </p>
          <div className="colo__table-wrap">
            <table className="colo__table">
              <thead>
                <tr>
                  <th scope="col">Frame</th>
                  <th scope="col">Original title</th>
                  <th scope="col">Photographer</th>
                  <th scope="col">License</th>
                </tr>
              </thead>
              <tbody>
                {IMAGE_CREDITS.map((c) => (
                  <tr key={c.file}>
                    <td>
                      <img src={`/images/arch/${c.file}-640.webp`} alt="" width="64" height="44" loading="lazy" />
                    </td>
                    <td>
                      <a href={c.source} target="_blank" rel="noopener noreferrer">
                        {c.title}
                        <span className="sr-only"> on Wikimedia Commons (opens in a new tab)</span>
                      </a>
                    </td>
                    <td>{c.author}</td>
                    <td>{c.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </article>
  );
}
