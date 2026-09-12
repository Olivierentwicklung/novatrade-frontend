# 013 — Keep Derived UI State Derived

## Context

The NovaTrade frontend owns the current `Order` locally.

The Order contains line items and also carries a total value.

The UI previously displayed the stored total and manually recalculated it whenever line quantities changed.

## Pressure

The total can already be calculated from the current Order lines.

A test demonstrated that the two representations can disagree:

```text
lines imply total = 150
stored total      = 999
```

The UI rendered the stored value.

That created a synchronization risk because two values represented the same information independently.

## Decision

The frontend derives the displayed Order total from `order.lines`.

The current source relationship is:

```text
order.lines
    ↓
calculateOrderTotal(...)
    ↓
computed total
    ↓
template
```

The component does not manually maintain a separate displayed total.

## Why

Duplicated state requires synchronization.

If one value can be calculated from another authoritative value already owned by the frontend, storing both increases the number of states the system can enter, including inconsistent ones.

Deriving the displayed total removes that synchronization responsibility.

## Angular Mechanism

A component-local `computed()` is used because the derived value belongs to the same local ownership boundary as the current Order.

`computed()` is the Angular mechanism supporting the decision.

The architectural decision is to avoid independently maintained derived UI state.

## Consequences

Changes to Order lines are performed through the writable Order Signal so that dependent computed values are invalidated consistently.

Manual total synchronization in the component is no longer necessary.

The template consumes the derived total rather than calling the calculation function directly.

## Scope

This decision applies to the frontend display state demonstrated in Chapter 17.

It does not establish that `Order.total` must be removed from the Domain model, DTO, or backend contract.

Those representations may have responsibilities outside the pressure demonstrated here.

A broader model change should only happen when separate evidence requires it.

## Deferred Decisions

This decision does not determine:

- whether backend-provided totals should later be validated against client calculations,
- whether monetary values require a stronger Money Value Object,
- whether the Domain model should eventually derive its own total,
- whether other calculated UI values need memoization.

Those questions remain outside the current requirement.
