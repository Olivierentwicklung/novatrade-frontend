# Allow Transport Knowledge to Surface

## Context

NovaTrade's first frontend Application use case originally coordinated Order placement entirely in memory:

```ts
// src/app/application/place-order.ts

export function placeOrder(order: Order): void {
  order.place();
}
```

A new requirement changed that boundary:

> When the customer places an Order, NovaTrade must also send that placement to the backend.

The frontend therefore needed its first external side effect during Order placement.

## Decision

Implement the backend communication directly inside the existing Application use case:

```ts
// src/app/application/place-order.ts

import { Order } from '../order';

export async function placeOrder(order: Order): Promise<void> {
  order.place();

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
```

This deliberately allows the use case to know concrete transport details:

```text
placeOrder
→ Domain behavior
→ fetch
→ HTTP POST
→ /api/orders/{id}/place/
```

No port, adapter, API interface, repository, Angular service wrapper, or transport abstraction is introduced yet.

## Why

Before this requirement, Order placement never left the browser. Introducing a transport abstraction earlier would have protected the code from a pressure that had not yet appeared.

The direct implementation is therefore the smallest responsible response to the requirement.

It also gives us concrete evidence about the coupling that now exists. The Application use case no longer knows only the intent to place an Order. It also knows how the backend currently exposes that capability.

This coupling is accepted deliberately rather than hidden prematurely.

## Consequences

The Application use case now has more than one reason to change.

The business operation may remain:

```text
place an Order
```

while transport details such as these may change independently:

```text
fetch
POST
/api/orders/{id}/place/
```

The tests must also control the new external side effect. Existing Application and Angular tests were adjusted so they no longer perform accidental network communication during unrelated scenarios.

The current design remains intentionally concrete.

The transport coupling has become visible, but it has not yet been abstracted.
