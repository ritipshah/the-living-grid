// SSR entry used only by make-og.mjs: renders frames to static SVG strings.
import { renderToStaticMarkup } from 'react-dom/server';
import { TechFrame } from '../src/visuals/Frames.jsx';

export const frameSvg = (name, w, h) =>
  renderToStaticMarkup(<TechFrame name={name} w={w} h={h} />).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
