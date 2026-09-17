# Replace Angular

## Context

By the end of Chapter 32, NovaTrade had already proved that its backend transport could change without changing the higher-level frontend behavior.

The next claim was more demanding:

> **The frontend Application does not belong to Angular.**

Until now, however, Angular still shaped the source tree itself. Domain, Application, presentation, adapters, composition, and Angular bootstrap all lived beneath the Angular application's original `src/app/` structure.

Before introducing a second UI framework, that ownership had to become explicit.

The repository was therefore reorganized into:

```text
src/
├── core/
│   ├── domain/
│   └── application/
│
├── infrastructure/
│   └── adapters/
│
└── angular/
    ├── app/
    ├── composition/
    ├── features/
    └── main.ts
```

The move changed ownership and paths, not behavior.

After the reallocation:

```text
13 test files passed
62 tests passed

REST E2E     1 passed
GraphQL E2E  1 passed
```

A source scan also confirmed that:

```text
src/core/
```

contained no Angular or React imports.

This created a clean baseline for the actual substitution experiment.

---

## Architectural Claim

The claim being tested is:

> The NovaTrade Application and Domain can support the same meaningful user capability through React without being redesigned for React.

The experiment is deliberately narrower than a complete application rewrite.

The selected user journey remains familiar:

```text
load submitted ORD-1002
        ↓
display the Order
        ↓
customer clicks Cancel order
        ↓
cancellation crosses the existing Application use case
        ↓
real REST backend persists the transition
        ↓
Order becomes Cancelled
```

---

## Success Criteria

The React experiment must not require React-specific changes to the existing business core.

The success criteria are:

```text
Domain behavior changes        = 0
Application behavior changes   = 0
use-case contract changes      = 0
Application port changes       = 0

React-specific presentation    → stays under src/react/
React runtime composition      → stays under src/react/
Angular runtime                → remains operational
existing REST E2E              → remains green
existing GraphQL E2E           → remains green
```

The earlier relocation of Domain and Application into `src/core/` is part of the preparatory ownership refactor, not evidence that React required those layers to change.

---

## Controlled Variable

The framework substitution is:

```text
Angular presentation + Angular composition
                    ↓
React presentation + React composition
```

while the architectural center remains:

```text
Application
    ↓
Domain
```

The backend transport for the React browser proof is deliberately held fixed as REST.

This avoids changing both the UI framework and transport at the same time.

---

## The First React Slice

The first React test did not begin with routing, state libraries, or a complete application shell.

It asked only whether React could express the already-known cancellation interaction.

The first React page accepted an `Order` and a cancellation function.

That test produced a genuine RED because:

```text
./order-page
```

did not yet exist.

The smallest implementation introduced a React `OrderPage` with a `Cancel order` button.

The test became GREEN.

At that point, however, React had only proved that it could render a button and call a callback.

It had not yet crossed the existing Application boundary.

---

## Reusing the Existing Application Use Case

The next test replaced the presentation-specific callback with the existing NovaTrade capability.

The React page was required to use:

```text
cancelOrder(order, orderApi)
```

where:

```text
cancelOrder
```

was the existing Application use case and:

```text
CancelOrderApi
```

was the existing Application port.

The test failed because the page still expected the old callback prop.

After the smallest change, the path became:

```text
React OrderPage
        ↓
existing cancelOrder(...)
        ↓
CancelOrderApi
        ↓
Domain Order
```

No Application or Domain implementation changed.

---

## React Owns Its Runtime Binding

Angular already had its own runtime mechanism:

```text
Angular InjectionToken
```

React should not import or imitate that mechanism.

Once passing `orderApi` directly through presentation props became unnecessary wiring, React earned its own runtime binding.

A React Context was introduced:

```text
OrderApiProvider
useOrderApi()
```

The resulting dependency path became:

```text
React OrderPage
        ↓
React Context
        ↓
CancelOrderApi
        ↓
Application
        ↓
Domain
```

The React page no longer receives the capability directly as a prop.

Angular DI remains Angular-owned.

React Context remains React-owned.

The frameworks share Application contracts, not runtime mechanisms.

---

## The Existing REST Adapter Was Not Reusable

The experiment then exposed an important limit.

The existing `RestOrderApi` imports:

```text
@angular/common/http
@angular/core
```

and depends on Angular `HttpClient`.

Therefore:

```text
RestOrderApi
```

is an Angular-specific infrastructure adapter.

That did not invalidate the architectural claim.

The claim concerns the Application and Domain, not every technical adapter.

Instead of forcing React to depend on Angular infrastructure, React received its own REST-facing implementation using the browser `fetch` API.

The first capability implemented was only the capability already required by the React journey:

```text
cancelOrder()
```

Its contract was verified as:

```text
POST /api/orders/ORD-1002/cancel
```

including rejection behavior when the backend returns an unsuccessful response.

---

## React Composition

