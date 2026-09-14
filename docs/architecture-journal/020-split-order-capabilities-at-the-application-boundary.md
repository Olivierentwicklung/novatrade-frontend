# 020 — Split Order Capabilities at the Application Boundary

## Context

NovaTrade originally used a single `OrderApi` for all Order-related application operations:

```text
OrderApi
→ placeOrder()
→ getOrder()
```

Chapter 25 introduced a new customer requirement: show multiple Orders in a compact list.

That added a second read operation:

```text
listOrders()
→ OrderSummary[]
```

The first implementation extended the existing `OrderApi`:

```text
OrderApi
→ placeOrder()
→ getOrder()
→ listOrders()
```

This worked, but it exposed coupling in the application layer. Test doubles and consumers that only needed `placeOrder()` or `getOrder()` also had to be updated because they implemented the broader `OrderApi`.

A new read capability was therefore causing unrelated write-oriented and detail-read consumers to change.

## Decision

Separate the application-facing capabilities into narrow read and write ports:

```text
OrderReadApi
→ getOrder()
→ listOrders()

OrderWriteApi
→ placeOrder()
```

Keep `OrderApi` as a composite contract for places that legitimately require both capabilities:

```text
OrderApi
→ extends OrderReadApi
→ extends OrderWriteApi
```

Application use cases depend on the smallest port they need:

```text
loadOrder()
→ OrderReadApi

listOrders()
→ OrderReadApi

placeOrder()
→ OrderWriteApi
```

Concrete adapters such as `RestOrderApi` and `InMemoryOrderApi` may continue to implement the composite `OrderApi`.

## Why

The split was not introduced because read/write separation was planned in advance.

It was introduced after adding `listOrders()` to the original `OrderApi` caused unrelated consumers and test doubles to change.

The narrower ports reduce that coupling while avoiding an unnecessary split of the concrete adapters.

The decision follows consumer needs:

```text
different consumers
→ different required capabilities
→ narrower application dependencies
```

## Read Shape

Chapter 25 also introduced the first specialized collection read shape:

```text
getOrder()
→ Order

listOrders()
→ OrderSummary[]
```

`OrderSummary` contains only the information required by the collection use case:

```text
id
status
total
itemCount
```

The detailed read continues to use `Order` because no pressure currently requires a separate detail-read representation.

## Consequences

### Positive

Application use cases no longer depend on operations they do not use.

A new write capability does not automatically need to affect read-only consumers, and a new read capability does not automatically need to affect write-only consumers.

The concrete adapters can remain unified where that remains natural.

### Trade-off

There are now more application port interfaces:

```text
OrderReadApi
OrderWriteApi
OrderApi
```

This additional structure is accepted because it responds to coupling that was observed in the implementation.

## Not Decided

This decision does not introduce or imply:

- CQRS;
- separate read and write databases;
- command or query buses;
- separate backend services;
- separate REST read/write adapters;
- projection infrastructure.

Those mechanisms require additional pressure and evidence.

## Status

Accepted.
