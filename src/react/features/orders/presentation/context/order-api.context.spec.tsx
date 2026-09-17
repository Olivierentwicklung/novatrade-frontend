import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CancelOrderApi } from '../../../../../core/application/ports/cancel-order-api';
import { OrderApiProvider, useOrderApi } from './order-api.context';

describe('OrderApiProvider', () => {
  it('provides the order capability to React presentation code', () => {
    const orderApi: CancelOrderApi = {
      cancelOrder: vi.fn().mockResolvedValue(undefined),
    };

    const wrapper = ({ children }: PropsWithChildren) => (
      <OrderApiProvider orderApi={orderApi}>{children}</OrderApiProvider>
    );

    const { result } = renderHook(() => useOrderApi(), { wrapper });

    expect(result.current).toBe(orderApi);
  });
});
