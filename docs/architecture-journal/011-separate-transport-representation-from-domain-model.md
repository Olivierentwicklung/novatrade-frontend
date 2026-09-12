# 011 — Separate Transport Representation from the Domain Model

## Context

The REST adapter now owns communication with the backend.

When Order data is returned from that boundary, the backend representation does not match the frontend Domain model directly.

The backend response uses a transport-oriented shape:

```text id="a7f1m2"
id
status
lines
product_name
quantity
unit_price
total
```

The frontend already has Domain concepts with their own behavior:

```text id="n6x4bs"
Order
OrderLine
```

Returning the transport object directly would allow a backend representation to become the frontend model by accident.

## Decision

The transport representation and Domain representation are treated as separate concepts when real divergence exists.

The REST boundary owns the translation:

```text id="w9rm8p"
backend JSON
    ↓
OrderDto
    ↓
RestOrderApi
    ↓
Order / OrderLine
```

`OrderDto` represents the backend transport contract.

`Order` and `OrderLine` remain the frontend Domain representation.

The adapter converts the DTO into Domain objects before returning data through the `OrderApi` port.

The DTO was introduced only after the response shape had appeared in working code and mapping was already required. It was not introduced as a predefined architectural layer.

## Consequences

Transport-specific field names such as:

```text id="v6h9f3"
product_name
unit_price
```

remain at the REST boundary rather than leaking into the Domain.

Changes to the backend representation can be handled at the adapter boundary without automatically reshaping the frontend Domain model.

The Domain model remains free to evolve according to frontend business behavior rather than transport serialization concerns.

A separate mapper abstraction is not introduced at this stage. The mapping is still small and local to `RestOrderApi`, so extracting an `OrderMapper` would add structure without solving a demonstrated problem.

This decision also does not require every API response to have a separate DTO. A separate transport type is introduced only when the representations have meaningfully diverged.

## Scope

This decision proves only the representation boundary:

```text id="pk9m7d"
backend response
→ OrderDto
→ Domain Order
```

It does not define where a retrieved `Order` is stored in the frontend, when it is loaded, how long it lives, or who may mutate it.

The current UI still constructs its visible Order locally.

State ownership remains a separate architectural question.

## Evidence

The response behavior was introduced through:

```text id="p1s4dv"
92a78cd test(ch15): retrieve order from backend
142abb0 feat(ch15): map backend order response to domain
```

The transport representation was then given an explicit name through:

```text id="q3r8zk"
c034a7f refactor(ch15): name backend order dto
```

The final verified suite passed:

```text id="d5kj2c"
Test Files  6 passed (6)
Tests       22 passed (22)
```
