import { Link } from 'react-router-dom';
import { TechFrame } from '../visuals/Frames.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';

export default function NotFound() {
  useDocumentMeta('Frame not found — Riti Shah');
  return (
    <section className="nf shell" aria-labelledby="nf-title">
      <div className="nf__tile nf__tile--missing">
        <p className="label label--accent">
          <span className="marker" /> Error 404
        </p>
        <h1 id="nf-title" className="display nf__title">
          Frame
          <br />
          not found
        </h1>
        <p className="nf__text">This page isn&rsquo;t on the sheet. It may have moved, or the address may be mistyped.</p>
        <div className="nf__actions">
          <Link to="/" className="btn btn--solid" viewTransition>
            Back to the index
          </Link>
          <Link to={{ pathname: '/', hash: '#work' }} className="btn">
            Selected work
          </Link>
        </div>
      </div>
      <div className="nf__tile nf__tile--photo" aria-hidden="true">
        <TechFrame name="samples" w={360} h={520} />
      </div>
    </section>
  );
}
