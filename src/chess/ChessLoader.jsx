import '../styles/chess-loader.css';

// Shown while the chess chunk / 3D scene loads. Lives in the main bundle so
// it can appear instantly.
export default function ChessLoader({ inline = false }) {
  return (
    <div className={`cxl ${inline ? 'cxl--inline' : ''}`} role="status" aria-live="polite">
      <div className="cxl__board" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </div>
      <p className="cxl__word">
        Chess <span>/</span> Dimension 001
      </p>
      <p className="cxl__note">Setting the board…</p>
    </div>
  );
}
