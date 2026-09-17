import { CancelOrderApi } from '../../core/application/ports/cancel-order-api';

export function createOrderApi(): CancelOrderApi {
  return {
    async cancelOrder(orderId: string): Promise<void> {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order ${orderId}.`);
      }
    },
  };
}
