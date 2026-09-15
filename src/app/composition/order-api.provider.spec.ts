import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RestOrderApi } from '../adapters/rest/rest-order-api';
import { ORDER_API } from '../application/ports/order-api.token';
import { ORDER_API_PROVIDER } from './order-api.provider';

describe('OrderApi composition', () => {
  it('provides the REST adapter for the OrderApi port', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), ORDER_API_PROVIDER],
    });

    const orderApi = TestBed.inject(ORDER_API);

    expect(orderApi).toBeInstanceOf(RestOrderApi);
  });
});
