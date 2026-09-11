# Introduce the Order API Port

## Context

NovaTrade's `placeOrder()` Application use case originally communicated with the backend directly:

```ts
// src/app/application/place-order.ts

export async function placeOrder(order: Order): Promise<void> {
  order.place();

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
```

This satisfied the requirement, but it also caused the Application use case to know concrete transport details:

```text
fetch
HTTP POST
/api/orders/{id}/place/
```

The Application operation itself only needs one capability:

```text
place an Order through NovaTrade's backend
```

## Decision

Introduce a named Application boundary for that capability:

```ts
// src/app/application/order-api.ts

export interface OrderApi {
  placeOrder(orderId: string): Promise<void>;
}
```

The `placeOrder()` use case can now delegate backend placement through `OrderApi`:

```ts
// src/app/application/place-order.ts

import { Order } from '../order';
import { OrderApi } from './order-api';

export async function placeOrder(order: Order, orderApi?: OrderApi): Promise<void> {
  order.place();

  if (orderApi) {
    await orderApi.placeOrder(order.id);
    return;
  }

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
```

`OrderApi` is the frontend's first outbound port.

## Why

The Application should express the capability it requires rather than being defined by the technical mechanism currently used to provide that capability.

The relevant dependency changes conceptually from:

```text
Application
    ↓
fetch
    ↓
HTTP
    ↓
backend URL
```

toward:

```text
Application
    ↓
OrderApi
```

The interface does not describe transport. It describes the operation required by the Application.

This begins to invert the direction of knowledge: the Application defines what it needs from the outside world.

## Consequences

The Application now has a named boundary that is independent of a specific transport mechanism:

```text
OrderApi
→ placeOrder(orderId)
```

This boundary can later be implemented without changing the Application's description of the required capability.

The migration is intentionally incomplete. `OrderApi` is currently optional and the existing `fetch()` implementation remains as a fallback for callers that do not yet provide the port.

Therefore, the current architecture must not yet be described as fully transport-independent.

No concrete adapter is introduced in this decision. The port defines the required capability; an implementation of that capability is still missing.
