import { InjectionToken } from '@angular/core';

import { OrderApi } from './order-api';

export const ORDER_API = new InjectionToken<OrderApi>('ORDER_API');
