import { RestOrderApi } from './rest-order-api';

describe('RestOrderApi', () => {
  it('should send an order placement request to the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    const orderApi = new RestOrderApi(fetchMock);

    await orderApi.placeOrder('ORD-1001');

    expect(fetchMock).toHaveBeenCalledWith('/api/orders/ORD-1001/place/', {
      method: 'POST',
    });
  });
});
