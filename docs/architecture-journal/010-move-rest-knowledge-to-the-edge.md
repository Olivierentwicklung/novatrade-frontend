# 010 — Move REST Knowledge to the Edge

## Context

The Application coordinates Order placement through the `OrderApi` port.

Earlier chapters deliberately allowed transport knowledge to remain inside the Application while the boundary was being discovered. Once `OrderApi` had been introduced and proven through an in-memory adapter, Chapter 14 introduced a production-facing REST implementation.

At that point, the Application still contained a transitional direct `fetch()` fallback. The port existed, but REST knowledge had not fully moved out of the Application.

The architecture therefore still looked conceptually like this:

```text
Application
├── OrderApi
└── fetch / POST / URL
```

## Decision

REST-specific knowledge belongs in a concrete adapter at the edge.

The Application depends only on `OrderApi`:

```text
Application
    ↓
OrderApi
```

The REST adapter implements that capability:

```text
OrderApi
    ↑
RestOrderApi
    ↓
fetch / POST / URL
```

The resulting relationship is:

```text
Application
    ↓
OrderApi
    ↑
RestOrderApi
    ↓
fetch
```

`RestOrderApi` translates:

```text
placeOrder(orderId)
```

into the transport-specific request:

```text
POST /api/orders/{orderId}/place/
```

The Application use case no longer knows `fetch`, the HTTP method, or the endpoint.

`OrderApi` is now mandatory for the placement use case. The transitional direct-transport fallback has been removed.

## Consequences

The Application is responsible for coordinating placement behavior rather than transport mechanics.

`RestOrderApi` owns the REST translation required by the current backend boundary.

Application tests verify interaction through `OrderApi`.

REST adapter tests verify transport details such as the URL and HTTP method.

This avoids duplicating transport assertions across layers and keeps tests aligned with the responsibility of the code under test.

Transport-specific code still exists. The decision does not attempt to remove or hide REST. It places REST knowledge at the boundary responsible for speaking REST.

The current Angular component performs minimal runtime wiring:

```ts
private readonly orderApi = new RestOrderApi(fetch);
```

This is intentionally small and provisional. This decision does not define a general composition mechanism, Angular provider strategy, injection token, or composition root.

This decision also does not prove transport substitution or define DTO mapping, response handling, authentication, retry behavior, or error translation.

## Evidence

The REST adapter behavior was introduced through a genuine RED/GREEN cycle:

```text
e7735bb test(ch14): send order placement through rest adapter
39f8c36 feat(ch14): place order through rest adapter
```

The removal of REST knowledge from the Application was preserved in:

```text
b12f482 refactor(ch14): move rest knowledge out of application
```

The final verified suite passed:

```text
Test Files  6 passed (6)
Tests       21 passed (21)
```
