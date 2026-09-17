import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Order } from '../../../../core/domain/entities/order';
import { OrderLine } from '../../../../core/domain/value-objects/order-line';
import { OrderSummary } from '../../../../core/application/ports/order-read-api';

import { OrderApi } from '../../../../core/application/ports/order-api';

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
export class GraphqlOrderApi implements OrderApi {
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

    return this.toOrder(response.data.order);
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

  async placeOrder(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post('/graphql', {
        query: `
        mutation PlaceOrder($orderId: ID!) {
          placeOrder(id: $orderId) {
            success
          }
        }
      `,
        variables: { orderId },
      }),
    );
  }

  async cancelOrder(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post('/graphql', {
        query: `
        mutation CancelOrder($orderId: ID!) {
          cancelOrder(id: $orderId) {
            success
          }
        }
      `,
        variables: { orderId },
      }),
    );
  }

  private toOrder(data: {
    id: string;
    status: string;
    lines: {
      productName: string;
      quantity: number;
      unitPrice: number;
    }[];
    total: number;
  }): Order {
    return new Order(
      data.id,
      data.status,
      data.lines.map((line) => new OrderLine(line.productName, line.quantity, line.unitPrice)),
      data.total,
    );
  }
}
