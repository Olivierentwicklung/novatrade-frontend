import { Order } from '../../core/domain/entities/order';
import { createOrderApi } from '../composition/order-api';
import { OrderApiProvider } from '../features/orders/presentation/context/order-api.context';
import { OrderPage } from '../features/orders/presentation/pages/order-page/order-page';

type AppProps = {
  order: Order;
};

const orderApi = createOrderApi();

export function App({ order }: AppProps) {
  return (
    <OrderApiProvider orderApi={orderApi}>
      <OrderPage order={order} />
    </OrderApiProvider>
  );
}
