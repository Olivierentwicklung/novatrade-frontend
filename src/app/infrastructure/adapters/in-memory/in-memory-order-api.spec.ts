import { InMemoryOrderApi } from './in-memory-order-api';

describe('InMemoryOrderApi', () => {
  it('should remember a placed order', async () => {
    const orderApi = new InMemoryOrderApi();

    await orderApi.placeOrder('ORD-1001');

    expect(orderApi.placedOrderIds).toContain('ORD-1001');
  });

  it('should remember a cancelled order', async () => {
    const orderApi = new InMemoryOrderApi();

    await orderApi.cancelOrder('ORD-1001');

    expect(orderApi.cancelledOrderIds).toContain('ORD-1001');
  });
});
