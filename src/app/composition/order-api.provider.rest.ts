import { Provider } from '@angular/core';

import { RestOrderApi } from '../adapters/rest/rest-order-api';
import { ORDER_API } from '../application/ports/order-api.token';

export const REST_ORDER_API_PROVIDER: Provider = {
  provide: ORDER_API,
  useClass: RestOrderApi,
};
