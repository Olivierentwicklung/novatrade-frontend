import { OrderLine } from './order-line';

describe('OrderLine', () => {
  it('should calculate its total from quantity and unit price', () => {
    const line = new OrderLine('Test Product', 3, 20);

    expect(line.total).toBe(60);
  });
});
