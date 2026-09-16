import { InjectionToken } from '@angular/core';
import { OrderApi } from '../../../../application/ports/order-api';

export const ORDER_API = new InjectionToken<OrderApi>('ORDER_API');
