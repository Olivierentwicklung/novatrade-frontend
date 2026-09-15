# Real User Journey Proof

## Context

By Chapter 31, NovaTrade's frontend architecture has several separately verified parts:

```text
Angular presentation
Application use cases
Domain rules
backend capability ports
RestOrderApi
runtime composition
```

Unit, component, adapter, and composition tests provide local evidence for those boundaries.

What they do not prove by themselves is that the assembled system works when one real user journey crosses all of them.

Chapter 31 therefore asks a narrower system-level question:

> **Can one real customer action travel through the complete frontend architecture, cross the real REST boundary, and return an authoritative result that the UI reflects correctly?**

---

## Architectural Claim

The claim being tested is:

> A customer can cancel a submitted Order through the assembled Angular frontend, the request crosses the Application, Domain, port, REST adapter, and real development backend boundaries, and the UI reflects the authoritative cancelled state returned by the backend.

This is not intended to prove every NovaTrade workflow.

It is one narrow vertical-slice proof.

---

## Selected Journey

The controlled journey is:

```text
customer selects ORD-1002
        ↓
Order is Submitted
        ↓
customer clicks Cancel order
        ↓
frontend performs cancellation
        ↓
development backend accepts the transition
        ↓
frontend reloads authoritative Order state
        ↓
UI displays Cancelled
```

Cancellation was selected because it exercises a meaningful lifecycle transition without introducing unrelated workflow complexity.

The known fixture Order:

```text
ORD-1002
```

begins in:

```text
Submitted
```

state.

---

## Boundaries Crossed

The browser journey crosses:

```text
Playwright browser
        ↓
Angular UI
        ↓
OrderPage
        ↓
cancelOrder(...)
        ↓
Domain lifecycle rule
        ↓
ORDER_API
        ↓
RestOrderApi
        ↓
Angular HttpClient
        ↓
real development REST server
        ↓
persisted Order state
        ↓
authoritative reload
        ↓
Angular UI
```

No application-facing backend boundary is mocked in this proof.

---

## E2E Test Structure

The browser proof lives at:

```text
e2e/features/orders/cancel-order.spec.ts
```

The E2E structure is organized by product feature:

```text
e2e/
├── features/
│   └── orders/
│       └── cancel-order.spec.ts
└── scripts/
    └── reset-development-db.mjs
```

This keeps browser-level proof separate from Application-layer use-case tests while still reflecting feature ownership.

---

## Deterministic Backend State

The development REST server mutates:

```text
public/development_test_server/rest/db.json
```

during cancellation.

A reproducible system proof therefore requires a known baseline before every E2E run.

The E2E harness restores:

```text
public/development_test_server/rest/db.fixture.json
```

to:

```text
public/development_test_server/rest/db.json
```

before starting the browser journey.

The reset script lives at:

```text
e2e/scripts/reset-development-db.mjs
```

The test server is started fresh for each E2E execution so that restored fixture state is actually loaded.

---

## Verification

The complete E2E journey was executed twice from reset state.

Both runs passed:

```text
E2E run 1
1 passed

E2E run 2
1 passed
```

The existing automated suite was then rerun:

```text
Test Files  11 passed (11)
Tests       56 passed (56)
```

No existing test regressed.

---

## What the Proof Establishes

The result proves that one real customer journey can cross the assembled frontend architecture successfully:

```text
UI
→ Application
→ Domain
→ capability boundary
→ REST adapter
→ real backend
→ authoritative state
→ UI
```

It also proves that the cancellation flow does not depend only on local frontend mutation. After cancellation, NovaTrade reloads the Order through the real backend boundary and renders the authoritative state.

This is stronger evidence than testing the layers only in isolation.

---

## What the Proof Does Not Establish

This experiment does not prove:

- every Orders workflow;
- every error path;
- every backend endpoint;
- production deployment behavior;
- GraphQL substitution;
- Angular replacement;
- all browser compatibility;
- full application-wide E2E coverage.

The claim is deliberately narrow.

One real vertical slice is enough to test whether the architectural boundaries can cooperate as intended.

---

## Deliberate Non-Decisions

The Chapter 31 proof does not introduce:

```text
mocked ORDER_API
mocked HttpClient
Playwright route interception
fake backend responses
new production behavior
new application abstraction
```

Those techniques may be useful in other tests, but they would weaken the architectural claim being tested here.

---

## Consequence

NovaTrade now has system-level evidence that its frontend architecture is not only locally testable but operational as one assembled path.

The important result is:

> **The boundaries cooperate across one real customer journey.**

The next architectural experiment can therefore change one implementation behind an existing boundary and ask whether the rest of the frontend remains untouched.
