export interface OrderWriteApi {
  placeOrder(orderId: string): Promise<void>;
}
