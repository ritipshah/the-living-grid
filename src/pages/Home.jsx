import Hero from '../components/Hero.jsx';
import WorkGrid from '../components/WorkGrid.jsx';
import About from '../components/About.jsx';
import Toolkit from '../components/Toolkit.jsx';
import Record from '../components/Record.jsx';
import Contact from '../components/Contact.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';

export default function Home() {
  useDocumentMeta('Riti Shah — The Living Grid');
  return (
    <>
      <Hero />
      <WorkGrid />
      <About />
      <Toolkit />
      <Record />
      <Contact />
    </>
  );
}
