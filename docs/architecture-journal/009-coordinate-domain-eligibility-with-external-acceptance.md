# 009 — Coordinate Domain Eligibility with External Acceptance

## Context

The frontend Application coordinates Order placement through the `OrderApi` port.

The first in-memory implementation of that port always succeeded. That was enough to prove that the Application could depend on a backend capability without knowing transport details, but it did not prove what should happen when the external operation is rejected.

The original placement sequence changed the local Order before awaiting external acceptance:

```text
Order.place()
    ↓
OrderApi.placeOrder(order.id)
```

When the external operation rejected, the local Order had already become `Submitted`.

Reversing the sequence solved that problem:

```text
OrderApi.placeOrder(order.id)
    ↓
Order.place()
```

but exposed the opposite inconsistency. The Application could now send a placement request for an Order that the Domain already knew was invalid, such as an empty Order.

## Decision

Order placement is coordinated in three steps:

```text
Domain eligibility
        ↓
external acceptance
        ↓
local Domain transition
```

The responsibilities are:

```text
Order.canBePlaced()
→ determines whether placement is locally valid

OrderApi.placeOrder(order.id)
→ requests acceptance from the external system

Order.place()
→ applies the local state transition after acceptance
```

The Application coordinates these steps but does not duplicate either decision.

The resulting Application flow is conceptually:

```ts
if (!order.canBePlaced()) {
  return;
}

await orderApi.placeOrder(order.id);

order.place();
```

The Domain remains the owner of placement eligibility. The external system remains authoritative over whether the external operation succeeds. The Application owns the sequence in which those responsibilities are consulted.

## Consequences

The frontend does not mark an Order `Submitted` before external acceptance.

Locally invalid Orders are not sent to the external system.

Business eligibility remains defined in one place because the Application asks `Order.canBePlaced()` rather than reproducing the underlying rules.

The Application now needs a non-mutating way to query placement eligibility before performing the actual Domain state transition.

An in-memory adapter remains useful for proving Application-side behavior, but its successful behavior is not sufficient evidence of production correctness.

This decision does not define transport details. HTTP, REST, serialization, authentication, response handling, and the production adapter remain outside this decision.
