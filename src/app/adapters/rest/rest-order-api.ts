import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';
import { OrderLine } from '../../domain/order-line';
import { OrderDto } from './order-dto';

type FetchResponse = {
  json(): Promise<unknown>;
};

type Fetch = (input: string, init?: RequestInit) => Promise<FetchResponse>;

export class RestOrderApi implements OrderApi {
  constructor(private readonly fetch: Fetch) {}

  // async placeOrder(orderId: string): Promise<void> {
  //   await this.fetch(`/api/orders/${orderId}/place/`, {
  //     method: 'POST',
  //   });
  // }
  async placeOrder(orderId: string): Promise<void> {
    console.log(`Order ${orderId} placed`);
  }

  // async getOrder(orderId: string): Promise<Order> {
  //   const response = await this.fetch(`/api/orders/${orderId}/`);

  //   const data = (await response.json()) as OrderDto;

  //   return new Order(
  //     data.id,
  //     data.status,
  //     data.lines.map((line) => new OrderLine(line.product_name, line.quantity, line.unit_price)),
  //     data.total,
  //   );
  // }

  async getOrder(orderId: string): Promise<Order> {
    const data: OrderDto = {
      id: orderId,
      status: 'Draft',
      lines: [
        {
          product_name: 'Mechanical Keyboard',
          quantity: 1,
          unit_price: 129.99,
        },
        {
          product_name: 'Wireless Mouse',
          quantity: 2,
          unit_price: 49.99,
        },
      ],
      total: 229.97,
    };

    return new Order(
      data.id,
      data.status,
      data.lines.map((line) => new OrderLine(line.product_name, line.quantity, line.unit_price)),
      data.total,
    );
  }
}
