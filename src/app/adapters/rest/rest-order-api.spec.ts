import { RestOrderApi } from './rest-order-api';
import { Order } from '../../domain/order';
import { OrderLine } from '../../domain/order-line';

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

  it('should return an order from the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        id: 'ORD-1001',
        status: 'Draft',
        lines: [
          {
            product_name: 'Mechanical Keyboard',
            quantity: 1,
            unit_price: 129.99,
          },
        ],
        total: 129.99,
      }),
    });

    const orderApi = new RestOrderApi(fetchMock);

    const order = await orderApi.getOrder('ORD-1001');

    expect(order).toEqual(
      new Order('ORD-1001', 'Draft', [new OrderLine('Mechanical Keyboard', 1, 129.99)], 129.99),
    );
  });
});
