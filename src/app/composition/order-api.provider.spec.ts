import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { GraphqlOrderApi } from '../adapters/graphql/graphql-order-api';
import { RestOrderApi } from '../adapters/rest/rest-order-api';
import { ORDER_API } from '../application/ports/order-api.token';
import { REST_ORDER_API_PROVIDER } from './order-api.provider.rest';
import { GRAPHQL_ORDER_API_PROVIDER } from './order-api.provider.graphql';

describe('OrderApi composition', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('provides the REST adapter for the REST composition', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), REST_ORDER_API_PROVIDER],
    });

    const orderApi = TestBed.inject(ORDER_API);

    expect(orderApi).toBeInstanceOf(RestOrderApi);
  });

  it('provides the GraphQL adapter for the GraphQL composition', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), GRAPHQL_ORDER_API_PROVIDER],
    });

    const orderApi = TestBed.inject(ORDER_API);

    expect(orderApi).toBeInstanceOf(GraphqlOrderApi);
  });
});
