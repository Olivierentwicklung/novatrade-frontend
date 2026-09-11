# Introduce a Frontend Application Use Case

## Context

NovaTrade originally handled Order placement directly inside the Angular component.

The component reacted to the customer's click, checked whether the Order could be placed, and changed the Order status itself.

Conceptually:

```text
Angular component
→ receives the user interaction
→ decides whether placement is allowed
→ changes business state
```

As `Order` became a more explicit business concept, this mixed responsibilities that no longer needed to live together.

## Decision

Placement rules belong to `Order`.

The Order now protects its own placement behavior:

```ts
// src/app/order.ts

place(): void {
  if (this.status !== 'Draft' || this.lines.length === 0) {
    return;
  }

  this.status = 'Submitted';
}
```

The frontend introduces a small Application use case that coordinates the operation:

```ts
// src/app/application/place-order.ts

import { Order } from '../order';

export function placeOrder(order: Order): void {
  order.place();
}
```

The Angular component delegates the customer request to that use case:

```ts
// src/app/app.ts

placeOrder() {
  placeOrder(this.order);
}
```

The resulting responsibility flow is:

```text
Angular UI
→ decides when to ask

Application
→ coordinates what happens

Order
→ decides what is allowed
```

## Why

Moving the original Angular code directly into an Application function would only have relocated the business rules.

The Application layer should not decide whether an Order may be placed. That decision belongs to the business concept whose state and validity are affected.

The Application use case represents the operation the frontend is performing without duplicating the Domain rules.

Its current implementation is deliberately small:

```ts
placeOrder(order);
```

ultimately delegates to:

```ts
order.place();
```

The size of the use case is not the architectural decision. The responsibility boundary is.

## Consequences

Angular no longer contains the business conditions for Order placement.

`Order` owns the rules:

```text
must be Draft
must contain products
```

The Application use case coordinates placement without reproducing those rules.

No port, adapter, repository, API abstraction, Angular service, command bus, or transport dependency is introduced.

The current use case requires none of them.
