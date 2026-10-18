import SectionHead from './SectionHead.jsx';
import { EDUCATION, INTERESTS, PORTRAIT } from '../data/site.js';

export default function About() {
  return (
    <section id="about" className="section about shell" aria-labelledby="about-title">
      <SectionHead no="02" kicker="About" title="Background" id="about-title">
        What I study, what I care about, and how I like to work.
      </SectionHead>

      <div className="about__grid">
        <div className="about__statement reveal">
          <p>
            I&rsquo;m drawn to problems where data has to <span className="serif">survive contact</span> with a real
            system.
          </p>
        </div>

        <div className="about__text reveal">
          <p>
            I&rsquo;m studying for an integrated B.Tech in Data Science at NMIMS Mukesh Patel School of Technology
            Management &amp; Engineering in Mumbai. The coursework runs through statistics, machine learning, data
            structures and database systems, and I&rsquo;ve learned the most by putting those pieces together in
            projects.
          </p>
          <p>
            My interest is AI and data-driven systems, including the less visible parts: how events are stored, how a
            score is computed and explained, and how a model&rsquo;s output reaches the person who has to act on it.
            That&rsquo;s why my projects usually include the schema and the interface, not only the model.
          </p>
          <p>
            I work mostly in Python, with NumPy, Pandas, Scikit-learn and SciPy for analysis and modelling, and Matplotlib,
            Seaborn, Tableau and Power BI for visualization. For databases I use MySQL and PostgreSQL, alongside C++,
            JavaScript, React.js and Next.js, in Jupyter, Google Colab and VS Code.
          </p>
          <p>I&rsquo;m open to internships and research opportunities in machine learning, NLP and applied analytics.</p>
        </div>

        <div className="about__portrait reveal">
          <figure className="portrait">
            <div className="portrait__frame">
              <img
                src={PORTRAIT.src}
                alt={PORTRAIT.alt}
                width={PORTRAIT.w}
                height={PORTRAIT.h}
                loading="lazy"
                decoding="async"
              />
              <span className="portrait__corner" aria-hidden="true" />
            </div>
            <figcaption className="portrait__caption label">
              <span>Fr. 00</span>
              <span>Riti Shah · Data Science, NMIMS</span>
            </figcaption>
          </figure>
          <div className="interests">
            <p className="label label--accent">Interests</p>
            <ul>
              {INTERESTS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="edu reveal">
          <p className="label label--accent">Education</p>
          <dl className="edu__list">
            <div>
              <dt className="label">Degree</dt>
              <dd>{EDUCATION.degree}</dd>
            </div>
            <div>
              <dt className="label">Institution</dt>
              <dd>
                {EDUCATION.school}, {EDUCATION.city}
              </dd>
            </div>
            <div className="edu__pair">
              <div>
                <dt className="label">Expected graduation</dt>
                <dd className="edu__big">{EDUCATION.graduation}</dd>
              </div>
              <div>
                <dt className="label">CGPA</dt>
                <dd className="edu__big">{EDUCATION.cgpa}</dd>
              </div>
            </div>
            <div>
              <dt className="label">Coursework</dt>
              <dd>
                <ul className="edu__courses">
                  {EDUCATION.coursework.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
