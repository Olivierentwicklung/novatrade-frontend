import { Provider } from '@angular/core';

import { GraphqlOrderApi } from '../../../infrastructure/adapters/graphql/graphql-order-api';
import { ORDER_API } from '../../features/orders/presentation/di/order-api.token';

export const ORDER_API_PROVIDER: Provider = {
  provide: ORDER_API,
  useClass: GraphqlOrderApi,
};
