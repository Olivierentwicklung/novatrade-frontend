export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  itemCount: number;
}

interface OrderListApi {
  listOrders(): Promise<OrderSummary[]>;
}

export async function listOrders(orderApi: OrderListApi): Promise<OrderSummary[]> {
  return orderApi.listOrders();
}
