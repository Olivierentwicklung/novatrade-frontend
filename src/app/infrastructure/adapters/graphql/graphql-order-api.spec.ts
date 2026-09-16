import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Order } from '../../../domain/entities/order';
import { OrderLine } from '../../../domain/value-objects/order-line';
import { GraphqlOrderApi } from './graphql-order-api';

describe('GraphqlOrderApi', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let orderApi: GraphqlOrderApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    orderApi = new GraphqlOrderApi(http);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should return an order through GraphQL', async () => {
    const orderPromise = orderApi.getOrder('ORD-1001');

    const request = httpTesting.expectOne('/graphql');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      query: expect.stringContaining('order'),
      variables: {
        orderId: 'ORD-1001',
      },
    });

    request.flush({
      data: {
        order: {
          id: 'ORD-1001',
          status: 'Draft',
          lines: [
            {
              productName: 'Mechanical Keyboard',
              quantity: 1,
              unitPrice: 129.99,
            },
          ],
          total: 129.99,
        },
      },
    });

    await expect(orderPromise).resolves.toEqual(
      new Order('ORD-1001', 'Draft', [new OrderLine('Mechanical Keyboard', 1, 129.99)], 129.99),
    );
  });

  it('should return compact order summaries through GraphQL', async () => {
    const ordersPromise = orderApi.listOrders();

    const request = httpTesting.expectOne('/graphql');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      query: expect.stringContaining('orders'),
    });

    request.flush({
      data: {
        orders: [
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
        ],
      },
    });

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

  it('should place an order through GraphQL', async () => {
    const placeOrderPromise = orderApi.placeOrder('ORD-1001');

    const request = httpTesting.expectOne('/graphql');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      query: expect.stringContaining('placeOrder'),
      variables: {
        orderId: 'ORD-1001',
      },
    });

    request.flush({
      data: {
        placeOrder: {
          success: true,
        },
      },
    });

    await expect(placeOrderPromise).resolves.toBeUndefined();
  });
  it('should cancel an order through GraphQL', async () => {
    const cancelOrderPromise = orderApi.cancelOrder('ORD-1002');

    const request = httpTesting.expectOne('/graphql');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      query: expect.stringContaining('cancelOrder'),
      variables: {
        orderId: 'ORD-1002',
      },
    });

    request.flush({
      data: {
        cancelOrder: {
          success: true,
        },
      },
    });

    await expect(cancelOrderPromise).resolves.toBeUndefined();
  });
});
