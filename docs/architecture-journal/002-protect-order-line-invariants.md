# Protect OrderLine Invariants at the Business Concept

## Context

NovaTrade already prevented customers from decreasing a product quantity below one in the Angular component.

After `OrderLine` became an explicit immutable business concept, however, it was still possible to construct one directly with an invalid quantity:

```ts
new OrderLine('Test Product', 0, 20);
```

The UI protected one interaction path, but `OrderLine` did not protect its own valid state.

## Decision

`OrderLine` protects the minimum-quantity rule itself.

Its constructor rejects quantities below one:

```ts
export class OrderLine {
  constructor(
    readonly productName: string,
    readonly quantity: number,
    readonly unitPrice: number,
  ) {
    if (quantity < 1) {
      throw new Error('Order line quantity must be at least one');
    }
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }
}
```

The Angular component keeps its existing minimum-quantity guard.

The two protections have different responsibilities:

- the component prevents an invalid decrease interaction;
- `OrderLine` guarantees that invalid quantity state cannot be constructed.

## Why

A business rule should not depend exclusively on every caller remembering to reproduce the same validation.

Once `OrderLine` became an independently meaningful concept, callers could construct it without going through the Angular component. Protecting the rule inside `OrderLine` makes its validity independent of the interaction that created it.

The UI guard remains because normal user interaction should not depend on throwing an exception to reject an expected action.

## Consequences

Any caller constructing an `OrderLine` receives the same minimum-quantity protection.

The Angular component can continue to guide the customer interaction without being the final authority on `OrderLine` validity.

No separate `Quantity` Value Object is introduced. The current pressure is satisfied by protecting the invariant directly inside `OrderLine`.
