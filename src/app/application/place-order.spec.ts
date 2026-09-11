import { afterEach, vi } from 'vitest';
import { Order } from '../domain/order';
import { OrderLine } from '../domain/order-line';
import { placeOrder } from './place-order';

describe('placeOrder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should ask the order to place itself', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const placeSpy = vi.spyOn(order, 'place');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await placeOrder(order);

    expect(placeSpy).toHaveBeenCalledOnce();
  });

  it('should send the placed order to the backend', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    vi.stubGlobal('fetch', fetchSpy);

    await placeOrder(order);

    expect(fetchSpy).toHaveBeenCalledWith('/api/orders/ORD-1001/place/', {
      method: 'POST',
    });
  });

  it('should ask the order api to place the order', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const orderApi = {
      placeOrder: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await placeOrder(order, orderApi);

    expect(orderApi.placeOrder).toHaveBeenCalledWith('ORD-1001');
  });
});
