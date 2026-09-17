import { CancelOrderApi } from './cancel-order-api';
import { OrderReadApi } from './order-read-api';
import { OrderWriteApi } from './order-write-api';

export interface OrderApi extends OrderReadApi, OrderWriteApi, CancelOrderApi {}
