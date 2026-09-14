export interface PlaceOrderApi {
  placeOrder(orderId: string): Promise<void>;
}
