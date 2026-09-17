import { cancelOrder } from '../../../../../../core/application/use-cases/cancel-order';
import { Order } from '../../../../../../core/domain/entities/order';
import { useOrderApi } from '../../context/order-api.context';

type OrderPageProps = {
  order: Order;
};

export function OrderPage({ order }: OrderPageProps) {
  const orderApi = useOrderApi();

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
