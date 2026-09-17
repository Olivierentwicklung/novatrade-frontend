import { useEffect, useState } from 'react';

import { loadOrder } from '../../core/application/use-cases/load-order';
import { Order } from '../../core/domain/entities/order';
import { createOrderApi } from '../composition/order-api';
import { OrderApiProvider } from '../features/orders/presentation/context/order-api.context';
import { OrderPage } from '../features/orders/presentation/pages/order-page/order-page';

type AppProps = {
  orderId: string;
};

const orderApi = createOrderApi();

export function App({ orderId }: AppProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    void loadOrder(orderId, orderApi).then(setOrder);
  }, [orderId]);

  if (!order) {
    return <p>Loading order...</p>;
  }

  return (
    <OrderApiProvider orderApi={orderApi}>
      <OrderPage order={order} />
    </OrderApiProvider>
  );
}
