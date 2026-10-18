import SectionHead from './SectionHead.jsx';
import { CERTIFICATIONS, EXPERIENCE } from '../data/site.js';

function Entry({ dates, title, sub, body }) {
  return (
    <li className="record__entry reveal">
      <p className="record__dates label">{dates}</p>
      <div>
        <h4 className="record__title">{title}</h4>
        <p className="record__sub">{sub}</p>
        <p className="record__body">{body}</p>
      </div>
    </li>
  );
}

export default function Record() {
  return (
    <section id="record" className="section record shell" aria-labelledby="record-title">
      <SectionHead no="04" kicker="Record" title="Experience & certifications" id="record-title" />
      <div className="record__grid">
        <div className="record__col">
          <h3 className="record__head label label--accent">Experience</h3>
          <ol>
            {EXPERIENCE.map((e) => (
              <Entry key={e.org} dates={e.dates} title={e.role} sub={`${e.org} · ${e.place}`} body={e.body} />
            ))}
          </ol>
        </div>
        <div className="record__col">
          <h3 className="record__head label label--accent">Certifications</h3>
          <ol>
            {CERTIFICATIONS.map((c) => (
              <Entry key={c.title} dates={c.dates} title={c.title} sub={c.issuer} body={c.body} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
