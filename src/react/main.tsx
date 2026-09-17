import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Order } from '../core/domain/entities/order';
import { OrderLine } from '../core/domain/value-objects/order-line';
import { App } from './app/app';

const root = document.getElementById('root');

if (!root) {
  throw new Error('React root element is missing.');
}

const order = new Order(
  'ORD-1002',
  'Submitted',
  [new OrderLine('USB-C Hub', 1, 69.99), new OrderLine('USB-C Cable', 2, 19.99)],
  109.97,
);

createRoot(root).render(
  <StrictMode>
    <App order={order} />
  </StrictMode>,
);
