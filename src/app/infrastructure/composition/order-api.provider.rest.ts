import { Provider } from '@angular/core';

import { RestOrderApi } from '../../../infrastructure/adapters/rest/rest-order-api';
import { ORDER_API } from '../../features/orders/presentation/di/order-api.token';

export const ORDER_API_PROVIDER: Provider = {
  provide: ORDER_API,
  useClass: RestOrderApi,
};
