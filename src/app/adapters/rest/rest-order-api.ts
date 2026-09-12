import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';
import { OrderLine } from '../../domain/order-line';

type FetchResponse = {
  json(): Promise<unknown>;
};

type Fetch = (input: string, init?: RequestInit) => Promise<FetchResponse>;

export class RestOrderApi implements OrderApi {
  constructor(private readonly fetch: Fetch) {}

  async placeOrder(orderId: string): Promise<void> {
    await this.fetch(`/api/orders/${orderId}/place/`, {
      method: 'POST',
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.fetch(`/api/orders/${orderId}/`);

    const data = (await response.json()) as {
      id: string;
      status: string;
      lines: {
        product_name: string;
        quantity: number;
        unit_price: number;
      }[];
      total: number;
    };

    return new Order(
      data.id,
      data.status,
      data.lines.map((line) => new OrderLine(line.product_name, line.quantity, line.unit_price)),
      data.total,
    );
  }
}
