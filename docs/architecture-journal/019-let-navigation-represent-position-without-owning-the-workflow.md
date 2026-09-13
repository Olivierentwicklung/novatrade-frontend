# 019 — Let Navigation Represent Position Without Owning the Workflow

## Context

NovaTrade’s checkout already had two visible workflow positions:

```text
Edit
→ Review
```

Initially, that position existed only as local application state:

```text
step = 'edit' | 'review'
```

The browser location did not change when the customer entered Review.

That became a problem once the Review step acquired navigation meaning. The customer should be able to move to Review, use browser Back to return to Edit, and start the application at a Review location without the browser and the visible checkout disagreeing.

The implementation history demonstrated three concrete pressures:

```text
enter Review
→ browser location must represent Review

browser Back
→ visible checkout must return to Edit

initial /checkout/review
→ visible checkout must restore Review
```

## Decision

Browser location represents the customer’s current checkout position.

The checkout workflow continues to own the actual workflow state.

The Order continues to own business state and business rules.

Conceptually:

```text
navigation state
→ represents where the customer is

workflow state
→ coordinates Edit / Review behavior

business state
→ represents the Order and its rules
```

The application records the current checkout position in browser history and restores the workflow position from that location on initial load and browser Back/Forward navigation.

## Rationale

The URL gained responsibility because the customer’s position in the checkout now has navigation semantics.

That does not mean every piece of checkout state belongs in the URL.

The browser location does not own:

- the Order;
- checkout form values;
- Order validity;
- placement state;
- placement errors;
- business rules.

Those concerns have different owners.

Keeping the distinction prevents navigation from becoming a general-purpose state container.

## Current Mapping

The current navigation representation is:

```text
/checkout/edit
→ Edit

/checkout/review
→ Review
```

Explicit workflow actions update both the workflow position and the corresponding browser location.

Browser Back/Forward and initial application startup restore the visible workflow position from the current location.

## Lifecycle

The application listens for browser history changes while `App` is alive.

That subscription is explicitly released when `App` is destroyed.

This keeps the navigation synchronization owned by the same lifecycle that owns the checkout workflow.

## What This Decision Does Not Mean

This decision does not introduce:

- routed Edit and Review components;
- `<router-outlet>`;
- route guards;
- route resolvers;
- a navigation service;
- a generalized route-state abstraction;
- URL ownership of application state;
- URL ownership of business state.

Angular Router is available to the application, but the current pressure did not require restructuring the checkout around routed components.

The smallest responsible response was to represent and restore checkout position.

## Testing Boundary

The behavior is protected by application-level tests proving that:

```text
enter Review
→ location becomes /checkout/review

browser Back from Review
→ Edit becomes visible again

initial /checkout/review
→ Review becomes visible
```

These tests establish navigation semantics without asserting that navigation owns the Order or the checkout workflow.

## Consequence

NovaTrade now has an explicit distinction:

```text
where the customer is
≠
what the workflow is doing
≠
what the business state means
```

Navigation can represent and restore position without becoming the owner of the workflow.
