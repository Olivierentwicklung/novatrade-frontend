# 015 — Reload Authoritative State After Mutation

## Context

NovaTrade's frontend already owned a local representation of the current Order.

After Chapter 18, `App` owned that state because the Order needed to survive the Edit → Review → Edit workflow.

Order placement still happened inside `OrderEditor`.

The existing Application use case performed two actions:

```text
ask backend to place Order
        ↓
change local Domain Order to Submitted
```

This made the frontend appear updated after a successful placement.

However, that local transition did not prove that the frontend representation matched the authoritative server state.

A server mutation may apply rules, normalization, generated values, timestamps, status changes, or other effects that the frontend cannot safely infer.

A new test therefore required NovaTrade to reload the Order after placement.

The test failed because placement produced only the mutation request:

```text
POST /api/orders/ORD-1001/place/
```

No subsequent load occurred.

## Decision

After a successful Order mutation, reload the Order through `OrderApi` and replace the workflow-owned state with the returned Order.

The synchronization strategy is:

```text
mutation
   ↓
success
   ↓
refetch
   ↓
replace frontend representation
```

For placement:

```text
placeOrder(...)
     ↓
OrderApi.placeOrder(...)
     ↓
loadOrder(...)
     ↓
OrderApi.getOrder(...)
     ↓
App.order.set(authoritativeOrder)
```

## Ownership consequence

`App` already owns the current Order state.

It therefore also becomes responsible for coordinating the mutation and the reload required to replace that state.

`OrderEditor` no longer performs server orchestration.

Instead, it reports user intentions:

```text
OrderEditor
    ↓ placeRequested
App
    ↓ place
server
    ↓ reload
App.order
```

This keeps the state owner responsible for replacing its own representation after synchronization with the server.

## Why

A successful mutation does not make the frontend copy authoritative.

The frontend can know that the server accepted an operation without knowing every resulting server-side change.

Reloading after mutation is the smallest reliable strategy for the current NovaTrade requirements.

It avoids inventing broader synchronization infrastructure before the system needs it.

## Consequences

`App` now coordinates:

- current Order ownership,
- Order placement,
- authoritative reload,
- replacement of the workflow state.

`OrderEditor` coordinates:

- Order presentation,
- local editing interactions,
- replacement-order events,
- placement intent.

The concrete `RestOrderApi` is no longer needed inside `OrderEditor`.

The frontend performs an additional server request after placement.

That extra request is accepted for now because correctness is more important than reducing network traffic at this stage.

## What is not introduced

This decision does not introduce:

- optimistic updates,
- cache invalidation,
- background synchronization,
- query caching,
- stale-while-revalidate behavior,
- SignalStore,
- NgRx,
- global application state,
- browser persistence.

Those mechanisms may become useful later, but the current pressure does not require them.

## Result

NovaTrade no longer assumes that a locally updated Order is authoritative after a server mutation.

The workflow now follows:

```text
frontend representation
        ↓
server mutation
        ↓
authoritative reload
        ↓
frontend representation replaced
```

The decision can be summarized as:

> After a successful mutation, reload authoritative server state before treating the frontend representation as current.
