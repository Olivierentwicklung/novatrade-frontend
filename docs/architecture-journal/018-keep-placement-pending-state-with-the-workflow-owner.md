# 018 — Keep Placement Pending State With the Workflow Owner

## Context

NovaTrade already places Orders through the `OrderApi` capability and presents that action from the Review step.

Placement is asynchronous:

```text
customer requests placement
        ↓
App starts placement
        ↓
backend operation remains pending
        ↓
placement completes
        ↓
authoritative Order is reloaded
```

Chapter 22 exposed two consequences of that waiting period.

First, a customer could trigger placement again while the first request was still unresolved.

A test proved that the frontend started two backend calls for one intended placement:

```text
expected "vi.fn()" to be called once, but got 2 times
```

The smallest response introduced an in-flight guard.

Later, the Review UI still appeared available while placement was pending. A second test proved that the `Place order` control remained enabled even though the workflow was already executing.

At the same time, placement ownership was corrected so that:

```text
OrderEditor
→ edits the Order

OrderReview
→ requests placement

App
→ coordinates placement
```

This created a state-ownership question:

> Who should own the fact that placement is currently in progress?

## Decision

`App` owns the in-flight placement state.

That state is represented as:

```text
placementInProgress
```

and is set when placement begins and cleared when the operation finishes.

`OrderReview` receives that state as input because it owns the placement interaction and must present the current workflow state to the customer.

The resulting ownership is:

```text
App
    ↓
owns placement workflow
owns placementInProgress
prevents concurrent placement

OrderReview
    ↓
receives placementInProgress
disables Place order
shows "Placing order..."

OrderEditor
    ↓
edits the Order
does not own placement
```

## Why

The pending state exists because `App` starts and completes the asynchronous placement workflow.

`OrderReview` does not create that state. It only needs to present it.

If `OrderReview` owned its own independent pending flag, the UI could become disconnected from the operation it represents. The component would need to guess when placement begins and ends, duplicate workflow state, or coordinate that state indirectly with the actual operation owner.

Keeping the source of truth with the workflow owner avoids that duplication:

```text
workflow state
→ owned where the workflow runs

presentation
→ observes that state
```

The same state also protects correctness.

While:

```text
placementInProgress === true
```

another placement request is ignored.

The UI therefore does not maintain a separate concept of whether placement is pending. The concurrency guard and the visible pending state use the same source of truth.

## Placement Belongs to Review

Before the pending state could be presented correctly, NovaTrade exposed an earlier workflow mismatch.

The `Place order` action still lived inside `OrderEditor`, while the checkout itself presented a two-step flow:

```text
Edit
↓
Review
↓
Place Order
```

The placement action was therefore moved to `OrderReview`.

This was not done to support a preferred component architecture.

It corrected the responsibility implied by the actual checkout workflow:

```text
OrderEditor
→ modification

OrderReview
→ confirmation and placement intent
```

`App` remains responsible for coordinating what happens after that intent is expressed.

## Failure and Cleanup

The pending state must not remain active permanently.

Placement can:

- succeed;
- be rejected;
- fail for another reason.

The workflow therefore clears the in-flight state when the operation finishes regardless of the outcome.

Conceptually:

```text
placement starts
        ↓
placementInProgress = true
        ↓
operation succeeds / rejects / fails
        ↓
placementInProgress = false
```

This prevents a failed operation from leaving the frontend permanently unable to place an Order.

## Testing Boundary

The application-facing tests prove two different async behaviors.

The first proves concurrency protection:

```text
first placement unresolved
        ↓
second placement requested
        ↓
only one backend call
```

The second proves presentation of the same state:

```text
placement pending
        ↓
Place order disabled
        ↓
"Placing order..." visible
```

Both behaviors depend on the same workflow state.

The tests therefore prove that the pending state affects both correctness and presentation without requiring either responsibility to duplicate it.

## What This Decision Does Not Mean

This decision does not introduce a general asynchronous-state architecture.

NovaTrade does not yet have:

- cancellation infrastructure;
- retry orchestration;
- optimistic updates;
- rollback behavior;
- request queues;
- response-order coordination;
- a state-machine framework;
- generalized pending-operation state;
- global loading state.

No abstraction was introduced for hypothetical future operations.

`placementInProgress` exists because one concrete workflow demonstrated two real needs:

```text
prevent duplicate placement
+
communicate pending placement
```

If another workflow later experiences similar pressure, its state ownership must be evaluated from that workflow rather than automatically generalized from this one.

## Consequences

`App` now owns both the placement operation and its in-flight state.

`OrderReview` can remain focused on the customer interaction while accurately reflecting the workflow's current state.

`OrderEditor` no longer owns placement behavior.

Duplicate placement is prevented.

The customer receives immediate feedback that placement is still in progress.

The implementation remains deliberately small:

```text
one workflow
→ one pending state
→ one owner
```

The broader lesson is that asynchronous state is not automatically UI state merely because the UI displays it.

The state belongs to the workflow whose progress it describes.
