import { Order } from './order';

describe('Order', () => {
  it('should recognize another representation with the same identity', () => {
    const draftOrder = new Order('ORD-1001', 'Draft');
    const submittedOrder = new Order('ORD-1001', 'Submitted');

    expect(draftOrder.hasSameIdentityAs(submittedOrder)).toBe(true);
  });
});
