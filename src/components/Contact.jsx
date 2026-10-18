import { useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { PROFILE } from '../data/site.js';
import { FRAMES, TechFrame } from '../visuals/Frames.jsx';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="section contact shell" aria-labelledby="contact-title">
      <SectionHead no="05" kicker="Contact" title="Write to me" id="contact-title">
        For internships, research work, collaborations or questions about a project. Email is the best way to reach me.
      </SectionHead>

      <div className="contact__grid">
        <div className="contact__mail reveal">
          <p className="label">Email</p>
          <a className="contact__address" href={`mailto:${PROFILE.email}`}>
            <span>ritishahp</span>
            <span>@gmail.com</span>
          </a>
          <div className="contact__actions">
            <a className="btn btn--solid" href={`mailto:${PROFILE.email}`}>
              Compose email <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="btn" onClick={copy}>
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? 'Email address copied to clipboard' : ''}
            </span>
          </div>
        </div>

        <a className="contact__link contact__link--li reveal" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
          <span className="label">LinkedIn</span>
          <span className="contact__link-name">in/ritishahp</span>
          <span className="contact__link-arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>

        <a className="contact__link contact__link--gh reveal" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
          <span className="label">GitHub</span>
          <span className="contact__link-name">@{PROFILE.githubHandle}</span>
          <span className="contact__link-arrow" aria-hidden="true">
            ↗
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>

        <figure className="contact__photo" aria-hidden="true">
          <TechFrame name="barcode" w={460} h={230} />
          <span className="work__photo-tag label">
            Fr. {FRAMES.barcode.no} · {FRAMES.barcode.source}
          </span>
        </figure>
      </div>
    </section>
  );
}
