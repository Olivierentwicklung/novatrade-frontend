type OrderPageProps = {
  order: {
    id: string;
    status: string;
  };
  cancelOrder: (orderId: string) => Promise<void>;
};

export function OrderPage({ order, cancelOrder }: OrderPageProps) {
  return (
    <section>
      <p>{order.id}</p>
      <p>{order.status}</p>

      <button type="button" onClick={() => cancelOrder(order.id)}>
        Cancel order
      </button>
    </section>
  );
}
