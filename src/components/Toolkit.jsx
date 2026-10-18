import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHead from './SectionHead.jsx';
import { TOOLKIT } from '../data/site.js';
import { PROJECTS } from '../data/projects.js';

const byIndex = Object.fromEntries(PROJECTS.map((p) => [p.index, p]));

export default function Toolkit() {
  const [inWork, setInWork] = useState(false);

  return (
    <section id="toolkit" className="section toolkit shell" aria-labelledby="toolkit-title">
      <SectionHead no="03" kicker="Toolkit" title="Working set" id="toolkit-title">
        The tools I work with, grouped by what they&rsquo;re for. Small numbers link to the projects where the code
        confirms a tool was used.
      </SectionHead>

      <div className="toolkit__bar">
        <button type="button" className="chip" aria-pressed={inWork} onClick={() => setInWork((v) => !v)}>
          Highlight tools seen in the four projects
        </button>
      </div>

      <ol className={`toolkit__list ${inWork ? 'is-filtered' : ''}`}>
        {TOOLKIT.map((group, gi) => (
          <li key={group.id} className="toolkit__row reveal">
            <span className="toolkit__no label">{String(gi + 1).padStart(2, '0')}</span>
            <h3 className="toolkit__cat label">{group.label}</h3>
            <ul className="toolkit__tools">
              {group.tools.map((t) => (
                <li key={t.name} className={`toolkit__tool ${t.seenIn ? 'is-seen' : ''}`}>
                  <span className="toolkit__name">{t.name}</span>
                  {t.seenIn && (
                    <span className="toolkit__refs">
                      {t.seenIn.map((i) => (
                        <Link
                          key={i}
                          to={`/work/${byIndex[i].slug}`}
                          viewTransition
                          aria-label={`${t.name} in project ${i}, ${byIndex[i].shortTitle}`}
                        >
                          {i}
                        </Link>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
