# Command and Query Divergence Without CQRS

## Context

NovaTrade already had separate read and write capabilities.

The read side supported two different retrieval needs:

- loading a full `Order`
- listing compact `OrderSummary` representations

The write side initially supported one business intention:

- placing an Order

That structure had been sufficient.

A new customer requirement introduced another write intention:

> A customer can cancel a submitted Order.

The requirement was implemented through the Domain, Application, adapters, development REST server, and browser UI.

## Pressure

The new cancellation behavior first exposed pressure inside the write boundary.

Adding `cancelOrder()` directly to the existing `OrderWriteApi` meant that consumers interested only in placement suddenly had to know about cancellation.

The placement use case did not need that capability.

The smallest responsible response was to separate the write capabilities according to what each consumer actually needed:

```text
PlaceOrderApi
└── placeOrder(orderId)

CancelOrderApi
└── cancelOrder(orderId)
```

The concrete application composition can still expose both capabilities when necessary.

At the same time, the difference between reads and writes became more visible.

The read side retrieves representations:

```text
getOrder()
→ Order

listOrders()
→ OrderSummary[]
```

The write side expresses business intentions:

```text
placeOrder()
→ Order.place()

cancelOrder()
→ Order.cancel()
```

This made CQRS a legitimate architectural question.

## Decision

Keep the application use cases as simple functions and depend on narrow capabilities.

Do not introduce CQRS.

The application continues to use:

```text
loadOrder()
listOrders()
placeOrder()
cancelOrder()
```

The read capability remains:

```text
OrderReadApi
├── getOrder()
└── listOrders()
```

The write capabilities are:

```text
PlaceOrderApi
└── placeOrder()

CancelOrderApi
└── cancelOrder()
```

Where composition requires a broader contract, the concrete `OrderApi` can combine those capabilities.

Consumers should still depend only on the smallest capability they need.

## Why

The implementation proves meaningful divergence between commands and queries.

Queries are concerned with retrieving information and may return different representations.

Commands express intentions that change business state and use Domain behavior.

That divergence is real.

It is not yet evidence for separate command and query architectures.

The detail read still returns the same `Order` model used by the command workflows.

The existing application functions remain small and understandable.

Nothing in the implementation currently requires:

- command objects
- query objects
- command handlers
- query handlers
- separate execution pipelines
- separate read and write infrastructure
- separate persistence models

Adding those mechanisms now would introduce structure without solving a demonstrated problem.

## Alternatives Considered

### Expand OrderWriteApi

The first possibility was to add cancellation directly to `OrderWriteApi`:

```text
OrderWriteApi
├── placeOrder()
└── cancelOrder()
```

The implementation exposed a drawback immediately.

Consumers that only needed placement became coupled to cancellation.

The write boundary therefore became narrower rather than broader.

### Introduce CQRS

The increasing difference between reads and writes made CQRS worth considering.

The application now clearly distinguishes information retrieval from state-changing intentions.

However, the evidence did not show independently evolving command and query models or execution paths.

CQRS was therefore considered but not introduced.

## What We Deliberately Did Not Add

NovaTrade does not currently contain:

- `PlaceOrderCommand`
- `CancelOrderCommand`
- `GetOrderQuery`
- `ListOrdersQuery`
- command handlers
- query handlers
- a `CommandBus`
- a `QueryBus`
- separate read and write persistence
- eventual consistency
- separate command and query adapters

None of these mechanisms has been earned by the implementation.

## Consequences

Application use cases now depend on narrower capabilities.

Placement does not need to know that cancellation exists.

Cancellation does not require placement behavior.

Concrete adapters may still implement a composed `OrderApi` where that is useful for application composition.

Reads and writes are now free to continue diverging if future requirements create real pressure.

The architecture does not assume that such divergence must eventually become CQRS.

The current conclusion is:

> Different responsibilities earned segregation. They did not, by themselves, earn CQRS.
