# Extract Order Total Calculation

## Context

NovaTrade’s Angular component handled several customer interactions that changed the contents of an Order:

- increasing a product quantity,
- decreasing a product quantity,
- removing a product from the Order.

Each interaction recalculated the Order total using the same calculation.

The repeated calculation was first centralized inside the component as a private `recalculateTotal()` method. All seven existing tests remained GREEN.

That local refactor removed duplication without changing the architectural boundary.

## Decision

The Order-total calculation was extracted from the Angular component into a pure function:

```ts
// src/app/calculate-order-total.ts

export function calculateOrderTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
```

The Angular component now delegates the calculation to that function.

## Why

The total calculation had a different reason to change from the surrounding interaction handlers.

The interaction handlers depend on how customers manipulate the Order through the UI.

The total calculation depends only on quantities and unit prices. It does not require Angular, a template, DOM events, or change detection.

That gave the calculation an independent responsibility that no longer needed to remain inside the component.

## What We Did Not Introduce

This decision does not establish:

- a Domain layer,
- a service,
- a Value Object,
- an Order Entity,
- a store,
- a facade,
- a dependency-injection boundary.

The extracted function is intentionally small and accepts the same structural data already used by the application.

## Evidence

Both refactoring steps preserved all existing behavior:

```text
Test Files  1 passed (1)
Tests       7 passed (7)
```

Relevant commits:

```text
ab2cb48 refactor(ch04): centralize order total recalculation
a5e52a7 refactor(ch04): extract order total calculation
```

## Consequence

The Angular component remains responsible for customer interaction and presentation-related coordination.

The Order-total calculation now exists independently of Angular.

Only the responsibility that earned separation moved.
