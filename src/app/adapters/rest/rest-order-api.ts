import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';
import { OrderLine } from '../../domain/order-line';
import { OrderDto } from './order-dto';

@Injectable()
export class RestOrderApi implements OrderApi {
  constructor(private readonly http: HttpClient) {}

  async placeOrder(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/orders/${orderId}/place`, {}),
    );
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
