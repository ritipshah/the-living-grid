export default function SectionHead({ no, kicker, title, id, children }) {
  return (
    <header className="section-head reveal">
      <p className="section-head__no label">
        <span className="marker" /> {no} / {kicker}
      </p>
      <h2 id={id} className="section-head__title display">
        {title}
      </h2>
      {children && <div className="section-head__aside">{children}</div>}
    </header>
  );
}
