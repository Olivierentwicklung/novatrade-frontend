import { createContext, PropsWithChildren, useContext } from 'react';

import { CancelOrderApi } from '../../../../../core/application/ports/cancel-order-api';

const OrderApiContext = createContext<CancelOrderApi | null>(null);

type OrderApiProviderProps = PropsWithChildren<{
  orderApi: CancelOrderApi;
}>;

export function OrderApiProvider({ orderApi, children }: OrderApiProviderProps) {
  return <OrderApiContext.Provider value={orderApi}>{children}</OrderApiContext.Provider>;
}

export function useOrderApi(): CancelOrderApi {
  const orderApi = useContext(OrderApiContext);

  if (!orderApi) {
    throw new Error('OrderApiProvider is missing.');
  }

  return orderApi;
}
