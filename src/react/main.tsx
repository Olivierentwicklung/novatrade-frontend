import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/app';

const root = document.getElementById('root');

if (!root) {
  throw new Error('React root element is missing.');
}

createRoot(root).render(
  <StrictMode>
    <App orderId="ORD-1002" />
  </StrictMode>,
);
