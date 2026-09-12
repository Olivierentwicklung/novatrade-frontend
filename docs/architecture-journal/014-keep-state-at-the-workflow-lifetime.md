# 014 — Keep State at the Workflow Lifetime

## Context

NovaTrade's Order editing interface originally kept the current Order inside `OrderEditor`.

That ownership was sufficient while editing happened entirely within one component. The component could display the Order, change quantities, remove products, derive totals, load the Order, and place it.

A new product workflow introduced a Review step.

The customer can now:

```text
Edit Order
→ Review Order
→ return to Edit Order
```

Moving to Review removes `OrderEditor` from the rendered component tree. Returning to Edit creates a new `OrderEditor`.

A behavioral test demonstrated the consequence. After increasing a product quantity to `3`, navigating to Review, and returning to Edit, the edited Order no longer existed.

The required lifetime of the Order had become longer than the lifetime of the component that owned it.

## Decision

Move ownership of the current Order one level upward to the component that owns the Edit/Review workflow.

`App` owns:

```ts
readonly order = signal<Order | null>(null);
```

`OrderEditor` receives the current Order:

```ts
readonly order = input<Order | null>(null);
```

and emits replacement Orders when editing changes it:

```ts
readonly orderChange = output<Order | null>();
```

The workflow owner stores those replacements and supplies the current Order whenever an editor instance is created.

## Why

The state should live at the narrowest level whose lifetime matches the behavior that requires it.

Keeping the Order inside `OrderEditor` made the state lifetime too short.

Moving the state to a global store would make its lifetime broader than currently required.

The Edit/Review workflow provides the smallest owner that survives for the required duration.

## Consequences

The Order survives destruction and recreation of `OrderEditor`.

`OrderEditor` no longer owns writable Order state. Its Order input is read-only, and edits are communicated to the owner through an output.

Tests for `OrderEditor` must therefore provide its input explicitly. Tests that simulate edits must also represent the parent feedback loop that stores the emitted replacement Order and passes it back into the component.

No application-wide state store, NgRx store, SignalStore, browser persistence, or global service is introduced.

## Deliberate unresolved tension

`App` now owns the Order state, but `OrderEditor` still triggers the `loadOrder` and `placeOrder` application use cases and still creates the concrete `RestOrderApi`.

That responsibility is intentionally left unchanged.

State ownership and application-use-case orchestration are separate architectural decisions. Chapter 18 provides evidence for changing the former, but not yet the latter.

Chapter 19 will introduce server-authoritative synchronization. Once a successful mutation must be followed by loading the authoritative Order and replacing workflow-owned state, the current split between state ownership and server-operation orchestration will become insufficient.

That future pressure will determine whether those responsibilities should move.

## Result

The architecture now matches the lifetime required by the current workflow:

```text
App
└── owns Order
    ├── survives Edit → Review → Edit
    └── supplies Order to OrderEditor
```

The decision can be summarized as:

> Shared does not mean global. State should live at the narrowest level that survives for as long as the workflow needs it.
