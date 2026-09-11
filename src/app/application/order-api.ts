export interface OrderApi {
  placeOrder(orderId: string): Promise<void>;
}
