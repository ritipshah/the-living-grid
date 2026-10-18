import { useEffect } from 'react';

const DEFAULT_DESC =
  'Riti Shah is a Data Science student at NMIMS Mumbai working with machine learning, NLP and intelligent systems. Selected projects, case studies and contact.';

export function useDocumentMeta(title, description = DEFAULT_DESC) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
}
