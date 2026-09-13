import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';
import { OrderLine } from '../../domain/order-line';
import { OrderDto } from './order-dto';
import { OrderPlacementRejected } from '../../application/errors/order-placement-rejected';

@Injectable()
export class RestOrderApi implements OrderApi {
  constructor(private readonly http: HttpClient) {}

  async placeOrder(orderId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${environment.apiBaseUrl}/orders/${orderId}/place`, {}),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        throw new OrderPlacementRejected();
      }

      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    const data = await firstValueFrom(
      this.http.get<OrderDto>(`${environment.apiBaseUrl}/orders/${orderId}`),
    );

    return new Order(
      data.id,
      data.status,
      data.lines.map((line) => new OrderLine(line.product_name, line.quantity, line.unit_price)),
      data.total,
    );
  }
}
