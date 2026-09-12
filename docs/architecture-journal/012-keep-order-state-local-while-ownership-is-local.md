# 012 — Keep Order State Local While Ownership Is Local

## Context

NovaTrade can now retrieve a Domain `Order` through the Application layer.

Once the Order enters the frontend, the UI needs somewhere to keep the current object so that it can display and manipulate it.

This introduces a state-ownership question.

## Pressure

The loaded Order is currently consumed by the `App` component.

No second independent consumer, cross-route lifetime, synchronization requirement, or application-wide ownership requirement exists yet.

The component also needs to represent the period before the Order has been loaded.

## Decision

The `App` component owns the current Order state.

The state is represented as:

```ts
Signal<Order | null>;
```

where:

```text
null  = no Order has been loaded yet
Order = the currently loaded Domain Order
```

A component-local Signal is used because the state changes asynchronously and is observed by the Angular template.

## Why

Ownership is currently local.

Moving the state into a shared service or global store would introduce a broader lifetime and ownership model that the current requirements do not justify.

The Signal is therefore an implementation mechanism supporting an already-decided ownership boundary, not the architectural decision itself.

## Consequences

The template observes state but does not load the Order itself.

The Application coordinates retrieval.

The REST adapter remains responsible for transport and DTO mapping.

The component owns the resulting Domain object for its current UI lifetime.

The absence of an Order before loading is represented explicitly instead of being hidden behind hard-coded placeholder business data.

## Deferred Decisions

This decision does not establish how state should be owned when:

- multiple components need the same Order,
- state must survive component destruction,
- several routes share the same Order,
- server updates must be reconciled with local state,
- caching or synchronization becomes necessary.

Those pressures must be demonstrated before ownership is moved outward.
