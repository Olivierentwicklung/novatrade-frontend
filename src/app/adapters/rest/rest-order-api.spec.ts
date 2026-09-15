import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Order } from '../../domain/entities/order';
import { OrderLine } from '../../domain/value-objects/order-line';
import { RestOrderApi } from './rest-order-api';
import { environment } from '../../../environments/environment';

describe('RestOrderApi', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let orderApi: RestOrderApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    orderApi = new RestOrderApi(http);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send an order placement request to the backend', async () => {
    const placementPromise = orderApi.placeOrder('ORD-1001');

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/orders/ORD-1001/place`);

    expect(request.request.method).toBe('POST');

    request.flush(null);

    await placementPromise;
  });

  it('should return an order from the backend', async () => {
    const orderPromise = orderApi.getOrder('ORD-1001');

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/orders/ORD-1001`);

    expect(request.request.method).toBe('GET');

    request.flush({
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
    });

    const order = await orderPromise;

    expect(order).toEqual(
      new Order('ORD-1001', 'Draft', [new OrderLine('Mechanical Keyboard', 1, 129.99)], 129.99),
    );
  });

  it('should translate a conflict when order placement is rejected', async () => {
    const placement = orderApi.placeOrder('ORD-1001');

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/orders/ORD-1001/place`);

    expect(request.request.method).toBe('POST');

    request.flush(
      {
        error: 'Only draft orders can be placed',
      },
      {
        status: 409,
        statusText: 'Conflict',
      },
    );

    await expect(placement).rejects.toThrow('Order placement rejected');
  });

  it('should return compact order summaries from the backend', async () => {
    const ordersPromise = orderApi.listOrders();

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/orders`);

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        id: 'ORD-1001',
        status: 'Submitted',
        lines: [
          {
            product_name: 'Mechanical Keyboard',
            quantity: 1,
            unit_price: 129.99,
          },
        ],
        total: 129.99,
      },
      {
        id: 'ORD-1002',
        status: 'Draft',
        lines: [
          {
            product_name: 'Wireless Mouse',
            quantity: 2,
            unit_price: 49.99,
          },
          {
            product_name: 'USB-C Cable',
            quantity: 1,
            unit_price: 19.99,
          },
        ],
        total: 119.97,
      },
    ]);

    await expect(ordersPromise).resolves.toEqual([
      {
        id: 'ORD-1001',
        status: 'Submitted',
        total: 129.99,
        itemCount: 1,
      },
      {
        id: 'ORD-1002',
        status: 'Draft',
        total: 119.97,
        itemCount: 2,
      },
    ]);
  });

  it('should send an order cancellation request to the backend', async () => {
    const cancellationPromise = orderApi.cancelOrder('ORD-1001');

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/orders/ORD-1001/cancel`);

    expect(request.request.method).toBe('POST');

    request.flush(null);

    await cancellationPromise;
  });
});
