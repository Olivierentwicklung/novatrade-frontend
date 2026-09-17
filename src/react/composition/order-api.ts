import { CancelOrderApi } from '../../core/application/ports/cancel-order-api';
import { OrderReadApi } from '../../core/application/ports/order-read-api';
import { Order } from '../../core/domain/entities/order';
import { OrderLine } from '../../core/domain/value-objects/order-line';

type ReactOrderApi = CancelOrderApi & Pick<OrderReadApi, 'getOrder'>;

type OrderDto = {
  id: string;
  status: string;
  lines: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  total: number;
};

export function createOrderApi(): ReactOrderApi {
  return {
    async getOrder(orderId: string): Promise<Order> {
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`Failed to load order ${orderId}.`);
      }

      const data = (await response.json()) as OrderDto;

      return new Order(
        data.id,
        data.status,
        data.lines.map((line) => new OrderLine(line.product_name, line.quantity, line.unit_price)),
        data.total,
      );
    },

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
