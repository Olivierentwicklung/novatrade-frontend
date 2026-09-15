import { Provider } from '@angular/core';

import { GraphqlOrderApi } from '../adapters/graphql/graphql-order-api';
import { ORDER_API } from '../application/ports/order-api.token';

export const GRAPHQL_ORDER_API_PROVIDER: Provider = {
  provide: ORDER_API,
  useClass: GraphqlOrderApi,
};
