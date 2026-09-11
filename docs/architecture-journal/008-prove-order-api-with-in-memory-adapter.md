# Prove OrderApi with an In-Memory Adapter

## Context

Chapter 11 introduced `OrderApi` as an outbound Application port:

```ts
// src/app/application/ports/order-api.ts

export interface OrderApi {
  placeOrder(orderId: string): Promise<void>;
}
```

The port describes what the Application needs:

```text
place an Order
```

without describing how that capability must be implemented.

At that point, however, the port was still only a contract. There was no independent concrete implementation proving that the capability could exist without the transport details previously embedded in `placeOrder()`.

## Decision

Introduce an in-memory implementation of `OrderApi`:

```ts
// src/app/adapters/in-memory/in-memory-order-api.ts

import { OrderApi } from '../../application/ports/order-api';

export class InMemoryOrderApi implements OrderApi {
  readonly placedOrderIds: string[] = [];

  async placeOrder(orderId: string): Promise<void> {
    this.placedOrderIds.push(orderId);
  }
}
```

The adapter records placed Order identities in memory.

The resulting relationship is:

```text
Application
    ↓
OrderApi
    ↑
InMemoryOrderApi
```

## Why

`OrderApi` is intended to represent an Application capability rather than a particular transport mechanism.

The in-memory adapter provides evidence for that distinction because it satisfies the same port without knowing anything about:

```text
fetch
HTTP
URLs
REST
Angular
```

The adapter therefore demonstrates that the port is not merely an HTTP abstraction with a different name.

The Application defines the capability it needs, while the adapter decides how that capability is fulfilled.

## Testing Consequence

The in-memory implementation also provides a controlled way to observe Application-side behavior.

A test can ask the adapter to place an Order and verify that the Order identity was recorded:

```ts
// src/app/adapters/in-memory/in-memory-order-api.spec.ts

const orderApi = new InMemoryOrderApi();

await orderApi.placeOrder('ORD-1001');

expect(orderApi.placedOrderIds).toContain('ORD-1001');
```

This testing seam is a consequence of the dependency direction.

It is not the reason the port exists.

## Structural Consequence

Once the responsibilities had been proven in code, the project structure was updated to reflect them:

```text
src/app/
├── application/
│   ├── ports/
│   │   └── order-api.ts
│   ├── place-order.ts
│   └── place-order.spec.ts
│
└── adapters/
    └── in-memory/
        ├── in-memory-order-api.ts
        └── in-memory-order-api.spec.ts
```

The folders followed the architecture after the responsibilities had emerged.

They were not created in advance as an architectural template.

## Limits

`InMemoryOrderApi` proves that the Application capability can be satisfied without transport knowledge.

It does **not** prove production communication.

No claim is made here about real backend communication, HTTP behavior, serialization, authentication, backend validation, or network failure.

Those concerns require different evidence.
