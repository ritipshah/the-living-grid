import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import CaseStudy from './pages/CaseStudy.jsx';
import Colophon from './pages/Colophon.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/work.css';
import './styles/sections.css';
import './styles/case.css';
import './styles/visuals.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'work/:slug', element: <CaseStudy /> },
      { path: 'colophon', element: <Colophon /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
