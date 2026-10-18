import { Link, useParams } from 'react-router-dom';
import { PROJECTS, getProject } from '../data/projects.js';
import { VISUALS } from '../visuals/index.js';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';
import NotFound from './NotFound.jsx';

function Pipeline({ stages, caption }) {
  return (
    <figure className="pipe">
      <ol className="pipe__stages" style={{ '--n': stages.length }}>
        {stages.map((s, i) => (
          <li key={s.name} className={`pipe__stage ${s.accent ? 'is-accent' : ''}`}>
            <span className="label">{String(i + 1).padStart(2, '0')}</span>
            <span className="pipe__name">{s.name}</span>
            <span className="pipe__detail">{s.detail}</span>
          </li>
        ))}
      </ol>
      {caption && <figcaption className="cs__caption">{caption}</figcaption>}
    </figure>
  );
}

function SectionBody({ s, Interactive }) {
  switch (s.kind) {
    case 'text':
      return (
        <div className="cs__prose">
          {s.paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );
    case 'interactive':
      return (
        <>
          <div className="cs__interactive">
            <Interactive />
          </div>
          <p className="cs__caption">{s.caption}</p>
        </>
      );
    case 'list':
    case 'decisions':
      return (
        <ol className={`cs__items ${s.kind === 'decisions' ? 'cs__items--decisions' : ''}`}>
          {s.items.map((it, i) => (
            <li key={it.head}>
              <span className="label">{String(i + 1).padStart(2, '0')}</span>
              <h4>{it.head}</h4>
              <p>{it.body}</p>
            </li>
          ))}
        </ol>
      );
    case 'pipeline':
      return <Pipeline stages={s.stages} caption={s.caption} />;
    case 'groups':
      return (
        <>
          <p className="cs__prose cs__lead-in">{s.intro}</p>
          <div className="cs__groups">
            {s.groups.map((g) => (
              <div key={g.name} className="cs__group">
                <p className="label label--accent">{g.name}</p>
                <ul>
                  {g.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {s.footnote && <p className="cs__caption">{s.footnote}</p>}
        </>
      );
    case 'confirmed':
      return (
        <div className="cs__confirmed">
          <p className="label label--accent">
            <span className="marker" /> Confirmed from the project record
          </p>
          <ul>
            {s.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {s.footnote && <p className="cs__caption">{s.footnote}</p>}
        </div>
      );
    case 'background':
      return (
        <div className="cs__background">
          <p className="cs__flag label">General background · not project results</p>
          <p className="cs__prose cs__lead-in">{s.intro}</p>
          <ol className="cs__items">
            {s.items.map((it, i) => (
              <li key={it.head}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <h4>{it.head}</h4>
                <p>{it.body}</p>
              </li>
            ))}
          </ol>
        </div>
      );
    case 'note':
      return (
        <ul className="cs__notes">
          {s.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default function CaseStudy() {
  const { slug } = useParams();
  const project = getProject(slug);
  useDocumentMeta(
    project ? `${project.title} — Riti Shah` : 'Not found — Riti Shah',
    project ? project.short : undefined,
  );
  if (!project) return <NotFound />;

  const { Tile, Interactive } = VISUALS[project.slug];
  const i = PROJECTS.indexOf(project);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  return (
    <article className="cs shell" data-project={project.slug}>
      <header className="cs__head">
        <nav className="cs__crumbs label" aria-label="Breadcrumb">
          <Link to={{ pathname: '/', hash: '#work' }}>← Selected work</Link>
          <span aria-hidden="true">/</span>
          <span>
            Case study {project.index} of {String(PROJECTS.length).padStart(2, '0')}
          </span>
        </nav>

        <div className="cs__title-block">
          <p className="cs__index" aria-hidden="true">
            {project.index}
          </p>
          <h1 className="cs__title display">{project.title}</h1>
          <p className="cs__lede">{project.lede}</p>
        </div>

        <aside className="cs__meta" aria-label="Project facts">
          <dl>
            <div>
              <dt className="label">Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt className="label">Type</dt>
              <dd>{project.type}</dd>
            </div>
            <div>
              <dt className="label">Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd>
                <ul className="cs__stack">
                  {project.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          {project.teamNote && <p className="cs__team">{project.teamNote}</p>}
          {project.links.length > 0 ? (
            <ul className="cs__links">
              {project.links.map((l) => (
                <li key={l.href}>
                  <a className="btn btn--solid" href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cs__nolink label">No public repository or demo for this project</p>
          )}
        </aside>
      </header>

      <div className="cs__hero" style={{ viewTransitionName: `visual-${project.slug}` }} aria-hidden="true">
        <Tile />
      </div>

      <div className="cs__body">
        {project.sections.map((s, n) => (
          <section key={s.label + n} className={`cs__section cs__section--${s.kind} reveal`} aria-labelledby={`cs-${n}`}>
            <div className="cs__label">
              <span className="label label--accent">{String(n + 1).padStart(2, '0')}</span>
              <span className="label">{s.label}</span>
            </div>
            <div className="cs__content">
              <h2 id={`cs-${n}`} className="cs__h2">
                {s.title}
              </h2>
              <SectionBody s={s} Interactive={Interactive} />
            </div>
          </section>
        ))}
      </div>

      <nav className="cs__next" aria-label="More case studies">
        <Link to={`/work/${prev.slug}`} viewTransition className="cs__next-link">
          <span className="label">← Previous · {prev.index}</span>
          <span className="cs__next-title">{prev.title}</span>
        </Link>
        <Link to={`/work/${next.slug}`} viewTransition className="cs__next-link cs__next-link--next">
          <span className="label">Next · {next.index} →</span>
          <span className="cs__next-title">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
}
