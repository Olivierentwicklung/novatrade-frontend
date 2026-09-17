export interface CancelOrderApi {
  cancelOrder(orderId: string): Promise<void>;
}
