# Recognize Order Identity Across Representations

## Context

NovaTrade already displayed an Order with an `id`, status, lines, and total, but the live Angular application still represented that Order as an anonymous object.

As the frontend model became more explicit, NovaTrade needed to distinguish between the current state of an Order and the identity that makes it the same Order across changing representations.

For example:

```text
Order representation A
id = ORD-1001
status = Draft

Order representation B
id = ORD-1001
status = Submitted
```

The two representations differ in current state, but they refer to the same business Order.

## Decision

Model `Order` as an explicit frontend business concept with stable identity.

Two `Order` instances are recognized as representing the same Order when their identifiers match:

```ts
// src/app/order.ts

hasSameIdentityAs(other: Order): boolean {
  return this.id === other.id;
}
```

The live Angular application also uses the explicit `Order` concept instead of an anonymous object:

```ts
// src/app/app.ts

readonly order = new Order(
  'ORD-1001',
  'Draft',
  [
    new OrderLine('Mechanical Keyboard', 1, 129.99),
    new OrderLine('Wireless Mouse', 2, 49.99),
  ],
  229.97,
);
```

## Why

An Order can change status, lines, and total without becoming a different Order.

Current values therefore cannot be the only basis for recognizing continuity.

The identifier provides that continuity:

```text
Draft ORD-1001
        ↓
Submitted ORD-1001

same identity
different state
```

This gives the frontend Entity-style identity semantics where they are now needed.

## Consequences

`Order` now has an explicit identity boundary.

Its current state may change while its identity remains stable.

`OrderLine` remains a value-oriented concept; this decision does not add explicit value equality to it.

No separate `OrderId` Value Object is introduced.

No routing, caching, persistence mapping, repository, store, or backend synchronization concern is introduced. Those require separate pressure.
