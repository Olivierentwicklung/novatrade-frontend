import { CancelOrderApi } from '../../../../../../core/application/ports/cancel-order-api';
import { cancelOrder } from '../../../../../../core/application/use-cases/cancel-order';
import { Order } from '../../../../../../core/domain/entities/order';

type OrderPageProps = {
  order: Order;
  orderApi: CancelOrderApi;
};

export function OrderPage({ order, orderApi }: OrderPageProps) {
  return (
    <section>
      <p>{order.id}</p>
      <p>{order.status}</p>

      <button type="button" onClick={() => cancelOrder(order, orderApi)}>
        Cancel order
      </button>
    </section>
  );
}