The React application then earned an explicit composition layer:

```text
src/react/composition/
```

A React `App` assembled:

```text
createOrderApi()
        +
OrderApiProvider
        +
OrderPage
```

The resulting tested slice became:

```text
React App
   ↓
React REST implementation
   ↓
React Context
   ↓
OrderPage
   ↓
existing Application use case
   ↓
Domain
```

This was the first complete React vertical slice.

---

## Removing the Bootstrap Fixture

The first browser probe still created `ORD-1002` directly in `main.tsx`.

That was sufficient to prove cancellation through the real backend, but it did not prove that React could load the Order through the existing Application layer.

The fixture was therefore removed.

The existing Application use case:

```text
loadOrder(orderId, orderApi)
```

was reused unchanged.

React then had to implement the existing read contract.

The first missing capability was:

```text
getOrder()
```

which maps:

```text
GET /api/orders/:id
```

into the existing Domain objects:

```text
Order
OrderLine
```

The React tests became GREEN.

---

## The Existing Port Must Be Honored

A dedicated React TypeScript check then exposed another useful constraint.

The React adapter initially implemented:

```text
getOrder()
cancelOrder()
```

but the existing `OrderReadApi` contract also requires:

```text
listOrders()
```

TypeScript correctly rejected the adapter:

```text
Property 'listOrders' is missing in type 'ReactOrderApi'
```

The Application port was not changed to accommodate React.

Instead, the React adapter was extended to satisfy the existing contract.

A test first required:

```text
GET /api/orders
```

to return compact:

```text
OrderSummary[]
```

with:

```text
id
status
total
itemCount
```

The RED was:

```text
orderApi.listOrders is not a function
```

After implementation, the React adapter satisfied the existing `OrderReadApi` contract.

No Application port changed.

---

## Real React Browser Proof

The final React bootstrap became:

```text
Browser
  ↓
React main.tsx
  ↓
<App orderId="ORD-1002" />
  ↓
loadOrder(...)
  ↓
React REST implementation
  ↓
real REST development server
  ↓
Domain Order
  ↓
OrderPage
```

The browser displayed:

```text
ORD-1002
Submitted
Cancel order
```

The customer then clicked:

```text
Cancel order
```

The request crossed:

```text
React OrderPage
        ↓
existing cancelOrder(...)
        ↓
React OrderApi binding
        ↓
browser fetch
        ↓
real REST development server
```

The backend was then queried directly.

It returned:

```text
ORD-1002
status = Cancelled
```

The cancellation was therefore persisted by the real backend rather than simulated inside the React UI.

---

## StrictMode Observation

The React bootstrap uses:

```text
StrictMode
```

During development, this caused the loading effect to execute twice and therefore produced two GET requests for:

```text
/api/orders/ORD-1002
```

This was expected React development behavior rather than a backend or architectural failure.

`StrictMode` was retained.

---

## Final Verification

After the React substitution, the complete verification set was executed.

The general Angular/project suite produced:

```text
Test Files  14 passed (14)
Tests       66 passed (66)
```

The React-focused suite produced:

```text
Test Files  4 passed (4)
Tests       7 passed (7)
```

The dedicated React TypeScript check produced no errors:

```text
npx tsc --project tsconfig.react.json
```

The existing real-system proofs also remained green:

```text
REST E2E     1 passed
GraphQL E2E  1 passed
```

The working tree was clean after the final implementation commits.

---

## What the Experiment Proves

For the verified Orders loading-and-cancellation path, NovaTrade can introduce a React UI without redesigning the existing Application or Domain for React.

The stable center remained:

```text
Application use cases
Application ports
Domain model
```

while framework-specific responsibilities differed:

```text
Angular
├── presentation
├── InjectionToken / providers
├── bootstrap
└── Angular HttpClient REST adapter

React
├── presentation
├── Context / provider
├── bootstrap
└── browser fetch REST implementation
```

The frameworks do not share framework mechanisms.

They share business-facing contracts.

---

## What the Experiment Does Not Prove

This experiment does not prove:

- that the entire Angular application has been rewritten in React;
- that every NovaTrade feature works through React;
- that every Angular adapter is framework-independent;
- that React is preferable to Angular;
- that Angular should be removed;
- that the two frameworks should coexist permanently;
- that all UI behavior is identical across both frameworks;
- that the React development setup represents the final production build architecture;
- that every backend transport has been tested through React.

The proof is deliberately narrow.

One meaningful user journey is enough to test whether the Application belongs to Angular.

---

## Consequence

The framework substitution produced a more precise result than simply saying that Angular was replaceable.

Some code was intentionally framework-specific.

That was not the architectural failure.

The important boundary was whether replacing the UI framework forced NovaTrade's Application or Domain to become React-aware.

It did not.

For the verified path:

> **Angular is replaceable at the UI boundary because the Application and Domain do not belong to Angular.**
