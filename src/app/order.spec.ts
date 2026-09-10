import { Order } from './order';

describe('Order', () => {
  it('should recognize another representation with the same identity', () => {
    const draftOrder = new Order('ORD-1001', 'Draft', [], 0);
    const submittedOrder = new Order('ORD-1001', 'Submitted', [], 0);

    expect(draftOrder.hasSameIdentityAs(submittedOrder)).toBe(true);
  });
});
