import { Order } from './order';
import { OrderLine } from './order-line';

describe('Order', () => {
  it('should recognize another representation with the same identity', () => {
    const draftOrder = new Order('ORD-1001', 'Draft', [], 0);
    const submittedOrder = new Order('ORD-1001', 'Submitted', [], 0);

    expect(draftOrder.hasSameIdentityAs(submittedOrder)).toBe(true);
  });

  it('should place a draft order with products', () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    order.place();

    expect(order.status).toBe('Submitted');
  });

  it('should not place an order without products', () => {
    const order = new Order('ORD-1001', 'Draft', [], 0);

    order.place();

    expect(order.status).toBe('Draft');
  });

  it('should not place an order that is not draft', () => {
    const order = new Order('ORD-1001', 'Cancelled', [new OrderLine('Test Product', 1, 20)], 20);

    order.place();

    expect(order.status).toBe('Cancelled');
  });

  it('should cancel a submitted order', () => {
    const order = new Order('ORD-1001', 'Submitted', [new OrderLine('Test Product', 1, 20)], 20);

    order.cancel();

    expect(order.status).toBe('Cancelled');
  });
});
