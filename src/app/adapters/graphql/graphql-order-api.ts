import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Order } from '../../domain/entities/order';
import { OrderLine } from '../../domain/value-objects/order-line';
import { OrderSummary } from '../../application/ports/order-read-api';

interface GraphqlOrderResponse {
  data: {
    order: {
      id: string;
      status: string;
      lines: {
        productName: string;
        quantity: number;
        unitPrice: number;
      }[];
      total: number;
    };
  };
}

@Injectable()
export class GraphqlOrderApi {
  constructor(private readonly http: HttpClient) {}

  async getOrder(orderId: string): Promise<Order> {
    const response = await firstValueFrom(
      this.http.post<GraphqlOrderResponse>('/graphql', {
        query: `
          query Order($orderId: ID!) {
            order(id: $orderId) {
              id
              status
              lines {
                productName
                quantity
                unitPrice
              }
              total
            }
          }
        `,
        variables: {
          orderId,
        },
      }),
    );

    const data = response.data.order;

    return new Order(
      data.id,
      data.status,
      data.lines.map((line) => new OrderLine(line.productName, line.quantity, line.unitPrice)),
      data.total,
    );
  }

  async listOrders(): Promise<OrderSummary[]> {
    const response = await firstValueFrom(
      this.http.post<{
        data: {
          orders: OrderSummary[];
        };
      }>('/graphql', {
        query: `
        query Orders {
          orders {
            id
            status
            total
            itemCount
          }
        }
      `,
      }),
    );

    return response.data.orders;
  }
}
