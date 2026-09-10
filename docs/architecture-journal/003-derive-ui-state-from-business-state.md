# Derive UI State from Business State When Possible

## Context

NovaTrade already prevents an OrderLine quantity from falling below one.

When an `OrderLine` has quantity `1`, decreasing it is no longer a valid interaction. The Angular component already preserves that behavior, but the Decrease button still appeared enabled.

The interface therefore needed to represent an additional fact:

```text
OrderLine quantity = 1
→ Decrease action unavailable
```

The quantity and the button state are related, but they do not mean the same thing.

## Decision

Treat the quantity as business state and the button's enabled or disabled condition as UI state.

The UI state is derived directly from the existing `OrderLine` quantity:

```html
<!-- src/app/app.html -->

<button
  type="button"
  class="mt-3 ml-2 rounded border px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
  [attr.aria-label]="'Decrease ' + line.productName + ' quantity'"
  [disabled]="line.quantity <= 1"
  (click)="decreaseProductQuantity(line.productName)"
>
  Decrease quantity
</button>
```

No separate mutable flag such as:

```ts
isDecreaseDisabled = true;
```

is introduced.

## Why

`OrderLine.quantity` describes NovaTrade's business state.

The disabled condition describes how this particular interface should respond to that business state.

Although the UI state depends on the quantity, it is not itself part of the Order. Another interface could represent the same business constraint differently.

Because the disabled condition can be calculated directly from the quantity, storing it separately would create another value that must remain synchronized with the actual business state.

## Consequences

The frontend now distinguishes between:

```text
OrderLine.quantity
→ business state

Decrease button disabled
→ UI state
```

The UI state remains derived rather than independently mutable.

This decision does not imply that all UI state must derive from business state. Some UI state may exist only for presentation or interaction purposes.

No state-management library, SignalStore, shared state service, or global state architecture is introduced. The current requirement does not justify them.
